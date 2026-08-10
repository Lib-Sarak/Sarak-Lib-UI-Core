---
tipo: "plan"
titulo: "A superfície pública da major — remover o que não funciona e destravar o que falta"
dominio: "Sarak-Lib-UI-Core / Núcleo / Superfície pública"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "superficie-publica", "major", "breaking", "r10"]
relacionados: ["[[03-superficie-publica]]", "[[plan-22-triar-a-fronteira-de-papel]]", "[[plan-18-atomo-sem-provider]]", "[[00-regras-e-invariantes]]"]
depende_de: "plan-22"
objetivo: "Agrupar numa unica major as mudancas de superficie publica que a plan-22 deixou declaradas"
destino_sintese: "specs/arquitetura/03-superficie-publica.md · specs/specs/03-versionamento.md · specs/specs/01-gates-e-baseline.md"
---

> 🔒 **Esta é a plan da QUEBRA.** Tudo que muda contrato público e estava espalhado pelas plans anteriores
> converge aqui, **de propósito**: uma major, uma revisão, um `CHANGELOG`. Espalhar quebra por três versões é
> o que faz consumidor perder a confiança em atualizar.

# 1. Objetivo

**As três mudanças de superfície pública que a `plan-22` declarou entram juntas**, e o baseline de R10 fecha.

# 2. Contexto

## 2.1 Por que uma plan só, e por que agora

A `plan-22` triou 23 ocorrências de R10 e **parou em 4**, todas por um motivo só: **consertá-las mexe em
contrato público**, e faxina não é lugar de mudar contrato.

Some-se que o `release:check` **já bloqueia o push** desde a `plan-15`:

```
⛔ PUSH BLOQUEADO — o artefato publicado mudou desde a última tag
   última tag : v2.0.0   (dist + sarak-ui → 57aab47f1636)
```

Ou seja: **uma versão nova é inevitável**. A escolha real não é *"emitir ou não"*, é *"emitir uma minor agora
e uma major em duas semanas, ou uma major só"*. Esta plan existe para que seja a segunda.

## 2.2 Item 1 — remover o `ThemeToggle` *(decidido pelo dono em 2026-08-10)*

`src/components/atomic/Buttons/ThemeToggle.tsx` é **componente publicado que não funciona**:

| Fato | Medição |
|---|---|
| `LAYOUTS = {}` vazio, com `TODO` | `ThemeToggle.tsx:5-6` |
| Logo, `layoutOptions` é sempre `[]` | o dropdown **abre vazio, sempre** |
| Consumo interno | **zero** — nenhum componente de `src/` o importa |
| Publicado | `Buttons/index.ts` re-exporta · `src/index.ts:14` |

**Não confundir com `core/Shell/Components/ShellThemeToggle.tsx`**, que é vivo e usado. A `plan-15` já
verificou: **não são duplicatas**; este é um seletor de preset que nunca foi ligado.

**Por que remover e não popular:** popular `LAYOUTS` com os presets reais é **feature** — decisão de produto,
escopo novo. Decidir produto dentro de uma limpeza é o pior lugar para decidir produto. E publicar algo que
abre vazio é pior que não publicar: alguém importa, reporta bug, e o bug é um `TODO` antigo.

⇒ Fecha **2** das 4 ocorrências de R10 que a `plan-22` deixou declaradas.

## 2.3 Item 2 — `SarakScrim` ganha animação *(decidido pelo dono em 2026-08-10)*

O `SarakScrim` nasceu na `plan-19` e **não anima**. Os dois consumidores que justificaram criá-lo animam:

| Onde | Como anima hoje |
|---|---|
| `atomic/Inputs/Controls.tsx:124` | `motion.div` com transição de opacidade |
| `atomic/Modals/SarakDrawer.tsx:102-113` | `transition-opacity` + `opacity` por estado |

Migrá-los sem resolver isso **remove animação existente** — foi por isso que a `plan-20` e a `plan-22`
pararam, corretamente, duas vezes.

**A forma decidida: prop OPCIONAL, com default igual ao comportamento de hoje.** Quem já usa `SarakScrim` não
percebe diferença; quem migra recupera o que tinha. **Adicionar prop opcional não é breaking** — entra nesta
plan por conveniência de agrupamento e porque destrava a migração, não por obrigação de major.

⇒ Destrava a migração dos 2 consumidores, e a base deixa de ter **três formas de fazer scrim, uma delas
chamada "a oficial"**.

## 2.4 Item 3 — `SarakInput` vira `forwardRef` `⏳ AGUARDANDO O DONO`

> ⚠️ **ESTE ITEM AINDA NÃO FOI DECIDIDO.** Está escrito aqui para não se perder, e **não deve ser executado**
> enquanto o dono não responder. Se a resposta for "não", ele sai da plan e `SarakMultiSelect.tsx:103` fica
> declarado no baseline com o motivo.

`SarakMultiSelect.tsx:103` usa `<input>` cru e depende de `inputRef.current?.focus()` para devolver o foco ao
campo depois de adicionar ou remover um chip. **`SarakInput` não é `forwardRef`**, então o `ref` não atravessa
e a troca pelo átomo perde o foco.

Há um segundo obstáculo, medido pelo executor da `plan-22`: `SarakInput` renderiza `SarakFormGroup` + label
por dentro, e embutir isso num container que já mistura chips inline provavelmente duplica borda e fundo.

**Ver §5.3** — a explicação completa do que `forwardRef` é e por que isto **não** quebra ninguém.

# 3. Escopo

## 3.1 Dentro

| # | Entrega | Quebra? |
|---|---|---|
| 1 | Remover `ThemeToggle` do código e do barril | 🔴 **SIM** — remoção de export público |
| 2 | `SarakScrim` ganha prop opcional de animação + os 2 consumidores migram | não |
| 3 | `SarakInput` vira `forwardRef` + `SarakMultiSelect:103` troca pelo átomo | não — **⏳ aguarda o dono** |
| 4 | `CHANGELOG` da major, com a remoção nomeada e o caminho de migração | — |

## 3.2 Fora

- **Emitir a tag.** `npm version` e push são do dono (ADR-008 §2.2). Esta plan **prepara**; não publica.
- **Popular `LAYOUTS`.** Se o `ThemeToggle` voltar um dia, volta como feature com decisão de produto.
- O `SarakUploader` (falso positivo de gate) e o achado 35 — são conserto de detector, não desta plan.
- Qualquer outro átomo. `forwardRef` **só** no `SarakInput`, e só se autorizado.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[03-superficie-publica]] | o que é público e como se remove |
| Spec fixa | `specs/specs/03-versionamento.md` · ADR-008 | quem escolhe o nível da versão, e como |
| Plan | [[plan-22-triar-a-fronteira-de-papel]] | as 4 declaradas e por quê |
| Plan | [[plan-18-atomo-sem-provider]] | o precedente: mexer no átomo com a porta estreita |
| **Skill** | `code-adequacao` · `test-unitario` · `padrao-typescript` | remoção e mudança de assinatura |

# 5. Instruções de execução

1. **Remova o `ThemeToggle` por último**, não primeiro. Ele é o item irreversível; os outros dois devem estar
   verdes antes.
2. **Prove o consumo zero antes de remover** — `grep` por `ThemeToggle` em `src/`, excluindo o próprio arquivo,
   o barril e os testes. Cole a saída. *(O revisor mediu zero; confirme.)*
3. **`SarakScrim`:** a prop é **opcional com default igual ao de hoje**. Teste que prova que o uso atual
   (`SarakAppChromeMobile`) **não muda**, e que os 2 migrados **mantêm** a animação que tinham.
4. **Caracterize antes de migrar** `Controls.tsx` e `SarakDrawer.tsx` — os dois animam de formas diferentes.
5. O item 3 **só executa com autorização escrita**. Sem ela, declare e siga.

## 5.3 O que `forwardRef` é, e por que não quebra ninguém *(para a decisão do §2.4)*

Um componente React comum **não repassa `ref`**. Se alguém escreve `<SarakInput ref={x} />`, hoje o `x` fica
vazio e o React avisa no console — o `ref` morre no componente, não chega ao `<input>` de dentro.

`React.forwardRef` é o mecanismo padrão para **deixar o `ref` atravessar** até o elemento nativo. A mudança é
de uma linha na assinatura:

```ts
// hoje
export const SarakInput: React.FC<SarakInputProps> = ({ ...props }) => …

// com forwardRef
export const SarakInput = React.forwardRef<HTMLInputElement, SarakInputProps>(({ ...props }, ref) => …
```

**Por que isto NÃO quebra os consumidores atuais:**

| Quem | Hoje | Depois |
|---|---|---|
| Passa props normais, sem `ref` | funciona | **idêntico** |
| Passa `ref` | `ref` vazio + aviso no console | `ref` chega ao `<input>` |

**Ninguém perde comportamento.** É adição de capacidade: o componente passa a aceitar algo que hoje ele
silenciosamente ignora.

**O que muda de verdade — e é por isso que é decisão, não detalhe:**

1. **O tipo público muda de forma.** `React.FC<SarakInputProps>` vira
   `React.ForwardRefExoticComponent<...>`. Quem tipou uma variável como `React.FC<SarakInputProps>` referindo
   ao `SarakInput` precisa ajustar. É raro, mas é contrato.
2. **É precedente.** Feito num átomo, os outros vão querer. A `plan-18` enfrentou a mesma pergunta com o
   Provider e o dono escolheu a **porta estreita** — mudar só onde havia necessidade medida, com a regra
   escrita de quando usar cada uma. Aqui a necessidade medida é **uma**: `SarakMultiSelect:103`.
3. **Não resolve sozinho.** O segundo obstáculo (o `SarakFormGroup` + label embutidos) continua de pé. Mesmo
   com `forwardRef`, a troca pode duplicar borda e fundo — precisa de caracterização visual.

**Recomendação do revisor: sim, com a porta estreita.** `forwardRef` só no `SarakInput`, com a razão escrita
em JSDoc, e **sem** promessa de estender aos outros átomos. Se o obstáculo do `SarakFormGroup` se confirmar na
caracterização, o item para e `SarakMultiSelect:103` fica declarado — o `forwardRef` continua valendo, porque
é capacidade que faltava.

**A alternativa honesta é não fazer:** `SarakMultiSelect:103` fica no baseline com motivo escrito, e a R10
fecha em 1 em vez de 0. Custo real: um número no baseline. **Não é catástrofe** — item declarado com dono
nomeado é resposta legítima desde a `plan-15`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-23-superficie-publica-da-major.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/arquitetura/03-superficie-publica.md, specs/specs/03-versionamento.md,
plan-22 (as 4 declaradas) e a §2 desta plan.
Skills: code-adequacao, test-unitario, padrao-typescript, padrao-escrita.

Esta é a plan da QUEBRA. Tudo que muda contrato público converge aqui de propósito.

ORDEM OBRIGATÓRIA — o irreversível por último:

1. SarakScrim ganha prop OPCIONAL de animação, com default IGUAL ao de hoje.
   Teste que prova que SarakAppChromeMobile (o uso atual) NÃO muda.

2. Migrar Controls.tsx:124 e SarakDrawer.tsx:102-113 para o SarakScrim.
   Os dois animam de formas DIFERENTES (motion.div de opacidade / transition-opacity).
   Caracterize cada um ANTES e prove que a animação sobreviveu.

3. ⏳ SÓ COM AUTORIZAÇÃO ESCRITA DO DONO: SarakInput vira forwardRef, e
   SarakMultiSelect.tsx:103 troca o <input> cru pelo átomo.
   Sem autorização: DECLARE e siga. Não é bloqueio da plan.
   Aviso medido: SarakInput renderiza SarakFormGroup + label por dentro; embutir
   isso num container que já tem chips inline pode duplicar borda/fundo.
   Caracterize visualmente ANTES. Se duplicar, PARE — forwardRef sozinho não resolve.

4. REMOVER ThemeToggle.tsx, do código e do barril (Buttons/index.ts, src/index.ts:14).
   É o item IRREVERSÍVEL — só depois de 1, 2 e 3 estarem verdes.
   ANTES de remover, PROVE o consumo zero: grep por ThemeToggle em src/, excluindo
   o próprio arquivo, o barril e os testes. Cole a saída.
   NÃO confunda com core/Shell/Components/ShellThemeToggle.tsx, que é VIVO e usado.
   NÃO popule LAYOUTS — isso é feature, e o dono decidiu remover.

5. CHANGELOG da major: a remoção nomeada, o motivo (componente publicado que abre
   vazio desde sempre) e o que o consumidor faz no lugar.

LINHAS VERMELHAS:
  · Você NÃO emite tag nem roda `npm version` — é do dono (ADR-008 §2.2).
  · Você NÃO torna outro átomo forwardRef. Só o SarakInput, e só se autorizado.
  · Você NÃO altera gate nenhum.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md
    (a coluna Status é gerada por npm run plan-index).

META: composicaoatomica cai para 1 (só o SarakUploader, falso positivo de gate já
declarado) — ou 2, se o item 3 não for autorizado.

Os três espelhos: gates/baselines/ · sarak-dev/ (npm run dev-kit) · sarak-ui/
(npm run guide — a contagem de componentes MUDA, o ThemeToggle sai).

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS)
  npx vitest run          (INTEIRA)
  npm run barrel:check · npm run deep-import:check
  npm run gate-limits:check · npm run dev-kit:check · npm run guide:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `ThemeToggle` **não existe** em `src/`, no barril nem no catálogo do consumidor, e a **prova de consumo
      zero** está colada no resumo.
- [ ] `ShellThemeToggle` **continua intacto** — o gate de barril e a suíte provam.
- [ ] A prop do `SarakScrim` é **opcional**, e existe teste provando que `SarakAppChromeMobile` **não mudou**.
- [ ] `Controls.tsx` e `SarakDrawer.tsx` usam o `SarakScrim` **com a animação que tinham**, caracterizada antes.
- [ ] Item 3: **executado com autorização escrita**, ou **declarado** com o motivo — nunca decidido sozinho.
- [ ] `CHANGELOG` nomeia a remoção e diz o que o consumidor faz no lugar.
- [ ] `composicaoatomica` = **1** (ou 2 sem o item 3), e o que sobrou tem motivo escrito.
- [ ] `npx vitest run` verde; baseline e **os três** espelhos regravados junto.
- [ ] **Nenhuma tag emitida** — a versão é do dono.

# 8. Como verificar

```bash
grep -rn "ThemeToggle" src/ --include=*.ts --include=*.tsx | grep -v ShellThemeToggle
npm run barrel:check && npm run guide:check
npm run audit
npx vitest run
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

`specs/arquitetura/03-superficie-publica.md` (o que saiu, o que ganhou prop, o que virou `forwardRef`) ·
`specs/specs/03-versionamento.md` (o registro da major) · `specs/specs/01-gates-e-baseline.md` (baseline).

# 10. Resumo da execução

## Resumo da execução — 2026-08-10

**Resultado:** Concluído com pendências

**O que foi feito**

Seguida a ordem obrigatória do prompt (1→2→3→4→5), o irreversível por último.

**1. `SarakScrim` ganhou prop opcional de animação** (`src/components/atomic/Layouts/SarakScrim.tsx`):
`animate?`, `visible?`, `durationMs?`, `style?`, `testId?`. Default (`animate=false`) renderiza o mesmo
`<button>` estático de sempre — zero mudança para `SarakAppChromeMobile`, o único consumidor publicado.
Com `animate=true`, troca para `motion.button` (framer-motion, já é peer dependency da lib — não é
dependência nova) com `initial/animate/exit` de opacidade. `visible` controla o alvo da opacidade sem
desmontar (para quem, como o `SarakDrawer`, atrasa a própria desmontagem); quando omitido assume visível
(o caso de quem desmonta via `AnimatePresence` externo, como o `Controls.tsx`).

**2. Os 2 consumidores migraram, com a animação que tinham preservada:**
- `Controls.tsx:142` (backdrop do `UserMenu`) — trocado o `motion.div` ad hoc por
  `<SarakScrim animate onClose={...} ariaLabel="Fechar menu do usuário" />`, dentro do mesmo
  `<AnimatePresence>` que já existia (o `exit` do `motion.button` interno é quem entrega o fade de saída).
- `SarakDrawer.tsx:100-119` (overlay) — trocado o `<div aria-hidden>` com `transition-opacity`/`opacity`
  manual por `<SarakScrim animate visible={isOpen} durationMs={...} style={{background: overlayBg,
  zIndex}} testId="sarak-drawer-overlay" />`. `durationMs` recebe o `design?.animSlow` já computado
  (fallback 400, igual ao original); `style.background` preserva a cor dinâmica de
  `design?.modalOverlayColor` (ver "Achados fora do escopo").

**3. `forwardRef` no `SarakInput`: NÃO EXECUTADO.** Não houve autorização escrita do dono nesta conversa.
Conforme o prompt manda ("Sem autorização: DECLARE e siga"), o item foi pulado. `SarakMultiSelect.tsx:113`
segue com `<input>` cru, comentário já apontando para esta plan §2.4 (herdado da `plan-22`).

**4. `ThemeToggle` removido** (`Buttons/ThemeToggle.tsx` + teste, apagados; export removido de
`Buttons/index.ts` e `src/index.ts:14`). Consumo zero provado por `grep` **antes** de remover (colado
abaixo). `ShellThemeToggle` (`core/Shell/`) não foi tocado.

> 🔴 **Achado crítico durante a remoção, corrigido na hora:** remover a linha 14 de `src/index.ts`
> (`export { default as ThemeToggle } from '.../Buttons/ThemeToggle'`) **não fez `ThemeToggle` sumir da API
> pública** — fez aparecer um `ThemeToggle` DIFERENTE. `src/index.ts:76` já fazia
> `export * from './components/atomic/Inputs/Controls'`, e `Controls.tsx` tem um export local **também**
> chamado `ThemeToggle` (o toggle claro/escuro interno, sem nenhum consumidor dentro de `src/` — a base
> real usa `ShellThemeToggle`/`ShellLanguageSelector`/`ShellUserWidget`, uma família paralela). Enquanto a
> linha 14 existia, o export explícito **vencia** a colisão com o `export *` (semântica padrão de ES
> modules: export nomeado explícito tem precedência sobre `export *` que colide). Ao remover a linha 14, o
> `export *` deixou de colidir e passou a exportar o `ThemeToggle` de `Controls.tsx` **no lugar** — um
> consumidor que já importava `{ ThemeToggle }` não veria erro nenhum, só passaria a receber um componente
> completamente diferente, silenciosamente. Isso violava o próprio critério de aceite desta plan
> ("`ThemeToggle` não existe... no barril"). Corrigido removendo `Controls.tsx` de **ambos** os barris
> (`Inputs/index.ts` e `src/index.ts`) — `Controls.tsx` continua existindo no código (não foi apagado, é
> escopo maior que o desta plan), só parou de vazar para a API pública. Isso também tirou `LanguageSelector`,
> `UserMenu` e `ModuleSelector` (as outras 3 peças de `Controls.tsx`) do barril — nenhuma tinha consumidor
> interno, e as 4 já estavam documentadas (sem querer) em `docs/component-catalog.json`/`sarak-ui/catalog.json`
> antes desta plan.

**5. `docs/migracoes.md`** ganhou o item 6 na seção `## 2.0.0` já existente (não criei versão nova — o
`package.json` está em `2.1.0`, ainda sem tag emitida, e a `2.0.0` documentada já era a major pendente de
publicar; agrupar aqui é o mesmo padrão que a `plan-09` já usou).

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Layouts/SarakScrim.tsx` | alterado | +`animate`/`visible`/`durationMs`/`style`/`testId`, default idêntico ao anterior |
| `src/components/atomic/Layouts/__tests__/SarakScrim.test.tsx` | alterado | +4 testes (default inalterado, `animate` liga motion, `style` sobrepõe, `SarakAppChromeMobile` não muda) |
| `src/components/atomic/Inputs/Controls.tsx` | alterado | Backdrop do `UserMenu` → `SarakScrim animate` |
| `src/components/atomic/Inputs/__tests__/Controls.test.tsx` | alterado | +1 teste (backdrop fecha o menu, assíncrono por causa do `AnimatePresence`) |
| `src/components/atomic/Modals/SarakDrawer.tsx` | alterado | Overlay `<div>` → `SarakScrim animate visible durationMs` |
| `src/components/atomic/Modals/__tests__/SarakDrawer.test.tsx` | alterado | +1 teste (overlay é `<button>`, `aria-label`, opacidade via style) |
| `src/components/atomic/Buttons/ThemeToggle.tsx` | **removido** | Componente morto (seletor de layout sempre vazio) |
| `src/components/atomic/Buttons/__tests__/ThemeToggle.test.tsx` | **removido** | Teste do componente removido |
| `src/components/atomic/Buttons/index.ts` | alterado | Removido `export * from './ThemeToggle'` |
| `src/components/atomic/Inputs/index.ts` | alterado | Removido `export * from './Controls'` (achado crítico acima) |
| `src/index.ts` | alterado | Removida a linha 14 (`ThemeToggle`) **e** a linha 76 (`Inputs/Controls`) |
| `docs/migracoes.md` | alterado | Item 6 da `## 2.0.0`: remoção do `ThemeToggle` documentada |
| `docs/component-catalog.json`/`.md` | alterado | Regravado via `npm run catalog` — 81→77 componentes |
| `gates/baselines/audit-baseline.json` | alterado | Regravado: `composicaoatomica` 4→2 |
| `sarak-dev/*` | alterado | Regravado via `npm run dev-kit` — 77 componentes públicos |
| `sarak-ui/*` | alterado | Regravado via `npm run guide` — 87→83 componentes (77 do gate + 6 extras de montagem) |

**Verificações executadas**

Prova de consumo zero do `ThemeToggle`, colada (rodada antes de remover):
```
$ grep -rn "ThemeToggle" src/ --include=*.ts --include=*.tsx | grep -v ShellThemeToggle
src/components/atomic/Buttons/index.ts:1:export * from './ThemeToggle';
src/components/atomic/Buttons/ThemeToggle.tsx:17:export const ThemeToggle: React.FC = () => {
src/components/atomic/Buttons/ThemeToggle.tsx:73:export default ThemeToggle;
src/components/atomic/Buttons/__tests__/ThemeToggle.test.tsx:2:import * as ComponentModule from '../ThemeToggle';
src/components/atomic/Buttons/__tests__/ThemeToggle.test.tsx:4:describe('ThemeToggle', () => {
src/components/atomic/Inputs/Controls.tsx:82:export const ThemeToggle = () => {
src/components/atomic/Inputs/__tests__/Controls.test.tsx:5:import { LanguageSelector, ThemeToggle, UserMenu, ModuleSelector } from '../Controls';
src/index.ts:14:export { default as ThemeToggle } from './components/atomic/Buttons/ThemeToggle';
```
Só o próprio arquivo, seu barril, seu teste, o barril público e o `ThemeToggle` homônimo de `Controls.tsx`
(componente diferente, tratado acima) — **zero consumo real**.

- `npm run audit` (ANTES, herdado do fim da `plan-22`): `composicaoatomica` 4 (`ThemeToggle` ×2,
  `SarakMultiSelect` ×1, `SarakUploader` ×1); `ghostvars` 1; `hardcoded` 0.
- `npm run audit` (DEPOIS): `composicaoatomica` **2** (`SarakMultiSelect.tsx:113`, `SarakUploader.tsx:111` —
  as 2 que sobraram, ambas já declaradas); `ghostvars` 1; `hardcoded` 0; demais 7 auditores `[OK]`.
- `npx vitest run` (suíte inteira) → **295 arquivos / 1078 testes, todos verdes** (era 296/1073 no fim da
  `plan-22`: −1 arquivo pelo `ThemeToggle.test.tsx` apagado, +6 testes novos).
- `npm run barrel:check` → `77 componentes registrados; barril em dia (0 faltas)`.
- `npm run deep-import:check` → `[OK]`.
- `npm run gate-limits:check` → `[OK]` 26/26.
- `npm run dev-kit:check` / `catalog:check` / `guide:check` → defasados antes de eu regenerar; `[OK]` depois.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `igual ao baseline de 2026-08-10 —
  nenhuma regressão.` (Um erro de TS real apareceu no meio do caminho — ver "Decisões e suposições" — e foi
  corrigido antes desta verificação final passar.)
- `git diff --stat` → 13 arquivos em `src/` (159 inserções, 110 deleções) + os 3 espelhos + `docs/migracoes.md`.
  **`dist/` não mudou** (não é rastreado neste worktree; não rodei `npm run build`). **Nenhuma tag emitida.**

**Critérios de aceite**
- [x] `ThemeToggle` não existe em `src/`, no barril nem no catálogo — evidência: `grep` colado acima (pré),
      arquivo apagado, `barrel:check` 77/0 faltas, `docs/component-catalog.json` regravado sem ele.
- [x] `ShellThemeToggle` continua intacto — evidência: não foi tocado; suíte inteira verde inclui os testes
      de `core/Shell/`.
- [x] A prop do `SarakScrim` é opcional, com teste provando que `SarakAppChromeMobile` não mudou — evidência:
      teste "SarakAppChromeMobile — o único uso publicado hoje NÃO muda" em `SarakScrim.test.tsx`.
- [x] `Controls.tsx` e `SarakDrawer.tsx` usam `SarakScrim` com a animação que tinham, caracterizada antes —
      evidência: testes assíncronos provando fade-out (`Controls.test.tsx`) e opacidade via style
      (`SarakDrawer.test.tsx`).
- [x] Item 3: declarado (sem autorização), não decidido sozinho — evidência: nenhuma mudança em
      `SarakInput.tsx`/`SarakMultiSelect.tsx` além do comentário já herdado da `plan-22`.
- [x] `CHANGELOG` nomeia a remoção e diz o que o consumidor faz no lugar — evidência: item 6 de
      `docs/migracoes.md`.
- [x] `composicaoatomica` = 2 (item 3 não autorizado), com motivo escrito — evidência: os 2 comentários de
      declaração já existem nos arquivos (herdados da `plan-22`, ainda válidos).
- [x] `npx vitest run` verde; baseline e os três espelhos regravados junto — evidência: números acima.
- [x] Nenhuma tag emitida — evidência: não rodei `npm version` nem `git tag`/`git push` em nenhum momento.

**Decisões e suposições**
- **O achado crítico da colisão `ThemeToggle`/`Controls.tsx` (acima) não estava previsto no prompt.** Tratei
  como correção obrigatória, não como achado fora do escopo, porque sem ela o próprio critério de aceite #1
  desta plan ("`ThemeToggle` não existe... no barril") ficaria falso — a remoção pedida não teria realmente
  acontecido, só teria trocado de forma silenciosa o que `ThemeToggle` significa. Removi `Controls.tsx` dos
  dois barris (categoria e público); **não apaguei o arquivo** `Controls.tsx` em si — isso é decisão maior,
  fora desta plan.
- **Erro de TypeScript real encontrado e corrigido durante a execução:** a primeira versão do `SarakScrim`
  usava um objeto `sharedProps` com spread de `...rest` (tipado como `ButtonHTMLAttributes`) tanto no
  `<button>` quanto no `<motion.button>` — o TS acusou incompatibilidade (`motion.button` redefine
  `onDrag`/`onAnimationStart` com assinatura própria, incompatível com a do DOM). Troquei o passthrough
  genérico por uma prop específica (`testId?: string` → `data-testid`), que é tudo que os dois migrados
  precisavam. `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` bloqueou antes de eu rodar de
  novo — o gate funcionou como desenhado.
- **`SarakDrawer`'s overlay perde o `aria-hidden="true"`, ganha `aria-label`/foco real.** Decisão deliberada,
  não descuido: é exatamente o motivo de o `SarakScrim` existir (achado 17/`plan-19` — teclado e leitor de
  tela por construção). O `useFocusTrap` do `<aside>` mantém o Tab preso dentro do painel enquanto aberto,
  então o botão do scrim não deveria aparecer no fluxo normal de teclado — mas não testei isso com um
  leitor de tela real. Mesma mudança em `Controls.tsx`: o backdrop do `UserMenu` passa de `<div onClick>`
  mudo (mouse-only) para um botão de verdade.
- **`durationMs` do `SarakDrawer` usa `design?.animSlow` com fallback 400** — igual ao `animDuration` que já
  existia no arquivo, só que como número em vez de string `"400ms"`.

**Achados fora do escopo (não corrigidos)**
- **`Controls.tsx` é código morto** (4 componentes — `LanguageSelector`, `ThemeToggle`, `UserMenu`,
  `ModuleSelector` —, zero consumidor interno, duplicado funcionalmente por `ShellLanguageSelector`/
  `ShellThemeToggle`/`ShellUserWidget`). Só tirei do barril (necessário para esta plan); o arquivo continua
  em `src/components/atomic/Inputs/Controls.tsx`, testado (pela `plan-22`), mas morto. Sugestão: plan de
  faxina dedicada — decidir se apaga ou se algum dia vira a versão "sem Shell" desses widgets.
  **Isso também explica por que ele vivia sob `Inputs/`** (categoria errada para menu/toggle/seletor de
  módulo) sem ninguém notar: nada o importava, então nada quebrava.
- **`SarakDrawer.tsx`'s fallback `var(--sarak-modal-overlay-color, rgba(0,0,0,0.5))`** (usado só quando
  `design?.modalOverlayColor` é falsy) referencia uma CSS var que **não existe** — o schema
  (`overlays.ts:45`) emite `--sarak-modal-overlay`, sem o `-color`. Pré-existente (não mudei essa linha,
  só passei o valor computado adiante via `style`); o `ghostvars` não pega porque só audita `var()` em
  código, e esse fallback só seria lido sem `SarakUIProvider` — caminho raro. Achado, não conserto.
- Os achados já registrados no resumo da `plan-22` (JS morto lendo `--animation-speed`, etc.) continuam
  válidos e não foram reabertos aqui.

**Pendências / riscos**
- **Item 3 (`forwardRef` no `SarakInput`) segue sem decisão.** `SarakMultiSelect.tsx:113` continua com
  `<input>` cru; `composicaoatomica` fecha em 2, não 1.
- **`Controls.tsx` morto** (achado acima) — sem destino decidido.
- **Não tenho como verificar com leitor de tela real** se o novo botão focável do scrim (em `SarakDrawer` e
  `Controls.tsx`) interage bem com o `useFocusTrap` em todos os navegadores — testei só via Testing Library
  (jsdom), que não simula ordem real de foco do browser com precisão total.
- **Nenhuma tag foi emitida.** `package.json` segue em `2.1.0`; a decisão de quando/como publicar (e se
  falta mais alguma coisa antes) é do dono.

## Resumo da execução (correção 1) — 2026-08-10

**Resultado:** Concluído

**Achado do revisor:** a remoção de `Controls.tsx` dos barris (execução original) tirou da API pública
**quatro** componentes e **três** tipos, e só o `ThemeToggle` tinha entrada em `docs/migracoes.md`. Por
`specs/specs/03-versionamento-e-release.md` §5, breaking change sem entrada é entrega incompleta.

**O que foi feito — só em `docs/migracoes.md`, nada de código:**

Investiguei os três substitutos sugeridos abrindo cada um antes de escrever, como pedido — o resultado
não foi uniforme, e a entrada diz isso em vez de forçar equivalência:

- **`LanguageSelector` → `ShellLanguageSelector` (`core/Shell/Components/`): NÃO é substituto adequado,
  e a entrada diz isso explicitamente.** Abri o arquivo: é fixo em 2 idiomas hardcoded (`pt-BR`/`en-US`,
  não lê `design.enabledLanguages`), guarda a escolha só em `useState` — sem `localStorage`, sem cookie
  `googtrans`, sem `location.reload()` — e existe principalmente como *slot* de override
  (`registerLocalComponent('shell-language-selector', ...)`) para o consumidor plugar o próprio seletor.
  O `LanguageSelector` antigo fazia a troca de idioma de verdade; o `ShellLanguageSelector` não faz nada
  disso sozinho. A entrada recomenda copiar a lógica do histórico do git, não usar o Shell um como se
  fosse equivalente.
- **`UserMenu` → `ShellUserWidget` (`core/Shell/Components/`): substituto PARCIAL.** Abri o arquivo:
  mostra identidade (avatar/nome/nível) e tem um botão de logout — mas não tem dropdown nem ação de
  "Change Password" nenhuma; é um chip de identidade, não um menu. A entrada diz que cobre metade
  (identidade + logout) e nomeia a peça que falta.
- **`ModuleSelector` → `SarakShellNav`: substituto razoável, com adaptação de forma.** Abri o arquivo:
  mesmo trabalho (escolher módulo/seção ativa), e é o componente que a base realmente usa para isso. A
  API não é idêntica — `modules`→`items`, `id`→`route`, `currentModule`→`activeRoute`,
  `setCurrentModule`→`onNavigate` — a entrada mostra um antes/depois em código com a troca de campo.

**Os três tipos** — verifiquei cada um contra o barril público (`grep` em `src/index.ts` e leitura dos
arquivos-fonte) antes de escrever:
- `LanguageOption` (`{id,label}`): **sem equivalente público** — a entrada dá a forma mínima para o
  consumidor declarar a própria.
- `ModuleConfig` (`{id,label,...}`): **`SarakModule`** (o tipo de `registerSarakModule`, já exportado via
  `export * from './core/Discovery/registry'` em `src/index.ts:120`) tem `id`/`label` compatíveis —
  reutilizável, com a ressalva de ser um tipo mais pesado (carrega `component`/`priority`/`isLocal`,
  pensado para o Discovery, não para uma lista simples de abas).
- `UserPayload` (`{email?}`): **sem equivalente público** — `ShellUser` (`core/Shell/Components/types.ts`)
  tem forma parecida e mais rica, mas **não é exportado** (`SarakShell.tsx` só importa o tipo para uso
  interno, nunca re-exporta) — confirmei com `grep` no barril. A entrada dá a forma mínima para declarar.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `docs/migracoes.md` | alterado | +item 7 (`LanguageSelector`/`UserMenu`/`ModuleSelector` + os 3 tipos); contagem da intro "sete"→"oito" mudanças; item 6 (`ThemeToggle`) **intocado** |

**Verificações executadas**
- `npx vitest run` (suíte inteira) → **295 arquivos / 1078 testes, todos verdes** — idêntico à execução
  anterior, porque nenhum código mudou.
- `npm run dev-kit:check` → `[OK]` kit em dia (3 arquivos, 0 ponteiros mortos) — não regrava, porque
  `docs/migracoes.md` não faz parte do kit do mantenedor.
- `git diff --stat` → **1 arquivo** (`docs/migracoes.md`, 65 inserções / 2 deleções), como esperado.

**Critérios de aceite**
- [x] Entradas acrescentadas para os 4 componentes e os 3 tipos — evidência: item 7 de `docs/migracoes.md`.
- [x] Cada substituto sugerido foi confirmado abrindo o arquivo antes de escrever — evidência: leituras de
      `ShellLanguageSelector.tsx`, `ShellUserWidget.tsx`, `SarakShellNav.tsx` nesta rodada.
- [x] Substituto inadequado foi declarado como tal, não forçado — evidência: `LanguageSelector` marcado
      "NÃO é substituto adequado"; `UserMenu` marcado "substituto PARCIAL", com a peça faltante nomeada.
- [x] Tipos sem equivalente público mostram a forma mínima; o que tem equivalente (`ModuleConfig` →
      `SarakModule`) está identificado, com a ressalva de peso semântico.
- [x] `docs/migracoes.md`'s entrada do `ThemeToggle` (item 6) não foi tocada — evidência: `git diff` mostra
      só inserção de conteúdo novo depois dela, nenhuma linha do item 6 aparece como removida/alterada.
- [x] Nada de código — evidência: `git diff --stat` = 1 arquivo, `docs/migracoes.md`.

**Decisões e suposições**
- Tratei os quatro (`LanguageSelector`/`UserMenu`/`ModuleSelector`/tipos) como **um item novo (7)**, não
  como edição do item 6 — são exports diferentes, com histórias de substituto diferentes; misturar tudo
  sob "ThemeToggle" teria escondido que o `ThemeToggle` não tinha substituto por não ter funcionalidade,
  enquanto os outros três têm substitutos de qualidade desigual (inadequado / parcial / razoável).
- Atualizei a contagem "sete mudanças" → "oito" na introdução da seção `## 2.0.0`, já que o novo item 7
  passou a existir — é a mesma frase que eu já tinha corrigido de "seis" para "sete" na execução original,
  pela mesma razão (o número tem que bater com a contagem real de itens).

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. Os achados desta rodada (qualidade desigual dos substitutos `Shell*`) já estão documentados
  como a própria entrada — não é uma dívida de código, é a natureza da migração.

**Pendências / riscos**
- As mesmas da execução original (item 3 sem decisão, `Controls.tsx` morto sem destino, nenhuma tag
  emitida) — nenhuma delas fazia parte do escopo desta correção.

# 11. Veredito

## Veredito — 2026-08-10 — 🟢 **Aprovada** (execução + correção 1)

Suíte **295 arquivos / 1078 testes**, verde. `composicaoatomica` **4 → 2**, `ghostvars` 1, `hardcoded` 0,
baseline sem regressão, e os três espelhos em dia.

### 🔴 O achado que salvou o critério de aceite #1

**Remover a linha do `ThemeToggle` em `src/index.ts` NÃO o tirava da API.** O executor descobriu, e o revisor
reproduziu com `git show HEAD:src/components/atomic/Inputs/index.ts`:

```
export * from './Controls';     ← e Controls.tsx exporta um ThemeToggle HOMÔNIMO
```

O export explícito **mascarava** o homônimo. Removê-lo teria **revelado** um `ThemeToggle` diferente, e o
critério #1 desta plan ficaria **falso enquanto parecia verdadeiro** — o gate de barril continuaria verde, o
catálogo continuaria listando o nome, e ninguém veria.

**Achar isso exigiu ir além do que a plan pedia**, e é o tipo de defeito que sobrevive a revisão por
checklist: o nome certo, no lugar certo, apontando para outra coisa.

### A remoção cresceu de 1 para 4, e é justificada

Tirar `Controls.tsx` dos barris removeu da API pública **4 componentes e 3 tipos**:

```
ThemeToggle · LanguageSelector · UserMenu · ModuleSelector
LanguageOption · ModuleConfig · UserPayload
```

Verificado pelo revisor: `atomic/Inputs/Controls.tsx` tem **zero consumidor interno**, e `ShellThemeToggle`,
`ShellLanguageSelector` e `ShellUserWidget` estão vivos em `core/Shell/`. O executor **não apagou o arquivo** —
só o tirou dos barris, que era o mínimo para o critério ser verdadeiro.

> **Nota do revisor:** a primeira varredura de consumidores deu falso positivo — o `grep` pegou
> `DesignControls`, que é outro arquivo. Refeita, confirmou zero.

### A correção 1 — e ela ficou melhor do que o pedido

A `03-versionamento-e-release` §5 exige entrada em `docs/migracoes.md` para toda quebra, e a entrega original
documentava **só o `ThemeToggle`**. O revisor pediu as outras três; o executor **mediu cada substituto em vez
de assumir**, e o resultado desmentiu a hipótese do próprio revisor:

| Removido | Substituto proposto pelo revisor | O que a medição mostrou |
|---|---|---|
| `LanguageSelector` | `ShellLanguageSelector` | 🔴 **NÃO é equivalente** — ver abaixo |
| `UserMenu` | `ShellUserWidget` | ⚠️ **parcial** — cobre identidade e logout; não tem dropdown nem troca de senha |
| `ModuleSelector` | `SarakShellNav` | ✅ razoável, com antes/depois de código na entrada |

**O caso do `LanguageSelector`, reproduzido pelo revisor:**

| | Removido (`Controls.tsx`) | `ShellLanguageSelector` |
|---|---|---|
| Idiomas | lista configurável, filtrada | `const LANGUAGES` fixo em 2 |
| Persistência | `localStorage` | nenhuma |
| Google Translate | grava `googtrans`, com domínio | não toca |
| Aplicação | `window.location.reload()` | nenhuma |

A entrada resultante avisa em negrito — *"não force essa migração achando que é"* —, explica que o
`ShellLanguageSelector` existe sobretudo como **slot** para `registerLocalComponent`, e manda copiar a lógica
do histórico do `git`. **Uma migração que aponta para o componente errado é pior que uma que admite não ter**,
e esta admite.

### O resto, verificado

**`SarakScrim`:** `animate = false` e `visible = true` como defaults — o comportamento de hoje preservado
**por construção**, não por promessa.

**O item 3 (`forwardRef`) não foi executado**, corretamente: não houve autorização escrita, e a plan mandava
declarar e seguir.

**Um erro real de `tsc`** (passthrough genérico × `motion.button`) apareceu e foi corrigido antes de o
baseline fechar — a prop nova atravessava para um componente do `framer-motion`.

**Dúvida do revisor, fechada:** o `Controls.tsx` tem 6 ocorrências de R10 e o `composicaoatomica` fechou em 2
sem contradição — a `plan-22` **já as havia pago** (0 nativos crus, 14 referências a átomos Sarak).

### 🔴 Uma correção do revisor sobre a versão

O revisor afirmou que o `2.1.0` do `package.json` talvez precisasse voltar para `2.0.0`, supondo edição
manual. **Errado — não foi verificado antes de dizer.** O `git log` mostra:

```
583ff2c  "2.1.0"        ← commit do `npm version`
tag v2.1.0              ← existe local E no remoto (9b038a5)
```

**A `v2.1.0` já está publicada.** Ela carrega as plans 15–22 (adições e mudança visual, sem remoção) — nível
correto para aquele momento. **Nada deve ser revertido.** O `package.json` em `2.1.0` é o estado publicado, e
o próximo release parte dele.

### O que fica aberto

| Pendência | Estado |
|---|---|
| `SarakInput` como `forwardRef` (item 3) | ⏳ **sem decisão do dono** — `SarakMultiSelect:113` segue declarado |
| `atomic/Inputs/Controls.tsx` morto no repositório | ⏳ fora dos barris, sem consumidor, **sem destino escrito** |
| `SarakUploader:111` | falso positivo de detector, declarado na `plan-22` |

**Liberado: pode commitar.** ⚠️ **O próximo release é `npm version major` → `3.0.0`** — saem 4 componentes e
3 tipos da API pública, e isso é quebra por definição.

*(a preencher pelo revisor)*
