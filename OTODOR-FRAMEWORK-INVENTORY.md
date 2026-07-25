# OTODOR Commerce Framework — Module Inventory

> **The canonical register of every reusable section in the OTODOR commerce framework.** A new product
> category is built by *composing these modules and supplying data* — not by writing Liquid. Each entry lists
> the eight facts you need to reuse it: Name · Purpose · Data sources · Fallback chain · Visibility rule ·
> Reusable in · Dependencies · Status.

Companion docs: `OTODOR-MODULE-CONTRACT.md` (the standard), `OTODOR-PRODUCT-MODULES.md`,
`OTODOR-COLLECTION-TEMPLATE.md`, `OTODOR-DATA-MODEL.md`.

**Status legend**
- ✅ **Contract-compliant** — implements the full `OTODOR-MODULE-CONTRACT.md` (10-field doc block, 5-step
  lifecycle, single `has_content` gate, preset, a11y).
- ◑ **Framework section** — data-driven and self-hiding, predates the formal contract; retrofit the doc block
  when next edited.
- ○ **Brand/editorial** — narrative homepage section, outside the data-contract module set (listed for completeness).

---

## 1. Product Information Modules

Consumed by the `product.json` orchestrator (Gallery → Purchase → **modules** → Related → SEO). Order:
`main → reveal → specs → compatibility → install → warranty → downloads → comparison → related-products → sticky-atc`.

| Module | Purpose | Data sources (primary) | Fallback chain | Visibility rule | Reusable in | Dependencies | Status |
|---|---|---|---|---|---|---|---|
| **otodor-product-specs** | The specification ledger | `product.metafields.custom.specs` (grouped JSON) | metafield → `row` blocks → hide | Hidden if no metafield **and** no blocks | PDP, collection, landing, comparison source | `.otodor-ledger`, base.css | ✅ |
| **otodor-product-compat** | Will it fit my door/gate/opening? | `product.metafields[ns][key]` fit tags (default `custom.door_compatibility`) + `specs.door_thickness` / `specs.installation_type` | Tags: metafield → `tag` blocks → hide · Specs: `specs.*` → `spec` blocks → hide | Hidden when **both** tags and specs empty | PDP, comparison; **any category** (repoint tag metafield) | `.otodor-ledger`, base.css | ✅ |
| **otodor-product-install** | Installation flow + 85 mm clearance | `step` blocks / settings | blocks → built-in default stages; clearance note from setting (auto-hides if blank) | Always (has sensible defaults) | PDP, landing | base.css, `settings.otodor_whatsapp_number` | ◑ (doc block retrofit pending) |
| **otodor-product-warranty** | What the warranty covers, for how long | `custom.warranty_policies` metaobjects + `specs.warranty` / `specs.warranty_battery` | metaobjects → `policy` blocks → spec metafields on 2 slots → editable setting defaults → hide | Hidden only when all sources cleared | PDP, comparison, collection | `otodor-icon`, base.css; opt. `warranty_policy` metaobject | ✅ |
| **otodor-product-downloads** | Manuals, datasheets, certs, brochures | `product.metafields.custom.documents` (list.file_reference) | metafield files → `document` blocks → hide | Hidden if no document exists | PDP, collection, landing | base.css | ✅ |
| **otodor-product-reveal** | Editorial statement between purchase & specs | section setting (`statement`) | setting → hide when blank | Optional slot | PDP | base.css | ◑ |
| **otodor-comparison** | Compare products across the spec set | **Spec Engine**: registry × resolved products (`specs.*`) | product blocks → collection setting → current collection → current product + siblings → hide | Hidden if < 2 products; empty rows drop | PDP, collection, landing, any category | `otodor-spec-registry`, `otodor-spec-value`, `otodor-icon`, base.css | ✅ (engine consumer) |
| **otodor-sticky-atc** | Persistent purchase bar | `product`, variants, price | always on PDP | Scroll-triggered | PDP | `.otodor-sticky-atc`, base.css, JS | ◑ |

**Reused as-is (Dawn):** Gallery + Purchase (`main-product`), Video (`video`), FAQ (`collapsible-content`),
Related (`related-products`, self-hides), SEO (`rich-text`). See `OTODOR-PRODUCT-MODULES.md`.

---

## 1b. Specification Rendering Engine (shared snippets)

The reusable spec system (`OTODOR-SPEC-ENGINE.md`) that powers the comparison and every future spec surface.
Not sections — snippets consumed by sections. No consumer hardcodes a spec name.

| Snippet | Purpose | Data sources | Fallback chain | Visibility rule | Reusable in | Dependencies | Status |
|---|---|---|---|---|---|---|---|
| **otodor-spec-registry** | Single source of truth: every spec definition (10-col records) | built-in canonical set (20 specs) + optional `comparison_spec` metaobjects | metaobject overrides built-in by id → built-in | Emits requested view (`only_comparable` / `group` / `ids`) | Comparison, highlights, landing, search-intent, API | — | ✅ |
| **otodor-spec-value** | Value resolver + 10 type renderers (the render engine) | `product.metafields[ns][key]` or `raw_value` | raw_value → metafield → default → '—' (comparison) / nothing (inline) | per renderer | Every spec consumer | `otodor-icon`, `.otodor-spec__*` in base.css | ✅ |

**Renderers:** boolean · range · number · text · badge · chip · rating · link · document · image. Add a type =
one `when` branch; add a spec = one registry record. Zero section edits either way.

## 1c. Schema Registry (structured data)

Centralized JSON-LD generation (`OTODOR-STRUCTURED-CONTENT.md`). One dispatched snippet; every object gated by
data sufficiency. Consumes the same Shopify data the UI renders — no content duplicated for schema.

| Snippet / mode | Emits | Source | Gate | Reusable in | Status |
|---|---|---|---|---|---|
| **otodor-schema** (`graph`, from `theme.liquid` head) | Organization, WebSite, BreadcrumbList, CollectionPage, VideoObject — one `@graph` | shop/settings, `product.collections`, `collection`, `product.media` | each object only when data exists | every page | ✅ |
| **otodor-schema** (`build: 'faqpage'`) | FAQPage | a section's `collapsible_row` blocks | ≥1 Q&A | FAQ (product + collection) | ✅ |
| **otodor-schema** (`build: 'howto'`) | HowTo | `step` blocks | ≥2 steps, opt-in | Install (genuine instructions only) | ✅ |

**Not re-emitted (already native):** Product / Offer / AggregateRating (Shopify `structured_data` in
`main-product`). **Consumers:** `theme.liquid` (graph), `collapsible-content` (faqpage), `otodor-product-install`
(howto, opt-in). Deferred: Product `additionalProperty` (from the Spec Registry) + `Offer.warranty` — needs a
reviewed Product-ownership change (see `OTODOR-STRUCTURED-CONTENT.md` §5).

## 2. Collection Framework sections

Composed by `templates/collection.json` (inherited by every category); Digital Locks is instantiated by
`templates/collection.digital-locks.json` (config only). See `OTODOR-COLLECTION-TEMPLATE.md`.

| Section | Purpose | Data sources (primary) | Fallback chain | Visibility rule | Reusable in | Dependencies | Status |
|---|---|---|---|---|---|---|---|
| **otodor-collection-hero** | Dark brand handshake for a category | collection `custom.hero_*` / `custom.category_intro` | metafields → collection title/description/count → theme defaults | Never (always has collection title) | All categories | base.css | ◑ |
| **otodor-category-selector** | "Choose your type" chooser (reference impl.) | `category` blocks → collection (title/image/desc via `custom.menu_*`) | per-block override → collection → collection image → 1st product image → gradient | Hidden if no `category` blocks | Home, collection, landing, PDP cross-sell | `otodor-icon`, base.css | ✅ (reference) |
| **otodor-collection-grid** | Product discovery grid | collection products | products → collection empty state | Hides grid if 0 products | All categories | base.css | ◑ |
| **otodor-features** | Feature highlights | `feature` blocks *(ext: `custom.feature_highlights`)* | blocks → hide | Hidden if no `feature` blocks | All categories, home | base.css | ◑ |
| **otodor-why** | "Why OTODOR" statements | `statement` blocks | blocks → hide | Hidden if no `statement` blocks | All categories, home | base.css | ◑ |

**Optional slots (Dawn, added per instance):** `rich-text` (Content / SEO), `collapsible-content` (FAQ),
`related-products`.

---

## 2b. Content Experience Layer

Native-first educational content (`OTODOR-CONTENT-LAYER.md`). Guides are authored as Shopify **Articles/Pages**
(canonical source); these sections **surface** them by reference — no long-form duplicated, no Article schema
re-emitted (the article page owns it).

| Section | Purpose | Data sources (primary) | Fallback chain | Visibility rule | Reusable in | Dependencies | Status |
|---|---|---|---|---|---|---|---|
| **otodor-content-guide** | Surface one guide (buying/install/compat/…) | section Article pick | Article → Page → product/collection ref metafield (configurable, default `custom.buying_guide`) → hide | Hidden if no source resolves | PDP, collection, home, article — any guide type via the key | base.css | ✅ |
| **otodor-content-rail** | Related educational reading | product/collection `custom.related_guides` (list.article_reference) | metafield list → chosen blog's latest → hide | Hidden if 0 articles | PDP, collection, article, home | base.css | ✅ |

**Reused as-is (Dawn):** `main-article`/`main-blog`/`main-page` (+ `article \| structured_data` owns Article
JSON-LD), `featured-blog`, `article-card`. Content metafields: `custom.buying_guide` / `installation_guide` /
`compatibility_guide` (article_reference) + `custom.related_guides` (list.article_reference).

## 3. Cross-cutting brand sections

Homepage/brand narrative. Data-driven where noted, but outside the product/collection data-contract set —
listed so the inventory is complete.

| Section | Purpose | Data sources | Visibility | Status |
|---|---|---|---|---|
| **otodor-hero** | Homepage hero | section settings | Always | ○ |
| **otodor-categories** | Homepage category grid | blocks / collections | Per instance | ○ |
| **otodor-moments** | Pinned scroll storytelling | blocks | Per instance | ○ |
| **otodor-trust-bar** | Credibility strip | settings/blocks | Per instance | ○ |
| **otodor-process** | How it works | blocks | Per instance | ○ |
| **otodor-ecosystem** | Product ecosystem | blocks | Per instance | ○ |
| **otodor-smart-living** | Lifestyle band | settings | Per instance | ○ |
| **otodor-testimonials** | Social proof | blocks | Per instance | ○ |
| **otodor-cta-banner** | Lead-capture CTA (→ contact-form, STEP 8) | settings | Per instance | ○ |
| **otodor-products** | Curated product rail | collection/products | Per instance | ○ |
| **otodor-search** | Search surface | Shopify search | Route-driven | ○ |
| **otodor-footer** | Brand footer | settings + navigation | Always | ○ |

---

## 4. Coverage summary

- **Contract-compliant modules (✅):** 6 — `otodor-product-specs`, `otodor-product-compat`,
  `otodor-product-warranty`, `otodor-product-downloads`, `otodor-category-selector` (reference),
  `otodor-comparison` (spec-engine consumer).
- **Spec Rendering Engine (✅):** `otodor-spec-registry`, `otodor-spec-value` — reusable across all consumers.
- **Framework sections pending doc-block retrofit (◑):** `otodor-product-install`, `otodor-product-reveal`,
  `otodor-sticky-atc`, `otodor-collection-hero`, `otodor-collection-grid`, `otodor-features`, `otodor-why`.
  All are already self-hiding/data-driven; retrofit adds the 10-field block.
- **Content Experience Layer (✅, STEP 7):** `otodor-content-guide`, `otodor-content-rail` — surface native
  Articles/Pages by reference.
- **Genuinely new (STEP 4b):** Compatibility, Warranty, Downloads. **STEP 5:** the Spec Rendering Engine.
  **STEP 6:** the Schema Registry. **STEP 7:** the Content Experience Layer.

## 5. Building a new category (recap)

1. Create the collection; assign `collection.json` (or a `collection.<handle>.json` copy).
2. Populate collection metafields (`custom.menu_*`, `hero_*`, …) and product metafields (`specs.*`, `custom.*`).
3. Point the Category Selector / Compatibility tag source at the category's data. **No Liquid changes** — every
   module self-hides until its data exists, then lights up.

> Retrofit rule: whenever a ◑ section is next edited, bring it to ✅ by adding the
> `OTODOR-MODULE-CONTRACT.md` §4 doc block and confirming the §6 conformance checklist.
