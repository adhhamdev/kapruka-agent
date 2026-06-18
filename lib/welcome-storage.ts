import { WELCOME_STORAGE_KEY } from '@/constants/welcome';

export function hasWelcomeBeenDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(WELCOME_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

export function markWelcomeDismissed(): void {
  try {
    localStorage.setItem(WELCOME_STORAGE_KEY, '1');
  } catch {
    /* storage unavailable */
  }
}
