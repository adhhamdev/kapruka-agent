export const WELCOME_MESSAGE = `Hi! I'm **Kapruka Agent** — your AI shopping assistant for Kapruka's full catalog, from exploring categories to checkout and delivery.

**I can help you with:**
- Browse categories and search products
- Check delivery dates and costs
- Manage your basket
- Checkout securely — save delivery details after checkout or ask me to remember them
- Track orders
- Recall saved addresses, gift recipients, language, and shopping preferences on this device

Open **Saved info** (person icon in the header) anytime to review or remove what I remember. Shopping works normally even if nothing is saved.

What would you like to shop for today?`;

export interface QuickStarter {
  label: string;
  iconName: 'sparkles' | 'truck';
  prompt: string;
}

export const QUICK_STARTERS: QuickStarter[] = [
  {
    label: 'Chocolates',
    iconName: 'sparkles',
    prompt: "Search chocolate gifts in Kapruka's Chocolates category.",
  },
  {
    label: 'Browse Categories',
    iconName: 'sparkles',
    prompt: "Show me Kapruka's shopping categories so I can explore what's available.",
  },
  {
    label: 'Groceries',
    iconName: 'sparkles',
    prompt: 'Search grocery essentials available for home delivery.',
  },
  {
    label: 'New Arrivals',
    iconName: 'sparkles',
    prompt: 'Show me the latest new arrivals on Kapruka.',
  },
  {
    label: 'Gift Vouchers',
    iconName: 'sparkles',
    prompt: 'Show me Kapruka gift vouchers and gift certificates.',
  },
  {
    label: 'Track Order',
    iconName: 'truck',
    prompt: 'I want to track my Kapruka order status.',
  },
  {
    label: 'Saved Details',
    iconName: 'sparkles',
    prompt:
      'What delivery addresses, gift recipients, or preferences do you remember for me?',
  },
];
