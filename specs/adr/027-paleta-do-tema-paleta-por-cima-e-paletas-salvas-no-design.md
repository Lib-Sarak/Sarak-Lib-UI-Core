---
tipo: "adr"
titulo: "A paleta do tema é o padrão; \"manter minha paleta\" é escolha do sistema, e as paletas salvas moram no design"
status: "🟢 Aceito"
tags: ["adr", "paleta", "temas", "painel", "persistencia", "design-engine", "dado-gravado"]
relacionados: ["[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[024-paleta-calculada-separada-do-tema]]", "[[026-design-gravado-guarda-so-as-escolhas]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[010-temas-salvos-pelo-usuario]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[017-porta-de-apagar-tema-simetrica-a-de-escrever]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "A — \"manter minha paleta\" é um token do design (escolha do administrador, vale para todo usuário); as paletas salvas são uma chave do design, gravada pelo mesmo `onSave` (ESCOLHIDA)"
    custo: "O toggle vale para o sistema inteiro: um usuário final não vê o tema numa paleta diferente da do sistema (quem quer isso usa a preferência, e ela não existe para cor). Uma chave a mais no design — servidor que valida a lista de chaves, como o dos logins, precisa aceitá-la uma vez — e o payload cresce com o número de paletas salvas."
  - opcao: "B — \"manter minha paleta\" é preferência do usuário ([[016-preferencias-do-usuario-separadas-do-tema]]), ou estado só do painel"
    custo: "Como preferência: cor deixa de ser só do administrador e cada usuário vê o sistema numa cor, o que desfaz a identidade que o sistema declara; a camada de preferências ganha cor, superfície pública permanente. Como estado do painel: some ao fechar e nunca chega a quem só usa o sistema, então a pergunta \"como fica este tema na minha paleta?\" só se responde enquanto o painel está aberto."
  - opcao: "C — a paleta salva ganha porta própria, simétrica à de tema salvo (`onSave` de paleta, leitura e apagar)"
    custo: "Código novo em todo importador, três portas a documentar e a manter, e a regra de [[017-porta-de-apagar-tema-simetrica-a-de-escrever]] repetida para um dado que cabe numa lista."
  - opcao: "D — a paleta salva é uma entrada na tabela de temas (`customThemes`)"
    custo: "Paleta misturada com tema: todo lugar que lista temas (galeria, seletor, exportação) passa a filtrar o que é paleta, e um tema \"só de paleta\" não tem as demais escolhas de um tema."
---

**Aceito pelo dono em 2026-11-12.** Premissa: o formato do ADR-026 (gravar só escolhas), aceito no mesmo dia sem mudança.

# 1. Contexto e Problema

Decisão do dono em **2026-11-11**; registrada em 2026-11-12. Pedido: "cada tema possui uma cor padrão; ao selecionar um tema
deveríamos aplicar a cor padrão dele (faz parte da personalidade de cada tema), porém gostaria de ter uma opção para a paleta
sobressair o tema, no caso do usuário querer ver como fica um tema numa paleta específica. Deve ser possível salvar uma paleta
criada, como um tema, inclusive com nome próprio, para usar uma paleta para a marca."

O que existe, lido em 2026-11-11:

- Todo tema tem cor própria: todos declaram `colorPalette` (trava `themes/__tests__/themePalettes.test.ts`), e 11 dos 23 declaram
  também papéis de cor por cima dela, que vencem a calculada (medido em 2026-11-12). A troca de tema compõe
  e não herda (`src/core/Design/presets/themes/compose.ts:30-55`; [[09-temas-e-presets]] §4.3.3).
- Escolher uma paleta no painel já vence a cor do tema: `usePaletteSelection.ts:38-39` grava `colorPalette` e as cores calculadas
  no rascunho, por cima das que o tema declara. O que falta é a paleta **sobreviver à troca de tema**, que compõe as cores do
  tema novo.
- O criador de paleta (`PaletteCreator.tsx`) produz o valor `custom:<tipo>:<#base>[,sec=…][,acc=…]`, mas ele vive só como valor
  de `colorPalette`: não há como guardá-lo com nome.
- Tema salvo pelo usuário tem porta de escrita e de apagar ([[011-tema-salvo-por-uma-porta-de-escrita]],
  [[017-porta-de-apagar-tema-simetrica-a-de-escrever]]); paleta não tem.

**Premissa: [[026-design-gravado-guarda-so-as-escolhas]]**, ainda 🟡 Proposto. Este ADR não repete o formato: parte dele (o gravado
é o dicionário esparso das escolhas; o que a paleta calcula é recalculado ao carregar; a paleta escolhida vence o tema e volta
igual ao recarregar). Se o 026 mudar na aprovação, este se ajusta na mesma rodada.

# 2. Decisão

**Adota-se a alternativa A, em três partes.**

## 2.1 "Manter minha paleta" é do sistema

Um **token do design**, booleano, escolhido pelo administrador no painel (nome definitivo e as três fontes de token no lote 1,
[[04-contrato-de-tokens-e-paridade]]). **Desligado (padrão):** escolher um tema aplica as cores dele — a paleta que
declara ou as cores que declara. **Ligado:** a paleta selecionada é aplicada por cima de qualquer tema, em toda troca de tema.
Vale para todo usuário; nenhuma preferência pessoal é criada.

## 2.2 Ligado, a paleta vence tudo o que ela calcula

Com o toggle ligado, a paleta vence **todas as cores que ela calcula**, inclusive as que o tema declara — o mesmo que escolher a
paleta faz hoje no painel, estendido à troca de tema. O que o tema declara e a paleta **não** calcula, e todo o resto do tema,
fica como está. Não é decisão nova: é o comportamento atual (`usePaletteSelection.ts:38-39`) e a regra de [[026-design-gravado-guarda-so-as-escolhas]]
§2.1 (paleta escolhida difere da do tema → o baseline usa as cores calculadas por ela), aplicada também depois de trocar o tema.

## 2.3 A paleta salva mora no próprio design

Uma chave do design com a lista `{ id, nome, valor }` — o `valor` é o `colorPalette` `custom:…` —, gravada pelo **mesmo `onSave`**
do design. Nenhuma porta nova, nenhuma tabela nova, nenhum código novo no importador. Escolher uma paleta salva é escolher o
`valor` dela como `colorPalette`, como qualquer outra paleta. Recomendação do revisor como a mais simples; o dono a confirma ao
aprovar este ADR.

## 2.4 Como o formato do 026 grava as duas escolhas

Ambas são **escolhas do design do sistema**, e é por isso que o 026 as preserva sem regra nova:

- **O toggle** é uma chave do dicionário cujo valor difere do padrão do schema (desligado). Pela regra "escolha é a chave que
  difere do baseline" (026 §2.1), **ligado é gravado**; desligado é o padrão e some do gravado. Ele não é calculado por paleta
  nenhuma, então nunca entra nas chaves que o recálculo refaz (as de `PALETTE_ROLE_MAP` e as derivadas do tom): é preservado
  como está, e a regra L1 do dado antigo (026 §2.2) não o toca.
- **A paleta escolhida por cima de um tema de cor declarada** é o condutor `colorPalette` diferindo do que o tema declara — a
  regra que o 026 já traz. Gravado só `colorPalette`, sem as cores calculadas; recarregar devolve a mesma tela. Com o toggle
  ligado e outro tema escolhido depois, `colorPalette` segue diferindo do tema novo, segue sendo escolha e segue gravado; o
  baseline recalcula a partir dela, sem herdar cor do tema anterior.
- **A lista de paletas salvas** é uma chave do dicionário (valor estruturado). Ela não é calculada nem declarada por tema algum:
  seu baseline é a lista vazia, e a lista com itens difere dele, logo é escolha e é gravada. Passa pelo `onSave` e volta pelo
  `onLoad` como qualquer chave; o `format: 2` do 026 continua fora do dicionário e a lista não o altera. Duas consequências a
  conferir no lote 2: o valor estruturado precisa caber na comparação com o baseline do 026 (igualdade profunda, não por
  referência) e a lista não pode ser tratada como "cor" pela regra L1.

> **Nota de implementação (2026-11-18).** O dicionário de tokens só aceita valor simples. Por isso a lista é um
> token `string` (`savedPalettes`), com cada item `id|nome|valor` separado por `~` e lido por `savedPalettesOf`. A comparação com o
> baseline do 026 é por igualdade de texto, não profunda. O teto é de 24 paletas e de 40 caracteres no nome. A decisão (a lista mora
> no design e passa pelo mesmo `onSave`) não muda.
>
> O toggle é o token `keepPalette` (booleano, funcional, padrão desligado). Ligar sem paleta escolhida antes vale a paleta vigente,
> e ligar já tira do rascunho as cores que o tema declara por cima dela. As duas chaves ficam de pé na troca de tema mesmo quando o
> tema aplicado traz o padrão do schema para elas, como faz um tema salvo pelo painel. O resultado está em [[09-temas-e-presets]]
> §4.3.4 e §4.6 e em [[06-painel-de-customizacao-e-preview]] §2.4.

Este ADR **não** muda o formato do 026: acrescenta duas chaves a ele. Se o 026 não for aprovado, as duas chaves continuam
valendo no formato de hoje (o design completo), sem a regra do baseline.

# 3. Consequências

- **Positivas:**
  - Escolher tema volta a mostrar a personalidade dele; ver "como fica este tema nesta paleta" é um interruptor, e a resposta
    sobrevive a trocar de tema e a recarregar.
  - Paleta de marca fica nomeada, escolhível na galeria e no atalho de marca, sem nenhuma porta nova a integrar: o importador
    que já grava o design grava as paletas.
  - A precedência continua num lugar só (a composição do 026), em vez de uma exceção no painel.
- **Negativas (Trade-offs):**
  - **O toggle é do sistema, não de quem olha.** O usuário final não escolhe ver outra cor; quem quer isso pede ao administrador.
    Se isso virar necessidade, é uma preferência de cor — decisão nova, com ADR próprio, e a [[016-preferencias-do-usuario-separadas-do-tema]] a
    cobre.
  - **Uma chave a mais no design** (e outra para o toggle): servidor que valida a lista de chaves, como o dos logins, a aceita
    uma vez. Instalação existente com o dado antigo não tem as chaves e lê o padrão (sem paletas, toggle desligado): nada a migrar.
  - **O payload cresce com o número de paletas salvas**, e a lista viaja inteira a cada `Aplicar`. Sem limite decidido aqui; o lote 2
    mede e, se preciso, impõe um teto.
  - **Paleta salva não é compartilhável entre sistemas** sem exportar o design: ela mora no design de um sistema. Quem quiser a
    mesma paleta em dois sistemas copia o `valor`.
  - **Ligar o toggle sem paleta escolhida antes** vale a paleta vigente; o detalhe fica para o lote 1.
  - Voltar atrás é caro depois que importadores gravarem as chaves: tirar uma delas é MAJOR para quem as guarda.
- **Síntese:** quando aprovado e implementado, [[09-temas-e-presets]] §4.3.4 (quem vence com a paleta por cima) e §4.6 ou seção nova
  (paleta salva) e [[06-painel-de-customizacao-e-preview]] §2.4 (o controle, o grupo "Minhas paletas" e o salvar no criador)
  passam a descrever o resultado; este ADR fica como o porquê.
