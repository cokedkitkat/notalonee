// pages/chats/[id].tsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { updateDoc, arrayUnion, doc, getDoc as getDocFirestore } from "firebase/firestore";
import { auth, db } from "../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import Layout from "../../components/Layout";
import {
  createOrGetChat,
  addMessageToChat,
  getOtherParticipantUid,
} from "../../lib/firestoreHelpers";
import { FiArrowLeft } from "react-icons/fi";

interface Message {
  readBy: any;
  id: string;
  text: string;
  senderUid: string;
  timestamp?: any;
  isBot?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { id: chatId } = router.query;

  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [contact, setContact] = useState<any>(null);
  const [personality, setPersonality] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load chat info + contact profile (wait for user & chatId)
  useEffect(() => {
    const loadChatInfo = async () => {
      if (!chatId || !user) return;

      try {
        const chatRef = doc(db, "chats", chatId as string);
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) return;

        const chatData: any = chatSnap.data();
        setPersonality(chatData.botPersonality || "");

        if (chatData.botProfile) {
          // Newer chats with embedded bot profile
          setContact({
            id: chatId,
            ...chatData.botProfile,
            isBot: true,
          });
        } else {
          // Fallback: find the other participant and fetch their profile
          const otherUid = await getOtherParticipantUid(chatId as string, user.uid);
          if (otherUid) {
            try {
              const userRef = doc(db, "users", otherUid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const uData: any = userSnap.data();
                setContact({
                  id: otherUid,
                  name: uData.name || "Unknown",
                  avatar: uData.avatar || "/logo.png",
                  status: uData.status || "offline",
                  isBot: !!uData.isBot,
                });
              } else {
                // user doc not found
                setContact({
                  id: otherUid,
                  name: "Unknown",
                  avatar: "/logo.png",
                  status: "offline",
                  isBot: false,
                });
              }
            } catch (err) {
              console.error("Failed to fetch other user profile:", err);
              setContact({
                id: otherUid,
                name: "Unknown",
                avatar: "/logo.png",
                status: "offline",
                isBot: false,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load chat info:", err);
      }
    };

    loadChatInfo();
  }, [chatId, user]);

  // Subscribe to messages + mark as read (safe: verify chat participants first)
  useEffect(() => {
    if (!chatId || !user) return;

    let unsubMessages: (() => void) | null = null;

    const setupListener = async () => {
      try {
        // Verify parent chat and participants
        const chatRef = doc(db, "chats", chatId as string);
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
          console.warn("Chat doc not found:", chatId);
          return;
        }
        const chatData: any = chatSnap.data();
        const participants: string[] = chatData.participants || [];
        if (!participants.includes(user.uid)) {
          console.warn("User is not a participant of this chat; aborting message listener.");
          return;
        }

        // Attach messages listener
        const q = query(
          collection(db, "chats", chatId as string, "messages"),
          orderBy("timestamp"),
          limit(500)
        );

        unsubMessages = onSnapshot(
          q,
          async (snapshot) => {
            try {
              const msgs = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              })) as Message[];

              setMessages(msgs);

              // Mark unread messages as read (do this sequentially to avoid race)
              for (const msg of msgs) {
                try {
                  if (!msg.readBy?.includes(user.uid)) {
                    const msgRef = doc(db, "chats", chatId as string, "messages", msg.id);
                    await updateDoc(msgRef, {
                      readBy: arrayUnion(user.uid),
                    });
                  }
                } catch (err) {
                  console.error("Failed to mark message as read:", err);
                }
              }
            } catch (err) {
              console.error("Error processing messages snapshot:", err);
            }
          },
          (err) => {
            console.error("messages onSnapshot error (pages/chats/[id].tsx):", err);
          }
        );
      } catch (err) {
        console.error("Failed to set up messages listener:", err);
      }
    };

    setupListener();

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [chatId, user]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format time
  const formatTime = (timestamp?: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !chatId) return;

    const text = newMessage;
    setNewMessage("");

    try {
      await addMessageToChat(chatId as string, user.uid, text, false);
    } catch (err) {
      console.error("Failed to add message:", err);
      return;
    }

    // Trigger bot reply
    if (contact?.isBot) {
      setTyping(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            personality, // pass personality
          }),
        });

        const data = await res.json();
        const reply = data.reply || "…";

        // Delay based on length (human-like)
        const delay = Math.min(4000, reply.length * 60);
        setTimeout(async () => {
          try {
            await addMessageToChat(chatId as string, user.uid, reply, true);
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
    }
  };

  return (
    <Layout>
      <div className="flex h-screen bg-black text-white">
        {contact ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
              <button
                onClick={() => router.push("/profiles")}
                className="text-gray-400 hover:text-white"
              >
                <FiArrowLeft size={22} />
              </button>
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-400">
                  {typing ? (
                    <div className="flex space-x-1">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce delay-150">•</span>
                      <span className="animate-bounce delay-300">•</span>
                    </div>
                  ) : (
                    contact.status || ""
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isUser = !msg.isBot;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
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
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Loading chat...
          </div>
        )}
      </div>
    </Layout>
  );
}
