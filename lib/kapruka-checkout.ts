import type { KaprukaToolResponse } from '@/lib/kapruka-mcp';
import type { CheckoutFormData, DeliverySnapshot } from '@/types/widgets';

export interface ParsedCreateOrder {
  ok: true;
  checkoutUrl: string;
  orderRef: string;
  grandTotal: number;
  currency: string;
  expiresAt?: string;
}

export interface ParsedCreateOrderError {
  ok: false;
  error: string;
}

export type ParseCreateOrderResult = ParsedCreateOrder | ParsedCreateOrderError;

interface CreateOrderJson {
  checkout_url?: string;
  order_ref?: string;
  summary?: {
    grand_total?: number;
    currency?: string;
  };
  expires_at?: string;
}

function extractMcpText(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;

  const structured = (response as { structuredContent?: { result?: string } })
    .structuredContent?.result;
  if (typeof structured === 'string' && structured.trim()) {
    return structured;
  }

  const content = (response as KaprukaToolResponse).content;
  if (!Array.isArray(content)) return null;

  const textPart = content.find((part) => part.type === 'text' && part.text);
  return textPart?.text ?? null;
}

function parseErrorMessage(text: string): ParsedCreateOrderError | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('Error')) return null;
  return { ok: false, error: trimmed };
}

export function parseCreateOrderResponse(
  response: unknown,
): ParseCreateOrderResult {
  const text = extractMcpText(response);
  if (!text) {
    return { ok: false, error: 'No response from Kapruka create order.' };
  }

  const errorResult = parseErrorMessage(text);
  if (errorResult) return errorResult;

  try {
    const parsed = JSON.parse(text) as CreateOrderJson;
    const checkoutUrl = parsed.checkout_url?.trim();
    const orderRef = parsed.order_ref?.trim();
    const grandTotal = parsed.summary?.grand_total;

    if (!checkoutUrl || !orderRef || grandTotal === undefined) {
      return {
        ok: false,
        error: 'Kapruka order response was missing checkout_url, order_ref, or total.',
      };
    }

    if (
      !checkoutUrl.startsWith('https://www.kapruka.com/') ||
      checkoutUrl.includes('/payment/checkout/')
    ) {
      return {
        ok: false,
        error: 'Kapruka returned an invalid checkout URL.',
      };
    }

    return {
      ok: true,
      checkoutUrl,
      orderRef,
      grandTotal,
      currency: parsed.summary?.currency ?? 'LKR',
      expiresAt: parsed.expires_at,
    };
  } catch {
    return { ok: false, error: 'Could not parse Kapruka order response.' };
  }
}

export function toCheckoutFormData(
  parsed: ParsedCreateOrder,
  itemsCount: number,
  delivery?: DeliverySnapshot,
): CheckoutFormData {
  return {
    checkoutUrl: parsed.checkoutUrl,
    orderNumber: parsed.orderRef,
    totalAmount: parsed.grandTotal,
    itemsCount,
    ...(delivery ? { delivery } : {}),
  };
}
