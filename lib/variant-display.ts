const IMAGE_URL_PATTERN =
  /^https?:\/\/.+?\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i;

export function isLikelyImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;

  if (IMAGE_URL_PATTERN.test(trimmed)) return true;

  return (
    /cdn\.shopify\.com/i.test(trimmed) ||
    /\/files\//i.test(trimmed) ||
    /[?&]width=\d+/i.test(trimmed)
  );
}

export function parseVariantName(name: string): {
  label: string;
  imageUrl?: string;
} {
  const trimmed = name.trim();
  if (!trimmed) return { label: 'Variant' };

  const slashMatch = trimmed.match(/^(https?:\/\/.+?)\s+\/\s+(.+)$/i);
  if (slashMatch && isLikelyImageUrl(slashMatch[1])) {
    return {
      imageUrl: slashMatch[1].trim(),
      label: slashMatch[2].trim(),
    };
  }

  if (isLikelyImageUrl(trimmed)) {
    return { label: 'Variant', imageUrl: trimmed };
  }

  return { label: trimmed };
}

export function normalizeVariantAttributes(
  attributes: Record<string, string> | undefined,
  variantImageUrl?: string,
): Record<string, string> {
  if (!attributes) return {};

  const normalized: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(attributes)) {
    const value = rawValue.trim();
    if (!value) continue;

    if (isLikelyImageUrl(value)) {
      if (variantImageUrl && value === variantImageUrl) continue;
      if (/color|image|swatch|thumbnail|photo|picture/i.test(key)) continue;
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

export function resolveVariantImageUrl(input: {
  name: string;
  imageUrl?: string;
  attributes?: Record<string, string>;
}): string | undefined {
  if (input.imageUrl?.trim()) return input.imageUrl.trim();

  const fromName = parseVariantName(input.name);
  if (fromName.imageUrl) return fromName.imageUrl;

  if (!input.attributes) return undefined;

  for (const [key, value] of Object.entries(input.attributes)) {
    const trimmed = value.trim();
    if (!isLikelyImageUrl(trimmed)) continue;
    if (/color|image|swatch|thumbnail|photo|picture/i.test(key)) {
      return trimmed;
    }
  }

  return undefined;
}

export function resolveVariantLabel(input: {
  name: string;
  attributes?: Record<string, string>;
}): string {
  const fromName = parseVariantName(input.name);
  if (fromName.label && fromName.label !== 'Variant') {
    return fromName.label;
  }

  const size =
    input.attributes?.size ??
    input.attributes?.Size ??
    input.attributes?.SIZE;
  if (size && !isLikelyImageUrl(size)) return size.trim();

  return fromName.label;
}
