"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@snn/i18n";

type WelcomeAccountModalLoaderProps = {
  locale: Locale;
  open: boolean;
  userId: string;
};

type WelcomeAccountModalComponent =
  typeof import("./welcome-account-modal").WelcomeAccountModal;

type IdleGlobal = typeof globalThis & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
};

export function WelcomeAccountModalLoader({
  locale,
  open,
  userId,
}: WelcomeAccountModalLoaderProps) {
  const [ModalComponent, setModalComponent] =
    useState<WelcomeAccountModalComponent | null>(null);

  useEffect(() => {
    if (!open || ModalComponent) {
      return;
    }

    let isActive = true;
    const idleGlobal = globalThis as IdleGlobal;

    function loadModal() {
      void import("./welcome-account-modal").then((module) => {
        if (isActive) {
          setModalComponent(() => module.WelcomeAccountModal);
        }
      });
    }

    if (typeof idleGlobal.requestIdleCallback === "function") {
      const idleHandle = idleGlobal.requestIdleCallback(loadModal, { timeout: 1200 });

      return () => {
        isActive = false;
        idleGlobal.cancelIdleCallback?.(idleHandle);
      };
    }

    const timeoutHandle = globalThis.setTimeout(loadModal, 0);

    return () => {
      isActive = false;
      globalThis.clearTimeout(timeoutHandle);
    };
  }, [ModalComponent, open]);

  if (!open || !ModalComponent) {
    return null;
  }

  return <ModalComponent locale={locale} open={open} userId={userId} />;
}
