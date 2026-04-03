const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 834, height: 1194 } });
  await page.goto('https://id-preview--8161da77-ebfe-46c3-a211-d89fb6b1bdef.lovable.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);

  const snapshot = async (label) => {
    const data = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-stage]');
      const title = document.querySelector('h1');
      const buttons = Array.from(document.querySelectorAll('button'));
      const games = buttons.find((el) => el.textContent?.includes('Games'));
      const haunted = buttons.find((el) => el.textContent?.includes('Haunted House'));
      return {
        label,
        path: window.location.pathname,
        stage: wrapper?.getAttribute('data-stage'),
        direction: wrapper?.getAttribute('data-direction'),
        wrapperTransform: wrapper ? getComputedStyle(wrapper).transform : null,
        wrapperOpacity: wrapper ? getComputedStyle(wrapper).opacity : null,
        titleTransform: title ? getComputedStyle(title).transform : null,
        titleOpacity: title ? getComputedStyle(title).opacity : null,
        hauntedTransform: haunted ? getComputedStyle(haunted).transform : null,
        hauntedOpacity: haunted ? getComputedStyle(haunted).opacity : null,
        gamesTransform: games ? getComputedStyle(games).transform : null,
        gamesOpacity: games ? getComputedStyle(games).opacity : null,
      };
    });
    console.log(JSON.stringify(data));
  };

  await snapshot('before');
  await page.getByRole('button', { name: /Haunted House/i }).click();
  await snapshot('t0');
  await page.waitForTimeout(50);
  await snapshot('t50');
  await page.waitForTimeout(100);
  await snapshot('t150');
  await page.waitForTimeout(150);
  await snapshot('t300');
  await page.waitForTimeout(250);
  await snapshot('t550');

  await browser.close();
})();
