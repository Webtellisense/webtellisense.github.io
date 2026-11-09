# Legal copy and release review

The owner explicitly authorized building the legal pages on 9 November 2026. `/privacy-policy` and `/service-terms` now have structured, customer-facing copy and clean labels. Internal “draft for review” language has been removed from normal marketing, buttons, form links and footers. This is authorization to prepare the concrete copy on draft PR #5, not an assertion that undocumented processing practices or service-contract terms have been independently verified.

## Known facts used

- Published trading name: Webtellisense Consult / Webtellisense. Published location: KM15 Ikot Ibiok, Eket, Akwa Ibom, Nigeria. Email `webtellisense@gmail.com`, telephone `+234 707 584 8564`, existing WhatsApp number.
- Actual website routes: enquiries, newsletter/guide requests, optional Heroes profile, browser Business Audit, Paystack checkout, personal manual verification and onboarding.
- Source-visible providers: Netlify, Paystack, WhatsApp/Meta, Google/Gmail/Analytics/Tag Manager/fonts/maps/YouTube/solar Apps Script, Meta Pixel, Tally, AllOrigins and external asset hosts.
- Existing marketing tags can load on legacy pages. The newer module is disabled pending review; the copy does not falsely describe all pages as already consent-gated or anonymous.
- The nine approved Heroes totals, included advertising allocations, agency-fee-only prepaid discount, monthly recurring where supported, prepaid/manual renewal, manual Paystack confirmation and daily Lagos callback policy.
- One-off work and separately scoped websites/portals are agreed in proposals. No additional minimum contract, refund rule, revision quantity or automatic entitlement is invented.

The privacy page uses purpose-based retention criteria, not fabricated deletion periods. It describes possible lawful bases conditionally, without claiming that an undocumented assessment has already been performed. No Nigerian-only hosting, DPO appointment, guaranteed security, universal consent or legal-compliance certification is asserted. Service Terms are website/service information, not a substitute for the client’s written proposal/agreement or a new blanket refund policy.

## Genuine sign-off before public release

Review the **completed wording** against actual operations:

1. Confirm the responsible legal person/entity and whether the published trading name/address is the correct controller contact.
2. Confirm the activity-by-activity lawful basis, actual staff/provider access, recipient/transfer arrangements, retention/deletion criteria and privacy-request handling. Check current Netlify, Tally, solar Apps Script, newsletter and legacy tracking/consent settings.
3. Confirm that written proposals/payment information clearly provide the service-specific cancellation, refund, renewal, advertising allocation and change-of-scope terms. The website copy deliberately does not invent missing terms or change existing offers.
4. Obtain the owner’s/legal adviser’s approval of these specific pages. A page’s presence is not proof of NDPA compliance.

`config/legal-release.json` therefore keeps `copyApprovedForProduction: false`. The static build **fails before deleting output when Netlify’s CONTEXT is production** until completed-copy approval is recorded. Local and authorized draft Deploy Preview builds work. Both legal pages remain noindex and outside the sitemap during review. No production setting or deployment was changed. This guard implements the owner’s instruction to keep unresolved legal versions out of the public release while making the concrete pages reviewable now.

After factual/legal sign-off, record it and set the release flag deliberately. Clean footer/form labels are already in place; no routing migration or backend is needed. Do not treat the flag itself as legal certification.
