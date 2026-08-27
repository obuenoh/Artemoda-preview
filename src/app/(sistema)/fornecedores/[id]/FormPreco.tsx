'use client';

import { useActionState, useState } from 'react';
import { novaTabelaPreco, type Resultado } from '../../cadastros-acoes';
import { Campo, ErroGeral } from '@/components/Campo';

export function FormPreco({
  fornecedorId,
  tecidos,
}: {
  fornecedorId: string;
  tecidos: { id: string; nome: string; unidade: string }[];
}) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(novaTabelaPreco, null);
  const [tipo, setTipo] = useState<'materia_prima' | 'servico'>('materia_prima');
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-5 flex flex-col gap-5">
      <input type="hidden" name="fornecedorId" value={fornecedorId} />
      <input type="hidden" name="tipo" value={tipo} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTipo('materia_prima')}
          className={`bt ${tipo === 'materia_prima' ? 'bt-cheio' : 'bt-vazio'}`}
        >
          Preço de tecido
        </button>
        <button
          type="button"
          onClick={() => setTipo('servico')}
          className={`bt ${tipo === 'servico' ? 'bt-cheio' : 'bt-vazio'}`}
        >
          Preço de serviço
        </button>
      </div>

      {tipo === 'materia_prima' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo id="materiaPrimaId" label="Qual tecido" erro={e.materiaPrimaId}>
            <select id="materiaPrimaId" name="materiaPrimaId" className="campo" defaultValue="">
              <option value="" disabled>
                Escolha o tecido
              </option>
              {tecidos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo id="unidade" label="Cobra por">
            <select id="unidade" name="unidade" className="campo" defaultValue="metro">
              <option value="metro">Metro</option>
              <option value="kg">Quilo</option>
            </select>
          </Campo>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo id="tipoServico" label="Tipo de serviço">
            <select id="tipoServico" name="tipoServico" className="campo" defaultValue="bordado">
              <option value="bordado">Bordado</option>
              <option value="dtf">DTF</option>
              <option value="silk">Silk screen</option>
              <option value="outro">Outro</option>
            </select>
          </Campo>
          <Campo
            id="descricao"
            label="Descrição"
            erro={e.descricao}
            ajuda='Ex.: "bordado de logo pequeno no peito".'
          >
            <input id="descricao" name="descricao" className="campo" />
          </Campo>
        </div>
      )}

      <Campo
        id="preco"
        label={tipo === 'servico' ? 'Quanto cobra por peça' : 'Quanto cobra pela unidade'}
        erro={e.preco}
        ajuda="Só o número, como 18,40."
        className="max-w-[240px]"
      >
        <input id="preco" name="preco" inputMode="decimal" className="campo" />
      </Campo>

      <ErroGeral erro={estado?.erro} />

      <div>
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Registrar preço'}
        </button>
      </div>
    </form>
  );
}
