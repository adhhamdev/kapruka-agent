import { Sparkles, Truck } from 'lucide-react';
import { QUICK_STARTERS } from '@/constants/prompts';

const ICON_MAP = {
  sparkles: Sparkles,
  truck: Truck,
} as const;

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickPrompts({
  onSelectPrompt,
  disabled = false,
}: QuickPromptsProps) {
  return (
    <div className='space-y-3'>
      <h4 className='text-[12px] font-semibold text-[color:var(--color-ink-3)] uppercase tracking-wider'>
        Quick Prompts
      </h4>
      <div className='flex flex-col gap-2'>
        {QUICK_STARTERS.map((qs) => {
          const Icon = ICON_MAP[qs.iconName];
          return (
            <button
              key={qs.label}
              type='button'
              disabled={disabled}
              onClick={() => onSelectPrompt(qs.prompt)}
              className='min-h-[48px] p-3.5 text-left bg-[color:var(--color-paper-2)] border border-[color:var(--color-rule-strong)] rounded-[var(--radius-md)] text-[14px] hover:border-[color:var(--color-primary)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98] transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2'>
              <div className='flex items-center gap-3'>
                <div className='text-[color:var(--color-primary)] group-hover:text-[color:var(--color-accent-ink)] transition-colors'>
                  <Icon className='w-4 h-4' aria-hidden='true' />
                </div>
                <span className='font-medium text-[color:var(--color-ink)]'>
                  {qs.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
