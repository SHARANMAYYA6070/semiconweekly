// Semicon Weekly – shared sign-in helper for the Interview Prep pages (interview, progress, admin).
// Uses "Sign in with Google". The Google token is checked by our Cloudflare Worker, which returns
// its own 30-day session. Nothing here stores passwords.
window.SWAuth = (function () {
  const C = window.SW_CONFIG || {};
  const API = (C.INTERVIEW_API_URL || "").replace(/\/$/, "");
  const CLIENT_ID = C.GOOGLE_CLIENT_ID || "";
  const KEY = "sw_session";
  const listeners = [];

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } }
  let session = load();
  function save(s) {
    session = s;
    try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch {}
    listeners.forEach(f => { try { f(user()); } catch {} });
  }
  function user() { return session && session.user ? session.user : null; }

  async function api(path, body, opts = {}) {
    if (!API) throw new Error("The interview service is not connected yet.");
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    if (session && session.token) headers["Authorization"] = "Bearer " + session.token;
    const res = await fetch(API + path, { method: body ? "POST" : (opts.method || "GET"), headers, body: body ? JSON.stringify(body) : undefined });
    if (opts.raw) {
      if (!res.ok) throw new Error("Download failed (" + res.status + ")");
      return res;
    }
    let data = {};
    try { data = await res.json(); } catch {}
    if (res.status === 401 && session) save(null); // session expired: show sign-in again
    if (!res.ok) {
      const e = new Error(data.message || data.error || "Could not reach the interview service. Check your internet and try again.");
      e.data = data; e.status = res.status; throw e;
    }
    return data;
  }

  let gisReady = null;
  function loadGis() {
    if (gisReady) return gisReady;
    gisReady = new Promise((resolve, reject) => {
      if (window.google && google.accounts && google.accounts.id) return resolve();
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
      s.onload = () => resolve(); s.onerror = () => reject(new Error("Google sign-in could not load."));
      document.head.appendChild(s);
    }).then(() => {
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async resp => {
          try {
            const d = await api("/auth/google", { credential: resp.credential });
            save({ token: d.token, user: d.user });
          } catch (e) { window.dispatchEvent(new CustomEvent("swauth-error", { detail: e.message })); }
        },
        ux_mode: "popup",
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    });
    return gisReady;
  }

  async function renderButton(el, opts = {}) {
    if (!el || !CLIENT_ID) return false;
    try {
      await loadGis();
      el.replaceChildren();
      google.accounts.id.renderButton(el, { theme: "filled_blue", size: "large", shape: "pill", text: opts.text || "signin_with", logo_alignment: "left", width: opts.width || 240 });
      return true;
    } catch { return false; }
  }

  function signOut() {
    save(null);
    try { google.accounts.id.disableAutoSelect(); } catch {}
  }

  async function download(path, filename) {
    const res = await api(path, null, { raw: true });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  return {
    enabled: !!CLIENT_ID, api, user, signOut, renderButton, download,
    onChange(f) { listeners.push(f); },
  };
})();
