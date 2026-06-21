'use client';

import { useEffect, useState } from 'react';
import { CartPanel } from '@/components/cart/CartPanel';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { AppHeader } from '@/components/layout/AppHeader';
import { SavedInfoPanel } from '@/components/memory/SavedInfoPanel';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { DEFAULT_SPEECH_CODE } from '@/constants/languages';
import { useChat } from '@/hooks/use-chat';
import { useMediaQuery } from '@/hooks/use-media-query';
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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [cartOpen, setCartOpen] = useState(false);
  const [savedInfoOpen, setSavedInfoOpen] = useState(false);

  const {
    messages,
    inputText,
    setInputText,
    isPending,
    isSessionRestored,
    sendMessage,
    sendFromComposer,
    appendMessage,
    startNewChat,
    loadMoreCarouselProducts,
  } = useChat({
    cart,
    setCart,
    onOpenBasket: () => setCartOpen(true),
  });

  useEffect(() => {
    if (!isSessionRestored) return;
    setCartOpen(isDesktop);
  }, [isDesktop, isSessionRestored]);

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
      metadata: { createdAt: Date.now(), basketAdded: true },
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
    setCartOpen(false);
    sendMessage(
      'I want to checkout. Ask me for recipient, delivery, and sender details before creating the order.',
    );
  };

  const handleBrowseCategory = (categoryName: string) => {
    sendMessage(`Show me products in the ${categoryName} category.`);
  };

  const handleViewProductDetail = (product: KaprukaProduct) => {
    if (!product.productId) return;
    sendMessage(
      `Show full product details for ${product.name ?? 'this product'} (product_id: ${product.productId}).`,
    );
  };

  return (
    <div
      className='flex flex-col h-[100dvh] bg-[color:var(--color-bg-base)] sans antialiased overflow-hidden'
      id='app-root'>
      <AppHeader
        cart={cart}
        cartOpen={cartOpen}
        isChatPending={isPending}
        onStartNewChat={startNewChat}
        onToggleCart={() => setCartOpen((open) => !open)}
        onOpenSavedInfo={() => setSavedInfoOpen(true)}
      />

      <div className='flex-1 flex flex-row overflow-hidden relative min-h-0 min-w-0'>
        <ChatPanel
          messages={messages}
          isPending={isPending}
          isSessionRestored={isSessionRestored}
          inputText={inputText}
          cart={cart}
          speechLanguageCode={DEFAULT_SPEECH_CODE}
          onInputChange={setInputText}
          onSendMessage={sendFromComposer}
          onAddToCart={handleAddToCart}
          onBrowseCategory={handleBrowseCategory}
          onViewProductDetail={handleViewProductDetail}
        onLoadMoreCarousel={loadMoreCarouselProducts}
        onOpenBasket={() => setCartOpen(true)}
      />

        <CartPanel
          isOpen={cartOpen}
          isSessionRestored={isSessionRestored}
          onClose={() => setCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
        />
      </div>

      <WelcomeModal />
      <SavedInfoPanel
        open={savedInfoOpen}
        onClose={() => setSavedInfoOpen(false)}
      />
    </div>
  );
}
