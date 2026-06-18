# Design — Kapruka Agent

A locked design system for the Kapruka AI shopping assistant. Every page reads this file before emitting code.

## Genre

modern-minimal (retail app · warm Sri Lankan e-commerce)

## Macrostructure family

- App pages: **Workbench** — three-column chat console (Discover · Agent · Basket)
- Mobile: single active panel + bottom tab bar (Search · Agent · Basket); Agent tab is elevated center FAB
- **Primary header** (Congress Blue bar): Kapruka wordmark + Agent avatar + “Agent.” — visible on **all** breakpoints and tabs

## Theme

- `--color-primary`   oklch(31% 0.14 285) — Congress Blue #422B73
- `--color-accent`    oklch(88% 0.17 95)  — Kapruka Yellow #FACE15
- `--color-paper`     oklch(98% 0.008 285) — warm off-white
- `--color-ink`       oklch(18% 0.04 285) — deep purple-black

## Typography

- Display + Body: **DM Sans** (`next/font`), weights 400–700
- Mono: system mono for order refs and checkout IDs
- Agent replies: Markdown via Streamdown (prose in chat bubbles — headings, lists, links)

## Spacing

4-point named scale in `tokens.css`.

## Motion

- Library: **Motion** (`motion/react`)
- Easings: `--ease-out` for entrances, `--ease-in-out` for tabs
- Reveal: fade + 8px translate, ~280ms
- Cart rows: layout animations on add/remove/qty change
- Message bubbles + widget cards: staggered entrance
- Carousel cards: horizontal snap scroll + scroll hint chevron
- Reduced-motion: opacity-only ≤150ms; `useReducedMotion()` hook gates transforms

## Microinteractions

- Silent success in chat (no toasts for add-to-cart)
- Button active: `scale(0.97–0.98)`
- Tab switch: crossfade 200ms
- **New chat**: pencil icon button, top-right of chat toolbar (36×36, bordered)
- **Scroll to latest**: floating circular chevron, centered above composer; fades when at bottom
- Composer: pill-shaped input bar; attach, mic, send as circular icon buttons

## CTA voice

- Primary: Congress Blue fill, pill radius, white text
- Accent CTA: Kapruka Yellow fill, dark ink text (checkout pay button)
- Secondary: outline on `--color-rule-strong`
- Destructive subtle: “Clear basket” — muted text, error color on hover

## Brand assets

- Agent avatar: `/kapruka-avatar.png` — chat bubbles, header, PWA icons, welcome hero
- Logo square: `/logo-square.jpeg` — header wordmark (links to kapruka.com)
- Logo wide: `/logo-wide.jpeg`
- App icon: `app/icon.png` (from avatar)
- Apple icon: `app/apple-icon.png`
- Favicon: `app/favicon.ico` (16 / 32 / 48 from `icon.png`)

All “Kapruka” text and logo taps link to **https://www.kapruka.com** (`KaprukaLink` / `KaprukaText`).

## Layout regions

| Region | Desktop | Mobile |
|--------|---------|--------|
| Header | Full width, logo + Agent | Same — unified primary bar |
| Discover | Left sidebar (320px) | Full-screen tab |
| Chat | Center flex | Full-screen tab + composer + tab bar inset |
| Basket | Right sidebar (384px) | Full-screen tab |

Safe areas: header `pt-[env(safe-area-inset-top)]`; mobile tab bar `pb-[env(safe-area-inset-bottom)]`.

## Chat widgets (in-message UI)

| Widget | Pattern |
|--------|---------|
| Product carousel | Horizontal snap scroll; price in LKR; **Load more** pill when paginated |
| Product detail | Portrait thumb + CTA row (Add to Basket / View Product) |
| Delivery quote | Truck icon card — city, date, cost |
| Checkout form | Congress Blue summary card + yellow Secure Checkout link |
| Order status | Timeline / status badge |

Product images: `ProductImage` wrapper → `next/image`, placeholder on error.

## PWA

- `display: standalone` — no service worker, no offline cache
- `theme_color`: #422B73 · `background_color`: #F8F6FC
- Icons: `/kapruka-avatar.png`

## What pages MUST share

- Kapruka wordmark + Agent identity in primary header
- Congress Blue primary + Yellow accent (≤8% yellow per viewport)
- DM Sans type stack
- Pill-shaped CTAs and circular icon buttons in chat chrome
- No currency selector — LKR only
