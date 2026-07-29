# OTODOR Commerce Data Model

> **Foundation of the OTODOR commerce framework.** Every reusable section reads from the objects
> defined here, so each new product category (Gate Automation, Video Door Bells, Smart Home, Security
> Systems, Other Solutions) inherits behaviour by populating data — not by writing Liquid.
>
> **Golden rules**
> 1. **Data lives on Shopify objects** (products, collections, metaobjects), never duplicated in templates.
> 2. **Every section must render without any metafield set** (graceful fallbacks), then get richer as data is added.
> 3. **Namespaces:** `specs.*` = comparable spec matrix (one value per field); `custom.*` = content/media/relationships.
> 4. **Native Shopify first.** Data priority: products → collections → pages → blogs → navigation → recommendations → Search & Discovery → metafields → **section blocks**. Use a **metaobject only when the data is shared across many unrelated places or needs relationships** (e.g. `comparison_spec` row definitions). Before adding one, ask: can this be a collection metafield, product metafield, section block, or page? If yes, don't. The metaobjects in §3 are **optional enhancements**, never required — every section works from collections/products/blocks alone.

Companion docs: `OTODOR-COMMERCE-ARCHITECTURE.md` (section map), `OTODOR-AUDIT.md` (brand audit).

---

## 1. Product metafields

Two namespaces: **`specs`** (the comparable matrix — powers both the product page spec table *and* the
comparison section from one source) and **`custom`** (content, media, relationships).

### 1.1 `specs.*` — Specification matrix
Types chosen so a generic comparison can render any row. `boolean` → ✓/—; `yesno` → ✓/— **plus the
qualifier the value carries** ("Yes (up to 20)" → ✓ *up to 20*); text/number → value.

> Most access/hardware rows are registered as **`yesno`**, not `boolean`, because the real OTODOR sheet
> qualifies its answers ("Yes (up to 100)", "No, 4 AA batteries"). Store them as `single_line_text`; a true
> `boolean` metafield still renders correctly through the same renderer.

| Key | Type | Example (PDF) | Purpose |
|---|---|---|---|
| `specs.face_recognition` | single_line_text | "Yes (up to 20)" | comparison / specs |
| `specs.fingerprint` | single_line_text | "Yes (up to 100)" | comparison / specs |
| `specs.cards` | single_line_text | "Yes (up to 100)" | comparison / specs |
| `specs.pin_access` | boolean | true | comparison / specs |
| `specs.app_control` | boolean | true | comparison / specs |
| `specs.bolts` | number_integer | 5 | comparison / specs |
| `specs.deadbolt` | boolean | true | comparison / specs |
| `specs.motorised_latch` | boolean | true | comparison / specs |
| `specs.two_way_talk` | boolean | true | comparison / specs |
| `specs.doorbell` | boolean | true | comparison / specs |
| `specs.inside_screen` | single_line_text | "4.5 in" | comparison / specs |
| `specs.mini_screen` | boolean | true | comparison / specs |
| `specs.auto_lock` | boolean | true | comparison / specs |
| `specs.audit_log` | boolean | true | comparison / specs |
| `specs.door_thickness` | single_line_text | "45–100 mm" | compatibility filter |
| `specs.dimensions` | single_line_text | "41.5 × 7 cm" | specs |
| `specs.weight` | number_decimal | 4.4 | specs |
| `specs.battery` | single_line_text | "4200 mAh Li-ion" | specs |
| `specs.battery_backup` | single_line_text | "6 months" | specs |
| `specs.backup_port` | single_line_text | "Type-C" | specs |
| `specs.power_source` | single_line_text | "Rechargeable / 4×AA" | specs |
| `specs.connectivity` | single_line_text | "Wi-Fi 2.4 GHz, Bluetooth" | specs / filter |
| `specs.build_material` | single_line_text | "Aluminium alloy + SS 304" | specs |
| `specs.finish` | single_line_text | "Italian finish" | specs |
| `specs.certification` | single_line_text | "ISO 9001" | specs |
| `specs.warranty` | single_line_text | "3 years" | warranty / comparison |
| `specs.warranty_battery` | single_line_text | "1 year" | warranty |
| `specs.installation_type` | single_line_text | "Professional (included)" | install |

### 1.2 `custom.*` — Content, media & relationships
| Key | Type | Purpose | Status |
|---|---|---|---|
| `custom.positioning_line` | single_line_text | one-line PDP tagline | **exists** |
| `custom.access_methods` | list.metaobject_reference → `authentication_method` *(or `·`-joined text, legacy)* | authentication chips | **exists (as text)** — migrate to metaobject list |
| `custom.door_compatibility` | list.single_line_text | ["Wooden","Glass","Metal"] | filter + selector |
| `custom.included_accessories` | list.single_line_text | in-box items | PDP |
| `custom.finish_options` | list.single_line_text | ["Rose Gold","Galaxy Black"] | PDP |
| `custom.installation_video` | file_reference (video) or url | PDP video | PDP |
| `custom.documents` | list.file_reference | datasheets/manuals (PDF) | Downloads |
| `custom.spec_groups` | list.metaobject_reference → `comparison_spec` | ordered/grouped spec rows | specs / comparison |
| `custom.faqs` | list.metaobject_reference → `faq` | product FAQs | FAQ + schema |
| `custom.buying_guide` | **article_reference** *(or page_reference)* | canonical buying guide | Content Guide |
| `custom.installation_guide` | article_reference | canonical install walkthrough | Content Guide |
| `custom.compatibility_guide` | article_reference | fit / requirements guide | Content Guide |
| `custom.related_guides` | list.article_reference | educational reading set | Content Rail |
| `custom.install_clearance` | multi_line_text | per-product clearance note (overrides the Install section's default) | Install |
| `custom.install_clearance_image` | file_reference (image) | per-product clearance diagram (overrides the Install section's image) | Install |
| `custom.hidden_modules` | list.single_line_text | module ids to force OFF for this product (`install`, `warranty`, `compat`, `downloads`) | Module applicability |
| `custom.shown_modules` | list.single_line_text | module ids to force ON, beating any section allow/deny list | Module applicability |

> **Module applicability (STEP 12):** a module that ships non-blank defaults — Install, Warranty — can never
> auto-hide on "no data", because it is never empty. `snippets/otodor-module-applies.liquid` answers the
> second question (*should* this render for this product?) from **product type + tags + collection handles**,
> configured per section, with `custom.hidden_modules` / `custom.shown_modules` overriding everything.
> All lists blank = shows. See `OTODOR-MODULE-CONTRACT.md` §Relevance.

> **Content Experience Layer (STEP 7):** guides are authored as **Articles** (preferred) or **Pages** — the
> canonical, single-URL source — and products/collections link to them by reference. The theme surfaces a
> preview + Read More; long-form is never duplicated into settings/metaobjects. These reference metafields
> **supersede** the old `custom.buying_guide` = `list.metaobject_reference → buying_guide_block`; the
> `buying_guide_block` metaobject (§3) is **deprecated** (documented, unused). Collections may carry
> `custom.buying_guide` / `custom.compatibility_guide` / `custom.related_guides` too. See `OTODOR-CONTENT-LAYER.md`.

---

## 2. Collection metafields (namespace `custom`)

| Key | Type | Purpose | Used by |
|---|---|---|---|
| `custom.menu_icon` | single_line_text (otodor-icon name) | nav/category icon | mega menu, category grid, door selector |
| `custom.menu_description` | multi_line_text | short blurb | mega menu, category grid |
| `custom.menu_image` | file_reference (image) | card/CTA image | mega menu, category grid |
| `custom.parent_collection` | collection_reference | this collection's parent category | category selector (`children` source) |
| `custom.category_intro` | rich_text | premium hero/intro copy | collection hero |
| `custom.hero_image` | file_reference (image) | hero background | collection hero |
| `custom.hero_video` | file_reference (video) or url | hero motion | collection hero |
| `custom.door_types` | list.metaobject_reference → `door_type` | selector options | door-type selector |
| `custom.feature_highlights` | list.metaobject_reference → `feature` | features | feature highlights |
| `custom.buying_guide` | **article_reference** *(or page_reference)* | canonical buying guide | Content Guide *(was buying_guide_block — deprecated)* |
| `custom.compatibility_guide` | article_reference | fit / requirements guide | Content Guide |
| `custom.related_guides` | list.article_reference | educational reading set | Content Rail |
| `custom.installation_steps` | list.metaobject_reference → `installation_step` | install flow | installation process |
| `custom.warranty_policies` | list.metaobject_reference → `warranty_policy` | warranty | warranty & support |
| `custom.faqs` | list.metaobject_reference → `faq` | category FAQs | FAQ + schema |
| `custom.seo_content` | rich_text | indexable long-form | SEO content |

---

## 3. Metaobjects (reusable, merchant-managed)

Each is defined once in **Settings → Custom data → Metaobjects**, then referenced from products/collections.

### `door_type`
| Field | Type |
|---|---|
| `title` | single_line_text |
| `icon` | single_line_text (otodor-icon name) |
| `image` | file_reference (image) |
| `description` | multi_line_text |
| `target` | collection_reference *(or `url` single_line_text)* |

### `authentication_method`
| Field | Type |
|---|---|
| `name` | single_line_text |
| `icon` | single_line_text |
| `description` | multi_line_text |

### `faq`
| Field | Type |
|---|---|
| `question` | single_line_text |
| `answer` | rich_text |
| `group` | single_line_text *(optional)* |

### `buying_guide_block` — ⚠️ DEPRECATED (STEP 7)
> Superseded by authoring guides as **Articles/Pages** and linking via `custom.buying_guide`
> (article_reference). Do not create new instances; kept for historical reference only. See `OTODOR-CONTENT-LAYER.md`.

| Field | Type |
|---|---|
| `title` | single_line_text |
| `body` | rich_text |
| `icon` | single_line_text *(optional)* |
| `image` | file_reference (image) *(optional)* |
| `link` | url *(optional)* |

### `installation_step`
| Field | Type |
|---|---|
| `title` | single_line_text |
| `description` | multi_line_text |
| `duration` | single_line_text |
| `image` | file_reference (image) |
| `step_number` | number_integer |

### `comparison_spec`
| Field | Type | Notes |
|---|---|---|
| `label` | single_line_text | row label ("Face Recognition") |
| `key` | single_line_text | product metafield key it reads (`specs.face_recognition`) |
| `group` | single_line_text | optional grouping ("Access", "Hardware") |
| `type` | single_line_text | boolean / text / number |
| `unit` | single_line_text | optional ("mm", "kg") |

### `warranty_policy`
| Field | Type |
|---|---|
| `title` | single_line_text |
| `duration` | single_line_text |
| `covers` | rich_text |
| `icon` | single_line_text *(optional)* |

### `feature` *(optional — else use `otodor-features` blocks)*
| Field | Type |
|---|---|
| `title` | single_line_text |
| `description` | multi_line_text |
| `icon` | single_line_text |
| `image` | file_reference (image) |

---

## 4. Other Shopify data sources

- **Theme settings** (`config/settings_schema.json`, `otodor-base.css` tokens) — global brand: colours, fonts,
  WhatsApp, social. Cross-store, not per-page.
- **Section settings / blocks** — per-instance presentation (headings, layout, toggles) + local fallbacks when
  metaobjects aren't set. Documented per section (see §6).
- **Search & Discovery** (Shopify app) — expose these as **filters/facets** on collection pages:
  `specs.connectivity`, `specs.door_thickness`, `custom.door_compatibility`, `specs.face_recognition`,
  `specs.fingerprint`, price, availability. Metafields must be flagged "available in filters".
- **Navigation** — `main-menu` linklist (see `otodor-nav-architecture`); categories = collections; per-item
  extras from collection metafields. No duplication.
- **Recommendations** — Shopify Product Recommendations API (`recommendations` object) for Related Products
  (related + complementary). No manual lists.

---

## 5. Setup checklist (admin)
1. **Custom data → Metaobjects:** create the 8 definitions in §3.
2. **Custom data → Products:** create `specs.*` + `custom.*` product definitions (§1). Flag comparable/filterable
   ones as "available in filters" + "storefronts".
3. **Custom data → Collections:** create `custom.*` collection definitions (§2).
4. **Search & Discovery:** add filters from §4.
5. Populate the flagship (`digital-locks` + ONYX/SENTRY/NEXUS/ZION+/ZEAL) first; other categories follow the same shape.
6. **Online Store → Themes → Customize / Collections:** assign the five collection templates —
   `digital-locks`, `wooden-door-locks`, `glass-door-locks`, `metal-gate-locks`, `smart-padlocks`.
7. **Optional:** set `custom.parent_collection` on each sub-collection → the category selector finds them
   even where the navigation menu isn't built.

> Sections ship with sensible **defaults/blocks**, so the site looks complete before step 5 is done.
> The Digital Locks comparison additionally ships **seed values** in its template (see
> `OTODOR-SPEC-ENGINE.md` §Seed layer). Populating `specs.*` in step 2 silently overrides them — the seed
> never competes with admin data, and can be deleted once the metafields are in.

---

## 6. Section documentation standard (required)

**Every reusable OTODOR section must open with this Liquid comment block**, kept in sync with its schema:

```liquid
{%- comment -%}
  OTODOR Section: <Name>
  Purpose:            <one line>
  Inputs:             <collections / products / metaobjects / images / text>
  Outputs:            <what it renders / links to>
  Dependencies:       <snippets, CSS/JS assets, Dawn features>
  Reusable for:       <Digital Locks, Gate Automation, Home, PDP, ...>
  Merchant editable:  <YES/NO — via theme editor settings/blocks>
  Required metafields: <namespace.key ... or "none">
  Optional metafields: <namespace.key ...>
{%- endcomment -%}
```

New sections include it from day one; existing sections get it retrofitted when next edited.
