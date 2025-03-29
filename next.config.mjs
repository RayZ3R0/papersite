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
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];

      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;
