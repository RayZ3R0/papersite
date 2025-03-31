import { Inter } from 'next/font/google';
import './globals.css';
import AuthLayout from '@/components/auth/AuthLayout';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-text antialiased`}>
        <AuthLayout>
          {children}
        </AuthLayout>
      </body>
    </html>
  );
}
