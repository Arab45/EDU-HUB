import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ConversationList from "../components/CoversationList";
import ChatWindow from "../components/Chat";
import AppShell from "../components/AppShell";
import LoadingState from "../components/LoadingState";
import { fetchAllUsers, fetchProfile } from "../services/auth";
import {
  getChats,
  getChatById,
  getMessages,
  getUnreadCount,
  getUnreadMessages,
  markChatRead,
  sendMessage,
} from "../services/chat";
import { connectChatSocket } from "../services/chatSocket";
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
  return value?._id ?? value?.id ?? value?.userId ?? value?.senderId;
}

function getName(user) {
  if (typeof user === "string") return user;
  return user?.fullName ?? user?.name ?? user?.username ?? "Researcher";
}

function getProfileData(response) {
  let value =
    response?.profile ??
    response?.user ??
    response?.data?.profile ??
    response?.data?.user ??
    response?.data ??
    response;
  while (value && typeof value === "object" && !Array.isArray(value)) {
    const nested =
      value.profile ??
      value.user ??
      value.data ??
      value.result;
    if (!nested || nested === value) break;
    value = nested;
  }
  return value;
}

function getUserPictureFromResponse(response) {
  const profile = getProfileData(response);
  return (
    getProfilePictureUrl(profile) ||
    getProfilePictureUrl(profile?.profile) ||
    getProfilePictureUrl(profile?.user) ||
    ""
  );
}

function getUnreadTotal(response) {
  const value = response?.data ?? response;
  const count = Number(
    value?.total ??
      value?.count ??
      value?.unreadCount ??
      value?.totalUnread ??
      value?.totalUnreadCount
  );
  return Number.isFinite(count) ? count : null;
}

function getUnreadGroups(response) {
  const value = response?.data ?? response;
  const groups =
    value?.bySender ??
    value?.countsBySender ??
    value?.senders ??
    value?.counts;
  if (Array.isArray(groups)) return groups;
  if (groups && typeof groups === "object") {
    return Object.entries(groups).map(([senderId, count]) => ({
      senderId,
      count: typeof count === "object" ? count.count ?? count.unreadCount : count,
    }));
  }
  return [];
}

function getMessageId(message) {
  const id = message?._id ?? message?.id ?? message?.messageId;
  return id == null ? null : String(id);
}

function getChatId(value) {
  const chat = value?.chat ?? value?.conversation ?? value?.chatId;
  const id =
    typeof chat === "string" || typeof chat === "number"
      ? chat
      : chat?._id ?? chat?.id ?? chat?.chatId;
  return id == null ? null : String(id);
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
    deliveredAt: message.deliveredAt ?? null,
    readAt: message.readAt ?? null,
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
    chat.otherUser ??
    chat.otherParticipant ??
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
    recipientId:
      getId(recipient) ??
      getId(chat.recipientId ?? chat.otherUserId ?? chat.targetId),
    name,
    initials,
    profilePicture:
      getProfilePictureUrl(recipient) ||
      getProfilePictureUrl(chat.otherUser) ||
      getProfilePictureUrl(chat.otherParticipant) ||
      getProfilePictureUrl(fallbackRecipient),
    institution:
      recipient.institution ?? recipient.academic?.institution ?? "",
    unread: Number(chat.unreadCount ?? chat.unread ?? 0) || 0,
    messages: (chat.messages ?? []).map((message) =>
      normalizeMessage(message, currentUserId)
    ),
  };
}

function Messages() {
  const currentUserId = useSelector((state) => state.profile.userId);
  const location = useLocation();
  const socketRef = useRef(null);
  const conversationsRef = useRef([]);
  const activeIdRef = useRef("");
  const loadedMessagesIdRef = useRef("");
  const showChatRef = useRef(false);
  const unreadByChatRef = useRef(new Map());
  const unreadBySenderRef = useRef(new Map());
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [chatsError, setChatsError] = useState("");
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [socketError, setSocketError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingByChat, setTypingByChat] = useState({});
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [unreadError, setUnreadError] = useState("");
  const [loadedMessagesId, setLoadedMessagesId] = useState("");
  const [sending, setSending] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [showChat, setShowChat] = useState(false);

  const locationChatId = location.state?.chatId;
  const locationRecipient = location.state?.recipient;

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    loadedMessagesIdRef.current = loadedMessagesId;
  }, [loadedMessagesId]);

  useEffect(() => {
    showChatRef.current = showChat;
  }, [showChat]);

  const isConversationVisible = useCallback((chatId) => {
    if (activeIdRef.current !== String(chatId)) return false;
    return (
      window.matchMedia("(min-width: 768px)").matches ||
      showChatRef.current
    );
  }, []);

  const updateConversationMessages = useCallback((chatId, updater) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === String(chatId)
          ? { ...conversation, messages: updater(conversation.messages) }
          : conversation
      )
    );
  }, []);

  const markConversationRead = useCallback(async (chatId) => {
    if (!chatId) return;
    const previousUnread =
      conversationsRef.current.find(
        (conversation) => conversation.id === String(chatId)
      )?.unread ??
      unreadByChatRef.current.get(String(chatId)) ??
      0;
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === String(chatId)
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
    if (previousUnread > 0) {
      setUnreadTotal((count) => Math.max(0, count - previousUnread));
      unreadByChatRef.current.set(String(chatId), 0);
      const conversation = conversationsRef.current.find(
        (item) => item.id === String(chatId)
      );
      if (conversation?.recipientId) {
        unreadBySenderRef.current.set(String(conversation.recipientId), 0);
      }
    }
    const socket = socketRef.current;
    if (socket?.connected) {
      setUnreadError("");
      socket.emit("chat:read", { chatId });
    } else {
      try {
        await markChatRead(chatId);
        setUnreadError("");
      } catch (requestError) {
        if (previousUnread > 0) {
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === String(chatId)
                ? { ...conversation, unread: previousUnread }
                : conversation
            )
          );
          setUnreadTotal((count) => count + previousUnread);
          unreadByChatRef.current.set(String(chatId), previousUnread);
          const conversation = conversationsRef.current.find(
            (item) => item.id === String(chatId)
          );
          if (conversation?.recipientId) {
            unreadBySenderRef.current.set(
              String(conversation.recipientId),
              previousUnread
            );
          }
        }
        setUnreadError(
          requestError.response?.data?.message ??
            requestError.message ??
            "Unable to mark this conversation as read."
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return undefined;

    const socket = connectChatSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setSocketStatus("connected");
      setSocketError("");
      const userIds = conversationsRef.current
        .map((conversation) => conversation.recipientId)
        .filter(Boolean);
      if (userIds.length) socket.emit("presence:check", { userIds });
      if (
        activeIdRef.current &&
        loadedMessagesIdRef.current === activeIdRef.current &&
        isConversationVisible(activeIdRef.current)
      ) {
        socket.emit("chat:read", { chatId: activeIdRef.current });
      }
    };
    const handleDisconnect = () => setSocketStatus("disconnected");
    const handleConnectError = (error) => {
      setSocketStatus("disconnected");
      setSocketError(error.message || "Unable to connect to chat.");
    };
    const handleReady = () => setSocketStatus("connected");
    const handleMessage = (payload) => {
      const rawMessage =
        payload?.message ?? payload?.data?.message ?? payload?.data ?? payload;
      const chatId = getChatId(payload) ?? getChatId(rawMessage);
      if (!chatId || !rawMessage || typeof rawMessage !== "object") return;
      const message = normalizeMessage(rawMessage, currentUserId);
      const messageId = getMessageId(rawMessage);
      const isIncoming = !message.fromMe;
      const conversationExists = conversationsRef.current.some(
        (conversation) => conversation.id === chatId
      );
      if (!conversationExists) return;

      updateConversationMessages(chatId, (currentMessages) => {
        if (
          messageId &&
          currentMessages.some((current) => String(current.id) === messageId)
        ) {
          return currentMessages.map((current) =>
            String(current.id) === messageId ? { ...current, ...message } : current
          );
        }
        if (message.fromMe) {
          const pendingIndex = currentMessages.findLastIndex(
            (current) =>
              String(current.id).startsWith("pending-") &&
              current.fromMe &&
              current.text === message.text
          );
          if (pendingIndex >= 0) {
            return currentMessages.map((current, index) =>
              index === pendingIndex ? message : current
            );
          }
        }
        return [...currentMessages, message];
      });

      if (isIncoming && messageId) {
        socket.emit("chat:delivered", { chatId, messageId });
      }

      if (isIncoming && isConversationVisible(chatId)) {
        void markConversationRead(chatId);
      } else if (isIncoming) {
        const currentUnread =
          conversationsRef.current.find(
            (conversation) => conversation.id === chatId
          )?.unread ?? 0;
        unreadByChatRef.current.set(chatId, currentUnread + 1);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === chatId
              ? { ...conversation, unread: conversation.unread + 1 }
              : conversation
          )
        );
        setUnreadTotal((count) => count + 1);
      }
    };
    const handleDelivery = (payload) => {
      if (payload?.status && payload.status !== "delivered") return;
      const chatId = getChatId(payload);
      const ids = payload?.messageIds ?? [payload?.messageId ?? payload?.id];
      const messageIds = ids.filter((id) => id != null).map(String);
      if (!chatId || !messageIds.length) return;
      updateConversationMessages(chatId, (messages) =>
        messages.map((message) =>
          messageIds.includes(String(message.id))
            ? { ...message, deliveredAt: message.deliveredAt ?? new Date().toISOString() }
            : message
        )
      );
    };
    const handleReadReceipt = (payload) => {
      const chatId = getChatId(payload);
      const ids = payload?.messageIds ?? [payload?.messageId ?? payload?.id];
      const messageIds = ids.filter((id) => id != null).map(String);
      if (!chatId || !messageIds.length) return;
      const readAt = payload?.readAt ?? new Date().toISOString();
      updateConversationMessages(chatId, (messages) =>
        messages.map((message) =>
          messageIds.includes(String(message.id))
            ? { ...message, deliveredAt: message.deliveredAt ?? readAt, readAt }
            : message
        )
      );
    };
    const handlePresenceOnline = (payload) => {
      const userId = getId(payload?.user ?? payload?.userId ?? payload);
      if (userId) setOnlineUsers((current) => ({ ...current, [userId]: true }));
    };
    const handlePresenceOffline = (payload) => {
      const userId = getId(payload?.user ?? payload?.userId ?? payload);
      if (userId) setOnlineUsers((current) => ({ ...current, [userId]: false }));
    };
    const handlePresenceStatus = (payload) => {
      const onlineIds = new Set(
        (payload?.userIds ?? []).map((user) => String(getId(user))).filter(Boolean)
      );
      setOnlineUsers((current) => {
        const next = { ...current };
        conversationsRef.current.forEach((conversation) => {
          if (conversation.recipientId) {
            next[String(conversation.recipientId)] = onlineIds.has(
              String(conversation.recipientId)
            );
          }
        });
        return next;
      });
    };
    const handleTyping = (payload) => {
      const senderId = getId(payload?.sender ?? payload?.senderId ?? payload?.user);
      const chatId =
        getChatId(payload) ??
        conversationsRef.current.find(
          (conversation) =>
            String(conversation.recipientId) ===
            String(senderId ?? getId(payload?.recipientId))
        )?.id;
      if (!chatId) return;
      const typing =
        payload?.isTyping ?? payload?.typing ?? payload?.status !== "stopped";
      if (senderId && String(senderId) === String(currentUserId)) return;
      setTypingByChat((current) => ({ ...current, [chatId]: Boolean(typing) }));
    };
    const handleUnreadCount = (payload) => {
      const count = getUnreadTotal(payload);
      if (count !== null) setUnreadTotal(count);
      const grouped = getUnreadGroups(payload);
      if (Array.isArray(grouped)) {
        unreadBySenderRef.current = new Map(
          grouped
            .map((entry) => [
              String(getId(entry?.sender ?? entry?.user ?? entry) ?? ""),
              Number(entry?.count ?? entry?.unreadCount),
            ])
            .filter(([id, count]) => id && Number.isFinite(count))
        );
        setConversations((current) =>
          current.map((conversation) => {
            const senderCount = grouped.find(
              (entry) =>
                String(getId(entry?.sender ?? entry?.user ?? entry)) ===
                String(conversation.recipientId)
            );
            const unread = Number(senderCount?.count ?? senderCount?.unreadCount);
            return Number.isFinite(unread)
              ? { ...conversation, unread }
              : conversation;
          })
        );
      }
    };
    const handleSocketError = (payload) => {
      setSocketError(payload?.message ?? "The chat server reported an error.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("chat:ready", handleReady);
    socket.on("chat:message", handleMessage);
    socket.on("chat:message:status", handleDelivery);
    socket.on("chat:message:read", handleReadReceipt);
    socket.on("presence:online", handlePresenceOnline);
    socket.on("presence:offline", handlePresenceOffline);
    socket.on("presence:status", handlePresenceStatus);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:unread:count", handleUnreadCount);
    socket.on("chat:error", handleSocketError);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    currentUserId,
    isConversationVisible,
    markConversationRead,
    updateConversationMessages,
  ]);

  useEffect(() => {
    if (!currentUserId) return undefined;
    let active = true;
    Promise.allSettled([getUnreadMessages(1, 50), getUnreadCount()]).then(
      ([messagesResult, countResult]) => {
        if (!active) return;
        if (countResult.status === "fulfilled") {
          const count = getUnreadTotal(countResult.value);
          if (count !== null) setUnreadTotal(count);
          const grouped = getUnreadGroups(countResult.value);
          unreadBySenderRef.current = new Map(
            grouped
              .map((entry) => [
                String(getId(entry?.sender ?? entry?.user ?? entry) ?? ""),
                Number(entry?.count ?? entry?.unreadCount),
              ])
              .filter(([id, unread]) => id && Number.isFinite(unread))
          );
          if (grouped.length) {
            setConversations((current) =>
              current.map((conversation) => {
                const senderCount = grouped.find(
                  (entry) =>
                    String(getId(entry?.sender ?? entry?.user ?? entry)) ===
                    String(conversation.recipientId)
                );
                const unread = Number(
                  senderCount?.count ?? senderCount?.unreadCount
                );
                return Number.isFinite(unread)
                  ? { ...conversation, unread }
                  : conversation;
              })
            );
          }
        }
        if (messagesResult.status === "fulfilled") {
          const unreadMessages = extractList(messagesResult.value, [
            "messages",
            "unread",
            "items",
          ]);
          const countsByChat = new Map();
          unreadMessages.forEach((message) => {
            const chatId = getChatId(message);
            if (chatId) {
              countsByChat.set(chatId, (countsByChat.get(chatId) ?? 0) + 1);
            }
          });
          unreadByChatRef.current = countsByChat;
          if (countsByChat.size) {
            setConversations((current) =>
              current.map((conversation) => ({
                ...conversation,
                unread: countsByChat.get(conversation.id) ?? conversation.unread,
              }))
            );
          }
        }
        const failures = [messagesResult, countResult]
          .filter((result) => result.status === "rejected")
          .map(
            (result) =>
              result.reason?.response?.data?.message ??
              result.reason?.message ??
              "Unable to load unread messages."
          );
        setUnreadError(failures.join(" "));
      }
    );
    return () => {
      active = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (socketRef.current?.connected && !loadingChats) {
      const userIds = conversationsRef.current
        .map((conversation) => conversation.recipientId)
        .filter(Boolean);
      if (userIds.length) {
        socketRef.current.emit("presence:check", { userIds });
      }
    }
  }, [loadingChats, socketStatus]);

  useEffect(() => {
    if (!currentUserId) return undefined;

    let active = true;
    getChats(currentUserId)
      .then(async (response) => {
        if (!active) return;
        let loaded = extractList(response, ["chats", "items"])
          .map((chat) => normalizeChat(chat, currentUserId, locationRecipient))
          .map((conversation) => ({
            ...conversation,
            unread:
              unreadByChatRef.current.get(conversation.id) ??
              unreadBySenderRef.current.get(String(conversation.recipientId)) ??
              conversation.unread,
          }));
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

        const missingPictures = loaded.filter(
          (conversation) =>
            conversation.recipientId && !conversation.profilePicture
        );
        if (missingPictures.length > 0) {
          void Promise.allSettled([
            fetchAllUsers().then((usersResponse) => {
              const users = extractList(usersResponse, ["users", "items"]);
              return new Map(
                users
                  .map((user) => [
                    String(getId(user) ?? ""),
                    getProfilePictureUrl(user),
                  ])
                  .filter(([userId, picture]) => userId && picture)
              );
            }),
            ...missingPictures.map((conversation) =>
              fetchProfile(conversation.recipientId).then((response) => ({
                conversationId: conversation.id,
                picture: getUserPictureFromResponse(response),
              }))
            ),
          ]).then(([directoryResult, ...profileResults]) => {
            if (!active) return;
            const directory =
              directoryResult.status === "fulfilled"
                ? directoryResult.value
                : new Map();
            const pictures = new Map(
              profileResults
                .filter(
                  (result) =>
                    result.status === "fulfilled" && result.value.picture
                )
                .map((result) => [
                  result.value.conversationId,
                  result.value.picture,
                ])
            );
            setConversations((current) =>
              current.map((conversation) => ({
                ...conversation,
                profilePicture:
                  conversation.profilePicture ||
                  pictures.get(conversation.id) ||
                  directory.get(String(conversation.recipientId)) ||
                  "",
              }))
            );
          });
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
          current.map((conversation) => {
            if (conversation.id !== activeId) return conversation;
            const loadedIds = new Set(messages.map((message) => String(message.id)));
            const newerMessages = conversation.messages.filter(
              (message) => !loadedIds.has(String(message.id))
            );
            return { ...conversation, messages: [...messages, ...newerMessages] };
          })
        );
        setLoadedMessagesId(activeId);
        if (isConversationVisible(activeId)) {
          void markConversationRead(activeId);
        }
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
  }, [
    activeId,
    currentUserId,
    isConversationVisible,
    markConversationRead,
  ]);

  const handleSelect = (id) => {
    setActiveId(String(id));
    setShowChat(true);
    setMessageError("");
    unreadByChatRef.current.set(String(id), 0);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === String(id)
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  };

  const handleTyping = useCallback((isTyping) => {
    const recipientId = active?.recipientId;
    if (!recipientId || !socketRef.current?.connected) return;
    socketRef.current.emit(isTyping ? "typing:start" : "typing:stop", {
      recipientId,
    });
  }, [active?.recipientId]);

  const handleSend = async (text, attachments = []) => {
    if (!activeId || sending) return;
    setSending(true);
    setMessageError("");
    try {
      const activeConversation = conversationsRef.current.find(
        (conversation) => conversation.id === activeId
      );
      const socket = socketRef.current;
      if (
        attachments.length === 0 &&
        activeConversation?.recipientId &&
        socket?.connected
      ) {
        const pendingMessage = normalizeMessage(
          {
            id: `pending-${Date.now()}`,
            senderId: currentUserId,
            content: text,
            createdAt: new Date().toISOString(),
          },
          currentUserId
        );
        updateConversationMessages(activeId, (messages) => [
          ...messages,
          pendingMessage,
        ]);
        socket.emit("chat:send", {
          recipientId: activeConversation.recipientId,
          content: text,
        });
        return true;
      }

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
      {socketError && (
        <p role="alert" className="mb-3 text-sm text-amber-700">
          Realtime chat is {socketStatus}. {socketError}
        </p>
      )}
      {unreadError && (
        <p role="alert" className="mb-3 text-sm text-red-600">{unreadError}</p>
      )}
      {currentUserId && loadingChats ? (
        <LoadingState label="Loading conversations..." className="mb-3" />
      ) : (
        <div className="grid h-[calc(100dvh-11rem)] min-h-[20rem] grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-white md:h-[calc(100vh-4rem)] md:min-h-0 md:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
          <div className={`min-h-0 min-w-0 ${showChat ? "hidden md:block" : "block"}`}>
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              unreadTotal={unreadTotal}
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
                onTyping={handleTyping}
                isOnline={Boolean(onlineUsers[String(active.recipientId)])}
                isTyping={Boolean(typingByChat[active.id])}
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
