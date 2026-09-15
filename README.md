# Artemoda — Sistema Operacional & Aplicações

Workspace unificado da **Arte e Moda** integrando o **MazyOS** (sistema operacional de marketing, SEO, memória e operação com IA) e o monorepo de aplicações da marca (**Site Institucional** e **Gerenciador Interno**).

---

## Estrutura do Workspace

```
Artemoda/
├── .claude/                 # Skills do MazyOS (/carrossel, /seo, /anuncio-google, etc.)
├── _memoria/                # Memória central do negócio (empresa, estratégia, preferências)
├── identidade/              # Manual da marca, paleta e guias visuais
├── marketing/               # Campanhas de tráfego, copies e estratégias
├── dados/                   # Dropzone para análise de planilhas e relatórios
├── saidas/                  # Documentos e artefatos gerados
├── scripts/                 # Scripts de painel, auditoria e geração estática
├── templates/               # Moldes operacionais do MazyOS
├── render.yaml              # Configuração de deploy do gerenciador no Render
├── CLAUDE.md                # Regras completas de desenvolvimento, design e operação
└── projetos/                # Monorepo de código
    ├── site/                # Site institucional Next.js (porta 3000)
    └── gerenciador/         # Sistema de gestão interna Next.js + Prisma (porta 3100)
```

---

## Como Rodar os Projetos

Cada projeto possui seu próprio `package.json` e dependências isoladas. Execute os comandos sempre de dentro da pasta correspondente:

### Site Institucional (`projetos/site`)
Desenvolvido em Next.js App Router, TypeScript, Tailwind CSS e Framer Motion.
```bash
cd projetos/site
npm install
npm run dev
```
Acesse em: `http://localhost:3000`

### Gerenciador Interno (`projetos/gerenciador`)
Sistema de gestão da fábrica e loja, desenvolvido em Next.js App Router, TypeScript, Tailwind CSS e Prisma (SQLite).
```bash
cd projetos/gerenciador
npm install
npm run dev
```
Acesse em: `http://localhost:3100`

**Comandos do banco:**
- `npm run db:push` — Sincroniza schema do Prisma com o banco SQLite local
- `npm run db:seed` — Popula dados de exemplo
- `npm run db:reset` — Reseta e repopula o banco
- `npm run db:studio` — Abre interface gráfica do Prisma Studio

---

## Prévia Publicada

- **URL:** https://obuenoh.github.io/Artemoda-preview/
- Contém a página de entrada com acesso à prévia estática do **Site** e do **Protótipo Interativo do Gerenciador**.
