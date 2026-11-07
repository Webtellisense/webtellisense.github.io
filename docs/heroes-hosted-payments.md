# Webtellisense Heroes: hosted payments and a personal welcome

Implemented on `feat/heroes-hosted-payments`, in an isolated worktree created directly from main `b639eeb`. PR [#1](https://github.com/Webtellisense/webtellisense.github.io/pull/1) and [#2](https://github.com/Webtellisense/webtellisense.github.io/pull/2) were references, not branch dependencies. Neither was merged or copied wholesale. This branch supersedes their custom payment/onboarding design for the **new Heroes journey only**.

No deployment, merge, production configuration, provider transaction or real form submission was performed. `netlify.toml` retains a review-only `ignore = "exit 0"` guard so automatic branch builds/deploys are skipped. Removing that guard belongs to a separately approved release, not this task.

## Implemented journey

- `webtellisense-heroes.html`: new Heroes marketing, existing portfolio imagery, exact approved pricing for nine tier/period combinations and Custom → Talk to Sales.
- `heroes-start.html`: one tier and one billing option, followed by a direct Paystack-hosted Payment Page link when configured. No cart, Inline SDK, transaction initialization, amount query parameter or card collection. Null/invalid links disable payment and expose Call Now/WhatsApp instead. Monthly is a managed subscription where supported; 3/6 months are fixed one-time payments and manual renewal.
- `heroes-welcome.html`: warm generic welcome, existing founder portrait, immediate contact options, current callback schedule, explanation of manual payment verification, first call/full onboarding, and optional short Netlify profile. **No online paid/verified state, receipt, activation token or personalized purchase claim.** All return query parameters are discarded without being interpreted as payment evidence.
- `heroes-profile-received.html`: optional form follow-up; explicitly not payment verification or onboarding activation. Directly visiting it changes nothing.
- `index.html`: one new Heroes navigation link; all other homepage content remains unchanged.
- `sitemap.xml`: one new public marketing URL. Selection, welcome and form-receipt pages are noindex.

`packages.html`, `heroes.html` (historic contest), `welcome.html`, existing standalone pricing, unrelated onboarding/payment scripts and all original assets are byte-for-byte main. No new Heroes link points to the old conflicting packages checkout. Existing unsafe legacy behavior noted in the earlier audit is **not fixed globally** under this scope; it remains a separate concern. Do not direct new Heroes customers to it.

## Exact approved totals

All amounts are NGN, including the monthly advertising allocations. Prepaid discounts apply only to agency fees. No fee/media split, percentage discount, trial, minimum contract, refund or cancellation terms have been invented.

| Tier | Monthly recurring | 3 months, one-time | 6 months, one-time |
| --- | ---: | ---: | ---: |
| Heroes V1 | ₦350,000 | ₦1,012,500 | ₦1,950,000 |
| Heroes V2 | ₦600,000 | ₦1,755,000 | ₦3,420,000 |
| Heroes V3 | ₦1,000,000 | ₦2,932,500 | ₦5,730,000 |
| Custom | Talk to Sales | Talk to Sales | Talk to Sales |

The public configuration is `assets/js/heroes-config.js`. Marketing HTML is also populated with these amounts for no-JavaScript access, and tests assert exact equality. Handoff labels always come from the same configuration. Public values select/display a plan; **Paystack's fixed page/plan sets the actual charge**. Browser changes to prices, query strings or DOM cannot alter the configured hosted charge.

All nine `paymentPages` values are currently `null`. No Paystack payment URLs were invented. Only reviewed `https://paystack.com/pay/<page>` URLs without credentials, query strings or fragments pass the link-format guard. If Paystack supplies a different official host/custom domain, review and test it before extending the allowlist. Link validation does not prove the merchant, price or plan; that must be checked in the dashboard before enabling a link.

## Simplification and trade-offs

There are **no** Functions, PostgreSQL/custom order store, migrations, outbox, webhook, alert delivery stack, retry worker, scheduled jobs, portal, customer account or custom onboarding database. The only added npm dependency is Playwright for development tests; the production journey is static HTML/CSS/JavaScript plus provider-hosted services.

No indispensable requirement calls for custom persistence under the approved **manual activation** model. Paystack keeps the payment/subscription records; Netlify keeps optional form submissions. The team checks Paystack before activation. A redirect, reference, screenshot, selected tier, frontend “success,” form receipt or customer email alone cannot authorize onboarding.

Trade-offs:

- There is no automatic customer-specific paid status, fraud matching, activation, subscription lifecycle sync, renewal enforcement or verified-purchase alert on this website. Staff must perform these checks in Paystack. The welcome does not pretend otherwise.
- Monthly auto-renewal depends on the account, currency and supported payment authorization/channel. Paystack documents Card and Nigerian Direct Debit support for subscriptions. Do not silently substitute a one-time monthly page when recurring is unavailable: keep the link disabled and discuss an appropriate arrangement personally.
- Prepaid periods do not create quarterly/biannual subscriptions. Renewals are manual. No reminder worker is added; the team uses its existing operational process.
- Provider notifications can fail or be overlooked. Use Paystack's native notification/dashboard features and a staffed review process rather than rebuilding an alert stack.
- A public Netlify profile can receive spam/unpaid submissions. Its fields and presence are never paid evidence. Honeypot and provider filtering reduce spam; staff reconcile clients against Paystack. No credentials or uploads are requested.
- The static profile's HTTP acceptance is a transport acknowledgement, not proof an email was delivered/read. Netlify form detection and actual stored-submission behavior must be confirmed before collection. A local static server's generic 200 is not evidence of provider storage.

Paystack documentation reviewed: [Payment Pages](https://support.paystack.com/en/articles/2132546), [Subscriptions and Plans](https://support.paystack.com/en/articles/2133058), [subscription channels](https://paystack.com/docs/payments/subscriptions/). No API keys are needed on this website.

## Personal contact and callback policy

Verified repository contact details: `tel:+2347075848564`, `https://wa.me/2347075848564`, `mailto:webtellisense@gmail.com` (`contact.html` and existing site WhatsApp links).

Call Now and WhatsApp are prominent at the top and bottom of new pages; mobile has a persistent bottom contact bar. Customers can initiate contact 24/7. Copy explicitly says a human answer overnight is not guaranteed.

Proactive callbacks are daily **08:00–19:00 Africa/Lagos**. During hours the team targets 1–2 hours **after manual Paystack confirmation**, not after a frontend visit. The first call welcomes the customer and arranges the full **30–60-minute onboarding** covering business, existing assets, priorities, required secure access and an initial implementation plan.

- 08:00 through 17:00: display the usual 1–2-hour target, conditional on manual confirmation.
- After 17:00 and before 19:00: a full two-hour window crosses closing. Explicitly show this evening **or from 08:00 tomorrow**, with the next date. This is carryover communication, not a new cutoff on who may contact the team.
- At/after 19:00: display next-morning 08:00 and the exact next date. Before 08:00, that next contact window is the same morning.
- Exactly 08:00 is inside hours; exactly 19:00 is outside. Date/year rollover is tested.

`heroes-shared.js` computes only contact availability from the client clock, in the approved Lagos timezone. It never starts a payment/activation clock or establishes paid status. An incorrect customer clock can affect this availability hint, not payment verification. Static fallback copy preserves the daily hours and next-morning policy with JavaScript disabled. The display updates each minute and when the tab becomes visible.

Optional profile completion is never needed before the first call. Access is arranged via secure platform invitations during onboarding, not passwords/API keys/recovery codes in a form. Add-on/one-off requests retain separate quotes and approval; no shopping cart.

## Manual verification and activation runbook

1. A named staff member checks the actual Paystack account during contact hours and at opening for overnight purchases; establish internal coverage before launch.
2. Find the transaction in Paystack using the supplied reference/contact information **as lookup hints only**. Confirm it belongs to Webtellisense, has successful payment status, is NGN and matches the exact tier/period amount and correct hosted page/plan. Check actual customer/contact details there. A screenshot or return URL does not replace this check.
3. For monthly billing, confirm the first payment and association with the correct monthly subscription plan/authorization. A plan created or subscription selected without a successful initial payment is not proof of a paid purchase. For prepaid, confirm the single payment and correct 3/6-month option; no recurring plan should be attached.
4. If pending, failed, mismatched, refunded/disputed or otherwise unclear, resolve it with Paystack/the customer before activating onboarding. Do not invent a refund outcome or ask for another payment before checking an ambiguous one.
5. After confirmation, personally tell the customer which tier, billing option and payment details were verified, then make the welcome call within the stated operational target. Use the existing internal follow-up process; no custom portal/database is introduced.
6. Arrange the full onboarding time personally, gather access by invitations, and send the personalized 30-day activation plan after discovery. The template is in `docs/heroes-activation-plan-template.md`.

## Dashboard actions requiring the owner's access

These actions were **not performed**. Use an authorized test context first; no real transactions or production settings should be changed as part of this PR.

### Paystack dashboard

1. Create **three monthly plans** with interval monthly and the approved NGN totals: V1 ₦350,000; V2 ₦600,000; V3 ₦1,000,000. Create/link a Subscription Payment Page for each plan. Check channel support for the account. Do not use “customer chooses amount/plan.”
2. Create **six fixed-amount one-time Payment Pages** for the three- and six-month totals in the table above. Explicitly enable the fixed amount; do not attach quarterly/biannual subscription plans. Name each page unambiguously by Heroes tier and period, and state that advertising allocation is included and renewal is manual.
3. Configure collection of the customer's email and reachable phone number (and name where available) so the team can call them. Use the page's phone/custom-field settings supported by the account. Configure customer receipts and native business transaction notifications to the monitored internal recipients where available; verify delivery, with dashboard review as the operational fallback.
4. On all nine pages, set the post-payment return URL to the eventual deployed origin's `/heroes-welcome.html` with **no customer data or paid/verified flags**. Use a success message explaining that Webtellisense will personally verify payment before onboarding activation. Review the exact hosted amount, NGN currency, merchant identity and recurrence/manual-renewal terms.
5. Copy the nine public page URLs. These are the only missing payment-link inputs. Once supplied, they can replace the matching `null` values in `assets/js/heroes-config.js` in a reviewed code change. Do **not** send secret keys. No payment APIs, webhook endpoint or server credentials need configuring.

### Netlify dashboard

1. In the future authorized site/test context, enable **Forms → Form detection**. After an approved deployment, verify `heroes-business-profile` is registered with every static field and check plan limits/usage.
2. Check that a test profile is stored in the Forms dashboard and that its success/failure/notification behavior works. Configure form notifications to restricted internal recipients if desired. These are profile notifications, never verified-purchase alerts. Approve actual retention/deletion/access/privacy handling before collecting client data.
3. Check the eventual publish directory is `public` and the build command is `npm run build` if dashboard overrides exist. This keeps test tooling/docs/configuration files out of the published root. No payment secrets, custom database, Functions or scheduled jobs are required.

The reviewed code already supplies prices, page markup, contact details, hours, renewal copy, disabled-link behavior and the public configuration locations. Filling links after receiving them and removing the review-only build guard are code/release steps, **not additional dashboard services or infrastructure setup**. Deployment remains a separate approval.

## Design and assets

Reviewed actual `index.html`, `assets/css/main.css`, service, pricing/packages and portfolio content. No Reflections implementation exists in main. Creative reference study: [COLLINS](https://wearecollins.com/) for expressive typography and work-led composition; [Studio MPLS](https://studiompls.com/) for editorial sequencing and image-led storytelling. No external design assets, claims, testimonials or copy were transplanted.

The scoped `.heroes-site` CSS preserves navy `#01033e`, blue `#0331b0`, accent `#0033ff`, logo and Montserrat/Campton. Layout uses large type, purposeful imagery, offset figures, open sections, modest entrance/scroll reveals and button/summary interactions. No repeated dashboard-card grid. Content remains visible without JavaScript, motion respects reduced-motion settings, native controls/labels/focus states are retained, and the pricing comparison has an accessible horizontally scrollable region on narrow screens.

Optimized WebP derivatives are from existing source files only:

| New derivative | Original repository source | Use |
| --- | --- | --- |
| `ephraim.webp` (~33 KB) | `assets/img/team/team-0.jpg` | Existing named founder portrait; EXIF orientation normalized. Name/role verified in `about.html`. It does not claim he alone will handle every callback. |
| `conversation.webp` (~74 KB) | `assets/img/about.jpg` | Existing business-call image; no claim that pictured people are staff or clients. |
| `crayfish-brand.webp` (~9 KB) | `assets/img/portfolio/branding-33.jpg` | Existing The Crayfish Plug portfolio identity. |
| `bgis-website.webp` (~26 KB) | `assets/img/portfolio/website-2.png` | Existing BGIS website portfolio image. |

Original files are unchanged. Images are dimensioned; below-fold images are lazy-loaded. There is no video, heavy animation runtime or artificial team photography. Google font requests may fall back to local Campton; tests block external fonts and exercise that fallback. Hosted typography should be reviewed in the eventual authorized environment.

## Validation and previews

- `npm test`: **8 passing checks** covering all nine exact prices, billing wording, null/unsafe links, Lagos/late-evening/overnight/rollover schedules, no custom payment stack, no legacy checkout links, local links/assets, form/no-JS/reduced-motion markup and static build exclusion.
- The preservation test reads every tracked file from `origin/main` and confirms all are byte-for-byte unchanged except the explicitly allowed `.gitignore`, one-link `index.html` edit and one-entry `sitemap.xml` edit. In particular packages, historic contest, generic welcome and unrelated original assets are unchanged.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` (local server port 8770): contact-hours, late-evening, overnight; malicious paid/verified/reference/token URL claims discarded; all nine selections show exact totals and disabled unconfigured payment links; optional profile failure/retry and keyboard details; reduced motion; no-JS contact/profile; 320/390/768/1440px reflow. All nonlocal requests are blocked and form responses are mocked. No Paystack requests/transactions occur.
- JS syntax checks and `git diff --check` pass. `npm run build` produces a static-only `public/` with the Netlify form included; it excludes docs, tests, tooling, npm files and Git metadata.
- `docs/previews/`: welcome desktop/mobile, after-hours welcome, new Heroes marketing/pricing and disabled hosted-payment handoff. These show generic manual-verification copy, not a real or mock verified purchase claim. Screenshot animations are completed for stable review.

Still unverified: owner-created hosted page values, actual recurring-channel support, native Paystack notification/receipt delivery, actual Netlify form registration/storage, dashboard publish overrides, hosted fonts and staffed callback coverage. These require the dashboard actions/authorized environment above, not custom infrastructure.
