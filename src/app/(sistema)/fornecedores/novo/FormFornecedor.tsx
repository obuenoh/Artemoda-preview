'use client';

import { useActionState } from 'react';
import { criarFornecedor, type Resultado } from '../../cadastros-acoes';
import { Campo, ErroGeral } from '@/components/Campo';

const tipos = [
  { v: 'tecido', r: 'Vende tecido' },
  { v: 'aviamento', r: 'Vende aviamento' },
  { v: 'bordado', r: 'Faz bordado' },
  { v: 'dtf', r: 'Faz DTF' },
  { v: 'silk', r: 'Faz silk screen' },
  { v: 'servico', r: 'Outro serviço' },
  { v: 'outro', r: 'Outro' },
];

export function FormFornecedor() {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(criarFornecedor, null);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-7 flex max-w-[640px] flex-col gap-6">
      <Campo id="nome" label="Nome" erro={e.nome}>
        <input id="nome" name="nome" className="campo" autoFocus />
      </Campo>

      <fieldset>
        <legend className="rotulo-campo">O que ele faz ou vende</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {tipos.map((t) => (
            <label
              key={t.v}
              className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-sm border border-fio px-3 py-2 transition-colors hover:border-gold"
            >
              <input type="checkbox" name="tipos" value={t.v} className="h-4 w-4 accent-[#B58B57]" />
              <span className="text-[0.9375rem]">{t.r}</span>
            </label>
          ))}
        </div>
        {e.tipos && (
          <p role="alert" className="mt-1.5 text-sm">
            <span aria-hidden="true" className="mr-1.5 text-gold">↳</span>
            {e.tipos}
          </p>
        )}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="whatsapp" label="WhatsApp" opcional>
          <input id="whatsapp" name="whatsapp" className="campo" placeholder="(11) 90000-0000" />
        </Campo>
        <Campo id="contato" label="Pessoa de contato" opcional>
          <input id="contato" name="contato" className="campo" />
        </Campo>
        <Campo id="cnpj" label="CNPJ" opcional>
          <input id="cnpj" name="cnpj" className="campo" />
        </Campo>
        <Campo id="condicaoPagamento" label="Como você paga">
          <select id="condicaoPagamento" name="condicaoPagamento" className="campo" defaultValue="a_vista">
            <option value="a_vista">À vista</option>
            <option value="30">30 dias</option>
            <option value="30_60">30/60 dias</option>
          </select>
        </Campo>
        <Campo
          id="prazoMedioDias"
          label="Costuma entregar em quantos dias"
          erro={e.prazoMedioDias}
          ajuda="Serve de referência quando você for comprar."
        >
          <input id="prazoMedioDias" name="prazoMedioDias" inputMode="numeric" defaultValue={0} className="campo" />
        </Campo>
      </div>

      <Campo id="observacoes" label="Observação" opcional>
        <textarea id="observacoes" name="observacoes" rows={3} className="campo" />
      </Campo>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Salvar fornecedor'}
        </button>
        <a href="/fornecedores" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
