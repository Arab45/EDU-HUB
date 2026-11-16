import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ConversationList from "../components/CoversationList";
import ChatWindow from "../components/Chat";
import AppShell from "../components/AppShell";
import {
  getChats,
  getChatById,
  getMessages,
  sendMessage,
} from "../services/chat";
import { getProfilePictureUrl } from "../utils/profilePicture";

function extractList(response, keys) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(response[key])) return response[key];
  }
  return extractList(response.data, keys);
}

function getId(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return value?._id ?? value?.id ?? value?.userId;
}

function getName(user) {
  if (typeof user === "string") return user;
  return user?.fullName ?? user?.name ?? user?.username ?? "Researcher";
}

function normalizeMessage(message, currentUserId) {
  const senderId = getId(message.sender ?? message.senderId ?? message.user);
  const content =
    typeof message.content === "string"
      ? message.content
      : typeof message.text === "string"
        ? message.text
        : "";
  const dateValue = message.createdAt ?? message.sentAt ?? message.time;
  const parsedDate = dateValue ? new Date(dateValue) : null;
  const time =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
  return {
    id: message._id ?? message.id ?? `${senderId ?? "message"}-${dateValue ?? content}`,
    fromMe:
      message.fromMe ??
      message.isMine ??
      (senderId ? String(senderId) === String(currentUserId) : false),
    text: content,
    time,
    attachments: Array.isArray(message.attachments) ? message.attachments : [],
  };
}

function normalizeChat(chat, currentUserId, fallbackRecipient) {
  const rawParticipants =
    chat.participants ?? chat.members ?? chat.users ?? chat.userIds ?? [];
  const participants = Array.isArray(rawParticipants) ? rawParticipants : [];
  const recipient =
    participants.find((participant) => String(getId(participant)) !== String(currentUserId)) ??
    chat.target ??
    chat.recipient ??
    fallbackRecipient ??
    {};
  const name = getName(recipient);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: String(chat.chatId ?? chat._id ?? chat.id),
    recipientId: getId(recipient),
    name,
    initials,
    profilePicture:
      getProfilePictureUrl(recipient) || getProfilePictureUrl(fallbackRecipient),
    institution:
      recipient.institution ?? recipient.academic?.institution ?? "",
    unread: chat.unreadCount ?? chat.unread ?? 0,
    messages: (chat.messages ?? []).map((message) =>
      normalizeMessage(message, currentUserId)
    ),
  };
}

function Messages() {
  const currentUserId = useSelector((state) => state.profile.userId);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [chatsError, setChatsError] = useState("");
  const [loadedMessagesId, setLoadedMessagesId] = useState("");
  const [sending, setSending] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [showChat, setShowChat] = useState(false);

  const locationChatId = location.state?.chatId;
  const locationRecipient = location.state?.recipient;

  useEffect(() => {
    if (!currentUserId) return undefined;

    let active = true;
    getChats(currentUserId)
      .then(async (response) => {
        if (!active) return;
        const loaded = extractList(response, ["chats", "items"]).map((chat) =>
          normalizeChat(chat, currentUserId, locationRecipient)
        );
        if (
          locationChatId &&
          !loaded.some((conversation) => conversation.id === String(locationChatId))
        ) {
          try {
            const detailResponse = await getChatById(locationChatId);
            const detail =
              detailResponse?.chat ??
              detailResponse?.data?.chat ??
              detailResponse?.data ??
              detailResponse;
            loaded.unshift(
              normalizeChat(detail, currentUserId, locationRecipient)
            );
          } catch (requestError) {
            if (active) {
              setChatsError(
                requestError.response?.data?.message ??
                  requestError.message ??
                  "Unable to load the new conversation."
              );
            }
          }
        }
        if (active) {
          setConversations(loaded);
          const nextActiveId = locationChatId
            ? String(locationChatId)
            : loaded[0]?.id ?? "";
          setActiveId(nextActiveId);
          setShowChat(Boolean(locationChatId));
        }
      })
      .catch((requestError) => {
        if (active) {
          setChatsError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load conversations."
          );
        }
      })
      .finally(() => {
        if (active) setLoadingChats(false);
      });
    return () => {
      active = false;
    };
  }, [currentUserId, locationChatId, locationRecipient]);

  const active = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [conversations, activeId]
  );

  useEffect(() => {
    if (!activeId) return undefined;
    let mounted = true;
    getMessages(activeId)
      .then((response) => {
        if (!mounted) return;
        const rawMessages = extractList(response, ["messages", "items"]);
        const messages = rawMessages.map((message) =>
          normalizeMessage(message, currentUserId)
        );
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === activeId
              ? { ...conversation, messages }
              : conversation
          )
        );
        setLoadedMessagesId(activeId);
      })
      .catch((requestError) => {
        if (mounted) {
          setLoadedMessagesId(activeId);
          setMessageError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load messages."
          );
        }
      })
    return () => {
      mounted = false;
    };
  }, [activeId, currentUserId]);

  const handleSelect = (id) => {
    setActiveId(String(id));
    setShowChat(true);
    setMessageError("");
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === String(id)
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  };

  const handleSend = async (text, attachments = []) => {
    if (!activeId || sending) return;
    setSending(true);
    setMessageError("");
    try {
      const response = await sendMessage(activeId, { content: text, attachments });
      const result =
        response?.message ?? response?.data?.message ?? response?.data ?? response;
      const message = normalizeMessage(
        result && typeof result === "object"
          ? { ...result, content: result.content ?? text, senderId: result.senderId ?? currentUserId }
          : { content: text, senderId: currentUserId, createdAt: new Date().toISOString() },
        currentUserId
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeId
            ? { ...conversation, messages: [...conversation.messages, message] }
            : conversation
        )
      );
      return true;
    } catch (requestError) {
      setMessageError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to send your message."
      );
      return false;
    } finally {
      setSending(false);
    }
  };

  const loadingMessages = Boolean(activeId && loadedMessagesId !== activeId);

  return (
    <AppShell maxWidth="max-w-6xl">
      {!currentUserId && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          No logged-in user ID was found. Please sign in again.
        </p>
      )}
      {chatsError && <p role="alert" className="mb-3 text-sm text-red-600">{chatsError}</p>}
      {currentUserId && loadingChats ? (
        <p role="status" className="mb-3 text-slate-500">Loading conversations...</p>
      ) : (
        <div className="grid h-[calc(100dvh-11rem)] min-h-[20rem] grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-white md:h-[calc(100vh-4rem)] md:min-h-0 md:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
          <div className={`min-h-0 min-w-0 ${showChat ? "hidden md:block" : "block"}`}>
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
            />
          </div>
          <div className={`min-h-0 min-w-0 ${showChat ? "block" : "hidden md:block"}`}>
            {active ? (
              <ChatWindow
                conversation={active}
                onSend={handleSend}
                onBack={() => setShowChat(false)}
                sending={sending}
                loadingMessages={loadingMessages}
                error={messageError}
              />
            ) : (
              <div className="hidden h-full items-center justify-center text-slate-500 md:flex">
                Select a conversation to start messaging.
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default Messages;
