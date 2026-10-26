/**
 * Dados de exemplo de uma confecção. Servem para ela testar o sistema
 * antes de entrar com os dados reais.
 *
 * Clientes e fornecedores aqui são fictícios de propósito: nome real
 * dentro de registro inventado é o tipo de coisa que volta como problema.
 */
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { criarHash } from '../src/lib/senha';
import { somarMeses } from '../src/lib/numeros';
import { parcelasDaCondicao } from '../src/lib/financeiro-listas';

const db = new PrismaClient();

function diasAtras(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

/** Dia relativo a hoje, ao meio-dia (como o sistema grava vencimento). */
function dia(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(12, 0, 0, 0);
  return d;
}

/** Repete a regra de custo médio do lib/estoque para semear o histórico. */
async function lancarEstoque(dados: {
  empresaId: string;
  materiaPrimaId: string;
  tipo: string;
  quantidadeMil: number;
  custoUnitarioCentavos?: number;
  origemTipo?: string;
  origemId?: string;
  motivo: string;
  usuarioId: string;
  quando: Date;
}) {
  const ultimo = await db.movimentoEstoque.findFirst({
    where: { materiaPrimaId: dados.materiaPrimaId },
    orderBy: { criadoEm: 'desc' },
  });

  const saldo = ultimo?.saldoAposMil ?? 0;
  const medio = ultimo?.custoMedioAposCentavos ?? 0;
  const entrada = dados.quantidadeMil > 0;

  let novoMedio = medio;
  let custo = dados.custoUnitarioCentavos ?? medio;

  if (entrada) {
    custo = dados.custoUnitarioCentavos!;
    const saldoNovo = saldo + dados.quantidadeMil;
    const valorAtual = Math.round((Math.max(saldo, 0) * medio) / 1000);
    const valorEntrada = Math.round((dados.quantidadeMil * custo) / 1000);
    novoMedio =
      saldoNovo > 0 ? Math.round(((valorAtual + valorEntrada) * 1000) / saldoNovo) : 0;
  }

  await db.movimentoEstoque.create({
    data: {
      empresaId: dados.empresaId,
      materiaPrimaId: dados.materiaPrimaId,
      tipo: dados.tipo,
      quantidadeMil: dados.quantidadeMil,
      custoUnitarioCentavos: custo,
      custoMedioAposCentavos: novoMedio,
      saldoAposMil: saldo + dados.quantidadeMil,
      origemTipo: dados.origemTipo,
      origemId: dados.origemId,
      motivo: dados.motivo,
      usuarioId: dados.usuarioId,
      criadoEm: dados.quando,
    },
  });
}

/** Mesma lógica, para o razão de produto acabado (unidades inteiras, por frente). */
async function lancarProduto(dados: {
  empresaId: string;
  produtoAcabadoId: string;
  frente: 'fabrica' | 'loja' | 'ecommerce';
  tipo: string;
  quantidade: number;
  custoUnitarioCentavos: number;
  origemTipo?: string;
  origemId?: string;
  motivo: string;
  usuarioId: string;
  quando: Date;
}) {
  const ultimo = await db.movimentoProdutoAcabado.findFirst({
    where: { produtoAcabadoId: dados.produtoAcabadoId, frente: dados.frente },
    orderBy: { criadoEm: 'desc' },
  });
  const saldo = ultimo?.saldoAposUnidades ?? 0;

  await db.movimentoProdutoAcabado.create({
    data: {
      empresaId: dados.empresaId,
      produtoAcabadoId: dados.produtoAcabadoId,
      frente: dados.frente,
      tipo: dados.tipo,
      quantidade: dados.quantidade,
      custoUnitarioCentavos: dados.custoUnitarioCentavos,
      saldoAposUnidades: saldo + dados.quantidade,
      origemTipo: dados.origemTipo,
      origemId: dados.origemId,
      motivo: dados.motivo,
      usuarioId: dados.usuarioId,
      criadoEm: dados.quando,
    },
  });
}

async function main() {
  console.log('Limpando dados anteriores…');
  await db.notaFiscalVenda.deleteMany();
  await db.notaFiscal.deleteMany();
  await db.contaReceber.deleteMany();
  await db.contaPagar.deleteMany();
  await db.lancamentoCaixa.deleteMany();
  await db.vendaItem.deleteMany();
  await db.venda.deleteMany();
  await db.envioPecas.deleteMany();
  await db.movimentoProdutoAcabado.deleteMany();
  await db.produtoAcabado.deleteMany();
  await db.movimentoEstoque.deleteMany();
  await db.inventarioItem.deleteMany();
  await db.inventario.deleteMany();
  await db.compraItem.deleteMany();
  await db.compra.deleteMany();
  await db.tabelaPrecoItem.deleteMany();
  await db.tabelaPreco.deleteMany();
  await db.materiaPrima.deleteMany();
  await db.tipoProduto.deleteMany();
  await db.cliente.deleteMany();
  await db.fornecedor.deleteMany();
  await db.auditoria.deleteMany();
  await db.sessao.deleteMany();
  await db.usuario.deleteMany();
  await db.empresa.deleteMany();
  await db.configuracao.deleteMany();

  const empresa = await db.empresa.create({
    data: { nome: 'Arte e Moda', cnpj: '13.124.246/0001-17' },
  });

  console.log('Criando usuários…');
  const dona = await db.usuario.create({
    data: {
      empresaId: empresa.id,
      nome: 'Dona',
      email: 'dona@arteemoda.com.br',
      senhaHash: criarHash('arteemoda'),
      papel: 'dona',
    },
  });
  await db.usuario.create({
    data: {
      empresaId: empresa.id,
      nome: 'Produção',
      email: 'producao@arteemoda.com.br',
      senhaHash: criarHash('arteemoda'),
      papel: 'producao',
    },
  });
  const vendedora = await db.usuario.create({
    data: {
      empresaId: empresa.id,
      nome: 'Vendas',
      email: 'vendas@arteemoda.com.br',
      senhaHash: criarHash('arteemoda'),
      papel: 'vendas',
    },
  });

  console.log('Configurações pendentes de resposta…');
  await db.configuracao.createMany({
    data: [
      {
        chave: 'pagamento_costureiras',
        valor: 'salario_fixo',
        descricao:
          'Como as costureiras são pagas: salário fixo (confirmado em 25/10/2026). A costura entra no rateio das contas do mês, não no custo de cada peça.',
        pendente: false,
      },
      {
        chave: 'prazo_repasse_mercado_livre_dias',
        valor: '30',
        descricao:
          'Em quantos dias o Mercado Livre libera o dinheiro de uma venda (vira conta a receber até lá). Palpite: 30. Confirmar quando começarem a vender lá.',
        pendente: true,
      },
      {
        chave: 'regime_tributario',
        valor: '',
        descricao: 'Simples, MEI ou Lucro Presumido. Confirmar com o contador antes de emitir nota de verdade.',
        pendente: true,
      },
    ],
  });

  console.log('Criando setores de estoque…');
  const tipoTecido = await db.tipoProduto.create({
    data: { empresaId: empresa.id, nome: 'Tecido', unidadePadrao: 'metro', mostrarCamposTecido: true },
  });
  const tipoAgulha = await db.tipoProduto.create({
    data: { empresaId: empresa.id, nome: 'Agulha', unidadePadrao: 'unidade' },
  });
  const tipoElastico = await db.tipoProduto.create({
    data: { empresaId: empresa.id, nome: 'Elástico', unidadePadrao: 'metro' },
  });
  const tipoEtiqueta = await db.tipoProduto.create({
    data: { empresaId: empresa.id, nome: 'Etiqueta', unidadePadrao: 'unidade' },
  });
  const tipoZiper = await db.tipoProduto.create({
    data: { empresaId: empresa.id, nome: 'Zíper', unidadePadrao: 'unidade' },
  });

  console.log('Cadastrando fornecedores…');
  const malharia = await db.fornecedor.create({
    data: {
      empresaId: empresa.id,
      nome: 'Malharia São Bento',
      tipos: 'tecido',
      whatsapp: '(11) 3000-1000',
      contato: 'Seu Antônio',
      condicaoPagamento: '30',
      prazoMedioDias: 7,
    },
  });
  const textilNorte = await db.fornecedor.create({
    data: {
      empresaId: empresa.id,
      nome: 'Têxtil Norte',
      tipos: 'tecido,aviamento',
      whatsapp: '(11) 3000-2000',
      condicaoPagamento: '30_60',
      prazoMedioDias: 12,
    },
  });
  await db.fornecedor.create({
    data: {
      empresaId: empresa.id,
      nome: 'Aviamentos Central',
      tipos: 'aviamento',
      whatsapp: '(11) 99000-5000',
      condicaoPagamento: 'a_vista',
      prazoMedioDias: 3,
    },
  });

  const estamparia = await db.fornecedor.create({
    data: {
      empresaId: empresa.id,
      nome: 'Estamparia Ponto Fino',
      tipos: 'dtf,silk',
      whatsapp: '(11) 99000-6000',
      condicaoPagamento: 'a_vista',
      prazoMedioDias: 5,
    },
  });
  const bordados = await db.fornecedor.create({
    data: {
      empresaId: empresa.id,
      nome: 'Bordados Lírio',
      tipos: 'bordado',
      whatsapp: '(11) 99000-7000',
      condicaoPagamento: '30_60',
      prazoMedioDias: 8,
    },
  });

  console.log('Cadastrando tecidos e aviamentos…');
  const pv = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
      tipoProdutoId: tipoTecido.id,
      nome: 'Malha PV',
      cor: 'Azul marinho',
      composicao: '67% poliéster, 33% viscose',
      unidade: 'metro',
      larguraMil: 1800,
      gramaturaGm2: 180,
      estoqueMinimoMil: 60_000,
      localizacao: 'Prateleira 3',
    },
  });
  const pique = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
      tipoProdutoId: tipoTecido.id,
      nome: 'Malha piquê',
      cor: 'Branco',
      composicao: '100% algodão',
      unidade: 'metro',
      larguraMil: 1600,
      gramaturaGm2: 200,
      estoqueMinimoMil: 40_000,
      localizacao: 'Prateleira 1',
    },
  });
  const moletom = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
      tipoProdutoId: tipoTecido.id,
      nome: 'Moletom flanelado',
      cor: 'Cinza mescla',
      unidade: 'metro',
      larguraMil: 1850,
      gramaturaGm2: 320,
      estoqueMinimoMil: 30_000,
      localizacao: 'Prateleira 5',
    },
  });
  const ribana = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
      tipoProdutoId: tipoTecido.id,
      nome: 'Ribana',
      cor: 'Azul marinho',
      unidade: 'metro',
      estoqueMinimoMil: 40_000,
      localizacao: 'Prateleira 3',
    },
  });
  const agulha = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
      tipoProdutoId: tipoAgulha.id,
      nome: 'Agulha reta 90/14',
      unidade: 'unidade',
      estoqueMinimoMil: 50_000,
      localizacao: 'Armário 1',
    },
  });
  const elastico = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
      tipoProdutoId: tipoElastico.id,
      nome: 'Elástico 20mm',
      cor: 'Branco',
      unidade: 'metro',
      estoqueMinimoMil: 30_000,
      localizacao: 'Armário 2',
    },
  });
  const etiqueta = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
      tipoProdutoId: tipoEtiqueta.id,
      nome: 'Etiqueta bordada Arte e Moda',
      unidade: 'unidade',
      estoqueMinimoMil: 500_000,
      localizacao: 'Armário 1',
    },
  });
  const ziper = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
      tipoProdutoId: tipoZiper.id,
      nome: 'Zíper 20cm',
      cor: 'Preto',
      unidade: 'unidade',
      estoqueMinimoMil: 20_000,
      localizacao: 'Armário 2',
    },
  });

  console.log('Registrando preços (com histórico)…');
  const antiga = await db.tabelaPreco.create({
    data: { fornecedorId: malharia.id, vigenciaInicio: diasAtras(120), vigenciaFim: diasAtras(20) },
  });
  await db.tabelaPrecoItem.create({
    data: {
      tabelaPrecoId: antiga.id,
      tipo: 'materia_prima',
      materiaPrimaId: pv.id,
      descricao: 'Malha PV Azul marinho',
      unidade: 'metro',
      precoCentavos: 1780,
    },
  });
  const vigente = await db.tabelaPreco.create({
    data: { fornecedorId: malharia.id, vigenciaInicio: diasAtras(20) },
  });
  await db.tabelaPrecoItem.createMany({
    data: [
      {
        tabelaPrecoId: vigente.id,
        tipo: 'materia_prima',
        materiaPrimaId: pv.id,
        descricao: 'Malha PV Azul marinho',
        unidade: 'metro',
        precoCentavos: 1990,
      },
      {
        tabelaPrecoId: vigente.id,
        tipo: 'materia_prima',
        materiaPrimaId: ribana.id,
        descricao: 'Ribana Azul marinho',
        unidade: 'metro',
        precoCentavos: 1290,
      },
    ],
  });
  const tabelaNorte = await db.tabelaPreco.create({
    data: { fornecedorId: textilNorte.id, vigenciaInicio: diasAtras(30) },
  });
  await db.tabelaPrecoItem.create({
    data: {
      tabelaPrecoId: tabelaNorte.id,
      tipo: 'materia_prima',
      materiaPrimaId: pv.id,
      descricao: 'Malha PV Azul marinho',
      unidade: 'metro',
      precoCentavos: 1855,
    },
  });

  console.log('Abrindo o caixa…');
  // Mesmo caminho da tela: abertura registrada na auditoria + lancamento.
  await db.auditoria.create({
    data: {
      empresaId: empresa.id, usuarioId: dona.id, entidade: 'caixa', entidadeId: empresa.id,
      acao: 'abriu', resumo: 'Abriu o caixa com R$ 9.000,00', criadoEm: diasAtras(70),
    },
  });
  await db.lancamentoCaixa.create({
    data: {
      empresaId: empresa.id, tipo: 'entrada', origemTipo: 'abertura', valorCentavos: 900_000,
      descricao: 'Saldo de abertura: a empresa tinha R$ 9.000,00', usuarioId: dona.id, data: diasAtras(70),
    },
  });

  /** Conta ja paga: a conta e a saida no caixa nascem juntas, como na tela. */
  async function contaPaga(dados: {
    descricao: string; categoria: string; valorCentavos: number; quando: Date;
    fornecedorId?: string; compraId?: string; grupoId?: string; parcela?: number; totalParcelas?: number; fixaMensal?: boolean;
  }) {
    const conta = await db.contaPagar.create({
      data: {
        empresaId: empresa.id, descricao: dados.descricao, categoria: dados.categoria,
        fornecedorId: dados.fornecedorId, compraId: dados.compraId, grupoId: dados.grupoId,
        parcela: dados.parcela ?? 1, totalParcelas: dados.totalParcelas ?? 1, fixaMensal: dados.fixaMensal ?? false,
        valorCentavos: dados.valorCentavos, vencimento: dados.quando, situacao: 'paga', pagoEm: dados.quando,
        valorPagoCentavos: dados.valorCentavos, formaPagamento: 'pix', usuarioId: dona.id,
      },
    });
    await db.lancamentoCaixa.create({
      data: {
        empresaId: empresa.id, tipo: 'saida', origemTipo: 'conta_pagar', origemId: conta.id,
        valorCentavos: dados.valorCentavos, descricao: dados.descricao, categoria: dados.categoria,
        usuarioId: dona.id, data: dados.quando,
      },
    });
  }

  /** Conta fixa: o primeiro mes ja pago, os outros 11 em aberto. */
  async function contaFixa(descricao: string, categoria: string, valorCentavos: number, primeiro: Date) {
    const grupoId = randomUUID();
    await contaPaga({ descricao, categoria, valorCentavos, quando: primeiro, grupoId, parcela: 1, totalParcelas: 12, fixaMensal: true });
    for (let i = 1; i < 12; i++) {
      await db.contaPagar.create({
        data: {
          empresaId: empresa.id, descricao, categoria, grupoId, parcela: i + 1, totalParcelas: 12, fixaMensal: true,
          valorCentavos, vencimento: somarMeses(primeiro, i), usuarioId: dona.id,
        },
      });
    }
  }

  console.log('Cadastrando clientes…');
  const alfa = await db.cliente.create({
    data: {
      empresaId: empresa.id,
      tipo: 'escola',
      nome: 'Colégio Alfa',
      contato: 'Secretaria',
      whatsapp: '(11) 3000-7000',
      condicaoPagamento: '30',
    },
  });
  const bertoni = await db.cliente.create({
    data: {
      empresaId: empresa.id,
      tipo: 'empresa',
      nome: 'Metalúrgica Bertoni',
      condicaoPagamento: '30_60',
    },
  });
  const ruaNove = await db.cliente.create({
    data: { empresaId: empresa.id, tipo: 'marca', nome: 'Marca Rua Nove', condicaoPagamento: 'a_vista' },
  });
  const colegioSaoJorge = await db.cliente.create({
    data: {
      empresaId: empresa.id,
      tipo: 'escola',
      nome: 'Colégio São Jorge',
      contato: 'Secretaria',
      whatsapp: '(11) 3000-8000',
      condicaoPagamento: '30',
    },
  });

  console.log('Anotando retalhos…');
  // Valor do kg pela largura e gramatura de cada malha (o mesmo calculo da
  // tela). Datas antigas de proposito: e o dinheiro parado que a dona contou.
  const tipoRetalho = await db.tipoProduto.create({
    data: { empresaId: empresa.id, nome: 'Retalho', unidadePadrao: 'kg' },
  });
  const retalhos = [
    { de: pv, nome: 'Retalho de Malha PV', cor: 'Azul marinho', kg: 3_200, valorKg: 5_800, dias: 40, local: 'Caixa 1' },
    { de: pique, nome: 'Retalho de Malha piquê', cor: 'Branco', kg: 2_500, valorKg: 6_900, dias: 210, local: 'Caixa 1' },
    { de: moletom, nome: 'Retalho de Moletom flanelado', cor: 'Cinza mescla', kg: 4_000, valorKg: 5_370, dias: 400, local: 'Caixa 2' },
    { de: null, nome: 'Retalho de Helanca', cor: 'Verde bandeira', kg: 2_000, valorKg: 3_000, dias: 250, local: 'Caixa 2' },
  ];
  for (const r of retalhos) {
    const item = await db.materiaPrima.create({
      data: {
        empresaId: empresa.id, tipoProdutoId: tipoRetalho.id, nome: r.nome, cor: r.cor, unidade: 'kg',
        localizacao: r.local, retalhoDeId: r.de?.id ?? null,
        larguraMil: r.de?.larguraMil ?? null, gramaturaGm2: r.de?.gramaturaGm2 ?? null,
      },
    });
    await lancarEstoque({
      empresaId: empresa.id, materiaPrimaId: item.id, tipo: 'entrada_retalho',
      quantidadeMil: r.kg, custoUnitarioCentavos: r.valorKg, origemTipo: 'manual',
      motivo: 'Retalho anotado — valor estimado', usuarioId: dona.id, quando: diasAtras(r.dias),
    });
  }

  console.log('Registrando compras e movimentando o estoque…');

  const abertura = await db.inventario.create({
    data: { empresaId: empresa.id, data: diasAtras(240), status: 'aplicado', abertura: true },
  });
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: moletom.id, tipo: 'entrada_inicial',
    quantidadeMil: 96_000, custoUnitarioCentavos: 3180,
    origemTipo: 'inventario', origemId: abertura.id, motivo: 'Estoque inicial',
    usuarioId: dona.id, quando: diasAtras(240),
  });
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: pique.id, tipo: 'entrada_inicial',
    quantidadeMil: 64_500, custoUnitarioCentavos: 2210,
    origemTipo: 'inventario', origemId: abertura.id, motivo: 'Estoque inicial',
    usuarioId: dona.id, quando: diasAtras(210),
  });
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: agulha.id, tipo: 'entrada_inicial',
    quantidadeMil: 200_000, custoUnitarioCentavos: 45,
    origemTipo: 'inventario', origemId: abertura.id, motivo: 'Estoque inicial',
    usuarioId: dona.id, quando: diasAtras(200),
  });
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: etiqueta.id, tipo: 'entrada_inicial',
    quantidadeMil: 800_000, custoUnitarioCentavos: 35,
    origemTipo: 'inventario', origemId: abertura.id, motivo: 'Estoque inicial',
    usuarioId: dona.id, quando: diasAtras(200),
  });

  const compra1 = await db.compra.create({
    data: { empresaId: empresa.id, fornecedorId: malharia.id, numeroNf: '10421', data: diasAtras(64), freteCentavos: 12_000 },
  });
  await db.compraItem.create({
    data: { compraId: compra1.id, materiaPrimaId: pv.id, quantidadeMil: 200_000, valorUnitarioCentavos: 1780, rateioCentavos: 12_000 },
  });
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: pv.id, tipo: 'entrada_compra',
    quantidadeMil: 200_000, custoUnitarioCentavos: 1840,
    origemTipo: 'compra', origemId: compra1.id, motivo: 'Nota 10421',
    usuarioId: dona.id, quando: diasAtras(64),
  });
  await contaPaga({
    descricao: 'Compra Malharia São Bento — nota 10421', categoria: 'tecido_aviamento',
    valorCentavos: 368_000, quando: diasAtras(64), fornecedorId: malharia.id, compraId: compra1.id,
  });

  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: pv.id, tipo: 'saida_producao',
    quantidadeMil: -102_000, origemTipo: 'manual', motivo: 'Corte — polo Colégio Alfa, lote de agosto',
    usuarioId: dona.id, quando: diasAtras(14),
  });

  const compra2 = await db.compra.create({
    data: { empresaId: empresa.id, fornecedorId: malharia.id, numeroNf: '10998', data: diasAtras(12), freteCentavos: 9_000 },
  });
  await db.compraItem.create({
    data: { compraId: compra2.id, materiaPrimaId: pv.id, quantidadeMil: 30_000, valorUnitarioCentavos: 1990, rateioCentavos: 9_000 },
  });
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: pv.id, tipo: 'entrada_compra',
    quantidadeMil: 30_000, custoUnitarioCentavos: 2290,
    origemTipo: 'compra', origemId: compra2.id, motivo: 'Nota 10998',
    usuarioId: dona.id, quando: diasAtras(12),
  });
  await db.contaPagar.create({
    data: {
      empresaId: empresa.id, descricao: 'Compra Malharia São Bento — nota 10998', categoria: 'tecido_aviamento',
      fornecedorId: malharia.id, compraId: compra2.id, valorCentavos: 68_700, vencimento: dia(18), usuarioId: dona.id,
    },
  });

  const compra3 = await db.compra.create({
    data: { empresaId: empresa.id, fornecedorId: malharia.id, numeroNf: '11002', data: diasAtras(4) },
  });
  await db.compraItem.create({
    data: { compraId: compra3.id, materiaPrimaId: ribana.id, quantidadeMil: 18_200, valorUnitarioCentavos: 1290 },
  });
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: ribana.id, tipo: 'entrada_compra',
    quantidadeMil: 18_200, custoUnitarioCentavos: 1290,
    origemTipo: 'compra', origemId: compra3.id, motivo: 'Nota 11002',
    usuarioId: dona.id, quando: diasAtras(4),
  });
  await db.contaPagar.create({
    data: {
      empresaId: empresa.id, descricao: 'Compra Malharia São Bento — nota 11002', categoria: 'tecido_aviamento',
      fornecedorId: malharia.id, compraId: compra3.id, valorCentavos: 23_478, vencimento: dia(26), usuarioId: dona.id,
    },
  });

  // Elástico e zíper ficam abaixo do mínimo de propósito.
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: elastico.id, tipo: 'entrada_inicial',
    quantidadeMil: 8_000, custoUnitarioCentavos: 90,
    origemTipo: 'inventario', motivo: 'Estoque inicial',
    usuarioId: dona.id, quando: diasAtras(180),
  });
  await lancarEstoque({
    empresaId: empresa.id, materiaPrimaId: ziper.id, tipo: 'entrada_inicial',
    quantidadeMil: 12_000, custoUnitarioCentavos: 180,
    origemTipo: 'inventario', motivo: 'Estoque inicial',
    usuarioId: dona.id, quando: diasAtras(180),
  });

  console.log('Cadastrando peças…');
  const poloP = await db.produtoAcabado.create({
    data: { empresaId: empresa.id, nome: 'Polo Colégio Alfa', tamanho: 'P', cor: 'Azul marinho', sku: '7891000000012', precoVendaCentavos: 6900, custoCentavos: 3200, estoqueMinimo: 10 },
  });
  const poloM = await db.produtoAcabado.create({
    data: { empresaId: empresa.id, nome: 'Polo Colégio Alfa', tamanho: 'M', cor: 'Azul marinho', sku: '7891000000029', precoVendaCentavos: 6900, custoCentavos: 3200, estoqueMinimo: 10 },
  });
  const poloG = await db.produtoAcabado.create({
    data: { empresaId: empresa.id, nome: 'Polo Colégio Alfa', tamanho: 'G', cor: 'Azul marinho', sku: '7891000000036', precoVendaCentavos: 6900, custoCentavos: 3200, estoqueMinimo: 8 },
  });
  const moletomM = await db.produtoAcabado.create({
    data: { empresaId: empresa.id, nome: 'Moletom Colégio São Jorge', tamanho: 'M', cor: 'Cinza', sku: '7891000000043', precoVendaCentavos: 12900, custoCentavos: 6400, estoqueMinimo: 5 },
  });
  const camisetaRuaNove = await db.produtoAcabado.create({
    data: { empresaId: empresa.id, nome: 'Camiseta Rua Nove básica', tamanho: 'M', cor: 'Branco', sku: '7891000000050', precoVendaCentavos: 4500, custoCentavos: 1800, estoqueMinimo: 15 },
  });
  // Camiseta básica do e-commerce (exemplo).
  const basicaM = await db.produtoAcabado.create({
    data: { empresaId: empresa.id, nome: 'Camiseta básica', tamanho: 'M', cor: 'Preta', sku: '7891000000067', precoVendaCentavos: 3990, custoCentavos: 1500, estoqueMinimo: 10 },
  });
  const basicaG = await db.produtoAcabado.create({
    data: { empresaId: empresa.id, nome: 'Camiseta básica', tamanho: 'G', cor: 'Preta', sku: '7891000000074', precoVendaCentavos: 3990, custoCentavos: 1500, estoqueMinimo: 10 },
  });

  // Toda peça nasce na Fábrica...
  const producao = [[poloP, 60], [poloM, 90], [poloG, 50], [moletomM, 30], [camisetaRuaNove, 60], [basicaM, 40], [basicaG, 40]] as const;
  for (const [produto, qtd] of producao) {
    await lancarProduto({
      empresaId: empresa.id, produtoAcabadoId: produto.id, frente: 'fabrica', tipo: 'entrada_producao',
      quantidade: qtd, custoUnitarioCentavos: produto.custoCentavos,
      origemTipo: 'manual', motivo: 'Entrada da produção',
      usuarioId: dona.id, quando: diasAtras(35),
    });
  }

  // ...e vai para a Loja e o E-commerce por envio.
  async function enviar(produto: typeof poloP, para: 'loja' | 'ecommerce', qtd: number, quando: Date) {
    const envio = await db.envioPecas.create({
      data: { empresaId: empresa.id, de: 'fabrica', para, usuarioId: dona.id, criadoEm: quando },
    });
    const comum = {
      empresaId: empresa.id, produtoAcabadoId: produto.id, custoUnitarioCentavos: produto.custoCentavos,
      origemTipo: 'envio', origemId: envio.id, usuarioId: dona.id, quando,
    };
    await lancarProduto({ ...comum, frente: 'fabrica', tipo: 'envio_saida', quantidade: -qtd, motivo: para === 'loja' ? 'Enviada para a Loja' : 'Enviada para o E-commerce' });
    await lancarProduto({ ...comum, frente: para, tipo: 'envio_entrada', quantidade: qtd, motivo: 'Recebida da Fábrica' });
  }
  for (const [produto, qtd] of [[poloP, 25], [poloM, 30], [poloG, 20], [camisetaRuaNove, 50]] as const) {
    await enviar(produto, 'loja', qtd, diasAtras(34));
  }
  await enviar(basicaM, 'ecommerce', 25, diasAtras(15));
  await enviar(basicaG, 'ecommerce', 25, diasAtras(15));

  console.log('Registrando vendas dos últimos 30 dias…');
  const pecasLoja = [poloP, poloM, poloG, camisetaRuaNove];

  async function registrarVenda(dados: {
    frente: 'fabrica' | 'loja' | 'ecommerce';
    clienteId: string | null;
    formaPagamento: string;
    itens: { produto: typeof poloP; quantidade: number }[];
    quando: Date;
  }) {
    const totalCentavos = dados.itens.reduce((s, i) => s + i.quantidade * i.produto.precoVendaCentavos, 0);
    const venda = await db.venda.create({
      data: {
        empresaId: empresa.id,
        clienteId: dados.clienteId,
        frente: dados.frente,
        formaPagamento: dados.formaPagamento,
        totalCentavos,
        usuarioId: vendedora.id,
        criadoEm: dados.quando,
      },
    });
    for (const item of dados.itens) {
      await db.vendaItem.create({
        data: {
          vendaId: venda.id,
          produtoAcabadoId: item.produto.id,
          quantidade: item.quantidade,
          precoUnitarioCentavos: item.produto.precoVendaCentavos,
        },
      });
      await lancarProduto({
        empresaId: empresa.id, produtoAcabadoId: item.produto.id, frente: dados.frente, tipo: 'saida_venda',
        quantidade: -item.quantidade, custoUnitarioCentavos: item.produto.custoCentavos,
        origemTipo: 'venda', origemId: venda.id, motivo: 'Venda',
        usuarioId: vendedora.id, quando: dados.quando,
      });
    }
    const descricaoVenda = { fabrica: 'Pedido da fábrica', loja: 'Venda na loja', ecommerce: 'Venda no e-commerce' }[dados.frente];
    if (dados.formaPagamento === 'mercado_livre') {
      // Mesma regra de vendas/acoes.ts: o Mercado Livre libera depois (palpite: 30 dias).
      const vencimento = new Date(dados.quando);
      vencimento.setDate(vencimento.getDate() + 30);
      vencimento.setHours(12, 0, 0, 0);
      await db.contaReceber.create({
        data: {
          empresaId: empresa.id, descricao: 'Mercado Livre', vendaId: venda.id, frente: dados.frente,
          valorCentavos: totalCentavos, vencimento, usuarioId: vendedora.id,
        },
      });
    } else if (dados.formaPagamento !== 'fiado') {
      await db.lancamentoCaixa.create({
        data: {
          empresaId: empresa.id, tipo: 'entrada', origemTipo: 'venda', origemId: venda.id, frente: dados.frente,
          valorCentavos: totalCentavos, descricao: descricaoVenda,
          usuarioId: vendedora.id, data: dados.quando,
        },
      });
    } else {
      // Mesma regra de vendas/acoes.ts: fiado vira conta a receber no prazo do cliente.
      const cliente = dados.clienteId ? await db.cliente.findUnique({ where: { id: dados.clienteId } }) : null;
      const condicao = cliente && cliente.condicaoPagamento !== 'a_vista' ? cliente.condicaoPagamento : '30';
      const parcelas = parcelasDaCondicao(condicao, dados.quando, totalCentavos);
      const grupoId = parcelas.length > 1 ? randomUUID() : null;
      for (const [i, p] of parcelas.entries()) {
        await db.contaReceber.create({
          data: {
            empresaId: empresa.id, descricao: `Venda fiado — ${cliente?.nome ?? 'sem cliente'}`,
            clienteId: dados.clienteId, vendaId: venda.id, frente: dados.frente, grupoId, parcela: i + 1, totalParcelas: parcelas.length,
            valorCentavos: p.valorCentavos, vencimento: p.vencimento, usuarioId: vendedora.id,
          },
        });
      }
    }
    return venda;
  }

  // Vendas de loja espalhadas pelos últimos 30 dias — dá volume pro gráfico e pro ranking.
  const formas = ['dinheiro', 'pix', 'cartao'];
  for (let dia = 29; dia >= 0; dia--) {
    const vendasNoDia = dia % 3 === 0 ? 2 : dia % 2 === 0 ? 1 : 0;
    for (let v = 0; v < vendasNoDia; v++) {
      const produto = pecasLoja[(dia + v) % pecasLoja.length];
      const clienteOcasional = v === 0 && dia % 5 === 0 ? ruaNove.id : null;
      await registrarVenda({
        frente: 'loja',
        clienteId: clienteOcasional,
        formaPagamento: formas[(dia + v) % formas.length],
        itens: [{ produto, quantidade: 1 + (v % 2) }],
        quando: diasAtras(dia),
      });
    }
  }

  // Pedidos de produção — venda fechada para as escolas, valores maiores.
  await registrarVenda({
    frente: 'fabrica',
    clienteId: alfa.id,
    formaPagamento: 'fiado',
    itens: [
      { produto: poloP, quantidade: 15 },
      { produto: poloM, quantidade: 20 },
      { produto: poloG, quantidade: 10 },
    ],
    quando: diasAtras(18),
  });
  await registrarVenda({
    frente: 'fabrica',
    clienteId: colegioSaoJorge.id,
    formaPagamento: 'pix',
    itens: [{ produto: moletomM, quantidade: 12 }],
    quando: diasAtras(9),
  });
  await registrarVenda({
    frente: 'fabrica',
    clienteId: alfa.id,
    formaPagamento: 'fiado',
    itens: [{ produto: poloM, quantidade: 8 }],
    quando: diasAtras(2),
  });

  // E-commerce: vendas do Mercado Livre lançadas à mão (o dinheiro cai depois).
  for (const [dia, produto, qtd] of [[10, basicaM, 2], [6, basicaG, 1], [3, basicaM, 3], [1, basicaG, 2]] as const) {
    await registrarVenda({
      frente: 'ecommerce',
      clienteId: null,
      formaPagamento: 'mercado_livre',
      itens: [{ produto, quantidade: qtd }],
      quando: diasAtras(dia),
    });
  }

  console.log('Contas do mês…');
  await contaFixa('Aluguel do galpão', 'aluguel', 320_000, dia(-25));
  await contaFixa('Internet e telefone', 'consumo', 14_990, dia(-20));
  // Uma vencida de proposito: e o que a tela tem que mostrar primeiro.
  await db.contaPagar.create({
    data: { empresaId: empresa.id, descricao: 'Conta de luz', categoria: 'consumo', valorCentavos: 48_630, vencimento: dia(-2), usuarioId: dona.id },
  });
  await db.contaPagar.create({
    data: {
      empresaId: empresa.id, descricao: 'DTF das polos Colégio Alfa', categoria: 'servico', fornecedorId: estamparia.id,
      valorCentavos: 84_000, vencimento: dia(3), usuarioId: dona.id,
    },
  });
  const grupoBordado = randomUUID();
  for (const [i, vencimento] of [dia(12), dia(42)].entries()) {
    await db.contaPagar.create({
      data: {
        empresaId: empresa.id, descricao: 'Bordado do brasão — moletons São Jorge', categoria: 'servico',
        fornecedorId: bordados.id, grupoId: grupoBordado, parcela: i + 1, totalParcelas: 2,
        valorCentavos: 63_000, vencimento, usuarioId: dona.id,
      },
    });
  }
  await db.lancamentoCaixa.create({
    data: {
      empresaId: empresa.id, tipo: 'saida', origemTipo: 'manual', categoria: 'divulgacao', valorCentavos: 30_000,
      descricao: 'Impulsionamento no Instagram', usuarioId: dona.id, data: diasAtras(8),
    },
  });

  // Pedido com sinal: metade entrou, o restante fica a receber na entrega.
  await db.lancamentoCaixa.create({
    data: {
      empresaId: empresa.id, tipo: 'entrada', origemTipo: 'manual', categoria: 'sinal', valorCentavos: 120_000,
      descricao: 'Sinal do pedido Metalúrgica Bertoni', usuarioId: dona.id, data: diasAtras(6),
    },
  });
  await db.contaReceber.create({
    data: {
      empresaId: empresa.id, descricao: 'Restante do pedido Metalúrgica Bertoni', clienteId: bertoni.id,
      valorCentavos: 120_000, vencimento: dia(15), usuarioId: dona.id,
    },
  });
  await db.contaReceber.create({
    data: {
      empresaId: empresa.id, descricao: 'Reposição de uniformes — Colégio São Jorge', clienteId: colegioSaoJorge.id,
      valorCentavos: 38_000, vencimento: dia(-6), usuarioId: dona.id,
    },
  });

  console.log('\nPronto. Entre com:');
  console.log('  dona@arteemoda.com.br / arteemoda      (vê tudo)');
  console.log('  producao@arteemoda.com.br / arteemoda  (sem financeiro, sem nota fiscal)');
  console.log('  vendas@arteemoda.com.br / arteemoda     (vendas e clientes)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
