import { WELCOME_MESSAGE } from '@/constants/prompts';
import { createMessageId } from '@/lib/message-ids';
import type { KaprukaAgentUIMessage } from '@/types/agent-ui-message';
import type { Widget } from '@/types/widgets';

export const CHAT_HISTORY_STORAGE_KEY = 'kapruka_agent_chat_history';
export const MAX_PERSISTED_MESSAGES = 80;

interface LegacyStoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  widgets?: Widget[];
  attachments?: Array<{
    name: string;
    mimeType: string;
    kind: 'image' | 'file';
  }>;
  timestamp: string;
  isError?: boolean;
}

function createWelcomeMessage(): KaprukaAgentUIMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    parts: [{ type: 'text', text: WELCOME_MESSAGE }],
    metadata: { createdAt: 0 },
  };
}

function isLegacyFormat(parsed: unknown): parsed is LegacyStoredMessage[] {
  if (!Array.isArray(parsed) || parsed.length === 0) return false;
  const first = parsed[0] as Record<string, unknown>;
  return typeof first.content === 'string' && !Array.isArray(first.parts);
}

function legacyWidgetToToolPart(widget: Widget) {
  switch (widget.type) {
    case 'carousel':
      return {
        type: 'tool-show_products_carousel' as const,
        toolCallId: createMessageId('legacy-tool'),
        state: 'output-available' as const,
        input: { products: widget.data, pagination: widget.pagination },
        output: widget,
      };
    case 'detail':
      return {
        type: 'tool-show_product_detail' as const,
        toolCallId: createMessageId('legacy-tool'),
        state: 'output-available' as const,
        input: { product_id: widget.data.productId ?? '' },
        output: widget,
      };
    case 'delivery_quote':
      return {
        type: 'tool-show_delivery_quote' as const,
        toolCallId: createMessageId('legacy-tool'),
        state: 'output-available' as const,
        input: widget.data,
        output: widget,
      };
    case 'checkout_form':
      return {
        type: 'tool-show_checkout_form' as const,
        toolCallId: createMessageId('legacy-tool'),
        state: 'output-available' as const,
        input: widget.data,
        output: widget,
      };
    case 'order_status':
      return {
        type: 'tool-show_order_status' as const,
        toolCallId: createMessageId('legacy-tool'),
        state: 'output-available' as const,
        input: widget.data,
        output: widget,
      };
    case 'categories_list':
      return {
        type: 'tool-show_categories_list' as const,
        toolCallId: createMessageId('legacy-tool'),
        state: 'output-available' as const,
        input: {},
        output: widget,
      };
  }
}

function migrateLegacyMessages(stored: LegacyStoredMessage[]): KaprukaAgentUIMessage[] {
  return stored.map((message) => {
    const parts: KaprukaAgentUIMessage['parts'] = [];

    if (message.content.trim()) {
      parts.push({ type: 'text', text: message.content });
    }

    for (const attachment of message.attachments ?? []) {
      parts.push({
        type: 'file',
        mediaType: attachment.mimeType,
        url: '',
        filename: attachment.name,
      });
    }

    for (const widget of message.widgets ?? []) {
      parts.push(
        legacyWidgetToToolPart(widget) as KaprukaAgentUIMessage['parts'][number],
      );
    }

    if (parts.length === 0) {
      parts.push({ type: 'text', text: '(empty message)' });
    }

    return {
      id: message.id,
      role: message.role,
      parts,
      metadata: {
        createdAt: new Date(message.timestamp).getTime(),
        isError: message.isError,
      },
    };
  });
}

function stripFileBinary(message: KaprukaAgentUIMessage): KaprukaAgentUIMessage {
  return {
    ...message,
    parts: message.parts.map((part) => {
      if (part.type !== 'file') return part;
      return {
        ...part,
        url: part.url.startsWith('data:') ? '' : part.url,
      };
    }),
  };
}

function serializeMessages(messages: KaprukaAgentUIMessage[]): KaprukaAgentUIMessage[] {
  return messages
    .slice(-MAX_PERSISTED_MESSAGES)
    .map(stripFileBinary);
}

function ensureUniqueMessageIds(
  messages: KaprukaAgentUIMessage[],
): KaprukaAgentUIMessage[] {
  const seen = new Set<string>();
  return messages.map((message) => {
    if (!seen.has(message.id)) {
      seen.add(message.id);
      return message;
    }
    const id = createMessageId(message.role);
    seen.add(id);
    return { ...message, id };
  });
}

export function loadChatHistory(): KaprukaAgentUIMessage[] {
  if (typeof window === 'undefined') return getServerChatHistorySnapshot();

  try {
    const raw = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }

    if (isLegacyFormat(parsed)) {
      return ensureUniqueMessageIds(migrateLegacyMessages(parsed));
    }

    return ensureUniqueMessageIds(parsed as KaprukaAgentUIMessage[]);
  } catch {
    return [];
  }
}

/** Stable empty snapshot for SSR and pre-restore client renders. */
export function getServerChatHistorySnapshot(): KaprukaAgentUIMessage[] {
  return [];
}

export function saveChatHistory(messages: KaprukaAgentUIMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CHAT_HISTORY_STORAGE_KEY,
      JSON.stringify(serializeMessages(messages)),
    );
  } catch {
    /* quota exceeded — skip persist */
  }
}

export function clearChatHistoryStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
}

export { createWelcomeMessage };
