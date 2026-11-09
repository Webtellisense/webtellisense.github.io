// Local-only UI checks. No real Netlify submissions, phone calls or Paystack requests.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const config = require("../assets/js/heroes-config.js");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
  });
  const page = await context.newPage();
  const errors = [];
  let profileFails = false,
    external = 0;
  page.on("pageerror", (e) => errors.push(e.message));
  await context.route("**/*", (route) => {
    const req = route.request(),
      u = new URL(req.url());
    if (u.hostname !== "127.0.0.1") {
      external++;
      return route.abort();
    }
    if (u.pathname === "/" && req.method() === "POST")
      return route.fulfill({
        status: profileFails ? 503 : 200,
        body: "Mock form handler only",
      });
    return req.method() === "GET" ? route.continue() : route.abort();
  });
  await page.clock.install({ time: new Date("2026-11-06T10:00:00Z") });
  const origin = process.env.HEROES_TEST_ORIGIN || "http://127.0.0.1:8791";
  const go = (file) => page.goto(origin + "/" + file);
  const noOverflow = async () =>
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
  async function reveal() {
    await page.evaluate(async () => {
      for (let top = 0; top < document.body.scrollHeight; top += 500) {
        window.scrollTo(0, top);
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
      }
      window.scrollTo(0, 0);
    });
    await page.evaluate(() =>
      document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.remove("is-waiting");
        el.classList.add("is-visible");
      }),
    );
    await page.clock.runFor(1200);
  }
  fs.mkdirSync("docs/integration-previews", { recursive: true });
  await go(
    "heroes-welcome.html?status=paid&verified=true&reference=FAKE&session_id=eyJwYWlkIjp0cnVlfQ==",
  );
  await noOverflow();
  assert.equal(
    (await page.locator("h1").innerText()).replace(/\s+/g, " "),
    "You're in. Let's get to work.",
  );
  assert.match(
    await page.locator(".welcome-intro").innerText(),
    /Paystack handles the payment/,
  );
  assert.match(
    await page.locator(".welcome-intro").innerText(),
    /manually confirm.*before activating/s,
  );
  assert.match(
    await page.locator(".welcome-call").innerText(),
    /\+234 707 584 8564/,
  );
  assert.equal(
    await page.locator(".welcome-lead-hero a[href^='https://wa.me/']").isVisible(),
    true,
  );
  assert.equal(new URL(page.url()).search, "");
  assert.equal(
    await page.locator(".payment-state").innerText(),
    "Manual verification required. This page is not a payment receipt.",
  );
  assert.match(
    await page.locator("#callback-title").innerText(),
    /aim to call within 1–2 hours/,
  );
  await reveal();
  await page.screenshot({
    path: "docs/integration-previews/heroes-welcome-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow();
  await page.screenshot({
    path: "docs/integration-previews/heroes-welcome-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.locator(".profile-details summary").focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#heroes-profile").isVisible(), true);
  await page.locator('[name="business-name"]').fill("Synthetic profile");
  await page.locator('[name="contact-email"]').fill("test@example.invalid");
  profileFails = true;
  await page.locator("#profile-submit").click();
  await page.waitForFunction(() =>
    document
      .getElementById("profile-status")
      .textContent.includes("couldn’t confirm"),
  );
  assert.equal(
    await page.locator('[name="business-name"]').inputValue(),
    "Synthetic profile",
  );
  assert.equal(await page.locator("#profile-submit").isDisabled(), false);
  profileFails = false;
  await page.locator("#profile-submit").click();
  await page.waitForFunction(() =>
    document
      .getElementById("profile-status")
      .textContent.includes("has been submitted"),
  );
  assert.equal(await page.locator("#profile-submit").isDisabled(), true);
  await page.clock.setSystemTime(new Date("2026-11-06T16:30:00Z"));
  await go("heroes-welcome.html");
  assert.match(await page.locator("#callback-title").innerText(), /tomorrow/);
  assert.match(
    await page.locator("#callback-message").innerText(),
    /7 November/,
  );
  await page.clock.setSystemTime(new Date("2026-11-06T20:00:00Z"));
  await page.setViewportSize({ width: 1440, height: 1050 });
  await go("heroes-welcome.html");
  assert.match(
    await page.locator("#callback-title").innerText(),
    /Next callbacks:.*7 November/,
  );
  assert.equal(
    (await page.locator('a[href="tel:+2347075848564"]').count()) > 0,
    true,
  );
  await reveal();
  await page.screenshot({
    path: "docs/integration-previews/heroes-after-hours.png",
    fullPage: true,
    animations: "disabled",
  });
  await go("heroes");
  await reveal();
  await page.screenshot({
    path: "docs/integration-previews/heroes-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  // The landing comparison selects all nine exact options without calculating a charge.
  for (const period of ["monthly", "three", "six"]) {
    await page.locator(`input[name="billing-view"][value="${period}"]`).check();
    for (const [tier, plan] of Object.entries(config.tiers)) {
      assert.equal(await page.locator(`[data-choice-price="${tier}"]`).innerText(), `₦${new Intl.NumberFormat("en-NG").format(plan.prices[period])}`);
      assert.match(await page.locator(`[data-choice-link="${tier}"]`).getAttribute("href"), new RegExp(`tier=${tier}&period=${period}`));
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-view-tier="v3"]').click();
  assert.equal(await page.locator('[data-choice-tier="v3"]').isVisible(),true);
  assert.equal(await page.locator('[data-choice-tier="v1"]').isVisible(),false);
  await page.setViewportSize({width:1440,height:1050});
  await page.locator('[data-carousel-next]').click();
  await page.waitForFunction(()=>document.querySelector('[data-carousel-status]').textContent==='2 / 4');
  await page.locator('[data-carousel-track]').focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(()=>document.querySelector('[data-carousel-status]').textContent==='1 / 4');
  for (const old of ['heroes.html','heroes/','webtellisense-heroes.html','webtellisense-heroes','webtellisense-heroes/']) {
    const response = await page.goto(origin+'/'+old,{waitUntil:'load'});
    assert.equal(new URL(page.url()).pathname,'/heroes');
    assert.equal(response.status(),200);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://webtellisense.com/heroes');
  }
  for (const [tier, plan] of Object.entries(config.tiers))
    for (const [period, total] of Object.entries(plan.prices)) {
      await go(
        `heroes-start.html?tier=${tier}&period=${period}&amount=1&verified=true`,
      );
      assert.match(
        await page.locator("#selection-price").innerText(),
        new RegExp(new Intl.NumberFormat("en-NG").format(total)),
      );
      assert.equal(await page.locator("#paystack-link").isVisible(), false);
      assert.equal(
        await page.locator("#paystack-link").getAttribute("href"),
        null,
      );
      assert.equal(
        await page.locator("#payment-unavailable").isDisabled(),
        true,
      );
      assert.match(
        await page.locator("#selection-renewal").innerText(),
        period === "monthly" ? /Renews monthly/ : /no automatic renewal/,
      );
    }
  await go("heroes-start.html?tier=__proto__&period=evil");
  assert.match(
    await page.locator("#selection-error").innerText(),
    /wasn’t recognised/,
  );
  await go("heroes-start.html?tier=v2&period=three");
  await page.screenshot({
    path: "docs/integration-previews/heroes-hosted-handoff.png",
    fullPage: true,
    animations: "disabled",
  });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const file of [
      "heroes",
      "heroes-welcome.html",
      "heroes-start.html",
    ]) {
      await go(file);
      await noOverflow();
      if (file === "heroes" && width === 390) {
        await reveal();
        await page.screenshot({path:"docs/integration-previews/heroes-mobile.png",fullPage:true,animations:"disabled"});
      }
      if (file === "heroes-welcome.html" && width < 760) {
        const contact = page.locator(".mobile-contact");
        assert.equal(await contact.isVisible(), true);
        assert.match(await contact.innerText(), /\+234 707 584 8564/);
        assert.equal(
          await contact.locator("a[href^='https://wa.me/']").isVisible(),
          true,
        );
        const box = await contact.boundingBox();
        assert.ok(box.y >= 0 && box.y + box.height <= 951);
      }
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await go("heroes-welcome.html");
  assert.equal(
    await page
      .locator("body")
      .evaluate((el) => el.classList.contains("has-motion")),
    false,
  );
  assert.equal(await page.locator(".reveal.is-waiting").count(), 0);
  assert.equal(
    await page
      .locator(".welcome-hero-content")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  assert.deepEqual(errors, []);
  const nojs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await nojs.route("**/*", (r) =>
    new URL(r.request().url()).hostname === "127.0.0.1"
      ? r.continue()
      : r.abort(),
  );
  const basic = await nojs.newPage();
  await basic.goto(origin + "/heroes-welcome.html");
  await basic.locator(".profile-details summary").click();
  assert.equal(await basic.locator("#heroes-profile").isVisible(), true);
  assert.equal(
    (await basic.locator("h1").innerText()).replace(/\s+/g, " "),
    "You're in. Let's get to work.",
  );
  assert.match(
    await basic.locator(".welcome-call").innerText(),
    /\+234 707 584 8564/,
  );
  assert.match(
    await basic.locator(".mobile-contact").innerText(),
    /\+234 707 584 8564/,
  );
  assert.match(
    await basic.locator(".welcome-intro").innerText(),
    /manually confirm/,
  );
  assert.match(
    await basic.locator("#callback-message").innerText(),
    /manual payment confirmation/,
  );
  await basic.goto(origin+'/heroes');
  assert.equal(await basic.locator('[data-choice-tier]').count(),3);
  await basic.locator('.all-prices summary').click();
  assert.equal(await basic.locator('.price-matrix').isVisible(),true);
  assert.equal(await basic.locator('.price-matrix [data-tier]').count(),9);
  await basic.goto(origin+'/welcome.html?session_id=eyJyZWYiOiJGQUtFIiwibmFtZSI6IkZBS0UifQ==&verified=true');
  assert.match(await basic.locator('h1').innerText(),/confirm your next steps/);
  assert.equal(await basic.locator('#tally-onboarding-frame').getAttribute('src'),'https://tally.so/r/3yD4kx?transparentBackground=1');
  assert.doesNotMatch(await basic.locator('body').innerText(),/Payment Confirmed|Access Denied/);
  await browser.close();
  console.log(
    "Browser checks passed: untrusted return parameters, contact/late/overnight states, all nine price handoffs disabled, optional profile retry, keyboard, no-JS, reduced motion and 320/390/768/1440px reflow. All nonlocal requests blocked.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
