import type { CartItem } from '@/lib/cart-storage';

export function buildCartContextMessage(cart: CartItem[]): string {
  const cartSummary =
    cart.length > 0
      ? cart
          .map(
            (i) =>
              `- SKU: ${i.product_id}, ${i.name} (Qty: ${i.quantity}, Price: LKR ${i.price})`,
          )
          .join('\n')
      : 'Cart is empty.';

  return `[SYSTEM STATUS / CLIENT CART STATE UPDATE]\nCurrent shopping cart items:\n${cartSummary}\nPlease keep this cart in mind when assisting. If user requests to buy, calculate totals based on this.`;
}
