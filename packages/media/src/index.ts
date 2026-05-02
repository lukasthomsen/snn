import { and, eq } from "drizzle-orm";

import { getCloudflareImagesConfig } from "@snn/config";
import { getDb, schema } from "@snn/db";

export const imageVariantNames = [
  "thumb",
  "product-card",
  "pdp-gallery",
  "pdp-zoom",
  "hero",
] as const;

export type ImageVariantName = (typeof imageVariantNames)[number];
export type ImageVariantFit = "scale-down" | "contain" | "cover" | "crop" | "pad";
export type ImageVariantMetadataMode = "none" | "copyright" | "keep";
export type MediaRecordStatus = "draft" | "ready" | "failed" | "archived";
export type ProductMediaRole = "featured" | "gallery" | "swatch" | "hero";

export type ImageVariantDefinition = {
  id: ImageVariantName;
  neverRequireSignedURLs: boolean;
  options: {
    fit: ImageVariantFit;
    height?: number;
    metadata: ImageVariantMetadataMode;
    width?: number;
  };
};

export const defaultImageVariants: Record<ImageVariantName, ImageVariantDefinition> = {
  thumb: {
    id: "thumb",
    neverRequireSignedURLs: true,
    options: { fit: "cover", height: 240, metadata: "none", width: 240 },
  },
  "product-card": {
    id: "product-card",
    neverRequireSignedURLs: true,
    options: { fit: "cover", height: 1200, metadata: "none", width: 960 },
  },
  "pdp-gallery": {
    id: "pdp-gallery",
    neverRequireSignedURLs: true,
    options: { fit: "contain", height: 1600, metadata: "none", width: 1600 },
  },
  "pdp-zoom": {
    id: "pdp-zoom",
    neverRequireSignedURLs: true,
    options: { fit: "contain", height: 2400, metadata: "keep", width: 2400 },
  },
  hero: {
    id: "hero",
    neverRequireSignedURLs: true,
    options: { fit: "cover", height: 1800, metadata: "none", width: 2400 },
  },
};

type CloudflareEnvelope<T> = {
  errors: Array<{ code?: number; message?: string }>;
  result: T;
  success: boolean;
};

type CloudflareVariantRecord = {
  id: string;
  neverRequireSignedURLs?: boolean;
  options?: {
    fit?: ImageVariantFit;
    height?: number;
    metadata?: ImageVariantMetadataMode;
    width?: number;
  };
};

type CloudflareImageRecord = {
  draft?: boolean;
  filename?: string;
  id?: string;
  meta?: Record<string, unknown>;
  requireSignedURLs?: boolean;
  uploaded?: string;
  variants?: string[];
};

export type CloudflareImagesDetails = {
  deliveryUrl?: string | undefined;
  draft: boolean;
  filename?: string | undefined;
  id: string;
  metadata: Record<string, unknown>;
  requireSignedURLs: boolean;
  uploadedAt?: string | undefined;
  variants: string[];
};

export type CloudflareDirectUploadDraft = {
  id: string;
  uploadURL: string;
};

export type CreateDirectUploadInput = {
  customId?: string;
  expiry?: string;
  filename?: string;
  metadata?: Record<string, unknown>;
  requireSignedUrls?: boolean;
};

export type MediaAssetDraftInput = {
  altText?: string;
  filename?: string;
  mediaMetadata?: Record<string, unknown>;
  productId?: string;
  providerAssetId: string;
  role?: ProductMediaRole;
  variantId?: string;
};

function ensureCloudflareImagesEnabled() {
  const config = getCloudflareImagesConfig();

  if (!config.accountId || !config.apiToken) {
    throw new Error(
      "Cloudflare Images is not configured. Set CLOUDFLARE_IMAGES_ACCOUNT_ID and CLOUDFLARE_IMAGES_API_TOKEN.",
    );
  }

  return config;
}

async function requestCloudflare<T>(path: string, init?: RequestInit) {
  const config = ensureCloudflareImagesEnabled();
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Cloudflare Images request failed with status ${response.status}.`);
  }

  const envelope = (await response.json()) as CloudflareEnvelope<T>;

  if (!envelope.success) {
    const message = envelope.errors.map((error) => error.message).filter(Boolean).join("; ");
    throw new Error(message || "Cloudflare Images request was not successful.");
  }

  return envelope.result;
}

function normalizeVariantsResult(result: unknown) {
  if (
    result &&
    typeof result === "object" &&
    "variants" in result &&
    result.variants &&
    typeof result.variants === "object"
  ) {
    return Object.values(result.variants as Record<string, CloudflareVariantRecord>);
  }

  if (Array.isArray(result)) {
    return result as CloudflareVariantRecord[];
  }

  return [];
}

function normalizeImageResult(result: CloudflareImageRecord): CloudflareImagesDetails {
  if (!result.id) {
    throw new Error("Cloudflare Images did not return an image identifier.");
  }

  return {
    deliveryUrl: result.variants?.[0],
    draft: Boolean(result.draft),
    ...(result.filename ? { filename: result.filename } : {}),
    id: result.id,
    metadata: result.meta ?? {},
    requireSignedURLs: Boolean(result.requireSignedURLs),
    ...(result.uploaded ? { uploadedAt: result.uploaded } : {}),
    variants: result.variants ?? [],
  };
}

export async function listCloudflareImageVariants() {
  const result = await requestCloudflare<unknown>("/images/v1/variants");

  return normalizeVariantsResult(result);
}

export async function ensureDefaultImageVariants() {
  const existing = await listCloudflareImageVariants();
  const existingIds = new Set(existing.map((variant) => variant.id));
  const created: string[] = [];

  for (const definition of Object.values(defaultImageVariants)) {
    if (existingIds.has(definition.id)) {
      continue;
    }

    await requestCloudflare("/images/v1/variants", {
      body: JSON.stringify(definition),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    created.push(definition.id);
  }

  return {
    created,
    existing: Array.from(existingIds),
  };
}

export async function createCloudflareDirectUpload(input: CreateDirectUploadInput) {
  const body = new FormData();

  if (input.customId) {
    body.set("id", input.customId);
  }

  if (input.expiry) {
    body.set("expiry", input.expiry);
  }

  body.set("requireSignedURLs", input.requireSignedUrls ? "true" : "false");

  if (input.metadata) {
    body.set("metadata", JSON.stringify(input.metadata));
  }

  const result = await requestCloudflare<CloudflareDirectUploadDraft>("/images/v2/direct_upload", {
    body,
    method: "POST",
  });

  if (!result.id || !result.uploadURL) {
    throw new Error("Cloudflare Images did not return a direct upload URL.");
  }

  return result;
}

export async function getCloudflareImageDetails(imageId: string) {
  const result = await requestCloudflare<CloudflareImageRecord>(`/images/v1/${imageId}`);
  return normalizeImageResult(result);
}

export function buildCloudflareImageUrl(imageId: string, variant: ImageVariantName | "public" = "public") {
  const config = getCloudflareImagesConfig();

  if (!config.deliveryHash) {
    throw new Error("Cloudflare Images delivery hash is not configured.");
  }

  return `https://imagedelivery.net/${config.deliveryHash}/${imageId}/${variant}`;
}

export async function createMediaAssetDraft(input: MediaAssetDraftInput) {
  const db = getDb();
  const [mediaAsset] = await db
    .insert(schema.mediaAssets)
    .values({
      ...(input.altText ? { altText: input.altText } : {}),
      ...(input.filename ? { filename: input.filename } : {}),
      metadata: input.mediaMetadata ?? {},
      providerAssetId: input.providerAssetId,
      status: "draft",
    })
    .onConflictDoNothing({
      target: [schema.mediaAssets.provider, schema.mediaAssets.providerAssetId],
    })
    .returning();

  const record =
    mediaAsset ??
    (
      await db
        .select()
        .from(schema.mediaAssets)
        .where(
          and(
            eq(schema.mediaAssets.provider, "cloudflare_images"),
            eq(schema.mediaAssets.providerAssetId, input.providerAssetId),
          ),
        )
        .limit(1)
    )[0];

  if (!record) {
    throw new Error("Unable to create or load media asset draft.");
  }

  if (input.productId) {
    await db
      .insert(schema.productMedia)
      .values({
        mediaAssetId: record.id,
        position: 0,
        productId: input.productId,
        role: input.role ?? "gallery",
        ...(input.variantId ? { variantId: input.variantId } : {}),
      })
      .onConflictDoNothing({
        target: [schema.productMedia.productId, schema.productMedia.mediaAssetId],
      });
  }

  return record;
}

export async function syncCloudflareMediaAsset(providerAssetId: string) {
  const db = getDb();
  const details = await getCloudflareImageDetails(providerAssetId);
  const [record] = await db
    .update(schema.mediaAssets)
    .set({
      deliveryUrl: details.deliveryUrl,
      filename: details.filename,
      metadata: details.metadata,
      providerAssetId: details.id,
      status: details.draft ? "draft" : "ready",
      uploadedAt: details.uploadedAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.mediaAssets.provider, "cloudflare_images"),
        eq(schema.mediaAssets.providerAssetId, providerAssetId),
      ),
    )
    .returning();

  if (!record) {
    throw new Error(`No media asset record found for provider asset ${providerAssetId}.`);
  }

  return {
    details,
    record,
  };
}
