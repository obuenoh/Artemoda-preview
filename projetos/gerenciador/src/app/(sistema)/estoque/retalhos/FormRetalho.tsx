'use client';

import { useActionState, useEffect, useState } from 'react';
import { Campo, ErroGeral } from '@/components/Campo';
import { Aviso } from '@/components/Ui';
import { semLimpar } from '@/components/enviar';
import { useValoresOcultos } from '@/components/Valores';
import {
  centavosNumero,
  centavosParaReais,
  metrosPorKgMil,
  milParaNumero,
  numeroParaMil,
  reaisParaCentavos,
  valorDe,
} from '@/lib/numeros';
import { anotarRetalho, type Resultado } from '../acoes';

export type TecidoBase = {
  id: string;
  nome: string;
  cor: string | null;
  unidade: string;
  larguraMil: number | null;
  gramaturaGm2: number | null;
  custoMedioCentavos: number;
};

/**
 * Quanto vale o kg do retalho, a partir do tecido de origem. Tecido em kg:
 * o proprio custo medio. Tecido em metro: converte pela largura e gramatura
 * do cadastro. Sem isso, nao ha como saber — ela informa um palpite.
 */
function sugestao(t: TecidoBase | undefined): { centavos: number | null; explicacao: string } {
  if (!t) return { centavos: null, explicacao: '' };
  if (t.custoMedioCentavos <= 0) {
    return { centavos: null, explicacao: 'Esse tecido ainda não tem custo no app. Informe quanto acha que vale o kg.' };
  }
  if (t.unidade === 'kg') {
    return { centavos: t.custoMedioCentavos, explicacao: 'Pelo custo médio do kg desse tecido.' };
  }
  const mpk = metrosPorKgMil(t.larguraMil, t.gramaturaGm2);
  if (!mpk) {
    return {
      centavos: null,
      explicacao:
        'Esse tecido é comprado em metro e o cadastro não tem largura e gramatura, então não dá para converter para kg. Informe quanto acha que vale o kg.',
    };
  }
  return {
    centavos: Math.round((t.custoMedioCentavos * mpk) / 1000),
    explicacao: `1 kg dessa malha dá cerca de ${milParaNumero(mpk, 1)} m (largura ${milParaNumero(t.larguraMil ?? 0)} m, ${t.gramaturaGm2} g/m²). ${milParaNumero(mpk, 1)} m × ${centavosParaReais(t.custoMedioCentavos)} o metro.`,
  };
}

export function FormRetalho({ tecidos }: { tecidos: TecidoBase[] }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(anotarRetalho, null);
  const ocultos = useValoresOcultos();
  const [tecidoId, setTecidoId] = useState('');
  const [cor, setCor] = useState('');
  const [peso, setPeso] = useState('');
  const [valorKg, setValorKg] = useState('');
  const e = estado?.campos ?? {};

  const tecido = tecidos.find((t) => t.id === tecidoId);
  const sug = sugestao(tecido);

  function escolher(id: string) {
    setTecidoId(id);
    const t = tecidos.find((x) => x.id === id);
    setCor(t?.cor ?? '');
    const s = sugestao(t);
    setValorKg(s.centavos ? centavosNumero(s.centavos) : '');
  }

  // Anotou: limpa para o proximo retalho da pilha.
  useEffect(() => {
    if (estado?.ok) {
      setTecidoId('');
      setCor('');
      setPeso('');
      setValorKg('');
    }
  }, [estado]);

  const pesoMil = numeroParaMil(peso);
  const valor = reaisParaCentavos(valorKg);
  const total = pesoMil && valor ? valorDe(pesoMil, valor) : null;

  return (
    <form onSubmit={semLimpar(acao)} className="rounded border border-fio bg-cream-alt p-5">
      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_120px_150px]">
        <Campo id="tecidoId" label="De qual tecido" erro={e.tecidoId}>
          <select id="tecidoId" name="tecidoId" className="campo" value={tecidoId} onChange={(ev) => escolher(ev.target.value)}>
            <option value="">Escolha o tecido</option>
            {tecidos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
                {t.cor ? ` · ${t.cor}` : ''}
              </option>
            ))}
            <option value="outro">Outro tecido (não cadastrado)</option>
          </select>
        </Campo>
        <Campo id="cor" label="Cor" erro={e.cor}>
          <input id="cor" name="cor" className="campo" value={cor} onChange={(ev) => setCor(ev.target.value)} placeholder="Azul marinho" />
        </Campo>
        <Campo id="peso" label="Quantos kg" erro={e.peso}>
          <input id="peso" name="peso" inputMode="decimal" className="campo" value={peso} onChange={(ev) => setPeso(ev.target.value)} placeholder="3,5" />
        </Campo>
        <Campo id="valorKg" label="Vale o kg" erro={e.valorKg}>
          <input id="valorKg" name="valorKg" inputMode="decimal" className="campo" value={valorKg} onChange={(ev) => setValorKg(ev.target.value)} placeholder="0,00" />
        </Campo>
      </div>

      {tecidoId === 'outro' && (
        <Campo id="nomeOutro" label="Que tecido é" erro={e.nomeOutro} className="mt-5 max-w-[360px]">
          <input id="nomeOutro" name="nomeOutro" className="campo" placeholder="Ex.: Helanca" />
        </Campo>
      )}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[60ch] text-sm fraco">
          {sug.explicacao && <p>{sug.explicacao} Mude se souber um valor melhor.</p>}
          {total !== null && (
            <p className="mt-1 font-semibold text-ink">
              Este retalho: {ocultos ? 'R$ •••••' : centavosParaReais(total)} parado.
            </p>
          )}
        </div>
        <div className="flex items-end gap-3">
          <Campo id="localizacao" label="Onde está" opcional className="w-[200px]">
            <input id="localizacao" name="localizacao" className="campo" placeholder="Ex.: caixa 2" />
          </Campo>
          <button type="submit" disabled={pendente} className="bt bt-cheio">
            {pendente ? 'Anotando…' : 'Anotar retalho'}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <ErroGeral erro={estado?.erro} />
        {estado?.ok && <Aviso>{estado.ok} Pode anotar o próximo.</Aviso>}
      </div>
    </form>
  );
}
