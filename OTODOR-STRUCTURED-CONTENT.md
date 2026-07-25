# OTODOR Structured Content & SEO Foundation — Architecture + Audit

> **STEP 6 is a reusable structured-content framework, not isolated FAQ schema.** One **Schema Registry**
> centralizes JSON-LD generation the way the Spec Registry centralized spec rendering: each schema type has
> one builder, gated by data sufficiency, composed into a single page-level `@graph`. Structured data
> **emerges from the same Shopify data that renders the UI** — never content duplicated solely for schema.

Companion docs: `OTODOR-SPEC-ENGINE.md`, `OTODOR-MODULE-CONTRACT.md`, `OTODOR-DATA-MODEL.md`,
`OTODOR-FRAMEWORK-INVENTORY.md`.

---

## 1. What already exists (audit — do NOT duplicate)

| Emitter | Schema | Verdict |
|---|---|---|
| `sections/main-product.liquid:736` | **Product** via Shopify `{{ product \| structured_data }}` (name, image, description, sku, brand, **Offer**, **AggregateRating**) | **KEEP.** Battle-tested. Never emit a second Product. |
| `sections/header.liquid` | **Organization**, **WebSite** (+ SearchAction) | **MOVE** into the registry (centralize; still one each). |
| `sections/main-article.liquid`, `featured-product.liquid` | Article / Product via `structured_data` | KEEP (not on the commerce path we're building). |

**Missing (the registry adds these):** BreadcrumbList, CollectionPage, FAQPage, HowTo, VideoObject.

---

## 2. Structured-content module audit

Each: Purpose · Primary Shopify data · Structured-data opportunity · Reusable? · Merchant-editable?

| Module | Purpose | Primary Shopify data | Structured-data opportunity | Reusable? | Editable? |
|---|---|---|---|---|---|
| **FAQ** | Answer buying questions | `collapsible-content` `collapsible_row` blocks (heading + richtext) *(ext: `custom.faqs`)* | **FAQPage** (emit from the same blocks) | YES (product + collection) | YES |
| **Buying Guide** | Educate pre-purchase | pages / blog articles (STEP 7) | **Article** (when it's an article) — deferred to STEP 7 | YES | YES |
| **Installation** | Set install expectations | `otodor-product-install` `step` blocks | **HowTo** — *only if* steps are user-followable instructions. OTODOR's stages are a professional-install *service* process → does **not** qualify by default. Ship the builder + opt-in (default off). | YES | YES |
| **Warranty** | Explain coverage | `otodor-product-warranty` (specs.warranty, metaobjects) | `Offer.warranty` (WarrantyPromise) — requires owning the Product object → **deferred** (see §5). | YES | YES |
| **Downloads** | Manuals / datasheets | `otodor-product-downloads` (`custom.documents`) | **None appropriate.** No robust schema type for manuals; `Product.hasDocumentation` is non-standard. **Decision: keep as linked assets, no schema.** | YES | YES |
| **Technical Specifications** | The spec matrix | `specs.*` via the **Spec Registry** | `Product.additionalProperty` (PropertyValue[]) built from the spec registry — requires owning Product → **deferred** (see §5). | YES | via metafields |
| **Product Highlights** | Key selling points | `specs.*` subset | No distinct schema type. | YES | via metafields |

---

## 3. Schema opportunity audit (every candidate type)

| Type | Emit when | Source | Owner (STEP 6) |
|---|---|---|---|
| **Organization** | always | shop + settings (logo, socials) | Registry (moved from header) |
| **WebSite** | always | shop + search route | Registry (moved from header) |
| **BreadcrumbList** | product & collection pages | Shopify hierarchy (`product.collections.first`, `collection.url`) | Registry — **NEW** |
| **CollectionPage** | collection pages | `collection` | Registry — **NEW** |
| **Product** | product pages | `product` | Shopify `structured_data` (unchanged) |
| **Offer** | with Product | `product` variants/price | inside Shopify Product |
| **AggregateRating / Review** | when a reviews app populates `product.metafields.reviews.*` | reviews metafields | inside Shopify Product |
| **FAQPage** | ≥1 Q&A | `collapsible-content` blocks | FAQ section → registry builder — **NEW** |
| **HowTo** | ≥2 *instructional* steps, opt-in | `otodor-product-install` blocks | Install section → registry builder — **NEW, default off** |
| **VideoObject** | product has a video with a thumbnail | `product.media` (video) | Registry — **NEW, gated** |
| **ImageObject** | covered by Product `image` | `product.featured_image` | inside Shopify Product |

**Gate rule (from the module contract's spirit):** every builder emits **only when sufficient data exists**;
otherwise it contributes nothing to the graph. No empty or placeholder schema, ever.

---

## 4. The Schema Registry — `snippets/otodor-schema.liquid`

A single dispatched snippet. Centralizes all JSON-LD generation so Product/FAQ/Breadcrumb/HowTo objects can
never be duplicated or drift apart.

### Modes (`build` param)
- **`graph`** (default) — rendered **once** from `theme.liquid` `<head>`. Composes a single
  `{"@context":"https://schema.org","@graph":[…]}` of all page-level objects that have data:
  Organization, WebSite, BreadcrumbList, CollectionPage, VideoObject.
- **`faqpage`** — `{% render 'otodor-schema', build: 'faqpage', faq_section: section %}` → a standalone
  FAQPage `<script>` from a section's `collapsible_row` blocks. Called by the FAQ section where the data lives.
- **`howto`** — `{% render 'otodor-schema', build: 'howto', howto_section: section, howto_name: '…' %}` →
  a standalone HowTo `<script>` from `step` blocks (≥2). Called by the install section (opt-in).

### Why hybrid (Liquid reality)
Sections render in isolation and Liquid has no shared page-level mutable state, so block-sourced schema
(FAQ, HowTo) is emitted where the blocks live — but through the **same registry builder**, so the JSON shape
is defined once. Everything derivable from page objects (product/collection/shop) lives in the single `@graph`.

### JSON construction
No `parse_json`/hash literals in Liquid → objects are built with `{%- capture -%}` + the **`| json`** filter on
every dynamic value (safe quoting/escaping), collected with a `§` separator and `split | join: ','` so no
trailing commas. `request.origin | append: object.url` builds absolute URLs.

---

## 5. Deferred by design (documented, not forgotten)

Adding `additionalProperty` (from the Spec Registry) and `Offer.warranty` to **Product** would require
**replacing** Shopify's `structured_data` Product with a registry-built Product — otherwise two Product objects
(duplication, the cardinal sin). That is a deliberate, separately-reviewed change (a `build: 'product'` mode +
removing `main-product.liquid:736`). **Not** done in STEP 6 to avoid regressing the maintained Offer/rating
output. When taken: the Product's `additionalProperty` is generated from `otodor-spec-registry` × the product's
metafields — the schema layer literally consuming the same registry the comparison UI consumes.

---

## 6. Implementation order
1. Audit (this doc). 2. **Schema Registry** (`otodor-schema.liquid`: graph + faqpage + howto) + wire into
`theme.liquid`, remove Org/WebSite from header. 3. **FAQ** — extend `collapsible-content` (auto-hide +
FAQPage opt-in). 4. **Breadcrumb** (in the graph). 5. **Product** — audit only (keep Shopify's; §5). 6.
**HowTo** — opt-in on install. 7. **VideoObject** (in the graph, gated). 8. Self-review. 9. Commit per step.

## 7. SEO principles (enforced)
- Structured data **consumes the same data that renders the UI**; never duplicate content for schema.
- **Native-first:** Shopify's Product/Offer/rating stays Shopify's; we add only what's missing.
- **Emit only when sufficient data exists**; a sparse page emits a smaller, still-valid graph.
- **One object per type per page** — centralization prevents drift and duplication.
