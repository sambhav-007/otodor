# OTODOR Content Experience Layer — Architecture + Audit

> **STEP 7 is the Content Experience Layer, not a Buying Guide.** Reusable educational content that helps
> customers decide — buying guides, installation, compatibility, troubleshooting, maintenance, explainers.
> **The content lives in Shopify (Articles/Pages) as the canonical source; the theme only surfaces it.** Long-form
> is never duplicated into section settings or metaobjects, and products link to content by **reference**.

Companion docs: `OTODOR-DATA-MODEL.md`, `OTODOR-STRUCTURED-CONTENT.md`, `OTODOR-MODULE-CONTRACT.md`,
`OTODOR-FRAMEWORK-INVENTORY.md`.

---

## 1. Native Shopify content audit (use before building anything)

| Capability | Native asset | Verdict for the content layer |
|---|---|---|
| **Long-form guides** | **Articles** (blogs) — title, excerpt, image, author, date, tags, RSS, comments | **Canonical home for guides.** Author here; richer + more discoverable than pages. |
| **Static content** | **Pages** (`page`) — title, rich body | Canonical home for evergreen/legal/simple guides. |
| **Listing** | `main-blog`, `featured-blog`, `article-card` snippet | Reuse for plain blog listing; OTODOR sections add the branded editorial surface. |
| **Article page** | `main-article` (+ Shopify `article \| structured_data`) | Owns **Article/BlogPosting** JSON-LD. Sections must **not** re-emit it. |
| **Search** | Shopify Search + Search & Discovery | Articles are searchable natively; no custom index. |
| **Navigation** | linklists | Guides hub can be a menu item; no parallel nav. |
| **Related articles** | `blog.articles`, tags, `article.metafields` | Source for "related educational content" — no manual curation needed. |

**Conclusion:** Shopify already stores, renders, searches and relates content. The theme's only gap is a
**branded surface** that previews native content and links to it, and a **reference model** connecting products
to their guides. Build only those two things.

---

## 2. Content module audit

Each: Purpose · Primary Shopify source · Reusable? · Structured-data opportunity · Merchant-editable? · Hide when.

| Module | Purpose | Primary Shopify source | Reusable? | Structured data | Editable? | Hide when |
|---|---|---|---|---|---|---|
| **Buying Guide** | Help choose the right product | **Article/Page** ref (`custom.buying_guide`) | YES | Article (on its page) — not here | YES | no ref/pick |
| **Installation Guide** | How install works / prep | Article/Page ref (`custom.installation_guide`) | YES | Article / *HowTo* (STEP 6 on its page) | YES | no ref |
| **Compatibility Guide** | Will it fit / requirements | Article/Page ref (`custom.compatibility_guide`) | YES | Article | YES | no ref |
| **Technology Explainer** | Explain a feature/tech | Article ref / tag | YES | Article | YES | no ref |
| **Troubleshooting** | Fix common issues | Article/Page ref | YES | Article / *FAQPage* if Q&A | YES | no ref |
| **Maintenance Guide** | Care & upkeep | Article/Page ref | YES | Article | YES | no ref |
| **FAQ** | Quick answers | `collapsible-content` (STEP 6) | YES | **FAQPage** (already, STEP 6) | YES | no rows |
| **Comparison Guide** | Compare models | `otodor-comparison` (STEP 5) | YES | — | YES | < 2 products |

**Only two of these are net-new sections.** Every "guide" module is the **same** surface pattern (single content
reference) differing only by which reference it reads. FAQ and Comparison already exist. So the content layer =
**one single-guide surface + one related-content rail**, both generic and reference-driven.

---

## 3. Content reference model (products/collections → content)

Guides are authored as **Articles** (preferred) or **Pages**. Products and collections point at them by
reference metafield — the theme resolves the reference and surfaces a preview. Long-form stays in Shopify.

### New metafields (namespace `custom`) — see `OTODOR-DATA-MODEL.md`
| Key | Type | On | Purpose |
|---|---|---|---|
| `custom.buying_guide` | `article_reference` *(or `page_reference`)* | product, collection | the category/product buying guide |
| `custom.installation_guide` | `article_reference` | product | install walkthrough |
| `custom.compatibility_guide` | `article_reference` | product, collection | fit/requirements guide |
| `custom.related_guides` | `list.article_reference` | product, collection | educational reading set |

> Supersedes the old `custom.buying_guide` = `list.metaobject_reference → buying_guide_block`. Referencing a
> real Article/Page beats a metaobject of body-blocks: no content duplication, native editing, native SEO, one
> canonical URL for AI/search. The `buying_guide_block` metaobject is **deprecated** (kept documented, unused).

```
Product ──▶ custom.buying_guide        (Article)
       ├──▶ custom.installation_guide  (Article)
       ├──▶ custom.compatibility_guide (Article)
       └──▶ custom.related_guides      (Article[])
```

---

## 4. The two reusable sections

### `otodor-content-guide` — single-guide surface  *(the "Buying Guide Section", generalized)*
- **Input priority:** section Article pick → section Page pick → `product`/`collection` metafield reference
  (configurable `namespace`/`key`, default `custom.buying_guide`) → hide.
- **Output:** eyebrow · title (override → content.title) · summary (override → article.excerpt → body excerpt) ·
  optional featured image (override → article.image) · **Read More** CTA → content.url. Editorial row, brand tokens.
- **No content duplication:** it reads title/excerpt/image/url from the referenced Article/Page; the full guide
  lives in Shopify. **No Article schema here** (the article page owns it).
- Reconfigure the metafield key → it becomes the Installation / Compatibility / Maintenance guide surface. One section, many roles.

### `otodor-content-rail` — related educational content  *(a set of guides)*
- **Input priority:** `custom.related_guides` list (product/collection) → a chosen **blog**'s latest N articles → hide.
- **Output:** heading + a rail/grid of guide cards (image · title · excerpt · tag/date · link). Auto-hides when empty.
- Reusable on PDP, collection, article ("related reading"), home. ItemList JSON-LD is a possible future registry
  addition — deferred (Article schema already lives on each article page; avoid over-emitting).

Both follow `OTODOR-MODULE-CONTRACT.md` (10-field doc block, resolve → validate → render → hide, preset/editor
hint, a11y, tokens).

---

## 5. AI discoverability & SEO
- **Canonical sources:** each guide is one Article/Page with one URL. The UI *references* it everywhere instead
  of restating it → no duplicate content, a single authority for search engines and AI to cite.
- **Native-first:** Article/BlogPosting schema stays on the article page (Shopify). The content layer links, never re-emits.
- **Graceful:** every surface auto-hides until its content exists, so the store is clean before guides are authored.

## 6. Implementation order
1. Audit (this doc). 2. **Content reference model** (data-model metafields). 3. **`otodor-content-guide`**
(single surface). 4. **Guide integration** (wire into product/collection templates, reference metafields).
5. **`otodor-content-rail`** (related content). 6. Self-review. 7. Commit per step.
