'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { AuthProvider } from '@/components/auth/AuthContext';

const adminLinks = [
  { href: '/admin/users', label: 'Users' },
  // Add more admin links here as we build them
];

function AdminContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // Debug log
  console.log('Admin Content State:', {
    user,
    isLoading,
    pathname,
    isAdmin: user?.role === 'admin',
    userRole: user?.role
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="text-text">Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="p-6 max-w-sm mx-auto bg-error/10 border border-error rounded-lg text-error text-center">
          <div>Please sign in to access this area</div>
          <button 
            onClick={() => window.location.href = '/auth/login?returnTo=' + encodeURIComponent(pathname)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Not admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="p-6 max-w-sm mx-auto bg-error/10 border border-error rounded-lg text-error text-center">
          <div>You must be an administrator to access this area.</div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 text-xs text-left bg-black/5 p-2 rounded">
              {JSON.stringify({
                user: {
                  username: user.username,
                  role: user.role,
                  id: user._id
                }
              }, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      {/* Admin Header */}
      <header className="bg-surface-hover dark:bg-surface-hover-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link 
                  href="/admin"
                  className="text-lg font-bold text-text"
                >
                  Papersite Admin
                </Link>
              </div>

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

            <div className="flex items-center space-x-4">
              <span className="text-sm text-text">
                {user.username} ({user.role})
              </span>
              <Link
                href="/"
                className="text-text-muted hover:text-text text-sm"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminContent>{children}</AdminContent>
    </AuthProvider>
  );
}