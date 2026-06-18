import {
  ACCEPTED_ATTACHMENT_MIMES,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  MAX_TOTAL_ATTACHMENT_BYTES,
} from '@/constants/languages';
import type { ChatAttachmentPayload } from '@/types/attachments';

const ALLOWED_MIMES = new Set<string>(ACCEPTED_ATTACHMENT_MIMES);

export type AttachmentValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function decodeBase64ByteLength(data: string): number {
  if (!data) return 0;
  const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
  return Math.floor((data.length * 3) / 4) - padding;
}

export function validateAttachmentPayload(
  attachments: ChatAttachmentPayload[] | undefined,
): AttachmentValidationResult {
  if (!attachments?.length) {
    return { ok: true };
  }

  if (attachments.length > MAX_ATTACHMENTS) {
    return {
      ok: false,
      message: `You can attach up to ${MAX_ATTACHMENTS} files per message.`,
    };
  }

  let totalBytes = 0;

  for (const attachment of attachments) {
    if (!attachment.mimeType || !ALLOWED_MIMES.has(attachment.mimeType)) {
      return {
        ok: false,
        message: 'One or more attachments use a file type that is not allowed.',
      };
    }

    if (attachment.mimeType.startsWith('video/')) {
      return { ok: false, message: 'Video files are not supported.' };
    }

    const byteLength = decodeBase64ByteLength(attachment.data);
    if (byteLength > MAX_ATTACHMENT_BYTES) {
      return { ok: false, message: 'Each file must be 5 MB or smaller.' };
    }

    totalBytes += byteLength;
  }

  if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
    return {
      ok: false,
      message: 'Total attachment size exceeds the limit for one message.',
    };
  }

  return { ok: true };
}
