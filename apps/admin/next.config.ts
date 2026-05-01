import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@veloro/auth",
    "@veloro/commerce",
    "@veloro/config",
    "@veloro/db",
    "@veloro/i18n",
    "@veloro/ui",
  ],
  typedRoutes: true,
};

export default nextConfig;
