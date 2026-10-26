'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FRENTES, LISTA_FRENTES } from '@/lib/frentes';

/**
 * Tudo | Fabrica | Loja | E-commerce. Mexe so no parametro ?frente= e
 * mantem o resto (periodo, por exemplo). "Tudo" e a empresa inteira.
 */
export function SeletorFrente() {
  const caminho = usePathname();
  const parametros = useSearchParams();
  const atual = parametros.get('frente') ?? '';

  const link = (frente: string) => {
    const p = new URLSearchParams(parametros.toString());
    if (frente) p.set('frente', frente);
    else p.delete('frente');
    const q = p.toString();
    return q ? `${caminho}?${q}` : caminho;
  };

  const opcoes: [string, string][] = [['', 'Tudo'], ...LISTA_FRENTES.map((f): [string, string] => [f, FRENTES[f]])];

  return (
    <nav aria-label="Frente" className="inline-flex flex-wrap gap-1 rounded border border-fio bg-cream-alt p-1">
      {opcoes.map(([valor, rotulo]) => (
        <Link
          key={valor || 'tudo'}
          href={link(valor)}
          aria-current={atual === valor ? 'page' : undefined}
          className={`compacto rounded-sm px-3 py-1.5 text-rotulo font-bold uppercase transition-colors ${
            atual === valor ? 'bg-navy text-cream' : 'fraco hover:text-ink'
          }`}
        >
          {rotulo}
        </Link>
      ))}
    </nav>
  );
}
