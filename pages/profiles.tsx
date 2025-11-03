// pages/profiles.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import Layout from "../components/Layout";
import ProfileCard from "../components/ProfileCard";

interface Profile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  personality: string;
  isBot: boolean;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        // NOTE: use the public 'profiles' collection (rules allow read:true)
        const snap = await getDocs(collection(db, "profiles"));
        const data: Profile[] = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Profile))
          .filter((p) => p.isBot !== false); // show bots (if isBot missing treat as bot)
        setProfiles(data);
      } catch (err: any) {
        console.error("Error fetching profiles:", {
          code: err?.code,
          message: err?.message,
          stack: err?.stack,
          customData: err?.customData || null,
        });
        setError(err?.message || "Failed to load profiles");
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-6">Choose Your Companion</h1>

        {loading ? (
          <p className="text-gray-400">Loading profiles...</p>
        ) : error ? (
          <div className="text-red-400">Failed to load profiles: {error}</div>
        ) : profiles.length === 0 ? (
          <p className="text-gray-400">No companion profiles found. (Try adding some in Firestore → profiles)</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} id={profile.id} name={profile.name} avatar={profile.avatar} bio={profile.bio} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
