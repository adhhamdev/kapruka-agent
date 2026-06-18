import type { KaprukaToolResponse } from '@/lib/kapruka-mcp';
import type { KaprukaCategory } from '@/types/widgets';

interface CategoriesJson {
  categories?: Array<{ name?: string; url?: string }>;
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

export interface ParseCategoriesResult {
  ok: true;
  categories: KaprukaCategory[];
}

export interface ParseCategoriesError {
  ok: false;
  error: string;
}

export type ParseCategoriesResponse = ParseCategoriesResult | ParseCategoriesError;

export function parseKaprukaCategoriesResponse(
  response: unknown,
): ParseCategoriesResponse {
  const text = extractMcpText(response);
  if (!text) {
    return { ok: false, error: 'No response from Kapruka categories.' };
  }

  if (text.trim().startsWith('Error')) {
    return { ok: false, error: text.trim() };
  }

  try {
    const parsed = JSON.parse(text) as CategoriesJson;
    const categories = (parsed.categories ?? [])
      .filter(
        (item): item is { name: string; url: string } =>
          Boolean(item.name?.trim() && item.url?.trim()),
      )
      .map((item) => ({
        name: item.name.trim(),
        url: item.url.trim(),
      }));

    if (categories.length === 0) {
      return { ok: false, error: 'No categories returned from Kapruka.' };
    }

    return { ok: true, categories };
  } catch {
    return { ok: false, error: 'Could not parse Kapruka categories response.' };
  }
}

/** Human-readable label for MCP category slugs (e.g. Giftcert → Giftcert, cakes → Cakes). */
export function formatCategoryLabel(name: string): string {
  if (/\s/.test(name)) return name;
  const spaced = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  if (spaced !== name) return spaced;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
