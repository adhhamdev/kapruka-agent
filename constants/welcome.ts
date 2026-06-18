import { APP_NAME } from '@/constants/brand';

export const WELCOME_STORAGE_KEY = 'kapruka-agent-welcome-dismissed';

export interface WelcomeFeature {
  title: string;
  description: string;
}

export const WELCOME_INTRO =
  'Your AI shopping concierge for Kapruka — search, compare, deliver, and checkout without leaving the conversation.';

export const WELCOME_CAPABILITIES: WelcomeFeature[] = [
  {
    title: 'Search the catalog',
    description:
      'Find gifts, flowers, cakes, toys, and more across Kapruka with natural language.',
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
  'Browse quick prompts on the Search tab',
  'Switch between Agent, Search, and Basket anytime',
];

export const WELCOME_MODAL_TITLE = `Welcome to ${APP_NAME}`;
