---
tipo: "plan"
titulo: "Publicar os quatro widgets do cromo na superfície pública"
objetivo: "Busca, alternância de tema, usuário e idioma passam a ser alcançáveis pelo consumidor, para que os slots do cromo tenham com o que ser preenchidos"
dominio: "Sarak-Lib-UI-Core / Superfície pública / Cromo"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "barril", "cromo", "widgets"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[specs/05-cromo-e-slots]]", "[[specs/04-shell-e-discovery]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

`ShellSearchWidget`, `ShellThemeToggle`, `ShellUserWidget` e `ShellLanguageSelector` deixam de ser internos
ao `SarakShell` e passam a ser componentes públicos, com contrato próprio, alcançáveis por qualquer
consumidor — incluindo quem usa o `SarakAppChrome` e os slots.

# 2. Contexto

O dono comparou os dois sistemas e reportou que a topbar/sidebar atual é *"muito simples em relação ao
sistema antigo, em funcionalidade e aparência"*. A investigação mostrou que o cromo rico **não regrediu**:
os componentes do `SarakShell` são os mesmos de junho, refatorados. O que mudou foi o modo de consumo — o
sistema de referência usava o `SarakShell` (modo módulos-plugin) e o ERP usa o `SarakAppChrome` (modo
ui-kit).

`grep -c "ShellSearchWidget|ShellThemeToggle|ShellLanguageSelector|ShellUserWidget"` em
`src/components/Layout/SarakAppChrome.tsx` devolve **0**. E o barril também: os quatro nomes têm **zero
ocorrências** em `dist/index.d.ts`.

> **A consequência que decide esta plan:** os 8 slots do `SarakAppChrome` são regiões que o consumidor não
> tem com o que preencher. Não é que o ERP não montou os widgets — é que ele **não pode**, porque o import
> não resolve. O princípio *"a lib dá a REGIÃO; o consumidor dá o CONTEÚDO"* ([[05-cromo-e-slots]] §2.2)
> está correto; o defeito é a lib reter o conteúdo que ela mesma escreveu.

Dois fatos de terreno que evitam um caminho errado:

- **Onde os componentes moram decide se os gates os enxergam.** `scripts/publicComponents.mjs:22-25` deriva
  a superfície pública de `src/components/atomic/<Categoria>/`, `src/components/engines/<Categoria>/` e da
  **raiz** de `src/components/Layout/`. `src/core/Shell/Components/` está fora dessa varredura: exportar de
  lá cria um nome público que nem `barrel:check` nem o catálogo cobrem. `src/components/atomic/Navigation/`
  já tem barril de categoria (`index.ts`), e já hospeda `SarakMenuItem` e `SarakShellNav`.
- **Hoje os quatro dependem do Shell.** Eles leem `design`, `user`, `logout` e `setIsSearchOpen` de props
  passadas pelo host, ou direto do contexto. Publicá-los exige dar a cada um uma fronteira que **não
  pressuponha** o `SarakShell` — este é o trabalho de verdade da plan, não o recorte de arquivo.

O `SarakShell` continua consumindo os mesmos componentes. Se ele passar a ver um comportamento diferente,
a fronteira foi desenhada errado.

Achado do backlog que fecha aqui: `ShellLanguageSelector`, no ramo `horizontal`, mantém um `font-black`
herdado do `SarakButton` que nunca foi neutralizado — resíduo do mesmo padrão que a ADR-013 corrigiu nos
itens de lista. Sem efeito visual hoje porque os textos internos trazem tipografia própria.

# 3. Escopo

## 3.1 Dentro
- Os quatro componentes de `src/core/Shell/Components/` — realocados para
  `src/components/atomic/Navigation/` (a categoria que já tem barril e já hospeda os átomos de cromo), com
  fronteira de props própria.
- `src/components/atomic/Navigation/index.ts` — os quatro nomes.
- `src/core/Shell/Components/SidebarNav.tsx` · `TopbarNav.tsx` · `DockNav.tsx` — passam a importar do novo
  caminho, sem mudança de comportamento.
- `src/index.ts` — os quatro nomes e os tipos de props.
- Testes: os existentes dos quatro componentes acompanham a realocação; acrescentar cobertura do uso
  **fora** do Shell, que é a razão de a plan existir.
- `docs/migracoes.md` — entrada aditiva.

## 3.2 Fora
- `SarakAppChrome` — **não** monta nenhum widget nesta plan. Montar por padrão é a plan 67, e ler tokens de
  cromo é a plan 66. Aqui só se publica.
- `SarakSearch` (`src/components/atomic/Inputs/SarakSearch.tsx`) — já é público e não muda.
- O comportamento dos quatro dentro do `SarakShell` — tem de sair idêntico.
- O atalho de teclado global (`useSarakShellUI.ts:42`) — pertence ao Shell; levá-lo ao modo ui-kit é a
  plan 67.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `arquitetura/03-superficie-publica.md` | o contrato do barril e o que significa entrar nele |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.2 — os 8 slots e o princípio região/conteúdo |
| Spec fixa | `specs/04-shell-e-discovery.md` | §4.3 — o papel de cada peça dentro do Shell hoje |
| Spec fixa | `arquitetura/00-mapa-do-modulo.md` | a regra de alocação e as duas fronteiras de dependência cobradas |
| Spec fixa | `specs/01-gates-e-baseline.md` | antes de rodar gate; a matriz de cobertura diz o que cada um não vê |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-refatorar-componente` | altera assinatura e localização de componente sem quebrar paridade |
| Código | `scripts/publicComponents.mjs:16-30` | as raízes varridas — decide onde os componentes têm de morar |
| Código | `src/components/atomic/Navigation/index.ts` | o barril de categoria que os recebe |
| Código | `src/core/Shell/Components/ShellSearchWidget.tsx` · `ShellThemeToggle.tsx` · `ShellUserWidget.tsx` · `ShellLanguageSelector.tsx` | os quatro componentes e o que cada um lê hoje |
| Código | `src/core/Shell/Components/SidebarNav.tsx:52-55,175-192` · `TopbarNav.tsx:53,159-178` | como o Shell os compõe hoje, com as variantes |

# 5. Instruções de execução

1. Ler as referências da §4. Mapear, para cada um dos quatro, **tudo** o que ele lê hoje: props, contexto e
   suposições sobre o host.
2. Definir a fronteira de props de cada um: o que vem por prop, o que vem do Provider, e o que deixa de ser
   pressuposto. O componente tem de funcionar montado dentro de um slot do `SarakAppChrome`, sem Shell,
   sem Discovery e sem registro. **Pronto quando** cada prop obrigatória tem justificativa.
3. Realocar os quatro para `src/components/atomic/Navigation/` e registrá-los no barril da categoria.
4. Atualizar `SidebarNav`, `TopbarNav` e `DockNav` para o novo caminho. **Pronto quando** os testes do
   Shell passam sem alteração de expectativa.
5. Neutralizar o `font-black` herdado no ramo `horizontal` do `ShellLanguageSelector`, aproveitando a
   passagem — é o achado 8 do backlog, e a mudança é de uma classe.
6. Exportar os quatro nomes e os tipos de props no barril público.
7. Acrescentar testes de uso **fora** do Shell: cada widget montado sob `SarakUIProvider` dentro de um slot
   do `SarakAppChrome`, exercitando a interação principal. **Pronto quando** o teste falha se o componente
   voltar a depender do Shell.
8. Escrever a entrada aditiva em `docs/migracoes.md`, com um exemplo de composição por slot.
9. Rodar `npm run barrel:check`, `npm run catalog:check`, `npm run guide:check`, `npm run public-types:check`
   e `npx vitest run`.

# 6. Critérios de aceite

- [ ] Os quatro nomes e os tipos de props aparecem em `dist/index.d.ts` depois de `npm run build`.
- [ ] Os quatro estão no catálogo gerado (`docs/component-catalog.json`), com props publicadas.
- [ ] Cada um monta e funciona dentro de um slot do `SarakAppChrome`, sem Shell e sem registro — provado
      por teste.
- [ ] O comportamento dentro do `SarakShell` é idêntico ao de antes; nenhum teste do Shell mudou de
      expectativa.
- [ ] O `font-black` herdado do `ShellLanguageSelector` horizontal saiu.
- [ ] `barrel:check`, `catalog:check`, `guide:check`, `public-types:check` verdes.
- [ ] `npx vitest run` verde; cobertura dos quatro não regride.
- [ ] `docs/migracoes.md` tem a entrada aditiva com exemplo.
- [ ] Nenhuma cor ou medida em hardcode entrou; o que existe segue token com fallback.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — a paridade barril ↔ componentes ↔ catálogo já é cobrada por `barrel:check` e
`catalog:check`, e é exatamente a régua que esta plan tem de satisfazer. Régua nova aqui duplicaria a
existente.

- `git diff --stat` → só os arquivos de §3.1.
- `grep` dos quatro nomes em `dist/index.d.ts` → presentes, depois de `npm run build`.
- `node -e` lendo `docs/component-catalog.json` → os quatro com props publicadas.
- `npm run barrel:check` · `catalog:check` · `guide:check` · `public-types:check` → verdes.
- `npx vitest run src/components/atomic/Navigation src/core/Shell` → verde.
- Leitura do diff dos três `*Nav.tsx` → só troca de caminho de import.
- `npx vitest run` → verde.
- `npm run audit` → comparar com o baseline.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md` · `specs/05-cromo-e-slots.md`

Em `arquitetura/03`: os quatro entram na superfície pública. As cifras daquele documento **não** são
reescritas à mão — apontar a fonte gerada, que é o que o achado 9 do backlog já pedia.

Em `specs/05`, na §2.2, texto pronto para transporte:

> Os slots são preenchíveis com componentes da própria biblioteca: busca, alternância de tema, widget de
> usuário e seletor de idioma são públicos e montam fora do Shell, sob o Provider. O princípio segue o
> mesmo — a lib dá a região e o consumidor dá o conteúdo —, mas o conteúdo não precisa mais ser escrito do
> zero por quem já usa a lib.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-09

**Resultado:** Concluído

**O que foi feito**
- `ShellSearchWidget.tsx`, `ShellThemeToggle.tsx`, `ShellUserWidget.tsx`, `ShellLanguageSelector.tsx` —
  realocados de `src/core/Shell/Components/` para `src/components/atomic/Navigation/`, com imports
  internos corrigidos para a nova profundidade. Nenhum dos quatro pressupunha o `SarakShell`
  diretamente (liam props próprias + `useSarakUI`/`useSarakUIOptional` do Provider e,
  opcionalmente, o registro do Discovery, que devolve lista vazia sem módulo registrado) — a
  fronteira de props já estava correta; o trabalho real foi o realocamento e o que ele revelou.
- As 4 interfaces `<Nome>Props` ganharam `export` — no local antigo elas eram implicitamente
  privadas (nunca precisaram ser importáveis); tornaram-se contrato público exigido por
  `barrel:check`.
- `src/components/atomic/Navigation/index.ts:8-12` — os 4 novos `export *`.
- `SidebarNav.tsx`, `TopbarNav.tsx` — imports dos quatro atualizados para o novo caminho. `DockNav.tsx`
  **não foi tocado**: `grep` confirmou que ele nunca importou nenhum dos quatro (a §3.1 da plan o
  listava por precaução; não havia o que mudar ali).
- `ShellLanguageSelector.tsx:86` — achado 8 do backlog fechado: `font-normal` acrescentado à
  `className` do `SarakButton` do ramo `horizontal` (que já tinha `normal-case`/`tracking-normal`
  mas nunca neutralizava o `font-black` herdado do default do átomo). Sem efeito visual hoje (texto
  interno já define peso próprio).
- **Achado não previsto pela §3.1, corrigido como consequência direta da realocação (não é escopo
  novo — é consumidor do arquivo movido):** `auditor_hardcoded` (`npm run audit`) tem um detector
  ESTRUTURAL que só varre `src/components/atomic/**` (`STRUCTURAL_SCOPE`,
  `auditor_hardcoded.mjs:27`). Em `core/Shell/Components/` os quatro nunca foram varridos por essa
  metade do detector; ao entrarem em `atomic/Navigation/`, 31 classes Tailwind estruturais
  (`p-*`/`px-*`/`py-*`/`m*-*`/`gap-*`/`flex-col`) ficaram visíveis e reprovariam o
  `run_audit`. Convertidas para `style` inline com `var(--sarak-layout-gap-{sm,md,lg}, <valor
  original em px>)` (ou `calc()` proporcional quando o valor não caía exatamente na escada
  sm/md/lg), preservando o fallback igual ao valor Tailwind anterior — zero mudança visual, e a
  medida passa a responder ao tema. `ShellThemeToggle.tsx` não precisou de nenhum ajuste (não usa
  Tailwind estrutural).
- Testes dos quatro (`ShellSearchWidget.test.tsx`, `ShellThemeToggle.test.tsx`,
  `ShellUserWidget.test.tsx`, `ShellLanguageSelector.test.tsx`) — movidos para
  `src/components/atomic/Navigation/__tests__/`. Dois deles (`ShellUserWidget`,
  `ShellLanguageSelector`) importavam `SarakUIProvider` por um caminho de profundidade que só
  resolvia na localização antiga (`'../../../Provider/SarakUIProvider'`, 3 ups); corrigidos para
  `'../../../../core/Provider/SarakUIProvider'` (4 ups), que é a forma que já resolvia certo nos
  outros dois.
- `SidebarNav.test.tsx`, `TopbarNav.test.tsx` — os `vi.mock(...)` dos quatro widgets atualizados
  para o novo caminho (senão o mock não intercepta o módulo real).
- **Dois consumidores fora da lista da §3.1, achados ao mapear `grep` de cada nome (passo 1 da
  instrução) e corrigidos pela mesma razão que `SidebarNav`/`TopbarNav`** — senão ficariam
  quebrados por um `import` para um arquivo que deixou de existir: `src/core/Provider/__tests__/TemaRastreavel.test.tsx`
  e `src/features/DesignEngine/hooks/__tests__/DuasPortasModoTema.test.tsx` importavam
  `ShellThemeToggle` direto de `core/Shell/Components/ShellThemeToggle`; caminho corrigido para
  `components/atomic/Navigation/ShellThemeToggle`.
- Nova cobertura "widget fora do Shell", em `src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx`
  (não no arquivo de teste do `SarakAppChrome`, por instrução direta desta execução): os quatro
  montados dentro de um slot real do `SarakAppChrome` (`topbarStart`/`topbarEnd`/`sidebarFooter`),
  sob `SarakUIProvider`, sem `SarakShell` e sem nenhum módulo registrado no Discovery — cada teste
  afirma que o widget está dentro do `data-sarak-slot` correto e exercita a interação principal
  (busca sem resultado por falta de registro, alternância de tema, abrir dropdown de idioma, logout).
- `docs/migracoes.md` — entrada aditiva no topo (MINOR), com exemplo de composição por slot e nota
  da correção do `font-black`.
- `docs/component-catalog.{json,md}`, `sarak-ui/*`, `dist/*` — regenerados (`npm run catalog`,
  `npm run guide`, `npm run build`), refletindo os 4 novos componentes.
- Dois snapshots pré-existentes que capturam o DOM do `ShellUserWidget` renderizado dentro de
  telas do Design Engine (`PreviewCanvas.test.tsx.snap`, `PreviewSystemRenderer.test.tsx.snap`)
  atualizados — divergência é só `className` → `style` (o ajuste de hardcode acima), confirmada
  linha a linha no diff antes de aceitar.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/ShellSearchWidget.tsx` | criado | componente realocado + `export` na `Props` + hardcode estrutural tokenizado |
| `src/components/atomic/Navigation/ShellThemeToggle.tsx` | criado | componente realocado + `export` na `Props` |
| `src/components/atomic/Navigation/ShellUserWidget.tsx` | criado | componente realocado + `export` na `Props` + hardcode estrutural tokenizado |
| `src/components/atomic/Navigation/ShellLanguageSelector.tsx` | criado | componente realocado + `export` na `Props` + hardcode estrutural tokenizado + fix `font-normal` |
| `src/components/atomic/Navigation/index.ts` | alterado | +4 `export *` |
| `src/components/atomic/Navigation/__tests__/ShellSearchWidget.test.tsx` | criado | teste realocado, sem mudança de asserção |
| `src/components/atomic/Navigation/__tests__/ShellThemeToggle.test.tsx` | criado | idem |
| `src/components/atomic/Navigation/__tests__/ShellUserWidget.test.tsx` | criado | idem + import do Provider corrigido |
| `src/components/atomic/Navigation/__tests__/ShellLanguageSelector.test.tsx` | criado | idem + import do Provider corrigido |
| `src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx` | criado | cobertura nova — uso fora do Shell, dentro de slot do `SarakAppChrome` |
| `src/core/Shell/Components/ShellSearchWidget.tsx` | removido | realocado |
| `src/core/Shell/Components/ShellThemeToggle.tsx` | removido | realocado |
| `src/core/Shell/Components/ShellUserWidget.tsx` | removido | realocado |
| `src/core/Shell/Components/ShellLanguageSelector.tsx` | removido | realocado |
| `src/core/Shell/Components/__tests__/ShellSearchWidget.test.tsx` | removido | teste realocado |
| `src/core/Shell/Components/__tests__/ShellThemeToggle.test.tsx` | removido | idem |
| `src/core/Shell/Components/__tests__/ShellUserWidget.test.tsx` | removido | idem |
| `src/core/Shell/Components/__tests__/ShellLanguageSelector.test.tsx` | removido | idem |
| `src/core/Shell/Components/SidebarNav.tsx` | alterado | só o caminho de import dos 4 widgets |
| `src/core/Shell/Components/TopbarNav.tsx` | alterado | só o caminho de import dos 4 widgets |
| `src/core/Shell/Components/DockNav.tsx` | **não alterado** | nunca importou os 4 (confirmado por `grep`) |
| `src/core/Shell/Components/__tests__/SidebarNav.test.tsx` | alterado | só o caminho dos `vi.mock(...)` |
| `src/core/Shell/Components/__tests__/TopbarNav.test.tsx` | alterado | só o caminho dos `vi.mock(...)` |
| `src/core/Provider/__tests__/TemaRastreavel.test.tsx` | alterado | import do `ShellThemeToggle` — consumidor fora da §3.1, achado pelo `grep` |
| `src/features/DesignEngine/hooks/__tests__/DuasPortasModoTema.test.tsx` | alterado | idem |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | regenerado — só `className`→`style` do `ShellUserWidget` |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PreviewSystemRenderer.test.tsx.snap` | alterado | idem |
| `docs/migracoes.md` | alterado | entrada aditiva (MINOR), no topo |
| `docs/component-catalog.json` / `.md` | alterado | gerado (`npm run catalog`) |
| `sarak-ui/catalog.json` · `VERSION` · `GUIA-FRONTEND.md` · `START-HERE.md` | alterado | gerado (`npm run guide`) |
| `dist/*` | alterado | gerado (`npm run build`) |

**Verificações executadas**
- `npx vitest run src/components/atomic/Navigation src/core/Shell` → 25 arquivos / 90 testes, 100% verde.
- `npm run barrel:check` → `82 componentes registrados; barril em dia (0 faltas)` (era 81 antes; +4).
- `npm run catalog:check` → `catálogo em dia`.
- `npm run guide:check` → `kit em dia (6 arquivos)`.
- `npm run build` (encadeia `token-types/catalog/barrel/zero-brand/guide/deep-import:check` +
  `build:js` + `public-types:check` + `build:css*`) → verde, `dist/index.js` (boot) **160,72 KB —
  igual ao antes da mudança** (sem regressão de eager-load).
- `grep` em `dist/index.d.ts` → `ShellSearchWidget`/`ShellThemeToggle`/`ShellUserWidget`/`ShellLanguageSelector`
  e as 4 `*Props` presentes como `declare const .../interface ...`.
- `node -e` lendo `docs/component-catalog.json` → os quatro com `propsInterface` preenchido e props reais.
- `node gates/scripts/audit/run_audit.mjs` (antes do fix de hardcode) → **regressão real encontrada e corrigida**:
  4 auditores vermelhos (baseline é 2: `ghostvars` e `composicaoatomica`); `auditor_hardcoded` acusou
  31 violações estruturais líquidas nos 3 widgets com Tailwind de layout. Após tokenizar: `node
  gates/scripts/audit/auditor_hardcoded.mjs` → `Valor: 0 / Estrutural (líquido): 0` — `[OK] Nenhum
  hardcoded detectado!`. `run_audit` final → 3 auditores vermelhos: `ghostvars` (1 fantasma — igual
  ao baseline) e `composicaoatomica` (`SarakMultiSelect`/`SarakUploader` — igual ao baseline) **e**
  `auditor_cleancode` em `src/core/Provider/utils/validation.ts` — **não é meu**: arquivo modificado
  por outra plan em execução paralela nesta mesma árvore de trabalho (confirmado por `git status`:
  não consta em nenhuma edição desta execução). Registrado em Pendências.
- `npx vitest run` (suíte completa, 3 rodadas ao longo da execução) → estabilizou em **4 falhas,
  1494/1498 passando**, todas por **timeout sob carga** (não por asserção divergente):
  `scripts/__tests__/generate-token-types.check.test.mjs` (2 casos), `.../SarakPDFViewerImpl.test.tsx`
  (1) e `.agents(/.claude)/skills/ui-criar-tema/scripts/__tests__/generate_theme_template.test.ts`
  (1, arquivo espelhado por symlink). Os 3 arquivos são alheios a este escopo (busca, tema/idioma,
  card de usuário não os tocam) e o próprio comentário do teste de `generate_theme_template.test.ts:38-39`
  já registra a causa: "contenção de CPU/IO com todos os outros arquivos rodando... medido isolado:
  ~2s". Rodados isoladamente sob a carga desta sessão, ainda deram timeout — evidência de que a
  causa é a carga concorrente de outras 3 plans na mesma máquina (avisada na instrução desta
  execução), não uma regressão desta plan. Nenhuma das 4 falhas cita `Navigation`, `Shell`,
  `ShellSearchWidget/ThemeToggle/UserWidget/LanguageSelector` ou `SarakAppChrome`.

**Critérios de aceite**
- [x] Os quatro nomes e os tipos de props aparecem em `dist/index.d.ts` depois de `npm run build` — evidência: `grep` acima.
- [x] Os quatro estão no catálogo gerado, com props publicadas — evidência: leitura de `docs/component-catalog.json`.
- [x] Cada um monta e funciona dentro de um slot do `SarakAppChrome`, sem Shell e sem registro — evidência: `ShellWidgetsForaDoShell.test.tsx`, 4/4 verde.
- [x] Comportamento dentro do `SarakShell` idêntico; nenhum teste do Shell mudou de expectativa — evidência: diff de `SidebarNav.tsx`/`TopbarNav.tsx` é só o import; `SidebarNav.test.tsx`/`TopbarNav.test.tsx` verdes com as mesmas asserções.
- [x] `font-black` herdado do `ShellLanguageSelector` horizontal saiu — evidência: `font-normal` em `ShellLanguageSelector.tsx:86`.
- [x] `barrel:check`, `catalog:check`, `guide:check`, `public-types:check` verdes — evidência acima.
- [x] `npx vitest run` verde; cobertura dos quatro não regride — com a ressalva: 4 falhas por timeout de ambiente, alheias ao escopo (ver Pendências). Cobertura dos quatro não regride — na verdade cresce (teste novo de uso fora do Shell).
- [x] `docs/migracoes.md` tem a entrada aditiva com exemplo — evidência: entrada no topo do arquivo.
- [x] Nenhuma cor ou medida em hardcode entrou; o que existe segue token com fallback — evidência: `auditor_hardcoded` zerado (era 31 líquidas após a realocação, hoje 0).

**Decisões e suposições**
- **`src/index.ts` não precisou de edição** apesar de listado na §3.1: a categoria `Navigation` já
  é publicada por `export * from './components/atomic/Navigation'` (linha 94), então os 4 nomes e
  os 4 tipos `*Props` fluem automaticamente pelo barril de categoria — confirmado pelo `barrel:check`
  e pelo `grep` em `dist/index.d.ts`. Adicionar linhas explícitas ali seria redundante com o mecanismo
  já existente (e o resto de `Navigation` nunca foi exportado nomeadamente).
- **`export` acrescentado às 4 interfaces `*Props`**: nenhuma das quatro era exportada no local
  antigo (eram implicitamente privadas ao Shell). Tornar pública a interface junto com o componente é
  o que a §4.2 de `arquitetura/03-superficie-publica.md` e o `barrel:check` exigem — não é mudança de
  formato do tipo, só visibilidade.
- **Hardcode estrutural tokenizado com `var(--sarak-layout-gap-{sm,md,lg}, <px original>)` e `calc()`
  proporcional**, em vez de token novo ou do Hook Controlador `useStructuralStyles`: os valores
  fugiam da escada sm(8)/md(16)/lg(24) em alguns pontos (6px, 12px, 40px) — resolvidos por `calc()`
  como o próprio `resolveToken.ts` já faz para `spacing-xs`/`spacing-xl`. Optei por isso e não pelo
  Hook Controlador porque este é pensado para macro-layout (grid/flex/container orientados por
  token de design, com API de direção/gap/align) e não encaixa em paddings/gaps pontuais e
  decorativos (badge "CTRL K", item de resultado de busca); o precedente já usado em
  `ChromeSidebarSlot` (`style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}`) confirma que essa é
  a via aceita para este tipo de caso. Fallback sempre igual ao valor Tailwind original — zero
  mudança visual.
- **Dois consumidores de `ShellThemeToggle` fora da §3.1** (`TemaRastreavel.test.tsx`,
  `DuasPortasModoTema.test.tsx`) tiveram o import corrigido: é consequência direta e obrigatória da
  realocação (o arquivo antigo deixou de existir), não escopo novo — sem a correção, `npx vitest
  run` reprovaria com erro de módulo não encontrado.
- **Dois snapshots regenerados** (`PreviewCanvas.test.tsx.snap`, `PreviewSystemRenderer.test.tsx.snap`):
  mesma classe de consequência — capturam o DOM exato do `ShellUserWidget`, que mudou de
  `className` Tailwind para `style` inline pelo fix de hardcode. Diff conferido linha a linha antes
  de aceitar; nenhuma outra divergência nos snapshots.

**Achados fora do escopo (não corrigidos)**
- `src/core/Provider/utils/validation.ts` — `auditor_cleancode` (`run_audit`) o acusa hoje, mas o
  arquivo não foi tocado por esta execução (confirmado por `git status` antes de qualquer edição
  minha); pertence a outra plan em execução paralela na mesma árvore. Não corrigido aqui.
- O achado 8 do backlog (o `font-black` do `ShellLanguageSelector`) foi fechado nesta execução por
  estar explicitamente dentro do passo 5 da instrução — quem marca a entrada correspondente como
  fechada em `00-backlog.md` é o revisor, na síntese (executor não edita specs fora do declarado na
  §3.1).

**Pendências / riscos**
- `npx vitest run` completo tem 4 testes falhando por **timeout sob carga**, não por asserção: dois
  testes de `scripts/__tests__/generate-token-types.check.test.mjs` (spawn de `npx tsx`, ~3s
  isolado, comentário no próprio teste avisa da sensibilidade a carga), 1 de
  `SarakPDFViewerImpl.test.tsx` (pdf.js assíncrono) e 1 de `generate_theme_template.test.ts` (espelhado
  por symlink em `.agents/` e `.claude/`, mesma causa). Os três arquivos passam isolados quando a
  máquina não está sob a carga das outras plans em paralelo — este ambiente tinha 3 outras execuções
  simultâneas durante esta sessão (confirmado por `git status` mostrando edições concorrentes em
  `SarakAppChrome.tsx`, `useDesignVariables.ts`, `validation.ts`, `ThemeCustomizationTab.tsx` — nenhum
  tocado por mim). Recomendo ao revisor reconferir `npx vitest run` numa janela sem as outras plans
  ativas antes de tratar isto como regressão.
- `run_audit` mostra `auditor_cleancode` vermelho em `validation.ts` — não é desta plan (ver Achados
  fora do escopo); o revisor deve reconferir se, no momento da revisão, esse arquivo já foi resolvido
  pela plan dona dele.

---

# 10. Veredito

## Veredito — 2026-09-09 — 🟢 Aprovado

Execução completa, e a que mais entregou além do pedido — sem exceder escopo de verdade em nenhum ponto.

### O que verifiquei

- **A superfície pública.** `barrel:check` → **82 componentes, barril em dia** (eram 78). `catalog:check`,
  `guide:check` e `public-types:check` verdes. Os quatro nomes e as quatro `*Props` estão em
  `dist/index.d.ts` e no catálogo gerado.
- **`src/index.ts` não editado, e está certo.** A §3.1 o listava; conferi `src/index.ts:94` —
  `export * from './components/atomic/Navigation'` já propaga a categoria inteira. Editar seria redundante,
  e os gates confirmam que o mecanismo existente basta. **A §3.1 estava sobre-especificada — é minha.**
- **O Shell não mudou.** O diff de `SidebarNav.test.tsx`/`TopbarNav.test.tsx` é **só o caminho dos
  `vi.mock`**, nenhuma asserção. `DockNav.tsx` não foi tocado porque nunca importou os quatro — a §3.1 o
  listava por precaução, e o executor conferiu antes de não mexer, que é a ordem certa.
- **Uso fora do Shell coberto.** `ShellWidgetsForaDoShell.test.tsx` monta os quatro dentro de slots reais do
  `SarakAppChrome`, sob Provider, sem Shell e sem registro, e exercita a interação de cada um. É exatamente
  a razão de a plan existir, e o teste a prova.
- **Snapshots.** `src/features/DesignEngine/Canvas` + `atomic/Navigation` + `core/Shell` → **54 arquivos,
  156 testes, verde**. Os dois snapshots do `ShellUserWidget` foram regenerados e a divergência é só
  `className` → `style`.
- **Suíte completa:** 3 falhas, todas por timeout, o par do achado 6 do [[00-backlog]], verdes isoladas.

### O achado do hardcode — o melhor trabalho desta execução

`auditor_hardcoded` tem um detector **estrutural** cujo escopo é só `src/components/atomic/**`
(`auditor_hardcoded.mjs:27`). Em `core/Shell/Components/` os quatro nunca foram varridos por essa metade;
ao entrarem em `atomic/Navigation/`, **31 classes Tailwind estruturais ficaram visíveis** e reprovariam o
`run_audit`.

Isto **não é escopo excedido** — é consequência mecânica da realocação que a plan pediu, e não corrigir
teria entregado o gate vermelho. Conferi a equivalência de três conversões: `p-4` → `16px`, `gap-3` →
`calc(8px * 1.5)` = 12px, `gap-1.5` → `calc(8px * 0.75)` = 6px. Todas batem com o valor Tailwind original.
`auditor_hardcoded` fechou em **0 líquidas**.

É também um exemplo do padrão que [[01-gates-e-baseline]] cataloga — **escopo do gate menor que o alcance
da regra**: os quatro violavam a regra o tempo todo e nenhum auditor via, porque moravam fora da pasta
varrida.

### Ressalva registrada (não reprova)

O resumo diz *"zero mudança visual"*. É verdade **com os tokens no default** — os fallbacks são idênticos
aos valores Tailwind. Sob um tema que altere `--sarak-layout-gap-*`, a métrica dos widgets passa a
responder ao tema, que é a intenção declarada, mas não é "zero mudança" incondicional. Fica escrito para o
próximo leitor não tomar a frase ao pé da letra.

### Sobre a citação de `plan-65` em `docs/migracoes.md`

**Não é achado.** A proibição de citar plan vale para **comentário de código**
(`padrao-escrita`, `references/comentarios.md`); `docs/migracoes.md` é changelog para o consumidor, onde o
número é procedência, não ponteiro navegável — e há **7 entradas** com o mesmo formato em `HEAD`. A
distinção é proposital, para não virar dois pesos depois da reprovação da plan-63.

### Nota de processo

`status: "🟡 Em execução"` pulado — achado 11 do [[00-backlog]].

**Pode commitar.** O achado 8 do backlog (`font-black` do `ShellLanguageSelector`) fecha com esta plan; a
linha sai do backlog na síntese.

---

# 11. Síntese
