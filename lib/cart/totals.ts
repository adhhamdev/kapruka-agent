import type { CartItem } from '@/lib/cart-storage';

export function calculateSubtotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartItemCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
