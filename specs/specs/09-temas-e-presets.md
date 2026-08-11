---
tipo: "spec"
titulo: "Temas e presets — tema como DADO"
dominio: "Sarak-Lib-UI-Core / Design Engine / Temas"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "temas", "presets", "design-engine", "tokens", "validacao"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[06-painel-de-customizacao-e-preview]]", "[[10-seguranca-e-acessibilidade]]", "[[003-remocao-backend-proprio]]"]
---

# 1. Propósito e a frase que resume tudo

> **Tema é DADO, nunca código.**

Um tema desta biblioteca é um objeto JSON com pares `tokenId → valor`. Não é um arquivo CSS, não é uma
classe, não é um componente, não é uma linha em banco de dados. Ele nasce no código do consumidor (ou
sai do painel como arquivo), atravessa uma fronteira de validação e vira CSS Variable.

Esta spec descreve **o contrato do dado, o ciclo de vida dele e as travas anti-drift**. O motor que
consome esse dado está em [[02-design-engine]]; o dicionário de tokens e a paridade das 5 camadas estão
em [[04-contrato-de-tokens-e-paridade]]; a UI que autora o dado está em
[[06-painel-de-customizacao-e-preview]].

**Onde não há mais nada:** não existe backend de temas, endpoint de tema, tabela `custom_themes` nem
"salvar tema no servidor" — ver [[003-remocao-backend-proprio]]. "Salvar um tema" **é** exportar JSON.

# 2. O contrato `ThemePreset`

```ts
export interface ThemePreset {
    id: ThemePresetId;
    name: string;
    description: string;
    design: Record<string, unknown>;
}
```

Fonte: `src/core/Design/presets/themes/index.ts:42-47`.

Quatro observações que importam mais que o formato:

1. **`design` é `Record<string, unknown>`, não `SarakThemePayload` estrito** — e isso é deliberado,
   documentado no cabeçalho do próprio arquivo (`index.ts:1-12`): presets legados carregam valores que
   divergiram do domínio fechado do payload. A blindagem não está no tipo, está na **função de
   validação** (§4.2). Tipo forte no dado de entrada seria falsa segurança: o JSON pode vir de
   `localStorage`, de arquivo, de fetch do host — nenhum desses passa pelo compilador.

2. **A lista de `tokenId` válidos é DERIVADA do código, nunca escrita à mão.** A fonte é
   `getAllDesignTokens()` (`src/core/Design/master-map.ts:74-76`), que achata os tokens de todos os
   schemas. **Nenhuma lista de tokens aparece neste documento** — nem deve aparecer em nenhum outro:
   cópia estática de fonte viva já nasce desatualizada (é literalmente o defeito que
   `generate_themes.ts` foi reescrito para eliminar, §6.3).

3. **`ThemePresetId` é uma união fechada** (`index.ts:19-40`), espelho de `GLOBAL_THEMES`. Adicionar um
   tema shippado = acrescentar o id ali **e** importá-lo na lista. Um tema do *consumidor* não precisa
   disso: ele entra por `customThemes` como dado, sem tocar no tipo da lib.

4. **O mesmo formato serve para os dois lados.** O que o painel exporta
   (`buildThemeExportPayload`, `src/features/DesignEngine/Main/utils/exportTheme.ts:40-46`) é
   `{ id, name, design }` — o mesmo shape dos temas embutidos. Isso não é coincidência: é o que faz
   "exportar do painel → colar em `customThemes`" funcionar sem conversão.

# 3. Preset × tema: a MESMA primitiva, amplitudes diferentes

Não há dois mecanismos. Há um mecanismo e duas amplitudes:

| | Preenche | Exemplo | Gabarito |
| --- | --- | --- | --- |
| **Preset** | a fatia de **um domínio** | só os tokens de card, só os de botão | `getScaffold('cards')` |
| **Tema** | **tudo** | cor + fonte + cromo + raio + espaçamento… | `getScaffold()` |

`getScaffold(domain?)` (`master-map.ts:126-139`) é o **gabarito vivo dos dois**: sem argumento devolve o
estado-padrão completo; com um domínio (id de schema **ou** coluna de persistência, via `getDomainMap()`,
`:105-117`) devolve só aquela fatia. Aplicar um preset sobrepõe **apenas** as chaves do domínio dele — as
demais do rascunho sobrevivem.

**Consequência prática:** quem sabe escrever um preset sabe escrever um tema. Não existe API separada,
não existe "modo tema" e "modo preset". Existe um `Record` maior e um menor.

# 4. Ciclo de vida de um tema

## 4.1 Criar — derivando de uma referência, nunca do zero

A lib fornece um **par de temas COMPLETOS** para servir de ponto de partida:

```ts
export const SARAK_REFERENCE_THEMES: ThemePreset[] = [
    getThemePreset('minimalist-airy'),   // claro,  topbar,  Inter
    getThemePreset('sarak-sovereign'),   // escuro, sidebar, Outfit
].filter((theme): theme is ThemePreset => Boolean(theme));
```

Fonte: `src/core/Design/presets/themes/reference.ts:25-28`. `getThemePreset(id)` (`:17-18`) busca
qualquer tema do catálogo pelo id.

**O par difere em modo (claro/escuro), navegação (topbar/sidebar) E fonte DE PROPÓSITO**
(`reference.ts:10-12`): alternar entre os dois tem de mudar visivelmente cor **e** fonte **e** cromo **e**
raio. Um par que diferisse só na cor não provaria nada.

> **A regra derivada, que é o item mais importante desta seção:**
> **parta de um tema de referência completo e customize poucos valores. NÃO monte um tema do zero.**

**Por que a regra existe (fato, não hipótese):** um consumidor real montou um tema com ~10 chaves, todas
de cor, e concluiu que "a lib não muda fonte nem cromo". A lib mudava — o **tema** é que não declarava
esses eixos. O diagnóstico está registrado no cabeçalho de `reference.ts:1-8` e de
`utils/themeAxes.ts:1-11`, escritos justamente para não deixar essa conclusão errada se repetir.

## 4.2 Validar — a fronteira que trata tema como dado hostil

Todo `design` passa por `validateDesign` (`src/core/Provider/utils/validation.ts:184-238`) antes de virar
CSS Variable. Três comportamentos:

| Situação | O que acontece |
| --- | --- |
| Chave é token do catálogo, valor dentro do contrato | entra (numérico é **clampado** aos limites do token, `:59-65`) |
| Chave é token, valor fora do contrato | **descartada** + `console.warn` "valor fora do contrato" (`:196-199`) |
| Chave desconhecida (nem token, nem `ALLOWED_EXTRA_KEYS`) | **descartada** + `console.warn` "chave desconhecida" (`:213`) |

O detalhe do porquê de cada rejeição (padrões de cor, breakout de CSS) é matéria de segurança e mora em
[[10-seguranca-e-acessibilidade]] §2.1. Para esta spec basta a garantia: **um tema inválido degrada
campo a campo, nunca derruba a aplicação e nunca injeta o que não entendeu.**

**Utilitário opt-in de completude** — `findMissingThemeAxes` e `warnOnIncompleteTheme`
(`src/core/Design/utils/themeAxes.ts:28-49`), sobre os 5 eixos declarados em `THEME_AXES` (`:16-22`):

| Eixo | Basta um destes tokens presente |
| --- | --- |
| `color` | `primaryColor`, `accentColor`, `textColorMaster`, `colorBgBody`, `surfaceColor` |
| `font` | `bodyFont`, `headingFont`, `monoFont` |
| `chrome` | `sidebarColor`, `topbarColor`, `sidebarWidth`, `topbarHeight` |
| `radius` | `borderRadius`, `cardBorderRadius`, `btnBorderRadius` |
| `spacing` | `layoutGap`, `layoutPadding`, `cardPaddingMd` |

`warnOnIncompleteTheme` **avisa e devolve a lista; não lança** (`:39-49`). A lib não força completude —
ela impede que a incompletude seja silenciosa. A diferença é de projeto: forçar quebraria quem tem
motivo legítimo para um tema parcial.

## 4.3 Aplicar — `activeThemeId` × `initialTheme`

Duas portas, **contratos de estabilidade diferentes**:

| Prop | Semântica | Exige do consumidor |
| --- | --- | --- |
| `activeThemeId` (`types.ts:232`) | **controlado** — a lib segue este valor | que `customThemes` seja **referencialmente estável**; um array recriado a cada render realimenta o ciclo |
| `initialTheme` (`types.ts:240`) | **semente** — "só quero começar neste tema" | nada; é o caminho seguro para o caso comum |

O comentário de `types.ts:236-240` diz isso explicitamente: `initialTheme` existe para **não expor o
consumidor ao contrato de estabilidade de referência** que `activeThemeId` exige. Quem só quer escolher o
tema inicial usa `initialTheme`; quem quer um seletor de tema controlado pelo próprio estado usa
`activeThemeId` **e** memoiza `customThemes`.

### 4.3.1 O que é emitido é o que foi escrito — decisão **D** *(`plan-24-1`, 2026-08-11)*

> 🔴 **Mudança de comportamento público.** Até a `plan-24-1`, `useDesignVariables` chamava
> `syncThemeWithMode` **a cada render, sem condição**: toda cor de todo tema de todo consumidor era
> reescrita antes de virar CSS Variable. Medido nos 18 temas embarcados, cada um no **próprio modo nativo**:
> **1299 de 1316 valores alterados**, e **178 de 648** veredictos de contraste divergindo entre o escrito e o
> emitido.

**Agora, no modo nativo do tema, `emitido = escrito`.** A conversão claro↔escuro só roda onde alguém de fato
pediu o outro modo: no clique do `ShellThemeToggle` e na miniatura do `PresetCard`. Um patch parcial do tipo
`{...temaEscuro, mode: 'light'}` **não inverte mais as cores sozinho** — muda o rótulo, não a paleta.

**Por que valeu a quebra.** A reescrita silenciosa contradizia o padrão da base — a **R6** descarta valor fora
do contrato **com `console.warn`**, e todo gate mede e declara; só o motor de cor mudava o dado do autor sem
contar a ninguém. Ela também **inviabilizava conserto**: corrigir um token de tema não chegava à tela.

⚠️ **Custo assumido, e ele é do consumidor:** os 18 temas embarcados foram autorados **contra** o motor
forçando — desligar a reescrita levou o gate de **108 para 188** reprovados antes de eles serem corrigidos.
Os 18 foram corrigidos; **o tema do consumidor não**, e o solucionador não é publicado. A entrada em
`docs/migracoes.md` é obrigatória de ler antes do upgrade.

## 4.4 Persistir — `localStorage`, e a sincronização entre abas

Persistência é **local por construção** (`options.persistence`, `types.ts:153-166`):
`storageKey` nomeia a chave, `onSave`/`onLoad` são as portas "traga sua persistência" (para o backend
**do consumidor**, se ele quiser — a lib nunca faz fetch para servidor próprio), e
**`crossTabSync` (default `true`)** escuta o evento `storage` e reaplica o design — **validado** — quando
outra aba/app da mesma origem grava a mesma chave.

`crossTabSync` é o que faz o modo ui-kit + central funcionar com **apps separados por deploy**: N
Providers independentes, mesma origem, mesma `storageKey` → trocar o tema numa aba repinta as outras.
Ver [[005-modelo-modulos-plugin-e-apps-separados]].

## 4.5 Exportar — o substituto do "salvar no banco"

`buildThemeExportPayload` (`exportTheme.ts:40-46`) exporta o conjunto **COMPLETO** de tokens, não o
rascunho: `resolveCompleteDesign` (`:18-21`) parte de `getDefaultDesignState()` e sobrepõe o design
informado. Isso é a §4.1 aplicada na saída — **um tema exportado nasce completo, com todos os eixos**, e
portanto o consumidor que o cola em `customThemes` não herda o problema de "faltou um eixo".

`slugifyThemeId` (`:24-33`) transforma o nome livre num id estável kebab-case; `downloadThemeJson`
(`:49-63`) dispara o download no browser.

O caminho ponta a ponta: **painel → exportar JSON → colar em arquivo `.ts`/`.json` do repo do consumidor
→ passar em `customThemes`**. É este o ciclo inteiro; não existe outro.

# 5. O catálogo shippado — números MEDIDOS

Medidos em **2026-07-29**, na execução de `run_audit` que acompanha esta spec:

| Fonte | Contagem |
| --- | --- |
| Temas globais (`GLOBAL_THEMES`) | **18** |
| Presets de componente | **102** |
| **Total auditado** | **120 itens** |
| Gabarito vivo (`getScaffold()`) | **409 chaves** |

Arquivos: `src/core/Design/presets/themes/` (18 temas + `index.ts` + `reference.ts` + `color-engine.ts`)
e `src/core/Design/presets/components/` (5 arquivos: `atmosphere`, `buttons`, `cards`, `inputs`,
`typography`).

> **A lista de temas e a lista de presets NÃO são transcritas aqui de propósito** (Regra 4 da campanha).
> Elas se leem no código (`GLOBAL_THEMES`) e no catálogo gerado. Um tema novo entra amanhã e este
> documento continuaria dizendo "18" — que é exatamente como uma spec vira mentira.

Nem todos os presets são escritos à mão: parte é **derivada** de listas de opções — `TEXTURE_PRESETS` e
`CARD_TEXTURE_PRESETS` saem de `TEXTURE_OPTIONS`, `BUTTON_STYLE_PRESETS` de `BUTTON_STYLE_OPTIONS`,
`TYPOGRAPHY_PRESETS` de `THEME_FONTS` (`presets/components/*.ts`, todos por `.map()`). Derivar em vez de
duplicar é o que mantém preset e enum do schema em sincronia sem gate extra.

# 6. Anti-drift — as travas

Um tema é dado solto. Sem trava, ele apodrece em silêncio: o schema muda, o tema fica com chave que não
existe mais, e ninguém vê. Cada instrumento pega uma classe diferente de rot — as quatro primeiras cobrem a
**estrutura** do tema; a §6.5 é a única que olha o **resultado visual**.

## 6.1 `auditor_presets` — chave órfã

Compara **todo** tema/preset shippado contra o `getScaffold()` vivo (delega a `verify_presets.ts`).
Saída atual: gabarito de **409 chaves**, **120 itens auditados**, **0 órfãs**. Roda dentro de
`run_audit` — ver [[01-gates-e-baseline]] §2.1.

## 6.2 `tokenContractParity.test.ts` — valor fora do próprio contrato

`src/core/Provider/utils/__tests__/tokenContractParity.test.ts` audita **todo valor shippado pela lib**
(defaults do `MASTER_DESIGN_MAP` + os 18 temas + os 102 presets) com `auditTokenContract`
(`validation.ts:170-182`) — a função **pura** que reusa `coerceTokenValue`, o mesmo predicado do runtime.
Por isso a auditoria **nunca diverge do comportamento real**.

> ### A lição permanente: amostra de console NÃO é auditoria
>
> O problema apareceu como uma enxurrada de avisos no console do consumidor — **9 tokens** visíveis. A
> auditoria exaustiva achou **117 violações em 21 tokens** (`plan/40.4` §Achado). Os defaults estavam
> 100% limpos; todo o drift vinha de **valores nos temas/presets shippados**.
>
> O console mostra só o que o boot **tocou**. Se a régua tivesse sido a amostra, 12 tokens continuariam
> quebrados e a spec teria sido declarada concluída. **Toda auditoria de dado shippado tem de ser
> exaustiva e determinística — nunca observacional.**

## 6.3 `shippedThemesConsoleClean.test.ts` — a propagação de fato

`src/core/Provider/utils/__tests__/shippedThemesConsoleClean.test.ts` carrega cada um dos 18 temas pelo
caminho do boot real (`{...defaults, ...tema}` por `validateDesign`) e afirma **zero** aviso
"fora do contrato". É a prova de que a correção chegou ao caminho que o consumidor executa — não só ao
predicado testado em isolamento.

## 6.4 O gerador consome o gabarito vivo

`scripts/generate_themes.ts:35` chama `getScaffold()` **em tempo de execução**. Ele substituiu um
`masterTemplate` hardcoded que, nas palavras do próprio comentário (`:7-9`), *"já nasceu desatualizado"*.
Um gerador que carrega a própria cópia do dicionário fabrica drift a cada execução.

## 6.5 `auditor_contraste` — a única trava que olha o RESULTADO, não a estrutura *(`plan-24`)*

As quatro acima perguntam *"o tema tem as chaves certas, com valores dentro do contrato?"*. Um tema pode
passar nas quatro e ainda entregar **texto ilegível** — foi exatamente o que aconteceu: `auditor_presets`
verde com **12 dos 18** reprovando AA, e ninguém sabia.

`verify_contrast.ts` mede **36 pares texto/fundo reais**, a **4,5:1 em todos** (a WCAG só permite 3:1 para
texto grande, ≥24px; onde o `textColorMuted` renderiza são 9–14px). Cor com alfa é **composta** sobre a
cadeia de fundo, não pulada. **Duas passadas**: o modo nativo do tema e a contraparte gerada. Baseline: **0
e 0**.

> ⚠️ **`pulado` não é `aprovado`.** 25 pares-tema não são medidos — fundo em `hsl()`, `var()`, gradiente, ou
> cadeia que não resolve opaca. O gate **declara** em vez de chutar uma cor. É por isso que a **R31** segue
> **⚠️** mesmo com os 18 temas verdes: conformidade verde não é cobertura plena.

**O que ele não cobre, por desenho:** o tema do **consumidor**. A R31 promete AA nos 18 shippados; dado de
terceiro é do terceiro — e desde a decisão **D** (§4.3.1) esse dado chega à tela como foi escrito.

# 7. Como criar um tema que passa em tudo, sem um único warn

O critério de aceite desta spec, como procedimento:

1. **Parta de uma referência completa** — clone um item de `SARAK_REFERENCE_THEMES` (ou exporte um tema
   do painel, que já sai completo por §4.5). **Não** comece de `{}`.
2. **Troque só os valores que você quer mudar.** Mantenha as chaves; um tema completo com 3 cores
   trocadas é um tema válido.
3. **Use apenas ids que existem** — a régua é `getAllDesignTokens()`. Chave inventada é descartada com
   warn (§4.2); ela não quebra a aplicação, mas também não faz nada.
4. **Respeite o tipo e o enum do token.** Cor precisa casar com `COLOR_PATTERN`; `select` precisa ser um
   valor de `constraints.options`; número é clampado a `min`/`max`. Esta é a regra que os 117 achados de
   §6.2 violavam.
5. **Confira a completude:** `findMissingThemeAxes(seuTema)` tem de devolver `[]`. Se devolver `chrome`,
   trocar de tema não vai mudar a topbar — e alguém vai reportar isso como bug da lib.
6. **Se o tema for shippado pela lib** (não é o caso do consumidor), acrescente o id em
   `THEME_PRESET_IDS` e importe em `GLOBAL_THEMES`; então rode `auditor_presets` (0 órfãs) e a suíte
   (§6.2/§6.3 varrem o tema novo automaticamente — nenhum teste precisa ser escrito para ele).

Os passos 3-5 são exatamente o que os três gates da §6 cobram. Seguir o procedimento e passar nos gates
são a mesma coisa dita de dois jeitos.

# 8. Backlog nomeado (é backlog, não plano)

Registrado para não ser redescoberto; **nenhum destes itens tem tarefa aberta nesta campanha**.

| # | Item | Origem | Situação |
| --- | --- | --- | --- |
| 1 | **Expansão/hospedagem de mídias de atmosfera** — biblioteca de texturas/imagens de fundo além das embutidas, e a decisão de onde elas ficam hospedadas | plano antigo de mídias de atmosfera *(removido; git)* | nunca executado |
| 2 | **Enriquecimento de presets visuais** — a granularidade de `cards.ts` estendida a `inputs`/`tables`/`navigation` | spec antiga de presets *(removida; git)* | **parcial**: `INPUT_PRESETS` existe, tabela/navegação não ganharam família de preset própria |

> ⚠️ **Correção de estado registrada:** a spec antiga de presets carregava
> `status: "🔴 A Implementar"` — e isso era **falso**. `ButtonPresetPreview.tsx`,
> `InputPresetPreview.tsx` e `PresetsCatalog.tsx` existem, todos em
> `src/features/DesignEngine/Canvas/components/`. O que ficou de fora dela é só o item 2 desta
> tabela. **O documento antigo foi removido na reescrita da base** — esta tabela é o que sobrou dele,
> e é aqui que o backlog vive agora.

# 9. Critérios de aceite

- [x] O contrato `ThemePreset` está descrito com `arquivo:linha`, incluindo **por que** `design` não é
      tipado estritamente.
- [x] Preset e tema aparecem como a mesma primitiva, com `getScaffold()` como gabarito comum.
- [x] Os números do catálogo são os **medidos** em 2026-07-29 (18 / 102 / 120 / 409), não copiados.
- [x] Nenhuma lista de tokens, temas ou presets foi transcrita para dentro deste markdown.
- [x] As cinco fases do ciclo de vida têm porta nomeada no código.
- [x] O procedimento da §7 leva a um tema que passa `auditor_presets` + `validateDesign` sem warn.
- [x] A lição "amostra de console não é auditoria" está registrada com os dois números (9 × 117/21).
- [x] Nenhuma menção a persistência de tema em servidor sobreviveu.

# 10. Plano de testes (Quality Gate)

Os testes que cobrem esta spec **já existem** — ela documenta o que eles cobram:

| Verificação | Onde |
| --- | --- |
| Todo tema/preset shippado em paridade com o gabarito vivo | `auditor_presets` (via `run_audit`) |
| Nenhum valor shippado fora do contrato do próprio token | `src/core/Provider/utils/__tests__/tokenContractParity.test.ts` |
| Boot dos 18 temas sem aviso de contrato | `src/core/Provider/utils/__tests__/shippedThemesConsoleClean.test.ts` |
| `validateDesign` descarta chave/valor fora do domínio | `src/core/Provider/utils/__tests__/validation.test.ts` |
| Eixos faltantes detectados | `src/core/Design/utils/__tests__/themeAxes.test.ts` |
| Export completo (não subconjunto) | `src/features/DesignEngine/Main/utils/__tests__/exportTheme.test.ts` |

**Nada a implementar.** Um tema novo é coberto automaticamente pelas duas suítes de contrato — é o que
significa "anti-drift por construção".
