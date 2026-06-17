import type { CartItem } from '@/lib/cart-storage';
import { resolveProductImageSrc } from '@/lib/product-image';
import { getKaprukaProductUrl, type KaprukaProduct } from '@/lib/products';
import type { AddToCartInput } from '@/types/cart';

function resolveProductId(input: AddToCartInput): string {
  return input.product_id ?? input.productId ?? '';
}

export function addProductToCart(
  cart: CartItem[],
  input: AddToCartInput,
): CartItem[] {
  const productId = resolveProductId(input);
  const existing = cart.find((item) => item.product_id === productId);

  if (existing) {
    return cart.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }

  return [
    ...cart,
    {
      product_id: productId,
      name: input.name,
      price: input.price,
      quantity: 1,
      imageUrl: resolveProductImageSrc(input.imageUrl),
      productUrl:
        input.productUrl ??
        input.url ??
        getKaprukaProductUrl(input as KaprukaProduct),
    },
  ];
}

export function updateCartQuantity(
  cart: CartItem[],
  productId: string,
  delta: number,
): CartItem[] {
  return cart
    .map((item) => {
      if (item.product_id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);
}

export function removeFromCart(
  cart: CartItem[],
  productId: string,
): CartItem[] {
  return cart.filter((item) => item.product_id !== productId);
}

export function clearCart(): CartItem[] {
  return [];
}
