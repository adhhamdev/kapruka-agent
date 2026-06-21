'use client';

import { BookmarkPlus, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { saveMemoryText } from '@/lib/memory-api';
import {
  isRememberDeliveryDismissed,
  markRememberDeliveryHandled,
} from '@/lib/remember-delivery-storage';
import { formatDeliveryMemoryText } from '@/lib/supermemory/delivery-memory';
import type { DeliverySnapshot } from '@/types/widgets';

interface RememberDeliveryChipProps {
  orderNumber: string;
  delivery: DeliverySnapshot;
}

type ChipState = 'prompt' | 'saving' | 'saved' | 'dismissed' | 'error';

export function RememberDeliveryChip({
  orderNumber,
  delivery,
}: RememberDeliveryChipProps) {
  const [state, setState] = useState<ChipState>('prompt');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isRememberDeliveryDismissed(orderNumber)) {
      setState('dismissed');
    }
  }, [orderNumber]);

  if (state === 'dismissed') return null;

  const handleDismiss = () => {
    markRememberDeliveryHandled(orderNumber);
    setState('dismissed');
  };

  const handleSave = async () => {
    setState('saving');
    setMessage(null);

    const memory = formatDeliveryMemoryText(delivery);
    const result = await saveMemoryText(memory);

    markRememberDeliveryHandled(orderNumber);

    if (result.ok) {
      setState('saved');
      setMessage('Saved — we can use this address next time you checkout.');
      return;
    }

    setState('error');
    setMessage(
      result.message ||
        'Could not save right now. You can still pay below — try again later from Saved info.',
    );
  };

  if (state === 'saved') {
    return (
      <div className='mt-3 rounded-[var(--radius-md)] border border-[color:var(--color-success)]/25 bg-[color:var(--color-paper)] px-3.5 py-3 text-left'>
        <p className='flex items-start gap-2 text-[13px] text-[color:var(--color-ink)] leading-relaxed'>
          <Check
            className='w-4 h-4 shrink-0 mt-0.5 text-[color:var(--color-success)]'
            aria-hidden='true'
          />
          {message}
        </p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className='mt-3 rounded-[var(--radius-md)] border border-[color:var(--color-border-default)] bg-[color:var(--color-paper)] px-3.5 py-3 text-left'>
        <p className='text-[13px] text-[color:var(--color-ink-2)] leading-relaxed'>
          {message}
        </p>
        <button
          type='button'
          onClick={handleDismiss}
          className='mt-2 text-[13px] font-medium text-[color:var(--color-primary)] hover:underline'>
          OK
        </button>
      </div>
    );
  }

  return (
    <div className='mt-3 rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-3.5 py-3 text-left'>
      <p className='flex items-start gap-2 text-[13px] text-white/95 leading-relaxed'>
        <BookmarkPlus className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' />
        Save this delivery address for next time?
      </p>
      <div className='mt-3 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={() => void handleSave()}
          disabled={state === 'saving'}
          className='inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color:var(--color-accent)] px-3.5 py-2 text-[13px] font-semibold text-[color:var(--color-accent-ink)] hover:bg-[color:var(--color-accent-hover)] disabled:opacity-60 touch-manipulation'>
          {state === 'saving' ? (
            <>
              <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />
              Saving…
            </>
          ) : (
            'Yes, save it'
          )}
        </button>
        <button
          type='button'
          onClick={handleDismiss}
          disabled={state === 'saving'}
          className='inline-flex items-center rounded-[var(--radius-pill)] border border-white/30 px-3.5 py-2 text-[13px] font-medium text-white/95 hover:bg-white/10 disabled:opacity-60 touch-manipulation'>
          Not now
        </button>
      </div>
    </div>
  );
}
