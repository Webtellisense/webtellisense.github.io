# Blog redesign repository audit

Audited 26 November 2026 (Africa/Lagos), commit `8a9c493da1ee4acb2dc627d200855dfa8997bcec`. Read-only discovery; only this document and `docs/blog/CONTENT_INVENTORY.md` are deliverables. No implementation, commit, deployment, provider submissions or source fixes were performed. Initial `git status --short` was empty.

## Evidence boundaries and assumptions

Current source overrides historical reports and the older sections of `AGENTS.md`. Public origin is assumed to be `https://webtellisense.com` from current canonicals and `sitemap.xml`. Public HTML route policy is extensionless, with `/` for home and `.html` compatibility aliases; this is supported by `_redirects`, `scripts/serve-preview.cjs` and `AGENTS.md`, but production responses, account dashboards and traffic were not checked. A filesystem route is not proof of live availability. All 48 publishable HTML documents are inventoried below; `partials/` and historical documentation/previews are not public application pages.

## 1. Stack, deployment and baseline

- Framework: none. Static, multipage HTML/CSS/JavaScript; no React, Next, Astro, Markdown/MDX renderer, CMS or framework version exists in `package.json`. Local Bootstrap is **5.3.3** (`assets/vendor/bootstrap/css/bootstrap.css`). Other checked-in vendors: Bootstrap Icons, AOS, GLightbox, ImagesLoaded, Isotope, Waypoints, Swiper, PHP email form validator.
- Rendering: static at build time. `scripts/build-static.cjs` copies root HTML/assets and country directories to `public/`; standard pages get shared header/footer replacement via `scripts/site-chrome.cjs`. No SSR, edge runtime, functions or server application in the build. HTML is readable without a client framework.
- Deployment evidence is **Netlify**, not Cloudflare Pages: `netlify.toml` sets base `.`, `npm run build`, publish `public`, Node 22, a branch/context ignore expression, onboarding privacy/cache headers; `_redirects` uses Netlify forced redirects. No Wrangler/Cloudflare Pages config was found. Actual hosting/account configuration remains unverified. Numerous forms use Netlify attributes, which does not independently prove production delivery.
- Package manager: npm, evidenced by `package-lock.json` (lockfileVersion 3) and Netlify's npm command. `package.json` requires Node >=22; actual audit runtime Node **24.22.1**. No pinned npm version. Lock resolves Playwright 1.65.0 and axe-core 4.14.0; these are development tools, not the site framework.
- Build guard: `scripts/build-static.cjs` checks production context against `config/legal-release.json`; **current** `copyApprovedForProduction` is true. Older reports describing a release block are historical.

| Check | Repository command | Baseline on this checkout |
| --- | --- | --- |
| Build | `npm run build` → `node scripts/build-static.cjs` | Exit 0, with output writes intercepted in memory as explained below. Root rendering inspected separately: 46 HTML renders, 13 copy operations (including country directories containing the remaining 2 HTML pages). |
| Lint | `npm run lint` | Attempted once; missing script, exit 1. Pre-existing tooling gap; no linter config/command defined in `package.json`. |
| Typecheck | `npm run typecheck` | Attempted once; missing script, exit 1. No TypeScript application or typecheck script defined. |
| Unit/static tests | `npm test` → `node --test tests/*.test.cjs` | Command inspected, not run: `tests/heroes.test.cjs` invokes a real build and writes `public/`; historical Git comparisons also depend on older commits. No claim that the suite passes. |
| Browser suites | `npm run test:browser`, `test:heroes`, `test:links`, `test:completion`, `test:measurement`, `test:design`, `test:experience`, `test:product` | Defined in `package.json`; not run because normal suites expect built output and some write evidence. Dedicated read-only browser checks described below were run instead. |

**Read-only build method:** normal build removes/recreates `public/`, contrary to the two-document constraint. The real `npm run build` command ran once with an inherited Node `--import=data:text/javascript,...` hook overriding `fs.rmSync`, `mkdirSync`, `writeFileSync` and `cpSync`: no disk output; writes permitted only as intercepted `public/` targets, copy source existence checked. Shared partial reads and actual HTML rendering still executed. A preceding direct invocation of the same build entry point used identical interception and counted operations. An initial preload probe failed to resolve its pipe path before execution. This establishes rendering/control-flow success, **not** a complete physical artifact/copy or deployed build verification. No package installation or build output was created.

## 2. Blog architecture

`blog.html` manually lists five cards, each pointing to a root HTML document. Their exact URLs, dates and categories are in the companion inventory. There is no `/blog/[slug]` router: articles remain root-level extensionless URLs with `.html` aliases. Slug is the HTML filename stem; changing the filename would change the public route.

Articles are authored as full HTML, not Markdown, MDX, TS data or CMS entries. There is no single article object/schema or required-field validation. Effective fields are duplicated among `<title>`, description/canonical/social tags, visible heading/byline/date, optional JSON-LD, images, `.content`, `.meta-bottom` categories/tags, sidebars and separate index cards. Four articles use `.blog-details .article` plus a sidebar; `how-to-grow-your-business-online-2026.html` uses `.blog-hero`, `.blog-layout`, a TOC, quick answer, steps, FAQ and custom CTA. Shared CSS even applies `article {max-width:780px}` globally (`assets/css/main.css`).

Date strings are hand-written, with no sorting/parser source of truth. Only the school article supplies structured `datePublished`; no article supplies `dateModified`. The Uyo article uses a plain span rather than `<time>`. Listing order is explicitly authored: Uyo growth, visibility, ten tips, school features, agency value. Pagination markup in `blog.html#blog-pagination` is commented out (including dummy `#` links); no real page 2, category routes, tag routes, search index, filtering or RSS exists. Category/tag labels frequently link to `#`, not archives. `blog-details.html` is an accessible but noindex unfinished template, not a sixth editorial article.

Keep existing root slugs, including the 2025/2026 suffixes, through redesign. Do not silently relocate articles under `/blog/` or use a client router fallback.

## 3. Design system and article measurements

`assets/css/main.css` defines Montserrat primary and Campton secondary; local CamptonLight OTF uses `font-display:swap`. `assets/css/site-experience.css` adds local CamptonBook/Bold for shared chrome. Article heads import Google Fonts (including Montserrat, Open Sans and Alan Sans on Uyo; blog index imports Oswald). Some imported faces are not the declared body face. Local browser tests blocked Google Fonts, so reported font family is the CSS family, not proof the remote Montserrat font loaded.

| Token/pattern | Current evidence |
| --- | --- |
| Main navy | `--color-primary-1:#01033e` in `assets/css/main.css` |
| Strong blue | `--color-primary-2:#0331b0` |
| Accent blue | `--color-primary-3:#0033ff` |
| Neutrals | white, black, `#f4f4f4`, `#d4d6e2`; text `#1a1a1a` |
| New shared chrome | Cream header `#f8f8f3`, navy text, blue CTAs in `assets/css/site-experience.css` |
| Spacing | No unified named spacing scale. Main sections 96px vertical, section header margin 56px; Bootstrap grid/gutter utilities, article card padding 30px; Uyo layout padding 44px 24px 90px and 48px grid gap. Preserve patterns before extracting tokens. |
| Reusable layout/components | `partials/site-header.html`, `partials/site-footer.html`; build renderer `scripts/site-chrome.cjs`, scope `config/site-pages.json`; committed markup copies for unbuilt servers; `assets/js/site-experience.js` controls responsive menu/disclosures. |
| Reusable content patterns | `.site-context-link`, Bootstrap containers/cards/grids, `.audit-section` question hook, CTA banner, article author/recent-post sidebar; Uyo TOC, quick-answer, step, native FAQ details, author and share blocks. No component framework. |

Read-only Chromium/system executable checks at 1440×900 and 390×900, local source server, all external requests and non-GET writes blocked:

| Article layout | Desktop article/text width | Mobile article/text width | Typography |
| --- | --- | --- | --- |
| Four legacy articles | 780px article / 720px ordinary paragraph | 342px article / 282px paragraph | p 16px/24px; page-title h1 24px/28.8px; article title h2 28px/33.6px; body h3 22px/26.4px |
| Uyo growth | 724px article; first quick-answer p 675px; step h2 668px | 342px article; quick-answer p 293px; step h2 286px | p 16px/24px; h1 46px/51.52px desktop, 30px/33.6px mobile; body h2 26px/31.2px; generic h3 token 19px, first CTA h3 computes 21px |

Uyo CSS: hero inner max 780px, body grid max 1040px with 220px TOC + 48px gap + flexible article; one column below 860px. Actual article width is constrained by the full grid and intrinsic sizing, not the standalone 780px cap. Heading anchor margin/TOC sticky offset is only 24px, smaller than the 76–88px shared sticky header. No full redesign should preserve that obstruction.

## 4. SEO

All 48 HTML pages were parsed directly: each has a title, description, canonical, Open Graph title/description/URL/type/image, and Twitter card/title/description/image. These fields are present, not necessarily effective editorial choices. No repeated description values, OG titles or Twitter titles were found across distinct documents. The only duplicate canonical and `og:url` destination is `/` on `index.html` and `indexxx.html` (intentional alternate-home alias in `AGENTS.md`). Most social imagery reuses a logo or unrelated existing photo; shared images are not a missing-tag error.

The following current per-page matrix complements the route allowlist. “Basic complete” means the fields above are present. JSON-LD types list top-level blocks; parsing succeeded for every JSON-LD block, without a rich-result/schema eligibility assertion.

| Source | Basic metadata | Robots | JSON-LD top-level types |
| --- | --- | --- | --- |
| `10-essential-tips-for-businesses-2025.html` | Basic complete | index/follow default | None |
| `about.html` | Basic complete | index/follow default | None |
| `audit.html` | Basic complete | index/follow default | None |
| `bahamas/solar.html` | Basic complete | index/follow default | None |
| `blog-details.html` | Basic complete | noindex, follow | None |
| `blog.html` | Basic complete | index/follow default | None |
| `branding.html` | Basic complete | index/follow default | None |
| `business-audit-tool.html` | Basic complete | index, follow | None |
| `business-not-showing-up-online.html` | Basic complete | index/follow default | None |
| `construction-property-marketing.html` | Basic complete | index/follow default | Service |
| `contact.html` | Basic complete | index/follow default | None |
| `content-marketing.html` | Basic complete | index/follow default | None |
| `conversion-rate-optimization.html` | Basic complete | index/follow default | None |
| `education-marketing.html` | Basic complete | index/follow default | Service |
| `email-marketing.html` | Basic complete | index/follow default | None |
| `faq.html` | Basic complete | index/follow default | None |
| `food-supplier-marketing.html` | Basic complete | index/follow default | Service |
| `freeguide.html` | Basic complete | index/follow default | None |
| `google-business-profile.html` | Basic complete | index/follow default | None |
| `graphics-design.html` | Basic complete | index/follow default | None |
| `heroes-profile-received.html` | Basic complete | noindex, nofollow, noarchive | None |
| `heroes-start.html` | Basic complete | noindex, nofollow, noarchive | None |
| `heroes-welcome.html` | Basic complete | noindex, nofollow, noarchive | None |
| `heroes.html` | Basic complete | index/follow default | graph |
| `home-technical-services-marketing.html` | Basic complete | index/follow default | Service |
| `how-to-grow-your-business-online-2026.html` | Basic complete | index/follow default | Article, FAQPage |
| `index.html` | Basic complete | index/follow default | ProfessionalService |
| `indexxx.html` | Basic complete | index/follow default | None |
| `industries.html` | Basic complete | index/follow default | CollectionPage |
| `kids-holiday-uyo.html` | Basic complete | index/follow default | Course |
| `nigeria/solar.html` | Basic complete | index/follow default | None |
| `packages.html` | Basic complete | index/follow default | None |
| `ppc.html` | Basic complete | index/follow default | FAQPage |
| `pricing.html` | Basic complete | index/follow default | None |
| `privacy-policy.html` | Basic complete | noindex, follow | WebPage |
| `retail-specialty-store-marketing.html` | Basic complete | index/follow default | Service |
| `reviews.html` | Basic complete | index/follow default | None |
| `roadmap.html` | Basic complete | index/follow default | None |
| `service-terms.html` | Basic complete | noindex, follow | WebPage |
| `social-media-management.html` | Basic complete | index/follow default | None |
| `social-media-marketing.html` | Basic complete | index/follow default | None |
| `solar-and-home-services-marketing.html` | Basic complete | index/follow default | Service |
| `solar.html` | Basic complete | index/follow default | None |
| `top-features-for-a-school-website.html` | Basic complete | index/follow default | BlogPosting |
| `value-of-a-digital-agency.html` | Basic complete | index/follow default | None |
| `web-design.html` | Basic complete | index/follow default | None |
| `webtellisense-solar-landing.html` | Basic complete | index/follow default | None |
| `welcome.html` | Basic complete | noindex, nofollow, noarchive | None |

Article-specific gaps: `how-to-grow-your-business-online-2026.html` has Article + FAQPage but no `datePublished`, `dateModified` or Article image; `top-features-for-a-school-website.html` has BlogPosting `datePublished:2024-03-19`, inconsistent with its `<time datetime="2023-06-10">` and index date. Remaining articles lack Article/BlogPosting JSON-LD entirely. The legacy page-title h1 and article-title h2 are different strings; choose one descriptive article h1 in implementation. Visible publication conflicts and bylines are detailed in the inventory.

`sitemap.xml` is hand-maintained with **33** extensionless URL entries, no duplicates and **no `<lastmod>` at all**. Build copies it verbatim; there is no lastmod-generation policy. `robots.txt` allows all crawling and points to `https://webtellisense.com/sitemap.xml`; no route exclusions. Meta robots, rather than robots.txt, excludes operational/template/legal pages (see matrix). Several crawlable campaign/tool pages are absent from the sitemap, including `/audit`, `/solar`, country solar pages, `/webtellisense-solar-landing`, `/roadmap`, `/kids-holiday-uyo`; do not infer noindex from omission. Sitemap includes all five real articles and blog index. No feed file, feed route, RSS generator or RSS alternate link found.

`_redirects` contains exactly three forced 301s from `/webtellisense-heroes.html`, `/webtellisense-heroes`, `/webtellisense-heroes/` to `/heroes`. No blog redirects or repository-wide forced `.html` redirects. Netlify Pretty URLs behavior is a hosting assumption supported by repository policy; do not add opposite rewrites/redirects that loop. `indexxx.html` is canonicalised, not redirected. Canonical alone does not guarantee a production alias resolves.

## 5. Images

Images are checked-in assets, primarily `assets/img/blog/`; optimized WebP derivatives in `assets/img/optimized/`. No image API/CDN transform, automatic responsive image generation, `srcset`/`sizes` article pipeline or image framework. Build copies original and optimized assets together. Original-image preservation and derivative provenance are historically documented in `docs/completion-image-optimization.json`; current HTML decides which file is actually served.

- Four legacy articles have `.post-img` hero images, CSS width 600px/height 450px/object-fit cover (`assets/css/main.css`). They lack intrinsic HTML dimensions and responsive source sets; mobile can retain a tall 450px crop. Article images use default eager/auto loading, including below-fold content. Avoid lazy-loading the actual LCP hero when fixing other imagery.
- Ten-tips hero `assets/img/blog/blog-11.jpg`: 498,513 bytes, natural 2866×3821. Agency hero `blog-55.jpg`: 432,486 bytes, 4080×2720. School hero `blog-33.png`: 95,867 bytes, 1253×575. Visibility hero JPEG: 75,518 bytes, 736×1096. These are full files even when displayed narrowly.
- Uyo article has a graphic/text hero, **no article hero `<img>`**. Its listing image is `/assets/img/optimized/blog-HTGYBO2026.webp` (136,924 bytes), while OG/Twitter use unrelated `assets/img/hero-carousel/hero-carousel-01.jpg` (1,581,593 bytes, 6016×4016). Distinguish listing thumbnail, article hero and social image fields.
- School's in-body calendar WebP is 121,098 bytes; original `blog-44.jpg` remains 1,224,662 bytes. Optimized existence does not mean every use is optimized.
- Article alt strings are present on the four heroes and describe intended subjects, but phrases such as “Eket business owner” do not establish provenance/location. Index card thumbnails have empty alt; decorative alt can be appropriate for a card with an accessible title, but should not conceal a meaningful diagram. Author/sidebar photos also use empty alt. No stock person should be identified as a client/staff member by inference.
- `value-of-a-digital-agency.html` uses `assets/img/image-unavailable.svg` for a purported growth chart, with alt “Eket business growth chart”: misleading placeholder. `blog-details.html` also uses the placeholder, intentionally excluded from indexable content. The custom preview's generic MIME produced natural 0×0 for that SVG; this is not evidence the real static host serves a broken SVG.

## 6. Analytics and Search Console

Direct GA4 `G-PS5FNQCJRN` is repeated across legacy page heads, including `blog.html` and all five articles. GTM `GTM-NJ6L82XR` appears in `index.html`, `indexxx.html`, `solar.html`; home and alternate home also have direct GA4. Container contents and real delivery are unknown: GA4/GTM overlap is a **potential** duplication, not proof of two actual received events. No Search Console verification meta tag or google verification HTML file found; DNS verification/account access cannot be determined from this repository.

Legacy Meta destinations: `806267492040936` general; `623478247158411` on packages and some older/campaign pages; `1710018810217099` solar. Uyo article, alternate homepage, audit parent and kids campaign initialise two pixels with destination-specific PageViews, once per destination in source. That is two destinations, not duplicate events to one destination. Legacy blog trackers load without the Heroes consent module; do not claim site-wide consent management.

`assets/js/measurement-config.js` has releaseApproved true, GA4/general Meta as above, and an explicit page allowlist: `/heroes` marketing pageviews/interactions; `/heroes-start` interactions only. `assets/js/measurement.js` honors consent, DNT/GPC, production hostname, duplicate-install conflicts, sanitizes parameters and suppresses onboarding/private returns. Industry pages may load this script but are not allowlisted for events. It uses direct SDKs, not GTM.

Every source-defined custom event, plus non-pageview standard conversions, follows. There are no article-specific custom events in the five article files or shared `main.js`/`site-experience.js`.

| Event | Provider and source | Trigger / duplication observation |
| --- | --- | --- |
| `modal_open` | GA4 `freeguide.html:248` | Lead modal opening; repeated openings legitimately repeat. |
| `form_submit` | GA4 `freeguide.html:298` | POST response.ok; not proof downstream WhatsApp delivery; possible overlap with GA enhanced measurement cannot be resolved from repo. |
| `scroll_25`, `scroll_50`, `scroll_75` | GA4 `freeguide.html:407,414,421` | Per-threshold flags limit to once per document; separate event names. |
| `SolarAssessmentCompleted` | Meta custom `solar.html:1816` | Browser assessment complete after asynchronous submission attempt; not a verified lead. |
| `heroes_period_select` | GA4 + Meta custom `assets/js/measurement.js:173` | Billing-view radio / period select change, on allowlisted pages with consent. |
| `heroes_tier_select` | GA4 + Meta custom `assets/js/measurement.js:174,178,188` | Tier select, comparison tier button, or tier link to start page; separate selectors and actions. |
| `heroes_talk_to_sales` | GA4 + Meta custom `assets/js/measurement.js:185` | Contact/email or qualifying text on call/WhatsApp CTA. Can co-fire with channel click below; distinct intended events, not duplicate names. |
| `heroes_call_click` | GA4 + Meta custom `assets/js/measurement.js:181` | tel link. |
| `heroes_whatsapp_click` | GA4 + Meta custom `assets/js/measurement.js:182` | wa.me link. |
| `heroes_paystack_handoff` | GA4 + Meta custom `assets/js/measurement.js:191` | Visible hosted Paystack link; not a purchase or verified payment. |
| `Lead` (standard) | Meta `freeguide.html:307` | Same successful POST branch as form_submit; different provider/event, no server verification. |
| `Contact` (standard) | Meta `solar.html:1823` | `trackWhatsAppClick`, solar WhatsApp CTA. |
| `InitiateCheckout` (standard) | Meta `packages.html:209,247,286,323,361,399,437` | Seven package CTA handlers, one call per click; not seven calls from one click. |

Pageviews: legacy `gtag('config',...)` may auto-send; `fbq track/trackSingle PageView` handles legacy Meta; Heroes explicitly sends one GA page_view / Meta PageView only in marketing mode after provider readiness. No exact repeated same-destination PageView call was found within an article. Loader boilerplate appears twice on Uyo, but fbq's loader guard and trackSingle calls preserve the two separate destinations. Provider dashboards, GTM rules, enhanced measurement and network delivery remain unverified; browser audit blocked all provider requests.

## 7. Public routes and editorial link allowlist

Each HTML route below has a real source file copied by the build. Use extensionless URLs for new editorial links, retaining existing `.html` aliases and fragments. “Yes” permits relevant editorial links; “Restricted” means accessible but excluded from future article recommendations by default (private/operational, placeholder, alias or unrelated campaign). This separates route existence from editorial eligibility. No fabricated `/portfolio`, `/whatsapp`, category or hotel landing page exists.

| Route | Source | Purpose | Required classification | Article destination |
| --- | --- | --- | --- | --- |
| `/10-essential-tips-for-businesses-2025` | `10-essential-tips-for-businesses-2025.html` | 10 Essential Tips for Small Business Online Success in Eket  | blog | Yes |
| `/about` | `about.html` | Agency background | other | Yes |
| `/audit` | `audit.html` | Embedded audit application | audit tool | Restricted |
| `/bahamas/solar` | `bahamas/solar.html` | Bahamas solar marketing briefing | industry or solar landing page | Restricted |
| `/blog-details` | `blog-details.html` | Unfinished template, noindex | blog | Restricted |
| `/blog` | `blog.html` | Five-article listing | blog | Yes |
| `/branding` | `branding.html` | Professional Brand Identity & Logo Design Nigeria - Webtellisense | service page | Yes |
| `/business-audit-tool` | `business-audit-tool.html` | Public free audit wrapper | audit tool | Yes |
| `/business-not-showing-up-online` | `business-not-showing-up-online.html` | Why Your Business Isn't Showing Up Online (Even Though You Have a Facebook Page)  | blog | Yes |
| `/construction-property-marketing` | `construction-property-marketing.html` | Marketing for Construction & Property Businesses  | industry or solar landing page | Yes |
| `/contact` | `contact.html` | Contact form, phone and WhatsApp | contact or WhatsApp | Yes |
| `/content-marketing` | `content-marketing.html` | Professional Content Marketing Services Nigeria - Webtellisense | service page | Yes |
| `/conversion-rate-optimization` | `conversion-rate-optimization.html` | Conversion Rate Optimization (CRO) Nigeria - Webtellisense | service page | Yes |
| `/education-marketing` | `education-marketing.html` | School Website Design & Marketing in Eket & Uyo  | industry or solar landing page | Yes |
| `/email-marketing` | `email-marketing.html` | Professional Email Marketing Services Nigeria - Webtellisense | service page | Yes |
| `/faq` | `faq.html` | Service/process questions | other | Yes |
| `/food-supplier-marketing` | `food-supplier-marketing.html` | Marketing for Food Suppliers & Specialty Food Businesses  | industry or solar landing page | Yes |
| `/freeguide` | `freeguide.html` | Checklist lead magnet / WhatsApp campaign | other | Yes |
| `/google-business-profile` | `google-business-profile.html` | Google Business Profile & Local SEO in Nigeria  | service page | Yes |
| `/graphics-design` | `graphics-design.html` | Professional Graphic Design Services Nigeria - Webtellisense | service page | Yes |
| `/heroes-profile-received` | `heroes-profile-received.html` | Operational form receipt | other | Restricted |
| `/heroes-start` | `heroes-start.html` | Public hosted-payment option selection | packages or pricing | Restricted |
| `/heroes-welcome` | `heroes-welcome.html` | Personal onboarding / payment return | other | Restricted |
| `/heroes` | `heroes.html` | Flagship outsourced digital growth service | service page | Yes |
| `/home-technical-services-marketing` | `home-technical-services-marketing.html` | Marketing for Home & Technical Services  | industry or solar landing page | Yes |
| `/how-to-grow-your-business-online-2026` | `how-to-grow-your-business-online-2026.html` | How to Grow Your Business Online: A Step-by-Step Guide for Uyo Business Owners  | blog | Yes |
| `/` | `index.html` | Main agency homepage | other | Yes |
| `/indexxx` | `indexxx.html` | Alternate homepage, canonical points to / | other | Restricted |
| `/industries` | `industries.html` | Industry hub with hospitality/fitness/NGO sections | industry or solar landing page | Yes |
| `/kids-holiday-uyo` | `kids-holiday-uyo.html` | Historical holiday tech bootcamp campaign | other | Restricted |
| `/nigeria/solar` | `nigeria/solar.html` | Nigeria solar marketing briefing | industry or solar landing page | Restricted |
| `/packages` | `packages.html` | Package catalogue and checkout | packages or pricing | Yes |
| `/ppc` | `ppc.html` | Google Ads & Pay-Per-Click (PPC) Advertising Nigeria - Webtellisense | service page | Yes |
| `/pricing` | `pricing.html` | Legacy pricing; direct route retained, inbound navigation retired | packages or pricing | Restricted |
| `/privacy-policy` | `privacy-policy.html` | Privacy policy (noindex) | other | Yes |
| `/retail-specialty-store-marketing` | `retail-specialty-store-marketing.html` | Marketing for Retail & Specialty Stores  | industry or solar landing page | Yes |
| `/reviews` | `reviews.html` | Testimonials and reviews | other | Yes |
| `/roadmap` | `roadmap.html` | Interactive 12-month roadmap | other | Restricted |
| `/service-terms` | `service-terms.html` | Service terms (noindex) | other | Yes |
| `/social-media-management` | `social-media-management.html` | Social Media Management Services Nigeria - Webtellisense | service page | Yes |
| `/social-media-marketing` | `social-media-marketing.html` | Paid Facebook & Instagram Ads Services Nigeria - Webtellisense | service page | Yes |
| `/solar-and-home-services-marketing` | `solar-and-home-services-marketing.html` | Marketing for Solar & Renewable Energy Businesses  | industry or solar landing page | Yes |
| `/solar` | `solar.html` | Solar Launch acquisition campaign | industry or solar landing page | Restricted |
| `/top-features-for-a-school-website` | `top-features-for-a-school-website.html` | Top Features to Have on a School Website  | blog | Yes |
| `/value-of-a-digital-agency` | `value-of-a-digital-agency.html` | The Value of a Trusted Digital Agency  | blog | Yes |
| `/web-design` | `web-design.html` | Website Design & Development Services Nigeria - Webtellisense | service page | Yes |
| `/webtellisense-solar-landing` | `webtellisense-solar-landing.html` | Solar jobs briefing campaign | industry or solar landing page | Restricted |
| `/welcome` | `welcome.html` | General package onboarding / manual payment check | other | Restricted |

Other published utility endpoints: `/robots.txt` (`robots.txt`, crawler policy), `/sitemap.xml` (`sitemap.xml`, discovery), `/site.webmanifest` (`site.webmanifest`, install metadata). All classify as **other**, not editorial destinations. Static images/fonts/CSS/JS are resources, not content destinations. Redirect-only legacy Heroes paths listed in §4 classify as **service page**, but always link directly to `/heroes`.

Verified useful fragments from `partials/site-header.html`, `partials/site-footer.html`, `industries.html`, `index.html`: `/#portfolio` (equivalent existing `/index.html#portfolio`), `/industries#hospitality`, `/industries#fitness-wellness`, `/industries#ngos-community`, plus industry hub IDs `#solar-renewable-energy`, `#home-technical-services`, `#education`, `#retail-specialty`, `#food-suppliers`. Use hub fragments for hotel/fitness/NGO topics; do not invent standalone sector routes. Contact's existing external WhatsApp destination is `https://wa.me/2347075848564`; it is not an internal route. Policy pages are valid utility destinations even while noindex. Contextual links must serve the reader; this list is permission to choose relevant destinations, not a quota to link every page.

## 8. Quality, mobile, accessibility and performance

Local equivalent checks used available Playwright with `/usr/bin/chromium`; its default downloaded Chromium executable is absent, so no browser installation was performed. Six pages (index + five articles), two viewports, all external providers blocked, no form/checkout interaction: **no horizontal document overflow, no page-load JS exceptions, one h1 per page** in those 12 observations. This is a narrow smoke/layout check, not a WCAG certificate or production performance test. Source was served through a read-only in-memory HTTP server; no screenshots/reports other than these two documents were written. Remote font/SDK failures were intentional. The preview did not emulate every production response header/MIME and did not test SEO redirects live.

**Lighthouse was not run:** no installed Lighthouse executable/module. axe-core is in the lock but not resolvable in this runtime, so no new axe audit was run. No paid tooling installed. Historic `docs/*browser-validation*` reports are prior evidence, not this baseline. Layout/DOM/style checks above are the available local equivalent; no Lighthouse score, real LCP/INP/CLS, bandwidth or full keyboard/contrast pass is claimed.

Code/tooling issues worth carrying into implementation:

1. **Dates/bylines/claim consistency:** inventory records conflicts. Ten-tips article promises ten but contains only numbered headings 1–4; agency value is ~173 body words. `10-essential-tips-for-businesses-2025.html` and `value-of-a-digital-agency.html` include numerical client outcomes/testimonials that are not independently substantiated by this audit. Preserve truthfulness; do not create new proof, recast examples as verified results or automatically change original publication dates.
2. **Readability/mobile space:** legacy mobile paragraphs have only 282px at viewport 390px because of nested grid gutters and 30px padding. Body 16px/24px is readable but cramped for long guides. Legacy article title is h2 below a generic page banner h1; use one clear article title h1 with sequential body h2/h3. Fixed-height hero crops may obscure subjects.
3. **Anchor/focus:** Uyo `.toc` top and body h2 `scroll-margin-top:24px` sit beneath the 76–88px sticky shared header. Category/tag/date/author links pointing to `#` provide no destination. Contextual-link underline/focus rules exist (`assets/css/main.css` at end), and shared chrome has focus styles; keep these. Do not assume all older tag/share controls meet focus/target-size requirements.
4. **Contrast:** brand blue must not automatically become small text on navy. `.blog-eyebrow` and `.step-preview .node.active .dot` use accent `#0033ff` against navy `#01033e` (~2.69:1); Uyo `contrast-repairs.css` fixes CTA/avatar but not those selectors. Small 10.5–12.5px labels warrant a measured pass. Keep existing contrast repairs and brand palette while assigning accessible foreground/background pairs.
5. **Render assets:** each real article loads Bootstrap bundle, validator, AOS, GLightbox, ImagesLoaded, Isotope, Waypoints, Swiper and shared `main.js`, plus deferred site-experience JS. These are not a client framework but still unnecessary work for ordinary reading; scripts at end are classic non-deferred scripts. Multiple vendor stylesheets and Google Font stylesheets block rendering; `assets/css/main.css` alone is 109,861 unminified bytes. Font Awesome preload points to a remote stylesheet without applying it as a stylesheet in article heads: inspect/remove wasted preload in later work.
6. **Images/layout stability:** originals too large for display size, no responsive selection/intrinsic dimensions, default eager below-fold loading, placeholder chart. Do not confuse optimized listing cards with optimized article hero/social images (§5).
7. **Integration boundaries:** shared footer's Netlify form semantics need host validation; contact backend is not established by static markup. No backend/payment or analytics behavior should change as part of a blog-only redesign. Legacy direct tracking has a different privacy model from Heroes.

## 9. Implementation decisions and safe defaults

| Decision | Safe default / action |
| --- | --- |
| Brand and URL stability | Keep navy/blue/Campton/Montserrat, shared header/footer, contact destinations and all five current root slugs. Preserve aliases/fragments. Do not touch pricing, checkout, tracking or campaign flows. |
| Architecture | Keep static delivery and Node build. Introduce a minimal local, build-time article manifest/template if needed for consistency, not a framework/CMS migration. Do not couple blog generation to chrome:sync source mutation. |
| Article model | Explicit slug, title, description, excerpt, author display/type, category, tags, publication date, optional updated date, draft flag, hero/thumbnail/social image records (src, alt, dimensions), HTML body. Validate unique slugs and destination paths at build time. Do not infer missing factual values. |
| Author attribution | New articles: **Webtellisense Team**, Organization Webtellisense in schema; no invented staff biography/avatar/credentials. Preserve existing person attribution only where already explicit (Ephraim Etuk card/sidebar), and document existing conflict rather than silently asserting sole authorship. Align visible and structured attribution in the eventual editorial pass. |
| Publication/update dates | Preserve source-visible dates as legacy evidence, flagged conflicts; do not fabricate a resolution from filename, git timestamp, sitemap or current date. For new work use explicit ISO date; display Updated only after substantive revision. Sitemap lastmod should derive from explicit meaningful updated date, else publication date if trustworthy; omit uncertain legacy lastmod. |
| Draft handling | New drafts default true, excluded from published build, index, RSS, search and sitemap. `noindex` alone is not draft privacy; keep unpublished content out of public output. Preserve existing noindex template/operational routes without republishing them as articles. |
| Search | Skip at five articles. With this backlog, categories and a usable newest-first list suffice initially. Consider lightweight title/excerpt search only once enough published inventory exists (roughly 20–30) and evidence of discovery friction; no external service/backend by default. |
| Categories | Initially display nonlinked labels / index filter; no thin archives. If category pages are introduced, noindex,follow and exclude from sitemap until each has useful unique introduction and enough relevant articles; then self-canonical/index. Do not canonicalise distinct categories to /blog. |
| Pagination | Only add when needed (e.g. 9–12 articles per page). Server-built crawlable links, distinct stable page URLs and self-canonicals, page-specific metadata, noindex,follow on page 2+ initially, omit from sitemap; all published article URLs remain directly discoverable in sitemap and category/index links. Do not canonicalise page 2 to page 1. Reassess indexability if archives gain unique discovery value. |
| Index ordering | Explicit publication date descending; do not promote old content solely for a cosmetic update. Uncertain legacy dates retain authored relative order until a reliable date is available. |
| SEO/schema | Generate unique title/description/canonical/OG/Twitter from one record; Article/BlogPosting with honest author/dates/image, meaningful breadcrumbs if visible; use FAQ markup only for visible matching content, no rich-result promises. Keep /blog indexable. |
| Images | Reuse authorized imagery, responsive static WebP/AVIF derivatives, width/height and alt fields; eager primary hero, lazy below-fold assets; use matching social card rather than generic huge homepage photo. Text-only hero is valid for Uyo; do not force a fake photo. |
| Discovery/RSS | Preserve existing sitemap routes; add new published articles and meaningful lastmod. Optional static RSS may be added during implementation with explicit dates; no feed exists to preserve. |
| Content boundaries | Retain Uyo growth as acquisition pillar; update it for backlog 14. Keep startup opportunity topics 20/21 separate by intent/geography. Other detailed overlap decisions in CONTENT_INVENTORY. |
| Testing | Add missing lint/typecheck policy deliberately; plain JS may use syntax/static validation rather than pretending TypeScript exists. Re-run actual disk build/unit/browser tests when writes are authorized; block external providers and POSTs. Validate route/metadata/article model, mobile/keyboard reading and image payloads. |

No implementation began. Live hosting/account ownership, publication-date truth, historical claim substantiation and real provider delivery remain unverified; defaults above let later work proceed conservatively without inventing them.
