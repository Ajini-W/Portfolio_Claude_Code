/* MYAURA — Ajini W
   Vanilla JavaScript only. No dependencies, no build step. */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasObserver = "IntersectionObserver" in window;

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $all(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  /* Footer year -------------------------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Theme toggle (light default, dark opt-in, persisted) --------------- */
  var themeToggle = $("#theme-toggle");
  var THEME_KEY = "myaura-theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      doc.setAttribute("data-theme", "dark");
    } else {
      doc.removeAttribute("data-theme");
    }
    if (themeToggle) {
      var isDark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  /* The inline head script already applied the saved theme before paint;
     this just wires up the toggle and keeps it in sync. */
  applyTheme(doc.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = doc.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* Sticky header state -------------------------------------------------- */
  var header = $("#site-header");
  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* Mobile menu ---------------------------------------------------------- */
  var toggle = $("#nav-toggle");
  var navLinks = $("#nav-links");
  var mobileQuery = window.matchMedia("(max-width: 1080px)");

  function setMenu(open) {
    if (!toggle || !navLinks) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("is-open", open);
    if (header) header.classList.toggle("menu-open", open);
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    navLinks.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (toggle.getAttribute("aria-expanded") === "true" &&
          !event.target.closest("#nav-links") && !event.target.closest("#nav-toggle")) {
        setMenu(false);
      }
    });

    var onBreakpoint = function () { if (!mobileQuery.matches) setMenu(false); };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onBreakpoint);
    else mobileQuery.addListener(onBreakpoint);
  }

  /* Scroll spy ------------------------------------------------------------ */
  var links = $all(".nav-links a");
  var linkById = {};
  links.forEach(function (link) { linkById[link.getAttribute("href").slice(1)] = link; });

  function setActive(id) {
    links.forEach(function (link) {
      var active = link === linkById[id];
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  var spySections = $all("main section[id]");
  if (hasObserver) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        setActive(id === "top" ? "" : id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spySections.forEach(function (section) { spy.observe(section); });
  }

  window.addEventListener("scroll", function () {
    var atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    if (atBottom) setActive("contact");
  }, { passive: true });

  /* Scroll reveal ---------------------------------------------------------- */
  var revealItems = $all(".reveal");
  if (hasObserver && !reduceMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealItems.forEach(function (item) { revealer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* Links elsewhere on the page that point at a specific project --------- */
  $all("[data-project-link]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      var key = link.getAttribute("data-project-link");
      var target = document.getElementById("proj-" + key);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  /* Links with no destination (project links that were not provided) ----- */
  $all('a[aria-disabled="true"]').forEach(function (link) {
    link.addEventListener("click", function (event) { event.preventDefault(); });
  });
})();
