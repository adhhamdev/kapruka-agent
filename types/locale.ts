export type AppLocale = 'en' | 'si' | 'ta';

export const APP_LOCALES: AppLocale[] = ['en', 'si', 'ta'];

export const LOCALE_STORAGE_KEY = 'kapruka-agent-locale';

export interface LocaleOption {
  code: AppLocale;
  label: string;
  nativeLabel: string;
  speechCode: string;
  agentLanguage: string;
  htmlLang: string;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    speechCode: 'en-US',
    agentLanguage: 'English',
    htmlLang: 'en',
  },
  {
    code: 'si',
    label: 'Sinhala',
    nativeLabel: 'සිංහල',
    speechCode: 'si-LK',
    agentLanguage: 'Sinhala',
    htmlLang: 'si',
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    speechCode: 'ta-LK',
    agentLanguage: 'Tamil',
    htmlLang: 'ta',
  },
];

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'en' || value === 'si' || value === 'ta';
}

export function getLocaleOption(code: AppLocale): LocaleOption {
  return LOCALE_OPTIONS.find((option) => option.code === code) ?? LOCALE_OPTIONS[0];
}
