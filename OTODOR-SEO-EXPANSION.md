# OTODOR SEO Expansion — STEP 9

> Builds on the STEP 6 Schema Registry (`OTODOR-STRUCTURED-CONTENT.md`). Same principles: structured data
> **emerges from the data that renders the UI**, native-first, one object per type per page, emit only when
> data is sufficient. STEP 9 strengthens the **brand entity** and **crawl/performance hygiene** — the safe,
> shippable SEO surface — and **formally re-defers the Product-schema rewrite** with a sharpened rationale.

Companion docs: `OTODOR-STRUCTURED-CONTENT.md` (Schema Registry), `OTODOR-FRAMEWORK-INVENTORY.md`.

---

## 1. Decision: defer the Product-ownership rewrite (again, on purpose)

STEP 6 §5 deferred adding `additionalProperty` (spec registry) and `Offer.warranty` to Product because it
requires **replacing** Shopify's `{{ product | structured_data }}` (which emits Product + Offer +
AggregateRating). STEP 9 keeps it deferred — the rationale is now stronger, not weaker:

- **No data to enrich with yet.** Product prices are ₹0 (WINDSOR/VAULTEX/FREDDY) and `specs.*` metafields are
  unpopulated. `additionalProperty` would be empty; an `Offer` at ₹0 risks Google "invalid price" penalties.
- **Regression risk with no verification path.** The sandbox cannot run Google's Rich Results Test (needs the
  public store). Hand-rolling Offer/availability/rating to replace maintained Shopify output, unverified, is a
  net SEO risk while the upside is nil.

**Trigger to take it (a future STEP):** real prices + populated `specs.*`. Then `build:'product'` (Product +
Offer gated to price>0 + AggregateRating + `additionalProperty` from `otodor-spec-registry` + `Offer.warranty`),
remove `main-product.liquid` `structured_data`, verify live. Until then, Shopify owns Product.

---

## 2. What STEP 9 ships (safe, no regression)

### 2.1 Organization → a real brand entity (knowledge-graph SEO)
The graph's Organization node was name/url/logo/sameAs only. STEP 9 enriches it — all from existing data or
optional settings, each field gated so a sparse store still emits a valid node:

| Field | Source | Gate |
|---|---|---|
| `description` | `shop.description` | non-blank |
| `slogan` | `settings.otodor_org_slogan` (default "Secure. Smart. Automatic.") | non-blank |
| `foundingDate` | `settings.otodor_org_founding_year` | non-blank (merchant sets, e.g. 2008) |
| `contactPoint` | `settings.otodor_whatsapp_number` → `telephone` (+cc), `contactType:"customer service"`, `areaServed:"IN"`, `availableLanguage:["en","hi"]` | whatsapp number present |
| `logo` / `sameAs` | existing (settings.logo, social_* links) | unchanged |

One Organization, still `@id`-anchored so WebSite/others keep referencing it. No new object types — this
enriches the existing node (no duplication).

### 2.2 Head / crawl performance hygiene (`theme.liquid`)
- **`preconnect` + `dns-prefetch` to `cdn.shopify.com`** — the origin every image/asset loads from. Shaves the
  first asset's connection setup (LCP → Core Web Vitals → ranking). Fonts are self-hosted, so no third-party
  font preconnect is needed (a deliberate perf win already in place).
- Canonical (`{{ canonical_url }}`), OG/Twitter (Dawn `meta-tags`), title template, `page_description` — audited
  present and correct; left as-is (evolve, don't rewrite).

---

## 3. Explicitly out of scope (native / not theme-controllable)
- **`sitemap.xml`** — Shopify auto-generates and maintains it; not a theme file. "Sitemap polish" reduces to
  canonical/robots correctness, which Dawn + the canonical tag already handle.
- **Product / Offer / AggregateRating** — stays Shopify's (see §1).
- **hreflang** — only meaningful with multi-market/locale routing; not configured. Deferred.

## 4. Verification
`shopify theme check` clean vs. baseline. JSON-LD is valid by construction (`| json` on every dynamic value).
**Verify live** with Google's Rich Results Test / Schema Markup Validator once the store is public — the
sandbox cannot render Liquid for external crawlers.
