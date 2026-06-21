'use client';

const SKELETON_ROWS = [
  { align: 'start' as const, showAvatar: true, width: 'w-[min(100%,16rem)]' },
  { align: 'end' as const, showAvatar: false, width: 'w-[min(100%,12rem)]' },
  { align: 'start' as const, showAvatar: true, width: 'w-[min(100%,20rem)]' },
];

export function ChatSessionLoading() {
  return (
    <div
      className='relative flex-1 min-h-0 min-w-0 flex flex-col'
      aria-busy='true'
      aria-live='polite'
      aria-label='Restoring your conversation'>
      <div className='chat-messages flex-1 min-h-0 min-w-0 w-full overflow-hidden'>
        <div className='w-full min-w-0 py-4 md:py-6 space-y-4 sm:space-y-6'>
          <div className='chat-message-gutter space-y-4 sm:space-y-6'>
          {SKELETON_ROWS.map((row, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 min-w-0 w-full ${
                row.align === 'end' ? 'justify-end' : 'justify-start'
              }`}>
              {row.showAvatar && (
                <div
                  className='chat-skeleton w-8 h-8 rounded-full shrink-0'
                  aria-hidden='true'
                />
              )}
              <div
                className={`chat-skeleton h-[4.5rem] rounded-[var(--radius-lg)] ${row.width} min-w-0`}
                aria-hidden='true'
              />
            </div>
          ))}
          <p className='sr-only'>Loading your previous conversation…</p>
          </div>
        </div>
      </div>
    </div>
  );
}
