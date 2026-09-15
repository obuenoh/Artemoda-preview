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
**Principais entregas:** Site institucional (`projetos/site`) e Gerenciador de estoque/vendas (`projetos/gerenciador`)

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
  frete, estoque com custo médio, Vendas (bipagem de código de barras) e
  Nota Fiscal em rascunho. Roda local com banco SQLite.

Regra de marca, paleta e decisões de arquitetura estão em
`CLAUDE.md`. Pendências de conteúdo real em `projetos/site/PENDENCIAS.md`.
