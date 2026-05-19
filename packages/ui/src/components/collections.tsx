"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type Key,
  type ReactNode,
} from "react";

import { cx } from "../cx";
import type { ControlSize } from "../types";

type TabItem = {
  badge?: ReactNode;
  content?: ReactNode;
  id: Key;
  isDisabled?: boolean;
  label: ReactNode;
};

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  "aria-label"?: string;
  defaultSelectedKey?: Key;
  fullWidth?: boolean;
  items?: TabItem[];
  listClassName?: string;
  onSelectionChange?: (key: Key) => void;
  orientation?: "horizontal" | "vertical";
  selectedKey?: Key;
  size?: ControlSize;
  variant?: "primary" | "secondary";
};

export function Tabs({
  "aria-label": ariaLabel,
  children,
  className,
  defaultSelectedKey,
  fullWidth = false,
  items = [],
  listClassName,
  onSelectionChange,
  orientation = "horizontal",
  selectedKey,
  size = "md",
  variant = "primary",
  ...props
}: TabsProps) {
  const fallbackKey = items[0]?.id;
  const controlled = selectedKey !== undefined;
  const [internalKey, setInternalKey] = useState<Key | undefined>(
    defaultSelectedKey ?? fallbackKey,
  );
  const activeKey = controlled ? selectedKey : internalKey;

  function select(key: Key) {
    if (!controlled) {
      setInternalKey(key);
    }

    onSelectionChange?.(key);
  }

  return (
    <div
      {...props}
      className={cx("tabs__root__SW1s0", className)}
      data-full-width={fullWidth ? "true" : undefined}
      data-orientation={orientation}
      data-size={size}
      data-variant={variant}
    >
      {items.length > 0 ? (
        <div
          aria-label={ariaLabel}
          className={cx("tabs__list__SW1s1", listClassName)}
          role="tablist"
        >
          {items.map((item) => {
            const selected = item.id === activeKey;

            return (
              <button
                aria-selected={selected}
                className="tabs__tab__SW1s2"
                data-active={selected ? "true" : undefined}
                data-selected={selected ? "true" : undefined}
                disabled={item.isDisabled}
                id={`tab-${String(item.id)}`}
                key={item.id}
                onClick={() => select(item.id)}
                role="tab"
                type="button"
              >
                <span>{item.label}</span>
                {item.badge ? <span className="tabs__badge__SW1s3">{item.badge}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {children}
      {items
        .filter((item) => item.content !== undefined)
        .map((item) => (
          <div
            aria-labelledby={`tab-${String(item.id)}`}
            className="tabs__panel__SW1s4"
            hidden={item.id !== activeKey}
            key={item.id}
            role="tabpanel"
          >
            {item.content}
          </div>
        ))}
    </div>
  );
}

type ListBoxProps = HTMLAttributes<HTMLDivElement> & {
  selectedKey?: Key;
  selectionMode?: "multiple" | "none" | "single";
  variant?: "danger" | "default";
};

export function ListBox({
  className,
  selectionMode = "single",
  selectedKey,
  variant = "default",
  ...props
}: ListBoxProps) {
  return (
    <div
      {...props}
      className={cx("listbox__root__SW1s5", className)}
      data-selection-mode={selectionMode}
      data-selected-key={selectedKey === undefined ? undefined : String(selectedKey)}
      data-variant={variant}
      role={props.role ?? "listbox"}
    />
  );
}

type ListBoxItemProps = HTMLAttributes<HTMLDivElement> & {
  id?: Key;
  isDisabled?: boolean;
  isSelected?: boolean;
  variant?: "danger" | "default";
};

export function ListBoxItem({
  className,
  id,
  isDisabled = false,
  isSelected = false,
  variant = "default",
  ...props
}: ListBoxItemProps) {
  return (
    <div
      {...props}
      aria-disabled={isDisabled ? true : undefined}
      aria-selected={isSelected}
      className={cx("listbox__item__SW1s6", className)}
      data-disabled={isDisabled ? "true" : undefined}
      data-selected={isSelected ? "true" : undefined}
      data-variant={variant}
      id={id === undefined ? undefined : String(id)}
      role={props.role ?? "option"}
    />
  );
}

type PopoverProps = HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: "bottom" | "left" | "right" | "top";
  trigger: ReactNode;
  triggerLabel?: string;
  variant?: "default" | "text";
};

export function Popover({
  children,
  className,
  defaultOpen = false,
  isOpen,
  onOpenChange,
  placement = "bottom",
  trigger,
  triggerLabel = "Open popover",
  variant = "default",
  ...props
}: PopoverProps) {
  const controlled = isOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlled ? isOpen : internalOpen;
  const rootRef = useRef<HTMLDivElement>(null);
  const contentId = useId();

  function setOpen(nextOpen: boolean) {
    if (!controlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);

    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div
      {...props}
      className={cx("popover__root__SW1s7", className)}
      data-variant={variant === "default" ? undefined : variant}
      ref={rootRef}
    >
      <button
        aria-controls={open ? contentId : undefined}
        aria-expanded={open}
        aria-label={typeof trigger === "string" ? undefined : triggerLabel}
        className="popover__trigger__SW1s8"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {trigger}
      </button>
      {open ? (
        <div
          className="popover__content__SW1s9"
          data-placement={placement}
          id={contentId}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

type DropdownItem = {
  description?: ReactNode;
  id: Key;
  isDisabled?: boolean;
  label: ReactNode;
  variant?: "danger" | "default";
};

type DropdownProps = Omit<PopoverProps, "children"> & {
  items: DropdownItem[];
  onAction?: (key: Key) => void;
};

export function Dropdown({
  items,
  onAction,
  trigger,
  triggerLabel = "Open menu",
  ...props
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      {...props}
      isOpen={open}
      onOpenChange={setOpen}
      trigger={trigger}
      triggerLabel={triggerLabel}
    >
      <div className="dropdown__menu__SW1t0" role="menu">
        {items.map((item) => (
          <button
            className="dropdown__item__SW1t1"
            data-variant={item.variant}
            disabled={item.isDisabled}
            key={item.id}
            onClick={() => {
              onAction?.(item.id);
              setOpen(false);
            }}
            role="menuitem"
            type="button"
          >
            <span>{item.label}</span>
            {item.description ? <small>{item.description}</small> : null}
          </button>
        ))}
      </div>
    </Popover>
  );
}

type TooltipProps = HTMLAttributes<HTMLSpanElement> & {
  content: ReactNode;
  delay?: number;
  trigger: ReactNode;
};

export function Tooltip({
  className,
  content,
  delay = 700,
  trigger,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  function clearTimer() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function show() {
    clearTimer();
    timeoutRef.current = window.setTimeout(() => setOpen(true), delay);
  }

  function hide() {
    clearTimer();
    setOpen(false);
  }

  return (
    <span
      {...props}
      className={cx("tooltip__root__SW1t2", className)}
      onBlur={hide}
      onFocus={show}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {trigger}
      {open ? <span className="tooltip__content__SW1t3">{content}</span> : null}
    </span>
  );
}

export function PaginationDots({
  count,
  currentIndex,
  label = "Slide",
  onChange,
}: {
  count: number;
  currentIndex: number;
  label?: string;
  onChange?: (index: number) => void;
}) {
  return (
    <div className="pagination-dots__root__SW1t4">
      {Array.from({ length: count }, (_, index) => (
        <button
          aria-label={`${label} ${index + 1}`}
          aria-pressed={index === currentIndex}
          className="pagination-dots__dot__SW1t5"
          data-active={index === currentIndex ? "true" : undefined}
          key={index}
          onClick={() => onChange?.(index)}
          type="button"
        />
      ))}
    </div>
  );
}
