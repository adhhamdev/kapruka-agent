import { APP_NAME } from '@/constants/brand';

export const WELCOME_STORAGE_KEY = 'kapruka-agent-welcome-dismissed';

export interface WelcomeFeature {
  title: string;
  description: string;
}

export const WELCOME_INTRO =
  'Your AI shopping assistant for Kapruka — explore the full catalog, compare products, arrange delivery, and checkout without leaving the conversation.';

export const WELCOME_CAPABILITIES: WelcomeFeature[] = [
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
  'Ask in English, Sinhala, Tamil, or Tanglish',
  'Use voice input or attach images in chat',
  'Browse quick prompts on the Discover tab',
  'Switch between Chat, Discover, and Basket anytime',
];

export const WELCOME_MODAL_TITLE = `Welcome to ${APP_NAME}`;

export const WELCOME_ILLUSTRATION_SRC = '/discover-illustration.png';

export const WELCOME_ILLUSTRATION_ALT =
  'Kapruka Agent on mobile: AI chat for gifts, product cards, basket, checkout, and delivery.';
