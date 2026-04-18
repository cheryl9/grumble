# Achievement Testing Guide

## Should you change system clock?
Changing your laptop/server clock is not recommended for streak testing.

Reasons:
- It can break JWT expiry checks and other time-sensitive features.
- It can create confusing timestamps in logs and database rows.
- It is hard to reproduce consistently across team members.

Use deterministic test dates instead.

## Deterministic streak simulation
A test script is available to simulate daily streak progression with explicit dates.

Command:
- npm run achievement:test-streak -- --userId=123 --days=10 --start=2026-04-01 --reset

What it does:
- Optionally clears the test user'sstreak and achievement rows.
- Simulates one streak update per day for the number of days you provide.
- Runs achievement checks and prints newly unlocked plus total unlocked keys.

## Core behavior tests to run

1. Ten-day streak progression
- Run with days=10.
- Verify current_streak reaches 10.
- Verify 7-day streak achievement unlocks.
- Verify 14-day streak achievement does not unlock yet.

2. Streak reset after gap
- Simulate 3 days.
- Simulate another update with a date gap of 2 or more days.
- Verify current_streak resets to 1.

3. Same-day idempotency
- Call streak calculation multiple times for the same date.
- Verify current_streak does not increase more than once.

4. Achievement idempotency
- Run achievement check repeatedly with unchanged stats.
- Verify duplicate rows are not inserted into user_achievements.

5. Unlock sync from real post creation
- Create a post via API.
- Verify response contains newlyUnlockedAchievements when criteria are met.
- Verify websocket event notification_alert with type=achievement_unlocked arrives on connected clients.

6. Unlock sync from friendship acceptance
- Accept a pending friend request.
- Verify both users can receive newly unlocked friendship milestones.
- Verify websocket event notification_alert with type=achievement_unlocked arrives for affected users.

## Timezone-focused tests
Your late-night achievement uses Asia/Singapore hours. Validate boundaries:
- 23:59 Singapore time should not count as late-night.
- 00:00 to 04:59 Singapore time should count as late-night.
- 05:00 Singapore time should not count.

## UI verification checklist
- Keep user on different pages (Explore, Friends, Chats, Profile).
- Trigger an unlock from a new post.
- Confirm the global achievement toast appears on each page.
- Confirm avatar icon and achievement title are correct.

## Suggested automation roadmap
- Add integration tests that call post creation endpoints and assert DB + websocket behavior.
- Add seeded fixture users for deterministic unlock thresholds.
- Add a nightly regression test for streak transitions around midnight Singapore time.
