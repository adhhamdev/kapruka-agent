import { generateId } from 'ai';
import { LIVE_SESSION_TTL_MS } from '@/constants/live';
import type { KaprukaProduct, KaprukaProductDetail } from '@/lib/products';
import type { CheckoutFormData, KaprukaCategory } from '@/types/widgets';

export interface SearchSession {
  q: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  products: KaprukaProduct[];
  nextCursor: string | null;
}

export interface ToolSessionState {
  checkoutSession: CheckoutFormData | null;
  categoriesSession: KaprukaCategory[] | null;
  searchSession: SearchSession | null;
  productDetailCache: Map<string, KaprukaProductDetail>;
}

interface StoredSession {
  state: ToolSessionState;
  expiresAt: number;
}

const sessions = new Map<string, StoredSession>();

function createEmptyState(): ToolSessionState {
  return {
    checkoutSession: null,
    categoriesSession: null,
    searchSession: null,
    productDetailCache: new Map(),
  };
}

export function createLiveSessionId(): string {
  return `live-${generateId()}`;
}

export function getOrCreateToolSession(sessionId: string): ToolSessionState {
  const now = Date.now();
  const existing = sessions.get(sessionId);
  if (existing && existing.expiresAt > now) {
    existing.expiresAt = now + LIVE_SESSION_TTL_MS;
    return existing.state;
  }

  const state = createEmptyState();
  sessions.set(sessionId, {
    state,
    expiresAt: now + LIVE_SESSION_TTL_MS,
  });
  return state;
}

export function createInlineToolSession(): ToolSessionState {
  return createEmptyState();
}

export function deleteToolSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function touchToolSession(sessionId: string): void {
  const entry = sessions.get(sessionId);
  if (entry) {
    entry.expiresAt = Date.now() + LIVE_SESSION_TTL_MS;
  }
}

// Periodic cleanup for abandoned live sessions.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of sessions) {
      if (entry.expiresAt <= now) {
        sessions.delete(id);
      }
    }
  }, 60_000);
}
