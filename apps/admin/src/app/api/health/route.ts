import { NextResponse } from "next/server";

import { getDeploymentTarget, getVercelMetadata } from "@snn/config";

export function GET() {
  return NextResponse.json({
    app: "admin",
    deploymentTarget: getDeploymentTarget(),
    phase: "foundation",
    status: "ok",
    vercel: getVercelMetadata(),
  });
}

