'use client';

import { useActionState, useState } from 'react';
import { Campo, ErroGeral } from '@/components/Campo';
import { FORMAS_PAGAMENTO } from '@/lib/financeiro-listas';
import { Dinheiro } from '@/components/Valores';
import {
  pagarConta,
  receberConta,
  cancelarContaPagar,
  cancelarContaReceber,
  desfazerPagamento,
  desfazerRecebimento,
  type Resultado,
} from './acoes';
import { semLimpar } from '@/components/enviar';

export type DadosLinha = {
  id: string;
  descricao: string;
  /** Fornecedor ou cliente · tipo · parcela — ja montado no servidor. */
  detalhes: string;
  /** "venceu há 3 dias", "vence hoje", "pago em 12/10 · Pix" */
  quando: string;
  urgente: boolean;
  valorCentavos: number;
  /** Valor sem "R$", pronto para o campo: "1.250,00". */
  valorCampo: string;
  hoje: string;
  fechada: boolean;
};

type Painel = null | 'baixar' | 'cancelar' | 'desfazer';

/**
 * Uma conta na lista, com a acao ali mesmo: ela nao sai da tela para
 * marcar que pagou. Pagar e receber sao a mesma linha com palavras trocadas.
 */
export function LinhaConta({ tipo, conta }: { tipo: 'pagar' | 'receber'; conta: DadosLinha }) {
  const [painel, setPainel] = useState<Painel>(null);
  const pagar = tipo === 'pagar';

  return (
    <li className="px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="min-w-[220px] flex-1">
          <p className="font-semibold">{conta.descricao}</p>
          {conta.detalhes && <p className="miudo mt-0.5">{conta.detalhes}</p>}
        </div>
        <p className={`text-sm ${conta.urgente ? 'font-semibold text-alerta' : 'fraco'}`}>{conta.quando}</p>
        <Dinheiro centavos={conta.valorCentavos} className="inline-block w-[120px] text-right font-bold tabular-nums" />
        <div className="flex gap-2">
          {conta.fechada ? (
            <button type="button" onClick={() => setPainel(painel === 'desfazer' ? null : 'desfazer')} className="bt bt-vazio compacto py-2">
              Desfazer
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setPainel(painel === 'baixar' ? null : 'baixar')} className="bt bt-cheio compacto py-2">
                {pagar ? 'Paguei' : 'Recebi'}
              </button>
              <button type="button" onClick={() => setPainel(painel === 'cancelar' ? null : 'cancelar')} className="bt bt-vazio compacto py-2">
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {painel === 'baixar' && <FormBaixa tipo={tipo} conta={conta} fechar={() => setPainel(null)} />}
      {painel === 'cancelar' && (
        <FormMotivo
          acao={pagar ? cancelarContaPagar : cancelarContaReceber}
          id={conta.id}
          titulo={pagar ? 'Esta conta não vai ser paga?' : 'Este valor não vai entrar?'}
          ajuda="A conta sai da lista, mas fica registrada com o motivo."
          botao="Cancelar a conta"
          fechar={() => setPainel(null)}
        />
      )}
      {painel === 'desfazer' && (
        <FormMotivo
          acao={pagar ? desfazerPagamento : desfazerRecebimento}
          id={conta.id}
          titulo={pagar ? 'Desfazer este pagamento?' : 'Desfazer este recebimento?'}
          ajuda="O caixa recebe um estorno com o motivo e a conta volta para em aberto. Nada é apagado."
          botao="Desfazer"
          fechar={() => setPainel(null)}
        />
      )}
    </li>
  );
}

function FormBaixa({ tipo, conta, fechar }: { tipo: 'pagar' | 'receber'; conta: DadosLinha; fechar: () => void }) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(tipo === 'pagar' ? pagarConta : receberConta, null);
  const e = estado?.campos ?? {};
  const pagar = tipo === 'pagar';

  return (
    <form onSubmit={semLimpar(acao)} className="mt-3 rounded border border-fio bg-cream-alt p-4">
      <input type="hidden" name="id" value={conta.id} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id={`data-${conta.id}`} label={pagar ? 'Dia que pagou' : 'Dia que recebeu'} erro={e.data}>
          <input id={`data-${conta.id}`} name="data" type="date" defaultValue={conta.hoje} max={conta.hoje} className="campo" />
        </Campo>
        <Campo id={`valor-${conta.id}`} label={pagar ? 'Quanto pagou' : 'Quanto recebeu'} erro={e.valor} ajuda="Mude se veio com juros ou desconto.">
          <input id={`valor-${conta.id}`} name="valor" inputMode="decimal" defaultValue={conta.valorCampo} className="campo" />
        </Campo>
        <Campo id={`forma-${conta.id}`} label={pagar ? 'Como pagou' : 'Como recebeu'} erro={e.forma}>
          <select id={`forma-${conta.id}`} name="forma" defaultValue="pix" className="campo">
            {Object.entries(FORMAS_PAGAMENTO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <div className="mt-4">
        <ErroGeral erro={estado?.erro} />
      </div>
      <div className="mt-3 flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Lançando…' : pagar ? 'Lançar pagamento' : 'Lançar recebimento'}
        </button>
        <button type="button" onClick={fechar} className="bt bt-vazio">
          Voltar
        </button>
      </div>
    </form>
  );
}

function FormMotivo({
  acao: acaoServidor,
  id,
  titulo,
  ajuda,
  botao,
  fechar,
}: {
  acao: (e: Resultado, form: FormData) => Promise<Resultado>;
  id: string;
  titulo: string;
  ajuda: string;
  botao: string;
  fechar: () => void;
}) {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(acaoServidor, null);

  return (
    <form onSubmit={semLimpar(acao)} className="mt-3 rounded border border-fio bg-cream-alt p-4">
      <input type="hidden" name="id" value={id} />
      <p className="font-semibold">{titulo}</p>
      <p className="miudo mt-1">{ajuda}</p>
      <Campo id={`motivo-${id}`} label="Motivo" erro={estado?.campos?.motivo} className="mt-4 max-w-[520px]">
        <input id={`motivo-${id}`} name="motivo" className="campo" placeholder="Ex.: fornecedor deu desconto e trocou o boleto" />
      </Campo>
      <div className="mt-4">
        <ErroGeral erro={estado?.campos?.motivo ? undefined : estado?.erro} />
      </div>
      <div className="mt-3 flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-perigo">
          {pendente ? 'Salvando…' : botao}
        </button>
        <button type="button" onClick={fechar} className="bt bt-vazio">
          Voltar
        </button>
      </div>
    </form>
  );
}
