/* ═══════════════════════════════════════
   STICKY HEADER — compact on scroll
═══════════════════════════════════════ */
(function () {
  const header = document.getElementById("site-header");
  if (!header) return;
  const THRESHOLD = 80;
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > THRESHOLD);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ═══════════════════════════════════════
   ZOOM SHOWCASE — scroll-driven scale
═══════════════════════════════════════ */
(function () {
  const section  = document.getElementById("zoom-showcase");
  const phone    = section && section.querySelector(".zoom-phone");
  const colLeft  = section && section.querySelector(".showcase-col--left");
  const colRight = section && section.querySelector(".showcase-col--right");
  if (!section || !phone) return;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function update() {
    const rect = section.getBoundingClientRect();
    const vh   = window.innerHeight;
    // progress: 0 when section top enters viewport, 1 when section has scrolled 70% through
    const raw  = 1 - (rect.top / (vh * 0.7));
    const p    = Math.min(Math.max(raw, 0), 1);
    const e    = easeOutCubic(p);

    // phone: 0.32 → 1.0
    phone.style.transform = `scale(${(0.32 + 0.68 * e).toFixed(4)})`;

    // text: ghost → full white, slide in
    if (colLeft) {
      const s = (0.55 + 0.45 * e).toFixed(4);
      const x = ((1 - e) * 60).toFixed(2);
      colLeft.style.transform = `scale(${s}) translateX(-${x}px)`;
      colLeft.style.opacity   = (0.08 + 0.92 * e).toFixed(4);
    }
    if (colRight) {
      const s = (0.55 + 0.45 * e).toFixed(4);
      const x = ((1 - e) * 60).toFixed(2);
      colRight.style.transform = `scale(${s}) translateX(${x}px)`;
      colRight.style.opacity   = (0.08 + 0.92 * e).toFixed(4);
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();

/* ═══════════════════════════════════════
   SCROLL REVEAL — text elements
═══════════════════════════════════════ */
if ("IntersectionObserver" in window) {
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObs.observe(el));
}

/* ═══════════════════════════════════════
   STAGGER CARD ANIMATIONS
═══════════════════════════════════════ */
(function () {
  const STAGGER_DELAY = 85; // ms between each card

  const targets = document.querySelectorAll(
    ".cards-grid, .feat-row-2, .feat-row-4, .feat-row-full, " +
    ".stats-inner, .proof-bar, .personal-list, .personal-card"
  );

  targets.forEach((grid) => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;

          const items = Array.from(e.target.children).filter(
            (c) =>
              !c.classList.contains("stat-divider") &&
              !c.classList.contains("proof-divider")
          );

          items.forEach((item, i) => {
            item.style.setProperty("--sd", `${i * STAGGER_DELAY}ms`);
            // Double rAF ensures CSS initial state is painted before class is added
            requestAnimationFrame(() =>
              requestAnimationFrame(() => item.classList.add("card-pop"))
            );
          });

          obs.disconnect();
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -24px 0px" }
    );
    obs.observe(grid);
  });
})();

/* ═══════════════════════════════════════
   PHONE SCREEN CARD CYCLING
═══════════════════════════════════════ */
(function () {
  const deck = [
    { tag: "Biology",      q: "What organelle produces ATP?"              },
    { tag: "History",      q: "In what year did World War II end?"        },
    { tag: "Neuroscience", q: "What brain region controls memory?"        },
    { tag: "Psychology",   q: "Define cognitive dissonance."              },
    { tag: "Chemistry",    q: "What is the atomic number of Carbon?"      },
    { tag: "Philosophy",   q: "Who wrote 'Critique of Pure Reason'?"      },
  ];

  function startCycle(tagEl, qEl, actionEl, resetAction) {
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % deck.length;

      // fade out
      [tagEl, qEl, actionEl].forEach((el) => (el.style.opacity = "0"));

      setTimeout(() => {
        tagEl.textContent   = deck[idx].tag;
        qEl.textContent     = deck[idx].q;
        resetAction();
        // fade in
        [tagEl, qEl, actionEl].forEach((el) => (el.style.opacity = "1"));
      }, 320);
    }, 3600);
  }

  // ── Hero phone ──
  const lsCard = document.querySelector(".hero-phone-bottom .ls-card");
  if (lsCard) {
    const tagEl    = lsCard.querySelector(".ls-card-tag");
    const qEl      = lsCard.querySelector(".ls-card-q");
    const actionEl = lsCard.querySelector(".ls-reveal-btn");
    if (tagEl && qEl && actionEl) {
      startCycle(tagEl, qEl, actionEl, () => {
        actionEl.textContent = "Reveal Answer";
        actionEl.style.background = "";
        actionEl.style.color = "";
      });
    }
  }

  // ── Feature phone ──
  const fvCard = document.querySelector(".fv-ls-card");
  if (fvCard) {
    const tagEl    = fvCard.querySelector(".fv-tag-pill");
    const qEl      = fvCard.querySelector("p");
    const actionEl = fvCard.querySelector(".fv-reveal");
    if (tagEl && qEl && actionEl) {
      startCycle(tagEl, qEl, actionEl, () => {
        actionEl.textContent = "Tap to reveal";
        actionEl.style.background = "";
        actionEl.style.color = "";
      });
    }
  }
})();

/* ═══════════════════════════════════════
   REVIEWS CAROUSEL
═══════════════════════════════════════ */
(function () {
  const track = document.getElementById("reviews-track");
  const dots  = Array.from(document.querySelectorAll(".rev-dot"));
  const prev  = document.getElementById("rev-prev");
  const next  = document.getElementById("rev-next");
  if (!track) return;

  const count = track.querySelectorAll(".review-card").length;
  let current = 0;
  let timer   = null;

  function goTo(index) {
    current = (index + count) % count;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle("is-active", i === current);
      d.setAttribute("aria-selected", i === current ? "true" : "false");
    });
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAuto() { clearInterval(timer); }

  prev.addEventListener("click", () => { goTo(current - 1); startAuto(); });
  next.addEventListener("click", () => { goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener("click", () => { goTo(i); startAuto(); }));

  const wrap = track.closest(".reviews-track-wrap");
  wrap.addEventListener("mouseenter", stopAuto);
  wrap.addEventListener("mouseleave", startAuto);

  let tx = 0;
  wrap.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); startAuto(); }
  });

  goTo(0);
  startAuto();
})();

/* ═══════════════════════════════════════
   BREATHING LABEL CYCLE
═══════════════════════════════════════ */
(function () {
  const label = document.getElementById("breath-label");
  if (!label) return;
  const phases = [
    { text: "INHALE", ms: 4000 },
    { text: "HOLD",   ms: 2000 },
    { text: "EXHALE", ms: 4000 },
    { text: "HOLD",   ms: 2000 },
  ];
  let i = 0;
  const next = () => {
    label.textContent = phases[i].text;
    setTimeout(() => { i = (i + 1) % phases.length; next(); }, phases[i].ms);
  };
  next();
})();

/* ═══════════════════════════════════════
   LOCK SCREEN DEMO — reveal on click
═══════════════════════════════════════ */
document.querySelectorAll(".ls-reveal-btn, .fv-reveal").forEach((btn) => {
  btn.addEventListener("click", () => {
    const answers = {
      "Reveal Answer": "Long-term potentiation (LTP)",
      "Tap to reveal": "Mitochondria",
    };
    const answer = answers[btn.textContent] || "✓";
    btn.textContent      = answer;
    btn.style.background = "rgba(80,220,130,0.28)";
    btn.style.color      = "#3dd68c";
  });
});

/* ═══════════════════════════════════════
   FAQ ACCORDION
═══════════════════════════════════════ */
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-a");
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    // Close all others
    document.querySelectorAll(".faq-item").forEach((other) => {
      if (other !== item) {
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-a").style.maxHeight = "0";
      }
    });

    if (isOpen) {
      btn.setAttribute("aria-expanded", "false");
      answer.style.maxHeight = "0";
    } else {
      btn.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

/* ═══════════════════════════════════════
   WAITLIST FORMS
═══════════════════════════════════════ */
["hero-waitlist-form", "main-waitlist-form"].forEach((id) => {
  const form = document.getElementById(id);
  if (!form) return;
  const confirm = form.nextElementSibling;
  const btn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type=email]");
    if (!input.value || !input.checkValidity()) { input.focus(); return; }

    if (btn) { btn.textContent = "Joining…"; btn.disabled = true; }

    try {
      const res = await fetch("https://formspree.io/f/mojrbrgo", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form),
      });

      if (res.ok) {
        form.hidden = true;
        if (confirm) confirm.hidden = false;
      } else {
        if (btn) { btn.textContent = "Try again"; btn.disabled = false; }
      }
    } catch {
      if (btn) { btn.textContent = "Try again"; btn.disabled = false; }
    }
  });
});

