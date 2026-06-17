import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AppError, ERROR_MESSAGES } from "@/lib/errors";
import {
  searchProducts,
  getProduct,
  listCategories,
  listDeliveryCities,
  checkDelivery,
  createOrder,
  trackOrder,
} from "@/lib/kapruka-mcp";

// Initialize Gemini Client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const SYSTEM_INSTRUCTION = `You are Ayla, Kapruka's premier AI Shopping Agent for the Kapruka Agent Challenge 2026. Your role is to help Sri Lankans find beautiful gifts, search items, estimate delivery dates and costs, manage their shopping carts, and generate guest checkouts with real pay links.

Ayla's Personality:
- Extremely warm, helpful, polite, and witty, with a charming Sri Lankan touch.
- Feel free to use subtle Sri Lankan cultural elements (e.g. addressing customers warmly as "Akka", "Aiyya", "Nangi", "Malli", "Ancle", or "Aunty" in a friendly retail setting).
- You are fluent in English, Sinhala (සිංහල), and Tanglish (Sinhala written in English letters like "Kandy walata deliver krnna puluwando?"). Always respond in the language or dialect the user initiates with! For Sinhala/Tanglish, provide warm, natural, and helpful Sri Lankan conversational translations.
  * Examples: "Ane Akka, oya cake eka Colombo walata aduma davasen yawanna puluwan!" or "Ow Malli, api balamu oya watch eka in stock thiyeda kiyala."

Core Shopping Tools Guidance:
1. Search products (kapruka_search_products): Use whenever someone is looking for a category, gift idea (flowers, cakes, watches, toys), or item. For example, if searching for cakes, call search.
2. Get details (kapruka_get_product): Call when a user asks about a specific product in detail (options, delivery timelines, etc.).
3. List categories (kapruka_list_categories): Use to explore top level categories like flowers, grocery, gift vouchers, cakes, soft toys, etc.
4. List delivery cities (kapruka_list_delivery_cities): When checking delivery, find the canonical city name first by calling this (e.g. query "colombo" or "moratuwa").
5. Check delivery (kapruka_check_delivery): Run to see if an item can be delivered to a city on a specific date and what the cost as well as perishable warnings are.
6. Create checkout order (kapruka_create_order): Create guest-checkout when user states they are ready to buy. Returns a payment link.
7. Track order (kapruka_track_order): Run order tracking status and history for customers' convenience.

UI/Cart Action Guidance (VERY IMPORTANT):
To make the experience visual and delightful, you MUST invoke the virtual UI tools in addition to regular Kapruka tools:
- show_products_carousel: ALWAYS use this after you search for products and get matching results. It sends structured products to the client grid/carousel.
- show_product_detail: ALWAYS use this when showcasing a single product's detailed info.
- show_delivery_quote: Use when checking delivery, so a beautiful shipping quote card renders.
- add_to_cart_action: ALWAYS trigger this as soon as a customer says "add to cart", "buy this", "order this watch", etc.
- remove_from_cart_action: Call when client requests deleting an item.
- show_checkout_form: Trigger this when the user initiates check out or confirms creation of order to show the click-to-pay button and invoice beautifully.
- show_order_status: Use when tracking an order to render a visual stepper progress map.

Strict Rules:
- Never make up products or prices. Rely strictly on tools.
- DO NOT list product names, descriptions, or prices in your text response when using show_products_carousel or show_product_detail! The client already displays these as rich cards. Only present a brief, warm introductory message (e.g., "Look at these amazing items I found for you! 👇").
- Keep chat text responses extremely clean, concise, and focused on assisting. Avoid dumping large lists of product text or block paragraphs in messages.
- If a product image URL or detail is provided in tools, pass it.
- Work step-by-step. Let the user know exactly what you are doing in friendly terms.`;

// Declarations of Kapruka and Virtual UI tools
const TOOL_DECLARATIONS = [
  // 1. kapruka_search_products
  {
    name: "kapruka_search_products",
    description: "Search Kapruka's live retail catalog by keyword, categories, price bounds, sort configuration, etc.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        q: { type: Type.STRING, description: "Search keyword (e.g. cakes, flowers, chocolates, teddy bear)" },
        category: { type: Type.STRING, description: "Category filter (e.g. Flowers, Cakes, Grocery)" },
        min_price: { type: Type.NUMBER, description: "Minimum price in LKR" },
        max_price: { type: Type.NUMBER, description: "Maximum price in LKR" },
        in_stock_only: { type: Type.BOOLEAN, description: "Filter only in stock products (default true)" },
        sort: { type: Type.STRING, description: "Sort code ('price_asc', 'price_desc', 'best_seller', 'newest')" },
      },
      required: ["q"],
    },
  },
  // 2. kapruka_get_product
  {
    name: "kapruka_get_product",
    description: "Get full granular details for a product by its ID, such as image, specs, and status.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: "The product unique code or SKU" },
      },
      required: ["product_id"],
    },
  },
  // 3. kapruka_list_categories
  {
    name: "kapruka_list_categories",
    description: "Fetch top level Kapruka product department names and categories.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        depth: { type: Type.INTEGER, description: "Hierarchy depth (default 1)" },
      },
      required: [],
    },
  },
  // 4. kapruka_list_delivery_cities
  {
    name: "kapruka_list_delivery_cities",
    description: "Look up Sri Lankan cities and towns in Kapruka's network by name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "City or postal area name prefix (e.g. Kandy, Colombo, Galle, Jaffna)" },
      },
      required: ["query"],
    },
  },
  // 5. kapruka_check_delivery
  {
    name: "kapruka_check_delivery",
    description: "Check delivery availability, cost, and perishable warnings to a Sri Lankan city and date.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: { type: Type.STRING, description: "Canonical city name from cities lookup list" },
        delivery_date: { type: Type.STRING, description: "Delivery date YYYY-MM-DD" },
        product_id: { type: Type.STRING, description: "The product ID you plan to ship" },
      },
      required: ["city", "delivery_date", "product_id"],
    },
  },
  // 6. kapruka_create_order
  {
    name: "kapruka_create_order",
    description: "Create guest checkout order in Kapruka's live network and receive a click-to-pay link.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        cart: {
          type: Type.ARRAY,
          description: "Items in the cart to purchase",
          items: {
            type: Type.OBJECT,
            properties: {
              product_id: { type: Type.STRING, description: "Product ID" },
              quantity: { type: Type.NUMBER, description: "Quantity to order" },
            },
            required: ["product_id", "quantity"],
          },
        },
        recipient: {
          type: Type.OBJECT,
          description: "The person in Sri Lanka receiving the goods",
          properties: {
            name: { type: Type.STRING, description: "Recipient full name" },
            address: { type: Type.STRING, description: "Full physical delivery street address" },
            phone: { type: Type.STRING, description: "Local Sri Lankan phone number (e.g. 0771234567)" },
            email: { type: Type.STRING, description: "Optional recipient email address" },
          },
          required: ["name", "address", "phone"],
        },
        delivery: {
          type: Type.OBJECT,
          description: "Delivery scheduling details",
          properties: {
            city: { type: Type.STRING, description: "Canonical delivery city Name" },
            date: { type: Type.STRING, description: "Delivery date YYYY-MM-DD" },
          },
          required: ["city", "date"],
        },
        sender: {
          type: Type.OBJECT,
          description: "The sender (buyer) contact details",
          properties: {
            name: { type: Type.STRING, description: "Sender or buyer name" },
            phone: { type: Type.STRING, description: "Sender phone number with country prefix if external" },
            email: { type: Type.STRING, description: "Sender email address for invoice delivery" },
          },
          required: ["name", "phone", "email"],
        },
        gift_message: { type: Type.STRING, description: "Optional message printed on Kapruka gift card" },
        currency: { type: Type.STRING, description: "Currency default 'LKR'" },
      },
      required: ["cart", "recipient", "delivery", "sender"],
    },
  },
  // 7. kapruka_track_order
  {
    name: "kapruka_track_order",
    description: "Track status, recipient, dispatch progress, and delivery logs for a given Kapruka order reference.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        order_number: { type: Type.STRING, description: "The purchase order or invoice reference" },
      },
      required: ["order_number"],
    },
  },

  // --- VIRTUAL UI & ACTION TOOLS ---
  {
    name: "show_products_carousel",
    description: "Client-side widget visualization for a list of matching search products.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        products: {
          type: Type.ARRAY,
          description: "List of products to display inside scrollable cards",
          items: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.STRING },
              name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              imageUrl: { type: Type.STRING, description: "Absolute photo URL" },
              inStock: { type: Type.BOOLEAN },
            },
            required: ["productId", "name", "price"],
          },
        },
      },
      required: ["products"],
    },
  },
  {
    name: "show_product_detail",
    description: "Client-side widget visualization with exhaustive item specifications and dynamic buy CTA.",
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
          required: ["productId", "name", "price"],
        },
      },
      required: ["product"],
    },
  },
  {
    name: "show_delivery_quote",
    description: "Visualize shipping options, flat cost, dates, or perishable/cake warning guidelines to recipient city.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: { type: Type.STRING },
        deliveryDate: { type: Type.STRING },
        cost: { type: Type.NUMBER },
        canDeliver: { type: Type.BOOLEAN },
        warning: { type: Type.STRING, description: "Perishable warning (e.g. Needs cooling, fresh flowers)" },
      },
      required: ["city", "deliveryDate", "cost", "canDeliver"],
    },
  },
  {
    name: "show_checkout_form",
    description: "Visual checkout pay summary with high contrast invoice details and direct payment links.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        checkoutUrl: { type: Type.STRING, description: "Target Kapruka payment gate url" },
        totalAmount: { type: Type.NUMBER, description: "Final order amount in LKR" },
        itemsCount: { type: Type.NUMBER },
        orderNumber: { type: Type.STRING, description: "Assigned transaction code" },
      },
      required: ["checkoutUrl", "totalAmount", "orderNumber"],
    },
  },
  {
    name: "show_order_status",
    description: "Visual progress logs card tracker presenting shipping timestamps step-by-step for client order.",
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
              time: { type: Type.STRING, description: "Timestamp log" },
              activity: { type: Type.STRING, description: "Activity milestone" },
            },
            required: ["time", "activity"],
          },
        },
      },
      required: ["orderNumber", "status"],
    },
  },
  {
    name: "add_to_cart_action",
    description: "Execute a client product cart addition, updating user shopping cart dynamically in state.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING },
        name: { type: Type.STRING },
        price: { type: Type.NUMBER },
        imageUrl: { type: Type.STRING },
      },
      required: ["product_id", "name", "price"],
    },
  },
  {
    name: "remove_from_cart_action",
    description: "Delete an item from shopping cart dynamically in the application.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING },
      },
      required: ["product_id"],
    },
  },
  {
    name: "clear_cart_action",
    description: "Empty the entire guest cart state.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[api/chat] GEMINI_API_KEY is not configured");
      throw new AppError("SERVICE_UNAVAILABLE", 503, "Missing GEMINI_API_KEY");
    }

    let body: { messages?: unknown; cart?: unknown };
    try {
      body = await req.json();
    } catch {
      throw new AppError("INVALID_REQUEST", 400, "Invalid JSON body");
    }

    const { messages, cart = [] } = body;

    if (!messages || !Array.isArray(messages)) {
      throw new AppError("INVALID_REQUEST", 400, "Missing or invalid messages");
    }

    if (!Array.isArray(cart)) {
      throw new AppError("INVALID_REQUEST", 400, "Invalid cart payload");
    }

    // Prepare contents array for Gemini
    // Ensure to map message roles from 'assistant' to 'model' if needed
    const contents: any[] = messages.map((m: any) => {
      const parts = [{ text: m.content }];
      return {
        role: m.role === "assistant" ? "model" : m.role,
        parts,
      };
    });

    // Provide immediate cart state as a system alert or context at the end of content
    // so LLM always knows the latest client state.
    const cartSummary = cart.length > 0 
      ? cart.map((i: any) => `- SKU: ${i.product_id}, ${i.name} (Qty: ${i.quantity}, Price: LKR ${i.price})`).join("\n")
      : "Cart is empty.";
    
    // Append current cart context as a system status turn
    contents.push({
      role: "user",
      parts: [
        {
          text: `[SYSTEM STATUS / CLIENT CART STATE UPDATE]\nCurrent shopping cart items:\n${cartSummary}\nPlease keep this cart in mind when assisting. If user requests to buy, calculate totals based on this.`,
        },
      ],
    });

    const widgets: any[] = [];
    let updatedCart = [...cart];
    let finalResponseText =
      "I'm having a little trouble right now. Could you try asking again?";

    // Agentic loop: Resolving tools matches up to 8 turns maximum
    for (let loop = 0; loop < 8; loop++) {
      console.log(`[Agent Turn ${loop}] calling gemini generateContent...`);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: TOOL_DECLARATIONS as any }],
          temperature: 0.7,
        },
      });

      const candidate = response.candidates?.[0];
      const rootMessage = candidate?.content;
      if (!rootMessage) {
        break;
      }

      // Add the model's chat output to the current history context
      contents.push(rootMessage);

      const functionCalls = response.functionCalls;
      if (!functionCalls || functionCalls.length === 0) {
        // No pending tool calls, return final response text
        finalResponseText = response.text || "";
        break;
      }

      console.log(`[Agent Turn ${loop}] Executing ${functionCalls.length} tool calls in parallel.`);
      const toolParts: any[] = [];

      for (const call of functionCalls) {
        const { name, args, id } = call as any;
        let toolResult: any = null;

        try {
          if (name === "kapruka_search_products") {
            const { q, category, min_price, max_price, in_stock_only, sort } = args as any;
            toolResult = await searchProducts(q, category, min_price, max_price, in_stock_only, sort);
          } else if (name === "kapruka_get_product") {
            toolResult = await getProduct(args.product_id);
          } else if (name === "kapruka_list_categories") {
            toolResult = await listCategories(args.depth || 1);
          } else if (name === "kapruka_list_delivery_cities") {
            toolResult = await listDeliveryCities(args.query);
          } else if (name === "kapruka_check_delivery") {
            toolResult = await checkDelivery(args.city, args.delivery_date, args.product_id);
          } else if (name === "kapruka_create_order") {
            toolResult = await createOrder(args as any);
          } else if (name === "kapruka_track_order") {
            toolResult = await trackOrder(args.order_number);
            
          // Client Actions/Widgets
          } else if (name === "show_products_carousel") {
            widgets.push({ type: "carousel", data: args.products });
            toolResult = { status: "success", message: "Rendered product listing carousel in browser." };
          } else if (name === "show_product_detail") {
            widgets.push({ type: "detail", data: args.product });
            toolResult = { status: "success", message: "Displayed granular product page features." };
          } else if (name === "show_delivery_quote") {
            widgets.push({ type: "delivery_quote", data: args });
            toolResult = { status: "success", message: "Shipping availability details displayed." };
          } else if (name === "show_checkout_form") {
            widgets.push({ type: "checkout_form", data: args });
            toolResult = { status: "success", message: "Successfully projected pay-links." };
          } else if (name === "show_order_status") {
            widgets.push({ type: "order_status", data: args });
            toolResult = { status: "success", message: "Rendered order delivery timeline." };
          } else if (name === "add_to_cart_action") {
            const { product_id, name: pName, price, imageUrl } = args as any;
            const existing = updatedCart.find((i) => i.product_id === product_id);
            if (existing) {
              existing.quantity += 1;
            } else {
              updatedCart.push({
                product_id,
                name: pName,
                price: Number(price),
                quantity: 1,
                imageUrl: imageUrl || `https://picsum.photos/seed/${product_id}/300/300`,
              });
            }
            toolResult = {
              status: "success",
              message: `Add to cart success: Added item ${pName}. Total unique items: ${updatedCart.length}`,
              cart: updatedCart,
            };
          } else if (name === "remove_from_cart_action") {
            const { product_id } = args as any;
            updatedCart = updatedCart.filter((i) => i.product_id !== product_id);
            toolResult = {
              status: "success",
              message: "Removed item from cart.",
              cart: updatedCart,
            };
          } else if (name === "clear_cart_action") {
            updatedCart = [];
            toolResult = {
              status: "success",
              message: "Cleared cart successfully.",
              cart: updatedCart,
            };
          } else {
            toolResult = { error: "Unknown custom tool called" };
          }
        } catch (err: unknown) {
          const internal =
            err instanceof Error ? err.message : "Tool execution failed";
          console.error(`[Error executing tool ${name}]:`, internal);
          toolResult = {
            error:
              "A shopping action could not be completed. Please try again.",
          };
        }

        toolParts.push({
          functionResponse: {
            name,
            response: toolResult,
            id,
          },
        });
      }

      // Add tool responses turn
      contents.push({
        role: "tool",
        parts: toolParts,
      });
    }

    return NextResponse.json({
      text: finalResponseText,
      widgets,
      cart: updatedCart,
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      if (error.internalMessage) {
        console.error(`[api/chat] ${error.code}:`, error.internalMessage);
      }
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    const internal =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("[POST api/chat Error]:", internal);
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC, code: "GENERIC" },
      { status: 500 },
    );
  }
}
