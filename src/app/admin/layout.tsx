'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RouteGuard } from '@/components/admin/RouteGuard';

const adminLinks = [
  { href: '/admin/users', label: 'Users' },
  // Add more admin links here as we build them
  // { href: '/admin/subjects', label: 'Subjects' },
  // { href: '/admin/sessions', label: 'Sessions' },
  // { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RouteGuard>
      <div className="min-h-screen bg-surface dark:bg-surface-dark">
      {/* Admin Header */}
      <header className="bg-surface-hover dark:bg-surface-hover-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo/Brand */}
              <div className="flex-shrink-0 flex items-center">
                <Link 
                  href="/"
                  className="text-lg font-bold text-text"
                >
                  Papersite Admin
                </Link>
              </div>

              {/* Navigation */}
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {adminLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-text-muted hover:text-text hover:bg-surface-hover dark:hover:bg-surface-hover-dark'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side actions - can add more later */}
            <div className="flex items-center">
              <Link
                href="/"
                className="text-text-muted hover:text-text text-sm"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="sm:hidden border-t border-border">
          <div className="px-2 py-3 space-y-1">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover dark:hover:bg-surface-hover-dark'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
      </div>
    </RouteGuard>
  );
}