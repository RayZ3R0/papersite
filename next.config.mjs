/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    optimizeCss: true,
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
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Handle Node.js modules in Edge runtime
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
      };
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
    ];
  },

  // Route segment config
  async rewrites() {
    return {
      beforeFiles: [
        // Handle Node.js routes
        {
          source: "/api/subjects/:path*",
          destination: "/api/subjects/:path*",
          has: [
            {
              type: "header",
              key: "x-invoke-path",
              value: "/api/subjects",
            },
          ],
        },
        // Handle Edge routes
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*",
          has: [
            {
              type: "header",
              key: "x-invoke-path",
              value: "/api/auth",
            },
          ],
        },
      ],
    };
  },
};

export default nextConfig;
