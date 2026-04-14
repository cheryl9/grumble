# Grumble Project - Quick Reference Guide

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  Port: 5173 (Vite)          ❌ ISSUE: API calls use port 5001   │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                  Components:           Services:         │
│  • Explore              • MainLayout          • api.js           │
│  • FindSpots            • Sidebar             • authService.js   │
│  • FoodMap              • ProtectedRoute      • adminApi.js      │
│  • Chats                • Post/Restaurant     • admin*.js        │
│  • Profile              • Admin modules       • (admin services) │
│  • Auth pages           • Modals              │                  │
│                                               │                  │
│  State: AuthContext, AdminAuthContext        │                  │
│  ❌ Using MOCK DATA:                         │                  │
│     - Explore posts (mockData.js)            │                  │
│     - FindSpots restaurants                  │                  │
│     - FoodMap pins                           │                  │
│     - Chat messages                          │                  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/Axios
                           ❌ :5001 (WRONG!)
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Express)                          │
│                      Port: 3000 ✅ CORRECT                       │
├─────────────────────────────────────────────────────────────────┤
│                    API Routes (Endpoints)                        │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ /api/auth/*                  /api/food-places/*           │  │
│ │ • register                   • GET /  (search)             │  │
│ │ • login                      • GET /:id                    │  │
│ │ • forgot-password/send-otp                                │  │
│ │ • forgot-password/verify-otp └─────────────────────────────┘  │
│ │ • forgot-password/reset                                       │
│ │ • telegram/connect          /api/admin/*                      │
│ │ • telegram/disconnect       • /login, /me, /logout             │
│ │                             • /dashboard/stats                 │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Controllers (Business Logic)                                    │
│  ├── authController      → users, passwords, telegram           │
│  ├── foodPlaceController → search restaurants                    │
│  └── admin/              → dashboard, users, posts, reports, faq │
│                                                                  │
│  Repositories (Data Layer)                                       │
│  ├── authRepository      → user queries                          │
│  ├── foodPlaceRepository → food place queries                    │
│  └── admin/              → specific data access                  │
│                                                                  │
│  Services (External Integrations)                                │
│  ├── osmService.js       → Fetch from OpenStreetMap API         │
│  ├── syncService.js      → Sync OSM to PostgreSQL               │
│  └── telegramService.js  → Send OTP/notifications               │
│                                                                  │
│  Middleware                                                      │
│  ├── authMiddleware      → Verify user JWT                       │
│  ├── adminAuthMiddleware → Verify admin JWT                      │
│  ├── rateLimitMiddleware → Prevent brute force                   │
│  └── errorHandler        → Catch all errors                      │
└─────────────────────────────────────────────────────────────────┘
                              ↕ SQL Queries
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                            │
│                    (with PostGIS extension)                      │
├─────────────────────────────────────────────────────────────────┤
│  Tables:                                                         │
│  ├── food_places        (from OSM, with geospatial data)        │
│  ├── users              (phone, username, telegram_id)          │
│  ├── password_reset_otps (for password recovery)                │
│  ├── admins             (admin accounts, separate from users)   │
│  ├── admin_logs         (audit trail)                           │
│  ├── posts              ⚠️ TABLE EXISTS BUT NO API ENDPOINTS!   │
│  ├── comments           ⚠️ TABLE EXISTS BUT NOT WIRED UP        │
│  ├── likes              ⚠️ TABLE EXISTS BUT NOT WIRED UP        │
│  ├── reports            ⚠️ TABLE EXISTS BUT NOT WIRED UP        │
│  ├── friends            (not yet in DB - would need table)      │
│  └── messages           (not yet in DB - would need table)      │
│                                                                  │
│  PostGIS Spatial Index: food_places.geom                        │
│  → Enables proximity searches (find nearby restaurants)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 FILE ORGANIZATION

```
grumble/
├── grumble-backend/
│   ├── config/db.js                    ← PostgreSQL connection
│   ├── app.js                          ← Express setup
│   ├── server.js                       ← Entry point
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js           ← Verify JWT
│   │   ├── adminAuthMiddleware.js      ← Admin JWT
│   │   ├── rateLimitMiddleware.js      ← Login protection
│   │   └── errorHandler.js             ← Error catching
│   │
│   ├── controllers/
│   │   ├── authController.js           ← Register, login, OTP
│   │   ├── foodPlaceController.js      ← Search restaurants
│   │   └── admin/
│   │       ├── adminAuthController.js
│   │       ├── dashboardController.js
│   │       ├── userManagementController.js
│   │       ├── postManagementController.js
│   │       ├── reportController.js
│   │       └── faqController.js
│   │
│   ├── repositories/
│   │   ├── authRepository.js           ← User queries
│   │   ├── foodPlaceRepository.js      ← Food queries
│   │   └── admin/
│   │       ├── adminRepository.js
│   │       ├── userManagementRepository.js
│   │       ├── postManagementRepository.js
│   │       ├── reportRepository.js
│   │       ├── faqRepository.js
│   │       └── analyticsRepository.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js               ← /api/auth/*
│   │   ├── foodPlaceRoutes.js          ← /api/food-places/*
│   │   └── adminRoutes.js              ← /api/admin/*
│   │
│   ├── services/
│   │   ├── osmService.js               ← OpenStreetMap API
│   │   ├── syncService.js              ← OSM → PostgreSQL
│   │   └── telegramService.js          ← Telegram Bot API
│   │
│   ├── scripts/
│   │   ├── syncOSM.js                  ← Import OSM data
│   │   ├── createAdmin.js              ← Create admin account
│   │   ├── telegramBotHelper.js
│   │   └── clearTelegramWebhook.js
│   │
│   ├── migrations/
│   │   ├── 001_create_food_places.sql  ← PostGIS + food table
│   │   ├── 002_create_users.sql        ← Users table
│   │   ├── 003_add_telegram_fields.sql ← Telegram integration
│   │   └── 004_create_admin_tables.sql ← Admin + posts + reports
│   │
│   └── package.json
│
└── grumble-frontend/
    ├── src/
    │   ├── main.jsx                    ← React entry point
    │   ├── router.jsx                  ← Route configuration
    │   ├── index.css                   ← Global styles
    │   │
    │   ├── context/
    │   │   ├── AuthContext.jsx         ← User auth state
    │   │   └── AdminAuthContext.jsx    ← Admin auth state
    │   │
    │   ├── services/
    │   │   ├── api.js                  ← HTTP client (user)
    │   │   ├── authService.js          ← User auth API calls
    │   │   ├── adminApi.js             ← HTTP client (admin)
    │   │   ├── adminAuthService.js     ← Admin auth calls
    │   │   ├── adminDashboardService.js
    │   │   ├── adminUserService.js
    │   │   ├── adminPostService.js
    │   │   ├── adminReportService.js
    │   │   └── adminFAQService.js
    │   │
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   ├── Registration.jsx
    │   │   │   ├── ForgotPassword.jsx
    │   │   │   └── OnboardingSurvey.jsx
    │   │   ├── Explore.jsx             ← ❌ MOCK DATA
    │   │   ├── FindSpots.jsx           ← ❌ MOCK DATA
    │   │   ├── FoodMap.jsx             ← ❌ MOCK DATA
    │   │   ├── Chats.jsx               ← ❌ MOCK DATA
    │   │   ├── Profile.jsx
    │   │   └── admin/
    │   │       ├── AdminLogin.jsx
    │   │       ├── Dashboard.jsx
    │   │       ├── UserManagement.jsx
    │   │       ├── PostManagement.jsx
    │   │       ├── ReportReview.jsx
    │   │       ├── FAQManagement.jsx
    │   │       ├── ActivityLogs.jsx
    │   │       └── Settings.jsx
    │   │
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── MainLayout.jsx
    │   │   │   └── Sidebar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminLayout.jsx
    │   │   │   ├── AdminProtectedRoute.jsx
    │   │   │   ├── StatsCard.jsx
    │   │   │   ├── MetricsChart.jsx
    │   │   │   ├── UserTable.jsx
    │   │   │   ├── PostCard.jsx
    │   │   │   ├── ReportCard.jsx
    │   │   │   ├── FAQList.jsx
    │   │   │   ├── FAQEditor.jsx
    │   │   │   └── (40+ more admin components)
    │   │   ├── explorePage/
    │   │   │   ├── FoodPostCard.jsx
    │   │   │   ├── PostDetailModal.jsx
    │   │   │   └── mockData.js         ← ❌ HARD CODED
    │   │   ├── findSpotsPage/
    │   │   │   ├── RestaurantCard.jsx
    │   │   │   └── mockData.js         ← ❌ HARD CODED
    │   │   ├── foodMapPage/
    │   │   │   └── mockData.js         ← ❌ HARD CODED
    │   │   ├── chatsPage/
    │   │   │   ├── ChatList.jsx
    │   │   │   ├── ChatWindow.jsx
    │   │   │   ├── ChatMessage.jsx
    │   │   │   ├── Spinwheel.jsx
    │   │   │   ├── Poll.jsx
    │   │   │   └── mockData.js         ← ❌ HARD CODED
    │   │   └── common/
    │   │       ├── Button.jsx
    │   │       ├── Input.jsx
    │   │       └── TelegramConnectionModal.jsx
    │   │
    │   ├── utils/
    │   │   ├── constants.js            ← Cuisines, regions, routes
    │   │   └── validation.js           ← Form validation rules
    │   │
    │   └── hooks/
    │       └── useContactPermission.js
    │
    ├── vite.config.js
    ├── tailwind.config.js
    ├── eslint.config.js
    ├── postcss.config.js
    ├── index.html
    └── package.json
```

---

## 🔴 CRITICAL ISSUES TO FIX

### 1. **Port Mismatch** 🚨

- **File:** `src/services/api.js`
- **Problem:** `baseURL: 'http://localhost:5001/api'` but backend runs on `:3000`
- **Fix:** Change to `'http://localhost:3000/api'`

### 2. **Mock Data Everywhere** 🎭

Pages using hardcoded mock instead of API:

- `Explore.jsx` - Uses `mockPosts` from explorePage/mockData.js
- `FindSpots.jsx` - Uses `mockRestaurants` from findSpotsPage/mockData.js
- `FoodMap.jsx` - Uses `mockPins` from foodMapPage/mockData.js
- `Chats.jsx` - Uses `mockChats` from chatsPage/mockData.js

**Need to:** Replace with API calls to backend endpoints

### 3. **Missing API Endpoints**

Database tables exist but NO endpoints:

- **Posts**: Table exists, controllers don't exist
- **Comments**: Table exists, no API
- **Likes**: Table exists, no API
- **Messages**: Table doesn't exist
- **Friends**: Table doesn't exist
- **Friendship**: Table doesn't exist

**Need to:** Create controllers + routes for these

### 4. **No Real-Time Chat** 💬

Chats use mock data with no backend:

- No WebSocket or polling
- No message persistence
- No user-to-user messaging

**Need to:** Build chat infrastructure (WebSocket or polling)

### 5. **No Image Upload** 📷

- Food posts need images
- User avatars need storage
- No file handling in backend

**Need to:** Add file upload service (S3, Firebase, or local storage)

---

## ✅ WHAT'S WORKING

| Feature              | Status | Notes                               |
| -------------------- | ------ | ----------------------------------- |
| User Registration    | ✅     | Phone + username + password         |
| User Login           | ✅     | JWT tokens, 30 day expiry           |
| Password Reset       | ✅     | OTP-based via Telegram/console      |
| Telegram Integration | ✅     | Connect/disconnect, OTP delivery    |
| Admin Login          | ✅     | Separate JWT, 4 hour expiry         |
| OSM Data Import      | ✅     | Food places sync from OpenStreetMap |
| Food Search          | ✅     | By category, cuisine, geolocation   |
| Admin Dashboard      | ✅     | Stats, charts, metrics (needs data) |
| User Management      | ✅     | List, freeze, delete (needs wiring) |
| Post Moderation      | ✅     | Infrastructure done, needs wiring   |
| Report System        | ✅     | Infrastructure done, needs wiring   |
| FAQ Management       | ✅     | Full CRUD available                 |

---

## 🎯 NEXT STEPS (In Order)

1. **Fix port** - Change frontend API URL to :3000
2. **Test OSM sync** - Run `node scripts/syncOSM.js` to populate database
3. **Create post endpoints** - Build `/api/posts` CRUD
4. **Create comment endpoints** - Build `/api/posts/:id/comments`
5. **Create message endpoints** - Build `/api/messages` for chats
6. **Wire frontend** - Replace mock data with real API calls
7. **Add image upload** - Handle file uploads for posts
8. **Real-time chat** - Implement WebSocket or polling for messages

---

## 🗂️ How To Use This Guide

- **Understanding the flow?** → Read the Architecture Diagram
- **Finding a specific file?** → Check File Organization
- **Need to add a feature?** → Check Critical Issues + Next Steps
- **Want file details?** → See the full breakdown in PROJECT_FILE_BREAKDOWN.md
- **Debugging something?** → Check Database Schema in 004_create_admin_tables.sql

---

**Last Updated:** April 13, 2026  
**Project:** Grumble - Food Discovery Social App for Singapore
