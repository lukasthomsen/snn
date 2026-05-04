import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cx } from "../cx";

import { Card, Stack } from "./layout";

type HeroFrameProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  align?: "center" | "start";
  description: string;
  eyebrow?: string;
  media?: ReactNode;
  title: string;
  titleColor?: string;
};

export function HeroFrame({
  actions,
  align = "start",
  className,
  description,
  eyebrow,
  media,
  style,
  title,
  titleColor,
  ...props
}: HeroFrameProps) {
  return (
    <section
      {...props}
      className={cx(
        "hero__root__SW0dp",
        align === "center" && "hero__centered__SW0dq",
        className,
      )}
      style={
        {
          ...(titleColor ? { "--hero-title-color": titleColor } : {}),
          ...style,
        } as CSSProperties
      }
    >
      <div className="hero__layout__SW0ds">
        <div className="hero__copy__SW0dr">
          {eyebrow ? <p className="hero__eyebrow__SW0dt">{eyebrow}</p> : null}
          <h1 className="hero__title__SW0du">{title}</h1>
          <p className="hero__description__SW0dv">{description}</p>
          {actions ? <div className="hero__actions__SW0dw">{actions}</div> : null}
        </div>
        <div className="hero__media__SW0dx">
          <div aria-hidden="true" className="hero__backdrop__SW0dy" />
          {media}
        </div>
      </div>
    </section>
  );
}

type ProductTileFrameProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  badge?: ReactNode;
  category?: string;
  name: string;
  price: string;
  visual?: ReactNode;
  visualColor?: string;
};

export function ProductTileFrame({
  actions,
  badge,
  category,
  className,
  name,
  price,
  style,
  visual,
  visualColor,
  ...props
}: ProductTileFrameProps) {
  return (
    <Card
      {...props}
      className={cx("product-tile__root__SW0dz", className)}
      padding="0"
      style={
        {
          ...(visualColor ? { "--product-visual-color": visualColor } : {}),
          ...style,
        } as CSSProperties
      }
    >
      <div className="product-visual__root__SW0e0">
        <div aria-hidden="true" className="product-visual__frame__SW0e1" />
        {visual}
      </div>
      <div className="product__body__SW0e2">
        {badge}
        {category ? <span className="product__category__SW0e3">{category}</span> : null}
        <strong className="product__name__SW0e4">{name}</strong>
        <span className="product__price__SW0e5">{price}</span>
        {actions ? <div className="product__actions__SW0e6">{actions}</div> : null}
      </div>
    </Card>
  );
}

type FormFrameProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  kicker?: string;
  title: string;
};

export function FormFrame({
  children,
  className,
  description,
  footer,
  kicker,
  title,
  ...props
}: FormFrameProps) {
  return (
    <Card {...props} className={cx("form-frame__root__SW0e7", className)}>
      {kicker ? <p className="form__kicker__SW0e8">{kicker}</p> : null}
      <Stack gap="var(--space-sm)">
        <h2 className="form__title__SW0e9">{title}</h2>
        {description ? <p className="form__description__SW0ea">{description}</p> : null}
      </Stack>
      <div className="form__content__SW0eb">{children}</div>
      {footer ? <div className="form__footer__SW0ec">{footer}</div> : null}
    </Card>
  );
}
