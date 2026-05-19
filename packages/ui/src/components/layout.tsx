import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

import { cx } from "../cx";
import type { ComponentColor, ControlSize, SurfaceTone, SurfaceVariant } from "../types";

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
        }
      }
    >
      {children}
    </div>
  );
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  gap?: string;
  padding?: string;
  tone?: SurfaceTone;
  variant?: SurfaceVariant;
};

export function Card({
  children,
  className,
  gap,
  padding,
  style,
  tone = "default",
  variant,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cx("card__root__SW0bc", className)}
      data-tone={tone}
      data-variant={variant}
      style={
        {
          ...(gap ? { "--card-gap": gap } : {}),
          ...(padding ? { "--card-padding": padding } : {}),
          ...style,
        }
      }
    >
      {children}
    </div>
  );
}

export const Surface = Card;

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("card__header__SW1x0", className)} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <Heading as="h3" {...props} className={cx("card__title__SW1x1", className)} />;
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={cx("card__description__SW1x2", className)} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("card__content__SW1x3", className)} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("card__footer__SW1x4", className)} />;
}

type SeparatorProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <hr
      {...props}
      aria-orientation={orientation}
      className={cx("separator__root__SW1x5", className)}
      data-orientation={orientation}
    />
  );
}

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?:
    | "display"
    | "page"
    | "section"
    | "subsection"
    | "card"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
  transform?: "none" | "uppercase";
};

function getHeadingSize(level: NonNullable<HeadingProps["as"]>) {
  return level;
}

export function Heading({
  as: Component = "h2",
  className,
  size,
  transform = "none",
  ...props
}: HeadingProps) {
  return (
    <Component
      {...props}
      className={cx("heading__root__SW2x0", className)}
      data-size={size ?? getHeadingSize(Component)}
      data-transform={transform}
    />
  );
}

type TextProps = HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> & {
  as?: "p" | "span";
  size?: "sm" | "md" | "lg";
  tone?: "primary" | "secondary" | "tertiary" | "inverse";
  weight?: "normal" | "medium" | "semibold" | "bold";
};

export function Text({
  as: Component = "p",
  className,
  size = "md",
  tone = "secondary",
  weight = "normal",
  ...props
}: TextProps) {
  return (
    <Component
      {...props}
      className={cx("text__root__SW2x1", className)}
      data-size={size}
      data-tone={tone}
      data-weight={weight}
    />
  );
}

type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  density?: "compact" | "comfortable";
};

export function Toolbar({
  className,
  density = "comfortable",
  ...props
}: ToolbarProps) {
  return (
    <div
      {...props}
      className={cx("toolbar__root__SW1x6", className)}
      data-density={density}
      role={props.role ?? "toolbar"}
    />
  );
}

type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  alt?: string;
  color?: ComponentColor;
  fallback?: ReactNode;
  size?: ControlSize;
  src?: string | null;
  variant?: "default" | "soft";
};

export function Avatar({
  alt = "",
  className,
  color = "default",
  fallback,
  size = "md",
  src,
  variant = "default",
  ...props
}: AvatarProps) {
  return (
    <span
      {...props}
      className={cx("avatar__root__SW1x7", className)}
      data-color={color}
      data-size={size}
      data-variant={variant}
    >
      {src ? (
        <img alt={alt} className="avatar__image__SW1x8" src={src} />
      ) : (
        <span className="avatar__fallback__SW1x9">{fallback}</span>
      )}
    </span>
  );
}

export function AvatarGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("avatar-group__root__SW1y0", className)} />;
}

type PaginationProps = HTMLAttributes<HTMLElement> & {
  summary?: ReactNode;
};

export function Pagination({
  children,
  className,
  summary,
  ...props
}: PaginationProps) {
  return (
    <nav {...props} className={cx("pagination__root__SW1y1", className)}>
      {summary ? <span className="pagination__summary__SW1y2">{summary}</span> : null}
      <div className="pagination__content__SW1y3">{children}</div>
    </nav>
  );
}

export function PaginationItem({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cx("pagination__item__SW1y4", className)} />;
}

export function PaginationLink({
  className,
  isActive = false,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & {
  isActive?: boolean;
}) {
  return (
    <a
      {...props}
      aria-current={isActive ? "page" : undefined}
      className={cx("pagination__link__SW1y5", className)}
      data-active={isActive ? "true" : undefined}
    />
  );
}

export function PaginationEllipsis({
  className,
  children = "...",
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className={cx("pagination__ellipsis__SW1y6", className)}>
      {children}
    </span>
  );
}

type TableRootProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "primary" | "secondary";
};

export function TableRoot({
  className,
  variant = "primary",
  ...props
}: TableRootProps) {
  return (
    <div
      {...props}
      className={cx("table-root__SW1y7", className)}
      data-variant={variant}
    />
  );
}

export function TableScrollContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("table__scroll__SW1y8", className)} />;
}

export function TableContent({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return <table {...props} className={cx("table__content__SW1y9", className)} />;
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} className={cx("table__header__SW1z0", className)} />;
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} className={cx("table__body__SW1z1", className)} />;
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cx("table__row__SW1z2", className)} />;
}

export function TableColumn({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} className={cx("table__column__SW1z3", className)} />;
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cx("table__cell__SW1z4", className)} />;
}

export function TableFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("table__footer__SW1z5", className)} />;
}

export const Table = Object.assign(TableRoot, {
  Body: TableBody,
  Cell: TableCell,
  Column: TableColumn,
  Content: TableContent,
  Footer: TableFooter,
  Header: TableHeader,
  Row: TableRow,
  ScrollContainer: TableScrollContainer,
});
