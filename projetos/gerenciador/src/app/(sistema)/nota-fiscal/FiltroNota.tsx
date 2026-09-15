'use client';

import { useActionState, useState } from 'react';
import { gerarNotaFiscal, previsualizarRelatorio, type Resultado, type PreviaNota } from './acoes';
import { Campo, ErroGeral } from '@/components/Campo';
import { centavosParaReais, dataBR } from '@/lib/numeros';

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}
function diasAtrasISO(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

export function FiltroNota({ clientes }: { clientes: { id: string; nome: string }[] }) {
  const [inicio, setInicio] = useState(diasAtrasISO(30));
  const [fim, setFim] = useState(hojeISO());
  const [clienteId, setClienteId] = useState('');
  const [descontoPercentual, setDescontoPercentual] = useState('0');
  const [descontoValor, setDescontoValor] = useState('0');

  const [calculando, setCalculando] = useState(false);
  const [erroPrevia, setErroPrevia] = useState<string | null>(null);
  const [previa, setPrevia] = useState<PreviaNota | null>(null);

  const [estado, acao, pendente] = useActionState<Resultado, FormData>(gerarNotaFiscal, null);

  async function calcular() {
    setCalculando(true);
    setErroPrevia(null);
    const resultado = await previsualizarRelatorio({
      inicio,
      fim,
      clienteId: clienteId || undefined,
      descontoPercentual: Number(descontoPercentual.replace(',', '.')) || 0,
      descontoValor: Number(descontoValor.replace(',', '.')) || 0,
    });
    setCalculando(false);

    if ('erro' in resultado) {
      setErroPrevia(resultado.erro);
      setPrevia(null);
      return;
    }
    setPrevia(resultado.previa);
  }

  const linkRelatorio = `/nota-fiscal/relatorio?inicio=${inicio}&fim=${fim}${clienteId ? `&clienteId=${clienteId}` : ''}`;

  return (
    <div className="rounded border border-fio bg-cream-alt p-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="inicio" className="rotulo-campo">
            De
          </label>
          <input
            id="inicio"
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="campo mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="fim" className="rotulo-campo">
            Até
          </label>
          <input
            id="fim"
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="campo mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="cliente" className="rotulo-campo">
            Cliente <span className="font-normal normal-case tracking-normal">opcional</span>
          </label>
          <select
            id="cliente"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="campo mt-1.5"
          >
            <option value="">Todos os clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={calcular} disabled={calculando} className="bt bt-cheio w-full">
            {calculando ? 'Calculando…' : 'Calcular'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="descontoPercentual" className="rotulo-campo">
            Desconto (%)
          </label>
          <input
            id="descontoPercentual"
            inputMode="decimal"
            value={descontoPercentual}
            onChange={(e) => setDescontoPercentual(e.target.value)}
            className="campo mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="descontoValor" className="rotulo-campo">
            Desconto (valor fixo)
          </label>
          <input
            id="descontoValor"
            inputMode="decimal"
            value={descontoValor}
            onChange={(e) => setDescontoValor(e.target.value)}
            placeholder="0,00"
            className="campo mt-1.5"
          />
        </div>
      </div>

      {erroPrevia && (
        <p role="alert" className="mt-4 text-sm">
          <span className="mr-1 text-gold">↳</span>
          {erroPrevia}
        </p>
      )}

      {previa && (
        <div className="mt-5 border-t border-fio pt-5">
          <div className="tabela-rolagem">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="th">Data</th>
                  <th className="th">Cliente</th>
                  <th className="th">Canal</th>
                  <th className="th">Peças</th>
                  <th className="th">Total</th>
                </tr>
              </thead>
              <tbody>
                {previa.itens.map((i) => (
                  <tr key={i.vendaId}>
                    <td className="td">{dataBR(new Date(i.data))}</td>
                    <td className="td">{i.clienteNome}</td>
                    <td className="td">{i.canal === 'loja' ? 'Loja' : 'Produção'}</td>
                    <td className="td">{i.pecas}</td>
                    <td className="td font-semibold">{centavosParaReais(i.totalCentavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded bg-navy-deep px-4 py-3 text-cream">
            <span className="text-sm text-[color:var(--texto-claro)]">
              {previa.itens.length} venda(s), {previa.totalPecas} peça(s)
            </span>
            <span className="text-sm text-[color:var(--texto-claro)]">
              Bruto: {centavosParaReais(previa.totalCentavos)}
            </span>
            <span className="ml-auto text-xl font-bold">
              {centavosParaReais(previa.totalComDescontoCentavos)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a href={linkRelatorio} target="_blank" rel="noreferrer" className="bt bt-vazio">
              Gerar só o relatório
            </a>

            <form action={acao}>
              <input type="hidden" name="inicio" value={inicio} />
              <input type="hidden" name="fim" value={fim} />
              <input type="hidden" name="clienteId" value={clienteId} />
              <input type="hidden" name="descontoPercentual" value={descontoPercentual} />
              <input type="hidden" name="descontoValor" value={descontoValor} />
              <button type="submit" disabled={pendente} className="bt bt-cheio">
                {pendente ? 'Gerando…' : 'Emitir nota fiscal (rascunho)'}
              </button>
            </form>
          </div>

          <ErroGeral erro={estado?.erro} />
        </div>
      )}
    </div>
  );
}
