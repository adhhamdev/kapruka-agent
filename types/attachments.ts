export type AttachmentKind = 'image' | 'file';

/** Client-side attachment with optional preview URL. */
export interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  kind: AttachmentKind;
  size: number;
  /** Base64 payload (no data: prefix) for API. */
  data: string;
  /** Blob URL for image preview — client only. */
  previewUrl?: string;
}

/** Attachment payload sent to the API. */
export interface ChatAttachmentPayload {
  name: string;
  mimeType: string;
  kind: AttachmentKind;
  data: string;
}
