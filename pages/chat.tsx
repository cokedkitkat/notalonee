// pages/chat.tsx
import { useEffect, useState, useRef } from "react";
import { auth, db } from "../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import Layout from "../components/Layout";
import { FiMenu, FiArrowLeft } from "react-icons/fi";

interface Contact {
  id: string;
  name: string;
  status: string; // "online" / "last seen ..."
  avatar: string; // avatar image path
}

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp?: Timestamp;
}

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [contacts] = useState<Contact[]>([
    {
      id: "bot1",
      name: "Companion Bot",
      status: "online",
      avatar: "/icons/bot1.png",
    },
    {
      id: "bot2",
      name: "Friendly Bot",
      status: "last seen 2m ago",
      avatar: "/icons/bot2.png",
    },
  ]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [showContacts, setShowContacts] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track user auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Subscribe to messages (safe: waits for user + activeContact)
  useEffect(() => {
    if (!user || !activeContact) return;

    const messagesColQuery = query(
      collection(db, "users", user.uid, "chats", activeContact.id, "messages"),
      orderBy("timestamp"),
      limit(500)
    );

    const unsub = onSnapshot(
      messagesColQuery,
      (snapshot) => {
        try {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
          setMessages(msgs);
        } catch (err) {
          console.error("Error parsing messages snapshot:", err);
        }
      },
      (err) => {
        // Helpful log if Firestore refuses the listen (permission error etc.)
        console.error("messages onSnapshot error (chat.tsx):", err);
      }
    );

    return () => unsub();
  }, [user, activeContact]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format time
  const formatTime = (timestamp?: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeContact) return;

    const msgToSend = newMessage;
    setNewMessage("");

    try {
      await addDoc(
        collection(db, "users", user.uid, "chats", activeContact.id, "messages"),
        {
          text: msgToSend,
          sender: user.email,
          timestamp: serverTimestamp(),
        }
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      return;
    }

    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgToSend }),
      });

      const data = await res.json();
      const reply = data.reply || "…";

      const delay = Math.min(4000, reply.length * 60);
      setTimeout(async () => {
        try {
          await addDoc(
            collection(db, "users", user.uid, "chats", activeContact.id, "messages"),
            {
              text: reply,
              sender: activeContact.name,
              timestamp: serverTimestamp(),
            }
          );
        } catch (err) {
          console.error("Failed to save bot reply:", err);
        } finally {
          setTyping(false);
        }
      }, delay);
    } catch (err) {
      console.error("Chat API error:", err);
      setTyping(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-screen bg-black text-white">
        {/* Contacts list */}
        <aside
          className={`${
            showContacts ? "block" : "hidden"
          } md:block w-80 border-r border-gray-800 flex flex-col absolute md:relative bg-black z-10 h-full`}
        >
          <div className="p-4 text-lg font-semibold border-b border-gray-800 flex items-center justify-between">
            <span>Contacts</span>
            <button
              onClick={() => setShowContacts(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <FiArrowLeft size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveContact(c);
                  setShowContacts(false);
                }}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-900 transition ${
                  activeContact?.id === c.id ? "bg-gray-900" : ""
                }`}
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-400">{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat window */}
        <div className="flex-1 flex flex-col relative">
          {activeContact ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{activeContact.name}</div>
                    <div className="text-sm text-gray-400">
                      {typing ? (
                        <div className="flex space-x-1">
                          <span className="animate-bounce">•</span>
                          <span className="animate-bounce delay-150">•</span>
                          <span className="animate-bounce delay-300">•</span>
                        </div>
                      ) : (
                        activeContact.status
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowContacts(true)}
                  className="md:hidden text-gray-400 hover:text-white"
                >
                  <FiMenu size={22} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isUser = msg.sender === user?.email;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isUser && activeContact && (
                        <img
                          src={activeContact.avatar}
                          alt={activeContact.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          isUser ? "bg-blue-600" : "bg-gray-800"
                        }`}
                      >
                        <div>{msg.text}</div>
                        <div className="text-xs text-gray-400 mt-1 text-right">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded bg-gray-900 text-white focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a contact to start chatting
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
