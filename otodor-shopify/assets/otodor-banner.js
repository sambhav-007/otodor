/* ─────────────────────────────────────────────────────────
   OTODOR Banner — minimal slideshow controller

   Vanilla, per-instance, no dependencies (no GSAP). Every behaviour
   is optional: with JS off the first slide renders on its own and all
   copy/links stay readable.

   Autoplay pauses on hover, on focus-within, when the tab is hidden,
   and when the banner scrolls out of view. Reduced motion never autoplays.
───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var SELECTOR = '[data-otodor-banner]';

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function OtodorBanner(root) {
    this.root = root;
    this.slides = Array.prototype.slice.call(root.querySelectorAll('[data-banner-slide]'));
    this.dots = Array.prototype.slice.call(root.querySelectorAll('[data-banner-dot]'));
    if (this.slides.length === 0) return;

    this.index = 0;
    this.interval = parseInt(root.getAttribute('data-interval'), 10) || 6000;
    this.autoplayWanted = root.getAttribute('data-autoplay') === 'true' && this.slides.length > 1 && !prefersReducedMotion();
    this.pauseOnHover = root.getAttribute('data-pause-on-hover') === 'true';

    this.timer = null;
    this.blockers = Object.create(null); // reason → true; autoplay runs only when empty

    this.onVisibility = this.onVisibility.bind(this);

    this.setup();
  }

  OtodorBanner.prototype.setup = function () {
    var self = this;

    this.root.classList.add('is-ready');
    this.apply(0);

    this.dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        self.goTo(i);
        self.restart();
      });
    });

    // Keyboard: arrows move between slides while the nav has focus.
    var nav = this.root.querySelector('[data-banner-nav]');
    if (nav) {
      nav.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          self.goTo(self.index + 1, true);
          self.restart();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          self.goTo(self.index - 1, true);
          self.restart();
        }
      });
    }

    if (this.slides.length > 1) this.bindSwipe();

    if (!this.autoplayWanted) return;

    if (this.pauseOnHover) {
      this.root.addEventListener('mouseenter', function () { self.block('hover'); });
      this.root.addEventListener('mouseleave', function () { self.unblock('hover'); });
    }
    this.root.addEventListener('focusin', function () { self.block('focus'); });
    this.root.addEventListener('focusout', function (event) {
      if (!self.root.contains(event.relatedTarget)) self.unblock('focus');
    });

    document.addEventListener('visibilitychange', this.onVisibility);

    // Off-screen banners must not burn frames or advance unseen.
    if ('IntersectionObserver' in window) {
      this.block('offscreen');
      this.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) self.unblock('offscreen');
          else self.block('offscreen');
        });
      }, { threshold: 0.2 });
      this.observer.observe(this.root);
    } else {
      this.start();
    }
  };

  /* ── Slide state ─────────────────────────────────────── */
  OtodorBanner.prototype.apply = function (index) {
    var self = this;

    this.slides.forEach(function (slide, i) {
      var active = i === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      // Keep hidden slides out of the tab order without trapping focus.
      Array.prototype.forEach.call(slide.querySelectorAll('a[href], button'), function (node) {
        if (active) node.removeAttribute('tabindex');
        else node.setAttribute('tabindex', '-1');
      });
    });

    this.dots.forEach(function (dot, i) {
      dot.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    // Restart the progress fill from zero on the new active dot.
    var fill = this.dots[index] && this.dots[index].querySelector('.otodor-banner__dot-fill');
    if (fill) {
      fill.style.animation = 'none';
      // Forced reflow — the documented way to replay a CSS animation.
      void fill.offsetWidth;
      fill.style.animation = '';
    }

    self.index = index;
  };

  OtodorBanner.prototype.goTo = function (index, focusDot) {
    var count = this.slides.length;
    var next = ((index % count) + count) % count;
    if (next === this.index) return;
    this.apply(next);
    if (focusDot && this.dots[next]) this.dots[next].focus();
  };

  /* ── Autoplay ────────────────────────────────────────── */
  OtodorBanner.prototype.start = function () {
    if (!this.autoplayWanted || this.timer) return;
    var self = this;
    this.root.classList.add('is-autoplaying');
    this.root.classList.remove('is-paused');
    this.timer = window.setInterval(function () {
      self.goTo(self.index + 1);
    }, this.interval);
  };

  OtodorBanner.prototype.stop = function () {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.autoplayWanted) this.root.classList.add('is-paused');
  };

  OtodorBanner.prototype.restart = function () {
    if (!this.autoplayWanted || Object.keys(this.blockers).length) return;
    this.stop();
    this.root.classList.remove('is-paused');
    this.start();
  };

  OtodorBanner.prototype.block = function (reason) {
    this.blockers[reason] = true;
    this.stop();
  };

  OtodorBanner.prototype.unblock = function (reason) {
    delete this.blockers[reason];
    if (Object.keys(this.blockers).length === 0) {
      this.root.classList.remove('is-paused');
      this.start();
    }
  };

  OtodorBanner.prototype.onVisibility = function () {
    if (document.hidden) this.block('tab');
    else this.unblock('tab');
  };

  /* ── Touch swipe ─────────────────────────────────────── */
  OtodorBanner.prototype.bindSwipe = function () {
    var self = this;
    var startX = null;
    var startY = null;
    var viewport = this.root.querySelector('[data-banner-viewport]') || this.root;

    viewport.addEventListener('touchstart', function (event) {
      var touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    }, { passive: true });

    viewport.addEventListener('touchend', function (event) {
      if (startX === null) return;
      var touch = event.changedTouches[0];
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;
      startX = null;
      startY = null;
      // Horizontal intent only — never hijack a vertical page scroll.
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      self.goTo(self.index + (dx < 0 ? 1 : -1));
      self.restart();
    }, { passive: true });
  };

  OtodorBanner.prototype.destroy = function () {
    this.stop();
    if (this.observer) this.observer.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
  };

  /* ── Boot ────────────────────────────────────────────── */
  function initAll(scope) {
    var root = scope || document;
    Array.prototype.forEach.call(root.querySelectorAll(SELECTOR), function (node) {
      if (node._otodorBanner) return;
      node._otodorBanner = new OtodorBanner(node);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }

  // Theme editor lifecycle
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
  document.addEventListener('shopify:section:unload', function (event) {
    var node = event.target.querySelector(SELECTOR);
    if (node && node._otodorBanner) {
      node._otodorBanner.destroy();
      node._otodorBanner = null;
    }
  });
  document.addEventListener('shopify:block:select', function (event) {
    var node = event.target.closest(SELECTOR);
    var index = parseInt(event.target.getAttribute('data-slide-index'), 10);
    if (node && node._otodorBanner && !isNaN(index)) {
      node._otodorBanner.block('editor');
      node._otodorBanner.goTo(index);
    }
  });
  document.addEventListener('shopify:block:deselect', function (event) {
    var node = event.target.closest(SELECTOR);
    if (node && node._otodorBanner) node._otodorBanner.unblock('editor');
  });
})();
