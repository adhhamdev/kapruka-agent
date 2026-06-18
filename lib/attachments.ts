import {
  ACCEPTED_ATTACHMENT_MIMES,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
} from '@/constants/languages';
import type { AttachmentKind, ChatAttachment } from '@/types/attachments';

const ALLOWED_MIMES = new Set<string>(ACCEPTED_ATTACHMENT_MIMES);

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function isAcceptedFile(file: File): boolean {
  if (isVideoFile(file)) return false;
  const mime = file.type || '';
  return ALLOWED_MIMES.has(mime);
}

function attachmentKind(mimeType: string): AttachmentKind {
  return mimeType.startsWith('image/') ? 'image' : 'file';
}

export async function fileToAttachment(file: File): Promise<ChatAttachment> {
  if (isVideoFile(file)) {
    throw new Error('Video files are not supported.');
  }
  if (!isAcceptedFile(file)) {
    throw new Error(
      'Only images and documents (PDF, Word, plain text) are supported.',
    );
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error('File must be 5 MB or smaller.');
  }

  const data = await readFileAsBase64(file);
  const mimeType = file.type;
  const kind = attachmentKind(mimeType);

  return {
    id: `${Date.now()}-${file.name}`,
    name: file.name,
    mimeType,
    kind,
    size: file.size,
    data,
    previewUrl: kind === 'image' ? URL.createObjectURL(file) : undefined,
  };
}

export async function filesToAttachments(
  files: FileList | File[],
  existingCount: number,
): Promise<ChatAttachment[]> {
  const list = Array.from(files);
  if (existingCount + list.length > MAX_ATTACHMENTS) {
    throw new Error(`You can attach up to ${MAX_ATTACHMENTS} files.`);
  }

  const results: ChatAttachment[] = [];
  for (const file of list) {
    results.push(await fileToAttachment(file));
  }
  return results;
}

export function revokeAttachmentPreview(attachment: ChatAttachment) {
  if (attachment.previewUrl) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
}

/** Stable data URL for displaying sent/stored image attachments. */
export function attachmentImageDataUrl(attachment: {
  mimeType: string;
  data: string;
}): string {
  return `data:${attachment.mimeType};base64,${attachment.data}`;
}

export function resolveAttachmentImageSrc(
  attachment: { mimeType: string; data: string; kind?: AttachmentKind },
  previewUrl?: string,
): string | undefined {
  if (attachment.kind && attachment.kind !== 'image') return undefined;
  if (!attachment.mimeType.startsWith('image/') || !attachment.data) return undefined;
  return previewUrl ?? attachmentImageDataUrl(attachment);
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] ?? '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
