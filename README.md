# Kapruka Agent

**Meet Agent — your AI shopping concierge for Kapruka.**

Kapruka Agent is a conversational web assistant that helps you find gifts, cakes, flowers, electronics, and more from Kapruka’s live catalog. Ask in plain English, Sinhala, Tamil, or Tanglish; browse rich product cards in chat; manage your basket; check delivery anywhere in Sri Lanka; and checkout with a real Kapruka payment link.

Built for the **Kapruka Agent Challenge 2026**.

---

## What You Can Do

| Feature | Description |
|---------|-------------|
| **Search & discover** | Keyword search, categories, quick prompts on the Discover tab |
| **Product carousel** | Horizontal scrollable cards in chat with **Load more** pagination |
| **Product details** | Single-product cards with price, image, and add-to-basket |
| **Delivery quotes** | Check availability, date, and cost for Sri Lankan cities |
| **Shopping basket** | Add, remove, adjust quantities, or **clear basket** — persisted locally |
| **Guest checkout** | Secure Kapruka pay link via live MCP `create_order` |
| **Order tracking** | Look up orders by confirmation email order number |
| **Chat history** | Conversation restored on refresh (up to 80 messages) |
| **New chat** | Start fresh with the pencil button (top-right of chat) |
| **Voice input** | Dictate messages via browser speech recognition |
| **Attachments** | Send images or documents (PDF, Word, txt) with strict validation |
| **Markdown replies** | Agent responses render headings, lists, bold, and links |
| **Scroll to latest** | Floating chevron when you scroll up in a long conversation |

**Languages:** English (default), Sinhala, Tamil, Tanglish — Agent mirrors the language you write in.

**Currency:** All prices shown in **LKR**.

---

## Using the App

1. **Chat with Agent** — Type or dictate what you want (e.g. *“Show me birthday cakes for Colombo”*).
2. **Browse results** — Product carousels and detail cards appear inline. Tap **+** to add to basket.
3. **Load more** — On search carousels, tap **Load more products** for the next page.
4. **Check your basket** — Mobile: **Basket** tab. Desktop: right panel.
5. **Checkout** — Tap **Checkout** in the basket; Agent collects delivery details and returns a pay link.

**Tips**

- **Search** tab — quick prompts (flowers, cakes, track order, etc.).
- **New chat** (pencil icon) — clears history and resets to the welcome message.
- Basket and chat history survive refresh (browser `localStorage`).
- Kapruka logo and brand links open [kapruka.com](https://www.kapruka.com).

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Route Handlers) |
| **UI** | [React 19](https://react.dev/), [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/), CSS variables (`tokens.css`) |
| **AI** | [Google Gemini](https://ai.google.dev/) via `@google/genai` — tool-calling agent loop |
| **Catalog & checkout** | [Kapruka MCP](https://mcp.kapruka.com/mcp) via `@modelcontextprotocol/sdk` (Streamable HTTP) |
| **Markdown** | [Streamdown](https://streamdown.ai/) — streaming-safe MD in chat bubbles |
| **Motion** | [Motion](https://motion.dev/) — message, cart, and widget animations |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Images** | `next/image` with remote patterns for Kapruka CDN + Shopify CDN |
| **Fonts** | DM Sans (`next/font`) |
| **Client persistence** | `localStorage` — basket + chat history |
| **Voice** | Web Speech API (browser) |
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
| `NEXT_PUBLIC_APP_URL` | Production | Public URL for OG image, sitemap, manifest |

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
  ├── Discover / Chat / Basket (single page, tabbed on mobile)
  ├── localStorage: basket, chat history
  └── POST /api/chat ──► Gemini agent loop
                              ├── Virtual UI tools (carousel, cart actions, …)
                              └── Kapruka MCP (search, delivery, checkout, track)
  └── POST /api/products/search ──► carousel "Load more" pagination
```

- **Agent loop** (`lib/agent/agent-loop.ts`) — multi-turn Gemini with function calling; merges cart context each request.
- **MCP client** (`lib/kapruka-mcp.ts`) — seven live Kapruka tools over Streamable HTTP.
- **Widgets** — structured UI payloads (carousel, detail, delivery quote, checkout form, order status) rendered client-side.

See **[SPEC.md](./SPEC.md)** for API contracts, MCP tool mapping, and storage keys.  
See **[design.md](./design.md)** for visual system and interaction patterns.

---

## Project Structure

```
app/                    Next.js App Router (page, API routes, metadata, PWA icons)
  api/chat/             Main agent endpoint
  api/products/search/  Carousel pagination endpoint
components/
  chat/                 Messages, composer, markdown, scroll affordances
  cart/                 Basket panel and line items
  discover/             Search sidebar and quick prompts
  widgets/              Product carousel, detail, checkout, delivery, order status
  layout/               Header, mobile tab bar
constants/              Brand, agent config, attachment limits
hooks/                  use-chat, attachments, speech, reduced motion
lib/
  agent/                Gemini client, tools, system prompt, executor
  cart/                 Mutations and totals
  kapruka-mcp.ts        MCP transport and typed tool wrappers
public/                 Logos, avatar, static assets
types/                  Chat, widgets, cart, attachments
```

---

## Privacy & Security

- Product data and checkout flow go through Kapruka’s official MCP service.
- Basket and chat history stay in **browser localStorage** — not on our server.
- `GEMINI_API_KEY` is **server-only**; never sent to the client.
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
| Duplicate message keys / stale favicon | Hard refresh; use **New chat** to reset history |
| Social preview wrong URL | Set `NEXT_PUBLIC_APP_URL` to production domain |

---

## License

Private — Kapruka Agent Challenge 2026.

Built for **[Kapruka](https://www.kapruka.com)** · Sri Lanka’s premier online gift & delivery platform.
