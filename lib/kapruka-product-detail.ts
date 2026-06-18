import type { KaprukaToolResponse } from '@/lib/kapruka-mcp';
import type { KaprukaProductDetail } from '@/lib/products';

interface ProductDetailJson {
  id?: string;
  name?: string;
  description?: string;
  summary?: string;
  price?: { amount?: number; currency?: string };
  compare_at_price?: { amount?: number; currency?: string } | null;
  in_stock?: boolean;
  stock_level?: string;
  url?: string;
  images?: string[];
  category?: {
    id?: string;
    name?: string;
    slug?: string;
    path?: string;
  };
  variants?: Array<{
    id?: string;
    name?: string;
    sku?: string;
    price?: { amount?: number; currency?: string };
    in_stock?: boolean;
    stock_level?: string;
    attributes?: Record<string, string>;
  }>;
  attributes?: Record<string, string>;
  shipping?: {
    ships_from?: string;
    ships_internationally?: boolean;
    restricted_countries?: string[];
  };
  rating?: number | null;
}

function extractMcpText(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;

  const structured = (response as { structuredContent?: { result?: string } })
    .structuredContent?.result;
  if (typeof structured === 'string' && structured.trim()) {
    return structured;
  }

  const content = (response as KaprukaToolResponse).content;
  if (!Array.isArray(content)) return null;

  const textPart = content.find((part) => part.type === 'text' && part.text);
  return textPart?.text ?? null;
}

export interface ParseProductDetailResult {
  ok: true;
  product: KaprukaProductDetail;
}

export interface ParseProductDetailError {
  ok: false;
  error: string;
}

export type ParseProductDetailResponse =
  | ParseProductDetailResult
  | ParseProductDetailError;

function cleanDescription(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function parseKaprukaProductDetailResponse(
  response: unknown,
): ParseProductDetailResponse {
  const text = extractMcpText(response);
  if (!text) {
    return { ok: false, error: 'No response from Kapruka product detail.' };
  }

  if (text.trim().startsWith('Error')) {
    return { ok: false, error: text.trim() };
  }

  try {
    const parsed = JSON.parse(text) as ProductDetailJson;
    const productId = parsed.id?.trim();
    const name = parsed.name?.trim();

    if (!productId || !name) {
      return {
        ok: false,
        error: 'Kapruka product response was missing id or name.',
      };
    }

    const images = (parsed.images ?? []).filter(
      (url): url is string => Boolean(url?.trim()),
    );
    const imageUrl = images[0];

    const product: KaprukaProductDetail = {
      productId,
      name,
      price: parsed.price?.amount,
      compareAtPrice: parsed.compare_at_price?.amount ?? undefined,
      currency: parsed.price?.currency ?? 'LKR',
      inStock: parsed.in_stock ?? true,
      stockLevel: parsed.stock_level,
      url: parsed.url,
      productUrl: parsed.url,
      imageUrl,
      images,
      description: parsed.description
        ? cleanDescription(parsed.description)
        : parsed.summary
          ? cleanDescription(parsed.summary)
          : undefined,
      summary: parsed.summary ? cleanDescription(parsed.summary) : undefined,
      category: parsed.category
        ? {
            id: parsed.category.id,
            name: parsed.category.name,
            slug: parsed.category.slug,
          }
        : undefined,
      attributes: parsed.attributes,
      shipping: parsed.shipping
        ? {
            shipsFrom: parsed.shipping.ships_from,
            shipsInternationally: parsed.shipping.ships_internationally,
            restrictedCountries: parsed.shipping.restricted_countries,
          }
        : undefined,
      variants: (parsed.variants ?? [])
        .filter((variant) => variant.id && variant.name)
        .map((variant) => ({
          id: variant.id!,
          name: variant.name!,
          sku: variant.sku,
          price: variant.price?.amount,
          inStock: variant.in_stock,
          stockLevel: variant.stock_level,
          attributes: variant.attributes,
        })),
      rating: parsed.rating ?? undefined,
    };

    return { ok: true, product };
  } catch {
    return { ok: false, error: 'Could not parse Kapruka product response.' };
  }
}

export async function fetchKaprukaProductDetail(
  productId: string,
  getProductFn: (
    id: string,
    options?: { currency?: string; response_format?: 'markdown' | 'json' },
  ) => Promise<KaprukaToolResponse>,
  currency: string,
): Promise<ParseProductDetailResponse> {
  const response = await getProductFn(productId, {
    currency,
    response_format: 'json',
  });
  return parseKaprukaProductDetailResponse(response);
}
