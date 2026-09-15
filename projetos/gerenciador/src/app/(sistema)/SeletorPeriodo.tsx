'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const opcoes = [
  { valor: 'hoje', rotulo: 'Hoje' },
  { valor: '7d', rotulo: '7 dias' },
  { valor: '30d', rotulo: '30 dias' },
];

export function SeletorPeriodo() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const atual = searchParams.get('periodo') ?? 'hoje';

  const [aberto, setAberto] = useState(atual === 'personalizado');
  const [inicio, setInicio] = useState(searchParams.get('inicio') ?? '');
  const [fim, setFim] = useState(searchParams.get('fim') ?? '');

  function aplicarPersonalizado() {
    if (!inicio || !fim) return;
    router.push(`${pathname}?periodo=personalizado&inicio=${inicio}&fim=${fim}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {opcoes.map((o) => (
        <Link
          key={o.valor}
          href={`${pathname}?periodo=${o.valor}`}
          onClick={() => setAberto(false)}
          className={`bt compacto py-2 ${atual === o.valor ? 'bt-cheio' : 'bt-vazio'}`}
        >
          {o.rotulo}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`bt compacto py-2 ${atual === 'personalizado' ? 'bt-cheio' : 'bt-vazio'}`}
      >
        Personalizado
      </button>

      {aberto && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="campo compacto w-[150px] py-2"
          />
          <span className="text-sm fraco">até</span>
          <input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="campo compacto w-[150px] py-2"
          />
          <button type="button" onClick={aplicarPersonalizado} className="bt bt-cheio compacto py-2">
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
