import Supermemory from 'supermemory';
import { getSupermemoryApiKey } from '@/lib/supermemory/tools';

export function createSupermemoryClient(): Supermemory | null {
  const apiKey = getSupermemoryApiKey();
  if (!apiKey) return null;

  try {
    return new Supermemory({
      apiKey,
      timeout: 10_000,
      maxRetries: 1,
    });
  } catch {
    return null;
  }
}
