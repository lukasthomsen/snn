import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cx } from "../cx";
import type { BadgeTone, ControlSize, ControlTone } from "../types";

import styles from "./actions.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  loading?: boolean;
  size?: ControlSize;
  tone?: ControlTone;
};

export function Button({
  children,
  className,
  fullWidth = false,
  loading = false,
  size = "md",
  tone = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(styles.button, className)}
      data-full-width={fullWidth ? "true" : undefined}
      data-size={size}
      data-tone={tone}
      disabled={props.disabled || loading}
      type={type}
    >
      {loading ? <span aria-hidden="true" className={styles.spinner} /> : null}
      <span>{children}</span>
    </button>
  );
}

type IconButtonProps = ButtonProps;

export function IconButton({ className, ...props }: IconButtonProps) {
  return <Button {...props} className={cx(styles.iconButton, className)} />;
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ children, className, tone = "default", ...props }: BadgeProps) {
  return (
    <span {...props} className={cx(styles.badge, className)} data-tone={tone}>
      {children}
    </span>
  );
}
