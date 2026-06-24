# Kapruka Agent

**Meet Agent — your AI shopping assistant for Kapruka. Now with live voice.**

Kapruka Agent is a conversational assistant for Kapruka's full catalog — groceries, fashion, electronics, pharmacy, gifts, and much more. **Tap the mic to talk live** — speak naturally, hear Agent reply in real time, and watch product cards appear in chat while you shop. Or type in plain English, Sinhala, Tamil, or Tanglish; browse categories and product cards; manage your basket; check delivery; checkout with a real Kapruka payment link; and track orders. Optionally save delivery addresses, gift recipients, and shopping preferences on this device so Agent can pre-fill checkout next time — review or clear them anytime from **Saved info**.

Production: **[https://agent-kapruka.vercel.app](https://agent-kapruka.vercel.app)**

Built for the **Kapruka Agent Challenge 2026**.

---

## What You Can Do

| Feature | Description |
|---------|-------------|
| **Live voice with Agent** | Real-time two-way voice via Gemini Live — speak, listen, and shop hands-free. Product carousels, delivery quotes, and checkout widgets appear in the same chat thread |
| **Unified chat thread** | Live transcripts and typed messages share one conversation — switch between voice and text anytime |
| **Search & discover** | Keyword search, categories, quick prompts on the chat home screen |
| **Product carousel** | Horizontal scrollable cards in chat with **Load more** pagination |
| **Product details** | Single-product cards with price, image, variants, and add-to-basket |
| **Delivery quotes** | Check availability, date, and cost for Sri Lankan cities |
| **Shopping basket** | Add, remove, adjust quantities, or **clear basket** — persisted locally |
| **Saved info** | Optional memory for delivery addresses, gift recipients, language, and preferences — open the person icon in the header to review or remove |
| **Faster checkout** | After checkout, tap **Yes, save it** to store delivery details; Agent recalls them on return visits |
| **Guest checkout** | Secure Kapruka pay link via live MCP `create_order` |
| **Order tracking** | Look up orders by confirmation email order number |
| **Chat history** | Conversation restored on refresh (up to 80 messages) |
| **New chat** | Start fresh with the refresh button in the header |
| **Attachments** | Send images or documents (PDF, Word, txt) with strict validation |
| **Markdown replies** | Agent responses render headings, lists, bold, and links |
| **Scroll to latest** | Floating chevron when you scroll up in a long conversation |
| **Welcome guide** | First-visit modal explains live voice, capabilities, saved info, and privacy |
| **Dictation fallback** | Browser speech-to-text when live voice is unavailable |

**Languages:** English (default), Sinhala, Tamil, Tanglish — Agent mirrors the language you speak or write in.

**Currency:** All prices shown in **LKR**.

**No account required:** Basket, chat history, and saved info are tied to this browser — no Kapruka login needed.

---

## Using the App

1. **Talk live or type** — Tap the **mic** in the composer for a live voice conversation (Agent talks back), or type what you want (e.g. *“Show me laptops under 200000”*).
2. **Browse results** — Product carousels and detail cards appear inline — during voice or text. Tap **+** to add to basket.
3. **Load more** — On search carousels, tap **Load more products** for the next page.
4. **Check your basket** — Tap the **Basket** icon in the header (badge shows item count).
5. **Checkout** — Tap **Checkout** in the basket; Agent collects delivery details and returns a pay link.
6. **Save for next time** — After checkout, tap **Yes, save it** on the order card to remember the delivery address.
7. **Review saved details** — Tap the **Saved info** icon (person) in the header to see or remove remembered addresses, recipients, and preferences.

**Tips**

- **Live voice** — Tap the mic to start; speak in English, Sinhala, Tamil, or Tanglish. You can still type or attach files while live is active.
- **Talk live** suggestion chip on the home screen — a quick way to start a conversational shopping session.
- **Suggestions** on the chat home screen — tap a chip to start instantly (categories, track order, saved details, etc.).
- **New chat** (refresh icon in header) — clears history and resets to the welcome message.
- **Saved info** — optional; chat and checkout always work even if memory is off or unavailable.
- Basket and chat history survive refresh (browser `localStorage`).
- Kapruka logo and brand links open [kapruka.com](https://www.kapruka.com).

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Route Handlers) |
| **UI** | [React 19](https://react.dev/), [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/), CSS variables (`tokens.css`) |
| **AI** | [Google Gemini](https://ai.google.dev/) — text chat via tool-calling agent loop; **live voice** via Gemini Live API (`@google/genai`) |
| **Catalog & checkout** | [Kapruka MCP](https://mcp.kapruka.com/mcp) via `@modelcontextprotocol/sdk` (Streamable HTTP) |
| **Personal memory** | [Supermemory](https://supermemory.ai/) — optional saved delivery, recipients, and preferences (scoped per browser) |
| **Markdown** | [Streamdown](https://streamdown.ai/) — streaming-safe MD in chat bubbles |
| **Motion** | [Motion](https://motion.dev/) — message, cart, and widget animations |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Images** | `next/image` with remote patterns for Kapruka CDN + Shopify CDN |
| **Fonts** | DM Sans (`next/font`) |
| **Client persistence** | `localStorage` — basket, chat history, anonymous memory user id |
| **Voice** | **Gemini Live** (real-time WebSocket + PCM audio) · Web Speech API dictation fallback |
| **Runtime** | Node.js 20+ (API routes); deployable to Vercel |

---

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ or [Bun](https://bun.sh/)
- A [Google Gemini API key](https://aistudio.google.com/apikey)
- Network access to `mcp.kapruka.com`

### Quick start

```bash
# Install dependencies
npm install   # or: bun install

# Environment
cp .env.example .env.local
# Set GEMINI_API_KEY in .env.local

# Dev server
npm run dev   # or: bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Server-side Gemini API key |
| `SUPERMEMORY_API_KEY` | No | Enables saved info / personal memory; without it, chat and checkout work normally |
| `NEXT_PUBLIC_APP_URL` | Production | Public URL for OG, sitemap, social previews — `https://agent-kapruka.vercel.app` |

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run clean` | Clear Next.js cache |

---

## Architecture

```
Browser
  ├── Chat + Basket (single page; basket as header sidebar / overlay)
  ├── localStorage: basket, chat history, memory user id
  ├── Saved info panel + post-checkout "Yes, save it" chip
  ├── POST /api/chat ──► Gemini agent loop (text)
  │                         ├── Virtual UI tools (carousel, cart actions, …)
  │                         ├── Supermemory tools (optional — search, add, forget)
  │                         └── Kapruka MCP (search, delivery, checkout, track)
  ├── Live voice (Gemini Live)
  │     ├── POST /api/live/token ──► ephemeral token + system instruction
  │     ├── WebSocket (client) ──► Gemini Live model
  │     └── POST /api/live/tools ──► same Kapruka MCP + widget tools as text chat
  ├── GET/POST/DELETE /api/memory ──► Saved info CRUD (Supermemory)
  └── POST /api/products/search ──► carousel "Load more" pagination
```

- **Agent loop** (`lib/agents/kapruka-agent.ts`) — multi-turn Gemini with function calling; merges cart context each request; attaches Supermemory tools when configured.
- **Live voice** (`hooks/use-gemini-live.ts`) — browser mic → Gemini Live WebSocket; tool calls bridged to `/api/live/tools`; transcripts and widgets merged into the same message list as text chat.
- **Shared tools** (`lib/agent/execute-kapruka-tool.ts`) — Kapruka MCP and UI widget execution used by both text and live paths.
- **MCP client** (`lib/kapruka-mcp.ts`) — seven live Kapruka tools over Streamable HTTP.
- **Memory service** (`lib/supermemory/service.ts`) — fetch, add, forget, and clear saved info for the anonymous browser user id.
- **Widgets** — structured UI payloads (carousel, detail, delivery quote, checkout form, order status) rendered client-side.

See **[SPEC.md](./SPEC.md)** for API contracts, MCP tool mapping, and storage keys.  
See **[design.md](./design.md)** for visual system and interaction patterns.

---

## Project Structure

```
app/                    Next.js App Router (page, API routes, metadata, PWA icons)
  api/chat/             Main agent endpoint (streaming UI messages)
  api/live/             Gemini Live — token, tools bridge, session helpers
  api/memory/           Saved info list, add, remove, clear-all
  api/products/search/  Carousel pagination endpoint
components/
  chat/                 Messages, composer, live voice bar, markdown, home screen
  cart/                 Basket panel and line items
  discover/             Quick prompt chips
  memory/               Saved info panel, remember-delivery chip
  widgets/              Product carousel, detail, checkout, delivery, order status
  layout/               Header (basket + saved info), skip link
  onboarding/           First-visit welcome modal
constants/              Brand, agent config, welcome copy, attachment limits
hooks/                  use-chat, use-gemini-live, use-saved-info, attachments, speech
lib/
  agent/                System prompt, shared tool executor, live session store
  live/                 Audio utils, live message bridge
  agents/               Kapruka ToolLoopAgent factory
  supermemory/          Supermemory client, categorization, delivery memory helpers
  cart/                 Mutations and totals
  kapruka-mcp.ts        MCP transport and typed tool wrappers
public/                 Logos, avatar, static assets
types/                  Chat, widgets, cart, attachments, memory
```

---

## Privacy & Security

- Product data and checkout flow go through Kapruka’s official MCP service.
- Basket and chat history stay in **browser localStorage** — not on our server.
- **Saved info** (when enabled) is stored via Supermemory, scoped to an anonymous id in your browser — no Kapruka account or email required. You can remove individual items or clear everything from **Saved info** in the header.
- Agent never stores payment card data or pay links in memory.
- `GEMINI_API_KEY` and `SUPERMEMORY_API_KEY` are **server-only**; never sent to the client.
- Attachments validated client-side (MIME allowlist, size limits) and again in `/api/chat`.
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| “Shopping assistant is temporarily unavailable” | Verify `GEMINI_API_KEY` is set and valid |
| Products not loading | Check network access to `mcp.kapruka.com` |
| Product images broken | CDN host must be in `next.config.ts` `images.remotePatterns` |
| Basket or chat lost on refresh | Ensure localStorage is not blocked (private mode, strict settings) |
| Live voice won't connect | Allow microphone access; verify `GEMINI_API_KEY` supports Gemini Live; check browser console |
| Live voice silent or choppy | Use headphones to avoid echo; try a quiet environment; refresh and tap mic again |
| Saved info empty or unavailable | Optional feature — needs `SUPERMEMORY_API_KEY` on the server; shopping is unaffected |
| Duplicate message keys / stale favicon | Hard refresh; use **New chat** to reset history |
| Social preview wrong URL | Set `NEXT_PUBLIC_APP_URL` to `https://agent-kapruka.vercel.app` and redeploy |

---

## License

Private — Kapruka Agent Challenge 2026.

Built for **[Kapruka](https://www.kapruka.com)** · Sri Lanka's all-in-one online store.
