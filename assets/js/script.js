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
