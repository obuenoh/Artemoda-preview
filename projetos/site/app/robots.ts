import type { MetadataRoute } from 'next';
import { empresa } from '@/data/empresa';

// Conteudo nao depende de request — estatico tanto em server quanto em export.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${empresa.site.url}/sitemap.xml`,
  };
}
