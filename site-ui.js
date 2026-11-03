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
  };
  const ITEMS = [
    { key: "home", label: "Home", href: "./", match: p => p === "index.html" },
    { key: "fresh", label: "Fresher Jobs", short: "Freshers", href: "careers.html#freshers", hot: true, match: (p, h) => p === "careers.html" && h !== "#experienced" },
    { key: "jobs", label: "Experienced Jobs", short: "Experienced", href: "careers.html#experienced", match: (p, h) => p === "careers.html" && h === "#experienced" },
    { key: "bot", label: "Interview Bot", short: "Bot", href: "interview.html", badge: "NEW", match: p => ["interview.html", "progress.html", "admin.html"].includes(p) },
    { key: "events", label: "Events", href: "events.html", match: p => p === "events.html" },
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
  @media (prefers-reduced-motion: reduce) { .swui-item.hot, .cats a.swui-hotlink { animation: none; } .swui-rail { transition: none; } }
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
    html += `<a class="swui-item${it.hot ? " hot" : ""}" href="${it.href}" data-k="${it.key}" data-label="${it.label}"${cur ? ' aria-current="page"' : ""}>` +
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
      `<div class="swf-row swf-mail"><div style="display:flex;gap:12px;align-items:center"><span class="swf-ic" style="background:#eef3ff">✉️</span><span><b>Weekly email</b><small>Top stories, events and jobs every Sunday</small></span></div>` +
      '<form novalidate><input type="email" placeholder="Your email" aria-label="Your email" autocomplete="email" required><button type="submit">Sign up</button></form><div class="swf-msg" role="status"></div></div>' +
      (ok(C.LINKEDIN_URL) ? `<a class="swf-row" data-k="linkedin" href="${C.LINKEDIN_URL}" target="_blank" rel="noopener"><span class="swf-ic" style="background:#e8f1fb">in</span><span><b>LinkedIn</b><small>Daily posts on India's chip industry</small></span></a>` : "") +
      '<p class="swf-foot">Hiring or running a VLSI course? <a data-k="advertise" href="contact.html">Advertise with us →</a></p></div>';
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
    form.addEventListener("submit", e => {
      e.preventDefault();
      const email = form.querySelector("input").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.style.color = "#b42318"; msg.textContent = "Please enter a valid email."; return; }
      if (!ok(C.SUBSTACK_URL)) { msg.style.color = "#5b6475"; msg.textContent = "Email sign-ups open very soon."; return; }
      count("email");
      window.open(C.SUBSTACK_URL.replace(/\/+$/, "") + "/subscribe?email=" + encodeURIComponent(email), "_blank", "noopener");
      msg.style.color = "#0a7a52"; msg.textContent = "Almost done: confirm on the Substack page that just opened.";
    });
  })();

  // ---- background ----
  const bg = document.createElement("div");
  bg.className = "swui-bg";
  document.body.insertBefore(bg, document.body.firstChild);
})();
