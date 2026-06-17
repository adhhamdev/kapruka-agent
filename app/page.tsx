"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ShoppingBag,
  MessageSquare,
  MapPin,
  Truck,
  CreditCard,
  ArrowRight,
  Clock,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Globe,
  Languages,
  Activity,
  Check,
  Menu,
  X,
  Gift,
  AlertCircle,
  HelpCircle,
  ShoppingBag as CartIcon,
  Send,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  widgets?: any[];
  timestamp: Date;
}

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! Subha Dawasak! 🇱🇰 I am **Ayla**, your conversational AI shopping agent for Kapruka!\n\nI can search our live e-commerce catalog, check flat-rate delivery quotes to any city in Sri Lanka, manage your shopping cart, and generate a secure checkout pay-link.\n\nType in English, **Sinhala (සිංහල)** or **Tanglish** (e.g., 'Kandy walata deliver karanna puluwanda?') and let's start shopping! What are you searching for today? 🌸",
      timestamp: new Date(),
    },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "info">("chat");
  const [mounted, setMounted] = useState(false);

  const borderRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load cart from localStorage on init
  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem("kapruka_agent_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed parsing cached cart:", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("kapruka_agent_cart", JSON.stringify(cart));
  }, [cart]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending]);

  // Handle message sending
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isPending) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsPending(true);

    try {
      // Clean previous system prompt updates from history we send to server
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      chatHistory.push({ role: "user", content: textToSend });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          cart: cart,
        }),
      });

      if (!response.ok) {
        let errMsg = "Failed to receive response from shopping agent service.";
        try {
          const errData = await response.json();
          if (errData?.error) {
            errMsg = errData.error;
          }
        } catch {}

        if (
          errMsg.toLowerCase().includes("quota") ||
          errMsg.toLowerCase().includes("limit") ||
          errMsg.toLowerCase().includes("429") ||
          errMsg.toLowerCase().includes("exhausted")
        ) {
          errMsg = `Gemini API Quota Exceeded (429): Our shared key has temporary quota limits. Please check/add your GEMINI_API_KEY inside the system Settings gear or wait a moment and try again. Details: ${errMsg}`;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Update cart state if returned from the agent
      if (data.cart) {
        setCart(data.cart);
      }

      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: data.text,
          widgets: data.widgets,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      console.error("[Chat Submit Error]:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Ane, I couldn't connect right now. Please check your internet connection or secrets, and try again! Error: ${error?.message || error}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsPending(false);
    }
  };

  // Pre-defined quick starters
  const quickStarters = [
    { label: "🌹 Fresh Flower Bouquets", prompt: "Show me fresh flower bouquets available for delivery" },
    { label: "🍰 Birthday Cakes", prompt: "Find a delicious birthday cake. I want to see what options you have." },
    { label: "🍫 Chocolates & Hampers", prompt: "Search for chocolate gift boxes or gift baskets." },
    { label: "🚚 Check Delivery to Galle", prompt: "Where do you deliver? Can you list delivery cities and check delivery of roses to Galle?" },
    { label: "📦 Track Order", prompt: "How do I track my order? I want to track an existing order status." },
    { label: "🇱🇰 සිංහලෙන් කතා කරමු", prompt: "සිංහලෙන් කතා කරමු! මට කේක් සහ මල් තෑගි බලන්න ඕනේ." },
  ];

  // Helper formatting total LKR price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Parsing basic markdown (bold strings, tables, bullet points, lines) for visual display
  const parseMarkdownText = (text: string) => {
    if (!text) return "";
    
    // Split by lines to parse paragraphs or lists
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;

      // Handle bullets
      const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
      const isBullet = !!bulletMatch;
      const rawText = isBullet ? bulletMatch![1] : line;

      // Regular bold parsing
      const parts = rawText.split(/\*\*([^*]+)\*\*/g);
      if (parts.length > 1) {
        content = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-semibold text-gray-900">{part}</strong>;
          }
          return part;
        });
      }

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-gray-700 leading-relaxed mb-1" id={`bullet-${idx}`}>
            {content}
          </li>
        );
      }

      if (line.trim() === "") {
        return <div key={idx} className="h-2" id={`space-${idx}`} />;
      }

      return (
        <p key={idx} className="text-sm text-gray-700 leading-relaxed mb-1.5" id={`p-${idx}`}>
          {content}
        </p>
      );
    });
  };

  // Local Actions: Add item directly to local cart state
  const handleLocalAddToCart = (product: any) => {
    // Check if item exists in state
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.productId);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product_id: product.productId,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl || `https://picsum.photos/seed/${product.productId}/300/300`,
          },
        ];
      }
    });

    // Notify user in state
    const infoMessage: Message = {
      id: `local-add-${Date.now()}`,
      role: "assistant",
      content: `🛒 I have added **${product.name}** directly to your shopping cart! Let me know if oya are ready to check out or search for more gifts.`,
      timestamp: new Date(),
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
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] sans antialiased text-[#1A1A1A]" id="app-root">
      
      {/* Hallmark · macrostructure: Multi-Panel Grid · tone: Atelier · anchor hue: orange */}
      
      {/* Top Elegant Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-zinc-200/50 px-4 md:px-8 py-3.5" id="nav-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <h1 className="serif text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2" id="title-logo">
                Kapruka <span className="sans text-[10px] font-bold tracking-widest bg-orange-50 text-[#F27D26] px-2.5 py-0.5 rounded-full border border-orange-100/40 uppercase">Ayla Concierge</span>
              </h1>
              <p className="sans text-[9px] uppercase tracking-[0.2em] font-medium text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3 h-3 text-[#F27D26] animate-pulse" /> Agent Challenge 2026 · Colombo, Sri Lanka
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="sans text-[8px] uppercase tracking-wider font-semibold text-zinc-400">Target Environment</p>
              <p className="serif text-xs font-bold text-zinc-800">M4 Mac Mini</p>
            </div>

            <div className="h-4 w-[1px] bg-zinc-200/60 hidden sm:block"></div>

            {/* Info Brief Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === "chat" ? "info" : "chat")}
              className="p-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all font-semibold uppercase tracking-wider sans text-[10px] flex items-center gap-1.5 cursor-pointer"
              title="Show Challenge Details"
              id="info-toggle"
            >
              <HelpCircle className="w-4 h-4 text-[#F27D26]" />
              <span className="hidden md:inline">Brief</span>
            </button>

            {/* Cart Button Toggle */}
            <button
              onClick={() => {
                setCartOpen(!cartOpen);
                setActiveTab("chat");
              }}
              className="relative p-2 bg-zinc-950 hover:bg-zinc-800 text-[#FAF9F6] rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
              id="cart-toggle-btn"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-[#F27D26]" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F27D26] text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative" id="layout-body">
        
        {/* Left Side Sidebar */}
        <section className={`w-full lg:w-80 bg-white/30 border-r border-zinc-200/40 p-6 md:p-8 flex flex-col justify-between shrink-0 ${activeTab === "info" ? "flex" : "hidden lg:flex"}`} id="left-sidebar">
          <div className="space-y-6">
            <div className="pb-4 border-b border-zinc-100">
              <p className="sans text-[10px] font-bold uppercase tracking-widest text-[#F27D26] mb-1">Interactive Assistant</p>
              <h2 className="serif text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                Gifting Made <br />
                <span className="italic font-bold text-zinc-900">Personal.</span>
              </h2>
            </div>

            {/* Quick Pathways */}
            <nav className="space-y-4 py-1">
              <div 
                className="group cursor-pointer flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-zinc-100/50 transition-colors" 
                onClick={() => handleSendMessage("Show me fresh flower bouquets available for delivery")}
              >
                <div>
                  <p className="sans text-[8px] font-bold text-zinc-400 uppercase tracking-widest">01 — Discover</p>
                  <p className="serif text-base text-zinc-800 group-hover:text-[#F27D26] transition-colors font-semibold">Gift Finder</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#F27D26] group-hover:translate-x-0.5 transition-all" />
              </div>

              <div 
                className="group cursor-pointer flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-zinc-100/50 transition-colors" 
                onClick={() => handleSendMessage("Where is my order? Track shipping status")}
              >
                <div>
                  <p className="sans text-[8px] font-bold text-zinc-400 uppercase tracking-widest">02 — Tracker</p>
                  <p className="serif text-base text-zinc-800 group-hover:text-[#F27D26] transition-colors font-semibold">Delivery Status</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#F27D26] group-hover:translate-x-0.5 transition-all" />
              </div>
            </nav>

            {/* Quick Starters Group */}
            <div className="space-y-4" id="shortcuts-panel">
              <div>
                <h4 className="text-[10px] sans font-bold text-zinc-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                  <span>⚡ Prompt Starters</span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {quickStarters.map((qs, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(qs.prompt)}
                      className="p-3 text-left bg-white/60 border border-zinc-200/40 rounded-xl text-xs hover:border-[#F27D26] hover:bg-white active:scale-[0.99] transition-all flex items-start gap-2.5 group cursor-pointer"
                      id={`quick-starter-btn-${i}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F27D26] mt-0.5 shrink-0 group-hover:rotate-12 transition-transform" />
                      <span className="font-semibold text-zinc-700 group-hover:text-zinc-950 leading-tight">{qs.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tested Capabilities */}
              <div className="border-t border-zinc-200/40 pt-4">
                <h4 className="text-[10px] sans font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                  🎯 System Scopes
                </h4>
                <ul className="text-[11px] text-zinc-600 space-y-2 leading-relaxed font-sans">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Search 25,000+ Lankan items</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Multi-item checkout pricing</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Local delivery city scopes</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Locked LKR pay-links</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Connected Cart Box */}
          <button 
            onClick={() => { setCartOpen(true); setActiveTab("chat"); }}
            className="p-5 rounded-2xl bg-zinc-950 text-white cursor-pointer mt-6 flex flex-col justify-between hover:bg-zinc-900 transition-all duration-300 border border-zinc-800 text-left group hover:scale-[1.01]"
          >
            <div className="flex justify-between items-start w-full">
              <div>
                <p className="sans text-[9px] uppercase tracking-widest font-bold text-zinc-400 mb-1">Total Basket</p>
                <p className="serif text-2xl font-bold text-[#F27D26]">{formatPrice(calculateSubtotal())}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[#F27D26] group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="h-[1px] w-full bg-zinc-800 my-3.5"></div>
            <div className="sans text-[11px] text-zinc-455 flex justify-between items-center w-full">
              <span>{cart.reduce((s, idx) => s + idx.quantity, 0)} Items Selected</span>
              <span className="text-[#F27D26] font-bold group-hover:translate-x-0.5 transition-transform">Review Basket →</span>
            </div>
          </button>
        </section>

        {/* Central Clean Chat Board */}
        <main className={`flex-1 flex flex-col bg-[#FAF9F6] overflow-hidden min-h-[500px] h-[calc(100vh-73px)] relative ${activeTab === "info" ? "hidden" : "flex"}`} id="chat-surface">
          
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" id="messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                id={`msg-wrap-${msg.id}`}
              >
                <div className={`flex items-start gap-3.5 max-w-[85%] md:max-w-[78%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Avatar Bubble */}
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${msg.role === "user" ? "bg-white border-zinc-200 text-zinc-800 font-extrabold sans text-xs shadow-3xs" : "bg-zinc-950 border-transparent text-[#F27D26]"}`}>
                    {msg.role === "user" ? msg.content.substring(0, 1).toUpperCase() : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <p className="sans text-[9px] uppercase font-bold tracking-widest text-zinc-400 block px-1">
                      {msg.role === "user" ? "Buyer Client" : "Concierge Ayla"}
                    </p>

                    {/* Message Text Bubble */}
                    <div
                      className={`${
                        msg.role === "user"
                          ? "bg-zinc-900 text-white p-4 rounded-2xl rounded-tr-none shadow-3xs text-sm font-sans"
                          : "bg-white p-5 rounded-2xl rounded-tl-none border border-zinc-200/55 chat-shadow serif text-[14.5px] leading-relaxed text-zinc-800"
                      }`}
                      id={`bubble-${msg.id}`}
                    >
                      {parseMarkdownText(msg.content)}
                    </div>

                    <span className="text-[9px] font-mono text-zinc-400 block px-1 pt-0.5" suppressHydrationWarning>
                      {mounted ? msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                </div>

                {/* VISUAL WIDGETS ANCHOR */}
                {msg.widgets && msg.widgets.length > 0 && (
                  <div className="w-full mt-3 pl-12 pr-4 space-y-4" id={`widgets-for-${msg.id}`}>
                    {msg.widgets.map((widget, widIdx) => {
                      
                      // 1. CAROUSEL
                      if (widget.type === "carousel" && Array.isArray(widget.data)) {
                        return (
                          <div key={widIdx} className="w-full" id={`carousel-widget-${widIdx}`}>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 mb-2.5 font-sans uppercase tracking-widest">
                              <ShoppingBag className="w-3.5 h-3.5 text-[#F27D26]" /> Match Results ({widget.data.length})
                            </div>
                            <div className="flex overflow-x-auto pb-3.5 gap-4 snap-x scrollbar-thin scrollbar-thumb-zinc-200">
                              {widget.data.map((prod: any, prodIdx: number) => (
                                <div
                                  key={prodIdx}
                                  className="w-[205px] shrink-0 bg-white border border-zinc-200/40 rounded-2xl p-3.5 snap-start shadow-xs hover:border-[#F27D26] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                                  id={`prod-card-${prodIdx}`}
                                >
                                  <div>
                                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FAF9F6] border border-black/5 mb-3">
                                      <Image
                                        src={prod.imageUrl || `https://picsum.photos/seed/${prod.productId}/300/300`}
                                        alt={prod.name}
                                        fill
                                        sizes="200px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                      <span className={`absolute top-2 left-2 text-[8px] font-mono font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide shadow-3xs ${
                                        prod.inStock ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                                      }`}>
                                        {prod.inStock ? "In Stock" : "Sold Out"}
                                      </span>
                                    </div>
                                    <h5 className="serif font-bold text-xs text-zinc-900 line-clamp-2 h-8 leading-tight">{prod.name}</h5>
                                    <p className="sans text-xs text-[#F27D26] font-extrabold mt-1.5">{formatPrice(prod.price)}</p>
                                    <span className="text-[8px] font-mono text-zinc-400 block mt-0.5 uppercase tracking-wider">SKU: {prod.productId}</span>
                                  </div>

                                  <div className="mt-3.5 space-y-1.5">
                                    <button
                                      disabled={!prod.inStock}
                                      onClick={() => handleLocalAddToCart(prod)}
                                      className="w-full py-2 bg-zinc-950 hover:bg-[#F27D26] disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer"
                                      id={`buy-btn-${prod.productId}`}
                                    >
                                      Add to Cart
                                    </button>
                                    <button
                                      onClick={() => handleSendMessage(`Tell me details about product code: ${prod.productId}`)}
                                      className="w-full py-1 text-zinc-400 hover:text-zinc-900 rounded-lg text-[9px] uppercase font-extrabold tracking-wider transition-colors cursor-pointer"
                                      id={`info-btn-${prod.productId}`}
                                    >
                                      Inspect details 🔍
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // 2. PRODUCT DETAIL
                      if (widget.type === "detail" && widget.data) {
                        const prod = widget.data;
                        return (
                          <div key={widIdx} className="bg-white border border-zinc-200/50 rounded-2xl p-5 shadow-xs max-w-md" id="detail-widget">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="relative w-full md:w-32 aspect-square rounded-xl overflow-hidden bg-[#FAF9F6] shrink-0 border border-black/5">
                                <Image
                                  src={prod.imageUrl || `https://picsum.photos/seed/${prod.productId}/300/300`}
                                  alt={prod.name}
                                  fill
                                  sizes="128px"
                                  referrerPolicy="no-referrer"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <span className="text-[9px] sans uppercase tracking-wider bg-orange-50 text-[#F27D26] px-2.5 py-0.5 rounded-full font-bold">Product Showcase</span>
                                  <h4 className="serif font-bold text-zinc-900 text-sm mt-2">{prod.name}</h4>
                                  <p className="sans text-xs font-bold text-[#F27D26] mt-1">{formatPrice(prod.price)}</p>
                                  <p className="sans text-[11px] text-zinc-500 mt-2.5 leading-relaxed line-clamp-3">{prod.description || "No descriptions available presently."}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                  <button
                                    disabled={!prod.inStock}
                                    onClick={() => handleLocalAddToCart({ productId: prod.productId, name: prod.name, price: prod.price, imageUrl: prod.imageUrl })}
                                    className="px-4 py-2.5 bg-zinc-950 hover:bg-[#F27D26] disabled:bg-zinc-150 disabled:text-zinc-400 text-white rounded-xl text-[9px] uppercase tracking-widest font-extrabold transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap"
                                    id="detail-add-cart-btn"
                                  >
                                    Add to Cart
                                  </button>
                                  {prod.url && (
                                    <a
                                      href={prod.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-2.5 border border-zinc-200 text-zinc-650 rounded-xl text-[9px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-all text-center flex items-center"
                                      id="detail-view-k-link"
                                    >
                                      Kapruka Store
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // 3. DELIVERY QUOTE
                      if (widget.type === "delivery_quote" && widget.data) {
                        const quote = widget.data;
                        return (
                          <div key={widIdx} className="bg-white border border-zinc-200/50 rounded-2xl p-4.5 shadow-xs max-w-sm flex items-start gap-4" id="delivery-quote-widget">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                              <Truck className="w-5 h-5 text-[#F27D26]" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[9px] sans font-bold tracking-widest text-[#F27D26] uppercase">Delivery Quote</h4>
                              <p className="serif text-base font-bold text-zinc-950 mt-0.5">{quote.city}</p>
                              
                              <div className="mt-2.5 space-y-1.5 text-xs text-zinc-600 font-sans">
                                <p className="flex justify-between items-center py-0.5 border-b border-zinc-50">
                                  <span>📅 Targeted Delivery</span>
                                  <span className="font-bold text-zinc-900">{quote.deliveryDate}</span>
                                </p>
                                <p className="flex justify-between items-center py-0.5 border-b border-zinc-50">
                                  <span>🚚 Courier Rate</span>
                                  <span className="font-bold text-[#F27D26]">{quote.cost ? formatPrice(quote.cost) : "LKR 450 (Standard)"}</span>
                                </p>
                                <p className="flex justify-between items-center py-0.5">
                                  <span>🛑 Dispatch Status</span>
                                  {quote.canDeliver ? (
                                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-0.5">Deliverable <Check className="w-3 h-3" /></span>
                                  ) : (
                                    <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-md text-[10px]">Unavailable</span>
                                  )}
                                </p>
                              </div>

                              {quote.warning && (
                                <div className="mt-3 p-2.5 bg-amber-50 text-amber-900 border border-amber-100/60 rounded-xl text-[10px] flex items-start gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                                  <span className="leading-normal">{quote.warning}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // 4. CHECKOUT FORM INVOICE
                      if (widget.type === "checkout_form" && widget.data) {
                        const check = widget.data;
                        const finalPayUrl = check.checkoutUrl;
                        return (
                          <div key={widIdx} className="bg-white border-2 border-zinc-900 rounded-2xl p-5.5 shadow-md max-w-md relative overflow-hidden" id="checkout-invoice-widget">
                            <div className="absolute top-0 right-0 py-1.5 px-3 bg-zinc-900 text-white text-[8px] font-sans tracking-widest uppercase rounded-bl-xl font-extrabold">Invoice Summary</div>
                            <h4 className="serif font-bold text-sm text-zinc-900 flex items-center gap-1.5 mt-1">
                              <CreditCard className="w-4.5 h-4.5 text-[#F27D26]" /> Order Checkout Lock
                            </h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5 sans">LKR Lock Reference: <span className="font-mono text-zinc-900 font-semibold">{check.orderNumber}</span></p>
                            
                            <div className="border-t border-dashed border-zinc-200 my-4 pt-4">
                              <div className="flex justify-between text-xs text-zinc-500">
                                <span>Guest Purchase Description</span>
                                <span className="font-bold text-zinc-900">{check.itemsCount || cart.reduce((s, i) => s + i.quantity, 0)} Items Locked</span>
                              </div>
                              <div className="flex justify-between text-sm text-zinc-900 font-bold mt-2.5">
                                <span>TOTAL ASSIGNED:</span>
                                <span className="serif text-lg font-bold text-[#F27D26]">{formatPrice(check.totalAmount)}</span>
                              </div>
                            </div>

                            <div className="mt-3.5 p-3 bg-zinc-50 text-zinc-650 border border-zinc-150 rounded-xl text-[10px] leading-relaxed">
                              ⚠️ Standard checkout lock references are secure and valid for 60 minutes. Click below to fulfill payment on Kapruka Payment Center.
                            </div>

                            <a
                              href={finalPayUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 bg-[#F27D26] hover:bg-zinc-900 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase text-center flex items-center justify-center gap-2 mt-4.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                              id="checkout-pay-now-btn"
                            >
                              💳 SECURE GUEST PAY NOW <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>
                        );
                      }

                      // 5. ORDER TRACKER PROGRESS
                      if (widget.type === "order_status" && widget.data) {
                        const tracker = widget.data;
                        return (
                          <div key={widIdx} className="bg-white border border-zinc-200/50 rounded-2xl p-5 shadow-xs max-w-sm" id="order-status-widget">
                            <div className="flex items-center gap-1.5 mb-3.5 text-[9px] sans font-bold text-zinc-400 uppercase tracking-widest">
                              <Activity className="w-4 h-4 text-[#F27D26]" /> Dispatch Tracker logs
                            </div>
                            <h4 className="serif font-bold text-zinc-950 text-sm">Receipt: {tracker.orderNumber}</h4>
                            <p className="sans text-xs text-zinc-500 mb-4">Receiving recipient: <span className="font-semibold text-zinc-850">{tracker.recipientName || "Guest Customer"}</span></p>
                            
                            <div className="space-y-4 relative pl-3 border-l border-zinc-155 ml-1.5" id="timeline-stepper">
                              {tracker.logs && tracker.logs.length > 0 ? (
                                tracker.logs.map((log: any, logIdx: number) => (
                                  <div key={logIdx} className="relative text-xs" id={`timeline-step-${logIdx}`}>
                                    <div className="absolute -left-[16.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-status-pulse"></div>
                                    <span className="text-[9px] font-mono text-zinc-400 block">{log.time}</span>
                                    <span className="serif font-bold text-zinc-900 leading-tight block mt-0.5">{log.activity}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-zinc-500 py-1 flex items-start gap-2.5 pb-1">
                                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-spin" />
                                  <span>No local dispatch history presently. Status: <strong className="text-[#F27D26] font-bold">{tracker.status}</strong></span>
                                </div>
                              )}
                            </div>
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
              <div className="flex items-center gap-2.5 text-xs text-zinc-400 pl-12" id="typing-indicator">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-[#F27D26] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#F27D26] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#F27D26] rounded-full animate-bounce"></div>
                </div>
                <span className="sans text-[10px] uppercase font-bold tracking-widest text-[#F27D26] animate-pulse">Ayla concierge is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions pill chips */}
          <div className="px-4 py-3 flex items-center gap-2.5 overflow-x-auto whitespace-nowrap bg-[#FAF9F6] border-t border-zinc-200/40" id="quick-queries-chips">
            <span className="sans text-[9px] uppercase tracking-widest font-bold text-zinc-400 shrink-0">
              Suggestions:
            </span>
            <button
              onClick={() => handleSendMessage("Search fresh flower bouquets")}
              className="sans text-[9px] uppercase font-bold px-3.5 py-1.5 bg-white hover:bg-orange-50 border border-zinc-200/50 hover:border-orange-200/60 text-zinc-850 rounded-full cursor-pointer transition-all active:scale-[0.98]"
              id="chip-flowers"
            >
              Suggest Cakes 🎂
            </button>
            <button
              onClick={() => handleSendMessage("Recommend flower baskets or cake options")}
              className="sans text-[9px] uppercase font-bold px-3.5 py-1.5 bg-white hover:bg-orange-50 border border-zinc-200/50 hover:border-orange-200/60 text-zinc-850 rounded-full cursor-pointer transition-all active:scale-[0.98]"
              id="chip-cakes"
            >
              Same Day Options ⚡
            </button>
            <button
              onClick={() => handleSendMessage("Check delivery quote to Galle or Kandy")}
              className="sans text-[9px] uppercase font-bold px-3.5 py-1.5 bg-white hover:bg-orange-50 border border-zinc-200/50 hover:border-orange-200/60 text-zinc-850 rounded-full cursor-pointer transition-all active:scale-[0.98]"
              id="chip-delivery"
            >
              Check Quote 🚚
            </button>
            <button
              onClick={() => handleSendMessage("Where is my order? Track number KAP3829")}
              className="sans text-[9px] uppercase font-bold px-3.5 py-1.5 bg-white hover:bg-orange-50 border border-zinc-200/50 hover:border-orange-200/60 text-zinc-850 rounded-full cursor-pointer transition-all active:scale-[0.98]"
              id="chip-track"
            >
              Track Order 📦
            </button>
          </div>

          {/* Input text Box Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-4 bg-white border-t border-zinc-200/40 flex items-center space-x-2.5 shadow-3xs"
            id="chat-input-form"
          >
            <div className="flex-1 relative flex items-center">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }
                }}
                disabled={isPending}
                placeholder="Ask about delivery to Kandy or find a specific gift..."
                className="w-full bg-[#FAF9F6] border border-zinc-200 rounded-xl pl-4 pr-18 py-2.5 text-sm sans focus:outline-hidden focus:border-zinc-900 resize-none h-[42px] max-h-[125px] scrollbar-none transition-all leading-normal"
                id="message-text-area"
              />
              <button
                type="button"
                onClick={() => setInputText("සිංහලෙන්!")}
                className="absolute right-3.5 p-1 text-zinc-500 hover:text-[#F27D26] text-[8.5px] font-bold tracking-widest sans uppercase transition-colors rounded-md bg-zinc-100 hover:bg-orange-50"
                title="සිංහලෙන් / Sinhala"
                id="sinhala-shortcut-btn"
              >
                සිංහලෙන්
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isPending}
              className="px-5 py-2.5 bg-zinc-950 hover:bg-[#F27D26] disabled:bg-zinc-100 disabled:text-zinc-400 text-[#FAF9F6] rounded-xl active:scale-[0.97] transition-all cursor-pointer font-bold uppercase tracking-widest h-[42px] flex items-center justify-center text-[10px]"
              id="send-msg-btn"
            >
              Send
            </button>
          </form>
        </main>

        {/* Floating Shopping Cart Drawer */}
        <AnimatePresence>
          {cartOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-[320px] md:w-[360px] bg-white shadow-2xl border-l border-zinc-200 z-50 flex flex-col justify-between"
              id="floating-cart-drawer"
            >
              <div>
                {/* Drawer Header */}
                <div className="p-4 border-b border-zinc-200/40 flex items-center justify-between bg-[#FAF9F6]" id="cart-drawer-header">
                  <div className="flex items-center space-x-2">
                    <CartIcon className="w-5 h-5 text-[#F27D26]" />
                    <span className="serif font-bold text-sm text-zinc-900" id="cart-drawer-title">Unified Cart</span>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                    id="close-cart-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Products list */}
                <div className="p-4 space-y-3.5 overflow-y-auto max-h-[calc(100vh-210px)]" id="cart-drawer-items">
                  {cart.length === 0 ? (
                    <div className="text-center py-16" id="cart-empty-message">
                      <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto stroke-1" />
                      <p className="sans text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-4">Basket is presently empty</p>
                      <button
                        onClick={() => {
                          handleSendMessage("Recommend a popular gift item");
                          setCartOpen(false);
                        }}
                        className="text-[10px] font-bold text-[#F27D26] uppercase tracking-widest mt-3.5 underline cursor-pointer hover:text-zinc-900 transition-colors"
                        id="empty-cart-cta"
                      >
                        Quick explore products
                      </button>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <div
                        key={item.product_id}
                        className="flex gap-3 bg-[#FAF9F6] border border-zinc-200/40 rounded-xl p-3.5 relative items-center justify-between shadow-3xs"
                        id={`cart-item-${idx}`}
                      >
                        <div className="flex gap-3 items-center">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-black/5">
                            <Image
                              src={item.imageUrl || `https://picsum.photos/seed/${item.product_id}/300/300`}
                              alt={item.name}
                              fill
                              sizes="48px"
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h5 className="serif font-bold text-[11px] text-zinc-900 leading-tight line-clamp-1">{item.name}</h5>
                            <span className="sans text-[10.5px] text-[#F27D26] font-extrabold block mt-0.5">{formatPrice(item.price)}</span>
                            <span className="text-[8px] font-mono text-zinc-400 block mt-0.5 break-all">ID: {item.product_id}</span>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-1">
                          <div className="flex items-center space-x-1.5 bg-white border border-zinc-200 px-1.5 py-0.5 rounded-lg text-xs" id={`qty-ctrl-${item.product_id}`}>
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, -1)}
                              className="hover:text-[#F27D26] cursor-pointer"
                              id={`qty-minus-${item.product_id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold text-xs px-1 text-zinc-800">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, 1)}
                              className="hover:text-[#F27D26] cursor-pointer"
                              id={`qty-plus-${item.product_id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                            title="Remove unit item"
                            id={`delete-btn-${item.product_id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Drawer footer details */}
              <div className="p-4 border-t border-zinc-200/40 bg-[#FAF9F6]" id="cart-drawer-footer">
                <div className="flex justify-between items-center text-[9px] sans uppercase tracking-widest font-bold text-zinc-400 mb-1">
                  <span>Selected unique categories</span>
                  <span className="font-mono font-bold text-zinc-800">{cart.length} unique</span>
                </div>
                <div className="flex justify-between items-center text-xs sans uppercase tracking-wider font-bold text-zinc-950 mb-4.5">
                  <span>Calculated total amount</span>
                  <span className="serif text-base font-extrabold text-[#F27D26]" id="cart-calc-subtotal">{formatPrice(calculateSubtotal())}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={cart.length === 0}
                    onClick={() => {
                      setCart([]);
                      setCartOpen(false);
                      const m: Message = {
                        id: `cart-clear-${Date.now()}`,
                        role: "assistant",
                        content: "🧹 Cart has been cleared fully. Calculated total is now **LKR 0**.",
                        timestamp: new Date(),
                      };
                      setMessages((p) => [...p, m]);
                    }}
                    className="py-2.5 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-100 text-[9px] sans uppercase font-bold tracking-widest rounded-xl transition cursor-pointer bg-white disabled:bg-zinc-100 disabled:text-zinc-400 disabled:border-zinc-200"
                    id="cart-clear-all-btn"
                  >
                    Clear All
                  </button>
                  <button
                    disabled={cart.length === 0}
                    onClick={() => {
                      setCartOpen(false);
                      handleSendMessage("I want to check out my cart and place an order please.");
                    }}
                    className="py-2.5 bg-zinc-950 hover:bg-[#F27D26] disabled:bg-zinc-100 disabled:text-zinc-400 text-[#FAF9F6] rounded-xl text-[9px] sans uppercase font-extrabold tracking-widest text-center transition-all cursor-pointer whitespace-nowrap"
                    id="cart-checkout-cta"
                  >
                    Fulfill checkout
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Persistence global block footer */}
      <footer className="bg-white border-t border-zinc-200/40 py-5.5 px-6 text-center select-none" id="global-page-footer">
        <p className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between sans text-[9.5px] uppercase font-bold text-zinc-400 gap-1.5 md:gap-0 tracking-wider">
          <span>📅 Kapruka Agent Challenge Submission 2026</span>
          <span>👩‍💻 Powered by Gemini & Model Context Protocol SSE Streams</span>
        </p>
      </footer>
    </div>
  );
}
