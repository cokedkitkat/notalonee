// components/Sidebar.tsx
import Link from "next/link";
import { FiMessageSquare, FiUsers, FiGrid } from "react-icons/fi"; // example icons

export default function Sidebar() {
  return (
    <div className="w-64 bg-black text-white h-screen flex flex-col border-r border-gray-800">
      <div className="p-4 text-xl font-bold border-b border-gray-800">
        NOT ALONE
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {/* Chats */}
        <Link href="/chats">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-900 cursor-pointer">
            <FiMessageSquare />
            <span>Chats</span>
          </div>
        </Link>

        {/* Games */}
        <Link href="/games">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-900 cursor-pointer">
            <FiGrid />
            <span>Games</span>
          </div>
        </Link>

        {/* Community */}
        <Link href="/community">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-900 cursor-pointer">
            <FiUsers />
            <span>Community</span>
          </div>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
          Logout
        </button>
      </div>
    </div>
  );
}
