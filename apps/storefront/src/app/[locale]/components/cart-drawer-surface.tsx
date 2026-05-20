"use client";

import { useEffect, useRef, useState } from "react";

import type { CartSnapshot } from "@snn/commerce";
import type { Locale } from "@snn/i18n";
import {
  CloseButton,
  Drawer,
  HeartIcon,
  IconButton,
  InfoCircleIcon,
  LinkButton,
  ShoppingBagIcon,
  Tabs,
} from "@snn/ui";

import {
  loadCartLikesAction,
  type CartActionResult,
  type CartDrawerLikeItem,
} from "../cart-actions";
import {
  CartDiscountNote,
  CartCheckoutActions,
  CartLineList,
  CartRecommendations,
  CartShippingProgress,
  CartSummary,
  cartCopy,
  formatCartMoney,
} from "./cart-shared";
import { StorefrontImage } from "./storefront-image";
import "@snn/ui/styles/components.css";
import "./cart-drawer.css";

export type DrawerTab = "bag" | "likes";

type LikesState =
  | {
      status: "idle" | "loading";
    }
  | {
      items: CartDrawerLikeItem[];
      status: "ready";
    }
  | {
      message: string;
      status: "auth" | "error";
    };

type CartDrawerSurfaceProps = {
  activeTab: DrawerTab;
  addVariantToCart: (
    variantId: string,
    quantity?: number,
    options?: {
      openDrawer?: boolean;
    },
  ) => Promise<CartActionResult>;
  cart: CartSnapshot | null;
  cartUpdateCount: number;
  closeCart: () => void;
  loadingCart: boolean;
  locale: Locale;
  message: string | null;
  onActiveTabChange: (tab: DrawerTab) => void;
  onShippingProgressEntranceStart: () => void;
  open: boolean;
  pendingLineId: string | null;
  progressCart: CartSnapshot | null;
  shippingProgressEntrancePending: boolean;
  shippingProgressEntranceVersion: number;
  updateLineQuantity: (itemId: string, quantity: number) => Promise<CartActionResult>;
};

const cartDrawerCopy = {
  da: {
    bag: "Kurv",
    close: "Luk kurv",
    likes: "Likes",
    loading: "Henter kurv...",
    reservedNoticeLead: "Dine varer er ikke reserveret",
    reservedNoticeRest: ", sa checkout hurtigt hvis du vil sikre dem.",
    title: "Your bag",
    viewWishlist: "Se wishlist",
  },
  en: {
    bag: "Bag",
    close: "Close bag",
    likes: "Likes",
    loading: "Loading bag...",
    reservedNoticeLead: "Your items are not reserved",
    reservedNoticeRest: ", so checkout quickly if you want to secure them.",
    title: "Your bag",
    viewWishlist: "View wishlist",
  },
} as const;

export function CartDrawerSurface({
  activeTab,
  addVariantToCart,
  cart,
  cartUpdateCount,
  closeCart,
  loadingCart,
  locale,
  message,
  onActiveTabChange,
  onShippingProgressEntranceStart,
  open,
  pendingLineId,
  progressCart,
  shippingProgressEntrancePending,
  shippingProgressEntranceVersion,
  updateLineQuantity,
}: CartDrawerSurfaceProps) {
  const copy = cartDrawerCopy[locale];
  const sharedCopy = cartCopy[locale];
  const [likesState, setLikesState] = useState<LikesState>({ status: "idle" });
  const likesStatusRef = useRef<LikesState["status"]>("idle");

  useEffect(() => {
    likesStatusRef.current = likesState.status;
  }, [likesState.status]);

  useEffect(() => {
    if (!open || activeTab !== "likes" || likesStatusRef.current !== "idle") {
      return undefined;
    }

    const requestStatus = "loading";
    let cancelled = false;

    async function loadLikes() {
      likesStatusRef.current = requestStatus;
      setLikesState({ status: "loading" });

      const result = await loadCartLikesAction({ locale });

      if (cancelled) {
        return;
      }

      if (result.ok) {
        likesStatusRef.current = "ready";
        setLikesState({
          items: result.items,
          status: "ready",
        });
      } else {
        const status = result.code === "AUTH_REQUIRED" ? "auth" : "error";

        likesStatusRef.current = status;
        setLikesState({
          message: result.message,
          status,
        });
      }
    }

    void loadLikes();

    return () => {
      cancelled = true;
    };
  }, [activeTab, locale, open]);

  return (
    <Drawer
      bodyClassName="cartDrawer__body__SW5a1"
      className="cartDrawer__dialog__SW5a0"
      closeLabel={copy.close}
      onClose={closeCart}
      open={open}
      placement="right"
      showCloseButton={false}
      showHandle={false}
      size="lg"
      headerEnd={(
        <div className="cartDrawer__headerActions__SW5aa">
          <Tabs
            aria-label="Cart sections"
            className="cartDrawer__tabs__SW5a9"
            fullWidth={false}
            items={[
              {
                id: "bag",
                label: (
                  <span className="cartDrawer__tabVisual__SW5ae">
                    <ShoppingBagIcon aria-hidden="true" className="cartDrawer__tabIcon__SW5b4" />
                    <span className="utility__visually-hidden__SW0b1">{copy.bag}</span>
                  </span>
                ),
              },
              {
                id: "likes",
                label: (
                  <span className="cartDrawer__tabVisual__SW5ae">
                    <HeartIcon aria-hidden="true" className="cartDrawer__tabIcon__SW5b4" />
                    <span className="utility__visually-hidden__SW0b1">{copy.likes}</span>
                  </span>
                ),
              },
            ]}
            onSelectionChange={(key) => onActiveTabChange(key as DrawerTab)}
            selectedKey={activeTab}
            variant="secondary"
          />
          <CloseButton
            className="cartDrawer__close__SW5ab"
            label={copy.close}
            onClick={closeCart}
            size="lg"
          />
        </div>
      )}
      title={copy.title}
    >
      <div
        className="cartDrawer__shell__SW5a2"
        data-perf-ready={cart ? "true" : "false"}
        data-perf-surface="cart-drawer"
        data-perf-tab={activeTab}
        data-perf-updating={cartUpdateCount > 0 ? "true" : "false"}
      >
        <div className="cartDrawer__scroll__SW5b2">
          {message ? (
            <p className="cartDrawer__message__SW5a3" role="status">
              {message}
            </p>
          ) : null}

          {activeTab === "bag" ? (
            <div
              className="cartDrawer__panel__SW5a4"
              data-perf-ready={cart ? "true" : "false"}
              data-perf-surface="cart-drawer-bag"
              data-perf-updating={cartUpdateCount > 0 ? "true" : "false"}
            >
              {loadingCart && !cart ? (
                <p className="cartDrawer__loading__SW5a5">{copy.loading}</p>
              ) : null}

              {cart ? (
                <>
                  <CartShippingProgress
                    animateEntrance={shippingProgressEntrancePending}
                    cart={progressCart ?? cart}
                    copy={sharedCopy}
                    key={shippingProgressEntranceVersion}
                    locale={locale}
                    onEntranceAnimationStart={onShippingProgressEntranceStart}
                  />

                  {cart.lines.length > 0 ? (
                    <>
                      <p className="cartDrawer__notice__SW5b5">
                        <InfoCircleIcon aria-hidden="true" className="cartDrawer__noticeIcon__SW5ac" />
                        <span className="cartDrawer__noticeCopy__SW5ad">
                          <strong>{copy.reservedNoticeLead}</strong>
                          {copy.reservedNoticeRest}
                        </span>
                      </p>
                      <CartLineList
                        copy={sharedCopy}
                        lines={cart.lines}
                        locale={locale}
                        isUpdating={cartUpdateCount > 0}
                        onQuantityChange={(itemId, quantity) => {
                          void updateLineQuantity(itemId, quantity);
                        }}
                        pendingLineId={pendingLineId}
                      />
                    </>
                  ) : (
                    <div className="cartDrawer__empty__SW5a6">
                      <strong>{sharedCopy.emptyBag}</strong>
                      <p>{sharedCopy.emptyBagLong}</p>
                      <LinkButton href={`/${locale}/products`} size="md">
                        {sharedCopy.continueShopping}
                      </LinkButton>
                    </div>
                  )}

                  <CartRecommendations
                    copy={sharedCopy}
                    locale={locale}
                    onAddVariant={(variantId) => {
                      void addVariantToCart(variantId);
                    }}
                    recommendations={cart.recommendations}
                  />

                  {cart.lines.length > 0 ? (
                    <>
                      <CartDiscountNote copy={sharedCopy} />
                      <CartSummary cart={cart} copy={sharedCopy} locale={locale} />
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : (
            <div
              className="cartDrawer__panel__SW5a4"
              data-perf-ready={likesState.status !== "idle" && likesState.status !== "loading" ? "true" : "false"}
              data-perf-surface="cart-drawer-likes"
              data-perf-updating={likesState.status === "idle" || likesState.status === "loading" ? "true" : "false"}
            >
              {likesState.status === "loading" || likesState.status === "idle" ? (
                <p className="cartDrawer__loading__SW5a5">{copy.loading}</p>
              ) : null}
              {likesState.status === "auth" || likesState.status === "error" ? (
                <div className="cartDrawer__empty__SW5a6">
                  <strong>{copy.likes}</strong>
                  <p>{likesState.message}</p>
                  <LinkButton href={`/${locale}/wishlist`} size="md" tone="secondary">
                    {copy.viewWishlist}
                  </LinkButton>
                </div>
              ) : null}
              {likesState.status === "ready" ? (
                likesState.items.length > 0 ? (
                  <div className="cartExtras__list__SW5d1">
                    {likesState.items.map((product) => (
                      <article className="cartExtras__item__SW5d2" key={product.variantId}>
                        <a href={`/${locale}/products/${product.slug}?variant=${product.variantId}`}>
                          {product.imageUrl ? (
                            <StorefrontImage alt="" src={product.imageUrl} />
                          ) : (
                            <span aria-hidden="true" />
                          )}
                        </a>
                        <div>
                          <strong>{product.name}</strong>
                          <span>{formatCartMoney(product.price, locale)}</span>
                        </div>
                        <IconButton
                          aria-label={`${sharedCopy.addToBag} ${product.name}`}
                          onClick={() => void addVariantToCart(product.variantId)}
                          size="sm"
                          tone="ghost"
                        >
                          <ShoppingBagIcon />
                        </IconButton>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="cartDrawer__empty__SW5a6">
                    <strong>{sharedCopy.emptyBag}</strong>
                    <p>{sharedCopy.emptyBagLong}</p>
                  </div>
                )
              ) : null}
            </div>
          )}
        </div>

        {activeTab === "bag" && cart && cart.lines.length > 0 ? (
          <div className="cartDrawer__footer__SW5b3">
            <CartCheckoutActions
              checkoutHref={`/${locale}/checkout`}
              copy={sharedCopy}
            />
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
