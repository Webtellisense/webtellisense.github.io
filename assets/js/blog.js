/* Reading controls and existing-GA4 events only; no SDK or client framework. */
(() => {
  if (window.WTSBlog) return;
  window.WTSBlog = true;
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  // Runtime query variants cannot have distinct static response heads on this host.
  if (location.search) {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.content = 'noindex, follow, max-image-preview:large';
  }
  const article = document.querySelector('[data-blog-article]');
  if (!article) return;
  const slug = document.body.dataset.blogSlug;
  const send = (name, params = {}) => {
    if (navigator.globalPrivacyControl || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    if (typeof window.gtag === 'function') window.gtag('event', name, { article_slug: slug, ...params });
  };
  const toc = document.querySelector('[data-blog-toc]');
  const media = matchMedia('(max-width:1000px)');
  const syncTOC = () => { if (toc) toc.open = !media.matches; };
  syncTOC(); media.addEventListener('change', syncTOC);
  const prose = document.querySelector('[data-blog-prose]');
  const progress = document.querySelector('[data-reading-progress]');
  const sent = new Set(); let queued = false;
  const update = (track = false) => {
    queued = false;
    const box = prose.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (innerHeight - box.top) / Math.max(1, box.height)));
    if (progress) progress.style.width = (ratio * 100).toFixed(2) + '%';
    if (track) for (const depth of [25, 50, 75, 90]) {
      if (ratio * 100 >= depth && !sent.has(depth)) { sent.add(depth); send(`scroll_${depth}`, { percent_scrolled: depth }); }
    }
  };
  // Read depth requires an actual scroll, not viewport fill on a short article.
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(() => update(true)); } }, { passive: true });
  addEventListener('resize', () => update()); update();
  document.addEventListener('click', async event => {
    const copy = event.target.closest('[data-copy-link]');
    if (copy) {
      const status = document.querySelector('[data-copy-status]');
      try { await navigator.clipboard.writeText(copy.dataset.copyLink || canonical); status.textContent = 'Link copied.'; }
      catch { status.textContent = 'Copy this link: ' + canonical; }
      return;
    }
    const a = event.target.closest('a[href]'); if (!a) return;
    const destination = new URL(a.href, location.href);
    const sameSite = destination.origin === location.origin;
    if (a.matches('[data-article-cta]') || a.closest('.blog-prose .cta-block,.blog-prose .blog-audit-cta')) {
      send('article_cta_click', { destination: sameSite ? destination.pathname : destination.origin + destination.pathname });
    }
    if (/^(?:wa\.me|api\.whatsapp\.com)$/.test(destination.hostname)) send('whatsapp_click', { destination: destination.origin + destination.pathname, link_type: a.hasAttribute('data-blog-share') ? 'share' : 'contact' });
    if (sameSite && /^\/business-audit-tool(?:\.html)?\/?$/.test(destination.pathname)) send('audit_tool_start', { destination: destination.pathname, trigger: 'article_link' });
  });
})();
