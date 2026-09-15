# Gerenciador Arte e Moda

O sistema da confecção. Este manual é sobre **como usar**, não sobre como o
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

A primeira tela. Escolha o período no canto — **Hoje, 7 dias, 30 dias ou
Personalizado** — e ela mostra quanto vendeu, o gráfico por dia, quem são
os maiores clientes (separado entre **produção**, pedido fechado para
escola/empresa, e **loja**, venda de balcão) e as peças mais vendidas.
Embaixo, o estoque de tecido continua avisando o que está abaixo do
mínimo e quanto dinheiro está parado.

### Vendas

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

**Estoque da loja** (_Vendas → Estoque da loja_) é onde ficam as peças
prontas para vender, cada uma com o próprio código. Cadastre uma peça
nova em _Nova peça_, e quando a produção terminar um lote, registre a
entrada em _+ Entrada_ na linha da peça — é isso que faz ela aparecer
disponível para bipar.

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

**O que está parado:** lista do mais parado para o mais novo, com o
valor em reais de cada um e o total no topo.

**Contagem física:** _Estoque → Fazer contagem_. Conte o que tem de
verdade e digite. Onde houver diferença, o motivo é obrigatório.
**Estoque de abertura** é para usar uma vez só, no começo, para registrar
o que já está na prateleira sem nota de compra.

### Compras

Toda vez que chegar tecido, registre em _Compras → Registrar compra_.
Você não precisa calcular o frete por item — informe o total e o sistema
divide entre os tecidos da nota, proporcional ao valor de cada um.

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
- **Contas a pagar e fluxo de caixa completo** — hoje só existe a entrada
  automática no caixa quando uma venda é finalizada
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
