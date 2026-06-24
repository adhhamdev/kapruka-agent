'use client';

import { ChevronDown } from 'lucide-react';
import { ChatHomeScreen } from '@/components/chat/ChatHomeScreen';
import { ChatSessionLoading } from '@/components/chat/ChatSessionLoading';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import {
  isChatHomeState,
  visibleConversationMessages,
} from '@/lib/chat/conversation-state';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { Message } from '@/types/chat';
import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_BOTTOM_THRESHOLD = 80;
const LATEST_MESSAGE_TOP_PADDING = 16;

interface MessageListProps {
  messages: Message[];
  isPending: boolean;
  isSessionRestored: boolean;
  cart: CartItem[];
  onAddToCart: (product: KaprukaProduct) => void;
  onBrowseCategory?: (categoryName: string) => void;
  onViewProductDetail?: (product: KaprukaProduct) => void;
  onLoadMoreCarousel: (messageId: string, widgetIndex: number) => void;
  onOpenBasket?: () => void;
  onSelectSuggestion: (prompt: string) => void;
}

export function MessageList({
  messages,
  isPending,
  isSessionRestored,
  cart,
  onAddToCart,
  onBrowseCategory,
  onViewProductDetail,
  onLoadMoreCarousel,
  onOpenBasket,
  onSelectSuggestion,
}: MessageListProps) {
  const reducedMotion = useReducedMotion();
  const showHome = isChatHomeState(messages);
  const visibleMessages = visibleConversationMessages(messages);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);
  const followLatestRef = useRef(true);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = containerRef.current;
    if (!el) return;

    const run = () => {
      el.scrollTo({ top: el.scrollHeight, behavior });
    };

    run();
    requestAnimationFrame(run);
  }, []);

  const scrollToLatestMessageStart = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const container = containerRef.current;
      const latest = latestMessageRef.current;
      if (!container || !latest) return;

      const run = () => {
        const containerRect = container.getBoundingClientRect();
        const latestRect = latest.getBoundingClientRect();
        const nextTop =
          container.scrollTop +
          (latestRect.top - containerRect.top) -
          LATEST_MESSAGE_TOP_PADDING;

        container.scrollTo({
          top: Math.max(0, nextTop),
          behavior,
        });
      };

      run();
      requestAnimationFrame(run);
    },
    [],
  );

  const updateScrollHint = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD;
    setShowScrollDown(!nearBottom);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollHint, { passive: true });
    updateScrollHint();
    return () => el.removeEventListener('scroll', updateScrollHint);
  }, [updateScrollHint]);

  useEffect(() => {
    const content = contentRef.current;
    const container = containerRef.current;
    if (!content || !container) return;

    const observer = new ResizeObserver(() => {
      if (followLatestRef.current) {
        scrollToLatestMessageStart('auto');
      }
      updateScrollHint();
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [scrollToLatestMessageStart, updateScrollHint]);

  useEffect(() => {
    const isNewMessage = visibleMessages.length > prevLengthRef.current;
    prevLengthRef.current = visibleMessages.length;

    if (isNewMessage) {
      followLatestRef.current = true;
      setShowScrollDown(false);
      const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
      scrollToLatestMessageStart(behavior);
    }
  }, [visibleMessages, reducedMotion, scrollToLatestMessageStart]);

  if (!isSessionRestored) {
    return <ChatSessionLoading />;
  }

  return (
    <div className='relative flex-1 min-h-0 min-w-0 flex flex-col'>
      <div
        ref={containerRef}
        className='chat-messages flex-1 min-h-0 min-w-0 w-full overflow-y-auto overflow-x-clip overscroll-y-contain scrollbar-hide touch-manipulation'
        id='messages-container'
        role='log'
        aria-live='polite'
        aria-relevant='additions'>
        <div
          ref={contentRef}
          className='w-full min-w-0 pt-4 md:pt-6 pb-[var(--chat-composer-inset)] space-y-4 sm:space-y-6'>
          {showHome && (
            <div className='chat-message-gutter'>
              <ChatHomeScreen
                onSelectSuggestion={onSelectSuggestion}
                disabled={isPending}
              />
            </div>
          )}

          {visibleMessages.map((msg, index) => (
            <div
              key={msg.id}
              ref={
                index === visibleMessages.length - 1 ? latestMessageRef : undefined
              }
              className='min-w-0'>
              <MessageBubble
                message={msg}
                cart={cart}
                isStreaming={
                  index === visibleMessages.length - 1 &&
                  msg.role === 'assistant' &&
                  (isPending ||
                    msg.parts.some(
                      (part) =>
                        part.type === 'text' &&
                        'state' in part &&
                        part.state === 'streaming',
                    ))
                }
                onAddToCart={onAddToCart}
                onBrowseCategory={onBrowseCategory}
                onViewProductDetail={onViewProductDetail}
                onLoadMoreCarousel={onLoadMoreCarousel}
                onOpenBasket={onOpenBasket}
              />
            </div>
          ))}

          {isPending && (
            <div className='chat-message-gutter'>
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>

      <button
        type='button'
        onClick={() => scrollToBottom(reducedMotion ? 'auto' : 'smooth')}
        aria-label='Scroll to bottom'
        className={`absolute bottom-[calc(var(--chat-composer-inset)+0.75rem)] left-1/2 -translate-x-1/2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper-2)] text-[color:var(--color-primary)] shadow-[var(--shadow-md)] hover:bg-[color:var(--color-paper-3)] hover:border-[color:var(--color-primary)]/30 transition-[opacity,transform,background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] active:scale-95 touch-manipulation ${
          showScrollDown
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
        <ChevronDown className='w-5 h-5' strokeWidth={2.25} aria-hidden='true' />
      </button>
    </div>
  );
}
