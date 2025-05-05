import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
    turbo: {
      loaders: {
        '.md': ['@mdx-js/loader']
      }
    },
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000', 'papersite.vercel.app']
    }
  },
  images: {
    domains: ['avatars.githubusercontent.com'], // Add other domains as needed
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 30 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        }
      ]
    }
  ],
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      minimize: !dev,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 100000,
      }
    };

    return config;
  }
};

export default nextConfig;
