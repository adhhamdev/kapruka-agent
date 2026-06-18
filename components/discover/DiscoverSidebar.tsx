import { PanelLeftClose, Search } from 'lucide-react';
import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { KaprukaText } from '@/components/brand/KaprukaLink';
import { QuickPrompts } from '@/components/discover/QuickPrompts';
import { AGENT_GREETING, APP_NAME } from '@/constants/brand';

interface DiscoverSidebarProps {
  isActive: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function DiscoverSidebar({
  isActive,
  isOpen,
  onClose,
  onSendMessage,
  disabled = false,
}: DiscoverSidebarProps) {
  return (
    <section
      className={`
        bg-[color:var(--color-bg-surface)] h-full min-h-0 min-w-0 overflow-hidden
        ${isActive
          ? 'flex flex-1 w-full max-md:absolute max-md:inset-0 max-md:z-10 animate-fade-in'
          : 'hidden'}
        md:relative md:flex md:shrink-0 md:animate-none md:transition-[width,border-color] md:duration-200 md:ease-out md:border-r border-[color:var(--color-border-subtle)]
        ${isOpen ? 'md:w-80' : 'md:w-0 md:border-r-0 md:pointer-events-none'}
      `}
      id='left-sidebar'
      aria-label='Discover products'
      aria-hidden={!isActive && !isOpen}>
      <div className='relative flex flex-col w-full h-full min-h-0 min-w-0 md:w-80 md:min-w-80 md:max-w-80'>
        <div className='shrink-0 hidden md:flex items-center justify-between px-4 py-3 border-b border-[color:var(--color-border-subtle)]'>
          <h2 className='text-[15px] font-semibold text-[color:var(--color-ink)]'>
            Discover
          </h2>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close discover panel'
            className='inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-3)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] touch-manipulation'>
            <PanelLeftClose className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-5 py-6 pb-28 md:pb-6'>
          <div className='flex flex-col items-center text-center pt-2 pb-6 md:pt-2 md:pb-8 border-b border-[color:var(--color-border-subtle)] mb-6'>
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
              <h3 className='text-[15px] font-semibold text-[color:var(--color-ink)] mb-1 md:sr-only'>
                Discover
              </h3>
              <p className='text-[13px] text-[color:var(--color-ink-2)] mb-4 md:mb-6 hidden md:block'>
                <KaprukaText>
                  Explore Kapruka&apos;s full catalog — everyday essentials to
                  specialty items — and shop with Agent from search to checkout.
                </KaprukaText>
              </p>

              <div className='relative md:hidden'>
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
      </div>
    </section>
  );
}
