# Heroes: personal contact after verified payment

Implemented on a separate branch stacked on `feat/secure-netlify-payments` (PR #1). This follow-up PR should be reviewed against that branch so unrelated payment work is not duplicated. Neither PR is merged or deployed. The payment foundation remains test-only, with all commercial catalog entries disabled pending approval. No production settings, provider accounts or credentials have been changed.

## Repository review and scope

Reviewed `index.html`, `assets/css/main.css`, web-design service markup, pricing/packages, contact page, actual logo and Heroes badges, welcome/Tally and payment Functions. No Reflections implementation or matching files/content were found; it is unavailable as a design reference. The page uses actual navy/blue tokens, existing local assets, restrained cards and Montserrat/Campton conventions. It does not introduce a gradient dashboard, calendar, artificial proof or cart.

`heroes-welcome.html` is specific to verified Heroes purchases. The shared welcome script routes only authenticated `paid` + `packageId=heroes` results to it. All other packages still use their original welcome/Tally path. Checkout, contest `heroes.html`, unrelated service pages, pricing, marketing offers and contact-page promises are untouched. One-off/add-on work retains the existing separate contact/quoting process.

## Customer experience and authoritative states

The page begins in verification, with support always available. It POSTs to the existing cookie-authenticated server status Function; query/reference/sessionStorage values identify an order but cannot establish paid status. It removes query identifiers before any third-party loading. Only the server can populate the welcome with the verified tier, paid amount/currency, reference and system-confirmation timestamp.

Pending, delayed/provider-unavailable and expired/missing-session recovery states do not show the paid panel or callback promise. They explain that a failure to verify does not mean payment failed, provide retry where useful, and advise against paying again while checking. Support is available via actual repository contact details: WhatsApp `https://wa.me/2347075848564`, telephone `+2347075848564`, email `webtellisense@gmail.com`. No verification or callback promise is derived from a redirect or a Base64 token.

Verified welcome: personal greeting; existing Heroes badge/tier; prominent callback promise/window; receipt details; explanation of the first welcome call and later 30–60-minute session; collapsed optional four-field profile; direct support. The session covers business, existing digital assets, priorities, secure access and an initial implementation plan. The profile is not a prerequisite. No call booking or calendar is required. Access is arranged through platform invitations, never customer passwords, API keys or recovery codes in forms.

## Approved callback policy

Defaults are daily **08:00–19:00, Africa/Lagos (UTC+01:00)**. Server environment overrides `HEROES_CONTACT_START` and `HEROES_CONTACT_END` accept `HH:mm`; invalid or overnight configurations fail closed. The timezone and daily schedule are explicit. This task's 1–2-hour policy supersedes the earlier one-hour wording.

- Confirmation at or after 08:00 and before 19:00: personal welcome callback within 1–2 hours, with the absolute callback window displayed.
- Confirmation at or after 19:00: callbacks begin at 08:00 the next morning.
- Confirmation after midnight but before 08:00: the next morning contact window is 08:00 that same calendar day, not a day later.
- Exactly 19:00 is outside contact hours; exactly 08:00 is inside.
- The clock starts at `payment_orders.paid_at`, the first successful authoritative settlement, not page load, client clock, payment redirect or claimed transaction time. Refresh does not restart it. A later visit past the daytime deadline keeps the original window, changes the headline to say the callback is due, and adds follow-up/support wording.
- A confirmation just before 19:00 still promises 1–2 hours, potentially after closing. This follows the approved policy literally; the team must staff that carryover window. It is not silently postponed to morning.
- Overnight callbacks have an approved beginning time, not an invented completion deadline. The page shows the exact next date/time rather than a stale “tomorrow” label on return visits.

The first call welcomes the customer and arranges the full 30–60-minute onboarding session. It does not promise to complete that session during the first callback window. Team staffing, phone availability and monitoring must support this promise before release.

## Immediate alerts, fallback and durable retries

No new onboarding database. This uses the existing payment ledger and transactional `payment_outbox`. Apply `migrations/002_purchase_alerts.sql` to add delivery lease, attempt, next-attempt and channel columns. No customer profile is stored there.

After webhook or authenticated callback verification, only a server-loaded **paid Heroes** order is eligible for dispatch. Pending/unmatched/unverified browser claims cannot produce a purchase alert. Non-Heroes outbox entries are ignored. Alerts include verified order/contact information, amount, callback window and first-call purpose.

1. Immediately attempt an internal email via Resend, using a stable order-based provider idempotency key.
2. If email is unconfigured, times out or returns non-2xx, immediately attempt an independent HTTPS webhook destination. Payload is `{text, idempotency_key}`; compatible incoming webhooks may ignore the extra key. Use a trusted restricted internal channel; customer contact details are included. Validate the destination's actual response contract before activation.
3. Database leases arbitrate concurrent webhook/callback dispatchers. Provider acceptance records `processed_at` and `alert_delivered_via`. If both channels fail, the durable event remains unprocessed with a retry timestamp.
4. A single scheduled Netlify Function retries eligible events every five minutes, five at a time. A crashed lease expires after two minutes. Payment verification remains successful even when notification fails; it does not ask the customer to pay again. Missing migration or credentials is logged as a configuration/alert backlog issue, without PII.

These are at-least-once notifications, not guaranteed inbox delivery. An accepted request is not proof that a staff member saw an alert. A provider timeout followed by fallback, or a crash after acceptance but before the database write, can cause duplicate alerts; staff should deduplicate by order reference. The fallback receiver should honor `idempotency_key` if available. No email receipt/fulfillment to customers is invented.

**Operational fallback:** the staffed team must check the paid-Heroes ledger even if notifications appear quiet, and inspect pending outbox entries at least every 15 minutes during contact hours. Check at opening for overnight purchases. Assign a named owner and backup before release. If email/webhook/scheduled jobs fail, use the ledger's verified customer phone/email to make the call manually and reconcile alert records. This is an operational requirement, not another automation service. Example read-only query:

```sql
SELECT o.reference, o.paid_at, o.customer, x.alert_attempts,
       x.alert_next_attempt, x.alert_delivered_via, x.processed_at
FROM payment_orders o
JOIN payment_outbox x USING (reference)
WHERE o.status = 'paid' AND o.quote->>'packageId' = 'heroes'
ORDER BY o.paid_at DESC;
```

Restrict this PII query to authorized staff. `processed_at` means notification provider accepted, not “client called.” This implementation does not track calls in a new portal; staff manage follow-up in their existing operational process.

## Required configuration, not applied here

| Dependency | Required action before an approved release |
| --- | --- |
| Payment foundation | Complete PR #1's test DB/TLS, schema, Paystack test secret/signature, origin, billing approval and hosted verification checks. Live keys remain rejected. |
| Contact hours | Approved defaults already implemented. Optional `HEROES_CONTACT_START=08:00`, `HEROES_CONTACT_END=19:00`; values must be consistent with staffed coverage. |
| Primary alert | Set `HEROES_ALERT_EMAIL_KEY`, `HEROES_ALERT_FROM` (provider-verified sender), `HEROES_ALERT_TO` (comma-separated monitored internal recipients). Never use a browser/public variable. |
| Fallback alert | Set `HEROES_ALERT_FALLBACK_URL` to a trusted HTTPS internal notification receiver; optionally set `HEROES_ALERT_FALLBACK_TOKEN`. Configure an independent channel with a staffed owner. No destinations or messages were created/sent. |
| Durable alert state | Apply migration 002 after 001. Grant the Function role SELECT/UPDATE on the outbox delivery columns in addition to existing permissions. Do not grant schema-changing privileges. |
| Netlify schedule | Confirm scheduled Functions are supported/enabled in the eventual authorized production context; scheduled jobs do not run automatically in local dev or deploy previews. Verify retry invocation and backlog monitoring. |
| Optional profile | Enable Netlify Forms detection, confirm `heroes-business-profile` is detected in the built static page, check usage/limits and restricted dashboard access. Configure internal notifications if wanted; they are not purchase alerts. |
| Privacy/data | Approve retention/deletion, processor disclosures and access permissions. Collect no credentials. No persistent browser profile drafts or uploads. Avoid sending complete profile contents in notifications. |

The optional profile uses Netlify's native form service, not custom database storage. It has business name, contact email, optional public URL and priority. Form submit uses an actual POST; a failed response preserves answers and offers retry or sharing on the call. A success label is shown only after the handler accepts the POST, never on opening a thank-you URL. Hosted acceptance must confirm that this form is actually registered and records arrive; a static preview's generic HTTP 200 is not proof of storage. Do not enable collection until form registration is verified. The hidden order reference is an **untrusted correlation hint**, not payment proof. Staff must check the paid ledger before treating any form submission as a paid client. This avoids an unnecessary profile-authentication backend; the form never triggers a paid-purchase alert.

## Validation

- `npm test`: 17 passing tests (payment regressions, clock boundaries/rollover/overdue/configuration, authenticated detail exposure, primary/fallback alerts, non-Heroes/pending exclusion).
- `npm run test:db` against disposable local PostgreSQL 17: concurrency, rollback, replay and actual outbox alert leases/retry/fallback persisted successfully; no hosted database touched.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` with a local static server on port 8765: verified, pending, unavailable and recovery states; keyboard profile toggle; submission failure/retry; no horizontal overflow at 320/390/768/1440px; Heroes-specific routing and unrelated Tally preservation. Paystack, alert providers, forms and all nonlocal requests are mocked or blocked.
- Desktop/mobile screenshots in `docs/previews/` use synthetic name, amount, order reference and confirmation time. They are design previews, not evidence of a real transaction. Google fonts were blocked during tests, so screenshots exercise fallback fonts; hosted typography still needs verification.
- No deployments, merges, production settings, real payments, real alerts or real profile submissions. Actual provider delivery, Netlify Forms storage, scheduled invocation, hosted cookie/TLS and staffed callback coverage still require configuration and authorized end-to-end checks.

The build-ignore guard remains in place. Do not merge/deploy as part of this task.
