import api from "./api";

// List all accepted friends
export const getFriends = async () => {
  const response = await api.get("/friends");
  return response.data;
};

// List pending incoming friend requests
export const getFriendRequests = async () => {
  const response = await api.get("/friends/requests");
  return response.data;
};

// List sent (outgoing) pending requests
export const getSentRequests = async () => {
  const response = await api.get("/friends/sent");
  return response.data;
};

// Search users by username
export const searchUsers = async (username) => {
  const response = await api.get("/friends/search", { params: { username } });
  return response.data;
};

// Send a friend request
export const sendFriendRequest = async (friendId) => {
  const response = await api.post("/friends/request", { friendId });
  return response.data;
};

// Accept a friend request
export const acceptFriendRequest = async (requestId) => {
  const response = await api.post(`/friends/accept/${requestId}`);
  return response.data;
};

// Decline a friend request
export const declineFriendRequest = async (requestId) => {
  const response = await api.post(`/friends/decline/${requestId}`);
  return response.data;
};

// Remove an existing friend
export const removeFriend = async (friendshipId) => {
  const response = await api.delete(`/friends/${friendshipId}`);
  return response.data;
};
