import type { FunctionDeclaration } from '@google/genai';

export const LIVE_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'kapruka_search_products',
    description:
      "Search Kapruka's live retail catalog by keyword, categories, price bounds, sort configuration, etc.",
    parametersJsonSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search keyword' },
        category: { type: 'string' },
        min_price: { type: 'number' },
        max_price: { type: 'number' },
        in_stock_only: { type: 'boolean' },
        sort: { type: 'string' },
        limit: { type: 'number' },
        cursor: { type: 'string' },
      },
      required: ['q'],
    },
  },
  {
    name: 'kapruka_get_product',
    description:
      'Get full product details by ID. Always call show_product_detail with the same product_id afterward.',
    parametersJsonSchema: {
      type: 'object',
      properties: { product_id: { type: 'string' } },
      required: ['product_id'],
    },
  },
  {
    name: 'kapruka_list_categories',
    description: 'Fetch top-level Kapruka category names and browse URLs.',
    parametersJsonSchema: {
      type: 'object',
      properties: { depth: { type: 'number' } },
    },
  },
  {
    name: 'kapruka_list_delivery_cities',
    description: "Look up Sri Lankan cities in Kapruka's delivery network.",
    parametersJsonSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'kapruka_check_delivery',
    description: 'Check delivery availability, cost, and warnings.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        delivery_date: { type: 'string' },
        product_id: { type: 'string' },
      },
      required: ['city'],
    },
  },
  {
    name: 'kapruka_create_order',
    description:
      'Create guest checkout order and receive a pay link. Requires recipient, delivery, and sender details.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        cart: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              product_id: { type: 'string' },
              quantity: { type: 'number' },
              icing_text: { type: 'string' },
            },
            required: ['product_id'],
          },
        },
        recipient: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
          },
          required: ['name', 'phone'],
        },
        delivery: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            city: { type: 'string' },
            date: { type: 'string' },
            location_type: { type: 'string' },
            instructions: { type: 'string' },
          },
          required: ['address', 'city', 'date'],
        },
        sender: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            anonymous: { type: 'boolean' },
          },
          required: ['name'],
        },
        gift_message: { type: 'string' },
      },
      required: ['cart', 'recipient', 'delivery', 'sender'],
    },
  },
  {
    name: 'kapruka_track_order',
    description: 'Track order status after payment.',
    parametersJsonSchema: {
      type: 'object',
      properties: { order_number: { type: 'string' } },
      required: ['order_number'],
    },
  },
  {
    name: 'show_products_carousel',
    description:
      'Display product carousel from the last kapruka_search_products call. No arguments.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'show_product_detail',
    description: 'Render product detail card. Pass product_id only.',
    parametersJsonSchema: {
      type: 'object',
      properties: { product_id: { type: 'string' } },
      required: ['product_id'],
    },
  },
  {
    name: 'show_delivery_quote',
    description: 'Visualize shipping options and delivery quote.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        deliveryDate: { type: 'string' },
        cost: { type: 'number' },
        canDeliver: { type: 'boolean' },
        warning: { type: 'string' },
      },
      required: ['city', 'deliveryDate', 'cost', 'canDeliver'],
    },
  },
  {
    name: 'show_categories_list',
    description:
      'Display categories after kapruka_list_categories. No arguments.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'show_checkout_form',
    description:
      'Display pay summary after successful kapruka_create_order. No arguments.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'show_order_status',
    description: 'Display order tracking progress card.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string' },
        status: { type: 'string' },
        recipientName: { type: 'string' },
        logs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              time: { type: 'string' },
              activity: { type: 'string' },
            },
          },
        },
      },
      required: ['orderNumber', 'status'],
    },
  },
  {
    name: 'add_to_cart_action',
    description: 'Add a product to the shopping cart.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'number' },
        imageUrl: { type: 'string' },
        productUrl: { type: 'string' },
        url: { type: 'string' },
      },
      required: ['product_id', 'name', 'price'],
    },
  },
  {
    name: 'remove_from_cart_action',
    description: 'Remove an item from the cart.',
    parametersJsonSchema: {
      type: 'object',
      properties: { product_id: { type: 'string' } },
      required: ['product_id'],
    },
  },
  {
    name: 'clear_cart_action',
    description: 'Empty the entire cart.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'show_basket_action',
    description: 'Open the shopping basket panel.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'set_app_language',
    description: 'Switch app UI language (en, si, ta).',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        locale: { type: 'string', enum: ['en', 'si', 'ta'] },
      },
      required: ['locale'],
    },
  },
];

export function getLiveToolsConfig() {
  return [{ functionDeclarations: LIVE_FUNCTION_DECLARATIONS }];
}
