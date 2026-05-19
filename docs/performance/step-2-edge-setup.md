# Step 2 Edge Setup Audit

Generated: 2026-05-19T18:34:56.869Z

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
| Vercel API | PASS | 3 Vercel project(s) checked with read-only API calls. |
| Docs | PASS | Cloudflare docs describe Vercel-primary page delivery. |

## DNS And Page Host Headers

Nameservers for `veloro.dk`: ns1.simply.com, ns3.simply.com, ns2.simply.com

| Name | Host | Status | A | CNAME | Server | x-vercel-id | cf-ray |
| --- | --- | --- | --- | --- | --- | --- | --- |
| apex | veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::wqjb5-1779215685824-c2a8faa72877 | - |
| storefront | www.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::fv2hw-1779215686162-e5baeab228e9 | - |
| accounts | accounts.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::77jdr-1779215686489-08bed1d69053 | - |
| admin | admin.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::thlvr-1779215686928-35e349e0a1e1 | - |

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
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-4...212ab/productcard | 200 | image/svg+xml | cloudflare | 9fe532b63d2ad90a-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-9...de23f/productcard | 200 | image/svg+xml | cloudflare | 9fe532b6b8b632d7-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e83b8/productcard | 200 | image/svg+xml | cloudflare | 9fe532b73d3e8aa7-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-2...cc7e4/productcard | 200 | image/svg+xml | cloudflare | 9fe532b7ccb5e034-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-8...5b57d/productcard | 200 | image/svg+xml | cloudflare | 9fe532b849367060-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-a...b5d34/productcard | 200 | image/svg+xml | cloudflare | 9fe532b8ded4a5a4-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-0...b9262/productcard | 200 | image/svg+xml | cloudflare | 9fe532b96bc325cf-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...d7e6c/productcard | 200 | image/svg+xml | cloudflare | 9fe532b9e8a9e034-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-b...42ad6/productcard | 200 | image/svg+xml | cloudflare | 9fe532ba6f4545f8-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-7...89e04/productcard | 200 | image/svg+xml | cloudflare | 9fe532bafccd042d-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e6722/productcard | 200 | image/svg+xml | cloudflare | 9fe532bb7fea868c-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...ab52f/productcard | 200 | image/svg+xml | cloudflare | 9fe532bbff767e5b-CPH |

Cloudflare Images API: All expected Cloudflare Images variants are present and match repo definitions.

## Turnstile

- Key pair: site key present / secret key present
- Auth page: Foundation configured, widget not active yet.
- Server validation: wired to Siteverify
- Cloudflare API: Cloudflare Turnstile API returned 2 widget(s).

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
