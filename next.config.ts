import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Turbopack is the default bundler in Next.js 16
  turbopack: {},
  // Webpack config is used for production builds
  webpack: (config) => {
    // Konva has an optional dependency on the `canvas` npm package (Node.js rendering).
    // Mark it as external to prevent webpack from failing to resolve it.
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
};

export default nextConfig;
