---
tipo: "plan"
titulo: "Fazer o cromo do modo ui-kit honrar o fundo de mídia global"
objetivo: "Escolher uma mídia de fundo passa a mudar a tela também no SarakAppChrome, e não só no SarakShell"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "cromo", "atmosfera", "modo-ui-kit"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/09-temas-e-presets]]", "[[arquitetura/01-forma-do-produto-e-modos-de-consumo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md"
---

# 1. Objetivo

No modo de consumo ui-kit (`SarakAppChrome`), um tema com `globalBackgroundImageUrl` preenchido passa a
exibir a mídia atrás de todo o cromo — o mesmo comportamento que o `SarakShell` já tem.

# 2. Contexto

O dono comparou dois sistemas reais na tela e reportou *"não há escolha de imagem de fundo, não aplica"*.
A investigação isolou a causa e a **mediu em Chromium real** sobre o `dist/` publicado, com o mesmo tema,
o mesmo token e o mesmo build — trocando apenas o cromo:

| Cromo | `background-color` computado da raiz | mídia visível |
| --- | --- | --- |
| `SarakAppChrome` | `rgb(5, 5, 5)` | não |
| `SarakShell` | `rgba(0, 0, 0, 0)` | sim |

A assimetria está no código:

- `src/core/Shell/SarakShell.tsx:89` e `:181` alternam para `bg-transparent` quando
  `design.globalBackgroundImageUrl` está preenchido.
- `src/components/Layout/SarakAppChrome.tsx:163-166` pinta
  `background: var(--bg-body, var(--theme-body, transparent))` **incondicionalmente**, no `rootStyle`.

O `SarakBackgroundRenderer` monta normalmente (`src/core/Provider/SarakUIProvider.tsx:220-228`), com
`position: fixed` e `zIndex: -1`, e ocupa a viewport inteira. Ele **não** está quebrado: é integralmente
coberto pela raiz opaca do cromo.

O ERP — único consumidor real — usa o modo ui-kit (`packages/ui-kit/src/nav.tsx`), portanto vê a versão
que não funciona. O sistema de referência usava o `SarakShell`, que funciona. Não houve regressão ao longo
do tempo: os dois comportamentos sempre coexistiram, e a troca de modo de consumo os expôs.

Dois detalhes que evitam refazer a investigação:

- O `rootStyle` recebe `...style` **depois** do `background`, então o `style` do consumidor já sobrescreve.
  A altura própria (`minHeight: 100dvh`) e o motivo dela estão documentados em
  [[05-cromo-e-slots]] §5 e **não** devem ser alterados.
- O ramo mobile (`SarakAppChromeMobile`) recebe o `rootStyle` já montado (`SarakAppChrome.tsx:196`), então
  a correção na origem alcança os três modos de geometria de uma vez.

# 3. Escopo

## 3.1 Dentro
- `src/components/Layout/SarakAppChrome.tsx` — a montagem do `rootStyle`: o fundo passa a depender de haver
  mídia global, como no `SarakShell`.
- `src/components/Layout/__tests__/SarakAppChrome.test.tsx` — teste do novo comportamento, com e sem mídia.
- `browser-tests/fixtures/harness-entry.tsx` e `browser-tests/cromo-css-real.spec.ts` — acrescentar a
  medição do fundo renderizado ao conjunto nomeado que já existe.

## 3.2 Fora
- `src/core/Shell/` — o Shell já está correto; não se toca.
- `src/core/Design/components/SarakBackgroundRenderer.tsx` — o renderizador funciona; o defeito não é dele.
- `src/core/Provider/SarakUIProvider.tsx` — a montagem do renderizador está correta.
- A altura própria (`minHeight: 100dvh`) e a precedência de `...style`.
- Os 8 slots, a navegação, e qualquer outro comportamento do cromo.
- Qualquer refactor não listado em §5, mesmo que pareça óbvio.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/05-cromo-e-slots.md` | o contrato do cromo: §3 separa fundo global por tema de ornamento por slot, §5 explica a altura própria, §6 a regra de zero hardcode |
| Spec fixa | `specs/09-temas-e-presets.md` | §4 — o ciclo do token de tema até virar CSS |
| Spec fixa | `specs/11-testes-e-cobertura.md` | §7 — o que o harness de navegador cobre e o que ele declara não ver |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §6.1 — o que `jsdom` prova e o que só o navegador prova |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-arquitetura-design` | mexe em estilo de componente |
| Código | `src/core/Shell/SarakShell.tsx:89,181` | o comportamento de referência a espelhar |
| Código | `src/components/Layout/SarakAppChrome.tsx:153-196` | o `rootStyle` e a passagem dele ao ramo mobile |
| Código | `src/core/Provider/SarakUIProvider.tsx:220-228` | como o renderizador de fundo é montado |
| Código | `browser-tests/cromo-css-real.spec.ts` · `browser-tests/fixtures/harness-entry.tsx` | o harness a estender |

# 5. Instruções de execução

1. Ler as referências da §4. Confirmar no código as duas linhas do `SarakShell` e a linha do `rootStyle`.
2. Fazer o fundo da raiz do `SarakAppChrome` deixar de ser opaco quando houver mídia global, espelhando a
   condição do `SarakShell`. **Pronto quando** a raiz não emite cor de fundo própria com mídia presente e
   continua emitindo exatamente o valor de hoje sem mídia.
3. Garantir que o `style` do consumidor continua vencendo nos dois casos.
4. Acrescentar teste em `SarakAppChrome.test.tsx` cobrindo os dois estados. **Pronto quando** o teste falha
   se a condição for removida.
5. Estender o harness (`harness-entry.tsx`) com um cenário que monta o Provider com mídia global, e
   `cromo-css-real.spec.ts` com a medição de `background-color` computado da raiz do cromo nos dois estados.
   Declarar o limite novo no bloco de limites do arquivo, como manda a R18.
6. Rodar `npx vitest run` e `npm run cromo-css-real:check`; os dois verdes.

# 6. Critérios de aceite

- [ ] Com `globalBackgroundImageUrl` preenchido, a raiz do `SarakAppChrome` não pinta fundo opaco.
- [ ] Sem mídia, o fundo emitido é idêntico ao de hoje.
- [ ] O `style` do consumidor sobrescreve nos dois estados.
- [ ] Os três modos de geometria (sidebar, topbar, celular) herdam o comportamento — nenhum ganha caso especial.
- [ ] Teste `jsdom` cobre os dois estados e falha se a condição sumir.
- [ ] A medição de navegador prova o valor computado nos dois estados, com o limite novo declarado no arquivo.
- [ ] `npx vitest run` verde; `npm run cromo-css-real:check` verde.
- [ ] Nenhum valor visual novo em hardcode — o que entrar é token com fallback.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável **deste** componente, então o dono é o teste do
módulo mais a medição de navegador que já existe. Nenhuma regra nova precisa varrer o vizinho.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura de `src/components/Layout/SarakAppChrome.tsx` → a condição existe e espelha o `SarakShell`.
- `npx vitest run src/components/Layout` → verde.
- `npm run cromo-css-real:check` → verde, com o cenário de mídia presente na saída.
- `npx vitest run` → verde, comparado ao baseline de intermitência de [[11-testes-e-cobertura]] §3.5.
- `npm run audit` → comparar com `gates/baselines/audit-baseline.json`, nunca com zero.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md`

Texto pronto para transporte, para a §3 (os dois níveis de adicionar imagem/animação):

> O fundo global por tema (`globalBackgroundImageUrl`) alcança os **dois** cromos. `SarakShell` e
> `SarakAppChrome` deixam de pintar fundo próprio quando há mídia global, para que o
> `SarakBackgroundRenderer` do Provider apareça atrás do cromo inteiro. Sem mídia, cada um pinta o próprio
> token de fundo. A regra vale igual nos três modos de geometria.

Acrescentar à §9 (plano de testes) a linha da medição de navegador do fundo do cromo.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-09

**Resultado:** Concluído

**O que foi feito**
- `src/components/Layout/SarakAppChrome.tsx:167` — o `background` do `rootStyle` deixou de ser
  incondicional: `useHasGlobalBackgroundMedia() ? 'transparent' : 'var(--bg-body, var(--theme-body,
  transparent))'`, espelhando a condição que `SarakShell.tsx:89,181` já usa
  (`design.globalBackgroundImageUrl ? 'bg-transparent' : ...`). Como `rootStyle` é montado uma vez e
  repassado aos três ramos (`mobile`/`topbar`/sidebar, `:177-247`), os três modos de geometria herdam a
  regra sem caso especial.
- `src/core/Provider/useHasGlobalBackgroundMedia.ts` (novo) — hook que lê
  `design.globalBackgroundImageUrl` do `UIContext`/`DesignOverrideContext` sem exigir Provider,
  espelhando byte a byte o padrão de `useNavigationStyle.ts` (mesmo arquivo/pasta, mesma forma de
  degradar a `false` fora do Provider e de dar prioridade ao override de rascunho). Necessário porque
  `SarakAppChrome` não tinha, antes, nenhuma leitura de `design` — só de `navigationStyle`/`device`.
- `src/core/Provider/__tests__/useHasGlobalBackgroundMedia.test.tsx` (novo) — 4 casos, no mesmo formato
  do teste irmão de `useNavigationStyle` (degrada fora do Provider, lê o persistido, prioridade do
  override, valor vazio do schema → `false`). Exigido pela regra 1:1 (`auditor_coverage.mjs`) — todo
  arquivo `useAlgo.ts` pede teste irmão.
- `src/components/Layout/__tests__/SarakAppChrome.test.tsx` — 4 casos novos: sem mídia (fundo idêntico
  ao valor de hoje), com mídia (`transparent`), `style` do consumidor sobrescrevendo nos dois casos, e os
  três modos de geometria (sidebar/topbar/mobile) com mídia. Confirmado que os 3 primeiros falham se a
  condição for removida (evidência abaixo).
- `browser-tests/fixtures/harness-entry.tsx` — o mesmo App do harness passa a ler `?bg=1` da URL para
  ligar `globalBackgroundImageUrl` no `SarakUIProvider`, e o `SarakAppChrome` ganhou
  `className="sarak-chrome-root"` — o contrato público que a própria raiz expõe, usado só para o teste de
  navegador localizar o elemento (não é seletor de estrutura interna).
- `browser-tests/cromo-css-real.spec.ts` — 2 testes novos medindo `background-color` computado (Chromium
  real, contra `dist/` buildado) da raiz do cromo nos dois estados, e o limite novo (item 7) declarado no
  bloco de limites do cabeçalho, como a R18 exige.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/SarakAppChrome.tsx` | alterado | fundo do `rootStyle` condicional a `globalBackgroundImageUrl` (+1 import, 1 linha trocada) |
| `src/core/Provider/useHasGlobalBackgroundMedia.ts` | criado | hook de leitura de `globalBackgroundImageUrl` sem exigir Provider |
| `src/core/Provider/__tests__/useHasGlobalBackgroundMedia.test.tsx` | criado | 4 casos do hook novo |
| `src/components/Layout/__tests__/SarakAppChrome.test.tsx` | alterado | 4 casos novos (sem/com mídia, override de `style`, os 3 modos) |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | `?bg=1` liga mídia global; `className="sarak-chrome-root"` no cromo |
| `browser-tests/cromo-css-real.spec.ts` | alterado | 2 testes de `background-color` computado + limite 7 declarado |
| `specs/plan/plan-61-fundo-de-midia-no-cromo-do-modo-ui-kit.md` | alterado | `status` + este resumo (append-only) |

**Verificações executadas**
- `npx vitest run src/components/Layout src/core/Provider/__tests__/useHasGlobalBackgroundMedia.test.tsx src/core/Provider/__tests__/useNavigationStyle.test.tsx` → **74 testes, 74 passaram** (9 arquivos).
- Prova de que o teste é sensível à condição: revertida temporariamente a linha `167` para o valor
  incondicional de antes e rodado `npx vitest run src/components/Layout/__tests__/SarakAppChrome.test.tsx`
  → **2 falhas** (exatamente os dois casos "COM mídia"), confirmando que o teste falha sem a correção;
  condição restaurada e suíte voltou a **33/33** verde no arquivo.
- `npx vitest run` (suíte completa) → **1 arquivo falhou (6 testes) na primeira rodada, por timeout
  (5–30s) sob carga da suíte inteira** — nenhum deles em arquivo tocado por esta execução
  (`generate-token-types.check.test.mjs`, `generate_theme_template.test.ts` ×2 — mesmo arquivo espelhado
  em `.agents/skills/` e `.claude/skills/`, `SarakTable.responsive.test.tsx`,
  `SarakPDFViewerImpl.test.tsx`). Reexecutados os 4 arquivos isolados → **11/11 passaram**. Consistente com
  a intermitência sob contenção de CPU já documentada em [[11-testes-e-cobertura]] §3.5 (a nota do próprio
  arquivo de `generate_theme_template.test.ts` já registra essa classe de falha). Total da suíte completa:
  **1494 testes, 1488 passaram na primeira rodada; os 6 restantes passaram isolados** — evidência salva
  (saída completa capturada em arquivo antes de qualquer nova rodada, por `TEMP/vitest-full-run.log`).
- `npm run cromo-css-real:check` (builda `dist/` + roda os 5 testes de Chromium real) → **verde, 5/5**,
  incluindo os 2 novos (`SEM mídia global...`, `COM mídia global...`), medidos contra o artefato buildado.
- `npm run audit` → **não está em zero** (nunca esteve — [[00-contexto]] §2), comparado contra
  `gates/baselines/audit-baseline.json`: `auditor_composicaoatomica` 2/2 (bate o teto), `auditor_ghostvars`
  1/1 (bate o teto), `auditor_paridade`/`auditor_presets`/`auditor_authcoupling`/`auditor_sectionpointers`/
  `auditor_contraste`/`auditor_typescript`/`auditor_coverage`/`auditor_arquitetura` em 0, todos dentro do
  baseline. `auditor_cleancode` confirmado, por invocação direta do script, **sem `SarakAppChrome.tsx` na
  lista de falhas** antes e depois da correção do limite de linhas (ver Decisões). Dois excedentes ficaram
  acima do baseline — `auditor_hardcoded` (31 vs. teto 0) e `auditor_cleancode` (`validation.ts`, 1 vs.
  teto 0) — e nenhum dos dois está em arquivo tocado por esta execução; ver *Achados fora do escopo*.

**Critérios de aceite**
- [x] Com `globalBackgroundImageUrl` preenchido, a raiz do `SarakAppChrome` não pinta fundo opaco —
  evidência: `SarakAppChrome.test.tsx` (jsdom, `'transparent'`) + `cromo-css-real.spec.ts` (Chromium real,
  `rgba(0, 0, 0, 0)`).
- [x] Sem mídia, o fundo emitido é idêntico ao de hoje — evidência: `SarakAppChrome.test.tsx`
  (`'var(--bg-body, var(--theme-body, transparent))'`, literal inalterado) + `cromo-css-real.spec.ts`
  (`not.toBe('rgba(0, 0, 0, 0)')`).
- [x] O `style` do consumidor sobrescreve nos dois estados — evidência: teste "o `style` do consumidor
  sobrescreve o fundo mesmo COM mídia global" (o `...style` do `rootStyle` continua por último).
- [x] Os três modos de geometria herdam o comportamento — evidência: teste "os três modos de geometria
  herdam a regra de fundo COM mídia", sidebar/topbar/mobile, todos `'transparent'` (mesmo `rootStyle`
  repassado aos três ramos do componente).
- [x] Teste `jsdom` cobre os dois estados e falha se a condição sumir — evidência acima (reversão manual
  → 2 falhas).
- [x] A medição de navegador prova o valor computado nos dois estados, com o limite novo declarado —
  evidência: `cromo-css-real.spec.ts`, item 7 do bloco de limites (R18) + os 2 testes novos, verdes contra
  `dist/`.
- [x] `npx vitest run` verde — evidência acima (verde na íntegra após isolar os 6 timeouts de contenção,
  nenhum deles em arquivo tocado).
- [x] `npm run cromo-css-real:check` verde — 5/5.
- [x] Nenhum valor visual novo em hardcode — o único valor novo é o literal `'transparent'` (já usado
  identicamente em `SarakShell.tsx:89,181`, é o mesmo idioma que a linha substituída já tinha para o
  próprio fallback); nenhum token novo foi inventado.

**Decisões e suposições**
- **`useHasGlobalBackgroundMedia.ts` — arquivo novo, fora da lista literal da §3.1.** A instrução manda
  "espelhar a condição do `SarakShell`", mas `SarakShell` lê `design.globalBackgroundImageUrl` de dentro do
  próprio `shell` (via `useSarakShell`), e `SarakAppChrome` não tinha, antes desta execução, nenhuma leitura
  de `design` — só de tokens CSS e de `navigationStyle`/`device`. Implementar a condição inline exigiria
  duplicar a leitura de contexto que `useNavigationStyle.ts` já resolve para outro token, violando SRP/DRY
  do próprio arquivo que serviu de precedente. Além disso, `SarakAppChrome.tsx` já estava em 248 linhas
  (`wc -l`) — o teto de R9 é 250, cobrado por `auditor_cleancode.mjs`, que conta pela API do compilador TS
  (`getLineAndCharacterOfPosition` no EOF), **um a mais que `wc -l`** quando o arquivo termina em `\n`
  (confirmado comparando com a violação pré-existente de `validation.ts`: `wc -l` 276, auditor acusa 277).
  Qualquer lógica inline ultrapassaria o teto pela contagem real do gate. Optei por extrair um hook-irmão,
  no mesmo diretório e no mesmo formato de `useNavigationStyle.ts` (arquivo + teste), e por **inlinear a
  chamada do hook diretamente na expressão do `background`** (em vez de uma `const` intermediária usada uma
  única vez) para caber exatamente no teto: `SarakAppChrome.tsx` fechou em 249 linhas por `wc -l` (250 pela
  contagem do gate — confirmado por invocação direta de `auditor_cleancode.mjs`, sem ocorrência do
  arquivo). Interpretação conservadora do "padrão é piso, não meta" (§3 item 4 do prompt executor) sobre a
  leitura literal da §3.1; declarado aqui em vez de perguntar porque a alternativa (duplicar a leitura de
  contexto dentro do próprio arquivo listado) seria pior nível de conformidade, não melhor.
- **`className="sarak-chrome-root"` e `?bg=1` no harness** — o harness não tinha, antes, nenhuma forma de
  alcançar a raiz do cromo por um seletor estável nem de alternar `globalBackgroundImageUrl` em runtime.
  Considerei montar um SEGUNDO `SarakUIProvider`/`SarakAppChrome` na mesma página (par a par), mas o toggle
  do drawer mobile usa um `aria-label` literal fixo ("Abrir menu de navegação",
  `SarakAppChromeMobile.tsx:105`) — duas instâncias colidiriam nesse nome acessível e quebrariam a lógica
  existente de `openHarness()` (`drawerToggle.click()` falha com múltiplos matches). Optei por manter UM
  único App, alternando `globalBackgroundImageUrl` pela query string da própria página — zero duplicação,
  zero risco aos 3 testes existentes (mobile/tablet/desktop, que continuam sem `?bg=1` e portanto
  byte-a-byte no mesmo caminho de antes).
- **Marquei `status: "🟡 Em execução"` DEPOIS da primeira edição, não antes.** O ritual (§2 do prompt
  executor) manda marcar antes; nesta execução as primeiras edições (`SarakAppChrome.tsx`,
  `useHasGlobalBackgroundMedia.ts`) já tinham acontecido quando percebi a omissão. Corrigido assim que
  notado, mas registro aqui por honestidade processual — não houve impacto no resultado (nenhuma segunda
  execução concorrente desta MESMA plan aconteceu nesta janela), mas o desvio é real e cabe ao revisor
  julgar se pesa.

**Achados fora do escopo (não corrigidos)**
- 🔴 **O worktree já chegou com mudanças não commitadas e não relacionadas a esta plan** — presentes
  ANTES de qualquer edição minha (confirmado: nunca li nem editei nenhum dos arquivos abaixo nesta
  conversa). `git status`/`git diff --stat` no fim desta execução mostram, além dos 6 arquivos desta
  plan: `src/core/Provider/utils/validation.ts` (+35 linhas), `src/core/Design/hooks/useDesignVariables.ts`,
  `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx`, quatro componentes movidos de
  `src/core/Shell/Components/` (`ShellLanguageSelector`/`ShellSearchWidget`/`ShellThemeToggle`/
  `ShellUserWidget`) para `src/components/atomic/Navigation/`, `specs/plan/plan-62-...md` e
  `specs/plan/plan-63-...md` alterados, `sarak-ui/catalog.json`/`GUIA-FRONTEND.md`/`START-HERE.md`/
  `VERSION` alterados. Tudo compatível com outra sessão executando as plans 62/63 na mesma árvore, em
  paralelo a esta.
- Consequência direta: os dois excedentes do `npm run audit` contra o baseline —
  `auditor_hardcoded` (31 violações de Tailwind estrutural chumbado, todas nos três componentes movidos
  para `atomic/Navigation/`) e `auditor_cleancode` (`validation.ts`, 277 linhas pela contagem do gate) —
  estão inteiramente nesses arquivos alheios a esta plan. Nenhum dos dois é meu; não corrigi nenhum, por
  estarem fora do escopo declarado em §3.2 e por não serem meus para tocar (trabalho de terceiro em
  andamento).
- **Consequência para `dist/`/`sarak-ui/`:** `npm run cromo-css-real:check` builda antes de medir (é o
  próprio contrato do gate, §7.3 de [[11-testes-e-cobertura]]), e o build compila a ÁRVORE INTEIRA no
  estado em que estava — inclusive as mudanças de terceiro acima. O `dist/`/`sarak-ui/` no worktree, ao
  final desta execução, refletem a MINHA mudança **misturada** com o trabalho em andamento de outra sessão.
  Não tentei isolar/reverter isso (seria mexer no trabalho alheio), mas registro para o revisor não
  confundir o `git diff` de `dist/`/`sarak-ui/` com o escopo desta plan.

**Pendências / riscos**
- O `git diff --stat` completo do worktree, no estado em que este resumo é escrito, **não é só desta
  plan** — ver *Achados fora do escopo*. Ao revisar por `git diff --stat` (§7 desta plan), filtrar pelos 6
  arquivos listados em *Arquivos alterados* acima; o resto pertence a outra execução em andamento na mesma
  árvore.
- Nenhuma pendência própria desta plan: todos os critérios de aceite têm evidência, os dois gates pedidos
  (`vitest`, `cromo-css-real:check`) fecharam verdes, e a auditoria estrutural não regrediu no que esta
  execução tocou.

---

# 10. Veredito

## Veredito — 2026-09-09 — 🟢 Aprovado

### O que verifiquei, e como

- **A correção.** `SarakAppChrome.tsx:166` — o `background` do `rootStyle` passou a ser condicional a
  `useHasGlobalBackgroundMedia()`, espelhando `SarakShell.tsx:89,181`. O `...style` do consumidor continua
  por último. Os três ramos de geometria recebem o **mesmo** objeto `rootStyle` (`:177-247`), então nenhum
  ganhou caso especial — é o que o critério pedia, resolvido na origem.
- **Regra dos Hooks.** A chamada está dentro de um literal de objeto, o que é incomum. Conferi: `:166` vem
  depois de `useNavigationStyle()` (`:131`) e `useSarakDevice()` (`:132`) e **antes** do primeiro `return`
  (`:177`). É incondicional, em ordem estável. Correto.
- **O hook novo.** `useHasGlobalBackgroundMedia.ts` espelha `useNavigationStyle.ts` linha a linha — mesma
  pasta, mesma leitura de `UIContext`/`DesignOverrideContext`, mesma prioridade do override, mesma
  degradação fora do Provider. `components/` → `core/` é importação permitida, e o próprio
  `SarakAppChrome` já fazia isso com o hook irmão.
- **Testes de módulo.** Os 4 casos novos cobrem sem-mídia (literal do token inalterado), com-mídia
  (`transparent`), `style` do consumidor vencendo, e os três modos. O comentário sobre `container.firstChild`
  não ser a raiz do cromo sob Provider está certo e é a armadilha que faria o teste passar por engano.
  `SarakAppChrome.test.tsx` + `useHasGlobalBackgroundMedia.test.tsx` + o irmão: **44/44 verde**.
- **Medição em navegador.** `npm run cromo-css-real:check` → **5/5 verde**, com os dois testes novos
  (`SEM mídia…` e `COM mídia… 12.0s`) medidos contra o `dist/` recém-buildado. O limite 7 está declarado no
  cabeçalho, como a R18 exige, e ele é honesto: diz que não mede se a imagem carrega, só o
  `background-color` que a raiz emite.
- **Auditoria.** `npm run audit` — a única violação de `auditor_cleancode` é
  `src/core/Provider/utils/validation.ts` (277 linhas pela contagem do gate), que é **arquivo da plan-62**,
  não desta. `auditor_hardcoded` fechou em **0 duras**. Nada regrediu no que esta execução tocou.
- **Escopo.** Os 6 arquivos do resumo batem com o `git diff`. O resto do worktree é das plans 62, 63 e 65,
  conferido arquivo a arquivo.

### O escopo excedido — aprovado, e a falha é da plan, não da execução

Os dois arquivos novos em `src/core/Provider/` estão fora da lista literal da §3.1. **A justificativa
procede, e conferi cada perna dela:**

1. `SarakAppChrome` não lia `design` — só `navigationStyle` e `device`. A instrução *"espelhe a condição do
   `SarakShell`"* não tinha como ser cumprida literalmente, porque o Shell lê `design` por dentro do
   `useSarakShell`, que não existe neste componente.
2. O JSDoc de `useNavigationStyle.ts` diz, textualmente, **"nunca duplicar esta leitura de contexto"**.
   Implementar inline violaria a instrução escrita no arquivo que servia de precedente.
3. `SarakAppChrome.tsx` estava em 248 linhas, com teto de 250.

**A §3.1 desta plan estava incompleta, e isso é meu.** Ela listou o arquivo a mudar sem notar que a mudança
exigia uma leitura de contexto que o componente não tinha. O executor tomou o caminho conforme, declarou o
desvio e explicou. Não é escopo excedido sem justificativa — é lacuna da instrução, coberta pelo executor.

### Ressalva que os próximos executores precisam ter (registrada, não reprova)

`SarakAppChrome.tsx` fechou em **249 linhas por `wc -l`, 250 pela contagem do gate — exatamente no teto**.
As plans **66** e **67** editam este arquivo de forma substancial. Ambas vão precisar extrair antes de
acrescentar; a primeira linha nova o reprova. Vai para o [[00-backlog]] e para o contexto daquelas plans.

### Nota de processo

O `status: "🟡 Em execução"` foi marcado depois da primeira edição, e o executor se autodenunciou. É a
quarta ocorrência seguida (plans 58, 60, 63 e esta) e já é o achado 11 do [[00-backlog]] — a repetição
confirma que o defeito é do ritual, não de quem executa. Nada a corrigir aqui.

**Pode commitar** — observando que o worktree contém também as plans 62, 63 e 65, e que a plan-62 está,
neste momento, acima do baseline de `auditor_cleancode`.

---

# 11. Síntese
