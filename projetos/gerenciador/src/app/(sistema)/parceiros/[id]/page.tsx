import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/sessao';
import { rotuloServico } from '@/lib/parceiros';
import { centavosParaReais, centavosNumero, dataBR, diasDesde } from '@/lib/numeros';
import { TituloPagina, FaixaTotal } from '@/components/Ui';
import { FormRetorno } from './FormRetorno';

export const metadata = { title: 'Remessa' };

export default async function RemessaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await exigirUsuario();

  const remessa = await db.remessa.findFirst({
    where: { id, empresaId: usuario.empresaId },
    include: {
      fornecedor: true,
      cliente: true,
      retornos: { orderBy: { dataRetorno: 'asc' } },
    },
  });

  if (!remessa) notFound();

  const ok = remessa.retornos.reduce((s, r) => s + r.quantidadeOk, 0);
  const defeito = remessa.retornos.reduce((s, r) => s + r.quantidadeDefeito, 0);
  const restam = remessa.quantidadeEnviada - ok - defeito;
  const fechada = restam <= 0;
  const atraso = !fechada && remessa.previsaoRetorno < new Date() ? diasDesde(remessa.previsaoRetorno) : 0;

  return (
    <>
      <Link href="/parceiros" className="compacto text-rotulo font-bold uppercase text-gold">
        ← Peças no parceiro
      </Link>

      <div className="mt-3">
        <TituloPagina
          titulo={remessa.referencia}
          sub={`${remessa.fornecedor.nome} · ${rotuloServico[remessa.tipoServico] ?? remessa.tipoServico}${
            remessa.cliente ? ` · ${remessa.cliente.nome}` : ''
          }`}
        />
      </div>

      {atraso > 0 && (
        <div className="mt-5 rounded border border-alerta bg-alerta/5 px-4 py-3">
          <p className="font-semibold text-alerta">
            {restam} peça(s) estão {atraso} dia(s) além do prazo combinado.
          </p>
          <p className="mt-1 text-sm">
            Deveriam ter voltado em {dataBR(remessa.previsaoRetorno)}. Vale ligar para{' '}
            {remessa.fornecedor.nome}
            {remessa.fornecedor.whatsapp && ` — ${remessa.fornecedor.whatsapp}`}.
          </p>
        </div>
      )}

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Dado rotulo="Saíram" valor={`${remessa.quantidadeEnviada} peças`} />
        <Dado rotulo="Já voltaram" valor={`${ok + defeito} peças`} />
        <Dado
          rotulo="Ainda fora"
          valor={`${Math.max(restam, 0)} peças`}
          grave={restam > 0 && atraso > 0}
        />
        <Dado
          rotulo="Combinado"
          valor={centavosParaReais(remessa.valorPorPecaCentavos * remessa.quantidadeEnviada)}
          nota={`${centavosNumero(remessa.valorPorPecaCentavos)} por peça`}
        />
      </dl>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm fraco">
        <span>Saíram em {dataBR(remessa.dataEnvio)}</span>
        <span>Voltam até {dataBR(remessa.previsaoRetorno)}</span>
      </div>

      {remessa.observacoes && (
        <p className="mt-4 rounded border border-dashed border-fio-ouro px-4 py-3 text-sm">
          {remessa.observacoes}
        </p>
      )}

      <section className="mt-9">
        <h2 className="text-rotulo font-bold uppercase text-gold">Voltas registradas</h2>
        {remessa.retornos.length === 0 ? (
          <p className="mt-3 rounded border border-dashed border-fio px-4 py-4 text-sm fraco">
            Nenhuma peça voltou ainda.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio">
            {remessa.retornos.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3">
                <span className="text-sm font-semibold">{dataBR(r.dataRetorno)}</span>
                <span className="text-sm">{r.quantidadeOk} boas</span>
                {r.quantidadeDefeito > 0 && (
                  <span className="text-sm text-alerta">
                    {r.quantidadeDefeito} com defeito
                    {r.motivoDefeito && ` — ${r.motivoDefeito}`}
                  </span>
                )}
                {r.observacoes && <span className="text-sm fraco">{r.observacoes}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {fechada ? (
        <FaixaTotal>
          <span className="text-sm text-[color:var(--texto-claro)]">Remessa fechada:</span>
          <span className="text-xl font-bold">{ok} boas</span>
          {defeito > 0 && <span className="text-xl font-bold text-alerta">{defeito} com defeito</span>}
        </FaixaTotal>
      ) : (
        <section className="mt-9 rounded border border-fio bg-cream-alt p-5">
          <h2 className="font-display text-xl">Chegaram peças de volta?</h2>
          <p className="mt-1 text-sm fraco">
            Registre quantas voltaram boas e quantas voltaram com defeito. Pode registrar em partes.
          </p>
          <FormRetorno
            remessaId={remessa.id}
            restam={restam}
            hoje={new Date().toISOString().slice(0, 10)}
          />
        </section>
      )}
    </>
  );
}

function Dado({
  rotulo,
  valor,
  nota,
  grave,
}: {
  rotulo: string;
  valor: string;
  nota?: string;
  grave?: boolean;
}) {
  return (
    <div className={`rounded border p-4 ${grave ? 'border-alerta' : 'border-fio'} bg-cream-alt`}>
      <dt className="text-rotulo font-semibold uppercase fraco">{rotulo}</dt>
      <dd className={`mt-1 text-xl font-bold ${grave ? 'text-alerta' : ''}`}>{valor}</dd>
      {nota && <dd className="miudo">{nota}</dd>}
    </div>
  );
}
