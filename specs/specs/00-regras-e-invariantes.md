---
tipo: "spec"
titulo: "Regras e invariantes — o contrato único do módulo"
dominio: "Sarak-Lib-UI-Core (todo o módulo)"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "regras", "invariantes", "contrato", "gates", "conduta"]
relacionados: ["[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]", "[[00-mapa-do-modulo]]", "[[03-superficie-publica]]", "[[04-contrato-de-tokens-e-paridade]]", "[[02-design-engine]]", "[[05-build-e-distribuicao]]"]
---

# 1. Propósito

Este é o **contrato único** do módulo: todas as regras e invariantes que valem para quem escreve código aqui, num só lugar. Antes desta spec elas estavam espalhadas por sete documentos, algumas em duplicata e algumas se contradizendo.

Aqui está **o que vale**. Como rodar cada verificação está em [[01-gates-e-baseline]]; **quando** ela roda está em [[02-enforcement-por-commit]].

> **Fechamento do conjunto (2026-08-02).** Até esta data o documento tinha 17 regras — e o repositório **bloqueava commit e push por regras que não estavam escritas aqui**. O levantamento feito no código (`package.json`, `.githooks/`, `scripts/`, os testes-gate) achou **15 regras vivas e não escritas**, cinco delas já com gate rodando. O caso que mais dói é o `check-release-tag`: em 2026-08-02 ele barrou um push imprimindo *"Regra violada"* — e a regra não existia. Gate que reprova citando regra inexistente é tão ruim quanto regra sem gate: nos dois casos o leitor não consegue chegar do bloqueio ao contrato. **As 15 entraram como R18–R32.**

## 1.1 Como ler cada regra

Toda regra tem quatro partes fixas:

- **Enunciado** — uma frase imperativa.
- **Por quê** — o dano concreto que ela evita. Onde foi possível, um dano que **já aconteceu**.
- **Certo × Errado** — o exemplo mínimo.
- **Cobrada por** — o gate exato, com comando. Ou **"nenhum gate"**, dito com todas as letras.

> **O campo "Cobrada por" é o coração desta spec.** Regra sem gate só existe se alguém lembrar dela, e o leitor tem o direito de saber quais são essas. **Nenhum gate foi inventado para preencher a coluna.**

Onde a regra se apoia num mecanismo já documentado, esta spec **aponta** para o documento de arquitetura em vez de repeti-lo.

## 1.2 O vocabulário do estado da verificação

Toda regra abre com um marcador. São quatro, e só quatro:

| Marcador | Significa |
| --- | --- |
| ✅ **gate pleno** | Existe verificação automática e o escopo dela **cobre** o escopo da regra |
| ⚠️ **escopo menor que a regra** | Existe verificação, e ela **não vê** parte do que a regra exige. O vão está escrito na própria linha |
| ⏳ **gate a construir** | A regra está fechada; a verificação ainda não foi construída. É trabalho da `plan-12` |
| 🔴 **conduta** | Não há gate, e **não vai haver** — o motivo está escrito na regra (§3) |

**A suíte conta como gate.** `npx vitest run` roda no Anel 3 do `pre-push` e **bloqueia** ([[02-enforcement-por-commit]] §4). Regra cobrada por teste que roda na suíte é ✅, e a linha nomeia o arquivo do teste.

> ⚠️ **Um `⏳` declarado vale mais que um `✅` falso.** A coluna diz o que **é**, não o que deveria ser. Inventar gate para preencher tabela é proibido por este repositório ([[00-contexto]] §7).

## 1.3 A contagem

**33 regras: 30 verificáveis (§2) e 3 de conduta (§3).**

> ✅ **Atualizado em 2026-08-07** (síntese das plans 12 e 16): R18, R27, R28 e R32 ganharam gate e viraram ✅;
> R10 ganhou gate parcial (HTML nativo cru) e virou ⚠️. Só **R31** seguia ⏳ — parada obrigatória da
> `plan-12`, aguardando o dono decidir a fronteira de pares/limiar antes de o gate poder nascer.
>
> ✅ **Fechado em 2026-08-10 (`plan-24`):** o dono decidiu (todos os pares reais · 4,5:1 sem relaxamento ·
> alfa composto), o gate nasceu e **R31 foi de ⏳ para ⚠️**. Nasceu **vermelho por desenho** — 188 pares-tema
> reprovados. Na mesma síntese nasceu **R33** (payload de tema é contrato público). **A fila de ⏳ zerou.**
>
> ✅ **E ficou verde em 2026-08-11 (`plan-24-1`): 188 → 0**, nos dois modos. **R31 continua ⚠️, e de
> propósito** — 25 pares-tema seguem pulados por fundo não determinístico. **Conformidade verde não é
> cobertura plena**, e o marcador descreve a segunda.
>
> 🔴 **Recontagem de 2026-08-09 — seis linhas desta tabela descreviam gates que já não existiam assim.** O
> revisor mediu cada regra contra o código, e **as seis erravam para o mesmo lado: diziam o sistema PIOR do
> que ele está.** `R7` dizia não ver `src/styles/` (vê), `R23` citava um gate que não é o dono do `§N.N`,
> `R30` dizia "14 erros" (são 0), `R8` dizia não ver `src/shared/` (vê, `:69`), `R29` dizia que 2 geradores
> não tinham `--check` (os 5 têm), e `R15` declarava uma violação **já corrigida** como impossível de
> corrigir. **R8 e R29 sobem para ✅**; o quadro vai de 19/9 para **21/7**.
>
> **Por que isso importa mais que a contagem:** documento que se descreve pior do que é não é humildade — é
> ruído com a mesma consequência do exagero contrário. Ele fez a `plan-15` mirar em alvos que já não
> existiam, e manteve fechada uma porta (R15) que estava aberta.

| Estado | Quantas | Quais |
| --- | --- | --- |
| ✅ gate pleno | **22** | R1 · R2 · R3 · R5 · R6 · **R8** · R9 · R12 · R13 · R18 · R19 · R20 · R21 · R22 · R24 · R25 · R26 · R27 · R28 · **R29** · R32 · **R33** |
| ⚠️ escopo menor que a regra | **8** | R4 · R7 · R10 · R14 · R17 · R23 · R30 · **R31** |
| ⏳ gate a construir | **0** | — *(a categoria fica; é para cá que volta a próxima regra fechada sem gate)* |
| 🔴 conduta | **3** | R11 · R15 · R16 |

**A numeração é identidade e é definitiva.** R14 é R14 para sempre: o `.githooks/pre-commit:68-71` imprime os números na mensagem de bloqueio, e há citação em skills, specs e no próprio código. Regra que sai de categoria **leva o número consigo** — foi o que aconteceu com R10, R11, R15 e R16.

# 2. Regras verificáveis

## R1 — Três camadas estritas

**Estado:** ✅ gate pleno.

**Enunciado.** `src/components/` **não** importa de `features/`. `src/core/` **não** importa de `features/`. A dependência aponta sempre para dentro.

**Por quê.** Sem isso o núcleo passa a depender da única feature que existe (o painel do Design Engine) e a lib deixa de ser uma base: um consumidor que nunca abre o painel carrega o painel mesmo assim, e qualquer refactor da feature vira refactor do núcleo. É a inversão de dependência clássica, e aqui ela também é uma regra de bundle.

**Certo × Errado.**

```ts
// ERRADO — em src/components/atomic/Cards/SarakActionCard.tsx
import { useDesignDraft } from '../../../features/DesignEngine/hooks/useDesignDraft';

// CERTO — o componente recebe o que precisa por prop/contexto público do core
import { useSarakDesign } from '../../../core/Provider/SarakUIProvider';
```

**Cobrada por:** `node gates/scripts/audit/auditor_arquitetura.mjs` (dentro de `run_audit.mjs`). Varre todo `src/` por AST, reporta arquivo e linha do import ofensor. Detalhe das camadas e as **duas limitações honestas do auditor** (`require()`/`import()` dinâmico passam; a checagem é por substring, não por resolução de módulo) em [[00-mapa-do-modulo]] §4.1 — declaradas no código, que é o que R18 exige.

---

## R2 — Zero hardcode

**Estado:** ✅ gate pleno.

**Enunciado.** Nenhum valor de cor (`#hex`) ou de unidade (`px`/`rem`/`em`) escrito solto em `.tsx` de `src/components/` ou `src/features/`; nenhum Tailwind **estrutural** (espaçamento, direção de flex, grid) em `.tsx` de `src/components/atomic/`. Tudo vem de token, via `var(--sarak-*, fallback)` ou via Hook Controlador.

**Por quê.** Um valor chumbado é um pedaço da tela que **não responde à troca de tema**. Ele não quebra nada — só fica parado enquanto o resto muda, que é o defeito mais caro de diagnosticar num Design System. A campanha de erradicação levou sete specs (22–29) para zerar a base; a regra existe para não pagar isso de novo.

**Certo × Errado.**

```tsx
// ERRADO — valor chumbado e Tailwind estrutural no átomo
<div className="p-4 gap-2 flex-col" style={{ borderRadius: '12px', color: '#0af' }} />

// CERTO — token com fallback + geometria vinda do Hook Controlador
const { getFlexStyles } = useStructuralStyles();
<div {...getFlexStyles({ direction: 'column', gap: 'spacing-sm' })}
     style={{ borderRadius: 'var(--sarak-card-radius, 12px)', color: 'var(--sarak-color-primary, #0af)' }} />
```

**Cobrada por:** `node gates/scripts/audit/auditor_hardcoded.mjs`.

### R2.1 Os dois detectores e seus escopos

O auditor são **dois** detectores com escopos deliberadamente diferentes (`auditor_hardcoded.mjs:11-16`):

| Detector | O que procura | Escopo |
| --- | --- | --- |
| **VALOR** | `#hex`, `Npx`/`Nrem`/`Nem` em **qualquer** string literal do arquivo | `src/components/` **e** `src/features/` |
| **ESTRUTURAL** | Tailwind de layout dentro de `className`/`cn()`/`clsx()`/`twMerge()`/`cva()` | **apenas** `src/components/atomic/` |

`features/` fica fora do detector estrutural de propósito: uma feature compõe layout legitimamente; um átomo, não.

### R2.2 Os baldes do detector estrutural — como o código realmente classifica

Cada classe encontrada cai num balde (`classifyToken`, `:66-77`):

| Balde | Classes | Efeito |
| --- | --- | --- |
| **DURO — reprova** | `spacing` (`p-`/`m-`/`gap-`/`space-`), `flex-direction` (`flex-col`/`flex-row`…), `grid` (`grid-cols-N`/`col-span-N`…) | Violação, listada com linha |
| **DEDUZIDO — não reprova** | `icon` (`w-N`/`h-N`), `dimension-full` (`w-full`/`h-full`/`max-w-screen`…), `alignment` (`items-*`/`justify-*`/`self-*`/`place-*`) | Localizado, contado e **subtraído** do bruto na reconciliação |

> ⚠️ **Não existe um balde "Tolerado" de hairlines ≤2px.** A documentação anterior descrevia três baldes; o código tem **dois**. Hairlines (`1px`, `2px`) passam por um mecanismo diferente: `sanitizeFallbacks()` (`:122-127`) remove o conteúdo de `var(--x, <valor>)` antes de testar, então **`var(--sarak-border-width, 1px)` é limpo e `border-[1px]` não é**. Medido: as 84 ocorrências de `1px`/`2px` em `.tsx` de `atomic/` estão **todas** na forma `var(--token, Npx)`. Registrado como divergência — a política real é "hairline também é token", que é mais estrita do que a documentação dizia.

O balde deduzido nunca fica invisível: a saída imprime a **reconciliação** (bruto → deduções → líquido), hoje `516 → 188 + 87 + 241 → 0 líquido`.

### R2.3 As exceções de política — permanentes

- **Cor de marca de terceiro.** As 4 cores oficiais do logo do Google em `SocialButton.tsx` estão na `VALUE_ALLOWLIST` (`:37-40`). Tokenizá-las implicaria falsamente que são customizáveis. Identidade de terceiro não é tema.
- **Grid sem token 1:1.** Quando a malha responsiva não tem equivalente no catálogo, o mecanismo correto é um **preset nomeado** no companion do hook (`RESPONSIVE_GRID_PRESETS`/`RESPONSIVE_SPACING_PRESETS` em `useStructuralStyles.presets.ts`) — **nunca** um carve-out permanente no auditor.
- **Componentes `internal/` desacoplados do Provider** (ex.: `CalendarPanel`) podem usar valor estrutural inline: não têm acesso à árvore de tema **por design**, não por omissão.
- **Fixtures de E2E e o `<input type="color">`** têm entrada própria na allowlist, cada uma com o motivo escrito (`:41-50`). O `value` de um input de cor nativo **só** aceita hex literal — `var()` quebra o elemento.

Hoje a allowlist de valor tem **5 entradas**, todas comentadas. Entrada sem motivo escrito é violação desta regra, não exceção a ela.

### R2.4 As limitações do detector — documentadas para NÃO serem exploradas

O código as declara nos próprios comentários (`:18-25`, `:161-173`) — é o padrão que R18 generaliza:

1. **Só arquivos `.tsx` são coletados.** Hook Controlador em `.ts` puro nunca é varrido — é isso que permite o preset nomeado existir. Ver [[00-mapa-do-modulo]] §5.1: é uma **faca de dois lados**.
2. **Classe em `const` interpolada por template literal escapa** do detector estrutural (um `Identifier` não tem literais filhos). O detector de VALOR **não** tem essa isenção — ele varre toda string do arquivo.
3. **`_` no lugar de espaço** em valor arbitrário de shadow escapa da regex.
4. **`sanitizeFallbacks()` não aceita fallback negativo.** `var(--x, -1px)` **não** é limpo e vira violação. A convenção é `calc(var(--x, 1px) * -1)`.

> **Mover código para `.ts`, para uma `const` ou trocar espaço por `_` a fim de escapar do gate é fraude, não arquitetura.** O critério é o propósito, não o resultado numérico.

---

## R3 — Zero `any`

**Estado:** ✅ gate pleno.

**Enunciado.** Proibido `any`, `@ts-ignore` e `as any` em `src/`. Nas fronteiras dinâmicas reais, a ordem de preferência é: **tipo/interface próprio** → **genérico restrito** (só para utilitário comprovadamente paramétrico) → **`unknown` + type guard**.

**Por quê.** O payload de design é um **domínio fechado**: a interface é que dita o que existe. Um `any` no caminho do `design` desliga exatamente a checagem que impede um token inventado de atravessar a árvore em silêncio. A campanha de erradicação saiu de 484 ocorrências para zero; o auditor existe para o número não voltar a subir.

**Certo × Errado.**

```ts
// ERRADO
const apply = (config: any) => inject(config);
// @ts-ignore
element.style.setProperty(name, value);

// CERTO — fronteira dinâmica real: unknown + narrowing
const payload: unknown = JSON.parse(raw);
if (isThemePayload(payload)) apply(payload);

// CERTO — valor conhecido: união própria, não unknown
type ToastKind = 'success' | 'warning' | 'error';
```

`@ts-expect-error` é permitido **só** com contrato externo inevitável e comentário explicando qual é.

**Cobrada por:** `node gates/scripts/audit/auditor_typescript.mjs` — falha em qualquer nó `AnyKeyword` na AST de `src/` (exceto `__tests__/` e `Mocks/`). Hoje: **0 ocorrências**.

> **R3 e R30 checam coisas diferentes.** Um procura o **token** `any` na AST; o outro **compila**. Um estar verde não implica o outro — e o outro **não** está verde (14 erros, ver R30).

---

## R4 — Paridade: token nasce nas três fontes ou não existe

**Estado:** ⚠️ **escopo menor que a regra** — o **tipo gerado não é uma das três fontes**, e é nesse vão que mora a deriva de 105 tokens.

**Enunciado.** Uma chave de design só é **real** se existir simultaneamente no **Schema** (`src/core/Design/schema/*.ts` → `MASTER_DESIGN_MAP`), no **roteamento de persistência** (`catalog/theme_table_mapping.json`) e no **catálogo** (`catalog/partitions/*.json`). Fora disso, ela é inexistente.

**Por quê.** Chave órfã é o defeito mais silencioso do módulo: existe no tipo, não existe no motor; o autor do tema preenche, e nada acontece. Sem a checagem cruzada não há como distinguir "token novo" de "erro de digitação".

**Certo × Errado.** Adicionar um token é sempre **as três** edições, na mesma entrega — nunca "o schema primeiro, o resto depois".

**Cobrada por:** `auditor_paridade.mjs` → `npx tsx gates/scripts/audit/verify_parity.ts`. Hoje: **409 / 409 / 409**. O dicionário, as duas alavancas (Valor × Estrutural) e a divergência apurada 409 × 416 estão em [[04-contrato-de-tokens-e-paridade]].

> ⚠️ **O vão declarado.** `src/core/Provider/generated/design-token-ids.ts` é **derivado** do `MASTER_DESIGN_MAP` e **não é uma das três fontes que o gate cruza** — então ele pode apodrecer com o gate verde, e apodreceu: **304 propriedades publicadas × 409 tokens reais**. O número falso **vaza para o consumidor** via `sarak-ui/catalog.json` (`designTokens.count = 304`). Fechar esse vão é alvo de **R29** (artefato gerado bate com a fonte), não de um quarto braço da paridade. Achado 22 em [[15-divida-conhecida]].

> A antiga **"6ª camada = Registry do motor de manifesto" MORREU** com o motor ([[002-remocao-motor-manifesto]]). Se você encontrar uma skill ou documento exigindo paridade com um Registry, é ponteiro morto — a paridade verificada hoje é de **três** fontes.

---

## R5 — Zero chave órfã em tema ou preset

**Estado:** ✅ gate pleno para chave órfã. **Um segundo gate existe e nada o invoca** — ver abaixo.

**Enunciado.** Todo tema e todo preset shippado só contém chaves que existem no gabarito vivo (`getScaffold()`).

**Por quê.** Um tema com chave que o motor não conhece é um tema que **parece** completo e não é: o eixo some sem aviso. Como os temas de referência são o ponto de partida do consumidor, o defeito se propaga para fora da lib.

**Cobrada por:** `auditor_presets.mjs` → `npx tsx gates/scripts/audit/verify_presets.ts`. Hoje: **120 itens auditados** (18 temas + 102 presets de componente), zero órfã.

> ⏳ **O segundo gate que existe e não roda.** `gates/scripts/audit/verify_theme_parity.ts` valida **um** tema contra o dicionário — isto é, mede **completude por tema**, não só ausência de órfã — e **nenhum script o invoca**. Cobertura diferente, não equivalente: o `auditor_presets` não pega tema escrito pelo consumidor nem mede completude. Ligá-lo é trabalho da `plan-12`.

---

## R6 — Contrato de valor: fora do contrato é descartado, nunca injetado

**Estado:** ✅ gate pleno — runtime **e** suíte.

**Enunciado.** Todo valor que entra no motor passa por `validateDesign`. Chave fora do domínio fechado, ou valor fora do tipo/enum/faixa do token, é **descartado com `console.warn`** — nunca injetado no DOM.

**Por quê.** É o que torna `localStorage` e um JSON de tema escrito à mão seguros **por construção**. O motor lê dado de origem não confiável; sem a fronteira, uma string com `;` vira injeção de CSS.

**Certo × Errado.**

```ts
// O contrato aceita, clampa, ou descarta — nunca "quase aceita"
{ cardRadius: 12 }                   // ✅ number dentro da faixa
{ cardRadius: 9999 }                 // ✅ aceito com clamp para o máximo do token
{ cardRadius: '12px; position:fixed' } // ❌ descartado (breakout `[<>{};]`) + warn
{ tokenQueNaoExiste: 4 }             // ❌ descartado (domínio fechado) + warn
```

**Cobrada por:** `validateDesign` (`src/core/Provider/utils/validation.ts`) em **runtime**, e o gate de suíte `src/core/Provider/utils/__tests__/tokenContractParity.test.ts` (Anel 3 do `pre-push`). `auditTokenContract` é a versão **pura** da mesma checagem — auditoria e runtime compartilham `coerceTokenValue`, por isso não podem divergir. Detalhe em [[04-contrato-de-tokens-e-paridade]].

---

## R7 — Namespace e fallback obrigatórios

**Estado:** ⚠️ **escopo menor que a regra — e a regra está sendo violada hoje, com o gate verde.**

**Enunciado.** Toda CSS Variable consumida é `--sarak-*` ou `--theme-*`, **sempre com fallback**, e precisa de uma **fonte emissora real**. O namespace `--sx-*` é **PROIBIDO**.

**Por quê.** Variável sem emissor resolve para vazio: o espaçamento colapsa, a cor some, e o console fica limpo. É a falha mais barata de introduzir e a mais cara de achar. O fallback é a rede: mesmo que o token não seja emitido, a peça tem forma.

**Certo × Errado.**

```tsx
// ERRADO — namespace proibido, e sem fallback
style={{ color: 'var(--sx-color-primary-base)' }}
style={{ gap: 'var(--sarak-layout-gap-md)' }}

// CERTO
style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}
```

**Cobrada por:** `node gates/scripts/audit/auditor_ghostvars.mjs` — constrói o registro real de variáveis emitidas (schemas + `src/styles/*.css`, expandido por 18 sufixos gerados) e cruza com todo `var(--x)` consumido. Hoje: **14.179 variáveis no registro, 3 consumos fantasma** (o baseline).

> ⚠️ **O vão declarado, e a violação viva dentro dele.** O auditor varre apenas `src/components/` e `src/features/` (`auditor_ghostvars.mjs:14`); `src/styles/` é tratado como fonte **emissora**, nunca como consumidora, e `src/core/` está inteiramente fora. Por isso os **2 usos vivos de `--sx-*`** em `src/styles/_utilities.css:80` e `:89` (`var(--sarak-range-active-bg, var(--sx-color-primary-base))`) **não acendem luz vermelha nenhuma**: o gate está verde e a regra está sendo violada. Achado 1 em [[15-divida-conhecida]].
>
> **Ampliar o escopo sem ampliar o registro produz acusação falsa** — `--theme-on-primary` é emitida em runtime por `useDesignVariables.ts:183` e não está no registro. Detalhe em [[01-gates-e-baseline]] §4.3.c. É literalmente o caso que R18 existe para não deixar acontecer duas vezes.

### R7.1 Ordem de correção: raiz primeiro

Ao corrigir um consumo fantasma **compartilhado**, corrija a fonte comum (o Hook Controlador) **antes** dos consumidores individuais. Na ordem inversa, cada consumidor é migrado duas vezes.

---

## R8 — Cobertura 1:1

**Estado:** ⚠️ **escopo menor que a regra** — o gate não vê `src/shared/`. O segundo braço (cobertura em %) está ⏳.

**Enunciado.** Todo componente e todo hook tem um teste **ao lado**, em `__tests__/<nome>.test.tsx` (ou `.test.ts`).

**Por quê.** Cobertura por porcentagem esconde o arquivo que ninguém testou; cobertura 1:1 não. E como o teste mora ao lado, mover o componente move o teste — não existe teste órfão apontando para um caminho morto.

**Certo × Errado.**

```
CERTO                                    ERRADO
Cards/SarakActionCard.tsx                Cards/SarakActionCard.tsx
Cards/__tests__/SarakActionCard.test.tsx test/cards.test.tsx   ← agregado, não 1:1
```

**Cobrada por:** `node gates/scripts/audit/auditor_coverage.mjs`, sobre `src/components/`, `src/features/` e `src/core/`. Duas particularidades do escopo, para não haver surpresa: arquivos `index*` são ignorados, e **arquivos `.ts` só entram na cobrança se o nome começar com `use`** (isto é, utilitário `.ts` que não é hook não é cobrado). Hoje: **zero órfão**.

> ⚠️ **O vão declarado.** `src/shared/` está **fora** do escopo (`auditor_coverage.mjs:52-60` varre só `components`, `features`, `core`). Medido: **4 arquivos, 0 testes** — `useSarakRouter.ts` e `useModuleDiscovery.ts` são **violação de R8 na letra**; `services/api.ts` e `types/index.ts` não são cobrados nem pela regra (um é `.ts` que não começa com `use`, o outro é `index*`). Achado 13 em [[15-divida-conhecida]].

### R8.1 O segundo braço — cobertura em %, com piso móvel

**Decisão do dono, 2026-08-02.** `@vitest/coverage-v8` está em `package.json:100` e **nenhum script o invoca**. Ele vira gate pelo mesmo mecanismo do `audit:baseline`: **mede agora, grava como piso, e o piso só sobe.** Cobertura que cai reprova; cobertura que sobe regrava o piso.

**Por que piso móvel e não alvo fixo.** Um teto arbitrário (80%) reprova no primeiro dia e ensina a ignorar o vermelho — que é o defeito que este repositório mais combate (§4.1 e [[01-gates-e-baseline]] §6). O 1:1 continua sendo a regra principal; o % é a segunda rede, e mede **outra coisa**: o quanto de **dentro** de cada arquivo o teste alcança.

**Estado:** ⏳ — construir é trabalho da `plan-12`. Achado 15 em [[15-divida-conhecida]] §4.1.

---

## R9 — Clean Code com limiares objetivos

**Estado:** ✅ gate pleno.

**Enunciado.** ≤ **250 linhas** por arquivo; **zero `else if`**; ≤ **3** `useState`/`useEffect`/`useReducer` por função; aninhamento de `if` ≤ **2** níveis.

**Por quê.** São limiares, não gosto: acima deles o arquivo deixa de caber na cabeça de quem revisa. O teto de 250 linhas é o que força a extração do **companion** ([[00-mapa-do-modulo]] §5.2) — `useStructuralStyles.ts` está hoje em 249 linhas, e isso não é coincidência.

**Certo × Errado.**

```ts
// ERRADO
if (a) { ... } else if (b) { ... }

// CERTO — early return
if (a) return x;
if (b) return y;
```

**Cobrada por:** `node gates/scripts/audit/auditor_cleancode.mjs`. **Isenção declarada no código** (`:37`): arquivos sob `/presets/themes/`, `/Design/schema/` e `/Design/master-map` não pagam o teto de linhas — são dicionários de dados, não lógica. Hoje: **zero violação**.

---

## R10 — Composição atômica obrigatória

**Estado:** ⚠️ **escopo menor que a regra** — a metade "HTML nativo cru" tem gate pleno; a metade `switch`/`case`
de design no JSX continua sem detector.

**Enunciado.** Proibido `<button>`, `<input>` ou `<select>` cru **no que o consumidor embute no produto dele** —
use `SarakButton`, `SarakInput`, `SarakSelect`. E proibido `switch`/`case` de design ou `<style>` de roteamento
dentro do JSX: essa decisão mora no Hook Controlador.

**A fronteira, explícita** *(decisão do dono, 2026-08-05)* — porque "template ou componente pré-montado" não é
verificável e foi o que impediu o gate de nascer:

| Onde | Vale? | Por quê |
| --- | --- | --- |
| `src/components/**` | ✅ **SIM** | é o que o consumidor importa e embute |
| `src/core/**` | ✅ **SIM** | o cromo do Shell chega à tela do consumidor |
| `src/components/atomic/Buttons/` · `atomic/Inputs/` | ❌ **NÃO** | são a **implementação** do átomo: o elemento nativo ali é o alvo da regra, não a violação |
| `src/features/**` | ❌ **NÃO** | é **ferramenta de autoria da própria lib** — mesmo critério que sustenta a allowlist do `zero-brand:check` ([[006-zero-marca-soberania-host]]): esses painéis podem usar HTML cru porque não são produto de consumidor |
| `__tests__/` · `__e2e__/` · `Mocks/` | ❌ **NÃO** | não são superfície |

**Por quê.** HTML nativo cru causa **vazamento de especificidade** — o elemento fica preso na variável global do
preflight e ignora a paridade atômica, deixando de responder ao token que deveria governá-lo.

> ⚠️ **A versão anterior citava o painel do Design Engine como quem já obedece por *dogfooding*, e isso era
> FALSO.** Medido em 2026-08-05 (`plan-12`, Lote C): **111 ocorrências** de HTML nativo cru fora dos átomos, e
> **64 delas dentro do próprio painel** — o exemplo que a regra dava como conforme era o maior infrator da base.
> Uma regra que dá exemplo em vez de fronteira é como se chega a 64 exceções sem ninguém perceber; é por isso
> que a tabela acima existe e o *dogfooding* saiu.
>
> **Com a fronteira fixada, a exposição real da regra é 47** (`components/` 23 + `Layout/` 6 + `core/Shell/` 15
> + `engines/` 2 + `Discovery/` 1), e é isso que a `plan-15` herda.

**Certo × Errado.**

```tsx
// ERRADO — dentro de um Template
<button className="rounded-sarak bg-[var(--sarak-color-primary)]">Salvar</button>

// CERTO
<SarakButton variant="primary">Salvar</SarakButton>
```

**Cobrada por:** `node gates/scripts/audit/auditor_composicaoatomica.mjs` (construído pela `plan-16`,
2026-08-05) — detecção **por AST** (`ts.createSourceFile` + `ts.forEachChild`), não por regex de linha. Acusa
`JsxOpeningElement`/`JsxSelfClosingElement` cujo `tagName` é o identificador minúsculo `button`/`input`/`select`,
na fronteira exata da tabela acima. Roda no **Anel 2** (via `run_audit.mjs`, junto do `auditor_hardcoded`) — ele
**nasce vermelho**, não pode ir para o Anel 1. Hoje: **47 ocorrências**, registradas no baseline
(`components/atomic` 23 · `core/Shell` 15 · `Layout/` 6 · `engines/` 2 · `Discovery/` 1) — dívida da `plan-15`,
ainda não paga.

> ⚠️ **A metade `switch`/`case` de design no JSX continua sem detector**, declarada no bloco `LIMITES
> DECLARADOS` do próprio gate. E o cuidado que custou uma rodada de veredito: uma regex do tipo
> `<(button|input|select)[ >/]` **perde 55 das 111 ocorrências** medidas sem fronteira, porque o JSX mais comum
> escreve o nome da tag no fim da linha (`<button\n  className=…`) e `grep` é por linha — é por isso que o
> detector tem de ser por AST.

> **R10 SAIU da conduta em 2026-08-02** *(decisão do dono)*. Ela vivia entre as regras sem gate por herança, não por análise: um detector de `<button>`/`<input>`/`<select>` cru em `.tsx` é **determinístico e barato** — é exatamente a mesma classe de varredura por AST que o `auditor_hardcoded` e o `check-zero-brand` já fazem. Conduta é para o que um script **não consegue** decidir; isto ele consegue. A metade `switch` de design é mais difícil e pode nascer fora do escopo do gate — se nascer, o vão vai declarado, como manda R18. Construir é trabalho da `plan-12`.

---

## R12 — Zero-marca: a lib nunca estampa a própria marca

**Estado:** ✅ gate pleno.

**Enunciado.** Nenhum componente que o consumidor embute no produto dele renderiza `Sarak Lib`, `Sarak OS` ou `Sarak AI` como texto. O fallback é a marca do consumidor quando existir; senão, um rótulo **genérico de função**.

**Por quê.** Aconteceu de verdade e duas vezes: a lib carimbava a própria marca dentro do produto de quem a importou. Pior, o primeiro conserto **trocou a string sem fechar o vazamento** — com `systemName` passando a nascer ausente, o `SarakEmptyState` deixou de exibir `'Sarak OS'` e passou a exibir `'Sarak Lib'`. Foram encontrados **5 sinks**, sendo 2 além do levantamento inicial: a **fonte** do `brand.name` no `SarakShell` e o widget de usuário. A lib é infraestrutura invisível, não uma marca estampada.

**Certo × Errado.**

```tsx
// ERRADO
<h3>{systemName || 'Sarak Lib'}</h3>
<span>Sarak Lib Search Engine</span>

// CERTO
<h3>{systemName || 'Sistema'}</h3>
<span>Search Engine</span>
```

**Cobrada por:** `npm run zero-brand:check` (`gates/scripts/contrato/check-zero-brand.mjs`). Varre `src/` por AST — só `StringLiteral`, `JsxText` e partes fixas de template literal contam, para **não** acusar comentário que documenta a correção. Hoje: **361 arquivos, 0 violações**. A allowlist tem 3 painéis **internos** do Design Engine (`KitchenSinkPreview`, `LanguageTab`, `LayoutTab`) — ferramenta de autoria da própria lib, nunca embutida pelo consumidor — e o gate também derruba **entrada de allowlist obsoleta**.

---

## R13 — A identidade do host é do importador

**Estado:** ✅ gate pleno, via suíte.

**Enunciado.** `document.title`, favicon e qualquer rótulo de marca pertencem **sempre** ao importador. A lib só os altera por **opt-in explícito**; defaults de identidade nascem **ausentes**.

**Por quê.** O default `tabName: 'Sarak OS'` era sempre *truthy*, então a lib **sempre** sobrescrevia o `<title>` do host: a aba do navegador do consumidor mostrava a marca da lib, e "piscava" para ela depois do load. Havia ainda **dois** efeitos independentes escrevendo `document.title`, que podiam brigar entre si.

**Certo × Errado.**

```ts
// ERRADO — default truthy sobrescreve o host
const DEFAULT_BRANDING = { tabName: 'Sarak OS' };
if (branding?.tabName) document.title = branding.tabName;  // sempre entra

// CERTO — nasce ausente; sem valor do consumidor, o título do host sobrevive
const DEFAULT_BRANDING = { loginName: 'Acesso ao Sistema' };
```

R12 e R13 são complementares: **R13 cobre a identidade da PÁGINA, R12 cobre os SINKS dentro dos componentes.** Fechar uma sem a outra não fecha o vazamento — foi exatamente o que aconteceu.

**Cobrada por:** dois gates de suíte, nomeados — `src/core/Provider/__tests__/HostIdentity.test.tsx` (planta título e favicon de host e afirma que sobrevivem à montagem do Provider) e `src/core/Provider/__tests__/EmbeddedMode.test.tsx`. Rodam em `npx vitest run`, que **bloqueia** no Anel 3 do `pre-push` — não é "só teste". O contrato para o consumidor está em `docs/identidade-do-host.md`, shippado no pacote. Ver [[006-zero-marca-soberania-host]].

---

## R14 — Barril completo

**Estado:** ⚠️ **escopo menor que a regra** — categoria sem barril só tem a raiz varrida.

**Enunciado.** Todo componente consumidor-facing está exportado em `src/index.ts`, **junto com o seu tipo `<Nome>Props`**. Exclusão só com **motivo escrito** em `gates/allowlists/barrelExclusions.mjs`.

**Por quê.** Componente exportado sem o tipo das props deixa o consumidor sem como tipar o próprio wrapper — ele acaba recorrendo a deep import, que **é proibido por contrato** (R27, [[03-superficie-publica]] §2) e quebra na versão seguinte. E allowlist sem motivo vira depósito: por isso o gate também derruba **exclusão obsoleta** (nome já exportado, ou componente que não existe mais).

**Certo × Errado.**

```ts
// ERRADO — só o valor
export { SarakGrid } from './components/atomic/Layouts/SarakGrid';

// CERTO — valor + tipo
export { SarakGrid } from './components/atomic/Layouts/SarakGrid';
export type { SarakGridProps } from './components/atomic/Layouts/SarakGrid';
```

**Cobrada por:** `npm run barrel:check`. Hoje: **80 componentes, 0 faltas** *(era 81 até a `plan-09` remover o `SarakTabs` duplicado)*; a allowlist tem **1 entrada** (`SarakAppChromeMobile`, com motivo).

> ✅ **O vão de `engines/` foi FECHADO em P26** (decisão D2, 2026-07-29). O gate varria `components/atomic/**` e `components/Layout/**` e **não via `components/engines/**`** — resultado: 3 das 4 categorias de engine viviam fora do barril e o gate ficava verde. Hoje `collectPublicComponentNames()` varre `engines/` como raiz por categoria; `SarakChatEngine` e `SarakFlowEngine` foram expostos atrás de fronteira lazy, `SarakVisualEngine` foi removido por não ter consumidor real, e a contagem foi de 78 para 81. Ver [[03-superficie-publica]] §9.
>
> ⚠️ **O vão que CONTINUA de pé, declarado.** Categoria **sem barril de categoria** só tem os `.tsx` de **raiz** varridos (`scripts/publicComponents.mjs:167-172`) — componente colocado em subpasta escapa do gate e do catálogo. Isso é deliberado em alguns casos (as peças internas do cromo vivem em `Layout/chrome/` justamente por isso), mas um componente público esquecido numa subpasta passa em silêncio.

---

## R17 — Não transcrever fonte viva

**Estado:** ⚠️ **escopo menor que a regra** — cobre o artefato **gerado**; a prosa escrita à mão não tem gate.

**Enunciado.** Lista de tokens, de componentes, de props ou de nomes de ícone **jamais** é copiada para dentro de markdown. Aponte para a fonte gerada.

**Por quê.** Cópia estática é mentira com data marcada: a próxima mudança de código já a torna falsa, e ninguém percebe porque markdown não quebra build. As fontes vivas são `docs/component-catalog.json`, `sarak-ui/catalog.json`, `getAllDesignTokens()`, `getScaffold()`.

**Certo × Errado.**

```
ERRADO   "Os componentes disponíveis são: SarakButton, SarakInput, SarakCard, …"
CERTO    "A lista completa está em `docs/component-catalog.json`, gerada por AST."
```

**Cobrada por:** `npm run catalog:check`, `npm run guide:check` e `npm run dev-kit:check` — **para os três artefatos gerados**. Os três comparam o commitado com o que o gerador produz agora e derrubam o build (ou o `gates:full`) se divergirem.

> ⚠️ **O vão declarado: a metade "prosa manual" não tem gate.** Markdown escrito à mão — `README.md`, as specs, os comentários que viajam para o consumidor — não é comparado com nada. Os achados **24** (o `main.tsx` que todo consumidor novo recebe cita um serviço obsoleto) e **25** (comentário afirmando que uma pasta inexistente "segue publicada") são exatamente essa metade, e estão abertos em [[15-divida-conhecida]] §3.5. A parte **verificável** dessa metade — ponteiro morto na prosa dos artefatos gerados — é **R23**, e ela também tem escopo menor que a regra.

---

## R18 — Todo gate declara o que NÃO vê

**Estado:** ✅ **gate pleno.**

**Enunciado.** Todo gate declara, **no próprio código**, qual é o seu escopo e o que ele **não** vê. Ampliar o escopo de um gate sem ampliar o registro do que ele consome é regressão, e um cabeçalho que descreve escopo que o código não tem é defeito, não imprecisão.

**Por quê.** Esta é a regra que nasce do padrão mais caro do repositório: **o escopo do gate é menor que o escopo da regra**, e ninguém desconfia porque o gate está verde. Três casos independentes, todos medidos:

- **R14** — o `barrel:check` não via `components/engines/`; 3 componentes públicos ficaram fora do barril **com o gate verde**, e o vão só apareceu por acaso (fechado em P26).
- **R7** — o `auditor_ghostvars` não vê `src/styles/`; o namespace **proibido** `--sx-*` está vivo lá desde então, gate verde (aberto).
- **O registro do próprio `auditor_ghostvars`** — o cabeçalho dele (`:5-10`) afirma ler `useDesignVariables.ts`, e o código (`:37-61`) **não lê**. Consequência: quem ampliar o escopo confiando no cabeçalho vai produzir **acusação falsa** numa variável que existe ([[01-gates-e-baseline]] §4.3.c).

O antigo achado 30 provou que atenção humana não pega essa classe: ela reapareceu pela mão que a acabara de catalogar. **Escrever o limite é o que o transforma de descoberta em conferência.**

**Certo × Errado.**

```js
// CERTO — o limite mora no código do gate, junto do código que o cria.
//   scripts/publicComponents.mjs:167-172
//   "categoria SEM barril de categoria só tem a RAIZ varrida — componente em
//    subpasta escapa deste gate e do catálogo. Deliberado para Layout/chrome/."

// ERRADO — cabeçalho que promete um escopo que o código não tem.
//   auditor_ghostvars.mjs:5-10 diz que o registro vem de `useDesignVariables.ts`;
//   :37-61 abre apenas schema/*.ts e styles/*.css.
```

**Cobrada por:** `node gates/scripts/contrato/check-gate-limits.mjs` (construído pela `plan-12`, 2026-08-05). Varre `gates/scripts/**` (exceto `__tests__/`/`allowlists`) atrás do marcador `LIMITES DECLARADOS` (ou a convenção antiga já existente, "ponto cego conhecido"). Hoje: **26/26** scripts declaram o que não veem — os 17 pré-existentes ganharam o bloco que faltava, e os 9 gates novos das plans 12/16 já nasceram com ele. `npm run gate-limits:check`.

---

## R19 — O tarball leva só o publicável

**Estado:** ✅ gate pleno.

**Enunciado.** O tarball publicado leva **só** o que o consumidor usa: **`src/` e configuração de teste nunca**, e **tudo** que o `init`, o `check` e o `refresh` precisam ler do pacote instalado.

**Por quê.** As duas metades têm dano registrado. Vazar para dentro: o achado 4 do Selo era **código-fonte no tarball**, e o `Template-Ts/` era um subprojeto de terceiro que atravessou 330 commits invisível ([[01-gates-e-baseline]] §3.2). Faltar: o importador chama `bin/scaffold/checkUpdate.mjs` **por caminho direto** no `predev` dele — se o arquivo não estiver no pacote, o `npm run dev` do consumidor quebra numa publicação que passou em todos os outros gates.

**Certo × Errado.**

```
ERRADO   o tarball traz src/core/Design/schema/cards.ts    (código-fonte)
ERRADO   o tarball NÃO traz bin/scaffold/checkUpdate.mjs   (o predev do consumidor quebra)
CERTO    dist/ + bin/ (sem __tests__) + docs/ + sarak-ui/
```

**Cobrada por:** `npm run package:check` → `gates/scripts/contrato/check-package-contents.mjs`. Roda `npm pack --dry-run --json` sobre o pacote **já buildado** (`:85`) e cruza a lista de arquivos contra três listas declaradas no próprio script:

- **6 prefixos proibidos** (`:9-24`): `src/`, `specs/`, `playwright/`, `__snapshots__/`, `Template-Ts/` e `sarak-dev/`.
- **4 sufixos/nomes proibidos** (`:26-31`): `vitest.config.ts`, `.test.mjs`, `.test.ts`, `.test.tsx`.
- **31 caminhos obrigatórios** (`:33-75`), cada um com o motivo escrito ao lado.

`Template-Ts/` continua na lista **de propósito** depois de o diretório ter sido removido (`:14-18`): é a trava mais barata contra um carona reaparecer. `src/` é proibido **sem exceção** desde que o export `./sarak-base.css` passou a resolver para `dist/styles/`.

> **Por que ele não roda no `build`:** exige `dist/` buildado. Mora no `prepublishOnly` e no `gates:full`, não na cadeia do `build` ([[01-gates-e-baseline]] §2.2).

---

## R20 — O baseline de auditoria não regride

**Estado:** ✅ gate pleno.

**Enunciado.** A auditoria estrutural pode continuar vermelha, mas **não pode piorar**. Cada métrica de cada auditor é comparada contra `gates/baselines/audit-baseline.json`, versionado; pior que o baseline bloqueia o commit.

**Por quê.** `run_audit.mjs` tem baseline **não-zero** e não vai estar em zero tão cedo. Um gate binário sobre ele bloquearia todo commit — e gate vermelho no dia da instalação ensina todo mundo a usar `--no-verify`, o que desliga todos os outros. Ignorá-lo deixaria a dívida crescer em silêncio. O baseline versionado é a terceira saída: **a dívida fica, o crescimento não.**

**Certo × Errado.**

```
CERTO    consertou a dívida → `npm run audit:baseline -- --write` → commita o JSON
         JUNTO do conserto, e o diff mostra os dois

ERRADO   baseline que se auto-ajusta a cada execução — apagaria a evidência de uma
         regressão travestida de melhora
```

**Cobrada por:** `npm run audit:baseline` → `gates/scripts/release/check-audit-baseline.mjs`, **Anel 2** do `.githooks/pre-commit:78-93`. Três decisões que o script toma, e que a regra herda:

1. **Pior bloqueia · igual passa · melhor passa e AVISA** para regravar o baseline (`:133-147`, `:183-199`). O baseline **nunca** se atualiza sozinho.
2. **A lista de auditores é LIDA de `run_audit.mjs`** (`:36-41`) em vez de copiada — auditor novo lá é auditor novo aqui, sem ninguém lembrar de sincronizar. Auditor sem parser conhecido cai num parser genérico que só olha o código de saída: degrada, não ignora.
3. **Métrica ilegível é bloqueio, não silêncio** (`:140`). Saída que mudou de formato vira `null` e o commit é barrado com "não consegui ler a saída do auditor". **Fail-closed** — parser quebrado nunca vira aprovação automática.

O baseline de hoje (`medidoEm: 2026-07-28`): `auditor_hardcoded.valor = 1`, `auditor_ghostvars.consumos = 3`, `tsc.erros = 14`, e zero em todo o resto.

---

## R21 — Mudou o artefato publicado, exige tag nova

**Estado:** ✅ gate pleno.

**Enunciado.** Se `dist/` ou `sarak-ui/` mudaram desde a última tag `v*`, o push para `main` **exige uma tag nova**.

**Por quê.** O consumidor resolve a versão por **tag** (`#semver:^1.x`), não por commit. Sem tag nova ele fica no artefato antigo **em silêncio** — é o incidente que o [[007-distribuicao-por-git]] registra, e a razão de existirem **zero tags em 331 commits** nunca foi falta de conhecimento: foi falta de gatilho.

**Certo × Errado.**

```
CERTO    commit que só mexe em specs/ → artefato idêntico → nenhuma tag devida
CERTO    mudou dist/ + sarak-ui/ → `npm version <major|minor|patch>` (cria tag e empurra)
ERRADO   empurrar artefato novo sem tag — o importador não tem a que se agarrar
```

**Cobrada por:** `npm run release:check` → `gates/scripts/release/check-release-tag.mjs`, no anel de push do `.githooks/pre-push`. Bloqueia quando **as três** forem verdade (`:118-145`):

1. o push é para `refs/heads/main` (`:28`, `:46-55`) — push de branch de trabalho não paga;
2. a assinatura do artefato mudou desde a última tag `v*` (`:68-78`, `:138-143`). "Artefato publicado" é `SIGNED_DIRS` (`dist/` + `sarak-ui/`), **reusado** de `bin/scaffold/checkUpdate/localDependency.mjs` — duas noções concorrentes de "artefato" seriam a porta para o gate dizer uma coisa e o aviso do consumidor dizer outra;
3. o commit empurrado **não** carrega tag (`:132-136`).

**Repositório sem tag nenhuma não é bloqueado** (`:126-130`): cobrar uma tag onde nunca houve nenhuma é punir um estado que o ritual ainda não alcançou.

> **O nível do bump é SUGERIDO, nunca decidido** (`:84-94`, e o próprio texto do bloqueio diz isso em `:112-113`). A sugestão sai das mensagens de commit, e elas mentem: os 8 commits mais recentes deste repositório são todos `feat:` — inclusive remoções e correções. O critério real está em [[00-contexto]] §3.1 e no [[008-releases-com-tag-e-semver-em-git]]: compare os identificadores exportados de `dist/index.d.ts`. **Tag errada é pior que tag ausente**, porque o consumidor confia na faixa.

---

## R22 — Zero segredo no que vai para o commit

**Estado:** ✅ gate pleno.

**Enunciado.** Nenhum segredo e nenhum arquivo sensível entra no **staged**. Segredo mora em `.env`, e `.env` mora no `.gitignore`.

**Por quê.** É a única regra deste documento cujo dano é **irreversível pelo repositório**: uma chave que entra num commit está vazada mesmo depois de removida, e a remediação deixa de ser um `git revert` e passa a ser reescrita de histórico **mais rotação da credencial**. Por isso é o **Anel 0** — a primeira coisa que roda, em **todo** commit, sem escopo por arquivo e sem baseline.

**Certo × Errado.**

```
ERRADO   const API_KEY = '…';   // a chave da Stripe escrita inteira, literal, num .ts versionado
ERRADO   git add .env
CERTO    process.env.API_KEY   +   .env no .gitignore   +   .env.example versionado
```

> 🔁 **Esta regra bloqueou esta própria spec — duas vezes — e o exemplo acima é a segunda correção.** Ao
> commitar a `plan-13`, o Anel 0 barrou o `00-regras-e-invariantes.md` acusando **`Stripe Secret`**
> (`sk_l...Wx`): o exemplo do "ERRADO" tinha sido escrito com **forma de chave válida** (`sk_live_` mais 20
> alfanuméricos) e casou com o padrão do `config.json`. Reescrito sem a forma de chave, ele bateu no
> **segundo** padrão — **`Segredo atribuido`**, que casa a atribuição de qualquer string de 8 ou mais
> caracteres a um identificador da família `api_key`/`secret`/`token`/`password`/`senha`/`access_key`,
> independentemente de o conteúdo parecer uma chave.
>
> **As duas capturas estão certas, e as duas ensinam a mesma coisa:** documentação **não escreve literal com
> forma de credencial**, nem como exemplo — o comentário em prosa carrega a ilustração sem deixar um
> falso-positivo permanente em todo scan futuro deste repositório. Relaxar a allowlist para "passar" seria a
> fraude que a [[01-gates-e-baseline]] §6.1 proíbe. E o episódio é a melhor prova do desenho do gate: ele é
> **em camadas** — o segundo padrão pegou o que o primeiro deixou passar.

**Cobrada por:** `.githooks/pre-commit:17-27` → `python gates/scripts/segredo/verificar_commit.py --raiz .`. Varre **apenas o staged**, mascara o trecho encontrado antes de imprimir e sai com **1**, o que faz o hook bloquear. As listas vivem em `.githooks/config.json`, não no script (zero hardcoded): **12 padrões de segredo**, **15 globs de arquivo sensível** e **4 exceções** (`.env.example`, `.sample`, `.template`, `.dist`). O catálogo é derivado do canônico da skill `cyber-segredos`, e o `_fonte` do JSON manda mantê-los em sincronia.

> **Escopo declarado (R18):** este gate vê **só o commit atual**. O histórico **não** é escopo dele — é da skill `git-especialista-repositorio` / `/git1-auditar`. Um segredo que já está num commit anterior passa aqui em silêncio, e isso é por construção.

---

## R23 — Zero ponteiro morto na documentação gerada

**Estado:** ⚠️ **escopo menor que a regra.**

**Enunciado.** Documentação **gerada** não cita o que não existe: caminho de arquivo, `npm run <script>` e comando `node <caminho>` escritos em crase têm de resolver.

**Por quê.** Dano registrado e caro: as skills do mantenedor passaram **meses** mandando registrar componente novo em `src/core/Manifest/Registry/nativeComponents.ts` e rodar `RegistryParity.test.tsx` — **dois arquivos removidos** — e nada acendia, porque documentação não quebra build. Regenerar números resolve metade (o guia para de mentir sobre *quantos*); esta regra é a outra metade: o guia não pode citar **o que** não existe.

**Certo × Errado.**

```
CERTO    "rode `npm run barrel:check`"        → o script existe no package.json
ERRADO   "rode `npm run registry:parity`"     → script inexistente, e nada acusa
ERRADO   "edite `src/core/Manifest/Registry/nativeComponents.ts`" → arquivo removido
```

**Cobrada por:** `npm run dev-kit:check` → `scripts/dev-kit/deadPointers.mjs`. Ele valida **três** formas de ponteiro, e só o que dá para validar sem heurística:

| Forma | Como é reconhecida | Contra o quê |
| --- | --- | --- |
| caminho | crase começando por uma das **9 raízes reais** (`:26-36`) | `fs.existsSync` (`:90`) |
| gate | `npm run <script>` (`:39`) | as chaves de `scripts` do `package.json` |
| comando node | `node <caminho>` (`:40`) | `fs.existsSync` |

Metavariável (`<Categoria>`) e glob (`*`) são **ignorados de propósito** (`:49-60`): um verificador que adivinha produz falso-positivo, e gate com falso-positivo é gate que se aprende a contornar — o autor simplesmente para de usar crase, que é o que dá poder a este gate.

> ⚠️ **Os dois vãos declarados.** (1) **Só `sarak-dev/` é varrido** — `docs/`, `sarak-ui/` e as specs não são. (2) **Ponteiro de seção (`§N.N`) não é validado**, e é exatamente onde a regra está sendo violada: o bloco gerado manda "regenere com o script do **§5.1** do guia", e o `GUIA-MANUTENCAO.md` não tem §5.1 — o alvo real é o §2. O texto sai em **dois** artefatos gerados (`sarak-dev/GUIA-MANUTENCAO.md:308` e `state.json:44`). Achado 29 em [[15-divida-conhecida]].

---

## R24 — O CSS da lib não vaza no host em modo embarcado

**Estado:** ✅ gate pleno, via suíte.

**Enunciado.** No modo `embedded`, **todo** seletor da lib é confinado em `.sarak-scope`. O preflight do Tailwind e as regras de elemento (`h1..h6`, `button`, `input`, `body`, `:root`) não alcançam nada fora do escopo.

**Por quê.** No modo embarcado a lib é um **hóspede** dentro de um front que já existe. Preflight que escapa re-estiliza o produto do host inteiro — e o sintoma aparece longe da causa, no CSS de outra pessoa. É a contraparte estrutural de R13 e R16: a lib não impõe identidade **nem por CSS**.

**Certo × Errado.**

```css
/* ERRADO — o preflight alcança o host */
h1,h2 { margin: 0 }

/* CERTO — o transformador confina */
.sarak-scope h1, .sarak-scope h2 { margin: 0 }
```

**Cobrada por:** dois gates de suíte — `src/core/Provider/__tests__/scopeCss.test.ts`, que exercita o transformador `scopeCss` de `scripts/build-scoped-css.mjs` inclusive nos casos que quebram um prefixador ingênuo (universal, âncora de documento, `:not()` aninhado, at-rules) e afirma que a classe de escopo do **build** é a mesma do **runtime**; e `EmbeddedMode.test.tsx`. Rodam em `npx vitest run` (Anel 3 do `pre-push`). Contrato do modo em [[24-modo-embarcado]] §2.1.

---

## R25 — Os temas shippados bootam sem ruído de console

**Estado:** ✅ gate pleno, via suíte.

**Enunciado.** Carregar **qualquer** um dos 18 temas shippados não emite aviso `fora do contrato` nenhum no `console.warn`.

**Por quê.** É o teste de coerência entre R5 e R6: se um tema **da lib** dispara o descarte de R6, a lib está entregando ao consumidor um ponto de partida que o próprio motor rejeita — e o consumidor vê o aviso, não sabe que é nosso, e vai caçar o defeito no código dele. Aviso que aparece sempre também vira aviso que ninguém lê, e aí o dia em que o warn for **dele** já não terá efeito.

**Cobrada por:** o gate de suíte `src/core/Provider/utils/__tests__/shippedThemesConsoleClean.test.ts`. Ele monta o boot real (`{...masterDefaults, ...themeDesignTokens, ...config}` passado por `validateDesign`, como o `getSeedConfig` do `useDesignManager`), espia `console.warn` e afirma zero aviso — com um caso por tema, via `it.each(GLOBAL_THEMES)`.

---

## R26 — Paridade nome ↔ catálogo de ícones

**Estado:** ✅ gate pleno, via suíte.

**Enunciado.** Os nomes de ícone que o consumidor pode escrever são os de `ICON_NAMES`, e **exatamente** eles: o catálogo gerado publica essa lista, e **as três famílias** (Lucide, Phosphor, Tabler) cobrem 1:1:1 os mesmos nomes.

**Por quê.** O ícone era a exceção não documentada da regra dura de tokens — *todo valor que o consumidor escreve tem de estar no catálogo*. E o defeito de nome de ícone é da pior classe: ele **não quebra a tela**, ele silenciosamente não desenha nada. Paridade entre famílias é o que permite trocar a família inteira num tema sem descobrir buracos um a um.

**Cobrada por:** dois gates de suíte — `src/components/atomic/Icon/__tests__/iconCatalogParity.test.ts` (o `docs/component-catalog.json` publica exatamente `ICON_NAMES`, **na mesma ordem**; é a versão em suíte do `catalog:check`, que pega a defasagem sem depender de alguém rodar o build) e `iconContract.test.tsx` (cada família cobre exatamente `ICON_NAMES`, e nome desconhecido **degrada com aviso** em vez de estourar).

---

## R27 — O consumidor nunca precisa de deep import

**Estado:** ✅ **gate pleno.**

**Enunciado.** A superfície da lib é o **barril** (`src/index.ts`) mais o campo `exports` do `package.json`. Nenhum caso de uso legítimo exige `@sarak/lib-ui-core/dist/components/…`. O que está no barril tem retrocompatibilidade; o que não está é interno e muda sem aviso.

**Por quê.** Deep import é dependência num caminho que **ninguém prometeu**: ele quebra na versão seguinte, sem deprecação e sem aviso, porque a estrutura interna é justamente o que a lib se reserva o direito de mudar. E o deep import quase nunca é escolha — é sintoma: o consumidor recorre a ele porque **faltou** alguma coisa no barril, tipicamente o tipo `<Nome>Props` (é por isso que R14 cobra o tipo junto com o componente).

**Certo × Errado.**

```ts
// ERRADO — fora do contrato; o caminho pode não existir na próxima versão
import { SarakGrid } from '@sarak/lib-ui-core/dist/components/atomic/Layouts/SarakGrid';

// CERTO — a única porta é a raiz do pacote
import { SarakGrid, type SarakGridProps } from '@sarak/lib-ui-core';
```

**Cobrada por:** `node gates/scripts/contrato/check-no-deep-import.mjs` (construído pela `plan-12`, 2026-08-05; `npm run deep-import:check`, Anel 1 do `pre-commit`) — confere que `package.json.exports` só expõe a raiz e subcaminhos `.css`. **Nasceu verde.** Continuam valendo, ao lado do gate:

- **o contrato escrito** ([[03-superficie-publica]] §2);
- **o campo `exports` do `package.json`**, que publica a raiz mais **5 subcaminhos, todos de CSS** — não há porta declarada para `dist/components/…`. Isso torna o deep import um erro de resolução em runtime moderno, o que ajuda; mas não é gate, não cobre bundler tolerante, e sobretudo **não verifica o outro lado da regra**: que o barril cobre tudo que o consumidor precisa.

R14 (barril completo) garante que o consumidor não **precise** de deep import; este gate garante que o **caminho** não exista publicado.

---

## R28 — Contrato de saída do CLI do consumidor

**Estado:** ✅ **gate pleno.**

**Enunciado.** `sarak-ui check --notify` sai **sempre com 0** e imprime **só** quando há atualização a fazer. O modo normal (sem a flag) é o oposto, de propósito: sai com **1** se está desatualizado ou se a verificação falhou.

**Por quê.** O `--notify` está ligado no `predev` do importador — ele roda a **cada `npm run dev`**. Um aviso que sai diferente de 0 **derruba o `dev` de outra pessoa** por uma verificação que é nossa, não dela; e um aviso que aparece sempre vira aviso que ninguém lê, o que é o mesmo que não existir no dia em que importa. As duas metades são o mesmo contrato: **silêncio quando em dia, exit 0 sempre**. O modo normal precisa do 1 justamente para o oposto — compor com automação.

**Certo × Errado.**

| Situação | `--notify` | normal |
| --- | --- | --- |
| Em dia · link vivo · não deu para verificar | nenhuma linha, **exit 0** | veredito, exit 0 |
| Existe versão nova e há comando a rodar | bloco destacado, **exit 0** | veredito, **exit 1** |
| A verificação estourou | **silêncio, exit 0** | mensagem de falha, **exit 1** |

**Cobrada por:** `bin/scaffold/checkUpdate/__tests__/checkUpdateCli.contract.test.mjs` (construído pela `plan-12`, 2026-08-05) — 8 casos, exercitando `runCheckCli` real (fixtures `file:`, sem rede) nos 4 quadrantes da tabela acima (normal/`--notify` × em dia/desatualizado/falhou), mais o caso de exceção lançada por `runCheckUpdate`. Roda em `npx vitest run` (Anel 3 do `pre-push`), mesma família de R6/R13/R24-26. `runCheckCli` está implementado e comentado em `bin/scaffold/checkUpdate.mjs:14-28` (`runCheckCli` engole qualquer exceção no modo notify em `:20-24`, decide o código em `:27`), e `formatNotice` devolve `null` para tudo que não seja "existe versão nova E há um comando" (`checkUpdate/runCheckUpdate.mjs:199-201`). ⚠️ O teste do CLI **não** cobre o achado 26 (automação de `install` real via `child_process`/`execSync`) — são contratos diferentes; 26 segue aberto, roteado à `plan-11`.

> **Esta regra custou uma rodada inteira na `plan-04` por não existir escrita.** É o argumento mais curto a favor de escrever a regra antes de construir o gate. Contrato completo em [[13-instalacao-e-atualizacao]] §5.1.

---

## R29 — Todo artefato gerado bate com a fonte

**Estado:** ⚠️ **escopo menor que a regra** — 3 dos geradores têm modo `--check`; os outros não.

**Enunciado.** Todo arquivo **gerado** e **versionado** é reproduzível: rodar o gerador agora produz byte a byte o que está commitado. Gerador sem modo `--check` ligado a um gate é artefato que apodrece.

**Por quê.** É o mecanismo que faz R17 funcionar — apontar para a fonte gerada só é seguro se a fonte gerada estiver em dia. E o dano de não ter isso está medido: `src/core/Provider/generated/design-token-ids.ts` publica **304 propriedades para 409 tokens reais**, defasagem de **105 tokens**, e o número falso **vaza para o consumidor** via `sarak-ui/catalog.json` (`designTokens.count = 304`). Nenhum gate acusa porque o tipo gerado não é uma das três fontes que R4 cruza — o vão de R4 e a ausência de gate aqui são o **mesmo buraco**, visto de dois lados.

**Certo × Errado.**

```
CERTO    npm run catalog       # gera
         npm run catalog:check # o mesmo script, --check: commitado == gerado agora
ERRADO   npx tsx scripts/generate-token-types.ts   # gera, e nada confere depois
```

**Cobrada por:** ⚠️ **parcialmente.** Medido em 2026-08-02, os geradores com modo `--check` ligado a um script são **três**:

| Artefato gerado | Gerador | `--check`? |
| --- | --- | --- |
| `docs/component-catalog.{json,md}` | `generate-component-catalog.mjs` | ✅ `npm run catalog:check` |
| `sarak-ui/` (6 arquivos) | `generate-consumer-kit.mjs` | ✅ `npm run guide:check` |
| `sarak-dev/` (3 arquivos) | `generate-dev-kit.mjs` | ✅ `npm run dev-kit:check` |
| `src/core/Provider/generated/design-token-ids.ts` | `generate-token-types.ts` | ❌ **nenhum** — e está defasado em 105 tokens |
| `dist/BUILD_INFO.json` | `generate-build-info.mjs` | ❌ **nenhum** |

Os três primeiros rodam no `build` (ou, no caso do `dev-kit`, no `gates:full`) e no Anel 1 do `pre-commit`. Os dois últimos não são invocados por script, hook nem skill nenhuma. Achado 22 em [[15-divida-conhecida]]; a metade "registrar o gerador num pipeline" é da `plan-12`.

> **`src/core/Provider/manifest.ts` NÃO entra nesta regra.** Conferido no arquivo em 2026-08-02: ele é **escrito à mão** (`DESIGN_MANIFEST`, "Sovereign Design Manifest v10.1") — não tem marca de gerado e não há gerador para ele em `scripts/`. O único arquivo de `src/` com a marca `ARQUIVO GERADO AUTOMATICAMENTE` é o `design-token-ids.ts`.

---

## R30 — O TypeScript compila

**Estado:** ⚠️ **NASCE VIOLADA, e isso é deliberado.** Há gate de **contagem**, não de verde.

**Enunciado.** `npx tsc --noEmit` fecha **limpo**.

**Por quê.** Escrever isto como regra é o que transforma 14 erros de *"coisa que a gente sabe"* em **dívida com dono e prazo** *(decisão do dono, 2026-08-02)*. O fato de existirem **4 erros de tipo em produção** é a prova de que ninguém estava olhando: `tsc` nunca foi ligado a pipeline nenhum, então os erros nunca derrubaram nada e o número subiu sem resistência. E `tsc` é a única checagem que os vê — R3 procura o **token** `any` na AST, não compila.

**Certo × Errado.**

```
CERTO    o helper aceita ResponsiveValue<number>, que é o que o chamador passa
ERRADO   a união do toast do alvo aceita 'error'|'success'|'warning' e a função
         fornecida só trata 'success'|'warning'   ← TS2322, em produção
```

**Cobrada por:** ⚠️ **contagem, não verde.** `tsc` **não** é gate próprio e não roda no `build` nem no `gates:full`. O que existe é o **Anel 2** (`check-audit-baseline.mjs --with-tsc`, `:98-103`), acionado pelo `pre-commit` **só quando o staged tem `.ts`/`.tsx`** (`.githooks/pre-commit:78-84`): ele conta `error TS\d+` e compara com `tsc.erros` do baseline. **Isso impede a contagem de subir de 14 — não exige zero.**

**O baseline medido nesta entrega (2026-08-02): 14 erros, idêntico ao de [[01-gates-e-baseline]] §4.4.**

| Onde | Erro | Quantos |
| --- | --- | --- |
| `src/components/atomic/hooks/useStructuralStyles.ts:30,71,94` | `TS2345` — `ResponsiveValue<number>` não aceito por helper de assinatura `string \| number` (mesma causa nos três) | **3, produção** |
| `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:86` | `TS2322` — união de toast incompatível | **1, produção** |
| `BarrelParity.test.ts` (4) · `ZeroBrand.test.ts` (2) · `Spec21.spec.tsx` (3) · `shippedThemesConsoleClean.test.ts` (1) | `TS7016`/`TS7006`/`TS2741`/`TS2353` — import de `.mjs` sem tipos e fixtures incompletas | **10, teste** |

> **Regra que nasce vermelha é honesta; regra que finge estar cumprida é ficção.** Se o gate pleno entra com baseline (como o `audit:baseline`) ou só depois da quitação é decisão da `plan-12`. A quitação dos 4 de produção é da `plan-07`.

---

## R31 — Contraste AA nos temas de referência

**Estado:** ⚠️ **escopo menor que a regra**. **O gate existe, e desde 2026-08-11 os 18 temas passam nos dois
modos** — `0` reprovados no nativo, `0` no oposto.

> **A trajetória, porque ela explica o marcador.** ⏳ até 2026-08-10 (`plan-24` construiu o gate; ele nasceu
> **vermelho com 188**, por desenho). ⚠️ desde então — ⏳ significa *"a verificação ainda não foi
> construída"* (§1.2), e ela foi.
>
> **Por que NÃO subiu para ✅ quando os temas ficaram verdes** *(revisor, `plan-24-1`)*. A `plan-24-1`
> previa ✅ na sua meta, e o resultado não autoriza: **25 pares-tema seguem PULADOS** — fundo não
> determinístico, declarado em vez de chutado — e o par de texto de status continua fora. O gate **não vê**
> parte do que a regra exige, que é a definição literal de ⚠️ (§1.2). Marcar ✅ aqui seria o *"✅ falso"* que
> esta spec proíbe no aviso da §1.2. **O marcador descreve a verificação, não a conformidade** — e a
> conformidade, hoje, está verde.

**Enunciado.** Os **18 temas shippados** garantem contraste **WCAG AA** (4,5:1 para texto normal, 3:1 para texto grande) nos pares texto/fundo que produzem. A lib **não promete AA** para tema escrito pelo consumidor.

**Por quê.** É o caminho do meio, e as duas metades importam. A metade que **não** se promete já estava registrada em [[10-seguranca-e-acessibilidade]] §2.4d: *"o tema é dado do consumidor; prometer AA exigiria a lib recusar valores dele, o que contradiz o contrato de tema"* (R6 descarta o que está **fora do contrato**, não o que está feio). Isso está certo — e **não cobre os 18 temas que são da lib**, entregues como ponto de partida. A própria spec admite, no item 5.2, que *"a lib não sabe dizer se os 18 passam AA"*. R31 fecha essa metade, e só ela.

**Certo × Errado.**

```
CERTO    "os 18 temas de referência passam AA; o seu tema é responsabilidade sua"
ERRADO   "a lib é acessível"          — promessa que abrange dado de terceiro
ERRADO   silêncio                     — o consumidor assume que passa
```

**Cobrada por:** `gates/scripts/audit/auditor_contraste.mjs` → `verify_contrast.ts` (`plan-24`, 2026-08-10),
dentro do `npm run audit`, com teste próprio. **Baseline: `reprovados: 0` e `reprovadosModoOposto: 0`** — o
gate mede **duas passadas**, o modo nativo do tema e a contraparte gerada.

**A fronteira, decidida pelo dono e agora escrita:** **36 pares reais** texto/fundo, levantados cruzando
`catalog/partitions` (categorias e `relatedTokens`), a `description` de cada token no schema e o código dos
componentes — **não** "todo par possível". Limiar **4,5:1 em todos**, sem relaxamento: a WCAG só permite 3:1
para texto grande (≥24px), e onde `textColorMuted` renderiza são 9–14px. Cor com alfa é **composta** sobre a
cadeia de fundo (`efetiva = alfa × cor + (1 − alfa) × fundo`), não pulada.

**Dois vãos FECHARAM na `plan-24-1` (2026-08-11)** — e os dois eram do motor, não do gate:

- ✅ **O gate media o escrito, não o emitido.** `useDesignVariables` chamava `syncThemeWithMode` **sem
  condição**, e medido dava **1299 de 1316** valores reescritos com **178 de 648** veredictos divergentes. A
  **decisão D** parou a reescrita no modo nativo: agora **emitido = escrito**, e o gate mede a tela.
- ✅ **A contraparte gerada não tinha medição.** A **segunda passada** (`auditThemeOppositeMode`) mede o modo
  oposto. Junto veio a **decisão C** (papel `onPrimary`), que fechou a sobreposição das faixas `text` × `primary`
  — a causa de o texto de botão primário sair ilegível na conversão.

**O que o gate ainda NÃO vê** — e é por isso que a linha segue ⚠️:

1. **25 pares-tema PULADOS.** Valor em `hsl()`, `var()` ou gradiente, ou cadeia cujo elo final segue
   translúcido: o gate **declara** em vez de chutar um fundo. **Pulado não é aprovado** — é não medido.
2. **`statusErrorColor`/`statusSuccessColor` ficam fora**, declarados com número (**7/18** e **5/18**,
   medidos antes da correção dos temas): o fundo real deles é `--sarak-status-*-color-bg`, que **nunca é
   emitida** — cobrar isso do tema seria acusar o autor por defeito de componente. Achado **38** em
   [[15-divida-conhecida]] §3.1.
3. **O tema do consumidor não é coberto** — por desenho: a regra promete AA nos **18 shippados**, não no dado
   de terceiro. Ver a nota de migração de D em `docs/migracoes.md`.

> `useMediaLuminance.ts` mede **luminância de mídia** para escolher cor de texto sobre imagem — **não** é
> contraste WCAG. Confundir os dois é a forma mais fácil de declarar cobertura que não existe.

---

## R32 — A lib é indiferente ao sistema de autenticação

**Estado:** ✅ **gate pleno, e nasce verde.**

**Enunciado.** A lib **constrói a tela** de autenticação e **entrega o evento**. Nenhum componente lê ou escreve credencial, token ou sessão, e **nenhum impõe rota, verbo ou payload de autenticação** ao importador.

**Por quê.** Autenticação é do host, e só ele sabe onde o token vive. Uma lib de UI que lê `localStorage` atrás de um token, ou que decide que o endpoint de MFA é `POST {endpoint}/mfa/enable`, deixa de ser infraestrutura e vira **acoplamento**: o importador passa a ter de construir o backend no formato que a lib inventou. É a mesma família de R13 e R16 — a lib não impõe identidade, não impõe CSS, e não impõe protocolo. A prática já era essa e está escrita em voz alta no código: `src/shared/services/api.ts:7-13` diz que *"a Sarak NUNCA lê nem escreve token de autenticação"*, e o `SarakAuthScreen` só emite `onSubmit`.

**Certo × Errado.**

```ts
// CERTO — a lib desenha e devolve o evento; quem sabe o protocolo é o host
<SarakAuthScreen onSubmit={(credenciais) => meuBackend.login(credenciais)} />

// CERTO — template de dados: recebe `endpoint` e é AGNÓSTICO sobre o que há atrás
<SarakTable endpoint="/api/clientes" />

// ERRADO — a lib dita o protocolo do importador
await api.post(`${endpoint}/mfa/enable`, { code });
```

**Cobrada por:** `node gates/scripts/audit/auditor_authcoupling.mjs` (construído pela `plan-12`, 2026-08-05 — 9º/depois 10º auditor de `run_audit.mjs`). Detecção por AST: sinks de credencial (`localStorage`/`sessionStorage`/cookie com chave auth-ish) + header `Authorization` literal + rota embutida (string iniciada em `/` contendo `/mfa|login|oauth2?|token|auth|sso|2fa/`). **Hoje: 0 violações.**

> **O gate não pode ser burro, e isto vai escrito para quem for construí-lo.** Proibir `fetch`/`axios` em `src/components/` derrubaria **12 arquivos legítimos**: os templates de dados (`SarakTable`, `SarakChart`, `SarakForm`, `SarakManagementGrid`, …) recebem um `endpoint` e são agnósticos sobre o que existe atrás dele. O que se cobra é outra coisa — **sinks de credencial** (`localStorage`/`sessionStorage`/`cookie`/`Authorization`) e **rota de autenticação embutida** (`/mfa`, `/login`, `/oauth`, `/token`).

> ✅ **A violação com que a regra nascia foi removida.** `useSecurityOrchestratorState.ts` chamava `GET {endpoint}/mfa/status`, `GET {endpoint}/mfa/setup`, `POST {endpoint}/mfa/enable` e `POST {endpoint}/mfa/disable` — a lib ditava o protocolo de autenticação do importador. A `plan-09` (2026-08-05, operação 4) removeu o `SarakSecurityOrchestrator` inteiro (10 arquivos) do contrato público, no major. Quando o gate `auditor_authcoupling.mjs` nasceu, na `plan-12`, o único violador já não existia mais — confirmado: **0 violações** desde o primeiro dia do gate.

## R33 — O payload de tema é contrato público

**Estado:** ✅ **gate pleno** — *nasceu na `plan-24`, 2026-08-10.*

**Enunciado.** Uma chave de tema que o consumidor escreveu ou salvou na versão **N** continua sendo **aceita e
emitindo as mesmas variáveis CSS** na versão **N+1**. Remover ou renomear chave do domínio é **mudança de
contrato público** — exige major e nota de migração, como qualquer remoção de API.

> **O que é contrato e o que é conteúdo.** A **chave** e a variável que ela produz são contrato. **A cor não
> é.** Os 18 temas shippados são conteúdo da lib e podem ser recriados à vontade — foi exatamente o que o dono
> autorizou para a `plan-24-1`. Sem essa distinção, *"tema antigo não pode quebrar"* e *"vamos recriar os 18"*
> se contradiriam.

**Por quê.** Já foi violado uma vez, em silêncio. A `plan-21` removeu 27 entradas órfãs do `manifest.ts`; como
`validation.ts:34` monta `ALLOWED_EXTRA_KEYS` a partir de `Object.keys(DESIGN_MANIFEST)`, **o conjunto de
chaves aceitas caiu de 122 para 95**. Pela **R6**, chave fora do conjunto é descartada com `console.warn` — e
o aviso vai para o console, **não para o consumidor que perdeu a chave**. Ficou como achado **34**, aceito
porque a exposição medida era zero; o **mecanismo** continuava de pé, e nenhum gate o veria repetir.

R6 protege o **valor** (fora do contrato é descartado). R33 protege o **contrato** (ele não encolhe sem
alarde). São faces opostas da mesma fronteira.

**Certo × Errado.**

```
CERTO    remover chave do domínio  ⇒ major + nota de migração + a fixture do corpus acusa
ERRADO   remover chave do domínio  ⇒ patch, e o consumidor descobre pelo console
ERRADO   congelar os 18 temas      — trava a recriação; cor é conteúdo, não contrato
```

**Cobrada por:** `src/core/Provider/utils/__tests__/consumerThemeContract.test.ts` (`plan-24`) — corpus de
fixtures de payload **no formato do consumidor** (parcial, como alguém escreve à mão ou exporta do painel),
levadas por `validateDesign` → `useDesignVariables`, com o conjunto de variáveis emitidas em snapshot. Chave
que sai do domínio deixa de ser emitida e **o teste falha**. Roda em `npx vitest run` — Anel 3 do `pre-push`.

⚠️ **O vão conhecido, e é decisão adiada, não esquecimento:** não existe mecanismo de **alias com prazo** para
chave renomeada. Foi deixado de fora da `plan-24` por não haver nenhum renome na fila — construir alias antes
de existir o primeiro alias é construir para caso imaginado. Com o corpus no lugar, o dia em que aparecer um
renome **a fixture acusa**, e o alias nasce com o caso real na mão.

---

# 3. Regras de conduta

**Três regras não têm gate — e não vão ter.** Elas valem exatamente igual às da §2; o que muda é o mecanismo de cobrança, que é revisão humana. Cada uma traz **o motivo de não ter gate** na própria linha, porque "conduta" sem justificativa é só lacuna com nome bonito.

> **O critério para estar aqui é um só: um script não consegue decidir.** Não é "ninguém construiu ainda" — isso é ⏳ e mora na §2. Foi por esse critério que **R10 saiu desta seção em 2026-08-02**: um detector de HTML nativo cru é determinístico, logo ela é ⏳, não conduta.

## R11 — Configuração × Expansão

**Estado:** 🔴 conduta. **Por que não tem gate:** o sintoma é **indireto** — ele aparece como violação de R2, e só depois. Nenhum script consegue saber a **intenção** de uma mudança: escrever CSS novo é legítimo na Expansão e é o defeito na Configuração, e o código resultante é o mesmo nos dois casos.

**Enunciado.** Antes de tocar em `src/`, responda: **a chave já existe no dicionário?** Se existe, é **Configuração** — só dado, nenhum arquivo de `src/` alterado. Se não existe, é **Expansão** — paridade (R4) mais código.

**Por quê.** É a fronteira que mantém a lib um sistema orientado a dados. Quase todo pedido que *parece* exigir código é Configuração; escrever CSS ou um `.tsx` novo para um ajuste visual que o catálogo já cobre cria uma segunda fonte da verdade que o Design Engine não governa.

**A árvore de decisão.**

1. A mudança pode ser feita atribuindo valor a uma chave que **já existe** no catálogo? → **Configuração.** Preencha o payload. Fim.
2. Não existe a chave ou a camada estrutural? → **Expansão.** Crie o token nas três fontes (R4), faça o átomo consumir `var(--sarak-…, fallback)`, e **só então** configure o valor.

| Cenário | Ação | Arquivos tocados |
| --- | --- | --- |
| Mudar a cor do botão | **Configuração** | Só o JSON/payload do tema |
| Criar um tema escuro inteiro | **Configuração** | Só o JSON/payload do tema |
| Suportar "sombra texturizada", que não existe | **Expansão** | Schema + mapping + partição + `.tsx` |
| Criar um átomo novo | **Expansão** | Todo o pipeline, mais barril (R14) e teste (R8) |

**Cobrada por:** **nenhum gate — CONDUTA.** Nada impede que alguém escreva CSS solto para resolver o que era Configuração. O sintoma aparece depois, e indiretamente: o valor não responde à troca de tema (R2).

---

## R15 — Nada pesado sai eager do barril

**Estado:** 🔴 conduta. **Por que não tem gate:** exigiria **medir o bundle no pipeline** — build completo, comparação de tamanho de chunk e um limiar por fronteira. É a única regra deste documento cujo gate tem custo de infraestrutura, não de script; e o `build` está fora de hook por decisão fechada ([[02-enforcement-por-commit]] §4.1), porque muta a árvore.

**Enunciado.** Componente que arrasta biblioteca pesada vive **atrás de fronteira lazy**. Exportá-lo eager no barril público anula qualquer `React.lazy` que exista lá dentro.

**Por quê.** Número medido, não teoria: `SarakChartEngine` estava exportado eager e **anulava um `React.lazy` que já existia**, arrastando echarts + recharts + zrender + lodash — cerca de **2,9 MB** — para o boot de **todo** consumidor, inclusive quem nunca desenhou um gráfico. Corrigir isso, junto com o `IconMap` curado, levou o chunk de boot de **3203,6 KB para 1533,6 KB (−52,1%)**.

**Certo × Errado.**

```ts
// ERRADO — o barril importa o módulo pesado no grafo estático
export { SarakChartEngine } from './components/engines/charts/SarakChartEngine';

// CERTO — reexporta o índice que já declara o React.lazy
export { SarakChartEngine, type SarakChartEngineProps } from './components/engines/charts';
```

**Cobrada por:** **nenhum gate — CONDUTA.** Não existe verificação de peso de bundle no pipeline. As fronteiras lazy que existem hoje estão listadas em [[03-superficie-publica]] §7.1.

> **Reavaliada e mantida como conduta em 2026-08-03** *(decisão do dono, plan-06)*. Foi levantado que ela **é
> mensurável** — comparar o tamanho do chunk de boot contra um piso versionado é o mesmo mecanismo aprovado
> para a cobertura em % (R8.1): mede, grava, o piso só sobe. **A decisão foi deixá-la fora por enquanto.**
> Registrado aqui para que não seja reproposto: R15 é a única regra deste documento **mensurável e
> deliberadamente não medida** — as outras duas de conduta (R11, R16) não são mensuráveis por natureza.
> Reabrir isto exige decisão nova, não um "descobri que dava para medir".

> ✅ **A violação FECHOU — e o motivo pelo qual ela "não podia" fechar estava errado** *(medido pelo revisor em
> 2026-08-09)*. Até aqui esta regra declarava que `CustomizationPanel` saía **eager** do barril, pondo o painel
> inteiro do Design Engine no caminho crítico de todo consumidor, e que consertar era **breaking change**
> porque o tipo público viraria `LazyExoticComponent`.
>
> **As duas metades caíram.** `src/features/DesignEngine/Library/CustomizationPanel/index.tsx` é hoje uma
> fronteira lazy — `lazy(() => import('./CustomizationPanelImpl'))` dentro de `LazyEngineWrapper` — e o
> `Suspense` é **interno**, no mesmo padrão do `SarakChartEngine`. Consequência: **o tipo público seguiu
> `React.FC`**, e não houve breaking change nenhum. Medido no `dist/`: `CustomizationPanelImpl` é chunk
> próprio de **375 KB**, e o boot ESM (`dist/index.js`) está em **164 KB**.
>
> 🔴 **A lição vale mais que o conserto, e é por isso que este parágrafo fica.** Durante meses a spec
> **desaconselhou** um conserto que era barato, com base numa premissa técnica não verificada ("vira
> `LazyExoticComponent`"). Suspense interno resolve isso e já era o padrão usado ao lado, no mesmo
> repositório. **Custo declarado sem medição vira desculpa com aparência de rigor** — e ninguém reabre uma
> porta que a spec diz estar trancada.
>
> Regra com violação conhecida e declarada é honesta. Regra que finge estar cumprida é ficção — e **regra que
> declara impossível o que já é possível é a pior das três**, porque parece honestidade.

---

## R16 — Zero-gambiarra no consumidor

**Estado:** 🔴 conduta. **Por que não tem gate:** por definição, o gate teria de rodar **no repositório do consumidor** — fora do alcance deste. O sinal é social, não mecânico.

**Enunciado.** O consumidor **nunca** precisa escrever CSS, media query ou `!important` para consertar comportamento da lib. Buraco na lib vira **demanda na lib**.

**Por quê.** Todo workaround no importador é uma peça de estilo que o Design Engine não governa: ela não responde à troca de tema (R2, do lado de fora) e quebra no próximo `dist/`. Pior, ela **esconde o defeito** — a lib parece pronta enquanto cada consumidor mantém seu remendo particular.

**Certo × Errado.**

```css
/* ERRADO — no CSS do consumidor */
.sarak-shell aside { width: 240px !important; }
```

```
CERTO — abrir a demanda na lib: o token de largura de sidebar não existia,
e a correção é criar o token (R11 → Expansão), não remendar do lado de fora.
```

**Cobrada por:** **nenhum gate — CONDUTA.** O sinal de alerta é social: quando um relatório de integração traz "tive que forçar por CSS", isso é um item de backlog **da lib**.

# 4. Mapa regra → gate

**A coluna "Estado" é a mesma da §1.2.** Todo gate desta tabela existe e foi executado; todo `⏳` é ausência declarada.

| # | Regra | Estado | Cobrada por | Comando |
| --- | --- | --- | --- | --- |
| R1 | Três camadas | ✅ | `auditor_arquitetura.mjs` | `npm run audit` |
| R2 | Zero hardcode | ✅ | `auditor_hardcoded.mjs` | idem |
| R3 | Zero `any` | ✅ | `auditor_typescript.mjs` | idem |
| R4 | Paridade 3 fontes | ⚠️ | `auditor_paridade.mjs` → `verify_parity.ts` — **não vê o tipo gerado** | idem |
| R5 | Zero chave órfã | ✅ | `auditor_presets.mjs` → `verify_presets.ts` (+ `verify_theme_parity.ts` ⏳) | idem |
| R6 | Contrato de valor | ✅ | `validateDesign` + `tokenContractParity.test.ts` | `npx vitest run` |
| R7 | Namespace e fallback | ⚠️ | `auditor_ghostvars.mjs` — vê os 4 `CONSUMER_DIRS`, mas **valida só o NOME, nunca a sintaxe do fallback**, e **aceita nome que o manifesto declara e o runtime nunca emite** | `npm run audit` |
| R8 | Cobertura 1:1 | ✅ | `auditor_coverage.mjs` — 6 diretórios, **inclusive `src/shared/`** (`:65-73`); as exclusões (`src/styles/`, `index*`, `.ts` que não é hook) são a **fronteira da própria regra**, não vão de gate. `R8.1` = piso móvel de % | idem |
| R9 | Clean Code | ✅ | `auditor_cleancode.mjs` | idem |
| R10 | Composição atômica | ⚠️ | `auditor_composicaoatomica.mjs` — **só HTML nativo cru**; `switch` de design sem detector | `npm run audit` |
| R12 | Zero-marca | ✅ | `check-zero-brand.mjs` | `npm run zero-brand:check` |
| R13 | Identidade do host | ✅ | `HostIdentity.test.tsx` · `EmbeddedMode.test.tsx` | `npx vitest run` |
| R14 | Barril completo | ⚠️ | `check-barrel-parity.mjs` — **não vê subpasta de categoria** | `npm run barrel:check` |
| R17 | Não transcrever fonte viva | ⚠️ | `catalog:check` · `guide:check` · `dev-kit:check` — **só o gerado** | `npm run catalog:check` |
| R18 | Gate declara o que não vê | ✅ | `check-gate-limits.mjs` — 26/26 | `npm run gate-limits:check` |
| R19 | Tarball só com o publicável | ✅ | `check-package-contents.mjs` | `npm run package:check` |
| R20 | Baseline não regride | ✅ | `check-audit-baseline.mjs` (Anel 2) | `npm run audit:baseline` |
| R21 | Artefato mudou, exige tag | ✅ | `check-release-tag.mjs` (`pre-push`) | `npm run release:check` |
| R22 | Zero segredo no staged | ✅ | `verificar_commit.py` (Anel 0) | `python gates/scripts/segredo/verificar_commit.py --raiz .` |
| R23 | Zero ponteiro morto no gerado | ⚠️ | `dev-kit/deadPointers.mjs` (caminhos/comandos em `sarak-dev/`) **+** `check-section-pointers.mjs` (`§N.N`, escopo amplo) — este **não resolve cross-documento**: cobre 271 de 455 ponteiros | `npm run dev-kit:check` |
| R24 | CSS não vaza no host | ✅ | `scopeCss.test.ts` · `EmbeddedMode.test.tsx` | `npx vitest run` |
| R25 | Temas shippados sem ruído | ✅ | `shippedThemesConsoleClean.test.ts` | `npx vitest run` |
| R26 | Paridade de ícones | ✅ | `iconCatalogParity.test.ts` · `iconContract.test.tsx` | `npx vitest run` |
| R27 | Zero deep import | ✅ | `check-no-deep-import.mjs` | `npm run deep-import:check` |
| R28 | Contrato de saída do CLI | ✅ | `checkUpdateCli.contract.test.mjs` (8 casos) | `npx vitest run` |
| R29 | Gerado bate com a fonte | ✅ | **os 5 geradores têm `--check`, e os 5 rodam**: `token-types` · `catalog` · `guide` dentro do `build`; `build-info` e `dev-kit` no `gates:full` | `npm run catalog:check` … |
| R30 | O TypeScript compila | ⚠️ | **0 erros, produção e teste** *(medido 2026-08-08)*; baseline em 0 ⇒ qualquer erro novo bloqueia. O vão que resta é o **gatilho**: o `--with-tsc` do Anel 2 só liga quando o staged tem `.ts`/`.tsx` | `npx tsc --noEmit` |
| R31 | Contraste AA nos 18 temas | ⚠️ | `auditor_contraste.mjs` → `verify_contrast.ts` — **36 pares, 4,5:1, alfa composto, DUAS passadas** (nativo + modo oposto); baseline **0 e 0**. Vãos que restam: **25 pares-tema pulados** (fundo não determinístico) e as cores de status, fora com número | `npm run audit` |
| **R33** | **Payload de tema é contrato público** | **✅** | `consumerThemeContract.test.ts` (`plan-24`) — corpus de payload de consumidor; chave que sai do domínio para de emitir e o teste falha | `npx vitest run` |
| R32 | Indiferente à autenticação | ✅ | `auditor_authcoupling.mjs` — nasce verde | `npm run audit` |
| **R11** | **Configuração × Expansão** | **🔴** | **nenhum — CONDUTA** | — |
| **R15** | **Nada pesado eager** | **🔴** | **nenhum — CONDUTA.** ✅ a violação declarada FECHOU em 2026-08-09 (ver a regra) | — |
| **R16** | **Zero-gambiarra** | **🔴** | **nenhum — CONDUTA** | — |

## 4.1 Os validadores e o pipeline — quem executa o quê

> **Decisão do dono (2026-08-01): a verificação é do GATE, não da skill.** As skills de
> `.agents/skills/` **hospedam** os validadores porque são donas do domínio, mas **não os invocam**.
> Quem executa é o `package.json` hoje e o **pipeline de CI/CD** adiante. Esta tabela existe para
> quem for montá-lo: é o inventário do que já está ligado e do que ainda falta ligar.

| Validador | Cobra | Onde mora | Executado por |
| --- | --- | --- | --- |
| `run_audit.mjs` (agrega os `auditor_*.mjs`) | R1 · R2 · R3 · R4 · R5 · R7 · R8 · R9 | `gates/scripts/audit/` | ✅ `npm run audit` |
| `verify_parity.ts` | R4 | `gates/scripts/audit/` | ✅ via `auditor_paridade.mjs` |
| `verify_presets.ts` | R5 | `gates/scripts/audit/` | ✅ via `auditor_presets.mjs` |
| `check-barrel-parity.mjs` · `check-zero-brand.mjs` | R14 · R12 | `gates/scripts/contrato/` | ✅ `barrel:check` · `zero-brand:check` (Anel 1) |
| `check-package-contents.mjs` | **R19** | `gates/scripts/contrato/` | ✅ `package:check` (`prepublishOnly`, `gates:full`) |
| `generate-component-catalog.mjs` · `generate-consumer-kit.mjs` · `generate-dev-kit.mjs` (modo `--check`) | R17 · **R23** · **R29** | `scripts/` — geram **e** conferem, por isso **não** migram | ✅ `catalog:check` · `guide:check` · `dev-kit:check` |
| `check-audit-baseline.mjs` | **R20** · **R30** (contagem) | `gates/scripts/release/` | ✅ Anel 2 do `pre-commit` · `npm run audit:baseline` |
| `check-release-tag.mjs` | **R21** | `gates/scripts/release/` | ✅ anel de push do `pre-push` · `npm run release:check` |
| `verificar_commit.py` | **R22** | `gates/scripts/segredo/` | ✅ Anel 0 do `pre-commit` (sempre) |
| A suíte (`npx vitest run`) | R6 · R13 · **R24** · **R25** · **R26** | `src/**/__tests__/` — R8 exige teste ao lado | ✅ Anel 3 do `pre-push` |
| **`verify_theme_parity.ts`** | **R5, por tema individual** | `gates/scripts/audit/` | ⏳ **nenhum — vai para o pipeline** |
| `check-coverage-floor.mjs` | **R8.1, cobertura em %** | `gates/scripts/release/` | ✅ `npm run coverage:check` (dentro de `gates:full`) — piso 70,66% |
| `auditor_composicaoatomica.mjs` | **R10** | `gates/scripts/audit/` | ✅ via `run_audit.mjs` (Anel 2) — 47 violações no baseline |
| `auditor_authcoupling.mjs` | **R32** | `gates/scripts/audit/` | ✅ via `run_audit.mjs` — nasce verde |
| `check-no-deep-import.mjs` | **R27** | `gates/scripts/contrato/` | ✅ `npm run deep-import:check` (Anel 1) |
| `checkUpdateCli.contract.test.mjs` | **R28** | `bin/scaffold/checkUpdate/__tests__/` | ✅ Anel 3 (`npx vitest run`) |
| `check-gate-limits.mjs` | **R18** | `gates/scripts/contrato/` | ✅ `npm run gate-limits:check` — 26/26 |

**Das duas linhas ⏳, `@vitest/coverage-v8` fechou em 2026-08-05** (`plan-12`, Lote B) — vira `check-coverage-floor.mjs`, piso móvel gravado em **70,66%** (`npm run coverage:check`, dentro do `gates:full`). **`verify_theme_parity.ts` continua ⏳**: valida **um** tema contra o dicionário e hoje só roda se alguém o chamar à mão; o que existe em gate é o `auditor_presets`, que cobra chave órfã em todos os temas embarcados de uma vez — cobertura diferente, não equivalente. Dos seis gates que não existiam em arquivo nenhum (R10, R18, R27, R28, R31, R32), **os seis existem desde 2026-08-10**: cinco pelas plans 12 e 16, e o de **R31** pela `plan-24`, depois de o dono fechar a fronteira de pares e o limiar.

**Geradores não viram gate — e a distinção é deliberada.**
`generate_theme_template.ts` (`ui-criar-tema`) escreve arquivo em `src/`; um gerador que rodasse
em pipeline produziria commit fantasma a cada execução. Gerador é invocado pela skill, sob decisão
humana. **Validador** é invocado pelo gate, sempre. Os dois vivem lado a lado na mesma pasta de
`scripts/` e não se confundem: um escreve, o outro só lê e reprova. O **modo `--check` de um gerador**
é a exceção que confirma a regra — ali ele não escreve, só compara (R29).

# 5. O que esta spec admite sobre si mesma

Cinco coisas ficam registradas em voz alta, porque quem lê um contrato precisa saber onde ele é fino:

1. **Só uma regra verificável ainda não tem gate** (R31 — parada obrigatória, decisão de fronteira pendente do dono) e **três são conduta permanente** (R11, R15, R16). As quatro valem igual; quatro de trinta e duas dependem de revisão humana hoje. *(Atualizado em 2026-08-07: as plans 12 e 16 construíram os cinco gates que faltavam — R10, R18, R27, R28, R32.)*
2. **Nove regras têm o escopo do gate menor que o da regra** (R4, R7, R8, R10, R14, R17, R23, R29, R30), e cada vão está escrito na linha da própria regra, não em nota de rodapé. R14 tinha o mesmo defeito e foi corrigida em P26 **ampliando o escopo do gate junto com o conserto** — é o modelo que R18 generaliza, e R18 agora tem gate próprio (`check-gate-limits.mjs`, 26/26).
3. **Uma regra continua nascendo violada, de forma declarada e medida**: R30 (`tsc` — produção em 0, hard-block; 10 erros de teste, tolerados como piso). R7 e R32 **fecharam** (`--sx-*` corrigido pela `plan-07`; `SarakSecurityOrchestrator` removido pela `plan-09`, antes de o gate de R32 nascer — ele já nasceu verde). **R15 segue violada de forma declarada.** R10, cujo gate nasceu em 2026-08-05, registra **47 violações no baseline** — dívida explícita da `plan-15`, ainda não paga.
4. **As duas regras que não tinham teste ganharam um**: R28 (`checkUpdateCli.contract.test.mjs`, 8 casos) e R18 (`check-gate-limits.mjs`).
5. **Nenhuma regra existente foi renumerada nesta reestruturação.** R10, R11, R15 e R16 mudaram de **categoria** e mantiveram o número, porque o `.githooks/pre-commit:68-71` imprime números na mensagem de bloqueio e há citação em código, skills e specs.

Nenhum destes é corrigido aqui — **regra nasce descrevendo o que é**. Cada um está catalogado com `arquivo:linha` em [[01-gates-e-baseline]] e [[15-divida-conhecida]], que é onde a dívida mora; pagar o que os gates novos acusam é a **`plan-15`**, ainda não executada.

# 6. Critérios de aceite

- [x] Toda regra citada em qualquer outro documento da base aparece aqui, com enunciado, porquê, exemplo e o campo "Cobrada por".
- [x] **Duas categorias**: 29 regras verificáveis (§2) e 3 de conduta (§3), somando 32.
- [x] Nenhum gate foi inventado: cada comando da §4 existe no repositório e foi lido no código antes de descrito.
- [x] Cada regra de conduta traz **o motivo de não ter gate** na própria linha, não em nota.
- [x] Os vãos de escopo (R4, R7, R8, R14, R17, R23, R29, R30) estão declarados **na linha da regra**.
- [x] Toda regra abre com o marcador de estado do vocabulário fixo da §1.2 (✅ · ⚠️ · ⏳ · 🔴).
- [x] **Nenhuma regra foi renumerada.** R1–R17 mantêm o número; R10, R11, R15 e R16 mudaram só de categoria.
- [x] R30 declarada **violada**, com a composição medida — *(atualizado 2026-08-07: a `plan-12` separou produção de teste; produção fechou em 0/hard-block pela `plan-07`, restam 10 erros de teste, tolerados como piso)*.
- [x] R32 declarada com a violação viva e o destino dela (`plan-09`) — *(fechada em 2026-08-05: o `SarakSecurityOrchestrator` saiu antes de o gate nascer, que já nasceu verde)*.
- [x] **Zero gate criado, ampliado ou alterado nesta plan** — esta spec só escreve regra. *(As plans 12 e 16, subsequentes, construíram os gates que faltavam; sintetizado aqui em 2026-08-07.)*

# 7. Plano de testes (Quality Gate)

Esta spec é normativa: ela não adiciona teste, ela **cataloga** os que existem. A verificação de que ela continua verdadeira é:

- **Contagem:** `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` → **32**.
- **Categorias:** `grep -nE "^## R(11|15|16) "` → as três dentro de `# 3. Regras de conduta`; **R10 fora dela**.
- **Numeração preservada:** `grep -nE "^## R(1|2|3|4|5|6|7|8|9|12|13|14|17) "` → os números e enunciados de antes.
- **Unitário / gate:** `node gates/scripts/audit/run_audit.mjs` no baseline documentado em [[01-gates-e-baseline]] — **não** em zero.
- **Gates de contrato:** `npm run barrel:check`, `npm run catalog:check`, `npm run zero-brand:check`, `npm run guide:check`, `npm run dev-kit:check` — os cinco em verde.
- **Suíte:** `npx vitest run` **completa**. Rodar pasta a dedo esconde snapshot de terceiros quebrado; "suítes verdes" só vale para a suíte inteira.
- **`tsc`:** `npx tsc --noEmit` → **10 erros, todos em teste** (produção em 0, hard-block desde a `plan-07`; a `plan-12` separou a contagem por classe no Anel 2). Vermelho de teste é o estado esperado até a `plan-15`.
</content>
</invoke>
