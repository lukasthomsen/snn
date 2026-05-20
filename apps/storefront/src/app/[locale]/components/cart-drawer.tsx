"use client";

import {
  Suspense,
  createContext,
  lazy,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CartSnapshot } from "@snn/commerce";
import type { Locale } from "@snn/i18n";

import {
  addCartItemAction,
  loadCartDrawerAction,
  removeCartItemAction,
  updateCartItemQuantityAction,
  type CartActionResult,
} from "../cart-actions";
import { updateLineQuantityOptimistically } from "./cart-optimistic";
import type { DrawerTab } from "./cart-drawer-surface";

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

function loadCartDrawerSurfaceModule() {
  return import("./cart-drawer-surface").then((mod) => ({
    default: mod.CartDrawerSurface,
  }));
}

const CartDrawerSurface = lazy(loadCartDrawerSurfaceModule);

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

const cartDrawerActionCopy = {
  da: {
    addFailed: "Vi kunne ikke tilfoje produktet til kurven lige nu.",
    updateFailed: "Vi kunne ikke opdatere produktet lige nu.",
  },
  en: {
    addFailed: "We could not add this item to your bag right now.",
    updateFailed: "We could not update this item right now.",
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
  const copy = cartDrawerActionCopy[locale];
  const [open, setOpen] = useState(false);
  const [hasRequestedDrawer, setHasRequestedDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>("bag");
  const [cart, setCart] = useState<CartSnapshot | null>(initialCart);
  const [progressCart, setProgressCart] = useState<CartSnapshot | null>(initialCart);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartUpdateCount, setCartUpdateCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingLineId, setPendingLineId] = useState<string | null>(null);
  const [shippingProgressEntrancePending, setShippingProgressEntrancePending] = useState(false);
  const [shippingProgressEntranceVersion, setShippingProgressEntranceVersion] = useState(0);
  const cartHydratedRef = useRef(initialCart.id !== "empty");
  const cartLoadPromiseRef = useRef<Promise<CartSnapshot | null> | null>(null);

  const syncCart = useCallback((nextCart: CartSnapshot | null) => {
    cartHydratedRef.current = true;
    setCart(nextCart);
    setProgressCart(nextCart);
    setMessage(null);
  }, []);

  const loadCartSnapshot = useCallback((options?: {
    force?: boolean;
    preserveRecommendations?: boolean;
    showLoading?: boolean;
  }) => {
    if (!options?.force && cartHydratedRef.current) {
      return Promise.resolve(cart);
    }

    if (cartLoadPromiseRef.current) {
      return cartLoadPromiseRef.current;
    }

    if (options?.showLoading) {
      setLoadingCart(true);
    }

    const previousCart = cart;
    const promise = loadCartDrawerAction({ locale })
      .then((result) => {
        if (!result.ok) {
          if (options?.showLoading) {
            setMessage(result.message);
          }

          return previousCart;
        }

        cartHydratedRef.current = true;

        const nextCart =
          options?.preserveRecommendations &&
          previousCart &&
          result.cart.recommendations.length === 0
            ? {
                ...result.cart,
                recommendations: previousCart.recommendations,
              }
            : result.cart;

        setCart(nextCart);
        setProgressCart(nextCart);
        setMessage(null);

        return nextCart;
      })
      .catch(() => previousCart)
      .finally(() => {
        cartLoadPromiseRef.current = null;
        setLoadingCart(false);
      });

    cartLoadPromiseRef.current = promise;

    return promise;
  }, [cart, locale]);

  const closeCart = useCallback(() => {
    setOpen(false);
    setShippingProgressEntrancePending(false);
  }, []);

  const openCart = useCallback(() => {
    if (!open) {
      setShippingProgressEntrancePending(true);
      setShippingProgressEntranceVersion((version) => version + 1);
    }

    setHasRequestedDrawer(true);
    void loadCartSnapshot({ showLoading: true });
    setOpen(true);
    setActiveTab("bag");
  }, [loadCartSnapshot, open]);

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

      setHasRequestedDrawer(true);
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
        const nextCart = cart
          ? {
              ...result.cart,
              recommendations: cart.recommendations,
            }
          : result.cart;

        cartHydratedRef.current = true;
        setCart(nextCart);
        setProgressCart(nextCart);
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
        const nextCart = previousCart
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

  const handleActiveTabChange = useCallback((tab: DrawerTab) => {
    setActiveTab(tab);
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
    const preload = () => {
      void loadCartDrawerSurfaceModule();
    };
    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(preload, { timeout: 3500 })
      : window.setTimeout(preload, 1500);

    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  return (
    <CartDrawerContext.Provider value={contextValue}>
      {children}
      {hasRequestedDrawer ? (
        <Suspense fallback={null}>
          <CartDrawerSurface
            activeTab={activeTab}
            addVariantToCart={addVariantToCart}
            cart={cart}
            cartUpdateCount={cartUpdateCount}
            closeCart={closeCart}
            loadingCart={loadingCart}
            locale={locale}
            message={message}
            onActiveTabChange={handleActiveTabChange}
            onShippingProgressEntranceStart={handleShippingProgressEntranceStart}
            open={open}
            pendingLineId={pendingLineId}
            progressCart={progressCart}
            shippingProgressEntrancePending={shippingProgressEntrancePending}
            shippingProgressEntranceVersion={shippingProgressEntranceVersion}
            updateLineQuantity={updateLineQuantity}
          />
        </Suspense>
      ) : null}
    </CartDrawerContext.Provider>
  );
}
