/* Progressive presentation only; independent of billing, measurement and payments. */
(() => {
  const region = document.querySelector('[data-scope-comparison]');
  if (!region) return;
  const picker = region.querySelector('[data-scope-picker]');
  const select = picker?.querySelector('select');
  const tiers = [...region.querySelectorAll('[data-scope-tier]')];
  if (!picker || !select || tiers.length !== 3) return;
  const narrow = matchMedia('(max-width: 760px)');
  const render = () => {
    picker.hidden = !narrow.matches;
    tiers.forEach(tier => { tier.hidden = narrow.matches && tier.dataset.scopeTier !== select.value; });
  };
  select.addEventListener('change', render);
  narrow.addEventListener('change', render);
  render();
})();
