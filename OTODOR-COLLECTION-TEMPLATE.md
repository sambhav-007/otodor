# OTODOR Collection Template — Framework API

> A **generic, category-agnostic collection framework**. Every OTODOR category (Digital Locks, Gate
> Automation, Security Systems, Smart Home, …) inherits the same composition and lights up sections by
> supplying data. No section contains category-specific assumptions. Digital Locks is the **first consumer**,
> instantiated by configuration only (`templates/collection.digital-locks.json`) — never by forking section code.

Companion docs: `OTODOR-DATA-MODEL.md`, `OTODOR-COMMERCE-ARCHITECTURE.md`.

---

## Purpose
Turn any collection into a premium category landing page by composing **reusable, self-hiding sections** that
read from Shopify (collection, products, metafields, recommendations). The template is the same everywhere;
only the data and per-instance settings differ.

## Expected Shopify objects
- **Collection** (required) — title, description, image, products, url. The template runs on the collection page.
- **Collection metafields** (optional) — `custom.menu_*`, `custom.category_intro`, `custom.hero_*`, `custom.faqs`,
  `custom.seo_content`, … (see data model). All optional; absence → section falls back or hides.
- **Products** (optional) — power the product grid + recommendations. A collection with no products hides the grid.
- **Product recommendations** — Shopify API for Related Products.

---

## Composition & per-section contract

Legend: **Core** = present in the default `collection.json` (inherited by all). **Optional slot** = added per
instance where editorial content exists (its Dawn implementation doesn't self-hide). Every section must handle
**no data / partial data / complete data** and **never render a broken placeholder**.

| # | Slot | Section | Core? | Data-source priority | Auto-hide when |
|---|---|---|---|---|---|
| 1 | Collection Hero | `otodor-collection-hero` | Core | collection metafields (`hero_*`, `category_intro`) → collection title/description/count → theme defaults | never (always has collection title) |
| 2 | Category Selector | `otodor-category-selector` | Core | `category` blocks (collection-driven) → per-block overrides | no `category` blocks |
| 3 | Product Grid | `otodor-collection-grid` | Core | collection products | collection has 0 products |
| 4 | Feature Highlights | `otodor-features` | Core | `feature` blocks → *(ext: collection `custom.feature_highlights`)* → hide | no `feature` blocks |
| 5 | Why OTODOR | `otodor-why` | Core | `statement` blocks | no `statement` blocks |
| 6 | Content Section | Dawn `rich-text` | Optional slot | section blocks → collection `custom.category_intro` | added only with content |
| 7 | FAQ | Dawn `collapsible-content` (→ + FAQ schema, STEP 6) | Optional slot | `collapsible_row` blocks → *(ext: `custom.faqs`)* | added only with rows |
| 8 | Related Products | Dawn `related-products` | Core | Shopify recommendations API | no recommendations (Dawn self-hides) |
| 9 | Lead Capture | `otodor-cta-banner` (→ `contact-form`, STEP 8) | Optional slot | section settings | added per instance |
| 10 | SEO Content | Dawn `rich-text` | Optional slot | section blocks → collection `custom.seo_content` | added only with content |

**Required sections:** Hero, Product Grid (the minimum viable collection page).
**Optional sections:** everything else — hidden automatically when empty, so a bare collection degrades to
Hero → Grid → Related.

---

## Section lifecycle (guarantee)
Each reusable OTODOR section now guards its own render:
- `otodor-category-selector`, `otodor-features`, `otodor-why` → render **nothing** when they have no blocks.
- `otodor-collection-grid` → shows products or the collection's empty state.
- `related-products` (Dawn) → self-hides when recommendations are unavailable.

Result: **partial data never leaves a stranded header or empty band.**

---

## Extension points
- **Collection metafields as a data source** — sections marked *(ext)* can later read collection metafields
  (`custom.feature_highlights`, `custom.faqs`) as a fallback when no blocks are set. Documented, additive, optional.
- **Color scheme** — `otodor-category-selector` (and future sections) expose light/dark, so the framework adapts
  to a collection's tone.
- **New categories** — copy `collection.digital-locks.json` → `collection.<handle>.json`, repoint the Category
  Selector blocks and metafields. No Liquid changes.

---

## Fallback behaviour (summary)
1. Prefer the most specific merchant input (section blocks / per-block overrides).
2. Then the linked Shopify object (collection/product fields + metafields).
3. Then sensible defaults (presets render immediately on insert).
4. Then **hide** — never a broken placeholder.

---

## Instantiating a category (config only)
`templates/collection.digital-locks.json` = the default composition with Digital-Locks data:
Category Selector populated with Wooden / Glass / Metal / Padlocks (+ "ask an expert" CTA), Features + Why +
FAQ + Content + SEO filled from the Brand PDF. **Assign it** to the `digital-locks` collection in admin
(Online Store → … → collection template). Every future category repeats this with its own data — same sections,
zero forks.
