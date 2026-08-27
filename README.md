# Gerenciador Arte e Moda

O sistema da confecção. Este manual é sobre **como usar**, não sobre como o
código funciona.

---

## Como abrir

No terminal, dentro desta pasta:

```
npm run dev
```

Depois abra **http://localhost:3100** no navegador.

Para entrar:

| Quem | E-mail | Senha |
|---|---|---|
| Dona (vê tudo) | `dona@arteemoda.com.br` | `arteemoda` |
| Produção (sem financeiro) | `producao@arteemoda.com.br` | `arteemoda` |

> As senhas acima são só para testar. Antes de usar de verdade, troque.

O sistema já vem com **dados de exemplo** de uma confecção — fornecedores,
tecidos, compras e uma remessa atrasada de propósito, para você ver o aviso
funcionando. Para apagar tudo e recomeçar do zero: `npm run db:reset`.

---

## O que dá para fazer hoje (Fase 1)

### Hoje

A primeira tela. Só aparece o que precisa de decisão sua nesta semana: peças
paradas no parceiro além do prazo, tecido abaixo do mínimo, e quanto dinheiro
está parado na prateleira. Cada cartão leva direto para a tela onde aquilo se
resolve.

### Peças no parceiro

**A tela que resolve a maior dor.** Toda vez que peças saem para bordar,
estampar ou silcar, registre aqui.

**Para mandar peças:** _Parceiros → Mandar peças_. Escolha o parceiro, dê um
nome ao lote (ex.: "Polo Colégio Alfa — agosto"), diga quantas peças saíram e
até quando precisam voltar. É essa última data que faz o sistema avisar do
atraso.

**Quando as peças voltarem:** abra a remessa e clique em _Registrar volta_.
Informe quantas voltaram boas e quantas voltaram com defeito. **Pode registrar
em partes** — se voltarem 60 hoje e 30 na semana que vem, registre duas vezes.
O sistema vai descontando sozinho.

Se alguma peça voltou com defeito, ele pede o motivo. Não é burocracia: é o
registro que permite cobrar do parceiro depois.

### Tecidos

O cadastro do que você compra. **Cada cor é um cadastro separado** — malha azul
e malha branca são dois tecidos. Se ficarem juntas, o custo médio mistura
preços que não têm nada a ver um com o outro.

No cadastro tem o campo _"Avisar quando ficar abaixo de"_. É ele que faz o
tecido aparecer na tela Hoje quando estiver acabando.

### Compras

Toda vez que chegar tecido, registre em _Compras → Registrar compra_.

**Você não precisa calcular o frete por item.** Informe o frete total e o
sistema divide entre os tecidos daquela nota, proporcionalmente ao valor de
cada um. O custo que vai para o estoque já sai com o frete dentro.

### Estoque

Mostra quanto tem de cada tecido, quanto custa em média, e quanto custou na
última compra — os dois lado a lado.

Quando a última compra sai mais cara que a média, aparece uma **seta vermelha
com a porcentagem**. É assim que você descobre que um fornecedor aumentou sem
avisar.

**Extrato:** clicando em _Extrato_ você vê tudo que entrou e saiu daquele
tecido, com data, motivo e o nome de quem lançou. Nenhuma linha é apagada ou
alterada nunca. Se um número estiver errado, a correção entra como um
lançamento novo de ajuste — o histórico continua lá para explicar.

**O que está parado:** lista os tecidos do mais parado para o mais novo, com o
valor em reais de cada um e o total no topo.

### Contagem física

_Estoque → Fazer contagem_. Conte o que tem de verdade na prateleira e digite.
Onde houver diferença, o sistema pede o motivo — e o motivo é obrigatório.
É ele que explica o número no dia em que alguém perguntar.

**Estoque de abertura:** use uma vez só, no começo, para registrar o tecido que
já está na prateleira e nunca passou pelo sistema. Como não existe nota de
compra desse tecido, informe também quanto custou o metro. Se não souber o
valor exato, use o melhor palpite — dá para corrigir depois.

### Fornecedores

Cadastro de quem vende tecido e de quem faz bordado, DTF e silk.

**Preços:** cada fornecedor tem a própria tabela. Quando o preço muda, registre
o novo — **o antigo não é apagado**, vira histórico. É isso que faz o sistema
conseguir dizer "esse fornecedor subiu 12%".

**Comparar preços:** uma tela só, mostrando quem cobra quanto hoje pelo mesmo
item, do mais barato para o mais caro.

### Clientes

Escolas, empresas e marcas que você atende. Serve para ligar cada lote de
produção ao seu dono.

---

## O que ainda não existe

Estas partes vêm nas próximas fases, depois desta estar em uso de verdade:

- **Fase 2** — ficha técnica, ordem de produção, quanto o rolo rendeu de
  verdade, custo por peça e calculadora de preço mínimo
- **Fase 3** — contas a pagar, contas que se repetem, fluxo de caixa
- **Fase 4** — pedidos de venda, etiquetas com código de barras, baixa por
  bipagem
- **Fase 5** — nota fiscal e relatórios para o contador

---

## Perguntas que ainda faltam responder

O sistema está funcionando com um palpite nestes três pontos. Nenhum deles
trava o uso, mas todos mudam contas futuras — estão gravados como configuração,
não escondidos no código:

1. **Como as costureiras são pagas** — salário fixo, por peça, ou os dois?
   É o que define se a costura entra no custo da peça ou nas contas do mês.
   Assumimos **salário fixo**.
2. **Você compra tecido em quilo e usa em metro?** Assumimos que compra e usa
   na mesma unidade. Se não for, falta o fator de conversão.
3. **Prazo típico do parceiro** — assumimos **7 dias** como sugestão padrão.

Com o contador, ainda falta confirmar o regime da empresa e as notas de remessa
e retorno para bordado. Nada disso é chutado pelo sistema.

---

## Cuidados

**Faça backup.** Todos os dados ficam no arquivo `prisma/dev.db`. Copie esse
arquivo para outro lugar com frequência. Se ele sumir, os dados somem junto.

**Isto está rodando na sua máquina.** Enquanto estiver assim, só funciona neste
computador e só enquanto o `npm run dev` estiver aberto. Para usar no celular
no chão de fábrica e ter backup automático, o próximo passo é colocar no ar —
mas só depois desta fase estar sendo usada com dados reais.
