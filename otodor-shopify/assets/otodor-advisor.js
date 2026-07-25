/* ═══════════════════════════════════════════════════════════════════════
   OTODOR Guided Advisor
   Deterministic client-side product finder. No framework, no network.
   Each instance: [data-otodor-advisor]. Steps are <fieldset data-adv-step>,
   options <button data-adv-option data-adv-target data-adv-weight>. On finish,
   the highest-scoring target reveals its hidden [data-adv-rec] card.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  function initAdvisor(root) {
    var steps = Array.prototype.slice.call(root.querySelectorAll('[data-adv-step]'));
    var result = root.querySelector('[data-adv-result]');
    var recs = Array.prototype.slice.call(root.querySelectorAll('[data-adv-rec]'));
    var fill = root.querySelector('[data-adv-fill]');
    var count = root.querySelector('[data-adv-count]');
    var progressbar = root.querySelector('[data-adv-progressbar]');
    var total = steps.length;
    if (!total || !result) return;

    var current = 0;
    // Single source of truth: one {target, weight} per answered step.
    var choices = [];

    function tally() {
      var scores = {};
      choices.forEach(function (c) { scores[c.target] = (scores[c.target] || 0) + c.weight; });
      return scores;
    }

    function updateProgress(n) {
      var pct = total ? (n / total) * 100 : 0;
      if (fill) fill.style.width = pct + '%';
      if (count) count.textContent = n + ' / ' + total;
      if (progressbar) progressbar.setAttribute('aria-valuenow', String(n));
    }

    function showStep(index) {
      steps.forEach(function (s, i) { s.hidden = i !== index; });
      result.hidden = true;
      current = index;
      updateProgress(index + 1);
      var firstOpt = steps[index].querySelector('[data-adv-option]');
      if (firstOpt) firstOpt.focus();
    }

    function pickWinner() {
      var scores = tally();
      var bestKey = 'default';
      var bestScore = 0;
      Object.keys(scores).forEach(function (k) {
        if (scores[k] > bestScore) { bestScore = scores[k]; bestKey = k; }
      });
      return bestKey;
    }

    function showResult() {
      steps.forEach(function (s) { s.hidden = true; });
      var winner = pickWinner();
      var shown = false;
      recs.forEach(function (r) {
        var match = r.getAttribute('data-adv-rec') === winner;
        r.hidden = !match;
        if (match) shown = true;
      });
      if (!shown) {
        // Winning target has no card (or default) — fall back to the default card.
        recs.forEach(function (r) { r.hidden = r.getAttribute('data-adv-rec') !== 'default'; });
      }
      updateProgress(total);
      result.hidden = false;
      result.focus();
    }

    function choose(target, weight) {
      var w = parseInt(weight, 10);
      choices[current] = { target: target, weight: isNaN(w) ? 1 : w };
      choices.length = current + 1; // truncate any forward answers
      if (current < total - 1) {
        showStep(current + 1);
      } else {
        showResult();
      }
    }

    function goBack() {
      if (current === 0) return;
      choices.pop();
      showStep(current - 1);
    }

    root.querySelectorAll('[data-adv-option]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        choose(btn.getAttribute('data-adv-target'), btn.getAttribute('data-adv-weight'));
      });
    });

    root.querySelectorAll('[data-adv-back]').forEach(function (btn) {
      btn.addEventListener('click', goBack);
    });

    var restart = root.querySelector('[data-adv-restart]');
    if (restart) {
      restart.addEventListener('click', function () { choices = []; showStep(0); });
    }

    showStep(0);
  }

  function boot() {
    document.querySelectorAll('[data-otodor-advisor]').forEach(initAdvisor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
