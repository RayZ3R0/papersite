import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/hooks/useTheme';
import ThemeToggle from '@/components/layout/ThemeToggle';
import MobileNav from '@/components/layout/MobileNav';
import Logo from '@/components/layout/Logo';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-text`}>
        <ThemeProvider>
          {/* Top navigation - Logo and theme toggle on mobile, full nav on desktop */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-14">
                {/* Logo */}
                <Logo />

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                  <Link href="/books" className="text-sm font-medium hover:text-primary">Books</Link>
                  <Link href="/notes" className="text-sm font-medium hover:text-primary">Notes</Link>
                  <Link href="/subjects" className="text-sm font-medium hover:text-primary">Subjects</Link>
                  <Link href="/forum" className="text-sm font-medium hover:text-primary">Forum</Link>
                  <Link href="/search" className="text-sm font-medium hover:text-primary">Search</Link>
                </nav>

                {/* Theme Toggle */}
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="container mx-auto px-4 pb-20 md:pb-8">
            {children}
          </main>

          {/* Mobile navigation at bottom */}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
