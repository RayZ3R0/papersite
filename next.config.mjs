/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Client-side fixes
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false,
      fs: false,
      path: false,
    };

    // Server-side fixes
    if (isServer) {
      // More comprehensive externals configuration
      const nodeExternals = [
        "canvas",
        "jsdom",
        "react-pdf/node",
        "pdfjs-dist/build/pdf.worker.entry",
      ];

      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        function (context, request, callback) {
          if (nodeExternals.includes(request)) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }

    // Handle .node extensions with ignore-loader
    config.module.rules.push({
      test: /\.node$/,
      loader: "ignore-loader",
    });

    return config;
  },
  // Handle static and dynamic routes
  experimental: {
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Configure headers for cookie handling
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
