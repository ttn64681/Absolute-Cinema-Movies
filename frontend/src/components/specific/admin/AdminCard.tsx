import Link from 'next/link';

interface AdminCardProps {
  href: string;
  title: string;
}

export default function AdminCard({ href, title }: AdminCardProps) {
  return (
    <Link href={href} className="group">
      <div 
        className="rounded-lg p-6 border hover:border-acm-pink transition-colors flex flex-col items-center justify-center text-center min-h-40 hover:!bg-[#2d2d2d]" 
        style={{ backgroundColor: '#242424', borderColor: '#3a3a3a' }}
      >
        <div className="text-3xl font-afacad group-hover:text-gray-400">{title}</div>
      </div>
    </Link>
  );
}

