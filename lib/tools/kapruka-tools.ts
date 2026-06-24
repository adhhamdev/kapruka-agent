import { tool, type ToolSet } from 'ai';
import { z } from 'zod';
import { buildCartContextMessage } from '@/lib/agent/cart-context';
import {
  createInlineToolSession,
  type ToolSessionState,
} from '@/lib/agent/tool-session-store';
import {
  executeKaprukaTool,
  type AgentUiFlags,
  type KaprukaToolName,
} from '@/lib/agent/execute-kapruka-tool';
import type { CartItem } from '@/lib/cart-storage';
import type { Widget } from '@/types/widgets';

export const cartItemSchema = z.object({
  product_id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageUrl: z.string().optional(),
  productUrl: z.string().optional(),
});

export type WidgetToolOutput = Widget;

export type { AgentUiFlags };

async function runTool(
  name: KaprukaToolName,
  args: Record<string, unknown>,
  session: ToolSessionState,
  cartRef: { current: CartItem[] },
  uiFlagsRef: { current: AgentUiFlags },
): Promise<Record<string, unknown> | Widget> {
  const outcome = await executeKaprukaTool(name, args, {
    session,
    cart: cartRef.current,
    uiFlags: uiFlagsRef.current,
  });

  if (outcome.cart) {
    cartRef.current = outcome.cart;
  }
  if (outcome.uiFlags?.openBasket) {
    uiFlagsRef.current.openBasket = true;
  }
  if (outcome.uiFlags?.localeChange) {
    uiFlagsRef.current.localeChange = outcome.uiFlags.localeChange;
  }

  if (outcome.widget) {
    return outcome.widget;
  }
  return outcome.result;
}

export function createKaprukaTools(
  cartRef: { current: CartItem[] },
  uiFlagsRef: { current: AgentUiFlags } = { current: { openBasket: false } },
) {
  const session = createInlineToolSession();

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
      execute: async (args) =>
        runTool('kapruka_search_products', args, session, cartRef, uiFlagsRef),
    }),

    kapruka_get_product: tool({
      description:
        'Get full product details by ID — name, price, stock, variants, images, shipping, and URL. Always call show_product_detail with the same product_id afterward.',
      inputSchema: z.object({
        product_id: z.string(),
      }),
      execute: async (args) =>
        runTool('kapruka_get_product', args, session, cartRef, uiFlagsRef),
    }),

    kapruka_list_categories: tool({
      description:
        'Fetch top-level Kapruka category names and browse URLs. Pass a category name to kapruka_search_products as the category filter.',
      inputSchema: z.object({
        depth: z.number().optional(),
      }),
      execute: async (args) =>
        runTool('kapruka_list_categories', args, session, cartRef, uiFlagsRef),
    }),

    kapruka_list_delivery_cities: tool({
      description:
        "Look up Sri Lankan cities and towns in Kapruka's network by name.",
      inputSchema: z.object({
        query: z.string().optional(),
        limit: z.number().optional(),
      }),
      execute: async (args) =>
        runTool(
          'kapruka_list_delivery_cities',
          args,
          session,
          cartRef,
          uiFlagsRef,
        ),
    }),

    kapruka_check_delivery: tool({
      description:
        'Check delivery availability, cost, and perishable warnings to a Sri Lankan city and date.',
      inputSchema: z.object({
        city: z.string(),
        delivery_date: z.string().optional(),
        product_id: z.string().optional(),
      }),
      execute: async (args) =>
        runTool('kapruka_check_delivery', args, session, cartRef, uiFlagsRef),
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
      execute: async (args) =>
        runTool('kapruka_create_order', args, session, cartRef, uiFlagsRef),
    }),

    kapruka_track_order: tool({
      description:
        'Track status after payment using the order number from the confirmation email.',
      inputSchema: z.object({
        order_number: z.string(),
      }),
      execute: async (args) =>
        runTool('kapruka_track_order', args, session, cartRef, uiFlagsRef),
    }),

    show_products_carousel: tool({
      description:
        'Display product carousel from the last kapruka_search_products call. Call with no arguments — server supplies all results and pagination.',
      inputSchema: z.object({}),
      execute: async (): Promise<WidgetToolOutput> =>
        runTool(
          'show_products_carousel',
          {},
          session,
          cartRef,
          uiFlagsRef,
        ) as Promise<WidgetToolOutput>,
    }),

    show_product_detail: tool({
      description:
        'Render the full product detail card. Pass product_id only — the server fetches live Kapruka data (images, variants, shipping, specs).',
      inputSchema: z.object({
        product_id: z.string(),
      }),
      execute: async (args): Promise<WidgetToolOutput> =>
        runTool(
          'show_product_detail',
          args,
          session,
          cartRef,
          uiFlagsRef,
        ) as Promise<WidgetToolOutput>,
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
      execute: async (args): Promise<WidgetToolOutput> =>
        runTool(
          'show_delivery_quote',
          args,
          session,
          cartRef,
          uiFlagsRef,
        ) as Promise<WidgetToolOutput>,
    }),

    show_categories_list: tool({
      description:
        'Display Kapruka categories with browse links. Call ONLY after kapruka_list_categories succeeds. Never pass category data — MCP session only.',
      inputSchema: z.object({}),
      execute: async (): Promise<WidgetToolOutput> =>
        runTool(
          'show_categories_list',
          {},
          session,
          cartRef,
          uiFlagsRef,
        ) as Promise<WidgetToolOutput>,
    }),

    show_checkout_form: tool({
      description:
        'Display the pay summary card after a successful kapruka_create_order. Never pass URLs or order numbers — they come from the last create_order call.',
      inputSchema: z.object({}),
      execute: async (): Promise<WidgetToolOutput> =>
        runTool(
          'show_checkout_form',
          {},
          session,
          cartRef,
          uiFlagsRef,
        ) as Promise<WidgetToolOutput>,
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
      execute: async (args): Promise<WidgetToolOutput> =>
        runTool(
          'show_order_status',
          args,
          session,
          cartRef,
          uiFlagsRef,
        ) as Promise<WidgetToolOutput>,
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
      execute: async (args) =>
        runTool('add_to_cart_action', args, session, cartRef, uiFlagsRef),
    }),

    remove_from_cart_action: tool({
      description: 'Delete an item from shopping cart dynamically in the application.',
      inputSchema: z.object({
        product_id: z.string(),
      }),
      execute: async (args) =>
        runTool('remove_from_cart_action', args, session, cartRef, uiFlagsRef),
    }),

    clear_cart_action: tool({
      description: 'Empty the entire guest cart state.',
      inputSchema: z.object({}),
      execute: async () =>
        runTool('clear_cart_action', {}, session, cartRef, uiFlagsRef),
    }),

    show_basket_action: tool({
      description:
        'Open the shopping basket panel so the customer can review items, quantities, and checkout.',
      inputSchema: z.object({}),
      execute: async () =>
        runTool('show_basket_action', {}, session, cartRef, uiFlagsRef),
    }),

    set_app_language: tool({
      description:
        'Switch the app UI language and default reply language when the customer asks to change language. Also save the preference via addMemory.',
      inputSchema: z.object({
        locale: z.enum(['en', 'si', 'ta']).describe('en=English, si=Sinhala, ta=Tamil'),
      }),
      execute: async (args) =>
        runTool('set_app_language', args, session, cartRef, uiFlagsRef),
    }),
  } satisfies ToolSet;
}

export type KaprukaTools = ReturnType<typeof createKaprukaTools>;

export { buildCartContextMessage };
