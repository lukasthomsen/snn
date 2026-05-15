import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

import { ChevronRightIcon } from "@snn/ui";

type StorefrontCardBaseProps = {
  as?: "article" | "div";
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  showChevron?: boolean;
  size?: "small" | "medium" | "large";
  surface?: "primary" | "tertiary";
  title: ReactNode;
};

type StorefrontCardHref = ComponentProps<typeof Link>["href"] | string;

type StorefrontCardLinkProps = StorefrontCardBaseProps & {
  href: StorefrontCardHref;
  onClick?: never;
  type?: never;
};

type StorefrontCardButtonProps = StorefrontCardBaseProps & {
  href?: never;
  onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

type StorefrontCardStaticProps = StorefrontCardBaseProps & {
  href?: never;
  onClick?: never;
  type?: never;
};

type StorefrontCardProps =
  | StorefrontCardLinkProps
  | StorefrontCardButtonProps
  | StorefrontCardStaticProps;

function getRootClassName(className?: string) {
  return className
    ? `storefront-card__root__SW3c0 ${className}`
    : "storefront-card__root__SW3c0";
}

function StorefrontCardContent({
  description,
  icon,
  showChevron,
  size = "medium",
  title,
}: StorefrontCardBaseProps) {
  const arrowSize = size === "small" ? 18 : size === "large" ? 28 : 24;

  return (
    <>
      {icon ? (
        <span className="storefront-card__icon__SW3c1" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="storefront-card__copy__SW3c2">
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
      </span>
      {showChevron ? (
        <ChevronRightIcon aria-hidden="true" size={arrowSize} />
      ) : null}
    </>
  );
}

export function StorefrontCard(props: StorefrontCardProps) {
  const rootClassName = getRootClassName(props.className);
  const size = props.size ?? "medium";
  const surface = props.surface ?? "tertiary";
  const hasHref = "href" in props && props.href !== undefined;
  const hasAction = "onClick" in props && props.onClick !== undefined;
  const showChevron = props.showChevron ?? (hasHref || hasAction);

  if (hasHref) {
    return (
      <Link
        className={rootClassName}
        data-size={size}
        data-surface={surface}
        href={props.href as ComponentProps<typeof Link>["href"]}
      >
        <StorefrontCardContent {...props} showChevron={showChevron} />
      </Link>
    );
  }

  if (hasAction) {
    return (
      <button
        className={rootClassName}
        data-size={size}
        data-surface={surface}
        onClick={props.onClick}
        type={props.type ?? "button"}
      >
        <StorefrontCardContent {...props} showChevron={showChevron} />
      </button>
    );
  }

  const StaticElement = props.as ?? "article";

  return (
    <StaticElement className={rootClassName} data-size={size} data-surface={surface}>
      <StorefrontCardContent {...props} showChevron={showChevron} />
    </StaticElement>
  );
}
