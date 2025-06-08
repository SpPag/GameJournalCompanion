import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dztftxick/**', // Adjust to your Cloudinary folder structure
      },
    ],
  },
};

export default nextConfig;
