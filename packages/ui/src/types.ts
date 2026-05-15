export type ControlTone =
  | "primary"
  | "secondary"
  | "soft"
  | "tertiary"
  | "outline"
  | "ghost"
  | "danger";
export type ControlSize = "sm" | "md" | "lg";
export type ControlShape = "field" | "pill";
export type ControlVariant = ControlTone | "danger-soft";
export type ComponentColor = "accent" | "blue" | "danger" | "default" | "success" | "warning";
export type ComponentRadius = "full" | "lg" | "md" | "none" | "sm";
export type SpinnerSize = ControlSize;
export type FormControlVariant = "primary" | "secondary";
export type SurfaceTone = "default" | "inverse" | "muted" | "strong";
export type SurfaceVariant = "default" | "secondary" | "tertiary" | "transparent";
export type BadgePlacement = "bottom-left" | "bottom-right" | "top-left" | "top-right";
export type BadgeShape = "circle" | "rectangle";
export type BadgeTone = "accent" | "blue" | "danger" | "default" | "inverse" | "success" | "warning";
export type BadgeVariant = "primary" | "secondary" | "soft";
export type OverlayBackdropVariant = "blur" | "default" | "transparent";
export type OverlayPlacement = "bottom" | "center" | "top";
export type DrawerPlacement = "bottom" | "left" | "right" | "top";
export type DrawerSize = "half" | "lg" | "md" | "sm";
export type OverlaySize = "cover" | "full" | "lg" | "md" | "sm" | "xs";
export type OverlayStatus = "accent" | "danger" | "default" | "success" | "warning";
export type ToastPlacement =
  | "bottom"
  | "bottom-end"
  | "bottom-start"
  | "top"
  | "top-end"
  | "top-start";
export type ToastVariant = "accent" | "danger" | "default" | "success" | "warning";
export type VariantPickerDisplay = "compact" | "default" | "media";

export const reservedControlTones = [
  "primary",
  "secondary",
  "soft",
  "tertiary",
  "outline",
  "ghost",
  "danger",
] as const;
export const reservedControlSizes = ["sm", "md", "lg"] as const;
export const reservedVariantPickerDisplays = ["default", "compact", "media"] as const;
