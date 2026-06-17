# Kapruka Agent

**Meet Agent — your AI shopping concierge for Kapruka.**

Kapruka Agent is a friendly web assistant that helps you find gifts, cakes, flowers, and more from Kapruka’s live catalog. Ask questions in plain English (or Sinhala/Tanglish), browse products, manage your basket, check delivery to any Sri Lankan city, and checkout — all in one place.

---

## What You Can Do

| Feature | Description |
|---------|-------------|
| **Search & discover** | Find products by keyword, category, or occasion |
| **Product details** | View prices, images, and availability on rich cards |
| **Delivery quotes** | Check whether an item can reach a city and on what date |
| **Shopping basket** | Add, remove, and adjust quantities — saved in your browser |
| **Guest checkout** | Get a secure Kapruka payment link when you are ready to buy |
| **Order tracking** | Ask Agent to look up an existing order |

---

## Using the App (No Setup Required)

If someone has already deployed the app for you, simply open the link in your browser.

1. **Chat with Agent** — Type what you are looking for (e.g. *“Show me birthday cakes for Colombo”*).
2. **Browse results** — Product cards appear in the chat. Tap **+** to add items to your basket.
3. **Check your basket** — On mobile, use the **Basket** tab at the bottom. On desktop, use the panel on the right.
4. **Checkout** — Tap **Checkout** in the basket and follow Agent’s prompts to complete payment on Kapruka.

**Tips**

- Use the **Search** tab for quick prompts like “Fresh Flowers” or “Track Order”.
- Your basket is saved locally in your browser — it persists if you refresh the page.
- Agent defaults to English and adapts to the language you write in (English, Sinhala, Tamil, or Tanglish).

---

## Running Locally (Developers)

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and add your API key
cp .env.example .env.local

# 3. Edit .env.local — set GEMINI_API_KEY at minimum

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Powers Agent via Google Gemini |
| `NEXT_PUBLIC_APP_URL` | Production | Public URL for social previews & sitemap (e.g. `https://agent.kapruka.com`) |

See [`.env.example`](.env.example) for a full template.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run clean` | Clear Next.js cache |

---

## Deploying to Production

Kapruka Agent is built with [Next.js 15](https://nextjs.org/) and deploys cleanly to [Vercel](https://vercel.com/) or any Node.js host.

### Vercel (recommended)

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add environment variables:
   - `GEMINI_API_KEY` — your Gemini API key
   - `NEXT_PUBLIC_APP_URL` — your production domain (e.g. `https://agent.kapruka.com`)
4. Deploy. Vercel runs `npm run build` automatically.

### Self-hosted

```bash
npm run build
npm run start
```

Set `GEMINI_API_KEY` and `NEXT_PUBLIC_APP_URL` in your host’s environment panel.

---

## How It Works (Overview)

```
You  →  Chat UI  →  /api/chat  →  Gemini AI  →  Kapruka MCP (live catalog)
                      ↕
                 Local basket (browser storage)
```

- **Frontend** — React single-page app with three panels: Discover, Chat, and Basket.
- **AI layer** — Google Gemini orchestrates tool calls to search products, check delivery, and manage the cart.
- **Kapruka MCP** — Connects to Kapruka’s live retail API for real product data, prices, and checkout links.

---

## Project Structure

```
app/                  Next.js routes (page, API, metadata, OG image)
components/           UI — chat, cart, discover, widgets, layout
constants/            Brand, prompts, agent config
hooks/                React hooks (use-chat)
lib/                  Agent logic, cart, formatting, Kapruka MCP client
types/                Shared TypeScript types
public/               Static assets (logo, icons)
```

---

## Privacy & Security

- Product searches go through Kapruka’s official MCP service.
- Your basket is stored in **local browser storage** — not on a server unless you checkout.
- API keys (`GEMINI_API_KEY`) are **server-side only** and never exposed to the browser.
- The chat API route validates requests and returns user-friendly error messages.

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| “Shopping assistant is temporarily unavailable” | Check that `GEMINI_API_KEY` is set and valid |
| Products not loading | Verify network access to `mcp.kapruka.com` |
| Basket empty after refresh | Ensure browser local storage is not blocked |
| Social preview wrong URL | Set `NEXT_PUBLIC_APP_URL` to your production domain |

---

## License

Private — Kapruka Agent Challenge 2026.

Built for **Kapruka** · Sri Lanka’s premier online gift & delivery platform.
