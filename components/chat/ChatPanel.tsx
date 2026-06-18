'use client';

import { Pencil } from 'lucide-react';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { MessageList } from '@/components/chat/MessageList';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { ChatAttachment } from '@/types/attachments';
import type { Message } from '@/types/chat';

interface ChatPanelProps {
  isActive: boolean;
  messages: Message[];
  isPending: boolean;
  inputText: string;
  cart: CartItem[];
  speechLanguageCode: string;
  onInputChange: (value: string) => void;
  onSendMessage: (text: string, attachments: ChatAttachment[]) => void;
  onAddToCart: (product: KaprukaProduct) => void;
  onStartNewChat: () => void;
  onLoadMoreCarousel: (messageId: string, widgetIndex: number) => void;
}

export function ChatPanel({
  isActive,
  messages,
  isPending,
  inputText,
  cart,
  speechLanguageCode,
  onInputChange,
  onSendMessage,
  onAddToCart,
  onStartNewChat,
  onLoadMoreCarousel,
}: ChatPanelProps) {
  return (
    <main
      className={`
        ${isActive ? 'flex animate-fade-in' : 'hidden'}
        lg:flex flex-1 flex-col min-w-0 min-h-0 h-full relative
        bg-[color:var(--color-bg-surface)]
        pb-[calc(66px+env(safe-area-inset-bottom))]
      `}
      id='chat-surface'>
      <div className='shrink-0 flex items-center justify-end px-3 sm:px-4 md:px-6 py-2 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]/95'>
        <button
          type='button'
          onClick={onStartNewChat}
          disabled={isPending}
          aria-label='New chat'
          className='inline-flex items-center justify-center w-9 h-9 min-w-9 min-h-9 rounded-[var(--radius-md)] border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/40 hover:bg-[color:var(--color-paper-3)] transition-[border-color,color,background-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] disabled:opacity-50 touch-manipulation'>
          <Pencil className='w-4 h-4' aria-hidden='true' />
        </button>
      </div>

      <MessageList
        messages={messages}
        isPending={isPending}
        cart={cart}
        onAddToCart={onAddToCart}
        onLoadMoreCarousel={onLoadMoreCarousel}
      />
      <ChatComposer
        value={inputText}
        onChange={onInputChange}
        onSubmit={onSendMessage}
        isPending={isPending}
        speechLanguageCode={speechLanguageCode}
      />
    </main>
  );
}
