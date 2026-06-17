export function TypingIndicator() {
  return (
    <div
      className='flex items-center gap-2 pl-9 animate-fade-in opacity-60'
      role='status'
      aria-live='polite'
      aria-label='Agent is typing'>
      <div className='w-1.5 h-1.5 bg-[color:var(--color-text-tertiary)] rounded-full animate-typing-1' />
      <div className='w-1.5 h-1.5 bg-[color:var(--color-text-tertiary)] rounded-full animate-typing-2' />
      <div className='w-1.5 h-1.5 bg-[color:var(--color-text-tertiary)] rounded-full animate-typing-3' />
      <span className='sr-only'>Agent is typing…</span>
    </div>
  );
}
