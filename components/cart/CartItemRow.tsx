import { Minus, Plus, Trash2 } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/format';
import { getKaprukaProductUrl } from '@/lib/products';
import type { CartItem } from '@/lib/cart-storage';

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
  const itemUrl = getKaprukaProductUrl({
    productId: item.product_id,
    name: item.name,
    productUrl: item.productUrl,
  });

  return (
    <div className='flex gap-3 bg-white border border-[color:var(--color-border-default)] rounded-[16px] p-3 shadow-sm'>
      <a
        href={itemUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='relative w-[60px] h-[60px] rounded-[10px] overflow-hidden bg-[color:var(--color-bg-base)] border border-black/5 shrink-0'>
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes='60px'
          className='object-cover'
        />
      </a>
      <div className='flex-1 min-w-0 flex flex-col justify-between py-0.5'>
        <div>
          <a
            href={itemUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium text-[14px] text-[color:var(--color-primary)] hover:underline truncate block'>
            {item.name}
          </a>
          <p className='text-[13px] font-semibold text-[color:var(--color-text-primary)] mt-0.5 tabular-nums'>
            {formatPrice(item.price)}
          </p>
        </div>
        <div className='flex items-center justify-between mt-2'>
          <div
            className='flex items-center gap-3 bg-[color:var(--color-bg-base)] rounded-full px-2 py-1'
            role='group'
            aria-label={`Quantity for ${item.name}`}>
            <button
              type='button'
              onClick={() => onUpdateQuantity(item.product_id, -1)}
              aria-label={`Decrease quantity of ${item.name}`}
              className='text-[color:var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] rounded-full p-0.5'>
              <Minus className='w-3.5 h-3.5' aria-hidden='true' />
            </button>
            <span
              className='font-semibold text-[13px] w-4 text-center text-[color:var(--color-text-primary)] tabular-nums'
              aria-live='polite'>
              {item.quantity}
            </span>
            <button
              type='button'
              onClick={() => onUpdateQuantity(item.product_id, 1)}
              aria-label={`Increase quantity of ${item.name}`}
              className='text-[color:var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] rounded-full p-0.5'>
              <Plus className='w-3.5 h-3.5' aria-hidden='true' />
            </button>
          </div>
          <button
            type='button'
            onClick={() => onRemove(item.product_id)}
            aria-label={`Remove ${item.name} from basket`}
            className='text-[color:var(--color-text-tertiary)] hover:text-red-500 transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full'>
            <Trash2 className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>
      </div>
    </div>
  );
}
