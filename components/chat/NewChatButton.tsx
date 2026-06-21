'use client';

import { RotateCcw } from 'lucide-react';

interface NewChatButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function NewChatButton({ onClick, disabled = false }: NewChatButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label='New chat'
      title='New chat'
      className='inline-flex items-center justify-center w-9 h-9 min-w-9 min-h-9 shrink-0 rounded-[var(--radius-md)] border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-primary)] touch-manipulation disabled:opacity-50 disabled:pointer-events-none'>
      <RotateCcw className='w-4 h-4' aria-hidden='true' />
    </button>
  );
}
