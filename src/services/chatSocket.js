import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;

if (!BASE_URL) {
  throw new Error("VITE_BASE_URL is missing. Set it in the Vite environment file.");
}

const socketOrigin = new URL(BASE_URL).origin;

export function connectChatSocket() {
  return io(`${socketOrigin}/chat`, {
    withCredentials: true,
    transports: ["websocket"],
  });
}
