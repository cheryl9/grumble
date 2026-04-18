require("dotenv").config();

const pool = require("../config/db");
const authRepo = require("../repositories/authRepository");
const achievementService = require("../services/achievementService");

function parseArgs(argv) {
  const parsed = {};

  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [rawKey, rawValue] = arg.slice(2).split("=");
    parsed[rawKey] = rawValue === undefined ? true : rawValue;
  }

  return {
    userId: Number(parsed.userId || parsed.user || 0),
    days: Number(parsed.days || 10),
    start: parsed.start || null,
    reset: Boolean(parsed.reset),
  };
}

function dayAtOffset(startDate, offset) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + offset);
  return date;
}

async function resetUserProgress(userId) {
  await pool.query("DELETE FROM user_achievements WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM user_streaks WHERE user_id = $1", [userId]);
}

async function run() {
  const { userId, days, start, reset } = parseArgs(process.argv.slice(2));

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Provide a valid user id with --userId=<number>");
  }

  if (!Number.isInteger(days) || days <= 0) {
    throw new Error("Provide a valid positive --days value");
  }

  const startDate = start ? new Date(start) : new Date();
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid --start date. Use YYYY-MM-DD");
  }

  startDate.setHours(0, 0, 0, 0);

  if (reset) {
    await resetUserProgress(userId);
    console.log(`Reset streak and achievements for user ${userId}`);
  }

  for (let i = 0; i < days; i += 1) {
    const currentDate = dayAtOffset(startDate, i);
    const updated = await authRepo.calculateAndUpdateStreak(userId, {
      referenceDate: currentDate,
    });

    console.log(
      `Day ${i + 1} (${currentDate.toISOString().split("T")[0]}): streak=${updated.current_streak}, longest=${updated.longest_streak}`,
    );
  }

  const newlyUnlocked = await achievementService.checkAndUnlockAchievements(
    userId,
    pool,
  );
  const achievements = await achievementService.getUserAchievements(userId, pool);

  console.log("\nNewly unlocked keys:", newlyUnlocked);
  console.log("All unlocked keys:", achievements.unlockedKeys);
}

run()
  .catch((error) => {
    console.error("Achievement streak test failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
