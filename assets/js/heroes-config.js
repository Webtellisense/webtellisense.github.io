/* Public configuration only. Never add Paystack secret keys or customer data. */
(function (root) {
  const config = {
    contact: {
      phone: "+2347075848564",
      displayPhone: "+234 707 584 8564",
      whatsapp: "https://wa.me/2347075848564",
      email: "webtellisense@gmail.com",
    },
    callback: { timezone: "Africa/Lagos", openHour: 8, closeHour: 19 },
    // Exact approved NGN totals, including the advertising allocation. No client-calculated charge.
    tiers: {
      v1: {
        name: "Heroes V1",
        prices: { monthly: 350000, three: 1012500, six: 1950000 },
      },
      v2: {
        name: "Heroes V2",
        prices: { monthly: 600000, three: 1755000, six: 3420000 },
      },
      v3: {
        name: "Heroes V3",
        prices: { monthly: 1000000, three: 2932500, six: 5730000 },
      },
    },
    periods: {
      monthly: {
        label: "Monthly",
        description: "Paystack-managed monthly subscription, where supported.",
        renewal:
          "Renews monthly through Paystack. Review the subscription details on the hosted page before paying.",
      },
      three: {
        label: "3 months prepaid",
        description: "One fixed payment for three months.",
        renewal:
          "One-time payment. Renew manually at the end of the prepaid period; no automatic renewal.",
      },
      six: {
        label: "6 months prepaid",
        description: "One fixed payment for six months.",
        renewal:
          "One-time payment. Renew manually at the end of the prepaid period; no automatic renewal.",
      },
    },
    // Replace only with reviewed, owner-created hosted Payment Page URLs. Null disables payment.
    // Monthly links must point to monthly subscription pages, never one-time substitutes.
    paymentPages: {
      v1: { monthly: null, three: null, six: null },
      v2: { monthly: null, three: null, six: null },
      v3: { monthly: null, three: null, six: null },
    },
  };
  function freeze(obj) {
    Object.values(obj).forEach((v) => {
      if (v && typeof v === "object") freeze(v);
    });
    return Object.freeze(obj);
  }
  if (typeof module !== "undefined" && module.exports)
    module.exports = freeze(config);
  else root.HEROES_CONFIG = freeze(config);
})(typeof window === "undefined" ? globalThis : window);
