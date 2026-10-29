(() => {
  "use strict";

  const H = window.HYPE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmt = (iso, opts) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(new Date(iso));
  const dayNum = iso => fmt(iso, { day: "2-digit" });
  const mon = iso => fmt(iso, { month: "short" });
  const wd = iso => fmt(iso, { weekday: "short" });
  const shortDate = iso => `${wd(iso)} ${Number(dayNum(iso))} ${mon(iso)}`;

  const now = Date.now();
  const byId = Object.fromEntries(H.events.map(e => [e.id, e]));
  const upcoming = H.events.filter(e => new Date(e.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start));
  const past = H.events.filter(e => new Date(e.start) <= now).sort((a, b) => new Date(b.start) - new Date(a.start));
  const next = upcoming[0];

  /* ------------------------------------------------------------------ hero */
  const heroSet = (key, fn) => $$(`[data-hero="${key}"]`).forEach(fn);
  if (next) {
    heroSet("title", el => (el.textContent = next.title));
    heroSet("pitch", el => (el.textContent = next.pitch));
    heroSet("poster", el => { el.src = next.poster; el.alt = `Poster for ${next.title}`; });
    heroSet("day", el => (el.textContent = fmt(next.start, { weekday: "long" })));
    heroSet("date", el => (el.textContent = `${dayNum(next.start)} ${mon(next.start)}`));
    heroSet("doors", el => (el.textContent = next.doors));
    heroSet("venue", el => (el.textContent = next.venue));
    heroSet("stat", el => (el.textContent = `${dayNum(next.start)}.${fmt(next.start, { month: "2-digit" })}`));
    heroSet("cta", el => (el.dataset.inquire = next.id));
    $(".hero__cover").dataset.inquire = next.id;
    $("[data-sidetab-text]").textContent = `Guestlist open, ${Number(dayNum(next.start))} ${mon(next.start)}`;
  } else {
    // Nothing announced: keep the hero alive with the latest poster.
    const last = past[0];
    heroSet("title", el => (el.textContent = "Next drop soon"));
    heroSet("pitch", el => (el.textContent = "New nights land on Instagram first. Message us and we'll put you on the list the moment one goes live."));
    heroSet("poster", el => { el.src = last.poster; el.alt = `Poster for ${last.title}`; });
    heroSet("day", el => (el.textContent = "Coming"));
    heroSet("date", el => (el.textContent = "Soon"));
    heroSet("doors", el => (el.textContent = "4PM onwards, always"));
    heroSet("venue", el => (el.textContent = "Kolkata"));
    heroSet("cta", el => (el.textContent = "Notify me on WhatsApp"));
    $(".hero__tag").textContent = "Last night out";
    $("[data-countdown]").hidden = true;
    $("[data-sidetab]").hidden = true;
  }

  /* -------------------------------------------------------------- calendar */
  const facts = e => `
    <dl class="cal__facts">
      <div><dt>Doors</dt><dd>${esc(e.doors)}</dd></div>
      <div><dt>Venue</dt><dd>${esc(e.venue)}</dd></div>
      <div><dt>Lineup</dt><dd>${esc(e.lineup)}</dd></div>
      <div><dt>With</dt><dd>${esc(e.partners.join(", "))}</dd></div>
    </dl>`;

  $("[data-calendar]").innerHTML = upcoming.map((e, i) => `
    <li class="cal__row${i === 0 ? " cal__row--lead" : ""}">
      <div class="cal__date"><span class="cal__dnum">${dayNum(e.start)}</span><span class="cal__mon">${mon(e.start)}</span><span class="cal__wd">${wd(e.start)}</span></div>
      <img class="cal__thumb" src="${e.poster}" alt="Poster for ${esc(e.title)}" loading="lazy">
      <div class="cal__main">
        <h3 class="cal__title">${esc(e.title)}</h3>
        ${i === 0 ? `<p class="cal__pitch">${esc(e.pitch)}</p>` : ""}
        ${facts(e)}
      </div>
      <div class="cal__side">
        ${e.status ? `<span class="status">${esc(e.status)}</span>` : ""}
        <button class="btn btn--ink" type="button" data-inquire="${e.id}" data-cursor="WhatsApp">Inquire on WhatsApp</button>
      </div>
    </li>`).join("") + `
    <li class="cal__row cal__row--next">
      <div class="cal__date"><span class="cal__dnum">00</span><span class="cal__mon">Soon</span></div>
      <div class="cal__main">
        <h3 class="cal__title">The next drop</h3>
        <p>New nights land on Instagram first. Ask us to message you the day one goes live.</p>
      </div>
      <div class="cal__side">
        <button class="btn btn--paper btn--line" type="button" data-inquire="later">Notify me on WhatsApp</button>
        <a class="link" href="${H.instagram}" target="_blank" rel="noopener">Follow ${esc(H.handle)}</a>
      </div>
    </li>`;

  /* ------------------------------------------------------- past wall/index */
  $("[data-wall]").innerHTML = H.posters.map(p => {
    const e = byId[p.event];
    return `
      <button class="poster" type="button" data-poster="${p.event}" data-src="${p.src}" data-cursor="View" aria-label="${esc(e.title)}, ${esc(p.name)}">
        <img src="${p.src}" alt="" loading="lazy">
        <span class="poster__plate"><b>${esc(p.name)}</b><span>${shortDate(e.start)}, ${esc(e.venue.split(",")[0])}</span></span>
      </button>`;
  }).join("");

  $("[data-index]").innerHTML = past.map(e => `
    <li class="index__row">
      <button class="index__btn" type="button" data-poster="${e.id}" data-src="${e.poster}">
        <span class="index__when">${shortDate(e.start)}</span>
        <span class="index__name">${esc(e.title)}</span>
        <span class="index__venue">${esc(e.venue)}</span>
        <span class="index__acts">${esc(e.lineup)}</span>
        <span class="index__go">View night</span>
      </button>
    </li>`).join("");

  /* --------------------------------------------------------------- moments */
  $("[data-moments]").innerHTML = H.moments.map(m => `
    <figure class="frame">
      <div class="frame__media">
        <img class="frame__red" src="${m.src}" alt="" loading="lazy">
        <img class="frame__raw" src="${m.src}" alt="${esc(m.caption)}" loading="lazy">
      </div>
      <figcaption><b>${esc(m.caption)}</b><span>${esc(m.meta)}</span></figcaption>
    </figure>`).join("");

  /* ---------------------------------------------------------------- venues */
  const spots = [
    { x: "19%", y: "4%", r: "-6deg" },
    { x: "44%", y: "18%", r: "5deg" },
    { x: "66%", y: "6%", r: "-4deg" },
    { x: "24%", y: "50%", r: "7deg" },
    { x: "58%", y: "50%", r: "-7deg" }
  ];
  $("[data-stickers]").insertAdjacentHTML("afterbegin", H.venues.map((v, i) => `
    <a class="sticker sticker--venue" href="${H.instagram}" target="_blank" rel="noopener" data-cursor="Open"
       style="--x:${spots[i].x};--y:${spots[i].y};--r:${spots[i].r}">
      <img src="${v.src}" alt="" loading="lazy"><span>${esc(v.name)}</span>
    </a>`).join(""));

  let resizeTimer;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { window.ScrollTrigger?.sort(); window.ScrollTrigger?.refresh(); }, 150); });

  const statement = $("[data-fill]");
  statement.innerHTML = statement.textContent.trim().split(/\s+/).map(w => `<span class="w">${esc(w)}</span>`).join(" ");

  /* --------------------------------------------------------------- links */
  const tel = p => `tel:${p.replace(/\s/g, "")}`;
  $$("[data-phone-0]").forEach(a => { a.href = tel(H.phones[0]); a.textContent = H.phones[0]; });
  $$("[data-phone-1]").forEach(a => { a.href = tel(H.phones[1]); a.textContent = H.phones[1]; });
  $$("[data-ig]").forEach(a => (a.href = H.instagram));

  /* ------------------------------------------------------------ countdown */
  if (next) {
    const target = new Date(next.start).getTime();
    const out = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
    const pad = n => String(n).padStart(2, "0");
    const tick = () => {
      let t = Math.max(0, Math.floor((target - Date.now()) / 1000));
      out.d.textContent = pad(Math.floor(t / 86400)); t %= 86400;
      out.h.textContent = pad(Math.floor(t / 3600)); t %= 3600;
      out.m.textContent = pad(Math.floor(t / 60));
      out.s.textContent = pad(t % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* -------------------------------------------------------------- dialogs */
  let lenis = null;
  const openDialog = d => { d.showModal(); lenis?.stop(); };
  const closeDialog = d => { d.close(); };
  $$("dialog").forEach(d => {
    d.addEventListener("close", () => lenis?.start());
    d.addEventListener("click", e => { if (e.target === d) closeDialog(d); });
    $$("[data-close]", d).forEach(b => b.addEventListener("click", () => closeDialog(d)));
  });

  /* inquiry sheet -> WhatsApp */
  const sheet = $("#inquiry");
  const form = $("[data-inquiry-form]");
  const select = $("[data-event-select]");
  const sizeOut = $("[data-size]");
  const preview = $("[data-preview]");
  const error = $("[data-error]");
  let size = 2;

  select.innerHTML = upcoming.map(e => `<option value="${e.id}">${esc(e.title)}, ${shortDate(e.start)}</option>`).join("")
    + `<option value="later">Whichever night is next</option>`;

  const message = () => {
    const kind = form.kind.value;
    const name = form.name.value.trim();
    const note = form.note.value.trim();
    const e = byId[select.value];
    const night = e ? `${e.title} (${shortDate(e.start)})` : "your next night";
    const lines = kind === "Collab or PR"
      ? [`Hi HypeNight! I'd like to talk about a collab or PR${e ? ` around ${night}` : ""}.`]
      : [`Hi HypeNight! I'd like ${kind === "Table" ? "a table" : "guestlist"} for ${night}.`, `Group: ${size} ${size === 1 ? "person" : "people"}`];
    if (name) lines.push(`Name: ${name}`);
    if (note) lines.push(`Note: ${note}`);
    return lines.join("\n");
  };
  const refresh = () => { preview.textContent = message(); sizeOut.textContent = size; };

  form.addEventListener("input", () => { error.hidden = true; refresh(); });
  $$("[data-step]", form).forEach(b => b.addEventListener("click", () => {
    size = Math.min(30, Math.max(1, size + Number(b.dataset.step)));
    refresh();
  }));
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!form.name.value.trim()) { error.hidden = false; form.name.focus(); return; }
    window.open(`https://wa.me/${H.whatsapp}?text=${encodeURIComponent(message())}`, "_blank", "noopener");
    closeDialog(sheet);
  });

  /* let's talk: brands, venues and artists, straight to WhatsApp */
  const talk = $("[data-talk]");
  talk.addEventListener("submit", e => {
    e.preventDefault();
    const name = talk.name.value.trim(), contact = talk.contact.value.trim(), msg = talk.msg.value.trim();
    const err = $("[data-talk-error]", talk);
    if (!name || !contact || !msg) { err.hidden = false; return; }
    err.hidden = true;
    const text = `Hi HypeNight! I'd like to talk about a collab or PR.\nName: ${name}\nContact: ${contact}\nIdea: ${msg}`;
    window.open(`https://wa.me/${H.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
  talk.addEventListener("input", () => ($("[data-talk-error]", talk).hidden = true));

  const openInquiry = (eventId, kind) => {
    const fallback = next ? next.id : "later";
    select.value = eventId && select.querySelector(`option[value="${eventId}"]`) ? eventId : fallback;
    const radio = form.querySelector(`input[name="kind"][value="${kind || "Guestlist"}"]`);
    if (radio) radio.checked = true;
    error.hidden = true;
    refresh();
    openDialog(sheet);
  };

  /* poster lightbox */
  const lb = $("#lightbox");
  const lbSet = (k, fn) => fn($(`[data-lb="${k}"]`, lb));
  const openPoster = (id, src) => {
    const e = byId[id];
    lbSet("img", el => { el.src = src || e.poster; el.alt = `Poster for ${e.title}`; });
    lbSet("date", el => (el.textContent = `${fmt(e.start, { weekday: "long", day: "numeric", month: "long" })}, ${e.doors}`));
    lbSet("title", el => (el.textContent = e.title));
    lbSet("venue", el => (el.textContent = e.venue));
    lbSet("lineup", el => (el.textContent = e.lineup));
    lbSet("partners", el => (el.textContent = e.partners.join(", ")));
    lbSet("pitch", el => (el.textContent = e.pitch));
    lbSet("ig", el => (el.href = e.instagram));
    lbSet("next", el => (el.dataset.inquire = next ? next.id : "later"));
    openDialog(lb);
  };

  document.addEventListener("click", e => {
    const inq = e.target.closest("[data-inquire]");
    if (inq) {
      e.preventDefault();
      if (lb.open) lb.close();
      openInquiry(inq.dataset.inquire, inq.dataset.kind);
      return;
    }
    const p = e.target.closest("[data-poster]");
    if (p) openPoster(p.dataset.poster, p.dataset.src);
  });

  /* --------------------------------------------------------- theme toggle */
  const themeBtn = $("[data-theme-toggle]");
  const themeMeta = $('meta[name="theme-color"]');
  const applyTheme = t => {
    document.documentElement.dataset.theme = t;
    themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    themeMeta.content = t === "dark" ? "#120607" : "#F3ECE6";
  };
  applyTheme(document.documentElement.dataset.theme || "light");
  themeBtn.addEventListener("click", () => {
    const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(t);
    try { localStorage.setItem("hn-theme", t); } catch (_) {}
  });

  /* ------------------------------------------------------------ nav/menu */
  const nav = $("#nav");
  const menu = $("#menu");
  const menuBtn = $(".nav__menu");
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (y !== lastY) nav.classList.toggle("is-hidden", y > lastY && y > nav.offsetHeight * 2);
    lastY = y;
  }, { passive: true });
  nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));
  const setMenu = open => {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    open ? lenis?.stop() : lenis?.start();
    if (open) $(".menu__close").focus();
  };
  menuBtn.addEventListener("click", () => setMenu(true));
  $(".menu__close").addEventListener("click", () => { setMenu(false); menuBtn.focus(); });
  menu.addEventListener("click", e => { if (e.target.closest("a, [data-inquire]")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* mobile bar steps aside during the walk-through and the passes, which have their own buttons */
  const mbar = $(".mbar");
  const seen = new Set();
  const mbarWatch = new IntersectionObserver(entries => {
    entries.forEach(en => en.isIntersecting ? seen.add(en.target) : seen.delete(en.target));
    mbar.classList.toggle("is-hidden", seen.size > 0);
  });
  ["#inside", "#getin"].forEach(s => mbarWatch.observe($(s)));

  /* --------------------------------------------------------------- cursor */
  const cursor = $(".cursor");
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && window.gsap) {
    const label = $(".cursor__label");
    const toX = gsap.quickTo(cursor, "x", { duration: .45, ease: "power3" });
    const toY = gsap.quickTo(cursor, "y", { duration: .45, ease: "power3" });
    addEventListener("pointermove", e => { toX(e.clientX); toY(e.clientY); cursor.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("pointerover", e => {
      const t = e.target.closest("[data-cursor]");
      cursor.classList.toggle("is-label", !!t);
      if (t) label.textContent = t.dataset.cursor;
    });
  }

  /* ---------------------------------------------------------------- motion */
  const loader = $("#loader");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hideLoader = () => { loader.remove(); document.documentElement.classList.add("is-ready"); };

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    document.documentElement.classList.add("no-fill");
    hideLoader();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  // Phones: the address bar showing and hiding must not re-measure every pin mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
  lenis = new Lenis({ lerp: .085, anchors: { offset: -nav.offsetHeight } });
  lenis.scrollTo(0, { immediate: true, force: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* the one orchestrated moment: doors at four, then the hero rises */
  gsap.set(".hero__logo", { autoAlpha: 0, y: 40, scale: .94 });
  gsap.set([".hero__pitch", ".hero__date"], { autoAlpha: 0, y: 26 });
  gsap.set(".hero__cover", { autoAlpha: 0, y: 70, rotation: -5 });

  const intro = gsap.timeline({ paused: true })
    .to(".hero__logo", { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out" }, .05)
    .to(".hero__cover", { autoAlpha: 1, y: 0, rotation: 0, duration: 1.2, ease: "expo.out" }, .15)
    .to([".hero__pitch", ".hero__date"], { autoAlpha: 1, y: 0, duration: .9, ease: "expo.out", stagger: .1 }, .35);

  let firstVisit = true;
  try { firstVisit = !sessionStorage.getItem("hn-doors"); sessionStorage.setItem("hn-doors", "1"); } catch (_) {}

  if (firstVisit) {
    lenis.stop();
    const hEl = $("[data-loader-h]");
    const mEl = $("[data-loader-m]");
    const clock = { m: 56 };
    gsap.timeline({ onComplete: () => { hideLoader(); lenis.start(); } })
      .to(clock, {
        m: 60, duration: 1, ease: "power1.in", snap: { m: 1 },
        onUpdate: () => {
          const m = Math.round(clock.m);
          hEl.textContent = m >= 60 ? "16" : "15";
          mEl.textContent = m >= 60 ? "00" : String(m);
        }
      })
      .to(loader, { yPercent: -100, duration: .9, ease: "expo.inOut" }, "+=.35")
      .add(() => intro.play(), "-=.45");
  } else {
    hideLoader();
    intro.play();
  }

  /* inside miss ginko: three.js (js/inside3d.js) renders the doors and the film; this drives the HUD */
  document.documentElement.classList.add("motion");
  const glOk = (() => {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (_) { return false; }
  })();
  if (glOk) document.documentElement.classList.add("inside-gl");
  const CHAPTERS = [0, .40, .62, .84, 1];
  // The on-screen clock runs from doors at 16:00 to close to midnight.
  const CLOCK = [[0, 960], [.12, 975], [.40, 1065], [.62, 1170], [.84, 1320], [1, 1430]];

  const stage = $("[data-inside]");
  const caps = $$("[data-cap]");
  const rails = $$("[data-rail]");
  const clockEl = $("[data-inside-clock]");
  const hint = $(".inside__hint");
  const insideLogo = $(".inside__logo");

  const inside = window.HN_INSIDE = {
    render: null, // set by inside3d.js
    setBars: bar => {
      stage.style.setProperty("--bar-top", Math.max(bar, 76) + "px");
      stage.style.setProperty("--bar-bot", Math.max(bar, 64) + "px");
    },
    fail: () => {
      document.documentElement.classList.remove("inside-gl");
      ScrollTrigger.getById("inside")?.kill(true);
      ScrollTrigger.refresh();
    }
  };

  const clockAt = p => {
    for (let i = 1; i < CLOCK.length; i++) {
      const [p0, m0] = CLOCK[i - 1], [p1, m1] = CLOCK[i];
      if (p <= p1) return m0 + (m1 - m0) * (p - p0) / (p1 - p0);
    }
    return CLOCK[CLOCK.length - 1][1];
  };
  const renderInside = p => {
    inside.p = p;
    inside.render?.(p);
    hint.classList.toggle("is-gone", p > .015);
    // The logo sits on the closed doors and fades as the seam opens.
    const logoFade = gsap.utils.clamp(0, 1, (p - .02) / .03);
    insideLogo.style.opacity = 1 - logoFade;
    insideLogo.style.transform = `translate(-50%, -50%) scale(${1 + logoFade * .25})`;
    stage.classList.toggle("is-doors", p < .1);
    const chapter = Math.min(CHAPTERS.length - 2, CHAPTERS.filter(b => p >= b).length - 1);
    caps.forEach((c, i) => c.classList.toggle("is-on", i === chapter && p > .1));
    rails.forEach((r, i) => {
      r.style.setProperty("--fill", gsap.utils.clamp(0, 1, (p - CHAPTERS[i]) / (CHAPTERS[i + 1] - CHAPTERS[i])));
      r.classList.toggle("is-on", i === chapter);
    });
    const m = Math.floor(clockAt(p));
    clockEl.textContent = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  };

  const mm = gsap.matchMedia();
  mm.add({ desktop: "(min-width: 861px)", mobile: "(max-width: 860px)" }, ctx => {
    const { desktop } = ctx.conditions;

    /* hero: the poster drifts up as you leave */
    if (desktop) {
      gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
        .to(".hero__cover", { yPercent: -14, ease: "none" }, 0)
        .to(".hero__date", { yPercent: -60, ease: "none" }, 0);
    }

    /* statement fills word by word */
    const words = $$(".statement .w");
    ScrollTrigger.create({
      trigger: ".statement", start: "top 78%", end: "bottom 45%", scrub: true,
      onUpdate: self => {
        const n = Math.round(self.progress * words.length);
        words.forEach((w, i) => w.classList.toggle("is-on", i < n));
      }
    });

    pinInside();
    if (desktop) { pinPast(); pinMoments(); }

    /* how a drunch runs: photos drift inside their frames, the headline slides in line by line */
    $$(".steps__img img").forEach(img => gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    }));
    gsap.from(".steps__title span", {
      xPercent: -8, autoAlpha: 0, stagger: .12, ease: "none",
      scrollTrigger: { trigger: ".steps__title", start: "top 90%", end: "top 55%", scrub: true }
    });

    if (desktop) pinVenues();

    /* about: the crowd photo drifts behind the type */
    gsap.fromTo(".about__bg", { yPercent: -5, scale: 1.12 }, {
      yPercent: 5, scale: 1.04, ease: "none",
      scrollTrigger: { trigger: ".about__hero", start: "top bottom", end: "bottom top", scrub: true }
    });

    /* about: partner names slide with the scroll */
    const partners = $("[data-partners]");
    gsap.fromTo(partners, { x: 0 }, {
      x: () => -Math.max(0, partners.scrollWidth - innerWidth), ease: "none",
      scrollTrigger: { trigger: ".partners", start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true }
    });


    // Pinned scenes, called above in page order so later triggers account for their spacing.
    function pinInside() {
    if (!glOk) return;
    /* walk in: the 3D doors open, the film scrubs, the party cards slide in */
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "inside", trigger: stage, start: "top top", end: () => "+=" + Math.round(innerHeight * (desktop ? 6 : 5)),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => renderInside(self.progress),
        onRefresh: self => renderInside(self.progress)
      }
    });
    }

    function pinPast() {
    /* past nights: posters dealt off a pile onto the wall */
    const stage = $(".past__stage");
    const wall = $("[data-wall]");
    const posters = $$(".poster", wall);
    const turns = [-11, 7, -4, 9, -7, 4];
    const pileX = p => wall.clientWidth / 2 - (p.offsetLeft + p.offsetWidth / 2);
    const pileY = p => wall.clientHeight / 2 - (p.offsetTop + p.offsetHeight / 2);
    const deal = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top top", end: () => "+=" + Math.round(innerHeight * 1.6), pin: true, scrub: true, invalidateOnRefresh: true } });
    posters.slice().reverse().forEach((p, order) => {
      const i = posters.indexOf(p);
      deal.fromTo(p, { x: () => pileX(p), y: () => pileY(p), rotation: turns[i], scale: .7 },
        { x: 0, y: 0, rotation: 0, scale: 1, duration: 1, ease: "power2.inOut" }, order * .42);
    });
    deal.to({}, { duration: .4 });
    }

    function pinMoments() {
    /* moments: frames slide under the line and turn red */
    const mStage = $(".moments__stage");
    const track = $("[data-moments]");
    const frames = $$(".frame", track);
    let travel = 0, boxes = [];
    const measure = () => {
      // Run until the last frame has fully crossed the line.
      const last = frames[frames.length - 1];
      travel = Math.max(0, last.offsetLeft + last.offsetWidth - mStage.clientWidth / 2 + 80);
      boxes = frames.map(f => ({ left: f.offsetLeft, width: f.offsetWidth, media: $(".frame__media", f) }));
    };
    const paint = progress => {
      const line = mStage.clientWidth / 2;
      const shift = -progress * travel;
      boxes.forEach(b => {
        const cut = gsap.utils.clamp(0, b.width, line - (b.left + shift));
        b.media.style.setProperty("--cut", cut + "px");
      });
    };
    measure();
    gsap.timeline({
      scrollTrigger: {
        trigger: mStage, start: "top top", end: () => "+=" + travel, pin: true, scrub: true, invalidateOnRefresh: true,
        onRefreshInit: measure, onRefresh: self => paint(self.progress), onUpdate: self => paint(self.progress)
      }
    }).fromTo(track, { x: 0 }, { x: () => -travel, ease: "none", duration: 1 });
    paint(0);
    }

    function pinVenues() {
    /* venues: stickers slapped on one at a time */
    const stickers = $$(".sticker", $("[data-stickers]"));
    const slap = gsap.timeline({ scrollTrigger: { trigger: ".venues__stage", start: "top top", end: () => "+=" + Math.round(innerHeight * 1.1), pin: true, scrub: true } });
    stickers.forEach((s, i) => {
      slap.fromTo(s, { autoAlpha: 0, scale: 1.7, rotation: i % 2 ? 18 : -18 },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: .5, ease: "back.out(2.2)" }, i * .32);
    });
    slap.to({}, { duration: .5 });
    }
  });

  // Pins above later triggers shift their positions; sort by page order before measuring.
  const remeasure = () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); };
  remeasure();
  document.fonts?.ready.then(remeasure);
  addEventListener("load", remeasure);
})();
