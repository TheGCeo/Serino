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
   ZOOM SHOWCASE — sticky pin + scroll-driven phone reveal
═══════════════════════════════════════ */
(function () {
  const section  = document.getElementById("zoom-showcase");
  const phone    = section && section.querySelector(".zoom-phone");
  const colLeft  = section && section.querySelector(".showcase-col--left");
  const colRight = section && section.querySelector(".showcase-col--right");
  if (!section || !phone) return;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp(v, a, b)  { return Math.min(Math.max(v, a), b); }

  function update() {
    const rect = section.getBoundingClientRect();
    const vh   = window.innerHeight;
    const sectionH = rect.height;

    // How far we've scrolled INTO the section (0 when section top hits viewport top)
    const scrolled = clamp(-rect.top, 0, sectionH - vh);
    const maxScroll = Math.max(1, sectionH - vh);
    const progress  = scrolled / maxScroll;   // 0 → 1 across the pinned phase

    // PHONE: slide up from translateY(85vh) → 0, scale 0.85 → 1.1
    // Animate over the first 55% of the pinned scroll, so it lands before the corners populate
    const pPhone = clamp(progress / 0.55, 0, 1);
    const ePhone = easeOutCubic(pPhone);
    const ty     = (1 - ePhone) * 85;                 // 85 → 0  (vh)
    const scale  = 0.85 + ePhone * 0.25;              // 0.85 → 1.10
    phone.style.transform = `translateY(${ty.toFixed(2)}vh) scale(${scale.toFixed(4)})`;

    // CORNER TEXT: fade + slide in between 35% and 85% progress
    const pLabel = clamp((progress - 0.35) / 0.50, 0, 1);
    const eLabel = easeOutCubic(pLabel);
    const slide  = (1 - eLabel) * 40;                  // 40 → 0  (vw)

    if (colLeft) {
      colLeft.style.opacity   = eLabel.toFixed(4);
      colLeft.style.transform = `translateX(${(-slide).toFixed(2)}vw)`;
    }
    if (colRight) {
      colRight.style.opacity   = eLabel.toFixed(4);
      colRight.style.transform = `translateX(${slide.toFixed(2)}vw)`;
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
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
   "JOIN WAITLIST" ANCHOR — scroll, focus, highlight
═══════════════════════════════════════ */
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href="#waitlist"]');
  if (!a) return;
  const target = document.getElementById("waitlist");
  if (!target) return;
  e.preventDefault();

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.classList.add("is-targeted");
  setTimeout(() => target.classList.remove("is-targeted"), 1400);

  const input = target.querySelector('input[type="email"]');
  if (input && !target.parentElement.querySelector('form[hidden]')) {
    // small delay so focus happens after the scroll lands
    setTimeout(() => { try { input.focus({ preventScroll: true }); } catch { input.focus(); } }, 450);
  }
});

/* ═══════════════════════════════════════
   WAITLIST FORMS + ANTI-SPAM + HATE FILTER
═══════════════════════════════════════ */
(function () {
  // Track when the page loaded; instant submissions are bots
  const PAGE_LOADED_AT = Date.now();
  const MIN_FILL_TIME_MS = 1800;   // humans take >1.8s to fill an email
  const RATE_LIMIT_MS    = 60_000; // 1 submission per minute
  const RL_KEY           = "serinou_wl_last";

  // Strict-ish email regex (RFC-pragmatic). Rejects garbage like "a@b".
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Disposable / throwaway domains commonly used for spam
  const DISPOSABLE_DOMAINS = [
    "mailinator.com","yopmail.com","guerrillamail.com","sharklasers.com",
    "10minutemail.com","tempmail.com","trashmail.com","getnada.com",
    "dispostable.com","fakeinbox.com","throwawaymail.com","maildrop.cc",
    "tempinbox.com","mintemail.com","mytemp.email","temp-mail.org",
    "moakt.com","emailondeck.com","emailtemp.org","spam4.me",
    "tmpmail.net","tmpmail.org","getairmail.com","mailcatch.com"
  ];

  // Hate-speech / slur substrings to block in the email local part.
  // Substring match — keep this list short and conservative.
  const BLOCKED_TERMS = [
    "hitler","heil","nazi","ss88","sieg","kkk",
    "nigg","nigr","negr","kike","chink","spic","gook","wetback",
    "fag","faggot","tranny","retard","reta rd",
    "rape","pedo","kys","killyourself"
  ];

  function containsHateSpeech(s) {
    const cleaned = s.toLowerCase().replace(/[._\-+0-9]/g, "");
    return BLOCKED_TERMS.some(t => cleaned.includes(t));
  }

  function isDisposable(domain) {
    return DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
  }

  function showError(form, msg) {
    const err = document.getElementById("hero-waitlist-error");
    if (!err) return;
    err.textContent = msg;
    err.hidden = false;
    clearTimeout(showError._t);
    showError._t = setTimeout(() => { err.hidden = true; }, 5000);
  }

  ["hero-waitlist-form"].forEach((id) => {
    const form = document.getElementById(id);
    if (!form) return;
    const confirm = form.parentElement.parentElement.querySelector(".hero-waitlist-confirm");
    const btn     = form.querySelector("button[type=submit]");
    const input   = form.querySelector("input[type=email]");
    const hp      = form.querySelector('input[name="_gotcha"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Honeypot — silently drop bots
      if (hp && hp.value.trim() !== "") {
        if (confirm) { form.hidden = true; confirm.hidden = false; } // fake success, don't tip them off
        return;
      }

      // 2. Bot timing check
      if (Date.now() - PAGE_LOADED_AT < MIN_FILL_TIME_MS) {
        showError(form, "Please take a moment before submitting.");
        return;
      }

      // 3. Rate limit per browser
      const last = parseInt(localStorage.getItem(RL_KEY) || "0", 10);
      if (last && Date.now() - last < RATE_LIMIT_MS) {
        const sec = Math.ceil((RATE_LIMIT_MS - (Date.now() - last)) / 1000);
        showError(form, `Please wait ${sec}s before trying again.`);
        return;
      }

      // 4. Email validation
      const email = (input.value || "").trim();
      if (!EMAIL_RE.test(email) || email.length > 254) {
        showError(form, "Please enter a valid email address.");
        input.focus();
        return;
      }

      const [localPart, domain] = email.toLowerCase().split("@");

      // 5. Disposable email block
      if (isDisposable(domain)) {
        showError(form, "Please use a real email address (no disposable inboxes).");
        input.focus();
        return;
      }

      // 6. Hate-speech / slur filter
      if (containsHateSpeech(localPart) || containsHateSpeech(domain.split(".")[0])) {
        showError(form, "This submission was blocked.");
        return;
      }

      if (btn) { btn.textContent = "Joining…"; btn.disabled = true; }

      try {
        const res = await fetch("https://formspree.io/f/mojrbrgo", {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form),
        });

        if (res.ok) {
          localStorage.setItem(RL_KEY, String(Date.now()));
          // bump the live counter visually if the user hasn't already
          if (!localStorage.getItem("serinou_wl_counted")) {
            localStorage.setItem("serinou_wl_counted", "1");
            bumpCounter();
          }
          // keep the form visible, just lock it down and flip the button
          if (btn) {
            btn.textContent = "Submitted ✓";
            btn.disabled = true;
            btn.classList.add("is-submitted");
          }
          if (input) {
            input.readOnly = true;
            input.classList.add("is-submitted");
          }
          if (confirm) confirm.hidden = false;
        } else {
          if (btn) { btn.textContent = "Try again"; btn.disabled = false; }
          showError(form, "Something went wrong. Please try again.");
        }
      } catch {
        if (btn) { btn.textContent = "Try again"; btn.disabled = false; }
        showError(form, "Network error. Please try again.");
      }
    });
  });

  /* ───── REAL LIVE WAITLIST COUNTER (Abacus API) ───── */
  // Uses the free Abacus counter API. Every successful waitlist signup
  // calls /hit which atomically increments a shared global value. Every
  // page load calls /get to read the current real value.
  const COUNTER_NS  = "serinou";
  const COUNTER_KEY = "waitlist";
  const COUNTER_API = "https://abacus.jasoncameron.dev";
  const CACHE_KEY   = "serinou_wl_cached_count";
  const counterEl = document.getElementById("waitlistCount");

  let displayed = 0;

  async function fetchLiveCount() {
    try {
      const res = await fetch(`${COUNTER_API}/get/${COUNTER_NS}/${COUNTER_KEY}`, { cache: "no-store" });
      if (res.status === 404) return 0; // counter not created yet → no signups yet
      if (!res.ok) throw new Error("api error");
      const data = await res.json();
      const v = typeof data.value === "number" ? data.value : 0;
      localStorage.setItem(CACHE_KEY, String(v));
      return v;
    } catch {
      // fall back to last known value so we never show garbage on flaky networks
      return parseInt(localStorage.getItem(CACHE_KEY) || "0", 10);
    }
  }

  async function bumpLiveCount() {
    try {
      const res = await fetch(`${COUNTER_API}/hit/${COUNTER_NS}/${COUNTER_KEY}`, { cache: "no-store" });
      if (!res.ok) throw new Error("api error");
      const data = await res.json();
      const v = typeof data.value === "number" ? data.value : null;
      if (v !== null) localStorage.setItem(CACHE_KEY, String(v));
      return v;
    } catch {
      return null;
    }
  }

  function animateCount(el, from, to, ms) {
    if (from === to) { el.textContent = to.toLocaleString(); return; }
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.floor(from + (to - from) * eased);
      el.textContent = v.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  async function refreshCounter(initial) {
    if (!counterEl) return;
    const target = await fetchLiveCount();
    if (initial) {
      animateCount(counterEl, Math.max(0, target - 30), target, 1500);
    } else if (target !== displayed) {
      animateCount(counterEl, displayed, target, 700);
    }
    displayed = target;
  }

  async function bumpCounter() {
    if (!counterEl) return;
    const newValue = await bumpLiveCount();
    if (newValue !== null) {
      animateCount(counterEl, displayed, newValue, 600);
      displayed = newValue;
    } else {
      // optimistic local +1 if API failed
      displayed += 1;
      counterEl.textContent = displayed.toLocaleString();
    }
  }

  if (counterEl) {
    // Show last cached value instantly while we fetch fresh data
    const cached = parseInt(localStorage.getItem(CACHE_KEY) || "0", 10);
    if (cached > 0) {
      counterEl.textContent = cached.toLocaleString();
      displayed = cached;
    }
    refreshCounter(true);
    // Re-poll every 30s so new signups from other visitors show up live
    setInterval(() => refreshCounter(false), 30_000);
    // Also refresh when the tab regains focus
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refreshCounter(false);
    });
  }
})();
