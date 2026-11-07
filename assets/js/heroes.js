(() => {
  const config = window.HEROES_CONFIG,
    api = window.HEROES;
  // Payment/provider query parameters are intentionally never read by welcome/profile pages.
  if (
    document.body.classList.contains("welcome-page") ||
    document.body.classList.contains("receipt-page")
  )
    history.replaceState(null, "", location.pathname);
  if (!config || !api) return;
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
  // Progressive plan comparison: all nine prices and selection links remain in HTML.
  const billingSwitch = document.getElementById("billing-switch");
  if (billingSwitch) {
    billingSwitch.hidden = false;
    const tierSwitch = document.getElementById("mobile-tier-switch");
    tierSwitch.hidden = false;
    const narrow = matchMedia("(max-width: 760px)");
    let activeTier = "v1";
    function renderComparison() {
      const selected = billingSwitch.querySelector("input:checked").value;
      for (const [id, plan] of Object.entries(config.tiers)) {
        document.querySelector(`[data-choice-price="${id}"]`).textContent = `₦${api.money(plan.prices[selected])}`;
        document.querySelector(`[data-choice-period="${id}"]`).textContent = selected === "monthly" ? "per month" : `one payment · ${selected === "three" ? "3" : "6"} months`;
        document.querySelector(`[data-choice-link="${id}"]`).href = `/heroes-start.html?tier=${id}&period=${selected}`;
        document.querySelector(`[data-choice-tier="${id}"]`).hidden = narrow.matches && id !== activeTier;
      }
      document.getElementById("billing-explanation").textContent = config.periods[selected].renewal + " Advertising allocation included. Confirm your delivery scope with Sales before paying.";
      tierSwitch.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.viewTier === activeTier)));
    }
    billingSwitch.addEventListener("change", renderComparison);
    tierSwitch.addEventListener("click", event => {
      const button = event.target.closest("[data-view-tier]");
      if (!button) return;
      activeTier = button.dataset.viewTier;
      renderComparison();
    });
    narrow.addEventListener("change", renderComparison);
    renderComparison();
  }
  // Native scrolling first. Optional nine-second slideshow starts only on an explicit request.
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    const track = carousel.querySelector("[data-carousel-track]");
    const slides = [...track.children];
    const controls = carousel.querySelector(".carousel-controls");
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const play = carousel.querySelector("[data-carousel-play]");
    controls.hidden = false;
    let index = 0;
    let playing = false, timer, onScreen = true;
    const pauseTimer = () => { clearTimeout(timer); };
    const stop = () => {
      playing = false; pauseTimer();
      if (play) { play.textContent = "Play slideshow"; play.setAttribute("aria-pressed","false"); }
      carousel.querySelector("[data-carousel-status]").setAttribute("aria-live","polite");
    };
    const schedule = () => {
      pauseTimer();
      if (!playing || reduced.matches || document.hidden || !onScreen || carousel.matches(":hover") || carousel.contains(document.activeElement)) return;
      timer = setTimeout(() => { go(index === slides.length - 1 ? -index : 1); schedule(); },9000);
    };
    const sync = () => {
      index = slides.reduce((best, slide, i) => Math.abs(slide.offsetLeft - slides[0].offsetLeft - track.scrollLeft) < Math.abs(slides[best].offsetLeft - slides[0].offsetLeft - track.scrollLeft) ? i : best, 0);
      carousel.querySelector("[data-carousel-status]").textContent = `${index + 1} / ${slides.length}`;
      previous.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    };
    const go = delta => track.scrollTo({left: slides[Math.max(0, Math.min(slides.length - 1, index + delta))].offsetLeft - slides[0].offsetLeft, behavior: reduced.matches ? "auto" : "smooth"});
    previous.addEventListener("click", () => { stop(); go(-1); });
    next.addEventListener("click", () => { stop(); go(1); });
    if (play) {
      play.hidden = reduced.matches;
      play.addEventListener("click", () => {
        if (playing) return stop();
        playing = true; play.textContent="Pause slideshow"; play.setAttribute("aria-pressed","true");
        carousel.querySelector("[data-carousel-status]").setAttribute("aria-live","off");
        schedule();
      });
    }
    carousel.addEventListener("mouseenter",pauseTimer);
    carousel.addEventListener("mouseleave",schedule);
    carousel.addEventListener("focusin",pauseTimer);
    carousel.addEventListener("focusout",()=>requestAnimationFrame(schedule));
    track.addEventListener("touchstart",stop,{passive:true});
    document.addEventListener("visibilitychange",schedule);
    reduced.addEventListener("change",()=>{stop();if(play)play.hidden=reduced.matches;});
    if ("IntersectionObserver" in window) new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;schedule();}).observe(carousel);
    track.addEventListener("keydown", event => {
      if (event.target !== track || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault(); stop(); go(event.key === "ArrowRight" ? 1 : -1);
    });
    track.addEventListener("scroll", sync, {passive:true});
    window.addEventListener("resize", sync);
    sync();
  });
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
