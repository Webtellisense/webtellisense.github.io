# Heroes product explanation — browser previews

Genuine local Chromium screenshots, **1440px desktop** and **390px mobile**, before/after. The before server is an unmodified archive of deployed main `ec5d24a`; the after server uses the feature branch’s static build. Fonts and images are decoded and the page is scrolled before capture. Reduced motion is enabled for stable images. Providers and writes are blocked. These are browser renders, not mockups or evidence of a deployment.

Section captures fit the section into a real taller viewport so the persistent mobile contact bar stays below the captured content. Full-page images retain the normal 1000px-high browser viewport. The responsive breakpoint remains determined by the stated width. See `captures.json` and the capture script for reproducibility.

| View | Desktop | Mobile |
| --- | --- | --- |
| Before: full approved page | [1440px](before/heroes-1440.jpg) | [390px](before/heroes-390.jpg) |
| After: full page | [1440px](after/heroes-1440.jpg) | [390px](after/heroes-390.jpg) |
| Before: broad responsibility section | [1440px](before/responsibilities-1440.jpg) | [390px](before/responsibilities-390.jpg) |
| After: eight responsibilities | [1440px](after/responsibilities-1440.jpg) | [390px](after/responsibilities-390.jpg) |
| New: Heroes standard | [1440px](after/standard-1440.jpg) | [390px](after/standard-390.jpg) |
| New: capability comparison | [1440px](after/included-1440.jpg) | [390px · Foundation](after/included-390.jpg) |
| New: other mobile tiers | All three shown in desktop comparison | [Growth](after/included-v2-390.jpg) · [Complete](after/included-v3-390.jpg) |
| Preserved opening | [Before](before/opening-1440.jpg) · [After](after/opening-1440.jpg) | [Before](before/opening-390.jpg) · [After](after/opening-390.jpg) |
| Preserved price interface | [Before](before/pricing-1440.jpg) · [After](after/pricing-1440.jpg) | [Before](before/pricing-390.jpg) · [After](after/pricing-390.jpg) |

The original broad responsibility block is consolidated into the new explanations; the approved opening, prices, onboarding, portfolio and remainder of the page keep their composition. The new tier selector is independent of the billing selector. No-JavaScript users see all three specification columns stacked.

The source/evidence mapping and outstanding scope decisions are in [the implementation notes](../heroes-product-specification.md). Asset provenance and the list of client stories still requiring authentic material/showcase permission remain in the earlier portfolio review; no extra client project was invented.
