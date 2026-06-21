import { CreditCard } from 'lucide-react';
import { RememberDeliveryChip } from '@/components/memory/RememberDeliveryChip';
import { formatPrice } from '@/lib/format';
import { getCartItemCount } from '@/lib/cart/totals';
import type { CartItem } from '@/lib/cart-storage';
import type { CheckoutFormData } from '@/types/widgets';

interface CheckoutFormCardProps {
  checkout: CheckoutFormData;
  cart: CartItem[];
}

export function CheckoutFormCard({ checkout, cart }: CheckoutFormCardProps) {
  return (
    <div className='bg-[color:var(--color-primary)] text-white rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-elevated)] w-full max-w-full sm:max-w-xs relative overflow-hidden min-w-0'>
      <h4 className='font-semibold text-[15px] flex items-center gap-2 mb-4'>
        <CreditCard className='w-4 h-4 opacity-80' /> Order Summary
      </h4>
      <div className='space-y-2 text-[14px] opacity-90 mb-5'>
        <div className='flex justify-between'>
          <span>Ref</span>
          <span className='font-mono'>{checkout.orderNumber}</span>
        </div>
        <div className='flex justify-between'>
          <span>Items</span>
          <span className='font-medium'>
            {checkout.itemsCount ?? getCartItemCount(cart)}
          </span>
        </div>
        <div className='flex justify-between font-semibold text-[16px] mt-2 pt-2 border-t border-white/20'>
          <span>Total</span>
          <span>{formatPrice(checkout.totalAmount)}</span>
        </div>
      </div>
      <a
        href={checkout.checkoutUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='w-full py-3 bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-hover)] text-[color:var(--color-accent-ink)] rounded-[var(--radius-md)] font-semibold text-[15px] flex items-center justify-center gap-2 transition-[background-color,transform] active:scale-[0.98]'>
        Secure Checkout
      </a>
      {checkout.delivery && (
        <RememberDeliveryChip
          orderNumber={checkout.orderNumber}
          delivery={checkout.delivery}
        />
      )}
    </div>
  );
}
