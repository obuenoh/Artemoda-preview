'use client';

import { useActionState } from 'react';
import { aplicarContagem, type Resultado } from '../../compras/acoes';
import { ErroGeral } from '@/components/Campo';
import { milParaNumero } from '@/lib/numeros';

type Linha = {
  id: string;
  nome: string;
  unidade: string;
  saldoMil: number;
  localizacao: string | null;
};

export function FormContagem({ linhas, abertura }: { linhas: Linha[]; abertura: boolean }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(aplicarContagem, null);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-7">
      <input type="hidden" name="abertura" value={abertura ? 'sim' : 'nao'} />

      <ul className="flex flex-col gap-3">
        {linhas.map((l, i) => (
          <li key={l.id} className="rounded border border-fio bg-cream-alt p-4">
            <input type="hidden" name="materiaPrimaId" value={l.id} />

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{l.nome}</p>
              <p className="text-sm fraco">
                {abertura
                  ? 'Sem histórico no sistema'
                  : `Sistema diz: ${milParaNumero(l.saldoMil)} ${l.unidade === 'kg' ? 'kg' : 'm'}`}
                {l.localizacao && ` · ${l.localizacao}`}
              </p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr] md:grid-cols-[160px_180px_1fr]">
              <div>
                <label htmlFor={`c${i}`} className="rotulo-campo">
                  Contei
                </label>
                <input
                  id={`c${i}`}
                  name="contagem"
                  inputMode="decimal"
                  placeholder={l.unidade === 'kg' ? 'kg' : 'metros'}
                  className="campo mt-1.5"
                />
                {e[`contagem${i}`] && (
                  <p role="alert" className="mt-1 text-sm">
                    <span className="mr-1 text-gold">↳</span>
                    {e[`contagem${i}`]}
                  </p>
                )}
              </div>

              {abertura && (
                <div>
                  <label htmlFor={`v${i}`} className="rotulo-campo">
                    Custou por unidade
                  </label>
                  <input
                    id={`v${i}`}
                    name="custoEstimado"
                    inputMode="decimal"
                    placeholder="18,40"
                    className="campo mt-1.5"
                  />
                  {e[`custo${i}`] && (
                    <p role="alert" className="mt-1 text-sm">
                      <span className="mr-1 text-gold">↳</span>
                      {e[`custo${i}`]}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor={`m${i}`} className="rotulo-campo">
                  Motivo da diferença
                </label>
                <input
                  id={`m${i}`}
                  name="motivo"
                  placeholder={abertura ? 'Estoque inicial' : 'Ex.: sobra de corte não lançada'}
                  defaultValue={abertura ? 'Estoque inicial' : ''}
                  className="campo mt-1.5"
                />
                {e[`motivo${i}`] && (
                  <p role="alert" className="mt-1 text-sm">
                    <span className="mr-1 text-gold">↳</span>
                    {e[`motivo${i}`]}
                  </p>
                )}
              </div>
            </div>
            {!abertura && <input type="hidden" name="custoEstimado" value="" />}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <ErroGeral erro={estado?.erro} />
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Aplicando…' : 'Aplicar contagem'}
        </button>
        <a href="/estoque" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
