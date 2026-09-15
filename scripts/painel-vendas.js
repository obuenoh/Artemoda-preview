// Reimplementacao em JS puro do PontoDeVenda.tsx (React) do sistema real.
// Mesma logica de negocio: bipar por SKU, carrinho, canal loja/producao,
// baixa de estoque ao finalizar. So a persistencia muda — aqui e localStorage
// do navegador, la e banco de dados atras de sessao.
(function () {
  'use strict';
  if (!window.AMDemo) return;
  var D = window.AMDemo;

  var carrinho = []; // { id, nome, tamanho, cor, sku, precoVendaCentavos, quantidade }
  var canal = 'loja';
  var clienteId = '';

  var elCodigo = document.getElementById('bipar');
  var elBtnAdicionar = document.getElementById('btn-adicionar');
  var elErroCodigo = document.getElementById('erro-codigo');
  var elCorpo = document.getElementById('carrinho-corpo');
  var elTotal = document.getElementById('total-venda');
  var elBtnLoja = document.getElementById('btn-canal-loja');
  var elBtnProducao = document.getElementById('btn-canal-producao');
  var elWrapClienteProducao = document.getElementById('wrap-cliente-producao');
  var elWrapClienteLoja = document.getElementById('wrap-cliente-loja');
  var elClienteProducao = document.getElementById('cliente-producao');
  var elClienteLoja = document.getElementById('clienteLoja');
  var elErroFinal = document.getElementById('erro-final');
  var elSucesso = document.getElementById('sucesso-venda');
  var elBtnFinalizar = document.getElementById('btn-finalizar');
  var elUltimasVendas = document.getElementById('ultimas-vendas');

  if (!elCodigo || !elCorpo) return; // pagina sem o ponto de venda

  function escapar(txt) {
    var d = document.createElement('div');
    d.textContent = txt == null ? '' : txt;
    return d.innerHTML;
  }

  function total() {
    return carrinho.reduce(function (s, l) { return s + l.quantidade * l.precoVendaCentavos; }, 0);
  }

  function renderCarrinho() {
    if (carrinho.length === 0) {
      elCorpo.innerHTML = '<tr><td colspan="5" class="td text-center fraco">Carrinho vazio — bipe a primeira peça.</td></tr>';
    } else {
      elCorpo.innerHTML = carrinho.map(function (l) {
        var detalhe = (l.tamanho || l.cor)
          ? '<span class="miudo">' + escapar([l.tamanho, l.cor].filter(Boolean).join(' · ')) + '</span>'
          : '';
        return (
          '<tr>' +
          '<td class="td font-semibold">' + escapar(l.nome) + detalhe + '</td>' +
          '<td class="td"><div class="flex items-center gap-2">' +
          '<button type="button" data-menos="' + l.id + '" class="compacto h-7 w-7 rounded-sm border border-fio font-bold" aria-label="Diminuir">−</button>' +
          '<span class="w-6 text-center font-semibold">' + l.quantidade + '</span>' +
          '<button type="button" data-mais="' + l.id + '" class="compacto h-7 w-7 rounded-sm border border-fio font-bold" aria-label="Aumentar">+</button>' +
          '</div></td>' +
          '<td class="td">' + D.formatoNumero(l.precoVendaCentavos) + '</td>' +
          '<td class="td font-semibold">' + D.formatoReais(l.quantidade * l.precoVendaCentavos) + '</td>' +
          '<td class="td"><button type="button" data-remover="' + l.id + '" class="compacto text-rotulo font-bold uppercase text-alerta">Tirar</button></td>' +
          '</tr>'
        );
      }).join('');
    }
    elTotal.textContent = D.formatoReais(total());
    if (elBtnFinalizar) elBtnFinalizar.disabled = carrinho.length === 0;
  }

  elCorpo.addEventListener('click', function (e) {
    var alvo = e.target;
    var id = alvo.getAttribute('data-mais') || alvo.getAttribute('data-menos') || alvo.getAttribute('data-remover');
    if (!id) return;
    if (alvo.hasAttribute('data-remover')) {
      carrinho = carrinho.filter(function (l) { return l.id !== id; });
    } else {
      var delta = alvo.hasAttribute('data-mais') ? 1 : -1;
      carrinho = carrinho
        .map(function (l) { return l.id === id ? Object.assign({}, l, { quantidade: l.quantidade + delta }) : l; })
        .filter(function (l) { return l.quantidade > 0; });
    }
    renderCarrinho();
  });

  function mostrarErroCodigo(msg) {
    if (!elErroCodigo) return;
    if (!msg) { elErroCodigo.hidden = true; elErroCodigo.textContent = ''; return; }
    elErroCodigo.hidden = false;
    elErroCodigo.innerHTML = '<span class="mr-1 text-gold">↳</span>' + escapar(msg);
  }

  function adicionarAoCarrinho(produto) {
    var existente = carrinho.find(function (l) { return l.id === produto.id; });
    if (existente) {
      carrinho = carrinho.map(function (l) { return l.id === produto.id ? Object.assign({}, l, { quantidade: l.quantidade + 1 }) : l; });
    } else {
      carrinho = carrinho.concat([Object.assign({ quantidade: 1 }, produto)]);
    }
    renderCarrinho();
  }

  function bipar() {
    var valor = elCodigo.value.trim();
    if (!valor) return;
    mostrarErroCodigo(null);
    var produto = D.produtoPorSku(valor);
    if (!produto) {
      mostrarErroCodigo('Nenhuma peça com o código "' + valor + '". Cadastre em Estoque da loja.');
      return;
    }
    if (produto.saldo <= 0) {
      mostrarErroCodigo('"' + produto.nome + '" está com estoque zerado na loja.');
      return;
    }
    adicionarAoCarrinho(produto);
    elCodigo.value = '';
    elCodigo.focus();
  }

  elCodigo.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); bipar(); }
  });
  if (elBtnAdicionar) elBtnAdicionar.addEventListener('click', bipar);

  function mudarCanal(novo) {
    canal = novo;
    clienteId = '';
    if (elBtnLoja) elBtnLoja.className = 'bt ' + (canal === 'loja' ? 'bt-cheio' : 'bt-vazio');
    if (elBtnProducao) elBtnProducao.className = 'bt ' + (canal === 'producao' ? 'bt-cheio' : 'bt-vazio');
    if (elWrapClienteProducao) elWrapClienteProducao.hidden = canal !== 'producao';
    if (elWrapClienteLoja) elWrapClienteLoja.hidden = canal === 'producao';
    if (elClienteProducao) elClienteProducao.value = '';
    if (elClienteLoja) elClienteLoja.value = '';
  }
  if (elBtnLoja) elBtnLoja.addEventListener('click', function () { mudarCanal('loja'); });
  if (elBtnProducao) elBtnProducao.addEventListener('click', function () { mudarCanal('producao'); });
  if (elClienteProducao) elClienteProducao.addEventListener('change', function () { clienteId = elClienteProducao.value; });
  if (elClienteLoja) elClienteLoja.addEventListener('change', function () { clienteId = elClienteLoja.value; });

  function renderUltimasVendas() {
    if (!elUltimasVendas) return;
    var lista = D.todasVendas().slice(0, 12);
    if (lista.length === 0) {
      elUltimasVendas.innerHTML = '<p class="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">Nenhuma venda registrada ainda.</p>';
      return;
    }
    elUltimasVendas.innerHTML =
      '<ul class="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">' +
      lista.map(function (v) {
        return (
          '<li class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">' +
          '<span class="font-semibold">' + D.formatoData(v.criadoEm) + '</span>' +
          '<span class="selo selo-neutro">' + (v.canal === 'loja' ? 'Loja' : 'Produção') + '</span>' +
          '<span class="fraco">' + escapar(v.clienteNome || 'Balcão') + '</span>' +
          '<span class="fraco">' + v.pecas + ' peça(s)</span>' +
          '<span class="ml-auto font-semibold">' + D.formatoReais(v.totalCentavos) + '</span>' +
          '</li>'
        );
      }).join('') +
      '</ul>';
  }

  function finalizar() {
    if (elErroFinal) { elErroFinal.hidden = true; elErroFinal.textContent = ''; }
    if (elSucesso) { elSucesso.hidden = true; elSucesso.textContent = ''; }

    if (canal === 'producao' && !clienteId) {
      if (elErroFinal) {
        elErroFinal.hidden = false;
        elErroFinal.innerHTML = '<span class="mr-1 text-gold">↳</span>Escolha o cliente do pedido de produção.';
      }
      return;
    }
    if (carrinho.length === 0) return;

    var formaPagamento = document.getElementById('pagamento') ? document.getElementById('pagamento').value : 'dinheiro';
    var totalVenda = total();

    D.registrarVenda({
      id: 'demo-' + Date.now(),
      criadoEm: Date.now(),
      canal: canal,
      formaPagamento: formaPagamento,
      totalCentavos: totalVenda,
      clienteId: clienteId || null,
      clienteNome: D.nomeCliente(clienteId),
      pecas: carrinho.reduce(function (s, l) { return s + l.quantidade; }, 0),
      itens: carrinho.map(function (l) { return { produtoAcabadoId: l.id, quantidade: l.quantidade }; }),
    });

    carrinho = [];
    clienteId = '';
    if (elClienteProducao) elClienteProducao.value = '';
    if (elClienteLoja) elClienteLoja.value = '';
    renderCarrinho();
    renderUltimasVendas();

    if (elSucesso) {
      elSucesso.hidden = false;
      elSucesso.textContent = 'Venda registrada — ' + D.formatoReais(totalVenda) + '.';
    }
    elCodigo.focus();
  }
  if (elBtnFinalizar) elBtnFinalizar.addEventListener('click', finalizar);

  renderCarrinho();
  renderUltimasVendas();
})();
