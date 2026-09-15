// Aplicado em toda pagina do prototipo. Os formularios que nao ganharam
// logica propria (Vendas e Nota Fiscal tem a delas, em vendas.js e
// notafiscal.js) ficam inertes de proposito — sem servidor, gravar seria
// fingir. Em vez de nao fazer nada visivel no clique, avisa com clareza.
// O botao "Sair" e excecao: volta para a pagina de entrada, porque "nao
// fazer nada" ali parece a pagina estar travada.
(function () {
  'use strict';

  var toastAtivo = null;
  function toast(msg) {
    if (toastAtivo) toastAtivo.remove();
    var el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText =
      'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
      'background:#15263D;color:#F5F2EC;padding:11px 20px;border-radius:3px;' +
      'font-size:13px;font-family:Montserrat,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25);' +
      'border:1px solid #B58B57;z-index:9999;max-width:90vw;text-align:center;';
    document.body.appendChild(el);
    toastAtivo = el;
    setTimeout(function () {
      if (el === toastAtivo) { el.remove(); toastAtivo = null; }
    }, 3200);
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    e.preventDefault();

    var botao = form.querySelector('button');
    var rotulo = botao ? botao.textContent.trim() : '';

    if (rotulo === 'Sair') {
      window.location.href = '../index.html';
      return;
    }

    toast('Prévia — em produção isso gravaria de verdade.');
  }, true);
})();
