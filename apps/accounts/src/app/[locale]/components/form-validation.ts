export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

export function hasFieldErrors<TField extends string>(errors: FieldErrors<TField>) {
  return Object.values(errors).some(Boolean);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function removeFieldError<TField extends string>(
  errors: FieldErrors<TField>,
  field: TField,
) {
  if (!errors[field]) {
    return errors;
  }

  const nextErrors = { ...errors };
  delete nextErrors[field];

  return nextErrors;
}
