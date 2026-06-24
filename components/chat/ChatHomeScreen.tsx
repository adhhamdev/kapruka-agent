'use client';

import { KaprukaText } from '@/components/brand/KaprukaLink';
import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { QuickPrompts } from '@/components/discover/QuickPrompts';
import { useLocale } from '@/components/providers/LocaleProvider';
import { Mic } from 'lucide-react';

interface ChatHomeScreenProps {
  onSelectSuggestion: (prompt: string) => void;
  disabled?: boolean;
}

export function ChatHomeScreen({
  onSelectSuggestion,
  disabled = false,
}: ChatHomeScreenProps) {
  const { messages } = useLocale();

  return (
    <div
      className='flex flex-col items-center text-center py-6 sm:py-8 md:py-10'
      aria-labelledby='chat-home-title'>
      <AgentAvatar size='xl' className='mb-4' />
      <p className='text-[11px] font-semibold uppercase tracking-widest text-[color:var(--color-primary)] mb-2'>
        {messages.chat.welcome}
      </p>
      <h2
        id='chat-home-title'
        className='text-[22px] sm:text-[24px] font-semibold tracking-tight text-[color:var(--color-ink)] leading-tight mb-2 text-pretty'>
        <KaprukaText>{messages.brand.appName}</KaprukaText>
      </h2>
      <p className='text-[14px] text-[color:var(--color-ink-2)] leading-relaxed max-w-[20rem] text-pretty'>
        <KaprukaText>{messages.brand.agentGreeting}</KaprukaText>
      </p>

      <div
        className='mt-5 w-full max-w-[18rem] rounded-[var(--radius-lg)] border-2 border-[color:var(--color-primary)]/35 bg-[color:var(--color-primary)]/8 px-4 py-4 flex flex-col items-center gap-2.5 shadow-[0_8px_24px_color-mix(in_oklch,var(--color-primary)_18%,transparent)]'
        role='note'
        aria-label={messages.chat.liveVoiceTitle}>
        <div className='chat-mic-attract w-[3.75rem] h-[3.75rem] rounded-full bg-[color:var(--color-primary)] text-white flex items-center justify-center shadow-lg ring-4 ring-[color:var(--color-primary)]/25'>
          <Mic className='w-7 h-7' strokeWidth={2.25} aria-hidden='true' />
        </div>
        <p className='text-[16px] font-semibold text-[color:var(--color-ink)] leading-snug text-pretty'>
          {messages.chat.liveVoiceTitle}
        </p>
        <p className='text-[13px] text-[color:var(--color-ink-2)] leading-relaxed text-pretty'>
          {messages.chat.liveVoiceHint}
        </p>
      </div>

      <div className='w-full max-w-md mt-8 sm:mt-10 text-left'>
        <QuickPrompts
          heading={messages.chat.suggestions}
          onSelectPrompt={onSelectSuggestion}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
