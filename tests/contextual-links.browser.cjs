// Local browser regression: no external providers or real form/payment requests.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const matrix = JSON.parse(fs.readFileSync('docs/contextual-links.json', 'utf8'));
const sources = [...new Set(matrix.map(link => link.source))];
const origin = 'http://127.0.0.1:8781/';

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true, args: ['--no-sandbox']
  });
  const evidence = { pages: [], targets: [], noJavaScript: [], externalRequests: 'blocked', writes: 'blocked' };
  const luminance = rgb => rgb.map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
    .reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
  const rgb = value => value.match(/[\d.]+/g).map(Number);
  const contrast = (fg, bg) => {
    const pair = [luminance(rgb(fg).slice(0, 3)), luminance(rgb(bg).slice(0, 3))].sort((a, b) => b - a);
    return (pair[0] + .05) / (pair[1] + .05);
  };
  async function context(javaScriptEnabled) {
    const ctx = await browser.newContext({ javaScriptEnabled, reducedMotion: 'reduce' });
    await ctx.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      return url.origin === origin.slice(0, -1) && request.method() === 'GET' ? route.continue() : route.abort();
    });
    return ctx;
  }
  const ctx = await context(true);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const source of sources) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + source, { waitUntil: 'load' });
    const expected = matrix.filter(link => link.source === source);
    const anchors = page.locator('main a.site-context-link');
    assert.equal(await anchors.count(), expected.length, source + ' durable contextual count');
    let minimumContrast = Infinity;
    await page.keyboard.press('Tab');
    for (const record of expected) {
      const link = anchors.filter({ hasText: new RegExp('^' + record.anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+') + '$') });
      assert.equal(await link.count(), 1, source + ' ' + record.anchor);
      await link.scrollIntoViewIfNeeded();
      await link.hover();
      await link.focus();
      const style = await link.evaluate(element => {
        const css = getComputedStyle(element);
        let backgrounds = ['rgb(255, 255, 255)'];
        for (let p = element; p; p = p.parentElement) {
          const parentStyle = getComputedStyle(p);
          if (parentStyle.backgroundImage.includes('gradient')) {
            backgrounds = parentStyle.backgroundImage.match(/rgba?\([^)]+\)/g); break;
          }
          const candidate = parentStyle.backgroundColor;
          if (candidate !== 'rgba(0, 0, 0, 0)' && candidate !== 'transparent') { backgrounds = [candidate]; break; }
        }
        return { color: css.color, backgrounds, underline: css.textDecorationLine, outline: css.outlineStyle, outlineWidth: css.outlineWidth };
      });
      assert.match(style.underline, /underline/, record.anchor);
      assert.equal(style.outline, 'solid', record.anchor + ' keyboard focus');
      assert.ok(parseFloat(style.outlineWidth) >= 2, record.anchor + ' visible focus outline');
      const ratio = Math.min(...style.backgrounds.map(bg => contrast(style.color, bg)));
      assert.ok(ratio >= 4.5, source + ' ' + record.anchor + ' contrast=' + ratio);
      minimumContrast = Math.min(minimumContrast, ratio);
    }
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, source + ' ' + width);
    }
    evidence.pages.push({ source, contextualLinks: expected.length, widths: [320, 390, 768, 1280], minimumHoverContrast: +minimumContrast.toFixed(2), underlineAndKeyboardFocus: true });
  }
  for (const destination of [...new Set(matrix.map(link => link.destination))]) {
    let response = await page.goto(origin + destination, { waitUntil: 'load' });
    if (!response) response = await page.reload({ waitUntil: 'load' });
    assert.equal(response.status(), 200, destination);
    const fragment = destination.split('#')[1];
    if (fragment) assert.equal(await page.locator('[id="' + fragment + '"]').count(), 1, destination);
    evidence.targets.push(destination);
  }
  assert.deepEqual(errors, []);
  await ctx.close();
  const noJS = await context(false);
  const staticPage = await noJS.newPage();
  for (const source of sources) {
    await staticPage.goto(origin + source, { waitUntil: 'load' });
    const count = await staticPage.locator('main a.site-context-link').count();
    assert.equal(count, matrix.filter(link => link.source === source).length);
    evidence.noJavaScript.push({ source, anchorsPresentInHTML: count });
  }
  await noJS.close();
  await browser.close();
  fs.writeFileSync('docs/internal-linking-browser-validation.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log(`Passed: ${matrix.length} durable prose links on ${sources.length} pages, local targets/fragments, 320/390/768/1280 reflow, hover contrast, underline, keyboard focus and static anchor presence without JavaScript. Providers/writes blocked.`);
})().catch(error => { console.error(error); process.exit(1); });
