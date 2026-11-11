# Webtellisense repository guide

Verified on 2026-11-06 against commit `b639eeb`. These are repository facts and task constraints, not confirmation of live hosting or business claims.

## Scope and approval boundary

- Preserve the existing brand, layouts, intentional styling, content and functionality. Do not redesign pages or replace the visual identity.
- The current task authorizes discovery, an audit, this guide and a proposed improvement plan. Present proposals before implementing website changes.
- Do not change live payment integrations without approval. Do not deploy. Do not submit real payments, customer forms or analytics conversions as tests.
- Do not invent testimonials, results, company details, policies, guarantees, prices or product scope. Obtain approved business information for those changes.
- Preserve existing work. Inspect `git status` before editing. Do not commit or push unless requested.

## Architecture and paths

- Static, multipage HTML repository: 36 HTML documents (34 at root plus `nigeria/solar.html` and `bahamas/solar.html`). `index.html` is the root entry document.
- No package manifest, application framework, build pipeline, automated test suite, backend implementation, deployment workflow or host routing configuration was found in this checkout. The repository name does not prove the production host.
- Shared header/footer markup is copied into many pages; there is no template/component compiler. Check all affected copies when proposing shared changes.
- `assets/css/main.css` is the shared stylesheet. Page-specific styles include `audit.css`, `guide.css`, and substantial inline styles. `services.css` is empty. `homepage-additions.css` and `assets/js/theme-toggle.js` are used by `indexxx.html`, not the root homepage.
- `assets/js/main.js` initializes navigation, scroll effects, hook cards, lightboxes, portfolio filters, FAQ interactions and Swiper. It assumes particular DOM nodes and vendor globals; do not add it to standalone pages indiscriminately.
- Local vendors include Bootstrap 5.3.3, Bootstrap Icons, AOS, GLightbox, ImagesLoaded, Isotope, Swiper, Waypoints and the PHP-email-form browser validator. The validator is not a mail backend.
- `assets/scss/Readme.txt` says Sass sources require the template's pro version; do not assume a Sass build is available. Preserve vendor/license notices.
- Country solar pages use Tailwind's CDN runtime, Lucide and their own fonts/styles. They are intentional design variants; do not homogenize them without an approved task.

## Brand and UI conventions

- Main brand tokens in `assets/css/main.css`: deep navy `#01033e`, strong blue `#0331b0`, bright accent `#0033ff`; white and gray surfaces.
- Primary typeface is Montserrat; secondary is Campton, with local OTF assets. Other page-specific font imports exist.
- Existing patterns: Bootstrap containers/grids, sticky header and dropdown navigation, hero carousel, blue CTAs, WhatsApp contact button, portfolio lightbox/filter grid, testimonials, FAQ and package tier cards/badges.
- Theme helpers use `.light-theme` / `.dark-theme`; the alternate homepage stores `wts-theme` in localStorage. Several legacy CSS variable names coexist: inspect the cascade rather than assuming token consistency.
- Keep `.html` file URLs as the verified local routes. Extensionless URLs occur in source but their live resolution is unverified. Root-relative assets require serving from the repository root, not opening files directly.

## Content and product structure

- Main pages: home, about, contact, FAQ, reviews, blog, pricing, packages and ten service pages (web design, GBP, PPC, social management, paid social, branding, graphics, email, content and CRO).
- Portfolio is an existing section at `index.html#portfolio`; no `portfolio.html` file exists.
- `business-audit-tool.html` embeds `audit.html`. `freeguide.html` is a lead magnet; `roadmap.html` is a standalone roadmap.
- `heroes.html` is a March–April 2025 Business Heroes Challenge, not a current product landing page. `packages.html` separately offers Heroes Ecosystem V1/V2/V3. Preserve the contest history and resolve URL/product ownership before changing either.
- Other campaign pages: `solar.html`, `webtellisense-solar-landing.html`, country solar briefings, `kids-holiday-uyo.html`, `indexxx.html` and template-derived `blog-details.html`. Do not delete or redirect them based solely on their filenames or low internal linking.

## SEO, analytics and integrations

- Source uses `https://webtellisense.com` as its public origin. Verify actual origin, redirects and route policy before canonical or sitemap changes. Canonical copying is a known defect, not a convention to follow.
- `sitemap.xml` and `robots.txt` are hand-maintained. `welcome.html` intentionally has `noindex, nofollow, noarchive`; do not add it to the public sitemap.
- GA4 ID: `G-PS5FNQCJRN`; GTM container: `GTM-NJ6L82XR`. Direct Meta IDs: `806267492040936`, `623478247158411`, and solar-specific `1710018810217099`. Ownership and GTM contents are unverified; do not arbitrarily consolidate them.
- `packages.html` contains the live Paystack Inline v1 flow, client-side package data and calculator, callback and redirect. The public publishable key is not a server secret; never add secret payment keys to HTML.
- `welcome.html` decodes Base64 query data and embeds Tally. This does not authenticate payment. Preserve the flow until an approved verification design exists; never represent the current gate as secure.
- Contact form targets absent `forms/contact.php`; template newsletter targets absent `forms/newsletter.php`. Many footer subscriptions use Netlify attributes. Their server-side handling is not present here.
- `freeguide.html` POSTs to `/` and then opens WhatsApp. `solar.html` POSTs to Google Apps Script with `no-cors`. `audit.html` has an unconfigured Sheets URL and a third-party website-check proxy. Do not assume successful receipt from UI messages or opaque responses.

## Verification workflow

- Use read-only static inspection first: parse every HTML head, script installation, schema block, link, fragment, asset and form destination; review shared JS/CSS and inline campaign code.
- Node `--check` can check first-party JS syntax; it cannot verify DOM behavior, external dependencies or provider delivery. JSON-LD requires separate JSON parsing and schema validation.
- A local preview can use `python -m http.server 8000 --directory /workspace/webtellisense.github.io`; never treat that as production route or integration verification.
- Before any approved implementation ships, check desktop/mobile layouts, keyboard operation, focus management, form delivery, analytics deduplication and approved Paystack sandbox scenarios. Do not test against live payment or marketing endpoints unintentionally.
- Findings, evidence, proposed work and deployment acceptance criteria are in `docs/website-audit.md`; the full static page/link inventory is in `docs/audit-inventory.json`.


## Authorized technical repair follow-up (7 November 2026)

The user now authorizes confirmed, low-risk site-wide technical fixes, commits, a pushed NEW main-based branch and a draft PR targeting main. This supersedes the earlier audit-only wording above. Preserve original visual identity, content/claims and service prices; do not bring over payment infrastructure or PR #3's customer experience. Do not merge/deploy or change hosted settings. Old payment verification/billing changes require a separate exact approval proposal. Retain all GA4/GTM installations until account-level duplication is proven. Preserve intentional separate Meta IDs, scoping duplicate PageView commands per destination. Retrieved baseline files remain historical evidence; new counts and acceptance evidence belong in separate repair reports.

Canonical policy for this repair: HTTPS `webtellisense.com`, trailing slash only on the root, extensionless Netlify Pretty URLs for HTML documents, e.g. `/about` and `/nigeria/solar`. The original `.html` guidance above described filesystem paths and is superseded for canonicals/sitemap. Existing working `.html` links remain aliases; no rewrites or redirects are added. `indexxx.html` retains its original homepage canonical. Operational welcome is noindex; the confirmed unfinished blog template is now noindex. Expired/uncertain campaigns remain accessible and are not silently archived or repurposed.

Run `python scripts/audit_site.py docs/technical-after.json`, `npm test`, `npm run test:browser`. The controlled all-page before/after and axe run is `node tests/browser-scan.cjs` with read-only baseline/current local servers on ports 8782/8781. Block all external providers and POSTs except explicit mocks; never initialize Paystack. Keep baseline records historical. `docs/technical-repair-report.md` maps A01–A17 and documents actual verification limits; the payment proposal patch is NOT applied.

## Editorial internal-linking follow-up (7 November 2026)

The user authorizes extending PR #4 on this same branch with an editorial network across existing indexable core content. Preserve payment/pricing/legal/script behavior and campaign isolation; the Heroes marketing file is still absent here, so its connections remain a documented plan. The actual prose-only inventory, relationship map, distribution and existing/new link matrix are in `docs/internal-linking-report.md`. `docs/contextual-links.json` now records the complete current matrix. Regenerate evidence with `python scripts/internal_link_inventory.py`; it compares against pre-editorial PR #4 commit `7306504`. Use descriptive in-body anchors, never navigation/footer/button counts as editorial coverage. Keep contextual links underlined with visible keyboard focus. Run the existing static/functional regressions plus `npm run test:links` against the local server; all providers and writes must stay blocked or explicitly mocked.

## Approved final integration (7 November 2026)

This task authorizes combining PR #3 and PR #4 on this new main-based integration branch, finishing the flagship/welcome design and creating one draft integration PR. This supersedes the earlier prohibition on replacing the historic contest: the owner explicitly approves replacing `heroes.html` completely. `/heroes` is the one canonical flagship route; the previous marketing path must redirect, not stay indexable. Keep PR #4's technical fixes and 71 contextual links, and connect the flagship editorially. The owner also approves a neutral manual-verification general welcome; preserve packages.html pricing and Paystack processing. Use only the simple hosted Payment Pages/configuration from PR #3; no database, Functions, webhook stack or secrets. Approved nine prices and callback policy are fixed. Unknown tier quantities/entitlements must not be invented. Preserve optional Netlify profile and existing unrelated form/WhatsApp flows. Preview-only Netlify builds are authorized if connected; production deployment and all merges remain prohibited. Record actual validation and missing dashboard access honestly. Historical audit and source-PR reports remain historical; integration outcomes belong in a new report.

Final integration acceptance evidence is in `docs/final-integration.md`. Current commands: `npm run build`, `npm test`, `npm run test:heroes`, `npm run test:browser`, `npm run test:links`. Serve the static build with `node scripts/serve-preview.cjs public 8791`; this local tool does not implement Netlify Forms or payment APIs. Regenerate current source/link evidence using `scripts/audit_site.py` and `scripts/integration-link-inventory.py`; PR #4's 71-link baseline is preserved in `docs/pr4-contextual-links.json`. The old payment proposal has now been applied with the owner's approval: neutral general welcome and generic non-PII return, with original Paystack processing/prices preserved. Do not restore a paid gate. The official flagship is `/heroes`; no old marketing HTML or contest is published.

## Authorized PR #5 completion pass

Continue only `feat/heroes-final-integration` and existing draft PR #5. Preserve pricing UI, all nine totals, unrelated packages processing and the no-backend hosted-payment design. Audit every public HTML page, add conservative metadata and privacy/service review drafts, improve Heroes photography/storytelling and accurate industry content. Do not infer client showcase permission or tracker ownership from repository presence. Unknown legal practices must stay explicit review items. No production deployment/merge, live transactions or payment activation. New measurement must minimize data and fail closed until ownership/privacy review is approved; test providers with synthetic mocks only. Completion evidence belongs in `docs/completion-*`, keeping original audit evidence historical.

Completion checks: `python scripts/completion-audit.py`, `npm test` (also rebuilds the static output), then `npm run test:heroes`, `npm run test:browser`, `npm run test:links`, `npm run test:completion`, `npm run test:measurement` against local port 8791. Do not rebuild/remove `public` while browser scans run. All provider transports remain blocked or synthetic. Marketing link counts exclude noindex legal drafts and operational privacy notes; these remain in the page matrix. Known original-image files are unchanged; optimized derivatives preserve framing. New measurement's release flag stays false and Meta destination null until owner/privacy/account sign-off.

## 9 November 2026 continuation

Owner supplied `pre-ins.zip`; actual Socialander marketing/transportation and earlier Heroes/payment-selection screenshots are reviewed in `docs/reference-review-2026-11-09.*`. Eight priorities now supersede the earlier construction-led initial list: solar/renewable energy, home/technical services, education, retail, food, hospitality, fitness/wellness, NGOs/community. Construction stays accessible as an additional project context. Do not infer verified results or identical scope across sectors. Keep the existing solar/home-named canonical slug stable while explaining the separate technical-services page. Pricing/payment scripts remain protected; contrast-only styling is authorized by the accessibility/completeness task. Owner showcase permissions and measurement/legal approval are still required before enabling their gated features.

## Design-led refinement

The owner now authorizes coherent photographic Heroes composition, a continuous controllable illustrative activity demo, visual workflows and onboarding, a photographic industry hub, positive school website/portal capability messaging (portals separately scoped), visual industry demonstrations, and focused homepage navigation/mobile corrections. This supersedes exact preservation of the earlier text-only industry and homepage navigation arrangements. Keep the approved Heroes comparison markup/prices, portfolio composition, payment settings, tracking architecture and functional integrations unchanged. Conceptual website/parent/admissions examples must be explicitly labelled and collect no data. Available repository imagery is authorized while the owner replaces weaker matches; document provenance/replacement priorities without inventing client/staff evidence.

Current evidence: `docs/design-led-refinement.md` and `docs/design-led-previews/README.md`. Run `test:design` for the new presentation behaviors. `capture:design` expects current public on 8791 and a read-only git archive of commit `7e33d13` on 8792; it captures all nine modified pages at 1440/390 after scrolling/decoding images. Preserve historical completion/integration previews; the dedicated design-led gallery is the current before/after record.

## Website experience and conversion refinement

The latest owner request authorizes shared primary navigation/footer across 35 standard pages, homepage portfolio/reviews/hero refinement, clearer service/industry copy and concrete legal pages on the same PR #5. Owner confirmed reuse of existing testimonials and that current numerical statements can be backed; do not invent new proof or claim independent Google verification. Keep the approved Heroes layout/prices/functions intact; clean legal labels and a subtle example caption are the only changes there. Packages/Pricing body values and payment scripts remain unchanged; header/footer changes are now authorized. Retire inbound Pricing links while preserving its direct route/fragments pending traffic/backlink review. `partials/` is unpublished build-time HTML, not two additional public pages. Run `chrome:sync` after editing shared partials, then build/tests. `config/legal-release.json` blocks Netlify production-context builds until completed legal copy/operational facts are approved; do not mistake authorization to prepare copy for confirmation of undocumented operations. Evidence: `docs/website-experience-refinement.md` and `docs/experience-previews/README.md`. Do not merge, deploy, change tracking or activate hosted payments.

## Heroes product specification follow-up (10 November 2026)

The latest task explicitly requests a NEW feature branch and draft PR from deployed main (`ec5d24a`), superseding the previous PR #5-only instruction. Preserve its photographic hero, activity demo, exact pricing section, onboarding, portfolio, payment/measurement configuration and unrelated pages. Replace the broad responsibility list with sourced product responsibilities, the execution standard and a tier comparison. Reuse existing imagery and presentation assets; no new backend or framework.

Source: owner-supplied **Webtellisense Heroes Client Experience and Delivery SOP DRAFT.pdf**, v3.0, 6 November 2026, 12 pages. It is an internal working draft, not a final contract. Owner subsequently authorized displaying provisional quotas with careful qualification. Label publishing/channel/campaign ranges as indicative, not automatic allowances; exact production, integration and response coverage belongs in the written scope. Approved prices/advertising allocations and V3 **Complete** naming in the user's request override conflicting draft wording. Do not publish internal costing, illustrative financing prices or fabricated client metrics. The private source PDF stays outside the public static build.

`docs/heroes-product-specification.md` records source mapping, missing documents, owner clarification and verification. Product-only styles/JS are in `heroes-product.*`; mobile tier selection is independent of billing. Without JavaScript all three comparisons remain readable. Current acceptance commands: `npm test`, `HEROES_TEST_ORIGIN=http://127.0.0.1:8795 npm run test:product`, `test:heroes` and `test:design`. `capture:product` uses current output on 8795 and an unmodified main archive on 8794. All providers and writes remain blocked or explicitly mocked. Preserve main's approved legal-release flag and Pretty URL loop fix; old test assumptions are historical, not instructions to revert these owner changes. No merge, deployment or payment activation.

## Approved copy polish and Heroes analytics activation (11 November 2026)

Continue PR #6 on this branch. Owner approved product specs/design/prices and now authorizes customer-facing copy/alt-label polish and **working consent-managed GA4/Meta activation**. This supersedes earlier release-off/unknown-Meta instructions. Confirmed destinations: GA4 `G-PS5FNQCJRN`, general Meta `806267492040936`; do not copy the homepage's GTM/direct combination. Use the explicit module page allowlist: `/heroes` marketing views/events; public `/heroes-start` consented interaction events only. Never track welcome/private onboarding or enable unrelated industries. Preserve commercial comparison/pricing markup, payment URLs/logic, portfolio composition and animation scripts. Neutral photo descriptions/conditional enquiry language must not attribute stock people to the company or assert real transactions. CSS corrections are limited to footer clearance for touch access to consent withdrawal and resetting consent checkboxes so they do not inherit profile-field sizing.

`docs/heroes-copy-and-analytics.md` records installation, consent/withdrawal/privacy-signal behavior, event map and remaining provider/account checks. Real SDK/container retrieval is blocked by the environment proxy; synthetic browser tests are not real provider delivery. Run `npm test`, `test:measurement` (actual config, 27 synthetic consent/network scenarios), `test:product`, `test:heroes`, `test:design` with `HEROES_TEST_ORIGIN=http://127.0.0.1:8795`. Capture fresh copy/preferences using `node scripts/capture-heroes-polish.cjs`. Keep old audit and screenshot evidence historical. No merge, deployment, real analytics/payment submissions or payment activation.
