// Site search: opens a panel from any button with data-search and searches every page,
// story, roadmap, company page and all interview questions (search-index.json, built by
// private/news_tools/site_seo.py). Works with the keyboard: arrows to move, Enter to open, Esc to close.
(function () {
  const FALLBACK = [
    ["Fresher jobs", "careers.html#freshers", "Jobs", "fresher intern trainee"],
    ["India chip news: the last 7 days", "news.html", "News", "latest news this week"],
    ["VLSI interview questions", "vlsi-interview-questions.html", "Interview Q&A", "verilog uvm sta cdc"],
    ["AI interview practice bot", "interview.html", "Interview Prep", "mock interview score"],
    ["VLSI career roadmap", "vlsi-career-roadmap.html", "Roadmap", "rtl dv pd dft analog embedded"],
    ["Events", "events.html", "Events", "expo conference hackathon"],
  ];
  const QUICK = [
    ["💼 Fresher jobs", "careers.html#freshers"], ["📰 Last 7 days", "news.html"], ["🎯 AI interview bot", "interview.html"],
    ["📚 Interview Q&A", "vlsi-interview-questions.html"], ["🗺️ Roadmaps", "vlsi-career-roadmap.html"], ["🏢 Companies", "companies.html"],
  ];
  // the site lives at the domain root, so absolute links also work on the 404 page (shown at any address)
  const ROOT = /^https?:$/.test(location.protocol) ? "/" : "";
  let INDEX = null, loading = null;
  function load() {
    if (INDEX) return Promise.resolve(INDEX);
    if (!loading) loading = fetch(ROOT + "search-index.json", { cache: "no-cache" })
      .then(r => { if (!r.ok) throw 0; return r.json(); })
      .then(d => (INDEX = Array.isArray(d) && d.length ? d : FALLBACK))
      .catch(() => (INDEX = FALLBACK));
    return loading;
  }

  const css = `
  .sw-search{position:fixed;inset:0;z-index:1000;background:rgba(5,12,28,.6);display:flex;justify-content:center;align-items:flex-start;
    padding:calc(env(safe-area-inset-top,0px) + 56px) max(12px,env(safe-area-inset-right,0px)) 16px max(12px,env(safe-area-inset-left,0px))}
  .sw-panel{width:100%;max-width:680px;background:var(--paper,#fff);color:var(--ink,#111827);border-radius:12px;box-shadow:0 20px 50px -10px rgba(0,0,0,.45);overflow:hidden;display:flex;flex-direction:column;max-height:calc(100vh - 90px)}
  .sw-head{display:flex;gap:8px;padding:12px;border-bottom:1px solid var(--rule,#d6dbe3);align-items:center}
  .sw-head input{flex:1;min-width:0;font:inherit;font-size:17px;padding:11px 12px;border:1px solid var(--rule,#d6dbe3);border-radius:8px;color:var(--ink,#111827);background:var(--paper,#fff)}
  .sw-head input:focus{outline:2px solid var(--accent,#0aa5c2);outline-offset:0;border-color:transparent}
  .sw-head button{border:0;background:var(--brand,#0b2447);color:#fff;border-radius:8px;padding:0 14px;min-height:44px;font:600 14px var(--sans,sans-serif);cursor:pointer}
  .sw-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:10px 12px 0}
  .sw-tabs button{font:600 13px var(--sans,sans-serif);border:1px solid var(--rule,#d6dbe3);background:transparent;color:var(--ink-2,#374151);border-radius:999px;padding:5px 11px;cursor:pointer;min-height:32px}
  .sw-tabs button[aria-pressed=true]{background:var(--brand,#0b2447);border-color:var(--brand,#0b2447);color:#fff}
  .sw-tabs small{opacity:.7;margin-left:4px;font-weight:500}
  .sw-list{overflow:auto;margin:0;padding:6px 0 8px;list-style:none;flex:1}
  .sw-list a{display:block;padding:10px 16px;color:var(--ink,#111827);text-decoration:none;border-left:3px solid transparent}
  .sw-list a:hover,.sw-list a.on{background:var(--paper-2,#f4f6f9);border-left-color:var(--accent,#0aa5c2)}
  .sw-list small{display:block;font:700 11.5px var(--sans,sans-serif);color:var(--accent,#0aa5c2);letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}
  .sw-list .t{display:block;font-weight:600;line-height:1.35}
  .sw-list .d{display:block;font-size:13.5px;color:var(--ink-3,#6b7280);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sw-list mark{background:rgba(242,184,75,.35);color:inherit;border-radius:2px;padding:0 1px}
  .sw-empty{padding:16px;color:var(--ink-3,#6b7280)}
  .sw-quick{display:flex;flex-wrap:wrap;gap:8px;padding:6px 16px 14px}
  .sw-quick a{border:1px solid var(--rule,#d6dbe3);border-radius:999px;padding:7px 12px;font-size:14px;font-weight:600;color:var(--ink,#111827);text-decoration:none}
  .sw-quick a:hover{border-color:var(--accent,#0aa5c2)}
  .sw-hint{padding:4px 16px 0;font:600 12px var(--sans,sans-serif);color:var(--ink-3,#6b7280);text-transform:uppercase;letter-spacing:.06em}
  .sw-foot{border-top:1px solid var(--rule,#d6dbe3);padding:8px 16px;font-size:12.5px;color:var(--ink-3,#6b7280)}
  @media (max-width:560px){.sw-foot{display:none}.sw-search{padding-top:calc(env(safe-area-inset-top,0px) + 12px)}.sw-panel{max-height:calc(100vh - 30px)}}`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const TYPES = ["All", "News", "Question", "Interview Q&A", "Jobs", "Roadmap", "Companies", "Events"];
  const LABEL = { "Question": "Questions", "Interview Q&A": "Q&A pages" };
  const norm = t => (t || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[‘’]/g, "'").replace(/[–—]/g, "-");
  const esc = t => t.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function mark(text, words) {
    let out = esc(text);
    words.forEach(w => { if (w.length < 2) return; out = out.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); });
    return out;
  }
  function search(q) {
    const words = norm(q).split(/[^a-z0-9+#'&.-]+/).map(w => w.replace(/^[.-]+|[.-]+$/g, "")).filter(Boolean);
    if (!words.length) return { words, hits: [] };
    const hits = [];
    INDEX.forEach((r, i) => {
      const t = norm(r[0]), hay = t + " " + norm(r[2]) + " " + norm(r[3]) + " " + norm(r[1]);
      if (!words.every(w => hay.includes(w))) return;
      let sc = 0;
      words.forEach(w => { if (t.includes(w)) sc += 3; if (new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(t)) sc += 2; });
      if (t.startsWith(words[0])) sc += 2;
      if (r[2] === "News") sc += 1;
      if (r[2] !== "Question") sc += 1;
      hits.push([sc, i, r]);
    });
    hits.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    return { words, hits: hits.map(h => h[2]) };
  }

  let overlay = null, lastFocus = null;
  function close() { if (overlay) { overlay.remove(); overlay = null; document.documentElement.style.overflow = ""; if (lastFocus) lastFocus.focus(); } }
  function open(initial) {
    if (overlay) return;
    lastFocus = document.activeElement;
    overlay = document.createElement("div");
    overlay.className = "sw-search";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Search the site");
    overlay.innerHTML = '<div class="sw-panel"><div class="sw-head"><input type="search" placeholder="Search news, jobs, questions, roadmaps…" aria-label="Search" autocomplete="off" enterkeyhint="search"><button type="button">Close</button></div>' +
      '<div class="sw-tabs" role="group" aria-label="Filter results" hidden></div><ul class="sw-list" role="listbox"></ul>' +
      '<div class="sw-foot">↑ ↓ to move · Enter to open · Esc to close</div></div>';
    document.body.appendChild(overlay);
    document.documentElement.style.overflow = "hidden";
    const input = overlay.querySelector("input"), list = overlay.querySelector(".sw-list"), tabs = overlay.querySelector(".sw-tabs");
    let type = "All", sel = -1;
    function links() { return [...list.querySelectorAll("a[data-r]")]; }
    function move(d) {
      const ls = links(); if (!ls.length) return;
      sel = (sel + d + ls.length) % ls.length;
      ls.forEach((a, i) => { a.classList.toggle("on", i === sel); a.setAttribute("aria-selected", String(i === sel)); });
      ls[sel].scrollIntoView({ block: "nearest" });
    }
    function render() {
      sel = -1;
      list.textContent = "";
      const q = input.value.trim();
      if (!q) {
        tabs.hidden = true;
        const li = document.createElement("li");
        li.innerHTML = '<div class="sw-hint">Popular</div><div class="sw-quick">' + QUICK.map(x => '<a href="' + ROOT + x[1] + '">' + x[0] + "</a>").join("") + "</div>" +
          '<div class="sw-empty" style="padding-top:0">Try: <i>setup time</i>, <i>UVM</i>, <i>Tata</i>, <i>Qualcomm jobs</i>, <i>DFT roadmap</i>…</div>';
        list.appendChild(li);
        return;
      }
      if (!INDEX) { list.innerHTML = '<li class="sw-empty">Loading…</li>'; return; }
      const { words, hits } = search(q);
      const count = {}; hits.forEach(r => { count[r[2]] = (count[r[2]] || 0) + 1; });
      const shownTypes = TYPES.filter(t => t === "All" || count[t]);
      if (type !== "All" && !count[type]) type = "All";
      tabs.hidden = !hits.length || shownTypes.length < 3;
      tabs.innerHTML = shownTypes.map(t => '<button type="button" data-t="' + t + '" aria-pressed="' + (t === type) + '">' + (LABEL[t] || t) + "<small>" + (t === "All" ? hits.length : count[t]) + "</small></button>").join("");
      const list2 = (type === "All" ? hits : hits.filter(r => r[2] === type)).slice(0, 40);
      if (!list2.length) {
        list.innerHTML = '<li class="sw-empty">No results for “' + esc(q) + '”. Try fewer or simpler words, like <i>jobs</i>, <i>Verilog</i> or <i>Tata</i>.</li>';
        return;
      }
      list2.forEach(r => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        const href = ROOT + (r[1] === "./" ? "" : r[1]);
        const d = r[3];
        li.innerHTML = '<a data-r href="' + esc(href || "./") + '"><small>' + esc(r[2] === "Question" ? "Interview question" : r[2]) + "</small>" +
          '<span class="t">' + mark(r[0], words) + "</span>" + (d ? '<span class="d">' + mark(d, words) + "</span>" : "") + "</a>";
        list.appendChild(li);
      });
      if (hits.length > list2.length && type === "All") {
        const li = document.createElement("li"); li.className = "sw-empty"; li.textContent = "Showing the top 40. Add another word to narrow it down."; list.appendChild(li);
      }
    }
    input.addEventListener("input", render);
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { const ls = links(); const a = ls[sel >= 0 ? sel : 0]; if (a) { e.preventDefault(); location.href = a.href; close(); } }
    });
    tabs.addEventListener("click", e => { const b = e.target.closest("button[data-t]"); if (b) { type = b.dataset.t; render(); input.focus(); } });
    overlay.querySelector(".sw-head button").addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    overlay.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    list.addEventListener("click", e => { const a = e.target.closest("a"); if (a && a.hash && a.pathname === location.pathname) close(); });
    if (initial) input.value = initial;
    render();
    load().then(() => { if (overlay) render(); });
    input.focus();
  }
  document.addEventListener("click", e => {
    if (e.target.closest("[data-search]")) { e.preventDefault(); open(); }
  });
  document.addEventListener("keydown", e => {
    if (overlay) return;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if ((e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag) && !document.activeElement.isContentEditable) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); open(); }
  });
  // ?q=... opens search with that text (handy for links)
  try { const q = new URLSearchParams(location.search).get("q"); if (q) document.addEventListener("DOMContentLoaded", () => open(q)); } catch (e) {}
  window.SWSearch = { open: open };
})();
