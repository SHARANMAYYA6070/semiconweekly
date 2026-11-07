// =====================================================================
//  Semicon Weekly – Interview Prep launch promotion
//  Adds to every page (except interview.html):
//    1. gold launch bar at the very top        (can be closed, returns after 3 days)
//    2. "Interview Prep NEW" link in the menus
//    3. Grand-opening pop-up                    (once per visitor, max 2 times, 7 days apart)
//    4. floating "Practice interview" button
//    5. page cards: homepage "Question of the day", careers banner, end-of-story card
//  Every click is counted in GoatCounter as an event named promo-<place>.
//  To switch the whole promotion off, set PROMO_ON: false in config.js.
// =====================================================================
(function () {
  if (window.__swPromo) return;
  window.__swPromo = true;

  const C = window.SW_CONFIG || {};
  if (C.PROMO_ON === false) return;

  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const onBot = ["interview.html", "progress.html", "admin.html"].includes(page);
  const BOT = "interview.html";
  const QCOUNT = 181;                 // shown in the pop-up
  const TOPICS = "Verilog, SystemVerilog, UVM, STA, CDC, physical design and more";

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const DAY = 86400000;
  const usedBot = store.get("ip_history", []).length > 0;

  function track(name) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "promo-" + name, title: "Promo click: " + name, event: true }); } catch {}
  }
  function botLink(ref, extra) { return BOT + "?ref=" + ref + (extra ? "&" + extra : ""); }
  function el(tag, attrs, html) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ---------- styles ----------
  const css = `
  .swp-bar{background:linear-gradient(90deg,#f5b82e,#ffd666 50%,#f5b82e);color:#1a1300;font:500 15px/1.35 var(--sans,Roboto,sans-serif);position:relative;z-index:50}
  .swp-bar .wrap{display:flex;align-items:center;justify-content:center;gap:12px;padding-block:9px;text-align:center;flex-wrap:wrap}
  .swp-bar b.tag{background:#0b2447;color:#fff;font:700 11px/1 var(--sans,Roboto,sans-serif);letter-spacing:.1em;padding:5px 8px;border-radius:4px}
  .swp-bar a.go{background:#0b2447;color:#fff;font:600 14px/1 var(--slab,Georgia,serif);padding:8px 14px;border-radius:6px;white-space:nowrap}
  .swp-bar a.go:hover{background:#12366b}
  .swp-bar .x{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;font-size:22px;line-height:1;cursor:pointer;color:#1a1300;padding:4px 8px}
  @media(max-width:640px){.swp-bar{font-size:13.5px}.swp-bar .wrap{padding-right:34px;justify-content:flex-start;text-align:left;flex-wrap:nowrap;gap:8px}.swp-bar .long,.swp-bar b.tag{display:none}.swp-bar a.go{padding:7px 10px;font-size:13px}}

  .swp-new{display:inline-block;background:#f5b82e;color:#1a1300;font:700 10px/1 var(--sans,Roboto,sans-serif);letter-spacing:.08em;padding:3px 5px;border-radius:3px;margin-left:6px;vertical-align:3px}
  .mainnav a.swp-nav{color:#ffd666 !important;font-weight:600}
  .cats a.swp-cat{color:#ffd666 !important;font-weight:600}

  .swp-fab{position:fixed;right:18px;bottom:18px;z-index:60;display:flex;align-items:center;gap:10px;background:#0b2447;color:#fff;
    font:600 16px/1 var(--slab,Georgia,serif);padding:13px 18px 13px 14px;border-radius:999px;box-shadow:0 10px 28px -8px rgba(11,36,71,.6),0 2px 6px rgba(0,0,0,.15);
    border:2px solid #f5b82e;transition:transform .15s}
  .swp-fab:hover{transform:translateY(-2px)}
  .swp-fab .ico{width:30px;height:30px;border-radius:50%;background:#f5b82e;color:#0b2447;display:grid;place-items:center;font-size:17px;position:relative}
  .swp-fab .ico::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid #f5b82e;animation:swpPulse 2s infinite}
  .swp-fab small{display:block;font:500 11px/1.2 var(--sans,Roboto,sans-serif);color:#ffd666;margin-top:3px;letter-spacing:.04em}
  @keyframes swpPulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.6);opacity:0}}
  @media(max-width:640px){.swp-fab{right:12px;bottom:12px;padding:10px 14px 10px 10px;font-size:14px}.swp-fab small{display:none}}

  .swp-ov{position:fixed;inset:0;z-index:100;background:rgba(6,17,36,.62);display:grid;place-items:center;padding:16px;animation:swpFade .25s ease}
  .swp-pop{position:relative;width:100%;max-width:520px;max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:14px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);animation:swpUp .35s cubic-bezier(.2,.9,.3,1.2)}
  .swp-pop .swp-top{background:#0b2447;color:#fff;padding:26px 26px 22px;position:relative;overflow:hidden}
  .swp-pop .swp-ribbon{display:inline-block;background:#f5b82e;color:#1a1300;font:800 12px/1 var(--sans,Roboto,sans-serif);letter-spacing:.14em;padding:7px 11px;border-radius:4px}
  .swp-pop h2{font:800 clamp(26px,5vw,34px)/1.12 var(--serif,Georgia,serif);margin:14px 0 8px;color:#fff}
  .swp-pop h2 span{color:#ffd666}
  .swp-pop .swp-top p{color:#c9d6ee;font:400 16px/1.5 var(--sans,Roboto,sans-serif);margin:0}
  .swp-pop .swp-body{padding:20px 26px 24px}
  .swp-pop .swp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
  .swp-pop .swp-stats div{background:#f4f6f9;border-radius:8px;padding:10px;text-align:center;font:500 12.5px/1.3 var(--sans,Roboto,sans-serif);color:#4b5563}
  .swp-pop .swp-stats b{display:block;font:800 22px/1.1 var(--serif,Georgia,serif);color:#0b2447}
  .swp-pop .swp-how{list-style:none;margin:0 0 18px;padding:0;font:400 15px/1.45 var(--sans,Roboto,sans-serif);color:#111827}
  .swp-pop .swp-how li{padding:5px 0 5px 28px;position:relative}
  .swp-pop .swp-how li::before{content:"✓";position:absolute;left:4px;color:#059669;font-weight:800}
  .swp-pop .swp-cta{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .swp-pop .swp-cta a{background:#f5b82e;color:#1a1300;font:700 17px/1 var(--slab,Georgia,serif);padding:14px 20px;border-radius:8px;flex:1;text-align:center;min-width:220px}
  .swp-pop .swp-cta a:hover{background:#ffcb4d}
  .swp-pop .swp-cta button{background:none;border:0;color:#6b7280;font:500 14px var(--sans,Roboto,sans-serif);cursor:pointer;padding:10px}
  .swp-pop .swp-fine{font:400 12.5px/1.4 var(--sans,Roboto,sans-serif);color:#6b7280;margin-top:12px}
  .swp-pop .swp-close{position:absolute;right:10px;top:10px;z-index:2;background:rgba(255,255,255,.12);color:#fff;border:0;width:34px;height:34px;border-radius:50%;font-size:22px;line-height:1;cursor:pointer}
  .swp-pop .swp-close:hover{background:rgba(255,255,255,.25)}
  .swp-conf{position:absolute;inset:0;pointer-events:none}
  .swp-conf i{position:absolute;top:-12px;width:8px;height:14px;border-radius:2px;opacity:.9;animation:swpFall 2.6s ease-in forwards}
  @keyframes swpFall{to{transform:translateY(260px) rotate(540deg);opacity:0}}
  @keyframes swpFade{from{opacity:0}}
  @keyframes swpUp{from{transform:translateY(30px) scale(.96);opacity:0}}

  .swp-card{border:2px solid #f5b82e;border-radius:10px;background:#fffbea;padding:16px 18px;margin:0 0 24px}
  .swp-card .k{font:700 12px/1 var(--sans,Roboto,sans-serif);letter-spacing:.1em;text-transform:uppercase;color:#92400e}
  .swp-card h3{font:700 19px/1.3 var(--serif,Georgia,serif);margin:8px 0 6px;color:#111827}
  .swp-card p{font:400 14.5px/1.5 var(--sans,Roboto,sans-serif);color:#4b5563;margin:0 0 12px}
  .swp-card a.btn{display:inline-block;background:#0b2447;color:#fff;font:600 15px/1 var(--slab,Georgia,serif);padding:11px 16px;border-radius:6px}
  .swp-card a.btn:hover{background:#12366b}
  .swp-card .q{background:#fff;border-left:4px solid #0b2447;padding:10px 12px;border-radius:0 6px 6px 0;font:500 15.5px/1.45 var(--slab,Georgia,serif);color:#111827;margin:8px 0 12px}
  .swp-card .qmeta{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
  .swp-card .qtag{font:600 12px/1 var(--sans,sans-serif);background:#fff;border:1px solid #e9d8a6;color:#7c2d12;padding:5px 8px;border-radius:999px}
  .swp-streak{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin:2px 0 12px;padding:10px 12px;background:#fff;border-radius:10px;border:1px solid #f1e3b5}
  .swp-streak b{font:700 14.5px/1.2 var(--sans,sans-serif);color:#9a3412}
  .swp-streak small{display:block;font:500 12px/1.3 var(--sans,sans-serif);color:#6b7280;margin-top:2px}
  .swp-dots{display:flex;gap:4px;flex:none}
  .swp-dots i{width:18px;height:18px;border-radius:50%;background:#f3f4f6;border:1px solid #e5e7eb;font:700 9px/16px var(--sans,sans-serif);color:#9ca3af;text-align:center;font-style:normal}
  .swp-dots i.on{background:#f59e0b;border-color:#f59e0b;color:#fff}
  .swp-dots i.today{outline:2px solid #7c3aed;outline-offset:1px}
  .swp-qbtns{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .swp-card a.btn2,.swp-card button.btn2{display:inline-block;background:transparent;border:1px solid #d6c79a;color:#374151;font:600 14px/1 var(--sans,sans-serif);padding:10px 12px;border-radius:8px;cursor:pointer}
  .swp-card button.btn2.done{border-color:#16a34a;color:#15803d;background:#f0fdf4;cursor:default}
  html[data-theme="dark"] body .swp-card:not(.swp-wide){background:#1d1434;border-color:rgba(250,204,21,.45)}
  html[data-theme="dark"] body .swp-card .k{color:#fde68a}html[data-theme="dark"] body .swp-card p{color:#c9c0de}
  html[data-theme="dark"] body .swp-card .q{background:rgba(255,255,255,.05);color:#efeaf8}
  html[data-theme="dark"] .swp-streak,html[data-theme="dark"] .swp-card .qtag{background:rgba(255,255,255,.06);border-color:rgba(250,204,21,.25);color:#fde68a}
  html[data-theme="dark"] .swp-streak b{color:#fde68a}html[data-theme="dark"] .swp-streak small{color:#c9c0de}
  html[data-theme="dark"] .swp-dots i{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15);color:#9d93b8}
  html[data-theme="dark"] .swp-dots i.on{background:#f59e0b;border-color:#f59e0b;color:#1c1530}
  html[data-theme="dark"] .swp-card a.btn2,html[data-theme="dark"] .swp-card button.btn2{border-color:rgba(255,255,255,.25);color:#efeaf8}
  html[data-theme="dark"] .swp-card button.btn2.done{background:rgba(22,163,74,.15);border-color:#22c55e;color:#86efac}
  .swp-wide{display:flex;gap:18px;align-items:center;flex-wrap:wrap;background:#0b2447;border:0;color:#fff}
  .swp-wide h3{color:#fff;margin-top:6px}
  .swp-wide p{color:#c9d6ee;margin:0}
  .swp-wide .k{color:#ffd666}
  .swp-wide > div{flex:1;min-width:240px}
  .swp-wide a.btn{background:#f5b82e;color:#1a1300}
  .swp-wide a.btn:hover{background:#ffcb4d}

  @media (prefers-reduced-motion: reduce){.swp-fab .ico::after,.swp-ov,.swp-pop,.swp-conf i{animation:none}}
  `;
  document.head.appendChild(el("style", { id: "swp-css" }, css));

  // ---------- 2. menu links (every page, including the bot page) ----------
  const mainnav = document.querySelector(".mainnav");
  if (mainnav) {
    let a = mainnav.querySelector('a[href="interview.html"]');
    if (!a) {
      mainnav.appendChild(el("span", { class: "sep" }, "|"));
      a = el("a", { href: "interview.html" }, "Interview Prep");
      mainnav.appendChild(a);
    }
    a.addEventListener("click", () => track("menu"));
  }

  if (onBot) return; // the bot page itself gets only the menu highlight

  // 1. launch bar and 4. floating button were removed in the Nov 2026 clean-up (Interview Prep stays in the menu and homepage).

  // ---------- 5. page cards ----------
  const QOTD = [
    ["Verilog", "What is the difference between blocking (=) and non-blocking (<=) assignments?"],
    ["RTL Design", "What causes an inferred latch, and how do you avoid it?"],
    ["SystemVerilog", "What is the difference between fork-join, join_any and join_none?"],
    ["UVM", "Why is build_phase top-down while connect_phase is bottom-up?"],
    ["SVA", "Explain the difference between |-> and |=> in assertions."],
    ["RTL Design", "How does a 2-flop synchronizer reduce metastability?"],
    ["Verilog", "Difference between case, casez and casex?"],
    ["SystemVerilog", "What is a clocking block, and why does it remove races?"],
    ["UVM", "What happens if an objection is raised but never dropped?"],
    ["RTL Design", "Write clock 100 MHz, read clock 50 MHz, burst of 120 words. Minimum FIFO depth?"],
  ];
  const dayNo = Math.floor((Date.now() + 5.5 * 3600000) / DAY);
  const [qTopic, qText] = QOTD[dayNo % QOTD.length];
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Daily VLSI question with a streak (homepage). One question per day (India time) from all 181 questions
  // in search-index.json; the streak counts days in a row you answered, kept only in this browser.
  if (page === "index.html" || page === "") {
    const aside = document.querySelector('aside[aria-label="Jobs and events"]');
    if (aside) {
      const ist = t => new Date(t + 5.5 * 3600000).toISOString().slice(0, 10);
      const today = ist(Date.now());
      const getDays = () => { const d = store.get("sw_qotd_days", []); return Array.isArray(d) ? d : []; };
      function streakInfo() {
        const set = new Set(getDays()); let n = 0, t = Date.now();
        if (!set.has(today)) t -= DAY;                  // not answered yet today: count up to yesterday
        while (set.has(ist(t))) { n++; t -= DAY; }
        return { n, doneToday: set.has(today), set };
      }
      function markDone() {
        const d = getDays(); if (!d.includes(today)) { d.push(today); store.set("sw_qotd_days", d.slice(-60)); }
        paintStreak(); track("qotd-done");
      }
      const card = el("div", { class: "swp-card", id: "qotd" });
      aside.insertBefore(card, aside.firstChild);
      function paintStreak() {
        const box = card.querySelector(".swp-streak"); if (!box) return;
        const { n, doneToday, set } = streakInfo();
        const head = doneToday ? `🔥 ${n}-day streak · done for today ✓` : n ? `🔥 ${n}-day streak` : "Start a streak today";
        const sub = doneToday ? "Come back tomorrow for a new question." : n ? "Answer today's question to keep it going." : "Answer one question a day. Miss a day and it starts again.";
        const L = ["S", "M", "T", "W", "T", "F", "S"];
        let dots = "";
        for (let k = 6; k >= 0; k--) { const t = Date.now() - k * DAY, key = ist(t), wd = new Date(t + 5.5 * 3600000).getUTCDay();
          dots += `<i class="${set.has(key) ? "on" : ""}${k === 0 ? " today" : ""}" title="${key}">${L[wd]}</i>`; }
        box.innerHTML = `<div><b>${head}</b><small>${sub}</small></div><div class="swp-dots" aria-hidden="true">${dots}</div>`;
        const db = card.querySelector("button.btn2");
        if (db) { db.textContent = doneToday ? "✓ Answered today" : "✓ I answered it"; db.classList.toggle("done", doneToday); db.disabled = doneToday; }
      }
      function paint(q) {
        card.innerHTML = `<div class="qmeta"><div class="k">🎯 Today's VLSI question</div>${q.topic ? `<span class="qtag">${esc(q.topic)}</span>` : ""}</div>` +
          `<div class="q">${esc(q.text)}</div><div class="swp-streak" role="status"></div>` +
          `<div class="swp-qbtns"><a class="btn" href="${esc(q.bot)}">Answer with AI →</a>` +
          (q.page ? `<a class="btn2" href="${esc(q.page)}">See model answer</a>` : "") +
          `<button type="button" class="btn2">✓ I answered it</button></div>`;
        card.querySelector("a.btn").addEventListener("click", () => { markDone(); track("home-qotd"); });
        const pa = card.querySelector("a.btn2"); if (pa) pa.addEventListener("click", () => track("qotd-answer"));
        card.querySelector("button.btn2").addEventListener("click", markDone);
        paintStreak();
      }
      // start with the built-in list, then switch to the full question bank when it loads
      paint({ text: qText, topic: qTopic, bot: botLink("qotd", "topic=" + encodeURIComponent(qTopic) + "&mode=drill"), page: "" });
      fetch("search-index.json").then(r => r.ok ? r.json() : null).then(d => {
        const qs = (d || []).filter(r => r[2] === "Question" && r[0]).sort((a, b) => a[1] < b[1] ? -1 : 1);
        if (qs.length < 20) return;
        const r = qs[(dayNo * 37) % qs.length];             // 37 is co-prime with the bank size, so topics rotate
        const topic = (r[3] || "").split(" ")[0] === "Static" ? "STA" : (r[3] || "").replace(/\s+(easy|medium|hard)\b.*$/i, "").trim();
        const bot = r[4] ? r[4].replace(/ref=[^&]*/, "ref=qotd") : botLink("qotd", "mode=drill");
        const tm = /[?&]topic=([^&]+)/.exec(r[4] || "");
        paint({ text: r[0], topic: tm ? decodeURIComponent(tm[1].replace(/\+/g, " ")) : topic.split(" ").slice(0, 3).join(" "), bot, page: r[1] });
      }).catch(() => {});
    }
  }
  if (page === "careers.html") {
    const main = document.querySelector("main");
    if (main) {
      const card = el("div", { class: "swp-card swp-wide", style: "margin-top:20px" },
        `<div><div class="k">Applied? Now get ready.</div><h3>Practise the interview before the real one</h3>` +
        `<p>${QCOUNT} real VLSI questions on ${TOPICS}. Free AI scoring with model answers.</p></div>` +
        `<a class="btn" href="${botLink("careers")}">Start a mock interview →</a>`);
      card.querySelector("a").addEventListener("click", () => track("careers"));
      const after = main.querySelector("#experienced") || main.querySelector("#freshers");
      if (after && after.parentNode) after.parentNode.insertBefore(card, after.nextSibling); else main.appendChild(card);
    }
  }
  const story = document.querySelector("article.story");
  if (story && page.startsWith("story-")) {
    const card = el("div", { class: "swp-card swp-wide", style: "margin:28px 0 8px" },
      `<div><div class="k">Want to work in chips?</div><h3>Test yourself with a real VLSI interview question</h3>` +
      `<p>Free practice bot · scored out of 10 · see what you missed.</p></div>` +
      `<a class="btn" href="${botLink("story")}">Try one question →</a>`);
    card.querySelector("a").addEventListener("click", () => track("story"));
    story.appendChild(card);
  }

  // ---------- 3. grand-opening pop-up (switched off in the Nov 2026 clean-up; delete the next line to bring it back) ----------
  return;
  const pop = store.get("swp_pop", { n: 0, last: 0, clicked: false });
  const popAllowed = !usedBot && !pop.clicked && pop.n < 2 && Date.now() - pop.last > 7 * DAY
    && !/[?&]nopopup/.test(location.search);
  if (!popAllowed) return;

  let shown = false;
  function showPopup(trigger) {
    if (shown) return; shown = true;
    cleanup();
    store.set("swp_pop", { n: pop.n + 1, last: Date.now(), clicked: false });
    const lastFocus = document.activeElement;
    const ov = el("div", { class: "swp-ov" });
    const box = el("div", { class: "swp-pop", role: "dialog", "aria-modal": "true", "aria-labelledby": "swp-h" },
      `<button class="swp-close" aria-label="Close">×</button>
       <div class="swp-top"><div class="swp-conf" aria-hidden="true"></div>
         <span class="swp-ribbon">🎉 GRAND OPENING</span>
         <h2 id="swp-h">Can you crack a <span>VLSI interview?</span></h2>
         <p>Meet the new Semicon Weekly Interview Practice Bot. Answer like you would in the real interview and find out where you stand.</p>
       </div>
       <div class="swp-body">
         <div class="swp-stats"><div><b>${QCOUNT}</b>real questions</div><div><b>10/10</b>instant score</div><div><b>Free</b>during beta</div></div>
         <ul class="swp-how">
           <li>${TOPICS}</li>
           <li>See what you covered, what you missed, and the model answer</li>
           <li>5-question mock interview with a strong/weak topic summary</li>
         </ul>
         <div class="swp-cta"><a href="${botLink("popup")}">Start my free mock interview →</a><button type="button" class="swp-later">Maybe later</button></div>
         <p class="swp-fine">No sign-up needed. 10 free answers a day.</p>
       </div>`);
    ov.appendChild(box);
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";

    // a little confetti
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const conf = box.querySelector(".swp-conf");
      const colors = ["#f5b82e", "#ffd666", "#0aa5c2", "#ffffff", "#db2777"];
      for (let i = 0; i < 26; i++) {
        const p = el("i");
        p.style.left = Math.random() * 100 + "%";
        p.style.background = colors[i % colors.length];
        p.style.animationDelay = (Math.random() * 0.8) + "s";
        conf.appendChild(p);
      }
    }

    function close() {
      ov.remove(); document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") { // keep focus inside the pop-up
        const f = box.querySelectorAll("a,button"); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    ov.addEventListener("click", e => { if (e.target === ov) close(); });
    box.querySelector(".swp-close").addEventListener("click", close);
    box.querySelector(".swp-later").addEventListener("click", close);
    box.querySelector(".swp-cta a").addEventListener("click", () => {
      store.set("swp_pop", { n: pop.n + 1, last: Date.now(), clicked: true });
      track("popup");
    });
    box.querySelector(".swp-cta a").focus();
    track("popup-shown-" + trigger);
  }

  // show after 8 s, or when the reader has scrolled 45% of the page, or (desktop) when the mouse leaves toward the tabs
  const timer = setTimeout(() => showPopup("time"), 8000);
  function onScroll() {
    const h = document.documentElement;
    if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.45) showPopup("scroll");
  }
  function onLeave(e) { if (e.clientY <= 0) showPopup("exit"); }
  addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("mouseout", onLeave);
  function cleanup() { clearTimeout(timer); removeEventListener("scroll", onScroll); document.removeEventListener("mouseout", onLeave); }
})();
