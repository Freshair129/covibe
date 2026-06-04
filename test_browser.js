import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console errors
  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[Browser Page Error] ${err.stack || err.message}`);
  });

  console.log('Navigating to http://localhost:8787/dashboard...');
  try {
    await page.goto('http://localhost:8787/dashboard', { waitUntil: 'load', timeout: 5000 });
    console.log('Page loaded!');

    // Click the Benchmark tab button
    console.log('Clicking the Benchmark tab...');
    await page.click('#btn-domain-benchmark');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/freshair/.gemini/antigravity-ide/brain/547b247f-5031-4484-8151-50654c9f335b/scratch/screenshot_benchmark.png' });
    console.log('Screenshot of Benchmark saved to scratch/screenshot_benchmark.png');

    // Click the CoDev Studio tab button
    console.log('Clicking the CoDev Studio tab...');
    await page.click('#btn-domain-codev');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/freshair/.gemini/antigravity-ide/brain/547b247f-5031-4484-8151-50654c9f335b/scratch/screenshot_codev.png' });
    console.log('Screenshot of CoDev Studio saved to scratch/screenshot_codev.png');

  } catch (err) {
    console.error('Failed to navigate:', err.message);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
