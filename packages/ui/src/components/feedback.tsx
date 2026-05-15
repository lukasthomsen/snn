"use client";

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { cx } from "../cx";
import type { ComponentColor, ControlSize, SpinnerSize } from "../types";
import { CheckIcon, CircleHelpIcon, Clock3Icon, XIcon } from "./icons";

type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: SpinnerSize;
};

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cx("spinner__root__SW0cp", className)}
      data-size={size}
    />
  );
}

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: ComponentColor;
  title?: ReactNode;
};

function getDefaultAlertIcon(status: ComponentColor) {
  if (status === "success") {
    return <CheckIcon />;
  }

  if (status === "danger") {
    return <XIcon />;
  }

  if (status === "warning") {
    return <Clock3Icon />;
  }

  return <CircleHelpIcon />;
}

export function Alert({
  action,
  children,
  className,
  description,
  icon,
  status = "default",
  title,
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      className={cx("notice__root__SW1v0", className)}
      data-status={status}
      role={props.role ?? (status === "danger" ? "alert" : "status")}
    >
      <span aria-hidden="true" className="notice__indicator__SW1v1">
        {icon ?? getDefaultAlertIcon(status)}
      </span>
      <span className="notice__content__SW1v2">
        {title ? <strong className="notice__title__SW1v3">{title}</strong> : null}
        {description ? (
          <span className="notice__description__SW1v4">{description}</span>
        ) : null}
        {children}
      </span>
      {action ? <span className="notice__action__SW1v5">{action}</span> : null}
    </div>
  );
}

type BarProps = HTMLAttributes<HTMLDivElement> & {
  animateOnVisible?: boolean;
  color?: ComponentColor;
  formatOptions?: Intl.NumberFormatOptions | undefined;
  isIndeterminate?: boolean;
  label?: ReactNode;
  maxValue?: number;
  minValue?: number;
  showValueLabel?: boolean;
  size?: ControlSize;
  value?: number;
  valueLabel?: ReactNode;
};

function getPercent(value = 0, minValue = 0, maxValue = 100) {
  if (maxValue <= minValue) {
    return 0;
  }

  return Math.min(Math.max(((value - minValue) / (maxValue - minValue)) * 100, 0), 100);
}

function formatStableNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, "");
}

function getValueText({
  formatOptions,
  maxValue,
  minValue,
  value,
}: Required<Pick<BarProps, "maxValue" | "minValue" | "value">> &
  Pick<BarProps, "formatOptions">) {
  if (!formatOptions) {
    return `${formatStableNumber(getPercent(value, minValue, maxValue))}%`;
  }

  return new Intl.NumberFormat("en-US", formatOptions).format(value);
}

function ProgressLike({
  animateOnVisible,
  className,
  color = "accent",
  formatOptions,
  isIndeterminate = false,
  label,
  maxValue = 100,
  minValue = 0,
  role,
  showValueLabel = true,
  size = "md",
  value = 0,
  valueLabel,
  ...props
}: BarProps & {
  role: "meter" | "progressbar";
}) {
  const percentage = getPercent(value, minValue, maxValue);
  const shouldAnimateOnVisible = animateOnVisible ?? role === "progressbar";
  const [isVisible, setIsVisible] = useState(!shouldAnimateOnVisible);
  const rootRef = useRef<HTMLDivElement>(null);
  const valueText =
    valueLabel ??
    getValueText({
      formatOptions,
      maxValue,
      minValue,
      value,
    });
  const ariaValueText =
    typeof valueText === "string" || typeof valueText === "number"
      ? String(valueText)
      : undefined;

  useEffect(() => {
    if (!shouldAnimateOnVisible || isIndeterminate) {
      setIsVisible(true);
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return undefined;
    }

    const element = rootRef.current;

    if (!element || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    setIsVisible(false);

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) {
        return;
      }

      setIsVisible(true);
      observer.disconnect();
    }, {
      threshold: 0.2,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [isIndeterminate, shouldAnimateOnVisible]);

  return (
    <div
      {...props}
      aria-valuemax={isIndeterminate ? undefined : maxValue}
      aria-valuemin={isIndeterminate ? undefined : minValue}
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuetext={isIndeterminate ? undefined : ariaValueText}
      className={cx("progress__root__SW1v6", className)}
      data-color={color}
      data-indeterminate={isIndeterminate ? "true" : undefined}
      data-size={size}
      data-visible={isVisible ? "true" : undefined}
      ref={rootRef}
      role={role}
      style={
        {
          "--progress-value": `${isVisible ? percentage : 0}%`,
          ...props.style,
        } as CSSProperties
      }
    >
      {label || showValueLabel ? (
        <span className="progress__meta__SW1v7">
          {label ? <span>{label}</span> : <span />}
          {showValueLabel ? (
            <output className="progress__output__SW1v8">{valueText}</output>
          ) : null}
        </span>
      ) : null}
      <span className="progress__track__SW1v9">
        <span className="progress__fill__SW1w0" />
      </span>
    </div>
  );
}

export function ProgressBar(props: BarProps) {
  return <ProgressLike {...props} role="progressbar" />;
}

export function Meter(props: BarProps) {
  return <ProgressLike {...props} role="meter" />;
}

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  radius?: "full" | "md" | "sm";
};

export function Skeleton({
  className,
  radius = "md",
  ...props
}: SkeletonProps) {
  return (
    <span
      {...props}
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cx("skeleton__root__SW1w1", className)}
      data-radius={radius}
    />
  );
}

type EmptyStateProps = HTMLAttributes<HTMLElement> & {
  action?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  size?: "lg" | "md";
  title: ReactNode;
  tone?: "default" | "muted";
};

export function EmptyState({
  action,
  children,
  className,
  description,
  icon,
  size = "md",
  title,
  tone = "default",
  ...props
}: EmptyStateProps) {
  return (
    <section
      {...props}
      className={cx("empty-state__root__SW1w2", className)}
      data-size={size}
      data-tone={tone}
    >
      {icon ? <span className="empty-state__icon__SW1w3">{icon}</span> : null}
      <div className="empty-state__content__SW1w4">
        <strong>{title}</strong>
        {description ? <p>{description}</p> : null}
        {children}
      </div>
      {action ? <div className="empty-state__action__SW1w5">{action}</div> : null}
    </section>
  );
}
