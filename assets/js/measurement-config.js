/* Public destination settings, not credentials. Owner/legal release review is required.
 * One direct GA4 installation; do NOT add GTM alongside it without inspecting the container.
 * Existing legacy-page installations are audited separately and are not silently migrated.
 */
window.WTS_MEASUREMENT = Object.freeze({
  releaseApproved: false,
  ga4: "G-PS5FNQCJRN", // Owner-supplied existing property; confirm access before release.
  metaPixel: null, // Confirm ownership/purpose of 806267492040936 vs 623478247158411.
  consentVersion: "review-1",
});
