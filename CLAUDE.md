# Artemoda — Sistema Operacional do Negócio & Monorepo

Sua empresa roda em cima desse arquivo. Aqui ficam as regras de operação do **MazyOS** (como a IA lê o contexto, aprende com correções, mantém tudo atualizado e cria skills) e as especificações técnicas e de negócio do **Artemoda** (site institucional e gerenciador interno).

---

## 1. MazyOS — Operação e Memória

### Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (quando existirem e estiverem preenchidos):

1. `_memoria/empresa.md` — quem é o usuário, o que faz, como funciona a Arte e Moda
2. `_memoria/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_memoria/estrategia.md` — foco atual, prioridades, prazos

Usar essas informações como base pra qualquer resposta ou decisão. Ao sugerir prioridades, formatos ou abordagens, considerar o foco atual descrito em `estrategia.md`.

Pra qualquer tarefa visual (carrossel, post, landing page), consultar `identidade/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas usar o contexto naturalmente.

### Fluxo de trabalho com Skills

Antes de executar qualquer tarefa, verificar se existe skill relevante em `.claude/skills/`. Se encontrar, seguir as instruções da skill. Se não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível (o usuário provavelmente vai pedir de novo no futuro), perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar pra tarefas pontuais ou perguntas simples. Só quando o padrão de repetição for claro.

### Aprender com correções

Quando o usuário corrigir algo, melhorar uma resposta ou dar uma instrução que parece permanente (frases como "na verdade é assim", "não faça mais isso", "prefiro assim", "sempre que...", "evita...", "da próxima vez..."), perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

Se sim, identificar onde faz mais sentido salvar:
- **Sobre o negócio** (clientes, serviços, mercado) → `_memoria/empresa.md`
- **Sobre preferências e estilo** (tom de voz, formato, o que evitar) → `_memoria/preferencias.md`
- **Sobre prioridades e foco** (projetos, metas, prazos) → `_memoria/estrategia.md`
- **Regra de comportamento nessa pasta** → próprio `CLAUDE.md`

Salvar com uma linha nova clara, sem reformatar o arquivo inteiro. Confirmar mostrando a linha adicionada.

### Manter contexto atualizado

Ao terminar uma tarefa que mudou algo relevante (cliente novo, skill nova, mudança de foco, processo novo, ferramenta instalada, estrutura alterada), perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize a memória?"

Se sim, identificar o que atualizar:
- **Cliente, serviço, ferramenta, equipe** → `_memoria/empresa.md`
- **Mudança de prioridade ou foco** → `_memoria/estrategia.md`
- **Tom ou estilo** → `_memoria/preferencias.md`
- **Pasta, regra de organização, skill criada** → `CLAUDE.md`
- **Visual (cores, fontes, logo)** → `identidade/design-guide.md`

---

## 2. Artemoda — Site e Gerenciador

Monorepo com dois projetos Next.js independentes, da mesma marca:

```
projetos/site/          Site institucional  → porta 3000  (captação de leads)
projetos/gerenciador/   Sistema de gestão   → porta 3100  (uso interno da dona)
```

Cada um tem o próprio `package.json` e o próprio `node_modules`. **Rode `npm` sempre de dentro da pasta do projeto**, nunca da raiz.

---

## 3. Identidade visual (vale para os dois)

Vem do manual da marca. **Nunca use cor fora desta paleta e nunca redesenhe a logo.**

| Uso | Hex |
|---|---|
| Azul marinho (base) | `#15263D` |
| Preto (texto forte) | `#1C1C1C` |
| Creme (fundo claro) | `#F5F2EC` |
| Dourado (acento, CTA) | `#B58B57` |
| Cinza (linhas e labels) | `#707070` |

Fontes: **Montserrat** (interface, títulos em caixa alta com tracking largo) e **Cormorant Garamond** (display, números grandes, citações).

Duas regras que já estão no código e precisam continuar valendo:
- **Dourado é acento, não preenchimento.** Preenchimento sólido em dourado existe só no CTA primário e no monograma. Em qualquer outro lugar é traço de 1px ou tipografia pequena.
- **`#707070` não vai em texto corrido.** Reprova contraste AA nos dois fundos (4,43:1 no creme, 3,08:1 no navy). É cor de linha e label. Texto secundário usa alpha da própria paleta: `rgba(28,28,28,.68)` no claro, `rgba(245,242,236,.72)` no escuro.

---

## 4. Regras que valem nos dois projetos

- **Nada de float em dinheiro ou quantidade.** Dinheiro em centavos inteiros, quantidade em milésimos inteiros. Helpers em `src/lib/numeros.ts` (gerenciador).
- **Não inventar dado de negócio.** Sem depoimento, cliente, número, prêmio ou ano de fundação que não tenha sido confirmado. Onde falta informação real, deixe `TODO:` visível na tela, não um texto plausível.
- **Não inventar regra tributária.** Onde falta definição do contador, `TODO:` e campo configurável.
- Textos em **pt-BR**, na linguagem de quem usa. Comentários de código em português, sem acento (o código já segue esse padrão).

---

## 5. projetos/site — institucional

Next.js App Router + TypeScript + Tailwind + Framer Motion. Existe para receber tráfego pago do Instagram e captar lead; **não vende online**.

- Conteúdo de texto vive em `data/*.ts`. Para mudar copy, mexa lá — não no componente.
- Envio de lead isolado em `lib/leads.ts`. É o único lugar que fala com Resend e com a persistência.
- Eventos de medição passam todos por `lib/analytics.ts`. Nenhum componente chama `fbq` ou `gtag` direto.
- Elemento-assinatura é o **pesponto** (`components/ui/Stitch.tsx`): traço 6 / intervalo 4, 1px. Ele acompanha emenda entre painéis e perímetro de bloco aplicado — não é linha decorativa solta no meio da tela.
- Pendências de conteúdo real estão em `PENDENCIAS.md`.

**Cuidado com hidratação.** Não ramifique marcação por `useReducedMotion()`: o servidor não sabe a preferência, o React não corrige atributo de style nesse caso, e a página trava invisível para quem usa "reduzir movimento". Quem cuida disso é o `<MotionProvider>` na raiz.

**Medida de texto display em `em`, não em `ch`.** `ch` herda a fonte do elemento pai — um `max-w-[20ch]` num wrapper com Montserrat de 17px vira 190px de largura para um `h1` de 72px.

---

## 6. projetos/gerenciador — gestão interna

Next.js App Router + TypeScript + Tailwind + Prisma. **SQLite hoje**, para rodar sem depender de conta externa. O schema foi escrito para portar: nenhum `enum` do Prisma, tudo inteiro. Trocar o provider é a migração.

Quem usa não é usuária de software. **Se uma tela precisa de treinamento, ela está errada.** Linguagem de confecção, nunca de contabilidade: "tecido que entrou", não "movimentação de entrada de insumo".

### A regra inegociável
**Saldo não é campo. Saldo é soma de lançamentos imutáveis.**
Nada faz `UPDATE` em quantidade. Correção vira lançamento novo de ajuste, com motivo obrigatório e autor. Toda escrita de estoque passa por `lancar()` em `src/lib/estoque.ts` — não escreva em `MovimentoEstoque` direto de lugar nenhum.
Cada lançamento congela o saldo e o custo médio **depois** dele, para o extrato ser auditável e a consulta barata.

### Custo médio ponderado
Recalculado a cada entrada. Saída não mexe no médio — sai valorizada pelo médio vigente. "Última compra" considera **só `entrada_compra`**: estoque de abertura e ajuste entram com valor estimado, e tratá-los como preço de compra faz a coluna mentir justamente onde ela serve para flagrar aumento de fornecedor.

### Outras regras
- Preço de fornecedor é **versionado**. Preço novo fecha a vigência anterior e cria outra; o antigo nunca é apagado. É isso que permite dizer "esse fornecedor subiu 12%".
- Não peça o que dá para calcular. O rateio de frete é feito pelo sistema, por valor — ela nunca digita.
- Toda página e toda server action começam com `exigirUsuario()` ou `exigirPapel()`. Papéis: `dona` (tudo), `producao` (sem financeiro), `vendas`.
- Mensagem de erro diz o que fazer: "Informe um WhatsApp com DDD", nunca "campo inválido".
- Ordene por urgência, não por data. O que exige ação lidera a lista.

### O que existe hoje
Cadastros (fornecedor com preço versionado, tecido/aviamento por setor, cliente), compras com rateio de frete, estoque de matéria-prima com custo médio e contagem, **Vendas** (bipagem de código de barras, baixa automática do estoque de peça pronta, caixa alimentado pela venda) e **Nota Fiscal** em modo rascunho (relatório de período com desconto, nota salva mas nunca transmitida).

Ainda faltam: ficha técnica e ordem de produção (custo real por peça), contas a pagar e fluxo de caixa completo (hoje só a entrada automática de venda), e a emissão fiscal de verdade.
Na Nota Fiscal: **nunca emitir NF-e direto na SEFAZ.** Usar API homologada, isolada atrás de uma interface única — até lá, todo registro fica com `status: "rascunho"` e a tela deixa isso explícito para quem usa.

### Produto acabado tem razão próprio
`ProdutoAcabado` (peça de loja, com SKU) usa o mesmo princípio do estoque de matéria-prima — `MovimentoProdutoAcabado` é imutável, saldo é soma — mas em **unidades inteiras**, não milésimos: peça de roupa não é fracionária. Módulo em `src/lib/produtos.ts`, separado de `src/lib/estoque.ts`. Não misture os dois razões.

### Setor de estoque é lista aberta
`TipoProduto` (Tecido, Agulha, Elástico, Etiqueta, Zíper, ...) é cadastrado por empresa, não por enum — a dona cria um tipo novo pela própria tela (_Estoque → Novo produto → + Criar um tipo_) sem depender de deploy. Só o tipo "Tecido" liga os campos extras (composição, largura, gramatura) no formulário — controlado por `TipoProduto.mostrarCamposTecido`.

### Decisões ainda em aberto
Estão gravadas na tabela `Configuracao` marcadas como pendentes — não chumbadas no código. Assumimos um palpite para não travar:
1. **Como as costureiras são pagas** — assumido salário fixo. Define se a costura entra no custo da peça ou no rateio do mês. Se entrar nos dois, cada peça paga a costura duas vezes.
2. **Compra em kg e uso em metro** — assumido mesma unidade.
Com o contador, falta o regime tributário e os CFOPs para a nota sair do rascunho.

---

## 7. Comandos de Execução

```bash
# site institucional
cd projetos/site && npm run dev          # porta 3000

# gerenciador
cd projetos/gerenciador && npm run dev   # porta 3100
npm run db:reset                          # apaga e repopula com exemplos
npm run typecheck
```

Entrar no gerenciador: `dona@arteemoda.com.br` / `arteemoda` (dados de exemplo; trocar antes do uso real).
**Backup:** os dados do gerenciador vivem em `projetos/gerenciador/prisma/dev.db`.

---

## 8. Prévia publicada (GitHub Pages)

**https://obuenoh.github.io/Artemoda-preview/** — entrada unificada:
```
/            página de entrada (scripts/entrada.html)
/site/       export estático do institucional
/painel/     protótipo navegável do gerenciador
```

Mora na branch `gh-pages` (saída de build, não código).
Ver `scripts/` para regenerar via `montar-painel.mjs` e `reescrever.mjs`.
