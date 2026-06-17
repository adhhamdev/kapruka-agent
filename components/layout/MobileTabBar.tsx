import { MessageSquare, Search, ShoppingBag } from 'lucide-react';
import { getCartItemCount } from '@/lib/cart/totals';
import type { CartItem } from '@/lib/cart-storage';
import type { ActiveTab } from '@/types/chat';

interface MobileTabBarProps {
  activeTab: ActiveTab;
  cart: CartItem[];
  onTabChange: (tab: ActiveTab) => void;
}

const TABS = [
  { id: 'discover' as const, label: 'Search', Icon: Search },
  { id: 'chat' as const, label: 'Agent', Icon: MessageSquare },
  { id: 'cart' as const, label: 'Basket', Icon: ShoppingBag },
];

export function MobileTabBar({
  activeTab,
  cart,
  onTabChange,
}: MobileTabBarProps) {
  const cartCount = getCartItemCount(cart);

  return (
    <nav
      className='lg:hidden fixed bottom-0 left-0 right-0 h-[calc(60px+env(safe-area-inset-bottom))] bg-[color:var(--color-paper-2)]/95 backdrop-blur-xl border-t border-[color:var(--color-rule)] px-6 pb-[env(safe-area-inset-bottom)] flex items-center justify-around z-50 overscroll-contain'
      aria-label='Main navigation'>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type='button'
            onClick={() => onTabChange(id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={
              id === 'cart' && cartCount > 0
                ? `${label}, ${cartCount} items in basket`
                : label
            }
            className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] rounded-md ${
              isActive
                ? 'text-[color:var(--color-primary)]'
                : 'text-[color:var(--color-ink-3)]'
            }`}>
            <Icon
              className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.5px]' : ''}`}
              aria-hidden='true'
            />
            {id === 'cart' && cartCount > 0 && (
              <span
                className='absolute top-1.5 right-[calc(50%-18px)] w-2.5 h-2.5 bg-[color:var(--color-accent)] border-2 border-[color:var(--color-paper-2)] rounded-full'
                aria-hidden='true'
              />
            )}
            <span className='text-[10px] font-medium'>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
