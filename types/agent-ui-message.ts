import type { InferUITools, UIMessage } from 'ai';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaTools } from '@/lib/tools/kapruka-tools';

export type KaprukaMessageMetadata = {
  createdAt?: number;
  cart?: CartItem[];
  isError?: boolean;
};

type KaprukaUITools = InferUITools<KaprukaTools>;

export type KaprukaAgentUIMessage = UIMessage<
  KaprukaMessageMetadata,
  Record<string, never>,
  KaprukaUITools
>;

export type ActiveTab = 'chat' | 'discover' | 'cart';

/** @deprecated Use KaprukaAgentUIMessage — kept for gradual migration references */
export type Message = KaprukaAgentUIMessage;

export type ChatRole = 'user' | 'assistant';

export interface ChatHistoryEntry {
  role: ChatRole;
  content: string;
  attachments?: import('@/types/attachments').ChatAttachmentPayload[];
}

export interface ChatRequest {
  messages: KaprukaAgentUIMessage[];
  cart: CartItem[];
}

export interface SendMessageOptions {
  text: string;
  attachments?: import('@/types/attachments').ChatAttachment[];
}
