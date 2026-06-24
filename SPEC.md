# Technical Specification — Kapruka Agent

Version aligned with Kapruka Agent Challenge 2026 deliverable.

---

## 1. System overview

Kapruka Agent is a **single-page Next.js application** with no custom backend database. State splits between:

| State | Storage | Key / location |
|-------|---------|----------------|
| Shopping basket | `localStorage` | `kapruka_agent_cart` (via `lib/cart-storage.ts`) |
| Chat history | `localStorage` | `kapruka_agent_chat_history` (max 80 messages) |
| Memory user id | `localStorage` | `kapruka_agent_memory_user_id` — anonymous Supermemory container tag |
| Remember-delivery dismissals | `localStorage` | Per order number via `lib/remember-delivery-storage.ts` |
| Welcome modal dismissed | `localStorage` | `kapruka-agent-welcome-dismissed` |
| Saved info (cloud) | Supermemory | Scoped by memory user id when `SUPERMEMORY_API_KEY` is set |
| Session / AI | Stateless | Each `POST /api/chat` sends full history + cart + optional `memoryUserId` |

Server responsibilities: Gemini orchestration, Kapruka MCP proxy, Supermemory proxy (`/api/memory`), attachment validation.

---

## 2. Technology stack

### Core

- **Next.js 15.4+** — App Router, Server Components where applicable, Route Handlers for API
- **React 19** — Client components for chat, cart, interactions
- **TypeScript 5.9** — Strict mode

### AI & integrations

- **`@google/genai`** — Gemini text agent (AI SDK `ToolLoopAgent`) and **Gemini Live** (ephemeral tokens + WebSocket)
- **`@modelcontextprotocol/sdk`** — `StreamableHTTPClientTransport` → `https://mcp.kapruka.com/mcp`
- **`@supermemory/tools`** — optional `searchMemories`, `addMemory`, `getProfile`, `memoryForget` when `SUPERMEMORY_API_KEY` is set
- **Agent model** — Configured in `constants/agent.ts` (`GEMINI_MODEL`, `MAX_AGENT_TURNS`, temperature)

### UI & content

- **Tailwind CSS 4** + `@tailwindcss/typography` — utility styling, prose for markdown
- **Streamdown** — `MarkdownContent` renders assistant messages
- **Motion 12** — layout and entrance animations
- **Lucide React** — icons
- **next/image** — optimized product images (remote CDN allowlist in `next.config.ts`)

### Browser APIs

- **Gemini Live (WebSocket + Web Audio)** — real-time two-way voice (`hooks/use-gemini-live.ts`, `lib/live/audio-utils.ts`); mic capture as PCM, playback of model audio
- **Web Speech API** — dictation fallback in composer when live voice is unavailable (`hooks/use-speech-recognition.ts`)
- **localStorage** — cart + chat persistence (includes live transcript messages)
- **FileReader** — attachment encoding to base64 for chat API

---

## 3. API routes

### `POST /api/chat`

**Request body:**

```json
{
  "messages": [{ "role": "user" | "assistant", "content": "string", "attachments?": [...] }],
  "cart": [{ "product_id", "name", "price", "quantity", ... }],
  "memoryUserId?": "string — anonymous browser id for Supermemory scoping"
}
```

**Response:** streaming UI message protocol via `createAgentUIStreamResponse` (AI SDK). Final message metadata may include updated `cart` and `openBasket` flag.

**Server behavior:**

1. Validate JSON, messages array, cart array
2. Validate attachments per message (`lib/validate-ui-attachments.ts`)
3. Create `ToolLoopAgent` via `createKaprukaAgent(cartRef, uiFlagsRef, memoryUserId)` — injects cart + datetime context; attaches Supermemory tools and `MEMORY_INSTRUCTION` when memory is enabled
4. Stream assistant text and widget tool results to the client

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

### `GET /api/memory?memoryUserId=…`

Returns a **Saved info snapshot** for the anonymous browser user:

```json
{
  "enabled": true,
  "available": true,
  "people": [{ "id": "string", "text": "string" }],
  "addresses": [],
  "preferences": [],
  "language": [],
  "other": []
}
```

When `memoryUserId` is missing or Supermemory is unavailable, returns `available: false` with empty groups — client shows a friendly fallback; shopping is not blocked.

### `POST /api/memory`

Body: `{ "memoryUserId": "string", "memory": "string" }` — adds one memory fact (e.g. post-checkout delivery save from `RememberDeliveryChip`).

### `DELETE /api/memory`

Body: `{ "memoryUserId": "string", "id?": "string", "text?": "string", "clearAll?": true }` — remove one item or wipe all saved info for the user id.

Implementation: `lib/supermemory/service.ts` · categorization: `lib/supermemory/categorize.ts`

### `POST /api/live/token`

Issues a short-lived **Gemini Live ephemeral token** and returns session metadata for the client WebSocket.

**Request body (optional):**

```json
{
  "liveSessionId?": "string — reuse for tool bridge continuity",
  "memoryUserId?": "string"
}
```

**Response:**

```json
{
  "token": "string",
  "liveSessionId": "string",
  "model": "gemini-3.1-flash-live-preview",
  "expiresAt": "ISO8601"
}
```

Server embeds Kapruka Agent system instruction (cart context, memory, datetime) in the locked token config.

**Runtime:** `nodejs`

### `POST /api/live/tools`

Executes Kapruka MCP and virtual UI tools on behalf of the Live session (same executor as text chat).

**Request body:**

```json
{
  "liveSessionId": "string",
  "toolName": "string",
  "args": { },
  "cart": [ /* CartItem[] */ ]
}
```

**Response:**

```json
{
  "result": "string",
  "uiEvents?": [ /* widget payloads */ ],
  "cart?": [ /* updated cart */ ],
  "openBasket?": boolean
}
```

Tool session state keyed by `liveSessionId` (`lib/agent/tool-session-store.ts`).

### `POST /api/live/session`

Optional session lifecycle helpers (resumption handle storage, cleanup).

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

Declarations: `lib/tools/kapruka-tools.ts`  
Execution: AI SDK tool handlers inside `createKaprukaTools`

### Supermemory tools (optional — when `SUPERMEMORY_API_KEY` + `memoryUserId`)

Provided by `@supermemory/tools/ai-sdk`, scoped with `containerTags: [memoryUserId]`:

| Tool | Purpose |
|------|---------|
| `searchMemories` | Recall saved delivery, recipients, language, preferences |
| `addMemory` | Store a new fact (Agent or client-initiated) |
| `getProfile` | Static + dynamic profile strings for returning customers |
| `memoryForget` | Remove a saved fact when customer asks |

Agent behavior governed by `lib/agent/memory-instruction.ts`. Memory failures must not block search, checkout, or replies.

---

## 5. Client features (spec)

### Onboarding

- **Welcome modal** — first visit only (`constants/welcome.ts`, `hooks/use-welcome-modal.ts`); explains capabilities, saved info, and privacy note
- Dismiss stored in `kapruka-agent-welcome-dismissed`

### Saved info

- **Header button** — person icon opens `SavedInfoPanel`
- Sections: people you shop for, delivery addresses, language, shopping preferences, other
- Per-item remove + **Clear everything about me** with confirmation
- **Remember delivery chip** — on checkout widget after order creation; **Yes, save it** / **Not now**; dismiss persisted per order number
- Client hook: `hooks/use-saved-info.ts` · API client: `lib/memory-api.ts`

### Chat

- Persist history on change; strip attachment binary on save
- **New chat** — clear storage, reset welcome message (`createWelcomeMessage`)
- Auto-scroll to bottom only when user is near bottom (~80px threshold)
- **Scroll-to-bottom** floating button when scrolled up
- Typing indicator while `isPending`
- UUID-based message IDs (no counter collisions on reload)

### Composer

- Text + attachments + **live voice** (primary) + dictation fallback
- **Live voice mode** — tap mic → `POST /api/live/token` → WebSocket to Gemini Live; `LiveVoiceBar` shows connection state; user can type during live session
- Tool calls from Live routed to `POST /api/live/tools`; widget `uiEvents` and transcripts bridged into `KaprukaAgentUIMessage` list (`lib/live/live-message-bridge.ts`)
- Attachments: max 5 files, 5 MB each, 12 MB total
- Allowed MIME: JPEG, PNG, WebP, GIF, PDF, txt, DOC/DOCX
- Client validation: `lib/attachments.ts` · Server: `lib/attachment-validation.ts`

### Basket

- Add / remove / quantity stepper
- **Clear basket** action
- Checkout sends chat message to agent to start order flow
- Subtotal formatted LKR (`lib/format.ts`)

### Discover / chat home

- **Chat home screen** — agent avatar, greeting, **live voice callout**, suggestion chips (`ChatHomeScreen`)
- Quick prompt chips including **Talk live**, categories, track order, saved details
- Welcome block with agent avatar

### Layout

- **AppHeader** — Kapruka wordmark + Agent identity; **New chat**, **Basket** (badge), **Saved info** icon buttons
- **CartPanel** — right sidebar / overlay on mobile
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
| `GEMINI_API_KEY` | Server | Required for `/api/chat` and `/api/live/*` |
| `SUPERMEMORY_API_KEY` | Server | Optional — enables saved info and agent memory tools |
| `NEXT_PUBLIC_APP_URL` | Client + metadata | Canonical app URL — `https://agent-kapruka.vercel.app` |

---

## 8. Security

- API keys never exposed to browser
- Saved info scoped to anonymous browser id — no Kapruka login; user can clear from UI
- Agent instructed never to store payment card data or pay links in memory
- Attachment MIME allowlist + size caps (client + server)
- HTTP security headers on all routes (`next.config.ts`)
- `Permissions-Policy`: microphone `(self)` for live voice and dictation
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
