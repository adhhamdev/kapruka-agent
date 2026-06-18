import {
  ACCEPTED_ATTACHMENT_MIMES,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  MAX_TOTAL_ATTACHMENT_BYTES,
} from '@/constants/languages';
import type { KaprukaAgentUIMessage } from '@/types/agent-ui-message';

const ALLOWED_MIMES = new Set<string>(ACCEPTED_ATTACHMENT_MIMES);

export type AttachmentValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function decodeDataUrlByteLength(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return 0;
  const base64 = dataUrl.slice(commaIndex + 1);
  if (!base64) return 0;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function validateUiMessageAttachments(
  messages: KaprukaAgentUIMessage[],
): AttachmentValidationResult {
  for (const message of messages) {
    const fileParts = message.parts.filter((part) => part.type === 'file');
    if (fileParts.length === 0) continue;

    if (fileParts.length > MAX_ATTACHMENTS) {
      return {
        ok: false,
        message: `You can attach up to ${MAX_ATTACHMENTS} files per message.`,
      };
    }

    let totalBytes = 0;

    for (const part of fileParts) {
      if (part.type !== 'file') continue;
      const mimeType = part.mediaType ?? '';
      if (!mimeType || !ALLOWED_MIMES.has(mimeType)) {
        return {
          ok: false,
          message:
            'Unsupported attachment type. Use images or PDF/Word/plain text only.',
        };
      }

      const bytes = decodeDataUrlByteLength(part.url);
      if (bytes > MAX_ATTACHMENT_BYTES) {
        return {
          ok: false,
          message: 'Each attachment must be 5 MB or smaller.',
        };
      }
      totalBytes += bytes;
    }

    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
      return {
        ok: false,
        message: 'Total attachment size must be 12 MB or less.',
      };
    }
  }

  return { ok: true };
}
