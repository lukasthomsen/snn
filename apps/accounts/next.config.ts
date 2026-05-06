import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/da/sign-in",
        permanent: false,
      },
      {
        source: "/sign-in",
        destination: "/da/sign-in",
        permanent: false,
      },
      {
        source: "/sign-up",
        destination: "/da/sign-up",
        permanent: false,
      },
    ];
  },
  transpilePackages: [
    "@snn/auth",
    "@snn/config",
    "@snn/customer",
    "@snn/db",
    "@snn/i18n",
    "@snn/ui",
  ],
  typedRoutes: true,
};

export default nextConfig;
