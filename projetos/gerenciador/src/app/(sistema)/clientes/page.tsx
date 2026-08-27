import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Clientes' };

const rotuloTipo: Record<string, string> = { escola: 'Escola', empresa: 'Empresa', marca: 'Marca' };
const rotuloPagamento: Record<string, string> = {
  a_vista: 'À vista',
  '30': '30 dias',
  '30_60': '30/60 dias',
};

export default async function ClientesPage() {
  const usuario = await exigirUsuario();
  const clientes = await db.cliente.findMany({
    where: { empresaId: usuario.empresaId, ativo: true },
    orderBy: { nome: 'asc' },
  });

  return (
    <>
      <TituloPagina
        titulo="Clientes"
        sub="Escolas, empresas e marcas que você atende"
        acao={<Botao href="/clientes/novo">Novo cliente</Botao>}
      />

      {clientes.length === 0 ? (
        <Vazio
          titulo="Nenhum cliente cadastrado."
          texto="Cadastre as escolas e empresas que você atende para poder ligar cada lote de produção ao seu dono."
          acao={<Botao href="/clientes/novo">Novo cliente</Botao>}
        />
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {clientes.map((c) => (
            <li key={c.id} className="rounded border border-fio bg-cream-alt p-4">
              <p className="font-semibold">{c.nome}</p>
              <p className="mt-1.5">
                <span className="selo selo-neutro">{rotuloTipo[c.tipo] ?? c.tipo}</span>
              </p>
              <p className="mt-2 text-sm fraco">
                {rotuloPagamento[c.condicaoPagamento] ?? c.condicaoPagamento}
                {c.whatsapp && ` · ${c.whatsapp}`}
                {c.contato && ` · ${c.contato}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
