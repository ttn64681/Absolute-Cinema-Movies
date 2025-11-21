'use client';

import Image from 'next/image';

interface UserProfileSidebarProps {
  profilePicUrl?: string | null;
  onLogout?: () => void;
}

export default function UserProfileSidebar({ profilePicUrl, onLogout }: UserProfileSidebarProps) {
  return (
    <aside className="flex flex-col items-center gap-6 -mt-2 md:-mt-20">
      <div className="rounded-full flex items-center justify-center w-[170px] h-[170px] bg-[#2B2B2B]">
        {profilePicUrl ? (
          <Image
            src={profilePicUrl}
            alt="Profile"
            width={170}
            height={170}
            className="w-full h-full rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#EDEDED" strokeWidth="1.2">
            <circle cx="12" cy="8" r="4" />
            <path d="M3 21c2.2-4.2 6.1-6 9-6s6.8 1.8 9 6" />
          </svg>
        )}
      </div>
      {onLogout && (
        <button
          className="text-[#FF478B] hover:text-[#FF3290] font-afacad text-lg cursor-pointer"
          type="button"
          onClick={onLogout}
        >
          Log Out
        </button>
      )}
    </aside>
  );
}

