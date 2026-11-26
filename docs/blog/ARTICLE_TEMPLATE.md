# Article schema and authoring template

Save articles as `content/blog/<slug>.md`; save their approved images under `assets/img/blog/<slug>/`. Source links in frontmatter may be external; image files must be local root-relative `/assets/img/…` paths. Markdown files, research records and this documentation are excluded from the published static tree.

## Frontmatter schema

| Field | Type / rule |
| --- | --- |
| title | Required non-empty string; visible H1. |
| slug | Required lowercase hyphenated stem, e.g. `google-maps-nigeria`; no slash or `.html`. New URL is `/<slug>` with existing host `.html` alias policy. Cannot collide with any root HTML route or legacy slug. |
| category | Required fixed category from the list below. |
| primaryKeyword | Required string; research-backed distinct intent. |
| secondaryKeywords | Required array of strings; `[]` permitted. |
| metaTitle | Required unique SEO title. |
| metaDescription | Required unique description. |
| excerpt | Required plain-text summary for article header, archive cards and RSS. |
| publishedAt | Required real date, quoted ISO `YYYY-MM-DD`. Do not use a build timestamp. |
| updatedAt | ISO date on/after publishedAt, or `null`; may be omitted when there has been no meaningful update. Cosmetic layout changes are not editorial updates. |
| author | Defaults to `Webtellisense Editorial Team` when omitted; only that organisation byline is currently accepted for new Markdown. No invented biography or credentials. |
| heroImage | Required local image path or literal `MISSING`. A ready article with MISSING is downgraded to draft with a warning. Invalid/nonexistent paths fail validation. |
| heroAlt | String; meaningful and non-empty for a supplied hero. Empty permitted with MISSING. |
| heroCredit | String; non-empty credit/usage attribution for a supplied hero. Verify actual rights separately. Empty permitted with MISSING. |
| quickAnswer | Optional plain-text string. Omit the field entirely when not applicable. |
| faqs | Optional array of `{q, a}` plain-text strings; `[]` means no visible FAQ or FAQPage schema. |
| sources | Required array of `{title, url, checked}`; checked is ISO date, url is absolute http(s). `[]` is structurally valid but does not waive editorial sourcing. |
| related | Optional array of existing article slugs. These boost deterministic matching; draft targets never appear publicly. Unknown/self slugs fail. |
| status | Required `draft` or `ready`. Ready also requires research, rights and editorial review; validation alone does not establish those facts. |

Categories, exactly:

- Local Business
- Business Growth
- Energy and Solar
- Digital Marketing
- Technology and AI
- Money and Funding
- Industry Insights
- Case Studies

No custom keys, duplicate YAML keys or YAML aliases are accepted. Quote dates; lists must be YAML arrays. Use H2/H3 only in the body, with no skipped first level. Raw HTML, scripts, unsafe URL schemes and non-existent internal routes are rejected. Markdown supports ordered lists, ordinary tables and images with quoted captions. Tables get their own keyboard-focusable scrolling container. A `**Note:**` or `**Warning:**` blockquote gets a styled callout.

The skeleton below deliberately has blank required values. Fill them before running a build, even for a draft; it is documentation, not a file to publish unchanged. Do not save the research-record section inside an article's Markdown body, because body content is published when ready.

## Blank article skeleton

````markdown
---
title: ""
slug: ""
category: "Local Business"
primaryKeyword: ""
secondaryKeywords: []
metaTitle: ""
metaDescription: ""
excerpt: ""
publishedAt: ""
updatedAt: null
author: "Webtellisense Editorial Team"
heroImage: MISSING
heroAlt: ""
heroCredit: ""
sources: []
related: []
status: draft
---

## [First section]

[Verified opening and article text go here.]

### [Supporting detail]

[Evidence, explanations and practical steps go here.]

> **Note:** [An evidence-backed note, when useful.]

> **Warning:** [A relevant warning, when useful.]

1. [First step]
2. [Second step]

| [Heading] | [Heading] |
| --- | --- |
| [Value] | [Value] |

````

Optional frontmatter examples (replace bracketed prompts with researched values):

```yaml
quickAnswer: "[A concise answer supported by the article.]"
faqs:
  - q: "[A real reader question?]"
    a: "[A verified answer.]"
sources:
  - title: "[Original source title]"
    url: "https://[verified-source-host]/[verified-path]"
    checked: "[YYYY-MM-DD]"
```

Image/caption syntax, after the local asset exists and rights are verified:

```markdown
![Describe the actual image](/assets/img/blog/your-slug/your-image.jpg "Accurate caption and attribution")
```

CTAs come from `content/blog/cta.json` by category, not invented article routes or hard-coded paid offers. Default is one secondary closing contact CTA, with no automatic in-content promotion. An editor can include a contextual link in the prose; keep at most one in-content promotional block and one closing CTA.

## Per-article research record

Keep this record in the editorial working system/private research material, outside `content/blog/*.md` and outside the published assets tree. This change creates no standalone research documents.

- Research date:
- Primary keyword:
- Secondary keywords:
- Search intent:
- Audience:
- Competitor URLs:
- Source URLs (with checked/effective dates):
- Verified claims (claim → original source → relevant passage/data):
- Outstanding verification:
- Image sources and usage rights (creator, original URL/file, licence, permission, credit):
- Internal link opportunities (verified URL, reader benefit, intended anchor):
- Price sample, where relevant (at least five comparable configurations, checked dates, included/excluded costs):
- Editorial review outcome and reviewer/date:

See `IMPLEMENTATION_REPORT.md` → “How to import articles” for exact build, preview and verification commands.
