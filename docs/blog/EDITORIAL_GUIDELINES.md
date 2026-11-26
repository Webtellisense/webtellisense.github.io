# Webtellisense blog editorial guidelines

## Voice

Write as a knowledgeable Nigerian business journalist who understands technology, marketing and the realities of running a business here. Be conversational, intelligent, direct and evidence-driven. Use natural Nigerian English with British spelling. Local references such as NEPA, fuel costs, shop rent, business levies and WhatsApp vendors belong where they fit. Do not force slang or Pidgin. Vary sentence length.

Open with an observation, a verified fact, a relatable problem, or a clearly labelled hypothetical. Never fabricate interviews, customers, testimonials or experiences.

Banned phrases:

- “in today's digital landscape”
- “in an ever-evolving world”
- “unlock your potential”
- “delve into”
- “game-changing”
- “harness the power of”
- “seamlessly leverage”
- “in conclusion”

## Accuracy

Prefer official sources, regulators, manufacturer and supplier documentation, Google documentation, credible Nigerian publications, and anonymised Webtellisense campaign data. Link material claims to the original source. Never invent campaign evidence or assume permission to publish it.

For grants, distinguish **announced, approved, open, closed and disbursed**. For elections, verify through INEC and stay politically neutral. For electricity, use NERC, AKSERC and the relevant DisCo. For tax, use current legislation. Record source URL and date checked; identify effective dates and unresolved verification. Preserve the existing acquisition pillar's role and the overlap decisions in `CONTENT_INVENTORY.md`.

## Pricing

Use only publicly advertised prices or obtained quotations, with the date checked. Distinguish kVA, kW and kWh, lithium and lead-acid, hybrid and conventional, equipment-only and installed, and delivery, warranty and tax.

Use at least five comparable prices before calculating minimum, maximum, median or mean, and describe the sample. Never call a national supplier sample the average price in Uyo or Eket. Never mix materially different configurations. Make assumptions explicit and never promise profitability, savings or returns without appropriate evidence.

## SEO

Give each article one distinct search intent. Put the primary keyword in the SEO title, within the first 100 words, and about three times in the body. These are natural-writing guidelines, not a density quota: no keyword stuffing, near-duplicate city pages or blog posts targeting transactional keywords already served by a service page.

Use contextual internal links to verified destinations in `AUDIT.md`; newly published blog routes become available after the generator registers them. Do not invent hotel, WhatsApp, service or pricing routes. Use H2 and H3 in Markdown; the template supplies the H1. Keep FAQ schema aligned with visible FAQs. Use the fixed category vocabulary, not tag archives.

## Length guide

These ranges guide depth; they are not word-count targets.

| Format | Words |
| --- | ---: |
| Timely explainer | 600–1,000 |
| Business advice | 1,000–1,800 |
| Tutorial | 1,200–2,200 |
| Pricing guide | 1,500–2,500 |
| Pillar article | 2,000–3,500 |

## Images

Priority: original Webtellisense photos, permissioned local photos, original screenshots, original charts, licensed stock, then Wikimedia Commons with attribution. Record source, creator, licence, attribution and usage rights in the research record. Describe what an image shows; do not infer a person's location, employer or customer relationship.

No scraped images, fabricated screenshots of portals, quotes or analytics, or AI-generated images. Never hotlink third-party images. Save approved files under `/assets/img/blog/`, supply meaningful alt text and credit, and flag missing assets with `heroImage: MISSING`. A ready Markdown article with a missing hero is downgraded to draft by the build; the neutral placeholder appears only in an explicit local preview. Existing text-hero legacy articles are preserved as a documented exception.

## Definition of done for ready

A ready article has a distinct reader need, verified claims, sourced prices and statistics, natural writing, legal and meaningful images, working links, complete metadata, working mobile and desktop layout, accurate structured data, an appropriate CTA, no duplication, and a passed editorial review.

The build validates structure and assets; it cannot certify research, image rights, source truth or editorial approval. Keep `status: draft` until the human review is complete. Do not use a passing automated check as publication approval.
