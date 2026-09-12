---
tipo: "plan"
titulo: "Preferências do usuário como camada separada do tema"
objetivo: "O que um usuário escolhe para si deixa de reescrever o tema do sistema inteiro — a escolha dele vale só para ele, e o tema continua sendo do administrador"
dominio: "Sarak-Lib-UI-Core / Provider / Design Engine"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "preferencias", "persistencia", "design-engine", "major", "adr"]
relacionados: ["[[specs/09-temas-e-presets]]", "[[specs/05-cromo-e-slots]]", "[[specs/10-seguranca-e-acessibilidade]]", "[[adr/009-persistencia-tenant-aware]]", "[[adr/011-tema-salvo-por-uma-porta-de-escrita]]", "[[adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]"]
depende_de: ""
retida_por: ""
destino_sintese: "adr/NNN-preferencias-do-usuario-separadas-do-tema.md · specs/09-temas-e-presets.md"
---

# 1. Objetivo

Existe uma camada de **preferências do usuário**, separada do tema: aplicada por cima dele na hora de
renderizar, guardada por usuário, e **nunca** gravada no tema. O tema continua sendo do administrador e
decide o que o usuário pode personalizar.

# 2. Contexto

O dono quer que o usuário final personalize a barra — claro/escuro, tamanho da fonte, barra no topo ou na
lateral, idioma — com uma regra de acesso clara: *"apenas o administrador terá acesso à aba de
personalização, o usuário final apenas utilizará o que foi configurado"*.

A lib não tem onde guardar isso. **Tudo é `design`** — o tema —, e o `design` é persistido sozinho:

- `useDesignManager.ts:135-142` grava **toda** mudança do `design` 1,5s depois, sem ação de ninguém;
- na estratégia padrão (`hybrid`), a gravação vai para o `localStorage` **e** para o `onSave` do host
  (`useDesignManager.ts:115-130`);
- o único consumidor real liga o `onSave` a um `PUT` do design inteiro no **tema único do sistema**
  (ERP, `themePersistence.ts:60-66`).

**Consequência que já acontece hoje:** um usuário clica no alternador de tema → 1,5s depois o sistema de
**todos** muda de modo. Desde a [[adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao]], o mesmo vale para o
widget de recolher a navegação, que grava `design.isNavHidden`. Foi medido no consumidor real: o tema salvo
no servidor carregava `navigationStyle`, `sidebarPosition`, `navbarLayout` e `contentAlignment` dos testes
do dono no painel — gravados para todos.

Pôr mais preferências na barra sobre esse modelo multiplicaria o problema: cada clique de cada usuário
reescreveria o sistema de todos. **Esta plan é a fundação; a barra configurável (plan-74) e o idioma
(plan-75) dependem dela.**

## 2.1 A decisão tomada com o dono (2026-09-11)

| | **Tema** | **Preferências** |
| --- | --- | --- |
| Quem muda | o administrador, no painel | cada usuário, na barra |
| Alcance | o sistema inteiro | só aquele usuário |
| Persistência | a de hoje | por usuário — `localStorage` por padrão, e uma porta opcional do host |
| Aplicação | é a base | **sobreposta** ao tema ao renderizar; nunca gravada nele |

O **tema decide o que é oferecido**: para cada preferência, o administrador escolhe se o usuário a vê — e,
na plan-74, onde. Uma preferência não oferecida é ignorada, mesmo que o usuário a tenha salvo antes.

**O conjunto é fechado, e é este:**

| Preferência | Valores | Sobrepõe |
| --- | --- | --- |
| modo | claro · escuro · **sistema** (segue o sistema operacional, e acompanha a troca dele) | o modo resolvido do tema — **pela contraparte** ([[specs/09-temas-e-presets]] §2.1), nunca reescrevendo o design |
| tamanho da fonte | P · M · G | a base de fonte do tema — **escala relativa**, com M sendo exatamente a base do tema |
| navegação | topo · lateral | o estilo de navegação do tema |
| navegação recolhida | sim · não | o recolhimento do tema |
| idioma | um dos idiomas habilitados no tema | o idioma do tema |

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/` — o estado das preferências, a sobreposição, a persistência por usuário, a porta
  opcional do host em `SarakUIOptions`, e o hook público de leitura/escrita.
- `src/core/Provider/utils/` — a validação das preferências como dado hostil.
- `src/core/Design/schema/` — o que o tema declara sobre cada preferência (oferecida ou não).
- `src/components/atomic/Navigation/ShellThemeToggle.tsx` e o toggle de recolher do cromo
  (`src/components/Layout/chrome/`) — passam a gravar **preferência**, não tema.
- `src/features/DesignEngine/` — **só** o necessário para o painel continuar editando o **tema**, e não o
  design efetivo do administrador (§5 item 6).
- Testes, `docs/migracoes.md` (MAJOR), kits pelos geradores, barril e catálogo.

## 3.2 Fora
- O widget ⚙ "Preferências", os itens fixados e a seção do painel onde o administrador escolhe o que
  oferecer e onde — plan-74.
- Tradução e o seletor de idioma funcional — plan-75. Aqui o idioma existe **só como dado** da camada.
- Qualquer preferência além das cinco da §2.1.
- Autenticação ou permissão do painel — proteger a rota do painel é do host
  ([[specs/10-seguranca-e-acessibilidade]] §3.1).
- O repositório do consumidor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/09-temas-e-presets.md` | §2.1 contraparte · §4.3 aplicar · §4.4 persistir — a camada nova convive com as três |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | §2.1 — preferência vem do `localStorage` e é dado hostil como o tema |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.2.1 — os widgets default, dois dos quais passam a gravar preferência |
| ADR | `adr/009-persistencia-tenant-aware.md` · `adr/011-tema-salvo-por-uma-porta-de-escrita.md` | o modelo de persistência e de porta que esta plan estende sem quebrar |
| ADR | `adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao.md` | a regra *"um default só monta quando tem com o que funcionar"* |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-arquitetura-design` | a fronteira entre tema e o que se aplica por cima dele |
| Código | `src/core/Provider/hooks/useDesignManager.ts` | a persistência automática, que **não** pode alcançar a preferência |
| Código | `src/core/Design/presets/themes/color-engine.ts` | `resolveThemeForMode` — o caminho do modo |

# 5. Instruções de execução

1. Ler as referências da §4.
2. **Provar o vazamento antes de mexer**: escrever o teste que afirma o comportamento **correto** —
   acionar o alternador de tema e o de recolher **não** chega à porta `onSave` do tema — e rodá-lo **antes**
   da mudança: ele tem de falhar. No fim, passa. Registrar as duas saídas no resumo.
3. Criar a camada: estado das cinco preferências, validação como dado hostil (domínio fechado, valor fora
   do domínio descartado com aviso único), persistência por usuário — `localStorage` com chave própria,
   isolada por tenant como a do tema, sincronizada entre abas —, e a porta opcional do host para quem quer
   guardar por usuário no servidor. **A lib não conhece o usuário**: quem associa a preferência a ele é o
   host, pela porta.
4. Sobrepor: o que o Provider expõe aos componentes é o **design efetivo** — tema com as preferências
   oferecidas aplicadas por cima. O modo passa pela contraparte; a fonte é escala relativa sobre a base do
   tema; **preferência não oferecida pelo tema não se aplica**. O que é persistido como tema continua sendo
   só o tema.
5. Levar o alternador de tema e o toggle de recolher a gravarem preferência. Nos dois cromos.
6. **O painel edita o tema, não o design efetivo.** Os controles do painel mostram e gravam o valor do
   tema; a preferência pessoal do administrador não vaza para o que ele salva como tema.
7. Expor um hook público de leitura e escrita das preferências — é por ele que a plan-74 monta a barra, a
   plan-75 liga o idioma e o host lê o idioma para a própria tradução.
8. Nota **MAJOR** em `docs/migracoes.md`: o alternador de tema e o de recolher deixam de mudar o tema do
   sistema; quem os usava para isso passa a usar o painel.
9. Regenerar kits pelos geradores; rodar `npx vitest run`, `barrel:check`, `catalog:check`,
   `public-types:check`, `guide:check`, `dev-kit:check` e `audit:baseline --with-tsc`.

# 6. Critérios de aceite

- [ ] O teste do passo 2 falhou **antes** da mudança e passa **depois** — as duas saídas no resumo:
      acionar o alternador de tema e o de recolher não chega à porta `onSave` do tema.
- [ ] As cinco preferências da §2.1 existem, com domínio fechado e validação de dado hostil testada.
- [ ] O design efetivo sobrepõe só as preferências **oferecidas**; uma não oferecida é ignorada mesmo se
      salva — provado por teste.
- [ ] O modo passa pela contraparte; o modo **sistema** acompanha a troca do sistema operacional.
- [ ] A fonte P/G é escala relativa à base do tema, e M é exatamente a base.
- [ ] Preferências persistem por usuário, isoladas por tenant, sincronizadas entre abas; a porta opcional
      do host recebe e devolve as preferências, e nunca o tema.
- [ ] O painel edita e grava o tema; a preferência do administrador não entra no que ele salva — teste.
- [ ] Hook público exportado; barril, catálogo e tipos públicos em dia.
- [ ] `docs/migracoes.md` com a nota MAJOR.
- [ ] `npx vitest run` verde; os gates do passo 9 verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante (preferência nunca chega à persistência do tema) é comportamento de uma
camada, com dono no teste do Provider. Uma régua textual não enxergaria um caminho de gravação.

- `git diff --stat` → só a §3.1.
- Ler o teste do passo 2 e **reverter mentalmente** a mudança: ele tem de falhar sem ela.
- Teste de mutação no ponto que filtra "não oferecida": removendo o filtro, um teste cai.
- Conferir que o design persistido e o design exposto são coisas diferentes no código, e que só o
  primeiro chega ao `localStorage` do tema e ao `onSave`.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `adr/NNN-preferencias-do-usuario-separadas-do-tema.md` · `specs/09-temas-e-presets.md`

**ADR** — passa na régua da [[00-prompt-revisor]] §5.2:

1. **Alternativas reais:** preferência dentro do tema (o modelo de hoje) × tema por usuário (clonar o
   tema para cada pessoa) × camada separada sobreposta (escolhida).
2. **Custos:** a primeira faz um clique de um usuário reescrever o sistema de todos; a segunda multiplica
   temas por usuários e faz a edição do administrador não chegar a quem já clonou; a escolhida é MAJOR —
   os alternadores deixam de mudar o tema —, cria superfície pública nova (hook e porta) e duas fontes para
   raciocinar sobre o que está na tela.
3. **Voltar atrás seria caro:** hosts passam a guardar preferência por usuário pela porta.

Em `specs/09`, uma seção nova no ciclo de vida: *preferência do usuário — sobreposta, nunca gravada no
tema*, com a tabela da §2.1 como contrato e a regra de que o tema decide o que é oferecido.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-11

**Resultado:** Concluído

**O que foi feito**
- `src/core/Design/schema/preferences.ts:1-19` — declaração fechada das 5 preferências (`PREFERENCE_IDS`) e
  `isPreferenceOffered` (ausência = oferecida, só `false` tira de circulação) — fora da paridade de 3 fontes
  (R4) por não ser token de `MASTER_DESIGN_MAP`, mesma classe de `contraparte` em `ThemeEntry`.
- `src/core/Provider/preferencesTypes.ts` (novo) — `SarakUserPreferences` (colorMode/fontSize/
  navigationStyle/navCollapsed/language), `SarakPreferencesOptions` (porta opcional do host).
- `src/core/Provider/types.ts` — `ThemeEntry.preferencesOffered?`, `SarakUIOptions.preferences?`,
  `SarakUIContextType.preferences`/`.updatePreferences` — mantendo o arquivo em 250 linhas (teto do
  auditor de Clean Code), com duas compactações de comentário pré-existentes sem mudança de sentido.
- `src/core/Provider/utils/validatePreferences.ts` (novo) — domínio fechado por preferência, valor fora
  descartado com **um** `console.warn` por chamada.
- `src/core/Provider/utils/resolvePreferencesStorageKey.ts` (novo) — chave própria (`sarak-ui-preferences-v1`),
  reaproveitando `resolveStorageKey` para o mesmo tenant do tema.
- `src/core/Provider/utils/overlayPreferences.ts` (novo) — a sobreposição pura: modo via a MESMA porta que
  `ShellThemeToggle` usava (`resolveThemeForMode`/`syncThemeWithMode`, contraparte autorada quando existe);
  fonte P/G/M como delta relativo sobre `fontScale` do tema (`FONT_SCALE_ORDER`, clampado nas pontas);
  navegação/recolhimento/idioma por substituição direta — cada uma só se `isPreferenceOffered` permitir.
- `src/core/Provider/hooks/usePreferencesSystemColorScheme.ts`, `usePreferencesRemoteLoader.ts`,
  `usePreferencesStorageSync.ts`, `usePreferencesManager.ts` (novos) — estado + persistência (debounced,
  1500ms, mesmo desenho de `useDesignManager.persistDesign` — necessário para não vazar preferência de um
  teste para o próximo pela `localStorage` real do jsdom) + cross-tab + porta remota opcional.
- `src/core/Provider/hooks/useSarakPreferences.ts` (novo) — hook público, exportado no barril.
- `src/core/Provider/mergeUIContextValue.ts` (extraído de `SarakUIProvider.tsx`, só para caber no teto de
  250 linhas) — `systemDesign` agora é um campo RAW setado direto pelo Provider (não mais derivado de
  `context.design`); `design`/`activeDesign` (fora do rascunho do painel) vêm do EFETIVO.
- `src/core/Provider/SarakUIProvider.tsx:126-133,152-156,183,211,224` — liga `usePreferencesManager`,
  computa `effectiveDesign = overlayPreferences(design, preferences, activeTheme, systemColorScheme)` e
  alimenta `DesignInjector`/`SovereignThemeInjector` e o contexto com ele; `design` bruto some do lado de
  fora (só chega como `systemDesign`).
- `src/components/atomic/Navigation/ShellThemeToggle.tsx` — `toggleTheme` passa a chamar
  `updatePreferences({ colorMode })`, nunca mais `applyFullConfigRaw`. Widget compartilhado por
  `SarakAppChrome` e `SarakShell` — o conserto alcança os dois cromos com um arquivo só.
- `src/components/Layout/chrome/useChromeDefaultWidgets.ts:55-59` — `toggleNavHidden` passa a chamar
  `updatePreferences({ navCollapsed })`.
- `src/core/Shell/hooks/useSarakShellUI.ts:24-27` — `toggleNav` (o colapso do `SarakShell`) idem —
  necessário para "os dois cromos" do passo 5, embora `src/core/Shell/` não estivesse citado ao pé da
  letra na lista de arquivos da §3.1 (ver Decisões e suposições).
- `src/index.ts` — barril: `useSarakPreferences`, `SarakUserPreferences`, `SarakPreferencesOptions`,
  `SarakColorModePreference`, `SarakFontSizePreference`, `SarakNavigationStylePreference`,
  `SarakPreferencesHook`, `PreferenceId`, `PreferencesOffered`.
- `docs/migracoes.md` — nota MAJOR no topo (mais recente primeiro).
- `sarak-ui/`, `sarak-dev/`, `dist/` — regenerados pelos geradores (`npm run guide`, `npm run dev-kit`,
  `npm run build`).
- 11 arquivos de teste novos + 2 reescritos (`ShellThemeToggle.test.tsx`, `useSarakShellUI.test.ts`, este
  último substituindo um stub com `// TODO` por um teste comportamental real).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/preferences.ts` | criado | contrato fechado das 5 preferências + `isPreferenceOffered` |
| `src/core/Provider/preferencesTypes.ts` | criado | `SarakUserPreferences`/`SarakPreferencesOptions` |
| `src/core/Provider/types.ts` | alterado | `ThemeEntry.preferencesOffered`, `SarakUIOptions.preferences`, `SarakUIContextType.preferences/.updatePreferences` |
| `src/core/Provider/utils/validatePreferences.ts` | criado | preferência como dado hostil |
| `src/core/Provider/utils/resolvePreferencesStorageKey.ts` | criado | chave de storage própria, tenant-aware |
| `src/core/Provider/utils/overlayPreferences.ts` | criado | a sobreposição (núcleo da plan) |
| `src/core/Provider/hooks/usePreferencesSystemColorScheme.ts` | criado | modo "sistema" reativo ao SO |
| `src/core/Provider/hooks/usePreferencesRemoteLoader.ts` | criado | porta `onLoad` opcional |
| `src/core/Provider/hooks/usePreferencesStorageSync.ts` | criado | cross-tab das preferências |
| `src/core/Provider/hooks/usePreferencesManager.ts` | criado | orquestrador: estado + persistência local/remota |
| `src/core/Provider/hooks/useSarakPreferences.ts` | criado | hook público |
| `src/core/Provider/mergeUIContextValue.ts` | criado | extraído do Provider (teto de linhas) |
| `src/core/Provider/SarakUIProvider.tsx` | alterado | liga a camada, computa e propaga `effectiveDesign` |
| `src/components/atomic/Navigation/ShellThemeToggle.tsx` | alterado | grava preferência, não tema |
| `src/components/Layout/chrome/useChromeDefaultWidgets.ts` | alterado | idem, para o colapso do AppChrome |
| `src/core/Shell/hooks/useSarakShellUI.ts` | alterado | idem, para o colapso do SarakShell |
| `src/index.ts` | alterado | exporta hook + tipos novos |
| `docs/migracoes.md` | alterado | nota MAJOR |
| `sarak-ui/*`, `sarak-dev/*`, `dist/*` | gerado | `npm run guide` / `dev-kit` / `build` |
| 9 arquivos `__tests__/*.test.ts(x)` novos + `ShellThemeToggle.test.tsx` e `useSarakShellUI.test.ts` | criado/reescrito | cobertura da camada nova e dos consumidores alterados |

**Verificações executadas**
- Teste do passo 2, **antes** da mudança (código-fonte revertido via `git stash`, teste mantido):
  `npx vitest run src/core/Provider/__tests__/PreferenciasNaoVazamParaOTema.test.tsx` → **2 falhas**
  (`onSave` chamado 1x em cada caso — alternador de tema e toggle de recolher).
- O mesmo teste, **depois** da mudança: `npx vitest run src/core/Provider/__tests__/PreferenciasNaoVazamParaOTema.test.tsx`
  → **2 passed**.
- `npx tsc --noEmit -p .` → 0 erros.
- `node gates/scripts/audit/run_audit.mjs` (`auditor_cleancode`) → 0 violações; `auditor_paridade` → 423
  tokens nas 3 fontes, sem divergência (a camada de preferências não mexeu em token nenhum).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-08-11 —
  nenhuma regressão".
- `npm run build` (encadeia `token-types:check`, `catalog:check`, `barrel:check`, `zero-brand:check`,
  `guide:check`, `deep-import:check`, `build:js`, `public-types:check`, `build:css*`) → verde.
- `npm run dev-kit:check` → "kit em dia (3 arquivos, 0 ponteiros mortos)".
- `npx vitest run` (suíte completa) → **1770/1772 passaram** nas duas rodadas finais; as 2 que timeoutaram
  (`check-barrel-parity.test.mjs`/`generate-token-types.check.test.mjs`/`SarakPDFViewerImpl.test.tsx`,
  variando qual estourava a cada rodada) **passam isoladas** — são timeout de hook/teste sob a carga da
  suíte inteira, não relacionadas a nenhum arquivo desta entrega (nenhuma toca preferências/design). O
  comentário do próprio `generate-token-types.check.test.mjs:35-36` já documenta essa sensibilidade
  ("testTimeout default (5s) sob carga da suíte completa").

**Critérios de aceite**
- [x] Teste do passo 2 falhou antes e passa depois — evidência acima.
- [x] As cinco preferências existem, domínio fechado e validação de dado hostil testada —
      `validatePreferences.test.ts`.
- [x] Design efetivo sobrepõe só as oferecidas; não oferecida é ignorada mesmo se salva — provado em
      `overlayPreferences.test.ts` (`"preferência não oferecida (qualquer uma) é ignorada mesmo quando salva"`).
- [x] Modo passa pela contraparte (mesma porta do toggle antigo); modo "sistema" acompanha a troca do SO —
      `overlayPreferences.test.ts` + `usePreferencesSystemColorScheme.test.ts`.
- [x] Fonte P/G é escala relativa à base do tema, M é exatamente a base — `overlayPreferences.test.ts`,
      bloco "fontSize — escala RELATIVA à base do tema".
- [x] Preferências persistem por usuário, isoladas por tenant, sincronizadas entre abas; porta opcional do
      host recebe/devolve preferências, nunca o tema — `usePreferencesManager.test.ts`,
      `usePreferencesStorageSync.test.ts`, `resolvePreferencesStorageKey.test.ts`.
- [x] Painel edita e grava o tema; preferência do admin não entra no que ele salva — teste —
      `PainelIsoladoDaPreferencia.test.tsx` + `mergeUIContextValue.test.ts`. Nenhum arquivo de
      `src/features/DesignEngine/` precisou mudar: `useThemeEngineState.ts`/`useDesignDraft.ts` já operam
      sobre `sarak.systemDesign` (confirmado lendo o código antes de editar) — a separação
      `systemDesign`/`design efetivo` no Provider bastou.
- [x] Hook público exportado; barril, catálogo e tipos públicos em dia — `barrel:check`, `catalog:check`,
      `public-types:check` verdes.
- [x] `docs/migracoes.md` com a nota MAJOR.
- [x] `npx vitest run` verde (ressalva de timeout sob carga, documentada acima) — gates do passo 9 verdes.

**Decisões e suposições**
- **`ThemeEntry.preferencesOffered` como campo estrutural, não token de `MASTER_DESIGN_MAP`.** A instrução
  não lista `arquitetura/04-contrato-de-tokens-e-paridade.md` nem a skill `ui-novo-componente` nas
  Referências obrigatórias (§4) — sinal de que "o que o tema declara" não deveria exigir a paridade de 3
  fontes (schema + `theme_table_mapping.json` + catálogo). Segui o precedente já existente de
  `ThemeEntry.contraparte` (também estrutural, também fora da paridade, também com gate próprio — ali o de
  contraste). Se a intenção fosse token pleno, é lacuna da instrução a esclarecer numa rodada de correção.
- **`src/core/Shell/hooks/useSarakShellUI.ts` entrou no escopo** mesmo não estando citado ao pé da letra na
  lista de arquivos da §3.1 (que só nomeia `ShellThemeToggle.tsx` e `src/components/Layout/chrome/`). A §5
  item 5 diz explicitamente "nos dois cromos", e o `SarakShell` tem o mesmo vazamento de `isNavHidden` via
  `applyConfig` — sem tocar nele, "os dois cromos" ficaria incompleto e o passo 2 (que exige provar ausência
  de vazamento) não cobriria o módulo-plugin. Risco assumido: se a intenção era mesmo restringir ao
  ui-kit, este arquivo está fora do declarado.
- **Debounce de 1500ms na escrita de preferências** (`usePreferencesManager.ts`), replicando
  `useDesignManager.persistDesign`. Não é pedido explícito da plan; nasceu de um teste real que quebrou
  (`SarakAppChrome.test.tsx`, "os slots NÃO tiram a nav") por vazamento de `localStorage` ENTRE testes do
  mesmo arquivo — o clique no toggle de recolher de um teste anterior persistia `navCollapsed: true` antes
  do próximo teste montar um Provider novo. O estado em memória (o que a UI/overlay lê) continua imediato;
  só a escrita em disco/porta remota espera.
- **Status `🟡 Em execução' não foi marcado no frontmatter antes da primeira edição** — falha de ritual
  minha (§2 do prompt do executor). Registrado aqui por transparência; não houve segunda execução
  concorrente nem conflito.
- Não toquei `docs/persistencia-de-tema.md`: conferido que não cita `ShellThemeToggle` nem o toggle de
  recolher, então não ficou desatualizado por esta mudança.

**Achados fora do escopo (não corrigidos)**
- `src/core/Provider/__tests__/SarakUIProvider.test.tsx` e outros testes que mockam `useDesignManager`
  continuam passando porque `resolvedThemeId` fica `undefined` no mock — não é uma fragilidade introduzida
  por esta plan, mas vale registrar que qualquer teste futuro que precise de `resolvedThemeId` real terá de
  atualizar esse mock.
- O comentário de cabeçalho de `sanitizeHtml.ts` (mencionado em specs/10 §2.2, já registrado como
  desatualizado por aquela própria spec) não foi tocado — fora do escopo desta plan.

**Pendências / riscos**
- Nenhuma pendência dentro do escopo desta plan. plan-74 (painel de preferências) e plan-75 (idioma
  funcional) dependem do hook público `useSarakPreferences`/`options.preferences`/`ThemeEntry.preferencesOffered`
  entregues aqui.

## Resumo da execução (correção 1) — 2026-09-11

**Resultado:** Concluído

Escopo exclusivamente os 4 achados do veredito de 2026-09-11 — nenhuma escrita no Git nesta rodada (sem
`stash`, `checkout` ou `restore`).

**Achado 1 — modo apagava customização do administrador**
- `src/core/Provider/utils/overlayPreferences.ts` — nova função `applyColorMode`: quando o modo pedido é o
  OPOSTO do atual e a entrada tem `contraparte`, faz `{ ...result, ...contraparte, mode: targetMode }` —
  só os tokens que a contraparte declara mudam; todo o resto do design ATUAL (não `theme.design` da
  entrada) sobrevive. Sem `contraparte`, mantido o fallback `syncThemeWithMode` sobre o design atual, como
  já era. Parou de importar/chamar `resolveThemeForMode`.
- Evidência: `overlayPreferences.test.ts`, describe "colorMode — achado 1" — `navigationStyle`,
  `primaryColor` e `globalBackgroundImageUrl` (customizações fora da contraparte) sobrevivem à troca de
  modo; ida-e-volta (`dark`→`light`→`dark`) preserva `primaryColor` customizado; pedir o modo em que o
  tema já está devolve o design **exatamente igual** (`toEqual`).

**Achado 2 — preferência de fonte não mudava a tela**
- `overlayPreferences.ts` — a escala relativa agora mexe em `bodySize` (`'12px'|'14px'|'16px'|'18px'|'20px'`,
  `schema/global.ts`, o token que emite `--sarak-body-size`/`--theme-font-size-base`), não mais no legado
  `fontScale` (que não emite nada).
- Evidência: `overlayPreferences.test.ts`, describe "fontSize — achado 2" — inclui um teste que renderiza
  `useDesignVariables` sobre o resultado da sobreposição e afirma
  `variables['--theme-font-size-base'] === '16px'` (a VARIÁVEL emitida, não só o campo do objeto).

**Achado 3 — o que é oferecido morava fora do `design`**
- Escopo ampliado conforme o próprio achado autorizou: `arquitetura/04-contrato-de-tokens-e-paridade.md` e
  a skill `ui-novo-componente` entraram como referência desta rodada.
- `src/core/Design/schema/preferences.ts` — reescrito: `PreferencesSchema` (`ComponentSchema`) com 5 tokens
  novos `select`, um por preferência (`preferenceModePosition`, `preferenceFontSizePosition`,
  `preferenceNavigationStylePosition`, `preferenceNavCollapsePosition`, `preferenceLanguagePosition`),
  valores `'off' | 'menu' | 'pinned'` (as três posições da plan-74 §2.1) — padrão de fábrica: modo e
  recolhimento `'pinned'`; fonte, navegação e idioma `'off'`, IDÊNTICO à barra de hoje.
- `src/core/Design/master-map.ts` — `PreferencesSchema` registrado em `MASTER_DESIGN_MAP.components`
  (29º schema).
- `src/core/Design/catalog/theme_table_mapping.json` — os 5 ids na coluna `structural`.
- `src/core/Design/catalog/partitions/structural.json` — as 5 entradas de catálogo correspondentes.
- `src/core/Provider/types.ts` — `ThemeEntry.preferencesOffered` **removido** (o campo estrutural que o
  achado reprovou); `PreferencesOffered` saiu de `preferencesTypes.ts`.
- `overlayPreferences.ts` — `isPreferenceOffered` agora importado de `core/Design/schema/preferences` e lê
  o token direto do `design` (`design[PREFERENCE_POSITION_TOKEN_IDS[id]] !== 'off'`), nunca mais de um
  campo da entrada de tema.
- Regenerado: `npm run token-types` (423→428 tokens), `npm run guide`, `npm run dev-kit`, `npm run build`.
- Evidência: `npx tsx gates/scripts/audit/verify_parity.ts` → "428 tokens validados nas 3 fontes";
  `preferences.test.ts` (schema) cobre o padrão de fábrica e a leitura por token; 3 snapshots
  (`PresetCard`, `PreviewSystemRenderer`, `PreviewCanvas`) atualizados — diff conferido a mão: só os 5
  `--sarak-preference-*-position` novos, com os valores de fábrica corretos, nada mais mudou.

**Achado 4 — a escolha se perdia numa navegação rápida**
- `src/core/Provider/hooks/usePreferencesManager.ts` — removido o debounce de 1500ms da escrita (era uma
  cópia do desenho de `useDesignManager.persistDesign`, que não se aplica aqui): `localStorage.setItem` e
  `options.preferences.onSave` agora rodam no mesmo efeito que reage a `preferences`, sem `setTimeout`.
- `src/components/Layout/__tests__/SarakAppChrome.test.tsx` — `afterEach(() => localStorage.clear())`
  acrescentado (era a causa real do vazamento entre testes que motivou o debounce errado).
- Evidência: `usePreferencesManager.test.ts` — as duas asserções de escrita (`localStorage`/`onSave`) não
  usam mais `waitFor`, são síncronas logo após o `act()`.

**Verificações executadas**
- `npx tsc --noEmit -p .` → 0 erros.
- `npx tsx gates/scripts/audit/verify_parity.ts` → 428/428/428, sem divergência.
- `node gates/scripts/audit/run_audit.mjs` → `auditor_cleancode` 0, `auditor_paridade` 428 nas 3 fontes,
  `auditor_presets` 0 chave órfã (125 itens contra o gabarito de 428).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline de 2026-08-11.
- `npm run build` (token-types/catalog/barrel/zero-brand/guide/deep-import/build:js/public-types/build:css*)
  → verde.
- `npm run dev-kit:check` → kit em dia, 0 ponteiros mortos.
- `npx vitest run` (suíte completa) → **1777/1778** — a única falha é
  `SarakPDFViewerImpl.test.tsx` (timeout de 5s sob carga da suíte inteira), confirmada pré-existente e
  não relacionada: passa isolada (`npx vitest run` só nesse arquivo → 3/3 verde).

**Decisões e suposições**
- `theme.design` deixou de ser lido em `overlayPreferences.ts` — só `theme.contraparte` (para o modo) e o
  próprio `design` (para os tokens de posição e o fallback). Se a plan-74/75 esperarem que a função ainda
  aceite/leia `theme.design` por algum outro motivo, é lacuna a esclarecer.
- A coluna do `theme_table_mapping.json`/partição escolhida para os 5 tokens novos foi `structural`
  (existente) — não criei uma 14ª coluna/partição. `verify_parity.ts` não distingue por nome de coluna,
  só por `tokenId` presente em alguma coluna/partição; "estrutural" é onde as demais configurações
  não-visuais do cromo já vivem (`layoutGridTemplate`, `headerAlignment` etc.).
- `digitalTwins: ["SarakAppChrome"]` nas 5 entradas de catálogo — é quem vai efetivamente ler os tokens
  (plan-74), ainda não o lê hoje. Registrado como referência futura, não como consumo atual.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. Os dois "não são achados" do veredito (`git stash` no controle do passo 2; status 🟡 não
  marcado) já estavam registrados e não pedem correção de código.

## Resumo da execução (correção 2) — 2026-09-11

**Resultado:** Concluído

Escopo exclusivamente os 3 achados do veredito "correção 1" de 2026-09-11 — nenhuma escrita no Git nesta
rodada.

**Achado 1 — a troca de modo só funcionava numa direção**
- `src/core/Provider/utils/overlayPreferences.ts` — `applyColorMode` reescrita: a comparação passou a ser
  contra o modo NATIVO da entrada (`theme.design.mode`), nunca contra o modo atual do design. Pedido =
  nativo → os tokens que a contraparte declara voltam ao valor de `theme.design` (nova função `pickKeys`,
  que só copia as chaves que a fonte de fato declara); pedido = oposto → esses mesmos tokens vão para o
  valor da `contraparte`. Todo o resto do design atual continua intocado, como já valia desde a correção 1.
- Evidência: `overlayPreferences.test.ts` — novo teste "tema salvo pelo painel no modo OPOSTO ao nativo +
  usuário pede o NATIVO → restaura a paleta nativa" (o cenário exato medido no veredito:
  `minimalist-airy` salvo em escuro, usuário pede claro, antes ficava com a paleta escura sob o rótulo
  `light`); o teste de ida-e-volta passou a conferir também `mode`/`colorBgBody` restaurados, não só a
  customização que sobrevive.

**Achado 2 — design sem os tokens de posição oferecia tudo**
- `src/core/Design/schema/preferences.ts` — `isPreferenceOffered` reescrita: chave ausente no `design` cai
  no `defaultValue` do PRÓPRIO token (`DEFAULT_POSITIONS`, derivado de `PreferencesSchema` — fonte única,
  nunca copiado à mão), não mais em "oferecida" incondicional. Cobre o caminho medido no veredito
  (`TemplatesTab.tsx:25`, `applyFullConfig(theme.design)` substitui o design inteiro por um sem as chaves
  novas).
- Evidência: `preferences.test.ts` — teste reescrito prova as duas metades: `colorMode` ausente (padrão
  `'pinned'`) continua oferecida; `fontSize` ausente (padrão `'off'`) passa a **não** oferecida.

**Achado 3 — citação de plan/achado/veredito em teste e produção**
- `src/core/Design/schema/preferences.ts:10` — comentário reescrito sem citar plan.
- Onze arquivos de teste — `describe`/`it`/comentário reescritos sem citar `plan-73`/`plan-74`/`achado
  N`/`veredito`: `SarakAppChrome.test.tsx`, `ShellThemeToggle.test.tsx`, `useSarakShellUI.test.ts`,
  `PainelIsoladoDaPreferencia.test.tsx`, `PreferenciasNaoVazamParaOTema.test.tsx`,
  `mergeUIContextValue.test.ts`, `usePreferencesManager.test.ts`, `usePreferencesRemoteLoader.test.ts`,
  `usePreferencesStorageSync.test.ts`, `usePreferencesSystemColorScheme.test.ts`,
  `useSarakPreferences.test.ts`, `overlayPreferences.test.ts`, `preferences.test.ts` (schema).
- `docs/migracoes.md:8` (título da entrada, "(plan-73)") **não foi tocado**: é o mesmo formato de TODAS as
  outras entradas do arquivo (`plan-67`, `plan-68`, `plan-49`…) — convenção permanente do próprio documento,
  não uma citação solta que a síntese deixaria morta; o achado não a lista.
- Evidência: `grep -rniE "plan-7[0-9]|achado [0-9]|veredito" <arquivos desta plan>` devolve só as duas
  linhas pré-existentes e não-relacionadas de `docs/migracoes.md` (a do título, convenção do arquivo, e
  uma ocorrência genérica da palavra "veredito" numa entrada antiga sobre ADR-009, sem relação com esta
  plan) — conferido a mão, nenhuma delas foi introduzida por esta plan.

**Verificações executadas**
- `npx tsc --noEmit -p .` → 0 erros.
- `node gates/scripts/audit/run_audit.mjs` → `auditor_cleancode` 0, `auditor_paridade` 428/3 fontes (sem
  mudança — nenhum token novo nesta rodada).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline de 2026-08-11.
- `npx vitest run` (suíte completa) → **1775/1779** (3 skipped, pré-existentes) — as 2 falhas são
  `check-barrel-parity.test.mjs` (hook timeout 60s) e `SarakPDFViewerImpl.test.tsx` (timeout 5s), as
  MESMAS duas classes de timeout sob carga já registradas nas rodadas anteriores; nenhum arquivo desta
  correção toca qualquer um dos dois — confirmado passando isolado
  (`npx vitest run gates/scripts/contrato/__tests__/check-barrel-parity.test.mjs
  src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx` → 10/10 verde).

**Critérios de aceite (revisitados)**
- [x] Modo passa pela contraparte, agora nas DUAS direções — teste novo cobrindo o cenário do veredito.
- [x] Preferência não oferecida é ignorada mesmo quando salva, e AUSENTE cai no padrão do próprio token —
      teste novo cobrindo a metade que faltava (`fontSize` ausente ≠ oferecida).
- [x] Nenhum comentário ou teste novo desta plan cita `plan-7X`/`achado N`/`veredito` — grep conferido.

**Decisões e suposições**
- `pickKeys` só copia chaves que a FONTE (`theme.design` ou `contraparte`) de fato declara — se
  `theme.design` não tiver uma chave que a `contraparte` declara (dado real mal formado), essa chave some
  do resultado no lado nativo, em vez de manter um valor stale do design atual. Nenhum tema shippado tem
  essa divergência (a contraparte é sempre um subconjunto de `theme.design`), mas é o comportamento para um
  tema de consumidor malformado — registrado, não testado à parte.
- Não toquei `docs/migracoes.md` nesta rodada: a descrição pública já feita (padrão de fábrica por token;
  troca de modo preserva customização) continua verdadeira com os dois consertos — eles corrigem a
  IMPLEMENTAÇÃO para cumprir o que já estava prometido, não mudam a promessa.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Nenhuma dentro do escopo desta correção.

## Resumo da execução (correção 3) — 2026-09-12

**Resultado:** Concluído

Escopo exclusivamente o achado único do veredito "correção 2" de 2026-09-12 — nenhuma escrita no Git
nesta rodada.

**Achado — pedir o modo em que o tema já está apagava a personalização do administrador nas chaves de
modo**
- `src/core/Provider/utils/overlayPreferences.ts` — `applyColorMode`: o retorno antecipado
  ("modo pedido = modo atual do design → não mexe em nada") voltou para o **topo** da função, valendo para
  os dois ramos (com e sem contraparte). A correção anterior tinha movido essa checagem para dentro do
  ramo sem contraparte, deixando o ramo COM contraparte sempre reescrever as chaves rastreadas — mesmo
  quando o modo pedido já era o modo corrente.
- Evidência: `overlayPreferences.test.ts`, novo describe "pedir o modo em que o design JÁ ESTÁ é sempre um
  no-op" — três testes cobrindo exatamente os três casos que o veredito pediu: tema no modo nativo com
  `colorBgBody` personalizado, tema salvo no modo oposto com `colorBgBody` personalizado por cima da
  contraparte, e a preferência "sistema" resolvendo para o modo já aplicado — nos três, a chave de modo
  personalizada sobrevive.

**Verificações executadas**
- `npx tsc --noEmit -p .` → 0 erros.
- `node gates/scripts/audit/run_audit.mjs` → `auditor_cleancode` 0, `auditor_paridade` 428/3 fontes (sem
  mudança — nenhum token nesta rodada).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline de 2026-08-11.
- `npx vitest run` (suíte completa) → **1781/1782** — a única falha é `SarakPDFViewerImpl.test.tsx`
  (timeout de 5s sob carga da suíte inteira), a mesma classe de timeout já registrada nas rodadas
  anteriores; nenhum arquivo desta correção o toca — confirmado passando isolado (3/3 verde).
- `grep -niE "plan-7[0-9]|achado [0-9]|veredito" src/core/Provider/utils/overlayPreferences.ts
  src/core/Provider/utils/__tests__/overlayPreferences.test.ts` → nenhuma ocorrência.

**Decisões e suposições**
- Nenhuma nova além do que já estava decidido nas rodadas anteriores; o conserto é estritamente a posição
  de um `if` dentro de uma função já existente.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Nenhuma dentro do escopo desta correção.

---

# 10. Veredito

## Veredito — 2026-09-11 — 🔴 Reprovado

**A estrutura está certa, e o vazamento fechou.** Tema e preferência são estados separados no Provider; só
o tema chega ao `localStorage` do tema e ao `onSave`; o painel lê o tema cru (`systemDesign`); a validação
como dado hostil, a chave isolada por tenant e a sincronização entre abas existem e têm teste. O teste do
passo 2 falhou antes e passa depois. A reprovação é porque **três das cinco preferências não fazem o que
prometem na tela**, e os testes provam o valor devolvido, não o efeito.

### O que verifiquei e está certo

- `useSarakShellUI.ts` dentro do escopo: correto. O passo 5 diz *"nos dois cromos"*, e a §3.1 esqueceu o
  Shell — a omissão é da plan.
- Nenhuma mudança em `src/features/DesignEngine/` foi necessária: o painel já opera sobre `systemDesign`, e
  a separação no Provider bastou. Boa leitura do código antes de editar.
- **Execuções, feitas por mim:** suíte completa (`--maxWorkers=3`) → **357 arquivos / 1772 testes, verde**.
  `barrel` · `catalog` · `public-types` · `guide` · `dev-kit` · `class-merge` · `chrome-token-parity` →
  verdes. `audit:baseline --with-tsc` → igual ao baseline.

### Achados

**1. Escolher um modo apaga, para aquele usuário, tudo o que o administrador configurou.**
`overlayPreferences.ts`, ramo do modo: `resolveThemeForMode({ design: theme.design, contraparte }, …)`
parte do design **da entrada do catálogo**, e não do design atual do tema — e `resolveThemeForMode` devolve
esse design inteiro. **Medido por mim**, com o `minimalist-airy` personalizado no painel (navegação
lateral, cor de marca `#e11d48`, imagem de fundo) e a preferência *escuro*:

| Token | Tema do administrador | O que o usuário vê em escuro |
| --- | --- | --- |
| `navigationStyle` | `sidebar` | **`topbar`** |
| `primaryColor` | `#e11d48` | **`#111827`** |
| `globalBackgroundImageUrl` | `/assets/fundo.png` | **`""`** |

É o contrário da §2.1: o modo passa pela contraparte *"nunca reescrevendo o design"*.
**Invariante a cumprir:** a troca de modo do usuário altera **só** os tokens que carregam modo — os que a
contraparte da entrada declara, com o valor nativo ou o da contraparte conforme o modo pedido —, e **todo o
resto é o design atual do tema**. Sem contraparte, o fallback sintetizado segue como está. **Testes que
faltam:** uma personalização que não carrega modo sobrevive à troca; e pedir o modo em que o tema já está
devolve **exatamente** o design do tema.

**2. A preferência de tamanho de fonte não muda a tela.**
A sobreposição mexe em `fontScale` — uma chave legada que **nada renderiza**: o `useDesignVariables` não a
emite, e o `DESIGN_MANIFEST` que a mapeia só alimenta a validação (`validation.ts:35`), não a emissão.
**Medido por mim:** com `fontScale` em `p`, `m` e `g`, `--theme-font-size-base` fica em 14px (padrão) e em
16px (`minimalist-airy`) — o valor de `bodySize`, sempre. A base de fonte que o `html` usa é o `bodySize`
(`_base.css:9`, via `--theme-font-size-base`). O teste de `overlayPreferences.test.ts:72-86` afirma
`result.fontScale`, e por isso não viu nada.
**Conserto:** a preferência age na base que de fato escala a tela, um degrau por vez na escala dela, com M
sendo exatamente a base do tema; e o teste afirma a **variável CSS emitida**, não o valor da sobreposição.

**3. O que o tema oferece mora fora do `design` — e o administrador não teria como salvar.**
`ThemeEntry.preferencesOffered` é campo da entrada, como a `contraparte`. O precedente não serve: a
contraparte é escrita por quem autora o tema, no código; **o que é oferecido é escolhido pelo
administrador no painel, em runtime** (plan-74), e o painel edita o `design`. A persistência do único
consumidor leva só o `design` (`PUT` com `{ design, activeThemeId }`). Com o campo fora dele, a
configuração do administrador não sobrevive a um recarregamento sem mudar o consumidor — o que esta base
recusa. E o padrão *"ausência = oferecida"* inverte a regra do dono (*"o usuário final apenas utilizará o
que foi configurado"*) e o padrão de fábrica que a plan-74 §2.1 já fixou.
**Conserto, com escopo ampliado nesta correção:** a declaração vive no `design`, como token de tema, um por
preferência, com a paridade das três fontes (`arquitetura/04-contrato-de-tokens-e-paridade.md` e a skill
`ui-novo-componente` passam a ser referência desta rodada; `theme_table_mapping.json` e as partições do
catálogo ficam autorizadas). Os valores já são os três da plan-74 — **não oferecida · no menu · fixa na
barra** —, para a 74 não precisar migrar o dado; esta plan usa só *oferecida ou não*. Padrão de fábrica:
modo e navegação recolhida **fixa na barra**; tamanho da fonte, navegação topo/lateral e idioma **não
oferecida**.

**4. A escolha do usuário se perde se ele navegar logo depois.**
`usePreferencesManager.ts:49-57` espera 1,5s para gravar também no `localStorage`, e não grava ao descarregar
a página. No único consumidor, trocar de módulo recarrega a página inteira (`window.location.assign`):
escolher *escuro* e clicar num item do menu em menos de 1,5s perde a escolha. O resumo registra o motivo do
atraso — um teste que vazava `localStorage` para o seguinte. Isso se resolve limpando o armazenamento no
teste, não atrasando a gravação em produção. **A gravação local não pode depender de o usuário esperar**;
a porta remota pode continuar com debounce.

### Não são achados desta execução

- **`git stash`** para produzir o controle do passo 2 — `00-prompt-executor` §7 item 11 proíbe. Nada se
  perdeu, e a ordem do passo 2 (*escrever e rodar o teste antes de mexer*) dispensaria o stash. Fica
  registrado; é a tensão já anotada no [[00-backlog]].
- Status 🟡 não marcado — declarado pelo executor.

---

## Veredito — 2026-09-11 (correção 1) — 🔴 Reprovado

**Os achados 2 e 4 estão fechados, e o 3 quase.** Falta a outra metade do achado 1, um caso de borda do 3,
e uma regra de conformidade que eu deixei passar na primeira revisão.

### O que verifiquei e está certo

- **Achado 1, na direção nativa → oposta:** a troca de modo agora parte do design **atual**, e só os tokens
  da contraparte mudam. Refiz a medição da rodada anterior: navegação, cor de marca e fundo do
  administrador sobrevivem.
- **Achado 2:** a preferência age em `bodySize`, e o teste afirma `--theme-font-size-base` — a variável
  emitida. Conferido.
- **Achado 3:** cinco tokens de posição no `design`, sob paridade — `verify_parity` → **428 nas 3 fontes**;
  padrão de fábrica correto no schema; `ThemeEntry.preferencesOffered` removido.
- **Achado 4:** a gravação local não espera mais (`usePreferencesManager.ts`, sem `setTimeout`), e o teste
  que vazava agora limpa o `localStorage`.
- **Execuções, feitas por mim:** suíte completa (`--maxWorkers=3`) → **357 arquivos / 1778 testes, verde**.
  `barrel` · `catalog` · `public-types` · `token-types` · `guide` · `dev-kit` · `chrome-token-parity` →
  verdes. `audit:baseline --with-tsc` → igual ao baseline. Nada escrito no Git.

### Achados

**1. A troca de modo só funciona numa direção.**
`applyColorMode` aplica a contraparte sempre que o modo pedido difere do atual. Mas a contraparte é o bloco
do modo **oposto ao nativo da entrada** — não ao modo atual. Quando o administrador salvou o tema no modo
oposto (pelo seletor *Tema do Sistema* do painel), o design atual **já** carrega os valores da contraparte;
o usuário que pede o modo nativo recebe a contraparte **de novo**. **Medido por mim**, `minimalist-airy`
(nativo claro) salvo em escuro, usuário pede claro:

| Token | Nativo claro | Tema salvo (escuro) | O que o usuário vê |
| --- | --- | --- | --- |
| `mode` | `light` | `dark` | `light` |
| `colorBgBody` | `#F9FAFB` | `#0d1016` | **`#0d1016`** |
| `textColorMaster` | `#0f172a` | `#eef1f6` | **`#eef1f6`** |

A tela diz *claro* e pinta *escuro*. É a metade do invariante do veredito anterior que ficou sem fazer:
*"com o valor nativo **ou** o da contraparte conforme o modo pedido"*. Para as chaves que a contraparte
declara, o valor vem da entrada no modo nativo e da contraparte no oposto; o resto, do design atual.
**Teste que falta:** tema salvo no modo oposto ao nativo + usuário pede o nativo → paleta nativa.

**2. Um design sem os tokens de posição oferece tudo.**
`isPreferenceOffered` (`schema/preferences.ts:88-89`) é `design?.[token] !== 'off'`: chave **ausente** conta
como oferecida. O `validateDesign` não completa chaves ausentes — o padrão só entra pela semente inicial —,
e há caminho no painel que **substitui** o design inteiro por um de catálogo, que não tem as chaves novas:
`TemplatesTab.tsx:25`, `sarak.applyFullConfig(theme.design)`. O administrador que aplica um modelo passa a
oferecer fonte, navegação e idioma a todos, sem saber — o contrário do padrão de fábrica. **Medido na
função:** design sem as chaves + preferência de fonte G e navegação lateral → `bodySize` 16px → 18px e
`topbar` → `sidebar`. **Ausente vale o padrão do token**, não *oferecida*.

**3. Citação de plan, achado e veredito — em testes e em código de produção.**
Cerca de 24 ocorrências introduzidas por esta plan: `describe('… (plan-73)')` em dez arquivos de teste;
títulos com *"achado 1"*, *"achado 2"*, *"veredito de 2026-09-11"*; comentários com *"achado 4 do
veredito"*; e **`src/core/Design/schema/preferences.ts:10`**, código de produção, citando *"a barra da
plan-74"*. `padrao-escrita`, `references/comentarios.md:84`. `grep -rnE "plan-7[0-9]|achado [0-9]|veredito"`
nos arquivos criados ou alterados por esta plan tem de voltar sem nenhuma ocorrência **nova** — as
citações antigas que já existiam nesses arquivos (`plan-24-1`, `plan-26`, `plan-27`, `plan-36`, `plan-42`,
`plan-45`) não são desta plan e ficam.
**Nota do revisor:** a maior parte já estava na primeira rodada, e eu não a apontei — não rodei esse
`grep` naquela revisão. A regra vale mesmo assim; a falha de não ter visto antes é minha.

---

## Veredito — 2026-09-12 (correção 2) — 🔴 Reprovado

**Dois dos três achados estão fechados, e o terceiro fechou abrindo outro buraco.** Um achado só, com
conserto de uma linha e um teste que precisa exercitar o caso de verdade.

### O que verifiquei e está certo — medido por mim

| Caso | Resultado |
| --- | --- |
| Tema salvo no modo oposto ao nativo, usuário pede o nativo | ✅ paleta nativa restaurada (`colorBgBody` → `#F9FAFB`) |
| Design sem os tokens de posição (o caminho do `TemplatesTab`) | ✅ fonte e navegação **não** se aplicam; o modo, fixo por padrão, se aplica |
| Citações de plan, achado e veredito nos arquivos desta plan | ✅ nenhuma nova — só as antigas, que não são desta plan |

**Execuções:** suíte completa (`--maxWorkers=3`) → **357 arquivos / 1779 testes, verde**. `barrel` ·
`catalog` · `public-types` · `token-types` · `guide` · `dev-kit` → verdes. `audit:baseline --with-tsc` →
igual ao baseline.

### Achado

**1. Pedir o modo em que o tema já está apaga as cores que o administrador personalizou.**
`applyColorMode`, ramo com contraparte: a correção tirou o retorno antecipado de *"modo pedido = modo
atual"*, que a rodada anterior tinha. Agora, com o modo pedido igual ao nativo, as chaves da contraparte
são sempre reescritas com o valor **de catálogo** — mesmo quando nada precisava mudar. **Medido**, com o
`minimalist-airy` em claro e o administrador tendo personalizado fundo e sidebar:

| Pedido do usuário | `sidebarColor` (admin: `#1e3a5f`) | `colorBgBody` (admin: `#fff7ed`) |
| --- | --- | --- |
| claro | **`#F9FAFB`** | **`#F9FAFB`** |
| sistema (resolvendo claro) | **`#F9FAFB`** | — |

Fundo, sidebar, topbar, cards, texto e bordas são justamente as chaves que carregam modo — e as mais
personalizadas no painel. É a mesma classe do achado 1 original, agora restrita a elas.

**Por que os testes não viram:** o teste *"pedir o modo em que o tema já está devolve EXATAMENTE o design"*
(`overlayPreferences.test.ts:23-27`) personaliza só `navigationStyle`, que não é chave de modo — passa sem
nunca exercitar o caso.

**Conserto:** o modo pedido igual ao modo **atual** do design não muda nada — em qualquer um dos dois
ramos. A escolha entre valor nativo e contraparte só vale quando o modo muda de fato. **Teste que falta:**
uma chave **de modo** personalizada sobrevive quando o usuário pede o modo em que o tema já está — com o
tema no modo nativo, com o tema salvo no modo oposto, e pelo modo *sistema*.

---

## Veredito — 2026-09-12 (correção 3) — 🟢 Aprovado

**O achado está fechado, e agora a troca de modo está certa nos dois sentidos e no caso de não mudar.**
O retorno antecipado *"modo pedido = modo atual"* voltou ao topo de `applyColorMode` e vale nos dois ramos.

**Medido por mim, os quatro casos que as três rodadas levantaram:**

| Caso | Resultado |
| --- | --- |
| tema salvo no modo oposto ao nativo, usuário pede o nativo | ✅ paleta nativa |
| administrador personalizou chaves de modo, usuário pede o mesmo modo | ✅ personalização preservada |
| idem, pelo modo *sistema* | ✅ preservada |
| design sem os tokens de posição | ✅ padrão de fábrica: só modo e recolher se aplicam |

**Teste de mutação, feito por mim:** removendo o retorno antecipado, **exatamente os três testes novos
caem** — eles guardam o caso. Arquivo restaurado byte a byte.

**Execuções:** suíte completa (`--maxWorkers=3`) → **357 arquivos / 1782 testes, verde**. `barrel` ·
`catalog` · `public-types` · `token-types` · `guide` · `dev-kit` · `chrome-token-parity` · `class-merge` →
verdes. `verify_parity` → 428 nas 3 fontes. `audit:baseline --with-tsc` → igual ao baseline. Nenhuma
citação nova de plan, achado ou veredito. Nada escrito no Git.

**Critérios de aceite — 10/10**, com a correção que o veredito de 2026-09-11 fez ao desenho: o que o tema
oferece é token de tema, no `design`, com as três posições da plan-74 e o padrão de fábrica dela.

---

# 11. Síntese
