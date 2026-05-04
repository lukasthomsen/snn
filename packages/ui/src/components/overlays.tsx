"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cx } from "../cx";
import type {
  DrawerPlacement,
  OverlayBackdropVariant,
  OverlayPlacement,
  OverlaySize,
  OverlayStatus,
  ToastPlacement,
  ToastVariant,
} from "../types";

const OVERLAY_TRANSITION_MS = 220;

function callHandler<TEvent>(
  handler: ((event: TEvent) => void) | undefined,
  event: TEvent,
) {
  handler?.(event);
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

function usePresence(open: boolean, duration = OVERLAY_TRANSITION_MS) {
  const [present, setPresent] = useState(open);
  const [state, setState] = useState<"entering" | "entered" | "exiting">(
    open ? "entered" : "exiting",
  );

  useEffect(() => {
    if (open) {
      setPresent(true);
      setState("entering");

      const frame = window.requestAnimationFrame(() => {
        setState("entered");
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    if (!present) {
      return undefined;
    }

    setState("exiting");
    const timeout = window.setTimeout(() => {
      setPresent(false);
    }, duration);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [duration, open, present]);

  return {
    present,
    state: state === "entered" ? undefined : state,
  };
}

function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}

function useEscapeToClose(active: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!active || !onClose) {
      return undefined;
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [active, onClose]);
}

function OverlayPortal({
  children,
}: {
  children: ReactNode;
}) {
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}

type OverlayFrameProps = {
  backdropClassName?: string | undefined;
  backdropVariant: OverlayBackdropVariant;
  children: ReactNode;
  closeOnBackdropPress: boolean;
  onClose?: (() => void) | undefined;
  state?: "entering" | "exiting" | undefined;
};

function OverlayFrame({
  backdropClassName,
  backdropVariant,
  children,
  closeOnBackdropPress,
  onClose,
  state,
}: OverlayFrameProps) {
  return (
    <div
      className={backdropClassName}
      data-state={state}
      data-variant={backdropVariant === "default" ? undefined : backdropVariant}
      onMouseDown={(event) => {
        if (closeOnBackdropPress && event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      {children}
    </div>
  );
}

type SharedOverlayProps = {
  actions?: ReactNode;
  backdropVariant?: OverlayBackdropVariant;
  bodyClassName?: string;
  children?: ReactNode;
  className?: string;
  closeLabel?: string;
  closeOnBackdropPress?: boolean;
  description?: ReactNode;
  footer?: ReactNode;
  headerClassName?: string;
  icon?: ReactNode;
  onClose?: () => void;
  open: boolean;
  placement?: OverlayPlacement;
  showCloseButton?: boolean;
  size?: Exclude<OverlaySize, "full">;
  title: string;
};

function CloseButton({
  className,
  label,
  onClick,
}: {
  className?: string | undefined;
  label: string;
  onClick?: (() => void) | undefined;
}) {
  return (
    <button aria-label={label} className={className} onClick={onClick} type="button">
      ×
    </button>
  );
}

function BodyContent({
  bodyClassName,
  children,
  description,
  id,
}: {
  bodyClassName?: string | undefined;
  children?: ReactNode | undefined;
  description?: ReactNode | undefined;
  id: string;
}) {
  return (
    <div className={bodyClassName} id={id}>
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}

export function AlertDialog({
  actions,
  backdropVariant = "default",
  bodyClassName,
  children,
  className,
  closeLabel = "Close dialog",
  closeOnBackdropPress = false,
  description,
  footer,
  headerClassName,
  icon,
  onClose,
  open,
  placement = "center",
  showCloseButton = true,
  size = "md",
  status = "default",
  title,
}: SharedOverlayProps & {
  status?: OverlayStatus;
}) {
  const { present, state } = usePresence(open);
  const headingId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(present);
  useEscapeToClose(present, onClose);

  useEffect(() => {
    if (present) {
      dialogRef.current?.focus();
    }
  }, [present]);

  if (!present) {
    return null;
  }

  return (
    <OverlayPortal>
      <OverlayFrame
        backdropClassName={"alert__backdrop__SW0cq"}
        backdropVariant={backdropVariant}
        closeOnBackdropPress={closeOnBackdropPress}
        onClose={onClose}
        state={state}
      >
        <div
          className="alert__container__SW0ct"
          data-placement={placement === "center" ? undefined : placement}
          data-size={size}
        >
          <div
            aria-describedby={description || children ? descriptionId : undefined}
            aria-labelledby={headingId}
            aria-modal="true"
            className={cx("alert__dialog__SW0cv", className)}
            ref={dialogRef}
            role="alertdialog"
            tabIndex={-1}
          >
            <div className={cx("alert__header__SW0cy", headerClassName)}>
              {icon ? (
                <span
                  className="alert__icon__SW0da"
                  data-status={status === "default" ? undefined : status}
                >
                  {icon}
                </span>
              ) : null}
              <div>
                <h2 className="alert__heading__SW0d1" id={headingId}>
                  {title}
                </h2>
              </div>
            </div>
            {(description || children) ? (
              <BodyContent
                bodyClassName={cx("alert__body__SW0d4", bodyClassName)}
                description={description}
                id={descriptionId}
              >
                {children}
              </BodyContent>
            ) : null}
            {footer || actions ? (
              <div className="alert__footer__SW0d7">
                {footer}
                {actions}
              </div>
            ) : null}
            {showCloseButton ? (
              <CloseButton
                className="alert__close__SW0dc"
                label={closeLabel}
                onClick={onClose}
              />
            ) : null}
          </div>
        </div>
      </OverlayFrame>
    </OverlayPortal>
  );
}

export function Modal({
  actions,
  backdropVariant = "default",
  bodyClassName,
  children,
  className,
  closeLabel = "Close modal",
  closeOnBackdropPress = true,
  description,
  footer,
  headerClassName,
  icon,
  onClose,
  open,
  placement = "center",
  scroll = "outside",
  showCloseButton = true,
  size = "md",
  title,
}: SharedOverlayProps & {
  scroll?: "inside" | "outside";
}) {
  const { present, state } = usePresence(open);
  const headingId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(present);
  useEscapeToClose(present, onClose);

  useEffect(() => {
    if (present) {
      dialogRef.current?.focus();
    }
  }, [present]);

  if (!present) {
    return null;
  }

  return (
    <OverlayPortal>
      <OverlayFrame
        backdropClassName={"modal__backdrop__SW0cr"}
        backdropVariant={backdropVariant}
        closeOnBackdropPress={closeOnBackdropPress}
        onClose={onClose}
        state={state}
      >
        <div
          className="modal__container__SW0cu"
          data-placement={placement === "center" ? undefined : placement}
          data-scroll={scroll}
          data-size={size}
        >
          <div
            aria-describedby={description || children ? descriptionId : undefined}
            aria-labelledby={headingId}
            aria-modal="true"
            className={cx("modal__dialog__SW0cw", className)}
            data-scroll={scroll}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className={cx("modal__header__SW0cz", headerClassName)}>
              {icon ? <span className="modal__icon__SW0db">{icon}</span> : null}
              <div>
                <h2 className="modal__heading__SW0d2" id={headingId}>
                  {title}
                </h2>
              </div>
            </div>
            {(description || children) ? (
              <div
                className={cx("modal__body__SW0d5", bodyClassName)}
                data-scroll={scroll}
                id={descriptionId}
              >
                {description ? <p>{description}</p> : null}
                {children}
              </div>
            ) : null}
            {footer || actions ? (
              <div className="modal__footer__SW0d8">
                {footer}
                {actions}
              </div>
            ) : null}
            {showCloseButton ? (
              <CloseButton
                className="modal__close__SW0dd"
                label={closeLabel}
                onClick={onClose}
              />
            ) : null}
          </div>
        </div>
      </OverlayFrame>
    </OverlayPortal>
  );
}

export function Drawer({
  actions,
  backdropVariant = "default",
  bodyClassName,
  children,
  className,
  closeLabel = "Close drawer",
  closeOnBackdropPress = true,
  description,
  footer,
  onClose,
  open,
  placement = "right",
  showCloseButton = true,
  showHandle = true,
  title,
}: {
  actions?: ReactNode;
  backdropVariant?: OverlayBackdropVariant;
  bodyClassName?: string;
  children?: ReactNode;
  className?: string;
  closeLabel?: string;
  closeOnBackdropPress?: boolean;
  description?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  open: boolean;
  placement?: DrawerPlacement;
  showCloseButton?: boolean;
  showHandle?: boolean;
  title: string;
}) {
  const { present, state } = usePresence(open);
  const headingId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(present);
  useEscapeToClose(present, onClose);

  useEffect(() => {
    if (present) {
      dialogRef.current?.focus();
    }
  }, [present]);

  if (!present) {
    return null;
  }

  return (
    <OverlayPortal>
      <OverlayFrame
        backdropClassName={"drawer__backdrop__SW0cs"}
        backdropVariant={backdropVariant}
        closeOnBackdropPress={closeOnBackdropPress}
        onClose={onClose}
        state={state}
      >
        <div
          className="drawer__content__SW0dg"
          data-placement={placement}
        >
          <div
            aria-describedby={description || children ? descriptionId : undefined}
            aria-labelledby={headingId}
            aria-modal="true"
            className={cx("drawer__dialog__SW0cx", className)}
            data-placement={placement}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            {showHandle ? <span className="drawer__handle__SW0dh" /> : null}
            <div className="drawer__header__SW0d0">
              <h2 className="drawer__heading__SW0d3" id={headingId}>
                {title}
              </h2>
              {description ? <p id={descriptionId}>{description}</p> : null}
            </div>
            <div className={cx("drawer__body__SW0d6", bodyClassName)}>
              {children}
            </div>
            {footer || actions ? (
              <div className="drawer__footer__SW0d9">
                {footer}
                {actions}
              </div>
            ) : null}
            {showCloseButton ? (
              <CloseButton
                className="drawer__close__SW0de"
                label={closeLabel}
                onClick={onClose}
              />
            ) : null}
          </div>
        </div>
      </OverlayFrame>
    </OverlayPortal>
  );
}

export function ToastRegion({
  children,
  className,
  placement = "top-end",
  style,
  visibleCount,
  width,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  placement?: ToastPlacement;
  visibleCount?: number;
  width?: string;
}) {
  return (
    <div
      {...props}
      className={cx("toast__region__SW0di", className)}
      data-placement={placement}
      style={
        {
          ...(width ? { "--toast-region-width": width } : {}),
          ...(visibleCount ? { "--toast-region-visible": visibleCount } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

type ToastItemProps = HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
  closeLabel?: string;
  description?: ReactNode;
  frontmost?: boolean;
  onClose?: () => void;
  placement?: ToastPlacement;
  state?: "entering" | "exiting";
  title: string;
  variant?: ToastVariant;
};

export function ToastItem({
  action,
  className,
  closeLabel = "Dismiss notification",
  description,
  frontmost = false,
  onClose,
  placement = "top-end",
  state,
  style,
  title,
  variant = "default",
  ...props
}: ToastItemProps) {
  return (
    <div
      {...props}
      className={cx("toast__item__SW0dj", className)}
      data-frontmost={frontmost ? "true" : undefined}
      data-placement={placement}
      data-state={state}
      data-variant={variant === "default" ? undefined : variant}
      style={style}
    >
      <span
        className="toast__indicator__SW0dk"
        data-variant={variant === "default" ? undefined : variant}
      >
        •
      </span>
      <div className="toast__content__SW0dl">
        <strong className="toast__title__SW0dm">{title}</strong>
        {description ? (
          <span className="toast__description__SW0dn">{description}</span>
        ) : null}
      </div>
      {action ? <div className="toast__action__SW0do">{action}</div> : null}
      {onClose ? (
        <button
          aria-label={closeLabel}
          className="toast__close__SW0df"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
