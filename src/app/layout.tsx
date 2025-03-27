import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { ThemeProvider } from '@/hooks/useTheme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Paper Void',
  description: 'Access past papers and marking schemes across multiple subjects and sessions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
