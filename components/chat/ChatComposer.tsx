'use client';

import { AttachmentPreview } from '@/components/chat/AttachmentPreview';
import { LiveVoiceBar } from '@/components/chat/LiveVoiceBar';
import { useLocale } from '@/components/providers/LocaleProvider';
import {
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENTS,
} from '@/constants/languages';
import { useAttachments } from '@/hooks/use-attachments';
import type { LiveConnectionState } from '@/hooks/use-gemini-live';
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
  liveState?: LiveConnectionState;
  isLiveActive?: boolean;
  liveError?: string | null;
  onStartLive?: () => void;
  onStopLive?: () => void;
  onClearLiveError?: () => void;
}

const iconButtonClass =
  'rounded-full flex items-center justify-center transition-[background-color,transform,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none touch-manipulation';

const composerControlClass = `${iconButtonClass} w-11 h-11 min-w-11 min-h-11 shrink-0`;
const composerIconClass = 'w-5 h-5';

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isPending,
  disabled = false,
  speechLanguageCode,
  liveState = 'idle',
  isLiveActive = false,
  liveError = null,
  onStartLive,
  onStopLive,
  onClearLiveError,
}: ChatComposerProps) {
  const { messages } = useLocale();
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
    isListening: isDictating,
    isProcessing,
    isRequestingPermission,
    isSupported: isDictationSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    languageCode: speechLanguageCode,
    onResult: (transcript) => {
      onChange(transcript.trim());
    },
  });

  const isLiveConnecting =
    liveState === 'connecting' || liveState === 'reconnecting';
  const useLiveVoice = Boolean(onStartLive && onStopLive);
  const isMicActive = isLiveActive || isDictating;

  const hasComposerContent = value.trim().length > 0 || attachments.length > 0;

  const showRightActionLoader =
    isProcessing || isRequestingPermission || isLiveConnecting;

  const showSendButton =
    !showRightActionLoader && !isDictating && hasComposerContent;

  const showStopVoice =
    !showRightActionLoader &&
    (isDictating || (isLiveActive && !hasComposerContent));

  const showMicButton =
    !showRightActionLoader &&
    !showSendButton &&
    !showStopVoice &&
    (useLiveVoice || isDictationSupported);

  const canSend =
    !disabled &&
    !isPending &&
    !isDictating &&
    !isLiveConnecting &&
    (value.trim().length > 0 || attachments.length > 0);

  const atAttachmentLimit = attachments.length >= MAX_ATTACHMENTS;

  const voiceAriaLabel = (state: VoiceState, requestingPermission: boolean) => {
    if (isLiveActive) return messages.composer.stopLiveVoice;
    if (requestingPermission) return messages.composer.requestingMic;
    if (useLiveVoice) return messages.composer.startLiveVoice;
    switch (state) {
      case 'listening':
        return messages.composer.stopVoice;
      case 'processing':
        return messages.composer.processingVoice;
      case 'unsupported':
        return messages.composer.voiceUnsupported;
      default:
        return messages.composer.startVoice;
    }
  };

  const inputDisabled =
    disabled ||
    isPending ||
    isDictating ||
    isRequestingPermission ||
    isLiveConnecting;

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
    if (disabled || isPending || isRequestingPermission || isLiveConnecting) {
      return;
    }

    clearVoiceError();
    onClearLiveError?.();

    if (isLiveActive) {
      void onStopLive?.();
      return;
    }

    if (useLiveVoice) {
      void onStartLive?.();
      return;
    }

    if (!isDictationSupported) return;
    if (isDictating) {
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

        <LiveVoiceBar
          liveState={liveState}
          liveError={liveError}
          onClearError={onClearLiveError}
        />

        {(attachmentError ||
          voiceError ||
          (!useLiveVoice && voiceState === 'unsupported')) && (
          <p
            className='text-[12px] text-[color:var(--color-error)] px-1'
            role='status'
            aria-live='polite'>
            {attachmentError ??
              voiceError ??
              (!useLiveVoice && voiceState === 'unsupported'
                ? messages.composer.voiceUnsupportedBrowser
                : null)}
          </p>
        )}

        {!attachmentError && attachments.length > 0 && (
          <p className='text-[11px] text-[color:var(--color-ink-3)] px-1'>
            {messages.composer.attachmentHint(
              attachments.length,
              MAX_ATTACHMENTS,
            )}
          </p>
        )}

        {isRequestingPermission && !isLiveActive && (
          <p
            className='text-[12px] text-[color:var(--color-ink-2)] px-1'
            role='status'
            aria-live='polite'>
            {messages.composer.allowMic}
          </p>
        )}

        {isDictating && !isLiveActive && (
          <p
            className='text-[12px] text-[color:var(--color-primary)] px-1 flex items-center gap-2'
            role='status'
            aria-live='polite'>
            <span className='inline-flex gap-1' aria-hidden='true'>
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-1' />
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-2' />
              <span className='w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)] animate-typing-3' />
            </span>
            {messages.composer.listening}
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
            className={`chat-composer-field flex-1 min-w-0 flex items-center gap-1.5 min-h-[52px] bg-[color:var(--color-paper-2)] rounded-[var(--radius-pill)] pl-1.5 pr-1.5 py-1 shadow-[var(--shadow-elevated)] ${
              isMicActive ? 'is-listening' : ''
            }`}>
            <button
              type='button'
              disabled={
                disabled ||
                isPending ||
                isMicActive ||
                atAttachmentLimit ||
                isLiveActive
              }
              onClick={() => fileInputRef.current?.click()}
              aria-label={
                atAttachmentLimit
                  ? messages.composer.attachLimit
                  : messages.composer.attach
              }
              className={`${composerControlClass} text-[color:var(--color-ink-2)] hover:text-[color:var(--color-primary)] hover:bg-[color:var(--color-paper-3)]`}>
              <Paperclip className={composerIconClass} aria-hidden='true' />
            </button>

            <label htmlFor='chat-message' className='sr-only'>
              {messages.composer.messageLabel}
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
              placeholder={
                isDictating
                  ? messages.composer.listeningPlaceholder
                  : isLiveActive
                    ? messages.composer.livePlaceholder
                    : messages.composer.placeholder
              }
              className='chat-composer-input flex-1 min-w-0 w-0 basis-0 bg-transparent text-[16px] leading-normal text-[color:var(--color-ink)] min-h-[44px] py-2.5 px-1 placeholder-[color:var(--color-text-tertiary)] placeholder:transition-colors focus:placeholder-[color:var(--color-ink-3)]'
            />

            {showRightActionLoader ? (
              <span
                className={`${composerControlClass} text-[color:var(--color-ink-3)]`}
                aria-hidden='true'>
                <Loader2
                  className={`${composerIconClass} animate-spin`}
                  aria-hidden='true'
                />
              </span>
            ) : showSendButton ? (
              <button
                type='submit'
                disabled={!canSend}
                aria-label={
                  isPending ? messages.composer.sending : messages.composer.send
                }
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
            ) : showStopVoice ? (
              <button
                type='button'
                disabled={disabled || isPending}
                onClick={handleVoiceClick}
                aria-label={voiceAriaLabel(voiceState, isRequestingPermission)}
                aria-pressed
                className={`${composerControlClass} bg-red-500 text-white hover:bg-red-600 animate-status-pulse active:scale-[0.96]`}>
                <Square className='w-4 h-4 fill-current' aria-hidden='true' />
              </button>
            ) : showMicButton ? (
              <button
                type='button'
                disabled={
                  disabled ||
                  isPending ||
                  (!useLiveVoice && !isDictationSupported)
                }
                onClick={handleVoiceClick}
                aria-label={voiceAriaLabel(voiceState, isRequestingPermission)}
                className={`${composerControlClass} chat-mic-attract bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)] shadow-sm ring-2 ring-[color:var(--color-primary)]/30 active:scale-[0.96]`}>
                <Mic
                  className={composerIconClass}
                  strokeWidth={2.25}
                  aria-hidden='true'
                />
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
