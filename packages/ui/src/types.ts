export type ControlTone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "danger";
export type ControlSize = "sm" | "md" | "lg";
export type ControlShape = "field" | "pill";
export type SpinnerSize = ControlSize;
export type FormControlVariant = "primary" | "secondary";
export type SurfaceTone = "default" | "inverse" | "muted" | "strong";
export type BadgeTone = "accent" | "default" | "inverse";
export type OverlayBackdropVariant = "blur" | "default" | "transparent";
export type OverlayPlacement = "bottom" | "center" | "top";
export type DrawerPlacement = "bottom" | "left" | "right" | "top";
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

export const reservedControlTones = [
  "primary",
  "secondary",
  "tertiary",
  "outline",
  "ghost",
  "danger",
] as const;
export const reservedControlSizes = ["sm", "md", "lg"] as const;
