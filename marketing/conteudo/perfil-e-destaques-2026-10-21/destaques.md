# Perfil e destaques — Instagram e TikTok

## Foto de perfil

`imagens/perfil-arte-e-moda.png` (1080x1080). Serve para Instagram e TikTok.
Monograma AM aplicado como no site. Quando o arquivo oficial da logo chegar, trocar esta imagem.

## Destaques do Instagram

Ordem pensada para quem chega pelo anúncio: o que gera orçamento vem primeiro.

| # | Título | Capa | O que colocar dentro |
|---|---|---|---|
| 1 | Orçamento | `destaque-01-orcamento.png` | Como pedir: pedido mínimo de 30 peças, o que enviar (quantidade, modelo, arte) e o WhatsApp (11) 94747-3375 |
| 2 | Escolar | `destaque-02-escolar.png` | Uniformes escolares produzidos, com autorização da escola |
| 3 | Empresas | `destaque-03-empresas.png` | Uniformes empresariais produzidos, com autorização da empresa |
| 4 | Sua marca | `destaque-04-sua-marca.png` | Private label: do piloto à grade completa, com a costura feita na confecção |
| 5 | Fábrica | `destaque-05-fabrica.png` | Bastidores reais: corte, costura, acabamento e expedição. Só fotos e vídeos da própria confecção |
| 6 | Contato | `destaque-06-contato.png` | Endereço (Av. Amador Bueno da Veiga, 2743, Penha de França), WhatsApp e horário. TODO: confirmar o horário de atendimento |

Títulos curtos de propósito: o Instagram corta nomes longos embaixo do círculo.

## Story de dentro de cada destaque

Um story por destaque, 1080x1920. Texto tirado das landings e do FAQ do site, no tom formal.

| Destaque | Arquivo |
|---|---|
| Orçamento | `imagens/story-01-orcamento.png` |
| Escolar | `imagens/story-02-escolar.png` |
| Empresas | `imagens/story-03-empresas.png` |
| Sua marca | `imagens/story-04-sua-marca.png` |
| Fábrica | `imagens/story-05-fabrica.png` |
| Contato | `imagens/story-06-contato.png` |

Ao publicar, adicionar a figurinha "Link" com `https://wa.me/5511947473375` em cima do botão do WhatsApp (story de Orçamento) e no rodapé dos outros. A imagem sozinha não é clicável.

TODO: horário de atendimento ficou de fora do story de Contato porque ainda não foi confirmado.

## Como aplicar a capa

1. Publique a capa como story (ou escolha da galeria em "Editar destaque" > "Editar capa").
2. Centralize o círculo no ícone. O pesponto dourado deve ficar inteiro dentro do recorte.

`previa.png` mostra como fica no tamanho real do celular, em fundo claro e escuro.

Para renderizar de novo depois de editar `artes.html`:
`NODE_PATH="../_render/node_modules" node render.js`
