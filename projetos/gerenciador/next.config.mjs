/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // O estoque da loja virou Peças (Fábrica, Loja e E-commerce): link antigo nao quebra.
  async redirects() {
    return [
      { source: '/vendas/estoque/novo', destination: '/pecas/nova', permanent: false },
      { source: '/vendas/estoque/:resto*', destination: '/pecas', permanent: false },
    ];
  },
};
