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

const DomainNotification = dynamicImport(
  () => import("@/components/notifications/DomainNotification"),
  { ssr: false, loading: () => null }
);

const Analytics = dynamicImport(
  () =>
    import("@vercel/analytics/next").then((mod) => ({
      default: mod.Analytics,
    })),
  { ssr: false }
);

const MusicPlayer = dynamicImport(
  () => import("@/components/music-player").then(mod => ({ default: mod.MusicPlayer })),
  { ssr: false }
);

const ConnectionAwareOptimizer = dynamicImport(
  () => import("@/components/providers/ConnectionAwareOptimizer"),
  { ssr: false }
);

const QuickOptions = dynamicImport(
  () => import("@/components/quick-options").then(mod => ({ default: mod.QuickOptions })),
  { ssr: false }
);

export const metadata: Metadata = {
  metadataBase: new URL('https://papernexus.xyz'),
  title: {
    template: '%s | PaperNexus',
    default: 'PaperNexus - A-Level Past Papers & Study Resources'
  },
  description: 'Access A-Level past papers, mark schemes, notes, and study materials. Free comprehensive resources for Physics, Chemistry, Biology, Mathematics and more subjects.',
  keywords: 'a level past papers, study materials, exam papers, mark schemes, revision notes, study guides, exam preparation',
  authors: [{ name: 'PaperNexus' }],
  creator: 'PaperNexus',
  publisher: 'PaperNexus',
  applicationName: 'PaperNexus',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    minimumScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://papernexus.xyz',
    siteName: 'PaperNexus',
    title: 'PaperNexus - A-Level Past Papers & Study Resources',
    description: 'Access A-Level past papers, mark schemes, notes, and study materials. Free comprehensive resources for all subjects.',
    images: [{
      url: `https://i.imgur.com/yPdLNHw.png`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus - Your A-Level Study Companion'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PaperNexus - A-Level Study Resources',
    description: 'Access A-Level past papers and study materials',
    images: [{
      url: `https://i.imgur.com/yPdLNHw.png`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus - Your A-Level Study Companion'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      }
    ]
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  verification: {
    google: 'google-site-verification-code-here',
    other: {
      me: ['@papernexus:twitter']
    }
  },
  category: 'education'
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
        <link rel="preload" as="image" href="/banner.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
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
        <ConnectionAwareOptimizer>
          <ThemeProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background text-text">
                <NyanCatEasterEgg />
                <DomainNotification />
                <MainNav />
                <MobileNav />
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
                <Suspense fallback={null}>
                  <QuickOptions />
                </Suspense>
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
