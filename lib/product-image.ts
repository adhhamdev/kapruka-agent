import { PRODUCT_PLACEHOLDER_IMAGE } from '@/constants/urls';
import { isTrustedKaprukaImageUrl } from '@/lib/kapruka-product-image';

/** Resolve the initial image src for a product — remote URL or local placeholder. */
export function resolveProductImageSrc(imageUrl?: string | null): string {
  if (isTrustedKaprukaImageUrl(imageUrl)) {
    return imageUrl!.trim();
  }
  return PRODUCT_PLACEHOLDER_IMAGE;
}

/** Fallback when a remote product image fails to load (404, blocked host, etc.). */
export function getProductImageFallback(): string {
  return PRODUCT_PLACEHOLDER_IMAGE;
}
