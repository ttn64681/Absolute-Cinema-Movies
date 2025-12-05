'use client';

import Image from 'next/image';

interface ProfilePictureUploadProps {
  profilePicUrl?: string | null;
  userProfileImageLink?: string | null;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfilePictureUpload({
  profilePicUrl,
  userProfileImageLink,
  onImageUpload,
}: ProfilePictureUploadProps) {
  return (
    <div className="relative group">
      <input
        title="Upload Profile Picture"
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full z-10"
      />
      <div className="rounded-full flex items-center justify-center transition-colors w-[170px] h-[170px] bg-[#2B2B2B]">
        {profilePicUrl || userProfileImageLink ? (
          <Image
            src={profilePicUrl || (userProfileImageLink as string)}
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
        {/* Edit overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity">
          <span className="text-white font-afacad text-lg font-bold">Edit</span>
        </div>
      </div>
    </div>
  );
}



