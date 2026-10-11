import { useState } from "react";
import { FiSearch } from "react-icons/fi";

function ConversationList({ conversations, activeId, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) =>
    `${c.name} ${c.institution}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col border-r border-slate-200">
      <div className="border-b border-slate-100 p-4">
        <p className="mb-3 font-serif text-xl font-bold text-slate-900">
          Messages
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition-colors duration-300 ease-in-out focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
          <FiSearch className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-slate-400">No conversations found.</p>
        )}
        {filtered.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-300 ease-in-out ${
                isActive ? "bg-emerald-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                {c.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-slate-900">
                    {c.name}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">
                    {last?.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-slate-500">
                    {last ? (last.fromMe ? `You: ${last.text}` : last.text) : ""}
                  </p>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-semibold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ConversationList;
