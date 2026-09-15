'use client';

import { useActionState, useState } from 'react';
import { criarProdutoEstoque, criarTipoProduto, type Resultado } from '../../cadastros-acoes';
import { Campo, ErroGeral } from '@/components/Campo';

type Tipo = { id: string; nome: string; unidadePadrao: string; mostrarCamposTecido: boolean };

export function FormProduto({ tipos: tiposIniciais }: { tipos: Tipo[] }) {
  const [tipos, setTipos] = useState(tiposIniciais);
  const [tipoId, setTipoId] = useState(tiposIniciais[0]?.id ?? '');
  const [criandoTipo, setCriandoTipo] = useState(false);

  const [estado, acao, pendente] = useActionState<Resultado, FormData>(criarProdutoEstoque, null);
  const e = estado?.campos ?? {};

  const tipoSelecionado = tipos.find((t) => t.id === tipoId);

  return (
    <>
      <div className="mt-7 rounded border border-fio bg-cream-alt p-4">
        {!criandoTipo ? (
          <button
            type="button"
            onClick={() => setCriandoTipo(true)}
            className="compacto text-rotulo font-bold uppercase text-gold"
          >
            + Criar um tipo de produto novo
          </button>
        ) : (
          <FormNovoTipo
            onCriado={(t) => {
              setTipos((ts) => [...ts, t]);
              setTipoId(t.id);
              setCriandoTipo(false);
            }}
            onCancelar={() => setCriandoTipo(false)}
          />
        )}
      </div>

      <form action={acao} className="mt-6 flex max-w-[640px] flex-col gap-6">
        <Campo id="tipoProdutoId" label="Tipo do produto" erro={e.tipoProdutoId}>
          <select
            id="tipoProdutoId"
            name="tipoProdutoId"
            className="campo"
            value={tipoId}
            onChange={(ev) => setTipoId(ev.target.value)}
          >
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="nome" label="Nome" erro={e.nome} ajuda={tipoSelecionado?.mostrarCamposTecido ? 'Ex.: "Malha PV".' : undefined}>
          <input id="nome" name="nome" className="campo" autoFocus />
        </Campo>

        <div className="grid gap-6 sm:grid-cols-2">
          <Campo id="cor" label="Cor" opcional>
            <input id="cor" name="cor" className="campo" />
          </Campo>

          <Campo id="unidade" label="Você mede em">
            <select
              id="unidade"
              name="unidade"
              className="campo"
              defaultValue={tipoSelecionado?.unidadePadrao ?? 'unidade'}
              key={tipoSelecionado?.unidadePadrao}
            >
              <option value="metro">Metro</option>
              <option value="kg">Quilo</option>
              <option value="unidade">Unidade (peça, caixa, par)</option>
            </select>
          </Campo>

          {tipoSelecionado?.mostrarCamposTecido && (
            <>
              <Campo id="composicao" label="Composição" opcional>
                <input id="composicao" name="composicao" className="campo" placeholder="67% poliéster, 33% viscose" />
              </Campo>
              <Campo id="largura" label="Largura em metros" opcional>
                <input id="largura" name="largura" inputMode="decimal" className="campo" placeholder="1,80" />
              </Campo>
              <Campo id="gramatura" label="Gramatura (g/m²)" opcional>
                <input id="gramatura" name="gramatura" inputMode="numeric" className="campo" placeholder="180" />
              </Campo>
            </>
          )}

          <Campo
            id="estoqueMinimo"
            label="Avisar quando ficar abaixo de"
            erro={e.estoqueMinimo}
            ajuda="É o que faz o sistema avisar na Visão Geral."
          >
            <input id="estoqueMinimo" name="estoqueMinimo" inputMode="decimal" className="campo" placeholder="0" />
          </Campo>

          <Campo id="localizacao" label="Onde fica" opcional ajuda="Ex.: prateleira 3.">
            <input id="localizacao" name="localizacao" className="campo" />
          </Campo>
        </div>

        <ErroGeral erro={estado?.erro} />

        <div className="flex gap-3">
          <button type="submit" disabled={pendente} className="bt bt-cheio">
            {pendente ? 'Salvando…' : 'Salvar produto'}
          </button>
          <a href="/estoque" className="bt bt-vazio">
            Cancelar
          </a>
        </div>
      </form>
    </>
  );
}

function FormNovoTipo({
  onCriado,
  onCancelar,
}: {
  onCriado: (t: Tipo) => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState('');
  const [unidadePadrao, setUnidadePadrao] = useState('unidade');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function criar() {
    if (!nome.trim()) {
      setErro('Dê um nome ao tipo, como "Zíper".');
      return;
    }
    setEnviando(true);
    const form = new FormData();
    form.set('nome', nome.trim());
    form.set('unidadePadrao', unidadePadrao);
    const resultado = await criarTipoProduto(null, form);
    setEnviando(false);

    if (resultado?.erro) {
      setErro(resultado.campos?.nome ?? resultado.erro);
      return;
    }
    // Server action redireciona por convenção nas outras telas, mas aqui
    // criarTipoProduto devolve null em sucesso — precisamos buscar o tipo
    // criado. Como não temos o id de volta, recarregamos a lista simples:
    // a forma mais simples e confiavel e recarregar a pagina.
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="novoTipoNome" className="rotulo-campo">
          Nome do tipo
        </label>
        <input
          id="novoTipoNome"
          value={nome}
          onChange={(ev) => setNome(ev.target.value)}
          className="campo mt-1.5"
          placeholder="Ex.: Botão, Linha, Viés"
        />
      </div>
      <div>
        <label htmlFor="novoTipoUnidade" className="rotulo-campo">
          Mede em
        </label>
        <select
          id="novoTipoUnidade"
          value={unidadePadrao}
          onChange={(ev) => setUnidadePadrao(ev.target.value)}
          className="campo mt-1.5"
        >
          <option value="unidade">Unidade</option>
          <option value="metro">Metro</option>
          <option value="kg">Quilo</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={criar} disabled={enviando} className="bt bt-cheio">
          {enviando ? 'Criando…' : 'Criar tipo'}
        </button>
        <button type="button" onClick={onCancelar} className="bt bt-vazio">
          Cancelar
        </button>
      </div>
      {erro && (
        <p role="alert" className="basis-full text-sm">
          <span className="mr-1 text-gold">↳</span>
          {erro}
        </p>
      )}
    </div>
  );
}
