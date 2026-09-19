/* ══════════════════════════════════════════════════════════
   Prasiddha Lamichhane — portfolio behaviour
   Vanilla JS, no dependencies. Every game-flavoured touch is
   progressive: the page reads fine with JS disabled.
   ══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── storage helpers (private windows can throw) ──────── */
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* no-op */
    }
  }

  /* ── footer year ──────────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ── mobile navigation ────────────────────────────────── */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));

  function closeNav() {
    if (!siteNav) return;
    siteNav.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ── XP rail + "explored" readout ─────────────────────── */
  var xpFill = document.getElementById('xpFill');
  var exploredValue = document.getElementById('exploredValue');
  var maxExplored = 0;
  var ticking = false;

  function updateProgress() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
    pct = Math.max(0, Math.min(100, pct));

    if (xpFill) xpFill.style.width = pct + '%';

    if (pct > maxExplored) {
      maxExplored = pct;
      if (exploredValue) exploredValue.textContent = Math.round(maxExplored) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ── reveal on scroll ─────────────────────────────────── */
  var revealItems = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ── stat meters fill when they scroll into view ──────── */
  function fillMeter(meter) {
    if (meter.dataset.filled) return;
    meter.dataset.filled = '1';

    var level = parseInt(meter.getAttribute('data-level'), 10) || 0;
    var pips = meter.querySelectorAll('i');

    pips.forEach(function (pip, i) {
      if (i >= level) return;
      if (reduceMotion) {
        pip.classList.add('on');
      } else {
        setTimeout(function () { pip.classList.add('on'); }, 90 * i);
      }
    });
  }

  var meters = document.querySelectorAll('[data-level]');

  if (!('IntersectionObserver' in window)) {
    meters.forEach(fillMeter);
  } else {
    var meterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fillMeter(entry.target);
        meterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    meters.forEach(function (m) { meterObserver.observe(m); });
  }

  /* ── hero stat tiles count up ─────────────────────────── */
  var counters = document.querySelectorAll('[data-count]');

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = String(target); return; }

    var current = 0;
    var step = Math.max(1, Math.round(target / 18));
    el.textContent = '0';

    var timer = setInterval(function () {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = String(current);
    }, 55);
  }

  counters.forEach(countUp);

  /* ── typed terminal line ──────────────────────────────── */
  var typed = document.getElementById('typed');
  var phrases = [
    'whoami',
    'cat focus.txt  →  applied AI, backends that hold up',
    'ls ./projects  →  9 builds, 6 with ML at the core',
    'status        →  open to internships'
  ];

  if (typed) {
    if (reduceMotion) {
      typed.textContent = phrases[0];
    } else {
      var pIndex = 0;
      var cIndex = 0;
      var deleting = false;

      (function tick() {
        var phrase = phrases[pIndex];

        if (!deleting) {
          cIndex++;
          typed.textContent = phrase.slice(0, cIndex);
          if (cIndex === phrase.length) {
            deleting = true;
            return setTimeout(tick, 2200);
          }
          return setTimeout(tick, 42);
        }

        cIndex--;
        typed.textContent = phrase.slice(0, cIndex);
        if (cIndex === 0) {
          deleting = false;
          pIndex = (pIndex + 1) % phrases.length;
          return setTimeout(tick, 420);
        }
        return setTimeout(tick, 18);
      })();
    }
  }

  /* ── project filters ──────────────────────────────────── */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var quests = Array.prototype.slice.call(document.querySelectorAll('.quest'));
  var emptyState = document.getElementById('emptyState');

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      var wanted = button.getAttribute('data-filter');
      var shown = 0;

      filters.forEach(function (b) { b.classList.toggle('is-active', b === button); });

      quests.forEach(function (quest) {
        var cats = (quest.getAttribute('data-cat') || '').split(/\s+/);
        var match = wanted === 'all' || cats.indexOf(wanted) !== -1;
        quest.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });

      if (emptyState) emptyState.hidden = shown !== 0;
    });
  });

  /* ── achievements ─────────────────────────────────────── */
  var ACH_KEY = 'pl.achievements.v1';
  var unlocked = load(ACH_KEY, []);
  if (!Array.isArray(unlocked)) unlocked = [];

  var achievements = {
    first_steps:   'First steps',
    quest_log:     'Quest reader',
    stat_check:    'Stat check',
    completionist: 'Completionist',
    secret:        'Konami veteran'
  };

  var toastEl = document.getElementById('toast');
  var toastQueue = [];
  var toastBusy = false;

  function pumpToast() {
    if (toastBusy || !toastQueue.length || !toastEl) return;
    toastBusy = true;

    var message = toastQueue.shift();
    toastEl.innerHTML = '';

    var title = document.createElement('b');
    title.textContent = 'Achievement unlocked';
    toastEl.appendChild(title);
    toastEl.appendChild(document.createTextNode(message));
    toastEl.classList.add('is-visible');

    setTimeout(function () {
      toastEl.classList.remove('is-visible');
      setTimeout(function () {
        toastBusy = false;
        pumpToast();
      }, 400);
    }, 2600);
  }

  function paint(id) {
    var chip = document.querySelector('[data-ach="' + id + '"]');
    if (!chip) return;
    chip.classList.add('unlocked');
    if (id === 'secret') chip.textContent = '◆ ' + achievements.secret;
  }

  function unlock(id, silent) {
    if (!achievements[id] || unlocked.indexOf(id) !== -1) return;
    unlocked.push(id);
    save(ACH_KEY, unlocked);
    paint(id);
    if (!silent) {
      toastQueue.push(achievements[id]);
      pumpToast();
    }
  }

  unlocked.forEach(paint);

  /* ── section tracking: active nav + achievement triggers ─ */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var visited = {};
  var achFor = { about: 'first_steps', projects: 'quest_log', skills: 'stat_check' };

  function markVisited(id) {
    if (visited[id]) return;
    visited[id] = true;

    if (achFor[id]) unlock(achFor[id]);
    if (Object.keys(visited).length >= sections.length) unlock('completionist');
  }

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var id = entry.target.id;
        markVisited(id);
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ── easter egg: Konami code → arcade mode ────────────── */
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var progress = 0;

  document.addEventListener('keydown', function (e) {
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (key === KONAMI[progress]) {
      progress++;
      if (progress === KONAMI.length) {
        progress = 0;
        document.body.classList.toggle('arcade');
        unlock('secret');
        if (document.body.classList.contains('arcade')) {
          toastQueue.push('Arcade mode on — Konami again to exit');
          pumpToast();
        }
      }
    } else {
      progress = key === KONAMI[0] ? 1 : 0;
    }
  });
})();
