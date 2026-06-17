'use client';

import { CartPanel } from '@/components/cart/CartPanel';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { DiscoverSidebar } from '@/components/discover/DiscoverSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { DEFAULT_SPEECH_CODE } from '@/constants/languages';
import { useChat } from '@/hooks/use-chat';
import {
  addProductToCart,
  removeFromCart,
  updateCartQuantity,
} from '@/lib/cart/mutations';
import { useCartStorage } from '@/lib/cart-storage';
import { createMessageId } from '@/lib/message-ids';
import type { KaprukaProduct } from '@/lib/products';

export default function Home() {
  const { cart, setCart } = useCartStorage();
  const {
    messages,
    inputText,
    setInputText,
    isPending,
    activeTab,
    setActiveTab,
    sendMessage,
    sendFromComposer,
    appendMessage,
  } = useChat({ cart, setCart });

  const handleAddToCart = (product: KaprukaProduct) => {
    setCart((prev) =>
      addProductToCart(prev, {
        productId: product.productId,
        name: product.name ?? 'Product',
        price: product.price ?? 0,
        imageUrl: product.imageUrl,
        url: product.url,
        productUrl: product.productUrl,
      }),
    );

    appendMessage({
      id: createMessageId('local-add'),
      role: 'assistant',
      content: `🛒 Added **${product.name}** to your cart.`,
      timestamp: new Date(0),
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => updateCartQuantity(prev, productId, delta));
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => removeFromCart(prev, productId));
  };

  const handleCheckout = () => {
    setActiveTab('chat');
    sendMessage('Please check out my cart.');
  };

  const handleDiscoverPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div
      className='flex flex-col h-[100dvh] bg-[color:var(--color-bg-base)] sans antialiased overflow-hidden'
      id='app-root'>
      <AppHeader />

      <div className='flex-1 flex flex-row overflow-hidden relative'>
        <DiscoverSidebar
          isActive={activeTab === 'discover'}
          onSendMessage={handleDiscoverPrompt}
        />

        <ChatPanel
          isActive={activeTab === 'chat'}
          messages={messages}
          isPending={isPending}
          inputText={inputText}
          cart={cart}
          speechLanguageCode={DEFAULT_SPEECH_CODE}
          onInputChange={setInputText}
          onSendMessage={sendFromComposer}
          onAddToCart={handleAddToCart}
        />

        <CartPanel
          isActive={activeTab === 'cart'}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      </div>

      <MobileTabBar
        activeTab={activeTab}
        cart={cart}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
