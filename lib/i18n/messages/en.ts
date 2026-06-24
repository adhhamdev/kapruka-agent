export interface QuickStarterMessages {
  label: string;
  iconName: 'sparkles' | 'truck';
  prompt: string;
}

export interface WelcomeFeatureMessages {
  title: string;
  description: string;
}

export interface Messages {
  brand: {
    appName: string;
    agentGreeting: string;
    ogImageAlt: string;
    appDescription: string;
  };
  language: {
    modalEyebrow: string;
    modalTitle: string;
    modalDescription: string;
    continue: string;
    preferenceLabel: string;
    preferenceDescription: string;
    savedSectionTitle: string;
    savedSectionDescription: string;
  };
  header: {
    shopAtKapruka: string;
    newChat: string;
    basket: string;
    savedInfo: string;
    hideBasket: string;
    showBasket: string;
    hideBasketWithCount: (count: number) => string;
    showBasketWithCount: (count: number) => string;
  };
  chat: {
    welcome: string;
    suggestions: string;
    widgetFallback: string;
    addedToBasket: (name: string) => string;
    checkoutPrompt: string;
    browseCategoryPrompt: (category: string) => string;
    productDetailPrompt: (name: string, productId: string) => string;
    sentAttachment: (name: string) => string;
    sentAttachments: (count: number) => string;
  };
  composer: {
    messageLabel: string;
    placeholder: string;
    listeningPlaceholder: string;
    attach: string;
    attachLimit: string;
    startVoice: string;
    stopVoice: string;
    processingVoice: string;
    requestingMic: string;
    voiceUnsupported: string;
    voiceUnsupportedBrowser: string;
    allowMic: string;
    listening: string;
    sending: string;
    send: string;
    attachmentHint: (count: number, max: number) => string;
  };
  cart: {
    title: string;
    items: (count: number) => string;
    empty: string;
    total: string;
    checkout: string;
    clear: string;
    close: string;
    closePanel: string;
    sidebarLabel: string;
    decreaseQty: (name: string) => string;
    increaseQty: (name: string) => string;
    removeItem: (name: string) => string;
    qtyFor: (name: string) => string;
  };
  savedInfo: {
    eyebrow: string;
    title: string;
    description: string;
    loading: string;
    unavailable: string;
    disabled: string;
    empty: string;
    emptyHighlight: string;
    peopleTitle: string;
    peopleDescription: string;
    addressesTitle: string;
    addressesDescription: string;
    languageTitle: string;
    languageDescription: string;
    preferencesTitle: string;
    preferencesDescription: string;
    otherTitle: string;
    otherDescription: string;
    remove: string;
    removeAria: (text: string) => string;
    close: string;
    clearConfirm: string;
    clearYes: string;
    clearing: string;
    clearCancel: string;
    clearAll: string;
  };
  welcome: {
    newHere: string;
    title: string;
    intro: string;
    whatAgentDoes: string;
    whatYouCan: string;
    memoryNote: string;
    getStarted: string;
    close: string;
    illustrationAlt: string;
    capabilities: WelcomeFeatureMessages[];
    youCan: string[];
  };
  quickStarters: QuickStarterMessages[];
  rememberDelivery: {
    prompt: string;
    yesSave: string;
    saving: string;
    notNow: string;
    saved: string;
    errorFallback: string;
    ok: string;
  };
  skipLink: string;
  errors: {
    network: string;
    timeout: string;
    serviceUnavailable: string;
    invalidRequest: string;
    rateLimited: string;
    generic: string;
    chatEmpty: string;
  };
}

export const en: Messages = {
  brand: {
    appName: 'Kapruka Agent',
    agentGreeting:
      "Hi, I'm Kapruka Agent — browse Kapruka's full catalog, check delivery, checkout securely, and optionally save your details so I can help faster next time.",
    ogImageAlt:
      'Kapruka Agent — AI shopping assistant for Kapruka with search, basket, checkout, and saved delivery details',
    appDescription:
      'Your AI shopping assistant for Kapruka. Explore the full catalog, check delivery, manage your basket, and checkout in one chat — with optional saved delivery details, gift recipients, and preferences for faster return visits.',
  },
  language: {
    modalEyebrow: 'Language',
    modalTitle: 'Choose your language',
    modalDescription:
      'Pick how you want Kapruka Agent and the app to speak with you. You can change this anytime from Saved info.',
    continue: 'Continue',
    preferenceLabel: 'App language',
    preferenceDescription: 'Changes the app interface and Agent’s default replies.',
    savedSectionTitle: 'Language',
    savedSectionDescription: 'How you prefer Agent to reply.',
  },
  header: {
    shopAtKapruka: 'Shop at Kapruka.com',
    newChat: 'New chat',
    basket: 'Basket',
    savedInfo: 'Saved info',
    hideBasket: 'Hide basket',
    showBasket: 'Show basket',
    hideBasketWithCount: (count) => `Hide basket, ${count} items`,
    showBasketWithCount: (count) => `Show basket, ${count} items`,
  },
  chat: {
    welcome: 'Welcome',
    suggestions: 'Suggestions',
    widgetFallback: 'Here is what I found for you.',
    addedToBasket: (name) => `Added **${name}** to your basket.`,
    checkoutPrompt:
      'I want to checkout. Ask me for recipient, delivery, and sender details before creating the order.',
    browseCategoryPrompt: (category) =>
      `Show me products in the ${category} category.`,
    productDetailPrompt: (name, productId) =>
      `Show full product details for ${name} (product_id: ${productId}).`,
    sentAttachment: (name) => `Sent ${name}`,
    sentAttachments: (count) => `Sent ${count} attachments`,
  },
  composer: {
    messageLabel: 'Message to Agent',
    placeholder: 'Ask Kapruka Agent…',
    listeningPlaceholder: 'Listening…',
    attach: 'Attach image or document',
    attachLimit: 'Maximum attachments reached',
    startVoice: 'Start voice input',
    stopVoice: 'Stop voice input',
    processingVoice: 'Processing voice input…',
    requestingMic: 'Requesting microphone permission…',
    voiceUnsupported: 'Voice input not supported in this browser',
    voiceUnsupportedBrowser: 'Voice input is not supported in this browser.',
    allowMic: 'Allow microphone access in the browser prompt to use voice input.',
    listening: 'Listening… tap stop when finished',
    sending: 'Sending message…',
    send: 'Send message',
    attachmentHint: (count, max) =>
      `${count}/${max} files · Up to 5 files · images or PDF/Word/txt · 5 MB each`,
  },
  cart: {
    title: 'Basket',
    items: (count) => `${count} Items`,
    empty: 'Your basket is empty',
    total: 'Total',
    checkout: 'Checkout',
    clear: 'Clear basket',
    close: 'Close basket',
    closePanel: 'Close basket panel',
    sidebarLabel: 'Shopping basket',
    decreaseQty: (name) => `Decrease quantity of ${name}`,
    increaseQty: (name) => `Increase quantity of ${name}`,
    removeItem: (name) => `Remove ${name} from basket`,
    qtyFor: (name) => `Quantity for ${name}`,
  },
  savedInfo: {
    eyebrow: 'Your details',
    title: 'Saved info',
    description:
      'Delivery addresses, people you shop for, and preferences Agent remembers to make checkout faster. You can remove anything here at any time.',
    loading: 'Loading your saved info…',
    unavailable:
      'Saved info is not available right now. You can keep shopping and chatting as usual — nothing is blocked.',
    disabled:
      'Personal memory is turned off on this site. Chat and checkout work normally without it.',
    empty:
      'Nothing saved yet. After checkout you can tap Yes, save it — or tell Agent to remember a delivery address or gift recipient.',
    emptyHighlight: 'Yes, save it',
    peopleTitle: 'People you shop for',
    peopleDescription: 'Gift recipients and people you send items to.',
    addressesTitle: 'Delivery addresses',
    addressesDescription: 'Names, phones, cities, and addresses used for delivery.',
    languageTitle: 'Language',
    languageDescription: 'How you prefer Agent to reply.',
    preferencesTitle: 'Shopping preferences',
    preferencesDescription: 'Budget, dietary notes, and other shopping tastes.',
    otherTitle: 'Other saved details',
    otherDescription: 'Anything else Agent remembered for you.',
    remove: 'Remove',
    removeAria: (text) => `Remove: ${text.slice(0, 60)}`,
    close: 'Close saved info',
    clearConfirm:
      'Remove everything Agent remembers about you on this device? This cannot be undone.',
    clearYes: 'Yes, remove everything',
    clearing: 'Removing…',
    clearCancel: 'Cancel',
    clearAll: 'Clear everything about me',
  },
  welcome: {
    newHere: 'New here?',
    title: 'Welcome to Kapruka Agent',
    intro:
      'Your AI shopping assistant for Kapruka — explore the full catalog, compare products, arrange delivery, and checkout without leaving the conversation. Agent can optionally remember delivery details and gift recipients on this device to speed up future orders — you can review or clear them anytime from Saved info.',
    whatAgentDoes: 'What Kapruka Agent does for you',
    whatYouCan: 'What you can do',
    memoryNote:
      'Saved details are linked to this browser. You can review or remove them anytime from Saved info. Chat and checkout always work even if memory is unavailable.',
    getStarted: 'Get Started',
    close: 'Close welcome dialog',
    illustrationAlt:
      'Kapruka Agent on mobile: AI chat for gifts, product cards, basket, checkout, delivery, and saved info.',
    capabilities: [
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
        description: 'Get a real Kapruka guest checkout link when you are ready to pay.',
      },
      {
        title: 'Track orders',
        description: 'Look up order status and delivery history in one place.',
      },
    ],
    youCan: [
      'Ask in English, Sinhala, Tamil, Singlish, or Tanglish',
      'Use voice input or attach images in chat',
      'Tap a suggestion to start shopping instantly',
      'Open Basket from the header anytime',
      'Open Saved info to see or change language and saved details',
    ],
  },
  quickStarters: [
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
  ],
  rememberDelivery: {
    prompt: 'Save this delivery address for next time?',
    yesSave: 'Yes, save it',
    saving: 'Saving…',
    notNow: 'Not now',
    saved: 'Saved — we can use this address next time you checkout.',
    errorFallback:
      'Could not save right now. You can still pay below — try again later from Saved info.',
    ok: 'OK',
  },
  skipLink: 'Skip to chat',
  errors: {
    network:
      "We couldn't reach Agent right now. Please check your connection and try again.",
    timeout: 'Agent is taking longer than usual. Please wait a moment and try again.',
    serviceUnavailable:
      'Our shopping assistant is temporarily unavailable. Please try again in a few minutes.',
    invalidRequest:
      "Something didn't look right with that request. Please try sending your message again.",
    rateLimited:
      "You're sending messages quickly. Please wait a moment before trying again.",
    generic:
      'Something went wrong on our end. Please try again, or refresh the page.',
    chatEmpty: 'Please type a message before sending.',
  },
};
