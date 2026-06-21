import type { SavedInfoCategory, SavedInfoItem } from '@/types/memory';

function categoryForMemoryText(text: string): SavedInfoCategory {
  const lower = text.toLowerCase();

  if (
    lower.includes('gift recipient') ||
    lower.includes('recipient —') ||
    lower.includes('recipient -') ||
    /\b(amma|mother|father|wife|husband|boss|friend|uncle|aunt)\b/.test(lower)
  ) {
    return 'people';
  }

  if (
    lower.includes('delivery profile') ||
    lower.includes('delivery address') ||
    lower.includes('deliver to') ||
    lower.includes('address:') ||
    lower.includes('city:') ||
    lower.includes('phone:')
  ) {
    return 'addresses';
  }

  if (lower.includes('preferred language') || lower.includes('language:')) {
    return 'language';
  }

  if (
    lower.includes('shopping preference') ||
    lower.includes('budget') ||
    lower.includes('vegetarian') ||
    lower.includes('dietary') ||
    lower.includes('prefers')
  ) {
    return 'preferences';
  }

  return 'other';
}

export function categorizeMemoryEntries(
  entries: Array<{ id: string; text: string }>,
): SavedInfoItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    text: entry.text.trim(),
    category: categoryForMemoryText(entry.text),
  }));
}

export function groupSavedInfoItems(items: SavedInfoItem[]): {
  people: SavedInfoItem[];
  addresses: SavedInfoItem[];
  preferences: SavedInfoItem[];
  language: SavedInfoItem[];
  other: SavedInfoItem[];
} {
  const groups = {
    people: [] as SavedInfoItem[],
    addresses: [] as SavedInfoItem[],
    preferences: [] as SavedInfoItem[],
    language: [] as SavedInfoItem[],
    other: [] as SavedInfoItem[],
  };

  for (const item of items) {
    groups[item.category].push(item);
  }

  return groups;
}
