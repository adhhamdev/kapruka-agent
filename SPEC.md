# Technical Specification — Kapruka Agent

Version aligned with Kapruka Agent Challenge 2026 deliverable.

---

## 1. System overview

Kapruka Agent is a **single-page Next.js application** with no custom backend database. State splits between:

| State | Storage | Key / location |
|-------|---------|----------------|
| Shopping basket | `localStorage` | `kapruka_agent_cart` (via `lib/cart-storage.ts`) |
| Chat history | `localStorage` | `kapruka_agent_chat_history` (max 80 messages) |
| Session / AI | Stateless | Each `POST /api/chat` sends full history + cart |

Server responsibilities: Gemini orchestration, Kapruka MCP proxy, attachment validation.

---

## 2. Technology stack

### Core

- **Next.js 15.4+** — App Router, Server Components where applicable, Route Handlers for API
- **React 19** — Client components for chat, cart, interactions
- **TypeScript 5.9** — Strict mode

### AI & integrations

- **`@google/genai`** — `geminiClient.models.generateContent` with `functionDeclarations`
- **`@modelcontextprotocol/sdk`** — `StreamableHTTPClientTransport` → `https://mcp.kapruka.com/mcp`
- **Agent model** — Configured in `constants/agent.ts` (`GEMINI_MODEL`, `MAX_AGENT_TURNS`, temperature)

### UI & content

- **Tailwind CSS 4** + `@tailwindcss/typography` — utility styling, prose for markdown
- **Streamdown** — `MarkdownContent` renders assistant messages
- **Motion 12** — layout and entrance animations
- **Lucide React** — icons
- **next/image** — optimized product images (remote CDN allowlist in `next.config.ts`)

### Browser APIs

- **Web Speech API** — voice input in composer (`hooks/use-speech-recognition.ts`)
- **localStorage** — cart + chat persistence
- **FileReader** — attachment encoding to base64 for chat API

---

## 3. API routes

### `POST /api/chat`

**Request body:**

```json
{
  "messages": [{ "role": "user" | "assistant", "content": "string", "attachments?": [...] }],
  "cart": [{ "product_id", "name", "price", "quantity", ... }]
}
```

**Response:**

```json
{
  "text": "string",
  "widgets": [ /* Widget union — see types/widgets.ts */ ],
  "cart": [ /* updated cart after tool actions */ ]
}
```

**Server behavior:**

1. Validate JSON, messages array, cart array
2. Validate attachments per message (`lib/attachment-validation.ts`)
3. Run `runAgentLoop(messages, cart)` — injects cart context system message
4. Return text, widgets, and possibly mutated cart

**Runtime:** `nodejs`

### `POST /api/products/search`

Used by carousel **Load more** (client-side pagination, not agent turn).

**Request body:**

```json
{
  "q": "string (min 3 chars)",
  "category?": "string",
  "min_price?": number,
  "max_price?": number,
  "sort?": "string",
  "cursor?": "string",
  "limit?": number (max 20, default 10)
}
```

**Response:**

```json
{
  "products": [ /* KaprukaProduct[] */ ],
  "nextCursor": "string | null"
}
```

Calls Kapruka MCP search with `response_format: json`, enriches image URLs, returns parsed cursor.

---

## 4. Agent tools

### Kapruka MCP (live — 7 tools)

| Tool | Purpose |
|------|---------|
| `kapruka_search_products` | Catalog search; JSON with `results` + `next_cursor` |
| `kapruka_get_product` | Product detail by ID |
| `kapruka_list_categories` | Category tree |
| `kapruka_list_delivery_cities` | City lookup |
| `kapruka_check_delivery` | Availability, cost, warnings |
| `kapruka_create_order` | Guest checkout — recipient, delivery (incl. address), sender, cart items |
| `kapruka_track_order` | Post-payment status by email order number |

All pricing calls use **LKR** (`DEFAULT_CURRENCY`).

MCP args wrapped as `{ params: { ... } }` per Kapruka server convention.

### Virtual UI tools (client-rendered)

| Tool | Widget type |
|------|-------------|
| `show_products_carousel` | `carousel` (+ optional `pagination` for load-more) |
| `show_product_detail` | `detail` |
| `show_delivery_quote` | `delivery_quote` |
| `show_checkout_form` | `checkout_form` |
| `show_order_status` | `order_status` |
| `add_to_cart_action` | Updates cart (no widget) |
| `remove_from_cart_action` | Updates cart |
| `clear_cart_action` | Empties cart |

Declarations: `lib/agent/tool-declarations.ts`  
Execution: `lib/agent/tool-executor.ts`

---

## 5. Client features (spec)

### Chat

- Persist history on change; strip attachment binary on save
- **New chat** — clear storage, reset welcome message (`createWelcomeMessage`)
- Auto-scroll to bottom only when user is near bottom (~80px threshold)
- **Scroll-to-bottom** floating button when scrolled up
- Typing indicator while `isPending`
- UUID-based message IDs (no counter collisions on reload)

### Composer

- Text + attachments + voice
- Attachments: max 5 files, 5 MB each, 12 MB total
- Allowed MIME: JPEG, PNG, WebP, GIF, PDF, txt, DOC/DOCX
- Client validation: `lib/attachments.ts` · Server: `lib/attachment-validation.ts`

### Basket

- Add / remove / quantity stepper
- **Clear basket** action
- Checkout sends chat message to agent to start order flow
- Subtotal formatted LKR (`lib/format.ts`)

### Discover

- Search input (Enter submits prompt to chat)
- Quick prompt chips
- Welcome block with agent avatar

### Layout

- **AppHeader** — primary Kapruka bar all breakpoints
- **MobileTabBar** — Search | Agent (FAB) | Basket
- Links to kapruka.com on brand elements

---

## 6. Image CDN allowlist

Configured in `next.config.ts` → `images.remotePatterns`:

- `**.kapruka.com` (e.g. `static2.kapruka.com`, `partnercentral.kapruka.com`)
- `kapruka.com`
- `cdn.shopify.com` (some catalog images)
- `picsum.photos` (dev placeholder)

Untrusted URL patterns filtered in `lib/kapruka-product-image.ts`; missing images fall back to `/product-placeholder.svg`.

---

## 7. Environment

| Variable | Scope | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | Server | Required for `/api/chat` |
| `NEXT_PUBLIC_APP_URL` | Client + metadata | Canonical app URL — `https://agent-kapruka.vercel.app` |

---

## 8. Security

- API keys never exposed to browser
- Attachment MIME allowlist + size caps (client + server)
- HTTP security headers on all routes (`next.config.ts`)
- `Permissions-Policy`: microphone `(self)` for voice input
- Markdown links to external hosts restricted in `MarkdownContent` (Kapruka domains preferred)

---

## 9. Deployment

- **Target:** Vercel (recommended) or any Node 20+ host
- **Build:** `next build` · **Start:** `next start`
- **PWA:** `app/manifest.json` — installable shell, no service worker

---

## 10. Related documents

- [README.md](./README.md) — user-facing overview and setup
- [design.md](./design.md) — visual and interaction system
- [.env.example](./.env.example) — environment template
