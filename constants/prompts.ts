export const WELCOME_MESSAGE = `Hello. I'm your Kapruka shopping assistant.

I can search our catalog, check delivery options, manage your basket, and help you checkout.

What would you like to find today?`;

export interface QuickStarter {
  label: string;
  iconName: 'sparkles' | 'truck';
  prompt: string;
}

export const QUICK_STARTERS: QuickStarter[] = [
  {
    label: 'Fresh Flowers',
    iconName: 'sparkles',
    prompt: 'Show me fresh flower bouquets available for delivery',
  },
  {
    label: 'Birthday Cakes',
    iconName: 'sparkles',
    prompt:
      'Find a delicious birthday cake. I want to see what options you have.',
  },
  {
    label: 'Track Order',
    iconName: 'truck',
    prompt:
      'How do I track my order? I want to track an existing order status.',
  },
];
