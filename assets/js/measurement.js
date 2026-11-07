/* Optional, consent-first measurement for new marketing pages. No payment conversions,
 * form values, customer details, arbitrary URLs, query strings or pre-consent event queue.
 */
(() => {
  "use strict";
  if (window.WTSMeasurement) return;
  const config = window.WTS_MEASUREMENT || {};
  const sensitive = /(?:welcome|profile-received|privacy-policy|service-terms)/.test(location.pathname);
  if (sensitive) return; // Onboarding/forms are deliberately outside provider measurement.
  const allowedHosts = ["webtellisense.com", "www.webtellisense.com"];
  const production = allowedHosts.includes(location.hostname);
  const conflictingInstall = document.querySelector('script[src*="googletagmanager.com/gtm.js"],script[src*="googletagmanager.com/gtag/js"],script[src*="connect.facebook.net/"]');
  const active = config.releaseApproved === true && production && !conflictingInstall;
  const version = config.consentVersion || "review-1";
  const key = "wts-measurement-choice";
  let choice = {analytics:false, marketing:false}, gaReady = false, metaReady = false;
  let gaLoaded = false, metaLoaded = false, gaPageSent = false, metaPageSent = false;
  let opener;
  const path = location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  const safeLocation = "https://webtellisense.com" + path;
  const events = new Set(["heroes_period_select", "heroes_tier_select", "heroes_talk_to_sales", "heroes_call_click", "heroes_whatsapp_click", "heroes_paystack_handoff"]);
  const sanitize = input => {
    const params = {page_path:path};
    if (["v1","v2","v3"].includes(input.tier)) params.tier = input.tier;
    if (["monthly","three","six"].includes(input.period)) params.period = input.period;
    if (["call","whatsapp","email"].includes(input.channel)) params.channel = input.channel;
    return params;
  };
  const load = (src, done) => {
    const script = document.createElement("script"); script.async = true;
    script.src = src; script.referrerPolicy = "no-referrer";
    script.addEventListener("load", done); document.head.append(script);
  };
  // Sanitize the document URL before Meta's SDK can read it. Never send referral/query data.
  const cleanURL = () => { if (location.search || location.hash) history.replaceState(null,"",location.pathname); };
  function start() {
    if (!active || navigator.globalPrivacyControl) return;
    if (choice.analytics && /^G-[A-Z0-9]+$/.test(config.ga4 || "")) {
      window["ga-disable-"+config.ga4] = false;
      if (!gaLoaded) {
        gaLoaded = true; cleanURL();
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
        window.gtag("js",new Date());
        window.gtag("config",config.ga4,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:safeLocation,page_referrer:"",page_title:document.title});
        load("https://www.googletagmanager.com/gtag/js?id="+config.ga4, () => {
          gaReady = true;
          if (choice.analytics && !gaPageSent) {
            gaPageSent = true; window.gtag("event","page_view",{page_location:safeLocation,page_referrer:"",page_path:path});
          }
        });
      }
      window.gtag("consent","update",{analytics_storage:"granted"});
    }
    const referrerHasParameters = /[?#]/.test(document.referrer);
    if (choice.marketing && !referrerHasParameters && /^\d{10,20}$/.test(config.metaPixel || "")) {
      if (!metaLoaded) {
        metaLoaded = true; cleanURL();
        // Same queue interface as Meta's documented browser base code, loaded only after opt-in.
        const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq,arguments) : fbq.queue.push(arguments); };
        fbq.queue=[]; fbq.push=fbq; fbq.loaded=true; fbq.version="2.0"; window._fbq=fbq;
        fbq("consent","grant"); fbq("set","autoConfig",false,config.metaPixel);
        fbq("init",config.metaPixel); // No automatic advanced matching / customer arguments.
        load("https://connect.facebook.net/en_US/fbevents.js", () => {
          metaReady = true;
          if (choice.marketing && !metaPageSent) { metaPageSent=true; fbq("trackSingle",config.metaPixel,"PageView"); }
        });
      } else window.fbq("consent","grant");
    }
  }
  function track(name, input = {}) {
    if (!active || !events.has(name)) return;
    const params = sanitize(input);
    if (choice.analytics && gaReady) window.gtag("event",name,{...params,page_location:safeLocation,page_referrer:""});
    if (choice.marketing && metaReady) window.fbq("trackSingleCustom",config.metaPixel,name,params);
  }
  function save(next) {
    choice = {analytics:next.analytics===true, marketing:next.marketing===true && Boolean(config.metaPixel)};
    try { localStorage.setItem(key,JSON.stringify({...choice,version})); } catch { /* Works for this visit without storage. */ }
    if (!choice.analytics && gaLoaded) {
      window["ga-disable-"+config.ga4] = true;
      window.gtag("consent","update",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
    }
    if (!choice.marketing && metaLoaded) window.fbq("consent","revoke");
    start();
    dialog.hidden = true;
    if (opener?.isConnected) opener.focus();
  }
  const dialog = document.createElement("section");
  dialog.className = "measurement-choice"; dialog.hidden = true;
  dialog.setAttribute("aria-label","Optional measurement choices");
  const title = document.createElement("h2"); title.textContent="Your choice, before any optional tracking.";
  const copy = document.createElement("p");
    copy.textContent = "Optional measurement on this page is off while our privacy information and destination settings are under review.";
  // Analytics providers still receive online identifiers/IP; never call collection anonymous.
  if (active) copy.textContent="Optional analytics uses Google Analytics to understand page visits and button use. Providers receive device/network information. Advertising measurement is separate. All features work with tracking off.";
  dialog.append(title,copy);
  const link=document.createElement("a");link.href="/privacy-policy#measurement";link.textContent="Read privacy information (draft)";dialog.append(link);
  const analytics=document.createElement("input"), marketing=document.createElement("input");
  for (const [field,text] of [[analytics," Allow analytics"],[marketing," Allow advertising measurement"]]) {
    field.type="checkbox"; const label=document.createElement("label");label.append(field,document.createTextNode(text));dialog.append(label);
  }
  marketing.disabled=!config.metaPixel; analytics.disabled=!active; marketing.disabled ||= !active;
  const actions=document.createElement("div");
  for (const [label,handler] of [["Keep optional tracking off",()=>save({})],["Save my choices",()=>save({analytics:analytics.checked,marketing:marketing.checked})]]) {
    const button=document.createElement("button");button.type="button";button.textContent=label;button.addEventListener("click",handler);actions.append(button);
  }
  dialog.append(actions);document.body.append(dialog);
  const controls=document.querySelectorAll("[data-measurement-settings]");
  controls.forEach(button=>{button.hidden=false;button.addEventListener("click",()=>{opener=button;analytics.checked=choice.analytics;marketing.checked=choice.marketing;dialog.hidden=!dialog.hidden;if(!dialog.hidden) actions.querySelector("button").focus();});});
  try {const saved=JSON.parse(localStorage.getItem(key));if(saved?.version===version)choice={analytics:saved.analytics===true,marketing:saved.marketing===true};else if(active)dialog.hidden=false;} catch {if(active)dialog.hidden=false;}
  if (navigator.globalPrivacyControl) {choice={analytics:false,marketing:false};dialog.hidden=true;analytics.disabled=true;marketing.disabled=true;copy.textContent="Your browser privacy signal keeps optional measurement off.";}
  start();
  window.WTSMeasurement = Object.freeze({track});
  if (!document.body.matches(".flagship-page,.checkout-page")) return;
  document.addEventListener("change",event=>{
    if (event.target.matches('input[name="billing-view"],#heroes-period')) track("heroes_period_select",{period:event.target.value});
    if (event.target.matches("#heroes-tier")) track("heroes_tier_select",{tier:event.target.value});
  });
  document.addEventListener("click",event=>{
    const target=event.target.closest("a,[data-view-tier]");if(!target)return;
    if (target.dataset.viewTier) return track("heroes_tier_select",{tier:target.dataset.viewTier});
    const href=target.getAttribute("href") || "";
    if (/^tel:/.test(href)) track("heroes_call_click",{channel:"call"});
    if (/^https:\/\/wa\.me\//.test(href)) {
      track("heroes_whatsapp_click",{channel:"whatsapp"});
      if (/talk to sales/i.test(target.textContent)) track("heroes_talk_to_sales",{channel:"whatsapp"});
    }
    if (/^\/heroes-start(?:\.html)?\?/.test(href)) {
      const params=new URL(href,location.origin).searchParams;
      track("heroes_tier_select",{tier:params.get("tier"),period:params.get("period")});
    }
    if (target.id==="paystack-link" && !target.hidden && /^https:\/\/paystack\.com\/pay\/[\w-]+$/.test(href)) track("heroes_paystack_handoff",{tier:document.getElementById("heroes-tier").value,period:document.getElementById("heroes-period").value});
  });
})();
