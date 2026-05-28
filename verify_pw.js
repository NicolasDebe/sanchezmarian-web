const pw = require.resolve('C:\\Users\\nicod\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright\\index.js');
const { chromium } = require(pw);
(async () => {
  const PAGES = ['/', '/sobre-marian', '/servicios', '/casos-de-exito', '/contacto'];
  const BASE = 'http://localhost:3000';
  const TMPDIR = 'C:/Users/nicod/AppData/Local/Temp';

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const slug = p === '/' ? 'home' : p.replace(/\//g, '');
    await page.screenshot({ path: TMPDIR + '/scr_' + slug + '.png' });
    console.log('shot: ' + p);
  }

  const domCheck = await page.evaluate(() => ({
    cursor: !!document.querySelector('.cursor-follower'),
    dataCursorCount: document.querySelectorAll('[data-cursor="card"]').length,
    bodyPos: window.getComputedStyle(document.body).position,
    bodyCursor: document.body.style.cursor,
  }));
  console.log('DOM /contacto:', JSON.stringify(domCheck));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const ctaBg = await page.evaluate(() => {
    const el = document.querySelector('#contacto');
    return el ? window.getComputedStyle(el).background.substring(0, 200) : 'NOT FOUND';
  });
  console.log('CTA bg:', ctaBg);

  const footerBg = await page.evaluate(() => {
    const el = document.querySelector('footer');
    return el ? window.getComputedStyle(el).background.substring(0, 200) : 'NOT FOUND';
  });
  console.log('Footer bg:', footerBg);

  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(700);
  await page.screenshot({ path: TMPDIR + '/scr_home_scrolled.png' });

  const navBg = await page.evaluate(() => {
    const h = document.querySelector('header');
    return h ? window.getComputedStyle(h).background.substring(0, 200) : 'NOT FOUND';
  });
  console.log('Nav scrolled bg:', navBg);

  await page.goto(BASE + '/casos-de-exito', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const casosCards = await page.evaluate(() => document.querySelectorAll('[data-cursor="card"]').length);
  console.log('Casos data-cursor cards:', casosCards);

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
