# OTODOR Commerce Component Library — Architecture

> **This is a system, not a page.** Digital Locks is the **blueprint**; every future category
> (Gate Automation, Video Door Bells, Smart Home, Security Systems, Other Solutions) must be
> buildable from the **same reusable sections** with only configuration + Shopify data changes.
> No section may be Digital-Locks-only. Data comes from Shopify (collections, products,
> metafields, metaobjects, recommendations, navigation); hardcoding is a last resort.

Companion docs: `OTODOR-AUDIT.md` (Brand-PDF audit + phases), `PROJECT.md`, `HANDOFF.md`.

---

## 1. Composition model

The flagship page is a **collection template** — `templates/collection.digital-locks.json` — assigned to the
`digital-locks` collection in admin. It composes the sections below in order. Every other category gets its own
`collection.<handle>.json` reusing the **same section types** with different settings/metafields. Product-context
sections (specs, comparison, install) are also droppable on `product.json`.

```
collection.digital-locks.json
  otodor-collection-hero      (category hero)
  otodor-category-selector        (door-type selector)        ← NEW, reusable
  otodor-categories           (product category grid)     ← REUSE
  otodor-why                  (why OTODOR Digital Locks)   ← REUSE
  otodor-features             (feature highlights)         ← REUSE
  otodor-auth-methods         (authentication methods)     ← NEW, reusable (or REUSE features)
  otodor-comparison           (comparison table)           ← EXTEND → spec-driven
  otodor-buying-guide         (buying guide)               ← NEW (or REUSE rich-text/multicolumn)
  otodor-process              (installation process)       ← REUSE
  otodor-trust-bar            (warranty & support proof)   ← REUSE
  otodor-faq                  (FAQs + FAQPage schema)      ← EXTEND collapsible-content
  related-products            (related products)           ← REUSE (Shopify recommendations)
  otodor-lead-capture         (lead capture)               ← NEW (or REUSE contact-form)
  otodor-seo-content          (SEO long-form)              ← REUSE rich-text/multicolumn
```

---

## 2. Shopify data model (the reusable backbone)

Reusability comes from **data living on Shopify objects**, not in each template.

### 2.1 Collection metafields (namespace `custom`)
| key | type | used by |
|---|---|---|
| `menu_icon` | single line (otodor-icon name) | mega menu, category grid, door selector |
| `menu_description` | multi-line | mega menu, category grid |
| `menu_image` | file/image | mega menu CTA, category cards |
| `hero_eyebrow`, `hero_subheading` | text | collection hero |
| `buying_guide` | rich text | buying guide section |
| `faq` | list of `faq` metaobjects | FAQ section |
| `door_types` | list of `door_type` metaobjects | door-type selector |

### 2.2 Product metafields (namespace `specs` + existing `custom`)
Drives product page **and** the comparison table (one source, no duplication).
- Existing: `custom.positioning_line`, `custom.access_methods`.
- New spec set (per PDF matrix): `specs.face_recognition`, `specs.fingerprint`, `specs.cards`, `specs.bolts`,
  `specs.door_thickness`, `specs.weight`, `specs.deadbolt`, `specs.two_way_talk`, `specs.doorbell`,
  `specs.inside_screen`, `specs.battery`, `specs.backup_port`, `specs.warranty`, `specs.build_material`.
  Types: boolean or single-line. A generic comparison reads any `specs.*` key by handle.

### 2.3 Metaobjects (cross-page, merchant-managed, Search-&-Discovery friendly)
- **`faq`** — fields: `question` (text), `answer` (rich text), `category` (optional). Referenced by collections/products.
- **`door_type`** — fields: `title`, `icon`, `image`, `description`, `collection`/`url`. Powers the door-type selector; reusable on home/PDP.
- **`authentication_method`** — fields: `name`, `icon`, `description`. Powers Authentication Methods; reusable on PDP.
- **`spec_row`** *(optional)* — fields: `label`, `metafield_key`, `type`. Lets the comparison define rows without editing Liquid.

> Metaobjects are the "last mile" of reusability: define once, reference from any collection/product. Sections
> should accept **either** a metaobject list **or** local blocks, so the theme works before metaobjects are set up.

---

## 3. Section map (14 sections)

Legend — **Verdict:** REUSE (use as-is) · EXTEND (enhance existing) · NEW (build once, reusable everywhere).

### 3.1 Hero — `otodor-collection-hero` · **REUSE**
- **Purpose:** premium category intro (name, promise, count).
- **Inputs:** collection title/description/count; eyebrow/subheading.
- **Shopify source:** `collection` object + collection metafields (`hero_*`).
- **Settings:** eyebrow, fallback line, moment line/sub, show count.
- **Blocks:** none. **Metafields:** `custom.hero_eyebrow/subheading`.
- **Reusable elsewhere:** YES — every collection. **Merchant editable:** YES.

### 3.2 Door Type Selector — `otodor-category-selector` · **NEW (reusable)**
- **Purpose:** help the customer pick the right lock category (Wooden / Glass / Metal / Padlocks) — PDF signature UX.
- **Inputs:** door types (icon, label, image, target collection/url).
- **Shopify source:** `door_type` metaobjects **or** collections referenced per block; icons via otodor-icon.
- **Settings:** heading, eyebrow, layout (cards/tabs), "custom / ask an expert" CTA.
- **Blocks:** `door_type` (collection picker + icon + image + blurb) — falls back to metaobject list.
- **Metafields:** collection `menu_icon`, `menu_image`.
- **Reusable elsewhere:** YES — Home, other category pages, PDP cross-sell. **Merchant editable:** YES.

### 3.3 Product Category Grid — `otodor-categories` · **REUSE**
- **Purpose:** show sub-categories / product groupings as premium cards.
- **Inputs:** collections, titles, taglines, images, grid size.
- **Shopify source:** `collection` per block (+ product image).
- **Settings:** eyebrow, heading/accent. **Blocks:** `category_card` (collection, title, tagline, grid_size, badge, image).
- **Metafields:** optional collection image/description.
- **Reusable elsewhere:** YES (already on Home). **Merchant editable:** YES.

### 3.4 Why OTODOR Digital Locks — `otodor-why` · **REUSE**
- **Purpose:** credibility manifesto (German engineering, 304 steel, 16 yrs, installed-not-delivered).
- **Inputs:** paired statements. **Shopify source:** none (brand copy).
- **Settings:** eyebrow. **Blocks:** `statement` (lead + counter). **Metafields:** —.
- **Reusable elsewhere:** YES (on Home already). **Merchant editable:** YES.

### 3.5 Feature Highlights — `otodor-features` · **REUSE**
- **Purpose:** flagship feature bento (fingerprint, app, remote, RFID, PIN, audit).
- **Inputs:** feature tiles. **Shopify source:** none / images.
- **Settings:** eyebrow, heading, subheading. **Blocks:** `feature` (tile_size, motif, image, icon, title, description).
- **Metafields:** —. **Reusable elsewhere:** YES. **Merchant editable:** YES.

### 3.6 Authentication Methods — `otodor-auth-methods` · **NEW (reusable)** *(or REUSE `otodor-features`)*
- **Purpose:** the access modes (Face, Fingerprint, Card, Password, Key, App) — PDF emphasis.
- **Inputs:** method name, icon, description.
- **Shopify source:** `authentication_method` metaobjects **or** blocks; product `custom.access_methods` on PDP.
- **Settings:** heading, layout. **Blocks:** `method` (icon, name, description).
- **Metafields:** product `custom.access_methods`.
- **Reusable elsewhere:** YES — PDP, other electronic categories. **Merchant editable:** YES.
- *Decision:* if `otodor-features` covers it visually, reuse it; only build if a distinct compact layout is wanted.

### 3.7 Comparison Table — `otodor-comparison` · **EXTEND → spec-driven**
- **Purpose:** compare models on any spec set. **Today:** rows are hardcoded lock features → not reusable.
- **Change:** columns = **product blocks** (product picker → title/image/price/url); rows = **spec-row blocks**
  (label + `specs.<key>` + type) reading each product's metafield, with manual fallback.
- **Shopify source:** `product` objects + `specs.*` product metafields.
- **Settings:** eyebrow, heading, sticky first column. **Blocks:** `product_column`, `spec_row`.
- **Metafields:** `specs.*`. **Reusable elsewhere:** YES — every category. **Merchant editable:** YES.

### 3.8 Buying Guide — `otodor-buying-guide` · **NEW** *(or REUSE `rich-text`/`multicolumn`)*
- **Purpose:** help-me-choose content (door thickness, indoor/outdoor, 85 mm clearance, use cases) + SEO.
- **Inputs:** guide steps/points, optional images.
- **Shopify source:** collection `custom.buying_guide` rich text; or blocks; or link to a blog article.
- **Settings:** heading, layout. **Blocks:** `point` (icon, title, body, image).
- **Metafields:** `custom.buying_guide`.
- **Reusable elsewhere:** YES. **Merchant editable:** YES.
- *Decision:* start by REUSING `rich-text` + `multicolumn`; only build `otodor-buying-guide` if a richer, repeatable pattern is needed.

### 3.9 Installation Process — `otodor-process` · **REUSE**
- **Purpose:** consultation → install → setup → support; include the **85 mm clearance** note.
- **Settings:** eyebrow, heading, promise, estimate, trust line. **Blocks:** `step` (title, description, duration, image).
- **Shopify source:** none. **Metafields:** —.
- **Reusable elsewhere:** YES (on Home already). **Merchant editable:** YES.

### 3.10 Warranty & Support — `otodor-trust-bar` · **REUSE** *(or a small warranty block)*
- **Purpose:** 3-yr lock / 1-yr battery, PAN-India install, 24/7 support, 10,000+ homes.
- **Settings:** speed, pause, aria. **Blocks:** `pillar` (icon, title). **Shopify source:** none.
- **Reusable elsewhere:** YES. **Merchant editable:** YES.
- *Note:* for a dedicated warranty panel, a small `rich-text`/`multicolumn` instance also works — no new section required.

### 3.11 FAQs — `otodor-faq` · **EXTEND `collapsible-content`**
- **Purpose:** category FAQs **with `FAQPage` JSON-LD** (collapsible-content has none).
- **Change:** either add JSON-LD to a thin wrapper, or a new `otodor-faq` that renders `faq` metaobjects/blocks + schema.
- **Shopify source:** `faq` metaobjects (collection `custom.faq`) **or** row blocks.
- **Settings:** heading, layout. **Blocks:** `question` (question, answer) — fallback when no metaobjects.
- **Metafields:** collection `custom.faq`. **Reusable elsewhere:** YES — PDP, any category. **Merchant editable:** YES.

### 3.12 Related Products — `related-products` (Dawn) · **REUSE**
- **Purpose:** cross-sell. **Shopify source:** **Shopify product recommendations API** (`recommendations`).
- **Settings:** heading, products_to_show, columns, image ratio. **Blocks:** none. **Metafields:** —.
- **Reusable elsewhere:** YES (already on PDP). **Merchant editable:** YES. *No new work.*

### 3.13 Lead Capture — `otodor-lead-capture` · **NEW** *(or REUSE `contact-form` + `otodor-cta-banner`)*
- **Purpose:** capture qualified leads (door type, city, needs) → this is the on-ramp to the Phase 5 AI Advisor.
- **Inputs:** form fields; submits via Shopify `{% form 'contact' %}` (native, no backend).
- **Shopify source:** Shopify contact form → store notifications/customers.
- **Settings:** heading, sub, success message, fields toggles. **Blocks:** `field` (type, label, required).
- **Metafields:** —. **Reusable elsewhere:** YES. **Merchant editable:** YES.
- *Decision:* v1 = REUSE `otodor-cta-banner` (CTA to quote) + Dawn `contact-form`; build `otodor-lead-capture` when the AI Advisor lands (Phase 5).

### 3.14 SEO Content — `rich-text` / `multicolumn` (Dawn) · **REUSE**
- **Purpose:** indexable long-form (keyword clusters, internal links) — PDF SEO direction.
- **Shopify source:** section richtext; collection `custom.buying_guide`.
- **Settings:** Dawn richtext settings. **Blocks:** Dawn. **Metafields:** optional.
- **Reusable elsewhere:** YES. **Merchant editable:** YES. Pair with `JSON-LD` (Product/FAQ/Breadcrumb) in Phase 6.

---

## 4. Reuse audit summary
| Requested section | Existing asset | Verdict |
|---|---|---|
| Hero | `otodor-collection-hero` | REUSE |
| Door Type Selector | — | **NEW** (reusable) |
| Product Category Grid | `otodor-categories` | REUSE |
| Why | `otodor-why` | REUSE |
| Feature Highlights | `otodor-features` | REUSE |
| Authentication Methods | `otodor-features` (maybe) | NEW or REUSE |
| Comparison Table | `otodor-comparison` | **EXTEND** (spec-driven) |
| Buying Guide | `rich-text`/`multicolumn` | REUSE (NEW if needed) |
| Installation Process | `otodor-process` | REUSE |
| Warranty & Support | `otodor-trust-bar` | REUSE |
| FAQs | `collapsible-content` | **EXTEND** (+ JSON-LD) |
| Related Products | `related-products` (Dawn) | REUSE |
| Lead Capture | `contact-form` + `otodor-cta-banner` | REUSE (NEW in Phase 5) |
| SEO Content | `rich-text`/`multicolumn` | REUSE |

**Net new sections to build: 2** (Door Type Selector, spec-driven Comparison extension) + FAQ-schema extension.
Everything else reuses the mature library. This keeps the repo recognizably Viltrumate while adding the OTODOR commerce system.

---

## 5. Build order (small reviewable commits)
1. **Data model** — document + define metafield/metaobject keys (admin) [this doc]; wire product `specs.*` reading helper snippet.
2. **Comparison → spec-driven** (`otodor-comparison` extend): product-block columns + spec-row blocks + metafield reads. *(Blueprint-critical.)*
3. **Door Type Selector** (`otodor-category-selector`, new, metaobject/collection-driven).
4. **FAQ + FAQPage schema** (extend `collapsible-content` or new `otodor-faq`).
5. **Compose `collection.digital-locks.json`** from the section library (hero → selector → grid → why → features → auth → comparison → guide → process → warranty → faq → related → lead → seo).
6. **Verify + assign** the template to the `digital-locks` collection; QA on dev server.

Each step: Architecture-review → Implement → Self-review → Commit → Next.
