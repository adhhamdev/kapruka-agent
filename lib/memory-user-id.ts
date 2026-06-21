export const MEMORY_USER_ID_KEY = 'kapruka_agent_memory_user_id';

/** Stable anonymous id for Supermemory container scoping (persists across sessions). */
export function getOrCreateMemoryUserId(): string {
  if (typeof window === 'undefined') return '';

  try {
    const existing = localStorage.getItem(MEMORY_USER_ID_KEY);
    if (existing?.trim()) return existing.trim();

    const id = crypto.randomUUID();
    localStorage.setItem(MEMORY_USER_ID_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function getMemoryUserId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(MEMORY_USER_ID_KEY)?.trim() ?? '';
}
