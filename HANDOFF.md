# OTODOR — Session Handoff

Evolving the **Viltrumate** Shopify theme (Dawn-based) into the official **OTODOR** premium
security-technology brand and a **reusable commerce framework**. The current phase of work has shifted from
"premium homepage" to **building the OTODOR commerce design system** — reusable, data-driven sections that
every product category inherits with configuration only.

- **Theme root:** `otodor-shopify/`
- **Store:** `ttna2m-mh.myshopify.com` (Shopify CLI 4.5.2, authenticated)
- **Working branch:** `master`
- **Dev server (run it yourself):** `shopify theme dev --path otodor-shopify --store ttna2m-mh.myshopify.com` → http://127.0.0.1:9292 (the storefront is password-protected, so this needs an interactive terminal / `--store-password`; it cannot run headless in the agent sandbox).
- **Design system:** `assets/otodor-base.css` (tokens + components). All work uses these CSS variables.
- **Fonts:** **Hanken Grotesk** (self-hosted `assets/hankengrotesk-*.woff2`, a BR Sonoma stand-in — one token `--otodor-font-display` swaps it) + **Inter** (body).
- **Colors:** blue accent `#4DA6FF` (dark) / `#1A78D8` (on light), near-black `#0B0B0B`, warm off-white `#F7F6F3`. **Champagne-gold pivot is deferred** (user chose to keep blue for now; the PDF ultimately wants gold).

## Governing direction (from the user — do not violate)
1. **Evolve, don't rewrite.** Repo must stay recognizably Viltrumate. Improve-before-replace; reuse existing sections; new components only when nothing fits.
2. **Native Shopify first.** Data priority: products → collections → pages → blogs → navigation → recommendations → Search & Discovery → metafields → section blocks. **Metaobjects only when shared across many places / relational — always optional, never required.**
3. **Reusable framework, not pages.** Every section must be generic (works for Digital Locks, Gate Automation, Security, Smart Home…), **data-driven with graceful fallback**, and **auto-hide when it has no data** (no broken placeholders). Every reusable section carries an **in-file documentation block** (Purpose/Inputs/Outputs/Dependencies/Reusable-for/Merchant-editable/Required+Optional metafields).
4. **Use the official logo assets** at repo root (`Logo main.png`, `brand-logo.png`, `Logo Icon.png`, `favicon.png`). Don't recreate the mark by hand.
5. **Workflow:** Architecture/audit → implement → self-review → **commit per step** (small reviewable increments).

## Brand rhythm (still applies)
Light/dark alternate — never predominantly one. Commerce pages are light-first (warm off-white, white cards) with dark header/footer/CTA anchors. `body.otodor-light-page` (set in `theme.liquid` for collection/product/search) recolors Dawn tokens.

---

## Reference docs (read these first)
- `OTODOR-AUDIT.md` — Brand-PDF audit + phase plan.
- `OTODOR-COMMERCE-ARCHITECTURE.md` — Digital Locks section map + reuse audit.
- `OTODOR-DATA-MODEL.md` — product/collection metafields, metaobjects, Search/Nav/Recommendations, the section doc-block standard.
- `OTODOR-COLLECTION-TEMPLATE.md` — the generic collection framework API (per-section priority/fallback/hide).
- `OTODOR-PRODUCT-MODULES.md` — product Information Modules audit + data contracts.
- `OTODOR-MODULE-CONTRACT.md` — the standard every Information Module implements (interface + lifecycle + checklist).
- `OTODOR-FRAMEWORK-INVENTORY.md` — canonical register of every reusable module built so far.

The Brand PDF itself (`OTODOR_20260721_114022_0000.pdf`, 21 pages) is the source of truth for branding, messaging, product hierarchy, specs, warranty (3-yr lock / 1-yr battery), the 85 mm install clearance, and the Anti-"Little Black Box" EMI security story.

---

## Work done this session (committed on `master`)
| Commit | What |
|---|---|
| `4ceccba` | **Phase 0 — brand foundation:** self-hosted Hanken Grotesk display face (replaces Space Grotesk, one token); warranty corrected to 3-yr lock / 1-yr battery sitewide; transparent monogram assets derived from official `favicon.png` (`otodor-monogram.png` / `-dark.png`) + `snippets/otodor-monogram.liquid`; footer "Secure Smart Automatic" tagline lockup + mark. |
| `8876ae6` | **Phase 1 — homepage credibility:** "Why" gains German-engineering + 16-yr NavKar heritage lines; unverifiable "Rated 4.9 by 500+ Homes" → "Trusted by 10,000+ Homes". |
| `1b6a53f` | **Phase 2 — premium mega menu (native):** desktop nav `dropdown→mega`; `header-mega-menu.liquid` premium 3-level layout (category columns w/ icon+description from linked collection, sub-links, product thumbnails, "Get a Custom Quote" CTA); `otodor-mega-menu.css`; header CTA settings. Data stays in Navigation. |
| `108b091` `6288322` | **Phase 3 architecture + data model** docs. |
| `e1cf8ab` | **STEP 2 — `otodor-category-selector.liquid`** (Door Type Selector): reference reusable section, collection-driven, zero metaobjects, override→fallback chain, light/dark, accessible, preset renders immediately, in-file doc block. |
| `22e6312` | **STEP 3a — lifecycle guards** (`otodor-category-selector`, `otodor-features`, `otodor-why` auto-hide when empty) + collection template API doc. |
| `e300bfa` | **STEP 3b — collection framework:** generic `templates/collection.json` (hero→selector→grid→features→why, empty slots auto-hide) + `templates/collection.digital-locks.json` instance (config-only, PDF data). |
| `e72dc8b` | **STEP 4a — product Information Modules** audit + data contracts doc. |
| STEP 4b-0 | **Module contract** (`OTODOR-MODULE-CONTRACT.md`): the standard every module implements — 10-field interface, 5-step lifecycle (read→override→validate→render→hide), canonical Liquid skeleton, orchestrator assembly rule, conformance checklist. |
| STEP 4b-1…4 | **3 new modules** (`otodor-product-downloads`, `-warranty`, `-compat`) each metafield-primary → block fallback → auto-hide, w/ doc block + preset; **85 mm clearance** added to `otodor-product-install`; **`product.json` assembled** as orchestrator. |
| STEP 4.5 | **Framework inventory** (`OTODOR-FRAMEWORK-INVENTORY.md`): canonical register of every reusable module (data sources / fallback / visibility / reusable-in / deps / status). |
| STEP 5 | **Specification Rendering Engine** (`OTODOR-SPEC-ENGINE.md`): `otodor-spec-registry` (single source of truth, 20 specs, 10-col records, optional `comparison_spec` metaobject overlay) + `otodor-spec-value` (value resolver + 10 type renderers). `otodor-comparison` **rewritten as a pure consumer** (products × registry, no hardcoded spec names; resolves blocks → collection → current collection → PDP siblings; empty rows/groups drop; hides < 2 products). Wired into product page + digital-locks collection. Shared `.otodor-spec__*` CSS in `otodor-base.css`. |

**Homepage order** (`index.json`) unchanged: `otodor_hero → otodor_categories → otodor_moments → otodor_trust_bar → otodor_features → otodor_why → otodor_testimonials → otodor_process → otodor_ecosystem → otodor_cta_banner`.

**Product page** (`product.json`) current (STEP 4b orchestrator): `main-product → otodor-product-reveal → otodor-product-specs → otodor-product-compat → otodor-product-install → otodor-product-warranty → otodor-product-downloads → otodor-comparison → related-products → otodor-sticky-atc`. Every module auto-hides on no data.

---

## ⚠️ Next steps

### ✅ Done — STEP 4b + 4.5 + STEP 5 (Spec Rendering Engine)
Module contract + Downloads/Warranty/Compatibility modules + 85 mm clearance + orchestrator + framework inventory (4b/4.5). **STEP 5:** the Specification Rendering Engine (`otodor-spec-registry` + `otodor-spec-value`) and `otodor-comparison` rewritten as its consumer, wired into product + digital-locks collection. `shopify theme check` clean vs. baseline (5 pre-existing errors, none from this work).
- **Note:** the comparison reads `specs.*` product metafields; until those are defined/populated in admin, only the `warranty` row (which has a registry default) renders — it fills out as spec metafields are added. Add a spec = one registry record; add a renderer type = one `when` in `otodor-spec-value`.

### Remaining roadmap
- **STEP 6** — FAQ + FAQPage/Product/Breadcrumb JSON-LD.
- **STEP 7** — Buying guide (pages/articles first). **STEP 8** — Lead capture / AI advisor. **STEP 9** — SEO expansion.

### Admin setup the merchant must do (theme degrades gracefully until done)
- **Navigation:** build the nested 3-level `main-menu` (Products → Digital Locks → Wooden/Glass/…; see Phase 2 report) so the mega menu shows the hierarchy.
- **Assign** the `digital-locks` **collection → theme template `digital-locks`**. Optionally create sub-collections `wooden-door-locks`/`glass-door-locks`/`metal-gate-locks`/`smart-padlocks` (selector falls back gracefully if absent).
- **Custom data:** define product metafields (`specs.*`, `custom.specs`, `custom.access_methods`, `custom.documents`, `custom.door_compatibility`, `custom.positioning_line`) + collection metafields (`custom.menu_icon/description/image`, `hero_*`, `faqs`, `seo_content`); optional metaobjects only if reused (see data model). Flag comparable ones for Search & Discovery filters.

### Content (owner: user — blocks real impact)
- **Real product prices** — WINDSOR/VAULTEX/FREDDY are ₹0 (card guard shows "Contact for pricing").
- **Photography / high-res flagship renders** (ONYX/SENTRY/NEXUS/ZION+/ZEAL/OHM); product descriptions are near-empty.

### Deferred (perf/a11y)
- Sections inline full CSS/JS; GSAP loads per page from CDN. Verify gold/blue contrast (WCAG AA); JSON-LD once prices are real.

---

## Verification method (important)
The agent sandbox **cannot run a headless preview** (storefront password + non-interactive). Validation here uses **`shopify theme check`** (currently 5 pre-existing errors / 18 warnings — footer logo `img` dims + translation keys; none from this session's work). **The user QAs visually on their own `shopify theme dev` at :9292.** Pinned scroll-tours (Moments) and scroll-drawn lines need a real browser.

## User preferences observed
- Premium storytelling over transactional ecommerce energy. **Dislikes:** feature-card grids, icons-as-decoration, bento layouts for credibility content, cyberpunk/HUD/neon. **Likes:** large type, restraint, real photography, editorial rows, Apple/Tesla/B&O references.
- Thinks system-by-system (architecture before code); reviews each step; wants high-impact work, not isolated polish.
