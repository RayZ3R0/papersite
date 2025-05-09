import "@/app/globals.css";
import MainNav from "@/components/layout/MainNav";
import MobileNav from "@/components/layout/MobileNav";
import { AuthProvider } from "@/components/auth/AuthContext";
import { AuthLoadingProvider } from "@/components/auth/AuthLoadingProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import { SearchParamsProvider } from "@/components/providers/SearchParamsProvider";
import { Suspense } from "react";
import { Metadata } from "next";
import NyanCatEasterEgg from "@/components/easter-eggs/NyanCat";
import { Analytics } from "@vercel/analytics/next";

// import DarkAbyss from "@/components/easter-eggs/DarkAbyss";

export const metadata: Metadata = {
  title: "Papers | A-Level Past Papers",
  description: "Access A-Level past papers and study materials",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover", // Support for notched phones
    minimumScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  verification: {
    google: "vzFYE9pfsXvKB92BiPTTpyCbB5fldL7SwuGVv9mZRQI",
  },
};

// Prevent static generation for auth-dependent pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Providers that don't need to remount on navigation */}
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-text">
              {/* Easter Egg 🐱 */}
              <NyanCatEasterEgg />
              {/* Static navigation components */}
              <MainNav />
              <MobileNav />

              {/* Auth context that may update with navigation */}
              <AuthLoadingProvider>
                <main className="md:pt-16 overflow-x-hidden">
                  <Suspense
                    fallback={
                      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    }
                  >
                    <SearchParamsProvider fallback={null}>
                      {children}
                    </SearchParamsProvider>
                  </Suspense>
                </main>
              </AuthLoadingProvider>
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />{" "}
        {/* Add the Analytics component here, at the end of body */}
      </body>
    </html>
  );
}

export const runtime = "edge"; // Use edge runtime for better performance
