// =====================================================================
//  Semicon Weekly – site menu + chip-circuit background (all pages)
//  Laptop: fixed menu on the left.  Phone: app-style bar at the bottom.
//  Fresher Jobs is always highlighted so job seekers find it first.
//  Background: faint circuit traces with "electrons" flowing along them.
// =====================================================================
(function () {
  if (window.__swUi) return; window.__swUi = true;
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";
  const hash = location.hash;

  const ICON = {
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

  const css = `
  :root { --swui-rail: 92px; }
  .swui-rail { position: fixed; z-index: 70; left: 0; top: 0; bottom: 0; width: var(--swui-rail); background: #071a36;
    display: flex; flex-direction: column; align-items: stretch; padding: 14px 8px; gap: 6px; box-shadow: 2px 0 14px rgba(0,0,0,.18); }
  .swui-rail .logo { color: #fff; font: 800 26px/1 var(--serif, Georgia, serif); text-align: center; padding: 6px 0 14px; letter-spacing: -.02em; white-space: nowrap; }
  .swui-rail .logo span { color: var(--accent, #0aa5c2); }
  .swui-item { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 11px 4px; border-radius: 12px;
    color: #c9d6ee; font: 600 12px/1.15 var(--sans, Roboto, sans-serif); text-align: center; text-decoration: none; transition: background .15s, color .15s; }
  .swui-item svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .swui-item:hover { background: rgba(255,255,255,.08); color: #fff; }
  .swui-item[aria-current="page"] { background: rgba(10,165,194,.22); color: #fff; }
  .swui-item[aria-current="page"]::before { content: ""; position: absolute; left: -8px; top: 12px; bottom: 12px; width: 4px; border-radius: 0 4px 4px 0; background: var(--accent, #0aa5c2); }
  .swui-badge { position: absolute; top: 4px; right: 4px; background: #f5b82e; color: #1a1300; font: 800 9px/1 var(--sans, Roboto, sans-serif); letter-spacing: .06em; padding: 3px 4px; border-radius: 3px; }
  /* Fresher Jobs: always stands out */
  .swui-item.hot { background: linear-gradient(160deg, #ffd666, #f5a524); color: #1a1300; box-shadow: 0 0 0 0 rgba(245,184,46,.7); animation: swuiGlow 2.2s infinite; }
  .swui-item.hot:hover { background: linear-gradient(160deg, #ffe08a, #f7b23a); color: #1a1300; }
  .swui-item.hot[aria-current="page"] { color: #1a1300; }
  .swui-item.hot[aria-current="page"]::before { background: #f5b82e; }
  .swui-item.hot .swui-badge { background: #dc2626; color: #fff; }
  @keyframes swuiGlow { 0% { box-shadow: 0 0 0 0 rgba(245,184,46,.65); } 70% { box-shadow: 0 0 0 12px rgba(245,184,46,0); } 100% { box-shadow: 0 0 0 0 rgba(245,184,46,0); } }
  .swui-rail .spacer { flex: 1; }
  .swui-rail .foot { color: #6c84b0; font: 500 10px/1.3 var(--sans, Roboto, sans-serif); text-align: center; }
  @media (min-width: 761px) {
    body.swui-has-rail { padding-left: var(--swui-rail); }
    .swui-short { display: none; }
  }
  @media (min-width: 761px) and (max-width: 1100px) { :root { --swui-rail: 76px; } .swui-item { font-size: 11px; } }
  /* Phone: bottom tab bar */
  @media (max-width: 760px) {
    .swui-rail { top: auto; right: 0; width: auto; height: auto; flex-direction: row; padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px)); gap: 4px;
      box-shadow: 0 -4px 16px rgba(0,0,0,.2); }
    .swui-rail .logo, .swui-rail .spacer, .swui-rail .foot, .swui-long { display: none; }
    .swui-item { flex: 1; padding: 7px 2px; gap: 3px; font-size: 11px; border-radius: 10px; }
    .swui-item svg { width: 22px; height: 22px; }
    .swui-item[aria-current="page"]::before { left: 20%; right: 20%; top: -6px; bottom: auto; width: auto; height: 3px; border-radius: 0 0 3px 3px; }
    .swui-badge { top: 1px; right: 6px; font-size: 8px; }
    body.swui-has-rail { padding-bottom: calc(66px + env(safe-area-inset-bottom, 0px)); }
    body.swui-has-rail .swp-fab { display: none !important; } /* the bottom bar already has the Bot tab */
  }
  /* Fresher Jobs link in the black category bar */
  .cats a.swui-hotlink { background: #f5b82e; color: #1a1300 !important; padding: 4px 12px 4px 10px; border-radius: 99px; font-weight: 600; animation: swuiGlow 2.2s infinite; }
  .cats a.swui-hotlink::before { border-left-color: #1a1300 !important; }
  /* Circuit background */
  .swui-bg { position: fixed; inset: 0; z-index: -1; pointer-events: none;
    -webkit-mask-image: linear-gradient(90deg, #000 0, #000 12%, transparent 30%, transparent 70%, #000 88%, #000 100%);
            mask-image: linear-gradient(90deg, #000 0, #000 12%, transparent 30%, transparent 70%, #000 88%, #000 100%); }
  .swui-bg svg { width: 100%; height: 100%; display: block; }
  .swui-bg .t path { fill: none; stroke: #0aa5c2; stroke-width: 2; opacity: .16; }
  .swui-bg .pad circle { fill: #fff; stroke: #0aa5c2; stroke-width: 2; opacity: .35; }
  .swui-bg .chip rect { fill: #eef9fc; stroke: #0aa5c2; stroke-width: 2; opacity: .45; }
  .swui-bg .chip .core { fill: #0aa5c2; opacity: .25; }
  .swui-bg .chip path { stroke: #0aa5c2; stroke-width: 2; opacity: .35; fill: none; }
  .swui-bg .e { fill: none; stroke: #0aa5c2; stroke-width: 3.5; stroke-linecap: round; stroke-dasharray: 14 586; opacity: .75;
    animation-name: swuiFlow; animation-timing-function: linear; animation-iteration-count: infinite; }
  .swui-bg .e.g { stroke: #f5b82e; opacity: .9; }
  @keyframes swuiFlow { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
  @media (max-width: 760px) {
    .swui-bg { -webkit-mask-image: none; mask-image: none; opacity: .45; }
  }
  @media (prefers-reduced-motion: reduce) { .swui-bg .e { animation: none; opacity: 0; } .swui-item.hot, .cats a.swui-hotlink { animation: none; } }
  @media print { .swui-rail, .swui-bg { display: none; } body.swui-has-rail { padding: 0; } }
  `;
  const st = document.createElement("style"); st.id = "swui-css"; st.textContent = css;
  document.head.appendChild(st);

  // ---- menu ----
  const nav = document.createElement("nav");
  nav.className = "swui-rail"; nav.setAttribute("aria-label", "Quick menu");
  let html = '<a class="logo" href="./" aria-label="Semicon Weekly home">S<span>W</span></a>';
  ITEMS.forEach(it => {
    const cur = it.match(page, hash);
    html += `<a class="swui-item${it.hot ? " hot" : ""}" href="${it.href}" data-k="${it.key}"${cur ? ' aria-current="page"' : ""}>` +
      `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[it.key]}</svg>` +
      `<span class="swui-long">${it.label}</span><span class="swui-short">${it.short || it.label}</span>` +
      (it.hot ? '<span class="swui-badge">HOT</span>' : it.badge ? `<span class="swui-badge">${it.badge}</span>` : "") + "</a>";
  });
  html += '<span class="spacer"></span><span class="foot">India chip news · jobs</span>';
  nav.innerHTML = html;
  document.body.appendChild(nav);
  document.body.classList.add("swui-has-rail");
  nav.addEventListener("click", e => {
    const a = e.target.closest("a.swui-item"); if (!a) return;
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "menu-" + a.dataset.k, title: "Side menu: " + a.dataset.k, event: true }); } catch {}
  });
  function paintCurrent(h) {
    nav.querySelectorAll("a.swui-item").forEach(a => {
      const it = ITEMS.find(x => x.key === a.dataset.k);
      if (it.match(page, h)) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("hashchange", () => paintCurrent(location.hash));

  // ---- Fresher jobs link in the category bar ----
  function hotFreshers() {
    document.querySelectorAll('.cats a[href*="#freshers"]').forEach(a => {
      a.classList.add("swui-hotlink");
      if (!/🔥/.test(a.textContent)) a.textContent = "🔥 " + a.textContent.trim();
      if (a.parentNode.firstElementChild !== a) a.parentNode.insertBefore(a, a.parentNode.firstElementChild); // always first, visible on phones
    });
  }
  hotFreshers();
  setTimeout(hotFreshers, 0); // after other scripts add their links

  // ---- circuit background ----
  const bg = document.createElement("div");
  bg.className = "swui-bg";
  bg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g class="t"><path d="M0 40 L110 40 L180 -30 L220 -30"/><path d="M0 107 L40 107 L70 77 L110 77 L140 107 L200 107"/><path d="M0 164 L110 164 L140 134 L280 134 L310 164 L370 164"/><path d="M0 229 L60 229 L90 259 L230 259 L300 329 L360 329"/><path d="M0 297 L140 297 L170 327 L310 327 L380 257 L440 257"/><path d="M0 375 L140 375 L190 425 L330 425 L380 475 L440 475"/><path d="M0 431 L60 431 L130 501 L240 501 L290 551 L430 551"/><path d="M0 494 L140 494 L190 444 L250 444"/><path d="M0 573 L40 573 L90 623 L170 623 L240 693"/><path d="M0 638 L40 638 L110 708 L150 708"/><path d="M0 691 L80 691 L130 741 L240 741 L290 691 L370 691"/><path d="M0 761 L40 761 L70 731 L150 731 L200 681 L310 681"/><path d="M0 837 L60 837 L130 907 L210 907"/><path d="M1440 34 L1300 34 L1250 84 L1140 84 L1110 54"/><path d="M1440 101 L1380 101 L1330 51 L1190 51"/><path d="M1440 167 L1360 167 L1310 117 L1170 117 L1140 147"/><path d="M1440 244 L1400 244 L1350 294 L1240 294 L1190 244 L1080 244"/><path d="M1440 295 L1400 295 L1370 325 L1330 325"/><path d="M1440 370 L1400 370 L1330 300 L1270 300 L1220 250 L1080 250"/><path d="M1440 426 L1380 426 L1350 456 L1270 456"/><path d="M1440 503 L1360 503 L1330 473 L1220 473 L1170 523 L1090 523"/><path d="M1440 560 L1400 560 L1350 610 L1290 610"/><path d="M1440 640 L1380 640 L1350 670 L1210 670"/><path d="M1440 690 L1360 690 L1290 760 L1210 760 L1180 790 L1040 790"/><path d="M1440 773 L1360 773 L1330 743 L1220 743 L1150 673 L1040 673"/><path d="M1440 833 L1400 833 L1350 883 L1270 883 L1220 933 L1140 933"/></g><g class="pad"><circle cx="220" cy="-30" r="5"/><circle cx="200" cy="107" r="5"/><circle cx="370" cy="164" r="5"/><circle cx="360" cy="329" r="5"/><circle cx="440" cy="257" r="5"/><circle cx="440" cy="475" r="5"/><circle cx="430" cy="551" r="5"/><circle cx="250" cy="444" r="5"/><circle cx="240" cy="693" r="5"/><circle cx="150" cy="708" r="5"/><circle cx="370" cy="691" r="5"/><circle cx="310" cy="681" r="5"/><circle cx="210" cy="907" r="5"/><circle cx="1110" cy="54" r="5"/><circle cx="1190" cy="51" r="5"/><circle cx="1140" cy="147" r="5"/><circle cx="1080" cy="244" r="5"/><circle cx="1330" cy="325" r="5"/><circle cx="1080" cy="250" r="5"/><circle cx="1270" cy="456" r="5"/><circle cx="1090" cy="523" r="5"/><circle cx="1290" cy="610" r="5"/><circle cx="1210" cy="670" r="5"/><circle cx="1040" cy="790" r="5"/><circle cx="1040" cy="673" r="5"/><circle cx="1140" cy="933" r="5"/></g><g class="chip"><rect x="102.0" y="202.0" width="56" height="56" rx="6"/><rect class="core" x="118" y="218" width="24" height="24" rx="3"/><path d="M112.0 202.0 v-9 M112.0 258.0 v9 M102.0 212.0 h-9 M158.0 212.0 h9"/><path d="M124.0 202.0 v-9 M124.0 258.0 v9 M102.0 224.0 h-9 M158.0 224.0 h9"/><path d="M136.0 202.0 v-9 M136.0 258.0 v9 M102.0 236.0 h-9 M158.0 236.0 h9"/><path d="M148.0 202.0 v-9 M148.0 258.0 v9 M102.0 248.0 h-9 M158.0 248.0 h9"/></g><g class="chip"><rect x="102.0" y="612.0" width="56" height="56" rx="6"/><rect class="core" x="118" y="628" width="24" height="24" rx="3"/><path d="M112.0 612.0 v-9 M112.0 668.0 v9 M102.0 622.0 h-9 M158.0 622.0 h9"/><path d="M124.0 612.0 v-9 M124.0 668.0 v9 M102.0 634.0 h-9 M158.0 634.0 h9"/><path d="M136.0 612.0 v-9 M136.0 668.0 v9 M102.0 646.0 h-9 M158.0 646.0 h9"/><path d="M148.0 612.0 v-9 M148.0 668.0 v9 M102.0 658.0 h-9 M158.0 658.0 h9"/></g><g class="chip"><rect x="1282.0" y="202.0" width="56" height="56" rx="6"/><rect class="core" x="1298" y="218" width="24" height="24" rx="3"/><path d="M1292.0 202.0 v-9 M1292.0 258.0 v9 M1282.0 212.0 h-9 M1338.0 212.0 h9"/><path d="M1304.0 202.0 v-9 M1304.0 258.0 v9 M1282.0 224.0 h-9 M1338.0 224.0 h9"/><path d="M1316.0 202.0 v-9 M1316.0 258.0 v9 M1282.0 236.0 h-9 M1338.0 236.0 h9"/><path d="M1328.0 202.0 v-9 M1328.0 258.0 v9 M1282.0 248.0 h-9 M1338.0 248.0 h9"/></g><g class="chip"><rect x="1282.0" y="612.0" width="56" height="56" rx="6"/><rect class="core" x="1298" y="628" width="24" height="24" rx="3"/><path d="M1292.0 612.0 v-9 M1292.0 668.0 v9 M1282.0 622.0 h-9 M1338.0 622.0 h9"/><path d="M1304.0 612.0 v-9 M1304.0 668.0 v9 M1282.0 634.0 h-9 M1338.0 634.0 h9"/><path d="M1316.0 612.0 v-9 M1316.0 668.0 v9 M1282.0 646.0 h-9 M1338.0 646.0 h9"/><path d="M1328.0 612.0 v-9 M1328.0 668.0 v9 M1282.0 658.0 h-9 M1338.0 658.0 h9"/></g><g><path class="e g" pathLength="600" style="animation-duration:7s;animation-delay:-0.7s" d="M0 40 L110 40 L180 -30 L220 -30"/><path class="e" pathLength="600" style="animation-duration:5s;animation-delay:-2.0s" d="M0 164 L110 164 L140 134 L280 134 L310 164 L370 164"/><path class="e" pathLength="600" style="animation-duration:6s;animation-delay:-3.0s" d="M0 297 L140 297 L170 327 L310 327 L380 257 L440 257"/><path class="e g" pathLength="600" style="animation-duration:8s;animation-delay:-5.6s" d="M0 431 L60 431 L130 501 L240 501 L290 551 L430 551"/><path class="e" pathLength="600" style="animation-duration:9s;animation-delay:-7.6s" d="M0 573 L40 573 L90 623 L170 623 L240 693"/><path class="e" pathLength="600" style="animation-duration:8s;animation-delay:-8.2s" d="M0 691 L80 691 L130 741 L240 741 L290 691 L370 691"/><path class="e g" pathLength="600" style="animation-duration:7s;animation-delay:-7.2s" d="M0 837 L60 837 L130 907 L210 907"/><path class="e" pathLength="600" style="animation-duration:5s;animation-delay:-7.5s" d="M1440 101 L1380 101 L1330 51 L1190 51"/><path class="e" pathLength="600" style="animation-duration:5s;animation-delay:-8.2s" d="M1440 244 L1400 244 L1350 294 L1240 294 L1190 244 L1080 244"/><path class="e g" pathLength="600" style="animation-duration:6s;animation-delay:-4.3s" d="M1440 370 L1400 370 L1330 300 L1270 300 L1220 250 L1080 250"/><path class="e" pathLength="600" style="animation-duration:6s;animation-delay:-3.9s" d="M1440 503 L1360 503 L1330 473 L1220 473 L1170 523 L1090 523"/><path class="e" pathLength="600" style="animation-duration:7s;animation-delay:-0.8s" d="M1440 640 L1380 640 L1350 670 L1210 670"/><path class="e g" pathLength="600" style="animation-duration:8s;animation-delay:-4.2s" d="M1440 773 L1360 773 L1330 743 L1220 743 L1150 673 L1040 673"/></g></svg>`;
  document.body.insertBefore(bg, document.body.firstChild);
})();
