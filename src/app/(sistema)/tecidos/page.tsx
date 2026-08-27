import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { milFormatado } from '@/lib/numeros';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Tecidos' };

export default async function TecidosPage() {
  const usuario = await exigirUsuario();
  const tecidos = await db.materiaPrima.findMany({
    where: { empresaId: usuario.empresaId, ativo: true },
    orderBy: { nome: 'asc' },
  });

  return (
    <>
      <TituloPagina
        titulo="Tecidos e aviamentos"
        sub="O cadastro do que você compra para produzir"
        acao={<Botao href="/tecidos/novo">Novo tecido</Botao>}
      />

      {tecidos.length === 0 ? (
        <Vazio
          titulo="Nenhum tecido cadastrado."
          texto="Cadastre os tecidos que você usa. Depois disso dá para registrar compras e acompanhar o estoque."
          acao={<Botao href="/tecidos/novo">Novo tecido</Botao>}
        />
      ) : (
        <div className="tabela-rolagem mt-6">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="th">Tecido</th>
                <th className="th">Cor</th>
                <th className="th">Composição</th>
                <th className="th">Compra em</th>
                <th className="th">Mínimo</th>
                <th className="th">Onde está</th>
              </tr>
            </thead>
            <tbody>
              {tecidos.map((t) => (
                <tr key={t.id}>
                  <td className="td font-semibold">
                    {t.nome}
                    {t.larguraMil && (
                      <span className="miudo">largura {milFormatado(t.larguraMil, 'metro')}</span>
                    )}
                  </td>
                  <td className="td">{t.cor ?? <span className="fraco">—</span>}</td>
                  <td className="td">{t.composicao ?? <span className="fraco">—</span>}</td>
                  <td className="td">{t.unidade === 'kg' ? 'Quilo' : 'Metro'}</td>
                  <td className="td">
                    {t.estoqueMinimoMil > 0 ? (
                      milFormatado(t.estoqueMinimoMil, t.unidade)
                    ) : (
                      <span className="fraco">não definido</span>
                    )}
                  </td>
                  <td className="td">{t.localizacao ?? <span className="fraco">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
