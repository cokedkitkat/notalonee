// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ensure user profile exists - with proper auth waiting
  const ensureUserProfile = async (uid: string, email: string, displayName?: string) => {
    // Wait for auth to fully propagate
    let attempts = 0;
    while (attempts < 10) {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        try {
          await currentUser.getIdToken(true); // Force refresh token
          break;
        } catch (e) {
          console.log("Waiting for token... attempt", attempts + 1);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log("User profile missing, creating one...");
        await setDoc(userRef, {
          name: displayName || email.split("@")[0],
          avatar: "/logo.png",
          bio: "Hey there! 👋",
          personality: "",
          isBot: false,
          status: "online",
          createdAt: serverTimestamp(),
        });
        console.log("✅ User profile created");
      } else {
        console.log("✅ User profile already exists");
      }
    } catch (err: any) {
      console.error("Failed to ensure user profile:", err.message);
      // Don't throw - let them proceed to dashboard anyway
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Signing in...");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Signed in:", { uid: cred.user.uid, email: cred.user.email });
      
      // Ensure user profile exists
      await ensureUserProfile(cred.user.uid, cred.user.email || email);
      
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Failed to sign in");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("Starting Google sign-in...");
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      console.log("Google sign-in:", { 
        uid: cred.user.uid, 
        email: cred.user.email,
        displayName: cred.user.displayName 
      });
      
      // Ensure user profile exists
      await ensureUserProfile(
        cred.user.uid, 
        cred.user.email || "user@notalone.com",
        cred.user.displayName || undefined
      );
      
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err?.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white font-raleway overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background1.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-10"></div>

      {/* Logo */}
      <header className="relative z-20 p-6">
        <Link href="/">
          <img src="/logo.png" alt="Logo" className="h-10 cursor-pointer" />
        </Link>
      </header>

      {/* Form */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-6">
        <h1 className="text-4xl font-semibold mb-6">Login</h1>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4 max-w-sm w-full">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-black/80 p-6 rounded-lg shadow-md"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full p-2 mb-3 rounded bg-black border border-gray-700 text-white disabled:opacity-50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full p-2 mb-3 rounded bg-black border border-gray-700 text-white disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium rounded mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-6 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300 font-medium rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGoogle /> {loading ? "Signing in..." : "Login with Google"}
          </button>

          <p className="text-gray-300 text-sm mt-3">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-400 underline">
              Sign Up
            </Link>
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="relative z-20 flex justify-between items-center p-6 text-gray-400 text-sm">
        <p>© 2025 Not Alone. All rights reserved.</p>
      </footer>
    </div>
  );
}