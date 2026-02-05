import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
//  cacheComponents: true,
  reactCompiler: true,
  experimental:{
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
