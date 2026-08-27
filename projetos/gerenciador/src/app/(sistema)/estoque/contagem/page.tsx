import { exigirPapel } from '@/lib/sessao';
import { posicaoEstoque } from '@/lib/estoque';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';
import { FormContagem } from './FormContagem';

export const metadata = { title: 'Contagem' };

export default async function ContagemPage({
  searchParams,
}: {
  searchParams: Promise<{ abertura?: string }>;
}) {
  const { abertura } = await searchParams;
  const usuario = await exigirPapel('dona', 'producao');
  const linhas = await posicaoEstoque(usuario.empresaId);

  const eAbertura = abertura === 'sim';

  return (
    <>
      <TituloPagina
        titulo={eAbertura ? 'Estoque de abertura' : 'Contagem física'}
        sub={
          eAbertura
            ? 'Comece registrando o que já está na prateleira hoje'
            : 'Conte o que tem de verdade e o sistema ajusta a diferença'
        }
        acao={
          <Botao href={eAbertura ? '/estoque/contagem' : '/estoque/contagem?abertura=sim'} variante="vazio">
            {eAbertura ? 'É uma contagem normal' : 'É o estoque de abertura'}
          </Botao>
        }
      />

      <p className="mt-4 max-w-[68ch] rounded border border-dashed border-fio-ouro px-4 py-3 text-sm fraco">
        {eAbertura ? (
          <>
            Use isto uma vez, no começo. Como não existe nota de compra desse tecido, informe
            também quanto custou o metro ou o quilo — é o que faz o custo médio nascer certo. Se
            não souber o valor exato, use o melhor palpite: dá para corrigir depois com um ajuste.
          </>
        ) : (
          <>
            Preencha só as linhas que você contou. Onde houver diferença, o motivo é obrigatório —
            é ele que explica o número no dia em que alguém perguntar.
          </>
        )}
      </p>

      {linhas.length === 0 ? (
        <Vazio
          titulo="Nenhum tecido cadastrado."
          texto="Cadastre os tecidos primeiro para poder contar."
          acao={<Botao href="/tecidos/novo">Cadastrar tecido</Botao>}
        />
      ) : (
        <FormContagem
          abertura={eAbertura}
          linhas={linhas.map((l) => ({
            id: l.id,
            nome: `${l.nome}${l.cor ? ` · ${l.cor}` : ''}`,
            unidade: l.unidade,
            saldoMil: l.saldoMil,
            localizacao: l.localizacao,
          }))}
        />
      )}
    </>
  );
}
