import { Truck } from 'lucide-react';
import { DEFAULT_DELIVERY_COST_LABEL } from '@/constants/urls';
import { formatPrice } from '@/lib/format';
import type { DeliveryQuoteData } from '@/types/widgets';

interface DeliveryQuoteCardProps {
  quote: DeliveryQuoteData;
}

export function DeliveryQuoteCard({ quote }: DeliveryQuoteCardProps) {
  return (
    <div className='bg-[color:var(--color-bg-base)] border border-[color:var(--color-border-default)] rounded-[16px] p-4 w-full max-w-full sm:max-w-xs flex gap-3 shadow-sm min-w-0'>
      <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-[color:var(--color-border-subtle)] shadow-sm'>
        <Truck className='w-5 h-5 text-[color:var(--color-text-primary)]' />
      </div>
      <div className='flex-1 min-w-0'>
        <h4 className='text-[14px] font-semibold text-[color:var(--color-text-primary)] mt-0.5 truncate'>
          {quote.city}
        </h4>
        <div className='mt-1 space-y-0.5 text-[13px] text-[color:var(--color-text-secondary)]'>
          <div>
            <span className='text-[color:var(--color-text-tertiary)]'>Date:</span>{' '}
            {quote.deliveryDate}
          </div>
          <div>
            <span className='text-[color:var(--color-text-tertiary)]'>Cost:</span>{' '}
            <span className='font-medium text-[color:var(--color-text-primary)]'>
              {quote.cost ? formatPrice(quote.cost) : DEFAULT_DELIVERY_COST_LABEL}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
