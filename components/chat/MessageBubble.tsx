'use client';

import { FileText } from 'lucide-react';
import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { MarkdownContent } from '@/components/chat/MarkdownContent';
import { AnimatedWidget } from '@/components/motion/AnimatedWidget';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { resolveAttachmentImageSrc } from '@/lib/attachments';
import {
  DUR_MEDIUM_S,
  EASE_OUT,
  messageBubbleVariants,
} from '@/lib/motion/presets';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { Message } from '@/types/chat';
import { motion } from 'motion/react';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  cart: CartItem[];
  onAddToCart: (product: KaprukaProduct) => void;
}

export function MessageBubble({
  message,
  cart,
  onAddToCart,
}: MessageBubbleProps) {
  const reducedMotion = useReducedMotion();
  const hasAttachments =
    message.attachments && message.attachments.length > 0;
  const isUser = message.role === 'user';
  const hasWidgets = message.widgets && message.widgets.length > 0;
  const hasText = Boolean(message.content?.trim());
  const hasBubble = hasAttachments || hasText;
  const bubbleMotion = isUser
    ? messageBubbleVariants.user
    : messageBubbleVariants.assistant;

  return (
    <motion.article
      layout={false}
      initial={reducedMotion ? false : 'hidden'}
      animate='visible'
      variants={bubbleMotion}
      transition={{ duration: DUR_MEDIUM_S, ease: EASE_OUT }}
      className={`chat-message-row flex flex-col min-w-0 max-w-full w-full ${
        isUser ? 'items-end' : 'items-start'
      }`}
      id={`msg-wrap-${message.id}`}
      aria-label={isUser ? 'Your message' : 'Agent message'}>
      {hasBubble && (
        <div
          className={`flex items-end gap-2 min-w-0 w-full ${
            isUser
              ? 'flex-row-reverse justify-end max-w-[min(100%,18rem)] sm:max-w-[min(100%,22rem)]'
              : 'flex-row justify-start max-w-[min(100%,100%)] sm:max-w-[min(100%,36rem)]'
          }`}>
          {!isUser && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}>
              <AgentAvatar />
            </motion.div>
          )}

          <div className='space-y-2 min-w-0 flex-1 max-w-full'>
            {hasAttachments && (
              <ul
                className={`flex flex-wrap gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                aria-label='Message attachments'>
                {message.attachments!.map((attachment, attachmentIdx) => {
                  const imageSrc =
                    attachment.kind === 'image'
                      ? resolveAttachmentImageSrc(
                          attachment,
                          message.attachmentPreviews?.[attachment.name],
                        )
                      : undefined;
                  return (
                    <motion.li
                      key={attachment.name}
                      initial={
                        reducedMotion ? false : { opacity: 0, scale: 0.94 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.22,
                        delay: attachmentIdx * 0.05,
                        ease: EASE_OUT,
                      }}
                      className='shrink-0 max-w-full min-w-0'>
                      {imageSrc ? (
                        <div className='relative w-24 h-24 rounded-[12px] overflow-hidden border border-[color:var(--color-border-default)] bg-[color:var(--color-bg-base)]'>
                          <Image
                            src={imageSrc}
                            alt={attachment.name}
                            fill
                            sizes='96px'
                            unoptimized
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='flex items-center gap-2 px-3 py-2 rounded-[12px] border border-[color:var(--color-border-default)] bg-[color:var(--color-paper-2)] max-w-[min(100%,12.5rem)] min-w-0'>
                          <FileText
                            className='w-4 h-4 shrink-0 text-[color:var(--color-primary)]'
                            aria-hidden='true'
                          />
                          <span className='text-[12px] text-[color:var(--color-ink)] truncate min-w-0'>
                            {attachment.name}
                          </span>
                        </div>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            )}

            {hasText && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: EASE_OUT }}
                className={`px-3.5 sm:px-4 py-2.5 sm:py-3 text-[15px] leading-relaxed break-words min-w-0 max-w-full [overflow-wrap:anywhere] ${
                  message.isError
                    ? 'chat-bubble-error'
                    : isUser
                      ? 'chat-bubble-user text-white'
                      : 'chat-bubble-assistant'
                }`}>
                <MarkdownContent text={message.content} role={message.role} />
              </motion.div>
            )}
          </div>
        </div>
      )}

      {hasWidgets && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.06, ease: EASE_OUT }}
          className={`flex items-start gap-2 min-w-0 w-full mt-1.5 sm:mt-2 ${
            isUser ? 'justify-end max-w-[min(100%,18rem)]' : 'justify-start max-w-full'
          }`}>
          {!isUser && !hasBubble && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}>
              <AgentAvatar />
            </motion.div>
          )}
          {!isUser && hasBubble && (
            <div className='w-8 shrink-0' aria-hidden='true' />
          )}

          <div className='chat-widget-slot min-w-0 flex-1 max-w-full space-y-3 overflow-hidden'>
            {message.widgets!.map((widget, idx) => (
              <AnimatedWidget key={`${message.id}-widget-${idx}`} index={idx}>
                <WidgetRenderer
                  widget={widget}
                  cart={cart}
                  onAddToCart={onAddToCart}
                />
              </AnimatedWidget>
            ))}
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}
