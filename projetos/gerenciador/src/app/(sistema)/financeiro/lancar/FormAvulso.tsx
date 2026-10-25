'use client';

import { useActionState, useState } from 'react';
import { Campo, ErroGeral } from '@/components/Campo';
import { CATEGORIAS_ENTRADA, CATEGORIAS_SAIDA } from '@/lib/financeiro-listas';
import { lancarAvulso, type Resultado } from '../acoes';
import { semLimpar } from '@/components/enviar';

export function FormAvulso({ tipoInicial, hoje }: { tipoInicial: 'entrada' | 'saida'; hoje: string }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(lancarAvulso, null);
  const [tipo, setTipo] = useState(tipoInicial);
  const e = estado?.campos ?? {};
  const categorias = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;

  return (
    <form onSubmit={semLimpar(acao)} className="mt-7 flex max-w-[640px] flex-col gap-6">
      <fieldset>
        <legend className="rotulo-campo">O dinheiro</legend>
        <div className="mt-2 flex gap-2">
          {(['entrada', 'saida'] as const).map((t) => (
            <label key={t} className={`bt compacto cursor-pointer py-2 ${tipo === t ? 'bt-cheio' : 'bt-vazio'}`}>
              <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => setTipo(t)} className="sr-only" />
              {t === 'entrada' ? 'Entrou' : 'Saiu'}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="categoria" label={tipo === 'entrada' ? 'De onde veio' : 'Para onde foi'} erro={e.categoria}>
          <select key={tipo} id="categoria" name="categoria" className="campo" defaultValue="">
            <option value="">
              Escolha
            </option>
            {Object.entries(categorias).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="valor" label="Valor" erro={e.valor}>
          <input id="valor" name="valor" inputMode="decimal" placeholder="0,00" className="campo" />
        </Campo>
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_200px]">
        <Campo id="descricao" label="O que foi" erro={e.descricao}>
          <input
            id="descricao"
            name="descricao"
            className="campo"
            placeholder={tipo === 'entrada' ? 'Ex.: Sinal do pedido Metalúrgica Bertoni' : 'Ex.: Linha e agulha no balcão'}
          />
        </Campo>
        <Campo id="data" label="Dia" erro={e.data}>
          <input id="data" name="data" type="date" defaultValue={hoje} max={hoje} className="campo" />
        </Campo>
      </div>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Lançando…' : 'Lançar no caixa'}
        </button>
        <a href="/financeiro" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
