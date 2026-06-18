'use client';

import { ExternalLink, LayoutGrid, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatCategoryLabel } from '@/lib/kapruka-categories';
import type { KaprukaCategory } from '@/types/widgets';

const FEATURED_NAMES = new Set([
  'cakes',
  'flowers',
  'Chocolates',
  'chocolates',
  'Grocery',
  'grocery',
  'Giftcert',
  'combopack',
  'Softtoy',
  'Perfumes',
  'bestsellers',
  'birthday',
]);

interface CategoryListCardProps {
  categories: KaprukaCategory[];
  onBrowseCategory?: (categoryName: string) => void;
}

export function CategoryListCard({
  categories,
  onBrowseCategory,
}: CategoryListCardProps) {
  const [filter, setFilter] = useState('');

  const { featured, rest } = useMemo(() => {
    const featuredItems: KaprukaCategory[] = [];
    const restItems: KaprukaCategory[] = [];

    for (const category of categories) {
      if (FEATURED_NAMES.has(category.name)) {
        featuredItems.push(category);
      } else {
        restItems.push(category);
      }
    }

    return { featured: featuredItems, rest: restItems };
  }, [categories]);

  const normalizedFilter = filter.trim().toLowerCase();

  const matchesFilter = (category: KaprukaCategory) => {
    if (!normalizedFilter) return true;
    const label = formatCategoryLabel(category.name).toLowerCase();
    return (
      category.name.toLowerCase().includes(normalizedFilter) ||
      label.includes(normalizedFilter)
    );
  };

  const visibleFeatured = featured.filter(matchesFilter);
  const visibleRest = rest.filter(matchesFilter);
  const totalVisible = visibleFeatured.length + visibleRest.length;

  return (
    <div className='bg-[color:var(--color-bg-base)] border border-[color:var(--color-border-default)] rounded-[var(--radius-xl)] p-4 w-full max-w-full sm:max-w-md shadow-sm min-w-0'>
      <div className='flex items-center gap-2 mb-3'>
        <div className='w-9 h-9 bg-[color:var(--color-paper-2)] rounded-full flex items-center justify-center shrink-0 border border-[color:var(--color-border-subtle)]'>
          <LayoutGrid
            className='w-4 h-4 text-[color:var(--color-primary)]'
            aria-hidden='true'
          />
        </div>
        <div className='min-w-0'>
          <h4 className='text-[15px] font-semibold text-[color:var(--color-ink)]'>
            Shop by Category
          </h4>
          <p className='text-[12px] text-[color:var(--color-ink-3)]'>
            {categories.length} departments on Kapruka
          </p>
        </div>
      </div>

      <label htmlFor={`category-filter-${categories.length}`} className='sr-only'>
        Filter categories
      </label>
      <div className='relative mb-3'>
        <Search
          className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-3)] pointer-events-none'
          aria-hidden='true'
        />
        <input
          id={`category-filter-${categories.length}`}
          type='search'
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder='Filter categories…'
          className='w-full bg-[color:var(--color-paper)] border border-[color:var(--color-rule-strong)] rounded-[var(--radius-md)] pl-9 pr-3 py-2 text-[14px] focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/10'
        />
      </div>

      {totalVisible === 0 ? (
        <p className='text-[13px] text-[color:var(--color-ink-3)] py-2'>
          No categories match your filter.
        </p>
      ) : (
        <div className='space-y-3 max-h-[min(320px,50vh)] overflow-y-auto overscroll-y-contain pr-0.5'>
          {visibleFeatured.length > 0 && (
            <CategoryGroup
              title='Popular'
              categories={visibleFeatured}
              onBrowseCategory={onBrowseCategory}
            />
          )}
          {visibleRest.length > 0 && (
            <CategoryGroup
              title={visibleFeatured.length > 0 ? 'All categories' : undefined}
              categories={visibleRest}
              onBrowseCategory={onBrowseCategory}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CategoryGroup({
  title,
  categories,
  onBrowseCategory,
}: {
  title?: string;
  categories: KaprukaCategory[];
  onBrowseCategory?: (categoryName: string) => void;
}) {
  return (
    <div>
      {title ? (
        <p className='text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-3)] mb-2'>
          {title}
        </p>
      ) : null}
      <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
        {categories.map((category) => (
          <li key={`${category.name}-${category.url}`}>
            <CategoryRow
              category={category}
              onBrowseCategory={onBrowseCategory}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryRow({
  category,
  onBrowseCategory,
}: {
  category: KaprukaCategory;
  onBrowseCategory?: (categoryName: string) => void;
}) {
  const label = formatCategoryLabel(category.name);

  return (
    <div className='flex items-stretch gap-1 min-w-0'>
      <a
        href={category.url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex-1 min-w-0 flex items-center justify-between gap-2 px-3 py-2.5 bg-[color:var(--color-paper-2)] border border-[color:var(--color-rule-strong)] rounded-[var(--radius-md)] text-[13px] font-medium text-[color:var(--color-ink)] hover:border-[color:var(--color-primary)]/50 hover:bg-[color:var(--color-paper-3)] transition-[border-color,background-color] group'>
        <span className='truncate'>{label}</span>
        <ExternalLink
          className='w-3.5 h-3.5 shrink-0 text-[color:var(--color-ink-3)] group-hover:text-[color:var(--color-primary)]'
          aria-hidden='true'
        />
      </a>
      {onBrowseCategory ? (
        <button
          type='button'
          onClick={() => onBrowseCategory(category.name)}
          aria-label={`Search ${label} in chat`}
          className='shrink-0 px-2.5 py-2 border border-[color:var(--color-rule-strong)] rounded-[var(--radius-md)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-paper-3)] hover:border-[color:var(--color-primary)]/40 transition-[border-color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]'>
          <Search className='w-4 h-4' aria-hidden='true' />
        </button>
      ) : null}
    </div>
  );
}
