import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 shadow-md bg-white dark:bg-gray-900">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <img
        src="/logo.png"
        alt="Not Alone Logo"
        className="w-10 h-10 rounded-full"
        />

        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Not Alone
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-6">
        <Link
          href="/"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
        >
          Dashboard
        </Link>
        <Link
          href="/community"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
        >
          Community
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
