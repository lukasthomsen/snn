import type { CartLineItem, CartMoney, CartSnapshot } from "@snn/commerce";

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
