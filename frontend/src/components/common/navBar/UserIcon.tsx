import React from 'react';
import { FaRegUser } from 'react-icons/fa';

interface UserIconProps {
  onClick: () => void;
  className?: string;
}

export default function UserIcon({
  onClick,
  className = 'text-white hover:text-red-500 transition-colors cursor-pointer',
}: UserIconProps) {
  return (
    <button title="User Icon" type="button" onClick={onClick} className={className}>
      <FaRegUser className="w-6 h-6 translate-y-[4px]" />
    </button>
  );
}
