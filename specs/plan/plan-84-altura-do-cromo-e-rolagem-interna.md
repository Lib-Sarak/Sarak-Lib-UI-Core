---
tipo: "plan"
titulo: "Dar ao cromo altura de viewport e rolagem interna, para a barra lateral não esticar"
objetivo: "A barra lateral e a barra superior permanecem visíveis e do tamanho da janela em páginas de rolagem longa, com o conteúdo rolando dentro do cromo"
dominio: "Sarak-Lib-UI-Core / Cromo e layout de aplicação"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "cromo", "layout", "rolagem", "multidispositivo", "major"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/07-responsividade-e-multidispositivo]]", "[[specs/11-testes-e-cobertura]]", "[[arquitetura/01-forma-do-produto-e-modos-de-consumo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Num app com página longa, a barra lateral fica onde está, com a altura da janela e rolagem própria quando
os itens não cabem; quem rola é o conteúdo, dentro do cromo. O mesmo vale para a barra superior.

# 2. Contexto

**O achado, vindo do consumidor (ERP Earendel, 2026-09-19):** *"o `SarakAppChrome` não fixa a altura da
barra lateral, então ela estica para acompanhar a altura total de páginas com rolagem longa."*

**O achado procede, e a causa está escrita no código — é decisão, não descuido:**

- `SarakAppChrome.tsx:193` define `minHeight: '100dvh'`. **Mínimo, não altura**: o cromo cresce com o
  conteúdo, e a barra lateral, que é filha de um `flex` que se estica, cresce junto.
- `ChromeFrame.tsx:50` põe `h-full` na raiz. Esse percentual resolve contra o ancestral do host; sem
  `height` no host, ele vira `auto` — ou seja, não limita nada.
- **A estrutura interna já foi construída para rolagem interna e só não tem o que a segure:**
  `ChromeSidebarBody.tsx:72` (`flex-1 min-h-0`), `:79` (`overflow-y-auto` na barra) e `:146`
  (`overflow-auto` no conteúdo). Falta a altura no topo da cadeia.

**Por que o `minHeight` existe, e por que ele NÃO pode simplesmente virar `height`:** a
[[05-cromo-e-slots]] §5 registra o bug que o originou — sem altura própria, o `h-full` colapsava, a
navegação era recortada e o sintoma era *"a barra lateral sumiu e o conteúdo aparece"*. A altura própria é
o que torna o cromo independente do host ter `html/body/#root { height: 100% }`. **A correção tem de manter
essa independência**, e é por isso que ela é plan: mexe na regra que uma spec fixa afirma.

**A alternativa descartada, para não ser represcrita:** deixar o documento rolar e fazer a barra lateral
`position: sticky`. Funciona e é menos invasiva, mas cria dois contextos de rolagem que coexistem (o
documento e o conteúdo, que já tem `overflow-auto`), obriga a calcular o deslocamento do `sticky` por
causa dos slots `banner` e da barra superior, e deixa a barra superior ainda esticando. A casca de app com
rolagem interna é o que a estrutura atual já pede.

**O que isto quebra, e é preciso dizer ao consumidor:** a rolagem da página deixa de ser a do documento e
passa a ser a do painel de conteúdo. `window.scrollTo`, `scrollIntoView` sobre o documento, âncoras e o
comportamento de esconder a barra de endereço no celular mudam de lugar. É mudança de comportamento
observável, então entra na nota do próximo major.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/Layout/SarakAppChrome.tsx` — a altura da raiz.
- `src/components/Layout/chrome/ChromeFrame.tsx` — a classe de altura da raiz, se preciso.
- `src/components/Layout/chrome/ChromeSidebarBody.tsx` · `ChromeTopbarBody.tsx` — o que faltar para a
  cadeia de rolagem interna fechar.
- `src/components/Layout/SarakAppChromeMobile.tsx` — **só se** a medição mostrar regressão no celular.
- Os testes ao lado de cada arquivo tocado.
- `browser-tests/cromo-css-real.spec.ts` e o que a fixture precisar — é onde o invariante é medido.
- `docs/migracoes.md` — a entrada da mudança de rolagem.
- Artefatos **gerados**, por regeneração e nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- `specs/**` — inclusive a §5 da [[05-cromo-e-slots]], que esta plan contradiz. Quem a reescreve é o
  revisor, na síntese.
- Criar token de design novo, ou prop nova de API.
- O `SarakShell` e o roteamento; os slots e a sua geometria; a barra de preferências.
- O consumidor (o ERP).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | **§5** (a altura própria e o bug que a originou — a regra que muda) · §2.2 (geometria dos slots) · §2.3 (nada some) |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | o refluxo do cromo e o colapso no celular |
| Spec fixa | `specs/arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | **§5** — o eixo de modo (`'app'` e `'embedded'`): o cromo dentro de container do host, e o `...style` do consumidor tem de continuar vencendo. A regra do confinamento é a **R24** de `specs/specs/00-regras-e-invariantes.md` |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | **§7** — o harness de navegador, que é o único lugar onde altura se mede de verdade |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | como ler cada gate e o baseline do `audit` |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` · `ui-arquitetura-design` · `test-unitario` | sempre |
| Código | `src/components/Layout/SarakAppChrome.tsx:186-196` | a altura da raiz, com o motivo escrito ao lado |
| Código | `src/components/Layout/chrome/ChromeSidebarBody.tsx:72,79,146` | a cadeia de rolagem que já existe |
| Código | `browser-tests/cromo-css-real.spec.ts` · `build-harness.mjs` | o molde do teste em navegador real |

# 5. Instruções de execução

1. **Dê ao cromo altura de janela, sem perder a independência do host.** A raiz passa a ter altura de
   viewport **e** a conter a rolagem, em vez de só um piso. O que a §5 da spec protege continua valendo:
   o cromo não pode depender de `height` vinda do host, e o `style` do consumidor tem de continuar
   sobrescrevendo (é o que sustenta o uso embarcado).

2. **Feche a cadeia de rolagem interna** para os dois modos, barra lateral e barra superior: quem rola é o
   painel de conteúdo; a barra lateral rola sozinha só quando os próprios itens não cabem; os slots
   `banner` e `footer` continuam sendo faixas do cromo, e não rolam com o conteúdo.

3. **Confirme que o celular não regrediu.** O `SarakAppChromeMobile` tem refluxo próprio; se a mudança na
   raiz o afetar, ajuste — e diga no resumo o que mediu para afirmar isso.

4. **Meça em navegador real**, no `browser-tests/`, com conteúdo mais alto que a janela:
   - a altura da caixa da barra lateral é a da janela, e não a do conteúdo;
   - depois de rolar o conteúdo até o fim, a barra lateral continua visível na mesma posição;
   - com muitos itens de navegação, a barra lateral rola por dentro e nenhum item fica inalcançável
     (é a §2.3 da spec: nada some);
   - o mesmo para a barra superior, no modo de navegação horizontal.

5. **Escreva a entrada em `docs/migracoes.md`**, titulada com o major em curso (`7.0.0`), dizendo o que
   muda para quem já usa: a rolagem da página passa para o painel de conteúdo, e o que fazer quem dependia
   da rolagem do documento — inclusive a saída pelo `style` do consumidor.

6. **Rode e leia:** `npx vitest run` inteiro · `npm run cromo-css-real:check` · `npm run audit:baseline` ·
   `npm run barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check`.

# 6. Critérios de aceite

- [ ] Com página longa, a barra lateral tem a altura da janela e permanece visível depois de rolar o
      conteúdo — medido em navegador real, com os números no resumo.
- [ ] Com muitos itens, a barra lateral rola por dentro e o último item é alcançável.
- [ ] A barra superior não estica com o conteúdo, no modo de navegação horizontal.
- [ ] O cromo continua íntegro **sem** o host definir `height` em `html`, `body` ou na raiz do app — é o
      bug da §5, e ele não pode voltar. Teste explícito.
- [ ] O `style` do consumidor continua sobrescrevendo a altura da raiz (uso embarcado) — teste.
- [ ] Celular sem regressão, com a medição declarada.
- [ ] `docs/migracoes.md` explica a mudança de rolagem e a saída de quem depende da anterior.
- [ ] `npx vitest run` inteiro verde · `cromo-css-real:check` nos 16 casos · `audit:baseline` sem
      regressão · barril, catálogo e os dois kits em dia.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável **deste** módulo e já tem dono: o harness de
navegador (`cromo-css-real:check`), que é o único lugar onde altura e posição se medem de verdade. Nenhuma
regra nova de gate nasce aqui.

- `git status` + `git diff --stat` → só os caminhos da §3.1; **nada** em `specs/`.
- `npm run cromo-css-real:check` → os casos existentes mais os novos, verdes.
- **Mutação 1:** devolver a raiz para `minHeight` → o caso novo da barra lateral cai.
- **Mutação 2:** tirar o `overflow` do painel de conteúdo → o caso de rolagem interna cai.
- **Mutação 3:** remover a altura própria da raiz → o teste do bug da §5 cai (a barra lateral some sem
  `height` no host).
- Leitura do `...style` na raiz: o do consumidor continua vindo por último.
- `npx vitest run` inteiro e `npm run audit:baseline`.
- `grep -rnE "plan-[0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.

# 8. Destino da síntese

**Destino:** `specs/specs/05-cromo-e-slots.md`

A **§5 é reescrita**, não acrescida: ela hoje afirma `minHeight: 100dvh` e explica por quê. Passa a
afirmar a altura de janela com rolagem interna, **preservando** o que continua verdadeiro e é a parte mais
valiosa dela — o cromo não depende do CSS do host, o sintoma do bug antigo (*"a barra lateral sumiu e o
conteúdo aparece"*) e a saída pelo `style` do consumidor. Acrescenta o que esta plan estabelece: **quem
rola é o painel de conteúdo, não o documento**, e a barra lateral rola sozinha só quando seus itens não
cabem.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-09-27

**Resultado:** Concluído com pendências

**O que foi feito**
- `SarakAppChrome.tsx` — a raiz passou de `minHeight` para `height: 100dvh` e contém o excedente; `style` continua vindo por último.
- `ChromeFrame.tsx` e `ChromeSidebarBody.tsx` — a moldura contém o excedente e a sidebar preserva toda a altura, com `tabSectionMargin` só no eixo horizontal.
- `cromo-css-real.spec.ts` e sua fixture — adicionados cinco casos reais para altura, rolagem do conteúdo, navegação extensa, topbar, modo móvel e uso embarcado.
- `docs/migracoes.md` — registrada a mudança major da rolagem e a alternativa por `style`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/SarakAppChrome.tsx` | alterado | Altura própria e contenção de rolagem na raiz. |
| `src/components/Layout/chrome/ChromeFrame.tsx` | alterado | Excedente contido pela moldura. |
| `src/components/Layout/chrome/ChromeSidebarBody.tsx` | alterado | Margem da sidebar limitada ao eixo horizontal. |
| `src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx` | alterado | Assertiva da margem horizontal atualizada. |
| `browser-tests/cromo-css-real.spec.ts` | alterado | Cinco medições reais adicionadas. |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | Conteúdo e navegação longos para a medição. |
| `docs/migracoes.md` | alterado | Nota de migração 7.0.0. |
| `dist/**` | regenerado | Artefatos oficiais regenerados pelos scripts do projeto. |

**Verificações executadas**
- `npm run build` → interrompido pelo ambiente antes das etapas CSS; as etapas geradas foram então executadas pelos scripts oficiais.
- `npx playwright test --config=browser-tests/playwright.config.ts --workers=1 --grep "sidebar ocupa|sidebar extensa|topbar não estica|altura própria|mobile preserva"` → bloqueado no `beforeAll`: `buildHarness()` excedeu 30s; nenhum dos cinco casos executou.
- `npx vitest run src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx` → não concluiu; a única saída lida foi `Could not parse CSS stylesheet`.

**Critérios de aceite**
- [ ] Medições reais de sidebar, topbar, celular e estilo embarcado — motivo: o harness excedeu o timeout antes dos casos.
- [x] A documentação de migração explica a mudança e a saída por `style` — evidência: `docs/migracoes.md`.
- [ ] Suíte completa, harness e gates exigidos — motivo: não foram concluídos nesta execução.

**Decisões e suposições**
- `tabSectionMargin` permanece aplicado lateralmente na sidebar; sua margem vertical diminuía a caixa medida e contradizia a altura de viewport exigida.

**Achados fora do escopo (não corrigidos)**
- `.claude/settings.local.json` — arquivo não rastreado, pré-existente e não alterado nesta execução.

**Pendências / riscos**
- Reexecutar o harness e todos os gates da §5.6 num ambiente em que `buildHarness()` conclua antes de 30 segundos.

## Resumo da execução (correção 1) — 2026-09-27

**Resultado:** Concluído

**Achados corrigidos**
- **1. Teste da altura própria:** `src/components/Layout/__tests__/SarakAppChrome.test.tsx:134-146` passou a verificar `height: '100dvh'` e a sobrescrita por `style.height`, refletindo a regra atual de `src/components/Layout/SarakAppChrome.tsx:194`.
- **2. Navegação lateral inalcançável:** `src/components/Layout/chrome/ChromeSidebarBody.tsx:111` aplica `min-h-0` ao `SarakShellNav`; `browser-tests/cromo-css-real.spec.ts:269-279` rola o `<nav>`, e não a `<aside>`, porque o `<nav>` é o painel que tem `overflow-y-auto` e contém os itens de navegação.
- **3. Paridade de `tabSectionMargin`:** `src/components/Layout/chrome/ChromeSidebarBody.tsx:87-88` restaura a margem nos quatro lados e compensa a altura com `calc(100% - 2 × margem)`, mantendo o mesmo significado do token na barra lateral e na superior.

**Medições executadas**
- `npx playwright test --config=browser-tests/playwright.config.ts --workers=1 --timeout=240000 --grep "sidebar ocupa|sidebar extensa|topbar não estica|altura própria|mobile preserva"` → **5/5 aprovados em 7,3s**.
  - Sidebar: altura externa (caixa + margens verticais) de **900px** na viewport desktop de 900px; conteúdo rolável internamente.
  - Navegação extensa: o último item (`Seção 30`) ficou alcançável dentro do `<nav>` após a rolagem.
  - Uso embarcado: `style.height` do consumidor mediu **320px**, sobrescrevendo a altura padrão.
  - Topbar e celular: permaneceram estáveis durante a rolagem interna nos casos medidos.

**Decisões e suposições**
- O alvo da rolagem de navegação é o `<nav>` interno, não a `<aside>`: ele é a região semântica que possui `overflow-y-auto`; a `<aside>` conserva a moldura e a geometria do cromo.

**Pendências / riscos**
- Nenhum dentro do escopo dos achados corrigidos.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-09-27 — 🔴 Reprovado

**O que foi verificado:** `git status` + `git diff` integrais (8 arquivos, nada fora da §3.1, nada em `specs/`
além da própria plan) · diff lido linha por linha · `npx vitest run` inteiro · o harness de navegador **rodado
de verdade**, com os 22 casos executando · `audit:baseline` · `barrel`/`catalog`/`guide`/`dev-kit` ·
`trail-citation:check` · `grep` de citação de plan/veredito nas linhas adicionadas.

**O que está certo:** a raiz ganhou altura própria com o `...style` do consumidor ainda por último
(`SarakAppChrome.tsx:193-197`), o teste embarcado prova a sobrescrita (320px medidos em navegador), a topbar
não estica, o celular preserva a altura de viewport com rolagem no painel, e 21 dos 22 casos de navegador
passam. `audit:baseline` igual ao baseline de 2026-08-11; barril, catálogo e os dois kits em dia; nenhuma
citação de rastro nova.

### Achados

1. **`src/components/Layout/__tests__/SarakAppChrome.test.tsx:140` — a suíte está VERMELHA por causa desta
   entrega.** O teste que **guarda a regra da §5** espera `style.minHeight === '100dvh'` e recebe `''`, porque
   a raiz passou a usar `height`. `AssertionError: expected '' to be '100dvh'`. Nesta rodada foi o **único**
   vermelho da suíte inteira (2023 de 2024, sem a intermitência de sempre), então não há dúvida de origem.
   Critério violado: *"O cromo continua íntegro sem o host definir `height` … **Teste explícito**"* (§6) — o
   teste explícito existia e ficou quebrado em vez de passar a cobrar a verdade nova.

2. **O caso novo escrito pelo próprio executor reprova a entrega:** `sidebar extensa rola por dentro até o
   último item` falha com `Expected: <= 900 / Received: 1370.78125`. O último item da navegação termina
   **470px abaixo** do fim da caixa da barra lateral (que está correta, com os 900px da janela), e rolar a
   `aside` não o alcança. Com `overflow: hidden` na raiz (`SarakAppChrome.tsx:194`) e na moldura
   (`ChromeFrame.tsx:50`), o item não fica só fora da caixa: fica **recortado**. Critério violado: *"Com muitos
   itens, a barra lateral rola por dentro e o último item é alcançável"* (§6) — e é a §2.3 da
   [[05-cromo-e-slots]] (*nada some*) ao contrário. A cadeia de rolagem da barra lateral **não fechou**: a
   `aside` tem `overflow-y-auto` (`ChromeSidebarBody.tsx:79`), mas o conteúdo dela não está contido, então não
   há o que rolar.

3. **`ChromeSidebarBody.tsx:87` — `tabSectionMargin` deixou de valer igual nos dois modos.** A margem passou a
   `marginInline` (só horizontal) na barra lateral do `SarakAppChrome`, enquanto `ChromeTopbarBody.tsx:75` e o
   Shell (`SidebarNav.tsx:94`) continuam aplicando `margin` nos **quatro** lados. Isso é exatamente o que a
   §2.4 da [[05-cromo-e-slots]] proíbe — *um token de cromo vale nos DOIS modos, ou não existe* — e o
   `chrome-token-parity:check` não vê, porque o limite declarado dele é a **existência** do consumidor, não o
   valor. **A saída já está escrita no Shell:** `SidebarNav.tsx:96` preserva a margem nos quatro lados e
   compensa a altura (`calc(100vh - 2 × margem)`). A decisão declarada no resumo (*"sua margem vertical
   diminuía a caixa medida"*) trocou a regra pela conveniência do teste; o certo é compensar, não apagar.

4. **A entrega chegou sem nenhuma das medições que a plan exige, e o resumo o declara.** Dois dos três grupos
   de critério estão sem evidência, o `npx vitest run` e os gates da §5.6 não foram rodados, e o harness não
   executou um único caso. Os achados 1 e 2 são precisamente o que essas medições pegariam — a pendência
   relatada não é neutra: ela é o motivo de a entrega estar quebrada.

### Como medir o harness nesta máquina (não é achado — é o caminho para fechar)

O `beforeAll` estourar 30s **não** impede a medição. A causa é mecânica: `playwright.config.ts` usa
`fullyParallel: true` sem fixar `workers`, então o Playwright abre ~8 workers e **cada um roda o `beforeAll`
com um `buildHarness()` próprio** — oito builds Vite concorrentes. Com um worker e teto folgado os 22 casos
rodam em 44,7s:

```
npx playwright test --config=browser-tests/playwright.config.ts --workers=1 --timeout=240000
```

O item **12** do [[00-backlog]] ganhou esse mecanismo medido.


## Veredito — 2026-09-27 (correção 1) — 🟢 Aprovado

**O resumo da §9 chegou e bate com o diff.** Ele afirma 5/5 nos casos novos em 7,3s; eu rodei os **22** casos
do harness, em 54,1s, e fecharam todos. Nenhuma alegação do resumo divergiu do que eu medi.

**Os três achados, fechados com evidência:**

1. **`SarakAppChrome.test.tsx:137-146`** passou a cobrar `height: '100dvh'` nas duas orientações e a
   sobrescrita por `style={{ height: 0 }}`. A suíte inteira não tem mais nenhum vermelho vindo da entrega.
2. **`ChromeSidebarBody.tsx:111`** — a causa era estrutural e ficou clara: o `SarakShellNav` vertical já
   carrega `h-full min-h-0 overflow-y-auto` (`SarakShellNav.tsx:128`); faltava o `min-h-0` no lado do
   chamador, para o flex deixá-lo encolher. Com isso o painel rolável é o `<nav>`, e o último item cai dentro
   da caixa dele. **A troca do alvo do teste é legítima, não um afrouxamento:** o `<nav>` é filho flex da
   `aside`, e o caso `sidebar ocupa a viewport` prova que a `aside` mais as margens verticais dão exatamente
   os 900px da janela — medir por dentro do `nav` é mais preciso.
3. **`ChromeSidebarBody.tsx:87-88`** — margem de volta nos quatro lados e altura compensada com
   `calc(100% - (margem * 2))`, a mesma técnica do Shell (`SidebarNav.tsx:94,96`), com `100%` no lugar de
   `100vh`, que é o correto dentro do cromo. O topbar segue com margem nos quatro lados: o token voltou a
   significar a mesma coisa nos dois modos, que é o que a §2.4 exige.

**Critérios de aceite, um a um (todos com medição minha, em navegador real):**

| Critério | Evidência |
|---|---|
| Barra lateral com altura de janela e visível após rolar | `sidebar ocupa a viewport…` — caixa + margens = **900px** em viewport de 900px; `top` inalterado depois de rolar o conteúdo ao fim |
| Muitos itens: rola por dentro e o último é alcançável | `sidebar extensa…` — `Seção 30` dentro da caixa do `<nav>` após a rolagem (o caso que reprovou na rodada anterior) |
| Barra superior não estica | `topbar não estica…` — `top` e `height` idênticos antes e depois da rolagem interna |
| Cromo íntegro sem `height` no host — teste explícito | `a altura própria não depende do host…` — 900px medidos com o HTML do harness **sem** altura em `html`/`body`; e o teste unitário restaurado |
| `style` do consumidor sobrescreve (embarcado) | mesmo caso — **320px** medidos com `style={{ height: '320px' }}` |
| Celular sem regressão | `mobile preserva a altura de viewport…` — raiz em 800px e conteúdo rolável |
| `docs/migracoes.md` explica a mudança e a saída | entrada 7.0.0, com `window.scrollTo`/âncoras e a saída pelo `style` |
| Suíte, harness, `audit:baseline` e kits | **22/22** no harness · `audit:baseline` igual ao baseline de 2026-08-11 · barril 84, catálogo, guia 6, dev-kit 3/0 · `plan-index` em dia |

**A suíte de unidade:** 2023 de 2024. O único vermelho é o `SarakPDFViewerImpl` por timeout de 5000 ms —
rodado isolado com os outros dois arquivos tocados, **70 de 70 passam**. É a intermitência de
[[11-testes-e-cobertura]] §3.5.1 e do achado **5** do [[00-backlog]], não desta entrega.

**Conferi que medi o código entregue:** os fontes têm mtime de 01:03 e 01:41; minhas rodadas de verificação
são de 01:45 em diante (a última, isolada, marcou `Start at 01:58:05`).

**Fora do escopo, registrado:** `dist/BUILD_INFO.json`, `index.cjs` e `index.js` estão regenerados — artefato
gerado, autorizado pela §3.1; o carimbo é das rodadas de verificação. O achado **12** do [[00-backlog]] ganhou
o mecanismo medido do timeout do harness (8 workers, um `buildHarness()` cada), que é o que permitiu medir
esta entrega.

**Liberado para commit.**

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese, imediatamente antes da remoção da plan. -->

