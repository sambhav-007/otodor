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

  // ─── Core: Fade-up reveals ────────────────────────────────────
  function initFadeUpReveals() {
    const elements = document.querySelectorAll('[data-otodor-reveal="fade-up"]');
    elements.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: CONFIG.scrollTrigger.start,
        onEnter: function () {
          el.classList.add('is-revealed');
        },
        once: true,
      });
    });
  }

  // ─── Core: Fade-in reveals ────────────────────────────────────
  function initFadeInReveals() {
    const elements = document.querySelectorAll('[data-otodor-reveal="fade-in"]');
    elements.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: CONFIG.scrollTrigger.start,
        onEnter: function () {
          el.classList.add('is-revealed');
        },
        once: true,
      });
    });
  }

  // ─── Core: Scale-in reveals ───────────────────────────────────
  function initScaleInReveals() {
    const elements = document.querySelectorAll('[data-otodor-reveal="scale-in"]');
    elements.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: CONFIG.scrollTrigger.start,
        onEnter: function () {
          el.classList.add('is-revealed');
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
      initFadeUpReveals();
      initFadeInReveals();
      initScaleInReveals();
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
