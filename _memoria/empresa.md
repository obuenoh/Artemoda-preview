# Empresa

> Memória central do negócio. O Claude lê esse arquivo antes de cada resposta.
> Preenchido pelo `/instalar` — você pode editar a qualquer momento.

**Nome:** Arte e Moda
**Negócio:** Confecção têxtil de uniformes escolares, uniformes empresariais e private label
**O que faz:** Opera como fábrica própria (corte e costura) + loja física (varejo e atacado)
**Perfil:** Confecção sob medida com produção própria em São Paulo
**Atende clientes:** Escolas, empresas e marcas terceiras
**Equipe:** Dona da confecção, costureiras internas, parceiros externos (DTF, silk, bordado)
**Ferramentas:** Next.js (App Router), Prisma, Tailwind CSS, SQLite, MazyOS
**Principais entregas:** Site institucional (`projetos/site`) e o app de gestão (`projetos/gerenciador`)
**Cliente:** a dona da Arte e Moda é sogra do usuário; as decisões do app saem das conversas com ela
**Quem usa o app:** o usuário, a esposa dele e a dona (sogra)

## Contexto do Negócio

### Arte e Moda

Confecção em São Paulo: uniforme escolar, uniforme empresarial e private
label. Opera como fábrica + loja física — por isso toda venda é separada
entre "produção" (atacado, escola/empresa) e "loja" (varejo no balcão).
Quem usa o sistema é a dona, que não é usuária de software: tela que
precisa de treinamento está errada.

Duas aplicações no monorepo (`projetos/`):

- **Site institucional** — `projetos/site`, porta 3000. Existe pra captar
  lead de tráfego pago do Instagram; não vende online. Prévia estática no
  ar em https://obuenoh.github.io/Artemoda-preview/
- **Gerenciador interno** — `projetos/gerenciador`, porta 3100. Substitui
  caderno, WhatsApp e planilha. Tem cadastros, compras com rateio de
  frete, estoque com custo médio, Vendas (bipagem de código de barras),
  Financeiro (caixa, contas a pagar e a receber) e Nota Fiscal em
  rascunho. Roda local com banco SQLite.

### As três frentes (reunião com a dona em 24/10/2026)

A empresa trabalha em três frentes. Cada uma precisa dos próprios números
de venda e estoque, e ao mesmo tempo tudo é uma empresa só.

1. **Fábrica:** fabrica uniformes para escolas, uniformes para empresas e
   peças para marcas de roupa (private label).
2. **Loja:** vende os uniformes que a fábrica produz, para escolas
   públicas e algumas particulares.
3. **E-commerce:** vai começar, com roupa casual (camiseta básica no
   início) vendida no Mercado Livre.

As três frentes são o mesmo CNPJ e a mesma conta no banco: um caixa só,
e o envio de peças da fábrica para a loja não precisa de nota. **Tudo é
fabricado por eles**: loja, empresas e e-commerce (inclusive as
camisetas básicas). A fábrica é a única origem das peças, e a loja e o
e-commerce recebem por envio interno.

O que ela pediu na reunião:
- **Encomenda na loja:** o cliente pede a peça, paga metade, a fábrica
  produz, e ele retira e paga o resto. O app precisa mostrar o nome e o
  telefone do cliente, quanto já pagou e quanto falta, o que fabricar na
  semana e para quem, e permitir avisar quando estiver pronto.
  Regras confirmadas em 25/10/2026: o sinal é sempre metade, a peça é
  sempre fabricada, o prazo é só uma estimativa, e o aviso sai pelo
  WhatsApp da Arte e Moda.
- **Cadastro de cliente da loja** também para promoção e reposição ao
  longo do ano. Mandar promoção exige autorização do cliente (LGPD).
- **Maior dor de estoque:** não saber quanto têm em dinheiro. Há
  retalhos de 2 a 4 kg por cor parados há tempo.
- **Nota de compra no app:** as notas chegam em PDF. Subir o PDF (ou uma foto) e o app ler fornecedor,
  itens e preço, dando entrada no estoque e montando o histórico por
  fornecedor. O que já está no estoque sem nota entra à mão.
- **Emitir nota fiscal pelo app:** vendas da loja, das empresas e do
  e-commerce.

Regra de marca, paleta e decisões de arquitetura estão em
`CLAUDE.md`. Pendências de conteúdo real em `projetos/site/PENDENCIAS.md`.
