import {
  isAppLocale,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from '@/types/locale';

export function getStoredLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isAppLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function hasLocaleBeenSelected(): boolean {
  return getStoredLocale() !== null;
}

export function saveLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* storage unavailable */
  }
}
