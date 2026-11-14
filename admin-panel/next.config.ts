import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows external avatar images from any HTTPS domain
      },
      {
        protocol: "http",
        hostname: "**", // Optional: Allows HTTP images (useful during local testing)
      },
    ],
  },
};

export default nextConfig;
