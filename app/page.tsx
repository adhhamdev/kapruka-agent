'use client';

import { CartPanel } from '@/components/cart/CartPanel';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { DiscoverSidebar } from '@/components/discover/DiscoverSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { DEFAULT_SPEECH_CODE } from '@/constants/languages';
import { useChat } from '@/hooks/use-chat';
import {
  addProductToCart,
  clearCart,
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
    startNewChat,
    loadMoreCarouselProducts,
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
      parts: [
        {
          type: 'text',
          text: `Added **${product.name}** to your basket.`,
        },
      ],
      metadata: { createdAt: Date.now() },
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => updateCartQuantity(prev, productId, delta));
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => removeFromCart(prev, productId));
  };

  const handleClearCart = () => {
    setCart(clearCart());
  };

  const handleCheckout = () => {
    setActiveTab('chat');
    sendMessage(
      'I want to checkout. Ask me for recipient, delivery, and sender details before creating the order.',
    );
  };

  const handleBrowseCategory = (categoryName: string) => {
    setActiveTab('chat');
    sendMessage(`Show me products in the ${categoryName} category.`);
  };

  const handleViewProductDetail = (product: KaprukaProduct) => {
    if (!product.productId) return;
    setActiveTab('chat');
    sendMessage(
      `Show full product details for ${product.name ?? 'this product'} (product_id: ${product.productId}).`,
    );
  };

  const handleDiscoverPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div
      className='flex flex-col h-[100dvh] bg-[color:var(--color-bg-base)] sans antialiased overflow-hidden'
      id='app-root'>
      <AppHeader />

      <div className='flex-1 flex flex-row overflow-hidden relative min-h-0 min-w-0'>
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
          onBrowseCategory={handleBrowseCategory}
          onViewProductDetail={handleViewProductDetail}
          onStartNewChat={startNewChat}
          onLoadMoreCarousel={loadMoreCarouselProducts}
        />

        <CartPanel
          isActive={activeTab === 'cart'}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
        />
      </div>

      <MobileTabBar
        activeTab={activeTab}
        cart={cart}
        onTabChange={setActiveTab}
      />

      <WelcomeModal />
    </div>
  );
}
