'use client';

import { useActionState, useState } from 'react';
import { Campo, ErroGeral } from '@/components/Campo';
import { CATEGORIAS_SAIDA, dividirEmParcelas } from '@/lib/financeiro-listas';
import { reaisParaCentavos, centavosParaReais } from '@/lib/numeros';
import { criarContaPagar, criarContaReceber, type Resultado } from './acoes';
import { semLimpar } from '@/components/enviar';

type Opcao = { id: string; nome: string };

/**
 * Conta nova a pagar ou a receber. O valor e sempre o TOTAL: se for
 * parcelado, o sistema divide e marca um vencimento por mes.
 */
export function FormConta({
  tipo,
  pessoas,
  hoje,
}: {
  tipo: 'pagar' | 'receber';
  /** Fornecedores (a pagar) ou clientes (a receber). */
  pessoas: Opcao[];
  hoje: string;
}) {
  const pagar = tipo === 'pagar';
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(
    pagar ? criarContaPagar : criarContaReceber,
    null,
  );
  const [modo, setModo] = useState('unica');
  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState('2');
  const e = estado?.campos ?? {};

  const totalCentavos = reaisParaCentavos(valor);
  const n = Number(parcelas);
  const previa =
    totalCentavos && totalCentavos > 0
      ? modo === 'parcelada' && Number.isInteger(n) && n >= 2 && n <= 24
        ? (() => {
            const valores = dividirEmParcelas(totalCentavos, n);
            return valores[0] === valores[n - 1]
              ? `${n} parcelas de ${centavosParaReais(valores[0])}, uma por mês.`
              : `${n} parcelas: a primeira de ${centavosParaReais(valores[0])} e as outras de ${centavosParaReais(valores[n - 1])}, uma por mês.`;
          })()
        : modo === 'fixa'
          ? `${centavosParaReais(totalCentavos)} todo mês, pelos próximos 12 meses.`
          : null
      : null;

  return (
    <form onSubmit={semLimpar(acao)} className="mt-7 flex max-w-[640px] flex-col gap-6">
      <Campo id="descricao" label={pagar ? 'O que é esta conta' : 'O que é'} erro={e.descricao}>
        <input
          id="descricao"
          name="descricao"
          className="campo"
          placeholder={pagar ? 'Ex.: Aluguel do galpão' : 'Ex.: Restante do pedido Colégio Alfa'}
        />
      </Campo>

      <div className="grid gap-6 sm:grid-cols-2">
        {pagar && (
          <Campo id="categoria" label="Tipo" erro={e.categoria}>
            <select id="categoria" name="categoria" className="campo" defaultValue="">
              <option value="">
                Escolha o tipo
              </option>
              {Object.entries(CATEGORIAS_SAIDA)
                .filter(([valor]) => valor !== 'retirada')
                .map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
            </select>
          </Campo>
        )}

        <Campo
          id={pagar ? 'fornecedorId' : 'clienteId'}
          label={pagar ? 'Para quem' : 'Quem paga'}
          opcional
          erro={pagar ? e.fornecedorId : e.clienteId}
        >
          <select id={pagar ? 'fornecedorId' : 'clienteId'} name={pagar ? 'fornecedorId' : 'clienteId'} className="campo" defaultValue="">
            <option value="">{pagar ? 'Sem fornecedor cadastrado' : 'Sem cliente cadastrado'}</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="valor" label={modo === 'fixa' ? 'Valor por mês' : 'Valor total'} erro={e.valor}>
          <input
            id="valor"
            name="valor"
            inputMode="decimal"
            placeholder="0,00"
            className="campo"
            value={valor}
            onChange={(ev) => setValor(ev.target.value)}
          />
        </Campo>
        <Campo id="vencimento" label={modo === 'unica' ? 'Vence em' : 'Primeiro vencimento'} erro={e.vencimento}>
          <input id="vencimento" name="vencimento" type="date" className="campo" />
        </Campo>
      </div>

      <fieldset>
        <legend className="rotulo-campo">Como é o pagamento</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { valor: 'unica', rotulo: 'Uma vez só' },
            { valor: 'parcelada', rotulo: 'Parcelado' },
            ...(pagar ? [{ valor: 'fixa', rotulo: 'Todo mês (conta fixa)' }] : []),
          ].map((o) => (
            <label
              key={o.valor}
              className={`bt compacto cursor-pointer py-2 ${modo === o.valor ? 'bt-cheio' : 'bt-vazio'}`}
            >
              <input
                type="radio"
                name="modo"
                value={o.valor}
                checked={modo === o.valor}
                onChange={() => setModo(o.valor)}
                className="sr-only"
              />
              {o.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      {modo === 'parcelada' && (
        <Campo id="parcelas" label="Em quantas vezes" erro={e.parcelas} className="max-w-[200px]">
          <input
            id="parcelas"
            name="parcelas"
            type="number"
            min={2}
            max={24}
            className="campo"
            value={parcelas}
            onChange={(ev) => setParcelas(ev.target.value)}
          />
        </Campo>
      )}

      {previa && <p className="text-sm fraco">{previa}</p>}

      <Campo id="observacoes" label="Observação" opcional>
        <textarea id="observacoes" name="observacoes" rows={2} className="campo" />
      </Campo>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Salvar conta'}
        </button>
        <a href={pagar ? '/financeiro/pagar' : '/financeiro/receber'} className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
