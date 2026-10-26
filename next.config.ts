import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // En desarrollo usamos imágenes sin optimizar (URLs OSS remotas + uploads locales).
    // En producción: quitar `unoptimized` y mantener remotePatterns.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
