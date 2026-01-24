import React from 'react';
import Link from 'next/link';

interface MenuItemProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function MenuItem({
  href,
  onClick,
  children,
  className = 'block px-4 py-3 text-white text-sm transition-all duration-200 hover:bg-white/10 hover:text-acm-pink cursor-pointer',
}: MenuItemProps) {
  const baseStyle = { color: 'white' };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // transparent white color w/ 10% opacity
    e.currentTarget.style.color = '#FF478B'; // light pink color
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = 'white';
  };

  // If href is provided, render as Link, otherwise as button
  if (href) {
    return (
      <Link
        href={href}
        className={className}
        style={baseStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        title="Menu Item"
      >
        {children}
      </Link>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔘 MenuItem: Button clicked, calling onClick');
    onClick?.();
  };

  return (
    <button
      type="button"
      className={`w-full text-left text-white ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title="Menu Item"
    >
      {children}
    </button>
  );
}
