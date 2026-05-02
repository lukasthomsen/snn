"use client";

import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { cx } from "../cx";

import styles from "./forms.module.css";

type FieldShellProps = {
  children: ReactNode;
  description?: string | undefined;
  error?: string | undefined;
  fieldClassName?: string | undefined;
  hint?: string | undefined;
  label?: string | undefined;
};

function FieldShell({
  children,
  description,
  error,
  fieldClassName,
  hint,
  label,
}: FieldShellProps) {
  return (
    <label className={cx(styles.fieldRoot, fieldClassName)}>
      {label ? <span className={styles.fieldLabel}>{label}</span> : null}
      {children}
      {error ? <span className={styles.fieldError}>{error}</span> : null}
      {!error && hint ? <span className={styles.fieldHint}>{hint}</span> : null}
      {!error && !hint && description ? <span className={styles.fieldHint}>{description}</span> : null}
    </label>
  );
}

type SharedFieldProps = {
  error?: string | undefined;
  fieldClassName?: string | undefined;
  hint?: string | undefined;
  label?: string | undefined;
};

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & SharedFieldProps;

export function TextField({
  className,
  error,
  fieldClassName,
  hint,
  label,
  type = "text",
  ...props
}: TextFieldProps) {
  return (
    <FieldShell error={error} fieldClassName={fieldClassName} hint={hint} label={label}>
      <span className={styles.controlFrame} data-disabled={props.disabled ? "true" : undefined}>
        <input {...props} className={cx(styles.control, className)} type={type} />
      </span>
    </FieldShell>
  );
}

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & SharedFieldProps;

export function PasswordField({
  className,
  error,
  fieldClassName,
  hint,
  label,
  ...props
}: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <FieldShell error={error} fieldClassName={fieldClassName} hint={hint} label={label}>
      <span className={styles.controlFrame} data-disabled={props.disabled ? "true" : undefined}>
        <input {...props} className={cx(styles.control, className)} type={revealed ? "text" : "password"} />
        <button
          className={styles.passwordToggle}
          onClick={() => {
            setRevealed((current) => !current);
          }}
          type="button"
        >
          {revealed ? "Hide" : "Show"}
        </button>
      </span>
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & SharedFieldProps;

export function Textarea({
  className,
  error,
  fieldClassName,
  hint,
  label,
  ...props
}: TextareaProps) {
  return (
    <FieldShell error={error} fieldClassName={fieldClassName} hint={hint} label={label}>
      <span className={styles.controlFrame} data-disabled={props.disabled ? "true" : undefined}>
        <textarea {...props} className={cx(styles.control, styles.textarea, className)} />
      </span>
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & SharedFieldProps;

export function Select({
  children,
  className,
  error,
  fieldClassName,
  hint,
  label,
  ...props
}: SelectProps) {
  return (
    <FieldShell error={error} fieldClassName={fieldClassName} hint={hint} label={label}>
      <span className={styles.controlFrame} data-disabled={props.disabled ? "true" : undefined}>
        <select {...props} className={cx(styles.control, styles.select, className)}>
          {children}
        </select>
      </span>
    </FieldShell>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  description?: string;
  label: string;
};

export function Checkbox({ className, description, label, ...props }: CheckboxProps) {
  return (
    <label className={cx(styles.choiceRow, className)}>
      <input {...props} className={styles.choiceInput} type="checkbox" />
      <span className={styles.choiceCopy}>
        <span className={styles.choiceLabel}>{label}</span>
        {description ? <span className={styles.choiceDescription}>{description}</span> : null}
      </span>
    </label>
  );
}

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  description?: string;
  label: string;
};

export function Radio({ className, description, label, ...props }: RadioProps) {
  return (
    <label className={cx(styles.choiceRow, className)}>
      <input {...props} className={styles.choiceInput} type="radio" />
      <span className={styles.choiceCopy}>
        <span className={styles.choiceLabel}>{label}</span>
        {description ? <span className={styles.choiceDescription}>{description}</span> : null}
      </span>
    </label>
  );
}

type ChoiceTileProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  description?: string;
  label: string;
};

export function ChoiceTile({ checked, className, description, label, ...props }: ChoiceTileProps) {
  return (
    <label className={cx(styles.choiceTile, className)} data-checked={checked ? "true" : undefined}>
      <input
        {...props}
        checked={checked}
        className={styles.choiceTileControl}
        readOnly={props.readOnly ?? (checked !== undefined && !props.onChange)}
        type="radio"
      />
      <span className={styles.choiceLabel}>{label}</span>
      {description ? <span className={styles.choiceDescription}>{description}</span> : null}
    </label>
  );
}
