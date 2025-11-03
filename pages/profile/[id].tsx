// pages/profiles/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { createOrGetChat } from "../../lib/firestoreHelpers";

export default function ProfileDetail() {
  const router = useRouter();
  const { id } = router.query; // profile id (bot or user)
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  // Track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Load profile data
  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      const profileRef = doc(db, "users", id as string);
      const snap = await getDoc(profileRef);
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      }
    };

    loadProfile();
  }, [id]);

  // Start chat
  // Start chat
const handleMessage = async () => {
  if (!user || !profile) return;

  try {
    const chatId = await createOrGetChat(
      user.uid,
      profile.id,
      profile.personality || null,
      {
        name: profile.name,
        avatar: profile.avatar,
      } // 👈 pass bot info into chat doc
    );

    router.push(`/chats/${chatId}`);
  } catch (err) {
    console.error("Error starting chat:", err);
  }
};
  // Render loading state

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">
      <img
        src={profile.avatar}
        alt={profile.name}
        className="w-32 h-32 rounded-full mb-4 object-cover"
      />
      <h1 className="text-3xl font-semibold">{profile.name}</h1>
      <p className="text-gray-400 mt-2">{profile.bio}</p>
      <p className="text-sm text-gray-500 mt-1 italic">
        Personality: {profile.personality}
      </p>

      <button
        onClick={handleMessage}
        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
      >
        Message
      </button>
    </div>
  );
}
