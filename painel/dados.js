// Dados de demonstracao do gerenciador — mesmo catalogo e historico do seed
// real (prisma/seed.ts), congelados no momento da captura. Sem servidor,
// entao o que o usuario faz na demo fica so no navegador dele (localStorage),
// nunca chega a outra pessoa nem volta ao sistema de verdade.
(function () {
  'use strict';

  var PRODUTOS_SEED = [
    {"id":"cmtc99fyb002my0gklayfmp0l","nome":"Polo Colégio Alfa","tamanho":"P","cor":"Azul marinho","sku":"7891000000012","precoVendaCentavos":6900,"saldo":30},
    {"id":"cmtc99fyb002oy0gku64h5vfl","nome":"Polo Colégio Alfa","tamanho":"M","cor":"Azul marinho","sku":"7891000000029","precoVendaCentavos":6900,"saldo":55},
    {"id":"cmtc99fyc002qy0gkvaoic33z","nome":"Polo Colégio Alfa","tamanho":"G","cor":"Azul marinho","sku":"7891000000036","precoVendaCentavos":6900,"saldo":23},
    {"id":"cmtc99fyd002sy0gkigq7p784","nome":"Moletom Colégio São Jorge","tamanho":"M","cor":"Cinza","sku":"7891000000043","precoVendaCentavos":12900,"saldo":13},
    {"id":"cmtc99fyd002uy0gkyy65ajpf","nome":"Camiseta Rua Nove básica","tamanho":"M","cor":"Branco","sku":"7891000000050","precoVendaCentavos":4500,"saldo":93},
    {"id":"cmtc9mlby000ny0jev0t6o5z0","nome":"Calça","tamanho":"GG","cor":"Preta","sku":"1200","precoVendaCentavos":5000,"saldo":9}
  ];

  var CLIENTES = [
    {"id":"cmtc99fxz001gy0gke9gi2io2","nome":"Colégio Alfa"},
    {"id":"cmtc99fy1001my0gkm7dx4r4h","nome":"Colégio São Jorge"},
    {"id":"cmtc99fy0001ky0gkgosyd4f9","nome":"Marca Rua Nove"},
    {"id":"cmtc99fy0001iy0gkskznh10k","nome":"Metalúrgica Bertoni"}
  ];

  // Vendas do seed, mais recente primeiro. criadoEm em epoch-ms.
  var VENDAS_SEED = [{"id":"cmtc9nidq000vy0jets2wu3sg","criadoEm":1787880105423,"canal":"loja","formaPagamento":"cartao","totalCentavos":15000,"clienteId":null,"clienteNome":"Venda de balcão","pecas":3},{"id":"cmtc9ifhs0003y0jek77nvmv8","criadoEm":1787879868400,"canal":"loja","formaPagamento":"pix","totalCentavos":9000,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99g00009my0gk74gsqxi2","criadoEm":1787879449152,"canal":"loja","formaPagamento":"pix","totalCentavos":13800,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fzy009ey0gkctg5ctq1","criadoEm":1787879449150,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":6900,"clienteId":"cmtc99fy0001ky0gkgosyd4f9","clienteNome":"Marca Rua Nove","pecas":1},{"id":"cmtc99g0700agy0gkwv3mezcr","criadoEm":1787706649159,"canal":"producao","formaPagamento":"fiado","totalCentavos":55200,"clienteId":"cmtc99fxz001gy0gke9gi2io2","clienteNome":"Colégio Alfa","pecas":8},{"id":"cmtc99fzw0096y0gk5xfu88qq","criadoEm":1787706649148,"canal":"loja","formaPagamento":"cartao","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fzu008yy0gkisdf6r3y","criadoEm":1787620249146,"canal":"loja","formaPagamento":"pix","totalCentavos":13800,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fzs008qy0gkr9uqja6r","criadoEm":1787620249144,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":4500,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fzq008iy0gkj0loz05d","criadoEm":1787533849142,"canal":"loja","formaPagamento":"pix","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fzo008ay0gk3mi3598f","criadoEm":1787361049140,"canal":"loja","formaPagamento":"pix","totalCentavos":9000,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fzm0082y0gkoote7aqq","criadoEm":1787361049138,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fzk007uy0gku75xj3jn","criadoEm":1787188249136,"canal":"loja","formaPagamento":"cartao","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99g0500a8y0gkikvs4ot2","criadoEm":1787101849157,"canal":"producao","formaPagamento":"pix","totalCentavos":154800,"clienteId":"cmtc99fy1001my0gkm7dx4r4h","clienteNome":"Colégio São Jorge","pecas":12},{"id":"cmtc99fzi007my0gkh8uwzf15","criadoEm":1787101849134,"canal":"loja","formaPagamento":"pix","totalCentavos":13800,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fzh007ey0gkb4erzhs5","criadoEm":1787101849132,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fzf0076y0gko5jtd5zq","criadoEm":1787015449131,"canal":"loja","formaPagamento":"pix","totalCentavos":6900,"clienteId":"cmtc99fy0001ky0gkgosyd4f9","clienteNome":"Marca Rua Nove","pecas":1},{"id":"cmtc99fzd006yy0gk67yvwf0b","criadoEm":1786842649129,"canal":"loja","formaPagamento":"pix","totalCentavos":13800,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fzb006qy0gk1uulhqf8","criadoEm":1786842649127,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fza006iy0gk6c0lamw1","criadoEm":1786669849125,"canal":"loja","formaPagamento":"cartao","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fz8006ay0gkocoogma4","criadoEm":1786583449124,"canal":"loja","formaPagamento":"pix","totalCentavos":13800,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fz50062y0gkiewr18rh","criadoEm":1786583449121,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":4500,"clienteId":"cmtc99fy0001ky0gkgosyd4f9","clienteNome":"Marca Rua Nove","pecas":1},{"id":"cmtc99fz3005uy0gk2co8lesc","criadoEm":1786497049119,"canal":"loja","formaPagamento":"pix","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99g02009uy0gk1lmci9oe","criadoEm":1786324249154,"canal":"producao","formaPagamento":"fiado","totalCentavos":310500,"clienteId":"cmtc99fxz001gy0gke9gi2io2","clienteNome":"Colégio Alfa","pecas":45},{"id":"cmtc99fz1005my0gkldcar8g9","criadoEm":1786324249117,"canal":"loja","formaPagamento":"pix","totalCentavos":9000,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fyz005ey0gk5vsr4pc8","criadoEm":1786324249115,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fyy0056y0gk79fcgh3c","criadoEm":1786151449114,"canal":"loja","formaPagamento":"cartao","totalCentavos":6900,"clienteId":"cmtc99fy0001ky0gkgosyd4f9","clienteNome":"Marca Rua Nove","pecas":1},{"id":"cmtc99fyw004yy0gke8puwo88","criadoEm":1786065049112,"canal":"loja","formaPagamento":"pix","totalCentavos":13800,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fyu004qy0gkjm0mlsy1","criadoEm":1786065049110,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fys004iy0gkb69a7zxt","criadoEm":1785978649108,"canal":"loja","formaPagamento":"pix","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fyq004ay0gkjw001psu","criadoEm":1785805849106,"canal":"loja","formaPagamento":"pix","totalCentavos":13800,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fyo0042y0gkws6zrgrv","criadoEm":1785805849104,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fyn003uy0gkgsd9btwp","criadoEm":1785633049102,"canal":"loja","formaPagamento":"cartao","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fyl003my0gk3fa8bs21","criadoEm":1785546649101,"canal":"loja","formaPagamento":"pix","totalCentavos":13800,"clienteId":null,"clienteNome":"Venda de balcão","pecas":2},{"id":"cmtc99fyj003ey0gks9kbbaoi","criadoEm":1785546649098,"canal":"loja","formaPagamento":"dinheiro","totalCentavos":4500,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1},{"id":"cmtc99fyh0036y0gksj6hi7f7","criadoEm":1785460249097,"canal":"loja","formaPagamento":"pix","totalCentavos":6900,"clienteId":null,"clienteNome":"Venda de balcão","pecas":1}];

  var CHAVE = 'am_demo_v1';

  function estadoPadrao() {
    return { vendas: [], ajustesEstoque: {} };
  }

  function lerEstado() {
    try {
      var bruto = localStorage.getItem(CHAVE);
      if (!bruto) return estadoPadrao();
      var estado = JSON.parse(bruto);
      return {
        vendas: Array.isArray(estado.vendas) ? estado.vendas : [],
        ajustesEstoque: estado.ajustesEstoque && typeof estado.ajustesEstoque === 'object' ? estado.ajustesEstoque : {},
      };
    } catch (e) {
      return estadoPadrao();
    }
  }

  function salvarEstado(estado) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      // Storage indisponivel (janela privada, storage bloqueado): a demo
      // continua funcionando nesta navegacao, so nao sobrevive ao reload.
    }
  }

  function produtos() {
    var estado = lerEstado();
    return PRODUTOS_SEED.map(function (p) {
      var ajuste = estado.ajustesEstoque[p.id] || 0;
      return Object.assign({}, p, { saldo: p.saldo + ajuste });
    });
  }

  function produtoPorSku(sku) {
    var alvo = String(sku).trim();
    var lista = produtos();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].sku === alvo) return lista[i];
    }
    return null;
  }

  function clientes() {
    return CLIENTES.slice();
  }

  function nomeCliente(clienteId) {
    if (!clienteId) return 'Venda de balcão';
    for (var i = 0; i < CLIENTES.length; i++) {
      if (CLIENTES[i].id === clienteId) return CLIENTES[i].nome;
    }
    return 'Venda de balcão';
  }

  function todasVendas() {
    var estado = lerEstado();
    return estado.vendas.concat(VENDAS_SEED).sort(function (a, b) {
      return b.criadoEm - a.criadoEm;
    });
  }

  /** Registra a venda (localStorage) e baixa o estoque dos itens vendidos. */
  function registrarVenda(venda) {
    var estado = lerEstado();
    estado.vendas.unshift(venda);
    venda.itens.forEach(function (item) {
      var atual = estado.ajustesEstoque[item.produtoAcabadoId] || 0;
      estado.ajustesEstoque[item.produtoAcabadoId] = atual - item.quantidade;
    });
    salvarEstado(estado);
  }

  function limparDemo() {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
  }

  window.AMDemo = {
    produtos: produtos,
    produtoPorSku: produtoPorSku,
    clientes: clientes,
    nomeCliente: nomeCliente,
    todasVendas: todasVendas,
    registrarVenda: registrarVenda,
    limparDemo: limparDemo,
    formatoReais: function (centavos) {
      return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    formatoNumero: function (centavos) {
      return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatoData: function (ms) {
      return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
  };
})();
