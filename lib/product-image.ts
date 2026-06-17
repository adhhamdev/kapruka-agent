import { PRODUCT_PLACEHOLDER_IMAGE } from '@/constants/urls';

/** Resolve the initial image src for a product — remote URL or local placeholder. */
export function resolveProductImageSrc(imageUrl?: string | null): string {
  if (imageUrl && /^https?:\/\//i.test(imageUrl.trim())) {
    return imageUrl.trim();
  }
  return PRODUCT_PLACEHOLDER_IMAGE;
}

/** Fallback when a remote product image fails to load (404, blocked host, etc.). */
export function getProductImageFallback(): string {
  return PRODUCT_PLACEHOLDER_IMAGE;
}
