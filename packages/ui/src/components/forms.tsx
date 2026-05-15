"use client";

import {
  useEffect,
  useRef,
  useState,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cx } from "../cx";
import type { ControlSize, FormControlVariant } from "../types";
import {
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
} from "./icons";

function callEventHandler<TEvent>(
  handler: ((event: TEvent) => void) | undefined,
  event: TEvent,
) {
  handler?.(event);
}

function useInteractiveState() {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return {
    focused,
    hovered,
    interactiveHandlers: {
      onBlur: () => {
        setFocused(false);
      },
      onFocus: () => {
        setFocused(true);
      },
      onPointerEnter: () => {
        setHovered(true);
      },
      onPointerLeave: () => {
        setHovered(false);
      },
    },
  };
}

type SharedFieldProps = {
  description?: string | undefined;
  error?: string | undefined;
  fieldClassName?: string | undefined;
  fullWidth?: boolean | undefined;
  invalid?: boolean | undefined;
  label?: string | undefined;
  size?: ControlSize | undefined;
  variant?: FormControlVariant | undefined;
};

type FieldProps = {
  children: ReactNode;
  className?: string | undefined;
  description?: string | undefined;
  error?: string | undefined;
  fullWidth?: boolean | undefined;
  label?: string | undefined;
};

export function Field({
  children,
  className,
  description,
  error,
  fullWidth = false,
  label,
}: FieldProps) {
  return (
    <label
      className={cx("field__root__SW0bd", className)}
      data-full-width={fullWidth ? "true" : undefined}
    >
      {label ? <span className="label__root__SW0bl">{label}</span> : null}
      {children}
      {description && !error ? (
        <p className="description__root__SW0bm">{description}</p>
      ) : null}
      <p
        className="error__root__SW0bn"
        data-visible={error ? "true" : undefined}
      >
        {error}
      </p>
    </label>
  );
}

export function Form({
  children,
  className,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form {...props} className={cx("form__root__SW0bo", className)}>
      {children}
    </form>
  );
}

type FieldsetProps = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  actions?: ReactNode;
  columns?: 1 | 2;
  legend: string;
};

export function Fieldset({
  actions,
  children,
  className,
  columns = 2,
  legend,
  style,
  ...props
}: FieldsetProps) {
  return (
    <fieldset
      {...props}
      className={cx("fieldset__root__SW0bp", className)}
      style={style}
    >
      <legend className="fieldset__legend__SW0bq">{legend}</legend>
      <div
        className="fieldset__group__SW0br"
        style={
          columns === 1
            ? {
                gridTemplateColumns: "1fr",
              }
            : undefined
        }
      >
        {children}
      </div>
      {actions ? <div className="fieldset__actions__SW0bs">{actions}</div> : null}
    </fieldset>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & SharedFieldProps;

export function TextField({
  className,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  size = "md",
  variant = "primary",
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  ...props
}: TextFieldProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
    >
      <input
        {...props}
        aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
        className={cx("input__root__SW0be", className)}
        data-control-focused={focused ? "true" : undefined}
        data-control-hovered={hovered ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={invalid || error ? "true" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
      />
    </Field>
  );
}

type ColorFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> &
  SharedFieldProps & {
    textInputName?: string;
  };

export function ColorField({
  className,
  defaultValue,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  name,
  size = "md",
  textInputName,
  value,
  variant = "primary",
  ...props
}: ColorFieldProps) {
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? value ?? "#000000"));
  const controlled = value !== undefined;
  const currentValue = String(controlled ? value : internalValue);

  function update(nextValue: string) {
    if (!controlled) {
      setInternalValue(nextValue);
    }

    props.onChange?.({
      target: {
        value: nextValue,
      },
    } as ChangeEvent<HTMLInputElement>);
  }

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
    >
      <span
        className={cx("color-field__root__SW1r0", className)}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={invalid || error ? "true" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
      >
        <input
          {...props}
          aria-label={label ? undefined : props["aria-label"]}
          className="color-field__swatch__SW1r1"
          name={name}
          onChange={(event) => update(event.target.value)}
          type="color"
          value={currentValue}
        />
        <input
          aria-label={label ? `${label} value` : undefined}
          className="color-field__input__SW1r2"
          name={textInputName}
          onChange={(event) => update(event.target.value)}
          value={currentValue}
        />
      </span>
    </Field>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & SharedFieldProps;

export function Textarea({
  className,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  size = "md",
  variant = "primary",
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  ...props
}: TextareaProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
    >
      <textarea
        {...props}
        aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
        className={cx("textarea__root__SW0bf", className)}
        data-control-focused={focused ? "true" : undefined}
        data-control-hovered={hovered ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={invalid || error ? "true" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
      />
    </Field>
  );
}

type InputGroupProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  SharedFieldProps & {
    prefix?: ReactNode;
    suffix?: ReactNode;
    suffixAction?: ReactNode;
  };

export function InputGroup({
  className,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  prefix,
  size = "md",
  suffix,
  suffixAction,
  variant = "primary",
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  ...props
}: InputGroupProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
    >
      <span
        className={cx("input-group__root__SW0bg", className)}
        data-control-focused={focused ? "true" : undefined}
        data-control-hovered={hovered ? "true" : undefined}
        data-disabled={props.disabled ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={invalid || error ? "true" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
      >
        {prefix ? <span className="input-group__prefix__SW0bz">{prefix}</span> : null}
        <input
          {...props}
          aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
          className="input-group__input__SW0bw"
          data-size={size}
          onBlur={(event) => {
            interactiveHandlers.onBlur();
            callEventHandler(onBlur, event);
          }}
          onFocus={(event) => {
            interactiveHandlers.onFocus();
            callEventHandler(onFocus, event);
          }}
          onPointerEnter={(event) => {
            interactiveHandlers.onPointerEnter();
            callEventHandler(onPointerEnter, event);
          }}
          onPointerLeave={(event) => {
            interactiveHandlers.onPointerLeave();
            callEventHandler(onPointerLeave, event);
          }}
        />
        {suffix ? <span className="input-group__suffix__SW0c0">{suffix}</span> : null}
        {suffixAction ? (
          <span className="input-group__action__SW0c1" data-size={size}>
            {suffixAction}
          </span>
        ) : null}
      </span>
    </Field>
  );
}

type PasswordFieldProps = Omit<InputGroupProps, "prefix" | "suffixAction">;

export function PasswordField({
  suffix,
  ...props
}: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <InputGroup
      {...props}
      suffix={suffix}
      suffixAction={
        <button
          aria-label={revealed ? "Hide password" : "Show password"}
          className="input-group__action__SW0c1"
          onClick={() => {
            setRevealed((current) => !current);
          }}
          type="button"
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
      type={revealed ? "text" : "password"}
    />
  );
}

type SearchFieldProps = Omit<TextFieldProps, "type"> & {
  icon?: ReactNode;
};

export function SearchField({
  className,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  icon = <SearchIcon />,
  invalid = false,
  label,
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  size = "md",
  variant = "primary",
  ...props
}: SearchFieldProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
    >
      <span
        aria-invalid={invalid || !!error ? "true" : undefined}
        className="search__root__SW0bi"
        data-full-width={fullWidth ? "true" : undefined}
        data-size={size}
        data-variant={variant}
      >
        <span aria-hidden="true" className="search__icon__SW0c2">
          {icon}
        </span>
        <input
          {...props}
          className={cx(
            "input__root__SW0be",
            "search__input__SW0by",
            className,
          )}
          data-control-focused={focused ? "true" : undefined}
          data-control-hovered={hovered ? "true" : undefined}
          data-full-width={fullWidth ? "true" : undefined}
          data-invalid={invalid || error ? "true" : undefined}
          data-size={size}
          data-variant={variant === "secondary" ? "secondary" : undefined}
          onBlur={(event) => {
            interactiveHandlers.onBlur();
            callEventHandler(onBlur, event);
          }}
          onFocus={(event) => {
            interactiveHandlers.onFocus();
            callEventHandler(onFocus, event);
          }}
          onPointerEnter={(event) => {
            interactiveHandlers.onPointerEnter();
            callEventHandler(onPointerEnter, event);
          }}
          onPointerLeave={(event) => {
            interactiveHandlers.onPointerLeave();
            callEventHandler(onPointerLeave, event);
          }}
          type="search"
        />
      </span>
    </Field>
  );
}

type NumberFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "onChange" | "size" | "type" | "value"> &
  SharedFieldProps & {
    defaultValue?: number;
    onValueChange?: (value: number | null, rawValue: string) => void;
    step?: number;
    value?: number;
  };

export function NumberField({
  className,
  defaultValue,
  description,
  disabled,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  max,
  min,
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  onValueChange,
  size = "md",
  step = 1,
  value,
  variant = "primary",
  ...props
}: NumberFieldProps) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue === undefined ? "" : String(defaultValue),
  );
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const rawValue = controlled ? String(value ?? "") : internalValue;

  function commit(nextValue: string) {
    if (!controlled) {
      setInternalValue(nextValue);
    }

    const parsed =
      nextValue.trim().length === 0 || Number.isNaN(Number(nextValue))
        ? null
        : Number(nextValue);

    onValueChange?.(parsed, nextValue);
  }

  function adjust(delta: number) {
    const current = rawValue.trim().length === 0 ? 0 : Number(rawValue);
    const next = Number.isNaN(current) ? 0 : current + delta;
    const minValue = min === undefined ? next : Math.max(Number(min), next);
    const bounded = max === undefined ? minValue : Math.min(Number(max), minValue);
    commit(String(bounded));
  }

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
    >
      <span
        className="number-field__root__SW0bh"
        data-disabled={disabled ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
      >
        <span
          className={cx("number-field__group__SW0bt", className)}
          data-disabled={disabled ? "true" : undefined}
          data-focus-within={focused ? "true" : undefined}
          data-full-width={fullWidth ? "true" : undefined}
          data-invalid={invalid || error ? "true" : undefined}
          data-control-hovered={hovered ? "true" : undefined}
          data-size={size}
          data-variant={variant === "secondary" ? "secondary" : undefined}
        >
          <button
            className="number-field__control__SW0c3"
            disabled={disabled}
            onClick={() => {
              adjust(-step);
            }}
            type="button"
          >
            <MinusIcon size={16} />
          </button>
          <input
            {...props}
            aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
            className="number-field__input__SW0bx"
            data-size={size}
            disabled={disabled}
            max={max}
            min={min}
            onBlur={(event) => {
              interactiveHandlers.onBlur();
              callEventHandler(onBlur, event);
            }}
            onChange={(event) => {
              commit(event.target.value);
            }}
            onFocus={(event) => {
              interactiveHandlers.onFocus();
              callEventHandler(onFocus, event);
            }}
            onPointerEnter={(event) => {
              interactiveHandlers.onPointerEnter();
              callEventHandler(onPointerEnter, event);
            }}
            onPointerLeave={(event) => {
              interactiveHandlers.onPointerLeave();
              callEventHandler(onPointerLeave, event);
            }}
            step={step}
            type="number"
            value={rawValue}
          />
          <button
            className="number-field__control__SW0c3"
            disabled={disabled}
            onClick={() => {
              adjust(step);
            }}
            type="button"
          >
            <PlusIcon size={16} />
          </button>
        </span>
      </span>
    </Field>
  );
}

type InputOtpProps = SharedFieldProps & {
  autoComplete?: string;
  disabled?: boolean;
  length?: number;
  onValueChange?: (value: string) => void;
  separatorEvery?: number;
  value?: string;
};

export function InputOtp({
  autoComplete = "one-time-code",
  description,
  disabled = false,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  length = 6,
  onValueChange,
  size = "md",
  separatorEvery = 3,
  value,
  variant = "primary",
}: InputOtpProps) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const currentValue = (controlled ? value : internalValue) ?? "";
  const characters = Array.from({ length }, (_, index) => currentValue[index] ?? "");

  function updateValue(nextValue: string) {
    if (!controlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  function handleChange(index: number, nextCharacter: string) {
    const cleaned = nextCharacter.slice(-1);
    const nextCharacters = [...characters];
    nextCharacters[index] = cleaned;
    updateValue(nextCharacters.join(""));

    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !characters[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
    >
      <div
        className="otp__root__SW0bk"
        data-disabled={disabled ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
      >
        <div className="otp__container__SW0c4">
          {characters.map((character, index) => {
            const separator =
              separatorEvery > 0 &&
              index > 0 &&
              index < characters.length &&
              index % separatorEvery === 0;

            return (
              <div className="otp__group__SW0c5" key={index}>
                {separator ? (
                  <span
                    aria-hidden="true"
                    className="otp__separator__SW0c6"
                  />
                ) : null}
                <input
                  autoComplete={autoComplete}
                  className="otp__slot__SW0bu"
                  data-active={activeIndex === index ? "true" : undefined}
                  data-control-hovered={hoveredIndex === index ? "true" : undefined}
                  data-disabled={disabled ? "true" : undefined}
                  data-filled={character ? "true" : undefined}
                  data-invalid={invalid || error ? "true" : undefined}
                  data-size={size}
                  disabled={disabled}
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  onChange={(event) => {
                    handleChange(index, event.target.value);
                  }}
                  onFocus={() => {
                    setActiveIndex(index);
                  }}
                  onBlur={() => {
                    setActiveIndex((current) => (current === index ? null : current));
                  }}
                  onKeyDown={(event) => {
                    handleKeyDown(index, event);
                  }}
                  onPointerEnter={() => {
                    setHoveredIndex(index);
                  }}
                  onPointerLeave={() => {
                    setHoveredIndex((current) => (current === index ? null : current));
                  }}
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  type="text"
                  value={character}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Field>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & SharedFieldProps;

export function Select({
  children,
  className,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  size = "md",
  variant = "primary",
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  ...props
}: SelectProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
    >
      <span
        className="select__root__SW0bj"
        data-full-width={fullWidth ? "true" : undefined}
        data-size={size}
      >
        <select
          {...props}
          aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
          className={cx("select__control__SW0bv", className)}
          data-control-focused={focused ? "true" : undefined}
          data-control-hovered={hovered ? "true" : undefined}
          data-full-width={fullWidth ? "true" : undefined}
          data-invalid={invalid || error ? "true" : undefined}
          data-size={size}
          data-variant={variant === "secondary" ? "secondary" : undefined}
          onBlur={(event) => {
            interactiveHandlers.onBlur();
            callEventHandler(onBlur, event);
          }}
          onFocus={(event) => {
            interactiveHandlers.onFocus();
            callEventHandler(onFocus, event);
          }}
          onPointerEnter={(event) => {
            interactiveHandlers.onPointerEnter();
            callEventHandler(onPointerEnter, event);
          }}
          onPointerLeave={(event) => {
            interactiveHandlers.onPointerLeave();
            callEventHandler(onPointerLeave, event);
          }}
        >
          {children}
        </select>
        <span aria-hidden="true" className="select__icon__SW0c7">
          <ChevronDownIcon size={16} />
        </span>
      </span>
    </Field>
  );
}

type GroupProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  hideLabel?: boolean;
  label?: string;
  orientation?: "horizontal" | "vertical";
};

export function CheckboxGroup({
  children,
  className,
  description,
  disabled = false,
  error,
  hideLabel = false,
  label,
}: GroupProps) {
  return (
    <fieldset
      className={cx("checkbox-group__root__SW0c8", className)}
      data-disabled={disabled ? "true" : undefined}
      data-label-hidden={hideLabel ? "true" : undefined}
      disabled={disabled}
    >
      {label ? <legend className="label__root__SW0bl">{label}</legend> : null}
      {description && !error ? (
        <p className="description__root__SW0bm">{description}</p>
      ) : null}
      {error ? (
        <p className="error__root__SW0bn" data-visible="true">
          {error}
        </p>
      ) : null}
      <div className="checkbox-group__items__SW0ca">{children}</div>
    </fieldset>
  );
}

export function RadioGroup({
  children,
  className,
  description,
  disabled = false,
  error,
  hideLabel = false,
  label,
  orientation = "vertical",
}: GroupProps) {
  return (
    <fieldset
      className={cx("radio-group__root__SW0c9", className)}
      data-disabled={disabled ? "true" : undefined}
      data-label-hidden={hideLabel ? "true" : undefined}
      data-orientation={orientation}
      disabled={disabled}
    >
      {label ? <legend className="label__root__SW0bl">{label}</legend> : null}
      {description && !error ? (
        <p className="description__root__SW0bm">{description}</p>
      ) : null}
      {error ? (
        <p className="error__root__SW0bn" data-visible="true">
          {error}
        </p>
      ) : null}
      <div className="radio-group__items__SW0cb">{children}</div>
    </fieldset>
  );
}

type SelectionControlProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  description?: string;
  fullWidth?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  label: string;
  variant?: FormControlVariant;
};

export function Checkbox({
  checked,
  className,
  defaultChecked,
  description,
  disabled = false,
  fullWidth = false,
  indeterminate = false,
  invalid = false,
  label,
  onBlur,
  onChange,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  variant = "primary",
  ...props
}: SelectionControlProps) {
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const selected = controlled ? Boolean(checked) : internalChecked;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={cx("checkbox__root__SW0cc", className)}
      data-disabled={disabled ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      data-hovered={hovered ? "true" : undefined}
      data-indeterminate={indeterminate ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-variant={variant === "secondary" ? "secondary" : undefined}
    >
      <input
        {...props}
        checked={checked}
        className="selection__input__SW0ce"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onChange={(event) => {
          if (!controlled) {
            setInternalChecked(event.target.checked);
          }
          callEventHandler(onChange, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
        ref={inputRef}
        type="checkbox"
      />
      <span className="checkbox__control__SW0cg">
        <span className="checkbox__indicator__SW0ci">
          <svg
            aria-hidden="true"
            className={cx("checkbox__icon__SW0ck", "checkbox__check__SW0cm")}
            viewBox="0 0 16 16"
          >
            <path d="M3.6 8.2 6.7 11.3 12.4 4.9" fill="none" />
          </svg>
          <svg
            aria-hidden="true"
            className={cx("checkbox__icon__SW0ck", "checkbox__mixed__SW0cl")}
            viewBox="0 0 16 16"
          >
            <path d="M4 8h8" fill="none" />
          </svg>
        </span>
      </span>
      <span className="selection__content__SW0cn">
        <span className="label__root__SW0bl">{label}</span>
        {description ? <span className="description__root__SW0bm">{description}</span> : null}
      </span>
    </label>
  );
}

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  description?: string;
  invalid?: boolean;
  label: string;
  size?: ControlSize;
  variant?: FormControlVariant;
};

export function Switch({
  checked,
  className,
  defaultChecked,
  description,
  disabled = false,
  invalid = false,
  label,
  onBlur,
  onChange,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  size = "md",
  variant = "primary",
  ...props
}: SwitchProps) {
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const selected = controlled ? Boolean(checked) : internalChecked;

  return (
    <label
      className={cx("switch__root__SW1r3", className)}
      data-disabled={disabled ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      data-hovered={hovered ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-size={size}
      data-variant={variant === "secondary" ? "secondary" : undefined}
    >
      <input
        {...props}
        checked={checked}
        className="selection__input__SW0ce"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onChange={(event) => {
          if (!controlled) {
            setInternalChecked(event.target.checked);
          }
          callEventHandler(onChange, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
        role="switch"
        type="checkbox"
      />
      <span className="switch__track__SW1r4">
        <span className="switch__thumb__SW1r5" />
      </span>
      <span className="selection__content__SW0cn">
        <span className="label__root__SW0bl">{label}</span>
        {description ? <span className="description__root__SW0bm">{description}</span> : null}
      </span>
    </label>
  );
}

export function Radio({
  checked,
  className,
  defaultChecked,
  description,
  disabled = false,
  fullWidth = false,
  invalid = false,
  label,
  onBlur,
  onChange,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  variant = "primary",
  ...props
}: SelectionControlProps) {
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const selected = controlled ? Boolean(checked) : internalChecked;

  return (
    <label
      className={cx("radio__root__SW0cd", className)}
      data-disabled={disabled ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      data-hovered={hovered ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-variant={variant === "secondary" ? "secondary" : undefined}
    >
      <input
        {...props}
        checked={checked}
        className="selection__input__SW0ce"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onChange={(event) => {
          if (!controlled) {
            setInternalChecked(event.target.checked);
          }
          callEventHandler(onChange, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
        type="radio"
      />
      <span className="radio__control__SW0ch">
        <span className="radio__indicator__SW0cj" />
      </span>
      <span className="selection__content__SW0cn">
        <span className="label__root__SW0bl">{label}</span>
        {description ? <span className="description__root__SW0bm">{description}</span> : null}
      </span>
    </label>
  );
}

type ChoiceTileProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  description?: string;
  label: string;
};

export function ChoiceTile({
  checked,
  className,
  description,
  label,
  onBlur,
  onFocus,
  ...props
}: ChoiceTileProps) {
  const { focused, interactiveHandlers } = useInteractiveState();

  return (
    <label
      className={cx("choice-tile__root__SW0co", className)}
      data-focused={focused ? "true" : undefined}
      data-selected={checked ? "true" : undefined}
    >
      <input
        {...props}
        checked={checked}
        className="choice-tile__input__SW0cf"
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        readOnly={props.readOnly ?? (checked !== undefined && !props.onChange)}
        type="radio"
      />
      <span className="label__root__SW0bl">{label}</span>
      {description ? <span className="description__root__SW0bm">{description}</span> : null}
    </label>
  );
}
