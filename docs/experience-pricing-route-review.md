# Central Pricing route: retirement without a blind redirect

The latest task retires `/pricing` from navigation/internal links while requiring an audit before permanent redirection/removal. No HTML anchor in the 48 source pages now points to `/pricing` or `pricing.html`. Packages is a standalone main-navigation link; Services contains neither Packages nor Pricing.

## Verified content and route behavior

- Existing `/pricing` is a separate old plan comparison: Starter, Growth and Premium offers, with published durations and values. These are not the nine approved Heroes monthly/prepaid options, and they are not an exact substitute for the broad `packages.html` catalog.
- Its offer section, values, contact CTAs and meaningful body IDs/fragments are preserved. The existing canonical/sitemap entry remains while traffic evidence is unavailable; discovery has been retired from current menus, not silently turned into a 404 or SEO migration.
- `/pricing.html` and `/pricing` remain available under the current Netlify Pretty URL policy/local route emulator. No permanent redirect, canonical rewrite, deletion or alteration of `_redirects` is added. A redirect to Heroes would change the offer a visitor expected; a redirect to Packages needs an agreed content/fragment mapping.
- Public exact-URL searches did not expose reliable traffic or backlink records. Empty search results are **not** evidence that no visitors/backlinks exist. The connected environment provides no authenticated GA4, Search Console or backlink-tool data.

## Information needed for the final business/SEO decision

Review GA4 landing-page/path data for `/pricing`, `/pricing.html` and trailing-slash variants; Search Console clicks/impressions, query/landing relationships and external links; relevant ad/email links and actual inbound campaign URLs. Distinguish visits from the old site navigation from inbound demand for a particular offer. Inspect known deep links before choosing the destination and fragment mapping.

Then choose whether to keep a direct-only legacy reference or implement a permanent redirect to an actually equivalent current destination. This PR does **not** guess that decision or reopen Heroes pricing. It preserves the legacy URL and deep-link content in the meantime.
