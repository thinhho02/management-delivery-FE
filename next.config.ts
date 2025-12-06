import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_ORIGIN_PATH_BACKEND}/api/:path*`
      }
    ]
  }
};

export default nextConfig;
