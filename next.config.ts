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
  // existing config here, e.g., for Tailwind
};

export default nextConfig;
