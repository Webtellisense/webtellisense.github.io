# Editorial internal-linking follow-up — PR #4

7 November 2026 · branch `fix/sitewide-technical-audit` · before baseline `7306504` (the first PR #4 implementation), **not** the original main audit. This pass changes editorial HTML and contextual-link focus/hover styling only. No payment logic, service/package prices, legal terms, tracking scripts, provider configuration or PR #3 files changed. No merge or deployment.

## Result and counting rules

**65 new contextual links across 18 pages: all five articles, all ten service pages, About, the homepage and the Business Audit Tool wrapper.** Articles now have 4–6 meaningful in-body links; service pages have 3–4. The 25 core pages have **71 contextual links**, up from seven: 65 additions, six retained existing links (two anchors clarified), and one redundant school-article link removed. One replaced-at-runtime audit-prompt link was also removed; it is excluded from both contextual totals.

A contextual link here is a cross-document internal anchor embedded in a paragraph or editorial list item. Counts exclude headers, nav/footer, breadcrumbs, sidebars/service menus, card/title listings, table-of-contents fragments, buttons, audit prompts replaced by JavaScript, forms, canonicals, social/email/telephone links and external sites. An article card is still useful navigation, but is not counted as editorial prose. Different fragments of one destination count as separate link placements and aggregate under that destination for distribution.

The earlier seven-link change log mixed six durable additions with an overwritten prompt and missed the pre-existing school-design link. This report measures the actual prose before and after, rather than counting classes or repaired footer references. `docs/contextual-links.json` now contains the full current matrix instead of the initial seven-entry attempt.

All 36 HTML files are inventoried. **34 permit indexing in source**; this is not confirmation that Google indexes them. The map actively connects 25 core/evergreen pages. Nine other source-indexable documents retain their isolation (including the alternate homepage canonicalized to home, embedded widget, historic contests, roadmap and solar funnels). Two documents are explicitly noindex. Nothing was newly published, redirected or deindexed in this pass.

## Relationship map

There is no standalone SEO service page. Local SEO belongs to the actual Google Business Profile page; website foundations belong to Website Design; editorial/search content belongs to Content Marketing. Broader technical SEO scope can be read in the existing Deeproots package. No `/seo` page was invented.

| Topic / intent | Existing destination(s) | Purposeful connections implemented |
| --- | --- | --- |
| Website Design | web-design.html | Growth/tips/school/agency articles → website support; website → school checklist, local discovery, conversion and audit. |
| Google Business Profile & Local SEO | google-business-profile.html | Visibility and growth diagnosis → profile service; profile → visibility article, business website and separate paid search. |
| SEO beyond Maps | web-design.html; content-marketing.html; packages.html#price-deeproots | Mobile/site foundations and useful publishing have different roles; Content Marketing → actual Deeproots scope, without changing terms or starting checkout. |
| Social Media Management | social-media-management.html | Growth consistency and visibility article → management; management → creative/content, a practical publishing step and paid-social alternative. |
| Paid Facebook / Instagram | social-media-marketing.html | Growth ad step and PPC comparison → paid social; paid social → organic management, graphic creative, ad readiness and CRO. |
| PPC / Google Ads | ppc.html | Growth guide and GBP comparison → paid search; PPC → paid social, local profile visibility, ad readiness and CRO. |
| Branding & Graphic Design | branding.html; graphics-design.html | Trust/agency copy → identity; identity ↔ everyday creative; creative → social management and Eket business tips; identity → existing Swagger information. |
| Content Marketing | content-marketing.html | Helpful community content, social planning, school news and email drafting → content; content → published blog, discovery article, newsletters and SEO scope. |
| Email Marketing | email-marketing.html | Content distribution and post-opt-in follow-up → email; email → website, content writing, form conversion and discovery education. |
| Conversion Rate Optimization | conversion-rate-optimization.html | Ads, school navigation, site trust, signup forms and audit results → CRO; CRO → paid social, email follow-up and the WhatsApp guide. |
| Education / article relationships | all five existing articles; blog.html | Eket tips → visibility diagnosis → ordered Uyo growth guide; school planning → agency evaluation → growth guide. Every article also receives a relevant service/agency in-body referral. |
| Agency / trust | about.html; reviews.html | Agency article and homepage partnership paragraph → About; About → relevant capabilities, agency education and unaltered customer feedback. |
| Assessment & enquiry | business-audit-tool.html; contact.html | Visibility article / website needs → assessment; short post-tool next steps → education, CRO or human contact; agency article → contact. |
| Packages | packages.html#price-swagger; packages.html#price-deeproots | Two explicitly named information anchors only. No link to legacy Heroes tiers, checkout callbacks, an unconfigured page or a payment activation action. |
| Heroes flagship | PR #3 only — see deferred plan below | No active flagship links on this branch; historic heroes.html is not a substitute. |

## Coverage by source

Each row includes the actual topic/search intent and existing/current prose-link counts; details and complete heading lists are in [the inventory JSON](internal-linking-inventory.json). “Isolated” is an editorial decision for this pass, not a robots directive or an archive operation.

| Source | Scope / source indexing | Topic & search intent | Before → after |
| --- | --- | --- | --- |
| [10-essential-tips-for-businesses-2025.html](../10-essential-tips-for-businesses-2025.html) | core / indexable | Eket small-business visibility; GBP; mobile websites; social groups; reviews — Find practical first steps for local online visibility | 0 → 4 |
| [about.html](../about.html) | core / indexable | Team; local agency strengths; websites; local SEO; branding — Evaluate the team and agency fit | 0 → 5 |
| [audit.html](../audit.html) | isolated / indexable | Embedded digital presence assessment — Complete a self-assessment | 0 → 0 |
| [bahamas/solar.html](../bahamas/solar.html) | isolated / indexable | Bahamas solar marketing briefing — Country-specific solar briefing | 0 → 0 |
| [blog-details.html](../blog-details.html) | excluded / noindex | Unfinished template article — No supported public search intent | 0 → 0 |
| [blog.html](../blog.html) | core / indexable | Five business education articles — Browse practical business marketing advice | 0 → 0 |
| [branding.html](../branding.html) | core / indexable | Logo; typography; colours; brand guidelines and identity — Define a coherent identity and compare design scope | 1 → 4 |
| [business-audit-tool.html](../business-audit-tool.html) | core / indexable | Digital-presence self-assessment wrapper — Identify gaps and choose a next step | 0 → 3 |
| [business-not-showing-up-online.html](../business-not-showing-up-online.html) | core / indexable | Local discoverability; social versus owned websites; trust; GBP — Diagnose why customers cannot find a business despite social activity | 1 → 6 |
| [contact.html](../contact.html) | core / indexable | Telephone; email; WhatsApp; enquiry form — Contact the agency about a project | 0 → 0 |
| [content-marketing.html](../content-marketing.html) | core / indexable | Editorial strategy; educational articles; search-led content — Evaluate writing and content publication support | 0 → 4 |
| [conversion-rate-optimization.html](../conversion-rate-optimization.html) | core / indexable | Landing pages; forms; mobile usability; conversion paths — Improve enquiries from existing traffic instead of only buying more | 1 → 4 |
| [email-marketing.html](../email-marketing.html) | core / indexable | Newsletters; signup forms; email nurture and follow-up — Evaluate email audience building and ongoing customer contact | 1 → 4 |
| [faq.html](../faq.html) | core / indexable | Legacy pricing/payment policies; service deliverables — Understand established process and terms | 0 → 0 |
| [freeguide.html](../freeguide.html) | core / indexable | Online presence checklist lead magnet — Request a checklist | 0 → 0 |
| [google-business-profile.html](../google-business-profile.html) | core / indexable | Google Business Profile; Maps; local SEO; reviews and citations — Get found by local customers in Eket, Uyo and Nigeria | 0 → 3 |
| [graphics-design.html](../graphics-design.html) | core / indexable | Flyers; campaign graphics; print and digital artwork — Commission specific creative work or recurring promotional assets | 0 → 3 |
| [heroes.html](../heroes.html) | isolated / indexable | 2025 Business Heroes contest — Historic contest information | 0 → 0 |
| [how-to-grow-your-business-online-2026.html](../how-to-grow-your-business-online-2026.html) | core / indexable | Uyo/Akwa Ibom growth sequence; GBP; website; social; ads; WhatsApp — Apply an ordered plan for a local service business | 1 → 6 |
| [index.html](../index.html) | core / indexable | Webtellisense agency; services; portfolio; Eket/Nigeria — Find the agency and explore capabilities | 0 → 1 |
| [indexxx.html](../indexxx.html) | isolated / indexable | Alternate agency homepage — Explore alternate site presentation | 0 → 0 |
| [kids-holiday-uyo.html](../kids-holiday-uyo.html) | isolated / indexable | Expired Uyo coding bootcamp — Historic bootcamp information | 0 → 0 |
| [nigeria/solar.html](../nigeria/solar.html) | isolated / indexable | Nigeria solar marketing briefing — Country-specific solar briefing | 0 → 0 |
| [packages.html](../packages.html) | core / indexable | Legacy brand, ad, SEO, social, website and funnel packages — Compare existing package scope | 0 → 0 |
| [ppc.html](../ppc.html) | core / indexable | Google Ads; PPC; search intent; location targeting — Evaluate managed search advertising versus other channels | 0 → 4 |
| [pricing.html](../pricing.html) | core / indexable | Older website subscription offers — Compare older advertised offers | 0 → 0 |
| [reviews.html](../reviews.html) | core / indexable | Existing client testimonials — Evaluate customer experience and trust | 0 → 0 |
| [roadmap.html](../roadmap.html) | isolated / indexable | 12-month interactive service roadmap — Explore a standalone plan | 0 → 0 |
| [social-media-management.html](../social-media-management.html) | core / indexable | Organic Facebook/Instagram publishing; content calendars; community — Delegate consistent social publishing and day-to-day page care | 0 → 4 |
| [social-media-marketing.html](../social-media-marketing.html) | core / indexable | Paid Facebook and Instagram campaigns; creative; WhatsApp leads — Evaluate paid social reach and ad-management support | 0 → 4 |
| [solar.html](../solar.html) | isolated / indexable | Nigerian solar acquisition funnel — Solar-industry campaign enquiry | 0 → 0 |
| [top-features-for-a-school-website.html](../top-features-for-a-school-website.html) | core / indexable | School websites; admissions; news; mobile navigation; trust — Plan a school website for parents in Akwa Ibom and Nigeria | 2 → 4 |
| [value-of-a-digital-agency.html](../value-of-a-digital-agency.html) | core / indexable | Agency strategy; time savings; ongoing support; Eket businesses — Decide whether to work with an agency | 0 → 4 |
| [web-design.html](../web-design.html) | core / indexable | Website design; responsive/mobile sites; technical and on-page SEO — Compare website design support and plan a site | 0 → 4 |
| [webtellisense-solar-landing.html](../webtellisense-solar-landing.html) | isolated / indexable | Solar installation leads campaign — Solar-industry enquiry | 0 → 0 |
| [welcome.html](../welcome.html) | excluded / noindex | Legacy client welcome/Tally flow — Post-checkout next steps | 0 → 0 |

## Destination distribution

Counts below aggregate fragments and exclude every navigation/footer/card link.

| Destination | New this pass | Total current contextual inbound |
| --- | --- | --- |
| [10-essential-tips-for-businesses-2025.html](../10-essential-tips-for-businesses-2025.html) | 1 | 1 |
| [about.html](../about.html) | 2 | 2 |
| [blog.html](../blog.html) | 1 | 1 |
| [branding.html](../branding.html) | 3 | 3 |
| [business-audit-tool.html](../business-audit-tool.html) | 2 | 2 |
| [business-not-showing-up-online.html](../business-not-showing-up-online.html) | 5 | 5 |
| [contact.html](../contact.html) | 2 | 2 |
| [content-marketing.html](../content-marketing.html) | 4 | 4 |
| [conversion-rate-optimization.html](../conversion-rate-optimization.html) | 7 | 7 |
| [email-marketing.html](../email-marketing.html) | 2 | 2 |
| [google-business-profile.html](../google-business-profile.html) | 4 | 6 |
| [graphics-design.html](../graphics-design.html) | 3 | 3 |
| [how-to-grow-your-business-online-2026.html](../how-to-grow-your-business-online-2026.html) | 6 | 6 |
| [packages.html](../packages.html) | 2 | 2 |
| [ppc.html](../ppc.html) | 2 | 2 |
| [reviews.html](../reviews.html) | 1 | 1 |
| [social-media-management.html](../social-media-management.html) | 4 | 4 |
| [social-media-marketing.html](../social-media-marketing.html) | 4 | 4 |
| [top-features-for-a-school-website.html](../top-features-for-a-school-website.html) | 1 | 1 |
| [value-of-a-digital-agency.html](../value-of-a-digital-agency.html) | 3 | 3 |
| [web-design.html](../web-design.html) | 6 | 10 |

The broadest destinations are Website Design (10/71 current links; six new) and CRO (7/71; seven new). Website links cover genuine prerequisites and sector design; CRO is the shared post-click/form/landing-page topic. Neither is used as a catch-all for other services. New links span **21 distinct destinations**, including every service, every article, the blog hub, About, Reviews, the audit wrapper, packages and Contact. Each service and article now has at least one contextual inbound link and an outbound path; none remains contextually orphaned.

Only one exact new anchor repeats: **“Professional branding” twice**, once in the visibility checklist and once in About’s capability statement. Other new anchors differ, including links to the same growth guide’s specific steps. This small repeat is natural to the two sentences; no forced exact-match pattern or link-every-occurrence rule was used. Existing generic “website” remains once in CRO’s introductory traffic discussion. There are no duplicate same-destination links within a source page after the redundant school introduction link was removed.

## Important gaps and intentional limits

- **FAQ and older Pricing:** no contextual inbound links were added, and they have no contextual outbound links. Their existing navigation remains. The documented billing/commitment contradictions need owner decisions; this pass does not recommend those terms as authoritative or modify them.
- **Free Guide:** no contextual inbound/outbound links were added. It is a focused signup journey whose checklist-delivery claims still need provider verification; this pass avoids amplifying an unverified fulfillment promise.
- **Homepage:** now has an in-body route to About, but no inbound prose link. It remains the site’s globally linked entry hub; card/navigation references are deliberately excluded from these counts.
- **Blog hub, Contact, Packages and Reviews:** receive contextual inbound links but have no outbound editorial prose links. Existing article cards, enquiry choices, scope cards and customer quotations serve their respective purposes. No links were inserted inside testimonials, prices or checkout UI simply to increase totals.
- **Isolated/expired pages:** source-indexable campaigns, alternate home, roadmap and embedded audit remain outside the active editorial graph. Their purposes and commercial claims were not repurposed. The noindex template and operational welcome are not recommended destinations.
- **Existing article completeness:** the “10 tips” article contains four numbered tips. It was not padded or substantially rewritten to satisfy a link quota; its existing claims and quotations remain unchanged.
- **SEO and specialist education:** no standalone SEO page or dedicated email/CRO article exists. Existing relevant scope and growth-guide sections are used honestly, not labelled as nonexistent tutorials. More specialist educational content would be a separate editorial project.

## Deferred Heroes connections — no active links

PR #3 contains `webtellisense-heroes.html`, verified read-only on its branch; the file is absent here/main. Its checkout/start/welcome experience is untouched. After that marketing page is actually available in the target branch, review these **candidate** placements against its final published copy and pricing. This is not permission to merge PR #3 or to change commercial terms:

| Source context | Candidate anchor / intent | Future destination |
| --- | --- | --- |
| Growth guide, #together: one team running the system | Heroes support for the whole system — integrated management, separate from the instructional sequence | webtellisense-heroes.html |
| Agency-value article: ongoing support | Explore Heroes — an option when the reader wants ongoing multi-service support | webtellisense-heroes.html |
| About: broad capabilities, outside quoted results | Webtellisense Heroes — flagship overview rather than a service-specific quote | webtellisense-heroes.html |
| Audit wrapper: optional post-assessment next step | Explore Heroes support — one alternative alongside education and personal contact | webtellisense-heroes.html |
| Homepage: neutral agency/partnership copy only | Explore Heroes — first reconcile unrelated historic home offer copy; never silently retarget a discounted-price CTA | webtellisense-heroes.html |

Never point these anchors at the historic contest, legacy Heroes price card, `heroes-start`, a welcome page, or a payment URL. Add marketing links only after the page exists and its real destination has been tested.

## Current internal-linking matrix

Every current contextual link is listed, including retained links. Source links include HTML line references. [CSV export](internal-linking-matrix.csv) includes the complete surrounding paragraph; [JSON matrix](contextual-links.json) is generated from the actual source. “New” means added since `7306504`, not a repaired footer or an already-existing link with different styling.

| Source | Destination | Anchor text | Status | Context / reason |
| --- | --- | --- | --- | --- |
| [10-essential-tips-for-businesses-2025.html](../10-essential-tips-for-businesses-2025.html#L176) | google-business-profile.html | complete, optimized profile | New | Local search tip → profile setup and management |
| [10-essential-tips-for-businesses-2025.html](../10-essential-tips-for-businesses-2025.html#L182) | web-design.html | work perfectly on phones | New | Mobile-site advice → responsive website service |
| [10-essential-tips-for-businesses-2025.html](../10-essential-tips-for-businesses-2025.html#L196) | content-marketing.html | Share valuable content | New | Helpful community content → content strategy and writing |
| [10-essential-tips-for-businesses-2025.html](../10-essential-tips-for-businesses-2025.html#L207) | business-not-showing-up-online.html | why a Facebook page alone is not enough | New | Reviews and discovery → deeper visibility diagnosis |
| [about.html](../about.html#L166) | web-design.html | Websites that showcase your business | New | Agency strengths → website capability |
| [about.html](../about.html#L168) | google-business-profile.html | SEO strategies | New | Eket local-search positioning → local SEO service |
| [about.html](../about.html#L170) | branding.html | Professional branding | New | Agency strengths → identity capability |
| [about.html](../about.html#L176) | reviews.html | client feedback | New | Agency evaluation → existing client reviews, no quote changes |
| [about.html](../about.html#L177) | value-of-a-digital-agency.html | working with a digital partner | New | Agency evaluation → existing support and strategy article |
| [branding.html](../branding.html#L321) | value-of-a-digital-agency.html | how an agency supports business growth | New | Identity work → strategic agency relationship article |
| [branding.html](../branding.html#L356) | web-design.html | website headers | Existing; anchor refined | Retain website application of the logo; clarify the anchor to website headers. |
| [branding.html](../branding.html#L363) | graphics-design.html | graphic design service | New | Identity system → its application in ongoing creative work |
| [branding.html](../branding.html#L365) | packages.html#price-swagger | Swagger brand-identity tiers | New | Explicitly separate existing branding offer; no prices or checkout activation |
| [business-audit-tool.html](../business-audit-tool.html#L206) | business-not-showing-up-online.html | what can hold back your online visibility | New | Self-assessment → discovery diagnosis |
| [business-audit-tool.html](../business-audit-tool.html#L207) | conversion-rate-optimization.html | how to improve the path from visit to enquiry | New | Self-assessment → conversion service |
| [business-audit-tool.html](../business-audit-tool.html#L208) | contact.html | contact the Webtellisense team | New | Self-assessment → human discussion without implying paid activation |
| [business-not-showing-up-online.html](../business-not-showing-up-online.html#L244) | social-media-management.html | ongoing social media management | New | Explain the support role of regular social publishing |
| [business-not-showing-up-online.html](../business-not-showing-up-online.html#L277) | web-design.html | A professional website helps customers | New | Owned-site explanation → website service |
| [business-not-showing-up-online.html](../business-not-showing-up-online.html#L303) | google-business-profile.html | Google Business Profile | Existing | Retain profile management as a response to the local discovery gap. |
| [business-not-showing-up-online.html](../business-not-showing-up-online.html#L350) | branding.html | Professional branding | New | Editorial trust checklist → identity design |
| [business-not-showing-up-online.html](../business-not-showing-up-online.html#L426) | how-to-grow-your-business-online-2026.html | step-by-step online growth guide | New | Diagnosis → ordered implementation guide |
| [business-not-showing-up-online.html](../business-not-showing-up-online.html#L428) | business-audit-tool.html | Business Audit Tool | New | Reader uncertainty → existing self-assessment |
| [content-marketing.html](../content-marketing.html#L321) | blog.html | in-depth, easy-to-read articles and guides | New | Show the actual published educational articles behind the writing service |
| [content-marketing.html](../content-marketing.html#L337) | email-marketing.html | Email newsletters | New | Evergreen content → distribution and repeat contact |
| [content-marketing.html](../content-marketing.html#L366) | packages.html#price-deeproots | Deeproots SEO scope | New | No standalone SEO page exists; point to the actual SEO package scope |
| [content-marketing.html](../content-marketing.html#L377) | business-not-showing-up-online.html | guide to business visibility | New | Search-oriented writing → educational local discovery context |
| [conversion-rate-optimization.html](../conversion-rate-optimization.html#L317) | web-design.html | website | Existing | Retain the owned-site reference in the traffic and conversion discussion. |
| [conversion-rate-optimization.html](../conversion-rate-optimization.html#L317) | social-media-marketing.html | social media ads | New | Traffic source → paid Facebook/Instagram service |
| [conversion-rate-optimization.html](../conversion-rate-optimization.html#L350) | how-to-grow-your-business-online-2026.html#step5 | WhatsApp conversion guide | New | Funnel friction → specific educational follow-up section |
| [conversion-rate-optimization.html](../conversion-rate-optimization.html#L370) | email-marketing.html | email follow-up | New | Lead capture → separate email relationship service without promising delivery |
| [email-marketing.html](../email-marketing.html#L323) | web-design.html | business website | Existing; anchor refined | Retain the website prerequisite for visitor signups; clarify the anchor. |
| [email-marketing.html](../email-marketing.html#L356) | content-marketing.html | content drafting | New | Newsletter writing → broader content creation |
| [email-marketing.html](../email-marketing.html#L362) | conversion-rate-optimization.html | clean sign-up boxes | New | Email acquisition → form conversion experience |
| [email-marketing.html](../email-marketing.html#L364) | business-not-showing-up-online.html | why businesses struggle to get found online | New | Sign-up acquisition → existing discovery article, not an email tutorial claim |
| [google-business-profile.html](../google-business-profile.html#L306) | business-not-showing-up-online.html | our visibility guide | New | Local-search introduction → educational diagnosis |
| [google-business-profile.html](../google-business-profile.html#L335) | ppc.html | Paid Google search campaigns | New | Differentiate local organic visibility from paid search |
| [google-business-profile.html](../google-business-profile.html#L345) | web-design.html | business website | New | Local entity consistency → owned website |
| [graphics-design.html](../graphics-design.html#L320) | branding.html | brand identity design | New | Distinguish identity foundation from one-off artwork |
| [graphics-design.html](../graphics-design.html#L352) | 10-essential-tips-for-businesses-2025.html | practical tips for Eket businesses | New | Design service → local business education beyond artwork |
| [graphics-design.html](../graphics-design.html#L359) | social-media-management.html | social media product cards | New | Recurring promotional graphics → ongoing social management |
| [how-to-grow-your-business-online-2026.html](../how-to-grow-your-business-online-2026.html#L262) | google-business-profile.html | Google Business Profile | Existing | Retain the first growth step’s local-search service recommendation. |
| [how-to-grow-your-business-online-2026.html](../how-to-grow-your-business-online-2026.html#L325) | web-design.html | simple, mobile-first website | New | Website action step → mobile-first design service |
| [how-to-grow-your-business-online-2026.html](../how-to-grow-your-business-online-2026.html#L377) | social-media-management.html | simple content calendar | New | Consistency action step → ongoing publishing management |
| [how-to-grow-your-business-online-2026.html](../how-to-grow-your-business-online-2026.html#L388) | social-media-marketing.html | Facebook ads | New | Distinguish paid social distribution from search advertising |
| [how-to-grow-your-business-online-2026.html](../how-to-grow-your-business-online-2026.html#L388) | ppc.html | Google search ads | New | Match search intent to the Google Ads service |
| [how-to-grow-your-business-online-2026.html](../how-to-grow-your-business-online-2026.html#L407) | conversion-rate-optimization.html | a dedicated landing page | New | Conversion step → landing-page optimization rather than more traffic |
| [index.html](../index.html#L902) | about.html | dedicated partner | New | Agency partnership explanation → team and company background |
| [ppc.html](../ppc.html#L372) | social-media-marketing.html | general social media campaigns | New | Compare Google search intent with paid social ads |
| [ppc.html](../ppc.html#L375) | conversion-rate-optimization.html | conversion rate optimization | New | Paid acquisition → post-click visitor experience |
| [ppc.html](../ppc.html#L396) | how-to-grow-your-business-online-2026.html#step4 | step-by-step growth guide | New | Campaign preparation → specific ad-readiness guidance |
| [ppc.html](../ppc.html#L559) | google-business-profile.html | Google Business Profile management | New | Local-market explanation → complementary Maps presence |
| [social-media-management.html](../social-media-management.html#L330) | graphics-design.html | professional graphic design team | New | Branded posts → dedicated graphic design capability |
| [social-media-management.html](../social-media-management.html#L339) | content-marketing.html | a full month of content ahead of time | New | Publishing plan → broader content strategy |
| [social-media-management.html](../social-media-management.html#L350) | how-to-grow-your-business-online-2026.html#step3 | social-media step in our growth guide | New | Service → practical consistency advice |
| [social-media-management.html](../social-media-management.html#L352) | social-media-marketing.html | paid Facebook and Instagram campaigns | New | Distinguish organic page management from paid reach |
| [social-media-marketing.html](../social-media-marketing.html#L318) | social-media-management.html | regular posting | New | Paid reach introduction → separate organic management service |
| [social-media-marketing.html](../social-media-marketing.html#L358) | how-to-grow-your-business-online-2026.html#step4 | when to start advertising | New | Campaign service → ad-readiness education |
| [social-media-marketing.html](../social-media-marketing.html#L360) | conversion-rate-optimization.html | landing-page conversion | New | Paid traffic → usable conversion destination |
| [social-media-marketing.html](../social-media-marketing.html#L368) | graphics-design.html | bold, thumb-stopping flyers | New | Ad creative explanation → graphic design |
| [top-features-for-a-school-website.html](../top-features-for-a-school-website.html#L245) | content-marketing.html | regularly updated news feed | New | School communications → ongoing content creation |
| [top-features-for-a-school-website.html](../top-features-for-a-school-website.html#L253) | conversion-rate-optimization.html | simple, well-labelled navigation menu | New | Usability advice → removing visitor friction |
| [top-features-for-a-school-website.html](../top-features-for-a-school-website.html#L268) | value-of-a-digital-agency.html | working with a digital agency | New | School implementation decision → agency support article |
| [top-features-for-a-school-website.html](../top-features-for-a-school-website.html#L269) | web-design.html | see how Webtellisense approaches school website design | Existing | Retain the school design next step; add underlining and focus styling. |
| [value-of-a-digital-agency.html](../value-of-a-digital-agency.html#L175) | about.html | experienced agency | New | Reader evaluating an agency → team and agency background |
| [value-of-a-digital-agency.html](../value-of-a-digital-agency.html#L176) | web-design.html | website design and development service | New | DIY-versus-agency comparison → the actual professional website service |
| [value-of-a-digital-agency.html](../value-of-a-digital-agency.html#L204) | how-to-grow-your-business-online-2026.html | online growth guide | New | Ongoing strategy → practical staged growth article |
| [value-of-a-digital-agency.html](../value-of-a-digital-agency.html#L206) | contact.html | talk to the Webtellisense team | New | Agency evaluation → contact, without adding a purchase promise |
| [web-design.html](../web-design.html#L307) | conversion-rate-optimization.html | decide if they can trust you enough to call or buy | New | Website purpose → improving conversion paths |
| [web-design.html](../web-design.html#L349) | top-features-for-a-school-website.html | school website feature checklist | New | Responsive-site explanation → practical sector-specific planning guide |
| [web-design.html](../web-design.html#L357) | google-business-profile.html | find your business on Google | New | Local search foundations → Google Business Profile support |
| [web-design.html](../web-design.html#L451) | business-audit-tool.html | Take our 1-minute audit | New | Existing discovery invitation → actual audit page |

## Validation and reproduction

- `python scripts/internal_link_inventory.py`: regenerates all-page topics/links, before/after comparison, distribution, matrix and CSV. The 65 annotated additions must be found in actual eligible prose; missing or unexpected links fail generation. Curated topic/scope input is `docs/content-topics.json`; new-placement rationale is `docs/editorial-link-additions.json`.
- `python scripts/audit_site.py docs/technical-after.json`: **zero missing file targets**, **two unchanged historic legal fragments** (`heroes.html#terms` / `#privacy`). All newly linked targets and fragments exist. SEO/tracking/source defect totals remain repaired; this pass does not apply the old payment proposal.
- `npm test`: six existing regression groups, including JavaScript syntax and the original payment/pricing/tracking preservation checks.
- `npm run test:browser`: existing keyboard, audit injection/share, mocked form errors, scroll tracking, checkout-drawer-only and representative reflow checks.
- `node tests/browser-scan.cjs`: all 36 before/after local page loads, 34 locally styled pages scanned with axe. Zero after-load exceptions; original body/header/nav computed typography and colours preserved. Known non-link contrast findings remain; this is not a WCAG certification or a live-provider check.
- `npm run test:links`: local Chromium checks every one of the 71 durable prose anchors on 18 pages, destination HTTP responses/fragments, 320/390/768/1280 reflow, persistent underline, keyboard focus outline and at least 4.5:1 hover text contrast (including gradient endpoints). Static anchors are also present with JavaScript disabled; this does not certify all legacy AOS components’ complete no-JavaScript experience. Evidence: `docs/internal-linking-browser-validation.json`.
- Additional preservation comparison against `7306504`: packages, pricing, welcome, historic Heroes, FAQ, embedded audit, Contact and Free Guide are byte-identical; **every HTML script block is unchanged**. No payment, tracking or backend behavior changed. `git diff --check` and the unapplied payment patch’s applicability check pass.

Serve this checkout at `127.0.0.1:8781`, and the original `b639eeb` main baseline at `127.0.0.1:8782` for the existing all-page before/after scan, as documented in the technical report. Install existing dev dependencies with `npm ci`; use `/usr/bin/chromium` or `CHROMIUM_PATH`. All browser runners block external providers and non-GET requests, except the existing explicit local form mock in the functional suite. No live events, messages, payments or submissions were sent.
