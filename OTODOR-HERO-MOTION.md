# OTODOR — Hero Motion Redesign (Monolith Scroll)

Redesign of the pinned monolith scroll hero (`sections/otodor-hero.liquid`) so it is **smooth**,
**restrained**, and **continuous with the V4 Vault intro** — instead of a neon network diagram that
cuts against the obsidian language established by the vault.

- **Owner surface:** `sections/otodor-hero.liquid` (2328 lines: markup + inline CSS + inline JS)
- **Upstream:** `sections/otodor-vault-intro.liquid` + `assets/otodor-vault.js` (the fly-through that hands off to this hero)
- **Scope approved:** all 4 phases; Act 3 = the monolith splits into 4 slabs
- **Status:** planned, not started

---

## 1. Diagnosis

### 1.1 Smoothness — the timeline scrubs non-composited properties

Every frame of the pinned scroll triggers paint, not just compositing:

| Property animated under `scrub` | Location | Cost |
|---|---|---|
| `background` (plate glows, seams, internal glow gradient) | `:1901`, `:1910`, `:1893` | paint |
| `boxShadow` (seams) | `:1911` | paint |
| `filter: drop-shadow()` (logo icon) | `:1920` | expensive paint |
| `stroke`, `strokeDashoffset` (SVG connectors + pulses) | `:1786`, `:1963` | paint |
| `zIndex` | `:1803` | stacking recalc |

Compounding it: `.otodor-hero__stage` scales `1 → 1.08` across the **whole** timeline (`:1736`) while
containing a `filter: blur(12px)` + `mix-blend-mode: screen` layer (`:410`). A blurred, blended
surface is re-rasterized every frame. **This is the jank.** Easing/scrub tuning cannot fix it —
the fix is to stop animating paint properties at all.

### 1.2 Two defects to fix regardless of redesign

1. **Reduced-motion CSS is unreachable.** `initHeroAnimation` returns at `:1624` when
   `prefers-reduced-motion: reduce`, *before* `js-animated` is added at `:1650`. Every
   `@media (prefers-reduced-motion: reduce) .otodor-hero.js-animated { … }` rule at `:1231` is
   therefore dead code.
2. **Orbit slots are resize-stale.** `finalSlots` bakes `window.innerWidth/innerHeight` into pixel
   values once (`:1705`). The build only rebuilds on the 1024px breakpoint, so any resize within
   desktop leaves stale coordinates.

### 1.3 Brand misalignment

The vault intro is pitch-black obsidian, one seam of light, hidden mechanics — Apple / Nothing / B&O.
The hero it hands off to has cursor-tracking particles, four glowing SVG curves with pulses
travelling along them, blue glow on every face, and four caption cards orbiting a centre.

That is **HUD/neon plus a feature-card grid** — both on the recorded dislike list — landing roughly
half a second after the fly-through. It also carries none of the brand substance: German
engineering, the 16-year NavKar heritage, or the anti-"little black box" EMI story.

---

## 2. Direction

> **The hero is the room you just flew into.**

Same obsidian, same two recessed ceiling light lines, same reflective floor — no cut at the
hand-off. Scroll is a **camera move through an architectural space**, not a diagram assembling
itself. **One light event** in the entire hero, and it is the same seam blue as the vault.

### Removed outright
Cursor particles · SVG connector curves · travelling pulses · caption cards · per-face blue glow ·
`drop-shadow` ramps.

---

## 3. Choreography

| Act | Scroll | Beat | Copy carries |
|---|---|---|---|
| **0 — Arrival** | 0–10% | Opens already inside the chamber. Monolith centred, unlit, silent. | `Every Entry Point. Protected.` |
| **1 — Material** | 10–35% | Slow push + ~12° orbit. Light rakes the face: bevel, machined grain, seam. **No glow.** | German engineering · 16 years |
| **2 — Intelligence** | 35–60% | The seam ignites — one event, not a network. Monolith parts like the gates, revealing depth. | EMI / anti-"little black box" |
| **3 — The Range** | 60–85% | The monolith **separates into four obsidian slabs** that settle into an editorial row. Large type, no icons, one per product family → its collection. | Product hierarchy |
| **4 — Commitment** | 85–100% | Slabs settle, chamber lights rise, final headline + CTA, soft hand-off to the next section. | CTA |

Act 3 deliberately reuses the vault's **splitting** language: the range emerges *from the object*
rather than orbiting it, which ties the product families to the monolith instead of decorating it.

---

## 4. Motion standards (binding for all phases)

1. **Composited-only scrubbing.** Under `scrub`, animate `transform` and `opacity` only. Every paint
   ramp becomes an opacity cross-fade between two pre-rasterized stacked layers (lit / unlit).
   Never `background`, `boxShadow`, `filter`, `stroke`, or `zIndex`.
2. **Isolate blur.** Blurred glow moves out of any scaling ancestor, or gets `contain: paint` so it
   rasterizes once.
3. **`will-change` lifecycle.** Applied on timeline enter, removed on leave. It is currently
   permanent on several elements, holding compositor layers for the life of the page.
4. **Resolution-independent slots.** `xPercent`/`yPercent` + CSS custom properties instead of baked
   pixels, so resize needs no JS recompute.
5. **Self-hosted GSAP.** Currently cdnjs (`layout/theme.liquid:448`). Same CSP / no-CDN argument
   that already drove self-hosting `three.module.js` for the vault.
6. **File split.** `sections/otodor-hero.liquid` → section markup + `assets/otodor-hero.css` +
   `assets/otodor-hero.js`.

---

## 5. Phase plan

Commit per phase (project rhythm: architecture → implement → self-review → commit).

### Phase 1 — Motion hygiene · **no visual change**
- Composited-only rewrite of both desktop and mobile timelines.
- Fix the unreachable reduced-motion CSS (§1.2.1) and resize-stale slots (§1.2.2).
- `will-change` lifecycle; isolate the blurred glow from the scaling stage.
- Self-host GSAP + ScrollTrigger.
- Split into `otodor-hero.css` / `otodor-hero.js`.

**Acceptance:** visually identical to today; no paint-property tweens remain under `scrub`;
reduced-motion path reaches its intended static layout; resize within desktop keeps slots correct.

### Phase 2 — Restraint pass
- Strip particles, connector curves, pulses, caption cards, per-face glow.
- Collapse all light events into the single seam ignition.
- Retone to the vault palette (obsidian + one seam blue).

**Acceptance:** no HUD/neon artefacts remain; hero and vault read as one material language.

### Phase 3 — Continuity (the 10x)
- Shared WebGL chamber: hero monolith as real geometry in the vault's scene/material language.
- Scroll drives the **camera**, not DOM transforms.
- DOM keeps headline/subhead/CTA for SEO + a11y (native-first standard).
- CSS-3D path retained as fallback for no-WebGL and reduced-motion.

**Acceptance:** no visible cut between vault fly-through and hero; scrub holds frame rate on
mid-tier hardware; full graceful degradation.

### Phase 4 — Editorial range act
- Act 3 slab split + editorial row, wired to collections.
- Slots designed so real product renders drop in when photography lands.

**Acceptance:** each slab links to a real collection; auto-hides / falls back when a collection is
absent (per the reusable-section standard).

---

## 6. Fallback & accessibility contract

Follows the framework standard — **graceful fallback, never a broken placeholder**:

| Condition | Result |
|---|---|
| GSAP absent | Static CSS layout, all copy readable |
| WebGL absent / context lost (Phase 3+) | CSS-3D monolith path |
| `prefers-reduced-motion: reduce` | Static stacked layout, **no pin**, no scrub (and the rules must actually apply — see §1.2.1) |
| JS disabled | Full copy + CTAs present in markup |

Headline, subheading, and CTAs stay in server-rendered DOM in every phase — never painted into a
canvas.

---

## 7. Open items

- **Photography** (owner: user) still blocks Act 3's final form; slabs ship with the obsidian
  treatment until real renders exist.
- **Verification:** unlike the vault, the hero cannot be exercised in a static harness — it needs
  Liquid rendering. Pinned-scroll feel is QA'd by the user on `shopify theme dev` at :9292.
- **Pin length:** desktop is `end: '+=280%'` today (`:1657`). Re-tune once the acts are re-cut;
  five acts over 2.8 viewports may read sluggish.
