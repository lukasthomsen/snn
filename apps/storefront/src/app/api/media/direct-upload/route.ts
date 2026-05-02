import { NextResponse } from "next/server";

import { isMediaManagementEnabled } from "@snn/config";
import {
  createCloudflareDirectUpload,
  createMediaAssetDraft,
  type ProductMediaRole,
} from "@snn/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DirectUploadPayload = {
  altText?: string;
  filename?: string;
  mediaMetadata?: Record<string, unknown>;
  productId?: string;
  role?: ProductMediaRole;
  variantId?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  if (!isMediaManagementEnabled()) {
    return NextResponse.json(
      {
        error: "media-management-disabled",
      },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as DirectUploadPayload | null;

  if (!body?.filename || typeof body.filename !== "string") {
    return NextResponse.json(
      {
        error: "filename-required",
      },
      { status: 400 },
    );
  }

  const mediaMetadata = isRecord(body.mediaMetadata) ? body.mediaMetadata : {};
  const draft = await createCloudflareDirectUpload({
    filename: body.filename,
    metadata: {
      ...mediaMetadata,
      source: "snn-direct-upload",
      ...(body.productId ? { productId: body.productId } : {}),
      ...(body.variantId ? { variantId: body.variantId } : {}),
      ...(body.role ? { role: body.role } : {}),
    },
    requireSignedUrls: false,
  });

  const asset = await createMediaAssetDraft({
    ...(body.altText ? { altText: body.altText } : {}),
    filename: body.filename,
    mediaMetadata,
    ...(body.productId ? { productId: body.productId } : {}),
    providerAssetId: draft.id,
    ...(body.role ? { role: body.role } : {}),
    ...(body.variantId ? { variantId: body.variantId } : {}),
  });

  return NextResponse.json({
    assetId: asset.id,
    providerAssetId: draft.id,
    uploadUrl: draft.uploadURL,
  });
}
