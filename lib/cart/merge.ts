import type { CartItem } from '@/lib/cart-storage';

function cartItemKey(item: CartItem): string {
  return item.product_id;
}

function itemSnapshot(item: CartItem): string {
  return JSON.stringify({
    product_id: item.product_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  });
}

/**
 * Merge server cart (after agent tool actions) with the live client cart.
 * Preserves items/qty the user added or changed while the agent was responding.
 */
export function mergeCartAfterAgentResponse(
  cartAtRequestStart: CartItem[],
  currentCart: CartItem[],
  serverCart: CartItem[],
): CartItem[] {
  const atStart = new Map(
    cartAtRequestStart.map((item) => [cartItemKey(item), item]),
  );
  const server = new Map(serverCart.map((item) => [cartItemKey(item), item]));
  const current = new Map(currentCart.map((item) => [cartItemKey(item), item]));

  const merged = new Map(current);

  for (const [id, serverItem] of server) {
    const startItem = atStart.get(id);
    if (!startItem) {
      merged.set(id, serverItem);
      continue;
    }
    if (itemSnapshot(startItem) !== itemSnapshot(serverItem)) {
      merged.set(id, serverItem);
    }
  }

  for (const [id, startItem] of atStart) {
    if (server.has(id)) continue;

    const currentItem = current.get(id);
    if (currentItem && currentItem.quantity > startItem.quantity) {
      continue;
    }

    merged.delete(id);
  }

  if (serverCart.length === 0 && cartAtRequestStart.length > 0) {
    return currentCart.filter((item) => !atStart.has(cartItemKey(item)));
  }

  return Array.from(merged.values());
}
