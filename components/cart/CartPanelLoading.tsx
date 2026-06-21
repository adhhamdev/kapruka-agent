'use client';

const SKELETON_ITEMS = [0, 1];

export function CartPanelLoading() {
  return (
    <>
      <div className='shrink-0 flex items-center justify-between p-5 border-b border-[color:var(--color-border-subtle)]'>
        <div className='chat-skeleton h-6 w-20 rounded-[var(--radius-md)]' aria-hidden='true' />
        <div className='flex items-center gap-2 shrink-0'>
          <div
            className='chat-skeleton h-7 w-[5.5rem] rounded-full'
            aria-hidden='true'
          />
          <div
            className='chat-skeleton w-8 h-8 rounded-[var(--radius-md)]'
            aria-hidden='true'
          />
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-hidden p-5 space-y-4' aria-hidden='true'>
        {SKELETON_ITEMS.map((index) => (
          <div
            key={index}
            className='flex gap-3 rounded-[16px] border border-[color:var(--color-border-subtle)] p-3'>
            <div className='chat-skeleton w-[60px] h-[60px] rounded-[10px] shrink-0' />
            <div className='flex-1 min-w-0 space-y-2 py-0.5'>
              <div className='chat-skeleton h-4 w-[min(100%,11rem)] rounded-[var(--radius-sm)]' />
              <div className='chat-skeleton h-3.5 w-16 rounded-[var(--radius-sm)]' />
              <div className='flex items-center justify-between pt-1'>
                <div className='chat-skeleton h-7 w-24 rounded-full' />
                <div className='chat-skeleton w-6 h-6 rounded-full' />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='shrink-0 p-5 bg-[color:var(--color-bg-base)] border-t border-[color:var(--color-border-subtle)] pb-[calc(env(safe-area-inset-bottom)+1.25rem)] md:pb-5'>
        <div className='flex justify-between items-center mb-4'>
          <div className='chat-skeleton h-4 w-12 rounded-[var(--radius-sm)]' aria-hidden='true' />
          <div className='chat-skeleton h-6 w-24 rounded-[var(--radius-sm)]' aria-hidden='true' />
        </div>
        <div className='chat-skeleton h-[3.25rem] w-full rounded-[var(--radius-md)]' aria-hidden='true' />
        <p className='sr-only'>Loading your basket…</p>
      </div>
    </>
  );
}
