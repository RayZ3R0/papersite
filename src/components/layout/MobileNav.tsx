'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookIcon,
  FileTextIcon,
  GridIcon,
  MessageCircleIcon,
  SearchIcon
} from './icons';

export default function MobileNav() {
  const pathname = usePathname();
  
  const links = [
    {
      href: '/books',
      label: 'Books',
      icon: BookIcon
    },
    {
      href: '/notes',
      label: 'Notes',
      icon: FileTextIcon
    },
    {
      href: '/subjects',
      label: 'Subjects',
      icon: GridIcon
    },
    {
      href: '/forum',
      label: 'Forum',
      icon: MessageCircleIcon
    },
    {
      href: '/search',
      label: 'Search',
      icon: SearchIcon
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border h-14 safe-bottom">
      <div className="flex justify-around items-center h-full px-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center
                w-16 -mt-1 rounded-lg
                ${isActive 
                  ? 'text-primary' 
                  : 'text-text-muted hover:text-text'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}