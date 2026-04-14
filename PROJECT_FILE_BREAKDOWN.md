# 📚 Grumble Project - Complete File Breakdown

**Last Updated:** April 13, 2026  
**Project Type:** Food Discovery Social App (Singapore-focused)

---

## 📋 Table of Contents

- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database & Migrations](#database--migrations)
- [Key Technologies](#key-technologies)

---

## 🔙 BACKEND ARCHITECTURE

### **Core Application Files**

#### [grumble-backend/package.json](grumble-backend/package.json)

- **Purpose:** Project dependencies and scripts for backend
- **Key Dependencies:**
  - `express` - Web framework
  - `pg` - PostgreSQL client
  - `jsonwebtoken` - JWT for authentication
  - `bcrypt` - Password hashing
  - `cors` - Cross-origin request handling
  - `axios` - HTTP client (for OSM API calls)
  - `dotenv` - Environment variable management

#### [grumble-backend/server.js](grumble-backend/server.js)

- **Purpose:** Entry point for the server
- **What It Does:**
  - Loads environment variables
  - Imports Express app from `app.js`
  - Starts server on port 3000 (or custom PORT env var)
  - Logs confirmation when running

#### [grumble-backend/app.js](grumble-backend/app.js)

- **Purpose:** Main Express application setup
- **What It Does:**
  - Sets up CORS middleware (allows frontend requests)
  - Configures JSON body parser
  - Mounts three route groups:
    - `/api/food-places` - Food place search/filtering
    - `/api/auth` - User registration, login, password reset
    - `/api/admin` - Admin panel operations
  - Applies error handler middleware last

---

### **Configuration**

#### [grumble-backend/config/db.js](grumble-backend/config/db.js)

- **Purpose:** Database connection setup
- **What It Does:**
  - Reads `DATABASE_URL` from environment
  - Creates PostgreSQL connection pool
  - Exports pool for use throughout app
- **Usage:** Required in all repositories for database queries

---

### **Middleware (grumble-backend/middleware/)**

#### [authMiddleware.js](grumble-backend/middleware/authMiddleware.js)

- **Purpose:** Verify user authentication for protected routes
- **What It Does:**
  - Extracts JWT token from Authorization header (Bearer format)
  - Verifies token signature using `JWT_SECRET`
  - Checks if user account is active (not deleted/frozen)
  - Attaches user info to `req.user` for controller use
  - Returns 401 if no token or 403 if account frozen/deleted
- **Used By:** Auth routes, any user-protected endpoints

#### [adminAuthMiddleware.js](grumble-backend/middleware/adminAuthMiddleware.js)

- **Purpose:** Verify admin authentication (separate from users)
- **What It Does:**
  - Similar to authMiddleware but uses `ADMIN_JWT_SECRET`
  - Verifies token is for admin (has `type: 'admin'`)
  - Checks admin is active
  - Attaches admin info to `req.admin`
- **Used By:** All `/api/admin` routes

#### [rateLimitMiddleware.js](grumble-backend/middleware/rateLimitMiddleware.js)

- **Purpose:** Prevent brute force attacks on login
- **What It Does:**
  - Tracks login attempts per IP + username
  - Limits to 5 attempts per 15 minutes
  - Resets counters after time window
- **Used By:** `/api/admin/login` endpoint

#### [errorHandler.js](grumble-backend/middleware/errorHandler.js)

- **Purpose:** Global error handler
- **What It Does:**
  - Catches any unhandled errors
  - Logs to console
  - Returns 500 error response
  - MUST be last middleware in Express

---

### **Controllers (Business Logic)**

#### [controllers/authController.js](grumble-backend/controllers/authController.js) - 455 lines

**Purpose:** Handle user authentication operations

**Functions:**

1. `register(req, res)` - Create new user account
   - Validates phone, username, password not empty
   - Checks uniqueness of phone/username
   - Hashes password with bcrypt
   - Creates user in database
   - Generates JWT token valid for 30 days
   - Returns token + user data

2. `login(req, res)` - Authenticate existing user
   - Validates username/password provided
   - Verifies credentials against database
   - Checks if account is frozen/deleted
   - Generates JWT token
   - Returns token + user data

3. `getCurrentUser(req, res)` - Get authenticated user's profile
   - Uses user info from authMiddleware
   - Returns full user details

4. `logout(req, res)` - Logout user
   - Client-side just clears localStorage
   - Backend doesn't need to do much

5. `sendPasswordResetOTP(req, res)` - Generate & send OTP
   - Validates phone number exists
   - Generates random 6-digit OTP
   - Stores OTP in database with 10-minute expiry
   - Attempts to send via Telegram (fallback to console)

6. `verifyPasswordResetOTP(req, res)` - Verify OTP is correct
   - Checks OTP matches stored value
   - Checks OTP hasn't expired
   - Returns success if valid

7. `resetPassword(req, res)` - Update password after OTP verified
   - Validates new password meets requirements
   - Hashes new password
   - Updates user in database
   - Marks OTP as used

8. `connectTelegram(req, res)` - Link Telegram account for notifications
   - Updates user record with telegram_chat_id
   - Sends test message to Telegram

9. `disconnectTelegram(req, res)` - Remove Telegram integration
   - Sets telegram_chat_id to NULL

---

#### [controllers/foodPlaceController.js](grumble-backend/controllers/foodPlaceController.js) - 30 lines

**Purpose:** Handle food place queries

**Functions:**

1. `getAllFoodPlacesHandler(req, res)` - Get list of food places
   - Takes query params: category, cuisine, minLat, maxLat, minLon, maxLon
   - Calls repository to fetch filtered results
   - Returns JSON array of places

2. `getFoodPlaceByIdHandler(req, res)` - Get single food place
   - Takes food place ID from URL param
   - Returns details or 404 if not found

---

#### [controllers/admin/adminAuthController.js](grumble-backend/controllers/admin/adminAuthController.js) - 273 lines

**Purpose:** Admin-specific authentication

**Functions:**

1. `login(req, res)` - Admin login
   - Validates username/password
   - Verifies credentials
   - Generates admin JWT token (4 hour expiry)
   - Logs login action to audit trail
   - Returns admin profile + token

2. `getCurrentAdmin(req, res)` - Get admin profile
   - Uses adminAuthMiddleware

3. `logout(req, res)` - Log admin logout
   - Records in activity logs

4. `getAdminLogs(req, res)` - Get activity audit logs
   - Paginates through admin actions
   - Filters by admin/action type

5. `getAllAdmins(req, res)` - List all admins (superadmin only)

6. `changePassword(req, res)` - Admin password change
   - Verifies current password
   - Validates new password
   - Updates database

---

#### [controllers/admin/dashboardController.js](grumble-backend/controllers/admin/dashboardController.js) - 141 lines

**Purpose:** Provide analytics/dashboard data

**Functions:**

1. `getStats(req, res)` - Overview statistics
   - Total users, active users
   - Total posts, posts in last 30 days
   - Pending reports count
   - Growth percentages

2. `getUserGrowth(req, res)` - User growth over time
   - Takes `months` query param
   - Returns monthly user creation data
   - Used for line charts

3. `getEngagementMetrics(req, res)` - User engagement stats
   - Total likes, comments, saves
   - Daily active users
   - Report status breakdown

4. `getStreakStats(req, res)` - User posting streaks
   - Distribution of posting patterns

5. `getTopUsers(req, res)` - Most active users
   - Ranked by posts, likes, engagement

---

#### [controllers/admin/userManagementController.js](grumble-backend/controllers/admin/userManagementController.js) - 222 lines

**Purpose:** Admin user management

**Functions:**

1. `getUsers(req, res)` - List users with filters
   - Filters: search, status (active/frozen/deleted)
   - Sorting & pagination
   - Returns paginated user list

2. `getUserDetails(req, res)` - Get full user profile
   - User basic info
   - User statistics (posts, followers)
   - Recent posts
   - Friends list

3. `freezeUser(req, res)` - Freeze user account
   - Takes reason for freezing
   - Records action in logs

4. `unfreezeUser(req, res)` - Unfreeze account

5. `deleteUser(req, res)` - Mark user as deleted
   - Soft delete (keeps history)

---

#### [controllers/admin/postManagementController.js](grumble-backend/controllers/admin/postManagementController.js)

**Purpose:** Admin post moderation

**Functions:**

- `getPosts()` - List all posts (with filters)
- `getPostDetails()` - Full post info including comments
- `removePost()` - Delete inappropriate posts
- `removeComment()` - Delete comment from post

---

#### [controllers/admin/reportController.js](grumble-backend/controllers/admin/reportController.js)

**Purpose:** Handle user reports/content moderation

**Functions:**

- `getReports()` - List reports with status filter
- `getReportDetails()` - Full report + flagged content
- `approveReport()` - Takes action (remove content)
- `rejectReport()` - Close report as invalid

---

#### [controllers/admin/faqController.js](grumble-backend/controllers/admin/faqController.js)

**Purpose:** Manage FAQ entries

**Functions:**

- `getFAQs()` - List all FAQs
- `createFAQ()` - Add new FAQ entry
- `updateFAQ()` - Edit FAQ
- `deleteFAQ()` - Remove FAQ

---

### **Repositories (Data Access Layer)**

#### [repositories/authRepository.js](grumble-backend/repositories/authRepository.js) - 230 lines

**Purpose:** Database queries for users and auth

**Functions:**

1. `findUserById(userId)` - Get user by ID
2. `findUserByPhoneNumber(phone)` - Lookup by phone
3. `findUserByUsername(username)` - Lookup by username
4. `createUser(phone, username, password)` - Insert new user
5. `verifyPassword(username, password)` - Check credentials
6. `updatePassword(userId, newPassword)` - Change password
7. `createPasswordResetOTP(phone, code)` - Store OTP
8. `findOTPByPhone(phone)` - Get OTP record
9. `markOTPAsUsed(otpId)` - Update OTP status
10. `connectTelegram(userId, chatId, username)` - Link Telegram
11. `disconnectTelegram(userId)` - Unlink Telegram

---

#### [repositories/foodPlaceRepository.js](grumble-backend/repositories/foodPlaceRepository.js) - 30 lines

**Purpose:** Database queries for food places

**Functions:**

1. `getAllFoodPlaces(filters)` - Search food places
   - Supports filtering by: category, cuisine, geolocation (bounding box)
   - Uses PostGIS for spatial queries
   - Returns all matching places

2. `getFoodPlaceById(id)` - Get single place details

---

#### [repositories/admin/adminRepository.js](grumble-backend/repositories/admin/adminRepository.js)

**Purpose:** Admin account management queries

**Functions:**

- `verifyAdminCredentials()` - Check login
- `updateLastLogin()` - Record login time
- `logAdminAction()` - Insert activity log
- `findAdminById()` - Get admin profile
- `getAllAdmins()` - List all admins

---

#### [repositories/admin/userManagementRepository.js](grumble-backend/repositories/admin/userManagementRepository.js)

**Purpose:** User data for admin panel

**Functions:**

- `getUsers(filters)` - List users with search/sort/pagination
- `getUserById(id)` - Get user details
- `getUserStats(id)` - Posts/followers/engagement counts
- `getUserPosts(id, limit)` - Recent user posts
- `getUserFriends(id)` - User's friend list
- `freezeUser()` - Freeze account
- `unfreezeUser()` - Reactivate account
- `deleteUser()` - Mark as deleted

---

#### [repositories/admin/postManagementRepository.js](grumble-backend/repositories/admin/postManagementRepository.js)

**Purpose:** Post management queries

**Functions:**

- `getPosts()` - List posts with filters
- `getPostDetails()` - Full post + comments
- `removePost()` - Delete post
- `removeComment()` - Delete comment

---

#### [repositories/admin/reportRepository.js](grumble-backend/repositories/admin/reportRepository.js)

**Purpose:** User reports queries

**Functions:**

- `getReports()` - List reports (pending/resolved)
- `getReportDetails()` - Report + flagged content
- `createReport()` - User files report
- `approveReport()` - Remove content
- `rejectReport()` - Close report

---

#### [repositories/admin/faqRepository.js](grumble-backend/repositories/admin/faqRepository.js)

**Purpose:** FAQ management

**Functions:**

- `getFAQs()` - List FAQs
- `createFAQ()` - Insert FAQ
- `updateFAQ()` - Modify FAQ
- `deleteFAQ()` - Remove FAQ

---

#### [repositories/admin/analyticsRepository.js](grumble-backend/repositories/admin/analyticsRepository.js)

**Purpose:** Analytics queries for dashboard

**Functions:**

- `getDashboardStats()` - Overall metrics
- `getAveragePostsPerUser()` - Engagement metric
- `getUserGrowthData(months)` - Monthly new users
- `getEngagementMetrics()` - Likes/comments/saves
- `getDailyActiveUsers(days)` - DAU over time
- `getReportStatusBreakdown()` - Report counts by status

---

### **Routes (API Endpoints)**

#### [routes/authRoutes.js](grumble-backend/routes/authRoutes.js) - 30 lines

```
POST   /api/auth/register                 → authController.register
POST   /api/auth/login                    → authController.login
GET    /api/auth/user                     → authMiddleware → authController.getCurrentUser
POST   /api/auth/logout                   → authController.logout
POST   /api/auth/forgot-password/send-otp → authController.sendPasswordResetOTP
POST   /api/auth/forgot-password/verify-otp → authController.verifyPasswordResetOTP
POST   /api/auth/forgot-password/reset    → authController.resetPassword
POST   /api/auth/telegram/connect         → authMiddleware → authController.connectTelegram
POST   /api/auth/telegram/disconnect      → authMiddleware → authController.disconnectTelegram
```

#### [routes/foodPlaceRoutes.js](grumble-backend/routes/foodPlaceRoutes.js) - 8 lines

```
GET    /api/food-places/                  → foodPlaceController.getAllFoodPlacesHandler
GET    /api/food-places/:id               → foodPlaceController.getFoodPlaceByIdHandler
```

#### [routes/adminRoutes.js](grumble-backend/routes/adminRoutes.js) - 247 lines

```
POST   /api/admin/login                   → adminAuthController.login
GET    /api/admin/me                      → adminAuthMiddleware → adminAuthController.getCurrentAdmin
POST   /api/admin/logout                  → adminAuthController.logout
GET    /api/admin/logs                    → adminAuthController.getAdminLogs
GET    /api/admin/admins                  → adminAuthController.getAllAdmins
POST   /api/admin/change-password         → adminAuthController.changePassword

GET    /api/admin/dashboard/stats         → dashboardController.getStats
GET    /api/admin/dashboard/growth        → dashboardController.getUserGrowth
GET    /api/admin/dashboard/engagement    → dashboardController.getEngagementMetrics
GET    /api/admin/dashboard/streaks       → dashboardController.getStreakStats
GET    /api/admin/dashboard/top-users     → dashboardController.getTopUsers

GET    /api/admin/users                   → userManagementController.getUsers
GET    /api/admin/users/:id               → userManagementController.getUserDetails
POST   /api/admin/users/:id/freeze        → userManagementController.freezeUser
POST   /api/admin/users/:id/unfreeze      → userManagementController.unfreezeUser
DELETE /api/admin/users/:id               → userManagementController.deleteUser

GET    /api/admin/posts                   → postManagementController.getPosts
GET    /api/admin/posts/:id               → postManagementController.getPostDetails
DELETE /api/admin/posts/:id               → postManagementController.removePost
DELETE /api/admin/posts/:id/comments/:commentId → postManagementController.removeComment

GET    /api/admin/reports                 → reportController.getReports
GET    /api/admin/reports/:id             → reportController.getReportDetails
POST   /api/admin/reports/:id/approve     → reportController.approveReport
POST   /api/admin/reports/:id/reject      → reportController.rejectReport

GET    /api/admin/faqs                    → faqController.getFAQs
POST   /api/admin/faqs                    → faqController.createFAQ
PUT    /api/admin/faqs/:id                → faqController.updateFAQ
DELETE /api/admin/faqs/:id                → faqController.deleteFAQ
```

---

### **Services (External Integrations)**

#### [services/osmService.js](grumble-backend/services/osmService.js) - 50 lines

**Purpose:** Fetch food places from OpenStreetMap

**What It Does:**

- Queries Overpass API (OpenStreetMap's query engine)
- Filters for restaurants, cafes, food courts, hawker centres
- Limited to Singapore bounding box (1.1304°N to 1.4504°N, 103.6020°E to 104.0850°E)
- Returns GeoJSON with locations

**Function:**

- `fetchFoodPlaces()` - Calls Overpass API with hardcoded Singapore query
  - Returns array of OSM elements with coordinates

**OSM Query Details:**

```
[out:json][timeout:60]
- node["amenity"~"restaurant|cafe|food_court|hawker_centre|fast_food"]
- way["amenity"~"restaurant|cafe|food_court|hawker_centre|fast_food"]
```

---

#### [services/syncService.js](grumble-backend/services/syncService.js) - 50 lines

**Purpose:** Sync OSM data to PostgreSQL

**What It Does:**

- Fetches data from osmService
- Transforms OSM data format
- Inserts/updates food_places table in database
- Uses ON CONFLICT to handle duplicates (OSM ID as unique key)
- Stores location as PostGIS Point geometry

**Function:**

- `syncFoodPlaces()` - Main sync function
  1. Calls `fetchFoodPlaces()`
  2. For each place, extracts: name, cuisine, category, lat/lon, address, opening hours
  3. Creates PostGIS point geometry
  4. Upserts into database

---

#### [services/telegramService.js](grumble-backend/services/telegramService.js) - 179 lines

**Purpose:** Send notifications via Telegram Bot API

**What It Does:**

- Creates formatted messages
- Calls Telegram Bot API endpoints
- Handles errors gracefully

**Functions:**

1. `isTelegramConfigured()` - Check if bot token exists
2. `sendMessage(chatId, text, options)` - Send text message
3. `sendOTP(chatId, otpCode)` - Send formatted OTP message
4. `sendChatNotification(chatId, notification)` - New message alert
5. `getBotInfo()` - Test bot connection
6. `logToConsole()` - Fallback for development

**Flow:**

- User provides Telegram chat_id from `/start` command
- OTP stored in users table
- When reset needed, `sendOTP()` called
- Telegram Bot delivers to user's private chat

---

### **Scripts (Utility & Setup)**

#### [scripts/syncOSM.js](grumble-backend/scripts/syncOSM.js) - 5 lines

**Purpose:** One-time data import script

**What It Does:**

- Imports syncService
- Calls `syncFoodPlaces()` to populate database
- Run once after migrations: `node scripts/syncOSM.js`

---

#### [scripts/createAdmin.js](grumble-backend/scripts/createAdmin.js) - 177 lines

**Purpose:** Interactive admin account creation

**What It Does:**

- Prompts for: email, username, password (with validation)
- Validates email format
- Validates password strength (upper, lower, number, special char)
- Hashes password with bcrypt
- Inserts into admins table
- Shows success/error message

**Run:** `node scripts/createAdmin.js`

---

#### [scripts/telegramBotHelper.js](grumble-backend/scripts/telegramBotHelper.js)

**Purpose:** Helper for setting up Telegram webhook

**Usage:**

- Configure bot with BotFather
- Set webhook URL pointing to `/telegram` endpoint
- Receives updates from Telegram

---

#### [scripts/clearTelegramWebhook.js](grumble-backend/scripts/clearTelegramWebhook.js)

**Purpose:** Remove webhook for local development

**Usage:** `node scripts/clearTelegramWebhook.js`

---

## 💾 DATABASE & MIGRATIONS

### [migrations/001_create_food_places.sql](grumble-backend/migrations/001_create_food_places.sql)

**Creates:** food_places table

**Schema:**

```sql
id (PRIMARY KEY)
osm_id (UNIQUE) - From OpenStreetMap
name, cuisine, category
lat, lon, geom (PostGIS Point)
address, opening_hours
created_at

INDEXES:
- food_places_geom_idx (spatial index for geographic queries)
- food_places_name_idx (for name searches)
```

---

### [migrations/002_create_users.sql](grumble-backend/migrations/002_create_users.sql)

**Creates:** users & password_reset_otps tables

**users table:**

```sql
id (PRIMARY KEY)
phone_number (UNIQUE) - Singapore format (8 digits, 8 or 9 start)
username (UNIQUE)
password_hash
created_at, updated_at
```

**password_reset_otps table:**

```sql
id (PRIMARY KEY)
phone_number
otp_code (6-digit)
expires_at (10 minute TTL)
is_used (tracks if OTP already used)
created_at
```

---

### [migrations/003_add_telegram_fields.sql](grumble-backend/migrations/003_add_telegram_fields.sql)

**Adds to users table:**

```sql
telegram_chat_id (nullable) - User's Telegram ID
telegram_username (nullable) - @username
telegram_first_name (nullable) - Display name
telegram_connected_at (timestamp) - When connected
```

---

### [migrations/004_create_admin_tables.sql](grumble-backend/migrations/004_create_admin_tables.sql)

**Creates:** admins, admin_logs, posts, comments, likes, reports tables

**admins table:**

```sql
id, username (UNIQUE), email (UNIQUE)
password_hash, full_name
role ('admin' or 'superadmin')
is_active, last_login_at
created_at, updated_at
```

**admin_logs table (audit trail):**

```sql
id, admin_id
action (user_deleted, post_removed, etc)
target_type, target_id
details (JSON)
ip_address, created_at
```

**posts table:**

```sql
id, user_id, food_place_id
location_name, rating (1-5)
image_url, description
visibility (public/friends/private)
likes_count, comments_count, saves_count
is_deleted, deleted_at
created_at, updated_at
```

**comments table:**

```sql
id, post_id, user_id
content
is_deleted, deleted_at
created_at
```

**likes table:**

```sql
id, post_id, user_id
created_at (one like per user per post)
```

**reports table:**

```sql
id, reported_post_id, reporter_user_id
reason (from REPORT_REASONS)
status (pending/approved/rejected)
admin_notes
created_at, resolved_at
```

---

## 🎨 FRONTEND ARCHITECTURE

### **Entry Point & Configuration**

#### [grumble-frontend/package.json](grumble-frontend/package.json) - 50 lines

**Purpose:** Frontend dependencies and scripts

**Scripts:**

- `npm run dev` - Start Vite dev server (http://localhost:5173)
- `npm run build` - Create production build
- `npm run lint` - Check code style

**Key Dependencies:**

- `react` 19 - UI library
- `react-dom` 19 - React rendering
- `react-router-dom` 7 - Client-side routing
- `vite` 7 - Build tool & dev server
- `tailwindcss` 4 - Utility CSS
- `leaflet` 1.9 - Map library
- `axios` - HTTP client
- `recharts` 2.10 - Charts for admin dashboard
- `react-hook-form` 7.71 - Form handling
- `lucide-react` 0.564 - Icon library

---

#### [grumble-frontend/vite.config.js](grumble-frontend/vite.config.js) - 10 lines

**Purpose:** Build tool configuration

**What It Does:**

- Uses React plugin
- No special config needed

---

#### [grumble-frontend/tailwind.config.js](grumble-frontend/tailwind.config.js) - 12 lines

**Purpose:** Tailwind CSS configuration

**What It Does:**

- Scans src/ for JSX/TS files
- Enables Tailwind classes

---

#### [grumble-frontend/index.html](grumble-frontend/index.html)

**Purpose:** HTML entry point

**Contains:**

- `<div id="root">` - React mounts here
- Script tag loads main.jsx

---

### **Entry Points**

#### [src/main.jsx](grumble-frontend/src/main.jsx) - 15 lines

**Purpose:** React app initialization

**What It Does:**

1. Imports React, ReactDOM, router
2. Wraps app in AuthProvider (user auth context)
3. Wraps in AdminAuthProvider (admin auth context)
4. Renders RouterProvider with routes
5. Mounts to #root element

---

#### [src/router.jsx](grumble-frontend/src/router.jsx) - 100 lines

**Purpose:** Client-side routing configuration

**Routes:**

**Public Routes:**

- `/login` → Login page
- `/register` → Registration page
- `/forgot-password` → Password reset
- `/admin/login` → Admin login

**Protected User Routes (require login):**

- `/onboarding` → Survey after signup
- `/` (root) → Explore page (default)
- `/explore` → Feed (posts from users)
- `/find-spots` → Search restaurants
- `/food-map` → Interactive map
- `/chats` → Messaging
- `/profile` → User profile

**Protected Admin Routes (require admin login):**

- `/admin` → Dashboard
- `/admin/users` → User management
- `/admin/posts` → Post moderation
- `/admin/reports` → Handle reports
- `/admin/faqs` → FAQ management
- `/admin/logs` → Activity logs
- `/admin/settings` → Admin settings

---

### **Context (Global State)**

#### [src/context/AuthContext.jsx](grumble-frontend/src/context/AuthContext.jsx) - 109 lines

**Purpose:** User authentication state management

**Provides:**

- `user` - Current user object
- `isAuthenticated` - Boolean
- `isLoading` - Loading during auth check
- `login(username, password)` - Authenticate
- `register(phone, username, password)` - Create account
- `logout()` - Clear auth
- `setUser()` - Update user info (Telegram connection)

**How It Works:**

1. On mount, checks localStorage for auth token
2. Fetches fresh user data from server
3. Stores in state for components to use
4. Login/register calls authService API
5. Logout clears localStorage + state

---

#### [src/context/AdminAuthContext.jsx](grumble-frontend/src/context/AdminAuthContext.jsx) - 105 lines

**Purpose:** Admin authentication (separate from user auth)

**Provides:**

- `admin` - Current admin object
- `isAuthenticated` - Boolean
- `isLoading` - Loading
- `login()` - Admin login
- `logout()` - Admin logout

**Separation:** Admin tokens use different JWT secret, different storage keys

---

### **Services (API Calls)**

#### [src/services/api.js](grumble-frontend/src/services/api.js) - 45 lines

**Purpose:** HTTP client with authentication interceptor

**What It Does:**

1. Creates axios instance with base URL: `http://localhost:5001/api` (⚠️ WRONG PORT!)
2. Request interceptor adds JWT token from localStorage
3. Response interceptor handles 401 errors:
   - Clears auth if token expired
   - Redirects to login
4. All API calls go through this

**⚠️ BUG:** Frontend expects port 5001 but backend runs on 3000!

---

#### [src/services/authService.js](grumble-frontend/src/services/authService.js) - 175 lines

**Purpose:** User auth API calls

**Functions:**

1. `register(phone, username, password)` → POST /auth/register
2. `login(username, password)` → POST /auth/login
3. `logout()` → POST /auth/logout
4. `getCurrentUser()` - Get from localStorage
5. `fetchCurrentUser()` - GET /auth/user (verify fresh)
6. `getAuthToken()` - Get from localStorage
7. `sendPasswordResetOTP(phone)` → POST /auth/forgot-password/send-otp
8. `verifyPasswordResetOTP(phone, otp)` → POST /auth/forgot-password/verify-otp
9. `resetPasswordWithOTP()` → POST /auth/forgot-password/reset
10. `connectTelegram(chatId)` → POST /auth/telegram/connect
11. `disconnectTelegram()` → POST /auth/telegram/disconnect

---

#### [src/services/adminAuthService.js](grumble-frontend/src/services/adminAuthService.js) - 105 lines

**Purpose:** Admin auth API calls

**Functions:**

1. `login(username, password)` → POST /admin/login
2. `logout()` → POST /admin/logout
3. `getCurrentAdmin()` - From localStorage
4. `getAdminToken()` - From localStorage
5. `fetchCurrentAdmin()` → GET /admin/me
6. `getAdminLogs()` → GET /admin/logs
7. `getAllAdmins()` → GET /admin/admins
8. `changePassword()` → POST /admin/change-password

---

#### [src/services/adminApi.js](grumble-frontend/src/services/adminApi.js)

**Purpose:** HTTP client for admin endpoints (separate from user api.js)

**What It Does:**

- Similar to api.js but adds admin token from localStorage
- Uses same base URL

---

#### [src/services/adminDashboardService.js](grumble-frontend/src/services/adminDashboardService.js)

**Purpose:** Dashboard analytics API calls

**Functions:**

- `getStats()` → GET /admin/dashboard/stats
- `getUserGrowth(months)` → GET /admin/dashboard/growth
- `getEngagementMetrics()` → GET /admin/dashboard/engagement
- `getStreakStats()` → GET /admin/dashboard/streaks
- `getTopUsers(limit)` → GET /admin/dashboard/top-users

---

#### [src/services/adminUserService.js](grumble-frontend/src/services/adminUserService.js)

**Functions:**

- `getUsers(filters)` → GET /admin/users
- `getUserDetails(id)` → GET /admin/users/:id
- `freezeUser(id, reason)` → POST /admin/users/:id/freeze
- `unfreezeUser(id)` → POST /admin/users/:id/unfreeze
- `deleteUser(id)` → DELETE /admin/users/:id

---

#### [src/services/adminPostService.js](grumble-frontend/src/services/adminPostService.js)

**Functions:**

- `getPosts(filters)` → GET /admin/posts
- `getPostDetails(id)` → GET /admin/posts/:id
- `removePost(id, reason)` → DELETE /admin/posts/:id
- `removeComment(postId, commentId)` → DELETE /admin/posts/:id/comments/:commentId

---

#### [src/services/adminReportService.js](grumble-frontend/src/services/adminReportService.js)

**Functions:**

- `getReports(filters)` → GET /admin/reports
- `getReportDetails(id)` → GET /admin/reports/:id
- `approveReport(id, action)` → POST /admin/reports/:id/approve
- `rejectReport(id, notes)` → POST /admin/reports/:id/reject

---

#### [src/services/adminFAQService.js](grumble-frontend/src/services/adminFAQService.js)

**Functions:**

- `getFAQs()` → GET /admin/faqs
- `createFAQ(question, answer)` → POST /admin/faqs
- `updateFAQ(id, question, answer)` → PUT /admin/faqs/:id
- `deleteFAQ(id)` → DELETE /admin/faqs/:id

---

### **Utilities & Hooks**

#### [src/utils/constants.js](grumble-frontend/src/utils/constants.js) - 60 lines

**Purpose:** App-wide constants

**Contains:**

- `CUISINE_CATEGORIES` - Array of food types (Western, Japanese, etc)
- `REPORT_REASONS` - Reasons for reporting content
- `ROUTES` - Route constants (prevents typos)
- `SINGAPORE_REGIONS` - Geographic regions by area
- `PRICE_RANGES` - Price filter options ($0-$10, etc)
- `OCCASIONS` - Dining occasions (Date Night, etc)

---

#### [src/utils/validation.js](grumble-frontend/src/utils/validation.js) - 50 lines

**Purpose:** Form validation functions

**Functions:**

1. `validatePassword(password)` - Checks:
   - Min 8 chars
   - 1+ uppercase, lowercase, number, special char
   - Returns error message or null

2. `validatePhoneNumber(phone)` - Validates Singapore format
   - Must be 8 digits starting with 8 or 9
   - Uses regex: `/^[89]\d{7}$/`

3. `validateUsername(username)` - Validates username
   - Min 3 chars
   - Only alphanumeric + underscore

---

#### [src/hooks/useContactPermission.js](grumble-frontend/src/hooks/useContactPermission.js)

**Purpose:** Request contact list permission (mobile)

**Functions:**

- `requestContactPermission()` - Ask user for contacts
- Returns status: 'granted', 'denied', 'prompt'

---

### **Pages (Screen Components)**

#### **Auth Pages**

##### [src/pages/auth/Login.jsx](grumble-frontend/src/pages/auth/Login.jsx) - 149 lines

**Purpose:** User login page

**Features:**

- Form inputs: username, password
- Form validation
- Shows error messages
- Loading state while submitting
- "Forgot password?" link
- "Sign up" link for new users
- Uses useAuth hook to call login()

---

##### [src/pages/auth/Registration.jsx](grumble-frontend/src/pages/auth/Registration.jsx) - 189 lines

**Purpose:** User signup page

**Features:**

- Form inputs: phone, username, password, confirm password
- All validation rules applied
- Request contact permission after signup
- Links to login page
- Uses useAuth hook

---

##### [src/pages/auth/ForgotPassword.jsx](grumble-frontend/src/pages/auth/ForgotPassword.jsx)

**Purpose:** Password reset flow

**Steps:**

1. Enter phone number
2. Receive OTP (console or Telegram)
3. Enter OTP code
4. Enter new password
5. Confirm reset

---

##### [src/pages/auth/OnboardingSurvey.jsx](grumble-frontend/src/pages/auth/OnboardingSurvey.jsx)

**Purpose:** Post-signup preferences survey

**Collects:** Dietary preferences, favorite cuisines, etc

---

#### **Main App Pages**

##### [src/pages/Explore.jsx](grumble-frontend/src/pages/Explore.jsx) - 56 lines

**Purpose:** Feed of food posts

**Features:**

- Tab bar: "For You", "Friends", "My posts"
- Grid of post cards (using mock data currently)
- "Upload New" button
- Currently uses mock data - **NEEDS BACKEND INTEGRATION**

---

##### [src/pages/FindSpots.jsx](grumble-frontend/src/pages/FindSpots.jsx) - 206 lines

**Purpose:** Restaurant search & discovery

**Features:**

- Search bar
- Filters: location, cuisine, price range, occasion
- Restaurant card list (mock data)
- Reset filters button
- Click restaurant to see details
- Currently uses mock data - **NEEDS BACKEND INTEGRATION**

---

##### [src/pages/FoodMap.jsx](grumble-frontend/src/pages/FoodMap.jsx) - 269 lines

**Purpose:** Interactive map of food places

**Features:**

- Leaflet map (CartoDB tiles)
- Tab bar: "Self", "Friends", "Saved"
- Custom pin markers with user avatars
- Click pin to select
- "Add new spot" modal (placeholder)
- Currently uses mock data - **NEEDS REAL API DATA**

---

##### [src/pages/Chats.jsx](grumble-frontend/src/pages/Chats.jsx) - 99 lines

**Purpose:** Messaging interface

**Features:**

- Chat list (left side)
- Chat window (right side)
- Search conversations
- Create group modal
- Mock data for chats/friends

---

##### [src/pages/Profile.jsx](grumble-frontend/src/pages/Profile.jsx) - 182 lines

**Purpose:** User profile & settings

**Features:**

- Display user info
- Show Telegram connection status
- Connect/disconnect Telegram
- Logout button
- Edit profile (partial)

---

#### **Admin Pages**

##### [src/pages/admin/AdminLogin.jsx](grumble-frontend/src/pages/admin/AdminLogin.jsx)

**Purpose:** Admin panel login

**Features:**

- Separate from user login
- Form: username, password
- Rate-limited (5 attempts/15min)

---

##### [src/pages/admin/Dashboard.jsx](grumble-frontend/src/pages/admin/Dashboard.jsx) - 238 lines

**Purpose:** Admin dashboard home

**Shows:**

- Stats cards: users, posts, reports
- Growth chart (12 months)
- Engagement metrics
- Top users table
- Refresh button

---

##### [src/pages/admin/UserManagement.jsx](grumble-frontend/src/pages/admin/UserManagement.jsx)

**Purpose:** Admin user list

**Features:**

- Table of users with filters
- Search by name/phone
- Status filter (active/frozen/deleted)
- Pagination
- Click user for details modal
- Actions: freeze, delete

---

##### [src/pages/admin/PostManagement.jsx](grumble-frontend/src/pages/admin/PostManagement.jsx)

**Purpose:** Moderate user posts

**Features:**

- List of posts
- Click to see details
- Remove post button
- Remove individual comments

---

##### [src/pages/admin/ReportReview.jsx](grumble-frontend/src/pages/admin/ReportReview.jsx)

**Purpose:** Handle user reports

**Features:**

- List of reports (pending/resolved)
- View report details
- Approve (remove content) or reject

---

##### [src/pages/admin/FAQManagement.jsx](grumble-frontend/src/pages/admin/FAQManagement.jsx)

**Purpose:** Manage FAQ section

**Features:**

- List FAQs
- Create FAQ
- Edit FAQ
- Delete FAQ

---

##### [src/pages/admin/ActivityLogs.jsx](grumble-frontend/src/pages/admin/ActivityLogs.jsx)

**Purpose:** Admin audit trail

**Features:**

- Logs of all admin actions
- Filter by admin/action type
- Pagination

---

##### [src/pages/admin/Settings.jsx](grumble-frontend/src/pages/admin/Settings.jsx)

**Purpose:** Admin panel settings

**Features:**

- Admin profile
- Change password
- System settings

---

### **Components**

#### **Layout Components**

##### [src/components/layout/MainLayout.jsx](grumble-frontend/src/components/layout/MainLayout.jsx) - 20 lines

**Purpose:** Main app layout wrapper

**What It Does:**

- Renders sidebar + main content area
- Sidebar can collapse (state managed)
- Outlet for nested routes

---

##### [src/components/layout/Sidebar.jsx](grumble-frontend/src/components/layout/Sidebar.jsx) - 70 lines

**Purpose:** Navigation sidebar

**Features:**

- Menu items with icons (Home, Search, Globe, MessageCircle, User)
- Active state highlighting
- Collapse button
- Routes to each page
- Logout button

---

#### **Route Protection**

##### [src/components/ProtectedRoute.jsx](grumble-frontend/src/components/ProtectedRoute.jsx) - 40 lines

**Purpose:** Protect user routes

**What It Does:**

- Checks if user authenticated
- Shows loading state
- Redirects to /login if not auth
- Has DEV_MODE flag to bypass (for development)

---

##### [src/components/admin/AdminProtectedRoute.jsx](grumble-frontend/src/components/admin/AdminProtectedRoute.jsx)

**Purpose:** Protect admin routes

**Same as ProtectedRoute but checks admin auth**

---

#### **Common Components**

##### [src/components/common/Button.jsx](grumble-frontend/src/components/common/Button.jsx)

**Purpose:** Reusable button component

**Props:** text, onClick, type, disabled, loading

---

##### [src/components/common/Input.jsx](grumble-frontend/src/components/common/Input.jsx)

**Purpose:** Reusable input field

**Props:** label, type, name, value, onChange, error, placeholder

---

##### [src/components/common/TelegramConnectionModal.jsx](grumble-frontend/src/components/common/TelegramConnectionModal.jsx)

**Purpose:** Connect user's Telegram

**Flow:**

1. Show instructions to message bot
2. User sends /start to @BotName
3. Copy chat ID from response
4. Paste into modal
5. Save connection

---

#### **Explore Page Components**

##### [src/components/explorePage/FoodPostCard.jsx](grumble-frontend/src/components/explorePage/FoodPostCard.jsx)

**Purpose:** Card displaying food post

**Shows:** User avatar, restaurant name, rating, photo, likes/comments

---

##### [src/components/explorePage/PostDetailModal.jsx](grumble-frontend/src/components/explorePage/PostDetailModal.jsx)

**Purpose:** Full post view in modal

---

##### [src/components/explorePage/mockData.js](grumble-frontend/src/components/explorePage/mockData.js)

**Purpose:** Test data for Explore page

**Contains:** Array of mock posts

---

#### **Find Spots Components**

##### [src/components/findSpotsPage/RestaurantCard.jsx](grumble-frontend/src/components/findSpotsPage/RestaurantCard.jsx)

**Purpose:** Restaurant card in list

---

##### [src/components/findSpotsPage/RestaurantDetailModal.jsx](grumble-frontend/src/components/findSpotsPage/RestaurantDetailModal.jsx)

**Purpose:** Full restaurant details modal

---

##### [src/components/findSpotsPage/mockData.js](grumble-frontend/src/components/findSpotsPage/mockData.js)

**Purpose:** Test restaurant data

---

#### **Food Map Components**

##### [src/components/foodMapPage/mockData.js](grumble-frontend/src/components/foodMapPage/mockData.js)

**Purpose:** Mock pins for map

---

#### **Chat Components**

##### [src/components/chatsPage/ChatList.jsx](grumble-frontend/src/components/chatsPage/ChatList.jsx)

**Purpose:** List of conversations

---

##### [src/components/chatsPage/ChatWindow.jsx](grumble-frontend/src/components/chatsPage/ChatWindow.jsx)

**Purpose:** Active conversation view

---

##### [src/components/chatsPage/ChatMessage.jsx](grumble-frontend/src/components/chatsPage/ChatMessage.jsx)

**Purpose:** Individual message bubble

---

##### [src/components/chatsPage/CreateGroupModal.jsx](grumble-frontend/src/components/chatsPage/CreateGroupModal.jsx)

**Purpose:** Form to create group chat

---

##### [src/components/chatsPage/Avatar.jsx](grumble-frontend/src/components/chatsPage/Avatar.jsx)

**Purpose:** User avatar display

---

##### [src/components/chatsPage/FoodSuggestion.jsx](grumble-frontend/src/components/chatsPage/FoodSuggestion.jsx)

**Purpose:** Suggest restaurant in chat

---

##### [src/components/chatsPage/Poll.jsx](grumble-frontend/src/components/chatsPage/Poll.jsx)

**Purpose:** Restaurant voting poll in chat

---

##### [src/components/chatsPage/Spinwheel.jsx](grumble-frontend/src/components/chatsPage/Spinwheel.jsx)

**Purpose:** Spin wheel to pick random restaurant

---

##### [src/components/chatsPage/mockData.js](grumble-frontend/src/components/chatsPage/mockData.js)

**Purpose:** Mock chats and friends data

---

#### **Admin Components**

##### [src/components/admin/AdminLayout.jsx](grumble-frontend/src/components/admin/AdminLayout.jsx) - 141 lines

**Purpose:** Admin panel layout

**Features:**

- Sidebar with navigation
- User profile dropdown
- Active route highlighting
- Logout button

---

##### [src/components/admin/StatsCard.jsx](grumble-frontend/src/components/admin/StatsCard.jsx)

**Purpose:** Metric card on dashboard

**Shows:** Label, value, percentage change

---

##### [src/components/admin/MetricsChart.jsx](grumble-frontend/src/components/admin/MetricsChart.jsx)

**Purpose:** Recharts line/bar chart

---

##### [src/components/admin/UserTable.jsx](grumble-frontend/src/components/admin/UserTable.jsx)

**Purpose:** User list table

**Columns:** ID, Username, Phone, Status, Created Date

---

##### [src/components/admin/UserDetailModal.jsx](grumble-frontend/src/components/admin/UserDetailModal.jsx)

**Purpose:** User details popup

**Shows:** Profile, stats, recent posts, actions

---

##### [src/components/admin/FreezeUserModal.jsx](grumble-frontend/src/components/admin/FreezeUserModal.jsx)

**Purpose:** Freeze user form

**Fields:** Reason for freezing

---

##### [src/components/admin/TopUsersTable.jsx](grumble-frontend/src/components/admin/TopUsersTable.jsx)

**Purpose:** Most active users ranking

---

##### [src/components/admin/PostCard.jsx](grumble-frontend/src/components/admin/PostCard.jsx)

**Purpose:** Post preview in moderation

---

##### [src/components/admin/PostDetailModal.jsx](grumble-frontend/src/components/admin/PostDetailModal.jsx)

**Purpose:** Full post + comments in modal

---

##### [src/components/admin/ReportCard.jsx](grumble-frontend/src/components/admin/ReportCard.jsx)

**Purpose:** Report summary card

---

##### [src/components/admin/ReportDetailModal.jsx](grumble-frontend/src/components/admin/ReportDetailModal.jsx)

**Purpose:** Full report details + actions

---

##### [src/components/admin/FAQList.jsx](grumble-frontend/src/components/admin/FAQList.jsx)

**Purpose:** List of FAQs

---

##### [src/components/admin/FAQEditor.jsx](grumble-frontend/src/components/admin/FAQEditor.jsx)

**Purpose:** Create/edit FAQ form

---

##### [src/components/admin/ActivityLogTable.jsx](grumble-frontend/src/components/admin/ActivityLogTable.jsx)

**Purpose:** Admin action history

**Columns:** Admin, Action, Target, Timestamp

---

##### [src/components/admin/Pagination.jsx](grumble-frontend/src/components/admin/Pagination.jsx)

**Purpose:** Pagination controls

---

### **Styling**

#### [src/index.css](grumble-frontend/src/index.css)

**Purpose:** Global styles

**Contains:**

- CSS custom properties (colors, fonts)
- Global element styles
- Tailwind directives

---

#### [src/styles/index.css](grumble-frontend/src/styles/index.css)

**Purpose:** Additional component styles

---

### **Other Files**

#### [eslint.config.js](grumble-frontend/eslint.config.js) - 25 lines

**Purpose:** Code linting configuration

**Settings:**

- Uses ESLint recommended config
- React refresh plugin
- React hooks rules

---

#### [postcss.config.js](grumble-frontend/postcss.config.js) - 20 lines

**Purpose:** PostCSS configuration (for Tailwind)

---

---

## 🛠️ KEY TECHNOLOGIES

| Tech             | Version | Purpose               |
| ---------------- | ------- | --------------------- |
| **Express.js**   | 5.2.1   | Backend web framework |
| **PostgreSQL**   | 15+     | Database              |
| **PostGIS**      | 3+      | Geospatial queries    |
| **React**        | 19      | Frontend UI           |
| **Vite**         | 7.3     | Frontend build tool   |
| **Tailwind CSS** | 4.1     | Styling               |
| **Leaflet**      | 1.9     | Interactive maps      |
| **Axios**        | 1.13    | HTTP requests         |
| **JWT**          | 9.0     | Authentication tokens |
| **Bcrypt**       | 5-6     | Password hashing      |
| **Recharts**     | 2.10    | Data visualization    |
| **React Router** | 7.13    | Client-side routing   |

---

## 🔗 INTEGRATION POINTS

**🚨 CRITICAL ISSUES:**

1. **Port mismatch** - Frontend expects `:5001`, backend on `:3000`
2. **Mock data only** - Explore, FindSpots, FoodMap use hardcoded mock data
3. **No posts endpoints** - Backend has table but no API endpoints
4. **No messaging** - Chat component uses mock data, no real-time backend

**✅ WHAT WORKS:**

- Authentication (login/register/OTP)
- Food place database & OSM sync
- Admin panel infrastructure
- Database schema complete

---

End of File Breakdown
