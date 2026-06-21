'use client';

import { ProductImage } from '@/components/ui/ProductImage';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatPrice } from '@/lib/format';
import {
  carouselCardTransition,
  carouselCardVariants,
} from '@/lib/motion/presets';
import { getKaprukaProductUrl, type KaprukaProduct } from '@/lib/products';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ProductCarouselProps {
  products: KaprukaProduct[];
  hasMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  onAddToCart: (product: KaprukaProduct) => void;
  onViewProductDetail?: (product: KaprukaProduct) => void;
}

export function ProductCarousel({
  products,
  hasMore = false,
  onLoadMore,
  onAddToCart,
  onViewProductDetail,
}: ProductCarouselProps) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const updateScrollHint = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);

    const cards = el.querySelectorAll<HTMLElement>('[data-carousel-card]');
    if (cards.length === 0) return;
    const scrollCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(scrollCenter - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    updateScrollHint();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollHint, { passive: true });
    window.addEventListener('resize', updateScrollHint);
    return () => {
      el.removeEventListener('scroll', updateScrollHint);
      window.removeEventListener('resize', updateScrollHint);
    };
  }, [products, updateScrollHint]);

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-carousel-card]');
    const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  }, []);

  if (products.length === 0) return null;

  return (
    <div className='product-carousel w-full min-w-0 max-w-none overflow-hidden my-4'>
      <div className='flex items-center justify-between gap-2 mb-3 px-3 sm:px-4 md:px-6'>
        <p className='text-xs font-medium text-[color:var(--color-ink-3)] uppercase tracking-wide'>
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
        {canScrollRight && products.length > 2 && (
          <span
            className='text-xs text-[color:var(--color-ink-3)] inline-flex items-center gap-1 shrink-0 lg:hidden'
            aria-hidden='true'>
            Swipe
            <ChevronRight className='w-3.5 h-3.5' />
          </span>
        )}
        {products.length > 1 && (canScrollLeft || canScrollRight) ? (
          <div className='hidden lg:flex items-center gap-2 shrink-0 ml-auto'>
            <p
              className='inline-flex items-center gap-1 text-[11px] text-[color:var(--color-ink-3)] whitespace-nowrap'
              aria-hidden='true'>
              <kbd className='rounded border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] px-1 py-px font-mono text-[10px] font-medium text-[color:var(--color-ink-2)]'>
                Shift
              </kbd>
              <span>+ scroll</span>
            </p>
            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onClick={() => scrollCarousel('left')}
                disabled={!canScrollLeft}
                aria-label='Scroll products left'
                className='min-w-11 min-h-11 rounded-full border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-2)] flex items-center justify-center hover:border-[color:var(--color-primary)]/40 hover:text-[color:var(--color-primary)] disabled:opacity-35 disabled:pointer-events-none transition-[border-color,color,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] focus-visible:ring-offset-2 touch-manipulation'>
                <ChevronLeft className='w-5 h-5' aria-hidden='true' />
              </button>
              <button
                type='button'
                onClick={() => scrollCarousel('right')}
                disabled={!canScrollRight}
                aria-label='Scroll products right'
                className='min-w-11 min-h-11 rounded-full border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-2)] flex items-center justify-center hover:border-[color:var(--color-primary)]/40 hover:text-[color:var(--color-primary)] disabled:opacity-35 disabled:pointer-events-none transition-[border-color,color,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] focus-visible:ring-offset-2 touch-manipulation'>
                <ChevronRight className='w-5 h-5' aria-hidden='true' />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className='relative min-w-0 max-w-none w-full overflow-hidden'>
        {canScrollLeft ? (
          <button
            type='button'
            onClick={() => scrollCarousel('left')}
            aria-label='Scroll products left'
            className='lg:hidden absolute left-1 top-1/2 -translate-y-1/2 z-[2] min-w-11 min-h-11 rounded-full border border-[color:var(--color-rule-strong)] bg-white/95 shadow-sm text-[color:var(--color-ink)] flex items-center justify-center hover:bg-white active:scale-[0.98] transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] focus-visible:ring-offset-2 touch-manipulation'>
            <ChevronLeft className='w-5 h-5' aria-hidden='true' />
          </button>
        ) : null}
        {canScrollRight ? (
          <button
            type='button'
            onClick={() => scrollCarousel('right')}
            aria-label='Scroll products right'
            className='lg:hidden absolute right-1 top-1/2 -translate-y-1/2 z-[2] min-w-11 min-h-11 rounded-full border border-[color:var(--color-rule-strong)] bg-white/95 shadow-sm text-[color:var(--color-ink)] flex items-center justify-center hover:bg-white active:scale-[0.98] transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] focus-visible:ring-offset-2 touch-manipulation'>
            <ChevronRight className='w-5 h-5' aria-hidden='true' />
          </button>
        ) : null}
        {canScrollRight && (
          <div
            className='product-carousel-fade-right pointer-events-none absolute inset-y-0 right-0 w-10 z-[1] sm:w-8'
            aria-hidden='true'
          />
        )}

        <div
          ref={scrollRef}
          className='product-carousel-track flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory gap-3 pb-1 px-3 sm:px-4 md:px-6 scrollbar-hide touch-pan-x min-w-0 w-full max-w-none'
          role='list'
          aria-label='Product suggestions'>
          {products.map((prod, prodIdx) => {
            const productUrl = getKaprukaProductUrl(prod);
            const inStock = prod.inStock !== false;
            return (
              <motion.article
                key={prod.productId ?? prodIdx}
                data-carousel-card
                role='listitem'
                layout={false}
                initial={reducedMotion ? false : 'hidden'}
                animate='visible'
                variants={carouselCardVariants}
                transition={carouselCardTransition(prodIdx)}
                className='product-carousel-card group w-[min(100%,calc((100%-0.75rem)/2))] min-w-[9.25rem] sm:w-[10.5rem] lg:w-[11rem] shrink-0 snap-start bg-[color:var(--color-paper-2)] border border-[color:var(--color-border-default)] rounded-[var(--radius-md)] p-2 shadow-[0_4px_16px_-10px_oklch(18%_0.04_285/0.1)] flex flex-col gap-2 touch-manipulation'>
                <div className='relative w-full aspect-square rounded-[var(--radius-sm)] overflow-hidden bg-[color:var(--color-bg-base)]'>
                  <a
                    href={productUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] focus-visible:ring-offset-2 rounded-[var(--radius-sm)]'
                    aria-label={`View ${prod.name} on Kapruka`}>
                    <ProductImage
                      src={prod.imageUrl}
                      alt={prod.name ?? 'Product'}
                      fill
                      sizes='(max-width: 640px) 44vw, 176px'
                      className='object-cover transition-transform duration-[var(--dur-medium)] ease-[var(--ease-out)] group-hover:scale-[1.02]'
                    />
                  </a>
                  {!inStock ? (
                    <span className='absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 bg-[color:var(--color-paper-2)] text-[color:var(--color-error)] rounded-full border border-[color:var(--color-rule)]'>
                      Sold out
                    </span>
                  ) : null}
                </div>

                <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
                  <a
                    href={productUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium text-[13px] text-[color:var(--color-primary)] hover:underline line-clamp-2 leading-tight inline-flex gap-0.5 items-start min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] rounded-sm'>
                    <span className='flex-1 min-w-0 [overflow-wrap:anywhere]'>
                      {prod.name}
                    </span>
                    <ExternalLink
                      className='w-3 h-3 shrink-0 mt-0.5 opacity-50'
                      aria-hidden='true'
                    />
                  </a>
                  <p className='font-semibold text-sm text-[color:var(--color-text-primary)] tabular-nums'>
                    {formatPrice(prod.price ?? 0)}
                  </p>
                </div>

                <div className='mt-auto flex items-stretch gap-1.5'>
                  {prod.productId && onViewProductDetail ? (
                    <button
                      type='button'
                      onClick={() => onViewProductDetail(prod)}
                      aria-label={`View details for ${prod.name}`}
                      className='product-carousel-details group/details flex-1 min-h-11 min-w-0 inline-flex items-center justify-center gap-1 px-2.5 rounded-[var(--radius-pill)] border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary-light)] text-[13px] font-semibold leading-none text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/35 hover:bg-[color:var(--color-paper-3)] active:scale-[0.98] transition-[background-color,border-color,transform] duration-[var(--dur-short)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] focus-visible:ring-offset-2 touch-manipulation'>
                      <span className='truncate'>Details</span>
                      <ChevronRight
                        className='w-3.5 h-3.5 shrink-0 opacity-70 transition-transform duration-[var(--dur-short)] ease-[var(--ease-out)] group-hover/details:translate-x-0.5 group-active/details:translate-x-0.5 motion-reduce:transition-none motion-reduce:transform-none'
                        aria-hidden='true'
                      />
                    </button>
                  ) : null}
                  <button
                    type='button'
                    onClick={() => onAddToCart(prod)}
                    disabled={!inStock}
                    aria-label={
                      inStock
                        ? `Add ${prod.name} to basket`
                        : `${prod.name} is sold out`
                    }
                    className={`min-h-11 min-w-11 shrink-0 inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-ink)] font-semibold shadow-[inset_0_1px_0_oklch(100%_0_0/0.25)] hover:bg-[color:var(--color-accent-hover)] active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none transition-[background-color,transform,opacity] duration-[var(--dur-short)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 touch-manipulation ${
                      prod.productId && onViewProductDetail
                        ? 'px-0'
                        : 'flex-1 px-3 gap-1.5 text-xs'
                    }`}>
                    <Plus className='w-4 h-4 shrink-0' aria-hidden='true' />
                    {prod.productId && onViewProductDetail ? null : (
                      <span>{inStock ? 'Add to basket' : 'Unavailable'}</span>
                    )}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {hasMore && onLoadMore && (
        <div className='mt-2 flex justify-center'>
          <button
            type='button'
            disabled={loadingMore}
            onClick={() => {
              setLoadingMore(true);
              void Promise.resolve(onLoadMore()).finally(() =>
                setLoadingMore(false),
              );
            }}
            className='inline-flex items-center justify-center gap-1.5 min-h-11 rounded-[var(--radius-pill)] border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/40 transition-[border-color,transform] active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus)] focus-visible:ring-offset-2 touch-manipulation'>
            {loadingMore ? (
              <Loader2
                className='w-3.5 h-3.5 animate-spin'
                aria-hidden='true'
              />
            ) : null}
            Load more products
          </button>
        </div>
      )}

      {products.length > 2 && (
        <div
          className='flex justify-center gap-1 mt-2 sm:hidden'
          aria-hidden='true'>
          {products.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-[width,background-color] duration-[var(--dur-short)] ease-[var(--ease-out)] ${
                i === activeIndex
                  ? 'w-3 bg-[color:var(--color-primary)]'
                  : 'w-1 bg-[color:var(--color-rule-strong)]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
