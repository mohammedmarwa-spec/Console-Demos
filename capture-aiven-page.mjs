#!/usr/bin/env node
/**
 * Capture Aiven UserHome page: full-page screenshot + extract services/apps list
 */
import { firefox } from 'playwright';

const URL = 'https://iam.aiven.io/app/UserHome?session_hint=AUTHENTICATED';

async function main() {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // extra wait for SPAs

    // Full-page screenshot
    const screenshotPath = 'aiven-userhome-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved to:', screenshotPath);

    // Extract service/app names and descriptions
    const services = await page.evaluate(() => {
      const items = [];
      // Common selectors for service/app cards
      const cards = document.querySelectorAll(
        '[data-testid*="service"], [data-testid*="app"], [role="listitem"], .card, [class*="service"], [class*="application"], a[href*="/services"], a[href*="/apps"]'
      );
      cards.forEach((el) => {
        const name = el.querySelector('h2, h3, h4, [class*="title"], [class*="name"]')?.textContent?.trim() || el.textContent?.trim().slice(0, 100);
        const desc = el.querySelector('[class*="description"], p, [class*="desc"]')?.textContent?.trim();
        if (name) items.push({ name, description: desc || null });
      });
      // Fallback: look for any list/grid items
      if (items.length === 0) {
        document.querySelectorAll('a, [role="button"], [class*="link"], [class*="item"]').forEach((el) => {
          const text = el.textContent?.trim();
          if (text && text.length > 2 && text.length < 200) {
            items.push({ name: text, description: null });
          }
        });
      }
      return items;
    });

    console.log('\n--- SERVICES/APPS FOUND ---');
    if (services.length > 0) {
      services.forEach((s, i) => console.log(`${i + 1}. ${s.name}${s.description ? ` - ${s.description}` : ''}`));
    } else {
      console.log('No services extracted. Page may require login or use different structure.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
