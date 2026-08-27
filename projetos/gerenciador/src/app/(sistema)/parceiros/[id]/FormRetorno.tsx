'use client';

import { useActionState, useState } from 'react';
import { registrarRetorno, type Resultado } from '../acoes';
import { Campo, ErroGeral } from '@/components/Campo';

export function FormRetorno({
  remessaId,
  restam,
  hoje,
}: {
  remessaId: string;
  restam: number;
  hoje: string;
}) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(registrarRetorno, null);
  const [defeito, setDefeito] = useState(0);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-4 flex flex-col gap-5">
      <input type="hidden" name="remessaId" value={remessaId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id="quantidadeOk"
          label="Voltaram boas"
          erro={e.quantidadeOk}
          ajuda={`Faltam ${restam} peça(s) desta remessa.`}
        >
          <input
            id="quantidadeOk"
            name="quantidadeOk"
            inputMode="numeric"
            defaultValue={restam}
            className="campo"
          />
        </Campo>

        <Campo id="quantidadeDefeito" label="Voltaram com defeito" erro={e.quantidadeDefeito}>
          <input
            id="quantidadeDefeito"
            name="quantidadeDefeito"
            inputMode="numeric"
            defaultValue={0}
            onChange={(ev) => setDefeito(Number(ev.target.value) || 0)}
            className="campo"
          />
        </Campo>

        <Campo id="dataRetorno" label="Dia em que voltaram" erro={e.dataRetorno}>
          <input
            id="dataRetorno"
            name="dataRetorno"
            type="date"
            defaultValue={hoje}
            className="campo"
          />
        </Campo>
      </div>

      {defeito > 0 && (
        <Campo
          id="motivoDefeito"
          label="O que veio errado"
          erro={e.motivoDefeito}
          ajuda="É o registro que permite cobrar do parceiro depois."
        >
          <input id="motivoDefeito" name="motivoDefeito" className="campo" />
        </Campo>
      )}

      <Campo id="observacoes" label="Observação" opcional>
        <input id="observacoes" name="observacoes" className="campo" />
      </Campo>

      <ErroGeral erro={estado?.erro} />

      <div>
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Registrar volta das peças'}
        </button>
      </div>
    </form>
  );
}
