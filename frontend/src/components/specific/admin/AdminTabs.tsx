'use client';

import Link from 'next/link';
import { PiHouse } from 'react-icons/pi';

type AdminTab = 'movies' | 'pricing' | 'users';

interface AdminTabsProps {
  activeTab: AdminTab;
}

const tabConfig: { key: AdminTab; href: string; label: string; title: string }[] = [
  { key: 'movies', href: '/admin/movies', label: 'Manage Movies', title: 'Manage movies and scheduling' },
  { key: 'pricing', href: '/admin/pricing', label: 'Manage Pricing', title: 'Manage pricing, fees, and discounts' },
  { key: 'users', href: '/admin/users', label: 'Manage Users', title: 'Manage users' },
];

export default function AdminTabs({ activeTab }: AdminTabsProps) {
  return (
    <div className="flex items-center justify-center gap-10 text-[30px] font-red-rose mt-2 mb-18">
      <Link
        href="/admin"
        title="Admin home"
        className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-acm-pink to-acm-orange px-4 py-2 text-base font-afacad font-medium text-black hover:text-white shadow-md ring-1 ring-white/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2 -translate-x-[3px]">
          <PiHouse className="text-2xl translate-x-[2px] -translate-y-px" aria-hidden />
          <span className="text-xl">Home</span>
        </div>
      </Link>
      {tabConfig.map(({ key, href, label, title }) => {
        const isActive = activeTab === key;
        return (
          <Link
            key={key}
            href={href}
            title={title}
            className={
              isActive
                ? 'relative cursor-pointer font-bold text-[#FF478B]'
                : 'text-gray-300 hover:text-white transition-colors cursor-pointer font-bold'
            }
          >
            {label}
            {isActive && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
