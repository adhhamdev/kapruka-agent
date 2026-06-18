/** Default BCP-47 tag for Web Speech API (voice input). */
export const DEFAULT_SPEECH_CODE = 'en-US';

/** Shown when the model returns widgets but no text (carousel-only responses). */
export const WIDGET_ONLY_FALLBACK = 'Here is what I found for you.';

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_TOTAL_ATTACHMENT_BYTES = 12 * 1024 * 1024;

/** Strict allowlist — images and documents only. */
export const ACCEPTED_ATTACHMENT_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ACCEPTED_ATTACHMENT_TYPES = ACCEPTED_ATTACHMENT_MIMES.join(',');

export const ATTACHMENT_HINT =
  'Up to 5 files · images or PDF/Word/txt · 5 MB each';
