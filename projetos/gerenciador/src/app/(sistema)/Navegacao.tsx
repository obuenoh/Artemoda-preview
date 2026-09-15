'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Monograma } from '@/components/Marca';
import type { Papel } from '@/lib/sessao';

const itens: { href: string; rotulo: string; papeis: Papel[] }[] = [
  { href: '/', rotulo: 'Visão Geral', papeis: ['dona', 'producao', 'vendas'] },
  { href: '/vendas', rotulo: 'Vendas', papeis: ['dona', 'vendas'] },
  { href: '/nota-fiscal', rotulo: 'Nota Fiscal', papeis: ['dona'] },
  { href: '/tecidos', rotulo: 'Tecidos', papeis: ['dona', 'producao'] },
  { href: '/estoque', rotulo: 'Estoque', papeis: ['dona', 'producao'] },
  { href: '/compras', rotulo: 'Compras', papeis: ['dona', 'producao'] },
  { href: '/fornecedores', rotulo: 'Fornecedores', papeis: ['dona', 'producao'] },
  { href: '/clientes', rotulo: 'Clientes', papeis: ['dona', 'vendas'] },
];

export function Navegacao({
  papel,
  nome,
  sair,
}: {
  papel: Papel;
  nome: string;
  sair: () => Promise<void>;
}) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const visiveis = itens.filter((i) => i.papeis.includes(papel));

  const ativo = (href: string) =>
    href === '/' ? caminho === '/' : caminho.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-fio-ouro bg-navy-deep text-cream">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-2.5 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Início">
          <Monograma tamanho={26} />
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] sm:inline">
            Arte e Moda
          </span>
        </Link>

        <nav aria-label="Seções" className="hidden flex-1 lg:block">
          <ul className="flex flex-wrap gap-1">
            {visiveis.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`compacto inline-flex items-center rounded-sm px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                    ativo(item.href)
                      ? 'bg-gold text-navy-deep'
                      : 'text-[color:var(--texto-claro)] hover:text-gold'
                  }`}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-[10px] uppercase tracking-[0.16em] text-[color:var(--texto-claro)] sm:inline">
            {nome}
          </span>
          <form action={sair}>
            <button className="compacto rounded-sm border border-cream/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:border-gold hover:text-gold">
              Sair
            </button>
          </form>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            className="rounded-sm border border-cream/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] lg:hidden"
          >
            {aberto ? 'Fechar' : 'Menu'}
          </button>
        </div>
      </div>

      {aberto && (
        <nav aria-label="Seções (celular)" className="border-t border-fio-ouro lg:hidden">
          <ul className="mx-auto max-w-[1240px] px-4 py-2">
            {visiveis.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setAberto(false)}
                  className={`flex items-center border-b border-fio-ouro py-3 text-[12px] font-semibold uppercase tracking-[0.12em] ${
                    ativo(item.href) ? 'text-gold' : 'text-cream'
                  }`}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
