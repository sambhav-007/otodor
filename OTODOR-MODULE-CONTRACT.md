# OTODOR Product Information Module — Contract

> **The standard every Product Information Module implements.** A module is a single-responsibility,
> reusable section with a stable public interface and a fixed rendering lifecycle. The product template is
> only an **orchestrator** — it declares module order and holds *no business logic, no metafield parsing and
> no duplicated rendering*. Each module owns its own data reading, validation, rendering and self-hiding.
>
> This contract is the canonical reference for STEP 4b and **every future module**. New modules conform to it
> from day one; existing sections are retrofitted when next edited.

Companion docs: `OTODOR-PRODUCT-MODULES.md` (module audit + per-module data contracts), `OTODOR-DATA-MODEL.md`
(metafield definitions + the §6 doc-block standard), `OTODOR-COLLECTION-TEMPLATE.md` (the collection framework).

---

## 1. The interface — every module declares ten things

Every module must define these, in its **in-file documentation block** (see §4) and in this contract's inventory:

| # | Field | Meaning |
|---|---|---|
| 1 | **Purpose** | One line — the single customer question this module answers. |
| 2 | **Primary data source** | The Shopify object read first (almost always a product metafield). |
| 3 | **Fallback order** | The ordered chain tried when the primary is empty (metaobject → block → setting default → hide). |
| 4 | **Visibility rule** | The exact condition under which the module renders vs. hides completely. |
| 5 | **Merchant configuration** | What the merchant edits in the theme editor (settings + blocks). |
| 6 | **Required metafields** | Metafields without which the module cannot render — **should be `none`** for graceful degradation. |
| 7 | **Optional metafields** | Metafields that enrich the module when present. |
| 8 | **Dependencies** | Snippets, CSS/JS assets, Dawn features, metaobject definitions. |
| 9 | **Preset** | The theme-editor preset that renders meaningful content immediately with zero data. |
| 10 | **Accessibility notes** | Landmarks, labelling, focus, reduced-motion, contrast commitments. |

**Golden rule (inherited from the data model):** `Required metafields = none`. A module must render *something*
sensible from settings/blocks alone, then get richer as metafields are populated — or hide cleanly if it has
nothing meaningful to say. No module ever requires custom data to avoid a broken page.

---

## 2. The rendering lifecycle — every module follows the same five steps

```
1. READ      Read the primary Shopify data (product metafield).
2. OVERRIDE  Apply the fallback chain (metaobject → section blocks → setting defaults).
3. VALIDATE  Resolve everything into ONE boolean: does meaningful content exist?
4. RENDER    If yes → render the module.
5. HIDE      If no  → output nothing at all. No wrapper, no heading, no empty spacing.
```

**Non-negotiable:** a module must **never** leave empty spacing, a lone heading, or placeholder UI. The
validation in step 3 collapses all sources into a single `has_content` (or a resolved collection that is
empty/non-empty). Steps 4–5 are a single `{%- if has_content -%} … {%- endif -%}` around the *entire* output
— including the `{% style %}` scope where practical, and always including the section wrapper and heading.

### Canonical Liquid skeleton

```liquid
{%- comment -%} … in-file doc block (see §4) … {%- endcomment -%}

{%- liquid
  # 1. READ primary + 2. build the fallback chain into resolved variables
  assign items = product.metafields.custom.SOMETHING.value

  # 2b. fallback to section blocks when the primary is empty
  assign has_blocks = false
  if section.blocks.size > 0
    assign has_blocks = true
  endif

  # 3. VALIDATE → one boolean
  assign has_content = false
  if items != blank or has_blocks
    assign has_content = true
  endif
-%}

{%- if has_content -%}          {# 4. RENDER #}
  {%- style -%} /* scoped to #shopify-section-{{ section.id }} */ {%- endstyle -%}
  <section id="shopify-section-…" aria-labelledby="…">
    …
  </section>
{%- endif -%}                    {# 5. else: nothing is emitted #}

{% schema %} … { "presets": [ … ] } {% endschema %}
```

Notes:
- **One source renders at a time.** When the primary (metafield/metaobject) has data, blocks are *not* also
  rendered — the fallback fills a gap, it never stacks. This prevents duplicated rendering.
- **Parse once.** All metafield parsing happens in the module's opening `{%- liquid -%}` block, never in the
  template and never repeated inline.
- **Escape output.** All merchant/metafield text passes through `| escape` (or `| strip_html` for rich fields).

---

## 3. Data-source precedence (per module, applied inside step 2)

Following the data model's native-first priority (products → collections → … → metaobjects → section blocks):

```
product metafield (specs.* / custom.*)          ← primary, the comparable / canonical value
   └─ referenced metaobject(s) (when the metafield is a metaobject list)
        └─ section blocks (merchant fallback, theme editor)
             └─ section setting defaults (sensible, editable — NOT hardcoded in markup)
                  └─ hide
```

A module uses the subset of this chain that fits its data. **Setting defaults live in the schema `default:`
values** (merchant-editable Shopify data), never as string literals baked into conditional markup — so brand
copy stays overridable and the module carries no business logic.

---

## 4. In-file documentation block (required, extends data-model §6)

Every module opens with this block, kept in sync with its schema and this contract's ten fields:

```liquid
{%- comment -%}
  ════════════════════════════════════════════════════════════════════════
  OTODOR Module: <Name>
  ────────────────────────────────────────────────────────────────────────
  Purpose:            <the one customer question this answers>
  Primary source:     <product metafield read first>
  Fallback order:     <a → b → c → hide>
  Visibility rule:    <renders when … / hides when …>
  Merchant editable:  <YES/NO — settings + blocks>
  Required metafields: none
  Optional metafields: <namespace.key …>
  Dependencies:       <snippets, assets, metaobjects, Dawn features>
  Preset:             <what the zero-data preset shows>
  Accessibility:      <landmark, labelling, focus, reduced motion, contrast>
  Reusable for:       <PDP, comparison, collection, landing, categories …>
  ════════════════════════════════════════════════════════════════════════
{%- endcomment -%}
```

---

## 5. Assembly rule (the product template)

The product template (`templates/product.json`) is an **orchestrator only**:
- **No business logic** — no `if metafield` decisions live in the template.
- **No duplicated rendering** — each module renders itself, once.
- **No duplicated metafield parsing** — parsing lives inside modules.
- The template declares **order** (Gallery → Purchase → Information Modules → Related → SEO) and per-instance
  **settings**; every module auto-hides on no data, so a sparse product still yields a clean page.

---

## 6. Conformance checklist (self-review gate before commit)

A module is contract-compliant when **all** of these hold:

- [ ] Opens with the §4 documentation block, all ten fields filled.
- [ ] Reads its primary product metafield in one `{%- liquid -%}` block.
- [ ] Implements the full fallback chain it needs (metaobject → block → default), highest-priority source wins.
- [ ] Resolves to a single `has_content` boolean (step 3).
- [ ] Wraps the entire render in `{%- if has_content -%}` and emits **nothing** otherwise (step 5).
- [ ] `Required metafields = none`; renders from settings/blocks alone.
- [ ] Ships a **preset** that shows meaningful content with zero data.
- [ ] All text escaped; CSS scoped to `#shopify-section-{{ section.id }}`; tokens from `otodor-base.css`.
- [ ] Accessible: semantic landmark + `aria-labelledby`, visible focus, `prefers-reduced-motion` honoured.
- [ ] No business logic added to `product.json`.
- [ ] Registered in `OTODOR-FRAMEWORK-INVENTORY.md` (STEP 4.5).
```
