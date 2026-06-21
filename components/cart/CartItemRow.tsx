'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatPrice } from '@/lib/format';
import { EASE_OUT } from '@/lib/motion/presets';
import { getKaprukaProductUrl } from '@/lib/products';
import type { CartItem } from '@/lib/cart-storage';
import { motion } from 'motion/react';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const reducedMotion = useReducedMotion();
  const itemUrl = getKaprukaProductUrl({
    productId: item.product_id,
    name: item.name,
    productUrl: item.productUrl,
  });

  return (
    <div className='flex gap-3.5 bg-[color:var(--color-paper-2)] border border-[color:var(--color-border-default)] rounded-[var(--radius-lg)] p-3.5 shadow-[0_8px_24px_-12px_oklch(18%_0.04_285/0.1)]'>
      <a
        href={itemUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='relative w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] rounded-[var(--radius-md)] overflow-hidden bg-[color:var(--color-bg-base)] border border-[color:var(--color-rule)] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] focus-visible:ring-offset-2'>
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes='(max-width: 640px) 80px, 88px'
          className='object-cover'
        />
      </a>
      <div className='flex-1 min-w-0 flex flex-col justify-between gap-3'>
        <div className='space-y-1'>
          <a
            href={itemUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium text-sm sm:text-[15px] text-[color:var(--color-primary)] hover:underline line-clamp-2 leading-snug block [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] rounded-sm'>
            {item.name}
          </a>
          <p className='text-base font-semibold text-[color:var(--color-text-primary)] tabular-nums tracking-tight'>
            {formatPrice(item.price)}
          </p>
        </div>
        <div className='flex items-center justify-between gap-2'>
          <div
            className='inline-flex items-center gap-1 bg-[color:var(--color-bg-base)] rounded-full border border-[color:var(--color-rule)] p-1'
            role='group'
            aria-label={`Quantity for ${item.name}`}>
            <button
              type='button'
              onClick={() => onUpdateQuantity(item.product_id, -1)}
              aria-label={`Decrease quantity of ${item.name}`}
              className='min-w-11 min-h-11 inline-flex items-center justify-center rounded-full text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-paper-3)] hover:text-[color:var(--color-text-primary)] transition-[background-color,color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] touch-manipulation'>
              <Minus className='w-4 h-4' aria-hidden='true' />
            </button>
            <motion.span
              key={item.quantity}
              initial={reducedMotion ? false : { scale: 0.75, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.16, ease: EASE_OUT }}
              className='font-semibold text-sm min-w-[1.75rem] text-center text-[color:var(--color-text-primary)] tabular-nums px-1'
              aria-live='polite'>
              {item.quantity}
            </motion.span>
            <button
              type='button'
              onClick={() => onUpdateQuantity(item.product_id, 1)}
              aria-label={`Increase quantity of ${item.name}`}
              className='min-w-11 min-h-11 inline-flex items-center justify-center rounded-full text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-paper-3)] hover:text-[color:var(--color-text-primary)] transition-[background-color,color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] touch-manipulation'>
              <Plus className='w-4 h-4' aria-hidden='true' />
            </button>
          </div>
          <button
            type='button'
            onClick={() => onRemove(item.product_id)}
            aria-label={`Remove ${item.name} from basket`}
            className='min-w-11 min-h-11 inline-flex items-center justify-center text-[color:var(--color-text-tertiary)] hover:text-[color:var(--color-error)] hover:bg-[color:var(--color-error-bg)] rounded-full transition-[color,background-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-error)] touch-manipulation'>
            <Trash2 className='w-[1.125rem] h-[1.125rem]' aria-hidden='true' />
          </button>
        </div>
      </div>
    </div>
  );
}
