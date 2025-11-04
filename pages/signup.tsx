// pages/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createUserProfile = async (uid: string, email: string, displayName?: string) => {
    console.log("Creating user profile for:", uid);
    
    try {
      // Check if profile already exists
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log("User profile already exists");
        return;
      }

      // Create the profile
      await setDoc(userRef, {
        name: displayName || email.split("@")[0],
        avatar: "/logo.png",
        bio: "Hey there! I'm new here 👋",
        personality: "",
        isBot: false,
        status: "online",
        createdAt: serverTimestamp(),
      });
      
      console.log("✅ User profile created successfully!");
    } catch (err: any) {
      console.error("❌ Failed to create user profile:", err);
      throw new Error(`Profile creation failed: ${err.message}`);
    }
  };

  const waitForAuth = (expectedUid: string): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds max

      const checkAuth = () => {
        attempts++;
        const currentUser = auth.currentUser;
        
        console.log(`Auth check attempt ${attempts}:`, {
          currentUser: currentUser?.uid,
          expected: expectedUid,
          match: currentUser?.uid === expectedUid
        });

        if (currentUser && currentUser.uid === expectedUid) {
          resolve(true);
        } else if (attempts >= maxAttempts) {
          console.warn("Auth propagation timeout");
          resolve(false);
        } else {
          setTimeout(checkAuth, 500);
        }
      };

      checkAuth();
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      console.log("Creating user account...");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const userEmail = cred.user.email || email;

      console.log("User created:", { uid, email: userEmail });

      // Wait for auth to propagate
      console.log("Waiting for auth propagation...");
      await waitForAuth(uid);

      // Create user profile
      await createUserProfile(uid, userEmail);

      console.log("Signup complete! Redirecting...");
      router.push("/profiles");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("Starting Google sign-in...");
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const uid = cred.user.uid;
      const userEmail = cred.user.email || "user@notalone.com";
      const displayName = cred.user.displayName || undefined;

      console.log("Google sign-in successful:", { 
        uid, 
        email: userEmail,
        displayName 
      });

      // Wait for auth to propagate
      console.log("Waiting for auth propagation...");
      await waitForAuth(uid);

      // Create user profile
      await createUserProfile(uid, userEmail, displayName);

      console.log("Google signup complete! Redirecting...");
      router.push("/profiles");
    } catch (err: any) {
      console.error("Google signup error:", err);
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white font-raleway overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/bg4.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/70 z-10"></div>

      <header className="relative z-20 p-6">
        <Link href="/">
          <img src="/logo.png" alt="Logo" className="h-10 cursor-pointer" />
        </Link>
      </header>

      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-6">
        <h1 className="text-4xl font-semibold mb-6">Create Account</h1>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4 max-w-sm w-full">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="w-full max-w-sm bg-black/80 p-6 rounded-lg shadow-md">
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
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            disabled={loading}
            className="w-full p-2 mb-3 rounded bg-black border border-gray-700 text-white disabled:opacity-50" 
          />

          <div className="flex items-center mb-3 text-sm">
            <input type="checkbox" required disabled={loading} className="mr-2" />
            <span>I agree to the Terms & Conditions</span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-6 py-2 bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium rounded mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <button 
            type="button" 
            onClick={handleGoogleSignup} 
            disabled={loading}
            className="w-full px-6 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300 font-medium rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGoogle /> {loading ? "Signing in..." : "Sign up with Google"}
          </button>

          <p className="text-gray-300 text-sm mt-3">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 underline">Login</Link>
          </p>
        </form>
      </main>

      <footer className="relative z-20 flex justify-between items-center p-6 text-gray-400 text-sm">
        <p>© 2025 Not Alone. All rights reserved.</p>
      </footer>
    </div>
  );
}