// Fix for src/app/layout.tsx
import "@/app/globals.css";
import MainNav from "@/components/layout/MainNav";
import MobileNav from "@/components/layout/MobileNav";
import { AuthProvider } from "@/components/auth/AuthContext";
import { AuthLoadingProvider } from "@/components/auth/AuthLoadingProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import { SearchParamsProvider } from "@/components/providers/SearchParamsProvider";
import { Suspense } from "react";
import { Metadata } from "next";
import { default as dynamicImport } from "next/dynamic";

// Lazy load non-essential components
const NyanCatEasterEgg = dynamicImport(
  () => import("@/components/easter-eggs/NyanCat"),
  { ssr: false, loading: () => null }
);

const Analytics = dynamicImport(
  () =>
    import("@vercel/analytics/next").then((mod) => ({
      default: mod.Analytics,
    })),
  { ssr: false }
);

// Lazy load with no SSR to avoid hydration issues
const MusicPlayer = dynamicImport(
  () => import("@/components/music-player").then(mod => ({ default: mod.MusicPlayer })),
  { ssr: false }
);

// Create a connection-aware component that will be used to optimize performance
const ConnectionAwareOptimizer = dynamicImport(
  () => import("@/components/providers/ConnectionAwareOptimizer"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "PaperNexus",
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
  ]
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
      <head>
        {/* Preload critical resources */}
        <link rel="preload" as="image" href="/banner.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      // Registration was successful
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      // registration failed
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body>
        {/* Connection-aware optimizations */}
        <ConnectionAwareOptimizer>
          {/* Providers that don't need to remount on navigation */}
          <ThemeProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background text-text">
                {/* Easter Egg 🐱 - now lazy loaded */}
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

                {/* Music Player - Dynamically loaded, no SSR */}
                <Suspense fallback={null}>
                  <MusicPlayer />
                </Suspense>
              </div>
            </AuthProvider>
          </ThemeProvider>
          <Analytics />
        </ConnectionAwareOptimizer>
      </body>
    </html>
  );
}

export const runtime = "edge"; // Use edge runtime for better performance
