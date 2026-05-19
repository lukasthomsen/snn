import {
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import { cx } from "../cx";
import type {
  BadgePlacement,
  BadgeShape,
  BadgeTone,
  BadgeVariant,
  ComponentColor,
  ComponentRadius,
  ControlShape,
  ControlSize,
  ControlTone,
  ControlVariant,
} from "../types";
import { HeartIcon, XIcon } from "./icons";

type SharedActionProps = {
  color?: ComponentColor | undefined;
  fullWidth?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isIconOnly?: boolean | undefined;
  isPending?: boolean | undefined;
  radius?: ComponentRadius | undefined;
  shape?: ControlShape | undefined;
  size?: ControlSize | undefined;
  tone?: ControlTone | undefined;
  variant?: ControlVariant | undefined;
};

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> &
  SharedActionProps & {
    iconOnly?: boolean;
    loading?: boolean;
    onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
  };

function normalizeVariant(tone: ControlTone | undefined, variant: ControlVariant | undefined) {
  return variant ?? tone ?? "primary";
}

function normalizePending(loading: boolean | undefined, isPending: boolean | undefined) {
  return isPending ?? loading ?? false;
}

function normalizeIconOnly(iconOnly: boolean | undefined, isIconOnly: boolean | undefined) {
  return isIconOnly ?? iconOnly ?? false;
}

function getActionData({
  color = "default",
  fullWidth = false,
  iconOnly = false,
  isDisabled = false,
  isPending = false,
  radius = "full",
  shape = "pill",
  size = "md",
  variant = "primary",
}: SharedActionProps & {
  iconOnly?: boolean;
  isPending?: boolean;
  variant?: ControlVariant;
}) {
  return {
    "data-color": color,
    "data-full-width": fullWidth ? "true" : undefined,
    "data-icon-only": iconOnly ? "true" : undefined,
    "data-pending": isPending ? "true" : undefined,
    "data-radius": radius,
    "data-shape": shape,
    "data-size": size,
    "data-tone": variant,
    "data-variant": variant,
    "aria-disabled": isDisabled || isPending ? true : undefined,
  } as const;
};

export function Button({
  children,
  className,
  color,
  disabled,
  fullWidth = false,
  iconOnly = false,
  isDisabled = false,
  isIconOnly,
  isPending,
  loading = false,
  onClick,
  onPress,
  radius,
  shape = "pill",
  size = "md",
  tone = "primary",
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  const pending = normalizePending(loading, isPending);
  const buttonVariant = normalizeVariant(tone, variant);
  const onlyIcon = normalizeIconOnly(iconOnly, isIconOnly);
  const disabledState = disabled || isDisabled || pending;
  const clickProps = onClick || onPress
    ? {
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            onPress?.(event);
          }
        },
      }
    : {};

  return (
    <button
      {...props}
      {...clickProps}
      className={cx("button__root__SW0b3", className)}
      {...getActionData({
        color,
        fullWidth,
        iconOnly: onlyIcon,
        isDisabled,
        isPending: pending,
        radius,
        shape,
        size,
        variant: buttonVariant,
      })}
      disabled={disabledState}
      type={type}
    >
      {pending ? <span aria-hidden="true" className="button__spinner__SW0b6" /> : null}
      <span className="button__content__SW0b5">{children}</span>
    </button>
  );
}

type IconButtonProps = ButtonProps;

export function IconButton({ className, ...props }: IconButtonProps) {
  return <Button {...props} className={cx("button__icon__SW0b4", className)} isIconOnly />;
}

type FavoritePlacement = "card" | "detail" | "header";
type FavoriteMotion = "idle" | "like" | "unlike";
type FavoriteVariant = "ghost" | "plain" | "soft";

type FavoriteSharedProps = {
  isPending?: boolean | undefined;
  isSelected?: boolean | undefined;
  label?: string | undefined;
  motion?: FavoriteMotion | undefined;
  placement?: FavoritePlacement | undefined;
  selectedLabel?: string | undefined;
  showLabel?: boolean | undefined;
  size?: ControlSize | undefined;
  unselectedLabel?: string | undefined;
  variant?: FavoriteVariant | undefined;
};

function getFavoriteLabel({
  isSelected,
  label,
  selectedLabel,
  unselectedLabel,
}: FavoriteSharedProps) {
  return label ?? (isSelected ? selectedLabel : unselectedLabel) ?? "Save";
}

function getFavoriteData({
  isPending = false,
  isSelected = false,
  motion = "idle",
  placement = "card",
  showLabel = false,
  size,
  variant,
}: FavoriteSharedProps) {
  const defaultSize = placement === "card" ? "sm" : "md";
  const defaultVariant = placement === "detail" ? "soft" : "plain";

  return {
    "data-active": isSelected ? "true" : undefined,
    "data-motion": motion === "idle" ? undefined : motion,
    "data-pending": isPending ? "true" : undefined,
    "data-size": size ?? defaultSize,
    "data-selected": isSelected ? "true" : undefined,
    "data-show-label": showLabel ? "true" : undefined,
    "data-variant": variant ?? defaultVariant,
  } as const;
}

type FavoriteButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  FavoriteSharedProps & {
    children?: ReactNode;
  };

export function FavoriteButton({
  children,
  className,
  disabled,
  isPending = false,
  isSelected = false,
  label,
  motion = "idle",
  placement = "card",
  selectedLabel,
  showLabel = false,
  size,
  type = "button",
  unselectedLabel,
  variant,
  ...props
}: FavoriteButtonProps) {
  const actionLabel = getFavoriteLabel({
    isSelected,
    label,
    selectedLabel,
    unselectedLabel,
  });

  return (
    <button
      {...props}
      aria-label={showLabel ? undefined : actionLabel}
      aria-pressed={isSelected}
      className={cx("favorite__root__SW2w0", className)}
      disabled={disabled || isPending}
      {...getFavoriteData({
        isPending,
        isSelected,
        motion,
        placement,
        showLabel,
        size,
        variant,
      })}
      type={type}
    >
      <HeartIcon aria-hidden="true" className="favorite__icon__SW2w1" />
      {showLabel ? (
        <span className="favorite__label__SW2w2">
          {children ?? actionLabel}
        </span>
      ) : null}
    </button>
  );
}

type FavoriteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> &
  FavoriteSharedProps & {
    children?: ReactNode;
  };

export function FavoriteLink({
  children,
  className,
  isPending = false,
  isSelected = false,
  label,
  motion = "idle",
  onClick,
  placement = "card",
  selectedLabel,
  showLabel = false,
  size,
  unselectedLabel,
  variant,
  ...props
}: FavoriteLinkProps) {
  const actionLabel = getFavoriteLabel({
    isSelected,
    label,
    selectedLabel,
    unselectedLabel,
  });

  return (
    <a
      {...props}
      aria-disabled={isPending ? true : undefined}
      aria-label={showLabel ? undefined : actionLabel}
      className={cx("favorite__root__SW2w0", className)}
      onClick={(event) => {
        if (isPending) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
      {...getFavoriteData({
        isPending,
        isSelected,
        motion,
        placement,
        showLabel,
        size,
        variant,
      })}
    >
      <HeartIcon aria-hidden="true" className="favorite__icon__SW2w1" />
      {showLabel ? (
        <span className="favorite__label__SW2w2">
          {children ?? actionLabel}
        </span>
      ) : null}
    </a>
  );
}

type MediaButtonFit = "contain" | "cover";
type MediaButtonCursor = "none" | "pointer";

type MediaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  cursor?: MediaButtonCursor;
  fit?: MediaButtonFit;
  isZoomed?: boolean;
};

export function MediaButton({
  children,
  className,
  cursor = "pointer",
  fit = "cover",
  isZoomed = false,
  type = "button",
  ...props
}: MediaButtonProps) {
  return (
    <button
      {...props}
      className={cx("media-button__root__SW2x3", className)}
      data-cursor={cursor}
      data-fit={fit}
      data-zoomed={isZoomed ? "true" : undefined}
      type={type}
    >
      <span className="media-button__content__SW2x4">{children}</span>
    </button>
  );
}

type CloseButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label?: string;
  size?: ControlSize;
};

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton(
    { className, label = "Close", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        aria-label={props["aria-label"] ?? label}
        className={cx("close-button__root__SW0b8", className)}
        data-size={size}
        ref={ref}
        type={type}
      >
        <XIcon aria-hidden="true" className="close-button__icon__SW0b9" />
      </button>
    );
  },
);

type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "content"> & {
  color?: BadgeTone;
  content?: ReactNode;
  disableOutline?: boolean;
  isDot?: boolean;
  isInvisible?: boolean;
  max?: number;
  placement?: BadgePlacement;
  shape?: BadgeShape;
  showOutline?: boolean;
  size?: ControlSize;
  tone?: BadgeTone;
  variant?: BadgeVariant;
};

function formatBadgeContent(content: ReactNode, max: number | undefined) {
  if (typeof content !== "number" || max === undefined || content <= max) {
    return content;
  }

  return `${max}+`;
}

export function Badge({
  children,
  className,
  color,
  content,
  disableOutline = false,
  isDot = false,
  isInvisible = false,
  max,
  placement = "top-right",
  shape = "rectangle",
  showOutline = true,
  size = "md",
  tone = "default",
  variant = "secondary",
  ...props
}: BadgeProps) {
  const resolvedColor = color ?? tone;
  const badgeContent = isDot
    ? null
    : formatBadgeContent(content ?? children, max);

  return (
    <span
      {...props}
      aria-hidden={props["aria-label"] ? undefined : isDot ? true : props["aria-hidden"]}
      className={cx("badge__root__SW0b7", className)}
      data-color={resolvedColor}
      data-dot={isDot ? "true" : undefined}
      data-invisible={isInvisible ? "true" : undefined}
      data-outline={showOutline && !disableOutline ? "true" : undefined}
      data-placement={placement}
      data-shape={shape}
      data-size={size}
      data-tone={resolvedColor}
      data-variant={variant}
    >
      {badgeContent}
    </span>
  );
}

export function BadgeAnchor({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className={cx("badge-anchor__root__SW1u0", className)}>
      {children}
    </span>
  );
}

type LinkSize = "xs" | "sm" | "md";
type LinkTextTransform = "none" | "uppercase";
type LinkVariant = "default" | "muted" | "underline";
type LinkWeight = "normal" | "semibold" | "heavy";

type LinkVisualProps = {
  color?: ComponentColor;
  inline?: boolean;
  isDisabled?: boolean;
  size?: LinkSize;
  textTransform?: LinkTextTransform;
  variant?: LinkVariant;
  weight?: LinkWeight;
};

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> &
  LinkVisualProps & {
  asChild?: boolean;
};

export function Link({
  asChild = false,
  children,
  className,
  color = "default",
  href,
  inline = false,
  isDisabled = false,
  onClick,
  size = "sm",
  textTransform = "none",
  variant = "default",
  weight = "semibold",
  ...props
}: LinkProps) {
  const handleClick = onClick
    ? (event: MouseEvent<HTMLAnchorElement>) => {
        if (!isDisabled) {
          onClick(event);
        }
      }
    : undefined;
  const linkProps = {
    ...props,
    "aria-disabled": isDisabled ? true : undefined,
    className: cx("link__root__SW1u1", className),
    "data-color": color,
    "data-disabled": isDisabled ? "true" : undefined,
    "data-inline": inline ? "true" : undefined,
    "data-size": size,
    "data-text-transform": textTransform === "uppercase" ? "uppercase" : undefined,
    "data-variant": variant,
    "data-weight": weight,
    ...(href ? { href: isDisabled ? undefined : href } : {}),
    onClick: handleClick,
  };

  if (asChild && isValidElement<LinkProps>(children)) {
    const child = children;
    const childOnClick = child.props.onClick;
    const childClickProps = childOnClick || handleClick
      ? {
          onClick: (event: MouseEvent<HTMLAnchorElement>) => {
            childOnClick?.(event);

            if (!event.defaultPrevented) {
              handleClick?.(event);
            }
          },
        }
      : {};

    return cloneElement(child, {
      ...linkProps,
      ...childClickProps,
      className: cx("link__root__SW1u1", child.props.className, className),
    });
  }

  return (
    <a
      {...linkProps}
    >
      {children}
    </a>
  );
}

type LinkActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> &
  LinkVisualProps;

export function LinkAction({
  className,
  color = "default",
  disabled,
  inline = false,
  isDisabled = false,
  onClick,
  size = "sm",
  textTransform = "none",
  type = "button",
  variant = "default",
  weight = "semibold",
  ...props
}: LinkActionProps) {
  const disabledState = disabled || isDisabled;
  const clickProps = onClick && !disabledState
    ? {
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          onClick(event);
        },
      }
    : {};

  return (
    <button
      {...props}
      {...clickProps}
      className={cx("link__root__SW1u1", className)}
      data-color={color}
      data-disabled={disabledState ? "true" : undefined}
      data-inline={inline ? "true" : undefined}
      data-size={size}
      data-text-transform={textTransform === "uppercase" ? "uppercase" : undefined}
      data-variant={variant}
      data-weight={weight}
      disabled={disabledState}
      type={type}
    />
  );
}

type LinkButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> &
  SharedActionProps & {
    iconOnly?: boolean;
  };

export function LinkButton({
  children,
  className,
  color,
  fullWidth = false,
  iconOnly = false,
  isDisabled = false,
  isIconOnly,
  isPending = false,
  onClick,
  radius,
  shape = "pill",
  size = "md",
  tone = "primary",
  variant,
  href,
  ...props
}: LinkButtonProps) {
  const linkVariant = normalizeVariant(tone, variant);
  const onlyIcon = normalizeIconOnly(iconOnly, isIconOnly);
  const disabledState = isDisabled || isPending;
  const clickProps = onClick && !disabledState
    ? {
        onClick: (event: MouseEvent<HTMLAnchorElement>) => {
          onClick(event);
        },
      }
    : {};

  return (
    <a
      {...props}
      {...clickProps}
      className={cx("button__root__SW0b3", "link-button__root__SW1u2", className)}
      {...getActionData({
        color,
        fullWidth,
        iconOnly: onlyIcon,
        isDisabled,
        isPending,
        radius,
        shape,
        size,
        variant: linkVariant,
      })}
      href={disabledState ? undefined : href}
    >
      <span className="button__content__SW0b5">{children}</span>
    </a>
  );
}

type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  fullWidth?: boolean;
  hideSeparator?: boolean;
  isDisabled?: boolean;
  size?: ControlSize;
  variant?: ControlVariant;
};

export function ButtonGroup({
  children,
  className,
  fullWidth = false,
  hideSeparator = false,
  isDisabled = false,
  size = "md",
  variant = "secondary",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      {...props}
      className={cx("button-group__root__SW1u3", className)}
      data-disabled={isDisabled ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      data-hide-separator={hideSeparator ? "true" : undefined}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </div>
  );
}

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  color?: ComponentColor;
  endContent?: ReactNode;
  size?: ControlSize;
  startContent?: ReactNode;
  variant?: "primary" | "secondary" | "soft" | "tertiary";
};

export function Chip({
  children,
  className,
  color = "default",
  endContent,
  size = "md",
  startContent,
  variant = "secondary",
  ...props
}: ChipProps) {
  return (
    <span
      {...props}
      className={cx("chip__root__SW1u4", className)}
      data-color={color}
      data-size={size}
      data-variant={variant}
    >
      {startContent ? <span className="chip__icon__SW1u5">{startContent}</span> : null}
      <span className="chip__label__SW1u6">{children}</span>
      {endContent ? <span className="chip__icon__SW1u5">{endContent}</span> : null}
    </span>
  );
}

type ToggleButtonProps = Omit<ButtonProps, "aria-pressed"> & {
  isSelected?: boolean;
};

export function ToggleButton({
  className,
  isSelected = false,
  variant = "secondary",
  ...props
}: ToggleButtonProps) {
  return (
    <Button
      {...props}
      aria-pressed={isSelected}
      className={cx("toggle-button__root__SW1u7", className)}
      data-selected={isSelected ? "true" : undefined}
      variant={variant}
    />
  );
}

type ToggleButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  size?: ControlSize;
  variant?: ControlVariant;
};

export function ToggleButtonGroup({
  children,
  className,
  orientation = "horizontal",
  size = "md",
  variant = "secondary",
  ...props
}: ToggleButtonGroupProps) {
  return (
    <div
      {...props}
      className={cx("toggle-group__root__SW1u8", className)}
      data-orientation={orientation}
      data-size={size}
      data-variant={variant}
      role={props.role ?? "group"}
    >
      {children}
    </div>
  );
}
