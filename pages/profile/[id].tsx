// pages/profile/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { createOrGetChat } from "../../lib/firestoreHelpers";

export default function ProfileDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load profile data from PROFILES collection (not users)
  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      
      try {
        console.log("Loading profile:", id);
        
        // Read from 'profiles' collection (publicly readable)
        const profileRef = doc(db, "profiles", id as string);
        const snap = await getDoc(profileRef);
        
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          console.log("Profile loaded:", data);
          setProfile(data);
        } else {
          console.warn("Profile not found:", id);
          setError("Profile not found");
        }
      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  // Start chat
  const handleMessage = async () => {
    if (!user) {
      alert("Please log in to start a chat");
      router.push("/login");
      return;
    }
    
    if (!profile) return;

    try {
      console.log("Creating chat with:", profile.id);
      
      const chatId = await createOrGetChat(
        user.uid,
        profile.id,
        profile.personality || null,
        {
          name: profile.name,
          avatar: profile.avatar,
          status: profile.status || "online",
        }
      );

      console.log("Chat created:", chatId);
      router.push(`/chats/${chatId}`);
    } catch (err: any) {
      console.error("Error starting chat:", err);
      alert("Failed to start chat. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Oops!</h1>
          <p className="text-gray-400 mb-6">{error || "Profile not found"}</p>
          <button
            onClick={() => router.push("/profiles")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
          >
            Back to Profiles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-gray-800">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          ← Back
        </button>
      </header>

      {/* Profile Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="max-w-md w-full text-center">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-32 h-32 rounded-full mb-6 object-cover mx-auto border-4 border-gray-800"
          />
          
          <h1 className="text-3xl font-semibold mb-2">{profile.name}</h1>
          
          {profile.personality && (
            <div className="inline-block px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm mb-4">
              {profile.personality}
            </div>
          )}
          
          <p className="text-gray-400 mt-4 mb-8">{profile.bio}</p>

          {profile.isBot && (
            <div className="bg-gray-900 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">About this companion</h3>
              <p className="text-sm text-gray-400">
                This is an AI companion ready to chat with you anytime. Start a conversation and explore what we can talk about!
              </p>
            </div>
          )}

          <button
            onClick={handleMessage}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition font-medium"
          >
            Start Chatting
          </button>
        </div>
      </main>
    </div>
  );
}