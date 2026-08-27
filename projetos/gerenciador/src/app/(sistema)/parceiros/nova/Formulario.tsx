'use client';

import { useActionState } from 'react';
import { criarRemessa, type Resultado } from '../acoes';
import { Campo, ErroGeral } from '@/components/Campo';

type Opcao = { id: string; nome: string };

export function Formulario({
  parceiros,
  clientes,
  hoje,
  emUmaSemana,
}: {
  parceiros: Opcao[];
  clientes: Opcao[];
  hoje: string;
  emUmaSemana: string;
}) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(criarRemessa, null);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-7 max-w-[640px] flex flex-col gap-6">
      <Campo id="fornecedorId" label="Para qual parceiro" erro={e.fornecedorId}>
        <select id="fornecedorId" name="fornecedorId" className="campo" defaultValue="">
          <option value="" disabled>
            Escolha o parceiro
          </option>
          {parceiros.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </Campo>

      <Campo id="tipoServico" label="O que ele vai fazer" erro={e.tipoServico}>
        <select id="tipoServico" name="tipoServico" className="campo" defaultValue="bordado">
          <option value="bordado">Bordado</option>
          <option value="dtf">DTF</option>
          <option value="silk">Silk screen</option>
          <option value="outro">Outro serviço</option>
        </select>
      </Campo>

      <Campo
        id="referencia"
        label="Nome do lote"
        erro={e.referencia}
        ajuda='Como você chama esse lote. Ex.: "Polo Colégio Alfa — agosto".'
      >
        <input id="referencia" name="referencia" className="campo" />
      </Campo>

      <Campo id="clienteId" label="Para qual cliente" opcional erro={e.clienteId}>
        <select id="clienteId" name="clienteId" className="campo" defaultValue="">
          <option value="">Não é de um cliente específico</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </Campo>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="quantidadeEnviada" label="Quantas peças saíram" erro={e.quantidadeEnviada}>
          <input
            id="quantidadeEnviada"
            name="quantidadeEnviada"
            inputMode="numeric"
            className="campo"
          />
        </Campo>

        <Campo
          id="valorPorPeca"
          label="Quanto ele cobra por peça"
          erro={e.valorPorPeca}
          ajuda="Só o número, como 3,50."
        >
          <input id="valorPorPeca" name="valorPorPeca" inputMode="decimal" className="campo" />
        </Campo>

        <Campo id="dataEnvio" label="Dia em que saíram" erro={e.dataEnvio}>
          <input
            id="dataEnvio"
            name="dataEnvio"
            type="date"
            defaultValue={hoje}
            className="campo"
          />
        </Campo>

        <Campo
          id="previsaoRetorno"
          label="Precisa voltar até"
          erro={e.previsaoRetorno}
          ajuda="É essa data que faz o sistema avisar do atraso."
        >
          <input
            id="previsaoRetorno"
            name="previsaoRetorno"
            type="date"
            defaultValue={emUmaSemana}
            className="campo"
          />
        </Campo>
      </div>

      <Campo id="observacoes" label="Observação" opcional>
        <textarea id="observacoes" name="observacoes" rows={3} className="campo" />
      </Campo>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Registrar saída das peças'}
        </button>
        <a href="/parceiros" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
