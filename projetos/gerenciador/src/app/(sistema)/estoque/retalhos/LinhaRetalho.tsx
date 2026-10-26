'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Campo, ErroGeral } from '@/components/Campo';
import { semLimpar } from '@/components/enviar';
import { Dinheiro } from '@/components/Valores';
import { registrarSaida, type Resultado } from '../acoes';

export type DadosRetalho = {
  id: string;
  nome: string;
  cor: string | null;
  quantidade: string;
  /** Valor do kg: passa pelo <Dinheiro> para respeitar o "ocultar valores". */
  custoKgCentavos: number;
  localizacao: string | null;
  diasParado: number | null;
  valorCentavos: number;
};

/** Uma linha de retalho com a saida ali mesmo: usou, vendeu, doou ou jogou fora. */
export function LinhaRetalho({ r }: { r: DadosRetalho }) {
  const [aberto, setAberto] = useState(false);
  const longo = (r.diasParado ?? 0) > 180;

  return (
    <li className="px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="min-w-[200px] flex-1">
          <p className="font-semibold">
            {r.nome} {r.cor && <span className="fraco">· {r.cor}</span>}
          </p>
          <p className="miudo mt-0.5">
            <Dinheiro centavos={r.custoKgCentavos} /> o kg
            {r.localizacao && ` · ${r.localizacao}`}
          </p>
        </div>
        <p className="w-[90px] text-right font-semibold tabular-nums">{r.quantidade}</p>
        <p className={`w-[110px] text-right text-sm ${longo ? 'font-semibold text-alerta' : 'fraco'}`}>
          {r.diasParado === null ? '—' : `parado há ${r.diasParado} dias`}
        </p>
        <Dinheiro centavos={r.valorCentavos} className="inline-block w-[110px] text-right font-bold tabular-nums" />
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setAberto((v) => !v)} className="bt bt-vazio compacto py-2">
            Saiu
          </button>
          <Link href={`/estoque/${r.id}`} className="compacto text-rotulo font-bold uppercase text-gold">
            Extrato →
          </Link>
        </div>
      </div>
      {aberto && <FormSaida id={r.id} quantidade={r.quantidade} fechar={() => setAberto(false)} />}
    </li>
  );
}

function FormSaida({ id, quantidade, fechar }: { id: string; quantidade: string; fechar: () => void }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(registrarSaida, null);
  const [destino, setDestino] = useState('producao');
  const e = estado?.campos ?? {};

  return (
    <form onSubmit={semLimpar(acao)} className="mt-3 rounded border border-fio bg-cream p-4">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <Campo id={`q-${id}`} label="Quanto saiu (kg)" erro={e.quantidade} ajuda={`Tem ${quantidade}.`}>
          <input id={`q-${id}`} name="quantidade" inputMode="decimal" className="campo" />
        </Campo>
        <fieldset>
          <legend className="rotulo-campo">Para onde foi</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { valor: 'producao', rotulo: 'Usei na produção' },
              { valor: 'fora', rotulo: 'Vendi, doei ou joguei fora' },
            ].map((o) => (
              <label key={o.valor} className={`bt compacto cursor-pointer py-2 ${destino === o.valor ? 'bt-cheio' : 'bt-vazio'}`}>
                <input type="radio" name="destino" value={o.valor} checked={destino === o.valor} onChange={() => setDestino(o.valor)} className="sr-only" />
                {o.rotulo}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <Campo id={`m-${id}`} label={destino === 'fora' ? 'O que aconteceu' : 'Para que peça'} opcional={destino !== 'fora'} erro={e.motivo} className="mt-4 max-w-[520px]">
        <input
          id={`m-${id}`}
          name="motivo"
          className="campo"
          placeholder={destino === 'fora' ? 'Ex.: vendi para a costureira do bairro' : 'Ex.: golas das polos Colégio Alfa'}
        />
      </Campo>
      <div className="mt-4">
        <ErroGeral erro={estado?.erro} />
      </div>
      <div className="mt-3 flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Registrar saída'}
        </button>
        <button type="button" onClick={fechar} className="bt bt-vazio">
          Voltar
        </button>
      </div>
    </form>
  );
}
