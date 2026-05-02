import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cx } from "../cx";

import { Card, Stack } from "./layout";
import styles from "./shells.module.css";

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
      className={cx(styles.hero, align === "center" && styles.heroAlignCenter, className)}
      style={
        {
          ...(titleColor ? { "--hero-title-color": titleColor } : {}),
          ...style,
        } as CSSProperties
      }
    >
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          {eyebrow ? <p className={styles.heroEyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroDescription}>{description}</p>
          {actions ? <div className={styles.heroActions}>{actions}</div> : null}
        </div>
        <div className={styles.heroMedia}>
          <div aria-hidden="true" className={styles.heroBackdrop} />
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
      className={cx(styles.productTile, className)}
      padding="0"
      style={
        {
          ...(visualColor ? { "--product-visual-color": visualColor } : {}),
          ...style,
        } as CSSProperties
      }
    >
      <div className={styles.productVisual}>
        <div aria-hidden="true" className={styles.productVisualInner} />
        {visual}
      </div>
      <div className={styles.productBody}>
        {badge}
        {category ? <span className={styles.productCategory}>{category}</span> : null}
        <strong className={styles.productName}>{name}</strong>
        <span className={styles.productPrice}>{price}</span>
        {actions ? <div className={styles.productActions}>{actions}</div> : null}
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
    <Card {...props} className={cx(styles.formFrame, className)}>
      {kicker ? <p className={styles.formKicker}>{kicker}</p> : null}
      <Stack gap="var(--ui-space-sm)">
        <h2 className={styles.formTitle}>{title}</h2>
        {description ? <p className={styles.formDescription}>{description}</p> : null}
      </Stack>
      <div className={styles.formContent}>{children}</div>
      {footer ? <div className={styles.formFooter}>{footer}</div> : null}
    </Card>
  );
}
