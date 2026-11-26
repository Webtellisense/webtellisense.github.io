You are verifying newly added blog articles on the Webtellisense site. Articles to verify (slugs): akserc-explained-akwa-ibom-electricity-regulator

Read docs/blog/IMPLEMENTATION_REPORT.md (especially "How to import articles"), docs/blog/ARTICLE_TEMPLATE.md, docs/blog/EDITORIAL_GUIDELINES.md, docs/blog/CONTENT_INVENTORY.md and the route table in docs/blog/AUDIT.md. Do not ask me questions. If something is ambiguous, apply the rule below, record it, and continue. Do not push or deploy. Leave all changes as a diff for me to review.

Hard rules:
- Never edit article prose or the article's frontmatter values. You may only fix frontmatter formatting and image file paths. Report any prose or content problem instead.
- If a listed file does not exist in content/blog/, say so and stop.

For each listed article:
1. Confirm the hero image named in heroImage exists under assets/img/blog/<slug>/ and report its pixel dimensions and file size. Warn if narrower than 1200px. If it is missing, report it and stop.
2. Confirm every internal link in the body points to a route in the AUDIT.md allowlist (extensionless form) or to a published article. Remove nothing. Report any that fail.
3. Report (do not fix): banned phrases from EDITORIAL_GUIDELINES.md; whether the primary keyword is in the first 100 words and how many times it appears; heading order; images without alt text; word count against the category length guide; sources with no checked date.
4. Cannibalisation: compare slug and primaryKeyword with CONTENT_INVENTORY.md and all other files in content/blog/. If the intent clearly duplicates an existing article, stop and report.

Then run, in this order, and report each result: npm ci (use a writable cache path if needed), npm run build, npm run check:blog, npm run test:blog, npm run test:blog:browser.

In the built output, confirm for each listed article: exactly one H1, unique title and description, self-referencing canonical, Open Graph and Twitter tags, a 1200x630 social image, BlogPosting and BreadcrumbList JSON-LD that parse, FAQPage JSON-LD matching the visible FAQs, presence in sitemap.xml with the correct lastmod, presence in blog/rss.xml, presence on the blog index and its category page. Confirm no draft appears anywhere in the output and that no previously existing URL has changed.

Update CONTENT_INVENTORY.md with a row for each listed article: title, slug, category, primary keyword, audience, search intent, research status, writing status, image status, publication status, last verification date (the latest "checked" date in its sources). Append a dated entry to IMPLEMENTATION_REPORT.md with a table of each article (verified, warnings, blocked), all findings, build and test results, and open issues. Then stop.
