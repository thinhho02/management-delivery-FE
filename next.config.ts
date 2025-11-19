import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: '/r9vwbtuo5/**',
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
        port: "",
        pathname: '/**',
      }
    ]
  },
};

export default nextConfig;
