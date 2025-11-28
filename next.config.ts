import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.uplead.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
