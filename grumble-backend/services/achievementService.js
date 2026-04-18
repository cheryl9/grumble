// Call checkAndUnlockAchievements(userId, db) after any of:
//   • a new post is created
//   • a friend is added
//   • a post is created with a timestamp (for late-night check)
// It will compute what the user has earned and persist new unlocks.

const ACHIEVEMENT_DEFINITIONS = [
  {
    key: "tiny_tummy",
    check: (s) => s.totalPosts >= 1,
  },
  {
    key: "gut_guardian",
    check: (s) => s.longestStreak >= 7,
  },
  {
    key: "digestive_dynamo",
    check: (s) => s.longestStreak >= 14,
  },
  {
    key: "golden_kidney",
    check: (s) => s.uniquePlaces >= 10,
  },
  {
    key: "bean_there_done_that",
    check: (s) => s.sharedRestaurantWithFriend === true,
  },
  {
    key: "snack_goblin",
    check: (s) => s.highRatedPosts >= 15,
  },
  {
    key: "liver_it_up",
    check: (s) => s.lateNightPosts >= 1,
  },
  {
    key: "kidney_bean",
    check: (s) => s.drinkStorePosts >= 10,
  },
  {
    key: "heart_of_the_feast",
    check: (s) => s.diningPosts >= 50,
  },
  {
    key: "open_stomach_policy",
    check: (s) => s.totalPosts >= 10,
  },
  {
    key: "kidney_crew",
    check: (s) => s.friendCount >= 10,
  },
];

async function getCurrentStreakFromPosts(userId, db) {
  const { rows } = await db.query(
    `SELECT DISTINCT DATE(created_at AT TIME ZONE 'Asia/Singapore') AS post_day
     FROM posts
     WHERE user_id = $1
       AND COALESCE(is_deleted, false) = false
     ORDER BY post_day DESC`,
    [userId],
  );

  if (rows.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  let currentStreak = 1;
  let longestStreak = 1;
  let runningStreak = 1;

  let previousDay = new Date(rows[0].post_day);

  for (let i = 1; i < rows.length; i += 1) {
    const currentDay = new Date(rows[i].post_day);
    const diffDays = Math.round((previousDay - currentDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);

      if (i === currentStreak) {
        currentStreak += 1;
      }

      previousDay = currentDay;
      continue;
    }

    runningStreak = 1;
    previousDay = currentDay;
  }

  return {
    currentStreak,
    longestStreak,
  };
}

/**
 * Fetches all the raw activity numbers needed for achievement checks.
 * Extend this query as you add new achievement types.
 */
async function getUserActivityStats(userId, db) {
  // --- Total posts ---
  const {
    rows: [postRow],
  } = await db.query(
    `SELECT COUNT(*) AS total_posts
     FROM posts
     WHERE user_id = $1
       AND COALESCE(is_deleted, false) = false`,
    [userId],
  );

  // --- Current streak from actual distinct posting days ---
  const streakStats = await getCurrentStreakFromPosts(userId, db);

  // --- Unique places visited ---
  const {
    rows: [uniquePlaceRow],
  } = await db.query(
    `SELECT COUNT(DISTINCT p.food_place_id) AS unique_places
     FROM posts p
     WHERE p.user_id = $1
       AND p.food_place_id IS NOT NULL`,
    [userId],
  );

  // --- High-rated posts (strictly more than 4 stars) ---
  const {
    rows: [highRatedRow],
  } = await db.query(
    `SELECT COUNT(*) AS high_rated_posts
     FROM posts
     WHERE user_id = $1
       AND COALESCE(is_deleted, false) = false
       AND COALESCE(rating, 0) > 4`,
    [userId],
  );

  // --- Late night posts (created_at hour >= 0 and < 5, i.e. after midnight) ---
  const {
    rows: [lateRow],
  } = await db.query(
    `SELECT COUNT(*) AS late_posts
     FROM posts
     WHERE user_id = $1
       AND COALESCE(is_deleted, false) = false
       AND (
         (
           EXTRACT(HOUR FROM (created_at AT TIME ZONE 'Asia/Singapore')) >= 0
           AND EXTRACT(HOUR FROM (created_at AT TIME ZONE 'Asia/Singapore')) < 5
         )
         OR
         (
           EXTRACT(HOUR FROM ((created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Singapore')) >= 0
           AND EXTRACT(HOUR FROM ((created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Singapore')) < 5
         )
       )`,
    [userId],
  );

  // --- Drink store posts ---
  const {
    rows: [drinkRow],
  } = await db.query(
    `SELECT COUNT(*) AS drink_posts
     FROM posts p
     LEFT JOIN food_places fp ON p.food_place_id = fp.id
     WHERE p.user_id = $1
       AND fp.category = 'drinks'`,
    [userId],
  );

  // --- Dining restaurant posts ---
  const {
    rows: [diningRow],
  } = await db.query(
    `SELECT COUNT(*) AS dining_posts
     FROM posts p
     LEFT JOIN food_places fp ON p.food_place_id = fp.id
     WHERE p.user_id = $1
       AND fp.category = 'restaurant'`,
    [userId],
  );

  // --- Friend count ---
  const {
    rows: [friendRow],
  } = await db.query(
    `SELECT COUNT(*) AS friend_count
     FROM friendships
     WHERE (user_id = $1 OR friend_id = $1)
       AND status = 'accepted'`,
    [userId],
  );

  // --- Shared restaurant with a friend ---
  // True if user and at least one friend have both posted about the same food_place
  const {
    rows: [sharedRow],
  } = await db.query(
    `SELECT EXISTS (
       SELECT 1
       FROM posts p1
       JOIN posts p2 ON (
         (p1.food_place_id = p2.food_place_id AND p1.food_place_id IS NOT NULL)
         OR
         (p1.postal_code = p2.postal_code AND p1.postal_code IS NOT NULL)
       )
       JOIN friendships f
         ON (f.user_id = $1 AND f.friend_id = p2.user_id)
         OR (f.friend_id = $1 AND f.user_id = p2.user_id)
       WHERE p1.user_id = $1
         AND p2.user_id <> $1
         AND COALESCE(p1.is_deleted, false) = false
         AND COALESCE(p2.is_deleted, false) = false
         AND f.status = 'accepted'
     ) AS shared`,
    [userId],
  );

  return {
    totalPosts: parseInt(postRow.total_posts, 10),
    currentStreak: streakStats.currentStreak,
    longestStreak: streakStats.longestStreak,
    uniquePlaces: parseInt(uniquePlaceRow.unique_places, 10),
    highRatedPosts: parseInt(highRatedRow.high_rated_posts, 10),
    lateNightPosts: parseInt(lateRow.late_posts, 10),
    drinkStorePosts: parseInt(drinkRow.drink_posts, 10),
    diningPosts: parseInt(diningRow.dining_posts, 10),
    friendCount: parseInt(friendRow.friend_count, 10),
    sharedRestaurantWithFriend: sharedRow.shared,
  };
}

/**
 * Get all already-unlocked achievement keys for a user.
 */
async function getUnlockedKeys(userId, db) {
  const { rows } = await db.query(
    `SELECT achievement_key FROM user_achievements WHERE user_id = $1`,
    [userId],
  );
  return rows.map((r) => r.achievement_key);
}

async function syncAchievements(userId, db) {
  const [stats, alreadyUnlocked, userRow] = await Promise.all([
    getUserActivityStats(userId, db),
    getUnlockedKeys(userId, db),
    db.query(`SELECT equipped_avatar FROM users WHERE id = $1`, [userId]),
  ]);

  console.log(`User ${userId} stats:`, stats);
  console.log(`Already unlocked:`, alreadyUnlocked);

  const alreadySet = new Set(alreadyUnlocked);
  const shouldHave = new Set(
    ACHIEVEMENT_DEFINITIONS.filter((def) => def.check(stats)).map(
      (def) => def.key,
    ),
  );
  const newlyUnlocked = [];
  const revoked = [];

  for (const key of alreadyUnlocked) {
    if (shouldHave.has(key)) continue;

    await db.query(
      `DELETE FROM user_achievements
       WHERE user_id = $1
         AND achievement_key = $2`,
      [userId, key],
    );
    revoked.push(key);
    alreadySet.delete(key);
  }

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (!alreadySet.has(def.key) && shouldHave.has(def.key)) {
      await db.query(
        `INSERT INTO user_achievements (user_id, achievement_key)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [userId, def.key],
      );
      newlyUnlocked.push(def.key);
    }
  }

  if (revoked.length > 0) {
    const equippedAvatar = userRow.rows[0]?.equipped_avatar ?? null;
    if (equippedAvatar && revoked.includes(equippedAvatar)) {
      await db.query(`UPDATE users SET equipped_avatar = NULL WHERE id = $1`, [
        userId,
      ]);
    }
  }

  return { newlyUnlocked, revoked };
}

async function checkAndUnlockAchievements(userId, db) {
  const { newlyUnlocked } = await syncAchievements(userId, db);
  return newlyUnlocked;
}

async function getUserAchievements(userId, db) {
  const [keysRes, userRes] = await Promise.all([
    db.query(
      `SELECT achievement_key, unlocked_at
       FROM user_achievements
       WHERE user_id = $1
       ORDER BY unlocked_at ASC`,
      [userId],
    ),
    db.query(`SELECT equipped_avatar FROM users WHERE id = $1`, [userId]),
  ]);

  return {
    unlockedKeys: keysRes.rows.map((r) => r.achievement_key),
    equippedAvatar: userRes.rows[0]?.equipped_avatar ?? null,
  };
}

async function equipAvatar(userId, achievementKey, db) {
  if (achievementKey !== null) {
    // Verify the user actually unlocked this achievement
    const { rows } = await db.query(
      `SELECT 1 FROM user_achievements
       WHERE user_id = $1 AND achievement_key = $2`,
      [userId, achievementKey],
    );
    if (rows.length === 0) {
      throw new Error("Achievement not unlocked");
    }
  }

  await db.query(`UPDATE users SET equipped_avatar = $1 WHERE id = $2`, [
    achievementKey,
    userId,
  ]);

  return { equippedAvatar: achievementKey };
}

module.exports = {
  checkAndUnlockAchievements,
  syncAchievements,
  getUserAchievements,
  equipAvatar,
  getUnlockedKeys,
};
