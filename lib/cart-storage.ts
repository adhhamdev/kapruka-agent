import { useCallback, useSyncExternalStore } from 'react';
import { safeParseCart } from '@/lib/errors';

export const CART_STORAGE_KEY = 'kapruka_agent_cart';

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const listeners = new Set<() => void>();

/** Stable snapshot cache — getSnapshot must return the same reference when data is unchanged. */
let cachedSerialized = '';
let cachedSnapshot: CartItem[] = [];

function emitCartChange() {
  listeners.forEach((listener) => listener());
}

function invalidateSnapshotCache() {
  cachedSerialized = '';
  cachedSnapshot = [];
}

function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(CART_STORAGE_KEY) ?? '';
  if (raw === cachedSerialized) {
    return cachedSnapshot;
  }

  cachedSerialized = raw;
  cachedSnapshot = safeParseCart(raw) as CartItem[];
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
  return [];
}

export function writeCartToStorage(cart: CartItem[]) {
  const serialized = JSON.stringify(cart);
  localStorage.setItem(CART_STORAGE_KEY, serialized);
  cachedSerialized = serialized;
  cachedSnapshot = cart;
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
