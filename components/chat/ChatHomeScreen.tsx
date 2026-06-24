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
