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
    <div className='px-1'>
      {status && (
        <p
          className='text-[12px] text-[color:var(--color-primary)] flex items-center gap-2'
          role='status'
          aria-live='polite'>
          <span className='inline-flex gap-1' aria-hidden='true'>
            <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-1' />
            <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-2' />
            <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-3' />
          </span>
          {status}
        </p>
      )}
      {liveError && (
        <p
          className='text-[12px] text-[color:var(--color-error)] mt-1'
          role='alert'>
          {liveError}
          {onClearError ? (
            <button
              type='button'
              className='ml-2 underline'
              onClick={onClearError}>
              Dismiss
            </button>
          ) : null}
        </p>
      )}
    </div>
  );
}
