'use client';

import { FileText, X } from 'lucide-react';
import Image from 'next/image';
import { formatFileSize } from '@/lib/attachments';
import type { ChatAttachment } from '@/types/attachments';

interface AttachmentPreviewProps {
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <ul
      className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1'
      aria-label='Attached files'>
      {attachments.map((attachment) => (
        <li key={attachment.id} className='relative shrink-0'>
          {attachment.kind === 'image' && attachment.previewUrl ? (
            <div className='relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-[12px] overflow-hidden border border-[color:var(--color-rule-strong)] bg-[color:var(--color-bg-base)]'>
              <Image
                src={attachment.previewUrl}
                alt={attachment.name}
                fill
                sizes='72px'
                unoptimized
                className='object-cover'
              />
            </div>
          ) : (
            <div className='w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-[12px] border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper-2)] flex flex-col items-center justify-center px-2 text-center'>
              <FileText
                className='w-5 h-5 text-[color:var(--color-primary)] mb-1'
                aria-hidden='true'
              />
              <span className='text-[9px] text-[color:var(--color-ink-2)] truncate w-full'>
                {attachment.name}
              </span>
              <span className='text-[9px] text-[color:var(--color-ink-3)] tabular-nums'>
                {formatFileSize(attachment.size)}
              </span>
            </div>
          )}
          <button
            type='button'
            onClick={() => onRemove(attachment.id)}
            aria-label={`Remove ${attachment.name}`}
            className='absolute -top-1.5 -right-1.5 w-7 h-7 min-w-[28px] min-h-[28px] rounded-full bg-[color:var(--color-ink)] text-white flex items-center justify-center shadow-sm hover:bg-[color:var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2'>
            <X className='w-3.5 h-3.5' aria-hidden='true' />
          </button>
        </li>
      ))}
    </ul>
  );
}
