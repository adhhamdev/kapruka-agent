'use client';

import { PanelRightClose, ShoppingBag } from 'lucide-react';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { calculateSubtotal, getCartItemCount } from '@/lib/cart/totals';
import { formatPrice } from '@/lib/format';
import {
  cartListVariants,
  DUR_MEDIUM_S,
  EASE_OUT,
  listItemTransition,
} from '@/lib/motion/presets';
import type { CartItem } from '@/lib/cart-storage';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';

interface CartPanelProps {
  isActive: boolean;
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartPanel({
  isActive,
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartPanelProps) {
  const reducedMotion = useReducedMotion();
  const itemCount = getCartItemCount(cart);
  const total = calculateSubtotal(cart);

  return (
    <aside
      id='cart-sidebar'
      aria-label='Shopping basket'
      aria-hidden={!isActive && !isOpen}
      className={`
        bg-[color:var(--color-bg-surface)] h-full min-h-0 min-w-0 overflow-hidden
        ${isActive
          ? 'flex flex-1 w-full max-md:absolute max-md:inset-0 max-md:z-10 animate-fade-in'
          : 'hidden'}
        md:relative md:flex md:shrink-0 md:animate-none md:transition-[width,border-color] md:duration-200 md:ease-out md:border-l border-[color:var(--color-border-subtle)]
        ${isOpen ? 'md:w-96' : 'md:w-0 md:border-l-0 md:pointer-events-none'}
      `}>
      <div className='flex flex-col w-full h-full min-h-0 min-w-0 md:w-96 md:min-w-96 md:max-w-96'>
        <div className='shrink-0 flex items-center justify-between p-5 border-b border-[color:var(--color-border-subtle)]'>
          <h2 className='text-[20px] font-semibold text-[color:var(--color-text-primary)]'>
            Basket
          </h2>
          <div className='flex items-center gap-2'>
            <motion.span
              key={itemCount}
              initial={reducedMotion ? false : { scale: 0.88, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className='text-[12px] bg-[color:var(--color-bg-base)] text-[color:var(--color-text-secondary)] border border-[color:var(--color-border-default)] px-3 py-1 rounded-full font-medium tabular-nums'>
              {itemCount} Items
            </motion.span>
            <button
              type='button'
              onClick={onClose}
              aria-label='Close basket panel'
              className='hidden md:inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-3)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] touch-manipulation'>
              <PanelRightClose className='w-4 h-4' aria-hidden='true' />
            </button>
          </div>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-5'>
          <LayoutGroup id='cart-items'>
            <AnimatePresence mode='popLayout' initial={false}>
              {cart.length === 0 ? (
                <motion.div
                  key='cart-empty'
                  layout
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reducedMotion
                      ? undefined
                      : { opacity: 0, y: -6, transition: { duration: 0.15 } }
                  }
                  transition={{ duration: DUR_MEDIUM_S, ease: EASE_OUT }}
                  className='h-full min-h-[12rem] flex flex-col items-center justify-center text-[color:var(--color-text-tertiary)]'>
                  <ShoppingBag className='w-12 h-12 mb-4 opacity-50 stroke-1' />
                  <p className='font-medium text-[15px]'>Your basket is empty</p>
                </motion.div>
              ) : (
                <motion.div
                  key='cart-list'
                  layout
                  className='space-y-4'
                  initial={false}>
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.product_id}
                      layout={!reducedMotion}
                      layoutId={item.product_id}
                      variants={cartListVariants}
                      initial={reducedMotion ? false : 'hidden'}
                      animate='visible'
                      exit={reducedMotion ? undefined : 'exit'}
                      transition={listItemTransition(index)}>
                      <CartItemRow
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemoveItem}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>

        <div className='shrink-0 p-5 bg-[color:var(--color-bg-base)] border-t border-[color:var(--color-border-subtle)] pb-[calc(60px+env(safe-area-inset-bottom)+1rem)] md:pb-5'>
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
      </div>
    </aside>
  );
}
