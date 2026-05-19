export const authAppName = "SNN";

export const authPasswordPolicy = {
  maxLength: 128,
  minCharacterClasses: 3,
  minLength: 10,
} as const;

export const authTurnstileHeaderName = "x-snn-turnstile-token";
export const internalAuthRequestHeaderName = "x-snn-internal-auth-call";

export const authTurnstileActions = {
  emailVerification: "auth-email-verification",
  passwordReset: "auth-password-reset",
  signIn: "auth-sign-in",
  signUp: "auth-sign-up",
  socialSignIn: "auth-social-sign-in",
} as const;

export const authTurnstileProtectedPaths = {
  "/email-otp/send-verification-otp": authTurnstileActions.emailVerification,
  "/request-password-reset": authTurnstileActions.passwordReset,
  "/sign-in/email": authTurnstileActions.signIn,
  "/sign-in/social": authTurnstileActions.socialSignIn,
  "/sign-up/email": authTurnstileActions.signUp,
} as const;

export type AuthTurnstileAction =
  (typeof authTurnstileActions)[keyof typeof authTurnstileActions];
export type AuthTurnstileProtectedPath = keyof typeof authTurnstileProtectedPaths;

export function nullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

export function normalizeDateOfBirth(value: unknown) {
  const dateOfBirth = nullableText(value);

  if (!dateOfBirth) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return null;
  }

  const [yearText, monthText, dayText] = dateOfBirth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return date.getTime() < todayUtc ? dateOfBirth : null;
}

export function isValidPastDate(value: string) {
  return normalizeDateOfBirth(value) === value;
}

export function getCharacterClassCount(password: string) {
  return [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export function isStrongPassword(password: string) {
  return (
    password.length >= authPasswordPolicy.minLength &&
    password.length <= authPasswordPolicy.maxLength &&
    getCharacterClassCount(password) >= authPasswordPolicy.minCharacterClasses
  );
}
