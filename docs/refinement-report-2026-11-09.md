# PR #5 continuation — 9 November 2026

Design checkpoint: the subsequent [design-led refinement](design-led-refinement.md) and [new before/after gallery](design-led-previews/README.md) supersede the earlier floating-photo and static-note composition described here.
Continue the existing `feat/heroes-final-integration` branch and [draft PR #5](https://github.com/Webtellisense/webtellisense.github.io/pull/5). No new PR, merge, payment activation, account-setting change or production deployment.

## Supplied references and actual visual work

All four images in the owner’s uploaded `pre-ins.zip` were inspected: full Socialander marketing/transportation captures, and earlier Webtellisense Heroes/payment-selection captures. The owner’s PC path was not available in the managed workspace, so the supplied archive was used. [Review and provenance](reference-review-2026-11-09.md), including dimensions/hashes; the images were reference material, not instructions. They are not shipped in the website.

The updated hero uses the existing higher-resolution technical-work photograph behind a soft navy treatment and a smaller contained retail portrait. This avoids enlarging the 612-pixel retail photograph across most of a desktop screen. It preserves the headline, core copy, native typography/palette, illustrative enquiry notes and contact/pricing actions. The pricing comparison remains byte-identical to the reviewed integration. No fake enquiries, results, partner badges or Socialander assets were imported.

The earlier photographic everyday-work examples, collaboration image, real founder-led onboarding, restrained strip/entrance movement and supporting payment-selection image remain. The welcome continues to explain manual Paystack confirmation and personal contact, not redirect-based verification. The carousel’s composition, touch/keyboard controls and opt-in nine-second movement remain, with reduced-motion and pause protections.

No new Unsplash image was downloaded. Existing photo rights/provenance still need confirmation before production reuse; the [manifest](completion-image-provenance.json) records exact source and usage, including the packaged-food illustration. Stock/library imagery is not presented as delivered client work or a Webtellisense team portrait.

## Eight industry priorities

The hub now presents the owner’s order explicitly:

1. Solar and Renewable Energy.
2. Home and Technical Services.
3. Private Schools and Education.
4. Retail and Specialty Stores.
5. Food Suppliers and Specialty Food Businesses.
6. Hotels and Hospitality.
7. Fitness and Wellness Professionals.
8. NGOs and Community Organizations.

Each has its own audience, business problem, service approach and confirmed-experience limitation. Priority reflects fit and known work, not proven results across eight sectors. The [ordered content map](industry-priorities.json) is tested against regression.

New substantive indexable pages:

- `/home-technical-services-marketing`: service coverage, clear scope, genuine job evidence, assessment/contact paths and readiness before paid promotion.
- `/retail-specialty-store-marketing`: accurate local information, product content, stock/price approvals and different retail publishing rhythms. Uses the owner-confirmed stationery/perfume experience without guessing client names or promising historic quantities in Heroes tiers.
- `/food-supplier-marketing`: differentiated catering/local delivery/export enquiry paths, product presentation and confirmed food/social experience. No invented export, shipping, certification or sales guarantee.

Solar and education pages remain. The solar page now distinguishes installers from inverter/battery/equipment suppliers and connects to the separate technical-services page. Its existing `/solar-and-home-services-marketing` canonical stays stable to preserve existing links; no unnecessary URL migration or duplicate indexable page is created. Construction/property remains available as an **additional** project context, outside the new eight-priority order.

Hospitality, fitness and NGO content is substantive hub material with appropriate service/contact paths rather than three thin SEO pages. Hospitality experience is graphic design for a Lagos hotel; fitness/NGO exact deliverables remain unverified. No unsupported booking, fundraising, health or client-result claim is introduced. Homepage and Heroes introductions connect the updated hub and priority routes.

## Accessibility repairs without commercial changes

A small scoped `contrast-repairs.css` adjusts failing text/badge/button hues on the eight pages flagged by the previous scan. Layout, typography, content, values and payment handlers are unchanged. Navy/blue stays the brand foundation; green/orange/purple accents retain their roles with readable tones.

This includes legacy package badges and text, audit labels/options, article CTA text, paid-social/PPC budget notes, campaign buttons/labels and pricing CTA labels. The original packages calculator/data, Paystack processing and approved Heroes comparison are protected by source tests. Shared `main.css`, shared behavior and original images remain unchanged.

Before this continuation: 75 axe contrast-node findings. Fresh final counts and per-selector evidence are in [the browser report](completion-browser-validation.json); no blanket WCAG certification is claimed. The two country solar campaigns still require hosted review because their Tailwind CDN is externally blocked during the controlled run.

## Measurement, privacy, payments and portfolio boundaries

- New marketing/selection measurement remains implemented and tested but **release-gated off**: supplied GA4 `G-PS5FNQCJRN`, Meta destination `null`, no extra GTM on the new pages. Six custom Heroes interaction events are defined; a Paystack handoff is never Purchase/revenue/verified Lead. Existing legacy destinations are preserved. [Event map and exact account checks](completion-measurement.md).
- Owner/account evidence has not established which of the two Meta IDs should receive Heroes data, or the contents of GTM. No fictional ownership or live provider test is claimed. Legal/consent approval is still required before activation; welcome/profile pages remain unmeasured.
- `/privacy-policy` and `/service-terms` remain accessible, clearly labelled noindex **review drafts**, with collection-point links. Final legal identity, lawful bases, retention, transfers, consent and contract decisions are not invented. They remain excluded from the sitemap.
- All nine hosted payment URLs remain null/disabled. No database, Functions, custom webhook, outbox, worker, portal or cart. Existing standalone pricing/payment processing remains unchanged.
- Carousel currently has four supported examples, including agency-owned website/content. Three additional actual repository candidates (school graphic, Maniecu website, Protea hotel flyer) have been visually matched and shown to the owner for reuse permission, including rights for the school photograph. They are **not published on Heroes while permission is pending**. [Evidence and missing assets](completion-portfolio-review.md). The uploaded reference screenshots do not grant project showcase permission.

## Current evidence and release checks

The refreshed [48-page matrix](completion-page-matrix.md) / [JSON](completion-page-matrix.json) covers metadata, canonicals/indexability, share images, trackers, legal links, sitemap, internal links, forms, browser/mobile/accessibility and observed local bytes. The source sitemap contains 33 canonical routes, `/heroes` exactly once, and excludes noindex payment/onboarding/legal-review pages.

All PR #4 editorial links and the earlier integration network are retained. New and revised editorial links around the industry pages are recorded in [the matrix](completion-internal-linking-matrix.csv) and [distribution report](completion-internal-linking-report.json). Navigation/directory cards, legal notices and noindex drafts do not inflate the contextual counts. Source/target/fragments and keyboard/underline/hover checks run against actual markup.

Fresh validation commands: static audit, `npm test`, `test:completion`, `test:heroes`, `test:browser`, `test:links` and `test:measurement`. Unit tests rebuild before browser runs; providers and writes are blocked except explicit synthetic mocks. Exact final counts are appended after the runs. Current screenshots are indexed in [the review gallery](refinement-previews/README.md); prior November 7 screenshots remain historical checkpoints.

Provider constraints remain explicit:

- **Netlify preview routes/headers:** source rules and local emulation can be checked; independent hosted requests are blocked by the managed host allowlist. A GitHub-reported preview build success is not routing or form-storage proof. Live Server may need `.html` because it does not implement Netlify Pretty URLs/redirects; canonical policy remains extensionless HTTPS.
- **Netlify Forms:** static definition, required fields/honeypot, no-JS route, failure/retry and synthetic success are tested. Actual registration, stored receipt and notifications require the owner’s dashboard check. No form submission is treated as paid activation.
- **Legacy forms/campaigns:** two absent PHP handlers and the expired bootcamp’s simulated checkout remain documented exceptions, with honest error/contact routes. This pass does not invent a backend or revive that campaign. Existing business claims require owner evidence.
- **Paystack:** no transaction or account configuration occurs. Only future owner-created, reviewed public hosted URLs can enable payment; manual authoritative checks precede onboarding.

Exact Netlify/Paystack/measurement dashboard actions and legal decisions remain in [the completion report](completion-report.md#netlify-routes-forms-and-exact-dashboard-checks) and [measurement notes](completion-measurement.md#actual-testing-and-owner-actions). No secret key needs to be entered into source code.

### Final run results

- **19/19** unit/source groups pass, including the ordered priorities, original pricing/payment invariants, metadata, public-URL safety and build isolation.
- **48** pages loaded at 320/390/768/1440; **zero** page exceptions and broken local images.
- **46** locally styled pages: **zero** axe findings in the tested load/open-disclosure states. All 75 previously recorded contrast nodes are repaired. Two CDN-styled country campaigns remain explicitly unverified rather than counted as responsive passes. [Before/after counts](contrast-repair-results.json).
- **156** contextual links on **27** indexable source pages pass actual target/fragment, visible underline/focus/hover contrast, responsive and no-JS checks. All 71 PR #4 links and the initial 86-link integration network remain. Two later anchor phrases were updated to separate solar from technical services; destinations stay intact. [Continuation delta](refinement-linking-results.json).
- Heroes contact/late/overnight states, hostile returns, all nine disabled handoffs, optional profile success/failure/retry mocks, comparison, carousel, keyboard, no-JS and reduced motion pass.
- Original core navigation/filter/FAQ/audit/share/drawer-only regressions pass; no payment initialization.
- Synthetic Google/Meta transport tests pass for consent/release/GPC/preview guards, six custom events, filtering, PageView dedupe and withdrawal. No real analytics/account validation.
- Static metadata/schema/link checks, build and diff checks pass. No provider submissions or transactions.

A fresh 9 November read-only `HEAD /heroes` against the Netlify PR preview again received an environment proxy **CONNECT 403 before Netlify**. No hosted route, redirect/header or stored-form success is inferred. Current GitHub/Netlify preview-build status is checked after pushing; it is a build result only. The user-facing hours and timezone remain the approved daily 8 AM–7 PM Africa/Lagos policy.
