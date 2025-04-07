"use client";

import "@/app/globals.css";
import MainNav from "@/components/layout/MainNav";
import MobileNav from "@/components/layout/MobileNav";
import { AuthProvider } from "@/components/auth/AuthContext";
import { ThemeProvider } from "@/hooks/useTheme";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-text">
              <MainNav />
              <MobileNav />

              {/* Main content */}
              <main className="pt-16 pb-16 md:pb-0">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
