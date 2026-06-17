import type { KaprukaProduct } from '@/lib/products';

export interface DeliveryQuoteData {
  city: string;
  deliveryDate: string;
  cost?: number;
  canDeliver?: boolean;
  warning?: string;
}

export interface CheckoutFormData {
  checkoutUrl: string;
  totalAmount: number;
  itemsCount?: number;
  orderNumber: string;
}

export interface OrderStatusLog {
  time: string;
  activity: string;
}

export interface OrderStatusData {
  orderNumber: string;
  status: string;
  recipientName?: string;
  logs?: OrderStatusLog[];
}

export type Widget =
  | { type: 'carousel'; data: KaprukaProduct[] }
  | { type: 'detail'; data: KaprukaProduct }
  | { type: 'delivery_quote'; data: DeliveryQuoteData }
  | { type: 'checkout_form'; data: CheckoutFormData }
  | { type: 'order_status'; data: OrderStatusData };

export type WidgetType = Widget['type'];
