'use client';

import { Loader2, Trash2, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useSavedInfo } from '@/hooks/use-saved-info';
import { LOCALE_OPTIONS, type AppLocale } from '@/types/locale';
import type { SavedInfoItem } from '@/types/memory';

interface SavedInfoPanelProps {
  open: boolean;
  onClose: () => void;
}

interface SavedInfoSectionProps {
  title: string;
  description: string;
  removeLabel: string;
  removeAria: (text: string) => string;
  items: SavedInfoItem[];
  onRemove: (id: string, text: string) => Promise<boolean>;
  removingId: string | null;
}

function LanguagePreferencePicker() {
  const { locale, setLocale, messages } = useLocale();

  return (
    <section aria-labelledby='saved-info-language-pref'>
      <h3
        id='saved-info-language-pref'
        className='text-[13px] font-semibold text-[color:var(--color-ink)]'>
        {messages.language.preferenceLabel}
      </h3>
      <p className='mt-0.5 text-[12px] text-[color:var(--color-ink-3)] leading-relaxed'>
        {messages.language.preferenceDescription}
      </p>
      <ul className='mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 list-none m-0 p-0'>
        {LOCALE_OPTIONS.map((option) => {
          const isActive = locale === option.code;
          return (
            <li key={option.code}>
              <button
                type='button'
                role='radio'
                aria-checked={isActive}
                onClick={() => setLocale(option.code as AppLocale)}
                className={`w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-[border-color,background-color] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] ${
                  isActive
                    ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)]'
                    : 'border-[color:var(--color-rule)] bg-[color:var(--color-paper)] hover:bg-[color:var(--color-paper-3)]'
                }`}>
                <span className='block text-[14px] font-semibold text-[color:var(--color-ink)]'>
                  {option.nativeLabel}
                </span>
                <span className='block text-[12px] text-[color:var(--color-ink-3)]'>
                  {option.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SavedInfoSection({
  title,
  description,
  removeLabel,
  removeAria,
  items,
  onRemove,
  removingId,
}: SavedInfoSectionProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`saved-info-${title}`}>
      <h3
        id={`saved-info-${title}`}
        className='text-[13px] font-semibold text-[color:var(--color-ink)]'>
        {title}
      </h3>
      <p className='mt-0.5 text-[12px] text-[color:var(--color-ink-3)] leading-relaxed'>
        {description}
      </p>
      <ul className='mt-2.5 space-y-2'>
        {items.map((item) => (
          <li
            key={`${item.id}-${item.text.slice(0, 24)}`}
            className='flex items-start gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-3 py-2.5'>
            <p className='flex-1 min-w-0 text-[13px] text-[color:var(--color-ink-2)] leading-relaxed break-words'>
              {item.text}
            </p>
            <button
              type='button'
              onClick={() => void onRemove(item.id, item.text)}
              disabled={removingId === item.id}
              aria-label={removeAria(item.text)}
              className='shrink-0 inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-[12px] font-medium text-[color:var(--color-ink-3)] hover:text-[color:var(--color-error)] hover:bg-[color:var(--color-paper-3)] disabled:opacity-50 touch-manipulation'>
              {removingId === item.id ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />
              ) : (
                <Trash2 className='w-3.5 h-3.5' aria-hidden='true' />
              )}
              {removeLabel}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SavedInfoPanel({ open, onClose }: SavedInfoPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { messages } = useLocale();
  const { snapshot, isLoading, actionError, totalCount, removeItem, clearAll } =
    useSavedInfo(open);

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

  useEffect(() => {
    if (!open) {
      setConfirmClear(false);
      setRemovingId(null);
    }
  }, [open]);

  const handleRemove = async (id: string, text: string): Promise<boolean> => {
    setRemovingId(id);
    const ok = await removeItem(id, text);
    setRemovingId(null);
    return ok;
  };

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    setIsClearing(true);
    await clearAll();
    setIsClearing(false);
    setConfirmClear(false);
  };

  const showEmpty =
    !isLoading && snapshot.available && totalCount === 0;
  const showUnavailable = !isLoading && !snapshot.available && snapshot.enabled;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby='saved-info-title'
      aria-describedby='saved-info-desc'
      className='welcome-modal fixed inset-0 z-[100] m-0 h-[100dvh] max-h-[100dvh] w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-[color:var(--color-ink)]/45 open:flex open:items-end sm:open:items-center open:justify-center open:p-4 overscroll-contain outline-none'
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role='document'
        className='relative w-full max-w-lg max-h-[min(92dvh,720px)] overflow-y-auto overscroll-y-contain rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] bg-[color:var(--color-paper-2)] shadow-[var(--shadow-elevated)] border border-[color:var(--color-rule-strong)] animate-fade-in touch-manipulation outline-none'
        onClick={(event) => event.stopPropagation()}>
        <button
          type='button'
          onClick={onClose}
          aria-label={messages.savedInfo.close}
          className='absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-[color:var(--color-ink-2)] bg-[color:var(--color-paper-3)] hover:bg-[color:var(--color-paper)] hover:text-[color:var(--color-ink)] transition-[background-color,color] touch-manipulation'>
          <X className='w-4 h-4' aria-hidden='true' />
        </button>

        <div className='px-5 pt-6 pb-4 sm:px-6 border-b border-[color:var(--color-border-subtle)]'>
          <p className='text-[11px] font-semibold uppercase tracking-widest text-[color:var(--color-primary)] mb-2 inline-flex items-center gap-1.5'>
            <UserRound className='w-3.5 h-3.5' aria-hidden='true' />
            {messages.savedInfo.eyebrow}
          </p>
          <h2
            id='saved-info-title'
            className='text-[20px] sm:text-[22px] font-semibold text-[color:var(--color-ink)] leading-tight text-pretty pr-8'>
            {messages.savedInfo.title}
          </h2>
          <p
            id='saved-info-desc'
            className='mt-2 text-[14px] text-[color:var(--color-ink-2)] leading-relaxed text-pretty'>
            {messages.savedInfo.description}
          </p>
        </div>

        <div className='px-5 py-5 sm:px-6 space-y-5'>
          <LanguagePreferencePicker />

          {isLoading && (
            <div className='flex items-center justify-center gap-2 py-8 text-[14px] text-[color:var(--color-ink-3)]'>
              <Loader2 className='w-4 h-4 animate-spin' aria-hidden='true' />
              {messages.savedInfo.loading}
            </div>
          )}

          {showUnavailable && (
            <p className='rounded-[var(--radius-md)] border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-3.5 py-3 text-[13px] text-[color:var(--color-ink-2)] leading-relaxed'>
              {messages.savedInfo.unavailable}
            </p>
          )}

          {!snapshot.enabled && !isLoading && (
            <p className='rounded-[var(--radius-md)] border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-3.5 py-3 text-[13px] text-[color:var(--color-ink-2)] leading-relaxed'>
              {messages.savedInfo.disabled}
            </p>
          )}

          {showEmpty && (
            <p className='rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-3.5 py-4 text-[13px] text-[color:var(--color-ink-2)] leading-relaxed text-center'>
              {messages.savedInfo.empty}
            </p>
          )}

          {!isLoading && snapshot.available && totalCount > 0 && (
            <>
              <SavedInfoSection
                title={messages.savedInfo.peopleTitle}
                description={messages.savedInfo.peopleDescription}
                removeLabel={messages.savedInfo.remove}
                removeAria={messages.savedInfo.removeAria}
                items={snapshot.people}
                onRemove={handleRemove}
                removingId={removingId}
              />
              <SavedInfoSection
                title={messages.savedInfo.addressesTitle}
                description={messages.savedInfo.addressesDescription}
                removeLabel={messages.savedInfo.remove}
                removeAria={messages.savedInfo.removeAria}
                items={snapshot.addresses}
                onRemove={handleRemove}
                removingId={removingId}
              />
              <SavedInfoSection
                title={messages.savedInfo.languageTitle}
                description={messages.savedInfo.languageDescription}
                removeLabel={messages.savedInfo.remove}
                removeAria={messages.savedInfo.removeAria}
                items={snapshot.language}
                onRemove={handleRemove}
                removingId={removingId}
              />
              <SavedInfoSection
                title={messages.savedInfo.preferencesTitle}
                description={messages.savedInfo.preferencesDescription}
                removeLabel={messages.savedInfo.remove}
                removeAria={messages.savedInfo.removeAria}
                items={snapshot.preferences}
                onRemove={handleRemove}
                removingId={removingId}
              />
              <SavedInfoSection
                title={messages.savedInfo.otherTitle}
                description={messages.savedInfo.otherDescription}
                removeLabel={messages.savedInfo.remove}
                removeAria={messages.savedInfo.removeAria}
                items={snapshot.other}
                onRemove={handleRemove}
                removingId={removingId}
              />
            </>
          )}

          {actionError && (
            <p
              role='alert'
              className='rounded-[var(--radius-md)] border border-[color:var(--color-error)]/20 bg-[color:var(--color-paper)] px-3.5 py-3 text-[13px] text-[color:var(--color-error)] leading-relaxed'>
              {actionError}
            </p>
          )}
        </div>

        {!isLoading && snapshot.enabled && snapshot.available && totalCount > 0 && (
          <div className='sticky bottom-0 px-5 py-4 sm:px-6 border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-paper-2)]/95 backdrop-blur-sm pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2'>
            {confirmClear ? (
              <>
                <p className='text-[13px] text-[color:var(--color-ink-2)] leading-relaxed'>
                  {messages.savedInfo.clearConfirm}
                </p>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => void handleClearAll()}
                    disabled={isClearing}
                    className='flex-1 py-3 rounded-[var(--radius-pill)] bg-[color:var(--color-error)] text-white font-semibold text-[14px] hover:opacity-90 disabled:opacity-60 touch-manipulation'>
                    {isClearing
                      ? messages.savedInfo.clearing
                      : messages.savedInfo.clearYes}
                  </button>
                  <button
                    type='button'
                    onClick={() => setConfirmClear(false)}
                    disabled={isClearing}
                    className='flex-1 py-3 rounded-[var(--radius-pill)] border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)] font-semibold text-[14px] hover:bg-[color:var(--color-paper-3)] disabled:opacity-60 touch-manipulation'>
                    {messages.savedInfo.clearCancel}
                  </button>
                </div>
              </>
            ) : (
              <button
                type='button'
                onClick={() => setConfirmClear(true)}
                className='w-full py-3 rounded-[var(--radius-pill)] border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-2)] font-medium text-[14px] hover:bg-[color:var(--color-paper-3)] hover:text-[color:var(--color-error)] touch-manipulation'>
                {messages.savedInfo.clearAll}
              </button>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
