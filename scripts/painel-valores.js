// Botao "Ocultar valores" na previa estatica (GitHub Pages).
//
// No app de verdade quem faz isso e o React (src/components/Valores.tsx,
// com o cookie am_valores). Aqui nao ha servidor nem React: o script acha
// os valores pela marca data-dinheiro, troca o texto, e guarda a escolha no
// navegador de quem esta vendo (localStorage) — vale em todas as telas da
// previa, como no app.
(function () {
  'use strict';

  var CHAVE = 'am_valores_previa';

  function lerEscolha() {
    try {
      return localStorage.getItem(CHAVE) === 'ocultos';
    } catch (e) {
      return false;
    }
  }

  function gravarEscolha(ocultos) {
    try {
      if (ocultos) localStorage.setItem(CHAVE, 'ocultos');
      else localStorage.removeItem(CHAVE);
    } catch (e) {
      // navegador sem armazenamento: so vale nesta tela
    }
  }

  function aplicar(ocultos) {
    var valores = document.querySelectorAll('[data-dinheiro]');
    for (var i = 0; i < valores.length; i++) {
      var el = valores[i];
      if (el.getAttribute('data-texto') === null) el.setAttribute('data-texto', el.textContent);
      if (ocultos) {
        el.textContent = el.getAttribute('data-dinheiro') === 'numero' ? '•••••' : 'R$ •••••';
        el.setAttribute('aria-label', 'valor oculto');
      } else {
        el.textContent = el.getAttribute('data-texto');
        el.removeAttribute('aria-label');
      }
    }

    var botoes = document.querySelectorAll('[data-ocultar-valores]');
    for (var j = 0; j < botoes.length; j++) {
      var b = botoes[j];
      b.setAttribute('aria-pressed', ocultos ? 'true' : 'false');
      b.title = ocultos ? 'Mostrar os valores' : 'Esconder os valores';
      var rotulo = b.querySelector('[data-rotulo]');
      if (rotulo) rotulo.textContent = ocultos ? 'Mostrar valores' : 'Ocultar valores';
      var risco = b.querySelector('[data-risco]');
      if (risco) risco.style.opacity = ocultos ? '1' : '0';
    }

    // Barras do grafico: o valor ao passar o mouse tambem some.
    var barras = document.querySelectorAll('[data-dinheiro-titulo], .bg-gold[title]');
    for (var k = 0; k < barras.length; k++) {
      var barra = barras[k];
      if (barra.getAttribute('data-dinheiro-titulo') === null) {
        barra.setAttribute('data-dinheiro-titulo', barra.getAttribute('title') || '');
      }
      if (ocultos) barra.removeAttribute('title');
      else barra.setAttribute('title', barra.getAttribute('data-dinheiro-titulo'));
    }
  }

  var ocultos = lerEscolha();
  aplicar(ocultos);

  document.addEventListener('click', function (ev) {
    var alvo = ev.target && ev.target.closest ? ev.target.closest('[data-ocultar-valores]') : null;
    if (!alvo) return;
    ev.preventDefault();
    ocultos = !ocultos;
    gravarEscolha(ocultos);
    aplicar(ocultos);
  });
})();
