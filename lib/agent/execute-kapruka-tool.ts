import { DEFAULT_CURRENCY } from '@/constants/currency';
import {
  addProductToCart,
  clearCart,
  removeFromCart,
} from '@/lib/cart/mutations';
import type { CartItem } from '@/lib/cart-storage';
import {
  checkDelivery,
  createOrder,
  getProduct,
  listCategories,
  listDeliveryCities,
  searchProducts,
  trackOrder,
  type KaprukaToolResponse,
} from '@/lib/kapruka-mcp';
import {
  enrichKaprukaProducts,
  resolveKaprukaProductImageUrl,
} from '@/lib/kapruka-product-image';
import { fetchKaprukaProductDetail } from '@/lib/kapruka-product-detail';
import { parseKaprukaCategoriesResponse } from '@/lib/kapruka-categories';
import { findMcpCategoryName } from '@/lib/kapruka-category-search';
import {
  parseCreateOrderResponse,
  toCheckoutFormData,
} from '@/lib/kapruka-checkout';
import { parseKaprukaSearchResponse } from '@/lib/kapruka-search';
import type { KaprukaProductDetail } from '@/lib/products';
import type { ToolSessionState } from '@/lib/agent/tool-session-store';
import type { CarouselPagination, Widget } from '@/types/widgets';
import { isAppLocale, type AppLocale } from '@/types/locale';

export interface AgentUiFlags {
  openBasket: boolean;
  localeChange?: AppLocale;
}

export interface ToolExecutionContext {
  session: ToolSessionState;
  cart: CartItem[];
  uiFlags: AgentUiFlags;
}

export interface ToolExecutionOutcome {
  result: Record<string, unknown>;
  widget?: Widget;
  cart?: CartItem[];
  uiFlags?: Partial<AgentUiFlags>;
}

export const KAPRUKA_TOOL_NAMES = [
  'kapruka_search_products',
  'kapruka_get_product',
  'kapruka_list_categories',
  'kapruka_list_delivery_cities',
  'kapruka_check_delivery',
  'kapruka_create_order',
  'kapruka_track_order',
  'show_products_carousel',
  'show_product_detail',
  'show_delivery_quote',
  'show_categories_list',
  'show_checkout_form',
  'show_order_status',
  'add_to_cart_action',
  'remove_from_cart_action',
  'clear_cart_action',
  'show_basket_action',
  'set_app_language',
] as const;

export type KaprukaToolName = (typeof KAPRUKA_TOOL_NAMES)[number];

export function isKaprukaToolName(name: string): name is KaprukaToolName {
  return (KAPRUKA_TOOL_NAMES as readonly string[]).includes(name);
}

function mcpResult(response: KaprukaToolResponse): Record<string, unknown> {
  return response as unknown as Record<string, unknown>;
}

async function loadProductDetail(
  session: ToolSessionState,
  productId: string,
): Promise<KaprukaProductDetail> {
  const normalizedId = productId.trim();
  const cached = session.productDetailCache.get(normalizedId);
  if (cached) return cached;

  const parsed = await fetchKaprukaProductDetail(
    normalizedId,
    getProduct,
    DEFAULT_CURRENCY,
  );
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  session.productDetailCache.set(normalizedId, parsed.product);
  return parsed.product;
}

async function ensureCategoriesLoaded(
  session: ToolSessionState,
): Promise<import('@/types/widgets').KaprukaCategory[]> {
  if (session.categoriesSession?.length) {
    return session.categoriesSession;
  }

  const response = await listCategories(1, 'json');
  const parsed = parseKaprukaCategoriesResponse(response);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  session.categoriesSession = parsed.categories;
  return parsed.categories;
}

export async function executeKaprukaTool(
  name: KaprukaToolName,
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<ToolExecutionOutcome> {
  const { session } = ctx;
  let cart = [...ctx.cart];
  const uiFlags: AgentUiFlags = { ...ctx.uiFlags };

  switch (name) {
    case 'kapruka_search_products': {
      let category = args.category as string | undefined;
      if (category?.trim()) {
        const categories = await ensureCategoriesLoaded(session);
        const canonical = findMcpCategoryName(categories, category);
        if (!canonical) {
          session.searchSession = null;
          return {
            result: {
              success: false,
              error: `Unknown category "${category}". Call kapruka_list_categories and use an exact MCP category name.`,
              valid_categories: categories.map((item) => item.name),
            },
          };
        }
        category = canonical;
      }

      const response = await searchProducts({
        q: String(args.q ?? ''),
        category,
        min_price: args.min_price as number | undefined,
        max_price: args.max_price as number | undefined,
        in_stock_only: (args.in_stock_only as boolean | undefined) ?? true,
        sort: args.sort as string | undefined,
        limit: (args.limit as number | undefined) ?? 10,
        cursor: args.cursor as string | undefined,
        currency: DEFAULT_CURRENCY,
        response_format: 'json',
      });
      const parsed = parseKaprukaSearchResponse(response);

      if (parsed.products.length > 0) {
        session.searchSession = {
          q: String(args.q ?? ''),
          category,
          min_price: args.min_price as number | undefined,
          max_price: args.max_price as number | undefined,
          sort: args.sort as string | undefined,
          products: parsed.products,
          nextCursor: parsed.nextCursor,
        };
      } else {
        session.searchSession = null;
      }

      return {
        result: {
          ...parsed,
          next_cursor: parsed.nextCursor,
          result_count: parsed.products.length,
          message:
            parsed.products.length > 0
              ? `Found ${parsed.products.length} product(s). Call show_products_carousel (no arguments) to display them.`
              : 'No products matched.',
        },
      };
    }

    case 'kapruka_get_product': {
      const product = await loadProductDetail(
        session,
        String(args.product_id ?? ''),
      );
      return {
        result: {
          success: true,
          product_id: product.productId,
          name: product.name,
          price: product.price,
          compare_at_price: product.compareAtPrice,
          in_stock: product.inStock,
          stock_level: product.stockLevel,
          url: product.url,
          image_count: product.images?.length ?? 0,
          variant_count: product.variants?.length ?? 0,
          category: product.category?.name,
          shipping_international: product.shipping?.shipsInternationally,
          message:
            'Call show_product_detail with this product_id to render the card.',
        },
      };
    }

    case 'kapruka_list_categories': {
      const response = await listCategories(
        (args.depth as number | undefined) || 1,
        'json',
      );
      const parsed = parseKaprukaCategoriesResponse(response);
      if (!parsed.ok) {
        session.categoriesSession = null;
        return { result: { success: false, error: parsed.error } };
      }
      session.categoriesSession = parsed.categories;
      return {
        result: {
          success: true,
          count: parsed.categories.length,
          categories: parsed.categories,
          message: 'Categories loaded. Call show_categories_list to display them.',
        },
      };
    }

    case 'kapruka_list_delivery_cities':
      return {
        result: mcpResult(
          await listDeliveryCities(
            args.query as string | undefined,
            (args.limit as number | undefined) || 25,
          ),
        ),
      };

    case 'kapruka_check_delivery':
      return {
        result: mcpResult(
          await checkDelivery(
            String(args.city ?? ''),
            args.delivery_date as string | undefined,
            args.product_id as string | undefined,
          ),
        ),
      };

    case 'kapruka_create_order': {
      const orderArgs = args as {
        cart: Array<{
          product_id: string;
          quantity?: number;
          icing_text?: string;
        }>;
        recipient: { name: string; phone: string };
        delivery: {
          address: string;
          city: string;
          date: string;
          location_type?: string;
          instructions?: string;
        };
        sender: { name: string; anonymous?: boolean };
        gift_message?: string;
      };

      const response = await createOrder({
        ...orderArgs,
        currency: DEFAULT_CURRENCY,
        response_format: 'json',
      });
      const parsed = parseCreateOrderResponse(response);

      if (!parsed.ok) {
        session.checkoutSession = null;
        return { result: { success: false, error: parsed.error } };
      }

      const itemsCount = orderArgs.cart.reduce(
        (sum, item) => sum + (item.quantity ?? 1),
        0,
      );
      session.checkoutSession = toCheckoutFormData(parsed, itemsCount, {
        recipientName: orderArgs.recipient.name,
        recipientPhone: orderArgs.recipient.phone,
        address: orderArgs.delivery.address,
        city: orderArgs.delivery.city,
        senderName: orderArgs.sender.name,
        label: 'Last checkout',
      });

      return {
        result: {
          success: true,
          checkout_url: parsed.checkoutUrl,
          order_ref: parsed.orderRef,
          grand_total: parsed.grandTotal,
          currency: parsed.currency,
          expires_at: parsed.expiresAt,
          message:
            'Order created. Call show_checkout_form to display the pay button.',
        },
      };
    }

    case 'kapruka_track_order':
      return {
        result: mcpResult(await trackOrder(String(args.order_number ?? ''))),
      };

    case 'show_products_carousel': {
      const searchSession = session.searchSession;
      if (!searchSession?.products.length) {
        throw new Error(
          'No search results. Call kapruka_search_products first.',
        );
      }
      const enriched = await enrichKaprukaProducts(searchSession.products);
      const pagination: CarouselPagination = {
        q: searchSession.q,
        category: searchSession.category,
        min_price: searchSession.min_price,
        max_price: searchSession.max_price,
        sort: searchSession.sort,
        nextCursor: searchSession.nextCursor,
      };
      const widget: Widget = {
        type: 'carousel',
        data: enriched,
        pagination,
      };
      return { result: { success: true, widget_type: 'carousel' }, widget };
    }

    case 'show_product_detail': {
      const product = await loadProductDetail(
        session,
        String(args.product_id ?? ''),
      );
      const widget: Widget = { type: 'detail', data: product };
      return { result: { success: true, widget_type: 'detail' }, widget };
    }

    case 'show_delivery_quote': {
      const widget: Widget = {
        type: 'delivery_quote',
        data: {
          city: String(args.city ?? ''),
          deliveryDate: String(args.deliveryDate ?? ''),
          cost: Number(args.cost ?? 0),
          canDeliver: Boolean(args.canDeliver),
          warning: args.warning as string | undefined,
        },
      };
      return {
        result: { success: true, widget_type: 'delivery_quote' },
        widget,
      };
    }

    case 'show_categories_list': {
      const categories =
        session.categoriesSession ?? (await ensureCategoriesLoaded(session));
      if (!categories.length) {
        throw new Error(
          'No categories loaded. Call kapruka_list_categories first.',
        );
      }
      const widget: Widget = { type: 'categories_list', data: categories };
      return {
        result: { success: true, widget_type: 'categories_list' },
        widget,
      };
    }

    case 'show_checkout_form': {
      const checkoutSession = session.checkoutSession;
      if (!checkoutSession) {
        throw new Error(
          'Checkout not ready. Collect recipient, delivery, and sender details, then call kapruka_create_order before show_checkout_form.',
        );
      }
      const widget: Widget = {
        type: 'checkout_form',
        data: checkoutSession,
      };
      return {
        result: { success: true, widget_type: 'checkout_form' },
        widget,
      };
    }

    case 'show_order_status': {
      const widget: Widget = {
        type: 'order_status',
        data: {
          orderNumber: String(args.orderNumber ?? ''),
          status: String(args.status ?? ''),
          recipientName: args.recipientName as string | undefined,
          logs: args.logs as
            | Array<{ time: string; activity: string }>
            | undefined,
        },
      };
      return {
        result: { success: true, widget_type: 'order_status' },
        widget,
      };
    }

    case 'add_to_cart_action': {
      const resolvedImageUrl = await resolveKaprukaProductImageUrl(
        String(args.product_id ?? ''),
        args.imageUrl as string | undefined,
      );
      cart = addProductToCart(cart, {
        product_id: String(args.product_id ?? ''),
        name: String(args.name ?? ''),
        price: Number(args.price ?? 0),
        imageUrl: resolvedImageUrl,
        productUrl: (args.productUrl ?? args.url) as string | undefined,
      });
      uiFlags.openBasket = true;
      return {
        result: {
          status: 'success',
          message: `Add to cart success: Added item ${String(args.name ?? '')}. Total unique items: ${cart.length}`,
          cart,
        },
        cart,
        uiFlags: { openBasket: true },
      };
    }

    case 'remove_from_cart_action': {
      cart = removeFromCart(cart, String(args.product_id ?? ''));
      return {
        result: {
          status: 'success',
          message: 'Removed item from cart.',
          cart,
        },
        cart,
      };
    }

    case 'clear_cart_action': {
      cart = clearCart();
      return {
        result: {
          status: 'success',
          message: 'Cleared cart successfully.',
          cart,
        },
        cart,
      };
    }

    case 'show_basket_action':
      uiFlags.openBasket = true;
      return {
        result: { status: 'success', action: 'open_basket' },
        uiFlags: { openBasket: true },
      };

    case 'set_app_language': {
      const locale = args.locale as string;
      if (!isAppLocale(locale)) {
        return { result: { status: 'error', message: 'Invalid locale.' } };
      }
      uiFlags.localeChange = locale;
      return {
        result: {
          status: 'success',
          locale,
          message: `App language set to ${locale}.`,
        },
        uiFlags: { localeChange: locale },
      };
    }

    default:
      return { result: { error: `Unknown tool: ${name}` } };
  }
}
