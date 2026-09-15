// Substitui os blocos estaticos e mortos (carrinho de vendas, calculadora de
// nota fiscal) por markup com ids, para os scripts vendas.js/notafiscal.js
// terem onde se plugar. Mantem as mesmas classes do componente React real —
// visualmente identico, so ganha comportamento.
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = new URL('./painel/', import.meta.url).pathname;

const CLIENTES = JSON.parse(readFileSync(new URL('./dados/clientes.json', import.meta.url), 'utf8'));
function escaparHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const OPCOES_CLIENTES = CLIENTES.map((c) => `<option value="${c.id}">${escaparHtml(c.nome)}</option>`).join('');

function acharFimTag(html, inicioAbre, tag) {
  const abre = new RegExp('<' + tag + '\\b', 'g');
  const fecha = '</' + tag + '>';
  abre.lastIndex = inicioAbre + 1;
  let prof = 1;
  let pos = inicioAbre;
  while (prof > 0) {
    const proxAbre = html.indexOf('<' + tag, pos + 1);
    const proxFecha = html.indexOf(fecha, pos + 1);
    if (proxFecha === -1) throw new Error('tag nao fechada: ' + tag);
    if (proxAbre !== -1 && proxAbre < proxFecha) {
      prof++;
      pos = proxAbre;
    } else {
      prof--;
      pos = proxFecha;
    }
  }
  return pos + fecha.length;
}

function substituirBloco(html, marcador, tag, novoConteudo) {
  const i = html.indexOf(marcador);
  if (i === -1) throw new Error('marcador nao encontrado: ' + marcador);
  const fim = acharFimTag(html, i, tag);
  return html.slice(0, i) + novoConteudo + html.slice(fim);
}

function injetarScripts(html, scripts) {
  const tags = scripts.map((s) => `<script src="${s}"></script>`).join('');
  return html.replace('</body>', tags + '</body>');
}

// ── vendas.html ──────────────────────────────────────────────────────────
{
  let html = readFileSync(DIR + 'vendas.html', 'utf8');

  const novoPontoDeVenda = `<div class="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]"><div><div class="flex flex-wrap gap-2"><button type="button" id="btn-canal-loja" class="bt bt-cheio">Venda de balcão</button><button type="button" id="btn-canal-producao" class="bt bt-vazio">Pedido de produção</button></div><div class="mt-4"><label for="bipar" class="rotulo-campo">Bipar ou digitar o código da peça</label><div class="mt-1.5 flex gap-2"><input id="bipar" autocomplete="off" placeholder="Aponte a leitora aqui ou digite o SKU e tecle Enter" class="campo flex-1"/><button type="button" id="btn-adicionar" class="bt bt-cheio shrink-0">Adicionar</button></div><p role="alert" id="erro-codigo" hidden class="mt-1.5 text-sm"></p></div><div class="tabela-rolagem mt-5"><table class="w-full min-w-[520px] border-collapse text-sm"><thead><tr><th class="th">Peça</th><th class="th">Qtd</th><th class="th">Preço</th><th class="th">Subtotal</th><th class="th"></th></tr></thead><tbody id="carrinho-corpo"><tr><td colspan="5" class="td text-center fraco">Carrinho vazio — bipe a primeira peça.</td></tr></tbody></table></div></div><aside class="rounded border border-fio bg-cream-alt p-4"><p class="text-rotulo font-bold uppercase text-gold">Fechar venda</p><div class="mt-4" id="wrap-cliente-producao" hidden><label for="cliente-producao" class="rotulo-campo">Cliente</label><select id="cliente-producao" class="campo mt-1.5"><option value="">Escolha o cliente</option>${OPCOES_CLIENTES}</select></div><div class="mt-4" id="wrap-cliente-loja"><label for="clienteLoja" class="rotulo-campo">Cliente <span class="font-normal normal-case tracking-normal">opcional</span></label><select id="clienteLoja" class="campo mt-1.5"><option value="">Venda de balcão, sem identificar</option>${OPCOES_CLIENTES}</select></div><div class="mt-4"><label for="pagamento" class="rotulo-campo">Forma de pagamento</label><select id="pagamento" class="campo mt-1.5"><option value="dinheiro">Dinheiro</option><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="fiado">Fiado</option></select></div><div class="mt-5 rounded bg-navy-deep px-4 py-3 text-cream"><p class="text-rotulo text-[color:var(--texto-claro)]">Total</p><p class="text-2xl font-bold" id="total-venda">R$ 0,00</p></div><p role="alert" id="erro-final" hidden class="mt-3 text-sm"></p><p id="sucesso-venda" hidden class="mt-3 text-sm text-ok"></p><button type="button" id="btn-finalizar" disabled class="bt bt-cheio mt-4 w-full">Finalizar venda</button></aside></div>`;

  html = substituirBloco(html, '<div class="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">', 'div', novoPontoDeVenda);

  // "Ultimas vendas": troca o <ul>...</ul> ou <p>...</p> logo apos o <h2> por um alvo com id
  html = html.replace(
    /(<h2 class="text-rotulo font-bold uppercase fraco">Últimas vendas<\/h2>)([\s\S]*?)(<\/section>)/,
    '$1<div id="ultimas-vendas"></div>$3',
  );

  html = injetarScripts(html, ['dados.js', 'vendas.js']);
  writeFileSync(DIR + 'vendas.html', html);
  console.log('vendas.html reescrito,', html.length, 'bytes');
}

// ── nota-fiscal.html ────────────────────────────────────────────────────
{
  let html = readFileSync(DIR + 'nota-fiscal.html', 'utf8');
  const i = html.indexOf('<div class="rounded border border-fio bg-cream-alt p-5">');
  if (i === -1) throw new Error('bloco do FiltroNota nao encontrado');

  const novoFiltro = `<div class="rounded border border-fio bg-cream-alt p-5"><div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><div><label for="inicio" class="rotulo-campo">De</label><input id="inicio" type="date" class="campo mt-1.5"/></div><div><label for="fim" class="rotulo-campo">Até</label><input id="fim" type="date" class="campo mt-1.5"/></div><div><label for="cliente" class="rotulo-campo">Cliente <span class="font-normal normal-case tracking-normal">opcional</span></label><select id="cliente" class="campo mt-1.5"><option value="">Todos os clientes</option>${OPCOES_CLIENTES}</select></div><div class="flex items-end"><button type="button" id="btn-calcular" class="bt bt-cheio w-full">Calcular</button></div></div><div class="mt-5 grid gap-5 sm:grid-cols-2"><div><label for="descontoPercentual" class="rotulo-campo">Desconto (%)</label><input id="descontoPercentual" inputmode="decimal" value="0" class="campo mt-1.5"/></div><div><label for="descontoValor" class="rotulo-campo">Desconto (valor fixo)</label><input id="descontoValor" inputmode="decimal" value="0" placeholder="0,00" class="campo mt-1.5"/></div></div><p role="alert" id="erro-previa" hidden class="mt-4 text-sm"></p><div id="resultado-previa" hidden class="mt-5 border-t border-fio pt-5"></div></div>`;

  html = substituirBloco(html, '<div class="rounded border border-fio bg-cream-alt p-5">', 'div', novoFiltro);
  html = injetarScripts(html, ['dados.js', 'notafiscal.js']);
  writeFileSync(DIR + 'nota-fiscal.html', html);
  console.log('nota-fiscal.html reescrito,', html.length, 'bytes');
}
