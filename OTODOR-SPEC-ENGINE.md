# OTODOR Specification Rendering Engine — Architecture

> **STEP 5 is not a comparison table. It is a specification rendering system.** One registry defines every
> specification once; one renderer knows how to display every data type; and *every* comparison experience in
> the OTODOR framework — the comparison matrix, product highlights, collection highlights, landing pages, a
> future compare feature or API — becomes a thin **consumer** that says: *"render these products using this
> registry."* No specification name is ever hardcoded inside a section again.

Companion docs: `OTODOR-MODULE-CONTRACT.md`, `OTODOR-DATA-MODEL.md` (§1.1 `specs.*` matrix, §3 `comparison_spec`
metaobject), `OTODOR-FRAMEWORK-INVENTORY.md`.

---

## 1. Why an engine (the problem it kills)

The old `otodor-comparison` hardcoded one `<tr>` per spec and read values from manual per-column checkboxes —
no metafields, and every new spec meant new Liquid. That is the "conditionals exploding over time" failure.
The engine inverts it: **specs are data, renderers are reusable, sections are dumb.**

Design constraints (Liquid reality):
- Liquid has **no functions/classes** → reusable logic lives in **snippets** (`{% render %}`, isolated scope).
- Liquid has **no `parse_json` deserializer** → the registry is passed as **delimited records**, not parsed JSON.
- `{% render %}` takes **scalar params** → a spec definition is passed field-by-field, not as one object.

---

## 2. The pipeline

```
Input          the consumer's request: which products, which view (comparable? group? context)
  ↓
Registry       otodor-spec-registry  → the full list of spec definitions (built-in + optional metaobjects)
  ↓
Product Resolver   consumer resolves the product set (blocks → collection → recommendations → current)
  ↓
Value Resolver     otodor-spec-value reads product.metafields[namespace][key] (→ default → blank)
  ↓
Formatting         type/unit turn the raw value into a display value ("35–65 mm", "12 months", ✓)
  ↓
Presentation       the type's renderer emits HTML (check, chip, badge, rating, link, document, image, text)
```

Registry + Value Resolver + Formatting + Presentation are **shared** (two snippets). Only the Product Resolver
and the surrounding layout differ per consumer.

---

## 3. Specification Registry — `snippets/otodor-spec-registry.liquid`

The single source of truth. Emits **one record per specification**, records separated by `;;;`, fields by `|`,
in a **fixed 10-column order**. The consumer captures the output and splits it — no spec names in the consumer.

### Column schema (per specification)

| # | Field | Meaning | Example |
|---|---|---|---|
| 0 | **id** | stable identifier | `fingerprint` |
| 1 | **label** | human row/label text | `Fingerprint` |
| 2 | **namespace** | product metafield namespace | `specs` |
| 3 | **key** | product metafield key | `fingerprint` |
| 4 | **type** | data type → selects renderer | `boolean` |
| 5 | **unit** | appended/used by renderer (may be blank) | `mm` |
| 6 | **group** | optional grouping | `Access` |
| 7 | **default** | value when the metafield is empty (may be blank) | `` |
| 8 | **comparable** | show in comparison views (`yes`/`no`) | `yes` |
| 9 | **filterable** | *intent* flag: should be a Search & Discovery facet (`yes`/`no`) | `yes` |

Rules: `comparable` and `filterable` are always `yes`/`no` (never blank — `filterable` is the last column, so a
blank there would be dropped by `split`). `unit`, `group`, `default` may be blank (internal columns are preserved
by `split`). Values must not contain `|` or `;;;`.

### Sources (native-first, graceful)
1. **Built-in canonical registry** — defined in the snippet, derived from `OTODOR-DATA-MODEL.md` §1.1. Always present.
2. **Optional metaobject overlay** — if the merchant defines `comparison_spec` metaobjects
   (`shop.metaobjects['comparison_spec'].values`), each is normalised to a record and **appended/overrides** by
   `id`. Never required (per the data model's metaobject rule).

### Params (the requested *view*)
- `only_comparable` (default `false`) — emit only `comparable = yes` rows (comparison consumers pass `true`).
- `group` — emit only rows in this group (optional).
- `ids` — comma list to emit a specific subset in order (product/collection highlights pass e.g. `fingerprint,pin_access,auto_lock`).

> The `filterable` flag is **documentation of intent**, mapping to which metafields the merchant flags
> "available in filters" in the Search & Discovery admin. The theme cannot create facets from Liquid; it records
> the intent so the registry stays the one place specs are described.

---

## 4. Rendering Engine — `snippets/otodor-spec-value.liquid`

Value Resolver + Formatting + Presentation in one dispatch snippet. **This is the only place display logic per
data type lives**, so adding a type never touches a section.

### Params
`product` (optional if `raw_value` given) · `namespace` · `key` · `type` · `unit` · `spec_default` ·
`renderer` (defaults to `type`) · `raw_value` (bypass the metafield read — for block/manual data & non-product
contexts) · `context` (`comparison` | `inline`, controls the empty-state marker).

### Resolution
```
value = raw_value  (if provided)  else  product.metafields[namespace][key].value
if value is blank → value = spec_default
if value is blank → empty state: "—" in comparison context, nothing inline
```

### Renderers (each type owns its output)

| Renderer | Input shape | Output |
|---|---|---|
| **boolean** | true/'yes'/'true'/1 → true; false/'no'/blank → false; other non-blank text → true | ✓ check / — dash (truthy text keeps the check; detail lives in the specs ledger) |
| **yesno** | a qualified answer: `Yes (up to 20)`, `No, 4 AA batteries (1 year backup)`, `Yes`, `No`, or a real boolean | ✓ check / — dash **plus** the qualifier under it (`.otodor-spec__qual`). A leading Yes/No only counts when `,`, ` ` or `(` follows it, so "Nordic build" is not read as a No; a value with no leading Yes/No is a Yes carrying that text |
| **range** | text range | `value` + ` unit` if unit set and absent → `35–65 mm` |
| **number** | number/text | `value` + ` unit` → `12 months`, `5` |
| **text** | text | escaped text |
| **badge** | text | filled pill `<span class="otodor-spec__badge">` |
| **chip** | text | outline pill `<span class="otodor-spec__chip">` |
| **rating** | number (e.g. 4.5) | star icons + value |
| **link** | url | `<a href=value>` label = `unit` or "View" |
| **document** | file url | download link, label = `unit` or "Download" |
| **image** | image/file reference | `<img>` (lazy, constrained) |
| _default_ | any | text |

Empty/absent values obey the **module contract's** hide-on-empty spirit: renderers emit the dash only in
comparison context (where a column must exist); inline contexts emit nothing.

### Seed layer — `snippets/otodor-spec-seed.liquid`

A spec sheet usually exists long before the metafields do. The seed layer lets a comparison column carry a
plain `spec_id = value` list (blank lines and `#` comments ignored) so a range can be published before its
products or their `specs.*` exist.

There are two seeds, in priority order:

| Seed | Where | Scope |
|---|---|---|
| **column seed** | a comparison column's *Seed values* textarea | that one column, that one section |
| **model seed** | `snippets/otodor-spec-model-seed.liquid` | **every** consumer, everywhere |

The **model seed** holds the client's published sheet (SENTRY / NEXUS / ONYX / ZION+ / ZEAL) once, so a
comparison shows real figures on any page — collection templates assigned or not, product pages, PDP
siblings. That is the same class of canonical brand data as the specification list already built into
`otodor-spec-registry`; seeding it per template instead produced empty tables wherever a template wasn't
assigned. Models are matched on **handle or title**, normalised (upper-cased, punctuation stripped) and
tested as **prefixes**, so `ZION+ Rose Gold` and `ZION+ Galaxy Black` both resolve to ZION+ and `SENTRY Pro`
to SENTRY. A product no model matches gets nothing rather than a wrong guess. The comparison exposes a
checkbox to switch it off.

**Both are deliberately the weakest sources.** Consumers pass the looked-up value as `spec_default`, which
the Value Resolver only reaches when the metafield is empty:

```
product metafield  →  column seed  →  model seed  →  registry default  →  "—"
```

So admin data always wins, no merge logic is needed, and a seed retires by itself as `specs.*` is populated —
one product at a time, until `otodor-spec-model-seed.liquid` can be deleted. Never read a seed in place of a
metafield, and never treat it as the data model — it is a bridge.

A comparison **column** likewise no longer requires a product: a block may stand alone with a title, image
and link, which is what makes a pre-catalogue range comparable at all.

---

## 5. Consumer API (the contract every consumer follows)

```
1. capture registry   {% capture reg %}{% render 'otodor-spec-registry', only_comparable: true %}{% endcapture %}
                       {% assign specs = reg | strip | split: ';;;' %}
2. resolve products    (consumer-specific: blocks → collection → recommendations → current product)
3. render              for each spec row → split into fields[0..9] → for each product →
                       {% render 'otodor-spec-value', product: p, namespace: fields[2], key: fields[3],
                                  type: fields[4], unit: fields[5], spec_default: fields[7], context: 'comparison' %}
4. visibility          skip a spec row when NO resolved product has a value (no dead rows);
                       hide the whole section when < 2 products (comparison) or 0 specs.
```

**No specification names appear in step 3.** The section only knows *"products × registry."*

---

## 6. Consumers

| Consumer | Product Resolver | Spec view | Status |
|---|---|---|---|
| **Comparison matrix** (`otodor-comparison`) | `product` blocks → collection → current + recommendations | `only_comparable: true`, grouped | STEP 5 (this) |
| **Product highlights** (PDP hero chips) | current product | `ids: …` small set | reuses `otodor-spec-value` |
| **Collection highlights** (card badges) | each card's product | `ids: …` | reuses engine |
| **Landing pages** | curated products | any view | reuses engine |
| **Compare feature** (future) | user selection | `only_comparable` | reuses engine |
| **Search filters** (Search & Discovery admin) | — | `filterable` flag as intent | admin-config |
| **Potential API** | — | registry as canonical schema | future |

---

## 7. Implementation order & scope

1. **Registry** — `otodor-spec-registry.liquid` (built-in canonical + optional metaobject overlay + view params).
2. **Rendering engine** — `otodor-spec-value.liquid` (value resolver + 10 renderers).
3. **Comparison section** — rewrite `otodor-comparison.liquid` as a pure consumer (Product Resolver + layout only).
4. **Product integration** — comparison resolves the current product + recommendations on the PDP; real `specs.*`.
5. **Collection integration** — comparison resolves collection products; light scheme; documented in the collection template.
6. **Self-review** against the module contract's conformance checklist. 7. **Commit** per step.

## 8. Extension points
- **Add a spec** → one record in the registry (or a `comparison_spec` metaobject). Zero section edits.
- **Add a renderer** → one `when` branch in `otodor-spec-value`. Zero section edits.
- **New consumer** → follow §5; never restate spec names.
- **New category** → its products populate `specs.*`; the same registry renders them.
