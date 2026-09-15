'use client';

import { useActionState } from 'react';
import { registrarEntradaProducao, type Resultado } from '../../../acoes';
import { Campo, ErroGeral } from '@/components/Campo';

export function FormEntrada({ produtoAcabadoId }: { produtoAcabadoId: string }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(registrarEntradaProducao, null);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-6 flex max-w-[420px] flex-col gap-6">
      <input type="hidden" name="produtoAcabadoId" value={produtoAcabadoId} />

      <Campo id="quantidade" label="Quantas peças chegaram" erro={e.quantidade}>
        <input id="quantidade" name="quantidade" inputMode="numeric" autoFocus className="campo" />
      </Campo>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Registrar entrada'}
        </button>
        <a href="/vendas/estoque" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
