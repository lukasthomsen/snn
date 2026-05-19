"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { createSnnAuthClient, withTurnstileFetchOptions } from "@snn/auth/client";
import {
  authPasswordPolicy,
  getCharacterClassCount,
  isValidPastDate,
} from "@snn/auth/policy";
import {
  Button,
  CheckCircleSolidIcon,
  DatePicker,
  PasswordField,
  TextField,
  type DatePickerCopy,
} from "@snn/ui";

import { AuthStatusMessage } from "./auth-status-message";
import {
  hasFieldErrors,
  isValidEmail,
  removeFieldError,
  type FieldErrors,
} from "./form-validation";
import { TurnstileField, type TurnstileChallenge } from "./turnstile-field";

const passwordMinLength = authPasswordPolicy.minLength;
const passwordMaxLength = authPasswordPolicy.maxLength;

type PasswordRuleId = "characterMix" | "length";
type PasswordCharacterRuleId = "lowercase" | "number" | "symbol" | "uppercase";

type PasswordRuleState = {
  id: PasswordRuleId;
  isMet: boolean;
  label: string;
};

type PasswordCharacterRuleState = {
  id: PasswordCharacterRuleId;
  isMet: boolean;
  label: string;
};

type SignUpFieldName = "dateOfBirth" | "email" | "firstName" | "lastName" | "password";

export type SignUpFormMessages = {
  accountExists: string;
  dateInvalid: string;
  emailManagedByProvider: string;
  emailInvalid: string;
  emailRequired: string;
  firstNameRequired: string;
  genericError: string;
  lastNameRequired: string;
  networkError: string;
  passwordCompromised: string;
  passwordRequired: string;
  passwordLength: string;
  required: string;
  serverError: string;
  tooManyRequests: string;
};

export type SignUpPasswordRulesCopy = Record<PasswordRuleId, string> &
  Record<PasswordCharacterRuleId, string> & {
    title: string;
  };

export type SignUpFormProps = {
  callbackURL: string;
  dateOfBirthLabel: string;
  emailLabel: string;
  firstNameLabel: string;
  lastNameLabel: string;
  locale: string;
  messages: SignUpFormMessages;
  passwordLabel: string;
  passwordRules: SignUpPasswordRulesCopy;
  birthdayCalendar: Required<DatePickerCopy>;
  primaryAction: string;
  onVerificationSent?: ((email: string) => void) | undefined;
  turnstile?: TurnstileChallenge | undefined;
};

function getTodayInputValue() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function getPasswordRuleStates({
  copy,
  password,
}: {
  copy: SignUpPasswordRulesCopy;
  password: string;
}) {
  return [
    {
      id: "length",
      isMet: password.length >= passwordMinLength && password.length <= passwordMaxLength,
      label: copy.length,
    },
    {
      id: "characterMix",
      isMet: getCharacterClassCount(password) >= 3,
      label: copy.characterMix,
    },
  ] satisfies PasswordRuleState[];
}

function validatePassword(input: {
  copy: SignUpPasswordRulesCopy;
  password: string;
}) {
  return getPasswordRuleStates(input).every((rule) => rule.isMet);
}

function resolveSignUpError({
  error,
  messages,
}: {
  error: { code?: string; message?: string; status?: number };
  messages: SignUpFormMessages;
}): { field?: SignUpFieldName; message: string } {
  const code = error.code ?? "";
  const message = error.message ?? "";

  if (error.status === 429 || /rate.?limit|too many/i.test(message)) {
    return { message: messages.tooManyRequests };
  }

  if (code === "EMAIL_MANAGED_BY_SOCIAL_PROVIDER") {
    return {
      field: "email",
      message: messages.emailManagedByProvider,
    };
  }

  if (
    code === "EMAIL_ALREADY_REGISTERED" ||
    code === "USER_ALREADY_EXISTS" ||
    code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
    /already exists|already registered|already created/i.test(message)
  ) {
    return {
      field: "email",
      message: messages.accountExists,
    };
  }

  if (code === "INVALID_EMAIL" || /invalid email/i.test(message)) {
    return {
      field: "email",
      message: messages.emailInvalid,
    };
  }

  if (
    code === "PASSWORD_TOO_SHORT" ||
    code === "PASSWORD_TOO_LONG" ||
    code === "INVALID_PASSWORD" ||
    /password does not meet|password is too|password must/i.test(message)
  ) {
    return {
      field: "password",
      message: messages.passwordLength,
    };
  }

  if (/breach|compromised|pwned/i.test(message)) {
    return {
      field: "password",
      message: messages.passwordCompromised,
    };
  }

  if (/date of birth/i.test(message)) {
    return {
      field: "dateOfBirth",
      message: messages.dateInvalid,
    };
  }

  if (
    code === "FAILED_TO_CREATE_USER" ||
    code === "FAILED_TO_CREATE_VERIFICATION" ||
    error.status === 500
  ) {
    return { message: messages.serverError };
  }

  return { message: messages.genericError };
}

function getBirthdayDefaultViewValue() {
  const today = new Date();

  return [
    today.getFullYear() - 18,
    String(today.getMonth() + 1).padStart(2, "0"),
    "01",
  ].join("-");
}

function getPasswordCharacterRuleStates({
  copy,
  password,
}: {
  copy: SignUpPasswordRulesCopy;
  password: string;
}) {
  return [
    {
      id: "lowercase",
      isMet: /[a-z]/.test(password),
      label: copy.lowercase,
    },
    {
      id: "uppercase",
      isMet: /[A-Z]/.test(password),
      label: copy.uppercase,
    },
    {
      id: "number",
      isMet: /\d/.test(password),
      label: copy.number,
    },
    {
      id: "symbol",
      isMet: /[^A-Za-z0-9]/.test(password),
      label: copy.symbol,
    },
  ] satisfies PasswordCharacterRuleState[];
}

export function SignUpForm({
  callbackURL,
  birthdayCalendar,
  dateOfBirthLabel,
  emailLabel,
  firstNameLabel,
  lastNameLabel,
  locale,
  messages,
  passwordLabel,
  passwordRules,
  primaryAction,
  onVerificationSent,
  turnstile,
}: SignUpFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const passwordRulesId = useId();
  const [message, setMessage] = useState<string | undefined>();
  const [tone, setTone] = useState<"danger" | "success">("danger");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignUpFieldName>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateOfBirthValue, setDateOfBirthValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);

  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>('input[name="firstName"]')?.focus();
  }, []);

  function clearFieldError(field: SignUpFieldName) {
    setFieldErrors((currentErrors) => removeFieldError(currentErrors, field));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = [firstName, lastName].filter(Boolean).join(" ");
    const nextFieldErrors: FieldErrors<SignUpFieldName> = {};

    if (!firstName) {
      nextFieldErrors.firstName = messages.firstNameRequired;
    }

    if (!lastName) {
      nextFieldErrors.lastName = messages.lastNameRequired;
    }

    if (!email) {
      nextFieldErrors.email = messages.emailRequired;
    } else if (!isValidEmail(email)) {
      nextFieldErrors.email = messages.emailInvalid;
    }

    if (dateOfBirth && !isValidPastDate(dateOfBirth)) {
      nextFieldErrors.dateOfBirth = messages.dateInvalid;
    }

    if (!password) {
      nextFieldErrors.password = messages.passwordRequired;
    } else if (!validatePassword({ copy: passwordRules, password })) {
      nextFieldErrors.password = messages.passwordLength;
    }

    setFieldErrors(nextFieldErrors);

    if (hasFieldErrors(nextFieldErrors)) {
      return;
    }

    if (turnstile?.siteKey && !turnstileToken) {
      setTone("danger");
      setMessage(turnstile.requiredMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const profileFields: Record<string, string> = {
        firstName,
        lastName,
      };

      if (dateOfBirth) {
        profileFields.dateOfBirth = dateOfBirth;
      }

      const result = await createSnnAuthClient().signUp.email({
        callbackURL,
        email,
        name,
        password,
        ...profileFields,
        ...withTurnstileFetchOptions(turnstileToken),
      });

      if (result.error) {
        const resolvedError = resolveSignUpError({
          error: result.error as { code?: string; message?: string; status?: number },
          messages,
        });

        setTone("danger");
        if (resolvedError.field) {
          setFieldErrors((currentErrors) => ({
            ...currentErrors,
            [resolvedError.field as SignUpFieldName]: resolvedError.message,
          }));
          setMessage(undefined);
        } else {
          setMessage(resolvedError.message);
        }
        return;
      }

      setTone("success");
      setMessage(undefined);
      onVerificationSent?.(email);
    } catch {
      setTone("danger");
      setMessage(messages.networkError);
    } finally {
      if (turnstile?.siteKey) {
        setTurnstileToken(null);
        setTurnstileResetSignal((currentSignal) => currentSignal + 1);
      }

      setIsSubmitting(false);
    }
  }

  const passwordRuleStates = getPasswordRuleStates({
    copy: passwordRules,
    password: passwordValue,
  });
  const passwordCharacterRuleStates = getPasswordCharacterRuleStates({
    copy: passwordRules,
    password: passwordValue,
  });
  const metPasswordRuleCount = passwordRuleStates.filter((rule) => rule.isMet).length;
  const showPasswordRules = passwordValue.length > 0;

  return (
    <form
      aria-busy={isSubmitting}
      className="auth__form__SW0fp auth__form--compact__SW0if"
      noValidate
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <div className="auth__name-grid__SW0j0">
        <TextField
          autoComplete="given-name"
          autoFocus
          error={fieldErrors.firstName}
          fullWidth
          label={firstNameLabel}
          labelMode="floating"
          name="firstName"
          onChange={() => clearFieldError("firstName")}
          required
          size="md"
        />
        <TextField
          autoComplete="family-name"
          error={fieldErrors.lastName}
          fullWidth
          label={lastNameLabel}
          labelMode="floating"
          name="lastName"
          onChange={() => clearFieldError("lastName")}
          required
          size="md"
        />
      </div>
      <TextField
        autoComplete="email"
        error={fieldErrors.email}
        fullWidth
        label={emailLabel}
        labelMode="floating"
        name="email"
        onChange={() => clearFieldError("email")}
        required
        size="md"
        type="email"
      />
      <DatePicker
        copy={birthdayCalendar}
        defaultViewValue={getBirthdayDefaultViewValue()}
        error={fieldErrors.dateOfBirth}
        fullWidth
        isDateUnavailable={(dateValue) => !isValidPastDate(dateValue)}
        label={dateOfBirthLabel}
        locale={locale}
        maxValue={getTodayInputValue()}
        name="dateOfBirth"
        onValueChange={(nextValue) => {
          setDateOfBirthValue(nextValue);
          clearFieldError("dateOfBirth");
        }}
        value={dateOfBirthValue}
      />
      <PasswordField
        aria-describedby={showPasswordRules ? passwordRulesId : undefined}
        autoComplete="new-password"
        error={fieldErrors.password}
        fullWidth
        label={passwordLabel}
        labelMode="floating"
        maxLength={passwordMaxLength}
        minLength={passwordMinLength}
        name="password"
        onChange={(event) => {
          setPasswordValue(event.currentTarget.value);
          clearFieldError("password");
        }}
        required
        size="md"
        type="password"
      />
      {showPasswordRules ? (
        <div
          className="password-rules__root__SW0j1"
          data-complete-count={metPasswordRuleCount}
          id={passwordRulesId}
        >
          <div className="password-rules__summary__SW0k5">
            <p>{passwordRules.title}</p>
          </div>
          <ul className="password-rules__list__SW0k7">
            {passwordRuleStates.map((rule) => (
              <li data-met={rule.isMet ? "true" : undefined} key={rule.id}>
                <span aria-hidden="true" className="password-rules__indicator__SW0k8">
                  {rule.isMet ? <CheckCircleSolidIcon size={15} /> : null}
                </span>
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
          <ul className="password-rules__classes__SW0k9">
            {passwordCharacterRuleStates.map((rule) => (
              <li data-met={rule.isMet ? "true" : undefined} key={rule.id}>
                <span aria-hidden="true" className="password-rules__indicator__SW0k8">
                  {rule.isMet ? <CheckCircleSolidIcon size={15} /> : null}
                </span>
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <AuthStatusMessage message={message} tone={tone} />

      <TurnstileField
        challenge={turnstile}
        disabled={isSubmitting}
        onTokenChange={setTurnstileToken}
        resetSignal={turnstileResetSignal}
      />

      <Button
        disabled={isSubmitting}
        fullWidth
        loading={isSubmitting}
        size="md"
        type="submit"
      >
        {primaryAction}
      </Button>
    </form>
  );
}
