// Site search: opens a panel from any button with data-search, and filters a small index of every page.
(function () {
  const INDEX = [
    ["India clears ₹1.25 lakh crore for Chip Mission 2.0", "story-ism2.html", "News", "ism semiconductor mission policy government budget design"],
    ["Tata's chip plant will need 450 suppliers", "story-tata-suppliers.html", "News", "tata dholera gujarat fab vendor park suppliers"],
    ["What is tape-out? The big day in a chip's life", "story-tapeout.html", "News", "tapeout tape-out masks gdsii signoff respin"],
    ["Chip design vs chip making: which jobs are for freshers?", "story-design-vs-making.html", "News", "pick of the week careers fresher design making fab"],
    ["Embedded World India 2026, 17–19 Nov, Bengaluru", "events.html#embedded-world-india", "Event", "bengaluru tech summit biec expo embedded iot"],
    ["VLSID 2027 conference and Tape-Out Contest", "events.html#vlsid-2027", "Event", "vlsi design conference tapeout contest january"],
    ["SEMICON India: next edition March 2028", "events.html#semicon-india", "Event", "semicon expo delhi yashobhoomi semi"],
    ["Learn Verilog free: NPTEL course", "events.html#learn-verilog", "Event", "verilog nptel course free beginner hdl"],
    ["Past hackathons: CircuitAvishkar, ChipVerse, ChipMonk, ITC India", "events.html#past", "Event", "hackathon student competition"],
    ["Fresher jobs", "careers.html#freshers", "Jobs", "fresher intern trainee firmware embedded physical design meta maxvy evolute"],
    ["Experienced jobs", "careers.html#experienced", "Jobs", "nvidia intel arm texas instruments onsemi chiplogic pcie uvm verification"],
    ["What is a semiconductor?", "learn.html", "Learn", "basics silicon chip wafer fab osat words"],
    ["Where chips are used (15 uses)", "uses.html", "Uses", "phones cars solar led 5g ai space defence railways payments farming wearables"],
    ["About Semicon Weekly", "about.html", "Page", "about who we are rules"],
    ["Contact us", "contact.html", "Page", "contact email recruiters sponsor"],
    ["Privacy", "privacy.html", "Page", "privacy email data cookies"],
  ];

  const css = `
  .sw-search{position:fixed;inset:0;z-index:50;background:rgba(5,12,28,.55);display:flex;justify-content:center;align-items:flex-start;
    padding:calc(env(safe-area-inset-top,0px) + 60px) max(16px,env(safe-area-inset-right,0px)) 16px max(16px,env(safe-area-inset-left,0px))}
  .sw-panel{width:100%;max-width:640px;background:#fff;border-radius:10px;box-shadow:0 20px 50px -10px rgba(0,0,0,.4);overflow:hidden}
  .sw-head{display:flex;gap:8px;padding:12px;border-bottom:1px solid #d6dbe3}
  .sw-head input{flex:1;min-width:0;font:inherit;font-size:18px;padding:10px 12px;border:1px solid #d6dbe3;border-radius:6px;color:#111827;background:#fff}
  .sw-head button{border:0;background:#0b2447;color:#fff;border-radius:6px;padding:0 14px;font:inherit;cursor:pointer}
  .sw-list{max-height:60vh;overflow:auto;margin:0;padding:6px 0;list-style:none}
  .sw-list a{display:block;padding:10px 16px;color:#111827}
  .sw-list a:hover,.sw-list a:focus{background:#f4f6f9;outline:none}
  .sw-list small{display:block;font-size:12px;color:#0aa5c2;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
  .sw-empty{padding:16px;color:#6b7280}`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  let overlay = null;
  function render(q, list) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = INDEX.filter(r => {
      const hay = (r[0] + " " + r[2] + " " + r[3]).toLowerCase();
      return words.every(w => hay.includes(w));
    });
    list.innerHTML = "";
    if (!hits.length) {
      const li = document.createElement("li");
      li.className = "sw-empty";
      li.textContent = "No results. Try words like jobs, tape-out, Tata or Verilog.";
      list.appendChild(li);
      return;
    }
    hits.forEach(r => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = r[1];
      const s = document.createElement("small");
      s.textContent = r[2];
      a.appendChild(s);
      a.appendChild(document.createTextNode(r[0]));
      li.appendChild(a);
      list.appendChild(li);
    });
  }
  function close() { if (overlay) { overlay.remove(); overlay = null; } }
  function open() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "sw-search";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Search the site");
    overlay.innerHTML = '<div class="sw-panel"><div class="sw-head"><input id="sw-q" type="search" placeholder="Search news, events, jobs…" aria-label="Search"><button type="button">Close</button></div><ul class="sw-list"></ul></div>';
    document.body.appendChild(overlay);
    const input = overlay.querySelector("input"), list = overlay.querySelector(".sw-list");
    render("", list);
    input.addEventListener("input", () => render(input.value, list));
    overlay.querySelector("button").addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    overlay.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    list.addEventListener("click", e => { if (e.target.closest("a")) close(); });
    input.focus();
  }
  document.addEventListener("click", e => {
    if (e.target.closest("[data-search]")) { e.preventDefault(); open(); }
  });
})();
