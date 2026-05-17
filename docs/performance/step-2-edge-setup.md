# Step 2 Edge Setup Audit

Generated: 2026-05-16T22:11:37.338Z

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

Nameservers for `veloro.dk`: ns3.simply.com, ns2.simply.com, ns1.simply.com

| Name | Host | Status | A | CNAME | Server | x-vercel-id | cf-ray |
| --- | --- | --- | --- | --- | --- | --- | --- |
| apex | veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::wfkwg-1778969487534-d85e238fc8a7 | - |
| storefront | www.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::wfkwg-1778969488303-9c401034e1f2 | - |
| accounts | accounts.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::fgbz9-1778969488738-b9f21b900791 | - |
| admin | admin.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::cb2tr-1778969490177-979c9985e516 | - |

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
| admin.home | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |

## Cloudflare Images

Configured delivery hash: present

| Status | Sample URL | HTTP | Content-Type | Server | cf-ray |
| --- | --- | --- | --- | --- | --- |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-4...212ab/productcard | 200 | image/svg+xml | cloudflare | 9fcdb80e1abf2af8-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-9...de23f/productcard | 200 | image/svg+xml | cloudflare | 9fcdb80ebfb56cad-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e83b8/productcard | 200 | image/svg+xml | cloudflare | 9fcdb80f698d2c59-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-2...cc7e4/productcard | 200 | image/svg+xml | cloudflare | 9fcdb81009f0805c-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-8...5b57d/productcard | 200 | image/svg+xml | cloudflare | 9fcdb810995ac5d7-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-a...b5d34/productcard | 200 | image/svg+xml | cloudflare | 9fcdb8115997c394-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-0...b9262/productcard | 200 | image/svg+xml | cloudflare | 9fcdb811ffaf1dd9-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...d7e6c/productcard | 200 | image/svg+xml | cloudflare | 9fcdb8128e2c0839-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-b...42ad6/productcard | 200 | image/svg+xml | cloudflare | 9fcdb8133aef5f9e-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-7...89e04/productcard | 200 | image/svg+xml | cloudflare | 9fcdb813ecdddce1-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e6722/productcard | 200 | image/svg+xml | cloudflare | 9fcdb8149893d0c3-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...ab52f/productcard | 200 | image/svg+xml | cloudflare | 9fcdb8153b21d731-CPH |

Cloudflare Images API: All expected Cloudflare Images variants are present and match repo definitions.

## Turnstile

- Key pair: site key missing / secret key missing
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
