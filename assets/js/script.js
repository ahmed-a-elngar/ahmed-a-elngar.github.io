// Theme Toggle
// The inline guard in <head> already applied the saved theme before first paint,
// so read the current state off the element instead of re-deriving it here.
const toggle = document.getElementById("themeToggle");
const root = document.documentElement;
let dark = root.getAttribute("data-theme") !== "light";
function syncToggle() {
  toggle.textContent = dark ? "🌙" : "☀️";
  toggle.setAttribute("aria-pressed", String(dark));
}
syncToggle();
toggle.addEventListener("click", () => {
  dark = !dark;
  const t = dark ? "dark" : "light";
  root.setAttribute("data-theme", t);
  syncToggle();
  try {
    localStorage.setItem("theme", t);
  } catch (e) {}
});

// The head watchdog un-hides content if this file never runs. It did, so stop it.
clearTimeout(window.__revealWatchdog);

// Reveal Observer
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "20px" },
);
document
  .querySelectorAll(".reveal")
  .forEach((el) => observer.observe(el));

// Project Filter with Counts
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
function updateFilterCounts() {
  filterBtns.forEach((btn) => {
    const filter = btn.getAttribute("data-filter");
    const n = [...projectCards].filter(
      (card) => filter === "all" || card.getAttribute("data-category") === filter,
    ).length;
    const count = document.createElement("span");
    count.className = "filter-count";
    count.textContent = ` (${n})`;
    btn.appendChild(count);
  });
}
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filterValue = btn.getAttribute("data-filter");
    projectCards.forEach((card) => {
      if (
        filterValue === "all" ||
        card.getAttribute("data-category") === filterValue
      ) {
        card.classList.remove("hide");
      } else {
        card.classList.add("hide");
      }
    });
  });
});
updateFilterCounts();

// Back to Top
const backBtn = document.getElementById("backToTop");
backBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Scroll Spy
const sections = document.querySelectorAll("section, .hero");
const navLinks = document.querySelectorAll(".nav-links a");

// One rAF-throttled scroll handler drives both the back-to-top button and the
// scroll spy, so layout is read at most once per frame instead of per event.
let scrollTicking = false;
function onScroll() {
  const y = window.scrollY;
  backBtn.classList.toggle("visible", y > 300);

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionBottom = sectionTop + section.offsetHeight;
    if (y >= sectionTop && y < sectionBottom) {
      current = section.getAttribute("id") || "hero";
    }
  });
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle(
      "active",
      href === `#${current}` || (current === "hero" && href === "#"),
    );
  });

  scrollTicking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
onScroll();

// Cursor
const cursor = document.getElementById("cursor");
if (cursor && window.innerWidth > 900) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
  const interactives = document.querySelectorAll(
    "a, button, .project-card, .contact-item, .exp-card, .btn-primary, .filter-btn",
  );
  interactives.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.width = "24px";
      cursor.style.height = "24px";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.width = "8px";
      cursor.style.height = "8px";
    });
  });
}

// QR Modal Logic
const qrToggle = document.getElementById("qrToggle");
const qrModal = document.getElementById("qrModal");
const qrClose = document.getElementById("qrClose");
const qrImage = document.getElementById("qrImage");

function closeQr() {
  if (!qrModal.classList.contains("active")) return;
  qrModal.classList.remove("active");
  qrToggle.focus();
}

if (qrToggle && qrModal && qrClose) {
  const qrUrl = "assets/contact-qr.png";

  qrToggle.addEventListener("click", () => {
    // Load static image once
    if (!qrImage.getAttribute("src")) {
      qrImage.src = qrUrl;
    }
    qrModal.classList.add("active");
    qrClose.focus();
  });

  qrClose.addEventListener("click", closeQr);

  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) closeQr();
  });

  qrModal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return closeQr();
    // Keep Tab cycling inside the dialog while it is open.
    if (e.key !== "Tab") return;
    const focusables = qrModal.querySelectorAll("a[href], button");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// Design-theme picker
// The pre-paint guard in <head> already applied the stored pack; this only
// handles switching and keeping the menu in sync.
// Pack names and their font stylesheets come from the <head> guard.
const THEME_FONTS = window.__themeFonts || {};
const THEME_PACKS = Object.keys(THEME_FONTS);
const skinToggle = document.getElementById("skinToggle");
const skinMenu = document.getElementById("skinMenu");
const skinPicker = document.getElementById("skinPicker");
const themeCss = document.getElementById("themeCss");
const themeFonts = document.getElementById("themeFonts");

if (skinToggle && skinMenu && themeCss) {
  const currentPack = () =>
    document.documentElement.getAttribute("data-pack") || "midnight";

  function markCurrent() {
    const now = currentPack();
    skinMenu.querySelectorAll(".skin-option").forEach((btn) => {
      btn.setAttribute(
        "aria-current",
        btn.dataset.skin === now ? "true" : "false",
      );
    });
  }

  function closeMenu() {
    skinMenu.hidden = true;
    skinToggle.setAttribute("aria-expanded", "false");
  }

  function applyPack(pack) {
    if (!THEME_PACKS.includes(pack) || pack === currentPack()) return closeMenu();
    themeCss.href = "assets/themes/" + pack + "/theme.css";
    if (themeFonts) themeFonts.href = THEME_FONTS[pack];
    document.documentElement.setAttribute("data-pack", pack);
    try {
      localStorage.setItem("themePack", pack);
    } catch (e) {}
    markCurrent();
    closeMenu();
  }

  skinToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = skinMenu.hidden;
    skinMenu.hidden = !open;
    skinToggle.setAttribute("aria-expanded", String(open));
    if (open) markCurrent();
  });

  skinMenu.addEventListener("click", (e) => {
    const btn = e.target.closest(".skin-option");
    if (btn) applyPack(btn.dataset.skin);
  });

  document.addEventListener("click", (e) => {
    if (!skinMenu.hidden && !skinPicker.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !skinMenu.hidden) closeMenu();
  });

  markCurrent();
}

// Analytics consent
// gtag.js is only injected after an explicit "Allow"; until then (and after a
// "Decline") no Google script is requested and no cookies are set.
const GA_ID = "G-PBTSXBCGWF";
const consentBanner = document.getElementById("consentBanner");

function readConsent() {
  try {
    return localStorage.getItem("analyticsConsent");
  } catch (e) {
    return null;
  }
}

function loadAnalytics() {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    dataLayer.push(arguments);
  };
  gtag("js", new Date());
  gtag("config", GA_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
}

function setConsent(value) {
  try {
    localStorage.setItem("analyticsConsent", value);
  } catch (e) {}
  consentBanner.hidden = true;
  if (value === "granted") {
    loadAnalytics();
  } else if (window.gtag) {
    // Withdrawn after GA already loaded this visit: drop its cookies now; the
    // script itself will not be loaded again on the next visit.
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (name.startsWith("_ga")) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}`;
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    });
  }
}

if (consentBanner) {
  const consent = readConsent();
  if (consent === "granted") loadAnalytics();
  else if (consent !== "denied") consentBanner.hidden = false;

  document
    .getElementById("consentAccept")
    .addEventListener("click", () => setConsent("granted"));
  document
    .getElementById("consentDecline")
    .addEventListener("click", () => setConsent("denied"));
  const settings = document.getElementById("consentSettings");
  if (settings)
    settings.addEventListener("click", () => {
      consentBanner.hidden = false;
      document.getElementById("consentAccept").focus();
    });
}

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Service Worker Registration for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("SW Registered"))
      .catch((err) => console.log("SW Failed", err));
  });
}
