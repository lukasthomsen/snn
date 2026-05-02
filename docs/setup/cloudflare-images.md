# Cloudflare Images

SNN uses Cloudflare Images as the product-media system of record.

## Why this setup

- Product metadata stays in Neon/Postgres.
- Image binaries live in Cloudflare Images.
- The database stores provider IDs, alt text, delivery URLs, and product-media ordering.
- Uploads are designed around direct creator upload so admin UIs can upload without exposing a Cloudflare API token to the browser.

## Required environment variables

Add these to the `snn-storefront` Vercel project and to local development when you are ready to activate image uploads:

```env
CLOUDFLARE_IMAGES_ACCOUNT_ID=
CLOUDFLARE_IMAGES_API_TOKEN=
CLOUDFLARE_IMAGES_DELIVERY_HASH=
ENABLE_MEDIA_MANAGEMENT_IN_PRODUCTION=false
```

## Recommended Cloudflare token

Create a dedicated API token for Images, not the earlier Turnstile setup token.

Recommended permissions:

- `Cloudflare Images` -> `Read`
- `Cloudflare Images` -> `Write`

Scope it to the specific Cloudflare account that owns the SNN setup.

## Standard variants

SNN reserves these Cloudflare Images variants:

- `thumb`
- `product-card`
- `pdp-gallery`
- `pdp-zoom`
- `hero`

Create or reconcile them from the repo root with:

```bash
pnpm media:ensure-variants
```

That script uses the definitions in `/Users/lukasthomsen/Desktop/snn/packages/media/src/index.ts`.

## Upload flow foundation

The base layer now exposes two internal routes on the storefront runtime:

- `POST /api/media/direct-upload`
- `POST /api/media/sync`

### `POST /api/media/direct-upload`

Purpose:

- create a Cloudflare direct-upload URL
- create a draft `media_asset` record
- optionally pre-link the asset to a product

Example body:

```json
{
  "filename": "air-max-hero.jpg",
  "altText": "Side profile of a running shoe",
  "productId": "PRODUCT_UUID",
  "role": "hero"
}
```

### `POST /api/media/sync`

Purpose:

- fetch uploaded image details from Cloudflare Images
- update the corresponding `media_asset` row to `ready`

Example body:

```json
{
  "providerAssetId": "CLOUDFLARE_IMAGE_ID"
}
```

## Production safety

Media-management routes are enabled automatically in `local` and `preview`.

They are disabled in `production` unless:

```env
ENABLE_MEDIA_MANAGEMENT_IN_PRODUCTION=true
```

Keep that `false` until the admin/staff upload UI is in place.
