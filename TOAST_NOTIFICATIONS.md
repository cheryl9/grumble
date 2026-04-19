# Toast Notifications Implementation

## Overview

Added toast notifications for user actions including likes, comments, saves, and friend requests. These toasts provide immediate visual feedback when actions are performed.

## Files Created

### 1. `/src/context/ToastContext.jsx`

- Provides a React Context for accessing the `pushToast` function globally
- Allows any component to trigger toast notifications without being directly connected to MainLayout
- Exports `useToast()` hook and `ToastProvider` component

### 2. `/src/utils/toastBuilders.js`

- Centralized utility file containing all toast builder functions
- Moved from MainLayout to keep concerns separated
- Exports toast builders:
  - `buildAchievementToast()` - For achievement unlocks
  - `buildFriendRequestToast()` - For incoming friend requests
  - `buildFriendRequestAcceptedToast()` - For accepted friend requests
  - `buildPostLikeToast()` - For post likes from others
  - `buildPostCommentToast()` - For post comments from others
  - `buildPostSaveToast()` - For post saves from others
  - `buildPostShareToast()` - For post shares from others
  - `buildLoginAchievementToast()` - For achievements on login
  - `buildUnreadNotificationToast()` - For unread notifications
  - **`buildLocalActionToast()`** - New function for user's own actions (like, comment, save, friend request)

## Components Updated

### 1. MainLayout.jsx

- Imported `ToastProvider` from ToastContext
- Imported all toast builders from toastBuilders.js
- Removed local toast builder function definitions
- Wrapped `<Outlet />` with `<ToastProvider pushToast={pushToast}>`
- Now provides toast functionality to all child routes

### 2. PostsModal.jsx

- Imported `useToast` hook and `buildLocalActionToast` builder
- Added toast notifications for:
  - **Like button**: Shows "Post liked!" or "Like removed" toast
  - **Comment button**: Shows "Comment posted!" toast after successful comment
  - **Save button**: Shows "Post saved!" or "Bookmark removed" toast

### 3. AddFriendSearch.jsx

- Imported `useToast` hook and `buildLocalActionToast` builder
- Added toast notification when sending friend request
- Shows "Friend request sent!" toast

### 4. FriendRequestCard.jsx (New)

- Imported `useToast` hook and `buildLocalActionToast` builder
- Added toast notifications for:
  - **Accept button**: Shows "Friend request accepted!" toast
  - **Decline button**: Shows "Friend request declined." toast

## Toast Types for User Actions

The `buildLocalActionToast()` function supports these action types:

```javascript
- "like_sent" - Red/pink gradient toast with ❤️ emoji
- "comment_sent" - Purple gradient toast with 💬 emoji
- "save_sent" - Yellow/amber gradient toast with 🔖 emoji
- "friend_request_sent" - Blue gradient toast with 👋 emoji
- "friend_request_accepted" - Green gradient toast with ✅ emoji
- "friend_request_declined" - Red gradient toast with 👋 emoji
```

## Usage Example

```jsx
import { useToast } from "../../context/ToastContext";
import { buildLocalActionToast } from "../../utils/toastBuilders";

function MyComponent() {
  const { pushToast } = useToast();

  const handleAction = () => {
    // Perform action

    // Show toast
    pushToast(buildLocalActionToast("like_sent", "Post liked!"));
  };

  return <button onClick={handleAction}>Like</button>;
}
```

## Toast Design System

All toasts follow the same design pattern:

- **Position**: Top-right corner, stacked vertically
- **Duration**: 5.6 seconds before auto-dismiss
- **Max toasts**: 4 visible at once (older ones are removed)
- **Animation**: Slide-in from right with scale animation
- **Styling**: Gradient backgrounds with custom colors per action type
- **No action buttons**: User action toasts don't have action buttons

## Consistent Implementation

The toasts work the same way for:

1. **Post engagement** (Like, Comment, Save)
   - User sees feedback immediately
   - Both successful and undo actions show appropriate messages
2. **Friend requests** (Send, Accept, Decline)
   - User sees confirmation of their action
   - Same styling as friend-related toasts from notifications

## Future Enhancements

- Add undo functionality to some toasts (e.g., "Undo like" action button)
- Add sound effects to toasts
- Add persistent toast preferences (user can mute certain types)
- Add toast history/notification center
