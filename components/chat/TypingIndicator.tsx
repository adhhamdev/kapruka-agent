import { AgentAvatar } from '@/components/chat/AgentAvatar';

export function TypingIndicator() {
  return (
    <div
      className='chat-message-row flex items-end gap-2 min-w-0 max-w-full w-full animate-fade-in'
      role='status'
      aria-live='polite'
      aria-label='Agent is typing'>
      <AgentAvatar />
      <div className='chat-bubble-assistant px-4 py-3 flex items-center gap-1.5 min-h-[44px]'>
        <span
          className='w-2 h-2 bg-[color:var(--color-ink-3)] rounded-full animate-typing-1'
          aria-hidden='true'
        />
        <span
          className='w-2 h-2 bg-[color:var(--color-ink-3)] rounded-full animate-typing-2'
          aria-hidden='true'
        />
        <span
          className='w-2 h-2 bg-[color:var(--color-ink-3)] rounded-full animate-typing-3'
          aria-hidden='true'
        />
      </div>
      <span className='sr-only'>Agent is typing…</span>
    </div>
  );
}
