import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gr5z62ayge.ufs.sh",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
