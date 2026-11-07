(() => {
  const config = window.HEROES_CONFIG,
    api = window.HEROES;
  // Payment/provider query parameters are intentionally never read by welcome/profile pages.
  if (
    document.body.classList.contains("welcome-page") ||
    document.body.classList.contains("receipt-page")
  )
    history.replaceState(null, "", location.pathname);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (!reduced.matches && "IntersectionObserver" in window) {
    document.body.classList.add("has-motion");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("is-waiting");
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-waiting");
      observer.observe(el);
    });
    reduced.addEventListener("change", () => {
      if (reduced.matches) {
        document.body.classList.remove("has-motion");
        document
          .querySelectorAll(".is-waiting")
          .forEach((el) => el.classList.remove("is-waiting"));
        observer.disconnect();
      }
    });
  }
  const callbackTitle = document.getElementById("callback-title");
  if (callbackTitle) {
    const render = () => {
      const state = api.callbackWindow(new Date(), config.callback);
      callbackTitle.textContent = state.title;
      document.getElementById("callback-message").textContent = state.body;
      callbackTitle.dataset.window = state.kind;
    };
    render();
    setInterval(render, 60000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) render();
    });
  }
  const tier = document.getElementById("heroes-tier"),
    period = document.getElementById("heroes-period");
  if (tier && period) {
    const params = new URLSearchParams(location.search),
      valid = api.selection(params.get("tier"), params.get("period"), config);
    if (valid) {
      tier.value = valid.tier;
      period.value = valid.period;
    } else if (location.search) {
      document.getElementById("selection-error").textContent =
        "That plan selection wasn’t recognised. Please choose your tier and payment option below.";
    }
    const render = () => {
      const s = api.selection(tier.value, period.value, config);
      if (!s) return;
      const plan = config.tiers[s.tier],
        billing = config.periods[s.period],
        link = document.getElementById("paystack-link"),
        disabled = document.getElementById("payment-unavailable"),
        url = api.hostedUrl(config.paymentPages[s.tier][s.period]);
      document.getElementById("selection-label").textContent =
        `${plan.name} · ${billing.label}`;
      document.getElementById("selection-price").textContent =
        `₦${api.money(s.total)}${s.period === "monthly" ? " / month" : ""}`;
      document.getElementById("selection-renewal").textContent =
        billing.renewal;
      // This only selects a public hosted page; it does not set an amount or verify payment.
      link.hidden = !url;
      disabled.hidden = Boolean(url);
      if (url) {
        link.href = url;
        document.getElementById("payment-availability").textContent =
          "You’ll leave this website for Paystack. Check the displayed tier, NGN amount and renewal terms before completing payment.";
      } else {
        link.removeAttribute("href");
        document.getElementById("payment-availability").textContent =
          "The hosted payment link for this option is not configured yet. Call or WhatsApp us to arrange it; please don’t use an unrelated package payment link.";
      }
    };
    tier.addEventListener("change", render);
    period.addEventListener("change", render);
    render();
  }
  const form = document.getElementById("heroes-profile");
  if (form)
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = document.getElementById("profile-submit"),
        status = document.getElementById("profile-status");
      if (button.disabled) return;
      button.disabled = true;
      status.textContent = "Sending your profile…";
      try {
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!response.ok) throw new Error("Not accepted");
        status.textContent =
          "Thank you. Your profile has been submitted. You can still call or message us now; the team checks payment separately in Paystack.";
        button.textContent = "Profile submitted";
      } catch {
        status.textContent =
          "We couldn’t confirm your submission. Your answers are still here. Try again, or share them when we speak.";
        button.disabled = false;
      }
    });
})();
