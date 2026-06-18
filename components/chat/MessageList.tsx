import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { Message } from '@/types/chat';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  isPending: boolean;
  cart: CartItem[];
  onAddToCart: (product: KaprukaProduct) => void;
}

export function MessageList({
  messages,
  isPending,
  cart,
  onAddToCart,
}: MessageListProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const isNewMessage = messages.length > prevLengthRef.current;
    prevLengthRef.current = messages.length;

    chatEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion || !isNewMessage ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [messages, isPending]);

  return (
    <div
      ref={containerRef}
      className='chat-messages flex-1 min-h-0 min-w-0 w-full overflow-y-auto overflow-x-clip overscroll-y-contain scrollbar-hide touch-manipulation'
      id='messages-container'
      role='log'
      aria-live='polite'
      aria-relevant='additions'>
      <div className='mx-auto w-full max-w-3xl min-w-0 px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-4 sm:space-y-6'>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            cart={cart}
            onAddToCart={onAddToCart}
          />
        ))}

        {isPending && <TypingIndicator />}
        <div ref={chatEndRef} className='h-2 shrink-0' aria-hidden='true' />
      </div>
    </div>
  );
}
