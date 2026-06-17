'use client';

import { FileText } from 'lucide-react';
import { resolveAttachmentImageSrc } from '@/lib/attachments';
import Image from 'next/image';
import { MarkdownContent } from '@/components/chat/MarkdownContent';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { Message } from '@/types/chat';

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
  const hasAttachments =
    message.attachments && message.attachments.length > 0;

  return (
    <div
      className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
      id={`msg-wrap-${message.id}`}>
      <div
        className={`flex items-end gap-2 max-w-[90%] sm:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        {message.role === 'assistant' && (
          <div className='w-10 h-10 rounded-full shrink-0 border border-[color:var(--color-border-default)] mb-1 relative bg-white'>
            <Image
              src='/icon.png'
              alt='Kapruka'
              fill
              className='object-cover p-1 rounded-full'
            />
          </div>
        )}

        <div className='space-y-2 min-w-0'>
          {hasAttachments && (
            <ul
              className={`flex flex-wrap gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              aria-label='Message attachments'>
              {message.attachments!.map((attachment) => {
                const imageSrc =
                  attachment.kind === 'image'
                    ? resolveAttachmentImageSrc(
                        attachment,
                        message.attachmentPreviews?.[attachment.name],
                      )
                    : undefined;
                return (
                  <li key={attachment.name} className='shrink-0'>
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
                      <div className='flex items-center gap-2 px-3 py-2 rounded-[12px] border border-[color:var(--color-border-default)] bg-[color:var(--color-paper-2)] max-w-[200px]'>
                        <FileText
                          className='w-4 h-4 shrink-0 text-[color:var(--color-primary)]'
                          aria-hidden='true'
                        />
                        <span className='text-[12px] text-[color:var(--color-ink)] truncate'>
                          {attachment.name}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div
            className={`px-4 text-white py-3 text-[15px] leading-relaxed ${
              message.isError
                ? 'chat-bubble-error'
                : message.role === 'user'
                  ? 'chat-bubble-user'
                  : 'chat-bubble-assistant'
            }`}>
            <MarkdownContent text={message.content} role={message.role} />
          </div>
        </div>
      </div>

      {message.widgets && message.widgets.length > 0 && (
        <div className='w-full mt-3 pl-9 pr-1 space-y-4 animate-fade-in'>
          {message.widgets.map((widget, idx) => (
            <WidgetRenderer
              key={idx}
              widget={widget}
              cart={cart}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
