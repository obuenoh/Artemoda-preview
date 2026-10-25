'use client';

import { centavosParaReais, dataCurtaBR } from '@/lib/numeros';
import { useValoresOcultos } from './Valores';

/**
 * Barras de venda por dia. As alturas ficam mesmo com valores ocultos
 * (mostram o ritmo, nao a quantia); o valor ao passar o mouse some.
 */
export function GraficoVendas({ pontos, altura = 160 }: { pontos: { dia: string; totalCentavos: number }[]; altura?: number }) {
  const ocultos = useValoresOcultos();
  const maior = Math.max(1, ...pontos.map((p) => p.totalCentavos));
  const rotularCada = pontos.length > 15 ? 3 : 1;

  return (
    <div className="tabela-rolagem">
      <div className="flex min-w-[480px] items-end gap-1.5 rounded border border-fio bg-cream-alt p-4" style={{ height: altura }}>
        {pontos.map((p, i) => (
          <div key={p.dia} className="flex flex-1 flex-col items-center justify-end gap-1.5" style={{ height: '100%' }}>
            <div
              className="w-full rounded-t-sm bg-gold"
              style={{ height: `${Math.max(3, (p.totalCentavos / maior) * 100)}%`, opacity: p.totalCentavos > 0 ? 1 : 0.35 }}
              title={ocultos ? undefined : centavosParaReais(p.totalCentavos)}
            />
            <span className="h-3 text-[9px] fraco">
              {i % rotularCada === 0 || i === pontos.length - 1 ? dataCurtaBR(new Date(`${p.dia}T12:00:00`)) : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
