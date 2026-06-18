import { MessageSquare, Search, ShoppingBag } from 'lucide-react';
import { getCartItemCount } from '@/lib/cart/totals';
import type { CartItem } from '@/lib/cart-storage';
import type { ActiveTab } from '@/types/chat';

interface MobileTabBarProps {
  activeTab: ActiveTab;
  cart: CartItem[];
  onTabChange: (tab: ActiveTab) => void;
}

const SIDE_TABS = [
  { id: 'discover' as const, label: 'Search', Icon: Search },
  { id: 'cart' as const, label: 'Basket', Icon: ShoppingBag },
] as const;

const CHAT_TAB = {
  id: 'chat' as const,
  label: 'Agent',
  Icon: MessageSquare,
};

function SideTabButton({
  id,
  label,
  Icon,
  isActive,
  cartCount,
  onTabChange,
}: {
  id: 'discover' | 'cart';
  label: string;
  Icon: typeof Search;
  isActive: boolean;
  cartCount: number;
  onTabChange: (tab: ActiveTab) => void;
}) {
  return (
    <button
      type='button'
      onClick={() => onTabChange(id)}
      aria-current={isActive ? 'page' : undefined}
      aria-label={
        id === 'cart' && cartCount > 0
          ? `${label}, ${cartCount} items in basket`
          : label
      }
      className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] py-2 transition-[color,transform] duration-[var(--dur-short)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] rounded-md touch-manipulation ${
        isActive
          ? 'text-[color:var(--color-primary)]'
          : 'text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink-2)]'
      }`}>
      <Icon
        className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`}
        aria-hidden='true'
      />
      {id === 'cart' && cartCount > 0 && (
        <span
          className='absolute top-1 right-[calc(50%-20px)] min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold tabular-nums bg-[color:var(--color-accent)] text-[color:var(--color-accent-ink)] border-2 border-[color:var(--color-paper-2)] rounded-full'
          aria-hidden='true'>
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
      <span
        className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
        {label}
      </span>
    </button>
  );
}

export function MobileTabBar({
  activeTab,
  cart,
  onTabChange,
}: MobileTabBarProps) {
  const cartCount = getCartItemCount(cart);
  const isChatActive = activeTab === CHAT_TAB.id;
  const ChatIcon = CHAT_TAB.Icon;

  return (
    <nav
      className='md:hidden fixed bottom-0 left-0 right-0 z-50 overscroll-contain pointer-events-none'
      aria-label='Main navigation'>
      <div className='relative h-[calc(64px+env(safe-area-inset-bottom))] bg-[color:var(--color-paper-2)]/95 backdrop-blur-xl border-t border-[color:var(--color-rule)] px-4 sm:px-6 pb-[env(safe-area-inset-bottom)] flex items-end justify-around pointer-events-auto'>
        <SideTabButton
          id='discover'
          label={SIDE_TABS[0].label}
          Icon={SIDE_TABS[0].Icon}
          isActive={activeTab === 'discover'}
          cartCount={cartCount}
          onTabChange={onTabChange}
        />

        <button
          type='button'
          onClick={() => onTabChange('chat')}
          aria-current={isChatActive ? 'page' : undefined}
          aria-label={`${CHAT_TAB.label}, main chat`}
          className='relative flex flex-col items-center justify-end flex-1 min-w-[72px] -mt-5 pb-1.5 focus-visible:outline-none touch-manipulation group'>
          <span
            className={`flex items-center justify-center w-[52px] h-[52px] rounded-full transition-[background-color,box-shadow,transform,color] duration-[var(--dur-short)] ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 ${
              isChatActive
                ? 'bg-[color:var(--color-primary)] text-white shadow-[0_8px_24px_oklch(26%_0.13_285_/_0.45)] ring-4 ring-[color:var(--color-primary)]/15 scale-100'
                : 'bg-[color:var(--color-paper-2)] text-[color:var(--color-primary)] border-2 border-[color:var(--color-primary)]/25 shadow-[var(--shadow-md)] group-hover:border-[color:var(--color-primary)]/45 group-active:scale-95'
            }`}>
            <ChatIcon
              className={`w-[26px] h-[26px] ${isChatActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`}
              aria-hidden='true'
            />
          </span>
          <span
            className={`mt-1.5 text-[10px] leading-none ${
              isChatActive
                ? 'font-semibold text-[color:var(--color-primary)]'
                : 'font-medium text-[color:var(--color-ink-2)]'
            }`}>
            {CHAT_TAB.label}
          </span>
          {isChatActive && (
            <span
              className='absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[color:var(--color-primary)]'
              aria-hidden='true'
            />
          )}
        </button>

        <SideTabButton
          id='cart'
          label={SIDE_TABS[1].label}
          Icon={SIDE_TABS[1].Icon}
          isActive={activeTab === 'cart'}
          cartCount={cartCount}
          onTabChange={onTabChange}
        />
      </div>
    </nav>
  );
}
