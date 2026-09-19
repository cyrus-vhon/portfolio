/* =========================================================
   CYRUS VHON — PORTFOLIO SCRIPT
   Sections:
   1. Light / dark theme toggle (persisted in localStorage)
   2. Typing animation (edit `typingWords` to customize)
   3. Navbar scroll state + active link
   4. Mobile menu toggle
   5. Scroll reveal (IntersectionObserver)
   6. Skill bar + tooltip animation on view
   7. Mouse-following background glow (desktop only)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. LIGHT / DARK THEME TOGGLE ---------- */
  var THEME_KEY = 'cyrus-portfolio-theme';
  var themeToggle = document.getElementById('themeToggle');

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* localStorage unavailable (e.g. private browsing) — theme just won't persist */
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', 'true');
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', 'false');
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
      }
    }
  }

  // The site is designed dark-first — only switch to light if the visitor
  // has explicitly chosen it before (stored in localStorage).
  var initialTheme = getStoredTheme() || 'dark';
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var nextTheme = isLight ? 'dark' : 'light';
      applyTheme(nextTheme);
      storeTheme(nextTheme);
    });
  }

  /* ---------- 2. TYPING ANIMATION ---------- */
  var typingWords = [
    "Web Developer",
    "UI/UX Enthusiast",
    "Problem Solver",
    "BSIT Student",
    "Tech Enthusiast"
  ];

  var typingEl = document.getElementById('typingText');

  function runTypingAnimation() {
    var wordIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var typeSpeed = 90;
    var deleteSpeed = 45;
    var pauseAfterType = 1600;
    var pauseAfterDelete = 400;

    function tick() {
      var currentWord = typingWords[wordIndex];

      if (!deleting) {
        charIndex++;
        typingEl.textContent = currentWord.slice(0, charIndex);

        if (charIndex === currentWord.length) {
          deleting = true;
          setTimeout(tick, pauseAfterType);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        typingEl.textContent = currentWord.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % typingWords.length;
          setTimeout(tick, pauseAfterDelete);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    tick();
  }

  if (typingEl) {
    runTypingAnimation();
  }

  /* ---------- 3. NAVBAR SCROLL STATE + ACTIVE LINK ---------- */
  var navbar = document.getElementById('navbar');
  var navLinkItems = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('main section[id]');

  function handleScrollState() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    var currentId = '';
    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom >= 120) {
        currentId = section.id;
      }
    });

    navLinkItems.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('active-link', isActive);
    });
  }

  window.addEventListener('scroll', handleScrollState, { passive: true });
  handleScrollState();

  /* ---------- 4. MOBILE MENU TOGGLE ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* ---------- SMOOTH SCROLL (custom, works even if the OS/browser
     "reduce motion" setting silently disables native CSS smooth
     scrolling) ---------- */
  var navbarOffset = 90;

  function smoothScrollTo(targetY, duration) {
    var startY = window.pageYOffset;
    var distance = targetY - startY;
    var startTime = null;

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutQuad(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;

      var target = document.getElementById(hash.slice(1));
      if (!target) return;

      e.preventDefault();
      closeMenu();

      var targetY = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - navbarOffset);
      smoothScrollTo(targetY, 650);
      history.pushState(null, '', hash);
    });
  });

  /* ---------- 5. SCROLL REVEAL ---------- */
  var revealTargets = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 6. SKILL BAR ANIMATION ---------- */
  var skillItems = document.querySelectorAll('.skill-item');

  if (skillItems.length) {
    if (!('IntersectionObserver' in window)) {
      skillItems.forEach(function (item) {
        var fill = item.querySelector('.skill-bar-fill');
        if (fill) fill.classList.add('animate');
      });
    } else {
      var skillObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var fill = entry.target.querySelector('.skill-bar-fill');
            if (fill) fill.classList.add('animate');
            skillObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      skillItems.forEach(function (item) { skillObserver.observe(item); });
    }
  }

  /* ---------- 7. MOUSE-FOLLOWING BACKGROUND GLOW ---------- */
  var glow = document.getElementById('cursorGlow');
  var isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (glow && !isTouchDevice && !prefersReducedMotion) {
    var raf = null;

    document.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        glow.style.setProperty('--cursor-x', e.clientX + 'px');
        glow.style.setProperty('--cursor-y', e.clientY + 'px');
        glow.classList.add('active');
        raf = null;
      });
    });

    document.addEventListener('mouseleave', function () {
      glow.classList.remove('active');
    });
  }

});
