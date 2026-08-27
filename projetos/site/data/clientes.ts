export type Cliente = { nome: string; logo?: string };

/**
 * Barra de credibilidade. Adicionar nome aqui ja aparece no site;
 * quando houver arquivo de logo, preencher `logo` com o caminho em /public.
 */
export const clientes: Cliente[] = [
  { nome: 'Grupo Souza Lima' },
  // TODO: nomes/logos dos demais clientes autorizados a aparecer.
];
