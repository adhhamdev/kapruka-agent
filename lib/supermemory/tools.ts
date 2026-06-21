import { supermemoryTools } from '@supermemory/tools/ai-sdk';

export function getSupermemoryApiKey(): string | undefined {
  const key = process.env.SUPERMEMORY_API_KEY?.trim();
  return key || undefined;
}

export function isSupermemoryEnabled(): boolean {
  return Boolean(getSupermemoryApiKey());
}

export function createSupermemoryTools(memoryUserId: string) {
  const apiKey = getSupermemoryApiKey();
  if (!apiKey || !memoryUserId.trim()) {
    return {};
  }

  try {
    return supermemoryTools(apiKey, {
      containerTags: [memoryUserId.trim()],
    });
  } catch {
    return {};
  }
}
