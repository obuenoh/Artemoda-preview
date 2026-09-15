import type { MetadataRoute } from 'next';
import { empresa } from '@/data/empresa';

// Conteudo nao depende de request — estatico tanto em server quanto em export.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = empresa.site.url;
  const agora = new Date();

  const paginas: { caminho: string; prioridade: number }[] = [
    { caminho: '/', prioridade: 1 },
    { caminho: '/uniformes-escolares', prioridade: 0.9 },
    { caminho: '/uniformes-empresariais', prioridade: 0.9 },
    { caminho: '/private-label', prioridade: 0.8 },
    { caminho: '/sobre', prioridade: 0.6 },
    { caminho: '/contato', prioridade: 0.7 },
  ];

  return paginas.map((p) => ({
    url: `${base}${p.caminho}`,
    lastModified: agora,
    changeFrequency: 'monthly',
    priority: p.prioridade,
  }));
}
