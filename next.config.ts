import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // don't advertise the framework version in production responses
  poweredByHeader: false,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
