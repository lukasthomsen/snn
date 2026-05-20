"use server";

import type { Route } from "next";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authPasswordPolicy, getCharacterClassCount, internalAuthRequestHeaderName } from "@snn/auth/policy";
import { auth } from "@snn/auth/server";
import {
  CustomerAuthError,
  createPrivacyRequest,
  deleteCustomerAddress,
  requireFreshCustomerSession,
  revokeCustomerSession,
  setCustomerMainAddress,
  unlikeCustomerProduct,
  updateCustomerProfile,
  upsertCustomerAddress,
} from "@snn/customer";
import type { Locale } from "@snn/i18n";

const passwordMinLength = authPasswordPolicy.minLength;
const passwordMaxLength = authPasswordPolicy.maxLength;

type SetPasswordActionResult =
  | {
      ok: true;
    }
  | {
      field?: "confirmPassword" | "newPassword" | "form";
      message: string;
      ok: false;
    };

type SecurityActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | SecurityActionFailure;

type SecurityActionFailure = {
  code?: string | undefined;
  field?: string | undefined;
  message: string;
  ok: false;
};

function getText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function getOptionalText(formData: FormData, name: string) {
  const value = getText(formData, name).trim();

  return value ? value : null;
}

async function getActionSession() {
  return requireFreshCustomerSession(await headers());
}

async function getFreshActionHeaders(options?: { internalAuth?: boolean }) {
  const requestHeaders = new Headers(await headers());

  await requireFreshCustomerSession(requestHeaders);

  if (options?.internalAuth) {
    requestHeaders.set(internalAuthRequestHeaderName, "1");
  }

  return requestHeaders;
}

function getAuthActionErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return "";
  }

  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }

  if (
    "body" in error &&
    error.body &&
    typeof error.body === "object" &&
    "code" in error.body &&
    typeof error.body.code === "string"
  ) {
    return error.body.code;
  }

  return "";
}

function getAuthActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "We could not complete that request.";
}

function getSecurityActionError(
  error: unknown,
  fallbackMessage: string,
): SecurityActionFailure {
  if (
    error instanceof CustomerAuthError &&
    error.code === "FRESH_SESSION_REQUIRED"
  ) {
    return {
      code: error.code,
      message: "For your safety, sign out and back in, then try again.",
      ok: false,
    };
  }

  return {
    code: getAuthActionErrorCode(error),
    message: getAuthActionErrorMessage(error) || fallbackMessage,
    ok: false,
  };
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseTotpSecret(totpURI: string) {
  try {
    return new URL(totpURI).searchParams.get("secret") ?? undefined;
  } catch {
    return undefined;
  }
}

export async function updateProfileAction(locale: Locale, formData: FormData) {
  const { user } = await getActionSession();

  await updateCustomerProfile(user, {
    dateOfBirth: getOptionalText(formData, "dateOfBirth"),
    firstName: getOptionalText(formData, "firstName"),
    lastName: getOptionalText(formData, "lastName"),
    phone: getOptionalText(formData, "phone"),
  });

  revalidatePath(`/${locale}/account/profile`);
  revalidatePath(`/${locale}/account`);
}

export async function createAddressAction(locale: Locale, formData: FormData) {
  const { user } = await getActionSession();

  await upsertCustomerAddress(user, {
    city: getText(formData, "city"),
    countryCode: getText(formData, "countryCode") || "DK",
    firstName: getOptionalText(formData, "firstName"),
    isDefaultBilling: getText(formData, "isDefaultBilling") === "on",
    isDefaultShipping: getText(formData, "isDefaultShipping") === "on",
    label: getOptionalText(formData, "label"),
    lastName: getOptionalText(formData, "lastName"),
    line1: getText(formData, "line1"),
    line2: getOptionalText(formData, "line2"),
    phone: getOptionalText(formData, "phone"),
    postalCode: getText(formData, "postalCode"),
    region: getOptionalText(formData, "region"),
  });

  revalidatePath(`/${locale}/account/addresses`);
  revalidatePath(`/${locale}/account`);
}

export async function deleteAddressAction(locale: Locale, addressId: string) {
  const { user } = await getActionSession();

  await deleteCustomerAddress(user, addressId);

  revalidatePath(`/${locale}/account/addresses`);
  revalidatePath(`/${locale}/account`);
}

export async function setMainAddressAction(locale: Locale, addressId: string) {
  const { user } = await getActionSession();

  await setCustomerMainAddress(user, addressId);

  revalidatePath(`/${locale}/account/addresses`);
  revalidatePath(`/${locale}/account`);
}

export async function unlikeProductAction(locale: Locale, productId: string, variantId: string) {
  const { user } = await getActionSession();

  await unlikeCustomerProduct(user, productId, variantId);

  revalidatePath(`/${locale}/account/liked`);
  revalidatePath(`/${locale}/account`);
  revalidatePath(`/${locale}/wishlist`);
}

export async function createPrivacyRequestAction(locale: Locale, formData: FormData) {
  const { user } = await getActionSession();
  const type = getText(formData, "type");

  if (!["access", "portability", "deletion", "rectification"].includes(type)) {
    throw new Error("Invalid privacy request type.");
  }

  await createPrivacyRequest(
    user,
    type as "access" | "portability" | "deletion" | "rectification",
    getOptionalText(formData, "notes"),
  );

  revalidatePath(`/${locale}/account/privacy`);
}

export async function setCustomerPasswordAction(
  locale: Locale,
  formData: FormData,
): Promise<SetPasswordActionResult> {
  const newPassword = getText(formData, "newPassword");
  const confirmPassword = getText(formData, "confirmPassword");

  if (newPassword.length < passwordMinLength || newPassword.length > passwordMaxLength) {
    return {
      field: "newPassword",
      message: "Password must be between 10 and 128 characters.",
      ok: false,
    };
  }

  if (getCharacterClassCount(newPassword) < 3) {
    return {
      field: "newPassword",
      message: "Use at least 3 of: lowercase, uppercase, number, or symbol.",
      ok: false,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      field: "confirmPassword",
      message: "Passwords must match.",
      ok: false,
    };
  }

  const requestHeaders = await headers();

  try {
    await requireFreshCustomerSession(requestHeaders);
    await auth.api.setPassword({
      body: {
        newPassword,
      },
      headers: requestHeaders,
    });
  } catch (error) {
    if (
      error instanceof CustomerAuthError &&
      error.code === "FRESH_SESSION_REQUIRED"
    ) {
      return {
        field: "form",
        message: "For your safety, sign out and back in, then set a password.",
        ok: false,
      };
    }

    const code = getAuthActionErrorCode(error);
    const message = getAuthActionErrorMessage(error);

    if (code === "PASSWORD_ALREADY_SET") {
      return {
        field: "form",
        message: "This account already has an SNN password.",
        ok: false,
      };
    }

    if (code === "PASSWORD_TOO_SHORT" || /too short/i.test(message)) {
      return {
        field: "newPassword",
        message: "Password must be between 10 and 128 characters.",
        ok: false,
      };
    }

    if (code === "PASSWORD_TOO_LONG" || /too long/i.test(message)) {
      return {
        field: "newPassword",
        message: "Password must be between 10 and 128 characters.",
        ok: false,
      };
    }

    if (code === "PASSWORD_COMPROMISED" || /data breach|compromised/i.test(message)) {
      return {
        field: "newPassword",
        message: "This password has appeared in a data breach. Choose a different one.",
        ok: false,
      };
    }

    return {
      field: "form",
      message: "We could not set the password. Please try again.",
      ok: false,
    };
  }

  revalidatePath(`/${locale}/account/security`);

  return { ok: true };
}

export async function sendAccountVerificationCodeAction(
  _locale: Locale,
  email: string,
): Promise<SecurityActionResult> {
  try {
    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "email-verification",
      },
      headers: await getFreshActionHeaders({ internalAuth: true }),
    });
  } catch (error) {
    return getSecurityActionError(
      error,
      "We could not send the verification code. Please try again.",
    );
  }

  return { data: undefined, ok: true };
}

export async function changeCustomerEmailAction(
  locale: Locale,
  callbackURL: string,
  formData: FormData,
): Promise<SecurityActionResult> {
  const newEmail = getText(formData, "newEmail").trim().toLowerCase();

  if (!newEmail) {
    return {
      field: "newEmail",
      message: "Enter the new email address.",
      ok: false,
    };
  }

  if (!isEmail(newEmail)) {
    return {
      field: "newEmail",
      message: "Enter a valid email address.",
      ok: false,
    };
  }

  try {
    await auth.api.changeEmail({
      body: {
        callbackURL,
        newEmail,
      },
      headers: await getFreshActionHeaders(),
    });
  } catch (error) {
    return getSecurityActionError(
      error,
      "We could not start the email change. Please try again.",
    );
  }

  revalidatePath(`/${locale}/account/security`);

  return { data: undefined, ok: true };
}

export async function changeCustomerPasswordAction(
  locale: Locale,
  formData: FormData,
): Promise<SecurityActionResult> {
  const currentPassword = getText(formData, "currentPassword");
  const newPassword = getText(formData, "newPassword");
  const confirmPassword = getText(formData, "confirmPassword");

  if (!currentPassword) {
    return {
      field: "currentPassword",
      message: "Enter your current password.",
      ok: false,
    };
  }

  if (newPassword.length < passwordMinLength || newPassword.length > passwordMaxLength) {
    return {
      field: "newPassword",
      message: "New password must be between 10 and 128 characters.",
      ok: false,
    };
  }

  if (getCharacterClassCount(newPassword) < authPasswordPolicy.minCharacterClasses) {
    return {
      field: "newPassword",
      message: "Use at least 3 of: lowercase, uppercase, number, or symbol.",
      ok: false,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      field: "confirmPassword",
      message: "New passwords must match.",
      ok: false,
    };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: await getFreshActionHeaders(),
    });
  } catch (error) {
    const result = getSecurityActionError(
      error,
      "We could not update the password. Check your current password and try again.",
    );

    if (result.code === "INVALID_PASSWORD" || /invalid password/i.test(result.message)) {
      return {
        field: "currentPassword",
        message: "Current password is incorrect.",
        ok: false,
      };
    }

    return result;
  }

  revalidatePath(`/${locale}/account/security`);

  return { data: undefined, ok: true };
}

export async function enableCustomerTwoFactorAction(
  locale: Locale,
  formData: FormData,
): Promise<SecurityActionResult<{ backupCodes: string[]; secret: string | undefined; totpURI: string }>> {
  const password = getText(formData, "password");

  try {
    const result = await auth.api.enableTwoFactor({
      body: {
        issuer: "SNN",
        ...(password ? { password } : {}),
      },
      headers: await getFreshActionHeaders(),
    });
    const data = result as {
      backupCodes?: unknown;
      totpURI?: unknown;
    };

    if (typeof data.totpURI !== "string" || !Array.isArray(data.backupCodes)) {
      return {
        message: "Two-factor setup could not be started.",
        ok: false,
      };
    }

    revalidatePath(`/${locale}/account/security`);

    return {
      data: {
        backupCodes: data.backupCodes.filter((code): code is string => typeof code === "string"),
        secret: parseTotpSecret(data.totpURI),
        totpURI: data.totpURI,
      },
      ok: true,
    };
  } catch (error) {
    return getSecurityActionError(
      error,
      "We could not start two-factor setup. Please try again.",
    );
  }
}

export async function verifyCustomerTwoFactorAction(
  locale: Locale,
  formData: FormData,
): Promise<SecurityActionResult> {
  const code = getText(formData, "code").trim();

  if (!code) {
    return {
      field: "code",
      message: "Enter the verification code.",
      ok: false,
    };
  }

  try {
    await auth.api.verifyTOTP({
      body: {
        code,
        trustDevice: true,
      },
      headers: await getFreshActionHeaders(),
    });
  } catch (error) {
    return getSecurityActionError(
      error,
      "We could not verify the code. Please try again.",
    );
  }

  revalidatePath(`/${locale}/account/security`);

  return { data: undefined, ok: true };
}

export async function disableCustomerTwoFactorAction(
  locale: Locale,
  formData: FormData,
): Promise<SecurityActionResult> {
  const password = getText(formData, "password");

  try {
    await auth.api.disableTwoFactor({
      body: password ? { password } : {},
      headers: await getFreshActionHeaders(),
    });
  } catch (error) {
    return getSecurityActionError(
      error,
      "We could not disable two-factor authentication. Please try again.",
    );
  }

  revalidatePath(`/${locale}/account/security`);

  return { data: undefined, ok: true };
}

export async function deleteCustomerAccountAction(
  locale: Locale,
  callbackURL: string,
  formData: FormData,
): Promise<SecurityActionResult> {
  const confirmation = getText(formData, "deleteConfirmation").trim();
  const password = getText(formData, "deletePassword");

  if (confirmation !== "DELETE") {
    return {
      field: "deleteConfirmation",
      message: "Type DELETE to confirm.",
      ok: false,
    };
  }

  try {
    await auth.api.deleteUser({
      body: {
        callbackURL,
        ...(password ? { password } : {}),
      },
      headers: await getFreshActionHeaders(),
    });
  } catch (error) {
    const result = getSecurityActionError(
      error,
      "We could not delete the account. Please try again.",
    );

    if (result.code === "INVALID_PASSWORD" || /invalid password/i.test(result.message)) {
      return {
        field: "deletePassword",
        message: "Current password is incorrect.",
        ok: false,
      };
    }

    return result;
  }

  revalidatePath(`/${locale}`);
  redirect(callbackURL as Route);
}

export async function revokeSessionAction(locale: Locale, token: string) {
  const { user } = await getActionSession();

  await revokeCustomerSession(user, token);

  revalidatePath(`/${locale}/account/security`);
}

export async function signOutCustomerAction(locale: Locale) {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch {
    return {
      message: "We could not sign you out. Please try again.",
      ok: false,
    } as const;
  }

  redirect(`/${locale}`);
}
