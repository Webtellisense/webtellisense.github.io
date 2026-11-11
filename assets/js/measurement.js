/* Consent-first Heroes measurement. No purchase/lead conversions, customer fields,
 * payment references, arbitrary URLs or pre-consent event queue. No GTM installation.
 */
(() => {
  "use strict";
  if (window.WTSMeasurement) return;
  const config = window.WTS_MEASUREMENT || {};
  const path = location.pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/";
  if (/^\/(?:heroes-welcome|heroes-profile-received|welcome)(?:$|\/)/.test(path)) return;
  const mode = config.pages?.[path];
  const production = ["webtellisense.com", "www.webtellisense.com"].includes(location.hostname);
  const privacySignal = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1";
  const conflict = () => [...document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"],script[src*="googletagmanager.com/gtag/js"],script[src*="connect.facebook.net/"][src*="fbevents.js"]')].some(s => !s.dataset.wtsMeasurement)
    || Boolean(window.gtag && !gaLoaded) || Boolean(window.fbq && !metaLoaded)
    || Object.keys(window.google_tag_manager || {}).some(id => id.startsWith("GTM-"));
  const version = config.consentVersion;
  const key = "wts-measurement-choice";
  const safeLocation = "https://webtellisense.com" + path;
  let choice = { analytics: false, marketing: false };
  let gaLoaded = false, metaLoaded = false, gaReady = false, metaReady = false;
  let gaPageSent = false, metaPageSent = false, opener;
  let pendingGA = [], pendingMeta = [];
  const eligible = () => config.releaseApproved === true && production && !privacySignal() && !conflict();
  const active = () => eligible() && ["marketing", "interactions"].includes(mode);
  const events = new Set(["heroes_period_select", "heroes_tier_select", "heroes_talk_to_sales", "heroes_call_click", "heroes_whatsapp_click", "heroes_paystack_handoff"]);
  const sanitize = input => {
    const params = { page_path: path };
    if (["v1", "v2", "v3"].includes(input.tier)) params.tier = input.tier;
    if (["monthly", "three", "six"].includes(input.period)) params.period = input.period;
    if (["call", "whatsapp", "email", "contact"].includes(input.channel)) params.channel = input.channel;
    return params;
  };
  const load = (src, done) => {
    const script = document.createElement("script");
    script.async = true; script.src = src; script.referrerPolicy = "no-referrer";
    script.dataset.wtsMeasurement = "true";
    script.addEventListener("load", done); document.head.append(script);
  };
  // Meta can read the document URL itself. Drop all query/fragment data before
  // either SDK loads; only the fixed canonical path is passed to GA explicitly.
  const cleanURL = () => { if (location.search || location.hash) history.replaceState(null, "", location.pathname); };
  function clearCookies(provider) {
    const names = document.cookie.split(";").map(c => c.split("=")[0].trim()).filter(name => provider === "ga" ? name === "_ga" || name === "_ga_" + config.ga4.slice(2) : /^_fb[pc]$/.test(name));
    for (const name of names) for (const domain of ["", location.hostname, "." + location.hostname, "webtellisense.com", ".webtellisense.com"])
      document.cookie = `${name}=; Max-Age=0; path=/;${domain ? " domain=" + domain + ";" : ""} SameSite=Lax; Secure`;
  }
  function revoke() {
    if (!choice.analytics || privacySignal()) {
      pendingGA = []; clearCookies("ga");
      if (gaLoaded) {
        window["ga-disable-" + config.ga4] = true;
        window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      }
    }
    if (!choice.marketing || privacySignal()) {
      pendingMeta = []; clearCookies("meta");
      if (metaLoaded) window.fbq("consent", "revoke");
    }
  }
  function sendGA(name, params) { window.gtag("event", name, { ...params, page_location: safeLocation, page_referrer: "" }); }
  function readyGA() {
    if (!active() || !choice.analytics || !gaReady) return;
    if (mode === "marketing" && !gaPageSent) { gaPageSent = true; sendGA("page_view", { page_path: path }); }
    const queued = pendingGA; pendingGA = []; queued.forEach(([name, params]) => sendGA(name, params));
  }
  function readyMeta() {
    if (!active() || !choice.marketing || !metaReady) return;
    if (mode === "marketing" && !metaPageSent) { metaPageSent = true; window.fbq("trackSingle", config.metaPixel, "PageView"); }
    const queued = pendingMeta; pendingMeta = []; queued.forEach(([name, params]) => window.fbq("trackSingleCustom", config.metaPixel, name, params));
  }
  function start() {
    if (!active()) return;
    if (choice.analytics && /^G-[A-Z0-9]+$/.test(config.ga4 || "")) {
      window["ga-disable-" + config.ga4] = false;
      if (!gaLoaded) {
        gaLoaded = true; cleanURL();
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        window.gtag("js", new Date());
        window.gtag("config", config.ga4, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: safeLocation, page_referrer: "", page_title: document.title });
        load("https://www.googletagmanager.com/gtag/js?id=" + config.ga4, () => { gaReady = true; revoke(); readyGA(); });
      }
      window.gtag("consent", "update", { analytics_storage: "granted" });
      readyGA();
    }
    // Meta reads document.referrer; suppress it if an incoming URL could disclose
    // query/fragment data. No guesswork about which incoming parameter is safe.
    if (choice.marketing && !/[?#]/.test(document.referrer) && /^\d{10,20}$/.test(config.metaPixel || "")) {
      if (!metaLoaded) {
        metaLoaded = true; cleanURL();
        const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
        fbq.queue = []; fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; window._fbq = fbq;
        fbq("consent", "grant"); fbq("set", "autoConfig", false, config.metaPixel);
        fbq("init", config.metaPixel); // No advanced-matching/customer arguments.
        load("https://connect.facebook.net/en_US/fbevents.js", () => { metaReady = true; revoke(); readyMeta(); });
      } else window.fbq("consent", "grant");
      readyMeta();
    }
  }
  function track(name, input = {}) {
    if (!active() || !events.has(name)) return;
    const params = sanitize(input);
    if (choice.analytics && gaLoaded) {
      if (gaReady) sendGA(name, params);
      else if (pendingGA.length < 20) pendingGA.push([name, params]);
    }
    if (choice.marketing && metaLoaded) {
      if (metaReady) window.fbq("trackSingleCustom", config.metaPixel, name, params);
      else if (pendingMeta.length < 20) pendingMeta.push([name, params]);
    }
  }
  const parse = value => {
    try {
      const saved = JSON.parse(value);
      if (saved?.version === version) return { analytics: saved.analytics === true, marketing: saved.marketing === true };
    } catch { /* Invalid/blocked storage cannot provide consent. */ }
    return null;
  };
  function save(next) {
    choice = { analytics: next.analytics === true && eligible(), marketing: next.marketing === true && eligible() && Boolean(config.metaPixel) };
    try { localStorage.setItem(key, JSON.stringify({ ...choice, version })); } catch { /* Consent lasts for this document only. */ }
    revoke(); start(); dialog.hidden = true;
    if (opener?.isConnected) opener.focus();
  }
  const dialog = document.createElement("section");
  dialog.className = "measurement-choice"; dialog.hidden = true;
  dialog.setAttribute("aria-label", "Optional measurement choices");
  const title = document.createElement("h2"); title.textContent = "Your choice, before optional tracking.";
  const copy = document.createElement("p");
  const updateCopy = () => {
    copy.textContent = privacySignal() ? "Your browser privacy setting keeps optional measurement off."
      : !eligible() ? "Optional measurement is unavailable on this visit. You can keep it off."
      : (mode ? "" : "These choices apply to Heroes. ") + "Allow Google Analytics to measure visits and button use, Meta Pixel for advertising measurement, or neither. These providers receive device and network information. All features work with tracking off.";
  };
  updateCopy(); dialog.append(title, copy);
  const link = document.createElement("a"); link.href = "/privacy-policy#measurement"; link.textContent = "Read our Privacy Policy"; dialog.append(link);
  const analytics = document.createElement("input"), marketing = document.createElement("input");
  for (const [field, text] of [[analytics, " Allow analytics"], [marketing, " Allow advertising measurement"]]) {
    field.type = "checkbox"; const label = document.createElement("label"); label.append(field, document.createTextNode(text)); dialog.append(label);
  }
  const syncControls = () => {
    analytics.checked = choice.analytics && !privacySignal(); marketing.checked = choice.marketing && !privacySignal();
    analytics.disabled = !eligible(); marketing.disabled = !eligible() || !config.metaPixel; updateCopy();
  };
  const actions = document.createElement("div");
  for (const [label, handler] of [["Keep optional tracking off", () => save({})], ["Save my choices", () => save({ analytics: analytics.checked, marketing: marketing.checked })]]) {
    const button = document.createElement("button"); button.type = "button"; button.textContent = label; button.addEventListener("click", handler); actions.append(button);
  }
  dialog.append(actions); document.body.append(dialog);
  document.querySelectorAll("[data-measurement-settings]").forEach(button => {
    button.hidden = false;
    button.addEventListener("click", () => { opener = button; syncControls(); dialog.hidden = !dialog.hidden; if (!dialog.hidden) actions.querySelector("button").focus(); });
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !dialog.hidden) { dialog.hidden = true; opener?.focus(); } });
  let saved;
  try { saved = parse(localStorage.getItem(key)); } catch { /* No persisted permission. */ }
  if (saved) choice = saved;
  else if (active() && mode === "marketing") dialog.hidden = false;
  if (privacySignal()) { choice = { analytics: false, marketing: false }; dialog.hidden = true; }
  syncControls();
  if (mode) revoke(); // Unrelated pages must not clear legacy cookies on arrival.
  start();
  window.addEventListener("storage", event => {
    if (event.key !== key && event.key !== null) return;
    choice = parse(event.newValue) || { analytics: false, marketing: false };
    revoke(); start(); syncControls();
  });
  document.addEventListener("visibilitychange", () => { if (privacySignal()) { revoke(); syncControls(); } });
  window.WTSMeasurement = Object.freeze({ track });
  if (!["marketing", "interactions"].includes(mode)) return;
  document.addEventListener("change", event => {
    if (event.target.matches('input[name="billing-view"],#heroes-period')) track("heroes_period_select", { period: event.target.value });
    if (event.target.matches("#heroes-tier,#scope-tier-choice")) track("heroes_tier_select", { tier: event.target.value });
  });
  document.addEventListener("click", event => {
    const target = event.target.closest("a,[data-view-tier]"); if (!target) return;
    if (target.dataset.viewTier) return track("heroes_tier_select", { tier: target.dataset.viewTier });
    const href = target.getAttribute("href") || "";
    let channel;
    if (/^tel:/.test(href)) { channel = "call"; track("heroes_call_click", { channel }); }
    if (/^https:\/\/wa\.me\//.test(href)) { channel = "whatsapp"; track("heroes_whatsapp_click", { channel }); }
    if (/^mailto:/.test(href)) channel = "email";
    if (/^(?:\/contact(?:\.html)?(?:$|#)|#contact$)/.test(href)) channel = "contact";
    if (channel && (/talk|discuss|consult|ask us|ask us something|ask us something else/i.test(target.textContent) || ["email", "contact"].includes(channel))) track("heroes_talk_to_sales", { channel });
    if (/^\/heroes-start(?:\.html)?\?/.test(href)) {
      const params = new URL(href, location.origin).searchParams;
      track("heroes_tier_select", { tier: params.get("tier"), period: params.get("period") });
    }
    if (target.id === "paystack-link" && !target.hidden && !target.closest("[hidden]") && /^https:\/\/paystack\.com\/pay\/[\w-]+$/.test(href))
      track("heroes_paystack_handoff", { tier: document.getElementById("heroes-tier")?.value, period: document.getElementById("heroes-period")?.value });
  });
})();
