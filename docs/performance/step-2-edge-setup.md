# Step 2 Edge Setup Audit

Generated: 2026-05-20T21:51:51.167Z

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
| Turnstile | PASS | Turnstile widget appears on the production auth page. |
| Cloudflare API | PASS | All expected Cloudflare Images variants are present and match repo definitions. Cloudflare Turnstile API returned 2 widget(s); live auth page uses snn-auth-prod and authorizes accounts.veloro.dk. |
| Vercel API | PASS | 3 Vercel project(s) checked with read-only API calls. |
| Docs | PASS | Cloudflare docs describe Vercel-primary page delivery. |

## DNS And Page Host Headers

Nameservers for `veloro.dk`: ns1.simply.com, ns2.simply.com, ns3.simply.com

| Name | Host | Status | A | CNAME | Server | x-vercel-id | cf-ray |
| --- | --- | --- | --- | --- | --- | --- | --- |
| apex | veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::zf9j2-1779313899227-fdb7beab2e6d | - |
| storefront | www.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::wbn9n-1779313899570-68e9125a0da2 | - |
| accounts | accounts.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::bhfdm-1779313899877-ee58a0d45661 | - |
| admin | admin.veloro.dk | PASS | 216.198.79.1 | - | Vercel | arn1::fra1::tvjgv-1779313900428-5204d6c448fd | - |

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
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-4...212ab/productcard | 200 | image/svg+xml | cloudflare | 9fee90815b4d267b-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-9...de23f/productcard | 200 | image/svg+xml | cloudflare | 9fee90827b01a8b6-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e83b8/productcard | 200 | image/svg+xml | cloudflare | 9fee90831fa60839-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-2...cc7e4/productcard | 200 | image/svg+xml | cloudflare | 9fee90842e18a5a4-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-8...5b57d/productcard | 200 | image/svg+xml | cloudflare | 9fee9084ca949a01-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-a...b5d34/productcard | 200 | image/svg+xml | cloudflare | 9fee9085ccc4d2d0-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-0...b9262/productcard | 200 | image/svg+xml | cloudflare | 9fee908669165b0a-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...d7e6c/productcard | 200 | image/svg+xml | cloudflare | 9fee9087adef4f62-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-b...42ad6/productcard | 200 | image/svg+xml | cloudflare | 9fee9088dac58755-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-7...89e04/productcard | 200 | image/svg+xml | cloudflare | 9fee90898afbd90a-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-d...e6722/productcard | 200 | image/svg+xml | cloudflare | 9fee908aba904e1e-CPH |
| PASS | https://imagedelivery.net/YAkvJ...rJcPw/snn-5...ab52f/productcard | 200 | image/svg+xml | cloudflare | 9fee908beea85b0a-CPH |

Cloudflare Images API: All expected Cloudflare Images variants are present and match repo definitions.

## Turnstile

- Key pair: site key present / secret key present
- Auth page: Turnstile widget appears on the production auth page.
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
