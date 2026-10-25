'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Abas de uma area (Financeiro, Vendas). A ativa e a de caminho mais longo
 * que casa com a pagina: /vendas/estoque/novo acende "Estoque da loja", nao "Vender".
 */
export function Abas({
  rotulo,
  itens,
  direita,
}: {
  rotulo: string;
  itens: { href: string; rotulo: string }[];
  direita?: ReactNode;
}) {
  const caminho = usePathname();
  const ativa = itens
    .filter((i) => caminho === i.href || caminho.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-fio">
      <nav aria-label={rotulo} className="flex gap-6">
        {itens.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            aria-current={ativa === a.href ? 'page' : undefined}
            className={`compacto -mb-px border-b-2 pb-3 text-rotulo font-bold uppercase transition-colors ${
              ativa === a.href ? 'border-gold text-ink' : 'border-transparent fraco hover:text-ink'
            }`}
          >
            {a.rotulo}
          </Link>
        ))}
      </nav>
      {direita && <div className="pb-2">{direita}</div>}
    </div>
  );
}
