'use client';

import { useActionState, useState } from 'react';
import { registrarCompra, type Resultado } from '../acoes';
import { Campo, ErroGeral } from '@/components/Campo';
import { prazosDaCondicao, rotuloCondicao } from '@/lib/financeiro-listas';
import { dataDoCampo, dataCurtaBR, somarDias } from '@/lib/numeros';
import { semLimpar } from '@/components/enviar';

type Opcao = { id: string; nome: string; unidade?: string };
type Fornecedor = Opcao & { condicao: string };

export function FormCompra({
  fornecedores,
  tecidos,
  tecidoInicial,
  hoje,
}: {
  fornecedores: Fornecedor[];
  tecidos: Opcao[];
  tecidoInicial: string;
  hoje: string;
}) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(registrarCompra, null);
  const [linhas, setLinhas] = useState<number[]>([0]);
  const [fornecedorId, setFornecedorId] = useState('');
  const [data, setData] = useState(hoje);
  const [pagamento, setPagamento] = useState('');
  const e = estado?.campos ?? {};

  // O jeito de pagar ja vem da condicao do fornecedor; ela so muda se foi diferente.
  const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
  const condicaoPrazo = fornecedor && fornecedor.condicao !== 'a_vista' ? fornecedor.condicao : '30';
  const base = dataDoCampo(data);
  const vencimentos = base ? prazosDaCondicao(condicaoPrazo).map((d) => dataCurtaBR(somarDias(base, d))) : [];

  function escolherFornecedor(id: string) {
    setFornecedorId(id);
    const f = fornecedores.find((x) => x.id === id);
    if (f) setPagamento(f.condicao === 'a_vista' ? 'na_hora' : 'a_prazo');
  }

  return (
    <form onSubmit={semLimpar(acao)} className="mt-7 flex flex-col gap-6">
      <div className="grid max-w-[640px] gap-6 sm:grid-cols-2">
        <Campo id="fornecedorId" label="Comprei de" erro={e.fornecedorId}>
          <select
            id="fornecedorId"
            name="fornecedorId"
            className="campo"
            value={fornecedorId}
            onChange={(ev) => escolherFornecedor(ev.target.value)}
          >
            <option value="">
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
          <input
            id="data"
            name="data"
            type="date"
            value={data}
            onChange={(ev) => setData(ev.target.value)}
            className="campo"
          />
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

      <fieldset className="max-w-[640px]">
        <legend className="rotulo-campo">Como vai pagar</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { valor: 'na_hora', rotulo: 'Já paguei' },
            { valor: 'a_prazo', rotulo: 'Vou pagar depois' },
          ].map((o) => (
            <label
              key={o.valor}
              className={`bt compacto cursor-pointer py-2 ${pagamento === o.valor ? 'bt-cheio' : 'bt-vazio'}`}
            >
              <input
                type="radio"
                name="pagamento"
                value={o.valor}
                checked={pagamento === o.valor}
                onChange={() => setPagamento(o.valor)}
                className="sr-only"
              />
              {o.rotulo}
            </label>
          ))}
        </div>
        {pagamento === 'na_hora' && (
          <p className="mt-2 text-sm fraco">O total, com frete, sai do caixa no dia da compra.</p>
        )}
        {pagamento === 'a_prazo' && vencimentos.length > 0 && (
          <p className="mt-2 text-sm fraco">
            {vencimentos.length === 1
              ? `Vai para Contas a pagar com vencimento em ${vencimentos[0]}`
              : `Vai para Contas a pagar em ${vencimentos.length} parcelas: ${vencimentos.join(' e ')}`}
            {fornecedor && fornecedor.condicao !== 'a_vista'
              ? `, pela condição de ${rotuloCondicao(fornecedor.condicao)} do fornecedor.`
              : ', em 30 dias, porque o fornecedor está cadastrado à vista.'}
          </p>
        )}
        {e.pagamento && (
          <p role="alert" className="mt-1.5 text-sm">
            <span aria-hidden="true" className="mr-1.5 text-gold">↳</span>
            {e.pagamento}
          </p>
        )}
      </fieldset>

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
