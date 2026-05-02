import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cx } from "../cx";
import type { SurfaceTone } from "../types";

import styles from "./layout.module.css";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  size?: "content" | "page" | "wide";
};

export function Container({
  children,
  className,
  padded = true,
  size = "page",
  ...props
}: ContainerProps) {
  return (
    <div
      {...props}
      className={cx(styles.container, className)}
      data-padded={padded ? "true" : undefined}
      data-size={size}
    >
      {children}
    </div>
  );
}

type StackProps = HTMLAttributes<HTMLDivElement> & {
  align?: "center" | "end" | "start" | "stretch";
  gap?: string;
};

export function Stack({ align = "stretch", children, className, gap, style, ...props }: StackProps) {
  return (
    <div
      {...props}
      className={cx(styles.stack, className)}
      style={
        {
          "--stack-align": align,
          ...(gap ? { "--stack-gap": gap } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

type ClusterProps = HTMLAttributes<HTMLDivElement> & {
  align?: "center" | "end" | "start" | "stretch";
  gap?: string;
  justify?: "center" | "flex-end" | "flex-start" | "space-between";
};

export function Cluster({
  align = "center",
  children,
  className,
  gap,
  justify = "flex-start",
  style,
  ...props
}: ClusterProps) {
  return (
    <div
      {...props}
      className={cx(styles.cluster, className)}
      style={
        {
          "--cluster-align": align,
          ...(gap ? { "--cluster-gap": gap } : {}),
          "--cluster-justify": justify,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

type GridProps = HTMLAttributes<HTMLDivElement> & {
  gap?: string;
  minItemWidth?: string;
};

export function Grid({ children, className, gap, minItemWidth, style, ...props }: GridProps) {
  return (
    <div
      {...props}
      className={cx(styles.grid, className)}
      style={
        {
          ...(gap ? { "--grid-gap": gap } : {}),
          ...(minItemWidth ? { "--grid-min-width": minItemWidth } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: string;
  tone?: SurfaceTone;
};

export function Card({
  children,
  className,
  padding,
  style,
  tone = "default",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cx(styles.card, className)}
      data-tone={tone}
      style={
        {
          ...(padding ? { "--card-padding": padding } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

export const Surface = Card;
