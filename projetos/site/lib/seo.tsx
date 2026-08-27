import type { Metadata } from 'next';
import { empresa } from '@/data/empresa';

const base = empresa.site.url;

export function metadados({
  titulo,
  descricao,
  caminho,
  noindex = false,
}: {
  titulo: string;
  descricao: string;
  caminho: string;
  noindex?: boolean;
}): Metadata {
  const url = `${base}${caminho}`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url,
      siteName: empresa.nome,
      title: titulo,
      description: descricao,
      images: [{ url: `${base}/og.png`, width: 1200, height: 630, alt: empresa.nome }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: [`${base}/og.png`],
    },
  };
}

/** Organization + LocalBusiness com cidade e regiao — base do SEO local. */
export function schemaNegocio() {
  const { endereco, contato } = empresa;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organizacao`,
        name: empresa.nome,
        url: base,
        logo: `${base}/logo.png`,
        email: contato.email,
        telephone: `+${contato.whatsapp}`,
        sameAs: [contato.instagramUrl],
        slogan: empresa.assinaturas.principal,
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${base}/#confeccao`,
        name: empresa.nome,
        description:
          'Confecção própria de uniformes escolares, uniformes empresariais e private label em São Paulo. Corte e costura internos, personalização em DTF, silk screen e bordado.',
        url: base,
        telephone: `+${contato.whatsapp}`,
        email: contato.email,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: endereco.logradouro,
          addressLocality: endereco.cidade,
          addressRegion: endereco.uf,
          postalCode: endereco.cep || undefined,
          addressCountry: 'BR',
        },
        areaServed: [
          { '@type': 'City', name: 'São Paulo' },
          { '@type': 'Country', name: 'Brasil' },
        ],
        openingHoursSpecification: empresa.horario.schema.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: h.split(' ')[1]?.split('-')[0],
          closes: h.split(' ')[1]?.split('-')[1],
        })),
        parentOrganization: { '@id': `${base}/#organizacao` },
      },
    ],
  };
}

export function schemaFaq(itens: { pergunta: string; resposta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: itens.map((item) => ({
      '@type': 'Question',
      name: item.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: item.resposta },
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
