import type { KaprukaCategory } from '@/types/widgets';

export function findMcpCategoryName(
  categories: KaprukaCategory[],
  candidate: string,
): string | null {
  const normalized = candidate.trim().toLowerCase();
  if (!normalized) return null;

  for (const category of categories) {
    if (category.name.toLowerCase() === normalized) {
      return category.name;
    }
  }

  return null;
}
