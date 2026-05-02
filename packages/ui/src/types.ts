export type ControlTone = "primary" | "secondary" | "tertiary";
export type ControlSize = "sm" | "md" | "lg";
export type SurfaceTone = "default" | "inverse" | "muted" | "strong";
export type BadgeTone = "accent" | "default" | "inverse";

export const reservedControlTones = ["primary", "secondary", "tertiary"] as const;
export const reservedControlSizes = ["sm", "md", "lg"] as const;
