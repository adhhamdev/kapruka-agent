import { KAPRUKA_BASE_URL } from '@/constants/urls';

export interface KaprukaProductCategory {
  id?: string;
  name?: string;
  slug?: string;
}

export interface KaprukaProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  inStock?: boolean;
  stockLevel?: string;
  imageUrl?: string;
  attributes?: Record<string, string>;
}

export interface KaprukaProductShipping {
  shipsFrom?: string;
  shipsInternationally?: boolean;
  restrictedCountries?: string[];
}

export interface KaprukaProduct {
  productId?: string;
  name?: string;
  price?: number;
  imageUrl?: string;
  inStock?: boolean;
  url?: string;
  productUrl?: string;
  link?: string;
  description?: string;
}

export interface KaprukaProductDetail extends KaprukaProduct {
  compareAtPrice?: number;
  currency?: string;
  stockLevel?: string;
  summary?: string;
  images?: string[];
  variants?: KaprukaProductVariant[];
  shipping?: KaprukaProductShipping;
  attributes?: Record<string, string>;
  category?: KaprukaProductCategory;
  rating?: number | null;
}

/** Resolve a Kapruka product page URL from API fields or sensible fallbacks. */
export function getKaprukaProductUrl(product: KaprukaProduct): string {
  const direct = product.url ?? product.productUrl ?? product.link;
  if (direct && /^https?:\/\//i.test(direct)) {
    return direct;
  }

  if (product.productId) {
    return `${KAPRUKA_BASE_URL}/find_online?q=${encodeURIComponent(product.productId)}`;
  }

  if (product.name) {
    return `${KAPRUKA_BASE_URL}/find_online?q=${encodeURIComponent(product.name)}`;
  }

  return KAPRUKA_BASE_URL;
}

export function formatStockLabel(product: KaprukaProductDetail): string | null {
  if (product.inStock === false) return 'Out of stock';
  if (product.stockLevel === 'low') return 'Low stock';
  if (product.inStock) return 'In stock';
  return null;
}

export function formatAttributeLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
