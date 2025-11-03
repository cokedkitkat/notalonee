// components/ProfileCard.tsx
import Link from "next/link";

interface ProfileCardProps {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export default function ProfileCard({ id, name, avatar, bio }: ProfileCardProps) {
  return (
    <Link href={`/profile/${id}`}>
      <div className="bg-gray-900 hover:bg-gray-800 transition rounded-2xl p-4 cursor-pointer flex flex-col items-center text-center shadow-lg">
        <img
          src={avatar}
          alt={name}
          className="w-20 h-20 rounded-full object-cover mb-3 border border-gray-700"
        />
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{bio}</p>
      </div>
    </Link>
  );
}
