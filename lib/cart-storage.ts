import { useCallback, useSyncExternalStore } from 'react';
import { safeParseCart } from '@/lib/errors';

export const CART_STORAGE_KEY = 'kapruka_agent_cart';

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  productUrl?: string;
}

const listeners = new Set<() => void>();

/** Single stable empty-cart reference — required for getServerSnapshot and empty states. */
const EMPTY_CART: CartItem[] = [];

/** Stable snapshot cache — getSnapshot must return the same reference when data is unchanged. */
let cachedSerialized = '';
let cachedSnapshot: CartItem[] = EMPTY_CART;

function emitCartChange() {
  listeners.forEach((listener) => listener());
}

function invalidateSnapshotCache() {
  cachedSerialized = '';
  cachedSnapshot = EMPTY_CART;
}

function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART;

  const raw = localStorage.getItem(CART_STORAGE_KEY) ?? '';
  if (raw === cachedSerialized) {
    return cachedSnapshot;
  }

  cachedSerialized = raw;
  const parsed = safeParseCart(raw) as CartItem[];
  cachedSnapshot = parsed.length === 0 ? EMPTY_CART : parsed;
  return cachedSnapshot;
}

function subscribeToCart(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      invalidateSnapshotCache();
      onStoreChange();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

function getServerCartSnapshot(): CartItem[] {
  return EMPTY_CART;
}

export function writeCartToStorage(cart: CartItem[]) {
  const next = cart.length === 0 ? EMPTY_CART : cart;
  const serialized = JSON.stringify(next);
  localStorage.setItem(CART_STORAGE_KEY, serialized);
  cachedSerialized = serialized;
  cachedSnapshot = next;
  emitCartChange();
}

/** React external store for localStorage — snapshot references are stable between writes. */
export function useCartStorage() {
  const cart = useSyncExternalStore(
    subscribeToCart,
    readCartFromStorage,
    getServerCartSnapshot,
  );

  const setCart = useCallback(
    (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
      const prev = readCartFromStorage();
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeCartToStorage(next);
    },
    [],
  );

  return { cart, setCart };
}
