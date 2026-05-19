import { Resend } from "resend";
import { sendEmail } from "@better-auth/infra";

import {
  getAuthEmailConfig,
  getBetterAuthInfrastructureConfig,
} from "@snn/config";

type AuthActionEmailKind = "change-email" | "reset-password" | "verify-email";

type AuthActionEmailInput = {
  actionCode?: string | undefined;
  actionUrl?: string | undefined;
  appName: string;
  expirationMinutes: number;
  kind: AuthActionEmailKind;
  newEmail?: string | undefined;
  to: string;
  userName: string;
};

type EmailCopy = {
  actionLabel: string;
  body: string;
  heading: string;
  preview: string;
  secondaryBody?: string | undefined;
  subject: string;
};

let resendClient: Resend | undefined;
let warnedLocalActionUrl = false;
let warnedSenderDomainMismatch = false;

function getResendClient(apiKey: string) {
  resendClient ??= new Resend(apiKey);

  return resendClient;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function maskEmail(value: string) {
  const [localPart = "", domain = ""] = value.split("@");
  const visible = localPart.slice(0, 1) || "*";

  return domain ? `${visible}***@${domain}` : "***";
}

function getSenderDomain(from: string) {
  const address = from.match(/<([^>]+)>/)?.[1] ?? from;
  const domain = address.trim().split("@")[1]?.trim().toLowerCase();

  return domain || undefined;
}

function getActionHostname(actionUrl: string) {
  try {
    return new URL(actionUrl).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost");
}

function isHostAlignedWithDomain(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function warnAboutDeliverabilityRisks(input: AuthActionEmailInput, from: string) {
  if (!input.actionUrl) {
    return;
  }

  const actionHostname = getActionHostname(input.actionUrl);
  const senderDomain = getSenderDomain(from);

  if (actionHostname && isLocalHostname(actionHostname) && !warnedLocalActionUrl) {
    warnedLocalActionUrl = true;
    globalThis.console.warn(
      `[auth] ${input.kind} email contains a local verification link (${actionHostname}). Inbox providers may accept the message and then filter it. Use a public HTTPS auth origin/tunnel for real inbox testing.`,
    );
  }

  if (
    actionHostname &&
    senderDomain &&
    !isLocalHostname(actionHostname) &&
    !isHostAlignedWithDomain(actionHostname, senderDomain) &&
    !warnedSenderDomainMismatch
  ) {
    warnedSenderDomainMismatch = true;
    globalThis.console.warn(
      `[auth] ${input.kind} email sender domain (${senderDomain}) does not align with the verification link host (${actionHostname}). This can hurt inbox placement.`,
    );
  }
}

function getEmailCopy(input: AuthActionEmailInput): EmailCopy {
  if (input.kind === "reset-password") {
    return {
      actionLabel: "Reset password",
      body: `Use the secure link below to reset your ${input.appName} password. The link expires in ${input.expirationMinutes} minutes.`,
      heading: "Reset your password",
      preview: `Reset your ${input.appName} password.`,
      subject: `Reset your ${input.appName} password`,
    };
  }

  if (input.kind === "change-email") {
    const newEmail = input.newEmail ? ` to ${input.newEmail}` : "";

    return {
      actionLabel: "Approve email change",
      body: `Approve changing your ${input.appName} sign-in email${newEmail}. After approval, we will ask the new address to verify the change. The link expires in ${input.expirationMinutes} minutes.`,
      heading: "Approve email change",
      preview: `Approve your ${input.appName} email change.`,
      subject: `Approve your ${input.appName} email change`,
    };
  }

  if (input.actionCode) {
    return {
      actionLabel: "Verification code",
      body: `Enter this code to verify your email and finish setting up your ${input.appName} account. The code expires in ${input.expirationMinutes} minutes.`,
      heading: `Your ${input.appName} verification code`,
      preview: `${input.actionCode} is your ${input.appName} verification code.`,
      secondaryBody: "This code can only be used once. Never share it with anyone.",
      subject: `Your ${input.appName} verification code`,
    };
  }

  return {
    actionLabel: "Verify email",
    body: `Confirm this email address to finish setting up your ${input.appName} account. The link expires in ${input.expirationMinutes} minutes.`,
    heading: `Verify your ${input.appName} account`,
    preview: `Verify your ${input.appName} account.`,
    subject: `Verify your ${input.appName} account`,
  };
}

function renderHtmlEmail(input: AuthActionEmailInput, copy: EmailCopy) {
  const safeName = escapeHtml(input.userName || "there");
  const safePreview = escapeHtml(copy.preview);
  const safeHeading = escapeHtml(copy.heading);
  const safeBody = escapeHtml(copy.body);
  const safeActionLabel = escapeHtml(copy.actionLabel);
  const safeActionUrl = input.actionUrl ? escapeHtml(input.actionUrl) : "";
  const safeActionCode = input.actionCode ? escapeHtml(formatCode(input.actionCode)) : "";
  const safeAppName = escapeHtml(input.appName);
  const safeSecondaryBody = copy.secondaryBody ? escapeHtml(copy.secondaryBody) : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeHeading}</title>
  </head>
  <body style="margin:0;background:#f4f4f2;color:#131313;font-family:Inter,Arial,'Helvetica Neue',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreview}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #deded9;border-radius:8px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 24px;color:#5f5f5a;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${safeAppName}</p>
                <h1 style="margin:0 0 14px;color:#131313;font-size:28px;line-height:1.12;font-weight:800;">${safeHeading}</h1>
                <p style="margin:0 0 24px;color:#3f3f3b;font-size:15px;line-height:1.6;">Hi ${safeName},<br>${safeBody}</p>
                ${safeActionCode
                  ? `<p style="margin:0 0 24px;padding:18px;border:1px solid #deded9;border-radius:8px;background:#fafafa;color:#131313;font-size:30px;font-weight:800;letter-spacing:.16em;line-height:1;text-align:center;">${safeActionCode}</p>
                <p style="margin:0;color:#777771;font-size:12px;line-height:1.55;">${safeSecondaryBody}</p>`
                  : `<p style="margin:0 0 24px;">
                  <a href="${safeActionUrl}" style="display:inline-block;border-radius:8px;background:#131313;color:#ffffff;font-size:14px;font-weight:800;line-height:1;padding:14px 18px;text-decoration:none;">${safeActionLabel}</a>
                </p>
                <p style="margin:0;color:#777771;font-size:12px;line-height:1.55;">If the button does not work, copy this link into your browser:<br><a href="${safeActionUrl}" style="color:#333333;word-break:break-all;">${safeActionUrl}</a></p>`}
                <p style="margin:24px 0 0;color:#777771;font-size:12px;line-height:1.55;">If you did not request this, you can ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function formatCode(code: string) {
  return code.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function renderTextEmail(input: AuthActionEmailInput, copy: EmailCopy) {
  if (input.actionCode) {
    return [
      copy.heading,
      "",
      `Hi ${input.userName || "there"},`,
      copy.body,
      "",
      formatCode(input.actionCode),
      "",
      copy.secondaryBody,
      "",
      "If you did not request this, you can ignore this email.",
    ].filter(Boolean).join("\n");
  }

  return [
    copy.heading,
    "",
    `Hi ${input.userName || "there"},`,
    copy.body,
    "",
    input.actionUrl ?? "",
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");
}

async function sendBetterAuthInfrastructureEmail(input: AuthActionEmailInput) {
  const infrastructureConfig = getBetterAuthInfrastructureConfig();

  if (!infrastructureConfig.apiKey) {
    return false;
  }

  const options = {
    apiKey: infrastructureConfig.apiKey,
    ...(infrastructureConfig.apiUrl
      ? { apiUrl: infrastructureConfig.apiUrl }
      : {}),
  };
  const result = input.kind === "reset-password"
    ? await sendEmail(
        {
          template: "reset-password",
          to: input.to,
          variables: {
            appName: input.appName,
            expirationMinutes: String(input.expirationMinutes),
            resetLink: input.actionUrl ?? "",
            userEmail: input.to,
            userName: input.userName,
          },
        },
        options,
      )
    : input.kind === "change-email"
      ? await sendEmail(
          {
            template: "change-email",
            to: input.to,
            variables: {
              appName: input.appName,
              confirmationLink: input.actionUrl ?? "",
              currentEmail: input.to,
              expirationMinutes: String(input.expirationMinutes),
              newEmail: input.newEmail ?? "",
              userName: input.userName,
            },
          },
          options,
        )
      : input.actionCode
        ? await sendEmail(
            {
              template: "verify-email-otp",
              to: input.to,
              variables: {
                appName: input.appName,
                expirationMinutes: String(input.expirationMinutes),
                otpCode: input.actionCode,
                userEmail: input.to,
              },
            },
            options,
          )
      : await sendEmail(
          {
            template: "verify-email",
            to: input.to,
            variables: {
              appName: input.appName,
              expirationMinutes: String(input.expirationMinutes),
              userEmail: input.to,
              userName: input.userName,
              verificationUrl: input.actionUrl ?? "",
            },
          },
          options,
        );

  if (!result.success) {
    throw new Error(result.error ?? "Better Auth Infrastructure email failed.");
  }

  globalThis.console.info(
    `[auth] ${input.kind} email queued via Better Auth infrastructure for ${maskEmail(input.to)}.`,
  );

  return true;
}

async function sendResendEmail(input: AuthActionEmailInput, copy: EmailCopy) {
  const emailConfig = getAuthEmailConfig();

  if (!emailConfig.resendApiKey) {
    return false;
  }

  warnAboutDeliverabilityRisks(input, emailConfig.from);

  const response = await getResendClient(emailConfig.resendApiKey).emails.send({
    from: emailConfig.from,
    html: renderHtmlEmail(input, copy),
    ...(emailConfig.replyTo ? { replyTo: emailConfig.replyTo } : {}),
    subject: copy.subject,
    text: renderTextEmail(input, copy),
    to: input.to,
  });

  if (response.error) {
    throw new Error(
      `Resend auth email failed: ${response.error.message ?? "Unknown error"}`,
    );
  }

  globalThis.console.info(
    `[auth] ${input.kind} email queued via Resend for ${maskEmail(input.to)}${response.data?.id ? ` (${response.data.id})` : ""}.`,
  );

  return true;
}

export async function sendAuthActionEmail(input: AuthActionEmailInput) {
  if ((input.kind === "change-email" || input.kind === "reset-password") && !input.actionUrl) {
    throw new Error(`${input.kind} email requires an action URL.`);
  }

  if (input.kind === "verify-email" && !input.actionCode && !input.actionUrl) {
    throw new Error("verify-email email requires a code or an action URL.");
  }

  const copy = getEmailCopy(input);
  let resendError: Error | undefined;

  try {
    if (await sendResendEmail(input, copy)) {
      return;
    }
  } catch (error) {
    resendError = error instanceof Error ? error : new Error(String(error));
    globalThis.console.error(
      `[auth] ${input.kind} email failed via Resend for ${maskEmail(input.to)}: ${resendError.message}`,
    );
  }

  if (await sendBetterAuthInfrastructureEmail(input)) {
    return;
  }

  if (resendError) {
    throw resendError;
  }

  throw new Error(
    "RESEND_API_KEY or BETTER_AUTH_API_KEY is required to send auth emails.",
  );
}
