import { tool, type ToolSet } from 'ai';
import { z } from 'zod';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { buildCartContextMessage } from '@/lib/agent/cart-context';
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
import {
  fetchKaprukaProductDetail,
} from '@/lib/kapruka-product-detail';
import {
  parseKaprukaCategoriesResponse,
} from '@/lib/kapruka-categories';
import { findMcpCategoryName } from '@/lib/kapruka-category-search';
import {
  parseCreateOrderResponse,
  toCheckoutFormData,
} from '@/lib/kapruka-checkout';
import { parseKaprukaSearchResponse } from '@/lib/kapruka-search';
import type { KaprukaProduct, KaprukaProductDetail } from '@/lib/products';
import type { CarouselPagination, Widget, CheckoutFormData, KaprukaCategory } from '@/types/widgets';

export const cartItemSchema = z.object({
  product_id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageUrl: z.string().optional(),
  productUrl: z.string().optional(),
});

interface SearchSession {
  q: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  products: KaprukaProduct[];
  nextCursor: string | null;
}

function mcpResult(response: KaprukaToolResponse): Record<string, unknown> {
  return response as unknown as Record<string, unknown>;
}

export type WidgetToolOutput = Widget;

export interface AgentUiFlags {
  openBasket: boolean;
}

export function createKaprukaTools(
  cartRef: { current: CartItem[] },
  uiFlagsRef: { current: AgentUiFlags } = { current: { openBasket: false } },
) {
  const checkoutSessionRef: { current: CheckoutFormData | null } = {
    current: null,
  };
  const categoriesSessionRef: { current: KaprukaCategory[] | null } = {
    current: null,
  };
  const searchSessionRef: { current: SearchSession | null } = {
    current: null,
  };
  const productDetailCacheRef: { current: Map<string, KaprukaProductDetail> } =
    {
      current: new Map(),
    };

  async function loadProductDetail(
    productId: string,
  ): Promise<KaprukaProductDetail> {
    const normalizedId = productId.trim();
    const cached = productDetailCacheRef.current.get(normalizedId);
    if (cached) return cached;

    const parsed = await fetchKaprukaProductDetail(
      normalizedId,
      getProduct,
      DEFAULT_CURRENCY,
    );
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }

    productDetailCacheRef.current.set(normalizedId, parsed.product);
    return parsed.product;
  }

  async function ensureCategoriesLoaded(): Promise<KaprukaCategory[]> {
    if (categoriesSessionRef.current?.length) {
      return categoriesSessionRef.current;
    }

    const response = await listCategories(1, 'json');
    const parsed = parseKaprukaCategoriesResponse(response);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }

    categoriesSessionRef.current = parsed.categories;
    return parsed.categories;
  }

  return {
    kapruka_search_products: tool({
      description:
        "Search Kapruka's live retail catalog by keyword, categories, price bounds, sort configuration, etc.",
      inputSchema: z.object({
        q: z.string().describe('Search keyword (e.g. cakes, flowers, chocolates)'),
        category: z.string().optional(),
        min_price: z.number().optional(),
        max_price: z.number().optional(),
        in_stock_only: z.boolean().optional(),
        sort: z.string().optional(),
        limit: z.number().optional(),
        cursor: z.string().optional(),
        include_stubs: z.boolean().optional(),
      }),
      execute: async (args) => {
        let category = args.category;

        if (category?.trim()) {
          const categories = await ensureCategoriesLoaded();
          const canonical = findMcpCategoryName(categories, category);
          if (!canonical) {
            searchSessionRef.current = null;
            return {
              success: false,
              error: `Unknown category "${category}". Call kapruka_list_categories and use an exact MCP category name.`,
              valid_categories: categories.map((item) => item.name),
            };
          }
          category = canonical;
        }

        const response = await searchProducts({
          ...args,
          category,
          in_stock_only: args.in_stock_only ?? true,
          limit: args.limit ?? 10,
          currency: DEFAULT_CURRENCY,
          response_format: 'json',
        });
        const parsed = parseKaprukaSearchResponse(response);

        if (parsed.products.length > 0) {
          searchSessionRef.current = {
            q: args.q,
            category,
            min_price: args.min_price,
            max_price: args.max_price,
            sort: args.sort,
            products: parsed.products,
            nextCursor: parsed.nextCursor,
          };
        } else {
          searchSessionRef.current = null;
        }

        return {
          ...parsed,
          next_cursor: parsed.nextCursor,
          result_count: parsed.products.length,
          message:
            parsed.products.length > 0
              ? `Found ${parsed.products.length} product(s). Call show_products_carousel (no arguments) to display them.`
              : 'No products matched.',
        };
      },
    }),

    kapruka_get_product: tool({
      description:
        'Get full product details by ID — name, price, stock, variants, images, shipping, and URL. Always call show_product_detail with the same product_id afterward.',
      inputSchema: z.object({
        product_id: z.string(),
      }),
      execute: async ({ product_id }) => {
        const product = await loadProductDetail(product_id);
        return {
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
          message: 'Call show_product_detail with this product_id to render the card.',
        };
      },
    }),

    kapruka_list_categories: tool({
      description:
        'Fetch top-level Kapruka category names and browse URLs. Pass a category name to kapruka_search_products as the category filter.',
      inputSchema: z.object({
        depth: z.number().optional(),
      }),
      execute: async ({ depth }) => {
        const response = await listCategories(depth || 1, 'json');
        const parsed = parseKaprukaCategoriesResponse(response);

        if (!parsed.ok) {
          categoriesSessionRef.current = null;
          return { success: false, error: parsed.error };
        }

        categoriesSessionRef.current = parsed.categories;

        return {
          success: true,
          count: parsed.categories.length,
          categories: parsed.categories,
          message:
            'Categories loaded. Call show_categories_list to display them.',
        };
      },
    }),

    kapruka_list_delivery_cities: tool({
      description:
        "Look up Sri Lankan cities and towns in Kapruka's network by name.",
      inputSchema: z.object({
        query: z.string().optional(),
        limit: z.number().optional(),
      }),
      execute: async ({ query, limit }) =>
        mcpResult(await listDeliveryCities(query, limit || 25)),
    }),

    kapruka_check_delivery: tool({
      description:
        'Check delivery availability, cost, and perishable warnings to a Sri Lankan city and date.',
      inputSchema: z.object({
        city: z.string(),
        delivery_date: z.string().optional(),
        product_id: z.string().optional(),
      }),
      execute: async ({ city, delivery_date, product_id }) =>
        mcpResult(
          await checkDelivery(city, delivery_date, product_id),
        ),
    }),

    kapruka_create_order: tool({
      description:
        "Create guest checkout order in Kapruka's live network and receive a click-to-pay link. Requires recipient, delivery, and sender details. Always use kapruka_list_delivery_cities for the canonical city name first.",
      inputSchema: z.object({
        cart: z.array(
          z.object({
            product_id: z.string(),
            quantity: z.number().optional(),
            icing_text: z.string().optional(),
          }),
        ),
        recipient: z.object({
          name: z.string(),
          phone: z.string(),
        }),
        delivery: z.object({
          address: z.string(),
          city: z.string(),
          date: z.string(),
          location_type: z.string().optional(),
          instructions: z.string().optional(),
        }),
        sender: z.object({
          name: z.string(),
          anonymous: z.boolean().optional(),
        }),
        gift_message: z.string().optional(),
      }),
      execute: async (args) => {
        const response = await createOrder({
          ...args,
          currency: DEFAULT_CURRENCY,
          response_format: 'json',
        });
        const parsed = parseCreateOrderResponse(response);

        if (!parsed.ok) {
          checkoutSessionRef.current = null;
          return { success: false, error: parsed.error };
        }

        const itemsCount = args.cart.reduce(
          (sum, item) => sum + (item.quantity ?? 1),
          0,
        );
        checkoutSessionRef.current = toCheckoutFormData(parsed, itemsCount);

        return {
          success: true,
          checkout_url: parsed.checkoutUrl,
          order_ref: parsed.orderRef,
          grand_total: parsed.grandTotal,
          currency: parsed.currency,
          expires_at: parsed.expiresAt,
          message:
            'Order created. Call show_checkout_form to display the pay button.',
        };
      },
    }),

    kapruka_track_order: tool({
      description:
        'Track status after payment using the order number from the confirmation email.',
      inputSchema: z.object({
        order_number: z.string(),
      }),
      execute: async ({ order_number }) =>
        mcpResult(await trackOrder(order_number)),
    }),

    show_products_carousel: tool({
      description:
        'Display product carousel from the last kapruka_search_products call. Call with no arguments — server supplies all results and pagination.',
      inputSchema: z.object({}),
      execute: async (): Promise<WidgetToolOutput> => {
        const session = searchSessionRef.current;
        if (!session?.products.length) {
          throw new Error(
            'No search results. Call kapruka_search_products first.',
          );
        }

        const enriched = await enrichKaprukaProducts(session.products);
        const pagination: CarouselPagination = {
          q: session.q,
          category: session.category,
          min_price: session.min_price,
          max_price: session.max_price,
          sort: session.sort,
          nextCursor: session.nextCursor,
        };

        return {
          type: 'carousel',
          data: enriched,
          pagination,
        };
      },
    }),

    show_product_detail: tool({
      description:
        'Render the full product detail card. Pass product_id only — the server fetches live Kapruka data (images, variants, shipping, specs).',
      inputSchema: z.object({
        product_id: z.string(),
      }),
      execute: async ({ product_id }): Promise<WidgetToolOutput> => {
        const product = await loadProductDetail(product_id);
        return {
          type: 'detail',
          data: product,
        };
      },
    }),

    show_delivery_quote: tool({
      description:
        'Visualize shipping options, flat cost, dates, or perishable/cake warning guidelines to recipient city.',
      inputSchema: z.object({
        city: z.string(),
        deliveryDate: z.string(),
        cost: z.number(),
        canDeliver: z.boolean(),
        warning: z.string().optional(),
      }),
      execute: async (args): Promise<WidgetToolOutput> => ({
        type: 'delivery_quote',
        data: args,
      }),
    }),

    show_categories_list: tool({
      description:
        'Display Kapruka categories with browse links. Call ONLY after kapruka_list_categories succeeds. Never pass category data — MCP session only.',
      inputSchema: z.object({}),
      execute: async (): Promise<WidgetToolOutput> => {
        const categories =
          categoriesSessionRef.current ?? (await ensureCategoriesLoaded());
        if (!categories.length) {
          throw new Error(
            'No categories loaded. Call kapruka_list_categories first.',
          );
        }

        return {
          type: 'categories_list',
          data: categories,
        };
      },
    }),

    show_checkout_form: tool({
      description:
        'Display the pay summary card after a successful kapruka_create_order. Never pass URLs or order numbers — they come from the last create_order call.',
      inputSchema: z.object({}),
      execute: async (): Promise<WidgetToolOutput> => {
        const session = checkoutSessionRef.current;
        if (!session) {
          throw new Error(
            'Checkout not ready. Collect recipient, delivery, and sender details, then call kapruka_create_order before show_checkout_form.',
          );
        }

        return {
          type: 'checkout_form',
          data: session,
        };
      },
    }),

    show_order_status: tool({
      description:
        'Visual progress logs card tracker presenting shipping timestamps step-by-step for client order.',
      inputSchema: z.object({
        orderNumber: z.string(),
        status: z.string(),
        recipientName: z.string().optional(),
        logs: z
          .array(
            z.object({
              time: z.string(),
              activity: z.string(),
            }),
          )
          .optional(),
      }),
      execute: async (args): Promise<WidgetToolOutput> => ({
        type: 'order_status',
        data: args,
      }),
    }),

    add_to_cart_action: tool({
      description:
        'Execute a client product cart addition, updating user shopping cart dynamically in state.',
      inputSchema: z.object({
        product_id: z.string(),
        name: z.string(),
        price: z.number(),
        imageUrl: z.string().optional(),
        productUrl: z.string().optional(),
        url: z.string().optional(),
      }),
      execute: async ({
        product_id,
        name,
        price,
        imageUrl,
        productUrl,
        url,
      }) => {
        const resolvedImageUrl = await resolveKaprukaProductImageUrl(
          product_id,
          imageUrl,
        );
        cartRef.current = addProductToCart(cartRef.current, {
          product_id,
          name,
          price: Number(price),
          imageUrl: resolvedImageUrl,
          productUrl: productUrl ?? url,
        });
        uiFlagsRef.current.openBasket = true;
        return {
          status: 'success',
          message: `Add to cart success: Added item ${name}. Total unique items: ${cartRef.current.length}`,
          cart: cartRef.current,
        };
      },
    }),

    remove_from_cart_action: tool({
      description: 'Delete an item from shopping cart dynamically in the application.',
      inputSchema: z.object({
        product_id: z.string(),
      }),
      execute: async ({ product_id }) => {
        cartRef.current = removeFromCart(cartRef.current, product_id);
        return {
          status: 'success',
          message: 'Removed item from cart.',
          cart: cartRef.current,
        };
      },
    }),

    clear_cart_action: tool({
      description: 'Empty the entire guest cart state.',
      inputSchema: z.object({}),
      execute: async () => {
        cartRef.current = clearCart();
        return {
          status: 'success',
          message: 'Cleared cart successfully.',
          cart: cartRef.current,
        };
      },
    }),

    show_basket_action: tool({
      description:
        'Open the shopping basket panel so the customer can review items, quantities, and checkout.',
      inputSchema: z.object({}),
      execute: async () => {
        uiFlagsRef.current.openBasket = true;
        return {
          status: 'success',
          action: 'open_basket' as const,
        };
      },
    }),
  } satisfies ToolSet;
}

export type KaprukaTools = ReturnType<typeof createKaprukaTools>;

export { buildCartContextMessage };
