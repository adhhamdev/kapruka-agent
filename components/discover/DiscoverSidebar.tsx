import { Search } from 'lucide-react';
import { QuickPrompts } from '@/components/discover/QuickPrompts';

interface DiscoverSidebarProps {
  isActive: boolean;
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function DiscoverSidebar({
  isActive,
  onSendMessage,
  disabled = false,
}: DiscoverSidebarProps) {
  return (
    <section
      className={`
        ${isActive ? 'flex animate-fade-in' : 'hidden'} 
        lg:flex w-full lg:w-80 flex-col justify-between shrink-0 h-full overflow-y-auto 
        bg-[color:var(--color-bg-surface)] lg:border-r border-[color:var(--color-border-subtle)]
        px-5 py-6 pb-28 lg:pb-6
      `}
      id='left-sidebar'
      aria-label='Discover products'>
      <div className='space-y-8'>
        <div>
          <h2 className='text-[22px] font-semibold tracking-tight text-[color:var(--color-ink)] leading-tight mb-2 text-pretty'>
            Discover
          </h2>
          <p className='text-[14px] text-[color:var(--color-ink-2)] mb-6'>
            Explore Kapruka&apos;s catalog — gifts, cakes, flowers and more
            across Sri Lanka.
          </p>

          <div className='relative mb-6'>
            <label htmlFor='discover-search' className='sr-only'>
              Search products
            </label>
            <Search
              className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-3)] pointer-events-none'
              aria-hidden='true'
            />
            <input
              id='discover-search'
              name='search'
              type='search'
              autoComplete='off'
              placeholder='Search products…'
              className='w-full bg-[color:var(--color-paper)] border border-[color:var(--color-rule-strong)] rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-[15px] focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/10 transition-[border-color,box-shadow]'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !disabled) {
                  onSendMessage(`Search for ${e.currentTarget.value}`);
                  e.currentTarget.value = '';
                }
              }}
              disabled={disabled}
            />
          </div>
        </div>

        <QuickPrompts onSelectPrompt={onSendMessage} disabled={disabled} />
      </div>
    </section>
  );
}
