import api from "./auth";

async function createChat(chatData) {
  const response = await api.post("/chats", chatData);
  return response.data;
}

async function getChats(userId) {
  const response = await api.get(`/chats/${userId}`);
  return response.data;
}

async function getChatById(chatId) {
  const response = await api.get(`/chats/chat/${chatId}`);
  return response.data;
}

async function sendMessage(chatId, messageData) {
  const { attachments = [], ...fields } = messageData;
  const payload =
    attachments.length > 0
      ? (() => {
          const formData = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
          });
          attachments.forEach((file) => formData.append("attachments", file));
          return formData;
        })()
      : messageData;
  const response = await api.post(`/chats/${chatId}/messages`, payload, {
    headers:
      payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
  });
  return response.data;
}

async function getMessages(chatId) {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
}

async function getUnreadMessages(page = 1, limit = 50) {
  const response = await api.get("/chats/unread", {
    params: { page, limit },
  });
  return response.data;
}

async function getUnreadCount() {
  const response = await api.get("/chats/unread-count");
  return response.data;
}

async function markChatRead(chatId) {
  const response = await api.patch(`/chats/${chatId}/read`);
  return response.data;
}

export {
  createChat,
  getChats,
  getChatById,
  sendMessage,
  getMessages,
  getUnreadMessages,
  getUnreadCount,
  markChatRead,
};