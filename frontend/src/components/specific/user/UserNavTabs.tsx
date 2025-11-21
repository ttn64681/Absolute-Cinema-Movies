'use client';

import Link from 'next/link';

interface UserNavTabsProps {
  activeTab: 'profile' | 'payments' | 'orders';
}

export default function UserNavTabs({ activeTab }: UserNavTabsProps) {
  return (
    <div className="flex items-center justify-center gap-10 mt-2 mb-18 font-red-rose text-[30px]">
      <Link
        href="/user/profile"
        className={`font-bold transition-colors relative ${
          activeTab === 'profile' ? 'text-acm-pink' : 'text-gray-300 hover:text-white'
        }`}
      >
        Account Info
        {activeTab === 'profile' && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        )}
      </Link>
      <Link
        href="/user/payments"
        className={`font-bold transition-colors relative ${
          activeTab === 'payments' ? 'text-acm-pink' : 'text-gray-300 hover:text-white'
        }`}
      >
        Payment
        {activeTab === 'payments' && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        )}
      </Link>
      <Link
        href="/user/orders"
        className={`font-bold transition-colors relative ${
          activeTab === 'orders' ? 'text-acm-pink' : 'text-gray-300 hover:text-white'
        }`}
      >
        Order History
        {activeTab === 'orders' && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        )}
      </Link>
    </div>
  );
}

