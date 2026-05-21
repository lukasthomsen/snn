# Step 2 Edge Setup Audit

Generated: 2026-05-21T08:48:04.798Z

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
| Turnstile | PASS | Turnstile is active on the production auth page. |
| Cloudflare API | PASS | All expected Cloudflare Images variants are present and match repo definitions. Cloudflare Turnstile API returned 2 widget(s); live auth page uses snn-auth-prod and authorizes accounts.veloro.dk. |
| Vercel API | PASS | 3 Vercel project(s) checked with read-only API calls. |
| Docs | PASS | Cloudflare docs describe Vercel-primary page delivery. |

## DNS And Page Host Headers

Nameservers for `veloro.dk`: ns1.simply.com, ns3.simply.com, ns2.simply.com

| Name | Host | Status | A | CNAME | Server | x-vercel-id | cf-ray |
| --- | --- | --- | --- | --- | --- | --- | --- |
| apex | veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::28pjt-1779353273935-d2bf55605192 | - |
| storefront | www.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::qgkq5-1779353274329-4ffd84c4b394 | - |
| accounts | accounts.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::ltf65-1779353274654-543349a377d7 | - |
| admin | admin.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::6c6k6-1779353275306-5b1da3c63460 | - |

## Public Route Headers

| Route | Status | HTTP | Cache-Control | x-vercel-cache | Server | cf-ray |
| --- | --- | --- | --- | --- | --- | --- |
| storefront.home | PASS | 200 | public, max-age=0, must-revalidate | HIT | Vercel | - |
| storefront.product-listing | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| storefront.product-detail | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| storefront.cart | PASS | 200 | public, max-age=0, must-revalidate | HIT | Vercel | - |
| storefront.checkout | PASS | 200 | public, max-age=0, must-revalidate | HIT | Vercel | - |
| storefront.wishlist | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| accounts.sign-in | PASS | 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |
| admin.home | PASS | 307 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | Vercel | - |

## Cloudflare Images

Configured delivery hash: present

| Status | Sample URL | HTTP | Content-Type | Server | cf-ray |
| --- | --- | --- | --- | --- | --- |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-4...212ab/productcard | 200 | image/svg+xml | cloudflare | 9ff251cbbadc868c-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-9...de23f/productcard | 200 | image/svg+xml | cloudflare | 9ff251cc5ad83355-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e83b8/productcard | 200 | image/svg+xml | cloudflare | 9ff251ccfe8ffea1-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-2...cc7e4/productcard | 200 | image/svg+xml | cloudflare | 9ff251cdaf582af8-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-8...5b57d/productcard | 200 | image/svg+xml | cloudflare | 9ff251ce4e1631a2-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-a...b5d34/productcard | 200 | image/svg+xml | cloudflare | 9ff251ceeb54a628-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-0...b9262/productcard | 200 | image/svg+xml | cloudflare | 9ff251cf88413355-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...d7e6c/productcard | 200 | image/svg+xml | cloudflare | 9ff251d03ac5daa7-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-b...42ad6/productcard | 200 | image/svg+xml | cloudflare | 9ff251d0dbc9cd9c-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-7...89e04/productcard | 200 | image/svg+xml | cloudflare | 9ff251d17a663f14-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e6722/productcard | 200 | image/svg+xml | cloudflare | 9ff251d229cf1255-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...ab52f/productcard | 200 | image/svg+xml | cloudflare | 9ff251d2c8982c59-CPH |

Cloudflare Images API: All expected Cloudflare Images variants are present and match repo definitions.

## Turnstile

- Key pair: site key present / secret key present
- Auth page: Turnstile is active on the production auth page.
- Server validation: wired to Siteverify
- Cloudflare API: Cloudflare Turnstile API returned 2 widget(s); live auth page uses snn-auth-prod and authorizes accounts.veloro.dk.

## Optional Vercel API

| Project | Status | Summary |
| --- | --- | --- |
| storefront | PASS | Expected production domains and required environment variables are configured. |
| accounts | PASS | Expected production domains and required environment variables are configured. |
| admin | PASS | Expected production domains and required environment variables are configured. |

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
