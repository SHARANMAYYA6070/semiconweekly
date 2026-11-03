// Connects the site to MailerLite (email sign-up), the Google Sheet (jobs + news) and contact links set in config.js.
(function () {
  const C = window.SW_CONFIG || {};
  const isUrl = u => typeof u === "string" && /^https:\/\//.test(u.trim());
  const $ = s => document.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const link = (href, text, cls) => { const a = el("a", cls, text); a.href = href; if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; } return a; };

  // ---------- Today's date in the top strip (India time) ----------
  const dl = document.querySelector(".dateline .wrap > span");
  if (dl) {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const week = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
    dl.textContent = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(/^(\w+),?/, "$1,") + " · Week " + week;
  }

  // ---------- Email sign-up (MailerLite, stays on this page) ----------
  // window.SWSubscribe(email) -> Promise<{ ok: boolean, text: string }>. Used by the footer form and the Follow menu.
  window.SWSubscribe = async function (raw) {
    const email = String(raw || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, text: "Please enter a valid email, like name@gmail.com." };
    const acc = String(C.MAILERLITE_ACCOUNT_ID || "").trim(), form = String(C.MAILERLITE_FORM_ID || "").trim();
    if (!/^\d+$/.test(acc) || !/^\d+$/.test(form)) return { ok: false, text: "Email sign-ups open very soon. Follow our WhatsApp channel meanwhile." };
    const body = new FormData();
    body.append("fields[email]", email); body.append("ml-submit", "1"); body.append("anticsrf", "true");
    try {
      const r = await fetch("https://assets.mailerlite.com/jsonp/" + acc + "/forms/" + form + "/subscribe", { method: "POST", body });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.success !== false) {
        try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "email-signup", title: "Email sign-up", event: true }); } catch {}
        return { ok: true, text: "You're in ✓ Check your inbox (and Promotions tab) for our email." };
      }
      return { ok: false, text: "That didn't work. Please check the email and try again." };
    } catch { return { ok: false, text: "Couldn't connect. Please try again in a minute." }; }
  };
  document.querySelectorAll("form#signup").forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const input = form.querySelector("input[type=email]"), msg = form.querySelector(".form-msg"), btn = form.querySelector("button");
      if (btn) btn.disabled = true; msg.textContent = "Signing you up…";
      const res = await window.SWSubscribe(input ? input.value : "");
      msg.textContent = res.text; if (btn) btn.disabled = false;
      if (res.ok && input) input.value = "";
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
  // deadline: "deadline" column (2026-12-15 or 15 Dec 2026), else "Apply before 15 Dec 2026" in the description
  const MON3 = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const MNAME = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dayOf(str) {
    const s = String(str || "").trim(); let m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s))) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    if ((m = /(\d{1,2})\s+([a-z]{3})[a-z]*\.?,?\s+(\d{4})/i.exec(s)) && MON3[m[2].toLowerCase()] != null) return Date.UTC(+m[3], MON3[m[2].toLowerCase()], +m[1]);
    return null;
  }
  const todayIST = (() => { const n = new Date(Date.now() + 5.5 * 36e5); return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()); })();
  function deadlineOf(j) {
    if (j.deadline) return dayOf(j.deadline);
    const m = /(?:apply\s+(?:before|by)|last\s+date[:\s]*|closes?\s+(?:on\s+)?)\s*(\d{1,2}\s+[a-z]{3,}\.?,?\s+\d{4})/i.exec(j.description || "");
    return m ? dayOf(m[1]) : null;
  }
  const daysLeft = j => { const d = deadlineOf(j); return d == null ? null : Math.round((d - todayIST) / 864e5); };
  const isFeatured = j => /^(yes|y|true|1)$/i.test(j.featured || "");
  function deadlineBadge(j) {
    const n = daysLeft(j); if (n == null || n < 0) return null;
    const d = new Date(deadlineOf(j));
    const txt = n === 0 ? "⏰ Closes today" : n === 1 ? "⏰ Closes tomorrow" : n <= 7 ? "⏰ Closes in " + n + " days" : "Apply by " + d.getUTCDate() + " " + MNAME[d.getUTCMonth()];
    return el("span", "chip " + (n <= 7 ? "due-soon" : "due"), txt);
  }
  const jobOpen = j => { const n = daysLeft(j); return n == null || n >= 0; };
  const jobSort = list => list.map((j, i) => ({ j, i })).sort((a, b) => (isFeatured(b.j) - isFeatured(a.j)) || (a.i - b.i)).map(x => x.j);
  if (!document.getElementById("sw-job-badges")) {
    const st = document.createElement("style"); st.id = "sw-job-badges";
    st.textContent = ".chip.due{background:#e0f2fe;color:#075985}.chip.due-soon{background:#fee2e2;color:#b91c1c;font-weight:600}" +
      ".chip.feat{background:linear-gradient(160deg,#ffd666,#f5a524);color:#1a1300;font-weight:700}" +
      ".jcard.featured{border-color:#f5b82e;box-shadow:0 0 0 1px #f5b82e,0 10px 26px -16px rgba(245,165,36,.8)}" +
      ".job.featured{background:#fffaeb;border-radius:8px;padding:8px 10px}";
    document.head.appendChild(st);
  }
  function jobCard(j) {
    const card = el("article", "jcard" + (isFeatured(j) ? " featured" : ""));
    const h = el("h3"); h.appendChild(isUrl(j.link) ? link(j.link, j.title) : el("span", null, j.title)); card.appendChild(h);
    card.appendChild(el("div", "co", [j.company, j.location].filter(Boolean).join(" · ")));
    const row = el("div", "row"); row.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-top:8px";
    if (isFeatured(j)) row.appendChild(el("span", "chip feat", "★ Featured"));
    const dbg = deadlineBadge(j); if (dbg) row.appendChild(dbg);
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
    const d = el("div", "job" + (isFeatured(j) ? " featured" : ""));
    const b = el("b"); b.appendChild(isUrl(j.link) ? link(j.link, j.title) : el("span", null, j.title)); d.appendChild(b);
    d.appendChild(el("span", "co", [j.company, j.location].filter(Boolean).join(" · ")));
    const row = el("div", "row");
    const dbm = deadlineBadge(j); if (dbm && /due-soon/.test(dbm.className)) row.appendChild(dbm);
    if (j.experience) row.appendChild(el("span", "chip hot", j.experience));
    (j.skills || "").split(/[,;]/).map(s => s.trim()).filter(Boolean).slice(0, 2).forEach(s => row.appendChild(el("span", "chip", s)));
    d.appendChild(row);
    if (isUrl(j.link)) d.appendChild(link(j.link, "View and apply →", "apply"));
    return d;
  }
  if (isUrl(C.JOBS_CSV_URL)) {
    getCSV(C.JOBS_CSV_URL).then(rows => {
      if (!hasCols(rows, "type", "title", "link")) return; // wrong tab: keep jobs on the page
      const jobs = jobSort(rows.filter(r => r.title && active(r) && jobOpen(r)));
      window.SW_JOBS = jobs;
      // company pages: <section id="company-jobs" data-match="qualcomm|qcom">
      const cbox = $("#company-jobs");
      if (cbox) {
        const re = new RegExp(cbox.dataset.match || "^$", "i");
        const mine = jobs.filter(j => re.test(j.company || ""));
        if (mine.length) { cbox.textContent = ""; mine.forEach(j => cbox.appendChild(jobCard(j))); }
        else { cbox.textContent = ""; const p = el("p", "note-box"); p.appendChild(document.createTextNode("No open roles from this company on our list right now. ")); p.appendChild(link("careers.html#freshers", "See all fresher jobs →")); cbox.appendChild(p); }
        const cc = $("#company-count"); if (cc) cc.textContent = mine.length ? mine.length + (mine.length > 1 ? " open roles" : " open role") : "No open roles today";
      }
      document.querySelectorAll("[data-co-count]").forEach(b => {
        const re = new RegExp(b.dataset.coCount, "i"), n = jobs.filter(j => re.test(j.company || "")).length;
        b.textContent = n ? n + (n > 1 ? " open roles" : " open role") : "No roles today"; b.classList.toggle("zero", !n);
      });
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
      // newest first: sort by the date column, then by row order (lower rows are newer)
      const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
      const toDay = s => { const m = /(\d{1,2})\s+([a-z]{3})[a-z]*\s+(\d{4})/i.exec(s || ""); return m && MON[m[2].toLowerCase()] != null ? Date.UTC(+m[3], MON[m[2].toLowerCase()], +m[1]) : 0; };
      const all = rows.map((r, i) => ({ r, i, t: toDay(r.date) })).filter(x => x.r.title && active(x.r))
        .sort((a, b) => (b.t - a.t) || (b.i - a.i)).map(x => Object.assign(x.r, { _t: x.t }));
      const items = all.slice(0, 8);
      const box = $("#daily-view");
      if (!items.length) return;
      // ----- News archive page: last 7 days, grouped by day -----
      const arch = $("#news-archive");
      if (arch) {
        const DN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const recent = all.filter(n => n._t && n._t >= todayIST - 6 * 864e5 && n._t <= todayIST + 864e5);
        arch.textContent = "";
        if (!recent.length) arch.appendChild(el("p", "note-box", "No new stories in the last 7 days. Check back soon."));
        const days = new Map();
        recent.forEach(n => { if (!days.has(n._t)) days.set(n._t, []); days.get(n._t).push(n); });
        days.forEach((list, t) => {
          const d = new Date(t), diff = Math.round((todayIST - t) / 864e5);
          const sec = el("section", "arch-day");
          const h = el("h2", null, (diff === 0 ? "Today" : diff === 1 ? "Yesterday" : DN[d.getUTCDay()]) + " · " + d.getUTCDate() + " " + MNAME[d.getUTCMonth()]);
          h.appendChild(el("small", null, list.length + (list.length > 1 ? " stories" : " story"))); sec.appendChild(h);
          list.forEach(n => {
            const target = n.story_link || n.source_link || "#";
            const a = el("article", "arch-item");
            if (isUrl(n.image_link) || /^img\/[\w.-]+$/.test(n.image_link || "")) { const pic = link(target, "", "arch-pic"); const img = el("img"); img.src = n.image_link; img.alt = ""; img.loading = "lazy"; pic.appendChild(img); a.appendChild(pic); }
            else a.appendChild(link(target, "", "arch-pic art a-design"));
            const b = el("div");
            b.appendChild(el("span", "kicker k-design", n.category || "News"));
            const h3 = el("h3"); h3.appendChild(link(target, n.title)); b.appendChild(h3);
            b.appendChild(el("p", null, n.summary || ""));
            if (isUrl(n.source_link)) { const s2 = el("span", "src", "Source: "); s2.appendChild(link(n.source_link, n.source_name || "read more")); b.appendChild(s2); }
            a.appendChild(b); sec.appendChild(a);
          });
          arch.appendChild(sec);
        });
        const ac = $("#archive-count"); if (ac) ac.textContent = recent.length + " stories this week";
      }
      if (!box) return;
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

      // ----- Weekly tab: every story, grouped by week (Mon–Sun), newest week first -----
      const wbox = $("#weekly-view");
      if (wbox) {
        wbox.textContent = "";
        const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], fmt = t => { const d = new Date(t); return d.getUTCDate() + " " + MN[d.getUTCMonth()]; };
        const groups = new Map();
        all.forEach(n => {
          let key = "Older stories", label = "Older stories";
          if (n._t) {
            const d = new Date(n._t), mon = n._t - ((d.getUTCDay() + 6) % 7) * 864e5, sun = mon + 6 * 864e5;
            const th = new Date(mon + 3 * 864e5), wk = Math.ceil(((th - Date.UTC(th.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
            key = String(mon); label = "Week " + wk + " · " + fmt(mon) + " – " + fmt(sun) + " " + new Date(sun).getUTCFullYear();
          }
          if (!groups.has(key)) groups.set(key, { label, list: [] });
          groups.get(key).list.push(n);
        });
        groups.forEach(g => {
          const sec = el("article", "short"); sec.style.gridTemplateColumns = "minmax(0,1fr)";
          const inner = el("div");
          const k = el("span", "kicker k-design", g.label + " · " + g.list.length + (g.list.length > 1 ? " stories" : " story")); inner.appendChild(k);
          const ul = el("ul"); ul.style.cssText = "list-style:none;margin:12px 0 0;padding:0;display:grid;gap:12px";
          g.list.forEach(n => {
            const target = n.story_link || n.source_link || "#in-short";
            const li = el("li"); li.style.cssText = "display:grid;grid-template-columns:96px minmax(0,1fr);gap:12px;align-items:center";
            if (isUrl(n.image_link) || /^img\/[\w.-]+$/.test(n.image_link || "")) {
              const a = link(target, ""); const img = el("img"); img.src = n.image_link; img.alt = ""; img.loading = "lazy";
              img.style.cssText = "width:96px;height:60px;object-fit:cover;border-radius:6px;display:block"; a.appendChild(img); li.appendChild(a);
            } else {
              const a = link(target, "", "art a-design"); a.style.cssText = "width:96px;height:60px;min-height:0;border-radius:6px"; li.appendChild(a);
            }
            const t = el("div");
            t.appendChild(el("span", "kicker k-" + ({ policy: "policy", companies: "company", company: "company", fabs: "fab", fab: "fab", jobs: "jobs", events: "event" }[(n.category || "").toLowerCase()] || "design"), (n.category || "News") + (n.date ? " · " + n.date : "")));
            const h = el("div"); h.style.cssText = "font-weight:700;line-height:1.35;margin-top:2px"; h.appendChild(link(target, n.title)); t.appendChild(h);
            li.appendChild(t); ul.appendChild(li);
          });
          inner.appendChild(ul); sec.appendChild(inner); wbox.appendChild(sec);
        });
      }

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
