import type { AppLocale } from '@/types/locale';
import { en, type Messages } from '@/lib/i18n/messages/en';
import { si } from '@/lib/i18n/messages/si';
import { ta } from '@/lib/i18n/messages/ta';

export type { Messages, QuickStarterMessages, WelcomeFeatureMessages } from '@/lib/i18n/messages/en';

const catalogs: Record<AppLocale, Messages> = {
  en,
  si,
  ta,
};

export function getMessages(locale: AppLocale): Messages {
  return catalogs[locale];
}

export { en, si, ta };
