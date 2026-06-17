'use client';

import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Loader2,
  Mic,
  Paperclip,
  Square,
} from 'lucide-react';
import { AttachmentPreview } from '@/components/chat/AttachmentPreview';
import { ACCEPTED_ATTACHMENT_TYPES } from '@/constants/languages';
import { useAttachments } from '@/hooks/use-attachments';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import type { ChatAttachment } from '@/types/attachments';
import type { VoiceState } from '@/hooks/use-speech-recognition';

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string, attachments: ChatAttachment[]) => void;
  isPending: boolean;
  disabled?: boolean;
  speechLanguageCode: string;
}

const iconButtonClass =
  'rounded-full flex items-center justify-center transition-[background-color,transform,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const inlineIconButtonClass = `${iconButtonClass} w-9 h-9 min-w-9 min-h-9 shrink-0`;
const sendButtonClass = `${iconButtonClass} w-11 h-11 min-w-11 min-h-11 shrink-0`;

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
      onChange(transcript);
    },
  });

  const canSend =
    !disabled &&
    !isPending &&
    !isListening &&
    (value.trim().length > 0 || attachments.length > 0);

  const inputDisabled =
    disabled || isPending || isListening || isRequestingPermission;

  useEffect(() => {
    if (inputDisabled) return;
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
    <div className='absolute bottom-15 left-0 right-0 p-3 pb-[calc(env(safe-area-inset-bottom)+10px)] lg:pb-4 ios-glass border-t flex flex-col gap-2 z-20 min-w-0'>
      <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />

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
          <span className='inline-flex gap-1'>
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
        className='flex items-end gap-2 min-w-0 w-full'
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

        <div className='flex-1 min-w-0 flex items-end gap-1.5 sm:gap-2 bg-[color:var(--color-paper)] border border-[color:var(--color-rule-strong)] rounded-[var(--radius-lg)] focus-within:ring-2 focus-within:ring-[color:var(--color-primary)]/10 transition-[border-color,box-shadow] pl-1.5 pr-2 py-1.5 sm:pl-2 sm:pr-3 sm:py-2'>
          <div className='flex shrink-0 items-center gap-0.5'>
            <button
              type='button'
              disabled={disabled || isPending || isListening}
              onClick={() => fileInputRef.current?.click()}
              aria-label='Attach image or file'
              className={`${inlineIconButtonClass} text-[color:var(--color-ink-2)] hover:text-[color:var(--color-primary)]`}>
              <Paperclip className='w-[18px] h-[18px]' aria-hidden='true' />
            </button>

            <button
              type='button'
              disabled={disabled || isPending || !isSupported || isRequestingPermission}
              onClick={handleVoiceClick}
              aria-label={voiceAriaLabel(voiceState, isRequestingPermission)}
              aria-pressed={isListening}
              className={`${inlineIconButtonClass} ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-status-pulse'
                  : isProcessing || isRequestingPermission
                    ? 'text-[color:var(--color-ink-3)]'
                    : 'text-[color:var(--color-ink-2)] hover:text-[color:var(--color-primary)]'
              }`}>
              {isProcessing || isRequestingPermission ? (
                <Loader2 className='w-[18px] h-[18px] animate-spin' aria-hidden='true' />
              ) : isListening ? (
                <Square className='w-3.5 h-3.5 fill-current' aria-hidden='true' />
              ) : (
                <Mic className='w-[18px] h-[18px]' aria-hidden='true' />
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
            autoFocus
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={inputDisabled}
            placeholder={isListening ? 'Listening…' : 'Message Agent…'}
            className='flex-1 min-w-0 w-0 basis-0 bg-transparent text-[16px] focus:outline-none min-h-[36px] sm:min-h-[44px] placeholder-[color:var(--color-text-tertiary)]'
          />
        </div>

        <button
          type='submit'
          disabled={!canSend}
          aria-label={isPending ? 'Sending message…' : 'Send message'}
          className={`${sendButtonClass} bg-[color:var(--color-primary)] disabled:bg-[color:var(--color-paper-3)] disabled:text-[color:var(--color-ink-3)] text-white shadow-[var(--shadow-sm)] hover:bg-[color:var(--color-primary-hover)] active:scale-[0.96]`}>
          {isPending ? (
            <Loader2 className='w-5 h-5 animate-spin' aria-hidden='true' />
          ) : (
            <ArrowRight className='w-5 h-5' aria-hidden='true' />
          )}
        </button>
      </form>
    </div>
  );
}
