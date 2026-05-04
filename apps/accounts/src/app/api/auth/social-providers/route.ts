import { NextResponse } from "next/server";

import { hasAppleOAuth, hasGoogleOAuth } from "@snn/config";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      apple: hasAppleOAuth(),
      google: hasGoogleOAuth(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
