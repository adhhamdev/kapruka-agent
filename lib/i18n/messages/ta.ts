import type { Messages } from '@/lib/i18n/messages/en';

export const ta: Messages = {
  brand: {
    appName: 'Kapruka Agent',
    agentGreeting:
      'வணக்கம், நான் Kapruka Agent — mic tap செய்து live-ஆ பேசுங்கள், அல்லது type செய்து Kapruka catalog shop செய்யுங்கள். Products காட்டுவேன், delivery check, secure checkout; விரும்பினால் details save செய்து அடுத்த முறை வேகமாக உதவுகிறேன்.',
    ogImageAlt:
      'Kapruka Agent — live voice, search, basket, checkout, saved delivery உடன் AI shopping assistant',
    appDescription:
      'Kapruka Agent-உடன் live voice shopping — real-time voice, full catalog search, chat-ல் product cards, delivery check, basket, hands-free checkout. Optional saved addresses மற்றும் preferences.',
  },
  language: {
    modalEyebrow: 'மொழி',
    modalTitle: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    modalDescription:
      'Kapruka Agent மற்றும் app உங்களுடன் பேசும் மொழியைத் தேர்ந்தெடுக்கவும். Saved info-ல் anytime மாற்றலாம்.',
    continue: 'Continue',
    preferenceLabel: 'App மொழி',
    preferenceDescription:
      'App interface மற்றும் Agent default replies மாற்றும்.',
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
    liveVoiceTitle: 'Mic tap செய்து பேசுங்கள்',
    liveVoiceHint:
      'Type செய்ய தேவையில்லை. Tamil, Sinhala, English, Tanglish — உங்கள் மொழியில் பேசுங்கள். Agent listen செய்து voice reply தரும்.',
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
    allowMic:
      'Voice input-க்கு browser prompt-ல் microphone access allow செய்யுங்கள்.',
    listening: 'Listening… முடிந்ததும் stop tap செய்யுங்கள்',
    sending: 'Message அனுப்புகிறது…',
    send: 'Message அனுப்பு',
    attachmentHint: (count, max) =>
      `${count}/${max} files · images அல்லது PDF/Word/txt · 5 MB each`,
    talkButtonLabel: 'Talk',
    talkButtonLabelActive: 'Stop',
    startLiveVoice: 'Live voice conversation start',
    stopLiveVoice: 'Live voice conversation stop',
    liveConnecting: 'Live voice connect ஆகிறது…',
    liveConnected: 'Live voice active — natural-ஆ பேசுங்கள்',
    liveReconnecting: 'Live voice reconnect ஆகிறது…',
    livePlaceholder: 'Type செய்யுங்கள் அல்லது speak…',
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
      'Kapruka-க்கான AI shopping assistant — Agent-உடன் live பேசுங்கள் அல்லது chat-ல் type செய்யுங்கள். Full catalog explore, products compare, delivery arrange, chat-லே checkout. Delivery details மற்றும் gift recipients optional save — Saved info-ல் review/remove.',
    whatAgentDoes: 'Kapruka Agent உங்களுக்கு செய்வது',
    whatYouCan: 'நீங்கள் செய்யலாம்',
    memoryNote:
      'Saved details browser-க்கு link. Saved info-ல் anytime review/remove. Memory unavailable-ஆனாலும் chat/checkout work.',
    getStarted: 'Get Started',
    close: 'Welcome dialog close',
    illustrationAlt:
      'Kapruka Agent mobile: live voice AI chat, gifts, products, basket, checkout, saved info.',
    capabilities: [
      {
        title: 'Agent-உடன் live பேசுங்கள்',
        iconName: 'mic',
        description:
          'Mic tap செய்து பேசுங்கள் — Agent voice reply தரும். Type தேவையில்லை. பேசும் போது chat-ல் products காட்டும்.',
      },
      {
        title: 'Explore & search',
        iconName: 'search',
        description:
          'Categories browse, Kapruka catalog natural language-ல் search — groceries, fashion, electronics, pharmacy, மேலும்.',
      },
      {
        title: 'Check delivery',
        iconName: 'truck',
        description:
          'Items city/date-க்கு deliver ஆகுமா, cost மற்றும் perishable notes பார்க்க.',
      },
      {
        title: 'Manage basket',
        iconName: 'shopping-bag',
        description: 'Items add, update, review — basket device-ல் save.',
      },
      {
        title: 'Remembers you',
        iconName: 'heart',
        description:
          'Addresses, recipients, language, preferences save — return visit-ல் Agent recall.',
      },
      {
        title: 'Checkout securely',
        iconName: 'shield-check',
        description: 'Pay ready-ஆனால் real Kapruka checkout link.',
      },
      {
        title: 'Track orders',
        iconName: 'package',
        description: 'Order status மற்றும் delivery history ஒரே இடம்.',
      },
    ],
    youCan: [
      'Mic tap செய்து live voice conversation — Agent real time voice reply',
      'English, Sinhala, Tamil, Singlish, Tanglish-ல் கேளுங்கள்',
      'Live voice session-லும் type செய்து images attach செய்யலாம்',
      'Suggestion tap செய்து instantly shopping start',
      'Header-ல் Basket open',
      'Saved info-ல் language மற்றும் saved details பார்/மாற்று',
    ],
  },
  quickStarters: [
    {
      label: 'Talk live',
      iconName: 'mic',
      prompt:
        'Hi Agent — gift ideas live-ஆ பேசலாம். Rs. 5000 க்குள் popular options காட்டுங்கள்.',
    },
    {
      label: 'Chocolates',
      iconName: 'sparkles',
      prompt: 'Kapruka Chocolates category-ல் chocolate gifts search.',
    },
    {
      label: 'Categories Browse',
      iconName: 'sparkles',
      prompt: 'Kapruka shopping categories காட்டுங்கள்.',
    },
    {
      label: 'Groceries',
      iconName: 'sparkles',
      prompt: 'Home delivery grocery essentials search.',
    },
    {
      label: 'New Arrivals',
      iconName: 'sparkles',
      prompt: 'Kapruka latest new arrivals காட்டுங்கள்.',
    },
    {
      label: 'Gift Vouchers',
      iconName: 'sparkles',
      prompt: 'Kapruka gift vouchers மற்றும் certificates காட்டுங்கள்.',
    },
    {
      label: 'Track Order',
      iconName: 'truck',
      prompt: 'Kapruka order status track செய்ய வேண்டும்.',
    },
    {
      label: 'Saved Details',
      iconName: 'sparkles',
      prompt:
        'Remember செய்த delivery addresses, recipients, preferences என்ன?',
    },
  ],
  rememberDelivery: {
    prompt: 'Delivery address next time-க்கு save செய்யலாமா?',
    yesSave: 'Yes, save it',
    saving: 'Saving…',
    notNow: 'Not now',
    saved: 'Saved — next checkout-ல் address use செய்யலாம்.',
    errorFallback: 'Save முடியவில்லை. Pay செய்யலாம் — Saved info-ல் later try.',
    ok: 'OK',
  },
  skipLink: 'Chat-க்கு skip',
  errors: {
    network: 'Agent reach முடியவில்லை. Connection check செய்து try again.',
    timeout: 'Agent usual-ஐ விட slow. Moment wait செய்து try.',
    serviceUnavailable:
      'Shopping assistant temporarily unavailable. சில நிமிடங்களில் try.',
    invalidRequest: 'Request issue. Message மீண்டும் send.',
    rateLimited: 'Messages fast send. Moment wait.',
    generic: 'Something wrong. Try again அல்லது page refresh.',
    chatEmpty: 'Send செய்வதற்கு message type செய்யுங்கள்.',
  },
};
