import {
  categorizeMemoryEntries,
  groupSavedInfoItems,
} from '@/lib/supermemory/categorize';
import { createSupermemoryClient } from '@/lib/supermemory/client';
import { formatDeliveryMemoryText } from '@/lib/supermemory/delivery-memory';
import { getSupermemoryApiKey, isSupermemoryEnabled } from '@/lib/supermemory/tools';
import type { SavedInfoSnapshot } from '@/types/memory';
import { EMPTY_SAVED_INFO_SNAPSHOT } from '@/types/memory';

const LIST_QUERY =
  'delivery address gift recipient language preference shopping budget sender recipient phone city';

function emptySnapshot(enabled: boolean): SavedInfoSnapshot {
  return { ...EMPTY_SAVED_INFO_SNAPSHOT, enabled, available: false };
}

function dedupeEntries(
  entries: Array<{ id: string; text: string }>,
): Array<{ id: string; text: string }> {
  const seen = new Set<string>();
  const result: Array<{ id: string; text: string }> = [];

  for (const entry of entries) {
    const normalized = entry.text.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push({ id: entry.id, text: entry.text.trim() });
  }

  return result;
}

async function collectProfileStrings(
  memoryUserId: string,
): Promise<Array<{ id: string; text: string }>> {
  const client = createSupermemoryClient();
  if (!client) return [];

  try {
    const profile = await client.profile({ containerTag: memoryUserId });
    const staticItems = profile.profile.static ?? [];
    const dynamicItems = profile.profile.dynamic ?? [];
    const combined = [...staticItems, ...dynamicItems]
      .map((text) => text.trim())
      .filter(Boolean);

    return combined.map((text, index) => ({
      id: `profile-${index}-${text.slice(0, 24)}`,
      text,
    }));
  } catch {
    return [];
  }
}

async function collectSearchMemories(
  memoryUserId: string,
): Promise<Array<{ id: string; text: string }>> {
  const client = createSupermemoryClient();
  if (!client) return [];

  try {
    const response = await client.search.memories({
      q: LIST_QUERY,
      containerTag: memoryUserId,
      limit: 40,
    });

    return (response.results ?? [])
      .map((result) => ({
        id: result.id,
        text: result.memory?.trim() ?? '',
      }))
      .filter((entry) => entry.text.length > 0);
  } catch {
    return [];
  }
}

export async function fetchSavedInfoSnapshot(
  memoryUserId: string,
): Promise<SavedInfoSnapshot> {
  const enabled = isSupermemoryEnabled();
  if (!enabled || !memoryUserId.trim()) {
    return emptySnapshot(enabled);
  }

  try {
    const [profileEntries, searchEntries] = await Promise.all([
      collectProfileStrings(memoryUserId.trim()),
      collectSearchMemories(memoryUserId.trim()),
    ]);

    const merged = dedupeEntries([...searchEntries, ...profileEntries]);
    const categorized = categorizeMemoryEntries(merged);
    const groups = groupSavedInfoItems(categorized);

    return {
      enabled: true,
      available: true,
      ...groups,
    };
  } catch {
    return emptySnapshot(true);
  }
}

export async function addSavedMemory(
  memoryUserId: string,
  memory: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSupermemoryEnabled()) {
    return { ok: false, message: 'Memory is not available right now.' };
  }

  const trimmed = memory.trim();
  if (!trimmed) {
    return { ok: false, message: 'Nothing to save.' };
  }

  const client = createSupermemoryClient();
  if (!client) {
    return { ok: false, message: 'Memory is not available right now.' };
  }

  try {
    await client.add({
      content: trimmed,
      containerTags: [memoryUserId.trim()],
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: 'Could not save right now. You can still continue shopping.',
    };
  }
}

export { formatDeliveryMemoryText } from '@/lib/supermemory/delivery-memory';

export async function forgetSavedMemory(
  memoryUserId: string,
  input: { id?: string; text?: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSupermemoryEnabled()) {
    return { ok: false, message: 'Memory is not available right now.' };
  }

  const client = createSupermemoryClient();
  if (!client) {
    return { ok: false, message: 'Memory is not available right now.' };
  }

  const containerTag = memoryUserId.trim();
  const text = input.text?.trim();
  const id = input.id?.trim();

  if (!text && !id) {
    return { ok: false, message: 'Could not remove this item.' };
  }

  if (id?.startsWith('profile-') && text) {
    try {
      await client.memories.forget({ containerTag, content: text });
      return { ok: true };
    } catch {
      return { ok: false, message: 'Could not remove this item.' };
    }
  }

  try {
    await client.memories.forget({
      containerTag,
      ...(id && !id.startsWith('profile-') ? { id } : {}),
      ...(text ? { content: text } : {}),
    });
    return { ok: true };
  } catch {
    return { ok: false, message: 'Could not remove this item.' };
  }
}

export async function clearAllSavedMemories(
  memoryUserId: string,
): Promise<{ ok: true; removed: number } | { ok: false; message: string }> {
  if (!isSupermemoryEnabled()) {
    return { ok: false, message: 'Memory is not available right now.' };
  }

  const snapshot = await fetchSavedInfoSnapshot(memoryUserId);
  if (!snapshot.available) {
    return { ok: true, removed: 0 };
  }

  const allItems = [
    ...snapshot.people,
    ...snapshot.addresses,
    ...snapshot.preferences,
    ...snapshot.language,
    ...snapshot.other,
  ];

  if (allItems.length === 0) {
    return { ok: true, removed: 0 };
  }

  let removed = 0;
  for (const item of allItems) {
    const result = await forgetSavedMemory(memoryUserId, {
      id: item.id,
      text: item.text,
    });
    if (result.ok) removed += 1;
  }

  return { ok: true, removed };
}

export function memoryFeatureEnabled(): boolean {
  return Boolean(getSupermemoryApiKey());
}
