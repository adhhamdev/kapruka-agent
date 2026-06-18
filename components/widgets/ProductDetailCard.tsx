'use client';

import { ChevronLeft, ChevronRight, ExternalLink, Star, Truck } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/format';
import {
  formatAttributeLabel,
  formatStockLabel,
  getKaprukaProductUrl,
  type KaprukaProduct,
  type KaprukaProductDetail,
} from '@/lib/products';

interface ProductDetailCardProps {
  product: KaprukaProductDetail;
  onAddToCart: (product: KaprukaProduct) => void;
}

export function ProductDetailCard({
  product,
  onAddToCart,
}: ProductDetailCardProps) {
  const images = useMemo(
    () =>
      product.images?.length
        ? product.images
        : product.imageUrl
          ? [product.imageUrl]
          : [],
    [product.imageUrl, product.images],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const productUrl = getKaprukaProductUrl(product);
  const stockLabel = formatStockLabel(product);
  const displayDescription = product.description ?? product.summary;

  const attributeEntries = Object.entries(product.attributes ?? {}).filter(
    ([, value]) => value?.trim(),
  );

  const showPrev = images.length > 1 && imageIndex > 0;
  const showNext = images.length > 1 && imageIndex < images.length - 1;

  return (
    <article className='bg-white border border-[color:var(--color-border-default)] rounded-[var(--radius-xl)] p-4 w-full max-w-full sm:max-w-md shadow-sm min-w-0'>
      {images.length > 0 ? (
        <div className='relative mb-3'>
          <div className='relative w-full aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden bg-[color:var(--color-bg-base)]'>
            <ProductImage
              src={images[imageIndex]}
              alt={product.name ?? 'Product'}
              fill
              sizes='(max-width: 640px) 100vw, 400px'
              className='object-cover'
            />
          </div>
          {showPrev ? (
            <GalleryButton
              direction='prev'
              onClick={() => setImageIndex((index) => index - 1)}
              label='Previous image'
            />
          ) : null}
          {showNext ? (
            <GalleryButton
              direction='next'
              onClick={() => setImageIndex((index) => index + 1)}
              label='Next image'
            />
          ) : null}
          {images.length > 1 ? (
            <p className='absolute bottom-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/55 text-white'>
              {imageIndex + 1} / {images.length}
            </p>
          ) : null}
        </div>
      ) : null}

      {images.length > 1 ? (
        <div className='flex gap-2 overflow-x-auto pb-3 scrollbar-hide'>
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type='button'
              onClick={() => setImageIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === imageIndex ? 'true' : undefined}
              className={`relative w-14 h-14 shrink-0 rounded-[10px] overflow-hidden border-2 transition-[border-color] ${
                index === imageIndex
                  ? 'border-[color:var(--color-primary)]'
                  : 'border-transparent opacity-80 hover:opacity-100'
              }`}>
              <ProductImage
                src={image}
                alt=''
                fill
                sizes='56px'
                className='object-cover'
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className='space-y-2'>
        <div className='flex flex-wrap items-start gap-2'>
          {product.category?.name ? (
            <span className='text-[11px] font-medium uppercase tracking-wide text-[color:var(--color-ink-3)] bg-[color:var(--color-paper-2)] px-2 py-0.5 rounded-full'>
              {product.category.name}
            </span>
          ) : null}
          {stockLabel ? (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                product.inStock === false
                  ? 'bg-red-50 text-red-700'
                  : product.stockLevel === 'low'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-emerald-50 text-emerald-800'
              }`}>
              {stockLabel}
            </span>
          ) : null}
        </div>

        <a
          href={productUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='font-semibold text-[16px] text-[color:var(--color-primary)] hover:underline leading-snug inline-flex gap-1.5 items-start'>
          <span>{product.name}</span>
          <ExternalLink className='w-4 h-4 shrink-0 mt-0.5 opacity-50' />
        </a>

        {product.productId ? (
          <p className='text-[11px] font-mono text-[color:var(--color-ink-3)]'>
            {product.productId}
          </p>
        ) : null}

        <div className='flex flex-wrap items-baseline gap-2'>
          <p className='font-semibold text-[18px] text-[color:var(--color-text-primary)]'>
            {formatPrice(product.price ?? 0)}
          </p>
          {product.compareAtPrice && product.compareAtPrice > (product.price ?? 0) ? (
            <p className='text-[14px] text-[color:var(--color-ink-3)] line-through'>
              {formatPrice(product.compareAtPrice)}
            </p>
          ) : null}
          {product.rating != null && product.rating > 0 ? (
            <span className='inline-flex items-center gap-1 text-[13px] text-[color:var(--color-ink-2)]'>
              <Star className='w-3.5 h-3.5 fill-amber-400 text-amber-400' />
              {product.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>

      {displayDescription ? (
        <p className='text-[13px] text-[color:var(--color-text-secondary)] mt-3 leading-relaxed line-clamp-6'>
          {displayDescription}
        </p>
      ) : null}

      {product.variants && product.variants.length > 0 ? (
        <section className='mt-4'>
          <h5 className='text-[12px] font-semibold uppercase tracking-wide text-[color:var(--color-ink-3)] mb-2'>
            Variants
          </h5>
          <ul className='space-y-2'>
            {product.variants.map((variant) => (
              <li
                key={variant.id}
                className='flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border-subtle)] px-3 py-2 text-[13px]'>
                <div className='min-w-0'>
                  <p className='font-medium text-[color:var(--color-ink)]'>
                    {variant.name}
                  </p>
                  {variant.sku ? (
                    <p className='text-[11px] font-mono text-[color:var(--color-ink-3)] mt-0.5'>
                      {variant.sku}
                    </p>
                  ) : null}
                  {variant.attributes && Object.keys(variant.attributes).length > 0 ? (
                    <p className='text-[12px] text-[color:var(--color-ink-2)] mt-1'>
                      {Object.entries(variant.attributes)
                        .map(([key, value]) => `${formatAttributeLabel(key)}: ${value}`)
                        .join(' · ')}
                    </p>
                  ) : null}
                </div>
                <div className='text-right shrink-0'>
                  {variant.price != null ? (
                    <p className='font-medium tabular-nums'>
                      {formatPrice(variant.price)}
                    </p>
                  ) : null}
                  <p className='text-[11px] text-[color:var(--color-ink-3)] mt-0.5'>
                    {variant.inStock === false
                      ? 'Unavailable'
                      : variant.stockLevel === 'low'
                        ? 'Low stock'
                        : 'Available'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {attributeEntries.length > 0 ? (
        <section className='mt-4'>
          <h5 className='text-[12px] font-semibold uppercase tracking-wide text-[color:var(--color-ink-3)] mb-2'>
            Details
          </h5>
          <dl className='grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-3 gap-y-1.5 text-[13px]'>
            {attributeEntries.map(([key, value]) => (
              <Fragment key={key}>
                <dt className='text-[color:var(--color-ink-3)]'>
                  {formatAttributeLabel(key)}
                </dt>
                <dd className='text-[color:var(--color-ink)] [overflow-wrap:anywhere]'>
                  {value}
                </dd>
              </Fragment>
            ))}
          </dl>
        </section>
      ) : null}

      {product.shipping ? (
        <section className='mt-4 rounded-[var(--radius-md)] bg-[color:var(--color-paper-2)] border border-[color:var(--color-border-subtle)] px-3 py-2.5'>
          <div className='flex items-center gap-2 mb-1'>
            <Truck className='w-4 h-4 text-[color:var(--color-primary)]' />
            <h5 className='text-[13px] font-semibold text-[color:var(--color-ink)]'>
              Shipping
            </h5>
          </div>
          <ul className='text-[12px] text-[color:var(--color-ink-2)] space-y-0.5'>
            {product.shipping.shipsFrom ? (
              <li>Ships from {product.shipping.shipsFrom}</li>
            ) : null}
            {product.shipping.shipsInternationally != null ? (
              <li>
                {product.shipping.shipsInternationally
                  ? 'International delivery available'
                  : 'Domestic delivery only'}
              </li>
            ) : null}
            {product.shipping.restrictedCountries &&
            product.shipping.restrictedCountries.length > 0 ? (
              <li>
                Restricted: {product.shipping.restrictedCountries.join(', ')}
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

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
          View on Kapruka
          <ExternalLink className='w-3.5 h-3.5' />
        </a>
      </div>
    </article>
  );
}

function GalleryButton({
  direction,
  onClick,
  label,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 ${
        direction === 'prev' ? 'left-2' : 'right-2'
      } w-8 h-8 rounded-full bg-white/90 border border-[color:var(--color-border-subtle)] shadow-sm flex items-center justify-center text-[color:var(--color-ink)] hover:bg-white`}>
      <Icon className='w-4 h-4' aria-hidden='true' />
    </button>
  );
}
