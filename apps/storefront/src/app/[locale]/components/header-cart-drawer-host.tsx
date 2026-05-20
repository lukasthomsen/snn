"use client";

import { useEffect } from "react";

import type { CartSnapshot } from "@snn/commerce";
import type { Locale } from "@snn/i18n";

import { CartDrawerProvider, useCartDrawer } from "./cart-drawer";

type HeaderCartDrawerHostProps = {
  initialCart: CartSnapshot;
  locale: Locale;
  onItemCountChange: (itemCount: number) => void;
  openSignal: number;
};

function HeaderCartDrawerBridge({
  onItemCountChange,
  openSignal,
}: Pick<HeaderCartDrawerHostProps, "onItemCountChange" | "openSignal">) {
  const { itemCount, openCart } = useCartDrawer();

  useEffect(() => {
    onItemCountChange(itemCount);
  }, [itemCount, onItemCountChange]);

  useEffect(() => {
    if (openSignal > 0) {
      openCart();
    }
  }, [openCart, openSignal]);

  return null;
}

export function HeaderCartDrawerHost({
  initialCart,
  locale,
  onItemCountChange,
  openSignal,
}: HeaderCartDrawerHostProps) {
  return (
    <CartDrawerProvider initialCart={initialCart} locale={locale}>
      <HeaderCartDrawerBridge
        onItemCountChange={onItemCountChange}
        openSignal={openSignal}
      />
    </CartDrawerProvider>
  );
}
