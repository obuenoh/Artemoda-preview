// Reimplementacao em JS puro do FiltroNota.tsx + relatorioPeriodo/aplicarDesconto
// (src/lib/notafiscal.ts) do sistema real. So soma o que ja esta em "venda"
// (aqui, os dados de demonstracao) — nao fala com nenhum provedor fiscal.
(function () {
  'use strict';
  if (!window.AMDemo) return;
  var D = window.AMDemo;

  var elInicio = document.getElementById('inicio');
  var elFim = document.getElementById('fim');
  var elCliente = document.getElementById('cliente');
  var elDescontoPct = document.getElementById('descontoPercentual');
  var elDescontoValor = document.getElementById('descontoValor');
  var elBtnCalcular = document.getElementById('btn-calcular');
  var elErro = document.getElementById('erro-previa');
  var elResultado = document.getElementById('resultado-previa');

  if (!elBtnCalcular || !elInicio) return; // pagina sem o calculador

  function dataBR(ms) {
    return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function aplicarDesconto(totalCentavos, descontoPercentualCem, descontoValorCentavos) {
    var peloPercentual = Math.round((totalCentavos * descontoPercentualCem) / 10000);
    var resultado = totalCentavos - peloPercentual - descontoValorCentavos;
    return Math.max(resultado, 0);
  }

  function calcular() {
    if (elErro) { elErro.hidden = true; elErro.textContent = ''; }
    if (elResultado) elResultado.hidden = true;

    var inicioStr = elInicio.value;
    var fimStr = elFim.value;
    if (!inicioStr || !fimStr) {
      if (elErro) { elErro.hidden = false; elErro.innerHTML = '<span class="mr-1 text-gold">↳</span>Escolha o período.'; }
      return;
    }
    var inicio = new Date(inicioStr + 'T00:00:00').getTime();
    var fim = new Date(fimStr + 'T23:59:59').getTime();
    if (fim < inicio) {
      if (elErro) { elErro.hidden = false; elErro.innerHTML = '<span class="mr-1 text-gold">↳</span>A data final não pode ser antes da inicial.'; }
      return;
    }

    var clienteId = elCliente ? elCliente.value : '';
    var descontoPercentual = Number(String(elDescontoPct ? elDescontoPct.value : '0').replace(',', '.')) || 0;
    var descontoValorReais = Number(String(elDescontoValor ? elDescontoValor.value : '0').replace(',', '.')) || 0;
    var descontoPercentualCem = Math.round(descontoPercentual * 100);
    var descontoValorCentavos = Math.round(descontoValorReais * 100);

    var itens = D.todasVendas().filter(function (v) {
      if (v.criadoEm < inicio || v.criadoEm > fim) return false;
      if (clienteId && v.clienteId !== clienteId) return false;
      return true;
    }).sort(function (a, b) { return a.criadoEm - b.criadoEm; });

    var totalCentavos = itens.reduce(function (s, i) { return s + i.totalCentavos; }, 0);
    var totalPecas = itens.reduce(function (s, i) { return s + i.pecas; }, 0);
    var totalComDesconto = aplicarDesconto(totalCentavos, descontoPercentualCem, descontoValorCentavos);

    renderResultado(itens, totalCentavos, totalPecas, totalComDesconto);
  }

  function escapar(txt) {
    var d = document.createElement('div');
    d.textContent = txt == null ? '' : txt;
    return d.innerHTML;
  }

  function renderResultado(itens, totalCentavos, totalPecas, totalComDesconto) {
    if (!elResultado) return;

    if (itens.length === 0) {
      elResultado.hidden = false;
      elResultado.innerHTML = '<p class="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">Nenhuma venda encontrada nesse período.</p>';
      return;
    }

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

    elResultado.hidden = false;
    elResultado.innerHTML =
      '<div class="tabela-rolagem">' +
      '<table class="w-full min-w-[520px] border-collapse text-sm">' +
      '<thead><tr><th class="th">Data</th><th class="th">Cliente</th><th class="th">Canal</th><th class="th">Peças</th><th class="th">Total</th></tr></thead>' +
      '<tbody>' + linhas + '</tbody></table></div>' +
      '<div class="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded bg-navy-deep px-4 py-3 text-cream">' +
      '<span class="text-sm text-[color:var(--texto-claro)]">' + itens.length + ' venda(s), ' + totalPecas + ' peça(s)</span>' +
      '<span class="text-sm text-[color:var(--texto-claro)]">Bruto: ' + D.formatoReais(totalCentavos) + '</span>' +
      '<span class="ml-auto text-xl font-bold">' + D.formatoReais(totalComDesconto) + '</span>' +
      '</div>' +
      '<p class="mt-4 miudo fraco">Nesta prévia, "Gerar só o relatório" e "Emitir nota fiscal" ficam desligados — no sistema de verdade, o rascunho é salvo para a dona revisar.</p>';
  }

  elBtnCalcular.addEventListener('click', calcular);

  // Mesmos valores padrao do componente real: hoje e 30 dias atras.
  function isoLocal(data) {
    var ano = data.getFullYear();
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var dia = String(data.getDate()).padStart(2, '0');
    return ano + '-' + mes + '-' + dia;
  }
  if (!elInicio.value) elInicio.value = isoLocal(new Date(Date.now() - 30 * 86400000));
  if (!elFim.value) elFim.value = isoLocal(new Date());
  calcular();
})();
