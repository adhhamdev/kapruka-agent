import { DEFAULT_CURRENCY } from '@/constants/currency';
import { searchProducts } from '@/lib/kapruka-mcp';
import type { KaprukaProduct } from '@/lib/products';

export interface ProductSearchParams {
  q: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  sort?: string;
  limit?: number;
  cursor?: string | null;
  include_stubs?: boolean;
}

export interface ProductSearchResult {
  products: KaprukaProduct[];
  nextCursor: string | null;
}

interface KaprukaSearchJson {
  results?: Array<{
    id?: string;
    name?: string;
    summary?: string;
    price?: { amount?: number; currency?: string };
    in_stock?: boolean;
    image_url?: string;
    url?: string;
  }>;
  next_cursor?: string | null;
}

function extractJsonText(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;
  const content = (response as { content?: Array<{ type?: string; text?: string }> })
    .content;
  if (!Array.isArray(content)) return null;
  const textPart = content.find((part) => part.type === 'text' && part.text);
  return textPart?.text ?? null;
}

export function mapKaprukaSearchResult(item: NonNullable<KaprukaSearchJson['results']>[number]): KaprukaProduct {
  return {
    productId: item.id,
    name: item.name,
    price: item.price?.amount,
    imageUrl: item.image_url,
    inStock: item.in_stock,
    url: item.url,
    productUrl: item.url,
    description: item.summary,
  };
}

export function parseKaprukaSearchResponse(raw: unknown): ProductSearchResult {
  const text = extractJsonText(raw);
  if (!text) {
    return { products: [], nextCursor: null };
  }

  try {
    const parsed = JSON.parse(text) as KaprukaSearchJson;
    const products = (parsed.results ?? []).map(mapKaprukaSearchResult);
    return {
      products,
      nextCursor: parsed.next_cursor ?? null,
    };
  } catch {
    return { products: [], nextCursor: null };
  }
}

export async function searchKaprukaProducts(
  params: ProductSearchParams,
): Promise<ProductSearchResult> {
  const response = await searchProducts({
    q: params.q,
    category: params.category,
    min_price: params.min_price,
    max_price: params.max_price,
    in_stock_only: params.in_stock_only,
    sort: params.sort,
    limit: params.limit,
    cursor: params.cursor ?? undefined,
    currency: DEFAULT_CURRENCY,
    include_stubs: params.include_stubs,
    response_format: 'json',
  });

  return parseKaprukaSearchResponse(response);
}
