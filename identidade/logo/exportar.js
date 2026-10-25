// Exporta cada versao do logo.html em PNG (fundo transparente) e PDF (vetor).
// Uso: NODE_PATH="../../marketing/conteudo/_render/node_modules" node exportar.js
// Icone e avatar saem com fundo azul e so em PNG, no tamanho que o app e o Instagram pedem.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

(async () => {
  const png = path.join(__dirname, 'png');
  const pdf = path.join(__dirname, 'pdf');
  fs.mkdirSync(png, { recursive: true });
  fs.mkdirSync(pdf, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto('file://' + path.join(__dirname, 'logo.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const versoes = await page.$$eval('[data-v]', (els) => els.map((e) => e.dataset.v));

  for (const v of versoes) {
    const fundo = v === 'icone-do-app' || v === 'avatar-instagram';
    const escala = fundo ? 1 : 4;
    const p = await browser.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: escala });
    await p.goto('file://' + path.join(__dirname, 'logo.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    // Deixa so a versao da vez, colada no canto, para o PDF ter o tamanho exato dela.
    const caixa = await p.evaluate((nome) => {
      document.querySelectorAll('[data-v]').forEach((e) => { if (e.dataset.v !== nome) e.remove(); });
      document.body.style.padding = '0';
      const r = document.querySelector(`[data-v="${nome}"]`).getBoundingClientRect();
      return { w: Math.ceil(r.width), h: Math.ceil(r.height) };
    }, v);
    const el = await p.$(`[data-v="${v}"]`);
    await el.screenshot({ path: path.join(png, `${v}.png`), omitBackground: !fundo });
    if (!fundo) {
      await p.emulateMedia({ media: 'print' });
      await p.pdf({ path: path.join(pdf, `${v}.pdf`), width: `${caixa.w}px`, height: `${caixa.h}px`, printBackground: true, pageRanges: '1' });
    }
    console.log('ok', v, caixa.w + 'x' + caixa.h);
    await p.close();
  }
  await browser.close();
})();
