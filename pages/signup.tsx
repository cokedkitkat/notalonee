// pages/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const redirectUser = async (uid: string) => {
    try {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", uid)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        router.push("/profiles");
      } else {
        router.push("/chats");
      }
    } catch (err: any) {
      console.error("redirectUser error:", err);
      // fallback
      router.push("/profiles");
    }
  };

  const createUserProfile = async (uid: string, email: string) => {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      name: email.split("@")[0],
      avatar: "/icons/default.png",
      bio: "Hey there! I'm new here 👋",
      personality: "",
      isBot: false,
      createdAt: serverTimestamp(),
    });
  };

  // Wait until auth.currentUser appears and/or token is available
  const waitForAuthPropagation = async (expectedUid: string, timeout = 7000) => {
    const start = Date.now();

    // quick check if already present
    if (auth.currentUser && auth.currentUser.uid === expectedUid) {
      try {
        await getIdToken(auth.currentUser, /* forceRefresh= */ false);
        return true;
      } catch {}
    }

    return new Promise<boolean>((resolve) => {
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (u && u.uid === expectedUid) {
          try {
            // try to get token (ensures token attached for Firestore rules)
            await getIdToken(u, /* forceRefresh= */ true);
            unsub();
            resolve(true);
          } catch (tokErr) {
            // token not ready yet — but we'll still resolve true to proceed with caution
            console.warn("waitForAuthPropagation: token not ready but user found", tokErr);
            unsub();
            resolve(true);
          }
        } else if (Date.now() - start > timeout) {
          try {
            unsub();
          } catch {}
          resolve(false);
        }
      });

      // safety timeout
      setTimeout(() => {
        try {
          unsub();
        } catch {}
        resolve(false);
      }, timeout);
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const userEmail = cred.user.email || email;

      const ok = await waitForAuthPropagation(uid);
      if (!ok) {
        // proceed but warn (most of the time token will be available; if not user can re-login)
        console.warn("Auth propagation may be slow — attempted profile creation anyway.");
      }

      // create profile (firestore rules require auth.uid === userId)
      try {
        await createUserProfile(uid, userEmail);
      } catch (profileErr) {
        console.warn("createUserProfile warning:", profileErr);
      }

      await redirectUser(uid);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(`${err.code || "error"} — ${err.message || "An error occurred"}`);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const uid = cred.user.uid;
      const userEmail = cred.user.email || "user@notalone.com";

      const ok = await waitForAuthPropagation(uid);
      if (!ok) {
        console.warn("Auth propagation slow after Google sign-in.");
      }

      try {
        await createUserProfile(uid, userEmail);
      } catch (profileErr) {
        console.warn("createUserProfile warning:", profileErr);
      }

      await redirectUser(uid);
    } catch (err: any) {
      console.error("Google signup error:", err);
      setError(`${err.code || "error"} — ${err.message || "An error occurred"}`);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white font-raleway overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/bg2.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/70 z-10"></div>

      <header className="relative z-20 p-6">
        <Link href="/">
          <img src="/logo.png" alt="Logo" className="h-10 cursor-pointer" />
        </Link>
      </header>

      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-6">
        <h1 className="text-4xl font-semibold mb-6">Create Account</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="w-full max-w-sm bg-black/80 p-6 rounded-lg shadow-md">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 mb-3 rounded bg-black border border-gray-700 text-white" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 mb-3 rounded bg-black border border-gray-700 text-white" />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-2 mb-3 rounded bg-black border border-gray-700 text-white" />

          <div className="flex items-center mb-3 text-sm">
            <input type="checkbox" required className="mr-2" />
            <span>I agree to the Terms & Conditions</span>
          </div>

          <button type="submit" className="w-full px-6 py-2 bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium rounded mb-3">Sign Up</button>

          <button type="button" onClick={handleGoogleSignup} className="w-full px-6 py-2 bg-black-500 text-white hover:bg-gray-600 transition-all duration-300 font-medium rounded flex items-center justify-center gap-2">
            <FaGoogle /> Sign up with Google
          </button>

          <p className="text-gray-300 text-sm mt-3">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 underline">Login</Link>
          </p>
        </form>
      </main>

      <footer className="relative z-20 flex justify-between items-center p-6 text-gray-400 text-sm">
        <p>© 2025 Not Alone. All rights reserved.</p>
        <div className="flex gap-6"></div>
      </footer>
    </div>
  );
}
