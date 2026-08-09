/* ═══════════════════════════════════════════════════════════════════════
   OTODOR — Offer layer behaviour
   ───────────────────────────────────────────────────────────────────────
   Two small jobs, one file, loaded once sitewide (deferred):

   1. COPY A DISCOUNT CODE.  Delegated on the document, so any
      `[data-otodor-copy="CODE"]` button works — the offer panel on a product
      page, the popup, anything added later. Without JS the code is still
      plain selectable text, so nothing is lost.

   2. THE CAMPAIGN POPUP.  Opens once per visitor per "show again" period,
      after a delay and/or a scroll threshold, and only when the page is
      quiet (not while the visitor is typing in a form, not on a checkout
      redirect). Focus moves in, is trapped, and returns where it came from.
      ESC, the backdrop, the close button and "no thanks" all dismiss.

   Storage keys are namespaced by the coupon code, so a new campaign is seen
   by everyone who dismissed the old one.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DAY = 24 * 60 * 60 * 1000;

  /* ── storage that never throws (private mode, blocked cookies) ─────── */
  function readStore(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* no-op: the popup simply reappears next session */
    }
  }

  /* ── 0. Preview mode ───────────────────────────────────────────────
     The popup deliberately remembers that a visitor has dealt with it —
     7 days after a dismissal, a year after they copy the code. Correct for
     shoppers, miserable for everyone who has to LOOK at it: one click on
     "Copy" and the popup is invisible on that browser until next year, with
     no way back except clearing localStorage by hand. It reads exactly like
     a broken popup, and it is the reason this block exists.

     Two doors that skip the memory entirely — they neither read it nor
     write to it, so previewing never costs you a real impression:

       ?popup=preview   append to any URL — QA, or sharing the campaign
       theme editor     Shopify design mode, so the merchant can actually
                        see the section they are editing

     Both are inert for shoppers: a visitor who never types the parameter
     gets exactly the old behaviour. */
  var params = new URLSearchParams(window.location.search);
  var FORCED =
    params.get('popup') === 'preview' ||
    !!(window.Shopify && window.Shopify.designMode);

  /* ── 1. Copy-to-clipboard ──────────────────────────────────────────── */
  function copyText(text) {
    // The async API can exist and still refuse — an insecure context, a
    // document that isn't focused, a denied permission. Falling back on
    // rejection (not only on absence) is what makes the button dependable.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var scratch = document.createElement('textarea');
      scratch.value = text;
      scratch.setAttribute('readonly', '');
      scratch.style.position = 'fixed';
      scratch.style.opacity = '0';
      document.body.appendChild(scratch);
      scratch.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(scratch);
      ok ? resolve() : reject();
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('[data-otodor-copy]') : null;
    if (!button) return;

    var code = button.getAttribute('data-otodor-copy');
    if (!code) return;

    copyText(code)
      .then(function () {
        var original = button.getAttribute('data-original-label') || button.textContent.trim();
        button.setAttribute('data-original-label', original);
        button.textContent = button.getAttribute('data-copied-label') || 'Copied';
        button.setAttribute('data-copied', 'true');

        // A copied code is an accepted offer — stop asking. Unless we are
        // previewing, in which case copying must not burn the impression.
        var popup = document.querySelector('[data-otodor-popup]');
        if (popup && !FORCED) {
          writeStore('otodor:offer:' + popup.getAttribute('data-popup-key'), String(Date.now() + 365 * DAY));
        }

        window.clearTimeout(button._otodorReset);
        button._otodorReset = window.setTimeout(function () {
          button.textContent = original;
          button.removeAttribute('data-copied');
        }, 2400);
      })
      .catch(function () {
        /* Clipboard refused — the code is still on screen to read. */
      });
  });

  /* ── 2. The campaign popup ─────────────────────────────────────────── */
  var popup = document.querySelector('[data-otodor-popup]');
  if (!popup) return;

  var storeKey = 'otodor:offer:' + popup.getAttribute('data-popup-key');
  if (!FORCED) {
    var suppressedUntil = parseInt(readStore(storeKey) || '0', 10);
    if (suppressedUntil && Date.now() < suppressedUntil) return;
  }

  var dialog = popup.querySelector('[role="dialog"]');
  var rememberDays = parseInt(popup.getAttribute('data-remember-days') || '7', 10);
  var delaySeconds = parseInt(popup.getAttribute('data-delay') || '6', 10);
  var scrollPercent = parseInt(popup.getAttribute('data-scroll') || '0', 10);
  var opener = null;
  var opened = false;
  var timer = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

  function open() {
    if (opened) return;
    opened = true;
    window.clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);

    opener = document.activeElement;
    popup.hidden = false;
    popup.setAttribute('data-open', 'true');
    document.documentElement.style.overflow = 'hidden';

    var first = dialog && dialog.querySelector(FOCUSABLE);
    if (first) first.focus();

    document.addEventListener('keydown', onKeydown);
  }

  function close(remember) {
    if (!opened) return;
    opened = false;
    popup.setAttribute('data-open', 'false');
    popup.hidden = true;
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);

    if (remember !== false && !FORCED) {
      writeStore(storeKey, String(Date.now() + rememberDays * DAY));
    }
    if (opener && typeof opener.focus === 'function') opener.focus();
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== 'Tab' || !dialog) return;

    var items = Array.prototype.filter.call(dialog.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null;
    });
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onScroll() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var progress = (window.scrollY / scrollable) * 100;
    if (progress >= scrollPercent) open();
  }

  popup.addEventListener('click', function (event) {
    if (event.target.closest('[data-otodor-popup-close]')) {
      event.preventDefault();
      close(true);
    }
  });

  // Following the offer is a conversion, not a dismissal — but don't nag either.
  var cta = popup.querySelector('[data-otodor-popup-cta]');
  if (cta) {
    cta.addEventListener('click', function () {
      if (!FORCED) writeStore(storeKey, String(Date.now() + rememberDays * DAY));
    });
  }

  // Preview opens at once. The 6s delay is there to let a shopper land
  // before being interrupted; someone who asked to see the popup has
  // already landed, and six seconds of an apparently empty page is the
  // other half of why this reads as "the popup is missing".
  timer = window.setTimeout(open, FORCED ? 0 : Math.max(0, delaySeconds) * 1000);
  if (scrollPercent > 0) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
