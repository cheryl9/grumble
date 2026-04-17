# Member 2 Merge Checklist - Profile Page Work

**Date Created:** April 17, 2026  
**Branch:** member2-profile or similar  
**Team Member:** Member 2  
**Scope:** Profile Page, Gamification (Streaks), Settings, Help/Support

---

## PRE-MERGE CHECKLIST

- [ ] Create backup/new branch: `git checkout -b merge/member2-profile`
- [ ] Pull Member 2's branch/code
- [ ] Review the list of files that will change (see below)
- [ ] Check database schema - migration file numbers don't conflict

---

## EXPECTED MERGE CONFLICTS (Files Git Will Flag)

### 🔴 HIGH PRIORITY - Review Carefully

These files WILL have conflicts:

1. **grumble-backend/routes/authRoutes.js**
   - Current: 11 routes for auth, login, logout, password reset, telegram
   - Adding: PUT /profile, POST /preferences
   - Merge strategy: Accept both versions - her 2 new routes at end

2. **grumble-backend/controllers/authController.js**
   - Current: ~380 lines, 8 exported functions
   - Adding: updateProfile(), savePreferences() functions
   - Merge strategy: Accept her additions at end of file

3. **grumble-backend/repositories/authRepository.js**
   - Current: 6 query functions
   - Adding: updateUser(), savePreferences(), getUserStats() functions
   - Merge strategy: Accept her new functions, verify no duplicates

4. **grumble-frontend/src/pages/Profile.jsx**
   - Current: 150 lines, basic profile with username/phone/telegram
   - Adding: COMPLETE REWRITE - profile icon, dashboard, stats, edit section, streak display, share button
   - Merge strategy: CAREFULLY REVIEW - ensure no custom logic of yours is lost
   - ⚠️ CRITICAL: This is a major rewrite - git may show entire file as conflict

5. **grumble-frontend/src/pages/auth/OnboardingSurvey.jsx**
   - Current: Form to select cuisines, console.log, navigate away (no API call)
   - Adding: API call POST /api/auth/preferences to save cuisines
   - Merge strategy: Accept her changes - adds missing functionality

6. **grumble-frontend/src/router.jsx**
   - Current: 70 lines, 6 main routes + admin routes
   - Adding: HelpSupport import + /help-support route in MainLayout children
   - Merge strategy: Simple addition - accept her change

7. **grumble-backend/app.js**
   - Current: Routes for posts, friends, food-places, auth, admin mounted
   - Adding: Mount faqPublicRoutes (likely)
   - Merge strategy: Add one more route mount - simple addition
   - ⚠️ Watch out: Member 3 and Member 4 will also touch this file

---

### 🟡 MEDIUM PRIORITY - Clean Merges (New Files)

These are NEW FILES - no conflicts, just review for correctness:

1. **grumble-backend/migrations/006_create_user_preferences.sql**
   - Creates user_preferences table with user_id + cuisines (JSON)
   - Verify: Migration numbering doesn't conflict with your other migrations

2. **grumble-backend/routes/faqPublicRoutes.js**
   - New public endpoint for FAQs (different from admin FAQ management)
   - Routes: GET /faqs (get all), possibly GET /faqs/:id
   - Action: Verify it's different from admin FAQ endpoints

3. **grumble-frontend/src/pages/HelpSupport.jsx**
   - New page for displaying FAQs with accordion/expandable format
   - Action: Check styling matches your design system

4. **grumble-frontend/src/components/profilePage/** (FOLDER)
   - New folder with: EditProfileModal.jsx, StreakDisplay.jsx, ProfileDashboard.jsx, etc.
   - Action: Review component structure, ensure toast notifications work

---

## FUNCTIONALITY TO TEST AFTER MERGE

### Profile Page Features
- [ ] Profile page loads without error
- [ ] Profile icon/avatar displays
- [ ] Stats dashboard shows (friends, posts, likes, saves)
- [ ] Stats have "View all" buttons  
- [ ] Edit Profile modal opens
- [ ] Can edit username
- [ ] Can edit phone number
- [ ] Can edit password (requires current password verification)
- [ ] Streak icon/display shows correctly
- [ ] Streak number increments on new posts
- [ ] Share Profile button copies link to clipboard

### Preferences & Onboarding
- [ ] OnboardingSurvey page flow works
- [ ] Can select cuisines
- [ ] Submit button saves to backend
- [ ] API call to POST /api/auth/preferences succeeds
- [ ] Redirect to Explore after submit works
- [ ] Skip button still works
- [ ] Preferences appear in profile once saved

### Help & Support
- [ ] HelpSupport page accessible from Profile
- [ ] FAQs load from API GET /api/admin/faqs
- [ ] FAQs display in expandable/accordion format
- [ ] "Report an Issue" section appears
- [ ] Navigation back to Profile works

### Settings
- [ ] Settings section accessible from Profile
- [ ] Any password change flows protected with current password verification

---

## RACE CONDITION ISSUES TO MAINTAIN

Member 2 will call stats functions that depend on:
- Likes system (postsRepository.toggleLike) - HAS RACE CONDITION
- Saves system (postsRepository.toggleSave) - HAS RACE CONDITION  
- Friend system (friendsRepository) - HAS RACE CONDITION

⚠️ Check: Her getUserStats() queries don't introduce new race conditions when counting these values

See `/memories/repo/race-condition-findings.md` for detailed analysis.

---

## DATABASE/API ENDPOINTS TO VERIFY

After merge, these endpoints should exist:

### Backend Endpoints Added
- [ ] PUT /api/auth/profile (update username, phone, password)
- [ ] POST /api/auth/preferences (save cuisine preferences)
- [ ] GET /api/auth/stats (get friend/post/like/save counts) 
- [ ] GET /api/admin/faqs (public FAQ endpoint)

### Database Tables After Migrations
- [ ] user_preferences table exists (user_id, cuisines JSON)
- [ ] user_streaks table exists (current_streak, longest_streak)

---

## COMMON MERGE CONFLICT RESOLUTIONS

### If authRoutes.js shows conflict:
```
// Keep both her additions and existing routes
// Current routes at top, her new routes at end
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/preferences', authMiddleware, authController.savePreferences);
```

### If authController.js shows conflict:
```
// Keep existing functions
// Add her new functions: updateProfile, savePreferences
module.exports = { 
  register, login, ... getCurrentUser, 
  updateProfile,    // New
  savePreferences   // New
};
```

### If Profile.jsx shows entire file as conflict:
```
// This is expected - she did a complete rewrite
// 1. Save your current Profile.jsx backup
// 2. Accept HER version - it's the new design
// 3. Double-check integrations with AuthContext, useNavigate are correct
```

### If router.jsx shows conflict:
```
// Add import at top
import HelpSupport from "./pages/HelpSupport";

// Add route in MainLayout children
{ path: 'help-support', element: <HelpSupport /> },
```

---

## SHARED FILES COORDINATION

### app.js (Backend)
⚠️ **WATCH OUT** - Multiple members will touch this:
- Member 2: Adds FAQ public routes mount
- Member 3: Already added friend routes (should be there)
- Member 4: Will add chat routes + Socket.IO

**Merge Strategy:**
- Just add FAQs route when merging Member 2
- Have a separate conversation about merge order for Members 3&4

### router.jsx (Frontend)
- Member 2: Adds /help-support route
- Member 3: Already added /friends route (should be there)
- No conflicts expected - routes don't overlap

---

## IF THINGS GO WRONG

### Merge aborts/conflicts too complex:
```bash
# Start over
git merge --abort

# Pull fresh, resolve one file at a time
git pull origin member2-branch
# Git will show conflicts
# VSCode will highlight them
# Resolve manually in VSCode
```

### Profile page breaks after merge:
1. Check all imports still work (AuthContext, useNavigate, etc.)
2. Check CSS classes referenced still exist
3. Check API endpoints POST /api/auth/profile, POST /api/auth/preferences exist
4. Run `npm run dev` in frontend to see console errors

### OnboardingSurvey doesn't save:
1. Check POST /api/auth/preferences endpoint exists on backend
2. Check error response from API call
3. Verify user_preferences table was created by migration 006
4. Check authService.savePreferences() was exported correctly

### Help page shows 404:
1. Check route { path: 'help-support', element: <HelpSupport /> } in router.jsx
2. Check GET /api/admin/faqs endpoint exists (or public endpoint if different)
3. Verify faqPublicRoutes mounted in app.js
4. Check HelpSupport.jsx imports and API service calls

---

## FILES YOU DON'T TOUCH (Safe from Conflicts)

These won't be affected by Member 2's merge:
- grumble-frontend/src/pages/Explore.jsx
- grumble-frontend/src/pages/FindSpots.jsx
- grumble-frontend/src/pages/FoodMap.jsx
- grumble-frontend/src/pages/Chats.jsx
- grumble-frontend/src/pages/FriendsList.jsx
- postRoutes.js, postsController.js, postsRepository.js
- friendRoutes.js (if already merged from Member 3)
- All post-related components

---

## NOTES FOR YOUR TEAM

- Member 2's work enables the profile as a hub for user identity
- Her preference saving enables the "For You" feed to be personalized (Member 1 builds "For You")
- Her streak system is a gamification element to encourage posts
- Help/Support FAQ page reduces support requests

Ensure her changes integrate smoothly with:
- Member 1's Explore page stats
- Member 3's friend counts in stats
- Member 4's chat system doesn't conflict on app.js
