import { startTransition, type FormEvent } from 'react';

/**
 * Envia o formulario SEM limpar os campos.
 *
 * Com `<form action={...}>` o React 19 zera todos os campos quando a acao
 * termina — inclusive quando ela volta com erro. Ela le "Informe o valor",
 * e tudo o que tinha digitado (numa contagem de estoque, dezenas de linhas)
 * ja sumiu. Pelo onSubmit o que esta escrito fica onde esta.
 */
export function semLimpar(acao: (dados: FormData) => void) {
  return (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    startTransition(() => acao(dados));
  };
}
