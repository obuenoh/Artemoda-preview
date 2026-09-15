// Reimplementacao de nota-fiscal/relatorio/page.tsx + BotaoImprimir.tsx.
// So leitura, nao grava nada — igual a pagina real, que tambem so calcula
// sob demanda a partir de Venda. Aqui calcula a partir de dados.js.
(function () {
  'use strict';
  if (!window.AMDemo) return;
  var D = window.AMDemo;
  var corpo = document.getElementById('relatorio-corpo');
  if (!corpo) return;

  function dataBR(ms) {
    return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function escapar(txt) {
    var d = document.createElement('div');
    d.textContent = txt == null ? '' : txt;
    return d.innerHTML;
  }

  var params = new URLSearchParams(location.search);
  var inicioStr = params.get('inicio');
  var fimStr = params.get('fim');
  var clienteId = params.get('clienteId') || '';

  if (!inicioStr || !fimStr) {
    corpo.innerHTML = '<p class="p-8 text-sm fraco">Período não informado.</p>';
    return;
  }

  var inicio = new Date(inicioStr + 'T00:00:00').getTime();
  var fim = new Date(fimStr + 'T23:59:59').getTime();

  var itens = D.todasVendas().filter(function (v) {
    if (v.criadoEm < inicio || v.criadoEm > fim) return false;
    if (clienteId && v.clienteId !== clienteId) return false;
    return true;
  }).sort(function (a, b) { return a.criadoEm - b.criadoEm; });

  var totalCentavos = itens.reduce(function (s, i) { return s + i.totalCentavos; }, 0);
  var totalPecas = itens.reduce(function (s, i) { return s + i.pecas; }, 0);
  var nomeCliente = clienteId ? D.nomeCliente(clienteId) : 'Todos';

  var linhas = itens.map(function (i) {
    return (
      '<tr>' +
      '<td class="td">' + dataBR(i.criadoEm) + '</td>' +
      '<td class="td">' + escapar(i.clienteNome || 'Venda de balcão') + '</td>' +
      '<td class="td">' + (i.canal === 'loja' ? 'Loja' : 'Produção') + '</td>' +
      '<td class="td">' + i.pecas + '</td>' +
      '<td class="td font-semibold">' + D.formatoReais(i.totalCentavos) + '</td>' +
      '</tr>'
    );
  }).join('');

  corpo.innerHTML =
    '<div class="mx-auto max-w-[760px] p-8 print:p-0">' +
    '<div class="flex items-start justify-between border-b border-ink pb-4">' +
    '<div><p class="font-display text-2xl">Arte e Moda</p><p class="text-sm fraco">Relatório de vendas</p></div>' +
    '<button type="button" id="btn-imprimir" class="bt bt-vazio compacto print:hidden">Imprimir / salvar PDF</button>' +
    '</div>' +
    '<dl class="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">' +
    '<div><dt class="text-rotulo font-semibold uppercase fraco">Período</dt><dd>' + dataBR(inicio) + ' a ' + dataBR(fim) + '</dd></div>' +
    '<div><dt class="text-rotulo font-semibold uppercase fraco">Cliente</dt><dd>' + escapar(nomeCliente) + '</dd></div>' +
    '<div><dt class="text-rotulo font-semibold uppercase fraco">Vendas</dt><dd>' + itens.length + '</dd></div>' +
    '<div><dt class="text-rotulo font-semibold uppercase fraco">Peças</dt><dd>' + totalPecas + '</dd></div>' +
    '</dl>' +
    '<table class="mt-6 w-full border-collapse text-sm">' +
    '<thead><tr><th class="th">Data</th><th class="th">Cliente</th><th class="th">Canal</th><th class="th">Peças</th><th class="th">Total</th></tr></thead>' +
    '<tbody>' + (linhas || '<tr><td colspan="5" class="td text-center fraco">Nenhuma venda neste período.</td></tr>') + '</tbody>' +
    '</table>' +
    '<div class="mt-4 flex justify-end border-t border-ink pt-4"><p class="text-xl font-bold">Total: ' + D.formatoReais(totalCentavos) + '</p></div>' +
    '<p class="mt-6 text-xs fraco print:hidden">Documento interno, sem valor fiscal — não substitui nota fiscal.</p>' +
    '</div>';

  document.getElementById('btn-imprimir').addEventListener('click', function () { window.print(); });
})();
