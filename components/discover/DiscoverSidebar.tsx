import { Search } from 'lucide-react';
import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { KaprukaText } from '@/components/brand/KaprukaLink';
import { DiscoverBrandHeader } from '@/components/discover/DiscoverBrandHeader';
import { QuickPrompts } from '@/components/discover/QuickPrompts';
import { AGENT_GREETING, APP_NAME } from '@/constants/brand';

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
        lg:flex w-full lg:w-80 flex-col shrink-0 h-full min-h-0
        bg-[color:var(--color-bg-surface)] lg:border-r border-[color:var(--color-border-subtle)]
      `}
      id='left-sidebar'
      aria-label='Discover products'>
      <DiscoverBrandHeader />

      <div className='flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-5 py-6 pb-28 lg:pb-6'>
        <div className='flex flex-col items-center text-center pt-2 pb-6 lg:pt-2 lg:pb-8 border-b border-[color:var(--color-border-subtle)] mb-6'>
          <AgentAvatar size='xl' className='mb-4' />
          <p className='text-[11px] font-semibold uppercase tracking-widest text-[color:var(--color-primary)] mb-2'>
            Welcome
          </p>
          <h2 className='text-[22px] sm:text-[24px] font-semibold tracking-tight text-[color:var(--color-ink)] leading-tight mb-2 text-pretty'>
            <KaprukaText>{APP_NAME}</KaprukaText>
          </h2>
          <p className='text-[14px] text-[color:var(--color-ink-2)] leading-relaxed max-w-[18rem] text-pretty'>
            <KaprukaText>{AGENT_GREETING}</KaprukaText>
          </p>
        </div>

        <div className='space-y-8 w-full'>
          <div>
            <h3 className='text-[15px] font-semibold text-[color:var(--color-ink)] mb-1 lg:sr-only'>
              Discover
            </h3>
            <p className='text-[13px] text-[color:var(--color-ink-2)] mb-4 lg:mb-6 hidden lg:block'>
              <KaprukaText>
                Explore Kapruka&apos;s catalog — gifts, cakes, flowers and more
                across Sri Lanka.
              </KaprukaText>
            </p>

            <div className='relative'>
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
      </div>
    </section>
  );
}
