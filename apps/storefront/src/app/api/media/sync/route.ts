import { NextResponse } from "next/server";

import { isMediaManagementEnabled } from "@snn/config";
import { syncCloudflareMediaAsset } from "@snn/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isMediaManagementEnabled()) {
    return NextResponse.json(
      {
        error: "media-management-disabled",
      },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        providerAssetId?: string;
      }
    | null;

  if (!body?.providerAssetId || typeof body.providerAssetId !== "string") {
    return NextResponse.json(
      {
        error: "provider-asset-id-required",
      },
      { status: 400 },
    );
  }

  const synced = await syncCloudflareMediaAsset(body.providerAssetId);

  return NextResponse.json({
    asset: synced.record,
    details: synced.details,
  });
}
