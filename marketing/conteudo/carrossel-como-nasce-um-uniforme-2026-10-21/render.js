// Renderiza cada .slide do carrossel.html em PNG 1080x1350 (instagram/).
// Uso: NODE_PATH="../_render/node_modules" node render.js
// Usa o Google Chrome instalado no Mac, sem baixar navegador.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

(async () => {
  const saida = path.join(__dirname, 'instagram');
  fs.mkdirSync(saida, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 540, height: 675 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'carrossel.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    const arquivo = path.join(saida, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: arquivo });
    console.log('ok', path.basename(arquivo));
  }
  await browser.close();
})();
