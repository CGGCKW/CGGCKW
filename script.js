/* ============================================================
   Interactions: sticky header, mobile nav, reveal, counters
   ============================================================ */
(function () {
  'use strict';

  /* ---- Sticky header ---- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('solid');
    else header.classList.remove('solid');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---- Reveal on scroll ---- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var siblings = Array.prototype.slice.call(
            el.parentElement.querySelectorAll(':scope > .reveal')
          );
          var idx = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = Math.min(idx * 70, 420) + 'ms';
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Number counters ---- */
  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var duration = target > 10000 ? 1800 : 1300;
    var start = null;

    if (reduce) {
      el.textContent = formatNumber(target);
      return;
    }

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNumber(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('[data-count]');
  if (!('IntersectionObserver' in window)) {
    counters.forEach(runCounter);
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Smooth anchor offset for fixed header ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = header ? header.offsetHeight - 1 : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
