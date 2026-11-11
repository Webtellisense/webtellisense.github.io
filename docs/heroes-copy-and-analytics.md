# Heroes final copy and measurement activation

11 November 2026 · existing draft PR #6 · `feat/heroes-product-specification`.

## Customer experience

Removed internal/simulation labels from visible copy, captions, controls and accessible names. The search visual now uses **Cleaning services in Uyo**; the animated conversations concern solar installation in Eket, a school visit, an office-cleaning quote, an electrician callback and lunch orders. **How a conversation can begin** makes the activity sequence hypothetical naturally, without presenting it as live customer transactions. Photographs have neutral descriptive alt text; no stock subject is named as Webtellisense staff or a customer.

Responsibility/workflow copy now explains what customers find, understand and enquire about, how agreed marketing work is coordinated and how the owner stays informed. The approved three-tier specification comparison and the entire pricing block remain byte-for-byte unchanged. No new section, service entitlement, price, allocation, CTA destination, payment link or commercial term was added. Portfolio composition/media and onboarding behavior are preserved; only its unnecessary caption/control labels and photographic alt wording changed.

Testing found the fixed mobile contact bar covered the footer’s Measurement choices button. Narrowly scoped CSS adds footer clearance on Heroes marketing/public plan selection and resets consent checkboxes that inherited full-width profile-field sizing. The existing page design and animation rules are unchanged. Play/Pause controls now say messages rather than demo; the sequencing logic is unchanged.

## Destination and deployment decision

Owner confirmed these general website destinations:

| Provider | Installation for Heroes | Destination |
| --- | --- | --- |
| GA4 | One direct consent-loaded `gtag/js` SDK; one `gtag('config')`, `send_page_view:false`; one manually controlled page view | `G-PS5FNQCJRN` |
| Meta | One consent-loaded `fbevents.js` SDK; one `init`; scoped `trackSingle` / `trackSingleCustom` calls | `806267492040936` |
| GTM | **Not installed on Heroes** | Existing homepage container `GTM-NJ6L82XR` remains unchanged |

`measurement-config.js` now has **`releaseApproved:true`** and **`metaPixel:'806267492040936'`**. This is executable activation in the PR, not a deferred recommendation. There is no remaining source release flag, unknown pixel ID, new environment variable or dashboard configuration needed to enable these tags after an approved release. Nothing was deployed by this task.

Homepage source already contains direct GA4, GTM and the general Meta base code. That establishes possible GA/GTM overlap, not the contents of the published GTM container. Read-only retrieval of its public script was attempted: the environment’s proxy refused the CONNECT request with **HTTP 403**. No container/account contents were inspected and no homepage tag was removed. Adding GTM to Heroes would import unverified tags and consent behavior, so Heroes uses only the two known direct destinations.

The shared module’s route allowlist prevents this activation from silently enabling industry or unrelated pages. Inactive pages also leave existing legacy cookies untouched on arrival; explicit withdrawal remains available through preferences. Production measurement is restricted to `webtellisense.com` / `www.webtellisense.com`; local and Netlify preview hosts do not send production measurement.

## What loads, and when

| Page/choice | Optional provider behavior |
| --- | --- |
| `/heroes`, `.html` alias or trailing-slash alias, before a choice / reject-all | No Google or Meta SDK, collector, noscript pixel or pre-consent custom-event queue |
| `/heroes`, analytics only | GA4 SDK and one `page_view` per document; no Meta SDK |
| `/heroes`, advertising only | Meta SDK and one `PageView` per document; no GA4 SDK |
| `/heroes`, both enabled | One SDK/configuration per destination and one corresponding page view each |
| Public `/heroes-start` selection, with corresponding consent | Selection/contact/valid handoff events only; **no automatic GA or Meta page view**. This page contains public plan selectors, not private payment details. The Paystack checkout remains external. Direct arrivals without a choice stay unmeasured unless the visitor opens preferences and opts in. |
| Welcome, profile receipt, general welcome | Module exits before creating provider measurement, even with saved consent or forged `verified` / reference parameters |
| Privacy Policy | Preferences can be changed/withdrawn here; no optional provider SDK or event |
| Industries, other/new pages, Service Terms | Outside provider activation; no optional SDK/event from this module |
| GPC or Do Not Track enabled | Optional measurement stays off, even if an earlier stored choice allowed it |
| Existing foreign GA/Meta base tag or GTM found on the document | Module refuses an additional installation; it does not silently replace that tag |

Separate unchecked analytics/advertising options, reject-all and save controls remain. Measurement choices reopens them; Escape dismisses the panel and returns focus. A new consent version (`heroes-2026-11`) prevents reuse of review-stage consent for newly confirmed destinations. Invalid, stale or inaccessible storage provides no persisted permission. With storage blocked, explicit opt-in works for the current document only.

Withdrawal stops module events immediately, sets GA’s destination disable flag and denied consent, revokes Meta consent, clears pending post-consent events and removes accessible first-party cookies for the configured GA property (`_ga`, `_ga_PS5FNQCJRN`) and Meta (`_fbp`, `_fbc`). It cannot erase data already held by providers or third-party/HttpOnly cookies. A storage listener applies changes to other open tabs using the module. SDK readiness callbacks recheck current consent, including withdrawal while a script is downloading; regrant sends an unsent page view once, without replaying withdrawn interactions or duplicating a view already sent.

GA advertising storage/user-data/personalization stay denied; Google Signals and ad personalization are disabled. Meta automatic configuration is disabled and initialization contains no advanced-matching/customer arguments. Optional providers still receive device/network information and their identifiers after opt-in; this is **not anonymous processing** or a claim of complete legal compliance.

## Interaction event map

| Event | Genuine source | Allowlisted context |
| --- | --- | --- |
| `page_view` (GA) / `PageView` (Meta) | Consented Heroes marketing document only | Fixed canonical path; no amounts or customer data |
| `heroes_tier_select` | Product-comparison mobile selector; existing mobile pricing tier button; Activate/Choose tier link; public selection tier dropdown | `tier`, and `period` when the clicked option supplies it |
| `heroes_period_select` | Existing billing radio / public billing selector | `period` |
| `heroes_talk_to_sales` | Talk/Discuss/Ask contact CTAs, email or contact destination | Channel enum |
| `heroes_call_click` | Telephone link | `channel:call` |
| `heroes_whatsapp_click` | WhatsApp link | `channel:whatsapp` |
| `heroes_paystack_handoff` | Visible, configured, allowlisted Paystack hosted-page link in public selection | Tier/period enums; **click only**, never payment confirmation |

A Talk to Sales link using WhatsApp intentionally records a consultation-intent event and a channel-click event: one of each per enabled destination, not duplicate emissions of the same event. No `Purchase`, standard `Lead`, verified/qualified-lead event, revenue or transaction value is emitted. This implementation does not register account-side key events/custom conversions.

All custom payloads permit only canonical `page_path`, tier/period/channel enums; GA also receives fixed `page_location` and an empty referrer. No arbitrary URLs, messages, names, emails, phone numbers, form answers or payment references are copied into events. Query/fragment data is removed before either SDK loads. Meta is suppressed if `document.referrer` contains query/fragment information its SDK could otherwise read. Incoming sensitive referrers therefore reduce Meta coverage rather than leaking their parameters.

Duplicate prevention: a per-document module guard; a foreign-install check; single-load flags; one GA config; `send_page_view:false`; separate one-view-sent flags; Meta `trackSingle` calls for the one configured ID; and no GTM or noscript tracker. Legitimate SDK child configuration requests are distinguished from a second base installation. Post-consent interactions can wait in a bounded in-memory queue for SDK readiness; nothing is queued before permission or persisted as customer activity.

## Validation and limits

`tests/measurement.browser.cjs` uses the **actual checked-in release config** and HTTPS production-origin fixtures served from the local build. SDKs/config-child responses/collectors are synthetic; no Google, Meta, Paystack or Netlify submission is contacted. [Network receipts](heroes-analytics-browser-validation.json) explicitly identify this limitation.

The 27 scenarios cover: release/host gates, no opt-in and persistent rejection, analytics-only/Meta-only/both, exact destinations/config count, genuine tier/period/sales/call/WhatsApp actions with exact per-interaction event counts, PII/URL allowlisting, duplicate module execution/saving/regrant, new-document views, full/partial withdrawal, cookie cleanup, cross-tab changes, withdrawal during SDK loading, stale consent, blocked storage, foreign GTM, SDK child configuration, sensitive incoming referrers, event-only public selection, disabled links, a synthetic configured handoff, private/non-enabled routes and keyboard preferences. The synthetic handoff fixture is never written into production configuration and navigation is prevented.

Current visual captures and desktop/mobile checks are in [heroes-polish-previews](heroes-polish-previews/README.md). Existing product/copy, nine-price, animation, onboarding, no-JS, keyboard, responsive and accessibility regressions are also rerun. The source scan retains 48 pages and all 10 Heroes contextual links without broken local targets or fragments.

| Final local check | Result |
| --- | --- |
| `npm test` | **29/29 passed**, including approved markup/specification/price preservation and copy-only animation changes |
| `test:measurement` | **27 passed** with the actual enabled config and synthetic network transports; exact per-action/per-destination counts and consent races checked |
| Consent accessibility | **0** reported WCAG A/AA violations at **1440/390**; native 20px checkboxes inside 44px label targets; real mobile pointer access to withdrawal |
| `test:product` | **320/360/390/768/1024/1440** reflow, keyboard native selection, independent billing, no-JS, reduced motion and full-page desktop/mobile axe passed |
| `test:heroes` | Nine prices/disabled handoffs, manual confirmation, callback windows, mocked optional-profile failure/retry and responsive/no-JS passed |
| `test:design` | Existing activity sequence/pause/focus/reduced motion and nine-page layout/image regressions passed |
| Source/link scan | **48** pages, **0** broken local files/fragments or metadata/schema/sitemap regressions; all **10** Heroes contextual links retained |
| Render review | **14** fresh desktop/mobile full-page, content, enquiry and preference captures; key new copy and control views inspected; no redesign |

A concurrent run exposed a test timing race between viewport changes and focusing the newly shown mobile selector. The keyboard check now waits for the control to be visible and asserts actual focus before sending keys; it passes without changing production selector logic. The newly active consent panel also revealed inherited profile-field checkbox sizing, which is now corrected within that panel only.

## Exact remaining owner/account checks

These checks require account access and an **approved deployment**, neither performed here. They are verification of real delivery, not unimplemented release switches:

1. On the deployed `/heroes`, use browser Network/Tag Assistant with no choice and reject-all: verify no GA/Meta requests. Opt into each category separately: confirm one expected base SDK, one corresponding page view and the expected custom interactions. Reopen preferences and withdraw; verify subsequent interactions stop. Check mobile touch access to Measurement choices.
2. In GA4, confirm the web stream’s Measurement ID is `G-PS5FNQCJRN` and observe the consented canonical `/heroes` view/custom events in Realtime or Tag Assistant’s debug session. Review Enhanced Measurement/browser-history and existing custom/key-event rules for unintended extra page views or conversion mappings. A click must not become a purchase/qualified lead through account rules.
3. In Meta Events Manager/Test Events or Pixel Helper, confirm **806267492040936**, one consented PageView, expected custom events, and no Purchase/standard Lead from these clicks. Review Event Setup Tool/custom conversions/advanced matching so account settings do not reinterpret these interactions as verified outcomes.
4. Inspect GTM-NJ6L82XR’s published tags/triggers to resolve possible **homepage** GA4 overlap. No GTM change is required for the Heroes direct installation. If a host-wide injected GTM/Meta base tag appears on Heroes despite being absent from source, the module fails closed; resolve that injection before certifying delivery instead of enabling a second installation.

No hosted-payment URL was activated, account tag/custom-conversion setting changed, real event/transaction submitted, PR merged or deployment initiated. Existing legacy-page tracking is unchanged and is not represented as covered by Heroes’ consent controls.
