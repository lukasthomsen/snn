# Step 2 Edge Setup Audit

Generated: 2026-05-19T17:35:41.205Z

## Summary

Target state: Vercel is the primary page CDN/reverse proxy path. Cloudflare is used for Images and Turnstile only.

Overall status: **PASS**

- No blocking edge setup issues found.

## Check Summary

| Area | Status | Result |
| --- | --- | --- |
| DNS/host headers | PASS | Page hostnames should resolve to Vercel and avoid Cloudflare proxy headers. |
| Public routes | PASS | Routes should return expected statuses with Vercel headers. |
| Cloudflare Images | PASS | 12 Cloudflare Images sample(s) checked. |
| Turnstile | PASS | Foundation configured, widget not active yet. |
| Cloudflare API | PASS | All expected Cloudflare Images variants are present and match repo definitions. Cloudflare Turnstile API returned 2 widget(s). |
| Vercel API | SKIP | VERCEL_TOKEN is not configured. |
| Docs | PASS | Cloudflare docs describe Vercel-primary page delivery. |

## DNS And Page Host Headers

Nameservers for `snn-storefront-4n2mt79j9-snn-commerce.vercel.app`: -

| Name | Host | Status | A | CNAME | Server | x-vercel-id | cf-ray |
| --- | --- | --- | --- | --- | --- | --- | --- |
| apex | snn-storefront-4n2mt79j9-snn-commerce.vercel.app | PASS | 216.198.79.131, 64.29.17.131 | - | Vercel | arn1::fra1::nhc8d-1779212126242-a5b2c44c7cc0 | - |
| storefront | snn-storefront-4n2mt79j9-snn-commerce.vercel.app | PASS | 216.198.79.131, 64.29.17.131 | - | Vercel | arn1::fra1::dklpd-1779212128080-25a8e29ece43 | - |
| accounts | snn-accounts-1s4xhx1qw-snn-commerce.vercel.app | PASS | 216.198.79.3, 64.29.17.3 | - | Vercel | arn1::fra1::hszf7-1779212129035-f86060041ee6 | - |
| admin | snn-admin-n5622jeuj-snn-commerce.vercel.app | PASS | 64.29.17.195, 216.198.79.195 | - | Vercel | arn1::fra1::57jmp-1779212130874-d2560cc7e2dc | - |

## Public Route Headers

| Route | Status | HTTP | Cache-Control | x-vercel-cache | Server | cf-ray |
| --- | --- | --- | --- | --- | --- | --- |
| storefront.home | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| storefront.product-listing | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| storefront.product-detail | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| storefront.cart | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| storefront.checkout | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| storefront.wishlist | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| accounts.sign-in | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| admin.home | PASS | 307 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |

## Cloudflare Images

Configured delivery hash: present

| Status | Sample URL | HTTP | Content-Type | Server | cf-ray |
| --- | --- | --- | --- | --- | --- |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-a...306ec/productcard | 200 | image/svg+xml | cloudflare | 9fe4dbf8cd2632d7-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-8...b9909/pdpgallery | 200 | image/svg+xml | cloudflare | 9fe4dbf93f65dce9-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...fc259/productcard | 200 | image/svg+xml | cloudflare | 9fe4dbf9cd49fee2-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-3...6572f/pdpgallery | 200 | image/svg+xml | cloudflare | 9fe4dbfa6de0d82d-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...ab52f/productcard | 200 | image/svg+xml | cloudflare | 9fe4dbfaefd2a50a-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e6722/pdpgallery | 200 | image/svg+xml | cloudflare | 9fe4dbfb6a6f5000-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-b...e9ac5/productcard | 200 | image/svg+xml | cloudflare | 9fe4dbfbfae63ca8-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-c...ee9a9/pdpgallery | 200 | image/svg+xml | cloudflare | 9fe4dbfc7cbeb354-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-a...9af84/productcard | 200 | image/svg+xml | cloudflare | 9fe4dbfcff945b0a-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...3a16f/pdpgallery | 200 | image/svg+xml | cloudflare | 9fe4dbfd6d4febdd-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-7...60a08/productcard | 200 | image/svg+xml | cloudflare | 9fe4dbfde9175cce-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-a...dfd5a/pdpgallery | 200 | image/svg+xml | cloudflare | 9fe4dbfe7a8b2da5-CPH |

Cloudflare Images API: All expected Cloudflare Images variants are present and match repo definitions.

## Turnstile

- Key pair: site key present / secret key present
- Auth page: Foundation configured, widget not active yet.
- Server validation: wired to Siteverify
- Cloudflare API: Cloudflare Turnstile API returned 2 widget(s).

## Optional Vercel API

VERCEL_TOKEN is not configured.

## Proxy Contingency Only

Do not enable Cloudflare proxying in front of Vercel for page domains under the current target state. If that decision changes later, create Cloudflare Cache Rules that:

- Bypass every request with a Cookie header.
- Bypass every request with an Authorization header.
- Bypass /api/*, including media routes and Stripe webhooks.
- Bypass /cart, /checkout, /wishlist, /account, /sign-in, and /sign-up.
- Bypass accounts and admin hostnames entirely.
- Respect origin Cache-Control for static public pages and assets only.

## Sources

- Vercel Cloudflare guidance: https://vercel.com/kb/guide/cloudflare-with-vercel
- Cloudflare Cache Rules: https://developers.cloudflare.com/cache/how-to/cache-rules/settings/
- Cloudflare Images variants: https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/
- Cloudflare Images delivery: https://developers.cloudflare.com/images/optimization/hosted-images/serve-uploaded-images/
- Cloudflare Turnstile server validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
