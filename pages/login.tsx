// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirectUser = async (uid: string) => {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      router.push("/profiles"); // new user, no chats yet
    } else {
      router.push("/chats"); // returning user with chats
    }
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log("Signed in:", { uid: cred.user.uid, email: cred.user.email });
    router.push("/dashboard");
  } catch (err: any) {
    console.error("Login error:", err);
    setError(err?.message || "Unknown login error");
  }
};


const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    console.log("Google sign-in:", { uid: cred.user.uid, email: cred.user.email });
    router.push("/dashboard");
  } catch (err: any) {
    console.error("Google login error:", err);
    setError(err?.message || "Unknown Google login error");
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

        {error && <p className="text-red-500 mb-4">{error}</p>}

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
            className="w-full p-2 mb-3 rounded bg-black border border-gray-700 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 mb-3 rounded bg-black border border-gray-700 text-white"
          />

          <button
            type="submit"
            className="w-full px-6 py-2 bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium rounded mb-3"
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full px-6 py-2 bg-black-500 text-white hover:bg-gray-600 transition-all duration-300 font-medium rounded flex items-center justify-center gap-2"
          >
            <FaGoogle /> Login with Google
          </button>

          <p className="text-gray-300 text-sm mt-3">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-blue-400 underline">
              Sign Up
            </Link>
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="relative z-20 flex justify-between items-center p-6 text-gray-400 text-sm">
        <p>© 2025 Not Alone. All rights reserved.</p>
        <div className="flex gap-6">{/* social icons */}</div>
      </footer>
    </div>
  );
}
