import type { NextConfig } from "next";

const baseDomain = process.env.BASE_DOMAIN ?? "veloro.dk";
const authSubdomain = process.env.AUTH_SUBDOMAIN ?? "accounts";
const legacyAuthHost = `auth.${baseDomain}`;
const accountsOrigin = `https://${authSubdomain}.${baseDomain}`;

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: `${accountsOrigin}/:path*`,
        has: [
          {
            type: "host",
            value: legacyAuthHost,
          },
        ],
        permanent: false,
      },
    ];
  },
  transpilePackages: [
    "@snn/auth",
    "@snn/commerce",
    "@snn/config",
    "@snn/db",
    "@snn/i18n",
    "@snn/media",
    "@snn/payments",
    "@snn/ui",
  ],
  typedRoutes: true,
};

export default nextConfig;
