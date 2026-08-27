import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { SeamStitch } from '@/components/ui/Stitch';
import { empresa } from '@/data/empresa';

const colunas = [
  {
    titulo: 'Soluções',
    links: [
      { label: 'Uniformes escolares', href: '/uniformes-escolares' },
      { label: 'Uniformes empresariais', href: '/uniformes-empresariais' },
      { label: 'Private label', href: '/private-label' },
    ],
  },
  {
    titulo: 'A empresa',
    links: [
      { label: 'Sobre a Arte e Moda', href: '/sobre' },
      { label: 'Como produzimos', href: '/#processo' },
      { label: 'Dúvidas frequentes', href: '/#faq' },
      { label: 'Contato', href: '/contato' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="fabric relative bg-navy-deep">
      <div className="container-am">
        <SeamStitch className="opacity-60" />
      </div>

      <div className="container-am section-y-sm">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-16">
          <div>
            <Logo size="md" />
            <p className="mt-6 max-w-[38ch] font-display-mid text-[1.375rem] leading-snug text-cream">
              {empresa.assinaturas.secundaria}
            </p>
            <p className="mt-6 font-sans text-label font-medium uppercase text-gold">
              {empresa.descritor}
            </p>
          </div>

          {colunas.map((coluna) => (
            <nav key={coluna.titulo} aria-label={coluna.titulo}>
              <h2 className="font-sans text-label font-semibold uppercase text-gold">
                {coluna.titulo}
              </h2>
              <ul className="mt-5 space-y-3">
                {coluna.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-muted-on-dark transition-colors duration-300 hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 grid gap-10 border-t border-hairline pt-10 md:grid-cols-3">
          <div>
            <h2 className="font-sans text-label font-semibold uppercase text-gold">Contato</h2>
            <ul className="mt-5 space-y-2 text-body-sm text-muted-on-dark">
              <li>
                <a
                  href={`https://wa.me/${empresa.contato.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  {empresa.contato.whatsappFormatado}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${empresa.contato.email}`}
                  className="break-all transition-colors hover:text-gold"
                >
                  {empresa.contato.email}
                </a>
              </li>
              <li>
                <a
                  href={empresa.contato.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  @{empresa.contato.instagram}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-label font-semibold uppercase text-gold">Confecção</h2>
            <address className="mt-5 not-italic text-body-sm text-muted-on-dark">
              {empresa.endereco.logradouro}
              <br />
              {empresa.endereco.bairro} — {empresa.endereco.cidade}/{empresa.endereco.uf}
            </address>
            <p className="mt-3 text-body-sm text-muted-on-dark">{empresa.horario.resumo}</p>
          </div>

          <div>
            <h2 className="font-sans text-label font-semibold uppercase text-gold">Legal</h2>
            <ul className="mt-5 space-y-2 text-body-sm text-muted-on-dark">
              <li>CNPJ {empresa.cnpj}</li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="transition-colors hover:text-gold"
                >
                  Política de privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-8 text-label uppercase text-muted-on-dark md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {empresa.nome}. Todos os direitos reservados.
          </p>
          <p className="text-gold">{empresa.assinaturas.principal}</p>
        </div>
      </div>
    </footer>
  );
}
