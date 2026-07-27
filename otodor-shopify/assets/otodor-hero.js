/* ═══════════════════════════════════════════════════════════════════════
   OTODOR Hero — pinned monolith scroll choreography
   Extracted from sections/otodor-hero.liquid (Phase 1, OTODOR-HERO-MOTION.md).

   Self-initialising: binds every [data-otodor-section="hero"] on the page, so
   no Liquid interpolation is needed here and the file stays a static asset.

   Motion standard (binding — see OTODOR-HERO-MOTION.md §4): under `scrub`,
   animate ONLY transform and opacity. Never background, boxShadow, filter,
   stroke or zIndex — those repaint every frame and are the source of jank.

   Depends on: GSAP + ScrollTrigger (self-hosted, see layout/theme.liquid).
   Degrades to the static CSS layout when GSAP is absent or the visitor
   prefers reduced motion.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var HERO_SELECTOR = '[data-otodor-section="hero"]';

  function initHero(section) {
    if (!section) return;

    /* ── Scroll Guide Indicator click ────────────────────────── */
    var scrollBtn = section.querySelector('[data-scroll-indicator]');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', function () {
        var nextSection = section.closest('.shopify-section')
          ? section.closest('.shopify-section').nextElementSibling
          : section.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
        }
      });
    }

    /* ── GSAP Pinned Scroll Animation ────────────────────────── */
    function initHeroAnimation() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[OTODOR] GSAP/ScrollTrigger not loaded. Using static CSS layout.');
        return;
      }
      
      // Respect reduced motion settings
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // ── Tear down any previous build ──────────────────────────
      // initHeroAnimation can run more than once (page load, theme-editor
      // section reload, and breakpoint changes). Without this cleanup a
      // desktop build persists when the viewport later becomes a phone, so
      // the long desktop animation keeps running on mobile.
      ScrollTrigger.getAll().forEach(function (st) {
        if (st.trigger === section) st.kill(true);
      });
      section.classList.remove('js-animated', 'js-mobile-animated', 'is-motion-live');
      gsap.set(section.querySelectorAll(
        '.centerpiece-obelisk, .obelisk-pillar--left-wing, .obelisk-pillar--right-wing, ' +
        '.otodor-hero__product-node, .product-reveal-caption, .otodor-hero__text-frame, ' +
        '.centerpiece-internal-glow, .pillar-seam, .pillar-layer-glow, .pillar-logo-icon, ' +
        '.otodor-hero__glow-core, .otodor-hero__core-container, .otodor-hero__products-grid, ' +
        '.otodor-hero__vault-pedestal, .otodor-hero__connections-svg, .otodor-hero__stage'
      ), { clearProps: 'all' });

      var isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      if (!isDesktop) {
        initMobileHero();
        return;
      }

      // Active animation styling flag
      section.classList.add('js-animated');

      // Create ScrollTrigger Timeline for desktop scrubbing (scrub: 1)
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=280%', // Pinned scroll track height — shorter scroll to clear the hero
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          // First pinned section on the page, so it must refresh FIRST: its pin
          // spacer adds ~280vh to the document and every later trigger's position
          // depends on that. Without this, later pins (otodor-moments) measure a
          // document that doesn't yet contain this spacer and start far too early.
          refreshPriority: 1,
          // Compositor promotion is granted only while the timeline is live.
          onToggle: function (self) {
            section.classList.toggle('is-motion-live', self.isActive);
          }
        }
      });

      var viewport = section.querySelector('.otodor-hero__viewport');
      var stage = section.querySelector('.otodor-hero__stage');
      var centerpiece = section.querySelector('.centerpiece-obelisk');
      
      var centerPillar = section.querySelector('.obelisk-pillar--center');
      var leftWing = section.querySelector('.obelisk-pillar--left-wing');
      var rightWing = section.querySelector('.obelisk-pillar--right-wing');
      var internalGlow = section.querySelector('.centerpiece-internal-glow');
      var seams = centerpiece.querySelectorAll('.pillar-seam');
      var plateGlows = centerpiece.querySelectorAll('.pillar-layer-glow');
      
      var node1 = section.querySelector('.product-node--1');
      var node2 = section.querySelector('.product-node--2');
      var node3 = section.querySelector('.product-node--3');
      var node4 = section.querySelector('.product-node--4');
      var nodes = [node1, node2, node3, node4];

      var captions = nodes.map(function (node) {
        return node.querySelector('.product-reveal-caption');
      });

      var frameIntro = section.querySelector('.frame--intro');
      var frameFinal = section.querySelector('.frame--final');
      var vaultPedestal = section.querySelector('.otodor-hero__vault-pedestal');
      var coreContainer = section.querySelector('.otodor-hero__core-container');
      var productsGrid = section.querySelector('.otodor-hero__products-grid');

      var connectionsSvg = section.querySelector('.otodor-hero__connections-svg');

      var paths = [
        section.querySelector('.path-1'),
        section.querySelector('.path-2'),
        section.querySelector('.path-3'),
        section.querySelector('.path-4')
      ];
      var pulses = section.querySelectorAll('.ecosystem-pulse');

      // Wide orbit — responsive footprint with a clean central exclusion zone.
      // The grid is centred at 46% (above the true middle), so the top row uses a
      // SMALLER vertical magnitude than it appears to need — otherwise the top
      // products clip off the top edge. The bottom row stays shallow to leave a
      // clean band at the bottom for the final CTA.
      var orbitX = Math.min(Math.max(window.innerWidth * 0.27, 340), 470);
      var orbitYTop = Math.min(Math.max(window.innerHeight * 0.205, 175), 250);
      var orbitYBot = Math.min(Math.max(window.innerHeight * 0.135, 120), 180);
      var finalSlots = [
        { x: -orbitX, y: -orbitYTop },
        { x: orbitX, y: -orbitYTop },
        { x: -orbitX, y: orbitYBot },
        { x: orbitX, y: orbitYBot }
      ];
      var entryVectors = [
        { x: -150, y: -80, rotation: -10 },
        { x: 150, y: -80, rotation: 12 },
        { x: -150, y: 110, rotation: -12 },
        { x: 150, y: 110, rotation: 8 }
      ];
      var spotlightScale = 1.12;
      var settledScale = 0.92;
      var lineupScale = 1.08;

      // ── Initial state ─────────────────────────────────────────
      gsap.set(centerPillar, { xPercent: -50, yPercent: -50, z: 0 });
      gsap.set(leftWing, { xPercent: -50, yPercent: -50, x: -124, z: -26 });
      gsap.set(rightWing, { xPercent: -50, yPercent: -50, x: 124, z: -26 });
      gsap.set(centerpiece, { transformOrigin: '50% 50%' });
      gsap.set(nodes, { xPercent: -50, yPercent: -50, opacity: 0.14, scale: 0.82, rotation: 0 });
      gsap.set(captions, { opacity: 0, x: 16 });
      gsap.set(productsGrid, { pointerEvents: 'none' });
      if (connectionsSvg) gsap.set(connectionsSvg, { opacity: 0.95 });

      if (stage) {
        tl.fromTo(stage,
          { scale: 1 },
          { scale: 1.08, duration: 8.9, ease: 'sine.inOut' },
          0
        );
      }

      function hideAllNarratives() {
        gsap.set(captions, { opacity: 0, x: 16 });
      }

      function revealProduct(node, caption, slotIndex, time) {
        var slot = finalSlots[slotIndex];
        var entry = entryVectors[slotIndex];
        var startX = slot.x + entry.x;
        var startY = slot.y + entry.y;

        gsap.set(node, {
          xPercent: -50,
          yPercent: -50,
          x: startX,
          y: startY,
          rotation: entry.rotation,
          opacity: 0.14,
          scale: 0.84,
          zIndex: 44
        });

        tl.call(function () {
          nodes.forEach(function (n) {
            n.classList.remove('is-spotlight');
          });
          node.classList.add('is-spotlight');
        }, null, time);

        tl.to(node, {
          opacity: 1,
          scale: spotlightScale,
          x: slot.x,
          y: slot.y,
          rotation: 0,
          duration: 1.35,
          ease: 'power4.out'
        }, time);

        tl.to(caption, {
          opacity: 1,
          x: 0,
          duration: 0.95,
          ease: 'power3.out'
        }, time + 0.45);

        if (paths[slotIndex]) {
          tl.to(paths[slotIndex], {
            stroke: 'rgba(77, 166, 255, 0.46)',
            duration: 0.85,
            ease: 'power3.out'
          }, time + 0.5);
          tl.call(function () {
            paths[slotIndex].classList.add('ecosystem-path-active');
          }, null, time + 0.5);
        }
      }

      function settleProduct(node, caption, time) {
        tl.call(function () {
          node.classList.remove('is-spotlight');
        }, null, time);

        tl.to(node, {
          opacity: 0.68,
          scale: settledScale,
          zIndex: 28,
          duration: 0.8,
          ease: 'power3.inOut'
        }, time);
        tl.to(caption, {
          opacity: 0,
          x: 10,
          duration: 0.55,
          ease: 'power3.inOut'
        }, time);
      }

      // ── Scene 1: Vault only — anticipation ────────────────────
      tl.fromTo(vaultPedestal,
        { opacity: 0.25, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 2.1, ease: 'power3.out' },
        0
      );

      tl.fromTo(centerpiece,
        { scale: 0.72, opacity: 0.35, rotationY: -24, rotationX: 12 },
        { scale: 1, opacity: 1, rotationY: -12, rotationX: 10, duration: 2.1, ease: 'power4.out' },
        0
      );

      if (internalGlow) {
        tl.fromTo(internalGlow,
          { scale: 0.85, opacity: 0.18 },
          { scale: 1, opacity: 0.42, duration: 2.0, ease: 'power3.out' },
          0.2
        );
      }

      tl.fromTo('.otodor-hero__glow-core',
        { scale: 0.9, opacity: 0.22 },
        { scale: 1, opacity: 0.55, duration: 2.1, ease: 'power3.out' },
        0
      );

      tl.fromTo(frameIntro,
        { opacity: 1, y: 0, pointerEvents: 'auto' },
        { opacity: 0, y: -24, pointerEvents: 'none', duration: 1.0, ease: 'power2.inOut' },
        1.0
      );

      // ── Scene 2: Digital Lock enters from above ───────────────
      var s2 = 1.8;
      hideAllNarratives();
      revealProduct(node1, captions[0], 0, s2);
      // Monolith leans toward card 1 (top-left) as it reveals
      tl.to(centerpiece, { rotationY: -18, rotationX: 13, duration: 1.1, ease: 'power2.inOut' }, s2);

      // ── Scene 3: Gate Lock enters from right ──────────────────
      var s3 = 3.2;
      settleProduct(node1, captions[0], s3 - 0.3);
      revealProduct(node2, captions[1], 1, s3);
      // Monolith leans toward card 2 (top-right)
      tl.to(centerpiece, { rotationY: 18, rotationX: 13, duration: 1.1, ease: 'power2.inOut' }, s3);

      // ── Scene 4: Padlock enters from left ───────────────────
      var s4 = 4.6;
      settleProduct(node2, captions[1], s4 - 0.3);
      revealProduct(node3, captions[2], 2, s4);
      // Monolith leans toward card 3 (bottom-left)
      tl.to(centerpiece, { rotationY: -18, rotationX: -1, duration: 1.1, ease: 'power2.inOut' }, s4);

      // ── Scene 5: Gate Motor enters from below ─────────────────
      var s5 = 6.0;
      settleProduct(node3, captions[2], s5 - 0.3);
      revealProduct(node4, captions[3], 3, s5);
      // Monolith leans toward card 4 (bottom-right)
      tl.to(centerpiece, { rotationY: 18, rotationX: -1, duration: 1.1, ease: 'power2.inOut' }, s5);

      // ── Scene 6: Full ecosystem — illuminate, pulse, activate ─
      var s6 = 7.4;

      tl.to(captions[3], { opacity: 0, x: 10, duration: 0.55, ease: 'power3.inOut' }, s6 - 0.15);

      // Ecosystem activates in place — the monolith stays centred (no vertical lift)
      // Acknowledge all four, then straighten upright like the start
      tl.to(centerpiece, {
        rotationY: 0,
        rotationX: 13,
        duration: 0.85,
        ease: 'power2.inOut'
      }, s6);
      tl.to(centerpiece, {
        rotationY: 0,
        rotationX: 6,
        duration: 1.1,
        ease: 'power4.out'
      }, s6 + 0.85);
      tl.to(leftWing, { x: -112, duration: 1.65, ease: 'power4.out' }, s6);
      tl.to(rightWing, { x: 112, duration: 1.65, ease: 'power4.out' }, s6);

      if (internalGlow) {
        tl.to(internalGlow, {
          scale: 1.16,
          opacity: 0.65,
          background: 'radial-gradient(circle, rgba(77, 166, 255, 0.62) 0%, transparent 70%)',
          duration: 1.7,
          ease: 'power4.out'
        }, s6);
      }

      if (plateGlows.length) {
        tl.to(plateGlows, {
          background: 'rgba(77, 166, 255, 0.7)',
          opacity: 0.85,
          duration: 1.6,
          ease: 'power3.out'
        }, s6);
      }

      if (seams.length) {
        tl.to(seams, {
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 0 10px rgba(77, 166, 255, 0.85)',
          duration: 1.6,
          ease: 'power3.out'
        }, s6);
      }

      var logoIcon = centerpiece.querySelector('.pillar-logo-icon');
      if (logoIcon) {
        tl.to(logoIcon, {
          filter: 'drop-shadow(0 0 8px rgba(77, 166, 255, 0.8)) brightness(1.15)',
          scale: 1.08,
          duration: 1.6,
          ease: 'power3.out'
        }, s6);
      }

      tl.to(vaultPedestal, { opacity: 0.86, scale: 1.0, duration: 1.55, ease: 'power3.out' }, s6);
      tl.to('.otodor-hero__glow-core', { opacity: 0.55, scale: 1.02, duration: 1.55, ease: 'power3.out' }, s6);

      tl.call(function () {
        nodes.forEach(function (node) {
          node.classList.remove('is-spotlight');
          node.classList.add('is-ecosystem-active');
        });
      }, null, s6 + 0.18);

      // Network illuminates
      paths.forEach(function (path) {
        if (path) {
          tl.to(path, {
            stroke: 'rgba(77, 166, 255, 0.68)',
            duration: 1.25,
            ease: 'sine.inOut'
          }, s6);
          tl.call(function () {
            path.classList.add('ecosystem-path-illuminated');
          }, null, s6);
        }
      });

      // Pulse travels through all connections once
      if (pulses.length) {
        tl.set(pulses, { opacity: 1 }, s6 + 0.15);
        tl.fromTo(pulses,
          { strokeDashoffset: 0 },
          { strokeDashoffset: -560, duration: 1.3, ease: 'sine.inOut' },
          s6 + 0.15
        );
        tl.to(pulses, { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, s6 + 1.35);
      }

      // All four products at full orbit presence
      nodes.forEach(function (node, i) {
        tl.to(node, {
          opacity: 1,
          scale: lineupScale,
          x: finalSlots[i].x,
          y: finalSlots[i].y,
          rotation: 0,
          zIndex: 34,
          duration: 1.25,
          ease: 'power4.out'
        }, s6 + 0.25 + i * 0.06);
      });

      tl.set(productsGrid, { pointerEvents: 'auto' }, s6 + 1.0);

      // Final headline & CTAs — payoff moment
      tl.fromTo(frameFinal,
        { opacity: 0, y: 36, pointerEvents: 'none' },
        { opacity: 1, y: 0, pointerEvents: 'auto', duration: 1.2, ease: 'power3.out' },
        s6 + 1.55
      );
    }

    /* ── Mobile purpose-built pinned hero (all phones >= 320px) ──
       The monolith reveals and powers on as you scroll; the intro
       heading hands off to the final heading + CTA. */
    function initMobileHero() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        initMobileReveals();
        return;
      }

      section.classList.add('js-mobile-animated');

      var centerpiece = section.querySelector('.centerpiece-obelisk');
      var internalGlow = section.querySelector('.centerpiece-internal-glow');
      var seams = section.querySelectorAll('.pillar-seam');
      var plateGlows = section.querySelectorAll('.pillar-layer-glow');
      var logoIcon = section.querySelector('.pillar-logo-icon');
      var glowCore = section.querySelector('.otodor-hero__glow-core');
      var frameIntro = section.querySelector('.frame--intro');
      var frameFinal = section.querySelector('.frame--final');

      if (frameIntro) gsap.set(frameIntro, { opacity: 1, y: 0 });
      if (frameFinal) gsap.set(frameFinal, { opacity: 0, y: 30 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=140%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 1,   // same ordering rule as the desktop pin above
          onToggle: function (self) {
            section.classList.toggle('is-motion-live', self.isActive);
          }
        }
      });

      var leftWing = section.querySelector('.obelisk-pillar--left-wing');
      var rightWing = section.querySelector('.obelisk-pillar--right-wing');

      // Monolith comes FORWARD (no tilt) — held at a fixed clean angle
      if (centerpiece) {
        tl.fromTo(centerpiece,
          { scale: 0.55, opacity: 0.3, rotationY: -14, rotationX: 8 },
          { scale: 1, opacity: 1, rotationY: -14, rotationX: 8, duration: 2, ease: 'power3.out' }, 0);
      }
      // Side slabs fade in and COMBINE with the centre
      if (leftWing) tl.fromTo(leftWing, { opacity: 0 }, { opacity: 0.75, duration: 1.4, ease: 'power2.out' }, 0.5);
      if (rightWing) tl.fromTo(rightWing, { opacity: 0 }, { opacity: 0.75, duration: 1.4, ease: 'power2.out' }, 0.5);
      // Becomes CLEAR — glow + seams ignite
      if (glowCore) tl.fromTo(glowCore, { opacity: 0.2, scale: 0.9 }, { opacity: 0.55, scale: 1.02, duration: 2, ease: 'power3.out' }, 0);
      if (internalGlow) tl.fromTo(internalGlow, { opacity: 0.18, scale: 0.85 }, { opacity: 0.6, scale: 1.12, duration: 2, ease: 'power3.out' }, 0.3);
      if (plateGlows.length) tl.to(plateGlows, { background: 'rgba(77, 166, 255, 0.7)', opacity: 0.85, duration: 1.3, ease: 'power3.out' }, 0.8);
      if (seams.length) tl.to(seams, { background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 0 10px rgba(77, 166, 255, 0.85)', duration: 1.3, ease: 'power3.out' }, 0.8);
      if (logoIcon) tl.to(logoIcon, { filter: 'drop-shadow(0 0 8px rgba(77, 166, 255, 0.8)) brightness(1.15)', scale: 1.08, duration: 1.3, ease: 'power3.out' }, 0.8);

      // Heading hand-off (intro → final + CTA)
      if (frameIntro) tl.to(frameIntro, { opacity: 0, y: -20, duration: 0.9, ease: 'power2.inOut' }, 1.7);
      if (frameFinal) tl.to(frameFinal, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 2.4);
    }

    /* ── GSAP Mobile Stack reveals (fallback if GSAP missing) ──── */
    function initMobileReveals() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      var monolith = section.querySelector('.centerpiece-obelisk');
      if (monolith) {
        gsap.fromTo(monolith,
          { scale: 0.6, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            scrollTrigger: {
              trigger: monolith,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      var nodes = section.querySelectorAll('.otodor-hero__product-node');
      nodes.forEach(function (node) {
        gsap.fromTo(node,
          { y: 30, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.4,
            scrollTrigger: {
              trigger: node,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }

    /* ── Boot + rebuild hooks (scoped to this section) ───────── */
    if (document.readyState === 'complete') {
      initHeroAnimation();
    } else {
      window.addEventListener('load', initHeroAnimation, { once: true });
    }

    // Rebuild when crossing the desktop/mobile breakpoint so the correct
    // experience is always active (handles resize and devtools toggling).
    var heroMq = window.matchMedia('(min-width: 1024px)');
    var heroMqHandler = function () { initHeroAnimation(); };
    if (heroMq.addEventListener) {
      heroMq.addEventListener('change', heroMqHandler);
    } else if (heroMq.addListener) {
      heroMq.addListener(heroMqHandler);
    }

    /* Rebuild on resize within a breakpoint.
       The desktop orbit slots bake window.innerWidth/innerHeight into pixel
       offsets, and the timeline holds those baked values — so without this the
       products sit at stale coordinates after any resize that does not cross
       1024px.

       Height is only honoured past a threshold: on mobile the browser URL bar
       collapsing on scroll changes innerHeight continuously, and rebuilding a
       pinned timeline mid-scroll would fight the user. Width changes are
       always honoured (a real resize, never scroll jitter). */
    var lastW = window.innerWidth;
    var lastH = window.innerHeight;
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      var w = window.innerWidth;
      var h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w;
      lastH = h;
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initHeroAnimation, 200);
    });
  }

  function boot(root) {
    var scope = root && root.querySelectorAll ? root : document;
    Array.prototype.forEach.call(scope.querySelectorAll(HERO_SELECTOR), initHero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(document); }, { once: true });
  } else {
    boot(document);
  }

  // Theme-editor section reload replaces the DOM — re-bind the new element.
  document.addEventListener('shopify:section:load', function (e) {
    if (e.target) boot(e.target);
  });
})();
