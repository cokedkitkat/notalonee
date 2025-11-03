// components/DashboardCard.tsx
import Link from "next/link";

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  color?: string;
}

export default function DashboardCard({
  title,
  description,
  link,
  icon,
  color = "bg-gray-900",
}: DashboardCardProps) {
  return (
    <Link
      href={link}
      className={`${color} rounded-xl p-6 flex flex-col gap-3 hover:scale-105 transition-transform shadow-lg`}
    >
      <div className="text-3xl">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  );
}
