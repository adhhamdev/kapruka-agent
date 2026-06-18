export const WELCOME_MESSAGE = `Hi! I'm **Kapruka Agent** — your shopping concierge for gifts, flowers, cakes, and delivery across Sri Lanka.

**I can help you with:**
- Search our catalog
- Check delivery dates and costs
- Manage your basket
- Checkout securely

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
