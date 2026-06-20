'use client';

import { PanelLeftClose, Search, ShoppingBag } from 'lucide-react';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { MessageList } from '@/components/chat/MessageList';
import { getCartItemCount } from '@/lib/cart/totals';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { ChatAttachment } from '@/types/attachments';
import type { Message } from '@/types/chat';

interface ChatPanelProps {
  isActive: boolean;
  discoverOpen: boolean;
  cartOpen: boolean;
  messages: Message[];
  isPending: boolean;
  inputText: string;
  cart: CartItem[];
  speechLanguageCode: string;
  onInputChange: (value: string) => void;
  onSendMessage: (text: string, attachments: ChatAttachment[]) => void;
  onAddToCart: (product: KaprukaProduct) => void;
  onBrowseCategory?: (categoryName: string) => void;
  onViewProductDetail?: (product: KaprukaProduct) => void;
  onLoadMoreCarousel: (messageId: string, widgetIndex: number) => void;
  onToggleDiscover: () => void;
  onToggleCart: () => void;
}

const toolbarIconButtonClass =
  'relative overflow-visible items-center justify-center w-11 h-11 min-w-11 min-h-11 rounded-[var(--radius-md)] border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/40 hover:bg-[color:var(--color-paper-3)] transition-[border-color,color,background-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] touch-manipulation';

export function ChatPanel({
  isActive,
  discoverOpen,
  cartOpen,
  messages,
  isPending,
  inputText,
  cart,
  speechLanguageCode,
  onInputChange,
  onSendMessage,
  onAddToCart,
  onBrowseCategory,
  onViewProductDetail,
  onLoadMoreCarousel,
  onToggleDiscover,
  onToggleCart,
}: ChatPanelProps) {
  const cartCount = getCartItemCount(cart);

  return (
    <main
      className={`
        bg-[color:var(--color-bg-surface)] min-w-0 min-h-0 h-full relative
        ${isActive
          ? 'flex flex-1 w-full max-md:absolute max-md:inset-0 max-md:z-10 animate-fade-in flex-col'
          : 'hidden'}
        md:relative md:flex md:flex-1 md:flex-col md:animate-none
        pb-[calc(66px+env(safe-area-inset-bottom))] md:pb-0
      `}
      id='chat-surface'>
      <div className='hidden md:flex shrink-0 items-center justify-between gap-2 px-3 sm:px-4 md:px-6 py-2 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]/95'>
        <button
          type='button'
          onClick={onToggleDiscover}
          aria-label={discoverOpen ? 'Hide discover panel' : 'Show discover panel'}
          aria-expanded={discoverOpen}
          aria-controls='left-sidebar'
          className='inline-flex items-center justify-center w-9 h-9 min-w-9 min-h-9 rounded-[var(--radius-md)] border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-2)] hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/40 hover:bg-[color:var(--color-paper-3)] transition-[border-color,color,background-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] touch-manipulation'>
          {discoverOpen ? (
            <PanelLeftClose className='w-4 h-4' aria-hidden='true' />
          ) : (
            <Search className='w-4 h-4' aria-hidden='true' />
          )}
        </button>

        <button
          type='button'
          onClick={onToggleCart}
          aria-label={
            cartCount > 0
              ? cartOpen
                ? `Hide basket, ${cartCount} items`
                : `Show basket, ${cartCount} items`
              : cartOpen
                ? 'Hide basket'
                : 'Show basket'
          }
          aria-expanded={cartOpen}
          aria-controls='cart-sidebar'
          className={`${toolbarIconButtonClass} ml-auto inline-flex`}>
          <ShoppingBag className='w-5 h-5' aria-hidden='true' />
          {cartCount > 0 && (
            <span
              className='absolute top-0.5 right-0.5 translate-x-1/2 -translate-y-1/2 min-w-[20px] h-5 px-1 flex items-center justify-center text-[11px] font-bold leading-none tabular-nums bg-[color:var(--color-accent)] text-[color:var(--color-accent-ink)] border-2 border-[color:var(--color-paper-2)] rounded-full shadow-[var(--shadow-sm)]'
              aria-hidden='true'>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </div>

      <MessageList
        messages={messages}
        isPending={isPending}
        cart={cart}
        onAddToCart={onAddToCart}
        onBrowseCategory={onBrowseCategory}
        onViewProductDetail={onViewProductDetail}
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
