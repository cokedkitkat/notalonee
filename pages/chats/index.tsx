// pages/chats/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  limit,
  getDoc,
} from "firebase/firestore";
import Layout from "../../components/Layout";

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt?: any;
  botPersonality?: string;
  botProfile?: any;
  otherUid?: string;
  other?: any;
}

export default function ChatsListPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load chats
  useEffect(() => {
    if (!user) return;

    console.log("Setting up chat listener for user:", user.uid);
    setLoading(true);
    setError("");

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
      limit(100) // REQUIRED by your Firestore rules
    );

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        console.log("Chats snapshot received, docs:", snapshot.size);
        
        if (snapshot.empty) {
          console.log("No chats found for user");
          setChats([]);
          setLoading(false);
          return;
        }

        try {
          const chatDocs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Chat[];

          console.log("Processing", chatDocs.length, "chats");

          // Enrich with other participant info
          const enriched = await Promise.all(
            chatDocs.map(async (chat) => {
              try {
                // Find the other participant (not the current user)
                const otherUid = chat.participants.find((p) => p !== user.uid);
                
                if (!otherUid) {
                  console.warn("No other participant found for chat", chat.id);
                  return chat;
                }

                // Try to get their profile
                let otherProfile: any = null;

                // First check if botProfile is embedded in the chat
                if (chat.botProfile) {
                  otherProfile = chat.botProfile;
                } else {
                  // Otherwise fetch from users collection
                  try {
                    const userRef = doc(db, "users", otherUid);
                    const userSnap = await getDoc(userRef);
                    
                    if (userSnap.exists()) {
                      const userData = userSnap.data();
                      otherProfile = {
                        name: userData.name || "Unknown",
                        avatar: userData.avatar || "/logo.png",
                        status: userData.status || "offline",
                      };
                    }
                  } catch (err) {
                    console.warn("Failed to fetch user profile for", otherUid, err);
                  }
                }

                // Fallback if we still don't have a profile
                if (!otherProfile) {
                  otherProfile = {
                    name: "Unknown Companion",
                    avatar: "/logo.png",
                    status: "offline",
                  };
                }

                return {
                  ...chat,
                  otherUid,
                  other: otherProfile,
                };
              } catch (err) {
                console.error("Error enriching chat", chat.id, err);
                return chat;
              }
            })
          );

          console.log("Enriched chats:", enriched);
          setChats(enriched);
          setLoading(false);
        } catch (err) {
          console.error("Error processing chats snapshot:", err);
          setError("Error loading chats");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Chats onSnapshot error:", err);
        setError(`Permission error: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Format date
  const formatDate = (ts: any) => {
    if (!ts) return "";
    try {
      const d = ts.toDate();
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-gray-400">
          Please log in
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-6">Your Chats</h1>

        {loading ? (
          <p className="text-gray-400">Loading chats...</p>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-400 font-semibold">Error:</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
            <p className="text-gray-400 text-xs mt-2">
              Check your browser console for more details.
            </p>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No chats yet. Start a conversation!</p>
            <button
              onClick={() => router.push("/profiles")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
            >
              Browse Companions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => router.push(`/chats/${chat.id}`)}
                className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 rounded-xl p-4 cursor-pointer transition"
              >
                <img
                  src={chat.other?.avatar || "/logo.png"}
                  alt={chat.other?.name || "Companion"}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {chat.other?.name || "Unknown Companion"}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {chat.lastMessage || "No messages yet"}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(chat.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}