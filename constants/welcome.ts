import { APP_NAME } from '@/constants/brand';

export const WELCOME_STORAGE_KEY = 'kapruka-agent-welcome-dismissed';

export interface WelcomeFeature {
  title: string;
  description: string;
}

export const WELCOME_INTRO =
  'Your AI shopping assistant for Kapruka — talk live with Agent or type in chat. Explore the full catalog, compare products, arrange delivery, and checkout without leaving the conversation. Agent can optionally remember delivery details and gift recipients on this device to speed up future orders — you can review or clear them anytime from Saved info.';

export const WELCOME_MEMORY_NOTE =
  'Saved details are linked to this browser. You can review or remove them anytime from Saved info. Chat and checkout always work even if memory is unavailable.';

export const WELCOME_CAPABILITIES: WelcomeFeature[] = [
  {
    title: 'Talk live with Agent',
    description:
      'Real-time two-way voice — speak naturally, hear Agent reply, and watch product cards appear in chat while you shop. Same search, basket, delivery, and checkout powers as text.',
  },
  {
    title: 'Explore & search',
    description:
      "Browse categories and search Kapruka's full catalog — groceries, fashion, electronics, pharmacy, and more — in natural language.",
  },
  {
    title: 'Check delivery',
    description:
      'See whether items reach a city on your date, with costs and perishable notes.',
  },
  {
    title: 'Manage your basket',
    description:
      'Add, update, and review items — your basket stays saved on this device.',
  },
  {
    title: 'Remembers you',
    description:
      'Save delivery addresses, gift recipients, language preference, and shopping tastes — Agent recalls them next time you return.',
  },
  {
    title: 'Checkout securely',
    description:
      'Get a real Kapruka guest checkout link when you are ready to pay.',
  },
  {
    title: 'Track orders',
    description: 'Look up order status and delivery history in one place.',
  },
];

export const WELCOME_YOU_CAN: string[] = [
  'Tap the mic for a live voice conversation — Agent talks back in real time',
  'Ask in English, Sinhala, Tamil, Singlish, or Tanglish',
  'Type or attach images anytime — even during a live voice session',
  'Tap a suggestion to start shopping instantly',
  'Open Basket from the header anytime',
  'Open Saved info to see or clear what Agent remembers',
];

export const WELCOME_MODAL_TITLE = `Welcome to ${APP_NAME}`;

export const WELCOME_ILLUSTRATION_SRC = '/discover-illustration.png';

export const WELCOME_ILLUSTRATION_ALT =
  'Kapruka Agent on mobile: live voice AI chat, product cards, basket, checkout, delivery, and saved info.';
