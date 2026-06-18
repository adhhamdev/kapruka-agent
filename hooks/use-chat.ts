'use client';

import { useChat as useAiChat } from '@ai-sdk/react';
import { DefaultChatTransport, type FileUIPart } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { attachmentImageDataUrl } from '@/lib/attachments';
import {
  clearChatHistoryStorage,
  createWelcomeMessage,
  loadChatHistory,
  saveChatHistory,
} from '@/lib/chat-history-storage';
import type { CartItem } from '@/lib/cart-storage';
import { ERROR_MESSAGES } from '@/lib/errors';
import { createMessageId } from '@/lib/message-ids';
import type { KaprukaProduct } from '@/lib/products';
import type { ChatAttachment } from '@/types/attachments';
import type {
  ActiveTab,
  KaprukaAgentUIMessage,
} from '@/types/agent-ui-message';
import type { CarouselPagination, Widget } from '@/types/widgets';

interface UseChatOptions {
  cart: CartItem[];
  setCart: (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
}

function toFileUIParts(attachments: ChatAttachment[]): FileUIPart[] {
  return attachments.map((attachment) => ({
    type: 'file',
    mediaType: attachment.mimeType,
    url: attachmentImageDataUrl(attachment),
    filename: attachment.name,
  }));
}

export function useChat({ cart, setCart }: UseChatOptions) {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const skipPersistRef = useRef(false);
  const cartRef = useRef(cart);
  cartRef.current = cart;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            cart: cartRef.current,
          },
        }),
      }),
    [],
  );

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
    clearError,
  } = useAiChat<KaprukaAgentUIMessage>({
    messages: loadChatHistory(),
    transport,
    onFinish: ({ message }) => {
      if (message.metadata?.cart) {
        setCart(message.metadata.cart);
      }
    },
    onError: () => {
      /* surfaced via error state below */
    },
  });

  const isPending = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (!error) return;
    clearError();
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId('error'),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: error.message || ERROR_MESSAGES.GENERIC,
          },
        ],
        metadata: { isError: true, createdAt: Date.now() },
      },
    ]);
  }, [error, clearError, setMessages]);

  const sendFromComposer = useCallback(
    (text: string, attachments: ChatAttachment[] = []) => {
      if ((!text.trim() && attachments.length === 0) || isPending) return;

      setActiveTab('chat');

      const displayText =
        text.trim() ||
        (attachments.length === 1
          ? `Sent ${attachments[0].name}`
          : attachments.length > 1
            ? `Sent ${attachments.length} attachments`
            : '');

      void sendMessage({
        text: displayText,
        files: attachments.length ? toFileUIParts(attachments) : undefined,
      });
      setInputText('');
    },
    [isPending, sendMessage],
  );

  const sendMessageText = useCallback(
    (textToSend: string) => {
      sendFromComposer(textToSend, []);
    },
    [sendFromComposer],
  );

  const appendMessage = useCallback(
    (message: KaprukaAgentUIMessage) => {
      setMessages((prev) => [...prev, message]);
    },
    [setMessages],
  );

  const startNewChat = useCallback(() => {
    skipPersistRef.current = true;
    clearChatHistoryStorage();
    setMessages([createWelcomeMessage()]);
    setInputText('');
    setActiveTab('chat');
  }, [setMessages]);

  const loadMoreCarouselProducts = useCallback(
    async (messageId: string, widgetIndex: number) => {
      const message = messages.find((entry) => entry.id === messageId);
      if (!message) return;

      const carouselParts = message.parts.filter(
        (part) => part.type === 'tool-show_products_carousel',
      );
      const part = carouselParts[widgetIndex];
      if (
        !part ||
        part.type !== 'tool-show_products_carousel' ||
        part.state !== 'output-available'
      ) {
        return;
      }

      const widget = part.output as Extract<Widget, { type: 'carousel' }>;
      const pagination = widget.pagination;
      if (!pagination?.nextCursor) return;

      const response = await fetch('/api/products/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: pagination.q,
          category: pagination.category,
          min_price: pagination.min_price,
          max_price: pagination.max_price,
          sort: pagination.sort,
          cursor: pagination.nextCursor,
          limit: 10,
        }),
      });

      if (!response.ok) return;

      const data = await response.json();
      const newProducts = (data.products ?? []) as KaprukaProduct[];
      const nextCursor = (data.nextCursor as string | null) ?? null;

      setMessages((prev) =>
        prev.map((entry) => {
          if (entry.id !== messageId) return entry;

          let carouselSeen = -1;
          const nextParts = entry.parts.map((item) => {
            if (item.type !== 'tool-show_products_carousel') return item;
            carouselSeen += 1;
            if (carouselSeen !== widgetIndex) return item;
            if (item.state !== 'output-available') return item;

            const currentWidget = item.output as Extract<
              Widget,
              { type: 'carousel' }
            >;
            const existingIds = new Set(
              currentWidget.data
                .map((product) => product.productId)
                .filter(Boolean),
            );
            const merged = [
              ...currentWidget.data,
              ...newProducts.filter(
                (product) =>
                  product.productId && !existingIds.has(product.productId),
              ),
            ];
            const updatedWidget: Widget = {
              type: 'carousel',
              data: merged,
              pagination: {
                ...pagination,
                nextCursor,
              } satisfies CarouselPagination,
            };
            return {
              ...item,
              output: updatedWidget,
            };
          });

          return { ...entry, parts: nextParts };
        }),
      );
    },
    [messages, setMessages],
  );

  return {
    messages,
    inputText,
    setInputText,
    isPending,
    activeTab,
    setActiveTab,
    sendMessage: sendMessageText,
    sendFromComposer,
    appendMessage,
    startNewChat,
    loadMoreCarouselProducts,
  };
}
