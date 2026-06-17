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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  return (
    <div
      className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-[90px] scrollbar-hide'
      id='messages-container'>
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          cart={cart}
          onAddToCart={onAddToCart}
        />
      ))}

      {isPending && <TypingIndicator />}
      <div ref={chatEndRef} />
    </div>
  );
}
