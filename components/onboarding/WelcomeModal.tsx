'use client';

import { KaprukaText } from '@/components/brand/KaprukaLink';
import { APP_NAME } from '@/constants/brand';
import {
  WELCOME_CAPABILITIES,
  WELCOME_ILLUSTRATION_ALT,
  WELCOME_ILLUSTRATION_SRC,
  WELCOME_INTRO,
  WELCOME_MODAL_TITLE,
  WELCOME_YOU_CAN,
} from '@/constants/welcome';
import { useWelcomeModal } from '@/hooks/use-welcome-modal';
import { Check, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export function WelcomeModal() {
  const { open, dismiss } = useWelcomeModal();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => {
        panelRef.current?.focus({ preventScroll: true });
      });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby='welcome-modal-title'
      aria-describedby='welcome-modal-desc'
      className='welcome-modal fixed inset-0 z-[100] m-0 h-[100dvh] max-h-[100dvh] w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-[color:var(--color-ink)]/45 open:flex open:items-end sm:open:items-center open:justify-center open:p-4 overscroll-contain outline-none focus:outline-none focus-visible:outline-none'
      onClose={dismiss}
      onClick={(e) => {
        if (e.target === dialogRef.current) dismiss();
      }}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role='document'
        className='relative w-full max-w-lg max-h-[min(92dvh,720px)] overflow-y-auto overscroll-y-contain rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] bg-[color:var(--color-paper-2)] shadow-[var(--shadow-elevated)] border border-[color:var(--color-rule-strong)] animate-fade-in touch-manipulation outline-none focus:outline-none focus-visible:outline-none'
        onClick={(e) => e.stopPropagation()}>
        <button
          type='button'
          onClick={dismiss}
          aria-label='Close welcome dialog'
          className='absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white/90 bg-black/45 hover:bg-black/60 hover:text-white transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 touch-manipulation'>
          <X className='w-4 h-4' aria-hidden='true' />
        </button>

        <figure className='relative w-full aspect-[2/3] max-h-[min(42dvh,280px)] sm:max-h-[320px] shrink-0 overflow-hidden rounded-t-[var(--radius-xl)]'>
          <Image
            src={WELCOME_ILLUSTRATION_SRC}
            alt={WELCOME_ILLUSTRATION_ALT}
            width={1024}
            height={1536}
            priority
            sizes='(max-width: 640px) 100vw, 512px'
            className='h-full w-full object-contain object-center'
          />
        </figure>

        <div className='px-5 pt-6 pb-5 sm:px-6 sm:pt-7 sm:pb-6 text-center border-b border-[color:var(--color-border-subtle)]'>
          <p className='text-[11px] font-semibold uppercase tracking-widest text-[color:var(--color-primary)] mb-2 inline-flex items-center gap-1.5'>
            <Sparkles className='w-3.5 h-3.5' aria-hidden='true' />
            New here?
          </p>
          <h2
            id='welcome-modal-title'
            className='text-[22px] sm:text-[24px] font-semibold text-[color:var(--color-ink)] leading-tight text-pretty'>
            <KaprukaText>{WELCOME_MODAL_TITLE}</KaprukaText>
          </h2>
          <p
            id='welcome-modal-desc'
            className='mt-2 text-[14px] text-[color:var(--color-ink-2)] leading-relaxed text-pretty'>
            <KaprukaText>{WELCOME_INTRO}</KaprukaText>
          </p>
        </div>

        <div className='px-5 py-5 sm:px-6 space-y-5'>
          <section aria-labelledby='welcome-what-agent-does'>
            <h3
              id='welcome-what-agent-does'
              className='text-[12px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-3)] mb-3'>
              What <KaprukaText>{APP_NAME}</KaprukaText> does for you
            </h3>
            <ul className='space-y-3'>
              {WELCOME_CAPABILITIES.map((item) => (
                <li
                  key={item.title}
                  className='flex gap-3 text-left rounded-[var(--radius-md)] border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-3.5 py-3'>
                  <span
                    className='mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[color:var(--color-primary-light)] text-[color:var(--color-primary)] flex items-center justify-center'
                    aria-hidden='true'>
                    <Check className='w-3 h-3' strokeWidth={2.5} />
                  </span>
                  <div className='min-w-0'>
                    <p className='text-[14px] font-medium text-[color:var(--color-ink)] leading-snug'>
                      {item.title}
                    </p>
                    <p className='text-[13px] text-[color:var(--color-ink-2)] leading-relaxed mt-0.5'>
                      <KaprukaText>{item.description}</KaprukaText>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby='welcome-you-can'>
            <h3
              id='welcome-you-can'
              className='text-[12px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-3)] mb-2.5'>
              What you can do
            </h3>
            <ul className='grid gap-2'>
              {WELCOME_YOU_CAN.map((line) => (
                <li
                  key={line}
                  className='flex items-start gap-2 text-[13px] text-[color:var(--color-ink-2)] text-left'>
                  <Check
                    className='w-4 h-4 shrink-0 mt-0.5 text-[color:var(--color-primary)]'
                    aria-hidden='true'
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className='sticky bottom-0 px-5 py-4 sm:px-6 border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-paper-2)]/95 backdrop-blur-sm pb-[max(1rem,env(safe-area-inset-bottom))]'>
          <button
            type='button'
            onClick={dismiss}
            className='w-full py-3.5 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white font-semibold text-[15px] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98] transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 touch-manipulation'>
            Get Started
          </button>
        </div>
      </div>
    </dialog>
  );
}
