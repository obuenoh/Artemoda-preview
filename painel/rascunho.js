// Reimplementacao de nota-fiscal/[id]/page.tsx. Na demo nao existe "id"
// gravado — os parametros do calculo (periodo, cliente, desconto) vem na
// URL, e o rascunho e recalculado ali mesmo, na hora de abrir a pagina.
// O aviso de rascunho, que nunca vira nota fiscal de verdade sozinha,
// e o mesmo texto do sistema real.
(function () {
  'use strict';
  if (!window.AMDemo) return;
  var D = window.AMDemo;
  var corpo = document.getElementById('rascunho-corpo');
  if (!corpo) return;

  function dataBR(ms) {
    return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function escapar(txt) {
    var d = document.createElement('div');
    d.textContent = txt == null ? '' : txt;
    return d.innerHTML;
  }
  function aplicarDesconto(totalCentavos, descontoPercentualCem, descontoValorCentavos) {
    var peloPercentual = Math.round((totalCentavos * descontoPercentualCem) / 10000);
    return Math.max(totalCentavos - peloPercentual - descontoValorCentavos, 0);
  }

  var params = new URLSearchParams(location.search);
  var inicioStr = params.get('inicio');
  var fimStr = params.get('fim');
  var clienteId = params.get('clienteId') || '';
  var descontoPercentualCem = Math.round((Number(params.get('descontoPercentual')) || 0) * 100);
  var descontoValorCentavos = Math.round((Number(params.get('descontoValor')) || 0) * 100);

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

  if (itens.length === 0) {
    corpo.innerHTML =
      '<a href="nota-fiscal.html" class="compacto text-rotulo font-bold uppercase text-gold">← Nota Fiscal</a>' +
      '<p class="mt-6 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">Não há vendas nesse período para gerar a nota.</p>';
    return;
  }

  var totalVendasCentavos = itens.reduce(function (s, i) { return s + i.totalCentavos; }, 0);
  var totalComDesconto = aplicarDesconto(totalVendasCentavos, descontoPercentualCem, descontoValorCentavos);
  var nomeCliente = clienteId ? D.nomeCliente(clienteId) : null;

  var descontoTexto;
  if (descontoPercentualCem === 0 && descontoValorCentavos === 0) {
    descontoTexto = '<span class="fraco">Nenhum</span>';
  } else {
    descontoTexto = '';
    if (descontoPercentualCem > 0) descontoTexto += (descontoPercentualCem / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '% ';
    if (descontoValorCentavos > 0) descontoTexto += '+ ' + D.formatoReais(descontoValorCentavos);
  }

  var linhasVendas = itens.map(function (v) {
    return (
      '<li class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">' +
      '<span class="font-semibold">' + dataBR(v.criadoEm) + '</span>' +
      '<span class="fraco">' + escapar(v.clienteNome || 'Balcão') + '</span>' +
      '<span class="ml-auto font-semibold">' + D.formatoReais(v.totalCentavos) + '</span>' +
      '</li>'
    );
  }).join('');

  corpo.innerHTML =
    '<a href="nota-fiscal.html" class="compacto text-rotulo font-bold uppercase text-gold">← Nota Fiscal</a>' +
    '<div class="mt-3"><div class="flex flex-wrap items-end justify-between gap-4 border-b border-fio pb-5"><div>' +
    '<h1 class="text-xl font-bold tracking-tight md:text-2xl">Rascunho — ' + dataBR(inicio) + ' a ' + dataBR(fim) + '</h1>' +
    '<p class="mt-1 text-sm fraco">' + escapar(nomeCliente || 'Todos os clientes') + '</p>' +
    '</div></div></div>' +
    '<div class="mt-4 rounded border px-4 py-3 text-sm border-alerta bg-alerta/5 text-ink">' +
    '<strong>Isto é um rascunho, não é um documento fiscal.</strong> A emissão real depende de integrar um provedor homologado — ainda não configurado. Guarde este rascunho como referência até a parte fiscal ser ligada.' +
    '</div>' +
    '<dl class="mt-6 grid gap-3 sm:grid-cols-3">' +
    '<div class="rounded border border-fio bg-cream-alt p-4"><dt class="text-rotulo font-semibold uppercase fraco">Total das vendas</dt><dd class="mt-1 text-xl font-bold">' + D.formatoReais(totalVendasCentavos) + '</dd></div>' +
    '<div class="rounded border border-fio bg-cream-alt p-4"><dt class="text-rotulo font-semibold uppercase fraco">Desconto</dt><dd class="mt-1 text-xl font-bold">' + descontoTexto + '</dd></div>' +
    '<div class="rounded border border-fio bg-navy-deep p-4 text-cream"><dt class="text-rotulo font-semibold uppercase text-[color:var(--texto-claro)]">Total com desconto</dt><dd class="mt-1 text-xl font-bold">' + D.formatoReais(totalComDesconto) + '</dd></div>' +
    '</dl>' +
    '<section class="mt-8"><h2 class="text-rotulo font-bold uppercase text-gold">Vendas incluídas</h2>' +
    '<ul class="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">' + linhasVendas + '</ul></section>';
})();
