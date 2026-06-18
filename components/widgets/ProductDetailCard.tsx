import { ExternalLink } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/format';
import { getKaprukaProductUrl, type KaprukaProduct } from '@/lib/products';

interface ProductDetailCardProps {
  product: KaprukaProduct;
  onAddToCart: (product: KaprukaProduct) => void;
}

export function ProductDetailCard({
  product,
  onAddToCart,
}: ProductDetailCardProps) {
  const productUrl = getKaprukaProductUrl(product);

  return (
    <article className='bg-white border border-[color:var(--color-border-default)] rounded-[var(--radius-xl)] p-4 w-full max-w-full sm:max-w-sm shadow-sm min-w-0'>
      <div className='flex gap-3'>
        <a
          href={productUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='relative w-24 h-24 rounded-[var(--radius-md)] overflow-hidden bg-[color:var(--color-bg-base)] shrink-0'>
          <ProductImage
            src={product.imageUrl}
            alt={product.name ?? 'Product'}
            fill
            sizes='96px'
            className='object-cover'
          />
        </a>
        <div className='flex-1 min-w-0'>
          <a
            href={productUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold text-[15px] text-[color:var(--color-primary)] hover:underline line-clamp-2 leading-snug inline-flex gap-1 items-start'>
            <span>{product.name}</span>
            <ExternalLink className='w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50' />
          </a>
          <p className='font-semibold text-[15px] text-[color:var(--color-text-primary)] mt-1'>
            {formatPrice(product.price ?? 0)}
          </p>
          {product.description && (
            <p className='text-[13px] text-[color:var(--color-text-secondary)] mt-2 line-clamp-3'>
              {product.description}
            </p>
          )}
        </div>
      </div>
      <div className='mt-4 flex gap-2'>
        {product.inStock !== false && (
          <button
            type='button'
            onClick={() => onAddToCart(product)}
            className='flex-1 py-2.5 bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-hover)] text-white rounded-[var(--radius-md)] text-[14px] font-medium transition-[background-color,transform] active:scale-[0.98] touch-manipulation'>
            Add to Basket
          </button>
        )}
        <a
          href={productUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex-1 py-2.5 border border-[color:var(--color-rule-strong)] text-[color:var(--color-primary)] rounded-[var(--radius-md)] text-[14px] font-medium text-center hover:bg-[color:var(--color-paper-3)] transition-[background-color,transform] inline-flex items-center justify-center gap-1.5'>
          View Product
          <ExternalLink className='w-3.5 h-3.5' />
        </a>
      </div>
    </article>
  );
}
