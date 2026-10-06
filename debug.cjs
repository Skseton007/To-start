const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    console.log('Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Page loaded');
    const content = await page.content();
    if (content.includes('Runtime Error!')) {
      console.log('ERROR BOUNDARY DETECTED');
    }
  } catch (e) {
    console.error('PUPPETEER ERROR:', e);
  } finally {
    await browser.close();
  }
})();
