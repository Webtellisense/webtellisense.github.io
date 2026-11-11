# Heroes copy polish and consent controls

Current PR #6 follow-up, 11 November 2026. Genuine Chromium screenshots at 1440/390. The source is served locally under an intercepted HTTPS production origin so the real consent UI is exercised. All optional provider requests/writes are blocked; these are not live-site or provider-delivery captures. Fonts/images are awaited and content actually scrolled; reduced motion is enabled. Section captures fit a taller viewport without editing the render.

| View | Desktop | Mobile |
| --- | --- | --- |
| Opening, with natural customer enquiries | [1440](opening-1440.jpg) | [390](opening-390.jpg) |
| Responsibilities and concrete search/workflow copy | [1440](responsibilities-1440.jpg) | [390](responsibilities-390.jpg) |
| Full current page, after explicit rejection | [1440](heroes-1440.jpg) | [390](heroes-390.jpg) |
| Initial optional choices | [1440](consent-1440.jpg) | [390](consent-390.jpg) |
| Reopened preferences, reached by pointer | [1440](preferences-1440.jpg) | [390](preferences-390.jpg) |

Mobile enquiry states: [school visit](enquiry-2-390.jpg), [cleaning quote](enquiry-3-390.jpg), [electrician callback](enquiry-4-390.jpg), [lunch order](enquiry-5-390.jpg). These are hypothetical conversations, not claimed client transactions.

The prior approved PR #6 images remain in [the product-specification gallery](../heroes-product-previews/README.md). Its historical pixel-identical-opening statement describes the earlier product-specification pass; this follow-up intentionally changes activity copy/labels while preserving its design and animation code. Approved product specifications, pricing markup, all totals/allocations, media, selectors and payment URLs are protected by the updated regression checks. Only footer clearance was added to keep mobile privacy controls above the fixed contact bar.

See [the implementation/event report](../heroes-copy-and-analytics.md), [synthetic network receipts](../heroes-analytics-browser-validation.json) and `captures.json` for exact methods and limits.
