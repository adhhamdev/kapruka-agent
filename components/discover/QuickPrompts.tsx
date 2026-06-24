'use client';

import { Sparkles, Truck, Mic } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

interface QuickPromptsProps {
  heading?: string;
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const ICONS = {
  sparkles: Sparkles,
  truck: Truck,
  mic: Mic,
} as const;

export function QuickPrompts({
  heading,
  onSelectPrompt,
  disabled = false,
}: QuickPromptsProps) {
  const { messages } = useLocale();
  const starters = messages.quickStarters;

  return (
    <section aria-labelledby='quick-prompts-heading'>
      {heading ? (
        <h3
          id='quick-prompts-heading'
          className='text-[12px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-3)] mb-2.5'>
          {heading}
        </h3>
      ) : null}
      <ul className='grid grid-cols-2 gap-2 list-none m-0 p-0'>
        {starters.map((starter) => {
          const Icon = ICONS[starter.iconName] ?? Sparkles;
          return (
            <li key={starter.label} className='min-w-0'>
              <button
                type='button'
                disabled={disabled}
                onClick={() => onSelectPrompt(starter.prompt)}
                className='w-full h-full min-h-[44px] text-left rounded-[var(--radius-md)] border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-3 py-2.5 text-[13px] font-medium text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-3)] hover:border-[color:var(--color-rule-strong)] disabled:opacity-50 transition-[background-color,border-color] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]'>
                <span className='flex items-center gap-2 min-w-0'>
                  <Icon
                    className='w-3.5 h-3.5 shrink-0 text-[color:var(--color-primary)]'
                    aria-hidden='true'
                  />
                  <span className='truncate'>{starter.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
