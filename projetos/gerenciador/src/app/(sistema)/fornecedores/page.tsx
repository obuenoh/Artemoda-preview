import Link from 'next/link';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { TituloPagina, Vazio, Botao } from '@/components/Ui';

export const metadata = { title: 'Fornecedores' };

const rotuloTipo: Record<string, string> = {
  tecido: 'Tecido',
  aviamento: 'Aviamento',
  dtf: 'DTF',
  silk: 'Silk',
  bordado: 'Bordado',
  servico: 'Serviço',
  outro: 'Outro',
};

const rotuloPagamento: Record<string, string> = {
  a_vista: 'À vista',
  '30': '30 dias',
  '30_60': '30/60 dias',
};

export default async function FornecedoresPage() {
  const usuario = await exigirUsuario();
  const fornecedores = await db.fornecedor.findMany({
    where: { empresaId: usuario.empresaId, ativo: true },
    orderBy: { nome: 'asc' },
  });

  return (
    <>
      <TituloPagina
        titulo="Fornecedores"
        sub="Quem vende tecido e quem faz bordado, DTF e silk"
        acao={
          <div className="flex gap-3">
            <Botao href="/comparador" variante="vazio">
              Comparar preços
            </Botao>
            <Botao href="/fornecedores/novo">Novo fornecedor</Botao>
          </div>
        }
      />

      {fornecedores.length === 0 ? (
        <Vazio
          titulo="Nenhum fornecedor cadastrado."
          texto="Comece pelos que você mais usa: a fábrica do tecido e quem faz o bordado."
          acao={<Botao href="/fornecedores/novo">Novo fornecedor</Botao>}
        />
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {fornecedores.map((f) => (
            <li key={f.id}>
              <Link
                href={`/fornecedores/${f.id}`}
                className="flex h-full flex-col gap-2 rounded border border-fio bg-cream-alt p-4 transition-colors hover:border-gold"
              >
                <p className="font-semibold">{f.nome}</p>
                <p className="flex flex-wrap gap-1.5">
                  {f.tipos.split(',').map((t) => (
                    <span key={t} className="selo selo-neutro">
                      {rotuloTipo[t.trim()] ?? t}
                    </span>
                  ))}
                </p>
                <p className="mt-auto pt-2 text-sm fraco">
                  {rotuloPagamento[f.condicaoPagamento] ?? f.condicaoPagamento}
                  {f.prazoMedioDias > 0 && ` · entrega em ~${f.prazoMedioDias} dias`}
                  {f.whatsapp && ` · ${f.whatsapp}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
