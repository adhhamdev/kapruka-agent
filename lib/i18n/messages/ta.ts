import type { Messages } from '@/lib/i18n/messages/en';

export const ta: Messages = {
  brand: {
    appName: 'Kapruka Agent',
    agentGreeting:
      'வணக்கம், நான் Kapruka Agent — Kapruka முழு கatalog-ஐ browse செய்யுங்கள், delivery சரிபார்க்கவும், பாதுகாப்பாக checkout செய்யவும், விரும்பினால் உங்கள் விவரங்களை save செய்து அடுத்த முறை வேகமாக உதவுகிறேன்.',
    ogImageAlt:
      'Kapruka Agent — Kapruka AI shopping assistant: search, basket, checkout, saved delivery',
    appDescription:
      'Kapruka-க்கான AI shopping assistant. முழு catalog explore, delivery check, basket manage, chat-லே checkout — optional saved delivery, gift recipients, preferences உடன்.',
  },
  language: {
    modalEyebrow: 'மொழி',
    modalTitle: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    modalDescription:
      'Kapruka Agent மற்றும் app உங்களுடன் பேசும் மொழியைத் தேர்ந்தெடுக்கவும். Saved info-ல் anytime மாற்றலாம்.',
    continue: 'Continue',
    preferenceLabel: 'App மொழி',
    preferenceDescription: 'App interface மற்றும் Agent default replies மாற்றும்.',
    savedSectionTitle: 'மொழி',
    savedSectionDescription: 'Agent reply செய்ய விரும்பும் மொழி.',
  },
  header: {
    shopAtKapruka: 'Kapruka.com-ல் shop செய்ய',
    newChat: 'புதிய chat',
    basket: 'Basket',
    savedInfo: 'Saved info',
    hideBasket: 'Basket மறை',
    showBasket: 'Basket காட்டு',
    hideBasketWithCount: (count) => `Basket மறை, ${count} items`,
    showBasketWithCount: (count) => `Basket காட்டு, ${count} items`,
  },
  chat: {
    welcome: 'வரவேற்கிறோம்',
    suggestions: 'Suggestions',
    widgetFallback: 'உங்களுக்கு suitable ஆனவை இதோ.',
    addedToBasket: (name) => `**${name}** basket-ல் add செய்யப்பட்டது.`,
    checkoutPrompt:
      'Checkout செய்ய வேண்டும். Order create செய்வதற்கு முன் recipient, delivery, sender details கேளுங்கள்.',
    browseCategoryPrompt: (category) =>
      `${category} category-ல் products காட்டுங்கள்.`,
    productDetailPrompt: (name, productId) =>
      `${name} product full details காட்டுங்கள் (product_id: ${productId}).`,
    sentAttachment: (name) => `${name} அனுப்பப்பட்டது`,
    sentAttachments: (count) => `${count} attachments அனுப்பப்பட்டது`,
  },
  composer: {
    messageLabel: 'Agent-க்கு message',
    placeholder: 'Kapruka Agent-ஐ கேளுங்கள்…',
    listeningPlaceholder: 'Listening…',
    attach: 'Image அல்லது document attach',
    attachLimit: 'Maximum attachments reached',
    startVoice: 'Voice input start',
    stopVoice: 'Voice input stop',
    processingVoice: 'Voice input process ஆகிறது…',
    requestingMic: 'Microphone permission கேட்கிறது…',
    voiceUnsupported: 'Voice input browser-ல் support இல்லை',
    voiceUnsupportedBrowser: 'Voice input browser-ல் support இல்லை.',
    allowMic: 'Voice input-க்கு browser prompt-ல் microphone access allow செய்யுங்கள்.',
    listening: 'Listening… முடிந்ததும் stop tap செய்யுங்கள்',
    sending: 'Message அனுப்புகிறது…',
    send: 'Message அனுப்பு',
    attachmentHint: (count, max) =>
      `${count}/${max} files · images அல்லது PDF/Word/txt · 5 MB each`,
  },
  cart: {
    title: 'Basket',
    items: (count) => `${count} Items`,
    empty: 'Basket empty',
    total: 'Total',
    checkout: 'Checkout',
    clear: 'Basket clear',
    close: 'Basket close',
    closePanel: 'Basket panel close',
    sidebarLabel: 'Shopping basket',
    decreaseQty: (name) => `${name} quantity குறை`,
    increaseQty: (name) => `${name} quantity அதிகரி`,
    removeItem: (name) => `${name} basket-லிருந்து remove`,
    qtyFor: (name) => `${name} quantity`,
  },
  savedInfo: {
    eyebrow: 'உங்கள் details',
    title: 'Saved info',
    description:
      'Delivery addresses, gift recipients, preferences Agent remember செய்து checkout வேகமாக்கும். anytime remove செய்யலாம்.',
    loading: 'Saved info load ஆகிறது…',
    unavailable:
      'Saved info இப்போது available இல்லை. Shopping மற்றும் chat normal-ஆ continue செய்யலாம்.',
    disabled:
      'Personal memory site-ல் off. Chat மற்றும் checkout memory இல்லாமல் work.',
    empty:
      'இன்னும் save இல்லை. Checkout-க்கு பிறகு Yes, save it tap — அல்லது Agent-ஐ address/recipient remember செய்ய சொல்லுங்கள்.',
    emptyHighlight: 'Yes, save it',
    peopleTitle: 'Shop செய்யும் people',
    peopleDescription: 'Gift recipients மற்றும் items அனுப்பும் people.',
    addressesTitle: 'Delivery addresses',
    addressesDescription: 'Delivery-க்கு names, phones, cities, addresses.',
    languageTitle: 'மொழி',
    languageDescription: 'Agent reply செய்ய விரும்பும் மொழி.',
    preferencesTitle: 'Shopping preferences',
    preferencesDescription: 'Budget, dietary notes, shopping tastes.',
    otherTitle: 'மற்ற saved details',
    otherDescription: 'Agent remember செய்த மற்ற விஷயங்கள்.',
    remove: 'Remove',
    removeAria: (text) => `Remove: ${text.slice(0, 60)}`,
    close: 'Saved info close',
    clearConfirm:
      'Device-ல் Agent remember செய்த அனைத்தையும் remove? Undo முடியாது.',
    clearYes: 'ஆம், அனைத்தையும் remove',
    clearing: 'Removing…',
    clearCancel: 'Cancel',
    clearAll: 'என்னைப் பற்றி அனைத்தையும் clear',
  },
  welcome: {
    newHere: 'புதியவரா?',
    title: 'Kapruka Agent-க்கு வரவேற்கிறோம்',
    intro:
      'Kapruka-க்கான AI shopping assistant — catalog explore, products compare, delivery arrange, chat-லே checkout. Delivery details மற்றும் gift recipients optional save — Saved info-ல் review/remove.',
    whatAgentDoes: 'Kapruka Agent உங்களுக்கு செய்வது',
    whatYouCan: 'நீங்கள் செய்யலாம்',
    memoryNote:
      'Saved details browser-க்கு link. Saved info-ல் anytime review/remove. Memory unavailable-ஆனாலும் chat/checkout work.',
    getStarted: 'Get Started',
    close: 'Welcome dialog close',
    illustrationAlt:
      'Kapruka Agent mobile: AI chat, gifts, products, basket, checkout, saved info.',
    capabilities: [
      {
        title: 'Explore & search',
        description:
          'Categories browse, Kapruka catalog natural language-ல் search — groceries, fashion, electronics, pharmacy, மேலும்.',
      },
      {
        title: 'Check delivery',
        description:
          'Items city/date-க்கு deliver ஆகுமா, cost மற்றும் perishable notes பார்க்க.',
      },
      {
        title: 'Manage basket',
        description: 'Items add, update, review — basket device-ல் save.',
      },
      {
        title: 'Remembers you',
        description:
          'Addresses, recipients, language, preferences save — return visit-ல் Agent recall.',
      },
      {
        title: 'Checkout securely',
        description: 'Pay ready-ஆனால் real Kapruka checkout link.',
      },
      {
        title: 'Track orders',
        description: 'Order status மற்றும் delivery history ஒரே இடம்.',
      },
    ],
    youCan: [
      'English, Sinhala, Tamil, Singlish, Tanglish-ல் கேளுங்கள்',
      'Voice input அல்லது images chat-ல் attach',
      'Suggestion tap செய்து instantly shopping start',
      'Header-ல் Basket open',
      'Saved info-ல் language மற்றும் saved details பார்/மாற்று',
    ],
  },
  quickStarters: [
    { label: 'Chocolates', iconName: 'sparkles', prompt: "Kapruka Chocolates category-ல் chocolate gifts search." },
    { label: 'Categories Browse', iconName: 'sparkles', prompt: 'Kapruka shopping categories காட்டுங்கள்.' },
    { label: 'Groceries', iconName: 'sparkles', prompt: 'Home delivery grocery essentials search.' },
    { label: 'New Arrivals', iconName: 'sparkles', prompt: 'Kapruka latest new arrivals காட்டுங்கள்.' },
    { label: 'Gift Vouchers', iconName: 'sparkles', prompt: 'Kapruka gift vouchers மற்றும் certificates காட்டுங்கள்.' },
    { label: 'Track Order', iconName: 'truck', prompt: 'Kapruka order status track செய்ய வேண்டும்.' },
    { label: 'Saved Details', iconName: 'sparkles', prompt: 'Remember செய்த delivery addresses, recipients, preferences என்ன?' },
  ],
  rememberDelivery: {
    prompt: 'Delivery address next time-க்கு save செய்யலாமா?',
    yesSave: 'Yes, save it',
    saving: 'Saving…',
    notNow: 'Not now',
    saved: 'Saved — next checkout-ல் address use செய்யலாம்.',
    errorFallback:
      'Save முடியவில்லை. Pay செய்யலாம் — Saved info-ல் later try.',
    ok: 'OK',
  },
  skipLink: 'Chat-க்கு skip',
  errors: {
    network:
      'Agent reach முடியவில்லை. Connection check செய்து try again.',
    timeout: 'Agent usual-ஐ விட slow. Moment wait செய்து try.',
    serviceUnavailable:
      'Shopping assistant temporarily unavailable. சில நிமிடங்களில் try.',
    invalidRequest: 'Request issue. Message மீண்டும் send.',
    rateLimited: 'Messages fast send. Moment wait.',
    generic: 'Something wrong. Try again அல்லது page refresh.',
    chatEmpty: 'Send செய்வதற்கு message type செய்யுங்கள்.',
  },
};
