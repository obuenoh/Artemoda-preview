'use client';

import { useActionState } from 'react';
import { criarCliente, type Resultado } from '../../cadastros-acoes';
import { Campo, ErroGeral } from '@/components/Campo';

export function FormCliente() {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(criarCliente, null);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-7 flex max-w-[640px] flex-col gap-6">
      <Campo id="nome" label="Nome" erro={e.nome}>
        <input id="nome" name="nome" className="campo" autoFocus />
      </Campo>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="tipo" label="Tipo">
          <select id="tipo" name="tipo" className="campo" defaultValue="escola">
            <option value="escola">Escola</option>
            <option value="empresa">Empresa</option>
            <option value="marca">Marca (private label)</option>
          </select>
        </Campo>
        <Campo id="condicaoPagamento" label="Como costuma pagar">
          <select id="condicaoPagamento" name="condicaoPagamento" className="campo" defaultValue="a_vista">
            <option value="a_vista">À vista</option>
            <option value="30">30 dias</option>
            <option value="30_60">30/60 dias</option>
          </select>
        </Campo>
        <Campo id="contato" label="Pessoa de contato" opcional>
          <input id="contato" name="contato" className="campo" />
        </Campo>
        <Campo id="whatsapp" label="WhatsApp" opcional>
          <input id="whatsapp" name="whatsapp" className="campo" />
        </Campo>
        <Campo id="cnpj" label="CNPJ" opcional>
          <input id="cnpj" name="cnpj" className="campo" />
        </Campo>
      </div>

      <Campo id="observacoes" label="Observação" opcional>
        <textarea id="observacoes" name="observacoes" rows={3} className="campo" />
      </Campo>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Salvar cliente'}
        </button>
        <a href="/clientes" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
