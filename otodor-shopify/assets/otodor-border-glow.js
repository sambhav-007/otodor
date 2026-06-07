/* ─────────────────────────────────────────────────────────
   BorderGlow (React Bits) — vanilla port for Shopify.
   A single delegated pointer listener drives every
   .border-glow-card on the page (current or dynamically
   loaded), setting the two CSS variables the effect reads:
     --edge-proximity  (0-100)  how close the pointer is to an edge
     --cursor-angle    (deg)    direction of the pointer from center
  ───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  function edgeProximity(rect, x, y) {
    var cx = rect.width / 2;
    var cy = rect.height / 2;
    var dx = x - cx;
    var dy = y - cy;
    var kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    var ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function cursorAngle(rect, x, y) {
    var cx = rect.width / 2;
    var cy = rect.height / 2;
    var dx = x - cx;
    var dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    var deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg;
  }

  document.addEventListener(
    'pointermove',
    function (e) {
      var card = e.target && e.target.closest ? e.target.closest('.border-glow-card') : null;
      if (!card) return;
      var rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      card.style.setProperty('--edge-proximity', (edgeProximity(rect, x, y) * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', cursorAngle(rect, x, y).toFixed(3) + 'deg');
    },
    { passive: true }
  );
})();
