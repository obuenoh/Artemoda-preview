'use client';

import { useActionState } from 'react';
import { criarTecido, type Resultado } from '../../cadastros-acoes';
import { Campo, ErroGeral } from '@/components/Campo';

export function FormTecido() {
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(criarTecido, null);
  const e = estado?.campos ?? {};

  return (
    <form action={acao} className="mt-7 flex max-w-[640px] flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="nome" label="Nome do tecido" erro={e.nome} ajuda='Ex.: "Malha PV".'>
          <input id="nome" name="nome" className="campo" autoFocus />
        </Campo>
        <Campo id="cor" label="Cor" opcional>
          <input id="cor" name="cor" className="campo" placeholder="Azul marinho" />
        </Campo>
        <Campo id="composicao" label="Composição" opcional>
          <input id="composicao" name="composicao" className="campo" placeholder="67% poliéster, 33% viscose" />
        </Campo>
        <Campo id="unidade" label="Você compra em">
          <select id="unidade" name="unidade" className="campo" defaultValue="metro">
            <option value="metro">Metro</option>
            <option value="kg">Quilo</option>
          </select>
        </Campo>
        <Campo id="largura" label="Largura em metros" opcional>
          <input id="largura" name="largura" inputMode="decimal" className="campo" placeholder="1,80" />
        </Campo>
        <Campo id="gramatura" label="Gramatura (g/m²)" opcional>
          <input id="gramatura" name="gramatura" inputMode="numeric" className="campo" placeholder="180" />
        </Campo>
        <Campo
          id="estoqueMinimo"
          label="Avisar quando ficar abaixo de"
          erro={e.estoqueMinimo}
          ajuda="É o que faz o sistema avisar na tela Hoje."
        >
          <input id="estoqueMinimo" name="estoqueMinimo" inputMode="decimal" className="campo" placeholder="40" />
        </Campo>
        <Campo id="localizacao" label="Onde fica" opcional ajuda="Ex.: prateleira 3.">
          <input id="localizacao" name="localizacao" className="campo" />
        </Campo>
      </div>

      <ErroGeral erro={estado?.erro} />

      <div className="flex gap-3">
        <button type="submit" disabled={pendente} className="bt bt-cheio">
          {pendente ? 'Salvando…' : 'Salvar tecido'}
        </button>
        <a href="/tecidos" className="bt bt-vazio">
          Cancelar
        </a>
      </div>
    </form>
  );
}
