# OTODOR Lead Capture & Guided Advisor — STEP 8

> The whole commerce framework routes high-intent traffic toward conversion moments that, until now,
> had **no destination**: the mega-menu "Get a Custom Quote" CTA, the CTA-banner "priority home survey,"
> the Category Selector "ask an expert" card, the sticky-ATC WhatsApp. STEP 8 builds the **destination**
> (the lead *sink*) and the **acquisition surface** (the guided advisor that feeds it).
>
> Native-first, reusable, data-driven, auto-hiding — same contract as every prior module
> (`OTODOR-MODULE-CONTRACT.md`). No backend, no third-party lead SaaS.

Companion docs: `OTODOR-MODULE-CONTRACT.md` (the standard), `OTODOR-FRAMEWORK-INVENTORY.md` (the register),
`OTODOR-DATA-MODEL.md` (metafields), `OTODOR-COMMERCE-ARCHITECTURE.md` (section map).

---

## 1. Why this step

OTODOR products are **high-consideration, install-required** purchases (smart locks, gate automation, home
security). The PDF's own language is *"priority home survey," "custom installation assessment," "3-yr warranty"* —
this is a **consultative lead-gen** business, not impulse ecommerce. The most valuable conversion is not "add to
cart," it is **"request a quote / book a survey."** Every credibility surface already gestures at this; STEP 8
gives it a real, branded, native home and a smart on-ramp.

**Two roles:**

| Role | Module | Metaphor |
|---|---|---|
| **Sink** — where a qualified lead lands and converts | `otodor-lead-form` | the concierge desk |
| **Source** — how an unsure visitor is guided to the desk | `otodor-advisor` | the concierge who walks you there |

---

## 2. Native-first lead plumbing (no backend)

Shopify already ships a lead pipe: the **`{% form 'contact' %}`** tag. A submission emails the store's
**Sender/Customer-notification address** and appears nowhere that needs a server. We build on it — never around it.

```
Visitor → otodor-lead-form ({% form 'contact' %}) → Shopify → store inbox email
                     └─ or → WhatsApp deep-link (instant, pre-filled)   [dual-path]
```

**Why not a custom endpoint / metaobject / app?** Governing rule #2 (native Shopify first) and the no-backend
sandbox reality. `contact` is the canonical Shopify lead channel; it is spam-filtered, GDPR-neutral (goes to the
merchant's own inbox), and needs zero infrastructure. Any CRM the merchant later adds (Shopify Flow, Zapier on the
contact email, Shopify Forms app) consumes the same submissions with **no theme change**.

### 2.1 The high-value trick — **context capture**

The native contact email is just name/email/body unless we enrich it. Every `contact[Label]` field a merchant
adds to the form arrives as a labelled line in that email. So the lead form injects **hidden, auto-filled context**:

| Field | Value | Why it matters |
|---|---|---|
| `contact[Source page]` | `{{ canonical_url }}` | which page triggered the lead |
| `contact[Product]` | `{{ product.title }}` (on a PDP) | "quote for the ZION+ lock" arrives pre-attributed |
| `contact[Collection]` | `{{ collection.title }}` | category interest |
| `contact[Interest]` | merchant-defined select | door type / service requested |
| `contact[Advisor result]` | handed off from `otodor-advisor` | the recommendation the visitor accepted |

A quote request from a product page now lands in the inbox already saying *what* it is about — no back-and-forth.
This is pure native Liquid; nothing else in the theme does it.

---

## 3. `otodor-lead-form` — the capture module

**Purpose:** Convert a high-intent visitor into a qualified, attributed lead (quote / survey / consultation).

**Layout:** premium **editorial split** — left rail = the value proposition (eyebrow, heading, 2–4 trust
`reason` blocks: "3-yr warranty," "German-engineered," "16-yr NavKar heritage," "free site survey"); right = the
form card. Collapses to a single column on mobile, form first is optional.

**Fields (all map to `contact[...]`):**
- Name (`contact[Name]`), Phone (`contact[Phone]`, **required** — primary channel for India lead-gen),
  Email (`contact[email]`, native validated), Interest (`contact[Interest]`, select from `interest` blocks →
  hidden if none), Message (`contact[Comment]`).
- **Hidden context** (§2.1), auto-filled from the rendering context.
- **Consent** line (checkbox, opt-in copy) — merchant-editable, required togglable.

**Dual-path:** a WhatsApp button (uses `settings.otodor_whatsapp_number`, message pre-filled with the same
context) sits beside submit as an instant alternative. Honors `settings.otodor_whatsapp_enabled`.

**States:** native `form.posted_successfully?` → OTODOR success panel (checkmark, "we'll call you within X hrs");
`form.errors` → inline field errors, OTODOR-styled. No page reload logic beyond Dawn's default.

**Contract mapping:**
| Field | Value |
|---|---|
| Primary data source | section settings + `reason`/`interest` blocks (a form is config-driven, not metafield-driven) |
| Fallback order | interest blocks → single message field; reason blocks → omit left rail trust list |
| Visibility rule | **always renders** (a contact form is never "empty") — but every sub-part self-hides |
| Required metafields | none |
| Optional | reads `product` / `collection` in context for auto-fill; `settings.otodor_whatsapp_*` |
| Merchant editable | YES — all copy, fields, interest options, trust reasons, scheme |
| Preset | full form with 3 trust reasons + 4 interest options + WhatsApp, renders immediately |
| Accessibility | `<section aria-labelledby>`, `<label>` per field, `aria-required`, error `aria-describedby`, visible focus, success `tabindex=-1` autofocus (Dawn parity) |
| Reusable for | quote page, contact page, PDP footer, collection footer, landing, home CTA |

---

## 4. `otodor-advisor` — the guided advisor

**Purpose:** Turn "I don't know which lock I need" into a confident recommendation + a warm lead, in ~30 seconds.

**Explicitly NOT an LLM.** A real AI chat needs a server to hold the API key; that violates native-first and
can't live in Liquid. The advisor is a **deterministic, client-side questionnaire** that reads real
merchant data and scores answers. Same concierge outcome, instant, no infrastructure, no hallucination.

**Data model (all merchant-editable blocks):**
- `question` block — prompt + up to N `option`s. Each option carries a **target** (collection or product) and/or
  a **tag** it contributes. (Options are encoded in the block's settings; the advisor is a small fixed depth.)
- Scoring: each answer adds its target/tags to a running tally; the end screen resolves the **highest-scoring
  collection/product** and renders a recommendation card (image/title/reason) with three exits:
  **View the range** (→ collection/PDP) · **Get a quote** (→ lead form / `#otodor-lead`) · **WhatsApp** (pre-filled).

**Fallback / visibility:**
- Options reference collections → fall back to the option's own label/URL if the collection is unset.
- **Auto-hides** when there are `< 1` question blocks (nothing to ask).
- Recommendation falls back to a merchant-set default URL if scoring resolves nothing.

**JS:** one small scoped vanilla script (`otodor-advisor.js`), no framework — matches the mega-menu's
"minimal scoped JS only" principle. State is in-memory; progress bar; Back; keyboard operable (options are real
`<button>`s / radios); `prefers-reduced-motion` disables the step transition. Nothing is submitted by JS — the
exits are plain links; conversion still flows through the native lead form.

**Contract mapping:** primary source = `question` blocks; required metafields = none; renders a meaningful preset
(3-question "find your lock" flow); light/dark; registered in the inventory.

---

## 5. Wiring (8c)

1. **Quote page** — `templates/page.contact.json` is extended (or a `page.quote.json` added) to host
   `otodor-lead-form` (+ optionally `otodor-advisor` above it). This is the canonical destination.
2. **Repoint existing CTAs** to that page (merchant-editable URL settings; sensible defaults set):
   - Mega-menu "Get a Custom Quote" (`mega_cta_button_link`)
   - CTA-banner secondary/primary (`cta_*_link`)
   - Category-selector "ask an expert" (`cta_link`)
3. **Inventory + handoff** updated; `shopify theme check` clean vs. baseline.

No existing section's markup changes except default link targets — evolve, don't rewrite.

---

## 6. What this is not (scope guard)

- **Not** a CRM, not a database of leads (the merchant's inbox + any Flow/Zapier they add owns that).
- **Not** an LLM chatbot (see §4).
- **Not** a payment/checkout flow (purchases stay in Dawn's cart).
- **Not** a new data namespace — it reuses `contact`, existing collections/products, and `settings.otodor_whatsapp_*`.

## 7. Merchant setup (degrades gracefully until done)

- Confirm the store's **contact/notification email** (Settings → Notifications) — that is where leads arrive.
- Optionally set the WhatsApp number (already defaulted) and the CTA link targets to the quote page.
- Author the advisor's questions/options (preset ships a working 3-step flow to edit).
