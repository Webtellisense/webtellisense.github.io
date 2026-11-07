const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const config = require("../assets/js/heroes-config.js");
const api = require("../assets/js/heroes-shared.js");
const pages = [
  "webtellisense-heroes.html",
  "heroes-start.html",
  "heroes-welcome.html",
  "heroes-profile-received.html",
];
const readHtml = file => fs.readFileSync(file, "utf8").replace(/\s+/g, " ").replace(/\s+>/g, ">");
test("approved totals and markup match exactly; allocations included without invented splits", () => {
  const expected = {
    v1: [350000, 1012500, 1950000],
    v2: [600000, 1755000, 3420000],
    v3: [1000000, 2932500, 5730000],
  };
  const html = readHtml(pages[0]);
  for (const [tier, values] of Object.entries(expected))
    for (const [i, period] of ["monthly", "three", "six"].entries()) {
      assert.equal(config.tiers[tier].prices[period], values[i]);
      assert.ok(
        html.includes(
          `data-tier="${tier}" data-period="${period}">₦${api.money(values[i])}`,
        ),
      );
      assert.equal(api.selection(tier, period, config).total, values[i]);
      assert.equal(config.paymentPages[tier][period], null);
    }
  assert.match(config.periods.monthly.renewal, /Renews monthly/);
  assert.match(config.periods.three.renewal, /no automatic renewal/);
  assert.match(config.periods.six.renewal, /Renew manually/);
  assert.equal(api.selection("__proto__", "monthly", config), null);
  assert.equal(api.selection("v1", "constructor", config), null);
  assert.equal(api.selection("custom", "three", config), null);
});
test("hosted links fail closed; only reviewed official Payment Page shape can be enabled", () => {
  for (const value of [
    null,
    "",
    "PLACEHOLDER",
    "javascript:alert(1)",
    "https://evil.invalid/pay/test",
    "https://paystack.com.evil.invalid/pay/a",
    "https://paystack.com/pay/a?amount=1",
    "https://user@paystack.com/pay/a",
    "http://paystack.com/pay/a",
    "https://paystack.com/pay/a#proof",
  ])
    assert.equal(api.hostedUrl(value), null);
  // Synthetic format check only; this is not a real configured payment URL.
  assert.equal(
    api.hostedUrl("https://paystack.com/pay/fixture-only"),
    "https://paystack.com/pay/fixture-only",
  );
});
test("contact-hours display: Lagos opening/closing, late-evening, next morning, year rollover", () => {
  const check = (iso, kind) => {
    const p = api.callbackWindow(new Date(iso), config.callback);
    assert.equal(p.kind, kind);
    return p;
  };
  assert.match(
    check("2026-11-06T06:59:00Z", "after-hours").title,
    /8:00.*Friday, 6 November/,
  );
  check("2026-11-06T07:00:00Z", "contact-hours");
  check("2026-11-06T16:00:00Z", "contact-hours");
  assert.match(
    check("2026-11-06T16:01:00Z", "late-evening").body,
    /Saturday, 7 November/,
  );
  check("2026-11-06T17:59:00Z", "late-evening");
  assert.match(
    check("2026-11-06T18:00:00Z", "after-hours").title,
    /Saturday, 7 November/,
  );
  assert.match(
    check("2026-12-31T22:00:00Z", "after-hours").title,
    /Friday, 1 January/,
  );
  assert.match(
    check("2026-11-06T10:00Z", "contact-hours").body,
    /manually confirms payment/,
  );
});
test("new flow has no legacy checkout links, verification backend, keys, database or automation stack", () => {
  for (const file of pages) {
    const html = readHtml(file);
    assert.doesNotMatch(
      html,
      /(?:href|action)=["'][^"']*(?:packages\.html|\/welcome\.html|["']heroes\.html)/,
    );
    assert.doesNotMatch(
      html,
      /sk_(?:live|test)_[A-Za-z0-9]+|PaystackPop|fbq\(|gtag\(/,
    );
  }
  for (const p of [
    "server",
    "migrations",
    "netlify/functions",
    "assets/js/payment-checkout.js",
    "assets/js/payment-welcome.js",
  ])
    assert.equal(fs.existsSync(p), false);
  const script = fs.readFileSync("assets/js/heroes.js", "utf8");
  assert.doesNotMatch(
    script,
    /atob|btoa|sessionStorage|localStorage|payment-status|reference=|session_id/,
  );
  assert.match(
    fs.readFileSync("heroes-welcome.html", "utf8"),
    /Manual verification required/,
  );
});
test("legacy packages, contest, welcome and all unrelated pages remain byte-for-byte main", () => {
  const mainFiles = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", "origin/main"],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n");
  const allowed = new Set(["index.html", "sitemap.xml", ".gitignore"]);
  for (const file of mainFiles) {
    if (allowed.has(file)) continue;
    const before = execFileSync("git", ["show", `origin/main:${file}`], {
      maxBuffer: 20 * 1024 * 1024,
    });
    assert.deepEqual(fs.readFileSync(file), before, file);
  }
});
test("all local assets and direct internal links in new pages resolve", () => {
  for (const file of pages) {
    const html = readHtml(file);
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = match[1];
      if (/^(https?:|tel:|mailto:|#)/.test(url)) continue;
      const target = url.split(/[?#]/)[0];
      assert.ok(fs.existsSync(target), `${file}: ${url}`);
    }
  }
});
test("optional form is in static HTML; receipt never asserts payment; reduced motion and no-JS remain supported", () => {
  const html = readHtml("heroes-welcome.html");
  assert.match(html, /<form[^>]*data-netlify="true"/);
  assert.match(html, /name="form-name" value="heroes-business-profile"/);
  assert.match(html, /netlify-honeypot/);
  assert.match(html, /This won’t hold up your first call/);
  assert.doesNotMatch(html, /<input[^>]*type="password"/);
  assert.match(
    fs.readFileSync("heroes-profile-received.html", "utf8"),
    /doesn’t verify payment or activate onboarding/,
  );
  assert.match(
    fs.readFileSync("assets/css/heroes.css", "utf8"),
    /prefers-reduced-motion:\s*reduce/,
  );
  for (const file of pages)
    assert.match(fs.readFileSync(file, "utf8"), /href="tel:\+2347075848564"/);
});
test("build excludes test/configuration tooling; static form survives", () => {
  execFileSync(process.execPath, ["scripts/build-static.cjs"]);
  for (const file of pages) assert.ok(fs.existsSync(path.join("public", file)));
  for (const file of [
    "tests",
    "scripts",
    "node_modules",
    "AGENTS.md",
    "docs",
    "package.json",
    "netlify.toml",
    ".git",
  ])
    assert.equal(fs.existsSync(path.join("public", file)), false);
  assert.match(
    fs.readFileSync("public/heroes-welcome.html", "utf8"),
    /name="heroes-business-profile"/,
  );
});
