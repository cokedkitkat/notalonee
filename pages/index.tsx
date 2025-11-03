// pages/index.tsx
import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotAloneIndex() {
  const [isSubtitleVisible, setSubtitleVisible] = useState(false);
  const [isTitleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    setSubtitleVisible(true);

    const timer = setTimeout(() => {
      setTitleVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-inter">
      {/* --- Header --- */}
      <header className="flex justify-between items-center p-6 md:p-8">
        <div className="hover:scale-105 transition-all duration-300 cursor-pointer">
          <img src="/logo.png" alt="Not Alone Logo" className="h-6 md:h-8" />
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 font-medium">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-6 py-2 bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium">
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-4xl">
          <p
            className={`text-lg md:text-xl font-light tracking-wide mb-4 text-gray-300 transition-all duration-1000 ease-out ${
              isSubtitleVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            FROM NOW YOU ARE
          </p>
          <h1
            className={`relative text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight text-shadow-white-30 transition-all duration-2500 ease-out ${
              isTitleVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            <span className="relative z-10">NOT ALONE</span>
            <span className="absolute inset-[-20px] bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent,rgba(255,255,255,0.1),transparent)] bg-[400%_400%] animate-flowingGlow rounded-[20px] z-0 blur-[15px]"></span>
          </h1>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="py-8 px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm">
            © 2025 Not Alone. All rights reserved.
          </div>
          <div className="flex gap-6">
            {/* X */}
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
