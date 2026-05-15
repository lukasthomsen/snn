import { Resend } from "resend";
import { sendEmail } from "@better-auth/infra";

import {
  getAuthEmailConfig,
  getBetterAuthInfrastructureConfig,
  getDeploymentTarget,
} from "@snn/config";

type AuthActionEmailKind = "reset-password" | "verify-email";

type AuthActionEmailInput = {
  actionUrl: string;
  appName: string;
  expirationMinutes: number;
  kind: AuthActionEmailKind;
  to: string;
  userName: string;
};

type EmailCopy = {
  actionLabel: string;
  body: string;
  heading: string;
  preview: string;
  subject: string;
};

let resendClient: Resend | undefined;

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

function getEmailCopy(
  kind: AuthActionEmailKind,
  appName: string,
  expirationMinutes: number,
): EmailCopy {
  if (kind === "reset-password") {
    return {
      actionLabel: "Reset password",
      body: `Use the secure link below to reset your ${appName} password. The link expires in ${expirationMinutes} minutes.`,
      heading: "Reset your password",
      preview: `Reset your ${appName} password.`,
      subject: `Reset your ${appName} password`,
    };
  }

  return {
    actionLabel: "Verify email",
    body: `Confirm this email address to finish setting up your ${appName} account. The link expires in ${expirationMinutes} minutes.`,
    heading: `Verify your ${appName} account`,
    preview: `Verify your ${appName} account.`,
    subject: `Verify your ${appName} account`,
  };
}

function renderHtmlEmail(input: AuthActionEmailInput, copy: EmailCopy) {
  const safeName = escapeHtml(input.userName || "there");
  const safePreview = escapeHtml(copy.preview);
  const safeHeading = escapeHtml(copy.heading);
  const safeBody = escapeHtml(copy.body);
  const safeActionLabel = escapeHtml(copy.actionLabel);
  const safeActionUrl = escapeHtml(input.actionUrl);
  const safeAppName = escapeHtml(input.appName);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeHeading}</title>
  </head>
  <body style="margin:0;background:#f7f8fb;color:#131313;font-family:Arial,'Helvetica Neue',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreview}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f8fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;padding:40px;">
            <tr>
              <td>
                <p style="margin:0 0 28px;color:#333333;font-size:13px;letter-spacing:.08em;text-transform:uppercase;">${safeAppName}</p>
                <h1 style="margin:0 0 16px;color:#131313;font-size:32px;line-height:1.05;letter-spacing:-.02em;">${safeHeading}</h1>
                <p style="margin:0 0 24px;color:#333333;font-size:16px;line-height:1.6;">Hi ${safeName},<br>${safeBody}</p>
                <p style="margin:0 0 28px;">
                  <a href="${safeActionUrl}" style="display:inline-block;border-radius:999px;background:#131313;color:#ffffff;font-size:15px;font-weight:700;line-height:1;padding:16px 24px;text-decoration:none;">${safeActionLabel}</a>
                </p>
                <p style="margin:0;color:#a1a1a1;font-size:13px;line-height:1.55;">If the button does not work, copy this link into your browser:<br><a href="${safeActionUrl}" style="color:#333333;word-break:break-all;">${safeActionUrl}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderTextEmail(input: AuthActionEmailInput, copy: EmailCopy) {
  return [
    copy.heading,
    "",
    `Hi ${input.userName || "there"},`,
    copy.body,
    "",
    input.actionUrl,
    "",
    `If you did not request this, you can ignore this email.`,
  ].join("\n");
}

async function sendBetterAuthInfrastructureEmail(input: AuthActionEmailInput) {
  const infrastructureConfig = getBetterAuthInfrastructureConfig();

  if (!infrastructureConfig.apiKey) {
    return false;
  }

  const result = await sendEmail(
    {
      template:
        input.kind === "reset-password" ? "reset-password" : "verify-email",
      to: input.to,
      variables: {
        appName: input.appName,
        expirationMinutes: String(input.expirationMinutes),
        resetLink: input.actionUrl,
        userEmail: input.to,
        userName: input.userName,
        verificationUrl: input.actionUrl,
      },
    },
    {
      apiKey: infrastructureConfig.apiKey,
      ...(infrastructureConfig.apiUrl
        ? { apiUrl: infrastructureConfig.apiUrl }
        : {}),
    },
  );

  if (!result.success) {
    throw new Error(result.error ?? "Better Auth Infrastructure email failed.");
  }

  return true;
}

export async function sendAuthActionEmail(input: AuthActionEmailInput) {
  const emailConfig = getAuthEmailConfig();
  const copy = getEmailCopy(input.kind, input.appName, input.expirationMinutes);

  if (!emailConfig.resendApiKey) {
    if (getDeploymentTarget() === "local") {
      globalThis.console.info(
        `[auth] ${input.kind} link for ${input.to}: ${input.actionUrl}`,
      );
      return;
    }

    if (await sendBetterAuthInfrastructureEmail(input)) {
      return;
    }

    throw new Error(
      "RESEND_API_KEY or BETTER_AUTH_API_KEY is required to send auth emails.",
    );
  }

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
}
