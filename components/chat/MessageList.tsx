'use client';

import { ChevronDown } from 'lucide-react';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { Message } from '@/types/chat';
import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_BOTTOM_THRESHOLD = 80;

interface MessageListProps {
  messages: Message[];
  isPending: boolean;
  cart: CartItem[];
  onAddToCart: (product: KaprukaProduct) => void;
  onBrowseCategory?: (categoryName: string) => void;
  onViewProductDetail?: (product: KaprukaProduct) => void;
  onLoadMoreCarousel: (messageId: string, widgetIndex: number) => void;
}

export function MessageList({
  messages,
  isPending,
  cart,
  onAddToCart,
  onBrowseCategory,
  onViewProductDetail,
  onLoadMoreCarousel,
}: MessageListProps) {
  const reducedMotion = useReducedMotion();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);
  const isNearBottomRef = useRef(true);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const updateScrollHint = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD;
    isNearBottomRef.current = nearBottom;
    setShowScrollDown(!nearBottom);
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const el = containerRef.current;
      if (!el) return;

      const scroll = () => {
        el.scrollTo({ top: el.scrollHeight, behavior });
      };

      scroll();
      requestAnimationFrame(scroll);
    },
    [],
  );

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
      if (isNearBottomRef.current) {
        container.scrollTop = container.scrollHeight;
        updateScrollHint();
      }
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [updateScrollHint]);

  useEffect(() => {
    const isNewMessage = messages.length > prevLengthRef.current;
    const lastMessage = messages[messages.length - 1];
    const userJustSent = isNewMessage && lastMessage?.role === 'user';
    prevLengthRef.current = messages.length;

    if (userJustSent) {
      isNearBottomRef.current = true;
      setShowScrollDown(false);
    }

    if (userJustSent || isNearBottomRef.current) {
      const behavior: ScrollBehavior =
        reducedMotion || !isNewMessage ? 'auto' : 'smooth';
      scrollToBottom(behavior);
    }
  }, [messages, isPending, reducedMotion, scrollToBottom]);

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
          className='mx-auto w-full max-w-3xl min-w-0 px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-4 sm:space-y-6'>
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              cart={cart}
              isStreaming={
                isPending &&
                index === messages.length - 1 &&
                msg.role === 'assistant'
              }
              onAddToCart={onAddToCart}
              onBrowseCategory={onBrowseCategory}
              onViewProductDetail={onViewProductDetail}
              onLoadMoreCarousel={onLoadMoreCarousel}
            />
          ))}

          {isPending && <TypingIndicator />}
          <div ref={chatEndRef} className='h-2 shrink-0' aria-hidden='true' />
        </div>
      </div>

      <button
        type='button'
        onClick={() => scrollToBottom(reducedMotion ? 'auto' : 'smooth')}
        aria-label='Scroll to latest messages'
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[color:var(--color-primary)] shadow-[var(--shadow-md)] hover:bg-[color:var(--color-paper-3)] hover:border-[color:var(--color-primary)]/30 transition-[opacity,transform,background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] active:scale-95 touch-manipulation ${
          showScrollDown
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
        <ChevronDown className='w-5 h-5' strokeWidth={2.25} aria-hidden='true' />
      </button>
    </div>
  );
}
