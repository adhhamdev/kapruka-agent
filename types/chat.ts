import type { ChatAttachmentPayload } from '@/types/attachments';
import type { Widget } from '@/types/widgets';

export type ChatRole = 'user' | 'assistant';

export type ActiveTab = 'chat' | 'discover' | 'cart';

export interface Message {
  id: string;
  role: ChatRole;
  content: string;
  widgets?: Widget[];
  attachments?: ChatAttachmentPayload[];
  /** Client-only image preview URLs keyed by attachment name */
  attachmentPreviews?: Record<string, string>;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatHistoryEntry {
  role: ChatRole;
  content: string;
  attachments?: ChatAttachmentPayload[];
}

export interface ChatRequest {
  messages: ChatHistoryEntry[];
  cart: import('@/types/cart').CartItem[];
}

export interface ChatResponse {
  text: string;
  widgets?: Widget[];
  cart?: import('@/types/cart').CartItem[];
}

export interface SendMessageOptions {
  text: string;
  attachments?: import('@/types/attachments').ChatAttachment[];
  attachmentPreviews?: Record<string, string>;
}
