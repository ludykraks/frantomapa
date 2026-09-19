// Run with Playwright installed: node tests/motion.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome' });
  const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
  const errors = [];
  try {
    for (const width of [1440, 901, 900, 390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: 850 }, hasTouch: width <= 900 });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
      assert.equal(await page.locator('.hero-copy').evaluate(el => getComputedStyle(el).opacity), '1');
      const nav = page.locator('.main-nav');
      const toggle = page.locator('.menu-toggle');
      if (width <= 900) {
        assert(await nav.evaluate(el => el.inert));
        const before = await page.locator('.hero').boundingBox();
        const toggleBefore = await toggle.boundingBox();
        await toggle.click();
        await page.waitForTimeout(200);
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        assert.equal(await nav.evaluate(el => getComputedStyle(el).opacity), '1');
        assert.equal((await toggle.boundingBox()).width, toggleBefore.width);
        assert.equal((await page.locator('.hero').boundingBox()).y, before.y);
        await page.keyboard.press('Tab');
        assert(await nav.evaluate(el => el.contains(document.activeElement)));
        await page.keyboard.press('Escape');
        assert(await toggle.evaluate(el => el === document.activeElement));
        assert(await nav.evaluate(el => el.inert));
        // Reverse a transition before it finishes, without stale callbacks.
        await toggle.evaluate(el => { el.click(); el.click(); el.click(); });
        await page.waitForTimeout(200);
        assert.equal(await nav.evaluate(el => getComputedStyle(el).opacity), '1');
        await nav.locator('a').first().focus();
        await page.setViewportSize({ width: 1200, height: 850 });
        assert.equal(await nav.evaluate(el => el.inert), false);
        await page.setViewportSize({ width, height: 850 });
        await page.waitForTimeout(200);
        assert(await nav.evaluate(el => el.inert));
        assert(await toggle.evaluate(el => el === document.activeElement));
        await toggle.click();
        await nav.locator('a[href="#contact-us"]').click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        await page.waitForTimeout(1000);
        assert((await page.locator('#contact-us').boundingBox()).y >= 80);
      }
      await page.locator('.card').first().scrollIntoViewIfNeeded();
      await page.locator('.card').first().hover();
      await page.waitForTimeout(250);
      const transform = await page.locator('.card').first().evaluate(el => getComputedStyle(el).transform);
      assert.equal(transform, width <= 900 ? 'none' : 'matrix(1, 0, 0, 1, 0, -2)');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('.card').first().evaluate(el => getComputedStyle(el).transform), 'none');
      assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior), 'auto');
      assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
      if (width <= 900) {
        await toggle.click();
        assert.equal(await nav.evaluate(el => getComputedStyle(el).transitionDuration), '0s');
        const panel = await nav.boundingBox();
        await page.mouse.click(8, panel.y + panel.height + 12);
        assert(await nav.evaluate(el => el.inert));
        await toggle.focus();
        await page.keyboard.press('Tab');
        assert.equal(await nav.evaluate(el => el.contains(document.activeElement)), false);
        await page.setViewportSize({ width, height: 360 });
        await toggle.click();
        assert((await nav.boundingBox()).height <= 280);
        await page.keyboard.press('Escape');
      }
      if (process.env.SCREENSHOT_DIR && [1440, 390].includes(width)) {
        await page.setViewportSize({ width, height: 850 });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, `homepage-${width}.png`), fullPage: true });
      }
      await context.close();
      console.log(`PASS ${width}px: navigation, layout, hover and reduced motion`);
    }
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 850 } });
    const page = await context.newPage();
    await page.goto(url);
    assert(await page.locator('.main-nav a').first().isVisible());
    assert(await page.locator('.hero-copy').isVisible());
    await context.close();
    const shared = await browser.newContext({ viewport: { width: 390, height: 850 } });
    for (const file of ['about.html', 'team.html', 'kidpreneurship.html']) {
      const page = await shared.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(__dirname, '..', file)).href);
      await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('.main-nav').evaluate(el => el.inert), false);
      await page.keyboard.press('Escape');
      assert(await page.locator('.main-nav').evaluate(el => el.inert));
      await page.close();
    }
    await shared.close();
    assert.deepEqual(errors, []);
    console.log('PASS no-JavaScript navigation and no page errors');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
