import { getOrCreateMemoryUserId } from '@/lib/memory-user-id';
import type { SavedInfoSnapshot } from '@/types/memory';
import { EMPTY_SAVED_INFO_SNAPSHOT } from '@/types/memory';

export async function fetchSavedInfo(
  memoryUserId = getOrCreateMemoryUserId(),
): Promise<SavedInfoSnapshot> {
  if (!memoryUserId) {
    return { ...EMPTY_SAVED_INFO_SNAPSHOT };
  }

  try {
    const response = await fetch(
      `/api/memory?memoryUserId=${encodeURIComponent(memoryUserId)}`,
    );
    if (!response.ok) {
      return { ...EMPTY_SAVED_INFO_SNAPSHOT, enabled: true, available: false };
    }
    return (await response.json()) as SavedInfoSnapshot;
  } catch {
    return { ...EMPTY_SAVED_INFO_SNAPSHOT, enabled: true, available: false };
  }
}

export async function saveMemoryText(
  memory: string,
  memoryUserId = getOrCreateMemoryUserId(),
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!memoryUserId) {
    return { ok: false, message: 'Could not save right now.' };
  }

  try {
    const response = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryUserId, memory }),
    });
    return (await response.json()) as
      | { ok: true }
      | { ok: false; message: string };
  } catch {
    return {
      ok: false,
      message: 'Could not save right now. You can still continue shopping.',
    };
  }
}

export async function removeSavedMemoryItem(input: {
  id: string;
  text: string;
  memoryUserId?: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const memoryUserId = input.memoryUserId ?? getOrCreateMemoryUserId();
  if (!memoryUserId) {
    return { ok: false, message: 'Could not remove this item.' };
  }

  try {
    const response = await fetch('/api/memory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memoryUserId,
        id: input.id,
        text: input.text,
      }),
    });
    return (await response.json()) as
      | { ok: true }
      | { ok: false; message: string };
  } catch {
    return { ok: false, message: 'Could not remove this item.' };
  }
}

export async function clearAllSavedInfo(
  memoryUserId = getOrCreateMemoryUserId(),
): Promise<
  | { ok: true; removed: number }
  | { ok: false; message: string }
> {
  if (!memoryUserId) {
    return { ok: false, message: 'Could not clear saved info.' };
  }

  try {
    const response = await fetch('/api/memory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryUserId, clearAll: true }),
    });
    return (await response.json()) as
      | { ok: true; removed: number }
      | { ok: false; message: string };
  } catch {
    return { ok: false, message: 'Could not clear saved info.' };
  }
}
