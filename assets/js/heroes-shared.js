(function (root) {
  const money = (n) =>
    new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(n);
  function selection(tier, period, config) {
    return Object.hasOwn(config.tiers, tier || "") &&
      Object.hasOwn(config.periods, period || "")
      ? { tier, period, total: config.tiers[tier].prices[period] }
      : null;
  }
  function hostedUrl(value) {
    try {
      const u = new URL(value);
      return u.origin === "https://paystack.com" &&
        /^\/pay\/[a-zA-Z0-9_-]+\/?$/.test(u.pathname) &&
        !u.username &&
        !u.password &&
        !u.search &&
        !u.hash
        ? u.href
        : null;
    } catch {
      return null;
    }
  }
  function callbackWindow(now, policy) {
    // A contact-hours display ONLY. The clock never establishes payment status or activation.
    const p = policy || {
      openHour: 8,
      closeHour: 19,
      timezone: "Africa/Lagos",
    };
    const local = new Date(now.getTime() + 3600000),
      minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
    const start = p.openHour * 60,
      end = p.closeHour * 60;
    const next = new Date(local);
    next.setUTCHours(p.openHour, 0, 0, 0);
    if (minutes >= end) next.setUTCDate(next.getUTCDate() + 1);
    const nextDate = new Date(next.getTime() - 3600000);
    const date = new Intl.DateTimeFormat("en-NG", {
      timeZone: p.timezone,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(nextDate);
    const opens = new Intl.DateTimeFormat("en-NG", {
      timeZone: p.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(nextDate);
    if (minutes < start || minutes >= end)
      return {
        kind: "after-hours",
        title: `Next callbacks: ${opens}, ${date}.`,
        body: "After we manually confirm your payment, our team will contact you from the next callback window. You can call or message us now; a human answer overnight isn’t guaranteed.",
      };
    if (minutes + 120 > end) {
      const tomorrow = new Date(local);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(p.openHour, 0, 0, 0);
      const day = new Intl.DateTimeFormat("en-NG", {
        timeZone: p.timezone,
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date(tomorrow.getTime() - 3600000));
      return {
        kind: "late-evening",
        title: `This evening, or from ${opens} tomorrow.`,
        body: `Once payment is manually confirmed, we aim to call within 1–2 hours during contact hours. If we can’t reach you before closing, we’ll continue from ${opens} on ${day}. Call or WhatsApp us now if you’d like to speak sooner.`,
      };
    }
    return {
      kind: "contact-hours",
      title: "We aim to call within 1–2 hours.",
      body: "That’s our target after the team manually confirms payment in Paystack, during contact hours. Our first call is a welcome and a chance to arrange your full onboarding conversation.",
    };
  }
  const api = { money, selection, hostedUrl, callbackWindow };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HEROES = api;
})(typeof window === "undefined" ? globalThis : window);
