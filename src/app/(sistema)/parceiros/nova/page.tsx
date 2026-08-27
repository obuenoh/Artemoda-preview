import { db } from '@/lib/db';
import { exigirPapel } from '@/lib/sessao';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';
import { Formulario } from './Formulario';

export const metadata = { title: 'Mandar peças' };

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function NovaRemessaPage() {
  const usuario = await exigirPapel('dona', 'producao');

  const [parceiros, clientes] = await Promise.all([
    db.fornecedor.findMany({
      where: { empresaId: usuario.empresaId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
    db.cliente.findMany({
      where: { empresaId: usuario.empresaId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
  ]);

  // Só quem faz personalização aparece aqui.
  const dePersonalizacao = parceiros.filter((p) =>
    p.tipos.split(',').some((t) => ['dtf', 'silk', 'bordado', 'servico'].includes(t.trim())),
  );

  const hoje = new Date();
  const semana = new Date(Date.now() + 7 * 86_400_000);

  return (
    <>
      <TituloPagina
        titulo="Mandar peças para o parceiro"
        sub="Registre o que está saindo — o sistema avisa se não voltar no prazo"
      />

      {dePersonalizacao.length === 0 ? (
        <Vazio
          titulo="Nenhum parceiro de personalização cadastrado."
          texto="Cadastre primeiro quem faz bordado, DTF ou silk para você. Depois volte aqui para registrar a saída das peças."
          acao={<Botao href="/fornecedores/novo">Cadastrar parceiro</Botao>}
        />
      ) : (
        <Formulario
          parceiros={dePersonalizacao.map((p) => ({ id: p.id, nome: p.nome }))}
          clientes={clientes.map((c) => ({ id: c.id, nome: c.nome }))}
          hoje={iso(hoje)}
          emUmaSemana={iso(semana)}
        />
      )}
    </>
  );
}
