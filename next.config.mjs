/** @type {import('next').NextConfig} */

const nextConfig = {
  // Use standalone output mode for smaller deployments
  output: "standalone",

  experimental: {
    optimizeCss: true,
    forceSwcTransforms: true,
    // Add output file tracing exclusions to reduce size
    outputFileTracingExcludes: {
      "*": [
        "node_modules/canvas/**/*",
        "node_modules/pdfjs-dist/**/*",
        "**/*.{png,jpg,jpeg,gif,pdf}",
        "**/test/**",
        "**/*.test.*",
        "**/tests/**",
      ],
    },
    // Removed excludeDefaultMomentLocales - it's not a valid option
  },

  // Keep existing optimization settings
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

  // Optimize image settings for smaller builds
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    formats: ["image/webp"], // Remove avif to reduce processing overhead
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Disable image optimization in development
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Enhanced webpack configuration for size optimization
  webpack: (config, { dev, isServer, webpack }) => {
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

    // Optimize bundle size
    if (!dev && !isServer) {
      // Enable module concatenation
      config.optimization.concatenateModules = true;

      // Use external CDN for PDF.js instead of bundling
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdfjs-dist": "pdfjs-dist/build/pdf.min.js",
      };

      // Ignore moment.js locales to reduce bundle size
      if (webpack && webpack.IgnorePlugin) {
        config.plugins.push(
          new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
          })
        );
      }

      // Fixed code splitting optimizations - removed crypto dependency
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            priority: 40,
          },
          lib: {
            test(module) {
              return (
                module.size() > 80000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name: "lib", // Fixed: Use a simple string instead of function that depends on crypto
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: "commons",
            minChunks: 2,
            priority: 20,
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }

    return config;
  },

  // Keep existing security headers and other configuration
  // ...rest of your config remains unchanged
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

  async redirects() {
    return [];
  },

  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
