'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  clearAllSavedInfo,
  fetchSavedInfo,
  removeSavedMemoryItem,
} from '@/lib/memory-api';
import { getOrCreateMemoryUserId } from '@/lib/memory-user-id';
import type { SavedInfoSnapshot } from '@/types/memory';
import { EMPTY_SAVED_INFO_SNAPSHOT } from '@/types/memory';

export function useSavedInfo(open: boolean) {
  const [snapshot, setSnapshot] =
    useState<SavedInfoSnapshot>(EMPTY_SAVED_INFO_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    const next = await fetchSavedInfo(getOrCreateMemoryUserId());
    setSnapshot(next);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    void reload();
  }, [open, reload]);

  const removeItem = useCallback(
    async (id: string, text: string) => {
      setActionError(null);
      const result = await removeSavedMemoryItem({ id, text });
      if (!result.ok) {
        setActionError(result.message);
        return false;
      }
      await reload();
      return true;
    },
    [reload],
  );

  const clearAll = useCallback(async () => {
    setActionError(null);
    const result = await clearAllSavedInfo();
    if (!result.ok) {
      setActionError(result.message);
      return false;
    }
    await reload();
    return true;
  }, [reload]);

  const totalCount =
    snapshot.people.length +
    snapshot.addresses.length +
    snapshot.preferences.length +
    snapshot.language.length +
    snapshot.other.length;

  return {
    snapshot,
    isLoading,
    actionError,
    totalCount,
    reload,
    removeItem,
    clearAll,
  };
}
