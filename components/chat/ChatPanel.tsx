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
      <MessageList
        messages={messages}
        isPending={isPending}
        cart={cart}
        onAddToCart={onAddToCart}
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
