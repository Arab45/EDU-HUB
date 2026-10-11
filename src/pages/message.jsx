import { useState } from "react";
import ConversationList from "../components/CoversationList";
import ChatWindow from "../components/Chat";
import AppShell from "../components/AppShell";

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    name: "Amara Chukwu",
    initials: "AC",
    institution: "Covenant University",
    unread: 2,
    messages: [
      { id: 1, fromMe: false, text: "Hi Jane! I loved your soil microbiome post.", time: "9:12 AM" },
      { id: 2, fromMe: true, text: "Thank you! Fieldwork was intense but worth it.", time: "9:15 AM" },
      { id: 3, fromMe: false, text: "Would you be open to a joint session at the climate symposium?", time: "9:30 AM" },
      { id: 4, fromMe: false, text: "We could compare rainfall and soil data.", time: "9:31 AM" },
    ],
  },
  {
    id: 2,
    name: "David Okoye",
    initials: "DO",
    institution: "University of Ibadan",
    unread: 0,
    messages: [
      { id: 1, fromMe: true, text: "How many species did you end up tagging?", time: "Yesterday" },
      { id: 2, fromMe: false, text: "Fourteen in total. I'll share the dataset soon.", time: "Yesterday" },
    ],
  },
  {
    id: 3,
    name: "Ngozi Eze",
    initials: "NE",
    institution: "Obafemi Awolowo University",
    unread: 0,
    messages: [
      { id: 1, fromMe: false, text: "Thanks for the feedback on the preprint!", time: "Mon" },
    ],
  },
  {
    id: 4,
    name: "Tunde Bakare",
    initials: "TB",
    institution: "University of Ibadan",
    unread: 0,
    messages: [],
  },
];

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Messages() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState(INITIAL_CONVERSATIONS[0].id);
  // On small screens only one pane shows at a time.
  const [showChat, setShowChat] = useState(false);

  const active = conversations.find((c) => c.id === activeId);

  const appendMessage = (id, message, extra = {}) =>
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...extra, messages: [...c.messages, message] }
          : c
      )
    );

  const handleSelect = (id) => {
    setActiveId(id);
    setShowChat(true);
    // Opening a conversation marks it as read.
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = (text) => {
    const id = activeId;
    appendMessage(id, { id: Date.now(), fromMe: true, text, time: currentTime() });

    // Stand-in for a real-time backend: fake a reply after a moment.
    setTimeout(() => {
      appendMessage(id, {
        id: Date.now() + 1,
        fromMe: false,
        text: "Thanks for your message, I'll get back to you shortly.",
        time: currentTime(),
      });
    }, 1500);
  };

  return (
    <AppShell maxWidth="max-w-6xl">
      <div className="grid h-[calc(100vh-4rem)] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-[320px_1fr]">
        <div className={showChat ? "hidden md:block" : "block"}>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
          />
        </div>
        <div className={showChat ? "block" : "hidden md:block"}>
          {active && (
            <ChatWindow
              conversation={active}
              onSend={handleSend}
              onBack={() => setShowChat(false)}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default Messages;
