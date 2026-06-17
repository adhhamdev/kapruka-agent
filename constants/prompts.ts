export const WELCOME_MESSAGE = `Hello! I'm Kapruka Agent, your AI shopping concierge for Kapruka.

I can search our live catalog, check delivery quotes, manage your cart, and generate a guest payment link.

What are you looking for today?`;

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
