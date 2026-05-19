# Resend Auth Email

Veloro uses Resend to deliver Better Auth verification and password-reset emails.
Better Auth owns the tokens, sessions, and security rules; Resend only sends the
transactional message.

## Required environment variables

Add these to the `snn-accounts` Vercel project and to local development when you
want real email delivery:

```env
RESEND_API_KEY=
AUTH_EMAIL_FROM=Veloro <accounts@veloro.dk>
AUTH_EMAIL_REPLY_TO=
```

`AUTH_EMAIL_REPLY_TO` is optional. Use a monitored support inbox when it is set.

## Resend dashboard setup

1. Add and verify the sending domain in Resend. Prefer `veloro.dk` so the sender
   can be `accounts@veloro.dk`.
2. Add the DNS records Resend gives you in Cloudflare DNS. This normally includes
   SPF/TXT and DKIM records. Add a DMARC TXT record if the domain does not already
   have one.
3. Create a Resend API key with email-sending access.
4. Store the key as `RESEND_API_KEY` in Vercel for the accounts project.
5. Redeploy `accounts.veloro.dk` after changing Vercel environment variables.

## Vercel commands

Run these from the repository root. Paste the secret values when prompted; do not
commit them to the repo.

```bash
pnpm exec vercel env add RESEND_API_KEY production --cwd apps/accounts
pnpm exec vercel env add AUTH_EMAIL_FROM production --cwd apps/accounts
pnpm exec vercel env add AUTH_EMAIL_REPLY_TO production --cwd apps/accounts
```

If `AUTH_EMAIL_REPLY_TO` is not needed, skip that command.

## Local development

When `RESEND_API_KEY` is empty in local development, auth links are logged by the
server instead of emailed. This keeps local testing possible before the sending
domain is verified.

For full local email delivery, add the same values to the root `.env.local`.
