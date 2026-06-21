import type { InferUITools, UIMessage } from 'ai';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaTools } from '@/lib/tools/kapruka-tools';

export type KaprukaMessageMetadata = {
  createdAt?: number;
  cart?: CartItem[];
  isError?: boolean;
  /** Local or agent signal to show a View basket affordance on this message. */
  basketAdded?: boolean;
  /** Server signal to open the basket panel after this assistant turn. */
  openBasket?: boolean;
};

type KaprukaUITools = InferUITools<KaprukaTools>;

export type KaprukaAgentUIMessage = UIMessage<
  KaprukaMessageMetadata,
  Record<string, never>,
  KaprukaUITools
>;

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
