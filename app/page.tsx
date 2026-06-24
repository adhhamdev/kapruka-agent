'use client';

import { useEffect, useState } from 'react';
import { CartPanel } from '@/components/cart/CartPanel';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { AppHeader } from '@/components/layout/AppHeader';
import { SavedInfoPanel } from '@/components/memory/SavedInfoPanel';
import { LanguageModal } from '@/components/onboarding/LanguageModal';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useChat } from '@/hooks/use-chat';
import { useLanguageModal } from '@/hooks/use-language-modal';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  addProductToCart,
  clearCart,
  removeFromCart,
  updateCartQuantity,
} from '@/lib/cart/mutations';
import { useCartStorage } from '@/lib/cart-storage';
import { createMessageId } from '@/lib/message-ids';
import { getLocaleOption } from '@/types/locale';
import type { KaprukaProduct } from '@/lib/products';

export default function Home() {
  const { cart, setCart } = useCartStorage();
  const { locale, messages, isReady, setLocale } = useLocale();
  const { open: languageModalOpen, complete: completeLanguageSelection } =
    useLanguageModal();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [cartOpen, setCartOpen] = useState(false);
  const [savedInfoOpen, setSavedInfoOpen] = useState(false);

  const {
    messages: chatMessages,
    inputText,
    setInputText,
    isPending,
    isSessionRestored,
    sendMessage,
    sendFromComposer,
    appendMessage,
    startNewChat,
    loadMoreCarouselProducts,
    live,
  } = useChat({
    cart,
    setCart,
    onOpenBasket: () => setCartOpen(true),
    onLocaleChange: (nextLocale) => setLocale(nextLocale),
    getPreferredLanguage: () => locale,
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
          text: messages.chat.addedToBasket(product.name ?? 'Product'),
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
    sendMessage(messages.chat.checkoutPrompt);
  };

  const handleBrowseCategory = (categoryName: string) => {
    sendMessage(messages.chat.browseCategoryPrompt(categoryName));
  };

  const handleViewProductDetail = (product: KaprukaProduct) => {
    if (!product.productId) return;
    sendMessage(
      messages.chat.productDetailPrompt(
        product.name ?? 'this product',
        product.productId,
      ),
    );
  };

  if (!isReady) {
    return (
      <div className='flex h-[100dvh] items-center justify-center bg-[color:var(--color-bg-base)]'>
        <div className='h-8 w-8 rounded-full border-2 border-[color:var(--color-primary)] border-t-transparent animate-spin' />
      </div>
    );
  }

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
          messages={chatMessages}
          isPending={isPending}
          isSessionRestored={isSessionRestored}
          inputText={inputText}
          cart={cart}
          speechLanguageCode={getLocaleOption(locale).speechCode}
          onInputChange={setInputText}
          onSendMessage={sendFromComposer}
          onAddToCart={handleAddToCart}
          onBrowseCategory={handleBrowseCategory}
          onViewProductDetail={handleViewProductDetail}
          onLoadMoreCarousel={loadMoreCarouselProducts}
          onOpenBasket={() => setCartOpen(true)}
          liveState={live.liveState}
          isLiveActive={live.isLiveActive}
          liveError={live.liveError}
          onStartLive={() => void live.startLive()}
          onStopLive={() => void live.stopLive()}
          onClearLiveError={live.clearLiveError}
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

      <LanguageModal
        open={languageModalOpen}
        onComplete={completeLanguageSelection}
      />
      <WelcomeModal localeReady={isReady && !languageModalOpen} />
      <SavedInfoPanel
        open={savedInfoOpen}
        onClose={() => setSavedInfoOpen(false)}
      />
    </div>
  );
}
