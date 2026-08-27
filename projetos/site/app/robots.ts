import type { MetadataRoute } from 'next';
import { empresa } from '@/data/empresa';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${empresa.site.url}/sitemap.xml`,
  };
}
