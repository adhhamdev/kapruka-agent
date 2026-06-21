import type { KaprukaProduct, KaprukaProductDetail } from '@/lib/products';

export interface CarouselPagination {
  q: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  nextCursor?: string | null;
}

export interface DeliveryQuoteData {
  city: string;
  deliveryDate: string;
  cost?: number;
  canDeliver?: boolean;
  warning?: string;
}

export interface DeliverySnapshot {
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  senderName: string;
  label?: string;
}

export interface CheckoutFormData {
  checkoutUrl: string;
  totalAmount: number;
  itemsCount?: number;
  orderNumber: string;
  delivery?: DeliverySnapshot;
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

export interface KaprukaCategory {
  name: string;
  url: string;
}

export type Widget =
  | {
      type: 'carousel';
      data: KaprukaProduct[];
      pagination?: CarouselPagination;
    }
  | { type: 'detail'; data: KaprukaProductDetail }
  | { type: 'delivery_quote'; data: DeliveryQuoteData }
  | { type: 'checkout_form'; data: CheckoutFormData }
  | { type: 'order_status'; data: OrderStatusData }
  | { type: 'categories_list'; data: KaprukaCategory[] };

export type WidgetType = Widget['type'];
