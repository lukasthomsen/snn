"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { CartSnapshot } from "@snn/commerce";
import type { Locale } from "@snn/i18n";

type HeaderCartEnhancerProps = {
  initialCart: CartSnapshot;
  locale: Locale;
};

const HeaderCartDrawerHost = dynamic(
  () => import("./header-cart-drawer-host").then((mod) => mod.HeaderCartDrawerHost),
  {
    ssr: false,
  },
);

export function HeaderCartEnhancer({
  initialCart,
  locale,
}: HeaderCartEnhancerProps) {
  const [cartOpenSignal, setCartOpenSignal] = useState(0);

  useEffect(() => {
    function handleCartClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      const trigger = target?.closest("[data-header-cart-trigger]");

      if (!trigger) {
        return;
      }

      event.preventDefault();
      setCartOpenSignal((signal) => signal + 1);
    }

    document.addEventListener("click", handleCartClick);

    return () => {
      document.removeEventListener("click", handleCartClick);
    };
  }, []);

  return cartOpenSignal > 0 ? (
    <HeaderCartDrawerHost
      initialCart={initialCart}
      locale={locale}
      onItemCountChange={() => undefined}
      openSignal={cartOpenSignal}
    />
  ) : null;
}
