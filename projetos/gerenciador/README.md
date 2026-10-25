# App Arte e Moda

O app de gestão da confecção (a pasta se chama `gerenciador`). Este manual é sobre **como usar**, não sobre como o
código funciona.

---

## Como abrir

No terminal, dentro desta pasta:

```
npm run dev
```

Depois abra **http://localhost:3100** no navegador.

Para entrar:

| Quem | E-mail | Senha |
|---|---|---|
| Dona (vê tudo) | `dona@arteemoda.com.br` | `arteemoda` |
| Produção (sem financeiro, sem nota fiscal) | `producao@arteemoda.com.br` | `arteemoda` |
| Vendas (vendas e clientes) | `vendas@arteemoda.com.br` | `arteemoda` |

> As senhas acima são só para testar. Antes de usar de verdade, troque.

O sistema já vem com **dados de exemplo** — fornecedores, tecidos, peças de
loja, um mês de vendas e uma nota em rascunho — para você ver tudo
funcionando antes de entrar com os dados reais. Para apagar tudo e
recomeçar do zero: `npm run db:reset`.

---

## O que dá para fazer hoje

### Visão Geral

A primeira tela responde duas perguntas: **o que precisa de você hoje** e
**está tudo bem?**

- **Precisa de você:** conta vencida, cliente atrasado, tecido abaixo do
  mínimo, peça acabando na loja. Cada linha tem o botão que resolve
  (_Pagar_, _Cobrar_, _Ver o que comprar_). Sem pendência, aparece
  "Tudo em dia".
- **Três números:** vendido no mês, caixa hoje e a pagar nos próximos 7
  dias. Clicando, vai para a tela do assunto.
- **Vendas dos últimos 30 dias:** o ritmo das vendas num gráfico.

Cada pessoa vê o que é dela: quem vende não vê caixa nem contas, e a
produção não vê nenhum valor em reais.

**Ocultar valores:** o botão do olho esconde os valores em reais, como
no app do banco. Escondeu numa tela, fica escondido em todas (Visão
Geral, Financeiro e Resumo de vendas) até clicar em _Mostrar valores_ em
qualquer uma delas.

### Vendas

Três abas: **Vender** (o balcão), **Resumo** e **Estoque da loja**.

**Resumo:** quanto vendeu no período (hoje, 7 dias, 30 dias, este mês
ou as datas que você escolher), quanto foi na loja e quanto em pedidos
de produção, ticket médio, gráfico por dia, maiores clientes e peças
mais vendidas.

**Bipe o código de barras ou digite o SKU** no campo do topo e a peça
entra no carrinho — aponte a leitora comum de supermercado, ela funciona
como um teclado rápido. Ajuste a quantidade, escolha a forma de
pagamento e clique em _Finalizar venda_. O estoque da peça desconta
sozinho e a entrada cai no caixa (menos quando o pagamento é **fiado** —
aí o dinheiro ainda não entrou de verdade).

Tem dois jeitos de vender:

- **Venda de balcão** — o normal do dia a dia na loja, cliente opcional
- **Pedido de produção** — venda fechada para um cliente (escola,
  empresa, marca), cliente obrigatório

**Estoque da loja** (aba _Estoque da loja_) é onde ficam as peças
prontas para vender, cada uma com o próprio código. Cadastre uma peça
nova em _Nova peça_, e quando a produção terminar um lote, registre a
entrada em _+ Entrada_ na linha da peça — é isso que faz ela aparecer
disponível para bipar.

### Financeiro

Só a dona vê. Três abas:

**Caixa** — quanto a empresa tem hoje, o que vence nas próximas 5
semanas e para onde foi o dinheiro do mês. Se o saldo for ficar negativo
em algum dia, aparece um aviso em vermelho com a data, antes de
acontecer.

- **Na primeira vez**, clique em _Informar o saldo de hoje_ e diga
  quanto a empresa tem somando gaveta e banco. Daí em diante o caixa
  anda sozinho: venda bipada entra, conta paga sai.
- **Conferir o caixa**: de tempos em tempos, conte o que tem de verdade
  e informe. Se não bater, a diferença entra como ajuste — com motivo,
  igual à contagem de estoque.
- **+ Entrada / − Saída**: dinheiro que entrou ou saiu sem conta
  cadastrada, como o sinal de um pedido ou uma compra no balcão.

**A pagar** — em ordem de urgência: vencidas primeiro, depois as de
hoje, as dos próximos 7 dias e o resto. Na própria linha, clique em
_Paguei_, confira o valor (mude se veio com juros ou desconto) e pronto:
a saída cai no caixa.

- **Nova conta**: aluguel, luz, bordado, boleto. Se for **parcelado**,
  informe o valor total e em quantas vezes — o sistema divide e marca um
  vencimento por mês. Se for **todo mês** (aluguel, internet), ele cria
  os próximos 12 meses e mostra só o próximo na lista.
- **Compra de tecido entra sozinha**: ao registrar a compra, escolha
  _Já paguei_ ou _Vou pagar depois_. A prazo, o vencimento sai da
  condição cadastrada no fornecedor (30 ou 30/60 dias).

**A receber** — o mesmo jeito, com _Recebi_. **Venda fiado entra
sozinha**, com o prazo que o cliente costuma pagar. Pedido com sinal e
restante na entrega: lance o sinal como entrada no caixa e cadastre o
restante aqui.

**Errou?** Nada é apagado. _Cancelar_ tira a conta da lista e guarda o
motivo; _Desfazer_ (nas pagas e recebidas) devolve o dinheiro ao caixa
com um estorno e a conta volta a ficar em aberto.

### Nota Fiscal

Esta tela **ainda não emite nota fiscal de verdade** — falta a definição
do contador (regime, certificado, CFOP) e a ligação com um provedor
homologado. Por enquanto ela faz duas coisas que já funcionam:

1. **Relatório do período** — escolha as datas, o cliente (opcional) e
   veja o total das vendas, com desconto em porcentagem ou valor fixo se
   quiser aplicar. Dá para gerar **só o relatório**, para imprimir ou
   mandar para o contador.
2. **Rascunho da nota** — o mesmo cálculo, salvo como rascunho no
   sistema. No dia em que a parte fiscal for ligada, é só emitir a
   partir daqui — o cálculo já vai estar pronto.

### Tecidos

O cadastro do tecido especificamente — composição, largura, gramatura.
**Cada cor é um cadastro separado.** Se ficarem juntas, o custo médio
mistura preços que não têm nada a ver um com o outro.

### Estoque

Três abas: **Tecido e aviamento**, **Retalhos** e **O que está parado**.

Aqui entra **tudo que você compra e guarda**: tecido, mas também
etiqueta, elástico, agulha, zíper — qualquer aviamento. Os botões no
topo filtram por **setor**. Se precisar de um tipo que não existe ainda
(um botão diferente, uma linha, o que for), clique em _Novo produto → +
Criar um tipo de produto novo_ — não depende de mudar nada no sistema.

Quando a última compra sai mais cara que o custo médio, aparece uma
**seta vermelha com a porcentagem** — é assim que você descobre que um
fornecedor aumentou sem avisar.

**Extrato:** clicando em _Extrato_ você vê tudo que entrou e saiu daquele
item, com data, motivo e o nome de quem lançou. Nenhuma linha é apagada
ou alterada nunca. Se um número estiver errado, a correção entra como um
lançamento novo de ajuste — o histórico continua lá para explicar.

**Já tem na prateleira?** Ao cadastrar um tecido ou aviamento novo
(_Novo produto_), preencha quanto tem agora e quanto vale cada metro,
quilo ou unidade. Ele já entra no estoque com valor, sem precisar do
estoque de abertura depois. Se não souber o valor exato, um palpite
serve.

**Retalhos** (aba _Retalhos_): pese a pilha, escolha de qual tecido é e
a cor, e anote. O app sugere quanto vale o quilo:
- tecido comprado em quilo: o custo do quilo;
- tecido comprado em metro: converte pela largura e pela gramatura do
  cadastro. Uma malha de 1,80 m e 180 g/m², por exemplo, dá cerca de
  3,1 m por quilo.

Mude o valor se souber um melhor. Retalho do mesmo tecido e da mesma cor
soma junto. Quando usar, vender, doar ou jogar fora, clique em _Saiu_.

**O que está parado** (aba _O que está parado_): quanto dinheiro está
na prateleira, separado por tempo parado (mais de 1 ano, 6 meses a 1
ano, 3 a 6 meses, menos de 3 meses) e por tipo (tecido, retalho,
aviamento), e depois item por item, do mais antigo para o mais novo. "Parado
há" conta pelo que chegou primeiro e ainda está lá: usar um pedaço não
faz o resto parecer novo.

**Contagem física:** _Estoque → Fazer contagem_. Conte o que tem de
verdade e digite. Onde houver diferença, o motivo é obrigatório.
**Estoque de abertura** é para usar uma vez só, no começo, para registrar
o que já está na prateleira sem nota de compra.

### Compras

Toda vez que chegar tecido, registre em _Compras → Registrar compra_.
Você não precisa calcular o frete por item — informe o total e o sistema
divide entre os tecidos da nota, proporcional ao valor de cada um. No
fim, diga se já pagou ou se vai pagar depois: a conta vai sozinha para o
Financeiro.

### Fornecedores

Cadastro de quem vende tecido e de quem faz bordado, DTF e silk. Cada
fornecedor tem a própria tabela de preço — quando o preço muda, o antigo
não é apagado, vira histórico. É isso que faz o sistema dizer "esse
fornecedor subiu 12%". _Comparar preços_ mostra quem cobra quanto hoje
pelo mesmo item.

### Clientes

Escolas, empresas e marcas que você atende. Serve para ligar cada pedido
de produção e cada nota ao seu dono.

---

## O que ainda não existe

- **Ficha técnica e ordem de produção** — quanto o rolo rendeu de
  verdade, custo por peça e calculadora de preço mínimo
- **Salários no financeiro** — esperam a resposta sobre como as
  costureiras são pagas (ver abaixo); até lá, lance como conta fixa
- **Emissão real de nota fiscal** — depende do contador e de um provedor
  homologado (nunca vamos falar direto com a SEFAZ)

---

## Perguntas que ainda faltam responder

Gravadas na tabela `Configuracao`, marcadas como pendentes — não
escondidas no código:

1. **Como as costureiras são pagas** — assumido salário fixo. Define se
   a costura entra no custo da peça ou nas contas do mês.
2. **Você compra tecido em quilo e usa em metro?** Assumimos mesma
   unidade. Se não for, falta o fator de conversão.

Com o contador, ainda falta o regime tributário e os CFOPs para a parte
fiscal sair do rascunho.

---

## Cuidados

**Faça backup.** Todos os dados ficam no arquivo `prisma/dev.db`. Copie
esse arquivo para outro lugar com frequência. Se ele sumir, os dados
somem junto.

**Isto está rodando na sua máquina.** Enquanto estiver assim, só
funciona neste computador e só enquanto o `npm run dev` estiver aberto.
