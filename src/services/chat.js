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
  const response = await api.post(`/chats/${chatId}/messages`, messageData);
  return response.data;
}

async function getMessages(chatId) {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
}

export { createChat, getChats, getChatById, sendMessage, getMessages };