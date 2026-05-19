"use client";

import { useEffect } from "react";

import type { CartSnapshot } from "@snn/commerce";
import type { Locale } from "@snn/i18n";
import { EmptyState, LinkButton } from "@snn/ui";

import {
  CartDiscountNote,
  CartLineList,
  CartRecommendations,
  CartShippingProgress,
  CartSummary,
  cartCopy,
} from "../components/cart-shared";
import { useCartDrawer } from "../components/cart-drawer";

type CartPageClientProps = {
  initialCart: CartSnapshot;
  locale: Locale;
};

const cartPageCopy = {
  da: {
    checkoutSecurity: "Checkout er beskyttet, og priser valideres igen pa serveren.",
    itemCount: "{count} varer",
    loadingError: "Vi kunne ikke opdatere kurven lige nu.",
    title: "Your bag",
  },
  en: {
    checkoutSecurity: "Checkout is protected, and prices are validated again on the server.",
    itemCount: "{count} items",
    loadingError: "We could not update your bag right now.",
    title: "Your bag",
  },
} as const;

export function CartPageClient({ initialCart, locale }: CartPageClientProps) {
  const {
    addVariantToCart,
    cart,
    cartUpdating,
    message,
    pendingLineId,
    progressCart,
    syncCart,
    updateLineQuantity,
  } = useCartDrawer();
  const copy = cartCopy[locale];
  const pageCopy = cartPageCopy[locale];
  const activeCart = cart ?? initialCart;
  const activeProgressCart = progressCart ?? activeCart;

  useEffect(() => {
    syncCart(initialCart);
  }, [initialCart, syncCart]);

  return (
    <main
      className="cartPage__root__SW6a0"
      data-perf-ready="true"
      data-perf-surface="cart-page"
      data-perf-updating={cartUpdating ? "true" : "false"}
    >
      <section className="cartPage__header__SW6a1">
        <h1>{pageCopy.title}</h1>
        <p>{pageCopy.itemCount.replace("{count}", String(activeCart.itemCount))}</p>
      </section>

      {message ? (
        <p className="cartDrawer__message__SW5a3 cartPage__message__SW6a2" role="status">
          {message || pageCopy.loadingError}
        </p>
      ) : null}

      {activeCart.lines.length > 0 ? (
        <div className="cartPage__layout__SW6a3">
          <section className="cartPage__main__SW6a4" aria-label={copy.bag}>
            <CartShippingProgress cart={activeProgressCart} copy={copy} locale={locale} />
            <CartLineList
              copy={copy}
              layout="page"
              lines={activeCart.lines}
              locale={locale}
              isUpdating={cartUpdating}
              onQuantityChange={(itemId, quantity) => {
                void updateLineQuantity(itemId, quantity);
              }}
              pendingLineId={pendingLineId}
            />
            <CartRecommendations
              copy={copy}
              locale={locale}
              onAddVariant={(variantId) => {
                void addVariantToCart(variantId, 1, { openDrawer: false });
              }}
              recommendations={activeCart.recommendations}
            />
          </section>

          <aside className="cartPage__summary__SW6a5" aria-label={copy.orderSummary}>
            <CartDiscountNote copy={copy} />
            <CartSummary cart={activeCart} copy={copy} locale={locale} />
            <p>{pageCopy.checkoutSecurity}</p>
            <LinkButton fullWidth href={`/${locale}/checkout`} size="lg">
              {copy.checkout}
            </LinkButton>
          </aside>
        </div>
      ) : (
        <EmptyState
          action={<LinkButton href={`/${locale}/products`}>{copy.continueShopping}</LinkButton>}
          description={copy.emptyBagLong}
          size="lg"
          title={copy.emptyBag}
          tone="muted"
        />
      )}
    </main>
  );
}
