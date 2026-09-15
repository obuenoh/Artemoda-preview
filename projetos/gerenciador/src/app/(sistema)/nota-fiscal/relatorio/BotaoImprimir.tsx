'use client';

export function BotaoImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="bt bt-vazio compacto print:hidden">
      Imprimir / salvar PDF
    </button>
  );
}
