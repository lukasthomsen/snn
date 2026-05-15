"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { cx } from "../cx";
import type { ComponentColor, ControlSize, VariantPickerDisplay } from "../types";
import { IconButton, LinkButton } from "./actions";
import { CheckIcon, MinusIcon, PlusIcon, StarIcon } from "./icons";

type VariantPickerContextValue = {
  setHoveredLabel: (label: ReactNode | null) => void;
};

const VariantPickerContext = createContext<VariantPickerContextValue | null>(null);

export function QuantityStepper({
  className,
  decrementLabel = "Decrease quantity",
  disabled = false,
  incrementLabel = "Increase quantity",
  label = "Quantity",
  max,
  min = 0,
  onChange,
  size = "md",
  value,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  decrementLabel?: string;
  disabled?: boolean;
  incrementLabel?: string;
  label?: string;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  size?: ControlSize;
  value: number;
}) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && (max === undefined || value < max);

  return (
    <div
      {...props}
      aria-label={label}
      className={cx("quantity-stepper__root__SW2u0", className)}
      data-size={size}
    >
      <IconButton
        aria-label={decrementLabel}
        disabled={!canDecrease}
        onClick={() => onChange?.(value - 1)}
        size={size}
        tone="ghost"
      >
        <MinusIcon />
      </IconButton>
      <span className="quantity-stepper__value__SW2u1">{value}</span>
      <IconButton
        aria-label={incrementLabel}
        disabled={!canIncrease}
        onClick={() => onChange?.(value + 1)}
        size={size}
        tone="ghost"
      >
        <PlusIcon />
      </IconButton>
    </div>
  );
}

export function RatingStars({
  className,
  max = 5,
  rating,
  size = 16,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  max?: number;
  rating: number;
  size?: number;
}) {
  return (
    <span
      {...props}
      aria-label={props["aria-label"] ?? `${rating} out of ${max}`}
      className={cx("rating-stars__root__SW2u2", className)}
    >
      {Array.from({ length: max }, (_, index) => (
        <StarIcon
          aria-hidden="true"
          data-filled={index < Math.round(rating) ? "true" : undefined}
          key={index}
          size={size}
        />
      ))}
    </span>
  );
}

export function RatingSummaryInline({
  className,
  count,
  label,
  rating,
  size = 15,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  count?: number | string;
  label?: string;
  rating: number;
  size?: number;
}) {
  return (
    <span
      {...props}
      aria-label={label}
      className={cx("rating-summary-inline__root__SW2w3", className)}
    >
      <RatingStars
        aria-hidden="true"
        className="rating-summary-inline__stars__SW2w4"
        max={1}
        rating={rating > 0 ? 1 : 0}
        size={size}
      />
      <strong>{rating.toFixed(1)}</strong>
      {count !== undefined ? <span>({count})</span> : null}
    </span>
  );
}

export function VariantPicker({
  children,
  className,
  display = "default",
  selectedLabel,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  display?: VariantPickerDisplay;
  selectedLabel?: ReactNode;
}) {
  const [hoveredLabel, setHoveredLabel] = useState<ReactNode | null>(null);
  const contextValue = useMemo(() => ({ setHoveredLabel }), []);
  const visibleLabel = hoveredLabel ?? selectedLabel;

  return (
    <VariantPickerContext.Provider value={contextValue}>
      <div
        {...props}
        className={cx("variant-picker__root__SW2x5", className)}
        data-display={display}
      >
        {children}
        {display === "media" ? (
          <span className="variant-picker__status__SW2y0">
            {visibleLabel}
          </span>
        ) : null}
      </div>
    </VariantPickerContext.Provider>
  );
}

export function VariantPickerOption({
  children,
  className,
  disabled = false,
  display = "default",
  imageAlt = "",
  imageUrl,
  isSelected = false,
  isUnavailable = false,
  label,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  display?: VariantPickerDisplay;
  imageAlt?: string;
  imageUrl?: string | null | undefined;
  isSelected?: boolean;
  isUnavailable?: boolean;
  label?: ReactNode;
}) {
  const pickerContext = useContext(VariantPickerContext);
  const disabledState = disabled || isUnavailable;
  const optionLabel = label ?? children;

  return (
    <button
      {...props}
      aria-pressed={isSelected}
      className={cx("variant-picker__option__SW2x6", className)}
      data-display={display}
      data-selected={isSelected ? "true" : undefined}
      data-unavailable={isUnavailable ? "true" : undefined}
      disabled={disabledState}
      onBlur={(event) => {
        pickerContext?.setHoveredLabel(null);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        pickerContext?.setHoveredLabel(optionLabel);
        onFocus?.(event);
      }}
      onMouseEnter={(event) => {
        pickerContext?.setHoveredLabel(optionLabel);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        pickerContext?.setHoveredLabel(null);
        onMouseLeave?.(event);
      }}
      type={type}
    >
      {display === "media" ? (
        <span className="variant-picker__media__SW2x7">
          {imageUrl ? (
            <img alt={imageAlt} src={imageUrl} />
          ) : (
            <span aria-hidden="true" className="variant-picker__media-placeholder__SW2x8" />
          )}
        </span>
      ) : null}
      <span className="variant-picker__label__SW2x9">{children}</span>
    </button>
  );
}

export function MetricCard({
  children,
  className,
  grow = false,
  label,
  size = "md",
  value,
  ...props
}: HTMLAttributes<HTMLElement> & {
  grow?: boolean;
  label: ReactNode;
  size?: "lg" | "md";
  value: ReactNode;
}) {
  return (
    <article
      {...props}
      className={cx("metric-card__root__SW2u3", className)}
      data-grow={grow ? "true" : undefined}
      data-size={size}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      {children}
    </article>
  );
}

export function CheckoutSection({
  action,
  children,
  className,
  description,
  title,
  ...props
}: HTMLAttributes<HTMLElement> & {
  action?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}) {
  return (
    <section {...props} className={cx("checkout-section__root__SW2u4", className)}>
      <div className="checkout-section__heading__SW2u5">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PaymentMethodCard({
  active = false,
  children,
  className,
  icon,
  label,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  icon?: ReactNode;
  label: ReactNode;
}) {
  return (
    <div
      {...props}
      className={cx("payment-method__root__SW2u6", className)}
      data-active={active ? "true" : undefined}
    >
      <span className="payment-method__indicator__SW2u7">
        {active ? <CheckIcon /> : null}
      </span>
      <strong>{label}</strong>
      {icon ? <span className="payment-method__icon__SW2u8">{icon}</span> : null}
      {children}
    </div>
  );
}

export function OrderSummary({
  children,
  className,
  title,
  ...props
}: HTMLAttributes<HTMLElement> & {
  title: ReactNode;
}) {
  return (
    <section {...props} className={cx("order-summary__root__SW2u9", className)}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function PromoBanner({
  action,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
}) {
  return (
    <div {...props} className={cx("promo-banner__root__SW2v0", className)}>
      <span>{children}</span>
      {action ? <span className="promo-banner__action__SW2v1">{action}</span> : null}
    </div>
  );
}

export function HeaderAction({
  ariaCurrent,
  as = "button",
  children,
  className,
  disabled = false,
  href,
  isActive = false,
  label,
  onClick,
  type = "button",
}: {
  ariaCurrent?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
  as?: "a" | "button";
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  isActive?: boolean;
  label: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}) {
  if (as === "a") {
    return (
      <LinkButton
        aria-current={ariaCurrent}
        aria-label={label}
        className={className}
        data-active={isActive ? "true" : undefined}
        href={href}
        isDisabled={disabled}
        isIconOnly
        tone="ghost"
      >
        {children}
      </LinkButton>
    );
  }

  return (
    <IconButton
      aria-label={label}
      className={className}
      data-active={isActive ? "true" : undefined}
      disabled={disabled}
      onClick={onClick}
      tone="ghost"
      type={type}
    >
      {children}
    </IconButton>
  );
}

export function StatusChip({
  children,
  color = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  color?: ComponentColor;
}) {
  return (
    <span {...props} className={cx("status-chip__root__SW2v2", props.className)} data-color={color}>
      {children}
    </span>
  );
}
