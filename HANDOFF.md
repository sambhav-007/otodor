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
- `OTODOR-HERO-MOTION.md` — hero monolith scroll redesign: motion diagnosis, choreography, binding motion standards, 4-phase plan.

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
| STEP 6 | **Structured Content & SEO Foundation** (`OTODOR-STRUCTURED-CONTENT.md`): centralized **Schema Registry** `otodor-schema.liquid` (dispatched: `graph` = Organization + WebSite + BreadcrumbList + CollectionPage + VideoObject as one `@graph`, gated by data; `faqpage` + `howto` builders). Rendered once in `theme.liquid` head; Org/WebSite **moved out of `header.liquid`** (de-dupe). `collapsible-content` extended (auto-hide + opt-in FAQPage). `otodor-product-install` opt-in HowTo (default off). Product/Offer/rating left to Shopify `structured_data` (not duplicated). |
| STEP 7 | **Content Experience Layer** (`OTODOR-CONTENT-LAYER.md`): native-first — guides authored as Shopify **Articles/Pages**, surfaced by reference (no long-form duplicated). `otodor-content-guide` (single guide surface: Article/Page pick → product/collection ref metafield → hide) + `otodor-content-rail` (related reading: `custom.related_guides` list → blog latest → hide). Reference model added to the data model (`custom.buying_guide`/`installation_guide`/`compatibility_guide` = article_reference, `related_guides` = list; `buying_guide_block` metaobject deprecated). Wired into product + digital-locks collection (auto-hide until guides exist). |
| STEP 8 | **Lead Capture & Guided Advisor** (`OTODOR-LEAD-CAPTURE.md`): the conversion layer every CTA was routing toward with no destination. **`otodor-lead-form`** — reusable quote/consultation capture on native `{% form 'contact' %}` (no backend); editorial split (trust `reason` rail + form card), phone/email/`interest`/message, **hidden context-capture** fields (`contact[Source page]`/`[Product]`/`[Collection]`/`[Advisor result]` → each lead lands pre-attributed in the inbox), **WhatsApp dual-path**, OTODOR success/error, `?interest=/?product=/?msg=` prefill. **`otodor-advisor`** — deterministic client-side guided finder (**not an LLM**): `question` blocks (prompt + ≤4 options → collection + weight), scores answers, reveals the winning collection's hidden recommendation card (View range / Get a quote / WhatsApp), auto-hides with no questions; scoped `otodor-advisor.js` (per-instance, single choice-stack, Back/restart, a11y, reduced-motion) + `otodor-advisor-rec` snippet. **Wiring:** `page.contact.json` recomposed as the canonical lead desk (main → advisor → lead-form); digital-locks CTAs repointed to `/pages/contact#otodor-lead`. `shopify theme check` clean vs. baseline (5 errors / 18 warnings, none from this work). |
| STEP 10 | **Homepage top rebuilt: banner slideshow + promo strip; the monolith hero moves down.** New **`otodor-banner`** — a minimal Apple/Tesla-register **cinematic slideshow** (desktop ratio setting, **2.4:1** default): crossfade, hairline progress indicators, swipe, arrow keys, autoplay that pauses on hover / focus / hidden tab / off-screen; per-slide image + optional mobile image + focal point + eyebrow / heading / one line + two pills + light-or-dark text + 5 copy placements; `assets/otodor-banner.css` + `assets/otodor-banner.js` (vanilla, **no GSAP**); auto-hides with no slides; first slide is the LCP (`eager` + `fetchpriority=high`), the rest lazy. New **`otodor-promo-strip`** — CSS-only infinite offer ribbon (default **left → right**), `message` blocks with optional discount-code pill + link, 3 colour schemes, pause on hover/focus, auto-hides when empty, reduced-motion → static row. **`otodor-hero` (pinned monolith scroll) now sits below both** and gave up its eager/high-priority product image (the banner owns the LCP); its pin/choreography is otherwise untouched — it still pins with `start: 'top top'` + `refreshPriority: 1`, which holds anywhere on the page. `theme check` clean vs. baseline. |

**Desktop Mega Menu (UI milestone, `snippets/header-mega-menu.liquid` + `assets/otodor-mega-menu.css`):** enterprise-grade, editorial. Full-width panel = category columns (level-2 collections → level-3 links, icon/description from `custom.menu_icon`/`menu_description`) **+ a featured panel that updates to the hovered/focused category** (image from `custom.menu_image` → collection image → first product image; cross-fades via opacity/translateY/scale, ~200ms) **+ a full-width "Get a Custom Quote" CTA**. Data = Shopify Navigation + collection metafields (single source of truth; no parallel menu). Minimal scoped inline JS only swaps the active featured panel (no AJAX). Open/ESC/keyboard stay with Dawn's `<header-menu>`. Mobile drawer untouched. Merchant-editable: Navigation (structure), Collections (image/description/url), `custom.menu_*` (icon/description/image), header settings (`mega_featured_label`, `mega_cta_*`).

**Homepage order** (`index.json`), STEP 10 onward: `otodor_vault_intro → otodor_promo_strip → otodor_banner →
otodor_hero → otodor_categories → otodor_moments → otodor_trust_bar → otodor_features → otodor_why →
otodor_testimonials → otodor_process → otodor_ecosystem → otodor_cta_banner`. The pinned monolith hero is no
longer the first thing on the page — the banner slideshow is.

**Product page** (`product.json`) current (STEP 4b orchestrator): `main-product → otodor-product-reveal → otodor-product-specs → otodor-product-compat → otodor-product-install → otodor-product-warranty → otodor-product-downloads → otodor-comparison → related-products → otodor-sticky-atc`. Every module auto-hides on no data.

---

## ⚠️ Next steps

### ✅ Done — STEP 4b + 4.5 + STEP 5 + STEP 6 + STEP 7
Module contract + Downloads/Warranty/Compatibility modules + 85 mm clearance + orchestrator + framework inventory (4b/4.5). **STEP 5:** Specification Rendering Engine (`otodor-spec-registry` + `otodor-spec-value`); `otodor-comparison` rewritten as its consumer. **STEP 6:** centralized **Schema Registry** (`otodor-schema.liquid`) — Organization/WebSite (moved from header) + BreadcrumbList + CollectionPage + VideoObject as one `@graph`, plus FAQPage (collapsible-content) and opt-in HowTo (install). `shopify theme check` clean vs. baseline (5 pre-existing errors, none from this work).
- **Note (STEP 5):** the comparison reads `specs.*` product metafields; until those are defined/populated in admin, only the `warranty` row (registry default) renders — it fills out as spec metafields are added. Add a spec = one registry record; add a renderer type = one `when` in `otodor-spec-value`.
- **Note (STEP 6):** Product/Offer/AggregateRating stay with Shopify `structured_data` (never duplicated). FAQPage is opt-in per collapsible-content instance (enabled on digital-locks). Schema is JSON-valid by construction but **verify live** with Google Rich Results Test once the store is public (sandbox can't render Liquid). Product `additionalProperty` (from the Spec Registry) + `Offer.warranty` are deferred to a reviewed Product-ownership change (`OTODOR-STRUCTURED-CONTENT.md` §5).
- **Note (STEP 7):** `otodor-content-guide` + `otodor-content-rail` surface native **Articles/Pages** by reference — they **auto-hide until guides are authored** and the reference metafields (`custom.buying_guide` / `related_guides`, article_reference) are set. Merchant to-do: create a "Guides"/"Learn" **blog**, author guide **Articles**, and link them from products/collections. Content stays canonical in Shopify (no duplication; native SEO/AI).

### ✅ Done — STEP 8 (Lead Capture & Guided Advisor)
`otodor-lead-form` + `otodor-advisor` + `otodor-advisor-rec` + `otodor-advisor.js`; `page.contact.json`
recomposed as the lead desk; digital-locks CTAs repointed to `/pages/contact#otodor-lead`. See
`OTODOR-LEAD-CAPTURE.md`. `theme check` clean vs. baseline.
- **Note (STEP 8):** the lead sink is the native Shopify `contact` form — **leads arrive at the store's
  contact/notification email** (Settings → Notifications). No CRM/backend; any Shopify Flow / Zapier / Forms
  app the merchant later adds consumes the same submissions with **no theme change**. The "AI advisor" is a
  **deterministic** guided finder (native-first, no backend, no API key to leak) — a real LLM chat would be a
  separate hosted service (a STEP 9+ option, out of theme scope).
- **Advisor data:** options reference the sub-collections `wooden-door-locks`/`glass-door-locks`/
  `metal-gate-locks`/`smart-padlocks`; until those collections exist, options fall back to the **default
  recommendation** (still fully functional). Recommendation image/reason come from each collection's
  `custom.menu_image`/`menu_description` (→ collection image → first product → gradient).

### ✅ Done — STEP 9 (SEO expansion, safe scope)
`OTODOR-SEO-EXPANSION.md`. **Organization entity enriched** in the schema graph — `description` (shop.description),
`slogan` + `foundingDate` (new optional `settings.otodor_org_*`), `contactPoint` (WhatsApp `telephone` +cc,
`contactType:customer service`, `areaServed:IN`, `availableLanguage:[en,hi]`) — every field gated, one
`@id`-anchored Organization (no duplication). **Head/perf:** `preconnect` + `dns-prefetch` to `cdn.shopify.com`
(LCP; fonts already self-hosted). `theme check` clean vs. baseline.
- **Decision (user-approved):** the **Product-ownership rewrite is re-deferred** — additionalProperty/`Offer.warranty`
  need real prices + populated `specs.*` (products are ₹0, specs empty) and can't be verified in-sandbox; replacing
  Shopify's maintained Product/Offer/rating now would be net-negative. Trigger: real data lands → `build:'product'`
  mode + remove `main-product.liquid` `structured_data` + live Rich-Results verification (`OTODOR-SEO-EXPANSION.md` §1).
- **Out of scope (native):** `sitemap.xml` is Shopify-generated (not a theme file); hreflang needs multi-locale routing.
- **Verify live** (sandbox can't): Google Rich Results Test / Schema Markup Validator once the store is public.

### ✅ Done — STEP 10 (Banner slideshow + promo strip)
`otodor-banner` + `otodor-promo-strip` inserted above `otodor-hero` on `index.json`.
- **Banner height / art ratio:** the desktop ratio is a section setting — **2.4:1 (`12 / 5`) by default**, which
  matches the Tesla reference the user supplied (≈1900 × 796 at 1920 wide; ours measures 1905 × 794). Options:
  2.4:1 · 21:9 · 2:1 · 16:9. **Wider = shorter band.** Required art per ratio: **2.4:1 → 2880 × 1200**,
  21:9 → 2520 × 1080, 2:1 → 2880 × 1440, 16:9 → 2400 × 1350.
- **Placeholder art (owner: user):** the three seeded slides reuse existing shop images
  (`flagship1.png`, `leave.png`, `secure.png`) so the banner reads as finished in QA. **Replace with dedicated
  2880 × 1200 campaign art** — that is the one thing standing between this and a Tesla-grade first screen.
  Per-slide "Mobile image" exists for phone-specific crops.
- **Offer copy:** the strip ships with *true* claims only (launch pricing, free installation, 3-yr warranty,
  free survey) — **no invented discount code**. The merchant sets the real offer + code in the theme editor;
  the code pill renders only when filled.
- **Mobile ratio:** phones have their own ratio setting (16:9 default) plus a **300 px floor** — a 16:9 frame is
  ~210 px tall on a phone, too short for a heading plus two actions, so the floor crops the image rather than
  squeezing the copy. Taller mobile ratios (4:3 / 1:1 / 4:5) never hit it.
- **Verified headlessly** (the storefront still can't run in the sandbox): the real `otodor-banner.css/js` were
  driven in a static harness — frame ratio confirmed at 1920/1280/375, crossfade/aria/tabindex state correct, autoplay
  advances and pauses when the tab is hidden, dots + wrap-around work, strip loop measured **left→right and
  seamless** (track 2× viewport). Two layout bugs found and fixed there: bottom-centre copy colliding with the
  indicators (desktop **and** mobile), and the mobile actions overflowing the frame.

### ✅ Done — STEP 11 (Vault intro V5 — the doors ARE the screen)
`assets/otodor-vault.js` rewritten (311 → ~215 lines). The intro no longer builds a *place*: the chamber
(floor/ceiling/side walls), the carved wall with lintel/sill/jambs, the reveal sleeve, the interior light leak,
the fog, the shadows and the camera fly-through are **all gone**. What is left is two pitch-black gates,
split on the diagonal, **covering the entire viewport**, that glide off both sides to reveal **the live page**
behind them (the canvas is transparent — the "behind" is the DOM).
- **Full-viewport coverage at any aspect** is the invariant: the slabs are **rebuilt on resize** to cover the
  camera's visible rect × 1.12 margin, rather than scaled (scaling would skew the 45° slant and drag the
  monogram's size around with the window). The monogram is sized against the **frame** (26 % of the short side),
  and the seam gap is proportional (~3 px at any height) instead of a fixed world size that went sub-pixel once
  the doors filled the screen.
- **The camera never moves.** Any sway or dolly would swing the viewport edge past the doors and leak page
  around them before they open — so the breathing, the pre-open dolly and the fly-through were removed, not
  re-tuned.
- **Ends on actual clearance,** not on the nominal end of the glide: `easeInOutQuart` spends its last ~15 %
  crawling the final few percent of travel, entirely off-screen. Measured dead air on an empty overlay dropped
  from ~900 ms to 200 ms; the whole intro is now ≈4.1 s + the 0.55 s overlay fade.
- **Verified by pixel probe** (headless, via the module's own WebGL context): closed frame **fully opaque on a
  25-point grid** at aspects 3.43 (ultrawide), 1.78, 1.6 and 0.39 (tall phone); mid-glide shows the page through
  a clean diagonal gap; end frame **fully transparent** — no black wedge left anywhere. Rebuild-on-resize fired
  mid-animation without errors or a reset. Timings/guards (session-once, reduced-motion, no-WebGL, safety net)
  are untouched.

### Remaining roadmap
- **Product-ownership schema** (deferred) — take when real prices + `specs.*` exist (see above).
- Optional: real LLM concierge as a hosted micro-service if the deterministic advisor proves the demand.
- **Content/data (owner: user)** still blocks real impact — real prices, photography, populated metafields.

### Admin setup the merchant must do (theme degrades gracefully until done)
- **Navigation:** build the nested 3-level `main-menu` (Products → Digital Locks → Wooden/Glass/…; see Phase 2 report) so the mega menu shows the hierarchy.
- **Assign** the `digital-locks` **collection → theme template `digital-locks`**. Optionally create sub-collections `wooden-door-locks`/`glass-door-locks`/`metal-gate-locks`/`smart-padlocks` (selector falls back gracefully if absent).
- **Custom data:** define product metafields (`specs.*`, `custom.specs`, `custom.access_methods`, `custom.documents`, `custom.door_compatibility`, `custom.positioning_line`) + collection metafields (`custom.menu_icon/description/image`, `hero_*`, `faqs`, `seo_content`); optional metaobjects only if reused (see data model). Flag comparable ones for Search & Discovery filters.
- **Leads (STEP 8):** confirm the store **contact/notification email** (Settings → Notifications) — that is where lead-form submissions arrive. Ensure a page with handle `contact` uses the `page.contact` template (the lead desk). Optionally repoint the **homepage CTA banner** and **mega-menu "Get a Custom Quote"** link settings to `/pages/contact#otodor-lead` (they're merchant URL settings; the digital-locks collection is already wired).

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
