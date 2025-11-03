// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../lib/firebaseConfig";
import DashboardCard from "../components/DashboardCard";
import { FaRobot, FaGamepad, FaUsers } from "react-icons/fa";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  orderBy,
  limit,
  doc,
} from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, [router]);

  // Listen for chats (safe) and compute unread messages by checking latest message per chat
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const chatDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          // For each chat, fetch the latest message (limit 1) and check readBy
          const unreadChecks = chatDocs.map(async (chat: any) => {
            try {
              const messagesQ = query(
                collection(db, "chats", chat.id, "messages"),
                orderBy("timestamp", "desc"),
                limit(1)
              );
              const msgSnap = await getDocs(messagesQ);
              if (msgSnap.empty) return 0;
              const latest = msgSnap.docs[0].data() as any;
              // If readBy doesn't include user.uid and sender isn't the user, count as unread
              if (
                latest &&
                (!latest.readBy || !latest.readBy.includes(user.uid)) &&
                latest.senderUid !== user.uid &&
                latest.sender !== user.email // fallback if senderUid absent
              ) {
                return 1;
              }
              return 0;
            } catch (err) {
              console.error("Error fetching latest message for chat", chat.id, err);
              return 0;
            }
          });

          const results = await Promise.all(unreadChecks);
          const total = results.reduce<number>((s, v) => s + v, 0);
          setUnreadCount(total);
        } catch (err) {
          console.error("Dashboard snapshot processing error:", err);
        }
      },
      (err) => {
        console.error("Dashboard onSnapshot error:", err);
      }
    );

    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white font-raleway flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10" />
          <h1 className="text-xl font-bold">NOT ALONE</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
        >
          Logout
        </button>
      </header>

      {/* Greeting */}
      <main className="flex-1 flex flex-col items-center text-center px-6 py-10">
        <h2 className="text-3xl font-semibold mb-2">Hey, welcome back 👋</h2>
        <p className="text-gray-400 mb-10">
          Here’s what’s happening in your world today…
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
          <DashboardCard
            title="Chats"
            description={
              unreadCount > 0
                ? `💬 You’ve got ${unreadCount} new message${
                    unreadCount > 1 ? "s" : ""
                  } waiting.`
                : "💬 All caught up! No new messages."
            }
            link="/chats"
            icon={<FaRobot />}
          />

          <DashboardCard
            title="Games"
            description="🎮 Last time, Funny Bot beat you in TicTacToe. Want revenge?"
            link="/games"
            icon={<FaGamepad />}
          />

          <DashboardCard
            title="Community"
            description="🌍 5 new posts since you last visited. Go see what’s up!"
            link="/community"
            icon={<FaUsers />}
          />
        </div>
      </main>
    </div>
  );
}
