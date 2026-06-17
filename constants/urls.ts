export const KAPRUKA_BASE_URL = 'https://www.kapruka.com';

export const DEFAULT_DELIVERY_COST_LABEL = 'LKR 450';

/** Local fallback when Kapruka image URLs are missing or return 404. */
export const PRODUCT_PLACEHOLDER_IMAGE = '/product-placeholder.svg';

/** @deprecated Use resolveProductImageSrc — kept for cart seed IDs when no URL exists. */
export function getProductImageUrl(productId: string, _size = 300): string {
  return PRODUCT_PLACEHOLDER_IMAGE;
}
