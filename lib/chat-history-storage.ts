import { WELCOME_MESSAGE } from '@/constants/prompts';
import { createMessageId } from '@/lib/message-ids';
import type { Message } from '@/types/chat';

export const CHAT_HISTORY_STORAGE_KEY = 'kapruka_agent_chat_history';
export const MAX_PERSISTED_MESSAGES = 80;

interface StoredMessage {
  id: string;
  role: Message['role'];
  content: string;
  widgets?: Message['widgets'];
  attachments?: Array<{
    name: string;
    mimeType: string;
    kind: 'image' | 'file';
  }>;
  timestamp: string;
  isError?: boolean;
}

function createWelcomeMessage(): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    content: WELCOME_MESSAGE,
    timestamp: new Date(0),
  };
}

function serializeMessages(messages: Message[]): StoredMessage[] {
  return messages.slice(-MAX_PERSISTED_MESSAGES).map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    widgets: message.widgets,
    attachments: message.attachments?.map(({ name, mimeType, kind }) => ({
      name,
      mimeType,
      kind,
    })),
    timestamp: message.timestamp.toISOString(),
    isError: message.isError,
  }));
}

function deserializeMessages(stored: StoredMessage[]): Message[] {
  return stored.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    widgets: message.widgets,
    attachments: message.attachments?.map((attachment) => ({
      ...attachment,
      data: '',
    })),
    timestamp: new Date(message.timestamp),
    isError: message.isError,
  }));
}

function ensureUniqueMessageIds(messages: Message[]): Message[] {
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

export function loadChatHistory(): Message[] {
  if (typeof window === 'undefined') return [createWelcomeMessage()];

  try {
    const raw = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [createWelcomeMessage()];
    const parsed = JSON.parse(raw) as StoredMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createWelcomeMessage()];
    }
    return ensureUniqueMessageIds(deserializeMessages(parsed));
  } catch {
    return [createWelcomeMessage()];
  }
}

export function saveChatHistory(messages: Message[]) {
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
