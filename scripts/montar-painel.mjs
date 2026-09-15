// Captura o gerenciador rodando em localhost e converte num prototipo
// estatico navegavel. Nao toca no app real — so le o HTML que ele produz.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://localhost:3100';
const TOKEN = readFileSync(new URL('./token.txt', import.meta.url), 'utf8').trim();
const SAIDA = new URL('./painel/', import.meta.url).pathname;

mkdirSync(SAIDA, { recursive: true });
mkdirSync(join(SAIDA, 'fontes'), { recursive: true });

const cabecalhos = { Cookie: `am_sessao=${TOKEN}` };

function nomeArquivo(url) {
  if (url === '/') return 'index.html';
  const [caminho, query] = url.split('?');
  let slug = caminho.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '-');
  if (query) {
    const q = query.replace(/[=&]/g, '-');
    slug = slug ? `${slug}--${q}` : `visao--${q}`;
  }
  return (slug || 'index') + '.html';
}

// ── 1. crawl ────────────────────────────────────────────────────────────
const fila = ['/', '/vendas', '/nota-fiscal', '/tecidos', '/estoque',
              '/compras', '/fornecedores', '/clientes'];
const vistos = new Set();
const paginas = new Map(); // url -> html cru

while (fila.length && paginas.size < 90) {
  const url = fila.shift();
  if (vistos.has(url)) continue;
  vistos.add(url);

  const r = await fetch(BASE + url, { headers: cabecalhos, redirect: 'manual' });
  if (r.status !== 200) { console.log(`  pula ${url} (${r.status})`); continue; }
  const html = await r.text();
  paginas.set(url, html);

  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const alvo = m[1];
    if (alvo.startsWith('/_next')) continue;
    if (!vistos.has(alvo)) fila.push(alvo);
  }
}
console.log(`capturadas ${paginas.size} paginas`);

// ── 2. mapa url -> arquivo ──────────────────────────────────────────────
const mapa = new Map();
for (const url of paginas.keys()) mapa.set(url, nomeArquivo(url));

// ── 3. faixa de demonstracao ────────────────────────────────────────────
const FAIXA = `<div style="background:#B58B57;color:#15263D;text-align:center;padding:7px 16px;font-size:12px;letter-spacing:.06em;font-weight:600;text-transform:uppercase">Demonstração · números de exemplo · os botões não gravam nada</div>`;

// ── 4. transforma e grava ───────────────────────────────────────────────
for (const [url, cru] of paginas) {
  let html = cru;

  // tira o runtime do Next: sem servidor, script so quebraria
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<link[^>]+rel="preload"[^>]*>/gi, '');

  // css local
  html = html.replace(/<link[^>]+href="\/_next\/static\/css\/[^"]*"[^>]*>/gi,
    '<link rel="stylesheet" href="estilo.css"/>');

  // links internos -> arquivos
  html = html.replace(/href="(\/[^"]*)"/g, (todo, alvo) => {
    if (alvo.startsWith('/_next')) return todo;
    const arq = mapa.get(alvo);
    return arq ? `href="${arq}"` : `href="#" data-fora-da-previa="1"`;
  });

  // formularios inertes: sem servidor, submit daria 404
  html = html.replace(/<form\b([^>]*)>/gi, (todo, attrs) => {
    const limpo = attrs.replace(/\saction="[^"]*"/gi, '').replace(/\smethod="[^"]*"/gi, '');
    return `<form${limpo} onsubmit="return false">`;
  });

  html = html.replace(/(<body[^>]*>)/i, `$1${FAIXA}`);

  writeFileSync(join(SAIDA, mapa.get(url)), html);
}

// ── 5. css + fontes ─────────────────────────────────────────────────────
let css = readFileSync(new URL('./estilo.css', import.meta.url).pathname, 'utf8');
const fontes = [...new Set([...css.matchAll(/url\(\/_next\/static\/media\/([^)]+)\)/g)].map(m => m[1]))];
for (const f of fontes) {
  const r = await fetch(`${BASE}/_next/static/media/${f}`, { headers: cabecalhos });
  writeFileSync(join(SAIDA, 'fontes', f), Buffer.from(await r.arrayBuffer()));
}
css = css.replace(/url\(\/_next\/static\/media\//g, 'url(fontes/');
writeFileSync(join(SAIDA, 'estilo.css'), css);

console.log(`${fontes.length} fontes, css gravado`);
console.log('paginas:', [...mapa.values()].join(' '));
