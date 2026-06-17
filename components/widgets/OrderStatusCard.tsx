import { Package } from 'lucide-react';
import type { OrderStatusData } from '@/types/widgets';

interface OrderStatusCardProps {
  order: OrderStatusData;
}

export function OrderStatusCard({ order }: OrderStatusCardProps) {
  return (
    <div className='bg-white border border-[color:var(--color-border-default)] rounded-[var(--radius-xl)] p-4 max-w-sm shadow-sm'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-10 h-10 bg-[color:var(--color-bg-base)] rounded-full flex items-center justify-center shrink-0 border border-[color:var(--color-border-subtle)]'>
          <Package className='w-5 h-5 text-[color:var(--color-primary)]' />
        </div>
        <div className='min-w-0'>
          <p className='text-[12px] text-[color:var(--color-text-tertiary)] uppercase tracking-wider'>
            Order Status
          </p>
          <h4 className='text-[15px] font-semibold text-[color:var(--color-text-primary)] truncate'>
            {order.orderNumber}
          </h4>
        </div>
      </div>

      <div className='mb-3'>
        <span className='inline-block text-[13px] font-medium px-3 py-1 rounded-full bg-[color:var(--color-accent)]/15 text-[color:var(--color-primary)]'>
          {order.status}
        </span>
        {order.recipientName && (
          <p className='text-[13px] text-[color:var(--color-text-secondary)] mt-2'>
            Recipient: {order.recipientName}
          </p>
        )}
      </div>

      {order.logs && order.logs.length > 0 && (
        <ol className='space-y-3 border-t border-[color:var(--color-border-subtle)] pt-3'>
          {order.logs.map((log, idx) => (
            <li key={idx} className='flex gap-3 text-[13px]'>
              <span className='text-[color:var(--color-text-tertiary)] shrink-0 w-16'>
                {log.time}
              </span>
              <span className='text-[color:var(--color-text-secondary)]'>
                {log.activity}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
