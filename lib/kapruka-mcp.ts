import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export interface KaprukaToolResponse {
  content: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>;
  isError?: boolean;
}

/**
 * Invokes a tool on the Kapruka remote MCP server using the official modelcontextprotocol/sdk.
 * Note: StreamableHTTPClientTransport uses modern fetch, bypassing legacy EventSource issues.
 */
export async function callKaprukaTool(toolName: string, args: any): Promise<any> {
  console.log(`[Kapruka MCP] Invoking tool ${toolName} with args:`, JSON.stringify(args));
  
  const transport = new StreamableHTTPClientTransport(new URL("https://mcp.kapruka.com/mcp"), {
    requestInit: {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      }
    }
  });

  const client = new Client({
    name: "kapruka-agent-challenge",
    version: "1.0.0",
  });

  try {
    // Connect to the Kapruka MCP server using Streamable HTTP Client
    await client.connect(transport);
    
    // Call the specific tool, wrapping the arguments inside 'params' as required by fastmcp/pydantic-mcp
    const response = await client.callTool({
      name: toolName,
      arguments: {
        params: args
      }
    });
    
    console.log(`[Kapruka MCP] Successful response from ${toolName}`);
    return response;
  } catch (error: any) {
    console.error(`[Kapruka MCP Error] Failed to call tool ${toolName}:`, error);
    return {
      content: [{
        type: "text",
        text: `Error calling Kapruka tool ${toolName}: ${error?.message || error || "Unknown Error"}`
      }],
      isError: true
    };
  } finally {
    // Always clean up the streamable transport
    try {
      await transport.close();
    } catch (closeErr) {
      console.warn("[Kapruka MCP] Warning closing transport:", closeErr);
    }
  }
}

/**
 * Dedicated helper functions to interface with specific Kapruka MCP tools
 */
export async function searchProducts(q: string, category?: string, minPrice?: number, maxPrice?: number, inStockOnly = true, sort?: string) {
  const args: any = { q };
  if (category) args.category = category;
  if (minPrice !== undefined) args.min_price = minPrice;
  if (maxPrice !== undefined) args.max_price = maxPrice;
  args.in_stock_only = inStockOnly;
  if (sort) args.sort = sort;
  
  return callKaprukaTool("kapruka_search_products", args);
}

export async function getProduct(productId: string) {
  return callKaprukaTool("kapruka_get_product", { product_id: productId });
}

export async function listCategories(depth = 1) {
  return callKaprukaTool("kapruka_list_categories", { depth });
}

export async function listDeliveryCities(query: string) {
  return callKaprukaTool("kapruka_list_delivery_cities", { query });
}

export async function checkDelivery(city: string, deliveryDate: string, productId: string) {
  return callKaprukaTool("kapruka_check_delivery", {
    city,
    delivery_date: deliveryDate,
    product_id: productId
  });
}

export async function createOrder(params: {
  cart: Array<{ product_id: string; quantity: number; price?: number }>;
  recipient: { name: string; address: string; phone: string; email?: string };
  delivery: { city: string; date: string };
  sender: { name: string; phone: string; email: string };
  gift_message?: string;
  currency?: string;
}) {
  return callKaprukaTool("kapruka_create_order", params);
}

export async function trackOrder(orderNumber: string) {
  return callKaprukaTool("kapruka_track_order", { order_number: orderNumber });
}
