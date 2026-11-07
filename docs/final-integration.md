# Final website integration and Heroes flagship

7 November 2026 · branch `feat/heroes-final-integration` · based on main `b639eeb`.

This branch combines PR #3 at `eab6a23` and PR #4 at `1dab681`. The original PRs and main are unchanged. Draft integration PR: [#5](https://github.com/Webtellisense/webtellisense.github.io/pull/5). Local integration commits preserve both histories; no GitHub PR has been merged. No production deployment, production settings change, live payment or real customer-form submission was performed.

## Finished customer experience

- **`/heroes`** is the official flagship, served by `heroes.html`. The obsolete Business Heroes Challenge has been replaced with the owner's approval. No contest dates, prizes, entry form or contest legal fragments remain on that page.
- `webtellisense-heroes.html` is removed. `_redirects` sends its old HTML/extensionless/slash forms, and `/heroes.html` / `/heroes/`, to `/heroes` using permanent redirects. `/heroes` internally serves the HTML file. Its single canonical and OG URL are `https://webtellisense.com/heroes`; the sitemap contains that URL once and no old marketing alias.
- The landing page explains the unified outsourced team, the coordination problem it solves, the areas of execution, how onboarding/management work, approved pricing and billing, existing portfolio work and FAQs. It uses image-led navy overlays, the actual logo, Montserrat/Campton, soft section shapes, editorial compositions and restrained reveals/entrances. There is one manually controlled portfolio slider, with swipe, keyboard and previous/next controls; no autoplay or new animation dependency.
- The comparison has a native billing-period control and mobile tier switch. It displays exact totals, updates only the selection link, and preserves all nine prices in a native disclosure/table without JavaScript. Custom goes to Sales. No frontend price calculation determines a charge.
- The welcome keeps **“You're in. Let's get to work.”**, the real founder portrait, a clearly pending/manual payment check, prominent telephone number/WhatsApp/email, an overlapping callback note, a fuller-onboarding explanation and optional Netlify profile. Customer-initiated contact remains available anytime; no overnight answer is promised.
- The selection page remains a simple hosted-page handoff. All **nine payment URLs remain null and disabled**, with Call/WhatsApp alternatives. No fake payment page, key, receipt, customer-specific verified tier or paid status has been added.
- The old general `welcome.html` is now neutral and public: no Base64 validation, false paid badge, access-denied gate or token-based personalization. The existing public Tally URL is retained without forwarding customer parameters. No-referrer/no-store protections are configured. **The only payment-flow change in `packages.html` is the approved privacy-safe return to generic `/welcome.html` instead of putting customer details in a Base64 URL.** Its pricing, data, invoice/duration calculations, Paystack initialization/options/key/amount/currency, metadata sent to Paystack and cancellation handler are unchanged. Its header gains the same Heroes navigation link as the core site.

### Scope truthfulness

All nine prices and billing models below are final. The source materials do **not** confirm a per-tier deliverable/quantity matrix, website entitlement or fee/media split. The site therefore describes the agreed areas of team responsibility and asks Sales to confirm exact tier scope **before payment/activation**. It does not invent checkmarks, quotas, “unlimited” work, a new-website entitlement, contract minimums, discounts beyond the approved totals, trials, refund/cancellation policies or guaranteed outcomes. Tier names are simply Heroes V1/V2/V3, not separate sub-brands.

| Heroes tier | Monthly recurring, where supported | 3 months prepaid, one-time | 6 months prepaid, one-time |
| --- | ---: | ---: | ---: |
| V1 | ₦350,000 | ₦1,012,500 | ₦1,950,000 |
| V2 | ₦600,000 | ₦1,755,000 | ₦3,420,000 |
| V3 | ₦1,000,000 | ₦2,932,500 | ₦5,730,000 |
| Custom | Talk to Sales | Talk to Sales | Talk to Sales |

Advertising allocations are included. Prepaid discounts apply to agency fees only. Monthly uses Paystack-managed subscriptions where supported; three/six months have manual renewal. The website never substitutes a one-time monthly page for an unsupported subscription channel.

## Integrated sitewide work

All PR #4 source repairs are retained: canonical/OG/entity alignment, JSON-LD repairs, metadata, sitemap, links/assets, scoped Meta PageViews, once-only checkout/scroll analytics, guarded shared JavaScript, keyboard/field/iframe semantics, safe audit-result/error rendering and honest audit completion copy. GA4/GTM configurations remain intact; the two unproven installation overlaps are not silently removed.

**All 71 PR #4 contextual links are preserved**, checked against an immutable source-PR snapshot. Ten additional in-body links now lead to Heroes from home, About, the audit wrapper, Pricing, three relevant services and three articles. The flagship adds five contextual service/next-step references. The current prose-only graph has **86 links on 20 source pages**. Header/footer/card/button links are excluded. Core navigation also exposes Heroes; alternate-home Heroes references now use the official flagship instead of the legacy package fragment.

[Current full linking inventory and matrix](integration-linking-inventory.json) · [Preserved PR #4 baseline](pr4-contextual-links.json) · [Ten new incoming placements](integration-link-additions.json).

| Check | Original main audit baseline | Integrated source |
| --- | ---: | ---: |
| HTML documents reviewed | 36 | 39 |
| Canonical-defective indexable pages | 33 | 0 |
| Missing local file/asset references | 93 | 0 |
| Broken fragment references | 28 | 0 |
| Invalid JSON-LD / incorrect schema MIME | 1 / 1 | 0 / 0 |
| Missing/empty/duplicate description pages | 10 | 0 |
| Duplicate sitemap entries / missing routes | 1 / 1 | 0 / 0 |
| Extra direct Meta PageViews per destination | 4 | 0 |
| Untitled iframes / unlabelled field candidates | 7 / 47 | 0 / 0 |
| GA4 + GTM overlap requiring account evidence | 2 | 2 |
| Missing repository PHP backend references | 2 | 2 |
| Unresolved legal-policy placeholders | 33 | 29 |

The removed contest accounts for the final two fragments and four legal placeholders; no policy text was fabricated. Source-indexability is not confirmation of actual Google indexing. Operational welcome/selection/profile pages remain noindex and are absent from the sitemap. Campaign isolation and unrelated offers are preserved.

### Original audit status after integration

| Finding | Current result |
| --- | --- |
| A01 | Fixed under the approved manual-activation model: neutral welcome, generic legacy return, no customer URL payload or browser-paid gate. Staff verification remains required. |
| A02 | Heroes billing is correct. Legacy package billing/duration calculations are deliberately preserved and still require the previously documented commercial decision. |
| A03–A08 | Audit completion/rendering, direct duplicate tracking, canonical and sitemap source repairs retained. Exact production CDN/redirect/account behavior still needs provider checks. |
| A09 | Frontend semantics, safe error rendering and contact alternatives retained; real PHP/Netlify delivery remains unverified. |
| A10 | Expired bootcamp remains isolated and out of the sitemap. Its alert-only payment flow is unchanged, as required for unrelated campaigns. |
| A11 | Placeholder pricing CTAs repaired; 29 legal placeholders remain owner-supplied policy work. |
| A12 | Fixed: `/heroes` is the flagship; obsolete contest replaced with explicit approval and old marketing aliases redirected. |
| A13–A14 | Guarded shared behavior and valid intended JSON-LD retained; all-page controlled load exceptions are zero. |
| A15 | Local file and fragment defects are zero. Original photographic files are intact; prior explicit “Image unavailable” fallbacks remain for unavailable legacy assets. |
| A16–A17 | Accessibility/token repairs retained. New Heroes/operational pages and neutral general welcome have zero axe A/AA violations in the controlled scan; 75 contrast-node findings remain on unrelated legacy treatments. No site-wide WCAG certification is claimed. |

## Payments, callbacks and optional profile

No PostgreSQL, custom orders, Functions, webhook, outbox, worker, scheduler, portal, payment API or alert-delivery stack exists in this implementation. Paystack holds payment/subscription records; Netlify handles optional profiles. No secret keys or payment environment variables are needed. The build-time Node scripts are development/static-copy tools, not a deployed server.

A return, reference, selected tier, screenshot, profile submission or browser state is never paid evidence. Staff must open the actual merchant record in Paystack and confirm successful payment, reference, exact NGN amount, tier/period and hosted page/plan before activation. For monthly, confirm a successful first transaction associated with the correct recurring plan. Check existing client records to avoid acting twice on a repeated reference. Resolve pending/failed/mismatched/refunded/disputed transactions before activation or asking someone to pay again.

Callback policy remains configurable in `assets/js/heroes-config.js`: daily **08:00–19:00 Africa/Lagos**. After manual payment confirmation within the supported window, target 1–2 hours. Late-evening copy shows this evening or the next 08:00 window; outside hours it shows the next morning window. Before 08:00, that is the same morning. The client clock changes an availability hint only. No paid or activation timer starts from a page visit. The first contact arranges the full **30–60-minute onboarding**; optional profile completion is never required before it.

The profile asks only for business name, email, an optional public URL and optional priority. No passwords, card data, API keys, recovery codes, uploads or sensitive account credentials. Access is arranged personally through appropriate platform invitations. Existing Netlify field names, honeypot, native POST fallback and confirmation route are retained. A 2xx submission acknowledgement does not establish email delivery, payment or activation; failed submission retains the answers and enables retry. A direct visit to the profile follow-up page does not claim that a form was stored.

The [personalized 30-day activation-plan template](heroes-activation-plan-template.md) is retained for the team to complete after discovery. One-off/add-on work still needs a separate quote and approval; no cart was introduced.

## Build, routing and preview

Verified locally: repository-root static build, **`npm run build` → `public`**, Node 22 configured in `netlify.toml`. The output includes all intended HTML/assets, country campaigns, robots, sitemap, manifest and `_redirects`. Docs, tests, scripts, npm/Git metadata and development dependencies are excluded. No Functions are built. `scripts/serve-preview.cjs` is a local-only static route emulator; POST returns 405 unless a test explicitly mocks it. It is not a Netlify runtime or delivery backend.

The integration branch's ignore command skips branch/production-context builds for this review branch and **allows `deploy-preview`**. Main and production settings have not been changed. Deploy Preview support/configuration is prepared in source, but this environment has **no Netlify connector, CLI login, site link or configured credential**. After draft PR #5 opened, the repository's Netlify integration reported **success** for `netlify/webtellisense/deploy-preview`, with the actual target [https://deploy-preview-5--webtellisense.netlify.app](https://deploy-preview-5--webtellisense.netlify.app). No dashboard setting was changed by this agent. The [official Heroes preview](https://deploy-preview-5--webtellisense.netlify.app/heroes) is available for owner review.

A read-only HEAD request from this execution environment was blocked **before reaching Netlify** by the environment proxy (`CONNECT 403`), so actual preview HTTP headers/redirect responses, rendered pages, form registration/storage and provider delivery are **not independently verified here**. This is not a reported 403 from the deployed website. Local route/browser tests and Netlify's successful build status are distinct evidence; neither is claimed as a real form or payment test.

Netlify's documented PR workflow and build settings were checked: [Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/), [build configuration](https://docs.netlify.com/build/configure-builds/overview/), [redirect status/force options](https://docs.netlify.com/manage/routing/redirects/redirect-options/).

## Exact dashboard actions requiring owner access

None of these actions was performed. Use a test account/context first; do not enable live payments or change production settings during this review.

### Paystack

1. In Payment Pages, create/link **three Subscription Payment Pages** using monthly plans with the exact monthly totals in the table. Confirm the account/channel supports recurring payments. Use fixed existing plans, not customer-selected amounts or intervals.
2. Create **six fixed-amount one-time pages** for the three/six-month totals. Do not attach quarterly or biannual recurring plans. Name each by Heroes tier and prepaid duration; state that advertising allocation is included and renewal is manual.
3. Collect reachable customer phone numbers as well as email/name. Configure native customer receipts and business transaction notifications to monitored internal recipients. Confirm notification delivery using test payments; dashboard review is the operational fallback, not a website webhook.
4. Set the post-payment return to the approved site's `/heroes-welcome.html`, with no customer data or paid/verified flags. Check merchant identity, NGN currency, amount, tier/period and renewal description on every page.
5. Supply the **nine public page URLs** for a reviewed configuration change to the matching null entries in `assets/js/heroes-config.js`. No secret key is needed. Keep links disabled until scope and hosted amounts have been reviewed.

These actions follow the current [Paystack Payment Pages guide](https://support.paystack.com/en/articles/2132546) and [subscription documentation](https://paystack.com/docs/payments/subscriptions/). The website uses hosted pages, not the documented API implementation.

### Netlify — preview only

1. The repository integration has already created PR #5’s successful Deploy Preview; no connection/enablement change is currently needed. Open that preview from the PR check in the correct Netlify project. Do not change the production branch or activate a production/branch deploy. If preview configuration is later needed, its documented location is **Project configuration → Developer settings → Continuous deployment → Branches and deploy contexts → Configure**.
2. In the **preview build log**, confirm the repository configuration resolved to `npm run build`, root base and `public` publish output. The committed configuration supplies these; no global production build-setting change is requested. If hidden project overrides prevent this, resolve them in an isolated preview context.
3. Enable/check **Forms detection** in the test/preview context. After the approved preview exists, verify `heroes-business-profile` and all its static fields are registered. Submit synthetic test details and confirm actual stored submission, success/failure behavior and native POST fallback. Configure restricted internal form notifications and review access/retention/privacy handling. Profile notifications must never be treated as paid-purchase alerts.
4. On that preview, verify `/heroes`, HTML/slash/old-name redirects, noindex/no-referrer/no-store headers, profile routing and existing forms/WhatsApp links. Use Paystack **test** pages/credentials only for provider validation; no real transactions.

## Remaining release blockers and checks

- **Heroes payment activation:** nine owner-created/reviewed hosted URLs and actual recurring-channel support. All links are safely disabled until configured.
- **Tier scope:** owner-approved delivery responsibilities/quantities and allocation details, if a per-tier inclusion matrix is to be published. Prices are settled and not being reopened.
- **Provider verification:** actual Netlify preview registration/storage and Paystack receipts/notifications have not been tested. Staff must monitor Paystack during contact hours and at opening for overnight purchases; no overnight response guarantee is published.
- **Existing site:** live PHP/form routing, GTM/account duplication, remaining legacy contrast, policy documents and old package-duration/expired-bootcamp decisions remain the previously documented issues. They were not silently replaced with invented integrations or policies.
- **Release:** production DNS/CDN/redirect behavior and live configuration require a separately approved release. No production deployment or PR merge is authorized here.

## Tests actually completed

- `npm test`: **14 passing groups** covering all approved amounts, hostile/unsafe hosted URLs, schedule boundaries/rollover, no custom backend/secrets, source/assets preservation, static form/build inclusion, SEO/link/schema scans, original legacy charge calculations/options and tracking preservation.
- `npm run test:heroes`: all nine disabled handoffs; untrusted amount/paid/reference/token claims; manual welcome; callback/late/overnight behavior; optional profile failure/retry with mocked responses; period/mobile-tier comparison; keyboard/manual carousel; canonical redirects; 320/390/768/1440px reflow; reduced motion and no-JavaScript prices/contact/profile/general-welcome fallback. All third-party requests and unmocked writes blocked.
- `npm run test:browser`: original shared nav/FAQ/filter keyboard behavior, audit injection/share, once-only guide scrolls, safe mocked mail errors, drawer-only legacy checkout smoke test and representative reflow. No Paystack initialization/submission.
- `npm run test:links`: **86 actual prose links on 20 pages**, including the preserved 71; local target/fragment responses, 320/390/768/1280px reflow, underline/hover contrast/keyboard focus and static anchor presence without JavaScript. Providers/writes blocked.
- All-page Chromium: **39 after-page loads, zero load exceptions**; axe A/AA on 37 locally styled pages. New Heroes pages and general welcome have zero violations in that run. **75 existing contrast-node findings remain** on unrelated legacy pages; no link-in-text-block failures remain. Country solar pages still require their CDN runtime for a production-faithful visual check. Source body/header/nav type/colour samples match main except the explicitly replaced Heroes design.
- `npm run build`, JavaScript syntax and `git diff --check` pass. Source scanner reports zero missing files/fragments and zero intended JSON-LD parse failures. No actual provider delivery, charge or merchant-account verification is claimed.

Evidence: [source scan](integration-static-validation.json), [all-page browser scan](browser-validation.json), [contextual browser checks](internal-linking-browser-validation.json). The original audit and source-PR reports are historical evidence, not substitutes for this integration report.

To reproduce: `npm ci`, `npm run build`, then `node scripts/serve-preview.cjs public 8791`. Set `CHROMIUM_PATH` if Chromium is not `/usr/bin/chromium`. Run the commands above from the repository root. The all-page historical comparison also needs the original `b639eeb` tree served on 127.0.0.1:8782. Regenerate current scans with `python scripts/audit_site.py docs/integration-static-validation.json` and `python scripts/integration-link-inventory.py`.

## Screenshots

[Flagship first screen](integration-previews/heroes-fold.png) · [Welcome first screen](integration-previews/heroes-welcome-fold.png)

Local Chromium renders with external providers/fonts blocked and local font fallback. Full pages show the actual generic/manual-verification state, never a verified customer purchase.

- [Flagship desktop](integration-previews/heroes-desktop.png) · [Flagship mobile](integration-previews/heroes-mobile.png)
- [Welcome desktop](integration-previews/heroes-welcome-desktop.png) · [Welcome mobile](integration-previews/heroes-welcome-mobile.png)
- [After-hours welcome](integration-previews/heroes-after-hours.png) · [Disabled hosted handoff](integration-previews/heroes-hosted-handoff.png)

## Design reference study and limits

No previously supplied reference screenshots are attached in this task, and no Reflections implementation is present. Actual `index.html`, main CSS/typefaces, services/pricing, portfolio and the four PR #3 optimized derivatives were reviewed. Original image files are unchanged: founder `team/team-0.jpg`, business conversation `about.jpg`, Crayfish identity `portfolio/branding-33.jpg` and BGIS `portfolio/website-2.png`.

[MTN broadband/FibreX](https://www.mtn.ng/broadband/fibrex/) informed direct product explanation, concise benefit presentation, clear prices/periods and repeated useful actions. [Nestuge Plus](https://nestuge.com/plus) informed unified-product storytelling and short capability explanations. [Selar's official getting-started guide](https://help.selar.com/portal/en/kb/articles/how-to-sign-up-on-selar-17-6-2024-1) and [creator resource layout](https://selar.com/blog/) informed approachable action language and an obvious next step. These are design principles, not cloned templates, copy, testimonials or borrowed imagery.

Public content/structure was read from official sources. The remote reference browser could not navigate due an internal browser-requirements error; Selar's homepage reader returned 403. No claim is made that missing screenshots or unavailable live visual/interactive states were inspected. The finished Webtellisense experience itself was rendered, inspected and tested locally at desktop and mobile sizes.
