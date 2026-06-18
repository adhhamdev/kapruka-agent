import { DEFAULT_CURRENCY } from '@/constants/currency';

/** Format an amount for display in LKR. */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
