# OTODOR — Brand PDF Audit & Evolution Plan

> Phase 1 (read the 21-page Brand PDF) and Phase 2 (audit the existing Viltrumate/Dawn theme) are complete.
> This document is the bridge to implementation. Direction: **evolve, don't replace.** The PDF is the new source of truth.
> Companion docs: `PROJECT.md` (original vision), `HANDOFF.md` (prior session state). Brand extract: see the full PDF findings summarized in Part A.

---

## Part A — Global brand-system audit (cross-cutting)

The theme already has a mature, well-architected design system (`assets/otodor-base.css`: tokens, typography, buttons, glass components, motion, reveal states) and a strong homepage narrative. The gaps below are **brand-alignment**, not structural — exactly the "renovation" the brief calls for.

### A1. Typography — ⚠️ largest gap
- **Current:** `--otodor-font-display: 'Space Grotesk'`, `--otodor-font-body: 'Inter'` (loaded via Google Fonts in `theme.liquid:24`). Dawn's own font setting is `assistant_n4` (so native Dawn components — cart, forms — render in Assistant; a third font in the mix).
- **PDF (p5, p6):** **BR Sonoma is the primary typeface** ("to be used majorly"), full weight range (Light→Bold + italics). Cap height 727 / x-height 525.
- **Verdict:** Replace Space Grotesk (and unify Assistant) → **BR Sonoma** as display + primary. Keep Inter only as body/system fallback. **Blocker:** BR Sonoma is a commercial font (foundry: BR/Branding with Type). Needs licensed `.woff2` files self-hosted, or a fallback decision.

### A2. Color / accent — ⚠️ major gap
- **Current:** accent is **electric blue** `#4DA6FF` (dark) / `#1A78D8` (light). The whole token system is built on blue — `--otodor-blue-*`, `--otodor-blue-glow`, `--otodor-gradient-blue`, `--otodor-shadow-blue-*`, hero/CTA gradients all tinted blue.
- **PDF:** palette is **near-black + white + champagne/antique gold** (metallic gold logo tile p5, gold-on-wood lockup p3/p8). No blue anywhere.
- **Verdict:** Introduce a **champagne-gold accent token family** and repoint the accent from blue → gold across the system (glows, gradients, shadows, links, focus rings, buttons). This is a large but mechanical token change centralized in `otodor-base.css`. Green success token can stay.

### A3. Logo / monogram
- **Current:** logo is an image asset (`otodor_log_bg_removed.png` per HANDOFF); favicon set.
- **PDF (p2, p5, p8):** wordmark with the **split-circle monogram** (two offset half-rings + diagonal bar) = fingerprint + rotating handle. Available as champagne-gold tile and black tile. Tagline **"Secure Smart Automatic."**
- **Verdict:** Verify the live logo matches the PDF monogram; add the tagline lockup; ensure gold/black variants exist for dark/light headers. Add the monogram as an inline SVG token for use as a section motif/watermark (PDF uses it as a faint background mark repeatedly).

### A4. Motion
- **Current:** GSAP + ScrollTrigger (CDN), `otodor-animations.js`, reveal states, pinned scroll-tours (Moments), border-glow. Strong foundation, matches brief's "motion like Linear/Apple."
- **Verdict:** Keep. Only retune glow colors blue→gold. (Perf note in Part E.)

### A5. Factual/brand-copy corrections (appear in multiple places)
- **Warranty:** theme says "1-Year Brand Warranty" (`index.json` trust bar, product `trust_row`). **PDF says 3-Year on lock, 1-Year on battery.** Correct everywhere.
- **Missing brand proof the PDF emphasizes:** German Engineering · Italian Finish · Stainless Steel 304 + Aluminum Alloy · "for Indian Conditions" · All QC passed · PAN-India install across 10,000+ PIN codes · 24/7 support · backed by **NavKar Systems (16+ yrs, 10,000+ customers)** · Anti-"Little Black Box" EMI shielding (≤0.001% counterfeiting / ≤0.1% rejection / ≤0.5s sensing).

---

## Part B — Page-by-page audit

### B1. Homepage — `templates/index.json`
**Current state:** `otodor_hero → otodor_categories → otodor_moments → otodor_trust_bar → otodor_features → otodor_why → otodor_testimonials → otodor_process → otodor_ecosystem → otodor_cta_banner`. Editorial, dark→light→dark rhythm, pinned Moments scroll-tour.

- **Strengths:** Genuinely premium narrative; storytelling over transactional; strong hero + Moments + Why + Process + Ecosystem. Aligns with Apple/Tesla/B&O intent.
- **Matches PDF:** hero positioning, ecosystem "one app" story, installation-led trust, WhatsApp CTA.
- **Doesn't match PDF:** no **champagne-gold** (all blue); no BR Sonoma; **warranty wrong (1yr)**; missing signature stories — **Anti-"Little Black Box" EMI security**, **material/engineering** (304 steel, German/Italian finish), **NavKar credibility / 16+ yrs / 10,000+ customers**; hero product images are generic, not the ONYX/SENTRY/NEXUS/ZION+ hero renders.
- **Weaknesses:** `otodor_features` is a bento/feature-card grid — the user's stated dislike (HANDOFF). Trust bar has 8 generic pillars incl. unverifiable "Rated 4.9 by 500+ Homes."
- **Improve:** repoint palette→gold + type→BR Sonoma; fix warranty; add a **security (EMI shielding)** beat and a **credibility/heritage (NavKar)** beat; feed real flagship renders into hero.
- **Untouched:** hero shell, Moments scroll-tour mechanics, Why, Process, Ecosystem structure (retint only).

### B2. Header / navigation — `sections/header.liquid` + menus (Shopify admin linklist)
**Current state:** Dawn header, logo left / nav / search+account+cart right (matches PDF mockup p10/p11). Nav (mockup): Home · Digital Locks · Gate Locks · Gate Automation · Accessories · Security System · Contact.
- **Matches PDF:** overall layout + intent ("dropdown for subcategories").
- **Doesn't match:** PDF taxonomy is **deeper** and needs **mega-menu dropdowns**. Full tree: Digital Locks (Wooden/Metal/Glass/Cabinet/Padlocks/Hotel) · Gate Automation (Sliding/Swing) · Security Systems (Panels/Standalone) · Video Door Bells · Curtain Motors · Smart Switches · Other Solutions (Boom Barriers/Electromagnetic/Shutter Motors/Commercial Glass Doors/Interlocking) · **Get a Custom Quote (AI form)**.
- **Improve:** build a mega-menu with subcategories; add "Get a Custom Quote" CTA in header; gold hover states.
- **Untouched:** cart drawer, search, account, sticky behavior.

### B3. Collection pages — `templates/collection.json`
**Current state:** `otodor-collection-hero` + `otodor-collection-grid` (category pills → door-locks, gate-locks, sliding-gate-motors, security-system, accessories; sort; pagination; WhatsApp CTA). Light-scoped.
- **Strengths:** clean, brand-consistent, real collections wired, technology-first product card.
- **Doesn't match PDF:** the PDF wants **Digital Locks as a rich landing** (buying guide, door-type selector, benefits, comparison, FAQs, app features, videos) — the current collection grid is thinner than that "best Digital Lock category page in India" brief.
- **Improve:** elevate the Digital Locks collection into the PDF's editorial landing (see B7); retint to gold.
- **Untouched:** grid/sort/pagination plumbing, card component (restyle only).

### B4. Product pages — `templates/product.json`
**Current state:** `main-product` (title, positioning [metafield], price, access_chips [metafield], variant_picker, quantity, buy_buttons, trust_row, description) → `otodor-product-reveal` → `otodor-product-specs` → `otodor-product-install` → `related-products` → `otodor-comparison` → `otodor-sticky-atc`. Metafield-driven; sticky ATC; zero-price guard (per HANDOFF).
- **Strengths:** already "keynote-like" scaffolding; metafield-driven specs; sticky ATC; install trust.
- **Doesn't match PDF:** trust_row says **"1-year warranty"** (→3yr); missing PDF product depth — **gallery/video/360**, **full comparison matrix** (SENTRY/NEXUS/ONYX/ZION+/ZEAL), **materials/engineering** section, **EMI security** feature, **downloads**, **FAQ (schema)**, **app experience**. Product-benefits & product-lifestyle sections were removed (git log) — some of that editorial depth is now missing.
- **Improve:** correct warranty; add FAQ (with FAQPage JSON-LD), materials/engineering, EMI-security feature, downloads; wire richer comparison; retint to gold.
- **Untouched:** buy module wiring, variant/cart logic, sticky-ATC mechanics, metafield contracts.

### B5. Search — `templates/search.json`
**Current state:** `otodor-search` (dark hero + light results, products as cards, articles/pages as quiet rows).
- **Verdict:** solid. Retint to gold; otherwise leave. Untouched: query/results plumbing.

### B6. Footer — `sections/otodor-footer.liquid` + `footer-group.json`
**Current state:** brand footer, "Powered by Viltrumate Technologies" credit (HANDOFF).
- **Doesn't match PDF:** should carry full taxonomy columns, NavKar/heritage line, warranty/support proof, tagline.
- **Improve:** expand link columns to match taxonomy; add heritage + tagline; gold retint.

### B7. Pages that DON'T exist yet (PDF requires) — new work
1. **Digital Locks landing** (p11) — hero + intro + **door-type selector** (Wooden / Metal Gate / Glass / Smart Padlocks / Any Other Custom → experts) + benefits + comparison + FAQs + app features. *New template/section (reuse card + comparison components).*
2. **Wooden Door sub-page** (p12) — Main Door Locks (ONYX/SENTRY/NEXUS/ZEAL/ZION+) vs Living-Room Passage Mode (OHM); access modes. *New.*
3. **AI Product Advisor / "Get a Custom Quote"** (p10) — guided form (door type, thickness, indoor/outdoor, material, budget, security/automation needs, face/fingerprint/remote, city) → recommend product + capture lead. *New — biggest net-new build.*
4. **Comparison matrix component** (p13–14) — reusable SENTRY/NEXUS/ONYX/ZION+/ZEAL table. *Improve existing `otodor-comparison`.*
5. **Installation clearance guide** (p17–19) — the **85mm (3.35") gap** correct-vs-incorrect content, as a reusable snippet + a support/buying-guide page. *New snippet; feed into product install section.*
6. **Buying guides / FAQs / blog content** (p20 SEO) — long-form SEO pages + FAQPage schema.
7. **Category stubs** the PDF lists but store lacks: Video Door Bells, Curtain Motors, Smart Switches ("under development"), Other Solutions (industrial). *Collections/pages + "coming soon" states.*

---

## Part C — SEO & schema (PDF p20 emphasis)
- Add JSON-LD: **Organization**, **Product** (once real prices), **FAQPage**, **BreadcrumbList**, **Review**. Currently only Dawn defaults.
- Comparison tables + buying guides + FAQs as indexable long-form (refs the PDF cites: Mygate, Qubo, Urban Company).
- Meta titles/descriptions per category/product; internal linking between guide ↔ product ↔ category.

---

## Part D — Implementation plan (phased, evolve-first)

**Decision rule applied per item:** improve existing component if possible; new component only when none fits.

- **Phase 0 — Brand foundation (unblocks everything).** Self-host BR Sonoma (or fallback); add gold token family; repoint accent blue→gold in `otodor-base.css`; unify Dawn font setting; fix warranty copy sitewide; add monogram SVG + tagline lockup. *(Improve existing.)*
- **Phase 1 — Homepage brand truth.** Retint; add EMI-security beat + NavKar heritage beat; real flagship renders; reconsider `otodor-features` bento. *(Improve; 1–2 new sections.)*
- **Phase 2 — Navigation & IA.** Mega-menu with full taxonomy + "Get a Custom Quote"; footer taxonomy columns. *(Improve header/footer.)*
- **Phase 3 — Digital Locks landing + door-type selector + Wooden Door sub-page.** *(New templates, reuse card/comparison.)*
- **Phase 4 — Product page depth.** FAQ+schema, materials/engineering, EMI feature, downloads, richer comparison matrix, gallery/video. *(Improve `main-product` block set + comparison.)*
- **Phase 5 — AI Product Advisor / lead-gen quote form.** *(New — scope separately; needs backend/endpoint decision.)*
- **Phase 6 — SEO/schema + buying guides/FAQs + 85mm install guide page.** *(New content + snippets.)*
- **Phase 7 — Perf/a11y/QA loop.** Gold-contrast (WCAG AA), inline-CSS/GSAP-per-page weight, image optimization, JSON-LD validation.

---

## Part E — Dependencies & open decisions
- **BR Sonoma `.woff2` files** (licensed) — else pick a self-hostable near-match (candidates: Hanken Grotesk / General Sans / Geist — geometric grotesques close to Sonoma).
- **Champagne-gold accent** — confirm full pivot from blue (PDF-mandated) and exact hex(es) (e.g. `#C6A667`/`#D9BE87` warm; needs AA-contrast tuning on black + on white).
- **Real product data** — prices (WINDSOR/VAULTEX/FREDDY are ₹0), high-res flagship renders (ONYX/SENTRY/NEXUS/ZION+/ZEAL/OHM), metafields (`custom.access_methods`, `custom.positioning_line`, `custom.specs`, reveal/lifestyle).
- **AI Advisor backend** — where do leads go (Shopify customer/draft order, email, CRM, sheet)? Rules-based vs LLM recommendation?
- **Perf budget** — sections inline full CSS/JS; GSAP per-page from CDN (deferred item from HANDOFF).
