export const REMEMBER_DELIVERY_DISMISSED_KEY =
  'kapruka_agent_remember_delivery_dismissed';

function readDismissedOrders(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(REMEMBER_DELIVERY_DISMISSED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value) => typeof value === 'string'));
  } catch {
    return new Set();
  }
}

export function isRememberDeliveryDismissed(orderNumber: string): boolean {
  return readDismissedOrders().has(orderNumber);
}

export function markRememberDeliveryHandled(orderNumber: string): void {
  if (typeof window === 'undefined') return;
  try {
    const next = readDismissedOrders();
    next.add(orderNumber);
    localStorage.setItem(
      REMEMBER_DELIVERY_DISMISSED_KEY,
      JSON.stringify([...next].slice(-40)),
    );
  } catch {
    /* ignore quota errors */
  }
}
