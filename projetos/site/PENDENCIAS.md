# Pendências — site Arte e Moda

O site está completo e funcional. O que falta é **conteúdo real** e **credencial**,
não código. Cada item abaixo diz exatamente onde entra.

---

## 1. Bloqueiam a publicação

### Logo oficial
A marca está aplicada **tipograficamente** (monograma AM em dourado dentro de uma
caixa hairline + wordmark em Montserrat). Não recriei nem redesenhei a logo — o
arquivo não foi entregue.
- **Onde:** `components/ui/Logo.tsx`
- **Precisa:** versão clara (fundo escuro) e escura (fundo claro), em SVG ou PNG
  com fundo transparente. Jogar em `public/` e trocar o bloco do monograma por
  `<Image>` — a caixa já está reservada na proporção certa.

### Manual de marca em PDF
Foi citado como anexo, mas não chegou. Trabalhei com as specs do briefing
(paleta, tipografia, assinaturas). Se o PDF tiver regra que eu não conheço
(espaçamento mínimo da logo, versão reduzida, aplicação em fundo fotográfico),
vale reconciliar.

### Domínio
- **Onde:** `.env.example` → `NEXT_PUBLIC_SITE_URL` e `data/empresa.ts` → `site.url`
- Afeta canonical, Open Graph, sitemap e schema. Está com `arteemoda.com.br`
  como suposição — **trocar antes de indexar**.

### Chaves de ambiente
Copiar `.env.example` para `.env.local` e preencher:
- `RESEND_API_KEY`, `LEAD_EMAIL_FROM` (remetente verificado), `LEAD_EMAIL_TO`
- `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`
- Sem essas chaves o formulário **não quebra**: ele valida, aceita e grava o
  lead em disco, só não dispara o e-mail.

### Persistência de lead em produção
`lib/leads.ts` grava em `leads/leads.jsonl`. Na Vercel o disco é efêmero —
**o arquivo some entre deploys.** O e-mail continua chegando, mas o histórico não.
- **Ação:** trocar a função `persistir()` por escrita em banco quando o
  gerenciador interno for construído. Está isolada de propósito: nenhum outro
  arquivo precisa mudar.

---

## 2. Fotos (todas pendentes)

Nenhuma foto foi usada. Os placeholders são blocos sólidos da paleta com moldura
hairline e legenda dizendo qual foto entra ali — não são caixas cinzas genéricas,
e o site foi desenhado para ficar bom **sem nenhuma foto**.

| Onde | O que precisa | Formato |
|---|---|---|
| `data/galeria.ts` | Mesa de corte, kit escolar completo, detalhe de bordado em polo, peças de streetwear, equipe costurando, etiqueta e acabamento interno | 3:2 horizontal |
| `components/sections/EscolarDestaque.tsx` | Kit escolar completo | 4:5 vertical |
| `app/sobre/page.tsx` | Chão de fábrica (visão geral), mesa de corte, equipe costurando, acabamento | 4:5 vertical |
| `public/og.png` | Imagem de compartilhamento (Open Graph / Twitter Card) | 1200×630 |
| `public/logo.png` | Logo para o schema Organization | quadrada |

Para trocar uma foto da galeria: preencher o campo `src` em `data/galeria.ts`.
Nenhum componente precisa ser tocado.

---

## 3. Conteúdo real

### Depoimentos — 3 slots vazios
- **Onde:** `data/depoimentos.ts`
- Os slots aparecem no site marcados como `TODO: depoimento real`. **Nenhum
  cliente ou elogio foi inventado.** Precisa de depoimento autorizado de escola,
  empresa ou marca atendida — com nome e cargo de quem falou.

### História da empresa
- **Onde:** `app/sobre/page.tsx` (bloco marcado com `TODO: história da empresa`)
- Falta: quando a confecção começou, quem fundou, como passou de uniforme para
  private label, quantas pessoas trabalham hoje. Não escrevi nada porque nenhum
  desses dados foi confirmado — e ano de fundação inventado é o tipo de coisa que
  cliente corporativo checa.

### Clientes na barra de credibilidade
- **Onde:** `data/clientes.ts`
- Hoje só **Grupo Souza Lima**. Adicionar os demais que autorizarem aparecer.
  Quando houver arquivo de logo, preencher o campo `logo`.

### Dados da operação que viraram resposta genérica
Estão no ar com resposta honesta ("confirmamos no orçamento"), mas ficam melhores
com número real:
- **Prazo médio de produção** — `data/faq.ts` e `data/empresa.ts` → `producao.prazoMedio`
- **Carta de tecidos** que a confecção mantém — `data/faq.ts`
- **Condições de pagamento** (entrada, parcelamento, faturamento) — `data/faq.ts`
- **Horário de atendimento** — `data/empresa.ts` → `horario` (está como
  "segunda a sexta, 8h às 18h", **não confirmado**)
- **CEP** — `data/empresa.ts` → `endereco.cep` (falta para o schema LocalBusiness)
- **Razão social completa** — `data/empresa.ts` → `razaoSocial`

> Pedido mínimo de **30 peças** já está aplicado em todo o site, conforme combinado.

---

## 4. Antes de ligar o tráfego pago

- [ ] Criar o container no GTM e publicar com GA4 + Meta Pixel dentro
- [ ] Conferir os eventos disparando: `Lead`, `Contact`, `ViewContent`, `InitiateCheckout`
      (todos passam por `lib/analytics.ts` — nenhum componente chama `fbq` direto)
- [ ] Testar o formulário ponta a ponta com o Resend real
- [ ] Conferir a captura de UTM: abrir `/uniformes-escolares?utm_source=meta&utm_campaign=teste`,
      enviar o formulário e verificar se a atribuição chegou no e-mail
- [ ] Implementar o Conversions API do Meta em `lib/leads.ts` (chaves já previstas
      no `.env.example`) — o Pixel sozinho perde evento por bloqueio de navegador
- [ ] Revisão jurídica da política de privacidade + definir prazo de retenção
- [ ] Rodar Lighthouse em `/` e nas duas landings depois do deploy com as fotos reais

---

## 5. Decisões que tomei e você pode reverter

- **Hero sem foto, só tipografia.** Virou escolha estética (capa de catálogo /
  hangtag), não buraco. Quando a foto chegar, ela entra como camada de fundo
  atrás da moldura — o layout já comporta.
- **Formulário multi-step começa no hero das landings de anúncio.** Um toque no
  passo 1 já avança e dispara `InitiateCheckout`. Formulário de 5 campos acima da
  dobra afugenta tráfego de Instagram.
- **Menu simplificado nas landings** (`<Header simplificado />`): sem navegação
  que disperse quem veio de anúncio.
- **Cinza `#707070` não é usado em texto corrido.** Reprova contraste AA nos dois
  fundos (4,43:1 no creme, 3,08:1 no navy). Virou cor de linha e label; o texto
  secundário usa derivados da própria paleta que passam AA.
