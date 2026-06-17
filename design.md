# Design — Kapruka Agent

A locked design system for the Kapruka AI shopping assistant. Every page reads this file before emitting code.

## Genre
modern-minimal (retail app · warm Sri Lankan e-commerce)

## Macrostructure family
- App pages: **Workbench** — three-column chat console (Discover · Ayla · Basket)

## Theme
- `--color-primary`   oklch(31% 0.14 285) — Congress Blue #422B73
- `--color-accent`    oklch(88% 0.17 95)  — Kapruka Yellow #FACE15
- `--color-paper`     oklch(98% 0.008 285) — warm off-white
- `--color-ink`       oklch(18% 0.04 285) — deep purple-black

## Typography
- Display + Body: **DM Sans** (next/font), weights 400–700
- Mono: system mono for order refs

## Spacing
4-point named scale in `tokens.css`.

## Motion
- Easings: `--ease-out` for entrances, `--ease-in-out` for tabs
- Reveal: fade + 8px translate, 280ms
- Reduced-motion: opacity-only ≤150ms

## Microinteractions
- Silent success in chat (no toasts)
- Button active: scale(0.97)
- Tab switch: crossfade 200ms

## CTA voice
- Primary: Congress Blue fill, pill radius, white text
- Accent CTA: Kapruka Yellow fill, dark ink text
- Secondary: outline on `--color-rule-strong`

## Brand assets
- Logo square: `/logo-square.jpeg`
- Logo wide: `/logo-wide.jpeg`
- App icon: `/icon.png` (Congress Blue + yellow smile arc)
- Favicon: `/favicon.ico`

## PWA
- `display: standalone` — no service worker, no caching
- `theme_color` / `background_color`: #422B73

## What pages MUST share
- Kapruka wordmark in header
- Congress Blue primary + Yellow accent (≤8% yellow per viewport)
- DM Sans type stack
- Pill-shaped CTAs
