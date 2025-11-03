// components/Layout.tsx
import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 flex flex-col">
        {/* Logo + Title */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold">NOT ALONE</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col p-4 space-y-4">
          <Link
            href="/chats"
            className="flex items-center gap-3 p-3 rounded hover:bg-gray-900 transition"
          >
            <img src="/icons/chat.png" alt="Chats" className="w-6 h-6" />
            <span>Chats</span>
          </Link>

          <Link
            href="/games"
            className="flex items-center gap-3 p-3 rounded hover:bg-gray-900 transition"
          >
            <img src="/icons/game.png" alt="Games" className="w-6 h-6" />
            <span>Games</span>
          </Link>

          <Link
            href="/community"
            className="flex items-center gap-3 p-3 rounded hover:bg-gray-900 transition"
          >
            <img src="/icons/community.png" alt="Community" className="w-6 h-6" />
            <span>Community</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
          © 2025 Not Alone
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
