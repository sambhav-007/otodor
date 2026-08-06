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

**Homepage order** (`index.json`), STEP 17 onward: `otodor_vault_intro → otodor_promo_strip →
otodor_categories → otodor_moments → otodor_trust_bar → otodor_features → otodor_why → otodor_testimonials →
otodor_process → otodor_ecosystem → otodor_cta_banner`. **Both the pinned monolith hero and the banner
slideshow have left the homepage** (STEP 17) — the hero is deleted, the banner now opens Digital Locks. The
first visual on the homepage is the category bento.

**Digital Locks order** (`collection.digital-locks.json`): `hero → banner → selector → product-grid → …` — the
slideshow sits above the sub-categories.

**Product page** (`product.json`) current (STEP 4b orchestrator + STEP 17 offer block): buy box is
`title → positioning → price → access_chips → otodor_offer → variant_picker → quantity → buy_buttons →
trust_row → description`; then `otodor-product-reveal → otodor-product-specs → otodor-product-compat →
otodor-product-install → otodor-product-warranty → otodor-product-downloads → otodor-comparison →
related-products → otodor-sticky-atc`. Every module auto-hides on no data **and on no relevance** (STEP 12).

| Commit | What |
|---|---|
| STEP 12 | **Digital Locks as a real category landing · the compare table · PDP relevance.** See the three subsections under "Done — STEP 12" below. |

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

### ✅ Done — STEP 12 (Digital Locks landing · compare table · PDP relevance)
Three defects the user reported after QA, fixed as three commits.

**A — "Digital Locks" now opens a page, with its sub-categories.** A nav item with children renders as
`<summary>` in Dawn, so clicking a parent only toggled the dropdown; and `/collections/digital-locks` fell to
the generic `collection.json`, whose selector had no blocks and hid itself. Now: the mega menu **and** the
mobile drawer carry a **"View all &lt;category&gt;"** link inside the panel (accessible, no JS), and on
hover-capable desktop a pointer click on the parent follows its own URL (keyboard still toggles the
disclosure). `otodor-category-selector` gained a **source** setting — `auto` = `category` blocks →
**Shopify Navigation** (finds the link pointing at the current collection, renders *its* children) →
**child collections** (`custom.parent_collection`) → hide. The generic `collection.json` runs `auto`, so **any**
parent collection shows its sub-categories with no bespoke template. The card override chain moved into
`snippets/otodor-category-card.liquid` (one implementation, three sources). Four config-only leaf templates
added: `collection.wooden-door-locks/glass-door-locks/metal-gate-locks/smart-padlocks.json`.

**B — The compare table renders the client's sheet.** `otodor-comparison` was right but empty (no `specs.*`
metafields exist, so every row but `warranty` dropped). Registry gained the missing rows (**Size, Weight,
Emergency backup port, Mini screen**) and retyped the qualified ones to the new **`yesno`** renderer —
tick/dash **plus** the qualifier ("Yes (up to 20)" → ✓ *up to 20*). A **column no longer needs a product**: a
block can stand alone with a title/image/link and carry **seed values** (`spec_id = value`,
`snippets/otodor-spec-seed`), handed to the resolver as `spec_default` so a real metafield always wins.
Digital Locks is seeded with SENTRY · NEXUS · ONYX · ZION+ · ZEAL. Also: an **Explore** action per column
(mygate parity), a light/dark scheme, keyboard-scrollable table region.

**C — Modules declare what they apply to.** A smart padlock was shown professional door installation, the
85 mm clearance and door compatibility. Not a data problem: those modules ship non-blank defaults, so
"hide when empty" can never fire. New `snippets/otodor-module-applies.liquid` answers *should* this render —
allow/deny lists over **product type + tags + collection handles**, plus per-product
`custom.hidden_modules` / `custom.shown_modules` which beat any section config; all blank = shows.
Install, Warranty, Compatibility and Downloads consult it; Install also prefers `custom.install_clearance`.
The buy-box trust row stopped being a hardcoded `custom_liquid` string and became an **`otodor_trust_row`
block** in `main-product` rendering `otodor-trust-row`, which asks for the same `install` verdict the Install
module uses — one answer, not two that can disagree. `product.json` marks install + compat as not applying to
`smart-padlocks`.

**STEP 12 QA round (from the user's dev store):**
- **White heading on a light band** — the section's `color` was right; **Dawn's `h1,h2,…` rule sets colour
  *directly* on the element**, and a declared value always beats an inherited one, so the light scheme never
  reached the `<h2>`. Fixed by declaring it on `.otodor-cats__title` per scheme (and on the collection grid's
  dark CTA band, where the same bug pointed the other way). **Watch for this in any new section** whose
  heading is an `<h2>` with no `color` of its own.
- **Compare table reach** — the generic `collection.json` gained a comparison (resolves from the collection's
  own products, auto-hides below two columns), so every category gets one without a bespoke template. The
  spec **values** then had the same reach problem: seeded per template, they were invisible wherever a
  template wasn't assigned. The client's sheet now lives **once**, in `snippets/otodor-spec-model-seed.liquid`,
  and every comparison consults it — models matched on handle *or* title, normalised and prefix-tested, so
  `ZION+ Rose Gold` and `ZION+ Galaxy Black` both resolve to ZION+. Precedence is unchanged:
  `metafield → column seed → model seed → registry default → —`.
- **Which columns** — collection order was wrong twice: it included `OHM` (in the range, never in the client's
  sheet) and excluded `NEXUS` / `ONYX` (in the sheet, not yet products). Two rules: an **empty-column drop**
  (no metafield and no seed anywhere in the registry ⇒ the column goes, while ≥ 2 survive) and a **model
  lineup** — section setting `models`, falling back to collection metafield `custom.compare_models`, e.g.
  `SENTRY, NEXUS, ONYX, ZION+, ZEAL`. Names match products by handle or title; a name with no product still
  gets a seed-filled column. Pinned on the digital-locks and wooden-door-locks templates. On an unassigned
  collection the drop rule alone removes OHM; type the lineup into the section's **Model lineup** field (or
  set `custom.compare_models`) to add NEXUS/ONYX there too.
- **Still outstanding:** `OHM` has no published specs, and **ZION+ Rose Gold / Galaxy Black are two separate
  products** with identical specs — as variants of one ZION+ they would stop occupying two columns.
- **Clearance infographic** — artwork belongs in **Shopify Files**, not the repo. `otodor-product-install`
  gained a *Clearance diagram* image slot (+ alt, caption), overridable per product by
  `custom.install_clearance_image`. The default clearance **note was also factually wrong** (it described side
  clearance from the door edge to a wall); it now states the real spec — a minimum 85 mm gap **between the
  safety door and the main door**.
- **Padlocks** — the exclusion was keyed on collection membership alone, which only fires if the product is
  actually in `smart-padlocks`. Install, Warranty, Compatibility and the trust row now exclude by
  **collection AND product type AND tag**. Warranty is excluded for padlocks too (a setting — hand it back
  without a code change if that turns out to be wrong).

- **Data still owed by the client:** the sheet leaves **Size blank for NEXUS / ONYX / ZION+** and truncates
  **Inbuilt battery to "Yes," for NEXUS / ONYX**. Those cells render "—"; nothing was invented.
- **Verified headlessly:** `theme check` at baseline (5 errors / 16 warnings); every template + section schema
  parsed; the `yesno` parser and the applicability decision matrix were ported and exercised (15 cases —
  comma fences so `lock` ≠ `padlock`, precedence, empty config, bare product).

### ✅ Done — STEP 13 (Sitewide scale: 1.25× — and the reason it read small)
The user reported the whole site as too small to read and asked for 1.25×. Two separate things:

**The scale.** Dawn derives the root font-size from its own setting — `62.5% × body_scale` — and every OTODOR
token that matters is rem-based, so **one number moves the site together**: `body_scale` and `heading_scale`
100 → **125** in `config/settings_data.json`. Type, spacing, section rhythm and Dawn's `--page-width`
(1200 → 1500 px) all land on exactly 1.25×, and it stays **merchant-tunable in the theme editor** (Typography →
scale; `body_scale` caps at 130). Values that *cannot* follow a root scale were stepped by hand to stay in
proportion: OTODOR container tokens (1280/1440/960 → 1600/1800/1200), the radius tokens, the comparison
table's column + min widths, the mega-menu tile track and CTA thumb, the banner's mobile frame floor, and a
few section `max-width`s. **Deliberately untouched:** media-query breakpoints, 1 px hairlines, the 44 px touch
target, and `image_url`/`sizes` render hints.

**The bug underneath.** The OTODOR type scale was authored as though **1rem were 16px** — its own comments said
so — but the root has always been 62.5%-based (1rem = 10px). Every reading size had therefore been rendering at
**~63 % of its documented intent**: `--otodor-text-sm`, which the comparison table uses, capped at **8.8 px**
instead of 14 px. That is why the site read small, and why 1.25× alone would only have reached 10.9 px. The
reading end of the ramp (`xs`…`2xl`) is **re-based** so each token renders the size it always claimed —
12 / 14 / 16 / 18 / 20 / 24 / 32 px — still in rem so `body_scale` keeps moving it. `2xl` is included or it
would land 1 px above the re-based `xl`. Display sizes above it are left alone: they are dominated by their
`vw` term at real viewports and already read correctly, so re-basing would *double* rather than scale them.
- **Rule for new work:** 1rem is **12.5 px**, not 16 px. Use rem for anything that should scale with the type;
  use px only for things that must not (hairlines, breakpoints). See the SCALE note atop `otodor-base.css`.
- Verified: ramp monotonic with no flat spots at 1920 / 1280 / 375; the stale `/* 16px */` spacing comments
  were corrected so the next person doesn't repeat the mistake. `theme check` at baseline.

### ✅ Done — STEP 14 (Mobile: two-up grids and a tile built for a narrow column)
Every product grid dropped to a **single full-width card below 599 px** — a lookbook, not a shop. Now:
- **Two-up on phones:** `otodor-collection-grid`, `otodor-search` results and `otodor-category-selector`;
  `.otodor-grid-3` / `-grid-4` collapse to **two**, not one. `.otodor-grid-2` still goes single (text/media
  splits — half a phone can't hold a paragraph). `otodor-products` keeps its deliberate 85vw scroll-snap
  carousel; it's a homepage showcase, not a shop grid.
- **The tile was redesigned for ~163 px**, because a column count alone isn't responsive: padding roughly
  halves, title + meta step down one rung, and both **line-clamp** (title 2, meta 1) so a long model name
  can't make one tile taller than its neighbour and stagger the row. The category description clamps to 2 for
  the same reason, and the "Ask an expert" card keeps the full row (editorial, not a tile). **Price
  deliberately does *not* step down** — on a tile it's the second thing a shopper reads, so it holds the
  title's size.
- **Verified in a browser** against the real `otodor-base.css` + the real section `{% style %}` blocks at the
  live 12.5 px root: 375 px → products 2/2/2, categories 2/2/2 + full-row CTA, card 163 px, row heights paired
  exactly (278/278 then 258×4), no horizontal overflow; 768 px → 2/2/2; 1280 px → products 3/3, categories 4/3,
  title 20 / meta 14 / price 18. Desktop unchanged at every number.

### ✅ Done — STEP 15 (Gate Automation + Other Solutions landings)
Read the **live** navigation (`otodorlocks.com`) rather than assume the structure. Two of the four top-level
items had no working landing:
- **Gate Automation** → `/collections/sliding-gate-motors`, i.e. the parent points at **one of its own
  children** (its sub-items are `sliding-gate-motors-2` and `swing-gate-motors`). Clicking the parent lands on
  a child collection.
- **Other Solutions** → **no URL at all**, so the item only opened a dropdown. Eight product families behind it
  and no page to land on.

**`templates/page.solutions.json`** — one reusable hub template for any group that has **no collection behind
it**. The selector gained a third way to identify itself: explicit `menu_item` setting → the link pointing at
the current collection → **the link whose title equals the current page's title**. That last rule means the
template needs *zero* per-page configuration: create a Page named exactly as the menu item, assign the
template, point the nav item at it. Composition: page content → selector → why → CTA.

**`templates/collection.gate-automation.json`** — gate-specific landing (survey-first hero, sliding/swing
selector in `auto` mode, grid, comparison, why, 4 gate FAQs, CTA). Sub-categories come from Navigation, so
adding one there adds a card here with no template change.

**Also corrected:** the padlock relevance rule named `smart-padlocks`, but the live handle is **`padocks`**
(their typo) — so Install/Warranty/Compatibility and the trust row were never actually switching off on
padlock PDPs. All exclusion lists now read `padocks, padlocks, smart-padlocks`.

**Admin to-do for these two (theme degrades gracefully until done):**
1. Create a **`gate-automation`** collection, point the "Gate Automation" menu item at it, and assign the
   `gate-automation` template. (Also worth resolving `sliding-gate-motors` vs `sliding-gate-motors-2` — they
   look like a duplicate.)
2. Create a **page titled exactly "Other Solutions"**, assign the `solutions` template, and point the menu
   item at that page. Then give each of its eight children a real link — they currently have none, so their
   cards fall back to `/collections/all`.
3. Template suffix names are just names: assign `digital-locks` → the `door-locks` collection, and
   `smart-padlocks` → `padocks`.

### ✅ Done — STEP 16 (Site audit: specs on the PDP, real phone, theme check to zero)
Audited the **live** site rather than the repo. Findings and fixes:
- **Product pages showed no specifications at all** while the comparison on the same site showed a full sheet
  for the same models — `otodor-product-specs` read only `custom.specs`, which is undefined. It is now the
  registry's **second consumer**: `custom.specs` → registry resolved against the product (metafield → model
  seed → default) → blocks → hide. A row backed *only* by a registry default doesn't count as evidence
  (otherwise every product rendered a one-row ledger repeating the warranty module). Simulated: SENTRY 16 rows
  over 7 groups, ZEAL 16, ZION+ 15, OHM/CLOUD correctly nothing.
- **`+91 00000 00000`** was shipping in the footer and contact column on every page, while every WhatsApp link
  on the same page published **+91 7206895607**. Replaced with the number the site already uses.
- **`theme check` errors 5 → 0.** Two were a stale `t:` reference in `featured-product.liquid` to a key that
  never existed (fixed with literal strings — adding it to `en.default.schema.json` instead would have obliged
  all 16 other locale files, which is why that attempt was reverted). Three were `ImgWidthAndHeight` on the
  logo fallbacks; both logos are sized by CSS (`height: auto` / `height: 72px`), so the attributes can only
  reserve space, never distort. Ratio from the official `brand-logo.png` (1800×420).

### ✅ Done — STEP 17 (Hero retired · slideshow moves · complaint desk · the offer layer)
Four user requests, three commits.

**A — The monolith hero is gone, desktop and mobile.** `otodor_hero` dropped from `index.json`;
`sections/otodor-hero.liquid` and `assets/otodor-hero.{css,js}` deleted. Nothing else referenced them
(`otodor-animations.js` never touched the hero), so no motion code moved. **Note for the user:** with the
banner also moved away, the homepage now opens on the promo strip → `otodor_categories` bento. There is no
hero on the homepage at all — deliberate, but worth a decision (a static image-banner or a slimmer opener
would fill it).

**B — The banner slideshow is the Digital Locks opener.** `otodor-banner` moved out of `index.json` into
`collection.digital-locks.json`, between the collection hero and the sub-category selector. Slide CTAs
repointed at the category (a slide no longer linked to the page it sits on). Its LCP handling is unchanged —
the first slide is still eager/high-priority, which is now correct for that page.

**C — Raise a Complaint.** New **`otodor-complaint-form`** on the native `{% form 'contact' %}` (so complaints
arrive at the store's notification email, no app, no backend): name/phone/email, order number,
purchase-or-installation date, model, issue category, description, preferred contact, consent, plus hidden
`Request type: Complaint` and source-page lines so complaints are filterable in the inbox. The **WhatsApp
button carries the complaint, not a greeting** — its href is rebuilt on every keystroke from the filled
fields, so the chat opens with the order number, model, category and description already written out; the
Liquid-built href is the no-JS fallback. **`templates/page.complaint.json`** composes intro → form → four
support FAQs (FAQPage schema on) → CTA.

**D — The offer layer (prices · coupon · seasonal sale · delivery · EMI).** One source of truth,
**Theme settings → OTODOR Offers, Pricing & EMI** (campaign name + start/end, coupon code/value/scope
collections/tags, free-delivery and GST wording, EMI tenure + note), read by three consumers:
- **`snippets/otodor-offer-box.liquid`** — a first-class **`otodor_offer` block** in `main-product`, wired into
  `product.json` under the price. Resolves the effective price `custom.effective_price` → **price seed** →
  Shopify price, and the discounted price `custom.deal_price` → seed → effective − coupon; prints it with the
  GST wording, free delivery and the EMI it works out to (headline ÷ tenure, rounded up). No price resolves,
  no panel. Per-product `custom.hidden_modules` containing `coupon` switches the coupon row off.
- **`sections/otodor-offer-popup.liquid`** — rendered **once sitewide from `theme.liquid`**; decides for itself
  whether the page is in its targeting (all / home / shopping / *only where the coupon applies*) and whether
  the campaign window is open. Delay + optional scroll trigger, dismissal remembered for N days, **a copied
  code suppresses it for a year**, focus trapped and restored, ESC/backdrop/dismiss close.
- **`otodor-promo-strip`** gained `show_campaign`: the offer line is **generated**, not typed, so strip, popup
  and PDP always agree and the line retires by itself when the campaign ends.
- Supporting snippets: **`otodor-campaign-live`** (the window), **`otodor-price-seed`** (published pricing,
  weakest source, read by the existing spec-seed parser), **`otodor-rupees`** (Indian digit grouping).
- **Seeded data (client-supplied only):** ZEAL — effective **₹7,699**, after-coupon **₹6,200 incl GST**.
  Defaults: campaign *Independence Day Sale*, code **OTODOR1500**, **₹1,500**, scope **wooden-door-locks**,
  free delivery on, EMI 6 months (₹1,034/mo on ZEAL). **No other model has published pricing — nothing was
  invented**; models without a row fall back to the Shopify price or hide.
- The saving badge stands down while the coupon row shows: 7,699 − 6,200 is 1,499 against a ₹1,500 coupon,
  and printing both invites a rupee of arithmetic that doesn't tie out.
- **Verified in a browser** against the real `otodor-offer.js`: opens on delay, ESC/backdrop close and restore
  focus, dismissal survives a reload, copy swaps the label + suppresses for a year, clipboard falls back to
  `execCommand` when the async API refuses (added after the harness proved the async path can reject).
  The rupee grouping was ported and exercised across 13 magnitudes. `theme check` at baseline.

**Admin to-do for STEP 17 (the theme advertises; admin has to make it real):**
1. **Create the discount code `OTODOR1500`** in Shopify (Discounts → Amount off products → ₹1,500, limited to
   the Wooden Door Locks collection). The theme only advertises it — nothing enforces it at checkout.
2. **Create a Page "Raise a Complaint"** (handle `complaint`), assign the **`complaint`** template, and add it
   to the footer menu. Footer columns are Shopify link lists, so this is a Navigation edit.
3. Confirm the **contact/notification email** (Settings → Notifications) — complaints land there.
4. Optional: set `custom.effective_price` / `custom.deal_price` on products to retire the price seed, and type
   a **campaign end date** if the sale should switch itself off.

### Remaining roadmap
- **Product-ownership schema** (deferred) — take when real prices + `specs.*` exist (see above).
- Optional: real LLM concierge as a hosted micro-service if the deterministic advisor proves the demand.
- **Content/data (owner: user)** still blocks real impact — real prices, photography, populated metafields.

### Admin setup the merchant must do (theme degrades gracefully until done)
- **Navigation:** build the nested 3-level `main-menu` (Products → Digital Locks → Wooden/Glass/…; see Phase 2 report) so the mega menu shows the hierarchy.
- **Assign the collection templates.** A collection's template is `templateSuffix` on the **Collection object** — store data, not a theme file, so `shopify theme push` cannot do it. Either set it per collection in admin (Collections → *collection* → Theme template), or run `scripts/assign-collection-templates.ps1` (dry run by default, `-Apply` to write). The script needs a one-time `shopify store auth --store ttna2m-mh.myshopify.com --scopes read_products,write_products` — an interactive browser grant, so it cannot be done from an agent session. Mapping (template name ≠ collection handle): `door-locks`→`digital-locks`, `padocks`→`smart-padlocks`, `sliding-gate-motors`→`gate-automation`, and the three door-type collections to their same-named templates. Until assigned, every collection gets the generic `collection.json` — which does show its sub-categories from Navigation, so nothing is broken meanwhile.
- **Upload the clearance infographic** (Content → Files), then set it on the product page's **OTODOR Product Install → Clearance diagram** setting. Per-product art goes on `custom.install_clearance_image` instead.
- **Tag or type your padlocks** if they aren't in a `smart-padlocks` collection — product type `Smart Padlock` or tag `padlock` also switches off Installation / Warranty / Compatibility on those PDPs.
- **Optional (STEP 12):** set `custom.parent_collection` on each sub-collection → the selector finds them even where the menu isn't built. And set `custom.menu_image` / `menu_description` / `menu_icon` on the four sub-collections — those are what give the sub-category cards their art and blurb.
- **Custom data:** define product metafields (`specs.*`, `custom.specs`, `custom.access_methods`, `custom.documents`, `custom.door_compatibility`, `custom.positioning_line`) + collection metafields (`custom.menu_icon/description/image`, `hero_*`, `faqs`, `seo_content`); optional metaobjects only if reused (see data model). Flag comparable ones for Search & Discovery filters.
- **Leads (STEP 8):** confirm the store **contact/notification email** (Settings → Notifications) — that is where lead-form submissions arrive. Ensure a page with handle `contact` uses the `page.contact` template (the lead desk). Optionally repoint the **homepage CTA banner** and **mega-menu "Get a Custom Quote"** link settings to `/pages/contact#otodor-lead` (they're merchant URL settings; the digital-locks collection is already wired).

### Content (owner: user — blocks real impact)
- **Missing cells in the client's comparison sheet** — Size for NEXUS / ONYX / ZION+, and the Inbuilt-battery detail for NEXUS / ONYX. They render "—" until the client supplies them.
- **Real product prices** — WINDSOR/VAULTEX/FREDDY are ₹0 (card guard shows "Contact for pricing").
- **Photography / high-res flagship renders** (ONYX/SENTRY/NEXUS/ZION+/ZEAL/OHM); product descriptions are near-empty.

### Deferred (perf/a11y)
- Sections inline full CSS/JS; GSAP loads per page from CDN. Verify gold/blue contrast (WCAG AA); JSON-LD once prices are real.

---

## Verification method (important)
The agent sandbox **cannot run a headless preview** (storefront password + non-interactive). Validation here uses
**`shopify theme check`** — the baseline is now **0 errors / 16 warnings** (STEP 16 cleared the 5 long-standing
errors). **Any new error is yours; do not re-baseline it away.** Pure CSS/layout work can additionally be driven
in a static harness (extract a section's `{% style %}`, serve it with the real `otodor-base.css`, probe computed
layout in the browser) — that is how the mobile grids and the category bento were measured.
**The user QAs visually on their own `shopify theme dev` at :9292.** Pinned scroll-tours (Moments) and
scroll-drawn lines need a real browser.

## User preferences observed
- Premium storytelling over transactional ecommerce energy. **Dislikes:** feature-card grids, icons-as-decoration, bento layouts for credibility content, cyberpunk/HUD/neon. **Likes:** large type, restraint, real photography, editorial rows, Apple/Tesla/B&O references.
- Thinks system-by-system (architecture before code); reviews each step; wants high-impact work, not isolated polish.
