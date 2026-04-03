const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 834, height: 1194 } });
  await page.goto('https://id-preview--8161da77-ebfe-46c3-a211-d89fb6b1bdef.lovable.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);

  async function sample(label) {
    const data = await page.evaluate((label) => {
      const wrapper = document.querySelector('[data-stage]');
      const title = document.querySelector('h1');
      const buttons = Array.from(document.querySelectorAll('button'));
      const haunted = buttons.find((el) => el.textContent?.includes('Haunted House'));
      const games = buttons.find((el) => el.textContent?.includes('Games'));
      const style = (el) => (el ? getComputedStyle(el) : null);
      return {
        label,
        path: window.location.pathname,
        stage: wrapper?.getAttribute('data-stage'),
        direction: wrapper?.getAttribute('data-direction'),
        wrapperTransform: style(wrapper)?.transform,
        wrapperOpacity: style(wrapper)?.opacity,
        titleTransform: style(title)?.transform,
        titleOpacity: style(title)?.opacity,
        hauntedTransform: style(haunted)?.transform,
        hauntedOpacity: style(haunted)?.opacity,
        gamesTransform: style(games)?.transform,
        gamesOpacity: style(games)?.opacity,
      };
    }, label);
    console.log(JSON.stringify(data));
  }

  await sample('before');
  await page.getByRole('button', { name: /Haunted House/i }).click();
  await sample('t0');
  await page.waitForTimeout(50);
  await sample('t50');
  await page.waitForTimeout(100);
  await sample('t150');
  await page.waitForTimeout(200);
  await sample('t350');
  await page.waitForTimeout(250);
  await sample('t600');

  await browser.close();
})();
