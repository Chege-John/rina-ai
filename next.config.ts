import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
      {
        protocol: "https",
        hostname: "www.launchuicomponents.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Add this experimental flag
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // Force static optimization for dashboard
  generateStaticParams: true,
};

export default nextConfig;
