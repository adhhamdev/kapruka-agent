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
            "Sort code ('price_asc', 'price_desc', 'best_seller', 'newest')",
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
          description: 'Hierarchy depth (default 1)',
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
            'City or postal area name prefix (e.g. Kandy, Colombo, Galle, Jaffna)',
        },
      },
      required: ['query'],
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
          description: 'Delivery date YYYY-MM-DD',
        },
        product_id: {
          type: Type.STRING,
          description: 'The product ID you plan to ship',
        },
      },
      required: ['city', 'delivery_date', 'product_id'],
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
          description: 'Items in the cart to purchase',
          items: {
            type: Type.OBJECT,
            properties: {
              product_id: { type: Type.STRING, description: 'Product ID' },
              quantity: { type: Type.NUMBER, description: 'Quantity to order' },
            },
            required: ['product_id', 'quantity'],
          },
        },
        recipient: {
          type: Type.OBJECT,
          description: 'The person in Sri Lanka receiving the goods',
          properties: {
            name: { type: Type.STRING, description: 'Recipient full name' },
            address: {
              type: Type.STRING,
              description: 'Full physical delivery street address',
            },
            phone: {
              type: Type.STRING,
              description: 'Local Sri Lankan phone number (e.g. 0771234567)',
            },
            email: {
              type: Type.STRING,
              description: 'Optional recipient email address',
            },
          },
          required: ['name', 'address', 'phone'],
        },
        delivery: {
          type: Type.OBJECT,
          description: 'Delivery scheduling details',
          properties: {
            city: {
              type: Type.STRING,
              description: 'Canonical delivery city Name',
            },
            date: { type: Type.STRING, description: 'Delivery date YYYY-MM-DD' },
          },
          required: ['city', 'date'],
        },
        sender: {
          type: Type.OBJECT,
          description: 'The sender (buyer) contact details',
          properties: {
            name: { type: Type.STRING, description: 'Sender or buyer name' },
            phone: {
              type: Type.STRING,
              description:
                'Sender phone number with country prefix if external',
            },
            email: {
              type: Type.STRING,
              description: 'Sender email address for invoice delivery',
            },
          },
          required: ['name', 'phone', 'email'],
        },
        gift_message: {
          type: Type.STRING,
          description: 'Optional message printed on Kapruka gift card',
        },
        currency: { type: Type.STRING, description: "Currency default 'LKR'" },
      },
      required: ['cart', 'recipient', 'delivery', 'sender'],
    },
  },
  {
    name: 'kapruka_track_order',
    description:
      'Track status, recipient, dispatch progress, and delivery logs for a given Kapruka order reference.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        order_number: {
          type: Type.STRING,
          description: 'The purchase order or invoice reference',
        },
      },
      required: ['order_number'],
    },
  },
  {
    name: 'show_products_carousel',
    description:
      'Client-side widget visualization for a list of matching search products.',
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
