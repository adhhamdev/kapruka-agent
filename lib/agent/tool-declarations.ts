import { Type } from '@google/genai';

/** Gemini function declarations for Kapruka MCP tools and virtual UI widgets. */
export const TOOL_DECLARATIONS = [
  {
    name: 'kapruka_search_products',
    description:
      "Search Kapruka's live retail catalog by keyword, categories, price bounds, sort configuration, etc.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        q: {
          type: Type.STRING,
          description:
            'Search keyword (e.g. cakes, flowers, chocolates, teddy bear)',
        },
        category: {
          type: Type.STRING,
          description: 'Category filter (e.g. Flowers, Cakes, Grocery)',
        },
        min_price: {
          type: Type.NUMBER,
          description: 'Minimum price in LKR',
        },
        max_price: {
          type: Type.NUMBER,
          description: 'Maximum price in LKR',
        },
        in_stock_only: {
          type: Type.BOOLEAN,
          description: 'Filter only in stock products (default true)',
        },
        sort: {
          type: Type.STRING,
          description:
            "Sort: relevance (default), price_asc, price_desc, newest, bestseller",
        },
        limit: {
          type: Type.INTEGER,
          description: 'Results per page (1–50, default 10)',
        },
        cursor: {
          type: Type.STRING,
          description: 'Pagination cursor from a previous search next_cursor',
        },
        include_stubs: {
          type: Type.BOOLEAN,
          description: 'Include category landing stubs (default false)',
        },
      },
      required: ['q'],
    },
  },
  {
    name: 'kapruka_get_product',
    description:
      'Get full granular details for a product by its ID, such as image, specs, and status.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: {
          type: Type.STRING,
          description: 'The product unique code or SKU',
        },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'kapruka_list_categories',
    description: 'Fetch top level Kapruka product department names and categories.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        depth: {
          type: Type.INTEGER,
          description: 'Hierarchy depth 1 or 2 (default 1)',
        },
      },
      required: [],
    },
  },
  {
    name: 'kapruka_list_delivery_cities',
    description:
      "Look up Sri Lankan cities and towns in Kapruka's network by name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description:
            'City prefix filter (e.g. Kandy, Colombo). Omit for alphabetical sample.',
        },
        limit: {
          type: Type.INTEGER,
          description: 'Max cities to return (1–50, default 25)',
        },
      },
      required: [],
    },
  },
  {
    name: 'kapruka_check_delivery',
    description:
      'Check delivery availability, cost, and perishable warnings to a Sri Lankan city and date.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: {
          type: Type.STRING,
          description: 'Canonical city name from cities lookup list',
        },
        delivery_date: {
          type: Type.STRING,
          description: 'Delivery date YYYY-MM-DD. Omit to check today.',
        },
        product_id: {
          type: Type.STRING,
          description: 'Optional product ID for perishable freshness warnings',
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'kapruka_create_order',
    description:
      "Create guest checkout order in Kapruka's live network and receive a click-to-pay link.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        cart: {
          type: Type.ARRAY,
          description: 'Items in the cart to purchase (1–30)',
          items: {
            type: Type.OBJECT,
            properties: {
              product_id: { type: Type.STRING, description: 'Product ID' },
              quantity: { type: Type.NUMBER, description: 'Quantity (1–99)' },
              icing_text: {
                type: Type.STRING,
                description: 'Cake icing message (ignored for non-cakes)',
              },
            },
            required: ['product_id'],
          },
        },
        recipient: {
          type: Type.OBJECT,
          description: 'Person receiving the gift in Sri Lanka',
          properties: {
            name: { type: Type.STRING, description: 'Recipient full name' },
            phone: {
              type: Type.STRING,
              description: 'Recipient phone (077… or +94…)',
            },
          },
          required: ['name', 'phone'],
        },
        delivery: {
          type: Type.OBJECT,
          description: 'Delivery address and schedule',
          properties: {
            address: {
              type: Type.STRING,
              description: 'Street delivery address',
            },
            city: {
              type: Type.STRING,
              description: 'Canonical Kapruka delivery city',
            },
            date: { type: Type.STRING, description: 'Delivery date YYYY-MM-DD' },
            location_type: {
              type: Type.STRING,
              description: 'house, apartment, office, or other',
            },
            instructions: {
              type: Type.STRING,
              description: 'Optional delivery instructions',
            },
          },
          required: ['address', 'city', 'date'],
        },
        sender: {
          type: Type.OBJECT,
          description: 'Gift sender name on the card',
          properties: {
            name: { type: Type.STRING, description: 'Sender name' },
            anonymous: {
              type: Type.BOOLEAN,
              description: 'Show Anonymous on gift card',
            },
          },
          required: ['name'],
        },
        gift_message: {
          type: Type.STRING,
          description: 'Optional message printed on Kapruka gift card',
        },
      },
      required: ['cart', 'recipient', 'delivery', 'sender'],
    },
  },
  {
    name: 'kapruka_track_order',
    description:
      'Track status after payment. Use the order number from the customer confirmation email — NOT the pre-payment checkout ref.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        order_number: {
          type: Type.STRING,
          description: 'Kapruka order number from confirmation email',
        },
      },
      required: ['order_number'],
    },
  },
  {
    name: 'show_products_carousel',
    description:
      'Client-side widget visualization for a list of matching search products. Always pass pagination when results came from search.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        products: {
          type: Type.ARRAY,
          description: 'List of products to display inside scrollable cards',
          items: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.STRING },
              name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              imageUrl: { type: Type.STRING, description: 'Absolute photo URL' },
              url: {
                type: Type.STRING,
                description: 'Kapruka product page URL from search results',
              },
              inStock: { type: Type.BOOLEAN },
            },
            required: ['productId', 'name', 'price'],
          },
        },
        pagination: {
          type: Type.OBJECT,
          description:
            'Search context for Load more — pass q, filters, next_cursor from search',
          properties: {
            q: { type: Type.STRING },
            category: { type: Type.STRING },
            min_price: { type: Type.NUMBER },
            max_price: { type: Type.NUMBER },
            sort: { type: Type.STRING },
            next_cursor: {
              type: Type.STRING,
              description: 'next_cursor from kapruka_search_products JSON',
            },
          },
          required: ['q'],
        },
      },
      required: ['products'],
    },
  },
  {
    name: 'show_product_detail',
    description:
      'Client-side widget visualization with exhaustive item specifications and dynamic buy CTA.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        product: {
          type: Type.OBJECT,
          properties: {
            productId: { type: Type.STRING },
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            imageUrl: { type: Type.STRING },
            inStock: { type: Type.BOOLEAN },
            description: { type: Type.STRING },
            url: { type: Type.STRING },
          },
          required: ['productId', 'name', 'price'],
        },
      },
      required: ['product'],
    },
  },
  {
    name: 'show_delivery_quote',
    description:
      'Visualize shipping options, flat cost, dates, or perishable/cake warning guidelines to recipient city.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: { type: Type.STRING },
        deliveryDate: { type: Type.STRING },
        cost: { type: Type.NUMBER },
        canDeliver: { type: Type.BOOLEAN },
        warning: {
          type: Type.STRING,
          description: 'Perishable warning (e.g. Needs cooling, fresh flowers)',
        },
      },
      required: ['city', 'deliveryDate', 'cost', 'canDeliver'],
    },
  },
  {
    name: 'show_checkout_form',
    description:
      'Visual checkout pay summary with high contrast invoice details and direct payment links.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        checkoutUrl: {
          type: Type.STRING,
          description: 'Target Kapruka payment gate url',
        },
        totalAmount: {
          type: Type.NUMBER,
          description: 'Final order amount in LKR',
        },
        itemsCount: { type: Type.NUMBER },
        orderNumber: {
          type: Type.STRING,
          description: 'Assigned transaction code',
        },
      },
      required: ['checkoutUrl', 'totalAmount', 'orderNumber'],
    },
  },
  {
    name: 'show_order_status',
    description:
      'Visual progress logs card tracker presenting shipping timestamps step-by-step for client order.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderNumber: { type: Type.STRING },
        status: { type: Type.STRING },
        recipientName: { type: Type.STRING },
        logs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: 'Timestamp log' },
              activity: {
                type: Type.STRING,
                description: 'Activity milestone',
              },
            },
            required: ['time', 'activity'],
          },
        },
      },
      required: ['orderNumber', 'status'],
    },
  },
  {
    name: 'add_to_cart_action',
    description:
      'Execute a client product cart addition, updating user shopping cart dynamically in state.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING },
        name: { type: Type.STRING },
        price: { type: Type.NUMBER },
        imageUrl: { type: Type.STRING },
        productUrl: {
          type: Type.STRING,
          description: 'Kapruka product page URL',
        },
        url: { type: Type.STRING, description: 'Kapruka product page URL (alias)' },
      },
      required: ['product_id', 'name', 'price'],
    },
  },
  {
    name: 'remove_from_cart_action',
    description: 'Delete an item from shopping cart dynamically in the application.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'clear_cart_action',
    description: 'Empty the entire guest cart state.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
];
