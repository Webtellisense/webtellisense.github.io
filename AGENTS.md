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
