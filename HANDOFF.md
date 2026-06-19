# OTODOR — Session Handoff

Premium brand transformation of the OTODOR Shopify theme (Dawn-based). The goal across this work: make the **entire commerce experience feel like a premium security-technology brand** (Apple / Tesla / Bang & Olufsen energy), not an upgraded Shopify store. The homepage was already strong; the work extended that brand into collection, product, and search pages and rebuilt the homepage narrative.

- **Theme root:** `otodor-shopify/`
- **Working branch:** `fix/header-nav-footer-polish`
- **Dev server:** `shopify theme dev --path otodor-shopify --store ttna2m-mh.myshopify.com` → http://127.0.0.1:9292
- **Design system:** `otodor-shopify/assets/otodor-base.css` (tokens + components). All brand work uses these CSS variables — no new colors/fonts.
- **Fonts:** Space Grotesk (display) / Inter (body). **Colors:** blue accent `#4DA6FF` (dark) / `#1A78D8` (on light), near-black `#0B0B0B`, warm off-white `#F7F6F3`.

## Brand rhythm (non-negotiable direction from the user)
Light/dark must alternate — never predominantly one:
`Dark hero → light trust/discovery → light lifestyle/commerce → dark premium CTA → dark footer.`
Commerce pages are **light-first** (warm off-white, white cards, neutral plinth product shots) with dark header/footer/CTA anchors.

The `.otodor-light` scope and `body.otodor-light-page` class (in `otodor-base.css`) recolor Dawn tokens automatically. `theme.liquid:327` adds `otodor-light-page` to `<body>` for `collection`, `product`, and `search` templates.

---

## What was done this session

### 1. Header / footer polish (earlier)
- Footer logo filename typo fixed (`otodot_` → `otodor_log_bg_removed.png`).
- Header made full-bleed on desktop (logo flush left), nav forced to one line (`flex-wrap: nowrap`), logo hover-drop fixed (preserve `translateY(-50%)` in the hover transform). See `sections/header.liquid` inline `<style>`.
- Footer credit line → "Powered by Viltrumate Technologies" (always renders, link optional). `sections/otodor-footer.liquid` + `sections/footer-group.json`.

### 2. Commerce foundation
- **`otodor-base.css` section 16 "COMMERCE COMPONENTS"** (appended at end): `.otodor-pcard` (product card), `.otodor-rail` (category pills), `.otodor-brand-moment`, `.otodor-ledger` (spec rows), `.otodor-trust-row`, `.otodor-sticky-atc`. Plus a rule making `.otodor-comparison` dark when on a light commerce page.
- **`snippets/otodor-card-product.liquid`** — technology-first card: product on plinth, name, access-methods line, price. **Zero-price guard:** `product.price == 0` → "Contact for pricing" (WINDSOR/VAULTEX/FREDDY are ₹0 in the live store). Access line source: metafield `custom.access_methods` → fallback `product.type`.

### 3. Collection page → `templates/collection.json`
- **`sections/otodor-collection-hero.liquid`** — short dark hero (collection name, positioning line from collection description, product count) + light **brand-moment** band ("Security designed around how people actually live.").
- **`sections/otodor-collection-grid.liquid`** — category rail (pills wired to real collections: `door-locks`, `gate-locks`, `sliding-gate-motors`, `security-system`, `accessories`), 3-col grid using the new card, sort, pagination, dark consult CTA (WhatsApp).

### 4. Product page (mini flagship landing page) → `templates/product.json`
Storytelling flow, top to bottom:
1. **Buy module** (`main-product`, light-scoped) — block order: title, positioning (custom_liquid metafield `custom.positioning_line`), price, access_chips (custom_liquid metafield `custom.access_methods`, `·`-split), variant_picker, quantity, buy_buttons, **trust_row** (custom_liquid inline SVGs), description. `image_zoom` changed `lightbox`→`hover`.
2. **`sections/otodor-product-reveal.liquid`** — large render + one statement (metafield `custom.reveal_statement` / `custom.reveal_image`).
3. **`sections/otodor-product-benefits.liquid`** — editorial alternating image/statement rows (blocks; no cards/icons).
4. **`sections/otodor-product-specs.liquid`** — spec ledger from metafield `custom.specs` (JSON: groups→rows) with manual block fallback.
5. **`sections/otodor-product-lifestyle.liquid`** — one full-bleed image + one line (metafields `custom.lifestyle_image` / `custom.lifestyle_line`).
6. **`sections/otodor-product-install.liquid`** — compatibility trust section (see #8 below, recently enlarged).
7. **`otodor-comparison`** (existing section, now deployed) — dark closing band.
8. **`sections/otodor-sticky-atc.liquid`** — slim bottom bar, appears after buy module scrolls out (IntersectionObserver), clicks the real Dawn submit button so cart logic is untouched. Zero-price → "Enquire" WhatsApp link.

### 5. Search → `templates/search.json`
- **`sections/otodor-search.liquid`** — dark search hero + light results (products as brand cards, articles/pages as quiet list rows). `theme.liquid` body class extended to `search`.

### 6. Homepage narrative → `templates/index.json`
User's required story order: **Discover → Imagine → Trust → Understand installation → See ecosystem → Act.**
- **`sections/otodor-moments.liquid`** (NEW, replaced `otodor-smart-living`) — editorial day-in-the-life: **Leave · Arrive · Welcome · Secure**, one word + one line each. **Now a pinned GSAP scroll-tour** (see #9).
- **`sections/otodor-why.liquid`** (NEW) — typographic credibility manifesto: "Installed. / Not delivered." etc. No cards/icons/bento.
- **`sections/otodor-process.liquid`** (REBUILT) — installation: compatibility promise leads, 4 vertical stages with photo slots + duration chips, scroll-drawn progress line, trust row.
- **`sections/otodor-ecosystem.liquid`** (NEW) — dark, elegant product-relationship diagram (Smart Lock → Access Control → Gate Automation → Mobile Control hub), thin scroll-drawn connector line + single light pulse. Explicitly NOT cyberpunk/HUD.

### 7. Flagship removal (most recent)
- `sections/otodor-flagship.liquid` **deleted**; removed from `index.json`.
- **Moments took the flagship's homepage slot AND its pinned scroll-tour mechanics** — on desktop (≥1024px) the section pins and scroll scrubs through opener → 4 moments crossfading (image zoom-out + word/line rise), with progress dots. Mobile/no-JS/reduced-motion = static stacked frames. All flagship stability guards carried over (scrollRestoration reset, ScrollTrigger teardown, `ignoreMobileResize`, refresh on load, rebuild on breakpoint change).

### 8. Install section enlarged (most recent)
`otodor-product-install.liquid` rebuilt from a thin strip into a full block: big promise (up to 3.4rem), eyebrow, estimate at reading size, **"Check my door" WhatsApp CTA** (pre-fills product name), 4 stages with ghosted numbers + descriptions + duration chips. Stages are now editable blocks with fallback defaults.

---

## Current homepage order (`index.json`)
```
otodor_hero → otodor_categories → otodor_moments → otodor_trust_bar →
otodor_features → otodor_why → otodor_testimonials → otodor_process →
otodor_ecosystem → otodor_cta_banner
```
(CTA banner flipped back to dark — `light_background: false` — to restore the dark tail.)

---

## Git state
Branch `fix/header-nav-footer-polish`. **Uncommitted** working-tree changes (this session's work is NOT committed yet):
- Modified: `assets/otodor-base.css`, `layout/theme.liquid`, `sections/otodor-process.liquid`, `templates/{collection,index,product,search}.json`
- Deleted: `sections/otodor-flagship.liquid`
- New (untracked): `sections/otodor-{collection-grid,collection-hero,ecosystem,moments,product-benefits,product-install,product-lifestyle,product-reveal,specs,search,sticky-atc,why}.liquid`, `snippets/otodor-card-product.liquid`

Note: earlier header/footer commits (`5de3ffd`) were already pushed to `origin/main` (repo `sambhav-007/agents-hero-composition-overhaul`). `gh` CLI is NOT installed locally and no GitHub token is in env — PRs must be created via web URL or after installing `gh`.

---

## ⚠️ Outstanding / next steps

### Content (owner: user — blocks real impact)
- **Real product prices** — WINDSOR/VAULTEX/FREDDY are ₹0 (guard shows "Contact for pricing" meanwhile).
- **Photography** — Moments (4 cinematic frames), installation stages (4 technician photos), product benefit rows, ecosystem node PNGs. All render gracefully without images but depend on them. All are theme-editor image pickers.
- **Product descriptions** are ~25–50 chars (essentially empty).

### Metafields to define in Shopify admin (sections degrade cleanly until set)
- `custom.access_methods` (single-line text, `·`-separated, e.g. "Fingerprint · PIN · App")
- `custom.positioning_line` (text)
- `custom.specs` (JSON: `{"Security": {"Unlock methods": "Fingerprint, PIN, App"}, ...}`)
- `custom.reveal_statement` (text), `custom.reveal_image` (file)
- `custom.lifestyle_line` (text), `custom.lifestyle_image` (file)

### Deferred (per user — after commerce/brand work)
- Performance: homepage HTML ~248KB (sections inline full CSS/JS); GSAP loads on every page from cdnjs; `otodor-lifestyle-placeholder.jpg` is 293KB.
- Accessibility/SEO: verify `--otodor-muted` (55% white) contrast; product JSON-LD price/availability once prices are real; alt text on product images.

---

## Verification method (important)
The user runs their own `shopify theme dev` on port **9292**, which **blocks the `preview_*` MCP screenshot tools** (port-in-use). Verify via `curl http://127.0.0.1:9292<path>` and grep the HTML for rendered classes / Liquid errors. Pages to smoke-test: `/`, `/collections/all`, `/collections/door-locks`, `/products/armour`, `/products/windsor` (zero-price), `/search?q=lock`, `/cart`. All returned 200 with 0 Liquid errors at last check.

The pinned scroll-tours (Moments) and scroll-drawn lines (install, ecosystem) need a **real browser** to feel right — worth a manual desktop scroll-through. Frame durations are tunable in the section `<script>` (`frameDur` in moments).

---

## User preferences observed
- Wants **premium storytelling over functional ecommerce energy**; reduce "transactional" feel.
- Strong dislikes: feature-card grids, icons-as-decoration, bento layouts for credibility/lifestyle content, cyberpunk/HUD/sci-fi/neon aesthetics.
- Likes: large typography, restraint, real photography, editorial alternating rows, Apple/Tesla/B&O references.
- Validates structure via wireframes before big builds; iterates with precise per-section direction.
