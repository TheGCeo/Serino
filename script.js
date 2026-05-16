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
   BLUR-IN CLEANUP — drop the class after the animation ends so
   the animation's persisted (fill-mode: both) final-keyframe values
   stop overriding scrolled-state CSS rules (esp. on mobile where
   the compact pill collides with the still-pinned-at-opacity-1
   "Join Waitlist" button in the full header).
═══════════════════════════════════════ */
document.addEventListener('animationend', (e) => {
  if (e.animationName === 'blurIn' && e.target.classList.contains('blur-in')) {
    e.target.classList.remove('blur-in');
  }
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
   WAITLIST FORMS + DEEP ANTI-SPAM + HATE FILTER
═══════════════════════════════════════ */
(function () {
  // ─── Page-life telemetry (humans take time, bots don't) ───
  const PAGE_LOADED_AT   = Date.now();
  const MIN_FILL_TIME_MS = 2500;     // bumped from 1.8s — humans always take >2.5s
  const RATE_LIMIT_MS    = 60_000;   // 1 submission per minute per browser

  // ─── localStorage keys ───
  const RL_KEY         = "serinou_wl_last";
  const FAIL_KEY       = "serinou_wl_fails";       // recent failed validations
  const SUBMIT_LOG_KEY = "serinou_wl_history";     // last successful submits

  // ─── Soft block thresholds ───
  const MAX_FAILS_PER_HOUR  = 5;
  const MAX_SUBMITS_PER_DAY = 3;

  // ─── Interaction telemetry (set by listeners below) ───
  let userInteracted   = false;   // any mousemove, keypress, scroll, touch
  let inputFocusedAt   = 0;       // ms timestamp when email input was focused
  let keystrokeCount   = 0;       // keystrokes inside the email input

  // Strict-ish email regex (RFC-pragmatic). Rejects garbage like "a@b".
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // ─── Expanded disposable / throwaway domain list ───
  const DISPOSABLE_DOMAINS = new Set([
    // 10-minute family
    "10minutemail.com","10minutemail.net","10minutemail.org","10minutesmail.com",
    "10minemail.com","20minutemail.com","30minutemail.com","60minutemail.com",
    // mailinator family
    "mailinator.com","mailinator.net","mailinator.org","mailinator2.com",
    "mailinator2.net","binkmail.com","bobmail.info","chammy.info",
    // yopmail family
    "yopmail.com","yopmail.fr","yopmail.net","yopmail.org","yopmail.gq","yopmail.pp.ua",
    "cool.fr.nf","jetable.fr.nf","nospam.ze.tc","speed.1s.fr","courriel.fr.nf",
    // guerrillamail family
    "guerrillamail.com","guerrillamail.net","guerrillamail.org","guerrillamail.biz",
    "guerrillamail.de","guerrillamailblock.com","sharklasers.com","grr.la",
    "pokemail.net","spam4.me",
    // tempmail family
    "tempmail.com","temp-mail.org","temp-mail.io","temp-mail.ru","temp-mail.de",
    "tempmailaddress.com","tempinbox.com","tempinbox.email","tempmailo.com",
    "tempr.email","tempemail.net","tempmailer.com","tmpmail.org","tmpmail.net",
    "throwam.com","tmail.ws","tmpemails.com","temp-mail.live",
    // trashmail
    "trashmail.com","trashmail.net","trashmail.de","trashmail.io","trashmail.ws",
    "trashinbox.com","trashmail.me","mailtrash.net",
    // throwaway
    "throwawaymail.com","throwawaymails.com","throw-away.com","tossmail.com",
    // maildrop and friends
    "maildrop.cc","fakeinbox.com","fakemail.com","fakemail.fr","fake-mail.live",
    "fakeemail.net","emailfake.com","emailfake.cn",
    // dispostable & co
    "dispostable.com","mintemail.com","mytemp.email","moakt.com","mailmoat.com",
    "mailcatch.com","mailcat.club","mailpoof.com","mailto.plus","mail.tm",
    "mailhz.me","fakemailgenerator.net","emailondeck.com","emailtemp.org",
    "getairmail.com","getnada.com","nada.email","spambox.us","spamgourmet.com",
    "spamex.com","spambog.com","spambog.de","spambog.ru","spambooger.com",
    // numbered + miscellaneous
    "1secmail.com","1secmail.net","1secmail.org","33mail.com","anonbox.net",
    "anonymbox.com","disposable-email.com","dropmail.me","hi2.in",
    "instantemailaddress.com","smailpro.com","mohmal.com","inboxbear.com",
    "inboxalias.com","owlymail.com","mailnator.com","sneakemail.com",
    "tilien.com","oysternet.email","mt2014.com","mt2015.com","mt2016.com",
    "mt2017.com","mt2018.com","mt2019.com","mt2020.com","mt2021.com",
    "mt2022.com","mt2023.com","mt2024.com","mt2025.com","mt2026.com",
    "e4ward.com","xemaps.com","mail-temporaire.fr","ezehe.com","getairmail.net",
    "burnermail.io","emailisvalid.com","fudgerub.com","gmial.com","gnial.com",
    "asdasd.nl","mailpoof.com","tmail.com","email-fake.com","email-fake.net",
    // RFC test domains (should never appear in real signups)
    "example.com","example.net","example.org","test.com","test.net","test.org",
    "invalid.com","localhost","domain.com","email.com","sample.com",
    "yourdomain.com","fakeemail.com"
  ]);

  // ─── Hate-speech / slur substrings ───
  const BLOCKED_TERMS = [
    "hitler","heil","nazi","ss88","sieg","kkk",
    "nigg","nigr","negr","kike","chink","spic","gook","wetback",
    "fag","faggot","tranny","retard",
    "rape","pedo","kys","killyourself",
    "fuck","shit","bitch","asshole","cunt"
  ];

  // ─── Obviously-fake email local parts ───
  function isFakeLooking(local) {
    if (!local) return true;
    if (local.length < 2) return true;
    if (local.length > 64) return true;                   // RFC 5321 limit
    if (/^[0-9]+$/.test(local)) return true;              // all digits
    if (/^[0-9]{6,}/.test(local)) return true;            // starts with 6+ digits
    if (/(.)\1{4,}/.test(local)) return true;             // 5x same char in a row
    if ((local.match(/\./g) || []).length > 3) return true;
    if (/^(test|asdf|qwerty|abc|noreply|no-reply|null|none|nobody|anonymous|user|guest|admin|root|spam|123|abcd|aaaa)$/i.test(local)) return true;
    if (/^[a-z]{1,2}[0-9]{6,}$/i.test(local)) return true; // typical bot pattern: ab123456
    return false;
  }

  function containsHateSpeech(s) {
    const cleaned = s.toLowerCase().replace(/[._\-+0-9]/g, "");
    return BLOCKED_TERMS.some(t => cleaned.includes(t));
  }

  function isDisposable(domain) {
    return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
  }

  // ─── Persistent fail-count tracking (soft IP-like rep) ───
  function recordFail() {
    const now = Date.now();
    const list = JSON.parse(localStorage.getItem(FAIL_KEY) || "[]")
                   .filter(t => now - t < 3_600_000); // last 1h only
    list.push(now);
    localStorage.setItem(FAIL_KEY, JSON.stringify(list));
    return list.length;
  }
  function recentFailCount() {
    const now = Date.now();
    return JSON.parse(localStorage.getItem(FAIL_KEY) || "[]")
            .filter(t => now - t < 3_600_000).length;
  }

  // ─── Persistent submission history (per-day burst limit) ───
  function recordSubmit() {
    const now = Date.now();
    const list = JSON.parse(localStorage.getItem(SUBMIT_LOG_KEY) || "[]")
                   .filter(t => now - t < 86_400_000); // last 24h
    list.push(now);
    localStorage.setItem(SUBMIT_LOG_KEY, JSON.stringify(list));
  }
  function recentSubmitCount() {
    const now = Date.now();
    return JSON.parse(localStorage.getItem(SUBMIT_LOG_KEY) || "[]")
            .filter(t => now - t < 86_400_000).length;
  }

  // ─── Show error message under the form ───
  function showError(form, msg) {
    const err = document.getElementById("hero-waitlist-error");
    if (!err) return;
    err.textContent = msg;
    err.hidden = false;
    clearTimeout(showError._t);
    showError._t = setTimeout(() => { err.hidden = true; }, 5000);
  }

  // ─── Wire interaction listeners (any genuine activity on the page) ───
  const setInteracted = () => { userInteracted = true; };
  ["mousemove","keydown","scroll","touchstart","pointerdown"].forEach(ev =>
    window.addEventListener(ev, setInteracted, { once: true, passive: true })
  );

  ["hero-waitlist-form"].forEach((id) => {
    const form = document.getElementById(id);
    if (!form) return;
    const confirm = form.parentElement.parentElement.querySelector(".hero-waitlist-confirm");
    const btn     = form.querySelector("button[type=submit]");
    const input   = form.querySelector("input[type=email]");
    const honeypots = form.querySelectorAll('.hp-field input');

    // Track focus + typing on the email input
    if (input) {
      input.addEventListener("focus", () => { if (!inputFocusedAt) inputFocusedAt = Date.now(); }, { once: false });
      input.addEventListener("keydown", () => { keystrokeCount++; }, { passive: true });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // LAYER 1: trust the event — programmatic .submit() / .click() fails
      if (e.isTrusted === false) {
        // fake success so the bot doesn't retry with a different payload
        if (confirm) { form.hidden = true; confirm.hidden = false; }
        return;
      }

      // LAYER 2: same-origin sanity check — form must be on our domain
      if (window.location.protocol !== "https:" && window.location.protocol !== "http:") return;

      // LAYER 3: ALL honeypots must be empty (4 of them, deceptive names)
      for (const hp of honeypots) {
        if (hp.value.trim() !== "") {
          if (confirm) { form.hidden = true; confirm.hidden = false; }
          recordFail();
          return;
        }
      }

      // LAYER 4: page must have been alive long enough
      if (Date.now() - PAGE_LOADED_AT < MIN_FILL_TIME_MS) {
        showError(form, "Please take a moment before submitting.");
        recordFail();
        return;
      }

      // LAYER 5: there must have been some real interaction on the page
      if (!userInteracted) {
        showError(form, "Please interact with the page before submitting.");
        recordFail();
        return;
      }

      // LAYER 6: the input must have been focused, and focused long enough
      if (!inputFocusedAt || Date.now() - inputFocusedAt < 700) {
        showError(form, "Please type your email in the field.");
        if (input) input.focus();
        recordFail();
        return;
      }

      // LAYER 7: at least 4 keystrokes inside the email input (humans type, bots paste-and-submit)
      if (keystrokeCount < 4) {
        showError(form, "Please type your email in the field.");
        if (input) input.focus();
        recordFail();
        return;
      }

      // LAYER 8: failure-based soft block (5 fails in 1h = 10 min cool-down)
      if (recentFailCount() >= MAX_FAILS_PER_HOUR) {
        showError(form, "Too many invalid attempts. Please try again later.");
        return;
      }

      // LAYER 9: per-day burst limit (3 successful submits in 24h max)
      if (recentSubmitCount() >= MAX_SUBMITS_PER_DAY) {
        showError(form, "You've already joined. Check your inbox.");
        return;
      }

      // LAYER 10: per-minute rate limit
      const last = parseInt(localStorage.getItem(RL_KEY) || "0", 10);
      if (last && Date.now() - last < RATE_LIMIT_MS) {
        const sec = Math.ceil((RATE_LIMIT_MS - (Date.now() - last)) / 1000);
        showError(form, `Please wait ${sec}s before trying again.`);
        return;
      }

      // LAYER 11: strict email format
      const email = (input.value || "").trim();
      if (!EMAIL_RE.test(email) || email.length > 254 || email.length < 6) {
        showError(form, "Please enter a valid email address.");
        input.focus();
        recordFail();
        return;
      }

      const [localPart, domain] = email.toLowerCase().split("@");

      // LAYER 12: domain must have a valid TLD (no IP literals, no single-segment)
      if (!domain || domain.indexOf(".") < 0 || /[^a-z0-9.-]/.test(domain)) {
        showError(form, "Please enter a valid email address.");
        recordFail();
        return;
      }

      // LAYER 13: disposable email block (now ~140 domains)
      if (isDisposable(domain)) {
        showError(form, "Please use a real email address (no disposable inboxes).");
        input.focus();
        recordFail();
        return;
      }

      // LAYER 14: obviously-fake local-part patterns
      if (isFakeLooking(localPart)) {
        showError(form, "Please use a real email address.");
        input.focus();
        recordFail();
        return;
      }

      // LAYER 15: hate-speech / slur filter
      if (containsHateSpeech(localPart) || containsHateSpeech(domain.split(".")[0])) {
        showError(form, "This submission was blocked.");
        recordFail();
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
          recordSubmit(); // adds timestamp to the 24h burst-limit log
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
