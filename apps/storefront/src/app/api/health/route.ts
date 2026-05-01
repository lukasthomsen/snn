import { NextResponse } from "next/server";

import { getCanonicalAuthOrigin, getDeploymentTarget, getVercelMetadata } from "@veloro/config";

export function GET() {
  return NextResponse.json({
    app: "storefront",
    authOrigin: getCanonicalAuthOrigin(),
    deploymentTarget: getDeploymentTarget(),
    phase: "foundation",
    status: "ok",
    vercel: getVercelMetadata(),
  });
}

