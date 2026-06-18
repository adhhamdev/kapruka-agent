import { CheckoutFormCard } from '@/components/widgets/CheckoutFormCard';
import { DeliveryQuoteCard } from '@/components/widgets/DeliveryQuoteCard';
import { OrderStatusCard } from '@/components/widgets/OrderStatusCard';
import { ProductCarousel } from '@/components/widgets/ProductCarousel';
import { ProductDetailCard } from '@/components/widgets/ProductDetailCard';
import type { CartItem } from '@/lib/cart-storage';
import type { KaprukaProduct } from '@/lib/products';
import type { Widget } from '@/types/widgets';

interface WidgetRendererProps {
  widget: Widget;
  widgetIndex: number;
  messageId: string;
  cart: CartItem[];
  onAddToCart: (product: KaprukaProduct) => void;
  onLoadMore?: () => void;
}

export function WidgetRenderer({
  widget,
  cart,
  onAddToCart,
  onLoadMore,
}: WidgetRendererProps) {
  switch (widget.type) {
    case 'carousel':
      if (!Array.isArray(widget.data)) return null;
      return (
        <ProductCarousel
          products={widget.data}
          hasMore={Boolean(widget.pagination?.nextCursor)}
          onLoadMore={onLoadMore}
          onAddToCart={onAddToCart}
        />
      );
    case 'detail':
      return (
        <ProductDetailCard product={widget.data} onAddToCart={onAddToCart} />
      );
    case 'delivery_quote':
      return <DeliveryQuoteCard quote={widget.data} />;
    case 'checkout_form':
      return <CheckoutFormCard checkout={widget.data} cart={cart} />;
    case 'order_status':
      return <OrderStatusCard order={widget.data} />;
    default:
      return null;
  }
}
