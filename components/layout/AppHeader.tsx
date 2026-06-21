'use client';

import { KaprukaLink, KaprukaText } from '@/components/brand/KaprukaLink';
import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { KAPRUKA_LOGO_SRC } from '@/constants/brand';
import type { CartItem } from '@/lib/cart-storage';
import { getCartItemCount } from '@/lib/cart/totals';
import { RotateCcw, ShoppingBag, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AppHeaderProps {
  cart: CartItem[];
  cartOpen: boolean;
  isChatPending?: boolean;
  onStartNewChat: () => void;
  onToggleCart: () => void;
  onOpenSavedInfo?: () => void;
}

const headerIconButtonClass =
  'relative inline-flex items-center justify-center w-9 h-9 min-w-9 min-h-9 shrink-0 rounded-[var(--radius-md)] border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-primary)] touch-manipulation disabled:opacity-50 disabled:pointer-events-none';

export function AppHeader({
  cart,
  cartOpen,
  isChatPending = false,
  onStartNewChat,
  onToggleCart,
  onOpenSavedInfo,
}: AppHeaderProps) {
  const cartCount = getCartItemCount(cart);

  return (
    <header
      className='flex shrink-0 items-center justify-between gap-3 z-30 bg-[color:var(--color-primary)] shadow-[var(--shadow-sm)] px-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top)] min-h-[calc(52px+env(safe-area-inset-top))] lg:min-h-[calc(60px+env(safe-area-inset-top))]'
      id='nav-header'>
      <div className='flex items-center gap-2 sm:gap-3 min-w-0 py-2 lg:py-0 lg:h-[60px]'>
        <KaprukaLink
          className='inline-flex shrink-0 rounded-sm'
          variant='on-dark'
          ariaLabel='Shop at Kapruka.com'>
          <Image
            src={KAPRUKA_LOGO_SRC}
            alt=''
            width={120}
            height={40}
            className='h-7 sm:h-8 w-auto object-contain'
            priority
            aria-hidden='true'
          />
        </KaprukaLink>
        <Link href='/'>
          <div className='flex items-center gap-2'>
            <span
              className='w-px h-5 sm:h-6 bg-white/20 shrink-0'
              aria-hidden='true'
            />
            <AgentAvatar size='nav' className='mb-0 shrink-0' />
            <span
              className='font-semibold text-[13px] sm:text-[15px] tracking-tight text-white leading-tight truncate'
              translate='no'>
              <KaprukaText variant='on-dark'>Agent.</KaprukaText>
            </span>
          </div>
        </Link>
      </div>

      <div className='flex items-center gap-2 shrink-0 py-2 lg:py-0'>
        <button
          type='button'
          onClick={onStartNewChat}
          disabled={isChatPending}
          aria-label='New chat'
          title='New chat'
          className={headerIconButtonClass}>
          <RotateCcw className='w-4 h-4' aria-hidden='true' />
        </button>
        <button
          type='button'
          onClick={onToggleCart}
          aria-label={
            cartCount > 0
              ? cartOpen
                ? `Hide basket, ${cartCount} items`
                : `Show basket, ${cartCount} items`
              : cartOpen
                ? 'Hide basket'
                : 'Show basket'
          }
          aria-expanded={cartOpen}
          aria-controls='cart-sidebar'
          title='Basket'
          className={headerIconButtonClass}>
          <ShoppingBag className='w-4 h-4' aria-hidden='true' />
          {cartCount > 0 && (
            <span
              className='absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold leading-none tabular-nums bg-[color:var(--color-accent)] text-[color:var(--color-accent-ink)] border-2 border-[color:var(--color-primary)] rounded-full'
              aria-hidden='true'>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
        {onOpenSavedInfo && (
          <button
            type='button'
            onClick={onOpenSavedInfo}
            aria-label='Saved info'
            title='Saved info'
            className={headerIconButtonClass}>
            <UserRound className='w-4 h-4' aria-hidden='true' />
          </button>
        )}
      </div>
    </header>
  );
}
