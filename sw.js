// Connects the site to Substack, the Google Sheet (jobs + news) and contact links set in config.js.
(function () {
  const C = window.SW_CONFIG || {};
  const isUrl = u => typeof u === "string" && /^https:\/\//.test(u.trim());
  const $ = s => document.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const link = (href, text, cls) => { const a = el("a", cls, text); a.href = href; if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; } return a; };

  // ---------- Email sign-up (Substack) ----------
  document.querySelectorAll("form#signup").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const email = (form.querySelector("input[type=email]") || {}).value || "";
      const msg = form.querySelector(".form-msg");
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) { msg.textContent = "Please enter a valid email, like name@gmail.com."; return; }
      if (!isUrl(C.SUBSTACK_URL)) { msg.textContent = "Sign-ups open very soon. Please check back."; return; }
      const url = C.SUBSTACK_URL.replace(/\/+$/, "") + "/subscribe?email=" + encodeURIComponent(email.trim());
      const a = link(url, ""); document.body.appendChild(a); a.click(); a.remove();
      msg.textContent = "Opening Substack. Confirm there to finish signing up.";
    });
  });

  // ---------- Social links ----------
  const social = { "WhatsApp channel": C.WHATSAPP_URL, "LinkedIn": C.LINKEDIN_URL, "Telegram": C.TELEGRAM_URL, "YouTube": C.YOUTUBE_URL, "Instagram": C.INSTAGRAM_URL };
  const box = $(".social");
  if (box) {
    let any = false;
    box.querySelectorAll("a[aria-label]").forEach(a => {
      const u = social[a.getAttribute("aria-label")];
      if (isUrl(u)) { a.href = u; a.target = "_blank"; a.rel = "noopener"; any = true; } else a.hidden = true;
    });
    if (!any) box.hidden = true;
  }

  // ---------- Contact page ----------
  const cbox = $("#contact-box");
  if (cbox && (C.CONTACT_EMAIL || isUrl(C.CONTACT_FORM_URL))) {
    cbox.textContent = "";
    if (C.CONTACT_EMAIL) {
      const p = el("p", null, "Email: ");
      const b = el("b", null, C.CONTACT_EMAIL); p.appendChild(b);
      const btn = el("button", "tab", "Copy"); btn.type = "button"; btn.style.marginLeft = "10px";
      btn.addEventListener("click", () => {
        (navigator.clipboard ? navigator.clipboard.writeText(C.CONTACT_EMAIL) : Promise.reject())
          .then(() => { btn.textContent = "Copied"; })
          .catch(() => { const r = document.createRange(); r.selectNodeContents(b); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
      });
      p.appendChild(btn); cbox.appendChild(p);
    }
    if (isUrl(C.CONTACT_FORM_URL)) {
      const p = el("p"); p.appendChild(link(C.CONTACT_FORM_URL, "Send us a message →", "go-btn")); cbox.appendChild(p);
    }
  }

  // ---------- CSV helpers ----------
  function parseCSV(text) {
    const rows = []; let row = [], f = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    const head = (rows.shift() || []).map(h => h.trim().toLowerCase());
    return rows.filter(r => r.some(x => x.trim())).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }
  const getCSV = url => fetch(url, { cache: "no-store" }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(parseCSV);
  const hasCols = (rows, ...cols) => rows.length > 0 && cols.every(c => c in rows[0]);
  const active = r => !/^(no|closed|n)$/i.test(r.active || "yes");

  // ---------- Jobs from the Google Sheet ----------
  function jobCard(j) {
    const card = el("article", "jcard");
    const h = el("h3"); h.appendChild(isUrl(j.link) ? link(j.link, j.title) : el("span", null, j.title)); card.appendChild(h);
    card.appendChild(el("div", "co", [j.company, j.location].filter(Boolean).join(" · ")));
    const row = el("div", "row"); row.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-top:8px";
    if (j.experience) row.appendChild(el("span", "chip hot", j.experience));
    (j.skills || "").split(/[,;]/).map(s => s.trim()).filter(Boolean).slice(0, 4).forEach(s => row.appendChild(el("span", "chip", s)));
    card.appendChild(row);
    if (j.description) card.appendChild(el("p", null, j.description));
    const foot = el("div", "foot");
    foot.appendChild(el("span", "posted", j.posted ? "Posted " + j.posted : ""));
    if (isUrl(j.link)) foot.appendChild(link(j.link, "View and apply →", "applyb"));
    card.appendChild(foot);
    return card;
  }
  function jobMini(j) {
    const d = el("div", "job");
    const b = el("b"); b.appendChild(isUrl(j.link) ? link(j.link, j.title) : el("span", null, j.title)); d.appendChild(b);
    d.appendChild(el("span", "co", [j.company, j.location].filter(Boolean).join(" · ")));
    const row = el("div", "row");
    if (j.experience) row.appendChild(el("span", "chip hot", j.experience));
    (j.skills || "").split(/[,;]/).map(s => s.trim()).filter(Boolean).slice(0, 2).forEach(s => row.appendChild(el("span", "chip", s)));
    d.appendChild(row);
    if (isUrl(j.link)) d.appendChild(link(j.link, "View and apply →", "apply"));
    return d;
  }
  if (isUrl(C.JOBS_CSV_URL)) {
    getCSV(C.JOBS_CSV_URL).then(rows => {
      if (!hasCols(rows, "type", "title", "link")) return; // wrong tab: keep jobs on the page
      const jobs = rows.filter(r => r.title && active(r));
      const fresh = jobs.filter(j => /fresh|intern|trainee/i.test(j.type));
      const exp = jobs.filter(j => !/fresh|intern|trainee/i.test(j.type));
      const fill = (sel, list, make, max) => { const t = $(sel); if (!t || !list.length) return; t.textContent = ""; list.slice(0, max).forEach(j => t.appendChild(make(j))); };
      fill("#freshers", fresh, jobCard, 100);
      fill("#experienced", exp, jobCard, 100);
      fill("#jobs-fresh", fresh, jobMini, 3);
      fill("#jobs-exp", exp, jobMini, 3);
      const tf = $("#t-fresh small"), te = $("#t-exp small");
      if (tf && fresh.length) tf.textContent = "0–1 year · " + fresh.length + " openings";
      if (te && exp.length) te.textContent = "1+ years · " + exp.length + " openings";
      const dl = $("#jobs-count");
      if (dl && jobs.length) dl.textContent = jobs.length + " real openings";
    }).catch(() => { /* keep the jobs already on the page */ });
  }

  // ---------- News (In Short) from the Google Sheet ----------
  if (isUrl(C.NEWS_CSV_URL)) {
    getCSV(C.NEWS_CSV_URL).then(rows => {
      if (!hasCols(rows, "title", "summary")) return; // wrong tab: keep stories on the page
      const items = rows.filter(r => r.title && active(r)).reverse().slice(0, 6);
      const box = $("#daily-view");
      if (!box || !items.length) return;
      box.textContent = "";
      items.forEach(n => {
        const art = el("article", "short");
        const target = n.story_link || n.source_link || "#in-short";
        if (isUrl(n.image_link) || /^img\/[\w.-]+$/.test(n.image_link || "")) {
          const pic = link(target, "", "pic"); const img = el("img"); img.src = n.image_link; img.alt = n.title; img.loading = "lazy"; pic.appendChild(img); art.appendChild(pic);
        } else {
          const art2 = link(target, "", "art a-design"); art2.style.minHeight = "160px";
          art2.appendChild(el("span", "cap", n.category || "News")); art.appendChild(art2);
        }
        const body = el("div");
        const h = el("h3"); h.appendChild(link(target, n.title)); body.appendChild(h);
        const by = el("div", "byline"); by.appendChild(el("b", null, "short")); by.appendChild(document.createTextNode(" by Semicon Weekly" + (n.date ? " / " + n.date : ""))); body.appendChild(by);
        body.appendChild(el("p", "body", n.summary || ""));
        if (isUrl(n.source_link)) { const s = el("span", "src", "read more at "); s.appendChild(link(n.source_link, n.source_name || "source")); body.appendChild(s); }
        art.appendChild(body);
        box.appendChild(art);
      });

      // ----- Top News: newest story as the lead, next two as side stories -----
      const KIND = { policy: "policy", company: "company", companies: "company", fab: "fab", fabs: "fab", "fabs and factories": "fab", "chip design": "design", design: "design", explainer: "design", jobs: "jobs", events: "event", event: "event" };
      const kind = c => KIND[(c || "").trim().toLowerCase()] || "design";
      const isImg = u => isUrl(u) || /^img\/[\w.-]+$/.test(u || "");
      const lead = $(".top .lead");
      if (lead) {
        const n = items[0], target = n.story_link || n.source_link || "#in-short";
        lead.textContent = "";
        if (isImg(n.image_link)) {
          const pic = link(target, "", "pic pic-lead"); const img = el("img"); img.src = n.image_link; img.alt = n.title; pic.appendChild(img); lead.appendChild(pic);
        } else {
          const a = link(target, "", "art a-" + kind(n.category)); a.style.cssText = "aspect-ratio:16/8;max-width:500px"; a.appendChild(el("span", "cap", n.category || "News")); lead.appendChild(a);
        }
        lead.appendChild(el("span", "kicker k-" + kind(n.category), [n.category, n.date].filter(Boolean).join(" · ")));
        const h = el("h3"); h.appendChild(link(target, n.title)); lead.appendChild(h);
        lead.appendChild(el("p", null, n.summary || ""));
        if (n.why) { const w = el("p", "why"); w.appendChild(el("b", null, "Why it matters for you: ")); w.appendChild(document.createTextNode(n.why)); lead.appendChild(w); }
        if (isUrl(n.source_link)) { const sr = el("p", "byline"); sr.appendChild(document.createTextNode("Source: ")); sr.appendChild(link(n.source_link, n.source_name || "read more")); lead.appendChild(sr); }
      }
      const sides = [...document.querySelectorAll(".top .side article")].slice(0, 2);
      items.slice(1, 3).forEach((n, i) => {
        const slot = sides[i]; if (!slot) return;
        const target = n.story_link || n.source_link || "#in-short";
        slot.textContent = "";
        const t = el("div"); t.appendChild(el("span", "kicker k-" + kind(n.category), n.category || "News"));
        const h = el("h3"); h.appendChild(link(target, n.title)); t.appendChild(h); slot.appendChild(t);
        if (isImg(n.image_link)) { const a = link(target, "", "art"); a.style.padding = "0"; const img = el("img", "thumb-img"); img.src = n.image_link; img.alt = n.title; a.appendChild(img); slot.appendChild(a); }
        else { const a = link(target, "", "art a-" + kind(n.category)); slot.appendChild(a); }
      });
    }).catch(() => { /* keep the stories already on the page */ });
  }

  // ---------- Visitor counter (GoatCounter) ----------
  if (/^[a-z0-9-]+$/i.test(C.GOATCOUNTER_CODE || "")) {
    const g = document.createElement("script");
    g.async = true;
    g.src = "https://gc.zgo.at/count.js";
    g.setAttribute("data-goatcounter", "https://" + C.GOATCOUNTER_CODE + ".goatcounter.com/count");
    document.head.appendChild(g);
  }

  // ---------- Events from the Google Sheet ----------
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parseDay = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s || "").trim()); return m ? { y: +m[1], m: +m[2], d: +m[3], t: Date.UTC(+m[1], +m[2] - 1, +m[3]) } : null; };
  const slug = t => (t || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  function dateBox(ev) {
    const a = parseDay(ev.start_date), b = parseDay(ev.end_date);
    if (ev.date_label || !a) {
      const parts = (ev.date_label || "TBA").split(" ");
      return [parts[0], parts.slice(1).join(" ")];
    }
    if (b && (b.m !== a.m || b.y !== a.y)) return [a.d + "–" + b.d, MONTHS[a.m - 1] + "–" + MONTHS[b.m - 1] + " " + b.y];
    return [b && b.d !== a.d ? a.d + "–" + b.d : String(a.d), MONTHS[a.m - 1] + " " + a.y];
  }
  function eventCard(ev, past) {
    const art = el("article", "ev-card" + (past ? " past" : ""));
    art.id = slug(ev.title);
    const top = el("div", "ev-top");
    const [big, small] = dateBox(ev);
    const box = el("div", "ev-date"); box.appendChild(el("b", null, big)); box.appendChild(document.createTextNode(small));
    top.appendChild(box);
    const head = el("div");
    head.appendChild(el("h3", null, ev.title));
    if (ev.place) head.appendChild(el("div", "ev-meta", ev.place));
    if (ev.type) { const tg = el("div", "ev-tags"); tg.appendChild(el("span", "chip", ev.type)); head.appendChild(tg); }
    top.appendChild(head); art.appendChild(top);
    const dl = el("dl");
    [["What it is", ev.summary], [past ? "What happened" : "What happens", ev.what_happens], ["Who should go", ev.who], ["Why go", ev.why], ["How to register", ev.how_to_register]]
      .forEach(([k, v]) => { if (v) { dl.appendChild(el("dt", null, k)); dl.appendChild(el("dd", null, v)); } });
    art.appendChild(dl);
    if (isUrl(ev.link)) art.appendChild(link(ev.link, (ev.link_label || "Official page") + " →", "go-btn"));
    return art;
  }
  if (isUrl(C.EVENTS_CSV_URL)) {
    getCSV(C.EVENTS_CSV_URL).then(rows => {
      if (!hasCols(rows, "start_date", "title")) return; // wrong tab: keep events on the page
      const now = new Date(), today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const evs = rows.filter(r => r.title && active(r));
      if (!evs.length) return;
      const endOf = r => (parseDay(r.end_date) || parseDay(r.start_date) || { t: Infinity }).t;
      const startOf = r => (parseDay(r.start_date) || { t: Infinity }).t;
      const upcoming = evs.filter(r => endOf(r) >= today).sort((a, b) => startOf(a) - startOf(b));
      const past = evs.filter(r => endOf(r) < today).sort((a, b) => startOf(b) - startOf(a));
      const up = $("#ev-upcoming"), pa = $("#ev-past");
      if (up) { up.textContent = ""; upcoming.forEach(r => up.appendChild(eventCard(r, false))); }
      if (pa) { pa.textContent = ""; past.forEach(r => pa.appendChild(eventCard(r, true))); }
      const home = $("#home-events");
      if (home && upcoming.length) {
        home.textContent = "";
        upcoming.slice(0, 3).forEach(r => {
          const a = link("events.html#" + slug(r.title), "", "ev");
          const [big, small] = dateBox(r);
          const d = el("div", "d"); d.appendChild(el("b", null, big)); d.appendChild(document.createTextNode(small.split(" ")[0]));
          const t = el("div"); t.appendChild(el("h4", null, r.title)); t.appendChild(el("p", null, [r.place, r.type].filter(Boolean).join(" · ")));
          a.appendChild(d); a.appendChild(t); home.appendChild(a);
        });
      }
      if (location.hash) { const target = document.getElementById(location.hash.slice(1)); if (target) target.scrollIntoView(); }
    }).catch(() => { /* keep the events already on the page */ });
  }
})();
