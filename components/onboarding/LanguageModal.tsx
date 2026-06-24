'use client';

import { Languages } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getMessages } from '@/lib/i18n';
import { LOCALE_OPTIONS, type AppLocale } from '@/types/locale';

interface LanguageModalProps {
  open: boolean;
  onComplete: (locale: AppLocale) => void;
}

export function LanguageModal({ open, onComplete }: LanguageModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<AppLocale>('en');
  const messages = getMessages(selected);

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

  const handleContinue = () => {
    onComplete(selected);
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby='language-modal-title'
      aria-describedby='language-modal-desc'
      className='welcome-modal fixed inset-0 z-[110] m-0 h-[100dvh] max-h-[100dvh] w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-[color:var(--color-ink)]/45 open:flex open:items-end sm:open:items-center open:justify-center open:p-4 overscroll-contain outline-none'
      onCancel={(event) => event.preventDefault()}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role='document'
        className='relative w-full max-w-lg overflow-y-auto overscroll-y-contain rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] bg-[color:var(--color-paper-2)] shadow-[var(--shadow-elevated)] border border-[color:var(--color-rule-strong)] animate-fade-in touch-manipulation outline-none'>
        <div className='px-5 pt-6 pb-5 sm:px-6 border-b border-[color:var(--color-border-subtle)] text-center'>
          <p className='text-[11px] font-semibold uppercase tracking-widest text-[color:var(--color-primary)] mb-2 inline-flex items-center gap-1.5'>
            <Languages className='w-3.5 h-3.5' aria-hidden='true' />
            {messages.language.modalEyebrow}
          </p>
          <h2
            id='language-modal-title'
            className='text-[22px] sm:text-[24px] font-semibold text-[color:var(--color-ink)] leading-tight text-pretty'>
            {messages.language.modalTitle}
          </h2>
          <p
            id='language-modal-desc'
            className='mt-2 text-[14px] text-[color:var(--color-ink-2)] leading-relaxed text-pretty'>
            {messages.language.modalDescription}
          </p>
        </div>

        <div className='px-5 py-5 sm:px-6'>
          <fieldset className='m-0 p-0 border-0 min-w-0'>
            <legend className='sr-only'>{messages.language.modalTitle}</legend>
            <ul className='grid gap-2 list-none m-0 p-0'>
              {LOCALE_OPTIONS.map((option) => {
                const isSelected = selected === option.code;
                return (
                  <li key={option.code}>
                    <button
                      type='button'
                      role='radio'
                      aria-checked={isSelected}
                      onClick={() => setSelected(option.code)}
                      className={`w-full text-left rounded-[var(--radius-md)] border px-4 py-3.5 transition-[border-color,background-color,box-shadow] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 ${
                        isSelected
                          ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] shadow-[var(--shadow-sm)]'
                          : 'border-[color:var(--color-rule)] bg-[color:var(--color-paper)] hover:bg-[color:var(--color-paper-3)]'
                      }`}>
                      <span className='block text-[16px] font-semibold text-[color:var(--color-ink)] leading-snug'>
                        {option.nativeLabel}
                      </span>
                      <span className='block text-[13px] text-[color:var(--color-ink-2)] mt-0.5'>
                        {option.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </div>

        <div className='sticky bottom-0 px-5 py-4 sm:px-6 border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-paper-2)]/95 backdrop-blur-sm pb-[max(1rem,env(safe-area-inset-bottom))]'>
          <button
            type='button'
            onClick={handleContinue}
            className='w-full py-3.5 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white font-semibold text-[15px] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.98] transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 touch-manipulation'>
            {messages.language.continue}
          </button>
        </div>
      </div>
    </dialog>
  );
}