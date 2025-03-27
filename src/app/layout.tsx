import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/layout/MainLayout';
import { ThemeProvider } from '@/hooks/useTheme';
import { NavigationProvider } from '@/hooks/useNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Past Papers',
  description: 'Access past papers and marking schemes across multiple subjects and sessions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <NavigationProvider>
            <MainLayout>{children}</MainLayout>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
