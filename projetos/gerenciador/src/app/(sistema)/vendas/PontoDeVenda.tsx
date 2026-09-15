'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { buscarProdutoPorSku, finalizarVenda, type ProdutoEncontrado } from './acoes';
import { centavosParaReais, centavosNumero } from '@/lib/numeros';

type LinhaCarrinho = ProdutoEncontrado & { quantidade: number };

export function PontoDeVenda({ clientes }: { clientes: { id: string; nome: string }[] }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [carrinho, setCarrinho] = useState<LinhaCarrinho[]>([]);
  const [erroCodigo, setErroCodigo] = useState<string | null>(null);
  const [buscando, iniciarBusca] = useTransition();

  const [canal, setCanal] = useState<'loja' | 'producao'>('loja');
  const [clienteId, setClienteId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [enviando, setEnviando] = useState(false);
  const [erroFinal, setErroFinal] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  function adicionarAoCarrinho(produto: ProdutoEncontrado) {
    setCarrinho((linhas) => {
      const existente = linhas.find((l) => l.id === produto.id);
      if (existente) {
        return linhas.map((l) => (l.id === produto.id ? { ...l, quantidade: l.quantidade + 1 } : l));
      }
      return [...linhas, { ...produto, quantidade: 1 }];
    });
  }

  function bipar() {
    const valor = codigo.trim();
    if (!valor) return;
    setErroCodigo(null);
    iniciarBusca(async () => {
      const produto = await buscarProdutoPorSku(valor);
      if (!produto) {
        setErroCodigo(`Nenhuma peça com o código "${valor}". Cadastre em Estoque da loja.`);
        return;
      }
      if (produto.saldo <= 0) {
        setErroCodigo(`"${produto.nome}" está com estoque zerado na loja.`);
        return;
      }
      adicionarAoCarrinho(produto);
      setCodigo('');
      inputRef.current?.focus();
    });
  }

  function mudarQuantidade(id: string, delta: number) {
    setCarrinho((linhas) =>
      linhas
        .map((l) => (l.id === id ? { ...l, quantidade: l.quantidade + delta } : l))
        .filter((l) => l.quantidade > 0),
    );
  }

  function remover(id: string) {
    setCarrinho((linhas) => linhas.filter((l) => l.id !== id));
  }

  const total = carrinho.reduce((s, l) => s + l.quantidade * l.precoVendaCentavos, 0);

  async function finalizar() {
    setErroFinal(null);
    setSucesso(null);

    if (canal === 'producao' && !clienteId) {
      setErroFinal('Escolha o cliente do pedido de produção.');
      return;
    }

    setEnviando(true);
    const resultado = await finalizarVenda({
      canal,
      clienteId: clienteId || null,
      formaPagamento,
      observacoes: '',
      itens: carrinho.map((l) => ({
        produtoAcabadoId: l.id,
        quantidade: l.quantidade,
        precoUnitarioCentavos: l.precoVendaCentavos,
      })),
    });
    setEnviando(false);

    if ('erro' in resultado) {
      setErroFinal(resultado.erro);
      return;
    }

    setCarrinho([]);
    setClienteId('');
    setSucesso(`Venda registrada — ${centavosParaReais(total)}.`);
    router.refresh();
    inputRef.current?.focus();
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCanal('loja')}
            className={`bt ${canal === 'loja' ? 'bt-cheio' : 'bt-vazio'}`}
          >
            Venda de balcão
          </button>
          <button
            type="button"
            onClick={() => setCanal('producao')}
            className={`bt ${canal === 'producao' ? 'bt-cheio' : 'bt-vazio'}`}
          >
            Pedido de produção
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="bipar" className="rotulo-campo">
            Bipar ou digitar o código da peça
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="bipar"
              ref={inputRef}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  bipar();
                }
              }}
              autoFocus
              placeholder="Aponte a leitora aqui ou digite o SKU e tecle Enter"
              className="campo flex-1"
            />
            <button type="button" onClick={bipar} disabled={buscando} className="bt bt-cheio shrink-0">
              {buscando ? 'Buscando…' : 'Adicionar'}
            </button>
          </div>
          {erroCodigo && (
            <p role="alert" className="mt-1.5 text-sm">
              <span className="mr-1 text-gold">↳</span>
              {erroCodigo}
            </p>
          )}
        </div>

        <div className="tabela-rolagem mt-5">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="th">Peça</th>
                <th className="th">Qtd</th>
                <th className="th">Preço</th>
                <th className="th">Subtotal</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {carrinho.length === 0 ? (
                <tr>
                  <td colSpan={5} className="td text-center fraco">
                    Carrinho vazio — bipe a primeira peça.
                  </td>
                </tr>
              ) : (
                carrinho.map((l) => (
                  <tr key={l.id}>
                    <td className="td font-semibold">
                      {l.nome}
                      {(l.tamanho || l.cor) && (
                        <span className="miudo">{[l.tamanho, l.cor].filter(Boolean).join(' · ')}</span>
                      )}
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => mudarQuantidade(l.id, -1)}
                          className="compacto h-7 w-7 rounded-sm border border-fio font-bold"
                          aria-label="Diminuir"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold">{l.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => mudarQuantidade(l.id, 1)}
                          className="compacto h-7 w-7 rounded-sm border border-fio font-bold"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="td">{centavosNumero(l.precoVendaCentavos)}</td>
                    <td className="td font-semibold">
                      {centavosParaReais(l.quantidade * l.precoVendaCentavos)}
                    </td>
                    <td className="td">
                      <button
                        type="button"
                        onClick={() => remover(l.id)}
                        className="compacto text-rotulo font-bold uppercase text-alerta"
                      >
                        Tirar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="rounded border border-fio bg-cream-alt p-4">
        <p className="text-rotulo font-bold uppercase text-gold">Fechar venda</p>

        {canal === 'producao' && (
          <div className="mt-4">
            <label htmlFor="cliente" className="rotulo-campo">
              Cliente
            </label>
            <select
              id="cliente"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="campo mt-1.5"
            >
              <option value="">Escolha o cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {canal === 'loja' && (
          <div className="mt-4">
            <label htmlFor="clienteLoja" className="rotulo-campo">
              Cliente <span className="font-normal normal-case tracking-normal">opcional</span>
            </label>
            <select
              id="clienteLoja"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="campo mt-1.5"
            >
              <option value="">Venda de balcão, sem identificar</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="pagamento" className="rotulo-campo">
            Forma de pagamento
          </label>
          <select
            id="pagamento"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="campo mt-1.5"
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">Pix</option>
            <option value="cartao">Cartão</option>
            <option value="fiado">Fiado</option>
          </select>
        </div>

        <div className="mt-5 rounded bg-navy-deep px-4 py-3 text-cream">
          <p className="text-rotulo text-[color:var(--texto-claro)]">Total</p>
          <p className="text-2xl font-bold">{centavosParaReais(total)}</p>
        </div>

        {erroFinal && (
          <p role="alert" className="mt-3 text-sm">
            <span className="mr-1 text-gold">↳</span>
            {erroFinal}
          </p>
        )}
        {sucesso && <p className="mt-3 text-sm text-ok">{sucesso}</p>}

        <button
          type="button"
          onClick={finalizar}
          disabled={enviando || carrinho.length === 0}
          className="bt bt-cheio mt-4 w-full"
        >
          {enviando ? 'Registrando…' : 'Finalizar venda'}
        </button>
      </aside>
    </div>
  );
}
