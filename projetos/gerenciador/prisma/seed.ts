/**
 * Dados de exemplo de uma confecção. Servem para ela testar o sistema
 * antes de entrar com os dados reais.
 *
 * Clientes e parceiros aqui são fictícios de propósito: nome de cliente
 * real dentro de registro inventado é o tipo de coisa que volta como
 * problema.
 */
import { PrismaClient } from '@prisma/client';
import { criarHash } from '../src/lib/senha';

const db = new PrismaClient();

function diasAtras(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}
function diasAFrente(n: number): Date {
  return new Date(Date.now() + n * 86_400_000);
}

/** Repete a regra de custo médio do lib/estoque para semear o histórico. */
async function lancar(dados: {
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

async function main() {
  console.log('Limpando dados anteriores…');
  await db.retorno.deleteMany();
  await db.remessa.deleteMany();
  await db.movimentoEstoque.deleteMany();
  await db.inventarioItem.deleteMany();
  await db.inventario.deleteMany();
  await db.compraItem.deleteMany();
  await db.compra.deleteMany();
  await db.tabelaPrecoItem.deleteMany();
  await db.tabelaPreco.deleteMany();
  await db.materiaPrima.deleteMany();
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

  console.log('Configurações pendentes de resposta…');
  await db.configuracao.createMany({
    data: [
      {
        chave: 'pagamento_costureiras',
        valor: 'salario_fixo',
        descricao:
          'Como as costureiras são pagas. Muda se a costura entra no custo da peça ou no rateio das contas do mês. Confirmar com a dona.',
        pendente: true,
      },
      {
        chave: 'regime_tributario',
        valor: '',
        descricao: 'Simples, MEI ou Lucro Presumido. Confirmar com o contador antes da Fase 5.',
        pendente: true,
      },
      {
        chave: 'prazo_padrao_parceiro_dias',
        valor: '7',
        descricao: 'Prazo padrão sugerido para retorno de peças do parceiro. Ajustar com a dona.',
        pendente: true,
      },
    ],
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
  const bordados = await db.fornecedor.create({
    data: {
      empresaId: empresa.id,
      nome: 'Bordados Vitória',
      tipos: 'bordado',
      whatsapp: '(11) 99000-3000',
      contato: 'Vitória',
      condicaoPagamento: 'a_vista',
      prazoMedioDias: 7,
    },
  });
  const estamparia = await db.fornecedor.create({
    data: {
      empresaId: empresa.id,
      nome: 'Estamparia Nordeste',
      tipos: 'dtf,silk',
      whatsapp: '(11) 99000-4000',
      condicaoPagamento: 'a_vista',
      prazoMedioDias: 5,
    },
  });

  console.log('Cadastrando tecidos…');
  const pv = await db.materiaPrima.create({
    data: {
      empresaId: empresa.id,
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
      nome: 'Ribana',
      cor: 'Azul marinho',
      unidade: 'metro',
      estoqueMinimoMil: 40_000,
      localizacao: 'Prateleira 3',
    },
  });

  console.log('Registrando preços (com histórico)…');
  // Vigência antiga da Malharia — é ela que faz aparecer "subiu X%".
  const antiga = await db.tabelaPreco.create({
    data: {
      fornecedorId: malharia.id,
      vigenciaInicio: diasAtras(120),
      vigenciaFim: diasAtras(20),
    },
  });
  await db.tabelaPrecoItem.createMany({
    data: [
      {
        tabelaPrecoId: antiga.id,
        tipo: 'materia_prima',
        materiaPrimaId: pv.id,
        descricao: 'Malha PV Azul marinho',
        unidade: 'metro',
        precoCentavos: 1780,
      },
    ],
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

  // Concorrente com o mesmo tecido — alimenta o comparador.
  const tabelaNorte = await db.tabelaPreco.create({
    data: { fornecedorId: textilNorte.id, vigenciaInicio: diasAtras(30) },
  });
  await db.tabelaPrecoItem.createMany({
    data: [
      {
        tabelaPrecoId: tabelaNorte.id,
        tipo: 'materia_prima',
        materiaPrimaId: pv.id,
        descricao: 'Malha PV Azul marinho',
        unidade: 'metro',
        precoCentavos: 1855,
      },
    ],
  });

  const tabelaBordado = await db.tabelaPreco.create({
    data: { fornecedorId: bordados.id, vigenciaInicio: diasAtras(60) },
  });
  await db.tabelaPrecoItem.createMany({
    data: [
      {
        tabelaPrecoId: tabelaBordado.id,
        tipo: 'servico',
        tipoServico: 'bordado',
        descricao: 'Bordado de logo pequeno no peito',
        unidade: 'peca',
        precoCentavos: 350,
      },
    ],
  });
  const tabelaEstamparia = await db.tabelaPreco.create({
    data: { fornecedorId: estamparia.id, vigenciaInicio: diasAtras(45) },
  });
  await db.tabelaPrecoItem.createMany({
    data: [
      {
        tabelaPrecoId: tabelaEstamparia.id,
        tipo: 'servico',
        tipoServico: 'bordado',
        descricao: 'Bordado de logo pequeno no peito',
        unidade: 'peca',
        precoCentavos: 420,
      },
      {
        tabelaPrecoId: tabelaEstamparia.id,
        tipo: 'servico',
        tipoServico: 'dtf',
        descricao: 'DTF A4 colorido',
        unidade: 'peca',
        precoCentavos: 210,
      },
    ],
  });

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
  await db.cliente.create({
    data: {
      empresaId: empresa.id,
      tipo: 'empresa',
      nome: 'Metalúrgica Bertoni',
      condicaoPagamento: '30_60',
    },
  });
  await db.cliente.create({
    data: { empresaId: empresa.id, tipo: 'marca', nome: 'Marca Rua Nove', condicaoPagamento: 'a_vista' },
  });

  console.log('Registrando compras e movimentando o estoque…');

  // Estoque de abertura: o que já estava na prateleira.
  const abertura = await db.inventario.create({
    data: { empresaId: empresa.id, data: diasAtras(240), status: 'aplicado', abertura: true },
  });
  await lancar({
    empresaId: empresa.id,
    materiaPrimaId: moletom.id,
    tipo: 'entrada_inicial',
    quantidadeMil: 96_000,
    custoUnitarioCentavos: 3180,
    origemTipo: 'inventario',
    origemId: abertura.id,
    motivo: 'Estoque inicial',
    usuarioId: dona.id,
    quando: diasAtras(240),
  });
  await lancar({
    empresaId: empresa.id,
    materiaPrimaId: pique.id,
    tipo: 'entrada_inicial',
    quantidadeMil: 64_500,
    custoUnitarioCentavos: 2210,
    origemTipo: 'inventario',
    origemId: abertura.id,
    motivo: 'Estoque inicial',
    usuarioId: dona.id,
    quando: diasAtras(210),
  });

  // Compra antiga de PV, mais barata.
  const compra1 = await db.compra.create({
    data: {
      empresaId: empresa.id,
      fornecedorId: malharia.id,
      numeroNf: '10421',
      data: diasAtras(64),
      freteCentavos: 12_000,
    },
  });
  await db.compraItem.create({
    data: {
      compraId: compra1.id,
      materiaPrimaId: pv.id,
      quantidadeMil: 200_000,
      valorUnitarioCentavos: 1780,
      rateioCentavos: 12_000,
    },
  });
  await lancar({
    empresaId: empresa.id,
    materiaPrimaId: pv.id,
    tipo: 'entrada_compra',
    quantidadeMil: 200_000,
    custoUnitarioCentavos: 1840, // 17,80 + frete rateado
    origemTipo: 'compra',
    origemId: compra1.id,
    motivo: 'Nota 10421',
    usuarioId: dona.id,
    quando: diasAtras(64),
  });

  // Saída para produção — o corte do lote do Colégio Alfa.
  await lancar({
    empresaId: empresa.id,
    materiaPrimaId: pv.id,
    tipo: 'saida_producao',
    quantidadeMil: -102_000,
    origemTipo: 'manual',
    motivo: 'Corte — polo Colégio Alfa, lote de agosto',
    usuarioId: dona.id,
    quando: diasAtras(14),
  });

  // Compra nova de PV, mais cara: faz o "▲" aparecer no estoque.
  const compra2 = await db.compra.create({
    data: {
      empresaId: empresa.id,
      fornecedorId: malharia.id,
      numeroNf: '10998',
      data: diasAtras(12),
      freteCentavos: 9_000,
    },
  });
  await db.compraItem.create({
    data: {
      compraId: compra2.id,
      materiaPrimaId: pv.id,
      quantidadeMil: 30_000,
      valorUnitarioCentavos: 1990,
      rateioCentavos: 9_000,
    },
  });
  await lancar({
    empresaId: empresa.id,
    materiaPrimaId: pv.id,
    tipo: 'entrada_compra',
    quantidadeMil: 30_000,
    custoUnitarioCentavos: 2290,
    origemTipo: 'compra',
    origemId: compra2.id,
    motivo: 'Nota 10998',
    usuarioId: dona.id,
    quando: diasAtras(12),
  });

  // Ribana entra pouco: fica abaixo do mínimo de propósito.
  const compra3 = await db.compra.create({
    data: {
      empresaId: empresa.id,
      fornecedorId: malharia.id,
      numeroNf: '11002',
      data: diasAtras(4),
    },
  });
  await db.compraItem.create({
    data: {
      compraId: compra3.id,
      materiaPrimaId: ribana.id,
      quantidadeMil: 18_200,
      valorUnitarioCentavos: 1290,
    },
  });
  await lancar({
    empresaId: empresa.id,
    materiaPrimaId: ribana.id,
    tipo: 'entrada_compra',
    quantidadeMil: 18_200,
    custoUnitarioCentavos: 1290,
    origemTipo: 'compra',
    origemId: compra3.id,
    motivo: 'Nota 11002',
    usuarioId: dona.id,
    quando: diasAtras(4),
  });

  console.log('Registrando remessas para parceiros…');

  // ATRASADA de propósito: é o alerta que ela precisa ver funcionando.
  await db.remessa.create({
    data: {
      empresaId: empresa.id,
      fornecedorId: bordados.id,
      clienteId: alfa.id,
      referencia: 'Polo Colégio Alfa — lote de agosto',
      tipoServico: 'bordado',
      dataEnvio: diasAtras(14),
      previsaoRetorno: diasAtras(6),
      quantidadeEnviada: 240,
      valorPorPecaCentavos: 350,
    },
  });

  // Dentro do prazo.
  await db.remessa.create({
    data: {
      empresaId: empresa.id,
      fornecedorId: estamparia.id,
      referencia: 'Camisetas Marca Rua Nove',
      tipoServico: 'dtf',
      dataEnvio: diasAtras(2),
      previsaoRetorno: diasAFrente(5),
      quantidadeEnviada: 180,
      valorPorPecaCentavos: 210,
    },
  });

  // Fechada, com defeito registrado — mostra o retorno parcial funcionando.
  const fechada = await db.remessa.create({
    data: {
      empresaId: empresa.id,
      fornecedorId: estamparia.id,
      referencia: 'Camisetas evento — silk 2 cores',
      tipoServico: 'silk',
      dataEnvio: diasAtras(20),
      previsaoRetorno: diasAtras(13),
      quantidadeEnviada: 90,
      valorPorPecaCentavos: 180,
    },
  });
  await db.retorno.create({
    data: {
      remessaId: fechada.id,
      dataRetorno: diasAtras(15),
      quantidadeOk: 60,
      quantidadeDefeito: 0,
    },
  });
  await db.retorno.create({
    data: {
      remessaId: fechada.id,
      dataRetorno: diasAtras(13),
      quantidadeOk: 28,
      quantidadeDefeito: 2,
      motivoDefeito: 'Estampa saiu torta em duas peças',
    },
  });

  console.log('\nPronto. Entre com:');
  console.log('  dona@arteemoda.com.br / arteemoda      (vê tudo)');
  console.log('  producao@arteemoda.com.br / arteemoda  (sem financeiro)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
