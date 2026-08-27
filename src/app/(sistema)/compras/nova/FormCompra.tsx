'use client';

import { useActionState, useState } from 'react';
import { registrarCompra, type Resultado } from '../acoes';
import { Campo, ErroGeral } from '@/components/Campo';

type Opcao = { id: string; nome: string; unidade?: string };

export function FormCompra({
  fornecedores,
  tecidos,
  tecidoInicial,
  hoje,
}: {
  fornecedores: Opcao[];
  tecidos: Opcao[];
  tecidoInicial: string;
  hoje: string;
}) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(registrarCompra, null);
  const [linhas, setLinhas] = useState<number[]>([0]);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-7 flex flex-col gap-6">
      <div className="grid max-w-[640px] gap-6 sm:grid-cols-2">
        <Campo id="fornecedorId" label="Comprei de" erro={e.fornecedorId}>
          <select id="fornecedorId" name="fornecedorId" className="campo" defaultValue="">
            <option value="" disabled>
              Escolha o fornecedor
            </option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="data" label="Dia da compra" erro={e.data}>
          <input id="data" name="data" type="date" defaultValue={hoje} className="campo" />
        </Campo>

        <Campo id="numeroNf" label="Número da nota" opcional>
          <input id="numeroNf" name="numeroNf" className="campo" />
        </Campo>
      </div>

      <section>
        <h2 className="text-rotulo font-bold uppercase text-gold">O que veio</h2>

        <ul className="mt-3 flex flex-col gap-3">
          {linhas.map((n, i) => (
            <li key={n} className="rounded border border-fio bg-cream-alt p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_150px_150px]">
                <div>
                  <label htmlFor={`t${n}`} className="rotulo-campo">
                    Tecido
                  </label>
                  <select
                    id={`t${n}`}
                    name="itemMateriaPrimaId"
                    className="campo mt-1.5"
                    defaultValue={i === 0 ? tecidoInicial : ''}
                  >
                    <option value="">Escolha o tecido</option>
                    {tecidos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`q${n}`} className="rotulo-campo">
                    Quanto entrou
                  </label>
                  <input
                    id={`q${n}`}
                    name="itemQuantidade"
                    inputMode="decimal"
                    placeholder="50"
                    className="campo mt-1.5"
                  />
                </div>

                <div>
                  <label htmlFor={`v${n}`} className="rotulo-campo">
                    Preço da unidade
                  </label>
                  <input
                    id={`v${n}`}
                    name="itemValorUnitario"
                    inputMode="decimal"
                    placeholder="18,40"
                    className="campo mt-1.5"
                  />
                </div>
              </div>

              {e[`item${i}`] && (
                <p role="alert" className="mt-2 text-sm">
                  <span className="mr-1 text-gold">↳</span>
                  {e[`item${i}`]}
                </p>
              )}

              {linhas.length > 1 && (
                <button
                  type="button"
                  onClick={() => setLinhas((l) => l.filter((x) => x !== n))}
                  className="compacto mt-3 text-rotulo font-bold uppercase text-alerta"
                >
                  Tirar esta linha
                </button>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setLinhas((l) => [...l, (l.at(-1) ?? 0) + 1])}
          className="bt bt-vazio mt-3"
        >
          + Adicionar outro tecido
        </button>
      </section>

      <div className="grid max-w-[640px] gap-6 sm:grid-cols-2">
        <Campo id="frete" label="Frete" opcional ajuda="Será dividido entre os itens.">
          <input id="frete" name="frete" inputMode="decimal" placeholder="0,00" className="campo" />
        </Campo>
        <Campo id="outrosCustos" label="Outros custos" opcional>
          <input
            id="outrosCustos"
            name="outrosCustos"
            inputMode="decimal"
            placeholder="0,00"
            className="campo"
          />
        </Campo>
      </div>

      <Campo id="observacoes" label="Observação" opcional className="max-w-[640px]">
        <textarea id="observacoes" name="observacoes" rows={2} className="campo" />
      </Campo>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Registrar compra'}
        </button>
        <a href="/compras" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
