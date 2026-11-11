/* Public destinations confirmed by the owner on 11 November 2026; not credentials.
 * One direct GA4 installation; do NOT add GTM alongside it without inspecting the container.
 * Existing legacy-page installations are audited separately and are not silently migrated.
 */
window.WTS_MEASUREMENT = Object.freeze({
  releaseApproved: true,
  ga4: "G-PS5FNQCJRN",
  metaPixel: "806267492040936",
  // Only Heroes marketing has page views. Public plan selection has click/selection
  // events only; payment returns, forms and all other routes remain unmeasured here.
  pages: Object.freeze({ "/heroes": "marketing", "/heroes-start": "interactions" }),
  consentVersion: "heroes-2026-11",
});
