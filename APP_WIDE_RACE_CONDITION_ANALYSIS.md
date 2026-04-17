# Race Condition Analysis: ENTIRE APP

## TL;DR

**YES, race conditions affect MULTIPLE PARTS of your app**, not just friends. Any feature with likes, saves, comments, or friend operations will break with concurrent access.

**Affected Areas:**

1. ✅ Friend System (CRITICAL)
2. ✅ Post Likes System (HIGH RISK)
3. ✅ Post Saves System (HIGH RISK)
4. ⚠️ Post Comments System (MEDIUM RISK - counter mismatch)

---

## System-by-System Breakdown

### 1. FRIEND SYSTEM ✅ CRITICAL

**File:** `grumble-backend/repositories/friendsRepository.js` (Line 18-51: `sendFriendRequest()`)

**Pattern:** Check-then-act without locking

```javascript
// Step 1: Check if reverse request exists
const reverse = await pool.query("SELECT id, status FROM friendships WHERE...");

// Step 2: Check if forward request exists
const existing = await pool.query(
  "SELECT id, status FROM friendships WHERE...",
);

// Step 3: INSERT if nothing found
const result = await pool.query("INSERT INTO friendships...");
```

**Race Condition Scenario:**

- Tab A & B both start
- Both check reverse → nothing found
- Both check existing → nothing found
- Tab A INSERTs → success
- Tab B INSERTs → **DUPLICATE** (no unique constraint)

**Impact:** Duplicate friend requests, corrupted database

**Solution:** Database constraint + Serializable transactions with FOR UPDATE locking

---

### 2. POST LIKES SYSTEM ✅ HIGH RISK

**File:** `grumble-backend/repositories/postsRepository.js` (Lines 250-278: `toggleLike()`)

**Pattern:** Identical check-then-act as friends

```javascript
async function toggleLike(postId, userId) {
  // Step 1: Check if like exists
  const existing = await pool.query(
    `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2`,
    [postId, userId],
  );

  // Step 2: Based on result, INSERT or DELETE
  if (existing.rows.length > 0) {
    await pool.query(`DELETE FROM likes...`); // Remove like
    await pool.query(`UPDATE posts SET likes_count = likes_count - 1...`);
  } else {
    await pool.query(`INSERT INTO likes...`); // Add like
    await pool.query(`UPDATE posts SET likes_count = likes_count + 1...`);
  }
}
```

**Race Condition Scenarios:**

**Scenario A: Double-Like**

- User clicks like in Tab A
- User clicks like in Tab B simultaneously
- Both queries check → like doesn't exist
- Both insert → **DUPLICATE LIKE** (if no unique constraint)
- Likes count incremented by 2 instead of 1

**Scenario B: Like-Unlike Race**

- Tab A clicking like: check → doesn't exist → INSERT
- Tab B clicking unlike: check → doesn't exist (race!) → tries DELETE → nothing deleted
- Tab A: INSERT succeeds, count = +1
- Tab B: DELETE fails silently, count stays same
- **Result:** Like exists but counter is wrong

**Scenario C: Concurrent Tabs Counter Mismatch**

- Tab A likes post → count goes 10 → 11
- Tab B shows count as 10 (stale)
- Tab B unlikes → count goes 11 → 10
- **Result:** User sees count go down from 10 to 10 (confusing)

**Impact:**

- Database duplicates (if no UNIQUE constraint)
- Counter out of sync with actual likes
- Confusing UI behavior (like shows as both active & inactive)

**Solution:** Same as friends - Serializable transactions + unique constraints

---

### 3. POST SAVES SYSTEM ✅ HIGH RISK

**File:** `grumble-backend/repositories/postsRepository.js` (Lines 305-337: `toggleSave()`)

**Pattern:** Identical to likes

```javascript
async function toggleSave(postId, userId) {
  // Step 1: Check if save exists
  const existing = await pool.query(
    `SELECT id FROM saves WHERE post_id = $1 AND user_id = $2`,
    [postId, userId],
  );

  // Step 2: Based on result, INSERT or DELETE
  if (existing.rows.length > 0) {
    await pool.query(`DELETE FROM saves...`); // Remove save
    await pool.query(
      `UPDATE posts SET saves_count = GREATEST(saves_count - 1, 0)...`,
    );
  } else {
    await pool.query(`INSERT INTO saves...`); // Add save
    await pool.query(`UPDATE posts SET saves_count = saves_count + 1...`);
  }
}
```

**Race Conditions:** Identical to likes system

**Impact:** Same as likes - duplicate saves, counter mismatches

**Solution:** Same - Serializable transactions + unique constraints

---

### 4. POST COMMENTS SYSTEM ⚠️ MEDIUM RISK

**File:** `grumble-backend/repositories/postsRepository.js` (Lines 339-355: `createComment()`)

**Current Code:**

```javascript
async function createComment(postId, userId, content) {
  // Step 1: INSERT comment
  const result = await pool.query(
    `INSERT INTO comments (post_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [postId, userId, content],
  );

  // Step 2: Increment counter (separate query)
  await pool.query(
    `UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`,
    [postId],
  );

  return result.rows[0];
}
```

**Race Condition:**

- Tab A creates comment → INSERT succeeds
- Tab B creates comment → INSERT succeeds
- Tab A updates counter → comments_count = old + 1
- Tab B updates counter → comments_count = old + 1 (WRONG! should be old + 2)

**Scenario:**

- Post has 5 comments
- Two users comment simultaneously
- Both INSERTs succeed (6 comments in table)
- Both call UPDATE separately
- First UPDATE: 5 + 1 = 6
- Second UPDATE: 5 + 1 = 6
- **Result:** 6 comments in table but counter shows 6 (lucky!) OR shows 5 (unlucky)

**Impact:**

- Comments get lost in count
- Frontend shows wrong comment count
- Less critical than likes/saves because comments are visible (count discrepancy noticed)

**Solution:** Wrap INSERT and UPDATE in single transaction

---

## Risk Matrix

| System                   | Type           | Risk               | Severity    | Users Affected            |
| ------------------------ | -------------- | ------------------ | ----------- | ------------------------- |
| Friends - sendRequest    | Check-then-act | Duplicate requests | 🔴 CRITICAL | Both users see duplicate  |
| Friends - accept/decline | Single UPDATE  | Low                | 🟢 LOW      | Just the claimer          |
| Likes - toggle           | Check-then-act | Duplicate likes    | 🔴 CRITICAL | All users see wrong count |
| Saves - toggle           | Check-then-act | Duplicate saves    | 🔴 CRITICAL | All users see wrong count |
| Comments - create        | Split queries  | Counter mismatch   | 🟡 MEDIUM   | All users see wrong count |

---

## Files That Need Fixes

### Backend Files

1. `grumble-backend/repositories/friendsRepository.js`
   - `sendFriendRequest()` - needs transaction + locking
   - (Other functions are safer, just single operations)

2. `grumble-backend/repositories/postsRepository.js`
   - `toggleLike()` - needs transaction + locking
   - `toggleSave()` - needs transaction + locking
   - `createComment()` - needs transaction (less critical)

3. Database migrations needed:
   - Add UNIQUE constraint on likes(post_id, user_id)
   - Add UNIQUE constraint on saves(post_id, user_id)
   - Add UNIQUE constraint on friendships(LEAST(user_id, friend_id), GREATEST(user_id, friend_id))

---

## Priority Implementation Plan

### Phase 1: Database-Level Protection (MUST DO FIRST)

Create new migration: `grumble-backend/migrations/008_add_concurrency_constraints.sql`

```sql
-- Prevent duplicate likes
ALTER TABLE likes ADD CONSTRAINT unique_post_like
  UNIQUE (post_id, user_id);

-- Prevent duplicate saves
ALTER TABLE saves ADD CONSTRAINT unique_post_save
  UNIQUE (post_id, user_id);

-- Prevent duplicate friendships (directional)
ALTER TABLE friendships
ADD CONSTRAINT unique_one_way_friendship
  UNIQUE (LEAST(user_id, friend_id), GREATEST(user_id, friend_id));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_saves_post ON saves(post_id);
```

**Why first?** Database constraints are your last line of defense. Even with code bugs, the database won't allow duplicates.

---

### Phase 2: Fix Check-Then-Act Functions (HIGH PRIORITY)

**2A. Friend System** - `grumble-backend/repositories/friendsRepository.js`

```javascript
async function sendFriendRequest(userId, friendId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");

    // Lock and check reverse request
    const reverse = await client.query(
      `SELECT id, status FROM friendships 
       WHERE user_id = $1 AND friend_id = $2
       FOR UPDATE`,
      [friendId, userId],
    );

    // ... rest of logic with FOR UPDATE ...

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

**2B. Likes System** - `grumble-backend/repositories/postsRepository.js`

```javascript
async function toggleLike(postId, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");

    const existing = await client.query(
      `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2
       FOR UPDATE`,
      [postId, userId],
    );

    if (existing.rows.length > 0) {
      await client.query(
        `DELETE FROM likes WHERE post_id = $1 AND user_id = $2`,
        [postId, userId],
      );
      await client.query(
        `UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1`,
        [postId],
      );
      await client.query("COMMIT");
      return { liked: false };
    } else {
      await client.query(
        `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`,
        [postId, userId],
      );
      await client.query(
        `UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`,
        [postId],
      );
      await client.query("COMMIT");
      return { liked: true };
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

**2C. Saves System** - Apply same pattern as likes

---

### Phase 3: Fix Split-Query Functions (MEDIUM PRIORITY)

**Comments** - `grumble-backend/repositories/postsRepository.js`

```javascript
async function createComment(postId, userId, content) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert and update in same transaction
    const commentResult = await client.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, userId, content],
    );

    await client.query(
      `UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`,
      [postId],
    );

    await client.query("COMMIT");
    return commentResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

---

### Phase 4: Frontend Improvements (OPTIONAL)

Same as friend system - add BroadcastChannel API for cross-tab sync so users know when data changes in other tabs.

---

## Will It Work With Live Link & Multiple Users?

| System   | Current          | After Phase 1           | After Phase 2 |
| -------- | ---------------- | ----------------------- | ------------- |
| Friends  | ❌ Broken        | ⚠️ Safer but no locking | ✅ Safe       |
| Likes    | ❌ Broken        | ⚠️ Safer but no locking | ✅ Safe       |
| Saves    | ❌ Broken        | ⚠️ Safer but no locking | ✅ Safe       |
| Comments | ❌ Counter wrong | ❌ Counter wrong        | ✅ Safe       |

**Minimum requirement before deployment:** Phase 1 + Phase 2

---

## Testing Checklist After Fixes

```
Friends:
□ Open 2 tabs, send request to same user simultaneously → only 1 request created
□ Accept request in tab A, tab B shows updated state
□ User A & B send requests to each other → auto-accept works
□ Try to accept same request twice → fails gracefully

Likes:
□ Open 2 tabs, click like simultaneously → count = 1 (not 0 or 2)
□ Click like in tab A, unlike in tab B → count stays 0
□ Load same post in 2 tabs, like in A → B auto-updates count
□ Comment count matches actual comments in database

Saves:
□ Same tests as likes

Comments:
□ Create comment in tab A, tab B shows new comment and correct count
□ Multiple users commenting simultaneously → all saved, count correct
```

---

## Code Organization Suggestion

Create a **transaction utility** to avoid code duplication:

**New File:** `grumble-backend/utils/transactionHelper.js`

```javascript
/**
 * Execute a function within a SERIALIZABLE transaction with automatic rollback on error.
 * @param {Function} callback - Async function that receives the client
 * @returns {Promise} Result of the callback
 */
async function executeTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { executeTransaction };
```

Then use it like:

```javascript
async function toggleLike(postId, userId) {
  return executeTransaction(async (client) => {
    const existing = await client.query(
      `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2 FOR UPDATE`,
      [postId, userId],
    );

    if (existing.rows.length > 0) {
      // Delete logic
    } else {
      // Insert logic
    }
  });
}
```

---

## Summary: What Needs to Be Done

### Before Deployment

1. ✅ Add database constraints (08_add_concurrency_constraints.sql)
2. ✅ Wrap friend sendRequest in SERIALIZABLE transaction with FOR UPDATE
3. ✅ Wrap likes toggle in SERIALIZABLE transaction with FOR UPDATE
4. ✅ Wrap saves toggle in SERIALIZABLE transaction with FOR UPDATE
5. ✅ Wrap comment create in transaction (optional but recommended)

### Estimated Effort

- Phase 1 (Database): **30 minutes** (1 migration file)
- Phase 2 (Code): **2-3 hours** (3 functions + utility helper)
- Phase 3 (Testing): **1 hour** (concurrent testing)

**Total: ~4-5 hours of work before you can safely deploy**
