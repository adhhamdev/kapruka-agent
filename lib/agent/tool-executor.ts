import type { CartItem } from '@/lib/cart-storage';
import { DEFAULT_CURRENCY } from '@/constants/currency';
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
  type CreateOrderParams,
  type KaprukaToolResponse,
} from '@/lib/kapruka-mcp';
import {
  enrichKaprukaProduct,
  enrichKaprukaProducts,
  resolveKaprukaProductImageUrl,
} from '@/lib/kapruka-product-image';
import { parseKaprukaSearchResponse } from '@/lib/kapruka-search';
import type { CarouselPagination } from '@/types/widgets';
import type { Widget } from '@/types/widgets';

export interface ToolExecutionResult {
  toolResult: Record<string, unknown>;
  widgets: Widget[];
  cart: CartItem[];
}

function mcpResult(response: KaprukaToolResponse): Record<string, unknown> {
  return response as unknown as Record<string, unknown>;
}

function parsePagination(args: Record<string, unknown>): CarouselPagination | undefined {
  const raw = args.pagination as Record<string, unknown> | undefined;
  if (!raw?.q || typeof raw.q !== 'string') return undefined;

  return {
    q: raw.q,
    category: raw.category as string | undefined,
    min_price: raw.min_price as number | undefined,
    max_price: raw.max_price as number | undefined,
    sort: raw.sort as string | undefined,
    nextCursor:
      (raw.next_cursor as string | null | undefined) ??
      (raw.nextCursor as string | null | undefined) ??
      null,
  };
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
      const response = await searchProducts({
        q: args.q as string,
        category: args.category as string | undefined,
        min_price: args.min_price as number | undefined,
        max_price: args.max_price as number | undefined,
        in_stock_only: (args.in_stock_only as boolean | undefined) ?? true,
        sort: args.sort as string | undefined,
        limit: (args.limit as number | undefined) ?? 10,
        cursor: args.cursor as string | undefined,
        currency: DEFAULT_CURRENCY,
        include_stubs: args.include_stubs as boolean | undefined,
        response_format: 'json',
      });
      const parsed = parseKaprukaSearchResponse(response);
      toolResult = {
        ...parsed,
        result_count: parsed.products.length,
        message:
          parsed.products.length > 0
            ? `Found ${parsed.products.length} product(s).`
            : 'No products matched.',
      };
      break;
    }
    case 'kapruka_get_product':
      toolResult = mcpResult(
        await getProduct(args.product_id as string, {
          currency: DEFAULT_CURRENCY,
        }),
      );
      break;
    case 'kapruka_list_categories':
      toolResult = mcpResult(
        await listCategories((args.depth as number) || 1),
      );
      break;
    case 'kapruka_list_delivery_cities':
      toolResult = mcpResult(
        await listDeliveryCities(
          args.query as string | undefined,
          (args.limit as number) || 25,
        ),
      );
      break;
    case 'kapruka_check_delivery':
      toolResult = mcpResult(
        await checkDelivery(
          args.city as string,
          args.delivery_date as string | undefined,
          args.product_id as string | undefined,
        ),
      );
      break;
    case 'kapruka_create_order':
      toolResult = mcpResult(
        await createOrder({
          ...(args as unknown as CreateOrderParams),
          currency: DEFAULT_CURRENCY,
        }),
      );
      break;
    case 'kapruka_track_order':
      toolResult = mcpResult(
        await trackOrder(args.order_number as string),
      );
      break;
    case 'show_products_carousel': {
      const products = await enrichKaprukaProducts(
        (args.products as Widget extends { type: 'carousel' } ? Widget['data'] : never) ??
          [],
      );
      const pagination = parsePagination(args);
      widgets.push({
        type: 'carousel',
        data: products,
        pagination,
      });
      toolResult = {
        status: 'success',
        message: 'Rendered product listing carousel in browser.',
      };
      break;
    }
    case 'show_product_detail': {
      const product = await enrichKaprukaProduct(
        args.product as Widget extends { type: 'detail' } ? Widget['data'] : never,
      );
      widgets.push({
        type: 'detail',
        data: product,
      });
      toolResult = {
        status: 'success',
        message: 'Displayed granular product page features.',
      };
      break;
    }
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
      const resolvedImageUrl = await resolveKaprukaProductImageUrl(
        product_id as string | undefined,
        imageUrl as string | undefined,
      );
      updatedCart = addProductToCart(currentCart, {
        product_id: product_id as string,
        name: pName as string,
        price: Number(price),
        imageUrl: resolvedImageUrl,
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
