import type { CartItem } from '@/lib/cart-storage';
import {
  addProductToCart,
  clearCart,
  removeFromCart,
} from '@/lib/cart/mutations';
import {
  checkDelivery,
  createOrder,
  getProduct,
  listCategories,
  listDeliveryCities,
  searchProducts,
  trackOrder,
} from '@/lib/kapruka-mcp';
import type { Widget } from '@/types/widgets';

export interface ToolExecutionResult {
  toolResult: Record<string, unknown>;
  widgets: Widget[];
  cart: CartItem[];
}

export async function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  currentCart: CartItem[],
  accumulatedWidgets: Widget[],
): Promise<ToolExecutionResult> {
  let toolResult: Record<string, unknown>;
  let updatedCart = currentCart;
  const widgets = [...accumulatedWidgets];

  switch (name) {
    case 'kapruka_search_products': {
      const { q, category, min_price, max_price, in_stock_only, sort } = args;
      toolResult = (await searchProducts(
        q as string,
        category as string | undefined,
        min_price as number | undefined,
        max_price as number | undefined,
        in_stock_only as boolean | undefined,
        sort as string | undefined,
      )) as Record<string, unknown>;
      break;
    }
    case 'kapruka_get_product':
      toolResult = (await getProduct(args.product_id as string)) as Record<
        string,
        unknown
      >;
      break;
    case 'kapruka_list_categories':
      toolResult = (await listCategories(
        (args.depth as number) || 1,
      )) as Record<string, unknown>;
      break;
    case 'kapruka_list_delivery_cities':
      toolResult = (await listDeliveryCities(
        args.query as string,
      )) as Record<string, unknown>;
      break;
    case 'kapruka_check_delivery':
      toolResult = (await checkDelivery(
        args.city as string,
        args.delivery_date as string,
        args.product_id as string,
      )) as Record<string, unknown>;
      break;
    case 'kapruka_create_order':
      toolResult = (await createOrder(args as Parameters<typeof createOrder>[0])) as Record<
        string,
        unknown
      >;
      break;
    case 'kapruka_track_order':
      toolResult = (await trackOrder(
        args.order_number as string,
      )) as Record<string, unknown>;
      break;
    case 'show_products_carousel':
      widgets.push({
        type: 'carousel',
        data: args.products as Widget extends { type: 'carousel' }
          ? Widget['data']
          : never,
      });
      toolResult = {
        status: 'success',
        message: 'Rendered product listing carousel in browser.',
      };
      break;
    case 'show_product_detail':
      widgets.push({
        type: 'detail',
        data: args.product as Widget extends { type: 'detail' }
          ? Widget['data']
          : never,
      });
      toolResult = {
        status: 'success',
        message: 'Displayed granular product page features.',
      };
      break;
    case 'show_delivery_quote':
      widgets.push({
        type: 'delivery_quote',
        data: args as Widget extends { type: 'delivery_quote' }
          ? Widget['data']
          : never,
      });
      toolResult = {
        status: 'success',
        message: 'Shipping availability details displayed.',
      };
      break;
    case 'show_checkout_form':
      widgets.push({
        type: 'checkout_form',
        data: args as Widget extends { type: 'checkout_form' }
          ? Widget['data']
          : never,
      });
      toolResult = {
        status: 'success',
        message: 'Successfully projected pay-links.',
      };
      break;
    case 'show_order_status':
      widgets.push({
        type: 'order_status',
        data: args as Widget extends { type: 'order_status' }
          ? Widget['data']
          : never,
      });
      toolResult = {
        status: 'success',
        message: 'Rendered order delivery timeline.',
      };
      break;
    case 'add_to_cart_action': {
      const { product_id, name: pName, price, imageUrl, productUrl, url } =
        args;
      updatedCart = addProductToCart(currentCart, {
        product_id: product_id as string,
        name: pName as string,
        price: Number(price),
        imageUrl: imageUrl as string | undefined,
        productUrl: (productUrl ?? url) as string | undefined,
      });
      toolResult = {
        status: 'success',
        message: `Add to cart success: Added item ${pName}. Total unique items: ${updatedCart.length}`,
        cart: updatedCart,
      };
      break;
    }
    case 'remove_from_cart_action':
      updatedCart = removeFromCart(currentCart, args.product_id as string);
      toolResult = {
        status: 'success',
        message: 'Removed item from cart.',
        cart: updatedCart,
      };
      break;
    case 'clear_cart_action':
      updatedCart = clearCart();
      toolResult = {
        status: 'success',
        message: 'Cleared cart successfully.',
        cart: updatedCart,
      };
      break;
    default:
      toolResult = { error: 'Unknown custom tool called' };
  }

  return { toolResult, widgets, cart: updatedCart };
}

export function buildCartContextMessage(cart: CartItem[]): string {
  const cartSummary =
    cart.length > 0
      ? cart
          .map(
            (i) =>
              `- SKU: ${i.product_id}, ${i.name} (Qty: ${i.quantity}, Price: LKR ${i.price})`,
          )
          .join('\n')
      : 'Cart is empty.';

  return `[SYSTEM STATUS / CLIENT CART STATE UPDATE]\nCurrent shopping cart items:\n${cartSummary}\nPlease keep this cart in mind when assisting. If user requests to buy, calculate totals based on this.`;
}
