import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cx } from "../cx";
import type { SurfaceTone } from "../types";

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
      className={cx("container__root__SW0b8", className)}
      data-padded={padded ? "true" : "false"}
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
      className={cx("stack__root__SW0b9", className)}
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
      className={cx("cluster__root__SW0ba", className)}
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
      className={cx("grid__root__SW0bb", className)}
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
      className={cx("card__root__SW0bc", className)}
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
