"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  addCartItemAction,
  loadCartLikesAction,
  removeCartItemAction,
  updateCartItemQuantityAction,
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
  updateLineQuantityOptimistically,
} from "./cart-shared";
import { StorefrontImage } from "./storefront-image";

type CartDrawerContextValue = {
  addVariantToCart: (
    variantId: string,
    quantity?: number,
    options?: {
      openDrawer?: boolean;
    },
  ) => Promise<CartActionResult>;
  cart: CartSnapshot | null;
  cartUpdating: boolean;
  itemCount: number;
  message: string | null;
  openCart: () => void;
  pendingLineId: string | null;
  progressCart: CartSnapshot | null;
  syncCart: (cart: CartSnapshot | null) => void;
  updateLineQuantity: (itemId: string, quantity: number) => Promise<CartActionResult>;
};

type CartDrawerProviderProps = {
  children: ReactNode;
  initialCart: CartSnapshot;
  locale: Locale;
};

type DrawerTab = "bag" | "likes";

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

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

const cartDrawerCopy = {
  da: {
    bag: "Kurv",
    close: "Luk kurv",
    addFailed: "Vi kunne ikke tilfoje produktet til kurven lige nu.",
    likes: "Likes",
    loading: "Henter kurv...",
    reservedNoticeLead: "Dine varer er ikke reserveret",
    reservedNoticeRest: ", sa checkout hurtigt hvis du vil sikre dem.",
    title: "Your bag",
    updateFailed: "Vi kunne ikke opdatere produktet lige nu.",
    viewWishlist: "Se wishlist",
  },
  en: {
    bag: "Bag",
    close: "Close bag",
    addFailed: "We could not add this item to your bag right now.",
    likes: "Likes",
    loading: "Loading bag...",
    reservedNoticeLead: "Your items are not reserved",
    reservedNoticeRest: ", so checkout quickly if you want to secure them.",
    title: "Your bag",
    updateFailed: "We could not update this item right now.",
    viewWishlist: "View wishlist",
  },
} as const;

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);

  if (!context) {
    throw new Error("useCartDrawer must be used inside CartDrawerProvider.");
  }

  return context;
}

export function CartDrawerProvider({
  children,
  initialCart,
  locale,
}: CartDrawerProviderProps) {
  const copy = cartDrawerCopy[locale];
  const sharedCopy = cartCopy[locale];
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>("bag");
  const [cart, setCart] = useState<CartSnapshot | null>(initialCart);
  const [progressCart, setProgressCart] = useState<CartSnapshot | null>(initialCart);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartUpdateCount, setCartUpdateCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingLineId, setPendingLineId] = useState<string | null>(null);
  const [shippingProgressEntrancePending, setShippingProgressEntrancePending] = useState(false);
  const [shippingProgressEntranceVersion, setShippingProgressEntranceVersion] = useState(0);
  const [likesState, setLikesState] = useState<LikesState>({ status: "idle" });

  const syncCart = useCallback((nextCart: CartSnapshot | null) => {
    setCart(nextCart);
    setProgressCart(nextCart);
    setMessage(null);
  }, []);

  const openCart = useCallback(() => {
    if (!open) {
      setShippingProgressEntrancePending(true);
      setShippingProgressEntranceVersion((version) => version + 1);
    }

    setOpen(true);
    setActiveTab("bag");
  }, [open]);

  const addVariantToCart = useCallback(async (
    variantId: string,
    quantity = 1,
    options?: {
      openDrawer?: boolean;
    },
  ): Promise<CartActionResult> => {
    if (options?.openDrawer !== false) {
      if (!open) {
        setShippingProgressEntrancePending(true);
        setShippingProgressEntranceVersion((version) => version + 1);
      }

      setOpen(true);
      setActiveTab("bag");
    }

    setMessage(null);
    setLoadingCart((current) => current || !cart);
    setCartUpdateCount((count) => count + 1);

    try {
      const result = await addCartItemAction({
        locale,
        quantity,
        variantId,
      });

      if (result.ok) {
        setCart(result.cart);
        setProgressCart(result.cart);
        setMessage(null);
      } else {
        setMessage(result.message);
      }

      return result;
    } catch {
      const fallbackResult = {
        code: "UNKNOWN",
        message: copy.addFailed,
        ok: false,
      } satisfies CartActionResult;

      setMessage(fallbackResult.message);

      return fallbackResult;
    } finally {
      setLoadingCart(false);
      setCartUpdateCount((count) => Math.max(count - 1, 0));
    }
  }, [cart, copy.addFailed, locale, open]);

  const updateLineQuantity = useCallback(async (
    itemId: string,
    quantity: number,
  ): Promise<CartActionResult> => {
    const previousCart = cart;

    setCartUpdateCount((count) => count + 1);

    if (cart) {
      setCart(updateLineQuantityOptimistically(cart, itemId, quantity));
    }

    setPendingLineId(itemId);
    setMessage(null);

    try {
      const result = quantity <= 0
        ? await removeCartItemAction({ itemId, locale })
        : await updateCartItemQuantityAction({ itemId, locale, quantity });

      if (result.ok) {
        const nextCart = quantity > 0 && previousCart
          ? {
              ...result.cart,
              recommendations: previousCart.recommendations,
            }
          : result.cart;

        setCart(nextCart);
        setProgressCart(nextCart);
        setMessage(null);
      } else {
        setCart(previousCart);
        setProgressCart(previousCart);
        setMessage(result.message);
      }

      return result;
    } catch {
      const fallbackResult = {
        code: "UNKNOWN",
        message: copy.updateFailed,
        ok: false,
      } satisfies CartActionResult;

      setCart(previousCart);
      setProgressCart(previousCart);
      setMessage(fallbackResult.message);

      return fallbackResult;
    } finally {
      setPendingLineId(null);
      setCartUpdateCount((count) => Math.max(count - 1, 0));
    }
  }, [cart, copy.updateFailed, locale]);

  const handleShippingProgressEntranceStart = useCallback(() => {
    setShippingProgressEntrancePending(false);
  }, []);

  const contextValue = useMemo<CartDrawerContextValue>(() => ({
    addVariantToCart,
    cart,
    cartUpdating: cartUpdateCount > 0,
    itemCount: cart?.itemCount ?? 0,
    message,
    openCart,
    pendingLineId,
    progressCart,
    syncCart,
    updateLineQuantity,
  }), [
    addVariantToCart,
    cart,
    cartUpdateCount,
    message,
    openCart,
    pendingLineId,
    progressCart,
    syncCart,
    updateLineQuantity,
  ]);

  useEffect(() => {
    if (!open || activeTab !== "likes" || likesState.status !== "idle") {
      return;
    }

    let cancelled = false;

    async function loadLikes() {
      setLikesState({ status: "loading" });

      const result = await loadCartLikesAction({ locale });

      if (cancelled) {
        return;
      }

      if (result.ok) {
        setLikesState({
          items: result.items,
          status: "ready",
        });
      } else {
        setLikesState({
          message: result.message,
          status: result.code === "AUTH_REQUIRED" ? "auth" : "error",
        });
      }
    }

    void loadLikes();

    return () => {
      cancelled = true;
    };
  }, [activeTab, likesState.status, locale, open]);

  return (
    <CartDrawerContext.Provider value={contextValue}>
      {children}
      <Drawer
        bodyClassName="cartDrawer__body__SW5a1"
        className="cartDrawer__dialog__SW5a0"
        closeLabel={copy.close}
        onClose={() => {
          setOpen(false);
          setShippingProgressEntrancePending(false);
        }}
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
              onSelectionChange={(key) => setActiveTab(key as DrawerTab)}
              selectedKey={activeTab}
              variant="secondary"
            />
            <CloseButton
              className="cartDrawer__close__SW5ab"
              label={copy.close}
              onClick={() => {
                setOpen(false);
                setShippingProgressEntrancePending(false);
              }}
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
                      onEntranceAnimationStart={handleShippingProgressEntranceStart}
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
    </CartDrawerContext.Provider>
  );
}
