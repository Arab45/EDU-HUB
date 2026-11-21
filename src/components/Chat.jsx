import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiSend, FiArrowLeft, FiPaperclip, FiX } from "react-icons/fi";
import LoadingState from "./LoadingState";
import { formatLastSeen } from "../utils/presence";
import { compressImageFile } from "../utils/compressImage";

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

function MessageBubble({ message }) {
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];

  return (
    <div className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 transition-colors duration-300 ease-in-out ${
          message.fromMe
            ? "rounded-br-md bg-emerald-900 text-white"
            : "rounded-bl-md bg-slate-100 text-slate-900"
        }`}
      >
        {message.text && (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}
        {attachments.map((attachment, index) => {
          const mimeType = attachment.mimeType ?? attachment.type ?? "";
          const data = attachment.data;
          const src =
            typeof attachment.url === "string"
              ? attachment.url
              : typeof data === "string" && data.startsWith("data:")
              ? data
              : typeof data === "string"
                ? `data:${mimeType || "application/octet-stream"};base64,${data}`
                : "";
          const fileName = attachment.fileName ?? attachment.name ?? "Attachment";
          return mimeType.startsWith("image/") && src ? (
            <img
              key={`${fileName}-${index}`}
              src={src}
              alt={fileName}
              className="mt-2 max-h-64 max-w-full rounded-lg"
            />
          ) : (
            <a
              key={`${fileName}-${index}`}
              href={src || undefined}
              download={fileName}
              target={attachment.url ? "_blank" : undefined}
              rel={attachment.url ? "noreferrer" : undefined}
              className="mt-2 block break-all text-sm underline"
            >
              {fileName}
            </a>
          );
        })}
        <div
          className={`mt-1 text-right text-xs ${
            message.fromMe ? "text-white/60" : "text-slate-400"
          }`}
        >
          {message.time}
          {message.fromMe && (
            <span
              className={`ml-1 ${
                message.readAt ? "text-sky-300" : "text-current"
              }`}
              aria-label={
                message.readAt
                  ? "Read"
                  : message.deliveredAt
                    ? "Delivered"
                    : "Sent"
              }
              title={
                message.readAt
                  ? "Read"
                  : message.deliveredAt
                    ? "Delivered"
                    : "Sent"
              }
            >
              {message.readAt || message.deliveredAt ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatWindow({
  conversation,
  onSend,
  onBack,
  sending = false,
  loadingMessages = false,
  error = "",
  onTyping,
  isOnline = false,
  isTyping = false,
  lastSeenAt = null,
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");
  const messagesContainerRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(typingTimerRef.current);
      onTyping?.(false);
    },
    [conversation.id, onTyping]
  );

  useEffect(() => {
    const messageList = messagesContainerRef.current;
    if (messageList) {
      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation.id, conversation.messages.length]);

  const handleAttachmentChange = async (event) => {
    const files = Array.from(event.target.files ?? []);
    setAttachmentError("");
    const acceptedFiles = files.filter((file) => file.size <= MAX_ATTACHMENT_SIZE);
    const oversizedFiles = files.filter((file) => file.size > MAX_ATTACHMENT_SIZE);
    if (oversizedFiles.length > 0) {
      setAttachmentError(
        `${oversizedFiles.map((file) => file.name).join(", ")} ${
          oversizedFiles.length === 1 ? "is" : "are"
        } larger than 5 MB. Choose files that are 5 MB or smaller.`
      );
    }

    try {
      const loadedAttachments = await Promise.all(
        acceptedFiles.map(compressImageFile)
      );
      setAttachments((current) => [...current, ...loadedAttachments]);
    } catch (error) {
      setAttachmentError((current) =>
        [current, error.message ?? "Unable to read the selected attachment."]
        .filter(Boolean)
        .join(" ")
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || sending) return;
    clearTimeout(typingTimerRef.current);
    onTyping?.(false);
    const sent = await onSend(trimmed, attachments);
    if (sent) {
      setText("");
      setAttachments([]);
    }
  };

  const handleTextChange = (event) => {
    const value = event.target.value;
    setText(value);
    onTyping?.(Boolean(value.trim()));
    clearTimeout(typingTimerRef.current);
    if (value.trim()) {
      typingTimerRef.current = setTimeout(() => onTyping?.(false), 1200);
    }
  };

  const handleKeyDown = (e) => {
    // Enter sends, Shift+Enter adds a new line.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="flex min-w-0 items-center gap-3 border-b border-slate-200 px-3 py-3 sm:px-5 sm:py-4">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-500 transition-colors duration-300 ease-in-out hover:text-slate-900 md:hidden"
          aria-label="Back to conversations"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <Link
          to={conversation.recipientId ? `/profile/${conversation.recipientId}` : "/profile"}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
            {conversation.profilePicture ? (
              <img
                src={conversation.profilePicture}
                alt={`${conversation.name}'s profile`}
                loading="lazy"
                decoding="async"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              conversation.initials
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{conversation.name}</p>
            <p className="truncate text-sm text-slate-500">
              {isTyping
                ? "Typing..."
                : isOnline
                  ? "Online"
                  : formatLastSeen(lastSeenAt ?? conversation.lastSeenAt)}
            </p>
          </div>
        </Link>
      </div>

      <div
        ref={messagesContainerRef}
        className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain bg-white p-3 sm:p-5"
      >
        {loadingMessages && (
          <LoadingState label="Loading messages..." className="justify-center" />
        )}
        {(error || attachmentError) && (
          <p role="alert" className="text-sm text-red-600">
            {error || attachmentError}
          </p>
        )}
        {conversation.messages.length === 0 && (
          <p className="m-auto text-slate-400">
            No messages yet. Say hello to {conversation.name.split(" ")[0]}!
          </p>
        )}
        {conversation.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <div className="flex items-end gap-2 border-t border-slate-200 p-3 sm:gap-3 sm:p-4">
        <label
          title="Attach files up to 5 MB each"
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <FiPaperclip aria-label="Attach files" />
          <input
            type="file"
            multiple
            aria-label="Attach files up to 5 MB each"
            onChange={handleAttachmentChange}
            className="hidden"
          />
        </label>
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Write a message..."
          className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-colors duration-300 ease-in-out focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && attachments.length === 0) || sending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition-colors duration-300 ease-in-out hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="Send message"
        >
          {sending ? "…" : <FiSend />}
        </button>
      </div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-3 py-2 sm:px-4">
          {attachments.map((attachment, index) => (
            <span
              key={`${attachment.name}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
            >
              <span className="truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() =>
                  setAttachments((current) =>
                    current.filter((_, attachmentIndex) => attachmentIndex !== index)
                  )
                }
                aria-label={`Remove ${attachment.name}`}
              >
                <FiX />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
