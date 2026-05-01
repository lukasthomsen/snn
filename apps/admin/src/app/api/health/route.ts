import { NextResponse } from "next/server";

import { getDeploymentTarget, getVercelMetadata } from "@veloro/config";

export function GET() {
  return NextResponse.json({
    app: "admin",
    deploymentTarget: getDeploymentTarget(),
    phase: "foundation",
    status: "ok",
    vercel: getVercelMetadata(),
  });
}

