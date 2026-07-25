/**
 * OTODOR — Animation Controller
 * Version: 1.0.0
 *
 * Architecture:
 * ─────────────────────────────────────────────────────────────
 * - All animations are PROGRESSIVE ENHANCEMENTS.
 *   If this file or GSAP fails to load, the page remains
 *   fully functional — CSS transitions handle micro-interactions.
 *
 * - Each section self-registers its animation timeline via
 *   OtodorAnimations.registerSection(). This modular pattern
 *   means Phase 5 (Three.js / R3F) can attach to the same
 *   ScrollTrigger infrastructure without refactoring.
 *
 * - The 'js-loaded' class is added by theme.liquid BEFORE this
 *   script runs. So CSS reveal states are already active when
 *   GSAP takes over.
 *
 * Phase 5 hooks:
 * - window.OtodorAnimations.registerSection()  ← modular API
 * - window.OtodorAnimations.getScrollTrigger() ← R3F can access
 * - data-otodor-section / data-3d-slot attrs ready on all elements
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─── Guard: only run when GSAP is available ──────────────────
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[OTODOR] GSAP not available — CSS fallback active.');
    // Mark all reveal elements as visible (fallback)
    document.querySelectorAll('[data-otodor-reveal], [data-otodor-stagger] > *').forEach(function (el) {
      el.classList.add('is-revealed');
    });
    return;
  }

  // ─── Register ScrollTrigger plugin ───────────────────────────
  gsap.registerPlugin(ScrollTrigger);

  // ─── Respect prefers-reduced-motion ──────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Reveal all hidden elements immediately, no animation
    document.querySelectorAll('[data-otodor-reveal], [data-otodor-stagger] > *').forEach(function (el) {
      el.classList.add('is-revealed');
    });
    return;
  }

  // ─── Global configuration ─────────────────────────────────────
  const CONFIG = {
    // ScrollTrigger defaults
    scrollTrigger: {
      start: 'top 88%',      // trigger when element is 88% from top of viewport
      toggleActions: 'play none none none',
    },
    // Stagger defaults
    stagger: {
      base:  0.10,  // seconds between each staggered child
      max:   0.50,  // cap stagger at 500ms total
    },
    // Duration defaults (seconds)
    dur: {
      fast:   0.30,
      base:   0.65,
      slow:   0.90,
      reveal: 1.00,
    },
    // Easing
    ease: {
      spring: 'power3.out',
      gentle: 'power2.out',
      sharp:  'power4.out',
    },
  };

  // ─── Section registry (Phase 5 extension point) ──────────────
  const _sections = new Map();

  /**
   * OtodorAnimations — Public API
   * Available on window for Phase 5 Three.js/R3F integration.
   */
  const OtodorAnimations = {

    /**
     * Register a section's animation timeline.
     * Phase 5: Three.js canvases can call this to sync with ScrollTrigger.
     *
     * @param {string}   name     - Matches data-otodor-section value
     * @param {Function} initFn   - Called with (element, gsap, ScrollTrigger, CONFIG)
     */
    registerSection: function (name, initFn) {
      const el = document.querySelector(`[data-otodor-section="${name}"]`);
      if (!el) return;
      const tl = initFn(el, gsap, ScrollTrigger, CONFIG);
      if (tl) _sections.set(name, tl);
    },

    /**
     * Get a registered section timeline by name.
     * Useful for R3F to attach 3D animations to existing timelines.
     */
    getSection: function (name) {
      return _sections.get(name) || null;
    },

    /**
     * Get GSAP ScrollTrigger reference.
     * Phase 5: R3F can use this to create synchronized WebGL animations.
     */
    getScrollTrigger: function () {
      return ScrollTrigger;
    },

    /**
     * Refresh all ScrollTriggers.
     * Call after dynamic content loads (lazy sections, React hydration).
     */
    refresh: function () {
      ScrollTrigger.refresh();
    },
  };

  // Expose to window for Phase 5 integration
  window.OtodorAnimations = OtodorAnimations;

  // ─── Core: Scroll reveals (all types) ─────────────────────────
  // Handles every [data-otodor-reveal] value (fade-up/fade-in/scale-in/
  // blur-in/mask-up/depth). CSS owns the per-type transition; JS just
  // toggles .is-revealed on enter, honouring an optional per-element
  // data-otodor-reveal-delay (ms) for hand-tuned choreography.
  function initReveals() {
    const elements = document.querySelectorAll('[data-otodor-reveal]');
    elements.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: CONFIG.scrollTrigger.start,
        onEnter: function () {
          const delay = parseInt(el.getAttribute('data-otodor-reveal-delay'), 10) || 0;
          if (delay > 0) {
            setTimeout(function () { el.classList.add('is-revealed'); }, delay);
          } else {
            el.classList.add('is-revealed');
          }
        },
        once: true,
      });
    });
  }

  // ─── Core: Staggered children ─────────────────────────────────
  function initStaggerReveals() {
    const groups = document.querySelectorAll('[data-otodor-stagger]');
    groups.forEach(function (group) {
      const children = group.querySelectorAll(':scope > *');
      if (!children.length) return;

      ScrollTrigger.create({
        trigger: group,
        start: CONFIG.scrollTrigger.start,
        onEnter: function () {
          children.forEach(function (child, i) {
            const delay = Math.min(i * CONFIG.stagger.base, CONFIG.stagger.max);
            setTimeout(function () {
              child.classList.add('is-revealed');
            }, delay * 1000);
          });
        },
        once: true,
      });
    });
  }

  // ─── Core: Animated counters (stat numbers) ───────────────────
  function initCounters() {
    const counters = document.querySelectorAll('[data-otodor-counter]');
    counters.forEach(function (el) {
      const target    = parseFloat(el.getAttribute('data-otodor-counter')) || 0;
      const suffix    = el.getAttribute('data-counter-suffix') || '';
      const prefix    = el.getAttribute('data-counter-prefix') || '';
      const decimals  = (target % 1 !== 0) ? 1 : 0;
      const duration  = parseFloat(el.getAttribute('data-counter-duration')) || 2.0;

      // No-JS default: show the final number (already in DOM)
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: function () {
          gsap.fromTo(
            { val: 0 },
            { val: target,
              duration: duration,
              ease: 'power2.out',
              onUpdate: function () {
                el.textContent = prefix + this.targets()[0].val.toFixed(decimals) + suffix;
              },
            }
          );
        },
        once: true,
      });
    });
  }

  // ─── Core: Parallax (subtle, on scroll) ───────────────────────
  function initParallax() {
    const elements = document.querySelectorAll('[data-otodor-parallax]');
    elements.forEach(function (el) {
      const speed = parseFloat(el.getAttribute('data-otodor-parallax')) || 0.3;
      gsap.to(el, {
        yPercent: -15 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-otodor-section]') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // ─── Init: run all core animations ───────────────────────────
  function init() {
    // Wait for fonts to ensure no layout shifts affect measurements
    document.fonts.ready.then(function () {
      initReveals();
      initStaggerReveals();
      initCounters();
      initParallax();

      // Initial refresh to ensure correct positions after fonts load
      ScrollTrigger.refresh();
    });
  }

  // ─── Shopify Design Mode (theme editor) ───────────────────────
  // Re-init on section load/select in the Shopify theme editor
  if (Shopify.designMode) {
    document.addEventListener('shopify:section:load', function () {
      ScrollTrigger.refresh();
    });
    document.addEventListener('shopify:section:reorder', function () {
      ScrollTrigger.refresh();
    });
  }

  // ─── Boot ─────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


/* ═══════════════════════════════════════════════════════════════
   OTODOR Motion System V2 — pointer interaction layer
   Independent of GSAP (pure pointer math + CSS custom properties).
   Progressive enhancement: skipped under prefers-reduced-motion;
   cursor/magnetic/tilt/mouse-parallax gated to fine pointers.
   Styling lives in otodor-motion.css.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer) root.classList.add('js-fine-pointer');

  const lerp = function (a, b, n) { return a + (b - a) * n; };
  const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [data-otodor-magnetic], [data-cursor]';

  // ── Custom cursor (fine pointer only; native cursor retained) ──
  function initCursor() {
    const dot = document.createElement('div'); dot.className = 'otodor-cursor';
    const ring = document.createElement('div'); ring.className = 'otodor-cursor-ring';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot); document.body.appendChild(ring);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my, ready = false;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      if (!ready) { ready = true; root.classList.add('js-cursor-ready'); }
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(INTERACTIVE)) root.classList.add('js-cursor-active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(INTERACTIVE)) {
        const to = e.relatedTarget;
        if (!to || !(to.closest && to.closest(INTERACTIVE))) root.classList.remove('js-cursor-active');
      }
    });
    window.addEventListener('mousedown', function () { root.classList.add('js-cursor-down'); });
    window.addEventListener('mouseup', function () { root.classList.remove('js-cursor-down'); });
    document.addEventListener('mouseleave', function () { root.classList.remove('js-cursor-ready'); });
    document.addEventListener('mouseenter', function () { if (ready) root.classList.add('js-cursor-ready'); });

    (function raf() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(raf);
    })();
  }

  // ── Magnetic elements ──
  function bindMagnetic(scope) {
    if (!finePointer) return;
    (scope || document).querySelectorAll('[data-otodor-magnetic]').forEach(function (el) {
      if (el._otodorMag) return; el._otodorMag = true;
      const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.4;
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - (r.left + r.width / 2)) * strength) + 'px');
        el.style.setProperty('--my', ((e.clientY - (r.top + r.height / 2)) * strength) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px');
      });
    });
  }

  // ── Tilt (3D hover) ──
  function bindTilt(scope) {
    if (!finePointer) return;
    (scope || document).querySelectorAll('[data-otodor-tilt]').forEach(function (el) {
      if (el._otodorTilt) return; el._otodorTilt = true;
      const max = parseFloat(el.getAttribute('data-tilt-max')) || 8;
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (px * max) + 'deg');
        el.style.setProperty('--rx', (-py * max) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ── Mouse-parallax (elements drift with the cursor) ──
  function bindMouseParallax() {
    if (!finePointer) return;
    const els = document.querySelectorAll('[data-otodor-mouse-parallax]');
    if (!els.length) return;
    window.addEventListener('mousemove', function (e) {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
      els.forEach(function (el) {
        const s = parseFloat(el.getAttribute('data-otodor-mouse-parallax')) || 12;
        el.style.setProperty('--px', (dx * s) + 'px');
        el.style.setProperty('--py', (dy * s) + 'px');
      });
    }, { passive: true });
  }

  // ── Liquid CTA hover (sheen follows the pointer) ──
  function bindLiquid(scope) {
    (scope || document).querySelectorAll('.otodor-btn--liquid').forEach(function (el) {
      if (el._otodorLiquid) return; el._otodorLiquid = true;
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--liquid-x', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--liquid-y', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  function boot() {
    if (finePointer) initCursor();
    bindMagnetic(document);
    bindTilt(document);
    bindMouseParallax();
    bindLiquid(document);
  }

  // Re-bind interactive elements added by the theme editor.
  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (e) {
      bindMagnetic(e.target); bindTilt(e.target); bindLiquid(e.target);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
