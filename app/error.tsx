'use client';

import Image from 'next/image';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex min-h-[100dvh] flex-col items-center justify-center bg-[color:var(--color-paper)] px-6 text-center'>
      <Image
        src='/logo-square.jpeg'
        alt='Kapruka'
        width={56}
        height={56}
        className='mb-6 rounded-xl object-contain'
      />
      <h1 className='text-[color:var(--color-ink)] text-xl font-semibold tracking-tight'>
        Something went wrong
      </h1>
      <p className='mt-2 max-w-sm text-[15px] text-[color:var(--color-ink-2)] leading-relaxed'>
        We hit an unexpected issue. Please try again — your basket is saved on
        this device.
      </p>
      <button
        type='button'
        onClick={reset}
        className='mt-8 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] px-6 py-3 text-[15px] font-medium text-white transition-transform duration-[var(--dur-short)] ease-[var(--ease-out)] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-focus)]'>
        Try again
      </button>
    </div>
  );
}
