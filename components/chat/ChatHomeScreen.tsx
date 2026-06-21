'use client';

import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { QuickPrompts } from '@/components/discover/QuickPrompts';
import { KaprukaText } from '@/components/brand/KaprukaLink';
import { AGENT_GREETING, APP_NAME } from '@/constants/brand';

interface ChatHomeScreenProps {
  onSelectSuggestion: (prompt: string) => void;
  disabled?: boolean;
}

export function ChatHomeScreen({
  onSelectSuggestion,
  disabled = false,
}: ChatHomeScreenProps) {
  return (
    <div
      className='flex flex-col items-center text-center py-6 sm:py-8 md:py-10'
      aria-labelledby='chat-home-title'>
      <AgentAvatar size='xl' className='mb-4' />
      <p className='text-[11px] font-semibold uppercase tracking-widest text-[color:var(--color-primary)] mb-2'>
        Welcome
      </p>
      <h2
        id='chat-home-title'
        className='text-[22px] sm:text-[24px] font-semibold tracking-tight text-[color:var(--color-ink)] leading-tight mb-2 text-pretty'>
        <KaprukaText>{APP_NAME}</KaprukaText>
      </h2>
      <p className='text-[14px] text-[color:var(--color-ink-2)] leading-relaxed max-w-[20rem] text-pretty'>
        <KaprukaText>{AGENT_GREETING}</KaprukaText>
      </p>

      <div className='w-full max-w-md mt-8 sm:mt-10 text-left'>
        <QuickPrompts
          heading='Suggestions'
          onSelectPrompt={onSelectSuggestion}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
