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
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/5 px-4 md:px-6 py-4 shadow-3xs" id="nav-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <h1 className="serif text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tighter uppercase italic flex items-center gap-1.5" id="title-logo">
                Kapruka <span className="serif text-[#F27D26] not-italic lowercase font-light text-xs sm:text-sm bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100/50">ayla agent</span>
              </h1>
              <p className="sans text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-semibold opacity-50 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-[#F27D26]" /> Agent Challenge 2026 — Colombo, Sri Lanka
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="text-right hidden md:block">
              <p className="sans text-[9px] uppercase font-bold opacity-40">Challenge Mission</p>
              <p className="serif italic font-bold text-sm text-[#F27D26]">Apple M4 Mac Mini</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-all relative shrink-0">
              <span className="sans font-extrabold text-[11px]">M4</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></div>
            </div>

            <div className="h-6 w-[1px] bg-black/5 hidden sm:block"></div>

            {/* Quick stats buttons */}
            <button
              onClick={() => setActiveTab(activeTab === "chat" ? "info" : "chat")}
              className="p-2 rounded-xl text-gray-700 hover:bg-black/5 hover:text-black active:scale-95 transition-all text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider sans"
              title="Show Challenge Details"
              id="info-toggle"
            >
              <HelpCircle className="w-4.5 h-4.5 text-[#F27D26]" />
              <span className="hidden sm:inline text-[10px]">Brief</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => {
                setCartOpen(!cartOpen);
                setActiveTab("chat");
              }}
              className="relative p-2 rounded-xl hover:bg-orange-50 text-[#F27D26] active:scale-95 transition-all"
              id="cart-toggle-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F27D26] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative" id="layout-body">
        
        {/* Left Side Panel on Widescreen or Toggleable Panel */}
        <section className={`w-full lg:w-80 bg-white/40 border-r border-black/5 p-6 md:p-8 flex flex-col justify-between shrink-0 ${activeTab === "info" ? "flex" : "hidden lg:flex"}`} id="left-sidebar">
          <div className="space-y-6">
            <h2 className="sans text-[58px] lg:text-[68px] font-black leading-[0.85] tracking-tighter mb-4 select-none text-black">
              SHOP<br/>LIVE<span className="text-[#F27D26]">.</span>
            </h2>

            {/* Quick Discover Pathways from Mock HTML */}
            <nav className="space-y-5 border-y border-black/5 py-5">
              <div className="group cursor-pointer" onClick={() => handleSendMessage("Show me fresh flower bouquets available for delivery")}>
                <p className="sans text-[9px] font-extrabold opacity-40 group-hover:opacity-100 uppercase tracking-widest transition-opacity">01 — Discover</p>
                <p className="serif text-lg text-gray-800 group-hover:text-[#F27D26] transition-colors">Gift Finder</p>
              </div>
              <div className="group cursor-pointer" onClick={() => handleSendMessage("Where is my order? Track shipping status")}>
                <p className="sans text-[9px] font-extrabold opacity-40 group-hover:opacity-100 uppercase tracking-widest transition-opacity">02 — Tracker</p>
                <p className="serif text-lg text-gray-800 group-hover:text-[#F27D26] transition-colors">Delivery Status</p>
              </div>
              <div className="group cursor-pointer" onClick={() => { setCartOpen(true); setActiveTab("chat"); }}>
                <p className="sans text-[9px] font-extrabold uppercase tracking-widest text-[#F27D26]">03 — Current</p>
                <p className="serif text-lg font-bold text-gray-900">Checkout Flow</p>
              </div>
            </nav>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1" id="shortcuts-panel">
              <div>
                <h4 className="text-[10px] sans font-bold text-gray-400 uppercase tracking-wider mb-2">
                  🇱🇰 Prompt Starters
                </h4>
                <div className="grid grid-cols-1 gap-1.5 animate-fadeIn">
                  {quickStarters.map((qs, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(qs.prompt)}
                      className="p-2.5 text-left bg-white/70 border border-black/5 rounded-xl text-xs hover:border-[#F27D26] hover:bg-orange-50/10 active:scale-98 transition-all flex items-start gap-2 group"
                      id={`quick-starter-btn-${i}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F27D26] mt-0.5 shrink-0" />
                      <span className="font-semibold text-gray-750 group-hover:text-black leading-snug">{qs.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-black/5 pt-3">
                <h4 className="text-[10px] sans font-bold text-gray-400 uppercase tracking-wider mb-2">
                  🎯 Tested Capabilities
                </h4>
                <ul className="text-[11px] text-gray-600 space-y-1.5 leading-relaxed font-sans">
                  <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Search 25,000+ Lankan items</li>
                  <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Multi-item checkout pricing</li>
                  <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Local delivery city scopes</li>
                  <li className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Locked LKR pay-links</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Unified status cart status box matching the Mock Layout styling */}
          <div 
            onClick={() => { setCartOpen(true); setActiveTab("chat"); }}
            className="p-5 rounded-2xl bg-black text-white cursor-pointer mt-6 flex flex-col justify-between hover:bg-zinc-900 transition-all shadow-md group hover:scale-[1.02] active:scale-98"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="sans text-[9px] uppercase tracking-widest font-bold opacity-50 mb-1">Cart Status</p>
                <p className="serif text-2xl font-bold text-[#F27D26]">{formatPrice(calculateSubtotal())}</p>
              </div>
              <ShoppingBag className="w-5 h-5 text-[#F27D26]" />
            </div>
            <div className="h-[1px] w-full bg-white/10 my-3"></div>
            <p className="sans text-[11px] opacity-70 flex justify-between items-center">
              <span>{cart.reduce((s, idx) => s + idx.quantity, 0)} Items Pending</span>
              <span className="text-[#F27D26] font-bold">Review →</span>
            </p>
          </div>
        </section>

        {/* Central Chat Interface */}
        <main className={`flex-1 flex flex-col bg-[#FAF9F6] overflow-hidden min-h-[500px] h-[calc(100vh-68px)] relative ${activeTab === "info" ? "hidden" : "flex"}`} id="chat-surface">
          
          {/* Active Conversations Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5" id="messages-container">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                id={`msg-wrap-${msg.id}`}
              >
                <div className={`flex items-start gap-3.5 max-w-[85%] md:max-w-[78%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Avatar Icons */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === "user" ? "bg-white border-black/10 text-gray-800 font-bold sans text-xs" : "bg-black border-transparent text-[#F27D26]"}`}>
                    {msg.role === "user" ? msg.content.substring(0, 1).toUpperCase() : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <p className="sans text-[10px] uppercase font-extrabold opacity-40 tracking-wider block px-1">
                      {msg.role === "user" ? "Buyer Client" : "Kapruka Concierge"}
                    </p>

                    {/* Message Bubble styled per mockup request */}
                    <div
                      className={`${
                        msg.role === "user"
                          ? "bg-[#1A1A1A] text-white p-4 rounded-2xl rounded-br-none shadow-sm text-sm font-sans"
                          : "glass p-5 rounded-2xl rounded-tl-none chat-shadow serif text-[15px] leading-relaxed text-[#1A1A1A]"
                      }`}
                      id={`bubble-${msg.id}`}
                    >
                      {parseMarkdownText(msg.content)}
                    </div>

                    {/* Timestamp log */}
                    <span className="text-[9px] font-mono text-gray-400 block px-1" suppressHydrationWarning>
                      {mounted ? msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                </div>

                {/* VISUAL WIDGETS ANCHOR */}
                {msg.widgets && msg.widgets.length > 0 && (
                  <div className="w-full mt-2 pl-11 pr-4 space-y-3" id={`widgets-for-${msg.id}`}>
                    {msg.widgets.map((widget, widIdx) => {
                      
                      // 1. CAROUSEL
                      if (widget.type === "carousel" && Array.isArray(widget.data)) {
                        return (
                          <div key={widIdx} className="w-full" id={`carousel-widget-${widIdx}`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mb-2 font-mono uppercase tracking-widest">
                              <ShoppingBag className="w-3.5 h-3.5 text-[#F27D26]" /> Product matches ({widget.data.length})
                            </div>
                            <div className="flex overflow-x-auto pb-3 gap-3 snap-x scrollbar-thin scrollbar-thumb-black/5">
                              {widget.data.map((prod: any, prodIdx: number) => (
                                <div
                                  key={prodIdx}
                                  className="w-[200px] shrink-0 bg-white border border-black/5 rounded-2xl p-3 snap-start shadow-xs hover:border-[#F27D26] hover:scale-[1.01] transition-all flex flex-col justify-between"
                                  id={`prod-card-${prodIdx}`}
                                >
                                  <div>
                                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FAF9F6] border border-black/5 mb-2">
                                      <Image
                                        src={prod.imageUrl || `https://picsum.photos/seed/${prod.productId}/300/300`}
                                        alt={prod.name}
                                        fill
                                        sizes="200px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                      {prod.inStock ? (
                                        <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">In Stock</span>
                                      ) : (
                                        <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Sold Out</span>
                                      )}
                                    </div>
                                    <h5 className="serif font-bold text-xs text-[#1A1A1A] line-clamp-2 h-8 leading-tight">{prod.name}</h5>
                                    <p className="sans text-xs text-[#F27D26] font-extrabold mt-1.5">{formatPrice(prod.price)}</p>
                                    <span className="text-[8px] font-mono text-gray-450 block mt-0.5 uppercase tracking-widest">Id: {prod.productId}</span>
                                  </div>

                                  <div className="mt-3 space-y-1">
                                    <button
                                      disabled={!prod.inStock}
                                      onClick={() => handleLocalAddToCart(prod)}
                                      className="w-full py-1.5 bg-[#121212] hover:bg-[#F27D26] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl text-[9px] uppercase font-bold tracking-wider transition-all active:scale-95 cursor-pointer"
                                      id={`buy-btn-${prod.productId}`}
                                    >
                                      Add to Cart
                                    </button>
                                    <button
                                      onClick={() => handleSendMessage(`Tell me details about product code: ${prod.productId}`)}
                                      className="w-full py-1 text-gray-400 hover:text-black rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all"
                                      id={`info-btn-${prod.productId}`}
                                    >
                                      Inspect 🔍
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
                          <div key={widIdx} className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm max-w-md" id="detail-widget">
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
                                  <h4 className="serif font-bold text-[#1A1A1A] text-sm mt-2">{prod.name}</h4>
                                  <p className="sans text-xs font-bold text-[#F27D26] mt-1">{formatPrice(prod.price)}</p>
                                  <p className="sans text-[11px] text-gray-500 mt-1 lines-clamp-3 leading-relaxed">{prod.description || "No descriptions available presently."}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                  <button
                                    disabled={!prod.inStock}
                                    onClick={() => handleLocalAddToCart({ productId: prod.productId, name: prod.name, price: prod.price, imageUrl: prod.imageUrl })}
                                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#F27D26] disabled:bg-gray-150 disabled:text-gray-400 text-white rounded-xl text-[9px] uppercase tracking-wider font-extrabold transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                                    id="detail-add-cart-btn"
                                  >
                                    Add to Cart
                                  </button>
                                  {prod.url && (
                                    <a
                                      href={prod.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-2 border border-black/10 text-gray-600 rounded-xl text-[9px] uppercase tracking-wider font-bold hover:bg-black/5 transition-all text-center"
                                      id="detail-view-k-link"
                                    >
                                      Kapruka
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
                          <div key={widIdx} className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm max-w-sm flex items-start gap-3" id="delivery-quote-widget">
                            <Truck className="w-8 h-8 text-[#F27D26] shrink-0 p-1.5 bg-orange-50 rounded-xl" />
                            <div>
                              <h4 className="text-[9px] sans font-bold tracking-widest text-gray-400 uppercase">Delivery Check Status</h4>
                              <p className="serif text-base font-bold text-[#1A1A1A] mt-0.5">City: {quote.city}</p>
                              <div className="mt-1.5 space-y-1 text-xs text-gray-600 font-sans">
                                <p className="flex items-center gap-1.5">📅 Schedule Target: <span className="font-semibold text-gray-950">{quote.deliveryDate}</span></p>
                                <p className="flex items-center gap-1.5">🚚 Shipping Rate: <span className="font-bold text-[#F27D26]">{quote.cost ? formatPrice(quote.cost) : "LKR 450 (Standard)"}</span></p>
                                <p className="flex items-center gap-1.5">🛑 Status: {quote.canDeliver ? <span className="text-emerald-600 font-semibold flex items-center gap-0.5">Deliverable <Check className="w-3.5 h-3.5" /></span> : <span className="text-red-500 font-semibold">Unavailable</span>}</p>
                              </div>
                              {quote.warning && (
                                <div className="mt-2.5 p-2 bg-amber-50 text-amber-800 text-[10px] rounded-lg border border-amber-100 flex items-start gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                  <span>{quote.warning}</span>
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
                          <div key={widIdx} className="bg-white border-2 border-[#1A1A1A] rounded-2xl p-5 shadow-lg max-w-md relative overflow-hidden" id="checkout-invoice-widget">
                            <div className="absolute top-0 right-0 py-1.5 px-3 bg-[#1A1A1A] text-white text-[8px] font-sans tracking-widest uppercase rounded-bl-xl font-extrabold">Receipt Invoice</div>
                            <h4 className="serif font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-[#F27D26]" /> Order Ready!
                            </h4>
                            <p className="text-xs text-gray-450 mt-0.5 sans">Transaction ID: <span className="font-mono text-gray-900 font-semibold">{check.orderNumber}</span></p>
                            
                            <div className="border-t border-dashed border-black/10 my-3.5 pt-3.5">
                              <div className="flex justify-between text-xs text-gray-500 font-medium">
                                <span>Kapruka Guest Purchase Invoice:</span>
                                <span className="font-bold text-gray-900">{check.itemsCount || cart.reduce((s, i) => s + i.quantity, 0)} Items</span>
                              </div>
                              <div className="flex justify-between text-base text-gray-900 font-bold mt-2">
                                <span>TOTAL LOCKED AMOUNT:</span>
                                <span className="serif text-lg font-bold text-[#F27D26]">{formatPrice(check.totalAmount)}</span>
                              </div>
                            </div>

                            <p className="text-[10px] text-gray-500 leading-normal my-3 bg-[#FAF9F6] p-2.5 rounded-lg border border-black/5">
                              ⚠️ **Note:** Standard guest checkout prices are locked for 60 minutes. Click below to pay on secure Kapruka Payment Center.
                            </p>

                            <a
                              href={finalPayUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 bg-[#F27D26] hover:bg-accent-orange-hover text-white rounded-xl text-[10px] font-bold tracking-wider uppercase text-center flex items-center justify-center gap-1.5 mt-2 transition-all active:scale-95 cursor-pointer shadow-xs"
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
                          <div key={widIdx} className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm max-w-sm" id="order-status-widget">
                            <div className="flex items-center gap-1.5 mb-3 text-[10px] sans font-bold text-gray-400 uppercase tracking-widest">
                              <Activity className="w-4 h-4 text-[#F27D26]" /> Dispatch Progress Log
                            </div>
                            <h4 className="serif font-bold text-[#1A1A1A] text-sm">Order: {tracker.orderNumber}</h4>
                            <p className="sans text-xs text-gray-500 mb-3">Recipient Name: <span className="font-semibold text-gray-800">{tracker.recipientName || "Valued Customer"}</span></p>
                            
                            <div className="space-y-4 relative pl-3 border-l border-black/5 ml-1.5" id="timeline-stepper">
                              {tracker.logs && tracker.logs.length > 0 ? (
                                tracker.logs.map((log: any, logIdx: number) => (
                                  <div key={logIdx} className="relative text-xs" id={`timeline-step-${logIdx}`}>
                                    <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse"></div>
                                    <span className="text-[9px] font-mono text-gray-400 block">{log.time}</span>
                                    <span className="serif font-bold text-[#1A1A1A] leading-tight block">{log.activity}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-500 py-1 flex items-start gap-1 pb-1">
                                  <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
                                  <span>Tracking logs updated periodically. Status: <strong className="text-[#F27D26] font-bold">{tracker.status}</strong></span>
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
              <div className="flex items-center gap-2.5 text-xs text-gray-400 pl-11" id="typing-indicator">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-[#F27D26] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#F27D26] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#F27D26] rounded-full animate-bounce"></div>
                </div>
                <span className="sans text-[10px] uppercase font-bold tracking-wider text-gray-500">ayla concierge is typing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Chips Bar updated to matches mock layouts styles */}
          <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap bg-[#FAF9F6] border-t border-black/5" id="quick-queries-chips">
            <span className="sans text-[10px] uppercase tracking-widest font-bold opacity-40 shrink-0">
              Suggestions:
            </span>
            <button
              onClick={() => handleSendMessage("Search fresh flower bouquets")}
              className="sans text-[9px] uppercase font-bold px-3 py-1.5 bg-black/5 hover:bg-black/10 text-gray-800 rounded-full cursor-pointer transition-colors"
              id="chip-flowers"
            >
              Suggest Cakes 🎂
            </button>
            <button
              onClick={() => handleSendMessage("Recommend flower baskets or cake options")}
              className="sans text-[9px] uppercase font-bold px-3 py-1.5 bg-black/5 hover:bg-black/10 text-gray-800 rounded-full cursor-pointer transition-colors"
              id="chip-cakes"
            >
              Same Day Options ⚡
            </button>
            <button
              onClick={() => handleSendMessage("Check delivery quote to Galle or Kandy")}
              className="sans text-[9px] uppercase font-bold px-3 py-1.5 bg-black/5 hover:bg-black/10 text-gray-800 rounded-full cursor-pointer transition-colors"
              id="chip-delivery"
            >
              Check Delivery Quote 🚚
            </button>
            <button
              onClick={() => handleSendMessage("Where is my order? Track number KAP3829")}
              className="sans text-[9px] uppercase font-bold px-3 py-1.5 bg-black/5 hover:bg-black/10 text-gray-800 rounded-full cursor-pointer transition-colors"
              id="chip-track"
            >
              Track Deliveries 📦
            </button>
          </div>

          {/* Input Chat Field Bar with Bold styles */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-4 bg-white border-t border-black/5 flex items-center space-x-2 shadow-xs"
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
                className="w-full bg-[#FAF9F6] border-2 border-black/10 rounded-2xl pl-4 pr-18 py-2.5 text-sm sans focus:outline-hidden focus:border-[#1A1A1A] resize-none h-[42px] max-h-[120px] scrollbar-none transition-colors"
                id="message-text-area"
              />
              <button
                type="button"
                onClick={() => setInputText("සිංහලෙන්!")}
                className="absolute right-3 p-1 text-gray-500 hover:text-[#F27D26] text-[9px] font-bold tracking-tight sans uppercase transition-colors rounded-lg bg-black/5 hover:bg-black/10"
                title="සිංහලෙන් / Sinhala"
                id="sinhala-shortcut-btn"
              >
                සිංහලෙන්
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isPending}
              className="px-5 py-2.5 bg-black hover:bg-zinc-800 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl active:scale-95 transition-all cursor-pointer font-bold uppercase tracking-widest h-[42px] flex items-center justify-center text-[10px]"
              id="send-msg-btn"
            >
              Send
            </button>
          </form>
        </main>

        {/* Floating Side Drawer - SHOPPING CART DETAILS */}
        <AnimatePresence>
          {cartOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-[310px] md:w-[350px] bg-white shadow-2xl border-l border-black/10 z-50 flex flex-col justify-between"
              id="floating-cart-drawer"
            >
              <div>
                {/* Header of Drawer */}
                <div className="p-4 border-b border-black/5 flex items-center justify-between bg-[#FAF9F6]" id="cart-drawer-header">
                  <div className="flex items-center space-x-2">
                    <CartIcon className="w-5 h-5 text-[#F27D26]" />
                    <span className="serif font-bold text-sm text-[#1A1A1A]" id="cart-drawer-title">Shopping Unified Cart</span>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="p-1 rounded-full hover:bg-black/5 text-gray-500 hover:text-black transition-colors"
                    id="close-cart-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items list inside cart */}
                <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-210px)]" id="cart-drawer-items">
                  {cart.length === 0 ? (
                    <div className="text-center py-12" id="cart-empty-message">
                      <ShoppingBag className="w-12 h-12 text-gray-350 mx-auto stroke-1" />
                      <p className="sans text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-4">your cart is empty, Malli!</p>
                      <button
                        onClick={() => {
                          handleSendMessage("Recommend a popular gift item");
                          setCartOpen(false);
                        }}
                        className="text-[10px] font-bold text-[#F27D26] uppercase tracking-wider mt-2.5 underline"
                        id="empty-cart-cta"
                      >
                        Find popular gifts
                      </button>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <div
                        key={item.product_id}
                        className="flex gap-2.5 bg-[#FAF9F6] border border-black/5 rounded-xl p-3 relative items-center justify-between"
                        id={`cart-item-${idx}`}
                      >
                        <div className="flex gap-2.5 items-center">
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
                            <h5 className="serif font-bold text-[11px] text-[#1A1A1A] leading-tight line-clamp-1">{item.name}</h5>
                            <span className="sans text-[10px] text-[#F27D26] font-extrabold block mt-0.5">{formatPrice(item.price)}</span>
                            <span className="text-[8px] font-mono text-gray-400 block break-all">Code: {item.product_id}</span>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-1">
                          <div className="flex items-center space-x-1.5 bg-white border border-black/10 px-1 py-0.5 rounded-lg text-xs" id={`qty-ctrl-${item.product_id}`}>
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, -1)}
                              className="hover:text-[#F27D26]"
                              id={`qty-minus-${item.product_id}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold font-xs px-1 text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, 1)}
                              className="hover:text-[#F27D26]"
                              id={`qty-plus-${item.product_id}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                            title="Remove unit"
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

              {/* Footer pricing totals of Cart */}
              <div className="p-4 border-t border-black/10 bg-[#FAF9F6]" id="cart-drawer-footer">
                <div className="flex justify-between items-center text-[10px] sans uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                  <span>Selected unique items:</span>
                  <span className="font-mono font-bold text-gray-800">{cart.length} count</span>
                </div>
                <div className="flex justify-between items-center text-xs sans uppercase tracking-wider font-bold text-gray-900 mb-4">
                  <span>Calculated Subtotal:</span>
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
                        content: "🧹 Cart has been cleared fully. Subtotal is now **LKR 0**.",
                        timestamp: new Date(),
                      };
                      setMessages((p) => [...p, m]);
                    }}
                    className="py-2.5 border border-black/10 hover:border-[#1A1A1A] hover:bg-black/5 text-[9px] sans uppercase font-bold tracking-wider rounded-xl transition cursor-pointer bg-white"
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
                    className="py-2.5 bg-black hover:bg-zinc-800 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl text-[9px] sans uppercase font-extrabold tracking-wider text-center transition-all cursor-pointer whitespace-nowrap"
                    id="cart-checkout-cta"
                  >
                    Go Checkout
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent global footer */}
      <footer className="bg-white border-t border-black/5 py-5 px-6 text-center select-none" id="global-page-footer">
        <p className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between sans text-[9px] uppercase font-bold opacity-30 gap-1.5 md:gap-0 tracking-wider">
          <span>📅 Kapruka Agent Challenge Submission 2026. Solo Build Entry.</span>
          <span>👩‍💻 Built by DeepMind with Gemini 3.5 & Model Context Protocol.</span>
        </p>
      </footer>
    </div>
  );
}
