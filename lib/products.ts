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

const KAPRUKA_BASE = 'https://www.kapruka.com';

/** Resolve a Kapruka product page URL from API fields or sensible fallbacks. */
export function getKaprukaProductUrl(product: KaprukaProduct): string {
  const direct = product.url ?? product.productUrl ?? product.link;
  if (direct && /^https?:\/\//i.test(direct)) {
    return direct;
  }

  if (product.productId) {
    return `${KAPRUKA_BASE}/find_online?q=${encodeURIComponent(product.productId)}`;
  }

  if (product.name) {
    return `${KAPRUKA_BASE}/find_online?q=${encodeURIComponent(product.name)}`;
  }

  return KAPRUKA_BASE;
}
