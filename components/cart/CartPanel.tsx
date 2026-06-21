'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartPanelLoading } from '@/components/cart/CartPanelLoading';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { calculateSubtotal, getCartItemCount } from '@/lib/cart/totals';
import type { CartItem } from '@/lib/cart-storage';
import { formatPrice } from '@/lib/format';
import {
  cartListVariants,
  drawerBackdropTransition,
  drawerPanelReducedVariants,
  drawerPanelTransition,
  drawerPanelVariants,
  EASE_OUT,
  listItemTransition,
} from '@/lib/motion/presets';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { PanelRightClose, ShoppingBag, X } from 'lucide-react';

interface CartPanelProps {
  isOpen: boolean;
  isSessionRestored: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

function CartPanelContent({
  cart,
  titleId,
  layoutGroupId,
  onClose,
  closeLabel,
  showMobileClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: {
  cart: CartItem[];
  titleId: string;
  layoutGroupId: string;
  onClose: () => void;
  closeLabel: string;
  showMobileClose: boolean;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const itemCount = getCartItemCount(cart);
  const total = calculateSubtotal(cart);

  return (
    <>
      <div className='shrink-0 flex items-center justify-between p-5 border-b border-[color:var(--color-border-subtle)]'>
        <h2
          id={titleId}
          className='text-[20px] font-semibold text-[color:var(--color-text-primary)] min-w-0 truncate'>
          Basket
        </h2>
        <div className='flex items-center gap-2 shrink-0'>
          <motion.span
            key={itemCount}
            initial={reducedMotion ? false : { scale: 0.88, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className='text-[12px] bg-[color:var(--color-bg-base)] text-[color:var(--color-text-secondary)] border border-[color:var(--color-border-default)] px-3 py-1 rounded-full font-medium tabular-nums whitespace-nowrap'>
            {itemCount} Items
          </motion.span>
          {showMobileClose ? (
            <button
              type='button'
              onClick={onClose}
              aria-label={closeLabel}
              className='inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-3)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] touch-manipulation'>
              <X className='w-4 h-4' aria-hidden='true' />
            </button>
          ) : (
            <button
              type='button'
              onClick={onClose}
              aria-label={closeLabel}
              className='inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-3)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] touch-manipulation'>
              <PanelRightClose className='w-4 h-4' aria-hidden='true' />
            </button>
          )}
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-5'>
        {cart.length === 0 ? (
          <div className='h-full min-h-[12rem] flex flex-col items-center justify-center text-[color:var(--color-text-tertiary)]'>
            <ShoppingBag className='w-12 h-12 mb-4 opacity-50 stroke-1' />
            <p className='font-medium text-[15px]'>Your basket is empty</p>
          </div>
        ) : (
          <LayoutGroup id={layoutGroupId}>
            <ul className='space-y-4 list-none m-0 p-0'>
              <AnimatePresence initial={false}>
                {cart.map((item, index) => (
                  <motion.li
                    key={item.product_id}
                    layout={!reducedMotion}
                    variants={cartListVariants}
                    initial={reducedMotion ? false : 'hidden'}
                    animate='visible'
                    exit={reducedMotion ? undefined : 'exit'}
                    transition={listItemTransition(index)}
                    className='min-w-0'>
                    <CartItemRow
                      item={item}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemoveItem}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </LayoutGroup>
        )}
      </div>

      <div className='shrink-0 p-5 bg-[color:var(--color-bg-base)] border-t border-[color:var(--color-border-subtle)] pb-[calc(env(safe-area-inset-bottom)+1.25rem)] md:pb-5'>
        <div className='flex justify-between items-center mb-4'>
          <span className='text-[15px] font-medium text-[color:var(--color-text-secondary)]'>
            Total
          </span>
          <motion.span
            key={total}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className='text-[20px] font-semibold text-[color:var(--color-text-primary)] tabular-nums'>
            {formatPrice(total)}
          </motion.span>
        </div>
        <div className='flex flex-col gap-2'>
          <button
            type='button'
            disabled={cart.length === 0}
            onClick={onCheckout}
            className='w-full py-3.5 bg-[color:var(--color-primary)] disabled:bg-[color:var(--color-rule)] disabled:text-[color:var(--color-ink-3)] text-white rounded-[var(--radius-md)] font-semibold text-[16px] transition-[background-color,transform] active:scale-[0.98] hover:bg-[color:var(--color-primary-hover)] touch-manipulation'>
            Checkout
          </button>
          {cart.length > 0 && (
            <button
              type='button'
              onClick={onClearCart}
              className='w-full py-2 text-[13px] font-medium text-[color:var(--color-ink-3)] hover:text-[color:var(--color-error)] transition-colors touch-manipulation'>
              Clear basket
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function CartMobileDrawer({
  isOpen,
  isSessionRestored,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  if (!mounted) {
    return null;
  }

  const panelVariants = reducedMotion
    ? drawerPanelReducedVariants
    : drawerPanelVariants;

  const drawer = (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            key='cart-drawer-backdrop'
            type='button'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={drawerBackdropTransition}
            className='fixed inset-0 z-40 bg-[color:var(--color-ink)]/40 md:hidden touch-manipulation'
            onClick={onClose}
            aria-label='Close basket'
          />

          <motion.aside
            key='cart-drawer-panel'
            ref={panelRef}
            id='cart-drawer'
            role='dialog'
            aria-modal='true'
            aria-labelledby={titleId}
            tabIndex={-1}
            initial='hidden'
            animate='visible'
            exit='exit'
            variants={panelVariants}
            transition={drawerPanelTransition}
            className='cart-drawer fixed inset-y-0 right-0 z-50 flex w-[min(100%,30rem)] flex-col bg-[color:var(--color-bg-surface)] border-l border-[color:var(--color-border-subtle)] shadow-[var(--shadow-elevated)] md:hidden touch-manipulation'>
            {!isSessionRestored ? (
              <CartPanelLoading />
            ) : (
              <CartPanelContent
                cart={cart}
                titleId={titleId}
                layoutGroupId='cart-items-drawer'
                onClose={onClose}
                closeLabel='Close basket'
                showMobileClose
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
                onClearCart={onClearCart}
                onCheckout={onCheckout}
              />
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );

  const root = document.getElementById('app-root') ?? document.body;
  return createPortal(drawer, root);
}

function CartDesktopSidebar({
  isOpen,
  isSessionRestored,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartPanelProps) {
  const titleId = useId();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!isDesktop) {
    return null;
  }

  const isLoading = !isSessionRestored;
  const sidebarVisible = isLoading || isOpen;

  return (
    <aside
      id='cart-sidebar'
      aria-label='Shopping basket'
      aria-busy={isLoading}
      aria-hidden={!sidebarVisible}
      className={`hidden md:flex flex-col h-full shrink-0 overflow-hidden bg-[color:var(--color-bg-surface)] border-l border-[color:var(--color-border-subtle)] transition-[width,border-color] duration-200 ease-out ${
        sidebarVisible ? 'w-96' : 'w-0 border-l-0 pointer-events-none'
      }`}>
      <div className='flex flex-col w-96 min-w-96 max-w-96 h-full min-h-0'>
        {isLoading ? (
          <CartPanelLoading />
        ) : (
          <CartPanelContent
            cart={cart}
            titleId={titleId}
            layoutGroupId='cart-items-sidebar'
            onClose={onClose}
            closeLabel='Close basket panel'
            showMobileClose={false}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onClearCart={onClearCart}
            onCheckout={onCheckout}
          />
        )}
      </div>
    </aside>
  );
}

export function CartPanel(props: CartPanelProps) {
  return (
    <>
      <CartMobileDrawer {...props} />
      <CartDesktopSidebar {...props} />
    </>
  );
}
