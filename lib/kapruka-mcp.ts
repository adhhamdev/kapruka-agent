import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export interface KaprukaToolResponse {
  content: Array<{
    type: string;
    text?: string;
    [key: string]: unknown;
  }>;
  isError?: boolean;
}

export async function callKaprukaTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<KaprukaToolResponse> {
  console.log(
    `[Kapruka MCP] Invoking tool ${toolName} with args:`,
    JSON.stringify(args),
  );

  const transport = new StreamableHTTPClientTransport(
    new URL('https://mcp.kapruka.com/mcp'),
    {
      requestInit: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        },
      },
    },
  );

  const client = new Client({
    name: 'kapruka-agent-challenge',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);

    const response = await client.callTool({
      name: toolName,
      arguments: {
        params: args,
      },
    });

    console.log(`[Kapruka MCP] Successful response from ${toolName}`);
    return response as KaprukaToolResponse;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error ?? 'Unknown Error');
    console.error(`[Kapruka MCP Error] Failed to call tool ${toolName}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error calling Kapruka tool ${toolName}: ${message}`,
        },
      ],
      isError: true,
    };
  } finally {
    try {
      await transport.close();
    } catch (closeErr) {
      console.warn('[Kapruka MCP] Warning closing transport:', closeErr);
    }
  }
}

export interface SearchProductsArgs {
  q: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  sort?: string;
  limit?: number;
  cursor?: string;
  currency?: string;
  include_stubs?: boolean;
  response_format?: 'markdown' | 'json';
}

export async function searchProducts(args: SearchProductsArgs) {
  const params: Record<string, unknown> = {
    q: args.q,
    in_stock_only: args.in_stock_only ?? true,
    response_format: args.response_format ?? 'json',
  };
  if (args.category) params.category = args.category;
  if (args.min_price !== undefined) params.min_price = args.min_price;
  if (args.max_price !== undefined) params.max_price = args.max_price;
  if (args.sort) params.sort = args.sort;
  if (args.limit !== undefined) params.limit = args.limit;
  if (args.cursor) params.cursor = args.cursor;
  if (args.currency) params.currency = args.currency;
  if (args.include_stubs !== undefined) params.include_stubs = args.include_stubs;

  return callKaprukaTool('kapruka_search_products', params);
}

export async function getProduct(
  productId: string,
  options?: { currency?: string; response_format?: 'markdown' | 'json' },
) {
  return callKaprukaTool('kapruka_get_product', {
    product_id: productId,
    currency: options?.currency ?? 'LKR',
    response_format: options?.response_format ?? 'markdown',
  });
}

export async function listCategories(
  depth = 1,
  response_format: 'markdown' | 'json' = 'markdown',
) {
  return callKaprukaTool('kapruka_list_categories', { depth, response_format });
}

export async function listDeliveryCities(
  query?: string,
  limit = 25,
  response_format: 'markdown' | 'json' = 'markdown',
) {
  const params: Record<string, unknown> = { limit, response_format };
  if (query) params.query = query;
  return callKaprukaTool('kapruka_list_delivery_cities', params);
}

export async function checkDelivery(
  city: string,
  deliveryDate?: string,
  productId?: string,
  response_format: 'markdown' | 'json' = 'markdown',
) {
  const params: Record<string, unknown> = { city, response_format };
  if (deliveryDate) params.delivery_date = deliveryDate;
  if (productId) params.product_id = productId;
  return callKaprukaTool('kapruka_check_delivery', params);
}

export interface CreateOrderCartItem {
  product_id: string;
  quantity?: number;
  icing_text?: string;
}

export interface CreateOrderParams {
  cart: CreateOrderCartItem[];
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
  currency?: string;
  response_format?: 'markdown' | 'json';
}

export async function createOrder(params: CreateOrderParams) {
  return callKaprukaTool('kapruka_create_order', {
    ...params,
    currency: params.currency ?? 'LKR',
    response_format: params.response_format ?? 'markdown',
  });
}

export async function trackOrder(
  orderNumber: string,
  response_format: 'markdown' | 'json' = 'markdown',
) {
  return callKaprukaTool('kapruka_track_order', {
    order_number: orderNumber,
    response_format,
  });
}
