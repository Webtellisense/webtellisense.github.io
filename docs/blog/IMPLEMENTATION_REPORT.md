# Blog infrastructure implementation report

26 November 2026 (Africa/Lagos). Branch: `blog-redesign`, based on repository snapshot `8a9c493da1ee4acb2dc627d200855dfa8997bcec`. Source of truth: `AUDIT.md` and `CONTENT_INVENTORY.md`, with this request overriding the audit's provisional author/category/draft recommendations where specified. No push, deployment or hosted setting change. No new editorial articles or rewritten article prose.

## Material changes

- `scripts/build-blog.mjs` adds a deterministic static pipeline for `content/blog/*.md` and `content/blog/legacy.json`. Supporting modules under `scripts/blog/` handle strict schema validation, HTML inspection/escaping, shared templates and image processing. `content/blog/cta.json` configures category CTAs validated against the audit's allowed destinations.
- `package.json` now runs the original protected static builder **then** `npm run build:blog`. Added `build:blog`, `check:blog`, `images:blog`, `test:blog`, `test:blog:browser`; no lint/typecheck tooling or scripts were added. Netlify's existing command is already `npm run build`, publishing `public/`, so no hosting config was changed. `public/` stays ignored and generated output is not committed. Root `blog.html` remains the old input fallback; deployed `public/blog.html` is generated and contains no dummy pagination or old index promotion.
- Five legacy files are still hand-written HTML at their original root filenames. They now have consistent visible article headers/dates/organisation attribution, unique metadata, matching BlogPosting/BreadcrumbList, accurate visible FAQ schema where applicable, responsive image dimensions and an accessible reading layout. A text-normalisation regression compares each complete article body with the pre-redesign snapshot; all five match. Existing in-body wording, headings, claims, quotations and contextual link text were retained. Their four legacy H3 section levels were promoted to H2 without wording changes. Old sidebars, redundant page-title banners, dummy category/author/date links and sidebar comment counts are not part of the new reading layout. Meaningful existing body fragment IDs remain.
- `assets/css/blog.css` is scoped to blog pages: 736px maximum reading column, 18px/1.8 desktop text, 16.5px/1.8 mobile; responsive headline, sticky desktop TOC, collapsible mobile TOC, scrollable keyboard-focusable tables, callouts, numbered lists, readable focus indicators, reduced-motion handling, accessible colours and header-offset anchor targets. Existing navy/blue palette and Montserrat/Campton typography remain; shared main/chrome CSS and font sources are reused, not edited.
- `assets/js/blog.js` is 3,260 unminified bytes. It controls progress, responsive TOC state, copy-link feedback, query-variant robots metadata and GA4 events. No framework, new SDK, search service or client-side content rendering. Legacy article vendor scripts (Bootstrap bundle, validator, AOS, GLightbox, ImagesLoaded, Isotope, Waypoints, Swiper, main.js) are no longer loaded by the blog template. Unused AOS/GLightbox/Swiper CSS and the ineffective Font Awesome preload were removed from blog heads. Bootstrap CSS/Icons, main.css, existing fonts and site-experience.js remain for brand and navigation compatibility.
- The template reuses article head/font/analytics fragments and current shared navigation/footer partials. `scripts/site-chrome.cjs` recognises `data-blog-slug` pages and leaves their source variant intact; the blog builder applies current partials again in final output. This preserves byte-stable legacy source rendering while keeping build-time navigation current. The blog-specific footer omits only the newsletter block as required; global footer source and all unrelated pages remain unchanged. No additional newsletter form exists.
- Generated output includes `/blog`, four populated category pages, deterministic related links and `/blog/related.json`, `/blog/rss.xml`, blog lastmod entries and the unchanged non-blog sitemap entries. Categories are fixed; empty categories and tag archives are absent. Page size is 12; a featured card occupies one of those 12 slots, avoiding duplication with the latest list. New `/blog/page/2` and category `/page/2` documents exist only above 12 items. Published category/pagination pages are indexable and self-canonical.
- Draft source files never become production article documents, cards, related links, sitemap entries or RSS items. MISSING hero warns and downgrades ready to draft in memory without rewriting source. Explicit local preview requires a separate output directory and is refused in CI/Netlify context. Preview articles are noindex/nofollow and excluded from discovery even in preview. Invalid YAML, unknown keys/categories, malformed dates/arrays, route collisions, raw HTML, unsafe/unknown internal links, inappropriate headings or missing physical images fail clearly.
- Previous blog-owned files are tracked in the output manifest and cleaned before regeneration; deleted articles and reduced pagination do not leave stale HTML. A normal full build clears all output first. Image derivatives are also refreshed from the current published inputs plus committed legacy derivatives, avoiding old Markdown draft variants after a status change.

## Decisions

1. **URL policy:** keep every old filename, existing extensionless canonical and `.html` alias. Add no redirects/rewrites. No existing article is moved under `/blog/`. The repository does not provide a production HTTP probe of every trailing-slash alias; no alias policy is changed. New Markdown slugs use the established root stem pattern; archives use `/blog/category/<category-stem>` and `/blog[/category/<stem>]/page/<n>`, backed by real `.html` files and Netlify Pretty URLs.
2. **Deployment:** verified repository config, not account-level hosting. Netlify builds `public/`; generated archives/Markdown HTML are build artifacts, not committed source. Five patched legacy source files and their safe image derivatives are committed. No Netlify CLI, deploy preview or remote deployment was run.
3. **Author:** organisation-level **Webtellisense Editorial Team** throughout page, card, RSS-facing registry and BlogPosting. `about.html` establishes Ephraim Etuk as Founder/Lead Developer, but does not resolve conflicting article authorship: the actual old article metadata says Team while some cards/sidebars say Ephraim. Do not infer sole authorship from a developer role. The author box contains only the organisation name, with no fabricated bio or credentials.
4. **Dates:** earliest reliable publication evidence is selected below. An isolated inconsistent template `datetime` is not treated as a verified publication event. Meaningful existing in-body link/context changes in commit `a3a7394` (9 November 2026) are the last recorded editorial updates to these five files. That date populates updatedAt; this infrastructure change does not advance it to today. Git creation dates are evidence of repository presence, not proof of first publication. No dates are derived from build time, file mtime or year suffixes.
**Archive/feed dates:** `content/blog/settings.json` records the actual archive/template change date, `2026-11-26`. Archive lastmod and RSS lastBuildDate take the later of that explicit date and included article dates. Future archive-template edits must update this value; article editorial dates are not advanced by a layout change. This avoids both build timestamps and dating a newly created archive before it existed.

5. **Legacy image exception:** ready Markdown requires a real hero. Already-published Uyo keeps its text/graphic hero and index image; do not remove its working URL because it predates the new model. A neutral branded placeholder is used rather than pretending its thumbnail is a photo hero. New missing-hero articles remain drafts. Legacy imagery has empty credit when repository ownership attribution is not established; no licence/photographer claim is invented.
6. **Sources:** legacy articles remain unsourced where originally unsourced. Their existing claims are not rewritten or newly certified. New sources lists and FAQ schema come only from supplied frontmatter; the four Uyo FAQs use their actual visible answers, correcting earlier schema paraphrases. Empty sources arrays are structurally accepted, but editorial readiness remains a human gate.
7. **Categories:** explicit requested indexability supersedes the audit's conservative noindex suggestion. Generate an indexable category only when populated; no tag archives. Pagination is likewise indexable with unique metadata and self-canonicals. Preserve all pre-existing noindex decisions on unrelated/template/operational pages.
8. **Search:** intentionally omitted: only five existing articles and category/archive navigation already serve discovery. No search backend or extra client bundle is justified yet.
9. **CTAs:** new Markdown gets one modest closing contact link by category, with no automatically injected in-content CTA. Existing Uyo originally had two in-content audit blocks. It now keeps one interactive in-content audit CTA and its closing WhatsApp block; the second audit passage retains every word as an unlinked context note. This was caught by a strict browser event selector during final verification. Its sample gauge is hidden from the new layout, avoiding presenting the existing illustrative number as an actual audit result. Other legacy articles gain no new marketing prose. In-body service links remain allowed contextual links, not repeated promotional blocks.
10. **Footer conflict:** reuse the existing footer while omitting its newsletter block on blog pages only, satisfying the explicit no-newsletter requirement. Header/navigation, footer directory/contact/legal content and all other pages remain unchanged. This intentional exception is isolated in the blog template and a renderer guard; the global partial is untouched.
11. **Related articles:** explicit related slugs receive priority, followed by category and keyword-token overlap. Stable publication-date/slug ordering breaks ties. Never random, never self-links, never drafts; unknown/self explicit slugs fail.
12. **Dependencies:** exact devDependencies `marked@18.3.0` (GFM tables/Markdown without maintaining a parser), `yaml@2.9.1` (YAML types/errors/duplicate keys without a home-grown frontmatter grammar), `sharp@0.35.5` (actual image decoding/resizing/WebP/social JPEG). All free/open source and build-time only. No runtime CDN/service dependency added. HTML is controlled template markup inspected with a small zero-dependency helper, not a general browser parser; browser/axe checks complement it.
13. **Images:** WebP widths 480/768/1200, capped at original dimensions, original aspect ratio; 1200×630 social JPEG per source. AVIF is deferred: WebP supplies the responsive reduction without another encoding pass or source-selection branch. Original files remain untouched, especially shared assets. Default social art is an original deterministic logo-and-shapes JPEG composition without system-font rendering, not an AI-generated image. Approved future image originals live under the public assets tree; that tree is copied as-is and is not private draft storage.
14. **Query variants:** canonical always points to the base path. `blog.js` adds noindex/follow when a query string exists and there are no generated filter/query links. A static HTML response cannot vary meta robots by arbitrary query string without routing/server/edge work; no such hosting change was authorised or introduced. Non-rendering crawlers see the base indexable response; this limitation is explicit rather than claimed as server-side noindex.
15. **Analytics:** preserve all existing article SDK/noscript snippets byte-for-byte, including Uyo's two separate Meta destinations. New templates/index/categories reuse the single-direct-GA4/general-Meta installation from the visibility article, not homepage GTM. No container changes, SDK duplication, destination migration or renamed historical events. Existing privacy model is retained; new event calls honour DNT/GPC and do not load providers. Legacy trackers themselves are unchanged and are not thereby converted to Heroes consent handling.
16. **No new prose:** only test fixtures, layout labels, metadata, supplied editorial documentation and registry excerpts were authored. Fixtures are generated in temporary directories and are never committed/published as real articles. No backlog article or research fact has been written. Scope does not include resolving the ten-tips article's four-section discrepancy or substantiating past client claims.

## Legacy category, author and date change log

Each canonical below is unchanged. The `.html` file at the same root stem still exists. Every visible date, listing card and BlogPosting now uses the registry value.

| Slug | Fixed category | publishedAt and evidence | updatedAt and evidence | Attribution change |
| --- | --- | --- | --- | --- |
| `10-essential-tips-for-businesses-2025` | Local Business | `2023-05-15`: original visible date and datetime agree; earlier than first repository presence in `a690870` (12 June 2025). Reject filename 2025 and yearless index “December 12” as proof. | `2026-11-09`: `a3a7394` added contextual link text to visibility guidance. | Team article / Ephraim card/sidebar → Editorial Team consistently. |
| `business-not-showing-up-online` | Digital Marketing | `2026-05-30`: dated card in original `blog.html`, earlier than article's 11 June 2026 and Git addition `cbfce82` on 12 June 2026. Historical evidence, not independent production publication verification. | `2026-11-09`: `a3a7394` editorial link/context additions. | Team → Editorial Team. |
| `how-to-grow-your-business-online-2026` | Business Growth | `2026-07-12`: visible article date, earlier than index/Git addition 13 July 2026 (`2bb43af`). | `2026-11-09`: `a3a7394` contextual service/pillar connections. | Team → Editorial Team; no invented content-strategist biography. |
| `top-features-for-a-school-website` | Industry Insights | `2024-03-19`: visible date and BlogPosting agree. Reject isolated datetime `2023-06-10` as conflicting template residue; index lacks year and sidebar values conflict. | `2026-11-09`: latest editorial contextual connections in `a3a7394`; earlier substantial expansion in `ffc47a7`, 16 September 2026, from 3 to 7 features. | Team article/schema / Ephraim card/sidebar → Editorial Team. |
| `value-of-a-digital-agency` | Business Growth | `2023-07-22`: original visible date/datetime agree; index “April 24” has no year and sidebars conflict. | `2026-11-09`: `a3a7394` adds explanatory sentences linking web design and Heroes. | Team → Editorial Team. |

Full originals/conflicts remain in `CONTENT_INVENTORY.md`; it was not rewritten into a post-implementation report. These legacy publication dates are reconciled repository evidence, not a claim that public server logs verify publication in those years.

## Image changes and limits

`assets/img/blog/generated/` contains blog-specific derivatives. `content/blog/legacy.json` records hero/listing inputs and body-image inputs; `npm run images:blog` regenerates them. `build:blog` creates derivatives for new ready Markdown images directly in the chosen build output. Every content img has width/height and alt; hero uses eager/high fetch priority, thumbnails and below-fold body images lazy loading. Meaningful captions are rendered as figcaption. Decorative card duplicates have empty alt and an aria-hidden duplicate image link; the visible title is the accessible link.

| Input previously used | Before bytes | Largest ordinary WebP bytes | 1200×630 social JPEG bytes |
| --- | ---: | ---: | ---: |
| Ten-tips hero `blog-11.jpg` | 498,513 | 104,410 | 74,262 |
| Agency hero `blog-55.jpg` | 432,486 | 57,486 | 67,574 |
| School hero `blog-33.png` | 95,867 | 37,594 | 59,148 |
| Visibility hero JPEG | 75,518 | 40,184 | 50,011 |
| Uyo listing WebP (not hero photo) | 136,924 | 39,468 | 56,327 |

Browsers can select smaller 480/768 variants. Uyo's previous 1,581,593-byte unrelated homepage social JPG is no longer used on its article; the original remains because other pages use it. Agency's placeholder chart remains a clearly described “Image unavailable” image rather than an asserted real growth chart; removing/replacing its meaning would require editorial evidence. Legacy stock-photo provenance/rights remain unverified beyond repository reuse; no new third-party hotlinks or ownership claims were added. Images used only by unrelated pages were not touched.

## Analytics event map

Existing GA4 ID remains `G-PS5FNQCJRN`. No GTM container appears on blog pages; existing general Meta `806267492040936` and Uyo's destination `623478247158411` remain. Search Console DNS/account state and actual provider receipt remain unverified.

All added calls are in `assets/js/blog.js`, use the already-installed `gtag`, and include `article_slug`. No additional Meta conversion calls are introduced.

| Event | Trigger / parameters | Deduplication / meaning |
| --- | --- | --- |
| `scroll_25`, `scroll_50`, `scroll_75`, `scroll_90` | Actual user scroll reaches article prose depth; `percent_scrolled`. | Once per threshold per document; reuses existing freeguide naming for 25/50/75, without changing that page. No initial event just because a short article fits the viewport. |
| `article_cta_click` | Configured closing CTA or existing explicit article CTA blocks; `destination`, query stripped. | One delegated listener guarded by `window.WTSBlog`; one call per click. |
| `whatsapp_click` | WhatsApp contact or share link on article page; `destination`, `link_type` distinguishes share/contact. | One call per click; no customer message/query text included. May intentionally accompany distinct article_cta_click. |
| `audit_tool_start` | Article link to the actual `/business-audit-tool` or `.html` route; `destination`, `trigger: article_link`. | Means handoff to audit, not confirmed interaction inside embedded audit. No audit completion hook was established, so no completion event is invented. |

External provider requests and non-GET operations were blocked during tests. Event checks inspect a synthetic local dataLayer only, not live GA4 delivery, ad conversion attribution, Search Console verification or real-user metrics. Existing GA enhanced-measurement settings/GTM contents cannot be proved by source inspection; no duplicate same-name custom article event exists in current source.

## Verification results

- **Protected static build:** passed, original `scripts/build-static.cjs` executed with audit-style sync output interception: 46 root HTML renders, 13 copy operations, zero source/output mutation in that protected invocation. This is still a rendering/control-flow check, not copy verification.
- **Full physical build:** `npm run build` passed, including actual copying, legacy rendering, generated archives/images/sitemap/RSS. Netlify configuration already calls this command. No lint/typecheck tooling was added or run.
- **Built-output validation:** `npm run check:blog` passes: 10 blog pages (5 articles, blog index, 4 categories), unique titles/descriptions, exactly one H1 each, self-canonicals, social tags, parseable JSON-LD, valid internal paths/fragments, local image files/dimensions/alt/srcset, 1200×630 social images, matching source/manifest dates, published-only RSS, correct lastmod and draft exclusion. Eleven unchanged legacy noscript tracker pixels across the ten pages are explicitly excluded from content-image alt checks so the tracking snippets remain byte-identical. The checker targets blog-owned pages, not unrelated pages' historical metadata or the intentional alternate-home canonical alias.
- **New regression suite:** `npm run test:blog` passes **6/6** tests covering invalid YAML/schema/date/path input, unchanged body prose/tracking, deterministic related selection, draft/MISSING exclusion, real pagination at 14 and 18 published fixtures, category pagination above 12, stable repeated-build hashes, stale-output cleanup, safe Markdown/link/route collisions and explicit isolated preview behavior. No test fixture is added to production content.
- **Browser/axe lab:** `npm run test:blog:browser` passes **27 page/viewport checks** at 390, 768 and 1440px. Index, populated category, all five legacy articles, a long-headline/wide-table ready fixture and a MISSING-hero draft fixture were exercised. No horizontal document overflow, no page-load exceptions, no newsletter forms; desktop reading columns 680–760px. Wide tables scroll inside their containers. Mobile TOC works with keyboard Enter and copy control has visible focus. Axe WCAG 2 A/AA + 2.1 AA checks report **0 violations** in these checks. This is lab evidence with external fonts/SDKs blocked, not certification or real-user performance data.
- **Synthetic analytics:** scroll thresholds, article CTA, WhatsApp share and audit handoff tested for single emission; DNT suppresses new event calls; query variants keep base canonical and receive client-side noindex. All provider requests blocked; no live event/lead/payment/form submissions.
- **Existing test baseline:** `npm test` on a clean archive of original commit `8a9c493` (with the same repository history available) gives **24 pass / 5 fail**. Current `npm test` gives the same **24 pass / 5 fail**. Five failures are historical-object comparisons referencing unavailable commits `1a3941a`, `42bbcf4`, `1dab681`, `118ece7`: flagship comparison, copy/payment/portfolio preservation, product layout preservation, shared original assets, and legacy pricing assertions. They were not rewritten to hide failures. An initial additional chrome-sync failure caused by the required blog footer variant was resolved with the narrowly scoped renderer guard; no new failing test remains relative to baseline.
- **Development failures resolved:** nullable updatedAt initially caused the validator to compare absent dateModified with null; normalisation fixed it. Browser axe found an overly broad link-colour selector affecting the footer and missing breadcrumb underlines; styles were scoped/corrected. A strict event test exposed two pre-existing audit promotions; the second is now unlinked context with unchanged prose. These failures were repaired and the final checks rerun.
- **URL diff:** 48 existing HTML routes before, 52 after. **0 removed**. Exactly four additions: `/blog/category/business-growth`, `/blog/category/digital-marketing`, `/blog/category/industry-insights`, `/blog/category/local-business`. Every previous `.html` output filename remains. Extensionless canonicals for all five articles are unchanged; no redirects were edited. Existing alias/trailing-slash production responses are not network-verified.
- **Unrelated pages:** all **42** HTML documents outside the 5 articles + generated blog index have unchanged source hashes and expected unchanged built output. Shared header/footer files, brand/main CSS, original images, Netlify config, robots, redirects, Heroes/payment settings and existing measurement modules are unchanged. The source blog index itself is unchanged and superseded only in generated output.
- **Sitemap/RSS:** 27 pre-existing non-blog sitemap entries retained; 10 blog entries now have real repository-derived lastmod, making 37 entries. RSS contains exactly the five published articles. No noindex legacy template/operational URL was newly included. Existing robots.txt allows `/` and advertises the sitemap; no blog resources are blocked.

## How to import articles

Run from the repository root. Use Node >=22 and the committed npm lockfile.

```sh
npm ci
```

If the machine's default npm cache is not writable, use `npm ci --cache /tmp/wts-blog-npm-cache`; this was necessary in this environment. Do not add lint/typecheck packages.

1. Use `docs/blog/ARTICLE_TEMPLATE.md` and the editorial/research checklist. Save a completed YAML+Markdown file at **`content/blog/<slug>.md`**. Keep working research records outside the public asset tree and outside article Markdown. Never overwrite one of the five legacy slugs with a Markdown file; collision validation intentionally refuses that migration.
2. Save approved original images at **`assets/img/blog/<slug>/filename.jpg`** (PNG/WebP also work). Frontmatter/Markdown paths must be **`/assets/img/blog/<slug>/filename.jpg`**. No external image URLs. Supply alt/credit and retain image usage permission evidence. Public asset originals are copied to the build; do not place private material there.
3. Begin with `status: draft`. MISSING is acceptable for a draft. Fill all required schema fields even on drafts; blank schema fields fail rather than being silently published.
4. For an isolated local preview, first make the static build in a separate directory, then generate with the explicit flag:

```sh
npm run build
cp -R public /tmp/webtellisense-blog-preview
npm run build:blog -- --preview-drafts --out /tmp/webtellisense-blog-preview
node scripts/serve-preview.cjs /tmp/webtellisense-blog-preview 8798
```

Use a fresh `/tmp/webtellisense-blog-preview` path for each preview session (or remove only that known temporary preview before copying again). The preview command refuses `public/`, CI and any CONTEXT. Draft URLs exist only in this isolated output and are noindex; category/index/RSS/related discovery stays published-only. Open `http://127.0.0.1:8798/<slug>` locally. Stop the server when finished.

5. After source verification, legal image checks and human editorial review, set `status: ready` with a real hero. Optionally edit **`content/blog/cta.json`** for that category using an audit-approved route; defaults point to `/contact`. References in `related` are slugs, not invented route paths. Publication order uses publishedAt descending, with slug as deterministic tie-breaker. UpdatedAt is optional until a meaningful update.
6. Rebuild and verify:

```sh
npm run build
npm run check:blog
npm run test:blog
npm run test:blog:browser
node scripts/serve-preview.cjs public 8791
```

The generator automatically produces ready Markdown article HTML at **`public/<slug>.html`**, index **`public/blog.html`**, populated categories **`public/blog/category/<category-stem>.html`**, optional archive page-N files, **`public/blog/rss.xml`**, **`public/blog/related.json`**, **`public/sitemap.xml`**, responsive images under **`public/assets/img/blog/generated/`** and an output-ownership manifest **`public/blog-build.json`**. `check:blog` is the production validator and deliberately refuses a preview manifest. `build:blog` alone expects a static output directory to exist; a full `npm run build` is the reliable production preparation command.

To regenerate committed derivatives for existing hand-written HTML without altering shared originals:

```sh
npm run images:blog
npm run build
npm run check:blog
```

Update `content/blog/settings.json` → `archiveUpdatedAt` for meaningful archive/template revisions; the build never uses the clock. Future editorial updates to legacy articles must update `content/blog/legacy.json` metadata as well as the hand-written body. Metadata is rendered from the registry during the build. Preserve root filename, historic anchors and existing analytics snippets. Do not run an automatic prose migration. Build output and temporary fixtures are not committed; commit only reviewed content/source changes and approved originals/legacy derivatives. No import command pushes or deploys.

## Blockers and unresolved issues

- No implementation blocker remains for importing reviewed Markdown. No actual new ready/draft article content was supplied or published; the production registry still contains only five legacy articles.
- Production hosting settings, DNS/Pretty URL alias responses, real provider delivery and Search Console access remain unverified. Repository Netlify config is the deployment evidence.
- Static query-string noindex is client-side only, as explained under Decisions. There are no generated filter links; base canonicals still consolidate variants. Server-response conditional robots would require separate hosting/routing work.
- Existing historical dates, image rights and legacy marketing statistics/testimonials are reconciled/preserved repository evidence, not independently verified facts. The four-vs-ten tips mismatch and past client claims remain unchanged because rewriting article prose was forbidden. Existing chart placeholder is flagged, not fabricated into a chart.
- Existing analytics snippets retain their pre-existing privacy behavior. New module event guards do not retrofit consent into those snippets. Actual GA4 enhanced measurement/GTM account settings remain unknown; no live network receipt is claimed.
- Initial SVG placeholder rendering printed Fontconfig “no writable cache directories” warnings. The final default social card uses the repository logo and geometric shapes, avoiding host-font dependence. Legacy placeholder SVG derivatives are committed and reused; if deliberately regenerated from scratch, SVG font rendering can still depend on host fonts. All social images are decoded/checked at 1200×630.
- Lighthouse is not installed and was not installed for this task. No Lighthouse score or real-user LCP/INP/CLS is claimed. Available local Chromium + axe provide the stated layout/accessibility lab results; original shared main.css/Bootstrap/font assets still load for compatibility.
- Existing `npm test` remains red for the five baseline missing-history failures. Full historical browser suites were not rerun or their provider integrations activated; the scoped new browser suite blocks all external providers and POSTs.

The work is committed locally on `blog-redesign`; no push or deployment was performed.
