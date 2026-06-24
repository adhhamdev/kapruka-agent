import { createMessageId } from '@/lib/message-ids';
import type { KaprukaAgentUIMessage } from '@/types/agent-ui-message';
import type { Widget } from '@/types/widgets';

const WIDGET_TOOL_TYPE_MAP: Record<Widget['type'], string> = {
  carousel: 'tool-show_products_carousel',
  detail: 'tool-show_product_detail',
  delivery_quote: 'tool-show_delivery_quote',
  checkout_form: 'tool-show_checkout_form',
  order_status: 'tool-show_order_status',
  categories_list: 'tool-show_categories_list',
};

export interface LiveUiEventPayload {
  toolCallId: string;
  toolName: string;
  widget: Widget;
}

/** Merge incremental Gemini Live transcription chunks with sensible word spacing. */
export function mergeTranscriptChunk(existing: string, chunk: string): string {
  if (!chunk) return existing;
  if (!existing) return chunk.trimStart();

  const prior = existing.trimEnd();

  // Cumulative transcript: the chunk already includes prior text.
  if (chunk.length >= prior.length && chunk.startsWith(prior)) {
    return chunk;
  }

  if (prior.endsWith(chunk)) {
    return existing;
  }

  const hasLeadingSpace = /^\s/.test(chunk);
  const next = hasLeadingSpace ? chunk : chunk.trimStart();
  if (!next) return existing;

  if (hasLeadingSpace || /\s$/.test(existing)) {
    return existing + next;
  }

  const first = next[0];

  // Punctuation or apostrophe continues the previous token (that's, don't, word,)
  if ("'’\"-/,?!;:)]}".includes(first)) {
    return prior + next;
  }

  if (/[(\[{]/.test(first)) {
    return `${prior} ${next}`;
  }

  return `${prior} ${next}`;
}

export function widgetToToolPart(
  event: LiveUiEventPayload,
): KaprukaAgentUIMessage['parts'][number] {
  const type =
    WIDGET_TOOL_TYPE_MAP[event.widget.type] ??
    `tool-${event.toolName}`;

  return {
    type: type as KaprukaAgentUIMessage['parts'][number]['type'],
    toolCallId: event.toolCallId,
    state: 'output-available',
    input: {},
    output: event.widget,
  } as KaprukaAgentUIMessage['parts'][number];
}

export function createLiveUserMessage(text: string): KaprukaAgentUIMessage {
  return {
    id: createMessageId('live-user'),
    role: 'user',
    parts: [{ type: 'text', text }],
    metadata: { createdAt: Date.now(), source: 'live' },
  };
}

export function createLiveAssistantMessage(
  liveSessionId: string,
): KaprukaAgentUIMessage {
  return {
    id: createMessageId('live-assistant'),
    role: 'assistant',
    parts: [],
    metadata: {
      createdAt: Date.now(),
      source: 'live',
      liveSessionId,
    },
  };
}

export function appendLiveTranscript(
  message: KaprukaAgentUIMessage,
  role: 'user' | 'assistant',
  text: string,
): KaprukaAgentUIMessage {
  if (!text) return message;

  const parts = [...message.parts];
  const lastTextIndex = parts.findLastIndex((part) => part.type === 'text');

  if (message.role === role && lastTextIndex >= 0) {
    const existing = parts[lastTextIndex];
    if (existing.type === 'text') {
      parts[lastTextIndex] = {
        ...existing,
        text: mergeTranscriptChunk(existing.text, text),
        ...(role === 'assistant' ? { state: 'streaming' as const } : {}),
      };
      return { ...message, parts };
    }
  }

  parts.push({
    type: 'text',
    text: text.trimStart(),
    ...(role === 'assistant' ? { state: 'streaming' as const } : {}),
  });
  return { ...message, parts };
}

export function clearLiveTextStreamingState(
  message: KaprukaAgentUIMessage,
): KaprukaAgentUIMessage {
  return {
    ...message,
    parts: message.parts.map((part) => {
      if (
        part.type === 'text' &&
        'state' in part &&
        part.state === 'streaming'
      ) {
        return { type: 'text', text: part.text };
      }
      return part;
    }),
  };
}

export function appendLiveWidget(
  message: KaprukaAgentUIMessage,
  event: LiveUiEventPayload,
): KaprukaAgentUIMessage {
  return {
    ...message,
    parts: [...message.parts, widgetToToolPart(event)],
  };
}

export function finalizeLiveAssistantMessage(
  message: KaprukaAgentUIMessage,
  metadata: KaprukaAgentUIMessage['metadata'],
): KaprukaAgentUIMessage {
  return {
    ...message,
    metadata: {
      ...message.metadata,
      ...metadata,
    },
  };
}

export function messagesToLiveHistorySummary(
  messages: KaprukaAgentUIMessage[],
  maxTurns: number,
): string {
  const relevant = messages
    .filter((message) => message.id !== 'welcome')
    .slice(-maxTurns * 2);

  const lines = relevant.map((message) => {
    const text = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => (part.type === 'text' ? part.text : ''))
      .reduce((acc, chunk) => mergeTranscriptChunk(acc, chunk), '')
      .trim();
    if (!text) return null;
    const role = message.role === 'user' ? 'Customer' : 'Agent';
    return `${role}: ${text}`;
  });

  return lines.filter(Boolean).join('\n');
}
