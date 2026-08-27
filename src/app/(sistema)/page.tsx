import Link from 'next/link';
import { exigirUsuario } from '@/lib/sessao';
import { posicaoEstoque } from '@/lib/estoque';
import { situacaoRemessas } from '@/lib/parceiros';
import { centavosParaReais, milFormatado } from '@/lib/numeros';

export const metadata = { title: 'Hoje' };

/**
 * A primeira tela e "o que eu preciso saber hoje", nao um monte de grafico.
 * Cada cartao leva para a tela onde aquilo se resolve. Cartao que nao gera
 * acao nao aparece.
 */
export default async function HojePage() {
  const usuario = await exigirUsuario();

  const [estoque, remessas] = await Promise.all([
    posicaoEstoque(usuario.empresaId),
    situacaoRemessas(usuario.empresaId),
  ]);

  const atrasadas = remessas.filter((r) => r.atrasadaDias > 0);
  const fora = remessas.filter((r) => !r.fechada);
  const pecasFora = fora.reduce((s, r) => s + r.aindaFora, 0);
  const pecasAtrasadas = atrasadas.reduce((s, r) => s + r.aindaFora, 0);

  const abaixo = estoque.filter((l) => l.abaixoDoMinimo);
  const capital = estoque.reduce((s, l) => s + l.valorCentavos, 0);
  const paradoLongo = estoque
    .filter((l) => (l.diasParado ?? 0) > 180)
    .reduce((s, l) => s + l.valorCentavos, 0);

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <>
      <div className="border-b border-fio pb-5">
        <h1 className="text-xl font-bold md:text-2xl">Hoje</h1>
        <p className="mt-1 text-sm capitalize fraco">{hoje}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao
          rotulo="Peças fora há tempo demais"
          numero={pecasAtrasadas > 0 ? String(pecasAtrasadas) : '—'}
          grave={pecasAtrasadas > 0}
          nota={
            pecasAtrasadas > 0
              ? `${atrasadas[0].fornecedorNome} está ${atrasadas[0].atrasadaDias} dia(s) além do combinado.`
              : 'Nenhum parceiro passou do prazo combinado.'
          }
          href="/parceiros"
          acao="Ver peças fora"
        />

        <Cartao
          rotulo="Peças no parceiro agora"
          numero={String(pecasFora)}
          nota={
            fora.length > 0
              ? `Em ${fora.length} remessa(s) ainda em aberto.`
              : 'Nada fora da empresa neste momento.'
          }
          href="/parceiros"
          acao="Ver remessas"
        />

        <Cartao
          rotulo="Tecido abaixo do mínimo"
          numero={abaixo.length > 0 ? String(abaixo.length) : '—'}
          grave={abaixo.length > 0}
          nota={
            abaixo.length > 0
              ? abaixo.map((l) => l.nome).slice(0, 3).join(', ')
              : 'Todo tecido acima do mínimo que você definiu.'
          }
          href="/estoque"
          acao="Ver o que comprar"
        />

        <Cartao
          rotulo="Parado em estoque"
          numero={centavosParaReais(capital)}
          nota={
            paradoLongo > 0
              ? `${centavosParaReais(paradoLongo)} sem sair do lugar há mais de 6 meses.`
              : 'Nada parado há mais de 6 meses.'
          }
          href="/estoque/parado"
          acao="Ver o que está parado"
        />
      </div>

      {abaixo.length > 0 && (
        <section className="mt-9">
          <h2 className="text-rotulo font-bold uppercase text-gold">O que comprar</h2>
          <ul className="mt-3 divide-y divide-[color:var(--fio)] rounded border border-fio bg-cream-alt">
            {abaixo.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-semibold">
                    {l.nome} {l.cor && <span className="fraco">· {l.cor}</span>}
                  </p>
                  <p className="miudo">
                    Tem {milFormatado(l.saldoMil, l.unidade)} · mínimo{' '}
                    {milFormatado(l.estoqueMinimoMil, l.unidade)}
                  </p>
                </div>
                <Link href={`/compras/nova?tecido=${l.id}`} className="bt bt-vazio compacto py-2">
                  Registrar compra
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Cartao({
  rotulo,
  numero,
  nota,
  href,
  acao,
  grave = false,
}: {
  rotulo: string;
  numero: string;
  nota: string;
  href: string;
  acao: string;
  grave?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-2 rounded border bg-cream-alt p-4 transition-colors hover:border-gold ${
        grave ? 'border-alerta' : 'border-fio'
      }`}
    >
      <p className="text-rotulo font-semibold uppercase fraco">{rotulo}</p>
      <p className={`text-2xl font-bold leading-tight ${grave ? 'text-alerta' : ''}`}>{numero}</p>
      <p className="text-sm fraco">{nota}</p>
      <p className="mt-auto pt-2 text-rotulo font-bold uppercase text-gold">{acao} →</p>
    </Link>
  );
}
