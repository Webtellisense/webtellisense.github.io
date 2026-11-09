# Measurement implementation and release gate

## Destination decision

The source establishes installations, **not account ownership**. The owner supplied GA4 `G-PS5FNQCJRN`, GTM `GTM-NJ6L82XR`, and two direct Meta IDs. We cannot inspect GA/GTM/Meta account settings in this environment.

The new Heroes marketing/payment-selection and industry pages use **one direct, consent-gated GA4 module**, not GA4 plus GTM. No GTM container is installed on these pages. `assets/js/measurement-config.js` holds the supplied GA4 ID, `metaPixel: null`, and `releaseApproved: false`. Thus implementation is testable but **no new live measurement runs** until destination/privacy sign-off. A Meta ID is deliberately not guessed. Welcome/profile/receipt/legal pages are unmeasured. Preview/local hosts are suppressed even if the release gate is enabled.

Legacy installations are retained. Two pages still have direct GA4 plus GTM; container contents must be inspected before deciding whether events overlap. Existing intentionally separate Meta destinations and solar ID `1710018810217099` remain; source-level duplicate destination PageViews stay at zero. Consent on the legacy pages and third-party embeds is **not fixed by adding the new module** and remains a release review item.

## Heroes event map

| Event | Trigger | Allowed business parameters | Meaning |
| --- | --- | --- | --- |
| `page_view` / Meta `PageView` | Each consented marketing/selection-page load | Sanitized path/location, no referrer/query | Page visit only |
| `heroes_period_select` | Comparison radio or payment-period selector changed | `period`: monthly / three / six | Period preference |
| `heroes_tier_select` | Mobile tier tab, plan CTA or tier selector | `tier`: v1 / v2 / v3; optional allowed period | A tier interaction; different controls are distinct user actions |
| `heroes_talk_to_sales` | Explicit Talk to Sales WhatsApp link | channel: whatsapp | Sales contact intent |
| `heroes_call_click` | Telephone link | channel: call | Device handoff, not an answered call |
| `heroes_whatsapp_click` | WhatsApp link (including Sales) | channel: whatsapp | Messaging handoff, not a delivered message or verified lead |
| `heroes_paystack_handoff` | Visible, configured official hosted-payment link | allowed tier / period | Checkout handoff only, never a purchase |

All custom events additionally carry a sanitized page path. A Sales WhatsApp click emits a sales-intent event and a channel-click event by design; these are different funnel dimensions, not two purchases/leads. Tier tabs and plan links each emit once per actual action; initial render, resizing and initial URL selection do not emit selection events. No amounts, revenue, references, form values, names, email/phone values, arbitrary link URLs or query parameters are accepted. Unknown event names are discarded. No pre-consent event queue is replayed.

The module loads no optional provider before opt-in; analytics and advertising choices are separate. It respects Global Privacy Control, supports withdrawal and avoids a second installation if it sees pre-existing Google/Meta loader scripts. Referrer/query data are excluded from GA payloads. The visible URL is cleaned before loading a provider; Meta loading is suppressed if an incoming referrer contains parameters. Provider automatic/enhanced collection still needs account review before release. Online identifiers/network data may be processed by enabled SDKs; this is not called anonymous collection.

## Confirmed safe campaign correction

Solar Launch previously emitted a standard `Lead` with NGN 300,000 based on a browser assessment and an opaque no-cors submission. It now emits only `trackSingleCustom('1710018810217099', 'SolarAssessmentCompleted')`, with no self-reported qualification or money. Its separate pixel and form/WhatsApp flow remain. Hard-coded simulated customer-activity notices have been removed; they were not backed by bookings.

## Actual testing and owner actions

`npm run test:measurement` uses synthetic SDKs and collector requests entirely fulfilled by Playwright. It tests release gating, pre-consent silence, consent, GPC, preview suppression, six custom interactions, single PageViews, filtering and withdrawal. No real Google/Meta events or live Paystack requests are sent. The synthetic hosted URL exists only inside the test response fixture; all nine source payment settings remain null. Evidence: [completion-measurement-validation.json](completion-measurement-validation.json).

Before release, the owner must:

1. In GA4 Admin → Data streams, confirm control of `G-PS5FNQCJRN`, its website stream and reporting access. Inspect/disable Enhanced Measurement and unwanted automatic collection (especially form/outbound events), Google Signals and advertising personalization consistent with the approved notice. Confirm data-retention settings rather than inventing a period.
2. In GTM, inspect/export `GTM-NJ6L82XR` tags/triggers and prove whether it duplicates the direct GA4 installs on the two legacy pages. Do not publish a container change as part of this PR.
3. In Meta Business Settings/Events Manager, confirm the owned business/destination and purpose of both supplied IDs. Select the intended Heroes pixel; check automatic advanced matching and automatic events are off for this minimal event design. Do not assume a direct pixel ID proves ownership.
4. Approve the privacy/consent approach and resolve legacy scripts/embeds. Only then update the public config in a reviewed code change; **no secret keys are required**. Test real SDK behavior with an approved isolated destination, then verify DebugView/Realtime and Meta Test Events for one PageView and correct click names. Do not mark clicks as Purchase, verified Lead or revenue conversions.

None of these account checks, legal approvals or real provider transports has been completed by this PR.
