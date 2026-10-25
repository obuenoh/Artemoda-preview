// Renderiza foto de perfil e capas de destaque (imagens/) e a previa do perfil.
// Uso: NODE_PATH="../_render/node_modules" node render.js
// Usa o Google Chrome instalado no Mac, sem baixar navegador.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

(async () => {
  const saida = path.join(__dirname, 'imagens');
  fs.mkdirSync(saida, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });

  // Capas e perfil (artes.html) e stories de dentro de cada destaque (stories.html)
  for (const html of ['artes.html', 'stories.html']) {
    await page.goto('file://' + path.join(__dirname, html), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const arte of await page.$$('[data-arquivo]')) {
      const arquivo = await arte.getAttribute('data-arquivo');
      await arte.screenshot({ path: path.join(saida, arquivo) });
      console.log('ok', arquivo);
    }
  }

  // Previa: como fica no tamanho real do celular, fundo claro e escuro
  await page.setViewportSize({ width: 400, height: 600 });
  await page.goto('file://' + path.join(__dirname, 'previa.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await (await page.$('#previa')).screenshot({ path: path.join(__dirname, 'previa.png') });
  console.log('ok previa.png');

  await browser.close();
})();
