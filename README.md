# Artemoda - Gerenciador e Site

Repositório unificado contendo o gerenciador de estoque e o site da Artemoda.

## Estrutura do Projeto

```
/
├── projetos/
│   ├── gerenciador/     # Sistema de gerenciamento (Next.js)
│   └── site/            # Site/Dashboard (Next.js)
└── README.md
```

## Como Usar

### Gerenciador

```bash
cd projetos/gerenciador
npm install
npm run dev
```

O gerenciador estará disponível em `http://localhost:3100`

### Site

```bash
cd projetos/site
npm install
npm run dev
```

O site estará disponível em `http://localhost:3000`

## Scripts Disponíveis

### Gerenciador
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Constrói para produção
- `npm run start` - Inicia servidor de produção
- `npm run db:push` - Sincroniza banco de dados
- `npm run db:seed` - Popula banco com dados de exemplo
- `npm run db:studio` - Abre Prisma Studio

### Site
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Constrói para produção
- `npm run start` - Inicia servidor de produção

## Deployment

Os projetos podem ser deployados independentemente no Vercel, Netlify ou outro serviço que suporte Next.js.

Alternativamente, use GitHub Pages com workflows do GitHub Actions para deployment automático.
