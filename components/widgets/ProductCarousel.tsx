'use client';

import { ChevronLeft, ChevronRight, ExternalLink, Info, Loader2, Plus } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatPrice } from '@/lib/format';
import {
  carouselCardTransition,
  carouselCardVariants,
} from '@/lib/motion/presets';
import { getKaprukaProductUrl, type KaprukaProduct } from '@/lib/products';
import { motion } from 'motion/react';
import { useRef, useState, useCallback, useEffect } from 'react';

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
    const step = card ? card.offsetWidth + 8 : el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  }, []);

  if (products.length === 0) return null;

  return (
    <div className='product-carousel w-full min-w-0 max-w-full overflow-hidden'>
      <div className='flex items-center justify-between gap-2 mb-2'>
        <p className='text-[11px] font-medium text-[color:var(--color-ink-3)] uppercase tracking-wide'>
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
        {canScrollRight && products.length > 2 && (
          <span
            className='text-[10px] text-[color:var(--color-ink-3)] inline-flex items-center gap-0.5 shrink-0 lg:hidden'
            aria-hidden='true'>
            Swipe
            <ChevronRight className='w-3 h-3' />
          </span>
        )}
        {products.length > 1 && (canScrollLeft || canScrollRight) ? (
          <div className='hidden lg:flex items-center gap-1 shrink-0'>
            <button
              type='button'
              onClick={() => scrollCarousel('left')}
              disabled={!canScrollLeft}
              aria-label='Scroll products left'
              className='w-7 h-7 rounded-full border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-2)] flex items-center justify-center hover:border-[color:var(--color-primary)]/40 hover:text-[color:var(--color-primary)] disabled:opacity-35 disabled:pointer-events-none transition-[border-color,color,opacity]'>
              <ChevronLeft className='w-4 h-4' aria-hidden='true' />
            </button>
            <button
              type='button'
              onClick={() => scrollCarousel('right')}
              disabled={!canScrollRight}
              aria-label='Scroll products right'
              className='w-7 h-7 rounded-full border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-2)] flex items-center justify-center hover:border-[color:var(--color-primary)]/40 hover:text-[color:var(--color-primary)] disabled:opacity-35 disabled:pointer-events-none transition-[border-color,color,opacity]'>
              <ChevronRight className='w-4 h-4' aria-hidden='true' />
            </button>
          </div>
        ) : null}
      </div>

      <div className='relative min-w-0 max-w-full overflow-hidden'>
        {canScrollLeft ? (
          <button
            type='button'
            onClick={() => scrollCarousel('left')}
            aria-label='Scroll products left'
            className='lg:hidden absolute left-0 top-1/2 -translate-y-1/2 z-[2] w-8 h-8 rounded-full border border-[color:var(--color-rule-strong)] bg-white/95 shadow-sm text-[color:var(--color-ink)] flex items-center justify-center hover:bg-white active:scale-95 transition-[transform,background-color]'>
            <ChevronLeft className='w-4 h-4' aria-hidden='true' />
          </button>
        ) : null}
        {canScrollRight ? (
          <button
            type='button'
            onClick={() => scrollCarousel('right')}
            aria-label='Scroll products right'
            className='lg:hidden absolute right-0 top-1/2 -translate-y-1/2 z-[2] w-8 h-8 rounded-full border border-[color:var(--color-rule-strong)] bg-white/95 shadow-sm text-[color:var(--color-ink)] flex items-center justify-center hover:bg-white active:scale-95 transition-[transform,background-color]'>
            <ChevronRight className='w-4 h-4' aria-hidden='true' />
          </button>
        ) : null}
        {canScrollRight && (
          <div
            className='product-carousel-fade-right pointer-events-none absolute inset-y-0 right-0 w-8 z-[1] sm:w-6'
            aria-hidden='true'
          />
        )}

        <div
          ref={scrollRef}
          className='product-carousel-track flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory gap-2 pb-0.5 scrollbar-hide touch-pan-x min-w-0 max-w-full'
          role='list'
          aria-label='Product suggestions'>
          {products.map((prod, prodIdx) => {
            const productUrl = getKaprukaProductUrl(prod);
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
                className='product-carousel-card group w-[calc((100%-0.5rem)/2)] sm:w-[132px] shrink-0 snap-start bg-white border border-[color:var(--color-border-default)] rounded-[14px] p-1.5 shadow-sm flex flex-col touch-manipulation min-w-0'>
                <div className='relative w-full aspect-square rounded-[10px] overflow-hidden bg-[color:var(--color-bg-base)] mb-1.5'>
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
                      sizes='(max-width: 640px) 42vw, 132px'
                      className='object-cover transition-transform duration-[var(--dur-medium)] ease-[var(--ease-out)] group-hover:scale-[1.03]'
                    />
                  </a>
                  {prod.inStock ? (
                    <button
                      type='button'
                      onClick={() => onAddToCart(prod)}
                      aria-label={`Add ${prod.name} to basket`}
                      className='absolute bottom-1 right-1 z-10 w-7 h-7 bg-[color:var(--color-accent)] text-[color:var(--color-accent-ink)] rounded-full flex items-center justify-center hover:bg-[color:var(--color-accent-hover)] transition-[background-color,transform] shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-1 touch-manipulation'>
                      <Plus className='w-3.5 h-3.5' aria-hidden='true' />
                    </button>
                  ) : (
                    <span className='absolute top-1 left-1 text-[9px] font-medium px-1 py-0.5 bg-white/95 text-red-600 rounded shadow-sm'>
                      Sold Out
                    </span>
                  )}
                </div>
                <div className='px-0.5 flex flex-col gap-0.5 flex-1 min-w-0'>
                  <a
                    href={productUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium text-[11px] text-[color:var(--color-primary)] hover:underline line-clamp-2 leading-tight inline-flex gap-0.5 items-start min-w-0'>
                    <span className='flex-1 min-w-0 [overflow-wrap:anywhere]'>
                      {prod.name}
                    </span>
                    <ExternalLink
                      className='w-2.5 h-2.5 shrink-0 mt-0.5 opacity-50'
                      aria-hidden='true'
                    />
                  </a>
                  <p className='font-semibold text-[11px] text-[color:var(--color-text-primary)] tabular-nums'>
                    {formatPrice(prod.price ?? 0)}
                  </p>
                  {prod.productId && onViewProductDetail ? (
                    <button
                      type='button'
                      onClick={() => onViewProductDetail(prod)}
                      className='mt-1 w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-[8px] border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] text-[10px] sm:text-[11px] font-medium text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/40 hover:bg-[color:var(--color-paper-3)] transition-[border-color,background-color,transform] active:scale-[0.98] touch-manipulation'>
                      <Info className='w-3 h-3 shrink-0' aria-hidden='true' />
                      Details
                    </button>
                  ) : null}
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
              void Promise.resolve(onLoadMore()).finally(() => setLoadingMore(false));
            }}
            className='inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/40 transition-[border-color,transform] active:scale-[0.98] disabled:opacity-60 touch-manipulation'>
            {loadingMore ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />
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
