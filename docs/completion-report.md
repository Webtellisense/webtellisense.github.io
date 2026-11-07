# PR #5 completion pass

7 November 2026 · `feat/heroes-final-integration` · existing [draft PR #5](https://github.com/Webtellisense/webtellisense.github.io/pull/5) targeting main. This continues the reviewed integration; it does not reopen pricing, introduce a framework/backend, activate payment links, merge or deploy to production.

## Implemented customer experience

- Preserve the reviewed Heroes pricing comparison **byte-for-byte**, its nine totals, monthly/prepaid interactions, Custom option and billing copy. All nine public hosted-payment URLs remain **null/disabled**.
- Retain navy/blue, logo, Campton/Montserrat and the existing page composition. Add a relatable existing shop-owner photograph, layered contrast treatment, clearly illustrative enquiry notes, photographic everyday-work examples, collaboration imagery, real founder-led delivery visuals and a small payment-selection image. No stock subject is claimed as a client or agency staff member.
- Strip movement is a restrained one-time pass, not an unattended perpetual marquee. Entrance effects and hover responses respect reduced motion. No framework or heavy carousel library was added.
- Preserve the portfolio’s visual composition; add agency-owned website/content examples. Four slides are available. Optional nine-second slideshow requires an explicit Play action; hover/focus/visibility/offscreen pauses, manual controls stop it, touch/native scroll works, and reduced motion disables playback.
- Requested **7–8 diverse client stories remain incomplete**, pending actual materials and showcase permission. Existing logos were visually checked and matched conservatively; their presence is not proof of delivered work. [Evidence/permission table](completion-portfolio-review.md).
- Refine welcome surfaces while preserving the real founder, approved headline, visible telephone/WhatsApp/email, conditional manual-confirmation copy, daily Lagos callback windows, late-evening recovery, optional Netlify profile and 30–60-minute onboarding. No welcome view, reference or query parameter is proof of payment.

## Website-wide source work

All **45** public HTML documents, including campaigns and operational pages, are listed in the [page matrix](completion-page-matrix.md), with [full machine-readable metadata, installations, form actions and browser results](completion-page-matrix.json).

| Check | Before this pass | After |
| --- | ---: | ---: |
| HTML documents | 39 | 45 (four industry pages + two review drafts) |
| Complete OG/Twitter field sets | 1/39 | 45/45 |
| Canonical / title / description / JSON-LD source defects | 0 | 0 |
| Broken local file references / fragments | 0 / 0 | 0 / 0 |
| Placeholder privacy/terms links | 29 | 0; destinations explicitly labelled **draft**, not approved policies |
| Pages with accessible privacy information | 0 | 45 |
| Sitemap canonical routes | 26 | 30 |
| `/heroes` sitemap entries | 1 | 1 |
| Contextual marketing prose links | 86 on 20 pages | **126 on 24 pages** |
| PR #4 editorial links preserved | 71 | 71 (all earlier integration links also retained) |
| Source-proven duplicate direct Meta PageViews | 0 | 0 |
| Direct GA4 + GTM overlap pages | 2 | 2; account contents still unverified |
| Missing PHP form backends | 2 | 2; no pretend backend added |
| New Heroes measurement | Missing | Implemented/tested, **release-gated OFF**, Meta destination unselected |
| Controlled load exceptions | 0 | 0 across 45 pages |
| Controlled legacy axe findings | 75 contrast nodes | 75 contrast nodes; new/refreshed Heroes, industry and review pages: 0 |

Metadata fixes complete unique OG/Twitter titles/descriptions/URLs, local share images/alt/dimensions and self-canonicals for operational documents, retaining noindex. Existing Netlify canonical policy stays HTTPS, extensionless, no trailing slash except root. Archived/isolated campaign routes remain accessible without automatically entering the sitemap. Head metadata does not prove live search indexing or a provider’s share-cache refresh.

Add **40** editorial links, principally around the new industry content, while preserving the prior network. Privacy notices and noindex legal prose are excluded from marketing counts. The [CSV matrix](completion-internal-linking-matrix.csv) maps source, destination, anchor, context, reason and retained/new status. [Distribution and repeated anchors](completion-internal-linking-report.json) records the actual counts; repeated generic service terms occur naturally, while new industry-to-Heroes/contact transitions are varied. Relevant educational articles/services remain connected; standalone campaigns/lead magnets are not forced into unrelated editorial links.

Safe campaign/functionality corrections:

- Remove source-proven simulated Solar Launch activity notices.
- Replace its browser-qualified monetary `Lead` with a non-conversion, no-value `SolarAssessmentCompleted` custom event scoped to the existing solar pixel. Preserve its form, WhatsApp flow, offer, price and separate tracker. Opaque Apps Script submission still cannot acknowledge receipt.
- Add accessible draft privacy information at collection points, including the solar assessment and Business Audit Tool. The optional website checker now rejects URLs containing credentials, query parameters or fragments before sending them to the existing AllOrigins proxy. This is a data-minimization guard, not a claim that the proxy is a trusted first-party backend or that results are saved/emailed. Existing audit scoring/XSS repairs remain.
- Original packages prices, calculator/duration data, drawer and Paystack processing remain unchanged; only metadata and labelled draft privacy/service links change in this pass. Existing PHP failures retain honest error/contact recovery.

## Industries and credible positioning

New indexable routes:

- `/industries`: broad client experience versus focused delivery workflows, including different content rhythms across retail/food/hospitality and assessment-led services.
- `/solar-and-home-services-marketing`: clear offers, local visibility, assessment enquiry paths and the existing Solar Launch destination; no fabricated installations or case results.
- `/education-marketing`: school information/admissions, social communication and safeguarding/permission considerations, with practical service/article links; no enrolment guarantees or pupil-data collection.
- `/construction-property-marketing`: applied verified service capabilities and genuine project-evidence principles; capability-led, with no invented construction client case study.

Each has original substantive copy, distinct search intent, Service/CollectionPage schema, metadata, local illustrative imagery, practical FAQs, consultation/audit paths and relevant internal links. No doorway/location-template expansion. Core homepage and existing Heroes navigation connect the hub; no unrelated campaign is repurposed.

## Images and performance

[Image/source manifest](completion-image-provenance.json), [original-preserving optimization record](completion-image-optimization.json), [design research](completion-design-references.md) and [before/after desktop/mobile screenshots](completion-previews/README.md).

Twelve pre-existing large images now have WebP derivatives used by 19 references on nine legacy pages. Their aggregate original sizes are **25,250,341 bytes** versus **1,838,652 bytes** for the derivatives (about 93% smaller); that is an asset-file comparison, not a page-speed/LCP claim. Original files and full-size lightbox destinations remain unchanged. Framing/aspect ratios and transparency are preserved. New Heroes images have explicit dimensions; below-fold images load lazily.

No newly downloaded/licensed Unsplash image was used. A suitable individual free-license source and commercial-license page were researched, but the managed network proxy denied its download. Existing library photo license receipts/model releases are not in the repo; confirm provenance before production reuse. Named-project permission must also be confirmed; do not equate an existing logo with permission or a delivered identity project.

## Measurement and legal review

[Event map, destination rationale, consent design and account actions](completion-measurement.md). Only one direct GA4 path is prepared for new marketing/selection pages; GTM is not duplicated. The config remains `releaseApproved: false`, GA4 `G-PS5FNQCJRN`, Meta `null`. Owner access must establish the chosen Meta destination and confirm GA4 ownership/account collection settings. No new live tags are silently activated to compensate for that missing evidence. Welcome/profile/legal pages stay outside optional measurement; previews/local hosts are suppressed.

The six custom Heroes interactions are period selection, tier selection, Talk to Sales, Call, WhatsApp and Paystack handoff. No Purchase, verified Lead, revenue, form values or customer-identifying event parameters. A Sales WhatsApp click intentionally emits a sales-intent event and a channel-click event, not two conversions. Pre-consent events are discarded; optional provider requests require a choice and support withdrawal/GPC. Account automatic/enhanced collection must be checked before release; new code cannot certify legacy GTM/Meta behavior.

Draft routes `/privacy-policy` and `/service-terms` are **noindex and out of the sitemap**. All new links disclose their draft status. The privacy draft covers actual Netlify Forms, messaging/email, Paystack, Google/Meta, Tally, Apps Script, AllOrigins and external assets, with source/account limitations. Service disclosures reproduce only approved Heroes billing/manual activation/personal onboarding information. They do not invent minimum terms, deliverable quantities, refunds, legal identity, retention periods or a compliance claim.

**Owner/legal publication blockers:** legal/controller identity and contact particulars; lawful bases; actual provider recipients/contracts/international-transfer safeguards; retention/deletion; newsletter/measurement consent; legacy tags/embeds; rights/security/incident handling; final contract cancellation/refund/tax/ownership terms. Nigeria’s Data Protection Act 2023 and NDPC’s 2025 GAID are the starting points. Official NDPC search excerpts and provider privacy materials informed this draft; direct official Act/GAID PDF reads were blocked, and no full legal review is claimed. Reference URLs are retained in the page and measurement/design notes; the owner/legal adviser must review current authoritative requirements before publication.

## Fresh validation

Run unit/source checks and build **before** browser scans; unit tests rebuild `public`. Do not rebuild that directory concurrently with a scan.

- `python scripts/completion-audit.py`: all 45 source documents, metadata/share fields, schema JSON, local targets/fragments, form definitions, sitemap and tracker inventory.
- `npm test`: **18 passing groups**, including exact preserved flagship comparison, all approved totals/disabled URLs, unchanged package processing, source safety, JS syntax, static build isolation and sensitive-URL rejection with no network call.
- `npm run test:heroes`: callback/late/overnight states, hostile return parameters, nine disabled handoffs, optional profile success/failure/retry mocks, pricing/mobile controls, keyboard slider, no-JS/reduced-motion and reflow.
- `npm run test:browser`: original shared interactions, audit injection/share, scroll handlers, mocked backend errors, drawer-only checkout and core reflow. No charge initialization.
- `npm run test:links`: **126** actual contextual anchors, all targets/fragments, underlines, visible keyboard focus, hover contrast, 320/390/768/1280 reflow and no-JS anchors.
- `npm run test:completion`: **45** local page loads, 320/390/768/1440 layouts, all new pages/no-JS, optional carousel playback/pause, screenshots and axe with disclosures open. Zero exceptions/broken local images. [Per-page results](completion-browser-validation.json).
- `npm run test:measurement`: synthetic SDK/collector requests for release/consent/GPC/preview gates, six events, filtering, PageView dedupe and withdrawal. [Evidence](completion-measurement-validation.json). No actual provider SDK/account behavior is asserted.
- `git diff --check` and static build pass.

**Limits:** 75 existing contrast nodes on PPC, packages, audit, two social/article treatments, bootcamp, solar and pricing remain documented per selector. Two country solar pages depend on an externally blocked Tailwind CDN; their unstyled overflow is recorded, not called a mobile pass. No sitewide WCAG certification or Lighthouse/Core Web Vitals result. Legacy source/business claims (including campaign testimonials/guarantees) still require owner substantiation. The expired bootcamp’s alert-only checkout is preserved as an isolated campaign, not described as working Paystack.

## Netlify routes, forms and exact dashboard checks

Verified source settings: root base, `npm run build`, publish `public`, Node 22. Only static website assets/routes are copied; docs/tests/tooling/secrets are excluded. No Functions, database, custom webhooks, scheduled jobs or notification workers.

Local route tests cover `/heroes` (200), `/heroes.html` and `/heroes/` (301 to `/heroes`), and old marketing aliases (301). Canonical is always `https://webtellisense.com/heroes`. **Actual hosted response/header validation remains blocked by the executor’s enforced host allowlist**: the earlier read-only preview HEAD reached a managed proxy `CONNECT 403` before Netlify. It was not a Netlify route failure. No routing/canonical change is made to accommodate that environment denial.

Live Server at `127.0.0.1:5500` serves physical files and may need `/heroes.html`; it does not interpret Netlify `_redirects` or guarantee Pretty URLs. Use `node scripts/serve-preview.cjs public 8791` for local route emulation. That emulation is not Netlify delivery proof.

Existing PR preview: https://deploy-preview-5--webtellisense.netlify.app . PR pushes may update it through the existing GitHub integration; no manual deploy or production setting is changed here. The initial integration commit had a successful Netlify check. Current-commit status is recorded below after the push; an account-reported successful build still does not prove form delivery or route headers.

Only the owner/account holder can complete:

1. **Netlify → Build & deploy / Deploy Previews:** confirm linked repository/PR #5, root `npm run build` → `public`, Node 22 and preview status. Inspect the preview URLs above, aliases, canonical source and headers. Keep production untouched. If the environment needs hosted test access, allow the preview host in environment settings; that is separate from a Netlify routing change.
2. **Netlify → Forms:** confirm `heroes-business-profile` was detected on the preview, including form-name/honeypot and fields. With synthetic data only, check a submission actually appears in the dashboard, then test configured email notification and failure recovery. Verify recipients/spam/access/retention with the approved privacy decision. Existing newsletter forms also require receipt checks. A successful HTTP mock is not stored delivery. A profile notification is never a verified-purchase alert.
3. **Paystack dashboard (future configuration; not activation in this PR):** confirm owned account, create/review three monthly subscription pages and six fixed prepaid pages for the already approved prices, review their return/contact/notification settings. No invented URLs are enabled here. Staff must verify the actual successful record/amount/tier/period and arrange onboarding personally. Native provider alerts/manual reconciliation remain the simple operational approach, without a custom delivery stack.
4. **GA4/GTM/Meta accounts:** complete the precise ownership, automatic-event and consent checks in [measurement notes](completion-measurement.md). No account setting was changed.

Separate approval/evidence work (not dashboard setup): finalize legal drafts, confirm original photo rights, approve named showcases/supply missing assets, substantiate legacy campaign claims and resolve the previously documented old-package duration terms. These are not reasons to alter the final Heroes prices.
