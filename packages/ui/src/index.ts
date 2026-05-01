export type ControlTone = "primary" | "secondary" | "tertiary";
export type ControlSize = "sm" | "md" | "lg";

export const reservedControlTones = ["primary", "secondary", "tertiary"] as const;
export const reservedControlSizes = ["sm", "md", "lg"] as const;

export * from "./state/interface-store";

