import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cx } from "../cx";
import type { BadgeTone, ControlShape, ControlSize, ControlTone } from "../types";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  shape?: ControlShape;
  size?: ControlSize;
  tone?: ControlTone;
};

export function Button({
  children,
  className,
  fullWidth = false,
  iconOnly = false,
  loading = false,
  shape = "pill",
  size = "md",
  tone = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx("button__root__SW0b3", className)}
      data-full-width={fullWidth ? "true" : undefined}
      data-icon-only={iconOnly ? "true" : undefined}
      data-pending={loading ? "true" : undefined}
      data-shape={shape}
      data-size={size}
      data-tone={tone}
      data-variant={tone}
      disabled={props.disabled || loading}
      type={type}
    >
      {loading ? <span aria-hidden="true" className="button__spinner__SW0b6" /> : null}
      <span className="button__content__SW0b5">{children}</span>
    </button>
  );
}

type IconButtonProps = ButtonProps;

export function IconButton({ className, ...props }: IconButtonProps) {
  return <Button {...props} className={cx("button__icon__SW0b4", className)} iconOnly />;
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ children, className, tone = "default", ...props }: BadgeProps) {
  return (
    <span {...props} className={cx("badge__root__SW0b7", className)} data-tone={tone}>
      {children}
    </span>
  );
}
