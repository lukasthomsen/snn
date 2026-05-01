import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@snn/auth",
    "@snn/commerce",
    "@snn/config",
    "@snn/db",
    "@snn/i18n",
    "@snn/ui",
  ],
  typedRoutes: true,
};

export default nextConfig;
