'use client';

import { ChatComposer } from '@/components/chat/ChatComposer';
import { MessageList } from '@/components/chat/MessageList';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { ChatAttachment } from '@/types/attachments';
import type { Message } from '@/types/chat';

interface ChatPanelProps {
  messages: Message[];
  isPending: boolean;
  isSessionRestored: boolean;
  inputText: string;
  cart: CartItem[];
  speechLanguageCode: string;
  onInputChange: (value: string) => void;
  onSendMessage: (text: string, attachments: ChatAttachment[]) => void;
  onAddToCart: (product: KaprukaProduct) => void;
  onBrowseCategory?: (categoryName: string) => void;
  onViewProductDetail?: (product: KaprukaProduct) => void;
  onLoadMoreCarousel: (messageId: string, widgetIndex: number) => void;
  onOpenBasket?: () => void;
}

export function ChatPanel({
  messages,
  isPending,
  isSessionRestored,
  inputText,
  cart,
  speechLanguageCode,
  onInputChange,
  onSendMessage,
  onAddToCart,
  onBrowseCategory,
  onViewProductDetail,
  onLoadMoreCarousel,
  onOpenBasket,
}: ChatPanelProps) {
  const handleSelectSuggestion = (prompt: string) => {
    onSendMessage(prompt, []);
  };

  return (
    <main
      className='bg-[color:var(--color-bg-surface)] min-w-0 min-h-0 h-full relative flex flex-1 w-full flex-col overflow-hidden'
      id='chat-surface'>
      <MessageList
        messages={messages}
        isPending={isPending}
        isSessionRestored={isSessionRestored}
        cart={cart}
        onAddToCart={onAddToCart}
        onBrowseCategory={onBrowseCategory}
        onViewProductDetail={onViewProductDetail}
        onLoadMoreCarousel={onLoadMoreCarousel}
        onOpenBasket={onOpenBasket}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <ChatComposer
        value={inputText}
        onChange={onInputChange}
        onSubmit={onSendMessage}
        isPending={isPending}
        disabled={!isSessionRestored}
        speechLanguageCode={speechLanguageCode}
      />
    </main>
  );
}
