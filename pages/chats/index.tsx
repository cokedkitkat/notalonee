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
  getDocs,
} from "firebase/firestore";
import Layout from "../../components/Layout";

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt?: any;
  botPersonality?: string;
  otherUid?: string;
  other?: any;
}

export default function ChatsListPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  // Track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load chats (safe: requires auth + array-contains filter)
 // replace your current "Load chats" useEffect with this
useEffect(() => {
  if (!user) return;

  let unsub: (() => void) | null = null;
  let cancelled = false;

  const attachListener = async (attempt = 0) => {
    console.log("[debug] attachListener attempt:", attempt, "user.uid:", user?.uid, "user.email:", user?.email);
    if (cancelled) return;
    if (!user?.uid) {
      console.warn("[debug] no user.uid yet - aborting attach");
      return;
    }

    // Try to ensure token is ready (best-effort)
    try {
      if (typeof user.getIdToken === "function") {
        const t = await user.getIdToken(false).catch(() => null);
        console.log("[debug] getIdToken available:", !!t);
      }
    } catch (e) {
      console.warn("[debug] getIdToken error:", e);
    }

    // One-off read test (not a realtime listen) to inspect permissions & doc shape
    try {
      console.log("[debug] Running one-off getDocs test for chats...");
      const qTest = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid),
        orderBy("updatedAt", "desc"),
        limit(5)
      );
      const snap = await getDocs(qTest);
      console.log("[debug] getDocs test succeeded, docCount:", snap.size);
      if (!snap.empty) {
        const first = snap.docs[0].data();
        console.log("[debug] first chat sample data:", first);
        console.log("[debug] participants sample:", first.participants);
      } else {
        console.log("[debug] getDocs returned 0 docs (no chats for this user)");
      }
    } catch (err) {
      console.error("[debug] one-off getDocs error (permission or query issue):", err);
    }

    // Attach real realtime listener
    try {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid),
        orderBy("updatedAt", "desc"),
        limit(100)
      );

      unsub = onSnapshot(
        q,
        async (snapshot) => {
          try {
            if (snapshot.empty) {
              setChats([]);
              return;
            }
            const chatDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            // same enrichment as before...
            // (keep existing enrichment logic you have)
          } catch (e) {
            console.error("[debug] error processing snapshot:", e);
          }
        },
        (err) => {
          console.error("chats onSnapshot error (pages/chats/index.tsx):", err);
          // do not retry here — we want to inspect the exact err
        }
      );
    } catch (err) {
      console.error("[debug] failed to attach onSnapshot:", err);
    }
  };

  attachListener();

  return () => {
    cancelled = true;
    if (unsub) unsub();
  };
}, [user]);



  // Format date
  const formatDate = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

        {chats.length === 0 ? (
          <p className="text-gray-400">No chats yet. Go to Profiles to start one!</p>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => router.push(`/chats/${chat.id}`)}
                className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 rounded-xl p-4 cursor-pointer transition"
              >
                <img
                  src={chat.other?.avatar || "/icons/default.png"}
                  alt={chat.other?.name || "Companion"}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold">{chat.other?.name || "Unknown"}</div>
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
