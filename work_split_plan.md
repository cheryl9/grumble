GRUMBLE v2 - WORK SPLIT PLAN (4 Members)
==========================================

Below is the breakdown of remaining work split across 4 members. Each member's files are isolated so you should not have merge conflicts if everyone sticks to their assigned files. Coordinate on shared files (like router.jsx and app.js) by having one person merge those changes at the end.


========================================
MEMBER 1 - Explore Page + Find Spots Polish
========================================

WHAT IS MISSING AND WHY:
The Explore page was recently wired to the real API, which is great. However three key post interaction buttons are still not functional. The Comment "Post" button in the post detail modal has no click handler and no state for the input field, so users cannot submit comments even though the backend API for comments already exists and works. The Save button on each post card only toggles a local React state variable and never calls the backend API, meaning saves are lost on page refresh and never appear on the Food Map saved tab. The Share button has no click handler at all. Additionally, users currently have no way to report inappropriate posts from the frontend even though the backend admin panel can manage reports and the reports database table exists. On the Find Spots page, the search bar has a CSS conflict where the placeholder text is white on a light background making it invisible, and the restaurant detail modal has dead links for outlets and menu.

TASKS:

1) Wire the Comment Post button in PostDetailModal. Add a state variable for the comment input text, add an onChange handler to the input field, and add an onClick handler to the Post button that calls POST /api/posts/{id}/comments with the comment content. After a successful response, append the new comment to the displayed list and call the onCommentAdded callback so the parent updates the comment count. Clear the input after posting.

2) Wire the Save button in FoodPostCard. Replace the local-only isSaved state with a call to POST /api/posts/{id}/save when the user clicks the bookmark icon. Use the saved_by_me field from the API response to set the initial state. Use optimistic UI updates similar to how the Like button already works. Add an onSave callback prop so the parent Explore component can track saves.

3) Wire the Share button in FoodPostCard. When clicked, use navigator.clipboard.writeText() to copy a shareable link like "http://localhost:5173/explore?post={id}" to the clipboard. Show a brief toast or tooltip saying "Link copied!" for 2 seconds.

4) Build a Report Post modal component. Create a new ReportPostModal.jsx file in the explorePage components folder. It should display the list of report reasons from constants.js (the REPORT_REASONS array already exists). When the user selects a reason and submits, call a new backend endpoint. For the backend, add a POST /api/posts/{id}/report route in postRoutes.js that inserts into the existing reports table with the reporter's user ID, the post ID, and the selected reason.

5) Fix the Find Spots search bar CSS. In index.css, the search-input class is defined twice with conflicting styles. The second definition (around line 480) sets a light gray background but the placeholder color is still white from the first definition. Consolidate these into one definition with a coral/orange background and white placeholder, OR a light background with gray placeholder. Pick one and remove the duplicate.

6) Improve the RestaurantDetailModal. The "View all available outlets" and menu PDF links are currently href="#" which go nowhere. For outlets, display the outlets array from the restaurant data as a simple list instead of a dead link. For the menu link, either remove it or replace it with a placeholder message saying "Menu not available" since there is no real menu data from OSM.

FILES YOU WILL TOUCH:
Frontend:
- grumble-frontend/src/components/explorePage/PostDetailModal.jsx (add comment functionality)
- grumble-frontend/src/components/explorePage/FoodPostCard.jsx (wire save button, wire share button)
- grumble-frontend/src/components/explorePage/ReportPostModal.jsx (NEW FILE - report modal)
- grumble-frontend/src/components/findSpotsPage/RestaurantDetailModal.jsx (fix dead links)
- grumble-frontend/src/index.css (fix search bar CSS conflict)
- grumble-frontend/src/pages/Explore.jsx (add onSave handler, minor)

Backend:
- grumble-backend/routes/postRoutes.js (add POST /:id/report route)
- grumble-backend/controllers/postsController.js (add reportPost function)
- grumble-backend/repositories/postsRepository.js (add createReport function)


========================================
MEMBER 2 - Profile Page + Gamification + Settings
========================================

WHAT IS MISSING AND WHY:
The Profile page is currently very basic. It only shows the username, phone number, join date, and Telegram connection. According to the spec, the profile page should be the hub of the user's identity on the app, showing a profile icon, a dashboard with counts (friends, posts, liked, saved), streak tracking with a growing icon, achievements that unlock new profile icons, and sections for editing profile info, sharing your profile link, and accessing help and settings. The onboarding survey lets users pick cuisine preferences but those preferences are never saved to the database (it just console.logs them and navigates away). Without saving preferences, the "For You" feed cannot personalize recommendations. There is also no user-facing FAQ or help page even though the admin panel has full FAQ management.

TASKS:

1) Redesign and rebuild the Profile page. Add a profile icon section at the top using the Grumble logo as the default avatar. Below that, add a dashboard section showing four stat cards: number of friends, number of posts, number of liked posts, and number of saved posts. Each stat card should have a "View all" button. For now the friends count can show 0 since the friend system is being built by Member 3. For posts, liked, and saved counts, create new backend endpoints that return these counts for the current user.

2) Build the Edit Profile functionality. Create a new EditProfileModal or EditProfile section where users can update their username (with duplicate check against the server), change their password (with current password verification and confirm new password), and update their phone number. This requires a new backend endpoint like PUT /api/auth/profile that validates and updates the user record.

3) Save onboarding cuisine preferences to the database. Create a new user_preferences table in a new migration file with columns for user_id and a JSON or array column for selected cuisines. Update the OnboardingSurvey page to call a new backend endpoint POST /api/auth/preferences that saves the selected cuisines. Later, the "For You" feed can query these preferences to prioritize posts from matching cuisines.

4) Implement streak tracking. The user_streaks table already exists in the database. Add logic in the backend so that when a user creates a post, the system checks their last post date. If it was yesterday, increment current_streak. If it was today, do nothing. If it was more than one day ago, reset current_streak to 1. Update longest_streak if current exceeds it. Display the current streak on the profile page with a visual indicator that grows or changes based on streak length.

5) Build the Help and Support section. Create a simple HelpSupport page or section accessible from the profile page. It should fetch and display the FAQs that admins have created via GET /api/admin/faqs (you may need to create a public non-admin endpoint for this). Display them in an accordion/expandable format. Include a "Report an Issue" link or form.

6) Add a Share Profile button that copies a profile link to the clipboard, similar to how LinkedIn works.

FILES YOU WILL TOUCH:
Frontend:
- grumble-frontend/src/pages/Profile.jsx (major rewrite)
- grumble-frontend/src/pages/auth/OnboardingSurvey.jsx (add API call to save preferences)
- grumble-frontend/src/pages/HelpSupport.jsx (NEW FILE)
- grumble-frontend/src/components/profilePage/ (NEW FOLDER - EditProfileModal.jsx, StreakDisplay.jsx, ProfileDashboard.jsx, etc.)

Backend:
- grumble-backend/routes/authRoutes.js (add PUT /profile, POST /preferences endpoints)
- grumble-backend/controllers/authController.js (add updateProfile, savePreferences functions)
- grumble-backend/repositories/authRepository.js (add updateUser, savePreferences, getUserStats queries)
- grumble-backend/migrations/006_create_user_preferences.sql (NEW FILE)
- grumble-backend/routes/faqPublicRoutes.js (NEW FILE - public FAQ endpoint for users)

Router:
- grumble-frontend/src/router.jsx (add /help-support route - coordinate with others)


========================================
MEMBER 3 - Friend System
========================================

WHAT IS MISSING AND WHY:
The friend system is one of the biggest missing pieces. The friendships table already exists in the database (created in migration 004), but there are zero API routes, controllers, or repositories for managing friends. Users cannot send friend requests, accept or decline them, view their friends list, or remove friends. This also means the "Friends" tab on both the Explore page and Food Map page cannot show friends-only content. The backend currently falls back to showing the same "For You" content when the friends tab is selected because it has no way to know who the user's friends are. The Chat page also depends on knowing who the user's friends are for the "Friends" tab and for creating group chats. Building the friend system will unblock several features across the app.

TASKS:

1) Build the Friend System backend API. Create a complete set of routes for friend management using the existing friendships table. The endpoints needed are:
   - POST /api/friends/request (send a friend request, sets status to "pending")
   - POST /api/friends/accept/:id (accept a friend request, sets status to "accepted")
   - POST /api/friends/decline/:id (decline a friend request, deletes the row or sets status to "declined")
   - DELETE /api/friends/:id (remove an existing friend)
   - GET /api/friends (list all accepted friends for the current user)
   - GET /api/friends/requests (list all pending friend requests received by the current user)
   - GET /api/friends/search?username=xxx (search for users by username to send friend requests)
Create friendRoutes.js, friendsController.js, and friendsRepository.js files. Register the routes in app.js.

2) Build the Friends List frontend page. Create a new FriendsList page that displays all the user's accepted friends with their usernames and a "Remove" button for each. At the top, show a notification indicator for pending friend requests. Include a search bar to find users by username and send friend requests. Show pending outgoing requests with a "Pending" label.

3) Build the Friend Requests section. This can be a separate page or a section within FriendsList. Show incoming friend requests with Accept and Decline buttons. Show the requester's username and when the request was sent.

4) Update the Explore page's "Friends" tab backend query. In postsRepository.js, update the getFeedPosts function so that when tab is "friends", it queries posts from users who are in the friendships table with status "accepted" and the current user. This is the query that currently falls back to "foryou" behavior with a comment saying "friends tab requires a friends/follows table that doesn't exist yet". Now that the friend system exists, implement the real query using a JOIN or subquery on the friendships table.

5) Fix the Chat page Friends tab filter bug. In ChatList.jsx, the friends tab filter checks c.type === "friends" (plural) but the mock data uses c.type === "friend" (singular). Standardize this to "friend" in both the filter and the data. This is a quick fix but important for when the chat system goes live.

FILES YOU WILL TOUCH:
Frontend:
- grumble-frontend/src/pages/FriendsList.jsx (NEW FILE)
- grumble-frontend/src/components/friendsPage/ (NEW FOLDER - FriendCard.jsx, FriendRequestCard.jsx, AddFriendSearch.jsx)
- grumble-frontend/src/services/friendService.js (NEW FILE - API calls for friend operations)
- grumble-frontend/src/components/chatsPage/ChatList.jsx (fix "friends" vs "friend" filter bug, one line change)

Backend:
- grumble-backend/routes/friendRoutes.js (NEW FILE)
- grumble-backend/controllers/friendsController.js (NEW FILE)
- grumble-backend/repositories/friendsRepository.js (NEW FILE)
- grumble-backend/repositories/postsRepository.js (update friends tab query in getFeedPosts - coordinate with Member 1 who also touches this file for the report function. Decide who merges first.)
- grumble-backend/app.js (add friend routes mount - coordinate merge)

Router:
- grumble-frontend/src/router.jsx (add /friends route - coordinate with others)


========================================
MEMBER 4 - Chat System
========================================

WHAT IS MISSING AND WHY:
The chat system is currently 100% mock data with no backend infrastructure at all. There are no database tables for chat messages, no API routes for sending or receiving messages, no WebSocket server for real-time communication, and no way to create or manage group chats. The frontend UI components (ChatWindow, ChatList, ChatMessage, Poll, Spinwheel, FoodSuggestion, CreateGroupModal) are all built and functional with mock data, which is good because it means Member 4 mainly needs to build the backend and rewire the frontend to use real APIs instead of the mock arrays. The chat feature is core to the social aspect of Grumble since users need to coordinate food outings with friends.

TASKS:

1) Design and create the chat database schema. Create a new migration file with tables for:
   - chat_rooms: id, name, type (direct/group), created_by, created_at
   - chat_room_members: id, chat_room_id, user_id, joined_at
   - chat_messages: id, chat_room_id, sender_id, content, message_type (text/poll/food-suggestion/spin-wheel), metadata (JSONB for poll options, restaurant data, wheel options etc.), created_at
   The JSONB metadata column lets you store structured data for special message types without needing separate tables for polls, food suggestions, and spin wheels.

2) Build the Chat backend API. Create chatRoutes.js, chatController.js, and chatRepository.js. The endpoints needed are:
   - GET /api/chats (list all chat rooms the user belongs to, with last message preview)
   - POST /api/chats/group (create a new group chat with a name and list of member user IDs)
   - GET /api/chats/:roomId/messages (get messages for a specific chat room, with pagination)
   - POST /api/chats/:roomId/messages (send a message to a chat room)
   - POST /api/chats/direct/:userId (get or create a direct chat with another user)

3) Add WebSocket support for real-time messaging. Install socket.io on the backend. In server.js, attach the Socket.IO server to the existing HTTP server. When a user connects, authenticate them using their JWT token. Join them to Socket.IO rooms matching their chat_room_ids. When a message is sent via the API, also emit it via Socket.IO to all members of that room so messages appear instantly without polling.

4) Rewire the Chat frontend to use real APIs. Replace the mockChats import in Chats.jsx with an API call to GET /api/chats. Update ChatWindow.jsx to load messages from GET /api/chats/:roomId/messages instead of reading from the mock messages array. Update the sendMessage function to POST to the API and listen for Socket.IO events for incoming messages. Update CreateGroupModal to call POST /api/chats/group with the selected friends (this will depend on Member 3's friend list API to get the list of friends to choose from, so coordinate with Member 3).

5) Wire the special message types. The Poll, FoodSuggestion, and Spinwheel components already render correctly from mock data. Make sure the POST message endpoint accepts message_type and metadata fields. When sending a poll, store the question and options in the metadata JSON. When sending a food suggestion, store the restaurant data. When sending a spin wheel, store the options. The frontend components already know how to render these types based on the msg.type field.

6) Wire the chat search bar. The search bar in ChatList should filter chats by room name or member username. This can be done client-side by filtering the fetched chats array, which is how it currently works with mock data she just need to make sure the API response includes enough info to filter on.

FILES YOU WILL TOUCH:
Frontend:
- grumble-frontend/src/pages/Chats.jsx (replace mock import with API calls)
- grumble-frontend/src/components/chatsPage/ChatWindow.jsx (wire to real API + Socket.IO)
- grumble-frontend/src/components/chatsPage/ChatMessage.jsx (minor updates for real data shape)
- grumble-frontend/src/components/chatsPage/CreateGroupModal.jsx (wire to API)
- grumble-frontend/src/components/chatsPage/mockData.js (DELETE this file after rewiring)
- grumble-frontend/src/services/chatService.js (NEW FILE - API calls for chat operations)

Backend:
- grumble-backend/routes/chatRoutes.js (NEW FILE)
- grumble-backend/controllers/chatController.js (NEW FILE)
- grumble-backend/repositories/chatRepository.js (NEW FILE)
- grumble-backend/migrations/007_create_chat_tables.sql (NEW FILE)
- grumble-backend/server.js (add Socket.IO setup - be careful, this is a shared file)
- grumble-backend/app.js (add chat routes mount - coordinate merge)


========================================
SHARED FILES - COORDINATION NEEDED
========================================

These files will be touched by multiple members. To avoid conflicts, agree on who merges first, or have one person handle all changes to these files at the end:

- grumble-backend/app.js: Member 3 adds friend routes, Member 4 adds chat routes. Simple additions so easy to merge.
- grumble-frontend/src/router.jsx: Member 2 adds /help-support, Member 3 adds /friends. Again simple additions.
- grumble-backend/repositories/postsRepository.js: Member 1 adds report query, Member 3 updates friends tab query. Different functions so should merge cleanly if done carefully.
- grumble-backend/server.js: Member 4 adds Socket.IO. Only Member 4 should touch this file.


========================================
AFTER ALL LOCAL DEVELOPMENT - DEPLOYMENT
========================================

Once all members have completed their tasks, merged their code, and verified everything works locally, do the following for deployment:

1) Move secrets out of .env into environment variables on the hosting platform. The current .env file contains real Telegram bot token, database password, and JWT secrets that should never be in source control. Add .env to .gitignore and create a .env.example with placeholder values.

2) Remove the devOTP field from the forgot password API response in authController.js (around line 253). This leaks OTP codes in production.

3) Set up Cloudinary or another cloud image hosting service to replace the local multer disk storage. Update the upload route in postRoutes.js to upload to the cloud service instead of the local uploads folder. Update image URLs in the database and frontend to use the cloud URLs.

4) Configure CORS in app.js to only allow your frontend domain instead of the current open cors() with no restrictions.

5) Set up the production database (PostgreSQL with PostGIS) on the hosting platform. Run all migrations in order (001 through 007).

6) Update the frontend VITE_API_URL environment variable to point to the deployed backend URL instead of localhost.

7) Build the frontend with npm run build and deploy the dist folder to your hosting service.

8) Set the JWT token expiry to something shorter than 30 days (e.g. 7 days) and consider implementing refresh tokens.

9) Remove the backend server-side packages (bcrypt, cors, dotenv, express, jsonwebtoken, nodemailer, pg) from the frontend package.json since they are not used in browser code and just bloat the build.
