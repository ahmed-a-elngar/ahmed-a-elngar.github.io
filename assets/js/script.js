// Theme Toggle
// The inline guard in <head> already applied the saved theme before first paint,
// so read the current state off the element instead of re-deriving it here.
const toggle = document.getElementById("themeToggle");
const root = document.documentElement;
let dark = root.getAttribute("data-theme") !== "light";
toggle.textContent = dark ? "🌙" : "☀️";
toggle.addEventListener("click", () => {
  dark = !dark;
  const t = dark ? "dark" : "light";
  root.setAttribute("data-theme", t);
  toggle.textContent = dark ? "🌙" : "☀️";
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
        const fill = entry.target.querySelector(".skill-fill");
        if (fill && entry.target.dataset.level) {
          fill.style.width = entry.target.dataset.level + "%";
        }
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "20px" },
);
document
  .querySelectorAll(".reveal, .skill-chip")
  .forEach((el) => observer.observe(el));

// Project Filter with Counts
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
function updateFilterCounts() {
  const counts = { all: 0, fulltime: 0, freelance: 0, personal: 0 };
  projectCards.forEach((card) => {
    const cat = card.getAttribute("data-category");
    if (cat === "fulltime") counts.fulltime++;
    else if (cat === "freelance") counts.freelance++;
    else if (cat === "personal") counts.personal++;
    counts.all++;
  });
  const btnAll = document.querySelector('[data-filter="all"]');
  if (btnAll)
    btnAll.innerHTML = `<i data-lucide="layers" style="width: 14px; height: 14px"></i> All Projects <span class="filter-count">(${counts.all})</span>`;
  const btnFull = document.querySelector('[data-filter="fulltime"]');
  if (btnFull)
    btnFull.innerHTML = `<i data-lucide="building-2" style="width: 14px; height: 14px"></i> Full-time <span class="filter-count">(${counts.fulltime})</span>`;
  const btnFree = document.querySelector('[data-filter="freelance"]');
  if (btnFree)
    btnFree.innerHTML = `<i data-lucide="briefcase" style="width: 14px; height: 14px"></i> Freelance <span class="filter-count">(${counts.freelance})</span>`;
  const btnPers = document.querySelector('[data-filter="personal"]');
  if (btnPers)
    btnPers.innerHTML = `<i data-lucide="zap" style="width: 14px; height: 14px"></i> Personal <span class="filter-count">(${counts.personal})</span>`;

  // Re-run Lucide for dynamic content
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
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
    "a, button, .project-card, .skill-chip, .contact-item, .exp-card, .btn-primary, .filter-btn",
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

if (qrToggle && qrModal && qrClose) {
  const qrUrl = "assets/contact-qr.png";

  qrToggle.addEventListener("click", () => {
    // Load static image once
    if (!qrImage.getAttribute("src")) {
      qrImage.src = qrUrl;
    }
    qrModal.classList.add("active");
  });

  qrClose.addEventListener("click", () => {
    qrModal.classList.remove("active");
  });

  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) qrModal.classList.remove("active");
  });
}

// Design-theme picker
// The pre-paint guard in <head> already applied the stored pack; this only
// handles switching and keeping the menu in sync.
const THEME_PACKS = ["midnight", "editorial", "aurora"];
const skinToggle = document.getElementById("skinToggle");
const skinMenu = document.getElementById("skinMenu");
const skinPicker = document.getElementById("skinPicker");
const themeCss = document.getElementById("themeCss");

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
    document.documentElement.setAttribute("data-pack", pack);
    try {
      localStorage.setItem("themePack", pack);
    } catch (e) {}
    markCurrent();
    closeMenu();
    // Icons are re-created because a theme may size or restyle them.
    if (typeof lucide !== "undefined") lucide.createIcons();
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
    if (e.key === "Escape") {
      if (!skinMenu.hidden) closeMenu();
      if (qrModal && qrModal.classList.contains("active"))
        qrModal.classList.remove("active");
    }
  });

  markCurrent();
}

// Initialize Lucide Icons
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});

// Service Worker Registration for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("SW Registered"))
      .catch((err) => console.log("SW Failed", err));
  });
}
