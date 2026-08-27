import { db } from './db';
import { diasDesde } from './numeros';

/**
 * Situacao de cada remessa, derivada dos retornos. Retorno parcial e a
 * regra, nao a excecao — por isso a conta soma todos os retornos.
 */
export type SituacaoRemessa = {
  id: string;
  fornecedorNome: string;
  clienteNome: string | null;
  referencia: string;
  tipoServico: string;
  dataEnvio: Date;
  previsaoRetorno: Date;
  enviadas: number;
  retornadasOk: number;
  retornadasDefeito: number;
  aindaFora: number;
  valorTotalCentavos: number;
  valorPorPecaCentavos: number;
  fechada: boolean;
  atrasadaDias: number;
};

export const rotuloServico: Record<string, string> = {
  bordado: 'Bordado',
  dtf: 'DTF',
  silk: 'Silk screen',
  outro: 'Outro serviço',
};

export async function situacaoRemessas(empresaId: string): Promise<SituacaoRemessa[]> {
  const remessas = await db.remessa.findMany({
    where: { empresaId },
    include: { fornecedor: true, cliente: true, retornos: true },
    orderBy: { dataEnvio: 'desc' },
  });

  return remessas.map((r) => {
    const ok = r.retornos.reduce((s, v) => s + v.quantidadeOk, 0);
    const defeito = r.retornos.reduce((s, v) => s + v.quantidadeDefeito, 0);
    const fora = r.quantidadeEnviada - ok - defeito;
    const fechada = fora <= 0;

    return {
      id: r.id,
      fornecedorNome: r.fornecedor.nome,
      clienteNome: r.cliente?.nome ?? null,
      referencia: r.referencia,
      tipoServico: r.tipoServico,
      dataEnvio: r.dataEnvio,
      previsaoRetorno: r.previsaoRetorno,
      enviadas: r.quantidadeEnviada,
      retornadasOk: ok,
      retornadasDefeito: defeito,
      aindaFora: Math.max(fora, 0),
      valorPorPecaCentavos: r.valorPorPecaCentavos,
      valorTotalCentavos: r.valorPorPecaCentavos * r.quantidadeEnviada,
      fechada,
      // So conta atraso do que ainda nao voltou.
      atrasadaDias:
        !fechada && r.previsaoRetorno < new Date() ? diasDesde(r.previsaoRetorno) : 0,
    };
  });
}
