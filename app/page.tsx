'use client';

import {
  ArrowRight,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { type CartItem, useCartStorage } from '@/lib/cart-storage';
import { ERROR_MESSAGES, parseApiError } from '@/lib/errors';
import { createMessageId } from '@/lib/message-ids';
import {
  getKaprukaProductUrl,
  type KaprukaProduct,
} from '@/lib/products';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  widgets?: any[];
  timestamp: Date;
  isError?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello. I am Ayla, your AI shopping concierge for Kapruka.\n\nI can search our live retail catalog, check flat-rate delivery quotes to any city, manage your cart, and generate a guest payment link.\n\nWhat are you looking for today?',
      timestamp: new Date(0),
    },
  ]);
  const { cart, setCart } = useCartStorage();
  const [inputText, setInputText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'discover' | 'cart'>(
    'chat',
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending]);

  // Handle message sending
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isPending) return;

    const userMsgId = createMessageId('user');
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date(0),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsPending(true);
    setActiveTab('chat');

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      chatHistory.push({ role: 'user', content: textToSend });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          cart: cart,
        }),
      });

      if (!response.ok) {
        const friendly = await parseApiError(response);
        throw new Error(friendly);
      }

      const data = await response.json();

      if (!data?.text) {
        throw new Error(ERROR_MESSAGES.GENERIC);
      }

      if (data.cart) {
        setCart(data.cart);
      }

      const assistantMsgId = createMessageId('assistant');
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: data.text,
          widgets: data.widgets,
          timestamp: new Date(0),
        },
      ]);
    } catch (error: unknown) {
      const friendly =
        error instanceof Error && error.message
          ? error.message
          : ERROR_MESSAGES.GENERIC;
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId('error'),
          role: 'assistant',
          content: friendly,
          isError: true,
          timestamp: new Date(0),
        },
      ]);
    } finally {
      setIsPending(false);
    }
  };

  const handleLocalAddToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product_id === product.productId,
      );
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [
          ...prev,
          {
            product_id: product.productId,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl:
              product.imageUrl ||
              `https://picsum.photos/seed/${product.productId}/300/300`,
            productUrl: getKaprukaProductUrl(product),
          },
        ];
      }
    });

    const infoMessage: Message = {
      id: createMessageId('local-add'),
      role: 'assistant',
      content: `🛒 Added **${product.name}** to your cart.`,
      timestamp: new Date(0),
    };
    setMessages((prev) => [...prev, infoMessage]);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            return { ...item, quantity: Math.max(1, item.quantity + delta) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const parseMarkdownText = (
    text: string,
    role: Message['role'] = 'assistant',
  ) => {
    if (!text) return '';
    const isUser = role === 'user';
    const textClass = isUser
      ? 'text-white'
      : 'text-[color:var(--color-ink-2)]';
    const strongClass = isUser
      ? 'font-semibold text-white'
      : 'font-semibold text-[color:var(--color-ink)]';
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;
      const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
      const isBullet = !!bulletMatch;
      const rawText = isBullet ? bulletMatch![1] : line;

      const parts = rawText.split(/\*\*([^*]+)\*\*/g);
      if (parts.length > 1) {
        content = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return (
              <strong key={pIdx} className={strongClass}>
                {part}
              </strong>
            );
          }
          return part;
        });
      }

      if (isBullet) {
        return (
          <li
            key={idx}
            className={`ml-4 list-disc text-[15px] ${textClass} leading-relaxed mb-1.5`}
            id={`bullet-${idx}`}>
            {content}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className='h-2' id={`space-${idx}`} />;
      }

      return (
        <p
          key={idx}
          className={`text-[15px] ${textClass} leading-relaxed mb-1.5`}
          id={`p-${idx}`}>
          {content}
        </p>
      );
    });
  };

  const quickStarters = [
    {
      label: 'Fresh Flowers',
      icon: <Sparkles className='w-4 h-4' />,
      prompt: 'Show me fresh flower bouquets available for delivery',
    },
    {
      label: 'Birthday Cakes',
      icon: <Sparkles className='w-4 h-4' />,
      prompt:
        'Find a delicious birthday cake. I want to see what options you have.',
    },
    {
      label: 'Track Order',
      icon: <Truck className='w-4 h-4' />,
      prompt:
        'How do I track my order? I want to track an existing order status.',
    },
  ];

  return (
    <div
      className='flex flex-col h-[100dvh] bg-[color:var(--color-bg-base)] sans antialiased overflow-hidden'
      id='app-root'>
      {/* Kapruka Header */}
      <header
        className='h-[60px] shrink-0 px-4 md:px-6 flex items-center justify-between z-30 bg-[color:var(--color-primary)] shadow-[var(--shadow-sm)]'
        id='nav-header'>
        <div className='flex items-center gap-3 min-w-0'>
          <Image
            src='/logo-square.jpeg'
            alt='Kapruka'
            width={100}
            height={100}
            className='object-contain shrink-0'
            priority
          />
            <span className='font-semibold text-[15px] tracking-tight text-white leading-tight truncate'>
             Agent
            </span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className='flex-1 flex flex-row overflow-hidden relative'>
        {/* Column 1: Discover / Search */}
        <section
          className={`
            ${activeTab === 'discover' ? 'flex animate-fade-in' : 'hidden'} 
            lg:flex w-full lg:w-80 flex-col justify-between shrink-0 h-full overflow-y-auto 
            bg-[color:var(--color-bg-surface)] lg:border-r border-[color:var(--color-border-subtle)]
            px-5 py-6 pb-28 lg:pb-6
          `}
          id='left-sidebar'>
          <div className='space-y-8'>
            <div>
              <h2 className='text-[22px] font-semibold tracking-tight text-[color:var(--color-ink)] leading-tight mb-2'>
                Discover
              </h2>
              <p className='text-[14px] text-[color:var(--color-ink-2)] mb-6'>
                Explore Kapruka&apos;s catalog — gifts, cakes, flowers and more
                across Sri Lanka.
              </p>

              <div className='relative mb-6'>
                <Search className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-3)]' />
                <input
                  type='text'
                  placeholder='Search products...'
                  className='w-full bg-[color:var(--color-paper)] border border-[color:var(--color-rule-strong)] rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-[15px] focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/10 transition-all'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(`Search for ${e.currentTarget.value}`);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className='space-y-3'>
              <h4 className='text-[12px] font-semibold text-[color:var(--color-ink-3)] uppercase tracking-wider'>
                Quick Prompts
              </h4>
              <div className='flex flex-col gap-2'>
                {quickStarters.map((qs, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(qs.prompt)}
                    className='p-3.5 text-left bg-[color:var(--color-paper-2)] border border-[color:var(--color-rule-strong)] rounded-[var(--radius-md)] text-[14px] hover:border-[color:var(--color-primary)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98] transition-all flex items-center justify-between group cursor-pointer'>
                    <div className='flex items-center gap-3'>
                      <div className='text-[color:var(--color-primary)] group-hover:text-[color:var(--color-accent-ink)] transition-colors'>
                        {qs.icon}
                      </div>
                      <span className='font-medium text-[color:var(--color-ink)]'>
                        {qs.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Column 2: Chat Console */}
        <main
          className={`
            ${activeTab === 'chat' ? 'flex flex-col animate-fade-in' : 'hidden'} 
            lg:flex flex-1 flex-col h-full relative bg-[color:var(--color-bg-surface)]
          pb-30`}
          id='chat-surface'>
          {/* Messages */}
          <div
            className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-[90px] scrollbar-hide'
            id='messages-container'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                id={`msg-wrap-${msg.id}`}>
                <div
                  className={`flex items-end gap-2 max-w-[90%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'assistant' && (
                    <div className='w-10 h-10 rounded-full shrink-0 border border-[color:var(--color-border-default)] mb-1 relative bg-white'>
                      <Image
                        src='/icon.png'
                        alt='Kapruka'
                        fill
                        className='object-cover p-1 rounded-full'
                      />
                    </div>
                  )}

                  <div className='space-y-1'>
                    <div
                      className={`px-4 text-white py-3 text-[15px] leading-relaxed ${
                        msg.isError
                          ? 'chat-bubble-error'
                          : msg.role === 'user'
                            ? 'chat-bubble-user'
                            : 'chat-bubble-assistant'
                      }`}>
                      {parseMarkdownText(msg.content, msg.role)}
                    </div>
                  </div>
                </div>

                {/* Render Widgets */}
                {msg.widgets && msg.widgets.length > 0 && (
                  <div className='w-full mt-3 pl-9 pr-1 space-y-4 animate-fade-in'>
                    {msg.widgets.map((widget, widIdx) => {
                      if (
                        widget.type === 'carousel' &&
                        Array.isArray(widget.data)
                      ) {
                        return (
                          <div key={widIdx} className='w-full'>
                            <div className='flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0'>
                              {widget.data.map((prod: KaprukaProduct, prodIdx: number) => {
                                const productUrl = getKaprukaProductUrl(prod);
                                return (
                                <article
                                  key={prodIdx}
                                  className='group w-[168px] shrink-0 bg-white border border-[color:var(--color-border-default)] rounded-[18px] p-2 snap-start shadow-sm flex flex-col'>
                                  <div className='relative w-full aspect-square rounded-[12px] overflow-hidden bg-[color:var(--color-bg-base)] mb-2.5'>
                                    <a
                                      href={productUrl}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='block w-full h-full'
                                      aria-label={`View ${prod.name} on Kapruka`}>
                                      <Image
                                        src={
                                          prod.imageUrl ||
                                          `https://picsum.photos/seed/${prod.productId}/300/300`
                                        }
                                        alt={prod.name ?? 'Product'}
                                        fill
                                        sizes='168px'
                                        className='object-cover transition-transform duration-[var(--dur-medium)] ease-[var(--ease-out)] group-hover:scale-[1.03]'
                                      />
                                    </a>
                                    {prod.inStock ? (
                                      <button
                                        type='button'
                                        onClick={() =>
                                          handleLocalAddToCart(prod)
                                        }
                                        aria-label={`Add ${prod.name} to basket`}
                                        className='absolute bottom-2 right-2 z-10 w-8 h-8 bg-[color:var(--color-accent)] text-[color:var(--color-accent-ink)] rounded-full flex items-center justify-center hover:bg-[color:var(--color-accent-hover)] transition-all shadow-sm active:scale-95'>
                                        <Plus className='w-4 h-4' />
                                      </button>
                                    ) : (
                                      <span className='absolute top-2 left-2 text-[10px] font-medium px-2 py-1 bg-white/95 text-red-600 rounded-md shadow-sm'>
                                        Sold Out
                                      </span>
                                    )}
                                  </div>
                                  <div className='px-1 flex flex-col gap-1.5 flex-1'>
                                    <a
                                      href={productUrl}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='font-medium text-[13px] text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)] hover:underline line-clamp-2 leading-tight inline-flex gap-1 items-start'>
                                      <span className='flex-1 min-w-0'>
                                        {prod.name}
                                      </span>
                                      <ExternalLink className='w-3 h-3 shrink-0 mt-0.5 opacity-50' />
                                    </a>
                                    <p className='font-semibold text-[13px] text-[color:var(--color-text-primary)]'>
                                      {formatPrice(prod.price ?? 0)}
                                    </p>
                                    <a
                                      href={productUrl}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='mt-auto text-[11px] font-medium text-[color:var(--color-primary)] hover:underline inline-flex items-center gap-1'>
                                      View on Kapruka
                                      <ExternalLink className='w-3 h-3' />
                                    </a>
                                  </div>
                                </article>
                              );
                              })}
                            </div>
                          </div>
                        );
                      }

                      if (widget.type === 'detail' && widget.data) {
                        const prod = widget.data as KaprukaProduct;
                        const productUrl = getKaprukaProductUrl(prod);
                        return (
                          <article
                            key={widIdx}
                            className='bg-white border border-[color:var(--color-border-default)] rounded-[var(--radius-xl)] p-4 max-w-sm shadow-sm'>
                            <div className='flex gap-3'>
                              <a
                                href={productUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='relative w-24 h-24 rounded-[var(--radius-md)] overflow-hidden bg-[color:var(--color-bg-base)] shrink-0'>
                                <Image
                                  src={
                                    prod.imageUrl ||
                                    `https://picsum.photos/seed/${prod.productId}/300/300`
                                  }
                                  alt={prod.name ?? 'Product'}
                                  fill
                                  sizes='96px'
                                  className='object-cover'
                                />
                              </a>
                              <div className='flex-1 min-w-0'>
                                <a
                                  href={productUrl}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='font-semibold text-[15px] text-[color:var(--color-primary)] hover:underline line-clamp-2 leading-snug inline-flex gap-1 items-start'>
                                  <span>{prod.name}</span>
                                  <ExternalLink className='w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50' />
                                </a>
                                <p className='font-semibold text-[15px] text-[color:var(--color-text-primary)] mt-1'>
                                  {formatPrice(prod.price ?? 0)}
                                </p>
                                {prod.description && (
                                  <p className='text-[13px] text-[color:var(--color-text-secondary)] mt-2 line-clamp-3'>
                                    {prod.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className='mt-4 flex gap-2'>
                              {prod.inStock !== false && (
                                <button
                                  type='button'
                                  onClick={() => handleLocalAddToCart(prod)}
                                  className='flex-1 py-2.5 bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-hover)] text-white rounded-[var(--radius-md)] text-[14px] font-medium transition-all active:scale-[0.98]'>
                                  Add to Basket
                                </button>
                              )}
                              <a
                                href={productUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex-1 py-2.5 border border-[color:var(--color-rule-strong)] text-[color:var(--color-primary)] rounded-[var(--radius-md)] text-[14px] font-medium text-center hover:bg-[color:var(--color-paper-3)] transition-all inline-flex items-center justify-center gap-1.5'>
                                View Product
                                <ExternalLink className='w-3.5 h-3.5' />
                              </a>
                            </div>
                          </article>
                        );
                      }

                      if (widget.type === 'delivery_quote' && widget.data) {
                        const quote = widget.data;
                        return (
                          <div
                            key={widIdx}
                            className='bg-[color:var(--color-bg-base)] border border-[color:var(--color-border-default)] rounded-[16px] p-4 max-w-xs flex gap-3 shadow-sm'>
                            <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-[color:var(--color-border-subtle)] shadow-sm'>
                              <Truck className='w-5 h-5 text-[color:var(--color-text-primary)]' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h4 className='text-[14px] font-semibold text-[color:var(--color-text-primary)] mt-0.5 truncate'>
                                {quote.city}
                              </h4>
                              <div className='mt-1 space-y-0.5 text-[13px] text-[color:var(--color-text-secondary)]'>
                                <div>
                                  <span className='text-[color:var(--color-text-tertiary)]'>
                                    Date:
                                  </span>{' '}
                                  {quote.deliveryDate}
                                </div>
                                <div>
                                  <span className='text-[color:var(--color-text-tertiary)]'>
                                    Cost:
                                  </span>{' '}
                                  <span className='font-medium text-[color:var(--color-text-primary)]'>
                                    {quote.cost
                                      ? formatPrice(quote.cost)
                                      : 'LKR 450'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (widget.type === 'checkout_form' && widget.data) {
                        const check = widget.data;
                        return (
                          <div
                            key={widIdx}
                            className='bg-[color:var(--color-primary)] text-white rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-elevated)] max-w-xs relative overflow-hidden'>
                            <h4 className='font-semibold text-[15px] flex items-center gap-2 mb-4'>
                              <CreditCard className='w-4 h-4 opacity-80' />{' '}
                              Order Summary
                            </h4>
                            <div className='space-y-2 text-[14px] opacity-90 mb-5'>
                              <div className='flex justify-between'>
                                <span>Ref</span>
                                <span className='font-mono'>
                                  {check.orderNumber}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span>Items</span>
                                <span className='font-medium'>
                                  {check.itemsCount ||
                                    cart.reduce((s, i) => s + i.quantity, 0)}
                                </span>
                              </div>
                              <div className='flex justify-between font-semibold text-[16px] mt-2 pt-2 border-t border-white/20'>
                                <span>Total</span>
                                <span>{formatPrice(check.totalAmount)}</span>
                              </div>
                            </div>
                            <a
                              href={check.checkoutUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='w-full py-3 bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-hover)] text-[color:var(--color-accent-ink)] rounded-[var(--radius-md)] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]'>
                              Secure Checkout
                            </a>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}
              </div>
            ))}

            {isPending && (
              <div className='flex items-center gap-2 pl-9 animate-fade-in opacity-60'>
                <div className='w-1.5 h-1.5 bg-[color:var(--color-text-tertiary)] rounded-full animate-typing-1'></div>
                <div className='w-1.5 h-1.5 bg-[color:var(--color-text-tertiary)] rounded-full animate-typing-2'></div>
                <div className='w-1.5 h-1.5 bg-[color:var(--color-text-tertiary)] rounded-full animate-typing-3'></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className='absolute bottom-15 left-0 right-0 p-3 pb-[calc(env(safe-area-inset-bottom)+10px)] lg:pb-4 ios-glass border-t flex flex-col gap-2 z-20'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className='flex items-center gap-2'>
              <div className='flex-1 relative flex items-center bg-[color:var(--color-paper)] border border-[color:var(--color-rule-strong)] rounded-[var(--radius-lg)] focus-within:ring-2 focus-within:ring-[color:var(--color-primary)]/10 transition-all pl-4 pr-12 py-1.5'>
                <input
                  type='text'
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isPending}
                  placeholder='Message Ayla...'
                  className='w-full bg-transparent text-[16px] focus:outline-none h-[38px] placeholder-[color:var(--color-text-tertiary)]'
                />
              </div>
              <button
                type='submit'
                disabled={!inputText.trim() || isPending}
                className='w-[42px] h-[42px] shrink-0 bg-[color:var(--color-primary)] disabled:bg-[color:var(--color-paper-3)] disabled:text-[color:var(--color-ink-3)] text-white rounded-full active:scale-[0.96] transition-all flex items-center justify-center shadow-[var(--shadow-sm)] hover:bg-[color:var(--color-primary-hover)]'>
                <ArrowRight className='w-5 h-5' />
              </button>
            </form>
          </div>
        </main>

        {/* Column 3: Cart Panel */}
        <aside
          className={`
            ${activeTab === 'cart' ? 'flex animate-fade-in' : 'hidden'} 
            lg:flex w-full lg:w-96 flex-col justify-between shrink-0 h-full overflow-y-auto 
            bg-[color:var(--color-bg-surface)] lg:border-l border-[color:var(--color-border-subtle)]
            pb-28 lg:pb-0
          `}>
          <div className='flex flex-col h-full'>
            <div className='flex items-center justify-between p-5 border-b border-[color:var(--color-border-subtle)]'>
              <h2 className='text-[20px] font-semibold text-[color:var(--color-text-primary)]'>
                Basket
              </h2>
              <span className='text-[12px] bg-[color:var(--color-bg-base)] text-[color:var(--color-text-secondary)] border border-[color:var(--color-border-default)] px-3 py-1 rounded-full font-medium'>
                {cart.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
            </div>

            <div className='flex-1 overflow-y-auto p-5 space-y-4'>
              {cart.length === 0 ? (
                <div className='h-full flex flex-col items-center justify-center text-[color:var(--color-text-tertiary)]'>
                  <ShoppingBag className='w-12 h-12 mb-4 opacity-50 stroke-1' />
                  <p className='font-medium text-[15px]'>
                    Your basket is empty
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const itemUrl = getKaprukaProductUrl({
                    productId: item.product_id,
                    name: item.name,
                    productUrl: item.productUrl,
                  });
                  return (
                  <div
                    key={item.product_id}
                    className='flex gap-3 bg-white border border-[color:var(--color-border-default)] rounded-[16px] p-3 shadow-sm'>
                    <a
                      href={itemUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='relative w-[60px] h-[60px] rounded-[10px] overflow-hidden bg-[color:var(--color-bg-base)] border border-black/5 shrink-0'>
                      <Image
                        src={
                          item.imageUrl ||
                          `https://picsum.photos/seed/${item.product_id}/300/300`
                        }
                        alt={item.name}
                        fill
                        sizes='60px'
                        className='object-cover'
                      />
                    </a>
                    <div className='flex-1 min-w-0 flex flex-col justify-between py-0.5'>
                      <div>
                        <a
                          href={itemUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='font-medium text-[14px] text-[color:var(--color-primary)] hover:underline truncate block'>
                          {item.name}
                        </a>
                        <p className='text-[13px] font-semibold text-[color:var(--color-text-primary)] mt-0.5'>
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className='flex items-center justify-between mt-2'>
                        <div className='flex items-center gap-3 bg-[color:var(--color-bg-base)] rounded-full px-2 py-1'>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.product_id, -1)
                            }
                            className='text-[color:var(--color-text-secondary)]'>
                            <Minus className='w-3.5 h-3.5' />
                          </button>
                          <span className='font-semibold text-[13px] w-4 text-center text-[color:var(--color-text-primary)]'>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.product_id, 1)
                            }
                            className='text-[color:var(--color-text-secondary)]'>
                            <Plus className='w-3.5 h-3.5' />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product_id)}
                          className='text-[color:var(--color-text-tertiary)] hover:text-red-500 transition-colors p-1'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer */}
            <div className='p-5 bg-[color:var(--color-bg-base)] border-t border-[color:var(--color-border-subtle)] pb-[calc(env(safe-area-inset-bottom)+20px)] lg:pb-5'>
              <div className='flex justify-between items-center mb-4'>
                <span className='text-[15px] font-medium text-[color:var(--color-text-secondary)]'>
                  Total
                </span>
                <span className='text-[20px] font-semibold text-[color:var(--color-text-primary)]'>
                  {formatPrice(calculateSubtotal())}
                </span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setActiveTab('chat');
                  handleSendMessage('Please check out my cart.');
                }}
                className='w-full py-3.5 bg-[color:var(--color-primary)] disabled:bg-[color:var(--color-rule)] disabled:text-[color:var(--color-ink-3)] text-white rounded-[var(--radius-md)] font-semibold text-[16px] transition-all active:scale-[0.98] hover:bg-[color:var(--color-primary-hover)]'>
                Checkout
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Tab Bar */}
      <nav className='lg:hidden fixed bottom-0 left-0 right-0 h-[calc(60px+env(safe-area-inset-bottom))] bg-[color:var(--color-paper-2)]/95 backdrop-blur-xl border-t border-[color:var(--color-rule)] px-6 pb-[env(safe-area-inset-bottom)] flex items-center justify-around z-50'>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
            activeTab === 'discover'
              ? 'text-[color:var(--color-primary)]'
              : 'text-[color:var(--color-ink-3)]'
          }`}>
          <Search
            className={`w-[22px] h-[22px] ${activeTab === 'discover' ? 'stroke-[2.5px]' : ''}`}
          />
          <span className='text-[10px] font-medium'>Search</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
            activeTab === 'chat'
              ? 'text-[color:var(--color-primary)]'
              : 'text-[color:var(--color-ink-3)]'
          }`}>
          <MessageSquare
            className={`w-[22px] h-[22px] ${activeTab === 'chat' ? 'stroke-[2.5px]' : ''}`}
          />
          <span className='text-[10px] font-medium'>Ayla</span>
        </button>

        <button
          onClick={() => setActiveTab('cart')}
          className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
            activeTab === 'cart'
              ? 'text-[color:var(--color-primary)]'
              : 'text-[color:var(--color-ink-3)]'
          }`}>
          <ShoppingBag
            className={`w-[22px] h-[22px] ${activeTab === 'cart' ? 'stroke-[2.5px]' : ''}`}
          />
          {cart.reduce((s, i) => s + i.quantity, 0) > 0 && (
            <span className='absolute top-1.5 right-[calc(50%-18px)] w-2.5 h-2.5 bg-[color:var(--color-accent)] border-2 border-[color:var(--color-paper-2)] rounded-full' />
          )}
          <span className='text-[10px] font-medium'>Basket</span>
        </button>
      </nav>
    </div>
  );
}
