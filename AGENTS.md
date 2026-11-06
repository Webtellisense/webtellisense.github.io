# Webtellisense Heroes — approved hosted-payment direction

This branch starts from main (`b639eeb`), not PR #1 or #2. Those PRs were references only. The user approved the implementation here; their latest direction supersedes earlier audit-only, custom-payment and callback requirements.

- Never merge, deploy, configure live providers or run real transactions under this task.
- Do not edit `packages.html`, historic contest `heroes.html`, generic `welcome.html`, unrelated standalone pricing or existing payment/onboarding journeys. No new Heroes link may send clients to their conflicting checkout.
- Static Netlify website. Heroes uses hosted Paystack Payment Pages and managed monthly subscriptions where supported. Three/six-month purchases are fixed-amount one-time payments with manual renewal.
- No custom database, Functions, webhook, alert stack, schedules, secret keys, cart or portal. Redirects, query parameters and browser code never verify payment. Staff verify in Paystack before personally activating onboarding.
- Approved amounts live in `assets/js/heroes-config.js`; keep every new marketing/selection/onboarding price in sync. Advertising allocations are included. Do not invent an allocation breakdown or commercial terms.
- Reuse existing navy/blue identity and Montserrat/Campton. New CSS is scoped to `.heroes-site`, with local Campton fallbacks and reduced-motion support. Preserve original assets; optimized derivatives under `assets/img/heroes/` come only from existing repository photos/portfolio.
- Public contact details verified in `contact.html` and existing WhatsApp links: +2347075848564, webtellisense@gmail.com, https://wa.me/2347075848564.
- Contact is available to initiate 24/7, without a guaranteed overnight human answer. Proactive callbacks run 08:00–19:00 Africa/Lagos daily; target 1–2 hours after manual confirmation in hours, with next-morning carryover for late-evening contacts. The first call arranges a 30–60-minute onboarding session.
- Optional profile uses Netlify Forms. No credentials or sensitive access data; never treat its fields/receipt as evidence of payment.
- Hosted links stay null until the owner creates/reviews them. Do not invent Paystack URLs. Publish only the static allowlist; keep the automatic-deploy skip guard until a separately approved release.
- `npm test` checks static safety, approved pricing and hours; `npm run test:browser` uses local Chromium with every external/form/payment request mocked or blocked. See `docs/heroes-hosted-payments.md` for operational and dashboard setup.
