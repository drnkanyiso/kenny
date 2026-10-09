const { chromium } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');

const baseURL = process.env.UI_BASE_URL || 'http://127.0.0.1:1313';
const routes = ['/', '/blog/', '/contact-us/', '/love-and-relationships-lasting-bonds/', '/problems-in-relationship-causes-first-steps/', '/what-is-witch-doctor-terms-traditions/', '/404.html'];
routes.push('/services/');
routes.push('/about-us/');
for (const filename of fs.readdirSync('content/services').filter(name => name !== '_index.md' && name.endsWith('.md'))) {
  routes.push('/services/' + filename.replace(/\.md$/, '') + '/');
}
const assert = (value, message) => { if (!value) throw new Error(message); };

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(baseURL + route, { waitUntil: 'networkidle' });
        await page.evaluate(async () => {
          await Promise.all([...document.images].map(async image => {
            image.loading = 'eager';
            await image.decode().catch(() => {});
          }));
        });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(150);
        const issues = await page.evaluate(() => {
          const result = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) result.push('horizontal overflow');
          if (document.querySelectorAll('h1').length !== 1) result.push('expected one h1');
          if (!document.querySelector('main') || !document.querySelector('nav')) result.push('missing landmarks');
          for (const image of document.images) if (!image.complete || !image.naturalWidth) result.push('broken image: ' + image.src);
          for (const [selector, ratio] of [['.service-image-wrap img', 1.9], ['.article-card-image img', 1.6]]) {
            for (const image of document.querySelectorAll(selector)) {
              if (Math.abs(image.clientWidth / image.clientHeight - ratio) > 0.02) result.push('incorrect card image ratio');
            }
          }
          for (const anchor of document.querySelectorAll('a')) {
            if (!anchor.textContent.trim() && !anchor.getAttribute('aria-label') && !anchor.querySelector('img[alt]')) result.push('unnamed link');
            if (/^(tel:|mailto:)$/.test(anchor.getAttribute('href'))) result.push('empty contact link');
          }
          return result;
        });
        assert(!issues.length, `${width}px ${route}: ${issues.join(', ')}`);
        if (width <= 800) {
          const button = page.locator('.menu-toggle');
          const nav = page.locator('#site-navigation');
          assert(!await nav.isVisible(), 'mobile navigation should start collapsed');
          await button.click();
          assert(await nav.isVisible(), 'menu did not open');
          await page.keyboard.press('Escape');
          assert(!await nav.isVisible(), 'Escape did not close menu');
          assert(await button.evaluate(node => node === document.activeElement), 'Escape did not return focus');
          await button.click();
          await page.mouse.click(4, 600);
          assert(!await nav.isVisible(), 'outside click did not close menu');
        } else {
          assert(await page.locator('#site-navigation').isVisible(), 'desktop navigation hidden');
        }
        console.log(`PASS ${width}px ${route}`);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL + '/contact-us/');
    assert(await page.locator('.contact-empty').isVisible(), 'missing contact empty state');
    assert(await page.locator('.contact-form').count() === 0, 'unconfigured form shown');
    await page.locator('.faq-item summary').first().click();
    assert(await page.locator('.faq-item').first().getAttribute('open') !== null, 'FAQ did not open');
    await page.goto(baseURL + '/');
    const readMore = page.locator('.service-card .button-service');
    assert(await readMore.count() === 10, 'expected one Read more button per service');
    assert(await page.locator('.service-card p').first().innerText() !== '', 'missing card summary');
    await readMore.first().click();
    await page.waitForURL('**/services/love-spells-and-relationships/');
    assert(await page.locator('.service-contact-panel').count() === 1, 'missing service contact section');
    assert(await page.locator('.prose').innerText() !== '', 'missing full service details');
    await page.locator('.service-contact-panel .text-link').click();
    await page.waitForURL('**/contact-us/');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior === 'auto'), 'reduced motion not honored');
    assert(!errors.length, errors.join('\n'));
    const noScriptPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await noScriptPage.goto(baseURL + '/', { waitUntil: 'load' });
    assert(await noScriptPage.locator('#site-navigation').isVisible(), 'navigation unavailable without JavaScript');
    assert(await noScriptPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no-script horizontal overflow');
    await noScriptPage.close();
    fs.mkdirSync('.preview', { recursive: true });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const [name, route, width] of [['home-desktop', '/', 1440], ['home-mobile', '/', 390], ['contact-mobile', '/contact-us/', 390], ['insights-desktop', '/blog/', 1440], ['article-desktop', '/love-and-relationships-lasting-bonds/', 1440]]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(baseURL + route, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join('.preview', name + '.png'), fullPage: true });
    }
    console.log('PASS interactive sections, reduced motion, and no browser errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
