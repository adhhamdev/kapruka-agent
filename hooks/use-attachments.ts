'use client';

import { useCallback, useState } from 'react';
import {
  filesToAttachments,
  revokeAttachmentPreview,
} from '@/lib/attachments';
import type { ChatAttachment } from '@/types/attachments';

export function useAttachments() {
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      try {
        const next = await filesToAttachments(files, attachments.length);
        setAttachments((prev) => [...prev, ...next]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not attach file.');
      }
    },
    [attachments.length],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) revokeAttachmentPreview(target);
      return prev.filter((a) => a.id !== id);
    });
    setError(null);
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach(revokeAttachmentPreview);
      return [];
    });
    setError(null);
  }, []);

  return {
    attachments,
    attachmentError: error,
    addFiles,
    removeAttachment,
    clearAttachments,
    setAttachmentError: setError,
  };
}
