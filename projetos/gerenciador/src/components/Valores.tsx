'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { centavosParaReais, centavosNumero } from '@/lib/numeros';
import { COOKIE_VALORES } from '@/lib/preferencias';

/**
 * Mostrar ou ocultar valores em dinheiro, como no app do banco.
 *
 * A escolha e uma so para o sistema todo e fica num cookie: o servidor ja
 * desenha a pagina oculta (sem piscar o valor antes de esconder), e o botao
 * aparece em cada tela que tem dinheiro — ela nao precisa voltar para a
 * Visao Geral para esconder ou mostrar.
 */

const Contexto = createContext<{ ocultos: boolean; alternar: () => void }>({
  ocultos: false,
  alternar: () => {},
});

export function ProvedorValores({ ocultosInicial, children }: { ocultosInicial: boolean; children: ReactNode }) {
  const [ocultos, setOcultos] = useState(ocultosInicial);

  function alternar() {
    const proximo = !ocultos;
    setOcultos(proximo);
    document.cookie = proximo
      ? `${COOKIE_VALORES}=ocultos; path=/; max-age=31536000; samesite=lax`
      : `${COOKIE_VALORES}=; path=/; max-age=0; samesite=lax`;
  }

  return <Contexto.Provider value={{ ocultos, alternar }}>{children}</Contexto.Provider>;
}

export function useValoresOcultos(): boolean {
  return useContext(Contexto).ocultos;
}

/**
 * Valor em reais que respeita o "ocultar". Negativo sai com o sinal de menos
 * na frente. `semSimbolo` e para tabela cuja coluna ja diz que e dinheiro.
 */
export function Dinheiro({ centavos, className, semSimbolo = false }: { centavos: number; className?: string; semSimbolo?: boolean }) {
  const ocultos = useValoresOcultos();
  if (ocultos) {
    return (
      <span className={className} aria-label="valor oculto">
        {semSimbolo ? '•••••' : 'R$ •••••'}
      </span>
    );
  }
  const texto = semSimbolo ? centavosNumero(Math.abs(centavos)) : centavosParaReais(Math.abs(centavos));
  return <span className={className}>{centavos < 0 ? `−${texto}` : texto}</span>;
}

export function BotaoOcultar() {
  const { ocultos, alternar } = useContext(Contexto);
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={ocultos}
      className="bt bt-vazio compacto gap-2 py-2"
      title={ocultos ? 'Mostrar os valores' : 'Esconder os valores'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        {ocultos && <path d="M4 4l16 16" />}
      </svg>
      {ocultos ? 'Mostrar valores' : 'Ocultar valores'}
    </button>
  );
}
