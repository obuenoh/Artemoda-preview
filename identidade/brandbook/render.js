// Imprime o brandbook.html em PDF (1280x720 por pagina) na pasta identidade/.
// Uso: NODE_PATH="../../marketing/conteudo/_render/node_modules" node render.js [pasta-de-previas]
// Com a pasta de previas, salva tambem um PNG por pagina para conferir.
// Usa o Google Chrome instalado no Mac, sem baixar navegador.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

(async () => {
  const pdf = path.join(__dirname, '..', 'BRANDBOOK ARTE E MODA_2026.pdf');
  const previas = process.argv[2];

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'brandbook.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  if (previas) {
    fs.mkdirSync(previas, { recursive: true });
    const paginas = await page.$$('.pg');
    for (let i = 0; i < paginas.length; i++) {
      await paginas[i].screenshot({ path: path.join(previas, `pagina-${String(i + 1).padStart(2, '0')}.png`) });
    }
    console.log('previas', paginas.length);
  }

  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: pdf, width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });
  console.log('ok', path.basename(pdf));
  await browser.close();
})();
