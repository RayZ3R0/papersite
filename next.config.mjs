/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    optimizeCss: true,
    forceSwcTransforms: true,
    // Add runtime configuration
    serverComponentsExternalPackages: ["mongoose"],
  },

  // Optimize production build
  swcMinify: true,

  // Remove console logs in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables that should be exposed to the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  },

  // Static files and public assets
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Optimized sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Support modern formats for better compression
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
  },

  // Webpack configuration
  webpack: (config, { dev, isServer, webpack }) => {
    // Handle Node.js modules in Edge runtime
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        mongodb: false,
        mongoose: false,
      };
    }

    // Optimize bundle size
    if (!dev && !isServer) {
      // Enable module concatenation
      config.optimization.concatenateModules = true;

      // Ignore moment.js locales to reduce bundle size
      if (webpack && webpack.IgnorePlugin) {
        config.plugins.push(
          new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
          })
        );
      }
    }

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // Add cache controls for static assets
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Add cache controls for images
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Route segment config
  async rewrites() {
    return {
      beforeFiles: [
        // Handle flashcard API routes with Node.js runtime
        {
          source: "/api/flashcards/:path*",
          destination: "/api/flashcards/:path*",
        },
        // Handle other Node.js routes
        {
          source: "/api/subjects/:path*",
          destination: "/api/subjects/:path*",
        },
      ],
    };
  },

  // Improve performance with modern features
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
