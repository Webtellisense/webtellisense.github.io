# Website experience — before and after

Actual local Chromium renders at **1440px desktop** and **390px mobile**. Before is commit `118ece7`; after is this website-experience pass on the same PR #5. Fonts and images are decoded, and full pages are genuinely scrolled to reveal lazy/AOS content. External providers and writes are blocked. No hosted route, real payment or form receipt is claimed.

[Implementation and validation](../website-experience-refinement.md) · [Capture manifest](captures.json) · [Legal review](../experience-legal-review.md)

The stable before/after frames use reduced motion. The additional motion-enabled review frames below show the normal filled scrolling layout; [functional evidence](../experience-browser-validation.json) measures actual movement in opposite directions and tests pause/reduced-motion behavior.

| Page | Before desktop | After desktop | Before mobile | After mobile |
| --- | --- | --- | --- | --- |
| Homepage | [before 1440](before/index-1440.jpg) | [after 1440](after/index-1440.jpg) | [before 390](before/index-390.jpg) | [after 390](after/index-390.jpg) |
| Legacy website service | [before 1440](before/web-design-1440.jpg) | [after 1440](after/web-design-1440.jpg) | [before 390](before/web-design-390.jpg) | [after 390](after/web-design-390.jpg) |
| Education industry | [before 1440](before/education-marketing-1440.jpg) | [after 1440](after/education-marketing-1440.jpg) | [before 390](before/education-marketing-390.jpg) | [after 390](after/education-marketing-390.jpg) |
| About | [before 1440](before/about-1440.jpg) | [after 1440](after/about-1440.jpg) | [before 390](before/about-390.jpg) | [after 390](after/about-390.jpg) |
| Contact | [before 1440](before/contact-1440.jpg) | [after 1440](after/contact-1440.jpg) | [before 390](before/contact-390.jpg) | [after 390](after/contact-390.jpg) |

## Requested detail views

Detail viewports expand vertically to include the full section while preserving the indicated width. The header is kept clear of section content.

| View | Before desktop | After desktop | Before mobile | After mobile |
| --- | --- | --- | --- | --- |
| Homepage opening | [before 1440](before/homepage-opening-1440.jpg) | [after 1440](after/homepage-opening-1440.jpg) | [before 390](before/homepage-opening-390.jpg) | [after 390](after/homepage-opening-390.jpg) |
| Services mega panel | [before 1440](before/navigation-services-1440.jpg) | [after 1440](after/navigation-services-1440.jpg) | [before 390](before/navigation-services-390.jpg) | [after 390](after/navigation-services-390.jpg) |
| Industries mega panel | [before 1440](before/navigation-industries-1440.jpg) | [after 1440](after/navigation-industries-1440.jpg) | [before 390](before/navigation-industries-390.jpg) | [after 390](after/navigation-industries-390.jpg) |
| Shared footer | [before 1440](before/footer-1440.jpg) | [after 1440](after/footer-1440.jpg) | [before 390](before/footer-390.jpg) | [after 390](after/footer-390.jpg) |
| Portfolio | [before 1440](before/portfolio-1440.jpg) | [after 1440](after/portfolio-1440.jpg) | [before 390](before/portfolio-390.jpg) | [after 390](after/portfolio-390.jpg) |
| Testimonials / reduced motion | [before 1440](before/testimonials-1440.jpg) | [after 1440](after/testimonials-1440.jpg) | [before 390](before/testimonials-390.jpg) | [after 390](after/testimonials-390.jpg) |

Normal motion-enabled review layout: [desktop](after/testimonials-motion-1440.jpg) · [mobile](after/testimonials-motion-390.jpg). These are real frames during native scrolling, not fabricated reviews or an illustration of a missing feature.

Rendered desktop/mobile navigation, imagery, cropping, typography, gallery, reviews, footer, service and industry layouts were inspected. Pricing values and the approved Heroes composition remain protected.
