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

## 1.1 Como ler cada regra

Toda regra tem quatro partes fixas:

- **Enunciado** — uma frase imperativa.
- **Por quê** — o dano concreto que ela evita. Onde foi possível, um dano que **já aconteceu**.
- **Certo × Errado** — o exemplo mínimo.
- **Cobrada por** — o gate exato, com comando. Ou **"nenhum gate — CONDUTA"**, dito com todas as letras.

> **O campo "Cobrada por" é o coração desta spec.** Regra sem gate só existe se alguém lembrar dela, e o leitor tem o direito de saber quais são essas. Nenhum gate foi inventado para preencher a coluna: das 17 regras, **11 têm gate** e **6 são conduta**.

Onde a regra se apoia num mecanismo já documentado, esta spec **aponta** para o documento de arquitetura em vez de repeti-lo.

# 2. As regras

## R1 — Três camadas estritas

**Enunciado.** `src/components/` **não** importa de `features/`. `src/core/` **não** importa de `features/`. A dependência aponta sempre para dentro.

**Por quê.** Sem isso o núcleo passa a depender da única feature que existe (o painel do Design Engine) e a lib deixa de ser uma base: um consumidor que nunca abre o painel carrega o painel mesmo assim, e qualquer refactor da feature vira refactor do núcleo. É a inversão de dependência clássica, e aqui ela também é uma regra de bundle.

**Certo × Errado.**

```ts
// ERRADO — em src/components/atomic/Cards/SarakActionCard.tsx
import { useDesignDraft } from '../../../features/DesignEngine/hooks/useDesignDraft';

// CERTO — o componente recebe o que precisa por prop/contexto público do core
import { useSarakDesign } from '../../../core/Provider/SarakUIProvider';
```

**Cobrada por:** `node .agents/skills/ui-auditoria-modulo/scripts/auditor_arquitetura.mjs` (dentro de `run_audit.mjs`). Varre todo `src/` por AST, reporta arquivo e linha do import ofensor. Detalhe das camadas e as **duas limitações honestas do auditor** (`require()`/`import()` dinâmico passam; a checagem é por substring, não por resolução de módulo) em [[00-mapa-do-modulo]] §4.1.

---

## R2 — Zero hardcode

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

**Cobrada por:** `node .agents/skills/ui-auditoria-modulo/scripts/auditor_hardcoded.mjs`.

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

O código as declara nos próprios comentários (`:18-25`, `:161-173`):

1. **Só arquivos `.tsx` são coletados.** Hook Controlador em `.ts` puro nunca é varrido — é isso que permite o preset nomeado existir. Ver [[00-mapa-do-modulo]] §5.1: é uma **faca de dois lados**.
2. **Classe em `const` interpolada por template literal escapa** do detector estrutural (um `Identifier` não tem literais filhos). O detector de VALOR **não** tem essa isenção — ele varre toda string do arquivo.
3. **`_` no lugar de espaço** em valor arbitrário de shadow escapa da regex.
4. **`sanitizeFallbacks()` não aceita fallback negativo.** `var(--x, -1px)` **não** é limpo e vira violação. A convenção é `calc(var(--x, 1px) * -1)`.

> **Mover código para `.ts`, para uma `const` ou trocar espaço por `_` a fim de escapar do gate é fraude, não arquitetura.** O critério é o propósito, não o resultado numérico.

---

## R3 — Zero `any`

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

**Cobrada por:** `node .agents/skills/ui-auditoria-modulo/scripts/auditor_typescript.mjs` — falha em qualquer nó `AnyKeyword` na AST de `src/` (exceto `__tests__/` e `Mocks/`). Hoje: **0 ocorrências**.

> ⚠️ `npx tsc --noEmit` **não** é gate hoje e **não** está verde (14 erros, 4 em produção). Ele é dívida conhecida, catalogada em [[01-gates-e-baseline]]. O auditor de `any` e o compilador checam coisas diferentes; um estar verde não implica o outro.

---

## R4 — Paridade: token nasce nas três fontes ou não existe

**Enunciado.** Uma chave de design só é **real** se existir simultaneamente no **Schema** (`src/core/Design/schema/*.ts` → `MASTER_DESIGN_MAP`), no **roteamento de persistência** (`catalog/theme_table_mapping.json`) e no **catálogo** (`catalog/partitions/*.json`). Fora disso, ela é inexistente.

**Por quê.** Chave órfã é o defeito mais silencioso do módulo: existe no tipo, não existe no motor; o autor do tema preenche, e nada acontece. Sem a checagem cruzada não há como distinguir "token novo" de "erro de digitação".

**Certo × Errado.** Adicionar um token é sempre **as três** edições, na mesma entrega — nunca "o schema primeiro, o resto depois".

**Cobrada por:** `auditor_paridade.mjs` → `npx tsx .agents/skills/ui-novo-componente/scripts/verify_parity.ts`. Hoje: **409 / 409 / 409**. O dicionário, as duas alavancas (Valor × Estrutural) e a divergência apurada 409 × 416 estão em [[04-contrato-de-tokens-e-paridade]].

> A antiga **"6ª camada = Registry do motor de manifesto" MORREU** com o motor ([[002-remocao-motor-manifesto]]). Se você encontrar uma skill ou documento exigindo paridade com um Registry, é ponteiro morto — a paridade verificada hoje é de **três** fontes.

---

## R5 — Zero chave órfã em tema ou preset

**Enunciado.** Todo tema e todo preset shippado só contém chaves que existem no gabarito vivo (`getScaffold()`).

**Por quê.** Um tema com chave que o motor não conhece é um tema que **parece** completo e não é: o eixo some sem aviso. Como os temas de referência são o ponto de partida do consumidor, o defeito se propaga para fora da lib.

**Cobrada por:** `auditor_presets.mjs` → `npx tsx .agents/skills/ui-auditoria-modulo/scripts/verify_presets.ts`. Hoje: **120 itens auditados** (18 temas + 102 presets de componente), zero órfã.

---

## R6 — Contrato de valor: fora do contrato é descartado, nunca injetado

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

**Cobrada por:** `validateDesign` (`src/core/Provider/utils/validation.ts`) em **runtime**, e `src/core/Provider/utils/__tests__/tokenContractParity.test.ts` na suíte. `auditTokenContract` é a versão **pura** da mesma checagem — auditoria e runtime compartilham `coerceTokenValue`, por isso não podem divergir. Detalhe em [[04-contrato-de-tokens-e-paridade]].

---

## R7 — Namespace e fallback obrigatórios

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

**Cobrada por:** `node .agents/skills/ui-auditoria-modulo/scripts/auditor_ghostvars.mjs` — constrói o registro real de variáveis emitidas (schemas + `src/styles/*.css`, expandido por 18 sufixos gerados) e cruza com todo `var(--x)` consumido. Hoje: **14.179 variáveis no registro, 3 consumos fantasma** (o baseline).

> ⚠️ **A regra tem uma lacuna de cobertura conhecida e ela está sendo violada hoje.** O auditor varre apenas `src/components/` e `src/features/`; `src/styles/` é tratado como fonte **emissora**, nunca como consumidora. Por isso os **2 usos vivos de `--sx-*`** em `src/styles/_utilities.css:80` e `:89` (`var(--sarak-range-active-bg, var(--sx-color-primary-base))`) **não acendem luz vermelha nenhuma**. Ver §4 e [[01-gates-e-baseline]].

### R7.1 Ordem de correção: raiz primeiro

Ao corrigir um consumo fantasma **compartilhado**, corrija a fonte comum (o Hook Controlador) **antes** dos consumidores individuais. Na ordem inversa, cada consumidor é migrado duas vezes.

---

## R8 — Cobertura 1:1

**Enunciado.** Todo componente e todo hook tem um teste **ao lado**, em `__tests__/<nome>.test.tsx` (ou `.test.ts`).

**Por quê.** Cobertura por porcentagem esconde o arquivo que ninguém testou; cobertura 1:1 não. E como o teste mora ao lado, mover o componente move o teste — não existe teste órfão apontando para um caminho morto.

**Certo × Errado.**

```
CERTO                                    ERRADO
Cards/SarakActionCard.tsx                Cards/SarakActionCard.tsx
Cards/__tests__/SarakActionCard.test.tsx test/cards.test.tsx   ← agregado, não 1:1
```

**Cobrada por:** `node .agents/skills/ui-auditoria-modulo/scripts/auditor_coverage.mjs`, sobre `src/components/`, `src/features/` e `src/core/`. Duas particularidades do escopo, para não haver surpresa: arquivos `index*` são ignorados, e **arquivos `.ts` só entram na cobrança se o nome começar com `use`** (isto é, utilitário `.ts` que não é hook não é cobrado). Hoje: **zero órfão**.

---

## R9 — Clean Code com limiares objetivos

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

**Cobrada por:** `node .agents/skills/ui-auditoria-modulo/scripts/auditor_cleancode.mjs`. **Isenção declarada no código** (`:37`): arquivos sob `/presets/themes/`, `/Design/schema/` e `/Design/master-map` não pagam o teto de linhas — são dicionários de dados, não lógica. Hoje: **zero violação**.

---

## R10 — Composição atômica obrigatória

**Enunciado.** Proibido `<button>`, `<input>` ou `<select>` cru dentro de template ou componente pré-montado — use `SarakButton`, `SarakInput`, `SarakSelect`. E proibido `switch`/`case` de design ou `<style>` de roteamento dentro do JSX: essa decisão mora no Hook Controlador.

**Por quê.** HTML nativo cru causa **vazamento de especificidade** — o elemento fica preso na variável global do preflight e ignora a paridade atômica, deixando de responder ao token que deveria governá-lo. O próprio painel do Design Engine obedece a isto (*dogfooding*).

**Certo × Errado.**

```tsx
// ERRADO — dentro de um Template
<button className="rounded-sarak bg-[var(--sarak-color-primary)]">Salvar</button>

// CERTO
<SarakButton variant="primary">Salvar</SarakButton>
```

**Cobrada por:** **nenhum gate — CONDUTA.** Não existe detector de HTML nativo cru nem de `switch` de design no JSX. Esta regra depende de revisão humana.

---

## R11 — Configuração × Expansão

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

## R12 — Zero-marca: a lib nunca estampa a própria marca

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

**Cobrada por:** `npm run zero-brand:check` (`scripts/check-zero-brand.mjs`). Varre `src/` por AST — só `StringLiteral`, `JsxText` e partes fixas de template literal contam, para **não** acusar comentário que documenta a correção. Hoje: **361 arquivos, 0 violações**. A allowlist tem 3 painéis **internos** do Design Engine (`KitchenSinkPreview`, `LanguageTab`, `LayoutTab`) — ferramenta de autoria da própria lib, nunca embutida pelo consumidor — e o gate também derruba **entrada de allowlist obsoleta**.

---

## R13 — A identidade do host é do importador

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

**Cobrada por:** **testes, não gate próprio** — `src/core/Provider/__tests__/HostIdentity.test.tsx` (planta título e favicon de host e afirma que sobrevivem à montagem do Provider) e `EmbeddedMode.test.tsx`. Rodam na suíte (`npx vitest run`), não num gate dedicado. O contrato para o consumidor está em `docs/identidade-do-host.md`, shippado no pacote. Ver [[006-zero-marca-soberania-host]].

---

## R14 — Barril completo

**Enunciado.** Todo componente consumidor-facing está exportado em `src/index.ts`, **junto com o seu tipo `<Nome>Props`**. Exclusão só com **motivo escrito** em `scripts/barrelExclusions.mjs`.

**Por quê.** Componente exportado sem o tipo das props deixa o consumidor sem como tipar o próprio wrapper — ele acaba recorrendo a deep import, que **é proibido por contrato** ([[03-superficie-publica]] §2) e quebra na versão seguinte. E allowlist sem motivo vira depósito: por isso o gate também derruba **exclusão obsoleta** (nome já exportado, ou componente que não existe mais).

**Certo × Errado.**

```ts
// ERRADO — só o valor
export { SarakGrid } from './components/atomic/Layouts/SarakGrid';

// CERTO — valor + tipo
export { SarakGrid } from './components/atomic/Layouts/SarakGrid';
export type { SarakGridProps } from './components/atomic/Layouts/SarakGrid';
```

**Cobrada por:** `npm run barrel:check`. Hoje: **81 componentes, 0 faltas**; a allowlist tem **1 entrada** (`SarakAppChromeMobile`, com motivo).

> ✅ **O vão de `engines/` foi FECHADO em P26** (decisão D2, 2026-07-29). O gate varria `components/atomic/**` e `components/Layout/**` e **não via `components/engines/**`** — resultado: 3 das 4 categorias de engine viviam fora do barril e o gate ficava verde. Hoje `collectPublicComponentNames()` varre `engines/` como raiz por categoria; `SarakChatEngine` e `SarakFlowEngine` foram expostos atrás de fronteira lazy, `SarakVisualEngine` foi removido por não ter consumidor real, e a contagem foi de 78 para 81. Ver [[03-superficie-publica]] §9.
>
> ⚠️ **O outro limite do gate CONTINUA de pé:** categoria **sem barril de categoria** só tem os `.tsx` de **raiz** varridos — componente colocado em subpasta escapa do gate e do catálogo. Isso é deliberado em alguns casos (as peças internas do cromo vivem em `Layout/chrome/` justamente por isso), mas um componente público esquecido numa subpasta passa em silêncio.

---

## R15 — Nada pesado sai eager do barril

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

> ⚠️ **Esta regra está sendo violada pela própria lib, e a violação é declarada.** `CustomizationPanel` sai **eager** do barril (`src/index.ts:50`) e ainda é importado eager pelo efeito colateral de `:119-125`, que registra o painel em dois ids legados do Discovery ao simples ato de importar a lib. O custo é **o painel inteiro do Design Engine no caminho crítico de todo consumidor** — a dívida mais cara da lista. **Não foi corrigida** porque torná-lo lazy muda o tipo público para `LazyExoticComponent`: é **breaking change** do contrato, e a decisão é do dono.
>
> Regra com violação conhecida e declarada é honesta. Regra que finge estar cumprida é ficção.

---

## R16 — Zero-gambiarra no consumidor

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

**Cobrada por:** **nenhum gate — CONDUTA.** Por definição, o gate teria de rodar no repositório do consumidor. O sinal de alerta é social: quando um relatório de integração traz "tive que forçar por CSS", isso é um item de backlog **da lib**.

---

## R17 — Não transcrever fonte viva

**Enunciado.** Lista de tokens, de componentes, de props ou de nomes de ícone **jamais** é copiada para dentro de markdown. Aponte para a fonte gerada.

**Por quê.** Cópia estática é mentira com data marcada: a próxima mudança de código já a torna falsa, e ninguém percebe porque markdown não quebra build. As fontes vivas são `docs/component-catalog.json`, `sarak-ui/catalog.json`, `getAllDesignTokens()`, `getScaffold()`.

**Certo × Errado.**

```
ERRADO   "Os componentes disponíveis são: SarakButton, SarakInput, SarakCard, …"
CERTO    "A lista completa está em `docs/component-catalog.json`, gerada por AST."
```

**Cobrada por:** `npm run catalog:check` e `npm run guide:check` — **para os artefatos gerados**. Os dois comparam o commitado com o que o gerador produz agora e derrubam o build se divergirem. Para prosa escrita à mão em markdown, **não há gate**: a regra é conduta.

# 3. Mapa regra → gate

| # | Regra | Cobrada por | Comando |
| --- | --- | --- | --- |
| R1 | Três camadas | `auditor_arquitetura.mjs` | `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` |
| R2 | Zero hardcode | `auditor_hardcoded.mjs` | idem |
| R3 | Zero `any` | `auditor_typescript.mjs` | idem |
| R4 | Paridade | `auditor_paridade.mjs` → `verify_parity.ts` | idem |
| R5 | Zero chave órfã | `auditor_presets.mjs` → `verify_presets.ts` | idem |
| R6 | Contrato de valor | `validateDesign` + `tokenContractParity.test.ts` | `npx vitest run` |
| R7 | Namespace e fallback | `auditor_ghostvars.mjs` ⚠️ escopo parcial | `node …/run_audit.mjs` |
| R8 | Cobertura 1:1 | `auditor_coverage.mjs` | idem |
| R9 | Clean Code | `auditor_cleancode.mjs` | idem |
| **R10** | **Composição atômica** | **nenhum — CONDUTA** | — |
| **R11** | **Configuração × Expansão** | **nenhum — CONDUTA** | — |
| R12 | Zero-marca | `check-zero-brand.mjs` | `npm run zero-brand:check` |
| R13 | Identidade do host | testes (`HostIdentity`, `EmbeddedMode`) | `npx vitest run` |
| R14 | Barril completo | `check-barrel-parity.mjs` | `npm run barrel:check` |
| **R15** | **Nada pesado eager** | **nenhum — CONDUTA** ⚠️ violada hoje | — |
| **R16** | **Zero-gambiarra** | **nenhum — CONDUTA** | — |
| R17 | Não transcrever fonte viva | `catalog:check`/`guide:check` (só gerados) | `npm run catalog:check` |

## 3.1 Os validadores e o pipeline — quem executa o quê

> **Decisão do dono (2026-08-01): a verificação é do GATE, não da skill.** As skills de
> `.agents/skills/` **hospedam** os validadores porque são donas do domínio, mas **não os invocam**.
> Quem executa é o `package.json` hoje e o **pipeline de CI/CD** adiante. Esta tabela existe para
> quem for montá-lo: é o inventário do que já está ligado e do que ainda falta ligar.

| Validador | Cobra | Onde mora | Executado por |
| --- | --- | --- | --- |
| `run_audit.mjs` (agrega os `auditor_*.mjs`) | R1 · R2 · R3 · R4 · R5 · R7 · R8 · R9 | `.agents/skills/ui-auditoria-modulo/scripts/` | ✅ `npm run audit` |
| `verify_parity.ts` | R4 | `.agents/skills/ui-novo-componente/scripts/` | ✅ via `auditor_paridade.mjs` |
| `verify_presets.ts` | R5 | `.agents/skills/ui-auditoria-modulo/scripts/` | ✅ via `auditor_presets.mjs` |
| `check-barrel-parity.mjs` · `check-zero-brand.mjs` · `check-package-contents.mjs` | R14 · R12 · empacotamento | `scripts/` | ✅ `barrel:check` · `zero-brand:check` · `package:check` |
| `generate-component-catalog.mjs` · `generate-consumer-kit.mjs` · `generate-dev-kit.mjs` (modo `--check`) | R17 (só o gerado) | `scripts/` | ✅ `catalog:check` · `guide:check` · `dev-kit:check` |
| **`verify_theme_parity.ts`** | **R5, por tema individual** | `.agents/skills/ui-criar-tema/scripts/` | ⏳ **nenhum — vai para o pipeline** |

**A única linha ⏳ é a que importa para o CI/CD.** `verify_theme_parity.ts` valida **um** tema
contra o dicionário e hoje só roda se alguém o chamar à mão. O que **existe** em gate é o
`auditor_presets`, que cobra chave órfã em todos os temas embarcados de uma vez — cobertura
diferente, não equivalente: ele não pega tema que o consumidor escreveu, nem mede completude.

> ⚠️ **Nada nesta tabela transforma `⏳` em gate.** A coluna diz o que **é**, não o que deveria
> ser — inventar gate para preencher tabela é proibido por este repositório, e um `⏳` declarado
> vale mais que um ✅ falso. A construção dos gates está sequenciada **depois** do fechamento das
> regras; a fila completa está em [[15-divida-conhecida]] §4.

**Geradores não viram gate — e a distinção é deliberada.**
`generate_theme_template.ts` (`ui-criar-tema`) escreve arquivo em `src/`; um gerador que rodasse
em pipeline produziria commit fantasma a cada execução. Gerador é invocado pela skill, sob decisão
humana. **Validador** é invocado pelo gate, sempre. Os dois vivem lado a lado na mesma pasta de
`scripts/` e não se confundem: um escreve, o outro só lê e reprova.

# 4. O que esta spec admite sobre si mesma

Três coisas ficam registradas em voz alta, porque quem lê um contrato precisa saber onde ele é fino:

1. **Seis regras não têm gate** (R10, R11, R15, R16, e as metades sem cobertura de R13 e R17). Elas valem igual, mas dependem de revisão.
2. **Uma regra tem o escopo do gate menor que o da regra.** R7 não vê `src/styles/` — e é exatamente ali que estão os 2 usos vivos de `--sx-*`: **o gate está verde e a regra está sendo violada**. R14 tinha o mesmo defeito (não via `src/components/engines/`, onde estavam 3 componentes públicos fora do barril) e foi **corrigida em P26** — o escopo do gate foi ampliado até cobrir a regra, não o contrário.
3. **Uma regra está sendo violada pela própria lib de forma declarada** (R15 / `CustomizationPanel`), com a correção conhecida e barrada por ser breaking change.

Nenhum destes é corrigido aqui. Cada um está catalogado com `arquivo:linha` em [[01-gates-e-baseline]], que é onde a dívida mora.

# 5. Critérios de aceite

- [x] Toda regra citada em qualquer outro documento da base aparece aqui, com enunciado, porquê, exemplo e o campo "Cobrada por".
- [x] Nenhum gate foi inventado: cada comando da §3 foi executado nesta entrega e existe no repositório.
- [x] As regras sem gate estão marcadas como conduta **em negrito**, não escondidas.
- [x] As duas lacunas de escopo (R7, R14) e a violação declarada (R15) estão nomeadas com `arquivo:linha`.

# 6. Plano de testes (Quality Gate)

Esta spec é normativa: ela não adiciona teste, ela **cataloga** os que existem. A verificação de que ela continua verdadeira é:

- **Unitário / gate:** `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` no baseline documentado em [[01-gates-e-baseline]] — **não** em zero.
- **Gates de contrato:** `npm run barrel:check`, `npm run catalog:check`, `npm run zero-brand:check`, `npm run guide:check` — os quatro em verde.
- **Suíte:** `npx vitest run` **completa**. Rodar pasta a dedo esconde snapshot de terceiros quebrado; "suítes verdes" só vale para a suíte inteira.
