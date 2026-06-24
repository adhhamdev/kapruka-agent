'use client';

import type { LiveConnectionState } from '@/hooks/use-gemini-live';
import { useLocale } from '@/components/providers/LocaleProvider';

interface LiveVoiceBarProps {
  liveState: LiveConnectionState;
  liveError: string | null;
  onClearError?: () => void;
}

function liveStatusMessage(
  liveState: LiveConnectionState,
  messages: ReturnType<typeof useLocale>['messages'],
): string | null {
  switch (liveState) {
    case 'connecting':
      return messages.composer.liveConnecting;
    case 'connected':
      return messages.composer.liveConnected;
    case 'reconnecting':
      return messages.composer.liveReconnecting;
    default:
      return null;
  }
}

export function LiveVoiceBar({
  liveState,
  liveError,
  onClearError,
}: LiveVoiceBarProps) {
  const { messages } = useLocale();
  const status = liveStatusMessage(liveState, messages);

  if (!status && !liveError) return null;

  return (
    <div className='px-1 flex flex-col gap-1.5 items-center justify-center w-full'>
      {status && (
        <div className='flex justify-center'>
          <p
            className='text-[12px] text-[color:var(--color-primary)] bg-[color:var(--color-paper-2)]/90 backdrop-blur-sm border border-[color:var(--color-rule-strong)]/80 shadow-sm rounded-full px-3.5 py-1.5 flex items-center gap-2'
            role='status'
            aria-live='polite'>
            <span className='inline-flex gap-1' aria-hidden='true'>
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-1' />
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-2' />
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-3' />
            </span>
            {status}
          </p>
        </div>
      )}
      {liveError && (
        <div className='flex justify-center'>
          <p
            className='text-[12px] text-[color:var(--color-error)] bg-[color:var(--color-error-bg)] border border-[color:var(--color-error)]/20 shadow-sm rounded-full px-3.5 py-1.5'
            role='alert'>
            {liveError}
            {onClearError ? (
              <button
                type='button'
                className='ml-2 underline hover:text-[color:var(--color-error)]/80 focus-visible:outline-none'
                onClick={onClearError}>
                Dismiss
              </button>
            ) : null}
          </p>
        </div>
      )}
    </div>
  );
}
