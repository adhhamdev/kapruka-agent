import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { KaprukaText } from '@/components/brand/KaprukaLink';
import { APP_NAME } from '@/constants/brand';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex min-h-[100dvh] flex-col items-center justify-center bg-[color:var(--color-paper)] px-6 py-10 text-center'>
      <AgentAvatar size='lg' showRing className='mb-5' />
      <p className='text-[11px] font-semibold uppercase tracking-widest text-[color:var(--color-primary)] mb-2'>
        404
      </p>
      <h1 className='text-[color:var(--color-ink)] text-xl sm:text-2xl font-semibold tracking-tight text-pretty'>
        Page not found
      </h1>
      <p className='mt-2 max-w-sm text-[15px] text-[color:var(--color-ink-2)] leading-relaxed text-pretty'>
        <KaprukaText>{APP_NAME}</KaprukaText> couldn&apos;t find that page. Head
        back home to search gifts, manage your basket, or continue chatting.
      </p>
      <Link
        href='/'
        className='mt-8 inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] px-6 py-3 text-[15px] font-medium text-white transition-[background-color,transform] duration-[var(--dur-short)] ease-[var(--ease-out)] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-focus)] touch-manipulation'>
        Back home
      </Link>
    </div>
  );
}
