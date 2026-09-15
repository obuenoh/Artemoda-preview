'use client';

import { useActionState } from 'react';
import { criarProdutoAcabado, type Resultado } from '../../acoes';
import { Campo, ErroGeral } from '@/components/Campo';

export function FormPeca() {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(criarProdutoAcabado, null);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-7 flex max-w-[640px] flex-col gap-6">
      <Campo id="nome" label="Nome da peça" erro={e.nome} ajuda='Ex.: "Camisa polo Colégio Alfa".'>
        <input id="nome" name="nome" className="campo" autoFocus />
      </Campo>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="tamanho" label="Tamanho" opcional>
          <input id="tamanho" name="tamanho" className="campo" placeholder="P, M, G, 10, 12…" />
        </Campo>
        <Campo id="cor" label="Cor" opcional>
          <input id="cor" name="cor" className="campo" />
        </Campo>

        <Campo
          id="sku"
          label="Código (SKU / código de barras)"
          erro={e.sku}
          ajuda="Bipe a etiqueta aqui, ou digite um código próprio."
        >
          <input id="sku" name="sku" className="campo font-mono" autoComplete="off" />
        </Campo>

        <Campo id="precoVenda" label="Preço de venda" erro={e.precoVenda} ajuda="Ex.: 45,00.">
          <input id="precoVenda" name="precoVenda" inputMode="decimal" className="campo" />
        </Campo>

        <Campo id="custo" label="Custo da peça" opcional ajuda="Se souber — ajuda a ver a margem depois.">
          <input id="custo" name="custo" inputMode="decimal" className="campo" />
        </Campo>

        <Campo id="estoqueMinimo" label="Avisar quando ficar abaixo de" opcional>
          <input id="estoqueMinimo" name="estoqueMinimo" inputMode="numeric" defaultValue={0} className="campo" />
        </Campo>
      </div>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Salvar peça'}
        </button>
        <a href="/vendas/estoque" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
