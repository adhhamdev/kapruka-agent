import { getProduct } from '@/lib/kapruka-mcp';

const PRODUCT_IMAGE_LINE = /\*\*Image\*\*:\s*(https?:\/\/[^\s)]+)/i;

/** URLs the model often guesses — they 404 on Kapruka. */
const UNTRUSTED_IMAGE_PATTERNS = [
  /\/images\/products\//i,
  /cdn-cgi\/image\//i,
];

export function parseKaprukaProductImage(markdown: string): string | undefined {
  const match = markdown.match(PRODUCT_IMAGE_LINE);
  return match?.[1]?.trim();
}

export function isTrustedKaprukaImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  if (!/^https?:\/\//i.test(url.trim())) return false;
  return !UNTRUSTED_IMAGE_PATTERNS.some((pattern) => pattern.test(url));
}

export async function fetchKaprukaProductImageUrl(
  productId: string,
): Promise<string | undefined> {
  const response = (await getProduct(productId)) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const markdown = response.content?.find((part) => part.type === 'text')?.text;
  if (!markdown) return undefined;
  return parseKaprukaProductImage(markdown);
}

export async function resolveKaprukaProductImageUrl(
  productId: string | undefined,
  candidateUrl?: string | null,
): Promise<string | undefined> {
  if (isTrustedKaprukaImageUrl(candidateUrl)) {
    return candidateUrl!.trim();
  }
  if (!productId?.trim()) return undefined;
  return fetchKaprukaProductImageUrl(productId.trim());
}

export async function enrichKaprukaProducts<
  T extends { productId?: string; imageUrl?: string },
>(products: T[]): Promise<T[]> {
  return Promise.all(
    products.map(async (product) => {
      const imageUrl = await resolveKaprukaProductImageUrl(
        product.productId,
        product.imageUrl,
      );
      if (!imageUrl || imageUrl === product.imageUrl) return product;
      return { ...product, imageUrl };
    }),
  );
}

export async function enrichKaprukaProduct<
  T extends { productId?: string; imageUrl?: string },
>(product: T): Promise<T> {
  const [enriched] = await enrichKaprukaProducts([product]);
  return enriched;
}
