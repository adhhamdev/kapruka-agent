import { ExternalLink, Plus } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/format';
import { getKaprukaProductUrl, type KaprukaProduct } from '@/lib/products';

interface ProductCarouselProps {
  products: KaprukaProduct[];
  onAddToCart: (product: KaprukaProduct) => void;
}

export function ProductCarousel({ products, onAddToCart }: ProductCarouselProps) {
  return (
    <div className='w-full'>
      <div className='flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0'>
        {products.map((prod, prodIdx) => {
          const productUrl = getKaprukaProductUrl(prod);
          return (
            <article
              key={prodIdx}
              className='group w-[168px] shrink-0 bg-white border border-[color:var(--color-border-default)] rounded-[18px] p-2 snap-start shadow-sm flex flex-col'>
              <div className='relative w-full aspect-square rounded-[12px] overflow-hidden bg-[color:var(--color-bg-base)] mb-2.5'>
                <a
                  href={productUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block w-full h-full'
                  aria-label={`View ${prod.name} on Kapruka`}>
                  <ProductImage
                    src={prod.imageUrl}
                    alt={prod.name ?? 'Product'}
                    fill
                    sizes='168px'
                    className='object-cover transition-transform duration-[var(--dur-medium)] ease-[var(--ease-out)] group-hover:scale-[1.03]'
                  />
                </a>
                {prod.inStock ? (
                  <button
                    type='button'
                    onClick={() => onAddToCart(prod)}
                    aria-label={`Add ${prod.name} to basket`}
                    className='absolute bottom-2 right-2 z-10 w-8 h-8 bg-[color:var(--color-accent)] text-[color:var(--color-accent-ink)] rounded-full flex items-center justify-center hover:bg-[color:var(--color-accent-hover)] transition-[background-color,transform] shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2'>
                    <Plus className='w-4 h-4' aria-hidden='true' />
                  </button>
                ) : (
                  <span className='absolute top-2 left-2 text-[10px] font-medium px-2 py-1 bg-white/95 text-red-600 rounded-md shadow-sm'>
                    Sold Out
                  </span>
                )}
              </div>
              <div className='px-1 flex flex-col gap-1.5 flex-1'>
                <a
                  href={productUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-[13px] text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)] hover:underline line-clamp-2 leading-tight inline-flex gap-1 items-start'>
                  <span className='flex-1 min-w-0'>{prod.name}</span>
                  <ExternalLink className='w-3 h-3 shrink-0 mt-0.5 opacity-50' />
                </a>
                <p className='font-semibold text-[13px] text-[color:var(--color-text-primary)]'>
                  {formatPrice(prod.price ?? 0)}
                </p>
                <a
                  href={productUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-auto text-[11px] font-medium text-[color:var(--color-primary)] hover:underline inline-flex items-center gap-1'>
                  View on Kapruka
                  <ExternalLink className='w-3 h-3' />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
