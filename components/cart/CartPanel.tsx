import { ShoppingBag } from 'lucide-react';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { calculateSubtotal, getCartItemCount } from '@/lib/cart/totals';
import { formatPrice } from '@/lib/format';
import type { CartItem } from '@/lib/cart-storage';

interface CartPanelProps {
  isActive: boolean;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartPanel({
  isActive,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartPanelProps) {
  return (
    <aside
      className={`
        ${isActive ? 'flex animate-fade-in' : 'hidden'} 
        lg:flex w-full lg:w-96 flex-col justify-between shrink-0 h-full overflow-y-auto 
        bg-[color:var(--color-bg-surface)] lg:border-l border-[color:var(--color-border-subtle)]
        pb-28 lg:pb-0
      `}>
      <div className='flex flex-col h-full'>
        <div className='flex items-center justify-between p-5 border-b border-[color:var(--color-border-subtle)]'>
          <h2 className='text-[20px] font-semibold text-[color:var(--color-text-primary)]'>
            Basket
          </h2>
          <span className='text-[12px] bg-[color:var(--color-bg-base)] text-[color:var(--color-text-secondary)] border border-[color:var(--color-border-default)] px-3 py-1 rounded-full font-medium'>
            {getCartItemCount(cart)} Items
          </span>
        </div>

        <div className='flex-1 overflow-y-auto p-5 space-y-4'>
          {cart.length === 0 ? (
            <div className='h-full flex flex-col items-center justify-center text-[color:var(--color-text-tertiary)]'>
              <ShoppingBag className='w-12 h-12 mb-4 opacity-50 stroke-1' />
              <p className='font-medium text-[15px]'>Your basket is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItemRow
                key={item.product_id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))
          )}
        </div>

        <div className='p-5 bg-[color:var(--color-bg-base)] border-t border-[color:var(--color-border-subtle)] pb-[calc(env(safe-area-inset-bottom)+20px)] lg:pb-5'>
          <div className='flex justify-between items-center mb-4'>
            <span className='text-[15px] font-medium text-[color:var(--color-text-secondary)]'>
              Total
            </span>
            <span className='text-[20px] font-semibold text-[color:var(--color-text-primary)]'>
              {formatPrice(calculateSubtotal(cart))}
            </span>
          </div>
          <button
            type='button'
            disabled={cart.length === 0}
            onClick={onCheckout}
            className='w-full py-3.5 bg-[color:var(--color-primary)] disabled:bg-[color:var(--color-rule)] disabled:text-[color:var(--color-ink-3)] text-white rounded-[var(--radius-md)] font-semibold text-[16px] transition-all active:scale-[0.98] hover:bg-[color:var(--color-primary-hover)]'>
            Checkout
          </button>
        </div>
      </div>
    </aside>
  );
}
