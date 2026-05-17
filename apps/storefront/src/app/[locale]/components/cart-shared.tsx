"use client";

import { useEffect, useId, useRef, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";

import type { CartLineItem, CartMoney, CartSnapshot } from "@snn/commerce";
import type { Locale } from "@snn/i18n";
import {
  Button,
  CheckCircleSolidIcon,
  FavoriteButton,
  FavoriteLink,
  InfoCircleIcon,
  LinkButton,
  PlusIcon,
  QuantityStepper,
  Spinner,
  TextField,
} from "@snn/ui";

import { toggleProductLikeAction } from "../catalog-actions";
import { StorefrontImage } from "./storefront-image";

export const cartCopy = {
  da: {
    addExtra: "Tilfoj lidt ekstra",
    addToBag: "Tilfoj",
    applyDiscount: "Anvend",
    bag: "Kurv",
    checkout: "Sikker checkout",
    continueShopping: "Shop produkter",
    discount: "Rabatkode",
    discountPlaceholder: "Indtast kode",
    emptyBag: "Din kurv er tom.",
    emptyBagLong: "Gem dine favoritter til senere, eller find noget nyt til rutinen.",
    orderSummary: "Ordreoversigt",
    quantity: "Antal",
    remove: "Fjern",
    saveProduct: "Gem produkt",
    savedProduct: "Gemt produkt",
    shipping: "Fragt",
    shippingCalculated: "Beregnes ved checkout",
    shippingExpress: "Express levering",
    shippingExpressEstimate: "1-3 hverdage",
    shippingExpressFreeOver: "Gratis over 1.300 DKK",
    shippingExpressPrice: "125 DKK",
    shippingFree: "Gratis",
    shippingInfoLabel: "Leveringsinformation",
    shippingInfoReturns: "Gratis 30 dages returret.",
    shippingInfoTitle: "Leveringsmuligheder",
    shippingMilestoneExpress: "Gratis express",
    shippingMilestoneStandard: "Gratis fragt",
    shippingProgressExpress: "Du er {amount} fra gratis express levering",
    shippingProgress: "Du er {amount} fra gratis fragt",
    shippingReadyExpress: "Du har nu opnaet gratis express levering",
    shippingReady: "Du har nu opnaet gratis fragt",
    shippingStandard: "Standard levering",
    shippingStandardEstimate: "3-5 hverdage",
    shippingStandardFreeOver: "Gratis over 550 DKK",
    shippingStandardPrice: "45 DKK",
    subtotal: "Subtotal",
    total: "Total",
    unsaveProduct: "Fjern fra gemte",
    updatingBag: "Opdaterer kurv",
  },
  en: {
    addExtra: "Add a little extra",
    addToBag: "Add",
    applyDiscount: "Apply",
    bag: "Bag",
    checkout: "Secure checkout",
    continueShopping: "Shop products",
    discount: "Discount code",
    discountPlaceholder: "Enter code",
    emptyBag: "Your bag is empty.",
    emptyBagLong: "Save your favorites for later, or find something new for the routine.",
    orderSummary: "Order summary",
    quantity: "Quantity",
    remove: "Remove",
    saveProduct: "Save product",
    savedProduct: "Saved product",
    shipping: "Shipping",
    shippingCalculated: "Calculated at checkout",
    shippingExpress: "Express shipping",
    shippingExpressEstimate: "1-3 working days",
    shippingExpressFreeOver: "Free over 1,300 DKK",
    shippingExpressPrice: "125 DKK",
    shippingFree: "Free",
    shippingInfoLabel: "Delivery information",
    shippingInfoReturns: "Free 30-day returns.",
    shippingInfoTitle: "Delivery options",
    shippingMilestoneExpress: "Free express",
    shippingMilestoneStandard: "Free shipping",
    shippingProgressExpress: "You are {amount} away from Free Express Shipping",
    shippingProgress: "You are {amount} away from Free Shipping",
    shippingReadyExpress: "You have now unlocked Free Express Shipping",
    shippingReady: "You have now unlocked Free Shipping",
    shippingStandard: "Standard shipping",
    shippingStandardEstimate: "3-5 working days",
    shippingStandardFreeOver: "Free over 550 DKK",
    shippingStandardPrice: "45 DKK",
    subtotal: "Subtotal",
    total: "Total",
    unsaveProduct: "Remove from saved",
    updatingBag: "Updating bag",
  },
} as const;

export type CartCopy = Record<keyof typeof cartCopy.en, string>;

export function formatCartMoney(money: CartMoney, locale: Locale) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-DK", {
    currency: money.currencyCode,
    style: "currency",
  }).format(money.amount / 100);
}

function formatCartMilestoneAmount(money: CartMoney, locale: Locale) {
  const amount = new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-US", {
    maximumFractionDigits: 0,
  }).format(money.amount / 100);

  return `${amount} kr.`;
}

export function withAmount(money: CartMoney, amount: number): CartMoney {
  return {
    ...money,
    amount: Math.max(Math.trunc(amount), 0),
  };
}

export function recalculateOptimisticCart(cart: CartSnapshot, lines: CartLineItem[]) {
  const subtotalAmount = lines.reduce((sum, line) => sum + line.lineTotal.amount, 0);
  const remainingAmount = Math.max(
    cart.shipping.freeShippingThreshold.amount - subtotalAmount,
    0,
  );
  const remainingExpressAmount = Math.max(
    cart.shipping.freeExpressShippingThreshold.amount - subtotalAmount,
    0,
  );

  return {
    ...cart,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines,
    shipping: {
      ...cart.shipping,
      amount: remainingAmount === 0 ? withAmount(cart.shipping.freeShippingThreshold, 0) : null,
      expressProgressPercent: Math.min(
        Math.round((subtotalAmount / cart.shipping.freeExpressShippingThreshold.amount) * 100),
        100,
      ),
      label: remainingAmount === 0 ? "free" : "calculated_at_checkout",
      progressPercent: Math.min(
        Math.round((subtotalAmount / cart.shipping.freeShippingThreshold.amount) * 100),
        100,
      ),
      qualifiedForFreeExpressShipping: remainingExpressAmount === 0,
      qualifiedForFreeShipping: remainingAmount === 0,
      remainingExpressAmount: withAmount(cart.shipping.remainingExpressAmount, remainingExpressAmount),
      remainingAmount: withAmount(cart.shipping.remainingAmount, remainingAmount),
    },
    subtotal: withAmount(cart.subtotal, subtotalAmount),
    total: withAmount(cart.total, subtotalAmount),
  } satisfies CartSnapshot;
}

export function updateLineQuantityOptimistically(
  cart: CartSnapshot,
  itemId: string,
  quantity: number,
) {
  const lines = cart.lines
    .map((line) => {
      if (line.id !== itemId) {
        return line;
      }

      return {
        ...line,
        lineTotal: withAmount(line.lineTotal, line.unitPrice.amount * quantity),
        quantity,
      };
    })
    .filter((line) => line.quantity > 0);

  return recalculateOptimisticCart(cart, lines);
}

export function getShippingText(cart: CartSnapshot, copy: CartCopy, locale: Locale) {
  if (cart.shipping.qualifiedForFreeExpressShipping) {
    return copy.shippingReadyExpress;
  }

  if (cart.shipping.qualifiedForFreeShipping) {
    return copy.shippingProgressExpress.replace(
      "{amount}",
      formatCartMoney(cart.shipping.remainingExpressAmount, locale),
    );
  }

  return copy.shippingProgress.replace(
    "{amount}",
    formatCartMoney(cart.shipping.remainingAmount, locale),
  );
}

type CartShippingInfoProps = {
  copy: CartCopy;
  isInteractive?: boolean | undefined;
  tooltipId: string;
};

function CartShippingInfo({ copy, isInteractive = true, tooltipId }: CartShippingInfoProps) {
  return (
    <span className="cartShipping__info__SW5b6">
      <button
        aria-describedby={isInteractive ? tooltipId : undefined}
        aria-label={copy.shippingInfoLabel}
        className="cartShipping__infoTrigger__SW5b7"
        disabled={!isInteractive}
        tabIndex={isInteractive ? undefined : -1}
        type="button"
      >
        <InfoCircleIcon aria-hidden="true" size={16} />
      </button>
      <span className="cartShipping__infoBox__SW5b8" id={tooltipId} role="tooltip">
        <strong className="cartShipping__infoTitle__SW5ba">{copy.shippingInfoTitle}</strong>
        <span>{copy.shippingInfoReturns}</span>
        <span>
          <b>{copy.shippingStandard}</b>
          {copy.shippingStandardPrice} / {copy.shippingStandardEstimate} / {copy.shippingStandardFreeOver}
        </span>
        <span>
          <b>{copy.shippingExpress}</b>
          {copy.shippingExpressPrice} / {copy.shippingExpressEstimate} / {copy.shippingExpressFreeOver}
        </span>
      </span>
    </span>
  );
}

// Bag shipping progress has its own motion knobs because unlock states do not use the shared bar timing.
const cartShippingProgressSettings = {
  colorTransitionMs: 420,
  drawerOpenBufferMs: 96,
  drawerOpenFallbackMs: 420,
  expressUnlockedRunMs: 920,
  goalRetargetRunMs: 560,
  lockedRunMs: 980,
  standardUnlockedPauseMs: 800,
  standardUnlockedRunMs: 840,
  statusCleanupBufferMs: 80,
  statusEnterDelayMs: 130,
  statusTransitionMs: 620,
  updateRunMs: 760,
} as const;

type CartShippingGoal = "standard" | "express";
type CartShippingTone = "blue" | "green";

type CartShippingStatus = {
  icon: boolean;
  id: string;
  text: string;
};

type CartShippingStatusFrame = CartShippingStatus & {
  frameKey: string;
  phase: "enter" | "exit" | "prepare" | "stable";
};

type CartShippingView = {
  durationMs: number;
  fillTone: CartShippingTone;
  goal: CartShippingGoal;
  progressPercent: number;
  status: CartShippingStatus;
};

function parseCssTime(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  if (trimmedValue.endsWith("ms")) {
    return Number.parseFloat(trimmedValue);
  }

  if (trimmedValue.endsWith("s")) {
    return Number.parseFloat(trimmedValue) * 1000;
  }

  return Number.parseFloat(trimmedValue) || 0;
}

function getCartShippingStartDelay(root: HTMLElement | null) {
  if (!root) {
    return cartShippingProgressSettings.drawerOpenFallbackMs;
  }

  const drawerRoot = root.closest(".drawer__root__SW0cj");

  if (!drawerRoot) {
    return cartShippingProgressSettings.drawerOpenFallbackMs;
  }

  const style = window.getComputedStyle(drawerRoot);
  const drawerDuration = parseCssTime(style.getPropertyValue("--drawer-panel-enter-duration"))
    || cartShippingProgressSettings.drawerOpenFallbackMs;
  const drawerDelay = parseCssTime(style.getPropertyValue("--drawer-panel-enter-delay"));

  return Math.max(
    Math.round(drawerDuration + drawerDelay + cartShippingProgressSettings.drawerOpenBufferMs),
    cartShippingProgressSettings.drawerOpenFallbackMs,
    0,
  );
}

function getStandardProgressStatus(cart: CartSnapshot, copy: CartCopy, locale: Locale): CartShippingStatus {
  const text = copy.shippingProgress.replace(
    "{amount}",
    formatCartMoney(cart.shipping.remainingAmount, locale),
  );

  return {
    icon: false,
    id: `standard-progress:${cart.shipping.remainingAmount.amount}`,
    text,
  };
}

function getExpressProgressStatus(cart: CartSnapshot, copy: CartCopy, locale: Locale): CartShippingStatus {
  const text = copy.shippingProgressExpress.replace(
    "{amount}",
    formatCartMoney(cart.shipping.remainingExpressAmount, locale),
  );

  return {
    icon: false,
    id: `express-progress:${cart.shipping.remainingExpressAmount.amount}`,
    text,
  };
}

function getStandardUnlockedStatus(copy: CartCopy): CartShippingStatus {
  return {
    icon: true,
    id: "standard-unlocked",
    text: copy.shippingReady,
  };
}

function getExpressUnlockedStatus(copy: CartCopy): CartShippingStatus {
  return {
    icon: true,
    id: "express-unlocked",
    text: copy.shippingReadyExpress,
  };
}

function getSilentShippingStatus(): CartShippingStatus {
  return {
    icon: false,
    id: "checkpoint-pending",
    text: "",
  };
}

function getCartShippingGoal(cart: CartSnapshot): CartShippingGoal {
  return cart.shipping.qualifiedForFreeShipping ? "express" : "standard";
}

function getCartShippingGoalThreshold(cart: CartSnapshot, goal: CartShippingGoal) {
  return goal === "express"
    ? cart.shipping.freeExpressShippingThreshold
    : cart.shipping.freeShippingThreshold;
}

function getCartShippingGoalStart(cart: CartSnapshot, goal: CartShippingGoal) {
  return goal === "express"
    ? cart.shipping.freeShippingThreshold
    : withAmount(cart.shipping.freeShippingThreshold, 0);
}

function getCartShippingGoalProgress(cart: CartSnapshot, goal: CartShippingGoal) {
  const threshold = getCartShippingGoalThreshold(cart, goal).amount;

  if (threshold <= 0) {
    return 100;
  }

  return Math.min(Math.max(Math.round((cart.subtotal.amount / threshold) * 100), 0), 100);
}

function getCartShippingInitialStatus(cart: CartSnapshot, copy: CartCopy, locale: Locale) {
  if (cart.shipping.qualifiedForFreeShipping) {
    return getSilentShippingStatus();
  }

  return getStandardProgressStatus(cart, copy, locale);
}

function getCartShippingFinalStatus(cart: CartSnapshot, copy: CartCopy, locale: Locale) {
  if (cart.shipping.qualifiedForFreeExpressShipping) {
    return getExpressUnlockedStatus(copy);
  }

  if (cart.shipping.qualifiedForFreeShipping) {
    return getExpressProgressStatus(cart, copy, locale);
  }

  return getStandardProgressStatus(cart, copy, locale);
}

function getCartShippingInitialView(cart: CartSnapshot, copy: CartCopy, locale: Locale): CartShippingView {
  return {
    durationMs: 0,
    fillTone: "blue",
    goal: "standard",
    progressPercent: 0,
    status: getCartShippingInitialStatus(cart, copy, locale),
  };
}

function getCartShippingFinalView(cart: CartSnapshot, copy: CartCopy, locale: Locale): CartShippingView {
  const goal = getCartShippingGoal(cart);

  return {
    durationMs: 0,
    fillTone: cart.shipping.qualifiedForFreeExpressShipping ? "green" : "blue",
    goal,
    progressPercent: getCartShippingGoalProgress(cart, goal),
    status: getCartShippingFinalStatus(cart, copy, locale),
  };
}

function getCartShippingStyle(view: CartShippingView) {
  return {
    "--cart-shipping-progress": `${view.progressPercent}%`,
    "--cart-shipping-progress-duration": `${view.durationMs}ms`,
  } as CSSProperties;
}

function getCartShippingRootStyle() {
  return {
    "--cart-shipping-color-duration": `${cartShippingProgressSettings.colorTransitionMs}ms`,
    "--cart-shipping-status-duration": `${cartShippingProgressSettings.statusTransitionMs}ms`,
  } as CSSProperties;
}

function useCartShippingAnimation(
  cart: CartSnapshot,
  copy: CartCopy,
  locale: Locale,
  rootRef: { current: HTMLElement | null },
  animateEntrance: boolean,
  onEntranceAnimationStart?: () => void,
) {
  const [view, setView] = useState<CartShippingView>(() => (
    animateEntrance
      ? getCartShippingInitialView(cart, copy, locale)
      : getCartShippingFinalView(cart, copy, locale)
  ));
  const drawerOpenDelayUntilRef = useRef(0);
  const hasAnimatedRef = useRef(!animateEntrance);
  const viewRef = useRef(view);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    const initialView = getCartShippingInitialView(cart, copy, locale);
    const finalView = getCartShippingFinalView(cart, copy, locale);
    const frames: number[] = [];
    const timeouts: number[] = [];

    function schedule(delay: number, callback: () => void) {
      const timeout = window.setTimeout(callback, delay);
      timeouts.push(timeout);
    }

    function scheduleFrame(callback: () => void) {
      const frame = window.requestAnimationFrame(callback);
      frames.push(frame);
    }

    function getStandardRunMs(currentProgress: number) {
      const remainingRatio = Math.max((100 - currentProgress) / 100, 0);

      if (remainingRatio === 0) {
        return 0;
      }

      return Math.max(
        Math.round(cartShippingProgressSettings.standardUnlockedRunMs * remainingRatio),
        260,
      );
    }

    function finishAtFinalView() {
      setView((current) => ({
        ...current,
        durationMs: 0,
        fillTone: finalView.fillTone,
        goal: finalView.goal,
        progressPercent: finalView.progressPercent,
        status: finalView.status,
      }));
    }

    function runStandardUnlockSequence(startProgress: number) {
      const standardRunMs = getStandardRunMs(startProgress);
      const retargetDelayMs = standardRunMs + cartShippingProgressSettings.standardUnlockedPauseMs;
      const expressProgress = getCartShippingGoalProgress(cart, "express");
      const expressRunMs = cart.shipping.qualifiedForFreeExpressShipping
        ? cartShippingProgressSettings.expressUnlockedRunMs
        : cartShippingProgressSettings.goalRetargetRunMs;

      setView((current) => ({
        ...current,
        durationMs: standardRunMs,
        fillTone: "blue",
        goal: "standard",
        progressPercent: 100,
        status: getSilentShippingStatus(),
      }));

      schedule(standardRunMs, () => {
        setView((current) => ({
          ...current,
          durationMs: 0,
          fillTone: "green",
          goal: "standard",
          progressPercent: 100,
          status: getStandardUnlockedStatus(copy),
        }));
      });

      schedule(retargetDelayMs, () => {
        setView((current) => ({
          ...current,
          durationMs: 0,
          fillTone: cart.shipping.qualifiedForFreeExpressShipping ? "green" : "blue",
          goal: "express",
          progressPercent: 100,
          status: getStandardUnlockedStatus(copy),
        }));

        scheduleFrame(() => {
          setView((current) => ({
            ...current,
            durationMs: expressRunMs,
            progressPercent: expressProgress,
          }));
        });
      });

      schedule(retargetDelayMs + expressRunMs, finishAtFinalView);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hasAnimatedRef.current = true;
      scheduleFrame(() => {
        setView(finalView);
      });

      return () => {
        frames.forEach((frame) => window.cancelAnimationFrame(frame));
      };
    }

    const hasAnimated = hasAnimatedRef.current;

    if (hasAnimated) {
      const currentView = viewRef.current;
      const transitionDelayMs = Math.max(
        Math.ceil(drawerOpenDelayUntilRef.current - performance.now()),
        0,
      );

      schedule(transitionDelayMs, () => {
        if (finalView.goal === "standard") {
          if (currentView.goal === "express") {
            setView((current) => ({
              ...current,
              durationMs: 0,
              fillTone: "blue",
              goal: "standard",
              progressPercent: 100,
              status: getStandardProgressStatus(cart, copy, locale),
            }));

            scheduleFrame(() => {
              setView((current) => ({
                ...current,
                durationMs: cartShippingProgressSettings.lockedRunMs,
                progressPercent: finalView.progressPercent,
              }));
            });

            schedule(cartShippingProgressSettings.lockedRunMs, finishAtFinalView);
            return;
          }

          setView((current) => ({
            ...current,
            durationMs: cartShippingProgressSettings.lockedRunMs,
            fillTone: "blue",
            goal: "standard",
            progressPercent: finalView.progressPercent,
            status: getStandardProgressStatus(cart, copy, locale),
          }));

          schedule(cartShippingProgressSettings.lockedRunMs, finishAtFinalView);
          return;
        }

        if (currentView.goal === "standard") {
          runStandardUnlockSequence(currentView.progressPercent);
          return;
        }

        const expressRunMs = cart.shipping.qualifiedForFreeExpressShipping
          ? cartShippingProgressSettings.expressUnlockedRunMs
          : cartShippingProgressSettings.updateRunMs;

        setView((current) => ({
          ...current,
          durationMs: expressRunMs,
          fillTone: current.fillTone === "green" && cart.shipping.qualifiedForFreeExpressShipping
            ? "green"
            : "blue",
          goal: "express",
          progressPercent: finalView.progressPercent,
          status: cart.shipping.qualifiedForFreeExpressShipping
            ? current.status
            : getExpressProgressStatus(cart, copy, locale),
        }));

        schedule(expressRunMs, finishAtFinalView);
      });

      return () => {
        timeouts.forEach((timeout) => window.clearTimeout(timeout));
        frames.forEach((frame) => window.cancelAnimationFrame(frame));
      };
    }

    setView(initialView);
    hasAnimatedRef.current = true;

    const startDelay = animateEntrance ? getCartShippingStartDelay(rootRef.current) : 0;
    drawerOpenDelayUntilRef.current = performance.now() + startDelay;
    onEntranceAnimationStart?.();

    schedule(startDelay, () => {
      if (!cart.shipping.qualifiedForFreeShipping) {
        setView({
          ...initialView,
          durationMs: cartShippingProgressSettings.lockedRunMs,
          progressPercent: finalView.progressPercent,
          status: getStandardProgressStatus(cart, copy, locale),
        });
        return;
      }

      runStandardUnlockSequence(0);
    });

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
    };
  }, [
    animateEntrance,
    cart,
    copy,
    locale,
    onEntranceAnimationStart,
    rootRef,
  ]);

  return view;
}

function useCartShippingStatusFrames(status: CartShippingStatus, animateInitial: boolean) {
  const frameSequenceRef = useRef(1);
  const [frames, setFrames] = useState<CartShippingStatusFrame[]>(() => [
    {
      ...status,
      frameKey: `${status.id}:0`,
      phase: animateInitial ? "enter" : "stable",
    },
  ]);

  useEffect(() => {
    function createFrame(
      nextStatus: CartShippingStatus,
      phase: CartShippingStatusFrame["phase"],
    ) {
      const frameKey = `${nextStatus.id}:${frameSequenceRef.current}`;
      frameSequenceRef.current += 1;

      return {
        ...nextStatus,
        frameKey,
        phase,
      };
    }

    const nextFrame = createFrame(status, "prepare");
    const timeout = window.setTimeout(() => {
      setFrames((currentFrames) => (
        currentFrames.filter((currentFrame) => (
          currentFrame.phase === "enter" || currentFrame.phase === "stable"
        ))
      ));
    }, (
      cartShippingProgressSettings.statusEnterDelayMs
        + cartShippingProgressSettings.statusTransitionMs
        + cartShippingProgressSettings.statusCleanupBufferMs
    ));

    const frameUpdateTimeout = window.setTimeout(() => {
      setFrames((currentFrames) => {
        const hasEnteredFrame = currentFrames.some((currentFrame) => (
          currentFrame.id === status.id
            && currentFrame.text === status.text
            && currentFrame.icon === status.icon
            && (currentFrame.phase === "enter" || currentFrame.phase === "stable")
        ));

        if (hasEnteredFrame) {
          return currentFrames;
        }

        return [
          ...currentFrames.map((currentFrame) => ({
            ...currentFrame,
            phase: "exit" as const,
          })),
          nextFrame,
        ];
      });
    }, 0);

    const enterTimeout = window.setTimeout(() => {
      setFrames((currentFrames) => currentFrames.map((currentFrame) => (
        currentFrame.frameKey === nextFrame.frameKey
          ? {
              ...currentFrame,
              phase: "enter" as const,
            }
          : currentFrame
      )));
    }, cartShippingProgressSettings.statusEnterDelayMs);

    return () => {
      window.clearTimeout(enterTimeout);
      window.clearTimeout(frameUpdateTimeout);
      window.clearTimeout(timeout);
    };
  }, [status]);

  return frames;
}

function getCartShippingFrameTooltipId(baseId: string, frameKey: string) {
  return `${baseId}-${frameKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function CartShippingMilestoneBar({
  cart,
  locale,
  view,
  shippingText,
}: {
  cart: CartSnapshot;
  locale: Locale;
  view: CartShippingView;
  shippingText: string;
}) {
  const start = getCartShippingGoalStart(cart, view.goal);
  const target = getCartShippingGoalThreshold(cart, view.goal);

  return (
    <div
      aria-label={shippingText}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(view.progressPercent)}
      aria-valuetext={shippingText}
      className="cartShipping__bar__SW5b9"
      role="progressbar"
      style={getCartShippingStyle(view)}
    >
      <span className="cartShipping__track__SW5c6">
        <span className="cartShipping__fill__SW5c7" data-tone={view.fillTone} />
      </span>
      <span className="cartShipping__labels__SW5c9" aria-hidden="true">
        <small className="cartShipping__rangeLabel__SW5c15">
          {formatCartMilestoneAmount(start, locale)}
        </small>
        <small className="cartShipping__rangeLabel__SW5c15">
          {formatCartMilestoneAmount(target, locale)}
        </small>
      </span>
    </div>
  );
}

type CartShippingProgressProps = {
  animateEntrance?: boolean;
  cart: CartSnapshot;
  copy: CartCopy;
  locale: Locale;
  onEntranceAnimationStart?: () => void;
};

export function CartShippingProgress({
  animateEntrance = true,
  cart,
  copy,
  locale,
  onEntranceAnimationStart,
}: CartShippingProgressProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const tooltipId = useId();
  const view = useCartShippingAnimation(
    cart,
    copy,
    locale,
    rootRef,
    animateEntrance,
    onEntranceAnimationStart,
  );
  const statusFrames = useCartShippingStatusFrames(view.status, animateEntrance);
  const shippingText = view.status.text || copy.shipping;

  return (
    <section
      aria-label={shippingText}
      className="cartShipping__root__SW5b0"
      ref={rootRef}
      style={getCartShippingRootStyle()}
    >
      <div className="cartShipping__meta__SW5b1">
        <span className="cartShipping__status__SW5c10">
          <span aria-live="polite" className="cartShipping__statusStack__SW5c12">
            {statusFrames.map((item) => {
              const isVisibleFrame = item.phase === "enter" || item.phase === "stable";

              return (
                <span
                  aria-hidden={!isVisibleFrame || item.text.length === 0 ? "true" : undefined}
                  className="cartShipping__statusItem__SW5c13"
                  data-phase={item.phase}
                  key={item.frameKey}
                >
                  {item.icon ? (
                    <span className="cartShipping__checkSlot__SW5c11">
                      <CheckCircleSolidIcon aria-hidden="true" size={17} />
                    </span>
                  ) : null}
                  {item.text ? (
                    <>
                      <strong>{item.text}</strong>
                      <CartShippingInfo
                        copy={copy}
                        isInteractive={isVisibleFrame}
                        tooltipId={getCartShippingFrameTooltipId(tooltipId, item.frameKey)}
                      />
                    </>
                  ) : null}
                </span>
              );
            })}
          </span>
        </span>
      </div>
      <CartShippingMilestoneBar
        cart={cart}
        locale={locale}
        shippingText={shippingText}
        view={view}
      />
    </section>
  );
}

type CartLineListProps = {
  copy: CartCopy;
  isUpdating?: boolean;
  layout?: "drawer" | "page";
  lines: CartLineItem[];
  locale: Locale;
  onQuantityChange: (itemId: string, quantity: number) => void;
  pendingLineId: string | null;
};

function CartLineFavoriteToggle({
  copy,
  isDisabled,
  line,
  locale,
}: {
  copy: CartCopy;
  isDisabled: boolean;
  line: CartLineItem;
  locale: Locale;
}) {
  const router = useRouter();
  const [likedState, setLikedState] = useState<{ lineId: string; liked: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();
  const canToggle = Boolean(line.productId && line.variantId);
  const isLiked = likedState?.lineId === line.id ? likedState.liked : line.isLiked;

  if (!canToggle || !line.productId || !line.variantId) {
    return (
      <FavoriteLink
        className="cartLine__favorite__SW5c9"
        href={`/${locale}/wishlist`}
        label={copy.saveProduct}
        placement="card"
        size="sm"
      />
    );
  }

  const nextLiked = !isLiked;
  const productId = line.productId;
  const variantId = line.variantId;

  return (
    <FavoriteButton
      className="cartLine__favorite__SW5c9"
      disabled={isDisabled || isPending}
      isPending={isPending}
      isSelected={isLiked}
      label={isLiked ? copy.unsaveProduct : copy.saveProduct}
      placement="card"
      size="sm"
      onClick={() => {
        startTransition(async () => {
          setLikedState({
            liked: nextLiked,
            lineId: line.id,
          });

          const result = await toggleProductLikeAction({
            liked: nextLiked,
            locale,
            productId,
            variantId,
          });

          setLikedState({
            liked: result.liked,
            lineId: line.id,
          });

          if (!result.ok && result.redirectTo) {
            router.push(result.redirectTo as Parameters<typeof router.push>[0]);
          }
        });
      }}
      type="button"
    >
      {isLiked ? copy.savedProduct : copy.saveProduct}
    </FavoriteButton>
  );
}

export function CartLineList({
  copy,
  isUpdating = false,
  layout = "drawer",
  lines,
  locale,
  onQuantityChange,
  pendingLineId,
}: CartLineListProps) {
  return (
    <div
      aria-busy={isUpdating ? "true" : undefined}
      className="cartLine__list__SW5c0"
      data-layout={layout}
      data-perf-ready="true"
      data-perf-surface="cart-lines"
      data-perf-updating={isUpdating ? "true" : "false"}
      data-updating={isUpdating ? "true" : undefined}
    >
      {lines.map((line) => {
        const productHref = line.productSlug
          ? `/${locale}/products/${line.productSlug}`
          : null;
        const media = line.imageUrl ? (
          <StorefrontImage alt="" src={line.imageUrl} />
        ) : (
          <span aria-hidden="true" />
        );

        return (
          <article
            className="cartLine__root__SW5c1"
            data-perf-cart-line="true"
            data-perf-line-quantity={line.quantity}
            key={line.id}
          >
            {productHref ? (
              <a className="cartLine__media__SW5c2" href={productHref}>
                {media}
              </a>
            ) : (
              <span className="cartLine__media__SW5c2">
                {media}
              </span>
            )}
            <div className="cartLine__content__SW5c3">
              <div className="cartLine__top__SW5c7">
                <div className="cartLine__copy__SW5c8">
                  {productHref ? (
                    <a href={productHref}>{line.title}</a>
                  ) : (
                    <span>{line.title}</span>
                  )}
                  {line.variantTitle ? <small>{line.variantTitle}</small> : null}
                </div>
                <CartLineFavoriteToggle
                  copy={copy}
                  isDisabled={isUpdating || pendingLineId === line.id}
                  line={line}
                  locale={locale}
                />
              </div>
              <div className="cartLine__controls__SW5c5">
                <strong className="cartLine__price__SW5ca">
                  {formatCartMoney(line.unitPrice, locale)}
                </strong>
                <QuantityStepper
                  disabled={isUpdating || pendingLineId === line.id}
                  label={copy.quantity}
                  min={0}
                  onChange={(quantity) => onQuantityChange(line.id, quantity)}
                  size="sm"
                  value={line.quantity}
                />
              </div>
            </div>
          </article>
        );
      })}
      {isUpdating ? (
        <div className="cartLine__overlay__SW5c6" role="status">
          <Spinner size="md" />
          <span className="utility__visually-hidden__SW0b1">{copy.updatingBag}</span>
        </div>
      ) : null}
    </div>
  );
}

type CartRecommendationsProps = {
  copy: CartCopy;
  locale: Locale;
  onAddVariant: (variantId: string) => void;
  recommendations: CartSnapshot["recommendations"];
};

export function CartRecommendations({
  copy,
  locale,
  onAddVariant,
  recommendations,
}: CartRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="cartExtras__root__SW5d0">
      <h3>{copy.addExtra}</h3>
      <div className="cartExtras__list__SW5d1">
        {recommendations.map((product) => {
          const productHref = `/${locale}/products/${product.slug}?variant=${product.variantId}`;

          return (
            <article className="cartExtras__item__SW5d2" key={product.variantId}>
              <a className="cartExtras__media__SW5d4" href={productHref}>
                {product.imageUrl ? (
                  <StorefrontImage alt="" src={product.imageUrl} />
                ) : (
                  <span aria-hidden="true" />
                )}
              </a>
              <div className="cartExtras__content__SW5d5">
                <div className="cartExtras__copy__SW5d6">
                  <a href={productHref}>{product.name}</a>
                  {product.variantTitle ? <small>{product.variantTitle}</small> : null}
                </div>
                <strong className="cartExtras__price__SW5d7">
                  {formatCartMoney(product.price, locale)}
                </strong>
              </div>
              <button
                aria-label={`${copy.addToBag} ${product.name}`}
                className="cartExtras__add__SW5d3"
                onClick={() => onAddVariant(product.variantId)}
                type="button"
              >
                <PlusIcon aria-hidden="true" size={15} />
                <span>{copy.addToBag}</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

type CartDiscountNoteProps = {
  copy: CartCopy;
};

export function CartDiscountNote({ copy }: CartDiscountNoteProps) {
  return (
    <section className="cartDiscount__root__SW5e0">
      <h3>{copy.discount}</h3>
      <form
        className="cartDiscount__form__SW5e1"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <TextField
          aria-label={copy.discount}
          autoComplete="off"
          fieldClassName="cartDiscount__field__SW5e2"
          fullWidth
          name="discountCode"
          placeholder={copy.discountPlaceholder}
          size="md"
        />
        <Button shape="field" size="md" type="submit" variant="primary">
          {copy.applyDiscount}
        </Button>
      </form>
    </section>
  );
}

type CartSummaryProps = {
  cart: CartSnapshot;
  copy: CartCopy;
  locale: Locale;
};

export function CartSummary({ cart, copy, locale }: CartSummaryProps) {
  return (
    <section className="cartSummary__root__SW5f0">
      <h3>{copy.orderSummary}</h3>
      <dl>
        <div>
          <dt>{copy.subtotal}</dt>
          <dd>{formatCartMoney(cart.subtotal, locale)}</dd>
        </div>
        <div>
          <dt>{copy.shipping}</dt>
          <dd>
            {cart.shipping.qualifiedForFreeShipping
              ? copy.shippingFree
              : copy.shippingCalculated}
          </dd>
        </div>
        <div>
          <dt>{copy.total}</dt>
          <dd>{formatCartMoney(cart.total, locale)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function CartCheckoutActions({
  checkoutHref,
  copy,
}: {
  checkoutHref: string;
  copy: CartCopy;
}) {
  return (
    <div className="cartCheckout__root__SW5g0">
      <LinkButton fullWidth href={checkoutHref} size="lg">{copy.checkout}</LinkButton>
    </div>
  );
}
