export type { CartItem } from '@/lib/cart-storage';

export interface AddToCartInput {
  product_id?: string;
  productId?: string;
  name: string;
  price: number;
  imageUrl?: string;
  productUrl?: string;
  url?: string;
}
