import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChat, getChats } from "../services/chat";

function getChatId(chat) {
  const id = chat?.chatId ?? chat?._id ?? chat?.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}

function extractChatId(response) {
  if (!response || typeof response !== "object") return null;

  const directId = getChatId(response);
  if (directId) return directId;

  for (const key of ["data", "chat", "conversation", "result"]) {
    const nestedId = extractChatId(response[key]);
    if (nestedId) return nestedId;
  }

  return null;
}

function extractChats(response) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  for (const key of ["chats", "items", "data"]) {
    const chats = extractChats(response[key]);
    if (chats.length) return chats;
  }

  return [];
}

function getParticipantId(participant) {
  if (typeof participant === "string" || typeof participant === "number") {
    return String(participant);
  }

  const id = participant?._id ?? participant?.id ?? participant?.userId;
  return id == null ? null : String(id);
}

function includesRecipient(chat, recipientId) {
  const participants =
    chat?.participants ?? chat?.members ?? chat?.users ?? chat?.userIds ?? [];
  return (
    Array.isArray(participants) &&
    participants.some(
      (participant) => getParticipantId(participant) === recipientId
    )
  );
}

function StartChatButton({ currentUserId, user, className = "" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startChat = async () => {
    const recipientId = String(user?.id ?? "");
    if (
      !currentUserId ||
      !recipientId ||
      !/^[a-f\d]{24}$/i.test(recipientId) ||
      currentUserId === recipientId ||
      loading
    ) {
      if (recipientId && !/^[a-f\d]{24}$/i.test(recipientId)) {
        setError("This researcher's profile does not include a valid MongoDB user ID.");
      }
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await createChat({ recipientId });
      let chatId = extractChatId(result);

      if (!chatId) {
        const chatsResponse = await getChats(currentUserId);
        const matchingChat = extractChats(chatsResponse).find((chat) =>
          includesRecipient(chat, recipientId)
        );
        chatId = getChatId(matchingChat);
      }

      if (!chatId) {
        throw new Error(
          "The chat request succeeded, but no chat ID was returned or found in your conversations."
        );
      }

      navigate("/messages", {
        state: {
          chatId,
          recipient: user,
        },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to start a conversation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={startChat}
        disabled={
          !currentUserId ||
          !user?.id ||
          currentUserId === user.id ||
          loading
        }
        className="rounded-xl border border-emerald-800 px-3 py-1.5 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening..." : "Message"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default StartChatButton;
