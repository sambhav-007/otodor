# OTODOR Product Information Modules — Audit & Data Contracts

> The product template is an **orchestrator**: it declares Gallery → Purchase → Information Modules →
> Related → SEO and contains **no business logic**. Each module is a single-responsibility, reusable
> section with a **stable data contract** (primary source → fallback → hide) and auto-hides when it has
> no data. Modules are the reusable assets; the product page is just one consumer — the Specification and
> Authentication modules also run on collections, landing pages and the comparison.

Companion docs: `OTODOR-DATA-MODEL.md`, `OTODOR-COLLECTION-TEMPLATE.md`.

---

## Module audit (verdicts)

| Module | Existing asset | Verdict |
|---|---|---|
| Gallery | `main-product` media (Dawn) | REUSE |
| Purchase | `main-product` buy block (Dawn) | REUSE |
| Specification | `otodor-product-specs` | REUSE (already contract-compliant) |
| Compatibility | — | **NEW** (small) *(or a spec group)* |
| Authentication | `access_chips` custom_liquid + `otodor-features` | REUSE / EXTEND |
| Installation | `otodor-product-install` | REUSE (add 85 mm clearance) |
| Warranty | — | **NEW** (small) *(or `rich-text`)* |
| Downloads | — | **NEW** |
| Video | Dawn `video` | REUSE |
| FAQ | Dawn `collapsible-content` | REUSE (+ FAQ schema, STEP 6) |
| Related Products | Dawn `related-products` | REUSE (Shopify recommendations) |
| SEO | Dawn `rich-text` | REUSE |

**Genuinely new modules to build: 3** (Compatibility, Warranty, Downloads). Everything else reuses/extends.

---

## Data contracts (public API)

Each contract: **Inputs · Outputs · Required metafields · Optional metafields · Override priority · Visibility rules · Reusable elsewhere.**

### Gallery — `main-product` (Dawn) · REUSE
- Inputs: `product.media`. Outputs: gallery/zoom.
- Required: none. Optional: none. Override: theme settings.
- Visibility: hidden if `product.media` empty (Dawn). Reusable: PDP only.

### Purchase — `main-product` (Dawn) · REUSE
- Inputs: `product`, variants, price. Outputs: variant picker, ATC, dynamic checkout, trust row.
- Required: none. Optional: `custom.positioning_line` (tagline block). Override: block order in template.
- Visibility: always (guards zero-price per HANDOFF). Reusable: PDP; sticky mirror = `otodor-sticky-atc`.

### Specification — `otodor-product-specs` · REUSE
- Inputs: grouped specs. Outputs: hairline ledger (groups → rows).
- **Primary:** `product.metafields.custom.specs` (JSON `{group: {label: value}}`).
- **Fallback:** `row` blocks (group/key/value).
- Required: none. Optional: `custom.specs`.
- Override: metafield wins; blocks render only when metafield empty.
- Visibility: **hidden if no metafield and no blocks.**
- Reusable: **YES** — collections, landing pages, comparison source.

### Compatibility — **NEW** `otodor-product-compat` · (small)
- Purpose: door types + thickness this lock fits (PDF: door thickness, wooden/glass/metal).
- Outputs: compatibility chips / short table.
- **Primary:** `custom.door_compatibility` (list) + `specs.door_thickness`, `specs.installation_type`.
- **Fallback:** section blocks (label/value).
- Required: none. Optional: the above.
- Override: metafields → blocks. Visibility: hidden if none. Reusable: YES (comparison, filters).

### Authentication — `access_chips` / `otodor-features` · REUSE/EXTEND
- Purpose: supported unlock methods (Face, Fingerprint, Card, PIN, Key, App).
- Outputs: labelled chips (with icons when promoted to a module).
- **Primary:** `product.metafields.custom.access_methods` (list, or legacy `·`-joined text).
- **Fallback:** `feature`/method blocks.
- Required: none. Optional: `custom.access_methods`.
- Override: metafield → blocks. Visibility: hidden if empty. Reusable: YES (PDP, comparison, landing).

### Installation — `otodor-product-install` · REUSE
- Purpose: install flow + the **85 mm (3.35") clearance** guide.
- **Primary:** section blocks / settings (`promise`, `estimate`). **Fallback:** built-in defaults.
- Optional: `custom.installation_steps`, `custom.installation_video`. Visibility: always (has defaults). Reusable: YES.

### Warranty — **NEW** `otodor-product-warranty` · (small)
- Purpose: 3-yr lock / 1-yr battery + coverage.
- **Primary:** `specs.warranty`, `specs.warranty_battery` (+ `custom.warranty_policies`).
- **Fallback:** section settings (default "3-year lock · 1-year battery").
- Optional: the above. Visibility: hidden only if explicitly cleared. Reusable: YES.

### Downloads — **NEW** `otodor-product-downloads` · 
- Purpose: manuals, datasheets, certifications, brochures.
- Outputs: list of download links with type/size.
- **Primary:** `product.metafields.custom.documents` (list.file_reference).
- **Fallback:** section blocks (label + file/url).
- Required: none. Optional: `custom.documents`. Visibility: **hidden if no documents.** Reusable: YES.

### Video — Dawn `video` · REUSE
- Inputs: `custom.installation_video` / section video. Outputs: responsive player.
- Optional: `custom.installation_video`. Visibility: hidden if no video. Reusable: YES.

### FAQ — Dawn `collapsible-content` · REUSE
- **Primary:** `collapsible_row` blocks. **Fallback (ext):** `custom.faqs`.
- Visibility: renders header if blocks exist (STEP 6 adds FAQ JSON-LD + hide-when-empty wrapper). Reusable: YES.

### Related Products — Dawn `related-products` · REUSE
- **Primary:** Shopify recommendations API. Visibility: **self-hides** if none. Reusable: PDP.

### SEO — Dawn `rich-text` · REUSE
- **Primary:** section blocks. **Fallback:** `custom.seo_content`. Visibility: added per product. Reusable: YES.

---

## Data reconciliation (specs)
Two complementary representations, no duplicate rendering:
- **`custom.specs`** (grouped JSON) → the **Specification Module ledger** (rich, human-grouped display). *Existing, reused.*
- **Discrete fields** (`specs.*`, `custom.door_compatibility`, `custom.access_methods`) → **comparable/queryable** values for Compatibility, Authentication, Warranty, **Comparison (STEP 5)** and Search-&-Discovery filters.

Merchants can populate the grouped ledger for display and the key discrete fields for comparison/filtering. A
future option (STEP 5) is to generate the ledger from discrete fields via a spec map, collapsing to one source.

---

## Target composition (orchestrator, no logic)
```
product.json
  main            (main-product)          Gallery + Purchase [+ Authentication chips, trust row]
  reveal          (otodor-product-reveal) editorial statement (optional)
  specs           (otodor-product-specs)  Specification
  compatibility   (otodor-product-compat) Compatibility            ← NEW
  install         (otodor-product-install) Installation (+85mm)
  warranty        (otodor-product-warranty) Warranty               ← NEW
  downloads       (otodor-product-downloads) Downloads             ← NEW
  video           (video, Dawn)           Video
  faq             (collapsible-content)   FAQ
  related-products(related-products)      Related
  seo             (rich-text)             SEO
  sticky-atc      (otodor-sticky-atc)     persistent purchase
```
Every module auto-hides on no data, so a sparse product still renders a clean page.

---

## Build order (STEP 4b+)
1. NEW modules: `otodor-product-downloads`, `otodor-product-warranty`, `otodor-product-compat` (each: metafield primary → blocks → hide, + in-file doc block + preset).
2. Promote Authentication to a reusable module (or keep chips) + add 85 mm clearance to Installation.
3. Assemble `product.json` from modules. 4. Self-review. 5. Commit.
