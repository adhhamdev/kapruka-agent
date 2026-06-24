import type { Messages } from '@/lib/i18n/messages/en';

export const si: Messages = {
  brand: {
    appName: 'Kapruka Agent',
    agentGreeting:
      'හායි, මම Kapruka Agent — mic tap කර live කතා කරන්න, නැත්නම් type කර Kapruka catalog shop කරන්න. Products පෙන්වන්න, delivery check කරන්න, checkout secure කරන්න; ඕන නම් details save කර future visits වේගවත් කරන්න.',
    ogImageAlt:
      'Kapruka Agent — live voice, search, basket, checkout, saved delivery සහිත AI shopping assistant',
    appDescription:
      'Kapruka Agent සමඟ live voice shopping — real-time voice, full catalog search, chat එකේ product cards, delivery check, basket, hands-free checkout. Optional saved addresses සහ preferences.',
  },
  language: {
    modalEyebrow: 'භාෂාව',
    modalTitle: 'ඔබේ භාෂාව තෝරන්න',
    modalDescription:
      'Kapruka Agent සහ app එක ඔබ සමඟ කතා කරන භාෂාව තෝරන්න. Saved info වලින් anytime වෙනස් කරන්න පුළුවන්.',
    continue: 'Continue',
    preferenceLabel: 'App භාෂාව',
    preferenceDescription:
      'App interface එක සහ Agent default replies වෙනස් කරයි.',
    savedSectionTitle: 'භාෂාව',
    savedSectionDescription: 'Agent reply කරන භාෂාව.',
  },
  header: {
    shopAtKapruka: 'Kapruka.com වෙත යන්න',
    newChat: 'නව chat',
    basket: 'Basket',
    savedInfo: 'Saved info',
    hideBasket: 'Basket සඟවන්න',
    showBasket: 'Basket පෙන්වන්න',
    hideBasketWithCount: (count) => `Basket සඟවන්න, items ${count}`,
    showBasketWithCount: (count) => `Basket පෙන්වන්න, items ${count}`,
  },
  chat: {
    welcome: 'සාදරයෙන් පිළිගනිමු',
    liveVoiceTitle: 'Mic tap කර කතා කරන්න',
    liveVoiceHint:
      'Type කරන්න ඕන නැහැ. Sinhala, Tamil, English, Singlish — ඔබේ භාෂාවෙන් කතා කරන්න. Agent listen කර voice reply දෙයි.',
    suggestions: 'Suggestions',
    widgetFallback: 'ඔබට සුදුසු දේ මෙන්න.',
    addedToBasket: (name) => `**${name}** basket එකට add කළා.`,
    checkoutPrompt:
      'මට checkout කරන්න ඕන. Order create කිරීමට පෙර recipient, delivery, sender details අහන්න.',
    browseCategoryPrompt: (category) =>
      `${category} category එකේ products පෙන්වන්න.`,
    productDetailPrompt: (name, productId) =>
      `${name} product එකේ full details පෙන්වන්න (product_id: ${productId}).`,
    sentAttachment: (name) => `${name} යැව්වා`,
    sentAttachments: (count) => `attachments ${count} යැව්වා`,
  },
  composer: {
    messageLabel: 'Agent ට message',
    placeholder: 'Kapruka Agent ට අහන්න…',
    listeningPlaceholder: 'Listening…',
    attach: 'Image හෝ document attach කරන්න',
    attachLimit: 'Maximum attachments reached',
    startVoice: 'Voice input start කරන්න',
    stopVoice: 'Voice input stop කරන්න',
    processingVoice: 'Voice input process වෙමින්…',
    requestingMic: 'Microphone permission අහමින්…',
    voiceUnsupported: 'Voice input browser එකේ support නැහැ',
    voiceUnsupportedBrowser: 'Voice input browser එකේ support නැහැ.',
    allowMic:
      'Voice input සඳහා browser prompt එකේ microphone access allow කරන්න.',
    listening: 'Listening… අවසන් වුණාම stop tap කරන්න',
    sending: 'Message යවමින්…',
    send: 'Message යවන්න',
    attachmentHint: (count, max) =>
      `${count}/${max} files · images හෝ PDF/Word/txt · 5 MB each`,
    talkButtonLabel: 'Talk',
    talkButtonLabelActive: 'Stop',
    startLiveVoice: 'Live voice conversation start කරන්න',
    stopLiveVoice: 'Live voice conversation stop කරන්න',
    liveConnecting: 'Live voice connect වෙමින්…',
    liveConnected: 'Live voice active — natural විදිහට කතා කරන්න',
    liveReconnecting: 'Live voice reconnect වෙමින්…',
    livePlaceholder: 'Type කරන්න හෝ speak කරන්න…',
  },
  cart: {
    title: 'Basket',
    items: (count) => `Items ${count}`,
    empty: 'Basket එක empty',
    total: 'Total',
    checkout: 'Checkout',
    clear: 'Basket clear කරන්න',
    close: 'Basket close කරන්න',
    closePanel: 'Basket panel close කරන්න',
    sidebarLabel: 'Shopping basket',
    decreaseQty: (name) => `${name} quantity අඩු කරන්න`,
    increaseQty: (name) => `${name} quantity වැඩි කරන්න`,
    removeItem: (name) => `${name} basket එකෙන් remove කරන්න`,
    qtyFor: (name) => `${name} quantity`,
  },
  savedInfo: {
    eyebrow: 'ඔබේ details',
    title: 'Saved info',
    description:
      'Delivery addresses, gift recipients, preferences Agent remember කර checkout වේගවත් කරයි. ඕනෑ දෙයක් anytime remove කරන්න පුළුවන්.',
    loading: 'Saved info load වෙමින්…',
    unavailable:
      'Saved info දැන් available නැහැ. Shopping සහ chat normal ලෙස continue කරන්න පුළුවන්.',
    disabled:
      'Personal memory site එකේ off. Chat සහ checkout memory නැතුව normal.',
    empty:
      'තව save කරලා නැහැ. Checkout එකෙන් පස්සේ Yes, save it tap කරන්න — හෝ Agent ට address/recipient remember කරන්න කියන්න.',
    emptyHighlight: 'Yes, save it',
    peopleTitle: 'ඔබ shop කරන people',
    peopleDescription: 'Gift recipients සහ items යවන people.',
    addressesTitle: 'Delivery addresses',
    addressesDescription: 'Delivery සඳහා names, phones, cities, addresses.',
    languageTitle: 'භාෂාව',
    languageDescription: 'Agent reply කරන භාෂාව.',
    preferencesTitle: 'Shopping preferences',
    preferencesDescription: 'Budget, dietary notes, shopping tastes.',
    otherTitle: 'වෙනත් saved details',
    otherDescription: 'Agent remember කළ වෙනත් දේ.',
    remove: 'Remove',
    removeAria: (text) => `Remove: ${text.slice(0, 60)}`,
    close: 'Saved info close කරන්න',
    clearConfirm:
      'Device එකේ Agent remember කරන සියල්ල remove කරන්නද? Undo කරන්න බැහැ.',
    clearYes: 'ඔව්, සියල්ල remove කරන්න',
    clearing: 'Removing…',
    clearCancel: 'Cancel',
    clearAll: 'මගේ සියල්ල clear කරන්න',
  },
  welcome: {
    newHere: 'අලුත්ද?',
    title: 'Kapruka Agent වෙත සාදරයෙන් පිළිගනිමු',
    intro:
      'Kapruka සඳහා AI shopping assistant — Agent live කතා කරන්න හෝ chat type කරන්න. Full catalog explore, products compare, delivery arrange, checkout chat එකෙන්ම. Delivery details සහ gift recipients optional save — Saved info වලින් review/remove.',
    whatAgentDoes: 'Kapruka Agent ඔබට කරන දේ',
    whatYouCan: 'ඔබට කරන්න පුළුවන් දේ',
    memoryNote:
      'Saved details browser එකට link. Saved info වලින් anytime review/remove. Memory unavailable වුණත් chat/checkout work කරයි.',
    getStarted: 'Get Started',
    close: 'Welcome dialog close කරන්න',
    illustrationAlt:
      'Kapruka Agent mobile: live voice AI chat, gifts, products, basket, checkout, saved info.',
    capabilities: [
      {
        title: 'Agent live කතා කරන්න',
        iconName: 'mic',
        description:
          'Mic tap කර කතා කරන්න — Agent voice reply දෙයි. Type කරන්න ඕන නැහැ. කතා කරන අතරේ chat එකේ products පෙන්වයි.',
      },
      {
        title: 'Explore & search',
        iconName: 'search',
        description:
          'Categories browse කර Kapruka catalog natural language එකෙන් search කරන්න — groceries, fashion, electronics, pharmacy, තව.',
      },
      {
        title: 'Check delivery',
        iconName: 'truck',
        description:
          'Items city/date එකට deliver වෙනවද, cost සහ perishable notes බලන්න.',
      },
      {
        title: 'Manage basket',
        iconName: 'shopping-bag',
        description: 'Items add, update, review — basket device එකේ save.',
      },
      {
        title: 'Remembers you',
        iconName: 'heart',
        description:
          'Addresses, recipients, language, preferences save — return visit වලදී Agent recall කරයි.',
      },
      {
        title: 'Checkout securely',
        iconName: 'shield-check',
        description: 'Pay කර ready වුණාම real Kapruka checkout link.',
      },
      {
        title: 'Track orders',
        iconName: 'package',
        description: 'Order status සහ delivery history එක තැන.',
      },
    ],
    youCan: [
      'Mic tap කර live voice conversation — Agent real time voice reply දෙයි',
      'English, Sinhala, Tamil, Singlish, Tanglish එකෙන් අහන්න',
      'Live voice session එකේදීත් type කර images attach කරන්න පුළුවන්',
      'Suggestion tap කර shopping instantly start කරන්න',
      'Header එකෙන් Basket open කරන්න',
      'Saved info වලින් language සහ saved details බලන්න/වෙනස් කරන්න',
    ],
  },
  quickStarters: [
    {
      label: 'Talk live',
      iconName: 'mic',
      prompt:
        'Hi Agent — gift ideas live කතා කරමු. Rs. 5000 යට popular options පෙන්වන්න.',
    },
    {
      label: 'Chocolates',
      iconName: 'sparkles',
      prompt: 'Kapruka Chocolates category එකේ chocolate gifts search කරන්න.',
    },
    {
      label: 'Categories Browse',
      iconName: 'sparkles',
      prompt: 'Kapruka shopping categories පෙන්වන්න.',
    },
    {
      label: 'Groceries',
      iconName: 'sparkles',
      prompt: 'Home delivery grocery essentials search කරන්න.',
    },
    {
      label: 'New Arrivals',
      iconName: 'sparkles',
      prompt: 'Kapruka latest new arrivals පෙන්වන්න.',
    },
    {
      label: 'Gift Vouchers',
      iconName: 'sparkles',
      prompt: 'Kapruka gift vouchers සහ certificates පෙන්වන්න.',
    },
    {
      label: 'Track Order',
      iconName: 'truck',
      prompt: 'Kapruka order status track කරන්න ඕන.',
    },
    {
      label: 'Saved Details',
      iconName: 'sparkles',
      prompt:
        'Remember කරලා තියෙන delivery addresses, recipients, preferences මොනවද?',
    },
  ],
  rememberDelivery: {
    prompt: 'Delivery address එක next time සඳහා save කරන්නද?',
    yesSave: 'Yes, save it',
    saving: 'Saving…',
    notNow: 'Not now',
    saved: 'Saved — next checkout එකේ address එක use කරන්න පුළුවන්.',
    errorFallback:
      'Save කරන්න බැරි වුණා. Pay කරන්න පුළුවන් — Saved info වලින් later try කරන්න.',
    ok: 'OK',
  },
  skipLink: 'Chat වෙත skip කරන්න',
  errors: {
    network: 'Agent reach කරන්න බැරි වුණා. Connection check කර නැවත try කරන්න.',
    timeout: 'Agent usualට වඩා slow. Moment එකක් wait කර try කරන්න.',
    serviceUnavailable:
      'Shopping assistant temporarily unavailable. Minutes කිහිපයකින් try කරන්න.',
    invalidRequest: 'Request එක issue එකක්. Message එක නැවත send කරන්න.',
    rateLimited: 'Messages fast send කරනවා. Moment එකක් wait කරන්න.',
    generic: 'Something wrong. Try again හෝ page refresh කරන්න.',
    chatEmpty: 'Send කිරීමට message type කරන්න.',
  },
};
