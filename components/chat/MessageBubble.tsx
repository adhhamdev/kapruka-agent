'use client';

import { FileText } from 'lucide-react';
import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { MarkdownContent } from '@/components/chat/MarkdownContent';
import { AnimatedWidget } from '@/components/motion/AnimatedWidget';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { WIDGET_ONLY_FALLBACK } from '@/constants/languages';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import {
  DUR_MEDIUM_S,
  EASE_OUT,
  messageBubbleVariants,
} from '@/lib/motion/presets';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { KaprukaAgentUIMessage } from '@/types/agent-ui-message';
import type { Widget } from '@/types/widgets';
import { motion } from 'motion/react';
import Image from 'next/image';

const WIDGET_TOOL_TYPES = new Set([
  'tool-show_products_carousel',
  'tool-show_product_detail',
  'tool-show_delivery_quote',
  'tool-show_checkout_form',
  'tool-show_order_status',
  'tool-show_categories_list',
]);

function isWidgetOutput(value: unknown): value is Widget {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as Widget).type === 'string'
  );
}

function getAssistantText(message: KaprukaAgentUIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');
}

function getWidgetParts(message: KaprukaAgentUIMessage) {
  return message.parts.filter((part) => WIDGET_TOOL_TYPES.has(part.type));
}

function isTextStreaming(message: KaprukaAgentUIMessage): boolean {
  return message.parts.some(
    (part) => part.type === 'text' && part.state === 'streaming',
  );
}

interface MessageBubbleProps {
  message: KaprukaAgentUIMessage;
  cart: CartItem[];
  isStreaming?: boolean;
  onAddToCart: (product: KaprukaProduct) => void;
  onBrowseCategory?: (categoryName: string) => void;
  onViewProductDetail?: (product: KaprukaProduct) => void;
  onLoadMoreCarousel: (messageId: string, widgetIndex: number) => void;
}

export function MessageBubble({
  message,
  cart,
  isStreaming = false,
  onAddToCart,
  onBrowseCategory,
  onViewProductDetail,
  onLoadMoreCarousel,
}: MessageBubbleProps) {
  const reducedMotion = useReducedMotion();
  const isUser = message.role === 'user';
  const isError = Boolean(message.metadata?.isError);
  const fileParts = message.parts.filter((part) => part.type === 'file');
  const widgetParts = getWidgetParts(message);
  const readyWidgets = widgetParts.filter(
    (part) => 'state' in part && part.state === 'output-available' && isWidgetOutput(part.output),
  );

  const rawText = getAssistantText(message);
  const displayText =
    rawText.trim() ||
    (readyWidgets.length > 0 && !isUser ? WIDGET_ONLY_FALLBACK : '');

  const hasAttachments = fileParts.length > 0;
  const hasText = Boolean(displayText.trim());
  const hasWidgets = readyWidgets.length > 0;
  const hasBubble = hasAttachments || hasText;
  const bubbleMotion = isUser
    ? messageBubbleVariants.user
    : messageBubbleVariants.assistant;

  if (!hasBubble && !hasWidgets) return null;

  let widgetRenderIndex = 0;

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
                {fileParts.map((attachment, attachmentIdx) => {
                  if (attachment.type !== 'file') return null;
                  const imageSrc = attachment.mediaType.startsWith('image/')
                    ? attachment.url
                    : undefined;
                  return (
                    <motion.li
                      key={`${attachment.filename ?? attachmentIdx}`}
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
                            alt={attachment.filename ?? 'Attachment'}
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
                            {attachment.filename ?? 'Attachment'}
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
                  isError
                    ? 'chat-bubble-error'
                    : isUser
                      ? 'chat-bubble-user text-white'
                      : 'chat-bubble-assistant'
                }`}>
                <MarkdownContent
                  text={displayText}
                  role={isUser ? 'user' : 'assistant'}
                  isAnimating={!isUser && isStreaming && isTextStreaming(message)}
                />
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
            {widgetParts.map((part) => {
              if (
                !('state' in part) ||
                part.state !== 'output-available' ||
                !isWidgetOutput(part.output)
              ) {
                return null;
              }

              const widget = part.output;
              const currentIndex = widgetRenderIndex;
              widgetRenderIndex += 1;

              return (
                <AnimatedWidget
                  key={`${message.id}-widget-${currentIndex}`}
                  index={currentIndex}>
                  <WidgetRenderer
                    widget={widget}
                    widgetIndex={currentIndex}
                    messageId={message.id}
                    cart={cart}
                    onAddToCart={onAddToCart}
                    onBrowseCategory={onBrowseCategory}
                    onViewProductDetail={onViewProductDetail}
                    onLoadMore={
                      widget.type === 'carousel' && widget.pagination?.nextCursor
                        ? () => onLoadMoreCarousel(message.id, currentIndex)
                        : undefined
                    }
                  />
                </AnimatedWidget>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}
