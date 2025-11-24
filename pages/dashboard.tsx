// pages/dashboard.tsx - WORKING VERSION
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import DashboardCard from "../components/DashboardCard";
import { FaRobot, FaGamepad, FaUsers } from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  // Track auth and wait for it to be fully ready
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
      } else {
        console.log("User authenticated:", u.uid);
        
        // Wait for token to be ready
        try {
          await u.getIdToken(false);
          console.log("Auth token ready");
        } catch (e) {
          console.warn("Token not immediately available");
        }
        
        setUser(u);
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!authReady || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-raleway flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10" />
          <h1 className="text-xl font-bold">NOT ALONE</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Greeting */}
      <main className="flex-1 flex flex-col items-center text-center px-6 py-10">
        <h2 className="text-3xl font-semibold mb-2">Hey, welcome back 👋</h2>
        <p className="text-gray-400 mb-10">
          Ready to connect? Choose what you'd like to do today…
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
          <DashboardCard
            title="Browse Companions"
            description="💬 Discover AI companions and start meaningful conversations"
            link="/profiles"
            icon={<FaRobot />}
            color="bg-gradient-to-br from-gray-900 to-gray-800"
          />

          <DashboardCard
            title="Your Chats"
            description="💭 Continue your conversations and connect with companions"
            link="/chats"
            icon={<FaRobot />}
            color="bg-gradient-to-br from-purple-600 to-purple-600"
          />

          <DashboardCard
            title="Games"
            description="🎮 Challenge companions to fun games and activities"
            link="/games"
            icon={<FaGamepad />}
            color="bg-gradient-to-br from-green-900 to-green-800"
          />

          <DashboardCard
            title="Community"
            description="🌍 Connect with others and explore the community"
            link="/community"
            icon={<FaUsers />}
            color="bg-gradient-to-br from-pink-900 to-pink-800"
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">0</div>
            <div className="text-xs text-gray-500 mt-1">Active Chats</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">0</div>
            <div className="text-xs text-gray-500 mt-1">Games Played</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">0</div>
            <div className="text-xs text-gray-500 mt-1">Friends</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-pink-400">New</div>
            <div className="text-xs text-gray-500 mt-1">Member</div>
          </div>
        </div>
      </main>
    </div>
  );
}