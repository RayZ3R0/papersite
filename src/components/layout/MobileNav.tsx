import { useState } from 'react';
import Link from 'next/link';

interface MobileNavProps {
  className?: string;
}

export const MobileNav = ({ className = '' }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Subjects', href: '/subjects' },
    { name: 'Search', href: '/search' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden ${className}`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center w-full h-full text-sm text-gray-600 hover:text-gray-900"
          >
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;