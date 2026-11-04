// =====================================================================
//  Semicon Weekly – quick menu + background (all pages)
//  Laptop: slim icon bar on the left; press ☰ to open the full menu.
//  Phone:  app-style bar at the bottom.
//  Fresher Jobs is always highlighted so job seekers find it first.
// =====================================================================
(function () {
  if (window.__swUi) return; window.__swUi = true;
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";

  const ICON = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    fresh: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.2 1 5.9L12 16.6 6.8 19.3l1-5.9-4.3-4.2 5.9-.9z"/>',
    jobs: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
    bot: '<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4"/><circle cx="9" cy="13" r="1.4"/><circle cx="15" cy="13" r="1.4"/><path d="M9.5 16.5h5"/>',
    events: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    refer: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    road: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  };
  const ITEMS = [
    { key: "home", label: "Home", href: "./", match: p => p === "index.html" },
    { key: "road", label: "VLSI Roadmap", short: "Roadmap", href: "vlsi-career-roadmap.html", badge: "NEW", guide: true, match: p => /^(vlsi-career-roadmap|roadmap-)/.test(p) },
    { key: "fresh", label: "Fresher Jobs", short: "Freshers", href: "careers.html#freshers", hot: true, match: (p, h) => p === "careers.html" && h !== "#experienced" },
    { key: "jobs", label: "Experienced Jobs", short: "Experienced", href: "careers.html#experienced", match: (p, h) => p === "careers.html" && h === "#experienced", desktopOnly: true },
    { key: "bot", label: "Interview Bot", short: "Bot", href: "interview.html", badge: "NEW", match: p => ["interview.html", "progress.html", "admin.html"].includes(p) },
    { key: "refer", label: "Get Referred", short: "Referral", href: "referral.html", badge: "FREE", match: p => p === "referral.html" },
    { key: "events", label: "Events", href: "events.html", match: p => p === "events.html", desktopOnly: true },
  ];
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

  const css = `
  :root { --swui-w: 64px; }
  .swui-rail { position: fixed; z-index: 70; left: 0; top: 0; bottom: 0; width: var(--swui-w); background: #071a36;
    display: flex; flex-direction: column; gap: 6px; padding: 10px 8px; box-shadow: 1px 0 0 rgba(255,255,255,.06), 2px 0 12px rgba(0,0,0,.12);
    transition: width .18s ease; overflow: hidden; }
  .swui-rail.open { width: 220px; box-shadow: 8px 0 30px rgba(0,0,0,.3); }
  .swui-toggle { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 12px; border: 0; border-radius: 10px; background: transparent;
    color: #c9d6ee; cursor: pointer; font: 700 15px var(--slab, Georgia, serif); white-space: nowrap; margin-bottom: 6px; }
  .swui-toggle:hover { background: rgba(255,255,255,.08); color: #fff; }
  .swui-item { position: relative; display: flex; align-items: center; gap: 14px; height: 46px; padding: 0 12px; border-radius: 10px;
    color: #c9d6ee; font: 600 14.5px var(--sans, Roboto, sans-serif); white-space: nowrap; text-decoration: none; transition: background .15s, color .15s; }
  .swui-rail svg { flex: none; width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .swui-item:hover { background: rgba(255,255,255,.08); color: #fff; }
  .swui-item[aria-current="page"] { background: rgba(10,165,194,.22); color: #fff; }
  .swui-label { opacity: 0; transition: opacity .12s; }
  .swui-rail.open .swui-label { opacity: 1; }
  .swui-short { display: none; }
  .swui-badge { position: absolute; top: 5px; left: 30px; background: #f5b82e; color: #1a1300; font: 800 8px/1 var(--sans, Roboto, sans-serif); letter-spacing: .05em; padding: 2px 3px; border-radius: 3px; }
  .swui-rail.open .swui-badge { position: static; margin-left: auto; font-size: 10px; padding: 3px 5px; }
  /* Fresher Jobs: always stands out */
  .swui-item.guide { background: linear-gradient(160deg, #2fd3ec, #0a8fb0); color: #04202a; animation: swuiGlowC 2.6s infinite; }
  .swui-item.guide:hover, .swui-item.guide[aria-current="page"] { background: linear-gradient(160deg, #6ee3f4, #18a6c6); color: #04202a; }
  .swui-item.guide .swui-badge { background: #fff; color: #0a6c86; }
  @keyframes swuiGlowC { 0% { box-shadow: 0 0 0 0 rgba(47,211,236,.55); } 70% { box-shadow: 0 0 0 10px rgba(47,211,236,0); } 100% { box-shadow: 0 0 0 0 rgba(47,211,236,0); } }
  .swui-call { position: fixed; z-index: 72; max-width: 270px; background: #fff; color: #10213f; border-radius: 12px; padding: 12px 34px 12px 14px;
    box-shadow: 0 16px 40px -10px rgba(6,17,36,.5), 0 0 0 2px #2fd3ec; font: 500 14px/1.4 var(--sans, Roboto, sans-serif); animation: swuiPop .35s ease-out; }
  .swui-call b { display: block; font: 700 15px/1.3 var(--slab, Georgia, serif); color: #0b2447; }
  .swui-call a.go { display: inline-block; margin-top: 8px; background: #0b2447; color: #fff; font: 700 13.5px var(--sans, Roboto, sans-serif); padding: 7px 12px; border-radius: 7px; text-decoration: none; }
  .swui-call button { position: absolute; top: 6px; right: 6px; border: 0; background: none; font-size: 18px; line-height: 1; color: #64748b; cursor: pointer; padding: 4px; }
  .swui-call::before { content: ""; position: absolute; width: 14px; height: 14px; background: #fff; transform: rotate(45deg); box-shadow: -2px 2px 0 0 #2fd3ec; left: -7px; top: 18px; }
  .swui-call.below::before { left: var(--ax, 50%); top: auto; bottom: -7px; box-shadow: 2px 2px 0 0 #2fd3ec; }
  @keyframes swuiPop { from { opacity: 0; transform: translateY(6px) scale(.96); } to { opacity: 1; transform: none; } }
  .swui-item.hot { background: linear-gradient(160deg, #ffd666, #f5a524); color: #1a1300; animation: swuiGlow 2.2s infinite; }
  .swui-item.hot:hover, .swui-item.hot[aria-current="page"] { background: linear-gradient(160deg, #ffe08a, #f7b23a); color: #1a1300; }
  .swui-item.hot .swui-badge { background: #dc2626; color: #fff; }
  @keyframes swuiGlow { 0% { box-shadow: 0 0 0 0 rgba(245,184,46,.6); } 70% { box-shadow: 0 0 0 10px rgba(245,184,46,0); } 100% { box-shadow: 0 0 0 0 rgba(245,184,46,0); } }
  .swui-tip { position: fixed; z-index: 71; left: calc(var(--swui-w) + 8px); background: #071a36; color: #fff; font: 600 13px var(--sans, Roboto, sans-serif);
    padding: 6px 10px; border-radius: 6px; pointer-events: none; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,.2); transform: translateY(-50%); }
  .swui-scrim { position: fixed; inset: 0; z-index: 69; background: rgba(6,17,36,.25); }
  @media (min-width: 761px) { body.swui-has-rail { padding-left: var(--swui-w); } }
  /* Phone: bottom tab bar */
  @media (max-width: 760px) {
    .swui-rail, .swui-rail.open { top: auto; right: 0; width: auto; height: auto; flex-direction: row; gap: 4px; padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px));
      box-shadow: 0 -4px 16px rgba(0,0,0,.2); overflow: visible; }
    .swui-toggle, .swui-label, .swui-tip, .swui-scrim { display: none !important; }
    .swui-short { display: block; }
    .swui-deskonly { display: none !important; }
    .swui-item { flex: 1; flex-direction: column; justify-content: center; gap: 3px; height: 54px; padding: 0 2px; font-size: 11px; }
    .swui-item svg { width: 22px; height: 22px; }
    .swui-badge, .swui-rail.open .swui-badge { position: absolute; top: 2px; left: auto; right: 6px; margin: 0; font-size: 8px; padding: 2px 3px; }
    body.swui-has-rail { padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px)); }
    body.swui-has-rail .swp-fab { display: none !important; }
  }
  /* Fresher Jobs link in the black category bar */
  .cats a.swui-hotlink { background: #f5b82e; color: #1a1300 !important; padding: 4px 12px 4px 10px; border-radius: 99px; font-weight: 600; animation: swuiGlow 2.2s infinite; }
  .cats a.swui-hotlink::before { border-left-color: #1a1300 !important; }
  /* Background: soft brand tint and a fine dot grid */
  .swui-bg { position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background:
      radial-gradient(900px 520px at 0% 0%, rgba(10,165,194,.08), transparent 70%),
      radial-gradient(800px 520px at 100% 100%, rgba(11,36,71,.07), transparent 70%),
      radial-gradient(circle, rgba(11,36,71,.09) 1px, transparent 1.4px) 0 0 / 22px 22px,
      linear-gradient(180deg, #f7f9fc, #f2f5f9); }
  @media (prefers-reduced-motion: reduce) { .swui-item.hot, .swui-item.guide, .swui-call, .cats a.swui-hotlink { animation: none; } .swui-rail { transition: none; } }
  @media print { .swui-rail, .swui-bg { display: none; } body.swui-has-rail { padding: 0; } }
  `;
  const st = document.createElement("style"); st.id = "swui-css"; st.textContent = css;
  document.head.appendChild(st);

  // ---- menu ----
  const nav = document.createElement("nav");
  nav.className = "swui-rail"; nav.setAttribute("aria-label", "Quick menu");
  let html = `<button class="swui-toggle" type="button" aria-expanded="false" aria-label="Open menu">${svg("menu")}<span class="swui-label">Menu</span></button>`;
  ITEMS.forEach(it => {
    const cur = it.match(page, location.hash);
    html += `<a class="swui-item${it.hot ? " hot" : ""}${it.guide ? " guide" : ""}${it.desktopOnly ? " swui-deskonly" : ""}" href="${it.href}" data-k="${it.key}" data-label="${it.label}"${cur ? ' aria-current="page"' : ""}>` +
      svg(it.key) + `<span class="swui-label">${it.label}</span><span class="swui-short">${it.short || it.label}</span>` +
      (it.hot ? '<span class="swui-badge">HOT</span>' : it.badge ? `<span class="swui-badge">${it.badge}</span>` : "") + "</a>";
  });
  nav.innerHTML = html;
  document.body.appendChild(nav);
  document.body.classList.add("swui-has-rail");

  const toggle = nav.querySelector(".swui-toggle");
  let scrim = null;
  function setOpen(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.querySelector("svg").innerHTML = ICON[open ? "close" : "menu"];
    if (open && !scrim) { scrim = document.createElement("div"); scrim.className = "swui-scrim"; scrim.addEventListener("click", () => setOpen(false)); document.body.appendChild(scrim); }
    if (!open && scrim) { scrim.remove(); scrim = null; }
    hideTip();
  }
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); } });

  // name tooltip next to each icon while the menu is closed
  let tip = null;
  function hideTip() { if (tip) { tip.remove(); tip = null; } }
  nav.querySelectorAll(".swui-item").forEach(a => {
    const showTip = () => {
      if (nav.classList.contains("open") || matchMedia("(max-width: 760px)").matches) return;
      hideTip(); const r = a.getBoundingClientRect();
      tip = document.createElement("div"); tip.className = "swui-tip"; tip.textContent = a.dataset.label;
      tip.style.top = (r.top + r.height / 2) + "px"; document.body.appendChild(tip);
    };
    a.addEventListener("mouseenter", showTip); a.addEventListener("focus", showTip);
    a.addEventListener("mouseleave", hideTip); a.addEventListener("blur", hideTip);
    a.setAttribute("aria-label", a.dataset.label);
  });

  nav.addEventListener("click", e => {
    const a = e.target.closest("a.swui-item"); if (!a) return;
    setOpen(false);
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "menu-" + a.dataset.k, title: "Quick menu: " + a.dataset.k, event: true }); } catch {}
  });
  window.addEventListener("hashchange", () => {
    nav.querySelectorAll("a.swui-item").forEach(a => {
      const it = ITEMS.find(x => x.key === a.dataset.k);
      if (it.match(page, location.hash)) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  });

  // ---- "New: VLSI roadmap" bubble next to the menu item (first 3 visits, once a day) ----
  (function roadmapCallout() {
    if (/^(vlsi-career-roadmap|roadmap-)/.test(page) || ["admin.html", "progress.html"].includes(page)) return;
    let st = {}; try { st = JSON.parse(localStorage.getItem("sw-roadcall") || "{}"); } catch {}
    const today = new Date().toISOString().slice(0, 10);
    if (st.closed || (st.n || 0) >= 3 || st.day === today) return;
    const target = nav.querySelector('a[data-k="road"]'); if (!target) return;
    let tries = 0;
    const show = () => {
      if (document.querySelector(".swp-ov") && tries++ < 40) return setTimeout(show, 800); // wait until the launch popup is closed
      if (nav.classList.contains("open")) return;
      const phone = matchMedia("(max-width: 760px)").matches, r = target.getBoundingClientRect();
      const c = document.createElement("div"); c.className = "swui-call" + (phone ? " below" : ""); c.setAttribute("role", "status");
      c.innerHTML = '<b>🗺️ New: VLSI Career Roadmap</b>See every chip job (RTL, DV, PD, DFT, analog, embedded) and exactly what to learn for each.<br><a class="go" href="vlsi-career-roadmap.html?ref=bubble">Show me the roadmap →</a><button type="button" aria-label="Close">×</button>';
      document.body.appendChild(c);
      if (phone) { const w = Math.min(270, innerWidth - 24); c.style.width = w + "px"; const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
        c.style.left = left + "px"; c.style.bottom = (innerHeight - r.top + 12) + "px"; c.style.setProperty("--ax", (r.left + r.width / 2 - left - 7) + "px"); }
      else { c.style.left = (r.right + 14) + "px"; c.style.top = (r.top - 4) + "px"; }
      st.n = (st.n || 0) + 1; st.day = today; try { localStorage.setItem("sw-roadcall", JSON.stringify(st)); } catch {}
      const close = keep => { c.remove(); if (keep) { st.closed = 1; try { localStorage.setItem("sw-roadcall", JSON.stringify(st)); } catch {} } };
      c.querySelector("button").addEventListener("click", () => close(true));
      c.querySelector("a.go").addEventListener("click", () => { st.closed = 1; try { localStorage.setItem("sw-roadcall", JSON.stringify(st)); } catch {}
        try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "roadmap-bubble", title: "Roadmap bubble click", event: true }); } catch {} });
      setTimeout(() => close(false), 12000);
      addEventListener("scroll", () => phone || close(false), { once: true, passive: true });
    };
    setTimeout(show, 1500);
  })();

  // ---- Fresher jobs link in the category bar: highlighted and always first ----
  function hotFreshers() {
    document.querySelectorAll('.cats a[href*="#freshers"]').forEach(a => {
      a.classList.add("swui-hotlink");
      if (!/🔥/.test(a.textContent)) a.textContent = "🔥 " + a.textContent.trim();
      if (a.parentNode.firstElementChild !== a) a.parentNode.insertBefore(a, a.parentNode.firstElementChild);
    });
  }
  hotFreshers(); setTimeout(hotFreshers, 0);

  // ---- header "Follow" menu (replaces the loud yellow Subscribe button) ----
  (function followMenu() {
    const old = document.querySelector('.brand-tools a.sub-btn[href="#subscribe"]');
    if (!old) return;
    const C = window.SW_CONFIG || {};
    const ok = u => typeof u === "string" && /^https?:\/\//.test(u);
    const fcss = `
    .swf { position: relative; }
    .swf-btn { display: inline-flex; align-items: center; gap: 7px; background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.4);
      font: 600 15px/1 var(--slab, Georgia, serif); padding: 9px 14px; border-radius: 6px; cursor: pointer; transition: background .15s, border-color .15s; }
    .swf-btn:hover, .swf-btn[aria-expanded="true"] { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.75); }
    .swf-btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
    .swf-pop { position: absolute; right: 0; top: calc(100% + 10px); z-index: 80; width: 320px; max-width: calc(100vw - 24px); background: #fff; color: #1d2433;
      border-radius: 12px; box-shadow: 0 18px 50px -12px rgba(6,17,36,.45), 0 0 0 1px rgba(11,36,71,.08); padding: 16px; text-align: left; }
    .swf-pop h3 { font: 700 16px/1.3 var(--slab, Georgia, serif); color: #0b2447; }
    .swf-pop .sub { font-size: 13.5px; color: #5b6475; margin-top: 3px; }
    .swf-row { display: flex; align-items: center; gap: 12px; padding: 10px; margin-top: 8px; border-radius: 9px; border: 1px solid #e6eaf0; color: #1d2433; text-decoration: none; }
    a.swf-row:hover { border-color: #0aa5c2; background: #f5fbfd; }
    .swf-ic { flex: none; width: 34px; height: 34px; border-radius: 8px; display: grid; place-items: center; font-size: 17px; }
    .swf-row b { display: block; font: 600 14.5px var(--sans, Roboto, sans-serif); }
    .swf-row small { display: block; font-size: 12.5px; color: #5b6475; margin-top: 1px; }
    .swf-mail { display: block; }
    .swf-mail form { display: flex; gap: 6px; margin-top: 8px; }
    .swf-mail input { flex: 1; min-width: 0; font: 14px var(--sans, Roboto, sans-serif); padding: 8px 10px; border: 1px solid #cfd6e0; border-radius: 7px; background: #fff; color: #1d2433; }
    .swf-mail input:focus { outline: 2px solid #0aa5c2; outline-offset: 0; border-color: #0aa5c2; }
    .swf-mail button { font: 600 14px var(--sans, Roboto, sans-serif); background: #0b2447; color: #fff; border: 0; border-radius: 7px; padding: 0 12px; cursor: pointer; }
    .swf-msg { font-size: 12.5px; color: #0a7a52; margin-top: 6px; min-height: 0; }
    .swf-foot { margin-top: 12px; padding-top: 10px; border-top: 1px solid #eef0f4; font-size: 13px; color: #5b6475; }
    .swf-foot a { color: #0a86a0; font-weight: 600; }
    @media (max-width: 900px) { .swf-btn { padding: 8px 10px; font-size: 14px; } }
    @media (max-width: 480px) { .swf-btn span { display: none; } .swf-btn { padding: 8px; }
      .swf-pop { position: fixed; left: 12px; right: 12px; top: 64px; width: auto; max-width: none; } }`;
    const s2 = document.createElement("style"); s2.textContent = fcss; document.head.appendChild(s2);

    const wrap = document.createElement("div"); wrap.className = "swf";
    wrap.innerHTML =
      '<button class="swf-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Follow Semicon Weekly">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg><span>Follow</span></button>' +
      '<div class="swf-pop" role="dialog" aria-label="Follow Semicon Weekly" hidden>' +
      '<h3>Get chip news and jobs</h3><p class="sub">Pick what suits you. All free, no spam.</p>' +
      (ok(C.WHATSAPP_URL) ? `<a class="swf-row" data-k="whatsapp" href="${C.WHATSAPP_URL}" target="_blank" rel="noopener"><span class="swf-ic" style="background:#e7f8ee">💬</span><span><b>WhatsApp channel</b><small>New fresher jobs as soon as we post them</small></span></a>` : "") +
      (ok(C.TELEGRAM_URL) ? `<a class="swf-row" data-k="telegram" href="${C.TELEGRAM_URL}" target="_blank" rel="noopener"><span class="swf-ic" style="background:#e3f2fd">✈️</span><span><b>Telegram channel</b><small>Jobs, news and deadlines in one place</small></span></a>` : "") +
      `<div class="swf-row swf-mail"><div style="display:flex;gap:12px;align-items:center"><span class="swf-ic" style="background:#eef3ff">✉️</span><span><b>Weekly email</b><small>Top stories, events and jobs every Sunday</small></span></div>` +
      '<form novalidate><input type="email" placeholder="Your email" aria-label="Your email" autocomplete="email" required><button type="submit">Sign up</button></form><div class="swf-msg" role="status"></div></div>' +
      (ok(C.LINKEDIN_URL) ? `<a class="swf-row" data-k="linkedin" href="${C.LINKEDIN_URL}" target="_blank" rel="noopener"><span class="swf-ic" style="background:#e8f1fb">in</span><span><b>LinkedIn</b><small>Daily posts on India's chip industry</small></span></a>` : "") +
      '<p class="swf-foot">Looking for a VLSI job? <a data-k="referral" href="referral.html?ref=follow">Get referred, free →</a></p></div>';
    old.replaceWith(wrap);

    const btn = wrap.querySelector(".swf-btn"), pop = wrap.querySelector(".swf-pop");
    const count = k => { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "follow-" + k, title: "Follow menu: " + k, event: true }); } catch {} };
    function setOpen(open) { pop.hidden = !open;
      if (open && matchMedia("(max-width: 480px)").matches) pop.style.top = Math.round(btn.getBoundingClientRect().bottom + 8) + "px"; else pop.style.top = ""; btn.setAttribute("aria-expanded", String(open)); if (open) count("open"); }
    btn.addEventListener("click", e => { e.stopPropagation(); setOpen(pop.hidden); });
    document.addEventListener("click", e => { if (!pop.hidden && !wrap.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { setOpen(false); btn.focus(); } });
    pop.addEventListener("click", e => { const a = e.target.closest("a[data-k]"); if (a) count(a.dataset.k); });
    const form = pop.querySelector("form"), msg = pop.querySelector(".swf-msg");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!window.SWSubscribe) return;
      const input = form.querySelector("input"), b = form.querySelector("button");
      b.disabled = true; msg.style.color = "#5b6475"; msg.textContent = "Signing you up…";
      const res = await window.SWSubscribe(input.value);
      b.disabled = false; msg.style.color = res.ok ? "#0a7a52" : "#b42318"; msg.textContent = res.text;
      if (res.ok) { input.value = ""; count("email"); }
    });
  })();

  // ---- footer email sign-up: richer card ----
  (function footerSignup() {
    const form = document.querySelector("footer form#signup");
    const intro = form && form.closest(".fgrid") && form.closest(".fgrid").firstElementChild;
    if (!form || !intro || intro === form || intro.querySelector(".swn-perks")) return;
    const ncss = `
    footer .fgrid { align-items: center; }
    .swn-kicker { display: inline-flex; align-items: center; gap: 6px; font: 700 11.5px/1 var(--sans, Roboto, sans-serif); letter-spacing: .12em; text-transform: uppercase;
      color: #ffd666; background: rgba(245,184,46,.12); border: 1px solid rgba(245,184,46,.35); padding: 6px 10px; border-radius: 99px; margin-bottom: 12px; }
    .swn-perks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 16px; max-width: 560px; }
    .swn-perk { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 10px; padding: 10px 12px; }
    .swn-perk b { display: block; font: 600 14px var(--sans, Roboto, sans-serif); color: #fff; margin-top: 4px; }
    .swn-perk span { font-size: 12.5px; color: #b9c8e4; }
    .swn-perk i { font-style: normal; font-size: 18px; }
    footer form#signup.swn-card { background: #fff; border-radius: 14px; padding: 18px; box-shadow: 0 20px 50px -20px rgba(0,0,0,.6); max-width: 420px; width: 100%; justify-self: end;
      display: flex; flex-wrap: wrap; gap: 10px; align-items: stretch; }
    .swn-card .swn-h { flex-basis: 100%; font: 700 17px/1.3 var(--slab, Georgia, serif); color: #0b2447; }
    .swn-card .swn-h small { display: block; font: 400 13px var(--sans, Roboto, sans-serif); color: #5b6475; margin-top: 3px; }
    footer .swn-card input[type=email] { flex: 1 1 180px; min-width: 0; background: #f6f8fb !important; color: #1d2433 !important; border: 1px solid #cfd6e0 !important; border-radius: 9px;
      padding: 12px 14px; font: 15px var(--sans, Roboto, sans-serif); }
    footer .swn-card input[type=email]:focus { outline: 2px solid #0aa5c2; border-color: #0aa5c2 !important; background: #fff !important; }
    footer .swn-card button { flex: 0 0 auto; border-radius: 9px; padding: 12px 18px; font-size: 16px; }
    footer .swn-card button:disabled { opacity: .7; cursor: wait; }
    footer .swn-card .form-msg { flex-basis: 100%; margin: 0; font-size: 13.5px; color: #b42318; min-height: 0; }
    footer .swn-card .form-msg:empty { display: none; }
    .swn-trust { flex-basis: 100%; font-size: 12.5px; color: #5b6475; display: flex; gap: 14px; flex-wrap: wrap; }
    .swn-done { flex-basis: 100%; text-align: center; padding: 6px 0; color: #1d2433; }
    .swn-done .tick { width: 46px; height: 46px; border-radius: 50%; background: #dcfce7; color: #15803d; display: grid; place-items: center; font-size: 24px; margin: 0 auto 8px; }
    .swn-done b { display: block; font: 700 18px var(--slab, Georgia, serif); color: #0b2447; }
    .swn-done p { font-size: 14px; color: #5b6475; margin-top: 4px; }
    @media (max-width: 760px) { .swn-perks { grid-template-columns: 1fr; } .swn-perk { display: flex; gap: 10px; align-items: center; } .swn-perk b { margin: 0; }
      footer form#signup.swn-card { justify-self: stretch; max-width: none; margin-top: 18px; } footer .swn-card button { flex: 1 1 100%; } }`;
    const st3 = document.createElement("style"); st3.textContent = ncss; document.head.appendChild(st3);

    intro.insertAdjacentHTML("afterbegin", '<span class="swn-kicker">✉️ The Sunday Brief</span>');
    intro.insertAdjacentHTML("beforeend",
      '<div class="swn-perks">' +
      '<div class="swn-perk"><i>📰</i><b>Top 5 chip stories</b><span>Explained in 2 minutes</span></div>' +
      '<div class="swn-perk"><i>💼</i><b>New fresher jobs</b><span>RTL, DV, PD, embedded</span></div>' +
      '<div class="swn-perk"><i>📅</i><b>Events &amp; deadlines</b><span>Hackathons, summits, exams</span></div></div>');

    form.classList.add("swn-card");
    form.insertAdjacentHTML("afterbegin", '<div class="swn-h">Join the Sunday Brief<small>Free · one email a week · read in 5 minutes</small></div>');
    const btn = form.querySelector("button"); if (btn) btn.textContent = "Join free";
    const input = form.querySelector("input[type=email]"); if (input) input.placeholder = "you@gmail.com";
    form.insertAdjacentHTML("beforeend", '<div class="swn-trust"><span>🔒 No spam</span><span>↩️ Unsubscribe in 1 click</span></div>');

    // swap to a success panel once the sign-up works (sw.js writes the message)
    const msg = form.querySelector(".form-msg");
    if (msg) new MutationObserver(() => {
      if (/You're in/.test(msg.textContent)) {
        form.innerHTML = '<div class="swn-done"><div class="tick">✓</div><b>You\'re in!</b><p>Your first Sunday Brief arrives this Sunday. If you don\'t see it, check the Promotions tab.</p></div>';
      }
    }).observe(msg, { childList: true, characterData: true, subtree: true });
  })();

  // ---- dark mode (button in the header; choice remembered on this device) ----
  (function darkMode() {
    const root = document.documentElement;
    let saved = null; try { saved = localStorage.getItem("sw-theme"); } catch {}
    if (saved === "dark") root.setAttribute("data-theme", "dark");
    const dcss = `
    html[data-theme="dark"] { --paper: #0e1626; --paper-2: #17223a; --ink: #e7ecf5; --ink-2: #b7c2d6; --ink-3: #8d9ab0; --rule: #2a3854;
      --brand: #08162e; --accent: #38c6e0; --c-policy: #60a5fa; --c-company: #34d399; --c-fab: #a78bfa; --c-design: #38c6e0; --c-jobs: #fb923c; --c-event: #f472b6; color-scheme: dark; }
    html[data-theme="dark"] body { background: var(--paper); color: var(--ink); }
    html[data-theme="dark"] .swui-bg { background: radial-gradient(900px 520px at 0% 0%, rgba(56,198,224,.08), transparent 70%), radial-gradient(circle, rgba(255,255,255,.05) 1px, transparent 1.4px) 0 0 / 22px 22px, linear-gradient(180deg, #0c1322, #0e1626); }
    html[data-theme="dark"] .card, html[data-theme="dark"] .iq, html[data-theme="dark"] .tcard, html[data-theme="dark"] .toc, html[data-theme="dark"] .prep,
    html[data-theme="dark"] .jcard, html[data-theme="dark"] .use, html[data-theme="dark"] details.faq, html[data-theme="dark"] .tbl { background: var(--paper-2) !important; border-color: var(--rule) !important; }
    html[data-theme="dark"] .tbl th { background: #1e2b45; }
    html[data-theme="dark"] select, html[data-theme="dark"] textarea, html[data-theme="dark"] input:not([type=checkbox]):not([type=radio]),
    html[data-theme="dark"] .ansmodes button:not([aria-pressed="true"]), html[data-theme="dark"] .speak-q:not([aria-pressed="true"]), html[data-theme="dark"] .fb button.vote { background: #0b1220 !important; color: var(--ink) !important; border-color: #33425f !important; }
    html[data-theme="dark"] .ansmodes button[aria-pressed="true"] { background: #38c6e0 !important; border-color: #38c6e0 !important; color: #04202a !important; }
    html[data-theme="dark"] .mode:has(input:checked), html[data-theme="dark"] .speak-q[aria-pressed="true"], html[data-theme="dark"] .mic { background: rgba(56,198,224,.12) !important; border-color: #38c6e0 !important; color: var(--ink) !important; }
    html[data-theme="dark"] .list li, html[data-theme="dark"] .sum-table th, html[data-theme="dark"] .sum-table td { border-bottom-color: var(--rule); }
    html[data-theme="dark"] .btn-main { background: #38c6e0 !important; color: #04202a !important; }
    html[data-theme="dark"] footer .swn-card input[type=email] { background: #f6f8fb !important; color: #1d2433 !important; border-color: #cfd6e0 !important; }
    html[data-theme="dark"] .swf-pop input { background: #fff !important; color: #1d2433 !important; border-color: #cfd6e0 !important; }
    html[data-theme="dark"] .note-box, html[data-theme="dark"] .safe, html[data-theme="dark"] .block.warn, html[data-theme="dark"] .iq-note.mis { background: rgba(251,146,60,.13) !important; color: #fed7aa !important; }
    html[data-theme="dark"] .notice { background: #2a2210; color: #fcd34d; border-color: #4a3b12; }
    html[data-theme="dark"] .w-fresh, html[data-theme="dark"] .jtab[aria-selected="true"] { background: rgba(251,146,60,.12); }
    html[data-theme="dark"] .chip.hot { background: rgba(251,146,60,.18); color: #fdba74; }
    html[data-theme="dark"] .chip.due { background: rgba(56,189,248,.16); color: #7dd3fc; }
    html[data-theme="dark"] .chip.due-soon, html[data-theme="dark"] .err, html[data-theme="dark"] .mcq-res .opt.wrong, html[data-theme="dark"] .tag.hard, html[data-theme="dark"] .iq-meta .hard { background: rgba(248,113,113,.16) !important; color: #fca5a5 !important; }
    html[data-theme="dark"] .tag.medium, html[data-theme="dark"] .iq-meta .medium { background: rgba(251,191,36,.16); color: #fcd34d; }
    html[data-theme="dark"] .iq-meta .easy { background: rgba(52,211,153,.16); color: #6ee7b7; }
    html[data-theme="dark"] .iq-code { background: #0b1220; color: #d7e3f4; }
    html[data-theme="dark"] .iq details { border-top-color: var(--rule); }
    html[data-theme="dark"] .iq summary, html[data-theme="dark"] .pk .price, html[data-theme="dark"] .bigs b { color: #8fd8ea; }
    html[data-theme="dark"] .cnt { background: rgba(52,211,153,.16); color: #6ee7b7; }
    html[data-theme="dark"] .job.featured { background: rgba(245,184,46,.1); }
    html[data-theme="dark"] .bigs div { background: var(--paper-2); }
    html[data-theme="dark"] img { filter: brightness(.92); }
    .swd-btn { color: #fff; background: none; border: 0; cursor: pointer; padding: 4px; display: grid; place-items: center; border-radius: 6px; }
    .swd-btn:hover { background: rgba(255,255,255,.1); }
    .swd-btn svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }`;
    const st4 = document.createElement("style"); st4.textContent = dcss; document.head.appendChild(st4);
    const tools = document.querySelector(".brand-tools");
    if (!tools) return;
    const MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
    const SUN = '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
    const b = document.createElement("button"); b.type = "button"; b.className = "swd-btn";
    const paint = () => { const dark = root.getAttribute("data-theme") === "dark";
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${dark ? SUN : MOON}</svg>`;
      b.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode"); b.title = dark ? "Light mode" : "Dark mode";
      const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? "#08162e" : "#0b2447"; };
    b.addEventListener("click", () => {
      const dark = root.getAttribute("data-theme") !== "dark";
      if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
      try { localStorage.setItem("sw-theme", dark ? "dark" : "light"); } catch {}
      paint();
      try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "theme-" + (dark ? "dark" : "light"), title: "Theme switch", event: true }); } catch {}
    });
    paint();
    tools.insertBefore(b, tools.firstChild);
  })();

  // ---- background ----
  const bg = document.createElement("div");
  bg.className = "swui-bg";
  document.body.insertBefore(bg, document.body.firstChild);
})();
