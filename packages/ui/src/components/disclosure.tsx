import type { ButtonHTMLAttributes, DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cx } from "../cx";
import { ChevronDownIcon, ChevronRightIcon } from "./icons";

type AccordionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Accordion({ children, className, ...props }: AccordionProps) {
  return (
    <div {...props} className={cx("accordion__root__SW0d2", className)}>
      {children}
    </div>
  );
}

type AccordionItemProps = Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "children"> & {
  bodyClassName?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  heading: ReactNode;
  summaryClassName?: string;
};

export function AccordionItem({
  bodyClassName,
  children,
  className,
  defaultOpen = false,
  heading,
  open,
  summaryClassName,
  ...props
}: AccordionItemProps) {
  return (
    <details
      {...props}
      className={cx("accordion__item__SW0d3", className)}
      open={(open ?? defaultOpen) ? true : undefined}
    >
      <summary className={cx("accordion__summary__SW0d4", summaryClassName)}>
        <h2 className="accordion__heading__SW0d5">
          <span>{heading}</span>
          <span aria-hidden="true" className="accordion__indicator__SW0d6">
            <ChevronDownIcon size={16} />
          </span>
        </h2>
      </summary>
      <div className={cx("accordion__body__SW0d7", bodyClassName)}>
        {children}
      </div>
    </details>
  );
}

type AccordionActionItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  heading: ReactNode;
  summaryClassName?: string;
};

export function AccordionActionItem({
  className,
  heading,
  summaryClassName,
  type = "button",
  ...props
}: AccordionActionItemProps) {
  return (
    <div className={cx("accordion__item__SW0d3", className)}>
      <button
        {...props}
        className={cx("accordion__summary__SW0d4", summaryClassName)}
        type={type}
      >
        <span className="accordion__heading__SW0d5">
          <span>{heading}</span>
          <span aria-hidden="true" className="accordion__indicator__SW0d6">
            <ChevronRightIcon size={16} />
          </span>
        </span>
      </button>
    </div>
  );
}
