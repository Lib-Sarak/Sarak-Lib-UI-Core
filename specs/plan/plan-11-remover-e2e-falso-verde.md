---
tipo: "plan"
titulo: "Remover o E2E que sai verde sem executar — a capacidade volta quando houver onde rodá-la"
dominio: "Sarak-Lib-UI-Core / Qualidade / Testes"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "testes", "e2e", "falso-verde", "divida"]
relacionados: ["[[11-testes-e-cobertura]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "—"
objetivo: "Remover o aparato de E2E que produz verde falso, deixando a capacidade declarada como adiada"
destino_sintese: "specs/specs/11-testes-e-cobertura.md · specs/specs/15-divida-conhecida.md"
---

> 🎯 **Verde falso é pior que vermelho.** Vermelho manda alguém olhar; verde sem execução produz confiança
> sem lastro, e é **indistinguível de sucesso**.

# 1. Objetivo

**Remover o aparato de E2E**, que hoje existe sem rodar em automação nenhuma. A capacidade fica **declarada
como adiada** — não some do registro, some do repositório.

# 2. Contexto

## 2.1 A decisão do dono *(2026-08-11)*

> *"Remover os testes e2e — ficarão para etapa posterior."*

É a **segunda vez** que a decisão é tomada: em 2026-08-10, ao revisar as regras descumpridas na prática, o
dono já havia respondido *"E2E — Remova"*. A `plan-19` executou metade — deletou o `playwright.config.ts`,
que era **arquivo órfão** apontando `testDir: './e2e'` para uma pasta inexistente. **Esta plan fecha a outra
metade.**

## 2.2 O que existe hoje, medido

| Artefato | Estado |
|---|---|
| `playwright-ct.config.ts` | existe |
| `npm run test-ct` | existe, **não é invocado por nenhum pipeline** |
| `@playwright/test` · `@playwright/experimental-ct-react` | duas dependências de dev |
| `src/core/Provider/__e2e__/` | `EmbeddedNoLeak.spec.tsx` · `EmbeddedIsland.story.tsx` |
| `src/features/DesignEngine/__e2e__/` | `Boot.spec.tsx` · `RealtimeInjection.spec.tsx` |

**Nada disso roda.** Algumas specs ainda exigem `npm run build` antes, o que as torna inviáveis fora de uma
árvore descartável.

## 2.3 🔴 O que se PERDE, e precisa ficar escrito

Remover não é gratuito, e a spec fixa tem de registrar o custo em vez de fingir que não existe:

**`EmbeddedNoLeak.spec.tsx` é a única verificação do não-vazamento do modo embarcado.** A **R24** — o CSS da
lib não vaza no host — passa a depender de **conferência manual**. Isso **não** rebaixa a regra sozinho: quem
decide o marcador dela é a síntese, com a medição na mão.

> ⚠️ **Declare, não silencie.** A [[11-testes-e-cobertura]] precisa dizer, com todas as letras, que **não há
> teste de ponta a ponta nesta base** — hoje ela sugere o contrário pela mera presença dos arquivos.

🔴 **E há uma segunda perda, que esta plan não previa — acrescentada pelo revisor em 2026-08-18.** Remover
`@playwright/test` tira do repositório **a única ferramenta capaz de medir comportamento em navegador real**,
e isso não é hipótese: **na revisão da `plan-48`, dois dias atrás, foi exatamente com ela que eu reproduzi a
medição de `grid-template-columns` em Chromium** — o critério que aquela plan marcava como eliminatório
(*"sem ela, o critério não é atendido"*).

Consequência concreta: **a próxima plan cujo aceite dependa de medição em browser não terá com o que provar,
nem para o executor nem para o revisor.** As `@min-[…]` de container query ([[07-responsividade-e-multidispositivo]]
§6.1) são a família mais provável — o próprio aviso daquela seção diz que *"o desenho se prova em navegador
real"*.

**Isto NÃO reabre a decisão do dono** (removida é removida, e a decisão foi tomada duas vezes). É custo a
declarar junto com o resto: quem precisar medir em browser depois disto **reinstala a ferramenta pontualmente
ou espera a CI**, e a spec fixa tem de dizer isso em vez de deixar a próxima pessoa descobrir no meio de um
aceite.

## 2.4 Dois achados que esta plan carregava e que já não são dela

| Achado | Situação |
|---|---|
| **17** — o `testDir` para o vazio | ✅ **fechado** pela `plan-19` (o config era órfão e foi deletado) |
| **18** — medição de contraste WCAG AA | **núcleo respondido**: o `auditor_contraste` (R31) mede **36 pares em 23 temas, nos dois modos**. O que resta — medir contraste no **DOM renderizado** (axe-core sobre o conjunto atômico) — é capacidade **diferente e maior**, e é decisão do dono se vira achado próprio |
| **26** — automação de `install` de verdade | **não é E2E**: é ciclo de instalação/atualização do consumidor. **Migra para a órbita da [[plan-10-ciclo-atualizacao]]** |

# 3. Escopo

## 3.1 Dentro

1. **Remover** `playwright-ct.config.ts`, o script `test-ct` e as duas dependências de Playwright.
2. **Remover** os 4 arquivos de `__e2e__/` — as duas pastas ficam vazias e saem.
3. **Registrar NO RESUMO** o texto da ausência, pronto para transporte: não há E2E nesta base, e o
   não-vazamento do modo embarcado (**R24**) passa a ser conferência manual.
4. **Registrar NO RESUMO** o adiamento a ser numerado em [[15-divida-conhecida]] **§4** (implementação
   posterior) — não §3: pela §8 daquela spec, *"verificação que nunca existiu não é dívida"*.
5. **Registrar NO RESUMO** que o **achado 26** vai para o roteamento da `plan-10`.

> 🔧 **Os itens 3, 4 e 5 foram REESCRITOS em 2026-08-18 pelo revisor.** Eles mandavam o executor **editar**
> `11-testes-e-cobertura.md` e `15-divida-conhecida.md` — que o [[00-prompt-executor]] §7 item 3 proíbe
> categoricamente (*"NUNCA crie nem edite outra spec"*). O executor **registra no resumo**; quem transporta
> para a spec fixa é o **revisor**, por `spec-atualizar`, depois do commit.
>
> 🔴 **É a QUARTA vez que este defeito aparece** — as outras três estão nomeadas na `plan-46` §2.5 (plans 39,
> 41 e a própria 46). O padrão é meu, não do executor: escrevo o destino da síntese e escorrego para
> "o executor escreve lá". **A ausência declarada continua sendo a entrega** — muda só quem segura a caneta.

## 3.2 Fora

- ⛔ **Escrever jornada nova de E2E.** É o oposto desta plan.
- ⛔ Trocar o Playwright por outro runner "já que vamos mexer". Adiar é adiar.
- ⛔ Rebaixar o marcador da **R24** por conta própria — é a síntese, com medição, não o executor.
- ⛔ Mexer em componente para compensar a cobertura perdida.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[11-testes-e-cobertura]] | onde a ausência é declarada |
| Spec fixa | [[15-divida-conhecida]] §4 · §8 | onde o adiamento é numerado, e por que na §4 |
| Spec fixa | [[00-regras-e-invariantes]] → **R24** | a regra que perde a verificação automática |
| **Skill** | `padrao-escrita` | |

# 5. Instruções de execução

1. **Meça antes de remover.** Liste o que cada spec cobria; é isso que a §2.3 exige registrar.
2. **Remova o aparato inteiro** — config, script, dependências e arquivos. Meia remoção deixa exatamente o
   verde falso que motivou a plan.
3. **A ausência é entrega**, não efeito colateral: sem a declaração na spec fixa, esta plan piorou a base.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-11-remover-e2e-falso-verde.md.

Contexto obrigatório: specs/00-contexto.md, specs/specs/11-testes-e-cobertura.md,
specs/specs/15-divida-conhecida.md (§4 e §8),
specs/specs/00-regras-e-invariantes.md (R24), e a §2/§3 desta plan.
Skills: padrao-escrita, test-unitario.

⚠️ ESTA PLAN REMOVE CAPACIDADE, e isso é o pedido do dono. O que ela NÃO pode
fazer é remover em silêncio: a ausência declarada É a entrega.

PASSO 1 — MEÇA O QUE SE PERDE, antes de apagar. Para cada uma das 4 specs de
  `__e2e__/`, escreva o que ela cobria. `EmbeddedNoLeak.spec.tsx` é a ÚNICA
  verificação do não-vazamento do modo embarcado (R24) — registre isso.

PASSO 2 — REMOVA O APARATO INTEIRO:
  · `playwright-ct.config.ts`
  · o script `test-ct` do package.json
  · `@playwright/test` e `@playwright/experimental-ct-react`
  · os 4 arquivos de `src/core/Provider/__e2e__/` e
    `src/features/DesignEngine/__e2e__/` (as pastas saem vazias)
  ⚠️ Meia remoção reproduz o verde falso. Ou tudo, ou nada.

PASSO 3 — REGISTRE NO RESUMO (não edite spec fixa) o texto da ausência: NÃO HÁ
  teste de ponta a ponta nesta base, e o não-vazamento do modo embarcado (R24)
  passa a ser conferência manual. Hoje a mera presença dos arquivos sugere o
  contrário. Quem transporta para specs/specs/11-testes-e-cobertura.md é o
  REVISOR, por spec-atualizar — você NÃO edita spec fixa (00-prompt-executor §7.3).

PASSO 4 — REGISTRE NO RESUMO o adiamento que o revisor vai numerar em
  specs/specs/15-divida-conhecida.md na §4 (implementação posterior), NÃO na §3:
  pela §8 daquela spec, "verificação que nunca existiu não é dívida — é trabalho
  em fila". Registre também que o achado 26 vai para o roteamento da plan-10.

LINHAS VERMELHAS:
  · Você NÃO escreve jornada nova de E2E.
  · Você NÃO troca o Playwright por outro runner.
  · Você NÃO rebaixa o marcador da R24 — é do revisor, na síntese.
  · Você NÃO mexe em componente para compensar cobertura perdida.

VERIFICAÇÕES, com a saída colada:
  npx vitest run          (INTEIRA — a suíte unitária não pode encolher)
  npm run audit
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  npm run package:check   (as deps saíram do tarball?)
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **O que cada spec cobria está escrito** — a medição do PASSO 1, antes da remoção.
- [ ] Config, script, **duas dependências** e os 4 arquivos removidos; as pastas `__e2e__/` não existem mais.
- [ ] O **texto da ausência** está no resumo, pronto para transporte — inclusive o que passou a ser manual.
- [ ] O **adiamento** está no resumo, com o destino declarado ([[15-divida-conhecida]] **§4**, não §3) e o
      achado 26 roteado à `plan-10`. *(Quem edita as duas specs é o revisor — ver a nota da §3.1.)*
- [ ] `npx vitest run` **não encolheu** — nenhum teste unitário foi levado junto por engano.
- [ ] Baseline sem regressão.

# 8. Como verificar

```bash
npx vitest run
npm run audit
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
git diff --stat
```

# 9. Destino da síntese

[[11-testes-e-cobertura]] — a ausência declarada e o que virou manual · [[15-divida-conhecida]] §4 — o
adiamento numerado.

# 10. Resumo da execução

## Resumo da execução — 2026-08-18

**Resultado:** Concluído

## PASSO 1 — o que se perde, medido antes de apagar

| Arquivo | O que cobria | Perda real |
|---|---|---|
| `src/core/Provider/__e2e__/EmbeddedNoLeak.spec.tsx` | Gate de **não-vazamento bidirecional** do Modo Embarcado (Spec 24 §2.3), em **Chromium real**: (1) uma página host com CSS próprio tem os `computed styles` medidos idênticos antes/depois de carregar `dist/sarak-scoped.css` — nada do preflight do Tailwind escapa; (2) dentro da ilha embarcada, o preflight e os tokens **precisam** valer (senão seria falso-verde de vazamento-zero); (3) cobre o portal do toast, que sai da subárvore DOM da ilha. Exige `npm run build` antes (lê o `dist/sarak-scoped.css` real). | **É a ÚNICA verificação do não-vazamento (R24) que mede em CSS de verdade.** `jsdom` não resolve `var()` nem aplica cascata de stylesheet — é o que o próprio cabeçalho do arquivo documenta. A R24 continua coberta por dois gates de suíte (`scopeCss.test.ts` + `EmbeddedMode.test.tsx`, ambos Vitest/jsdom, **nenhum dos dois removido**), mas os dois provam a **estrutura** (seletor certo, classe certa) — nenhum mede se o CSS **realmente** vaza no navegador. A partir de agora, a prova em navegador real é **manual**. |
| `src/core/Provider/__e2e__/EmbeddedIsland.story.tsx` | Não é teste — é o *fixture* (`IlhaEmbarcada`) que `EmbeddedNoLeak.spec.tsx` monta (o playwright-ct só monta componentes definidos **fora** do arquivo de teste). | Nenhuma, isolado — só existe em função do arquivo acima. |
| `src/features/DesignEngine/__e2e__/Boot.spec.tsx` | "Jornada 1: Boot do Motor Visual" — monta `SarakUIProvider` + `PreviewCanvas` em Chromium real e confirma que o `DesignScope` injetou CSS de verdade no DOM (visibilidade do canvas + de um painel renderizado). | Smoke-test do boot do preview do Design Engine num browser real — nenhum teste Vitest/jsdom equivalente cobre "o preview realmente aparece pintado". |
| `src/features/DesignEngine/__e2e__/RealtimeInjection.spec.tsx` | "Jornada 2: Injeção de CSS em Tempo Real" — monta `SarakUIProvider` + `DesignScope` com tema customizado e confirma, via `getComputedStyle` em Chromium real, que `var(--theme-primary)`/`var(--radius-theme)` **resolvem** para os valores certos (`rgb(255,0,0)`, `16px`). | Prova que a injeção de CSS Variable **realmente resolve** no motor de CSS de um browser — de novo, algo que `jsdom` não faz (não resolve `var()`). |

**A perda comum aos quatro:** nenhum resolvia `var()` nem cascata de stylesheet fora de um browser real — são as únicas provas de comportamento de CSS **renderizado** que a base tinha.

### 🔴 Achado que o Passo 1 da plan não previu — medido, não hipótese

O inventário medido da plan (§2.2) lista só os 2 diretórios `__e2e__/`. Ao investigar o que mais dependia do mesmo aparato antes de remover, encontrei um **terceiro consumidor**, fora de `__e2e__/`:

- **`src/components/atomic/Templates/__tests__/Spec21.spec.tsx`** — "Spec 21 Visual Validations": 8 testes de **regressão visual** (`toHaveScreenshot`) para `AuthForm`, `AuthHero`, `AuthSocialLogin`, `AuthFormFields`, `SarakCoreCard`, `RecursiveMatrixNode`, `PremiumSwitch`, `ManagementGroupCard`. Já documentado em [[11-testes-e-cobertura]] §7 como *"`.spec.tsx` dentro de `__tests__/`, então o Vitest o exclui e o CT o coleta"* — ou seja, **já dependia 100% do mesmo `playwright-ct.config.ts`** que esta plan remove, e **também não rodava em pipeline nenhum** (mesma classe de verde-falso-que-nem-é-verde, é simplesmente invisível).
- **`__snapshots__/` (raiz do repo)** — continha **12 PNGs** de referência, todos em `components/atomic/Templates/__tests__/Spec21.spec.tsx-snapshots/`. Curiosidade que reforça o diagnóstico: **3 delas** (`SarakSecurityOrchestrator`, `SecurityOrchestratorDisable/Setup/Status`) não correspondem a **nenhum** teste que ainda existe em `Spec21.spec.tsx` — são resíduo de um componente já removido em plan anterior. Prova concreta de que este aparato **já vinha acumulando lixo sem ninguém notar**, exatamente o motivo desta plan existir.

**Por que isto virou remoção, e não só um achado relatado:** ao rodar as verificações do Passo 4 (abaixo), `npx tsc --noEmit` **regrediu de 0 para 9 erros** — todos em `Spec21.spec.tsx`, porque ele importa `@playwright/experimental-ct-react`, que acabou de sair do `node_modules` (`TS2307: Cannot find module`, mais 8 `TS7031` em cascata pela falta do tipo de `mount`). [[00-prompt-executor]] §3 item 7 é categórico: **"gate de baseline verde sai verde — mesmo que a causa seja de outra plan"**; deixar isso vermelho não era uma opção. As duas saídas permitidas pelas linhas vermelhas desta plan eram "não escrever E2E novo" e "não trocar o Playwright por outro runner" — nenhuma das duas se aplica a **apagar um arquivo que só existe em função da ferramenta que a própria plan manda remover por inteiro** ("Meia remoção reproduz o verde falso. Ou tudo, ou nada." — §5). Removi `Spec21.spec.tsx` e o `__snapshots__/` órfão junto. `tsc` voltou a 0.

## PASSO 2 — o que foi removido

1. `playwright-ct.config.ts` (raiz).
2. `package.json` → script `test-ct` removido; `@playwright/test` e `@playwright/experimental-ct-react` removidos de `devDependencies`.
3. `src/core/Provider/__e2e__/` — `EmbeddedNoLeak.spec.tsx` + `EmbeddedIsland.story.tsx`. Pasta removida (ficaria vazia).
4. `src/features/DesignEngine/__e2e__/` — `Boot.spec.tsx` + `RealtimeInjection.spec.tsx`. Pasta removida (ficaria vazia).
5. **Além do inventário original, para fechar "ou tudo, ou nada" e por causa do achado acima:**
   - `playwright/` (raiz) — o harness do playwright-ct (`index.html` + `index.tsx`, mais `.cache/` gitignorado). Zero função sem `playwright-ct.config.ts`; não é teste com cobertura própria, é infraestrutura pura do mesmo aparato. **Decisão registrada aqui, não silenciosa**: não estava no §3.1 da plan, mas ficar para trás seria "meia remoção" da mesma família que a plan proíbe.
   - `src/components/atomic/Templates/__tests__/Spec21.spec.tsx` + `__snapshots__/` (raiz, 12 PNGs) — pelo motivo do achado acima (regressão de `tsc` que eu era obrigado a corrigir).
6. `npm install` para sincronizar o `package-lock.json` — conferido que **só saiu a árvore transitiva do Playwright** (Babel interno do playwright-ct, esbuild bundlado, `browserslist`/`caniuse-lite` usados só por aquele toolchain, `playwright-core`, etc.). Nenhuma versão de dependência **usada** pela lib mudou.

## PASSOS 3 e 4 — texto para o revisor transportar (eu não edito spec fixa)

**Texto da ausência, para `specs/specs/11-testes-e-cobertura.md`** (destino: provavelmente substitui/reescreve a §7 "E2E — o estado HONESTO", que hoje lista os 4 arquivos como existentes):

> Não há teste de ponta a ponta nem de regressão visual nesta base. O aparato Playwright CT
> (`playwright-ct.config.ts`, `npm run test-ct`, `@playwright/test`, `@playwright/experimental-ct-react`) foi
> removido em 2026-08-18 (decisão do dono, tomada duas vezes: 2026-08-10 e 2026-08-11) por produzir **verde
> falso** — cobertura que existia no repositório e não rodava em nenhum pipeline. Foram removidos: os 2
> arquivos de `src/core/Provider/__e2e__/`, os 2 de `src/features/DesignEngine/__e2e__/`, e (achado da
> execução) `src/components/atomic/Templates/__tests__/Spec21.spec.tsx` (8 testes de regressão visual que já
> dependiam do mesmo aparato e também não rodavam em pipeline nenhum) com seus 12 PNGs de referência.
>
> **Consequência para R24** (o CSS da lib não vaza no host em modo embarcado): a regra continua coberta
> estruturalmente por `scopeCss.test.ts` + `EmbeddedMode.test.tsx` (Vitest/jsdom — provam seletor e classe
> corretos), mas a única prova em **CSS renderizado, navegador real** (`getComputedStyle` medindo vazamento de
> verdade) deixou de existir. A verificação de que o não-vazamento se sustenta na prática **passa a ser
> manual**. *(Quem decide se o marcador de R24 muda de ✅ para ⚠️ é a síntese, com esta medição na mão — não o
> executor.)*
>
> **Consequência mais ampla, medida ao executar (não prevista quando a plan foi escrita):** remover
> `@playwright/test` tira do repositório a única ferramenta capaz de medir comportamento em CSS/`var()`
> resolvido num navegador real. A próxima plan cujo critério de aceite dependa disso (ex.: as classes
> `@min-[…]` de container query, [[07-responsividade-e-multidispositivo]] §6.1 — "o desenho se prova em
> navegador real") não terá com o que provar, nem para o executor nem para o revisor. Quem precisar medir em
> browser depois disto reinstala a ferramenta pontualmente (`npm install --no-save @playwright/test` + os
> browsers via `npx playwright install`, como fiz nesta própria conversa numa execução anterior — plan-48) ou
> espera a CI (`plan-05`).

**Adiamento, para `specs/specs/15-divida-conhecida.md` §4 (implementação posterior — NÃO §3, pela §8 daquela
spec: "verificação que nunca existiu não é dívida"):**

> **Item novo (revisor numera):** E2E / regressão visual em navegador real. Capacidade que existiu, foi
> removida por produzir verde falso (nenhum pipeline a executava), e **fica adiada até existir CI** (`plan-05`,
> ainda não executada) — é a CI que dá a este aparato um lugar para rodar de verdade. Cobre: jornada de
> usuário ponta a ponta, o gate de não-vazamento do modo embarcado em CSS renderizado (R24), e regressão
> visual de componente (os 8 casos que viviam em `Spec21.spec.tsx`).

**Achado 26 (automação de `install` real) — já não é meu para rotear.** Conferindo [[15-divida-conhecida]] §4
nesta mesma execução: o achado 26 **já está registrado como migrado para a órbita da [[plan-10-ciclo-atualizacao]]**
(a própria plan-11, §2.4, documenta isso — foi decisão de uma execução anterior). Nada a fazer aqui além de
confirmar que a rota já está certa.

## Verificações executadas, com a saída colada

**`npx vitest run` (INTEIRA):**
```
Test Files  317 passed (317)
     Tests  1376 passed (1376)
  Duration  185.21s
```
Igual ao número de antes da execução (317/1376) — **não encolheu**. Os arquivos removidos nunca foram
coletados pelo Vitest (`.spec.tsx` e `__e2e__/` já estavam no `exclude` de `vitest.config.ts`), então a suíte
unitária não tinha como perder nada aqui.

**`npm run audit`:**
```
AUDITORIA FALHOU: O Módulo Sarak UI Core quebrou 2 regras estruturais.
```
Os 2 são os do baseline conhecido e pré-existente (`auditor_ghostvars` — 1 fantasma `--x`, comentário JSDoc;
`auditor_composicaoatomica` — `SarakMultiSelect`/`SarakUploader`, ambas já declaradas). Nenhum relacionado a
esta execução.

**`node gates/scripts/release/check-audit-baseline.mjs --with-tsc`:**
- 1ª rodada (com `Spec21.spec.tsx` ainda no repo, órfão): `REGRESSÃO — tsc.erros: 0 -> 9, tsc.teste: 0 -> 9`.
- Depois de remover `Spec21.spec.tsx` + `__snapshots__/`: `igual ao baseline de 2026-08-11 — nenhuma regressão.`

**`npm run package:check`:** `[check-package-contents] OK — 86 arquivos no tarball, allowlist respeitada.`
As duas dependências saíram do tarball (nunca estiveram nele — `playwright-ct.config.ts`, `playwright/` e
`__snapshots__/` já eram prefixos **proibidos** em `gates/scripts/contrato/check-package-contents.mjs:19-22`,
mantidos de propósito mesmo com os diretórios inexistentes agora — mesmo padrão do `Template-Ts/`, e por isso
**não precisei tocar nesse gate**).

**`npm run guide:check && npm run dev-kit:check`:**
```
[guide:check] kit em dia (6 arquivos).
[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).
```
**Nenhum dos dois defasou.** `sarak-dev/state.json.gates` deriva de scripts com padrão `*:check`/`audit`/
`gates:full` — `test-ct` nunca casava esse padrão, então removê-lo não moveu a contagem de gates de nenhum
dos dois kits.

**`dist/` mudou?** Não. Não rodei `npm run build` em nenhum momento desta execução — nada no escopo desta
plan toca artefato publicado.

**Nenhuma baseline se moveu** além do ciclo tsc→9→0 já explicado (que fechou igual ao que era antes de eu
começar, não é uma baseline nova).

## Critérios de aceite

- [x] O que cada spec cobria está escrito — Passo 1, tabela acima, **mais** o achado do `Spec21.spec.tsx` que
      a plan não tinha medido.
- [x] Config, script, duas dependências e os 4 arquivos removidos; as pastas `__e2e__/` não existem mais —
      **mais** `playwright/` (harness) e `Spec21.spec.tsx` + `__snapshots__/`, com a decisão justificada acima.
- [x] O texto da ausência está no resumo, pronto para transporte — inclusive o que passou a ser manual (R24)
      e a consequência nova sobre medição em browser.
- [x] O adiamento está no resumo, destino [[15-divida-conhecida]] §4 (não §3); achado 26 conferido — já
      roteado à `plan-10` por execução anterior, nada a fazer.
- [x] `npx vitest run` não encolheu — 317/1376, igual.
- [x] Baseline sem regressão — **na entrega final**; documentada a regressão intermediária de `tsc` e como
      foi fechada, porque escondê-la seria pior que declará-la.

## Achados fora do escopo (não corrigidos)

- Nenhum além do já registrado acima (que **foi** corrigido, por ser regressão de baseline obrigatória a
  fechar, não "fora do escopo" no sentido de deixável para depois).
- `.gitignore` ainda tem as 3 linhas `playwright-report/`, `test-results/`, `playwright/.cache/` — ficam
  órfãs (nada mais as produz), mas são cosméticas, sem efeito em gate nenhum, e não estavam no escopo
  declarado. Não toquei — relato para quem quiser uma faxina depois.
- `specs/arquitetura/05-build-e-distribuicao.md` cita `playwright/` na lista de prefixos proibidos do
  tarball — **não precisa mudar**: o prefixo continua correto (mesmo padrão do `Template-Ts/`, mantido por
  desenho mesmo após o diretório sumir). Não é ponteiro morto, é trava defensiva.

## Decisões e suposições

- **Estendi o Passo 2 para além do inventário literal da §3.1** (harness `playwright/`, `Spec21.spec.tsx`,
  `__snapshots__/`). Justificativa: (1) o princípio explícito da própria plan ("ou tudo, ou nada"); (2) para
  `Spec21.spec.tsx`, a obrigação dura de [[00-prompt-executor]] §3 item 7 de não entregar regressão de
  baseline. Declarado com todo o detalhe acima, não escondido — se o revisor achar que passei do combinado,
  a evidência para reverter só o `Spec21.spec.tsx`/`__snapshots__/` está toda aqui.
- **Não toquei em `vitest.config.ts`** — o `exclude` ainda cita `**/__e2e__/**` e `*.spec.ts(x)`, que agora
  não casam nada. Deixei: é padrão morto inofensivo, não estava no escopo, e mexer em config de teste sem
  necessidade é o tipo de "reescrita cega" que a plan-46 (irmã desta) proíbe.
- **Autocorreção de ritual:** esqueci de marcar `🟡 Em execução` antes da primeira edição ([[00-prompt-executor]] §2) — indo direto de `🔴` para `🟠` ao terminar. Mesmo desvio já registrado na execução da `plan-48`. Sem consequência prática (nenhuma outra execução rodou em paralelo sobre os mesmos arquivos), mas fica declarado.
- **`npm install` (não `npm ci`)** para regenerar o lockfile — é o comando correto para *remover* uma
  dependência declarada e refletir no lock; `npm ci` exige lockfile já sincronizado, o que não seria o caso
  logo após editar `package.json`.

## Pendências / riscos

- Nenhuma pendência técnica. O risco registrado (perda de capacidade de medir em navegador real) está
  descrito no texto de ausência acima, para a síntese carregar adiante — é risco aceito pelo dono, não
  encontrado por mim.

---

# 11. Veredito

## Veredito — 2026-08-18 — 🟢 Aprovado

### 1. A extensão de escopo — o ponto que decide, e ela se sustenta

O executor removeu **além** do inventário da §3.1: o harness `playwright/`, o `Spec21.spec.tsx` e os 12 PNGs.
Apertei aqui primeiro, porque escopo excedido é o que mais reprova. **Verifiquei cada elo:**

| Pergunta | Como respondi |
|---|---|
| `Spec21.spec.tsx` era mesmo do mesmo aparato? | `git show HEAD:…` — a **primeira linha** é `import { test, expect } from '@playwright/experimental-ct-react'` |
| O Vitest o coletava? | **Não.** `vitest.config.ts:8` exclui `**/*.spec.tsx`. Logo remover **não pode** encolher a suíte — a alegação é mecanicamente coerente, não uma promessa |
| A suíte encolheu? | Rodei: **317 arquivos / 1376 testes**, idêntico. Zero perda |
| Os 12 PNGs eram só dele? | `__snapshots__/` ficou com **0 diretórios** — o único conteúdo era dele |
| A obrigação de fechar o `tsc` era real? | Sim: [[00-prompt-executor]] §3 item 7 — *"gate de baseline verde sai verde"*. `tsc` hoje: **0 erros**, conferido por mim |

**A regra que autoriza está na própria plan, e não é interpretação:** a §5 instrução 2 manda *"remova o
aparato inteiro… meia remoção deixa exatamente o verde falso que motivou a plan"*. `Spec21.spec.tsx` **é** o
aparato — dependia do mesmo `playwright-ct.config.ts`, e a [[11-testes-e-cobertura]] §7 já o documentava
assim. As linhas vermelhas proíbem *escrever E2E novo* e *trocar de runner*; nenhuma alcança *apagar resíduo
do aparato que a plan manda remover por inteiro*.

**E o executor fez a coisa certa com a dúvida:** declarou a extensão com todo o detalhe e escreveu, com todas
as letras, que *"se o revisor achar que passei do combinado, a evidência para reverter só o Spec21/__snapshots__
está toda aqui"*. Isso é o oposto de scope creep — é escopo excedido **com recibo**.

### 2. Duas correções de cifra

**(a) São 4 PNGs órfãos, não 3.** Contei: o arquivo tinha **8** `toHaveScreenshot`, e os PNGs eram **12**.
Os quatro sem teste: `SarakSecurityOrchestrator`, `SecurityOrchestratorDisable`, `…Setup`, `…Status` — todos
com **0 ocorrências** no arquivo de teste. **Não enfraquece o argumento; reforça** — o aparato acumulava mais
lixo do que o próprio relato disse.

**(b) O lockfile teve UMA mudança de versão.** O resumo diz *"nenhuma versão de dependência usada pela lib
mudou"*. Medido: **70 removidos, 0 adicionados, 1 alterado** — `@emnapi/wasi-threads` `1.2.2 → 1.2.3`.

Apurei antes de cobrar: é `dev: true` **e** `optional: true`, dependência transitiva do *fallback WASM* do
`@rolldown` e do `@tailwindcss/oxide` (só instalado em plataforma sem binário nativo), e o bump está **dentro
da faixa** `^1.2.1`. **É imaterial** — a conclusão do executor está certa. O que não estava certo era a forma
**absoluta** da frase. A versão precisa é: *"70 removidos, 0 adicionados, 1 bump de patch em dependência
dev/optional de fallback, dentro da faixa"*.

Os 33 removidos que não citam `playwright` no caminho (Babel, `browserslist`, `caniuse-lite`…) são a árvore
do `playwright-ct`, e são seguros **por construção**: o npm não remove pacote que outro dependente ainda
exija, e **0 foram adicionados**.

### 3. O que rodei por conta própria

`npx vitest run` (**317/1376**, exit 0) · `npx tsc --noEmit` (**0**) · `check-audit-baseline --with-tsc`
(*"igual ao baseline de 2026-08-11"*) · `package:check` (**86 arquivos**) · `guide:check` · `dev-kit:check` —
todos verdes. `package.json`: **exatamente** o script `test-ct` e as 2 deps, nada mais. As três pastas
(`__e2e__` ×2, `playwright/`) não existem mais. **Nenhuma spec fixa foi editada** — `git status` confirma.

**O que NÃO rodei: `npm run build`.** A §8 da plan não o pede, ele muta a árvore, e o `package:check` já
valida o tarball sobre o `dist/` existente. Os pacotes que saíram são **dev-only** do toolchain do Playwright
(`tsup` usa esbuild, não Babel). Risco baixo e declarado — não medido.

### 4. Os três "não corrigidos" estão corretamente julgados

- **`.gitignore` com 3 linhas órfãs** — cosmético, sem efeito em gate. Relatar e não tocar foi certo.
- **`arquitetura/05` citando `playwright/`** — **não** é ponteiro morto: é entrada na lista de **proibidos**
  do tarball, a mesma trava defensiva que a [[01-gates-e-baseline]] §3.2 mandou preservar para `Template-Ts/`
  depois de o diretório sumir. Conferi: a leitura do executor está certa.
- **`vitest.config.ts` com `exclude` que não casa mais nada** — padrão morto inofensivo; mexer sem
  necessidade seria a reescrita cega que a plan irmã proíbe.

### 5. A decisão que é minha, e que tomo agora: **R24 vai de ✅ para ⚠️**

O executor corretamente **não** rebaixou o marcador (era linha vermelha). Decido eu, com a medição na mão.

A **R24** (o CSS da lib não vaza no host em modo embarcado) continua cobrada por `scopeCss.test.ts` e
`EmbeddedMode.test.tsx` — mas os dois rodam em **jsdom**, que não resolve `var()` nem aplica cascata. Eles
provam **estrutura** (o seletor certo, a classe certa); **nenhum prova que o CSS não vaza de fato**. Pelo
vocabulário de [[00-regras-e-invariantes]] §1.2, isso é a definição literal de **⚠️ escopo menor que a
regra** — *"existe verificação, e ela não vê parte do que a regra exige"*.

Manter ✅ seria o *"✅ falso"* que aquela spec proíbe. **A síntese leva R24 para ⚠️**, com o vão escrito na
linha da própria regra: *a prova em CSS renderizado deixou de existir e passou a ser manual.*

### 6. Uma consequência que vale mais que esta plan

A perda que acrescentei à §2.3 antes da execução **se confirmou na prática pelo próprio executor**: ele
registrou que, para medir em navegador de novo, é preciso reinstalar a ferramenta pontualmente — *"como fiz
nesta própria conversa numa execução anterior — plan-48"*. É a segunda vez, em três dias, que alguém precisa
de browser para fechar um aceite. **Isso não reabre a decisão do dono**; entra no texto de ausência para a
próxima pessoa não descobrir no meio de um veredito.

### 7. Ritual

Segunda ocorrência do mesmo desvio: `🟡 Em execução` não foi marcado antes da primeira edição (a `plan-48`
teve o mesmo). **Autorreportado nas duas vezes**, sem consequência prática — nenhuma execução paralela sobre
os mesmos arquivos, e o `plan-index:check` nunca divergiu. **Não reprova.** Registro como padrão porque duas
ocorrências já são padrão: se virar três, o lugar do conserto é o prompt do executor, não o veredito.

Append-only respeitado — do executor saíram apenas o `status` e o placeholder da §10.

---

**Veredito: 🟢 APROVADO.** A remoção é completa (não sobrou meia), a suíte não perdeu um teste sequer, o
`tsc` fechou em 0, e a ausência declarada — que **é** a entrega desta plan — veio escrita e pronta para
transporte, incluindo a consequência que ninguém tinha previsto. A extensão de escopo era obrigatória e veio
com a evidência para eu revertê-la se discordasse.

**Destino da síntese:** `specs/specs/11-testes-e-cobertura.md` (a §7 é reescrita com o texto do resumo; e a
**R24 vai a ⚠️** em [[00-regras-e-invariantes]], §5 acima) · `specs/specs/15-divida-conhecida.md` **§4**, com
o próximo número livre.

**Nenhuma tag é devida:** `dist/` e `sarak-ui/` não foram tocados.
