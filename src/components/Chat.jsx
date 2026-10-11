import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiSend, FiArrowLeft } from "react-icons/fi";

function MessageBubble({ message }) {
  return (
    <div className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 transition-colors duration-300 ease-in-out ${
          message.fromMe
            ? "rounded-br-md bg-emerald-900 text-white"
            : "rounded-bl-md bg-slate-100 text-slate-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p
          className={`mt-1 text-right text-xs ${
            message.fromMe ? "text-white/60" : "text-slate-400"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

function ChatWindow({ conversation, onSend, onBack }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Keep the newest message in view whenever the thread changes.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.id, conversation.messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    // Enter sends, Shift+Enter adds a new line.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-500 transition-colors duration-300 ease-in-out hover:text-slate-900 md:hidden"
          aria-label="Back to conversations"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <Link to="/profile" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
            {conversation.initials}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{conversation.name}</p>
            <p className="text-sm text-slate-500">{conversation.institution}</p>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-white p-5">
        {conversation.messages.length === 0 && (
          <p className="m-auto text-slate-400">
            No messages yet. Say hello to {conversation.name.split(" ")[0]}!
          </p>
        )}
        {conversation.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-3 border-t border-slate-200 p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Write a message..."
          className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-colors duration-300 ease-in-out focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition-colors duration-300 ease-in-out hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="Send message"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
