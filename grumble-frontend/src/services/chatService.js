import api from "./api";

export const getChats = async () => {
  const response = await api.get("/chats");
  return response.data?.data ?? response.data;
};

export const getChatRoom = async (roomId) => {
  const response = await api.get(`/chats/${roomId}`);
  return response.data?.data ?? response.data;
};

export const createGroupChatRoom = async (name) => {
  const response = await api.post("/chats", { type: "group", name });
  return response.data?.data ?? response.data;
};

export const getOrCreateDirectChatRoom = async (memberId) => {
  const response = await api.post("/chats/direct", { member_id: memberId });
  return response.data?.data ?? response.data;
};

export const updateChatRoom = async (roomId, updates) => {
  const isFormData =
    typeof FormData !== "undefined" && updates instanceof FormData;

  const response = await api.patch(
    `/chats/${roomId}`,
    updates,
    isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {},
  );
  return response.data?.data ?? response.data;
};

export const addMembersToChatRoom = async (roomId, userIds) => {
  const response = await api.post(`/chats/${roomId}/members`, {
    user_ids: userIds,
  });
  return response.data?.data ?? response.data;
};

export const removeMemberFromChatRoom = async (roomId, userId) => {
  const response = await api.delete(`/chats/${roomId}/members/${userId}`);
  return response.data?.data ?? response.data;
};

export const updateChatMemberRole = async (roomId, userId, role) => {
  const response = await api.patch(`/chats/${roomId}/members/${userId}`, {
    role,
  });
  return response.data?.data ?? response.data;
};

export const leaveChatRoom = async (roomId) => {
  const response = await api.delete(`/chats/${roomId}/leave`);
  return response.data?.data ?? response.data;
};
