'use client';

import { useActionState, useEffect, useState } from 'react';
import { Campo, ErroGeral } from '@/components/Campo';
import { Aviso } from '@/components/Ui';
import { semLimpar } from '@/components/enviar';
import { FRENTES, LISTA_FRENTES, type Frente } from '@/lib/frentes';
import { centavosParaReais } from '@/lib/numeros';
import { registrarProducao, enviarPecas, type Resultado } from './acoes';

export type DadosPeca = {
  id: string;
  nome: string;
  detalhe: string;
  sku: string;
  precoVendaCentavos: number;
  saldos: Record<Frente, number>;
  saldo: number;
  abaixoDoMinimo: boolean;
};

type Painel = null | 'producao' | 'envio';

/**
 * Uma peca com o saldo nas tres frentes e as duas acoes do dia a dia ali
 * mesmo: registrar o que ficou pronto (entra na Fabrica) e enviar.
 */
export function LinhaPeca({ p }: { p: DadosPeca }) {
  const [painel, setPainel] = useState<Painel>(null);

  return (
    <>
      <tr>
        <td className="td">
          <p className="font-semibold">{p.nome}</p>
          {p.detalhe && <span className="miudo">{p.detalhe}</span>}
          <span className="miudo font-mono">{p.sku}</span>
        </td>
        <td className="td whitespace-nowrap">{centavosParaReais(p.precoVendaCentavos)}</td>
        {LISTA_FRENTES.map((f) => (
          <td key={f} className={`td text-center tabular-nums ${p.saldos[f] === 0 ? 'fraco' : 'font-semibold'}`}>
            {p.saldos[f]}
          </td>
        ))}
        <td className={`td text-center font-bold tabular-nums ${p.abaixoDoMinimo ? 'text-alerta' : ''}`}>{p.saldo}</td>
        <td className="td">
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setPainel(painel === 'producao' ? null : 'producao')} className="bt bt-vazio compacto py-2">
              + Produção
            </button>
            <button type="button" onClick={() => setPainel(painel === 'envio' ? null : 'envio')} className="bt bt-vazio compacto py-2">
              Enviar
            </button>
          </div>
        </td>
      </tr>
      {painel && (
        <tr>
          <td colSpan={7} className="border-b border-fio bg-cream-alt px-4 py-4">
            {painel === 'producao' ? (
              <FormProducao id={p.id} fechar={() => setPainel(null)} />
            ) : (
              <FormEnvio p={p} fechar={() => setPainel(null)} />
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function FormProducao({ id, fechar }: { id: string; fechar: () => void }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(registrarProducao, null);
  const [quantidade, setQuantidade] = useState('');
  useEffect(() => {
    if (estado?.ok) setQuantidade('');
  }, [estado]);

  return (
    <form onSubmit={semLimpar(acao)} className="flex flex-wrap items-end gap-4">
      <input type="hidden" name="id" value={id} />
      <Campo id={`prod-${id}`} label="Quantas ficaram prontas" erro={estado?.campos?.quantidade} ajuda="Entram no estoque da Fábrica." className="w-[220px]">
        <input id={`prod-${id}`} name="quantidade" inputMode="numeric" className="campo" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
      </Campo>
      <button type="submit" disabled={pendente} className="bt bt-cheio">
        {pendente ? 'Lançando…' : 'Lançar produção'}
      </button>
      <button type="button" onClick={fechar} className="bt bt-vazio">
        Voltar
      </button>
      <div className="basis-full">
        {estado?.ok && <Aviso>{estado.ok}</Aviso>}
        {!estado?.campos && <ErroGeral erro={estado?.erro} />}
      </div>
    </form>
  );
}

function FormEnvio({ p, fechar }: { p: DadosPeca; fechar: () => void }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(enviarPecas, null);
  // Quase sempre sai da Fabrica; se ela nao tem, sugere a frente que tem.
  const origemSugerida = LISTA_FRENTES.find((f) => f === 'fabrica' && p.saldos.fabrica > 0) ?? LISTA_FRENTES.find((f) => p.saldos[f] > 0) ?? 'fabrica';
  const [de, setDe] = useState<Frente>(origemSugerida);
  const [para, setPara] = useState<Frente>(origemSugerida === 'loja' ? 'fabrica' : 'loja');
  const [quantidade, setQuantidade] = useState('');
  const e = estado?.campos ?? {};
  useEffect(() => {
    if (estado?.ok) setQuantidade('');
  }, [estado]);

  return (
    <form onSubmit={semLimpar(acao)} className="flex flex-wrap items-end gap-4">
      <input type="hidden" name="id" value={p.id} />
      <Campo id={`de-${p.id}`} label="Sai de" erro={e.de} className="w-[180px]">
        <select id={`de-${p.id}`} name="de" className="campo" value={de} onChange={(ev) => setDe(ev.target.value as Frente)}>
          {LISTA_FRENTES.map((f) => (
            <option key={f} value={f}>
              {FRENTES[f]} ({p.saldos[f]})
            </option>
          ))}
        </select>
      </Campo>
      <Campo id={`para-${p.id}`} label="Vai para" erro={e.para} className="w-[180px]">
        <select id={`para-${p.id}`} name="para" className="campo" value={para} onChange={(ev) => setPara(ev.target.value as Frente)}>
          {LISTA_FRENTES.map((f) => (
            <option key={f} value={f}>
              {FRENTES[f]}
            </option>
          ))}
        </select>
      </Campo>
      <Campo id={`qtd-${p.id}`} label="Quantas" erro={e.quantidade} className="w-[140px]">
        <input id={`qtd-${p.id}`} name="quantidade" inputMode="numeric" className="campo" value={quantidade} onChange={(ev) => setQuantidade(ev.target.value)} />
      </Campo>
      <button type="submit" disabled={pendente} className="bt bt-cheio">
        {pendente ? 'Enviando…' : 'Enviar peças'}
      </button>
      <button type="button" onClick={fechar} className="bt bt-vazio">
        Voltar
      </button>
      <div className="basis-full">
        {estado?.ok && <Aviso>{estado.ok}</Aviso>}
        {!estado?.campos && <ErroGeral erro={estado?.erro} />}
      </div>
    </form>
  );
}
