'use client';

import { AttachmentPreview } from '@/components/chat/AttachmentPreview';
import {
  ACCEPTED_ATTACHMENT_TYPES,
  ATTACHMENT_HINT,
  MAX_ATTACHMENTS,
} from '@/constants/languages';
import { useAttachments } from '@/hooks/use-attachments';
import type { VoiceState } from '@/hooks/use-speech-recognition';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import type { ChatAttachment } from '@/types/attachments';
import { ArrowUp, Loader2, Mic, Paperclip, Square } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string, attachments: ChatAttachment[]) => void;
  isPending: boolean;
  disabled?: boolean;
  speechLanguageCode: string;
}

const iconButtonClass =
  'rounded-full flex items-center justify-center transition-[background-color,transform,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none touch-manipulation';

const composerControlClass = `${iconButtonClass} w-11 h-11 min-w-11 min-h-11 shrink-0`;
const composerIconClass = 'w-5 h-5';

function voiceAriaLabel(
  state: VoiceState,
  isRequestingPermission: boolean,
): string {
  if (isRequestingPermission) return 'Requesting microphone permission…';
  switch (state) {
    case 'listening':
      return 'Stop voice input';
    case 'processing':
      return 'Processing voice input…';
    case 'unsupported':
      return 'Voice input not supported in this browser';
    default:
      return 'Start voice input';
  }
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isPending,
  disabled = false,
  speechLanguageCode,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const {
    attachments,
    attachmentError,
    addFiles,
    removeAttachment,
    clearAttachments,
  } = useAttachments();

  const {
    voiceState,
    voiceError,
    clearVoiceError,
    isListening,
    isProcessing,
    isRequestingPermission,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    languageCode: speechLanguageCode,
    onResult: (transcript) => {
      onChange(transcript.trim());
    },
  });

  const canSend =
    !disabled &&
    !isPending &&
    !isListening &&
    (value.trim().length > 0 || attachments.length > 0);

  const atAttachmentLimit = attachments.length >= MAX_ATTACHMENTS;

  const inputDisabled =
    disabled || isPending || isListening || isRequestingPermission;

  useEffect(() => {
    if (inputDisabled) return;
    const prefersDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!prefersDesktop) return;
    requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  }, [inputDisabled]);

  const handleSubmit = () => {
    if (!canSend) return;
    onSubmit(value, attachments);
    clearAttachments();
  };

  const handleVoiceClick = () => {
    if (!isSupported || disabled || isPending || isRequestingPermission) return;
    clearVoiceError();
    if (isListening) {
      stopListening();
    } else {
      void startListening();
    }
  };

  return (
    <div className='chat-composer absolute inset-x-0 bottom-0 z-20 min-w-0 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none'>
      <div className='mx-auto w-full max-w-3xl flex flex-col gap-2 min-w-0 pointer-events-auto'>
        <AttachmentPreview
          attachments={attachments}
          onRemove={removeAttachment}
        />

        {(attachmentError || voiceError || voiceState === 'unsupported') && (
          <p
            className='text-[12px] text-[color:var(--color-error)] px-1'
            role='status'
            aria-live='polite'>
            {attachmentError ??
              voiceError ??
              (voiceState === 'unsupported'
                ? 'Voice input is not supported in this browser.'
                : null)}
          </p>
        )}

        {!attachmentError && attachments.length > 0 && (
          <p className='text-[11px] text-[color:var(--color-ink-3)] px-1'>
            {attachments.length}/{MAX_ATTACHMENTS} files · {ATTACHMENT_HINT}
          </p>
        )}

        {isRequestingPermission && (
          <p
            className='text-[12px] text-[color:var(--color-ink-2)] px-1'
            role='status'
            aria-live='polite'>
            Allow microphone access in the browser prompt to use voice input.
          </p>
        )}

        {isListening && (
          <p
            className='text-[12px] text-[color:var(--color-primary)] px-1 flex items-center gap-2'
            role='status'
            aria-live='polite'>
            <span className='inline-flex gap-1' aria-hidden='true'>
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-1' />
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-2' />
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-3' />
            </span>
            Listening… tap stop when finished
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className='flex items-center gap-2 min-w-0 w-full'
          aria-busy={isPending || isProcessing || isRequestingPermission}>
          <input
            ref={fileInputRef}
            type='file'
            accept={ACCEPTED_ATTACHMENT_TYPES}
            multiple
            className='sr-only'
            onChange={(e) => {
              if (e.target.files?.length) {
                void addFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />

          <div
            className={`chat-composer-field flex-1 min-w-0 flex items-center gap-1.5 min-h-[56px] bg-[color:var(--color-paper-2)] rounded-[var(--radius-pill)] pl-1.5 pr-1.5 py-1 shadow-[var(--shadow-elevated)] ${
              isListening ? 'is-listening' : ''
            }`}>
            <div className='flex shrink-0 items-center'>
              <button
                type='button'
                disabled={
                  disabled || isPending || isListening || atAttachmentLimit
                }
                onClick={() => fileInputRef.current?.click()}
                aria-label={
                  atAttachmentLimit
                    ? `Maximum ${MAX_ATTACHMENTS} attachments reached`
                    : 'Attach image or document'
                }
                className={`${composerControlClass} text-[color:var(--color-ink-2)] hover:text-[color:var(--color-primary)] hover:bg-[color:var(--color-paper-3)]`}>
                <Paperclip className={composerIconClass} aria-hidden='true' />
              </button>

              <button
                type='button'
                disabled={
                  disabled ||
                  isPending ||
                  !isSupported ||
                  isRequestingPermission
                }
                onClick={handleVoiceClick}
                aria-label={voiceAriaLabel(voiceState, isRequestingPermission)}
                aria-pressed={isListening}
                className={`${composerControlClass} ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-status-pulse'
                    : isProcessing || isRequestingPermission
                      ? 'text-[color:var(--color-ink-3)]'
                      : 'text-[color:var(--color-ink-2)] hover:text-[color:var(--color-primary)] hover:bg-[color:var(--color-paper-3)]'
                }`}>
                {isProcessing || isRequestingPermission ? (
                  <Loader2
                    className={`${composerIconClass} animate-spin`}
                    aria-hidden='true'
                  />
                ) : isListening ? (
                  <Square className='w-4 h-4 fill-current' aria-hidden='true' />
                ) : (
                  <Mic className={composerIconClass} aria-hidden='true' />
                )}
              </button>
            </div>

            <label htmlFor='chat-message' className='sr-only'>
              Message to Agent
            </label>
            <input
              ref={messageInputRef}
              id='chat-message'
              name='message'
              type='text'
              autoComplete='off'
              spellCheck={false}
              enterKeyHint='send'
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={inputDisabled}
              placeholder={isListening ? 'Listening…' : 'Ask Kapruka Agent…'}
              className='chat-composer-input flex-1 min-w-0 w-0 basis-0 bg-transparent text-[16px] leading-normal text-[color:var(--color-ink)] min-h-[44px] py-2.5 px-1 placeholder-[color:var(--color-text-tertiary)] placeholder:transition-colors focus:placeholder-[color:var(--color-ink-3)]'
            />

            <button
              type='submit'
              disabled={!canSend}
              aria-label={isPending ? 'Sending message…' : 'Send message'}
              className={`${composerControlClass} ${
                canSend
                  ? 'bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)] shadow-sm'
                  : 'bg-[color:var(--color-paper-3)] text-[color:var(--color-ink-3)]'
              } active:scale-[0.96] disabled:pointer-events-none`}>
              {isPending ? (
                <Loader2
                  className={`${composerIconClass} animate-spin`}
                  aria-hidden='true'
                />
              ) : (
                <ArrowUp className={composerIconClass} aria-hidden='true' />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
