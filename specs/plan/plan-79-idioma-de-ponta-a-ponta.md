---
tipo: "plan"
titulo: "Fazer os textos da própria lib seguirem o idioma que vale, com um seletor só"
objetivo: "Fazer todo texto que a lib mostra ao usuário final aparecer no idioma que vale, nos seis idiomas oferecidos, com um único seletor de idioma na base"
dominio: "Sarak-Lib-UI-Core / Idioma"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "idioma", "i18n", "cromo", "preferencias"]
relacionados: ["[[specs/10-seguranca-e-acessibilidade]]", "[[specs/09-temas-e-presets]]", "[[specs/05-cromo-e-slots]]", "[[016-preferencias-do-usuario-separadas-do-tema]]"]
depende_de: "plan-78-o-que-o-painel-oferece-a-tela-faz"
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md · specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Com o idioma trocado para inglês, espanhol, francês, alemão ou italiano, **nenhum** texto que a lib mostra ao
usuário final continua em outro idioma: cromo, widgets, palette de busca, menu de preferências e rótulos
padrão de átomo. E existe **um** seletor de idioma na base, não dois.

# 2. Contexto

A lib já entrega **o idioma que vale**: `useSarakUI().design.language`, que é a preferência do usuário
quando o tema a oferece e habilita, e senão o idioma do tema ([[09-temas-e-presets]] §4.7 ·
[[10-seguranca-e-acessibilidade]] §3.6). O que falta é ela mesma usar esse valor. Os textos dela estão fixos,
em inglês e português misturados. Medido pelo revisor em 2026-09-13:

- `SarakSearch.tsx:120,150` — *"Available Tools"*, *"No results for …"*;
- `ShellSearchWidget.tsx:128` — *"No results for …"*;
- `ShellUserWidget.tsx:31-96` — *"User"*, *"Master"*, *"Admin"*, *"Logout"*;
- `SarakShell.tsx:202-217` — *"Falha Industrial detectada no Módulo…"*, *"Sincronizando DNA Industrial…"*,
  *"Estabilizando Ambiente Industrial…"*, *"v10.1.10 Diagnostic Active"*. Jargão que o usuário final não
  entende, em qualquer idioma.

Os idiomas oferecidos são os seis de `LANGUAGES` (`src/core/Discovery/constants.ts:5-12`): `pt`, `en`, `es`,
`fr`, `de` e `it`.

**O segundo seletor.** `src/components/atomic/Inputs/Controls.tsx:32-80` define outro `LanguageSelector`,
independente da camada de preferências ([[016-preferencias-do-usuario-separadas-do-tema]]):
- grava direto no `localStorage` com chave própria;
- escreve o cookie do Google Translate;
- recarrega a página.

Medido: nenhum dos quatro componentes desse arquivo (`LanguageSelector`, `ThemeToggle`, `UserMenu`,
`ModuleSelector`) está no barril público — `dist/index.d.ts` não os exporta. Nenhum arquivo de produção da
lib os importa, e o ERP também não. É código morto com um contrato concorrente. **Sai.** O seletor que fica é
o `ShellLanguageSelector`.

A chave de `localStorage` que ele gravava (`LANGUAGE_STORAGE_KEY`, `src/core/Provider/constants.ts:4`)
continua na lista do reset (`src/core/Provider/utils/storage.ts:10`). Assim o reset do painel ainda limpa o
dado antigo de quem já a tem salva. O comentário da constante passa a dizer que ela é legado.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Inputs/Controls.tsx` e `__tests__/Controls.test.tsx` — **removidos**.
- `src/core/Provider/constants.ts` — o comentário de `LANGUAGE_STORAGE_KEY`.
- **Novo:** o catálogo de textos da lib, um por idioma de `LANGUAGES`, e a leitura dele pelo idioma que vale.
  Mora em `src/core/` ou `src/shared/`, conforme a regra de dependência ([[00-mapa-do-modulo]]).
- Os componentes que o usuário final vê por padrão e que hoje têm texto fixo, dentro de:
  - `src/core/Shell/**`
  - `src/components/Layout/**`
  - `src/components/atomic/Navigation/**`
  - `src/components/atomic/Inputs/SarakSearch.tsx`
  - átomos com texto **padrão** (rótulo ou `aria-label` que aparece quando o consumidor não passa o dele) —
    paginação, estado vazio, fechar modal/drawer, seletor de data, upload. A lista exata sai do inventário
    do passo 1.
- Os testes de cada arquivo tocado.
- `dist/` · `sarak-ui/` · `docs/component-catalog.*` · `sarak-dev/` — **só pelos geradores**.

## 3.2 Fora
- **O painel de design** (`src/features/DesignEngine/**`). É ferramenta do administrador, e segue em português.
- Mocks e textos de exemplo do preview.
- Mensagem de console e de erro para o desenvolvedor.
- Texto que o consumidor passa por prop: o do consumidor vence sempre, e a lib não o traduz.
- Motor de tradução para as telas do host. Continua sendo do host ([[10-seguranca-e-acessibilidade]] §3.6).
- Porta para o host sobrescrever os textos da lib. É feature nova; não entra aqui.
- Temas: declarar `enabledLanguages` nos temas é da recalibração do catálogo.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §3.6 — a fronteira: a lib entrega o idioma, o host traduz as telas dele |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §4.7 — o idioma que vale e de onde ele sai |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | §2.2.2 — o seletor de idioma no cromo e as condições de montagem |
| ADR | `specs/adr/016-preferencias-do-usuario-separadas-do-tema.md` | por que o idioma é preferência, e não gravação direta |
| Spec fixa | `specs/arquitetura/00-mapa-do-modulo.md` | onde o catálogo pode morar sem violar a regra de dependência |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R12 (zero-marca: texto novo não carrega marca) · R34 (átomo renderiza sem Provider — o texto padrão precisa de um idioma sem Provider) |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` | sempre |
| Skill | `test-unitario` | os testes do passo 5 |
| Código | `src/components/atomic/Navigation/ShellLanguageSelector.tsx` | o seletor que fica, e como ele lê o idioma |
| Código | `src/core/Discovery/constants.ts` | os seis idiomas |

# 5. Instruções de execução

1. **Inventário primeiro.** Liste no resumo cada texto fixo que o usuário final vê nos arquivos do escopo
   (`arquivo:linha` → texto), incluindo `aria-label`, `title` e `placeholder` padrão. Esse inventário é o
   critério de completude: texto listado e não convertido é pendência declarada.

2. **Remover o seletor duplicado.** `Controls.tsx` e o teste dele saem. Ajuste o comentário de
   `LANGUAGE_STORAGE_KEY`, e confirme que `barrel:check` e `catalog:check` continuam verdes, porque os
   componentes nunca foram públicos.

3. **O catálogo.** Uma chave por texto do inventário, com os seis idiomas preenchidos, **todos**. A leitura
   segue o idioma que vale. Sem Provider (R34), ou com um idioma fora dos seis, o texto sai em **português**,
   que é a base da lib. Onde o texto hoje é jargão (os de `SarakShell.tsx`), a versão nova diz em linguagem
   comum o que está acontecendo — *"Carregando…"*, *"Este módulo não pôde ser exibido"*. O papel do usuário
   (`Master`/`Admin`/`User`) também passa pelo catálogo.

4. **Converter** cada texto do inventário para a leitura do catálogo. A troca de idioma em runtime repinta
   os textos **sem recarregar a página**.

5. **Testes.**
   - **Paridade do catálogo:** toda chave existe nos seis idiomas, não vazia. Um teste que **cai** quando se
     apaga uma tradução.
   - Por componente convertido: o mesmo componente em `pt` e em `en` mostra o texto de cada idioma — **as
     duas direções**.
   - **"Não muda nada":** sem idioma definido, e sem Provider, o texto sai em português.
   - Trocar o idioma pela preferência repinta o cromo sem recarga.

6. Rode os geradores (`npm run catalog`, `npm run guide`, `npm run dev-kit`), `npm run build`,
   `npm run zero-brand:check`, `npm run audit` (compare com o baseline) e a suíte inteira
   (`npx vitest run --maxWorkers=3`).

# 6. Critérios de aceite

- [ ] O inventário do passo 1 está no resumo, e todo item dele está convertido ou declarado como pendência.
- [ ] `Controls.tsx` e o teste dele não existem mais; `barrel:check` e `catalog:check` verdes.
- [ ] O catálogo tem os seis idiomas completos, e o teste de paridade cai quando uma tradução some.
- [ ] Os componentes convertidos têm teste nas duas direções e no caso "sem idioma, sem Provider".
- [ ] Nenhum texto do inventário continua fixo em `src/core/Shell/**`, `src/components/Layout/**`,
      `src/components/atomic/Navigation/**` e `SarakSearch.tsx`.
- [ ] `zero-brand:check` verde; `audit` sem regressão; suíte inteira verde. Falha em arquivo não tocado foi
      rodada isolada antes de ser atribuída ([[00-backlog]] #5).

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — a verificação é o teste de paridade do catálogo e os testes por componente (invariante
do módulo, não da relação entre módulos).

- `git status` + `git diff --stat` → só a §3.1, mais os gerados.
- **Efeito:** renderizar o `SarakAppChrome` e o `SarakShell` com `language: 'en'` num script `tsx`
  (`react-dom/server`) e procurar, no HTML, os textos em português do inventário. Nenhum pode aparecer.
  Repetir com `'pt'` procurando os ingleses.
- **Mutação:** apagar uma chave de um idioma → o teste de paridade cai. Restaurar byte a byte.
- `grep` pelos textos do inventário nos arquivos convertidos → nenhum literal sobrou.
- `grep -rnE "plan-[0-9]+|achado [0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1` e ler a saída.

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md` · `specs/05-cromo-e-slots.md`

- **`10-seguranca-e-acessibilidade`** §3.6 — sai o aviso *"os textos da própria lib não são traduzidos"*.
  Texto pronto para transporte:

  > **Os textos da própria lib seguem o idioma que vale.** Cromo, widgets, palette e rótulos padrão de átomo
  > saem de um catálogo com os seis idiomas oferecidos, e repintam na troca, sem recarga. Sem Provider, ou
  > fora dos seis, saem em português. O painel de design é ferramenta do administrador e não entra nessa
  > promessa. Texto passado pelo consumidor por prop é dele, e a lib não o traduz.
- **`05-cromo-e-slots`** §2.2.2 — o seletor de idioma é um só, e troca os textos do cromo sem recarregar a
  página.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-17

**Resultado:** Concluído com pendências

### Inventário (passo 1) — arquivo:linha → texto → destino

Levantado por leitura direta + duas varreduras dirigidas (uma antes da conversão, uma de conferência
depois). Todo item abaixo foi **convertido** para `useLibraryText()`, salvo os marcados **PENDÊNCIA** ou
**FORA DO ESCOPO**.

**`src/core/Shell/SarakShell.tsx`** — `:42` "Falha Industrial de Renderização" + `:43` "O módulo encontrou
um erro crítico..." (default do `ErrorBoundary`, ver nota abaixo) · `:58`/`:141` `"Sistema"` (fallback de
`brand.name`) · `:205` "Falha Industrial detectada no Módulo. Reiniciando Engine..." (fallback passado ao
`ErrorBoundary`) · `:206` "Sincronizando DNA Industrial..." (Suspense) · `:218` "Estabilizando Ambiente
Industrial..." + `:219` "Monitorando Layout: {w}x{h}" + `:220` "v10.1.10 Diagnostic Active" (bloco
"isReady" — jargão técnico, sem tradução plausível; **simplificado** para uma única mensagem
`shellLoading`, dimensão/versão removidas do que o usuário final vê — decisão registrada abaixo).

**`src/core/Shell/Components/SidebarNav.tsx`** — `:171`(orig.) título "Offline Module: {error}" ·
"Service Offline" · "Connection error" (fallback) · "Notifications" · `title="Arraste para redimensionar"`
(já em pt; entrou no catálogo mesmo assim, por estar no escopo).

**`src/core/Shell/Components/TopbarNav.tsx`** — `title="Arraste para ajustar a altura"`.

**`src/core/Shell/Components/ShellContent.tsx`** — `'Module'` (fallback de categoria) · "Module in API Mode
(No Local Interface)" · "Select a secondary module".

**`src/core/Shell/useSarakShell.ts`** — `:42` `mod.category || 'System Modules'` — achado da varredura de
conferência (não estava no inventário original). **Convertido**, mas é hoje **inalcançável**: ver
"Achados fora do escopo" — `useModuleDiscovery.ts` já preenche `category` com o literal `'Sistema'` antes
deste ponto.

**`src/components/atomic/Inputs/SarakSearch.tsx`** — placeholder "Search tool, record or configuration..."
· "Available Tools" · `'Module'` (fallback) · "No results for "{query}"" · "Close" · "Navigate" ·
"Search Engine" / "{systemName} Search Engine". **Não convertidos, de propósito:** "K", "ESC", "↑↓" — são
rótulos de tecla física, não idioma (ver "Decisões").

**`src/components/atomic/Navigation/ShellSearchWidget.tsx`** — `title="Search (Ctrl + K)"` · `label="Search..."`
· placeholder "Smart Search..." · "Results" · `'Module'` (fallback) · "No results for "{query}"". Não
convertidos: "CTRL"/"K" (tecla física).

**`src/components/atomic/Navigation/ShellUserWidget.tsx`** — `'User'` (fallback de nome, ×2) ·
"Master"/"Admin"/"User" (papel, ×2) · `title="Logout"` (×2).

**`src/components/atomic/Navigation/ShellThemeToggle.tsx`** — `title="Mudar para modo claro/escuro"` (×2,
já pt) · `label="Light Mode"/"Dark Mode"`.

**`src/components/atomic/Navigation/ShellLanguageSelector.tsx`** — `label="Language"` (variante vertical).

**`src/components/atomic/Navigation/ShellFontSizeControl.tsx`** — `OPTIONS` `label`/`full`: "P"/"Pequena",
"M"/"Média", "G"/"Grande" · `aria-label="Tamanho da fonte"`.

**`src/components/atomic/Navigation/ShellNavigationStyleControl.tsx`** — `OPTIONS` `label`: "Lateral"/"Topo"
· `aria-label="Estilo de navegação"`.

**`src/components/atomic/Navigation/ShellPreferencesMenu.tsx`** — `aria-label` "Fechar preferências" /
"Preferências" (×2, já pt).

**`src/components/atomic/Navigation/shellPreferenceRow.tsx`** — `label` "Expandir navegação"/"Recolher
navegação" · "Tamanho da fonte" (linha do menu) · "Navegação" (linha do menu). Recebe `t` por parâmetro —
ver "Decisões" (hook não pode ser chamado dentro do `.map()` do chamador).

**`src/components/atomic/Navigation/SarakPagination.tsx`** — `aria-label` "Paginação"/"Página
anterior"/"Próxima página".

**`src/components/atomic/Navigation/SarakBreadcrumbs.tsx`** — `aria-label="Trilha de navegação"`.

**`src/components/atomic/Navigation/SarakStepper.tsx`** — `aria-label="Progresso por etapas"`.

**`src/components/atomic/Navigation/SarakLink.tsx`** — `" (abre em nova aba)"` (sr-only, link externo).

**`src/components/atomic/Navigation/SarakShellNav.tsx`** — `aria-label="Navegação principal"` ·
`alt="Logo"` (fallback).

**`src/components/atomic/Navigation/SarakSpotlight.tsx`** — `placeholder="Buscar…"` (default) ·
`aria-label="Command Palette"` · `aria-label="Campo de busca"` (já pt) · "Nenhum resultado" (já pt).

**`src/components/Layout/chrome/ChromeCollapseToggle.tsx`** — `aria-label` "Expandir navegação"/"Recolher
navegação".

**`src/components/Layout/SarakAppChromeMobile.tsx`** — `aria-label`/`ariaLabel` "Abrir/Fechar menu de
navegação" (×2, já pt).

**`src/components/Layout/SarakAnalyticalPage.tsx`** — `aria-label` "Abrir/Fechar menu de navegação" ·
"Abrir/Fechar painel lateral" (×4, já pt).

**`src/components/atomic/Feedback/SarakEmptyState.tsx`** — `'Sistema'` (fallback, reusado) · "Waiting for
System Interaction..." · "VOID" · "Start a module in the toolbar" · `'System Core Engine'` (fallback,
simplificado para o genérico "Sistema" — ver "Decisões") · "The ecosystem is in harmony." + "No signal
detected in the main viewport." (duas linhas).

**`src/components/atomic/Modals/SarakModal.tsx`** — "Voltar"/"Avançar"/"Concluir" (wizard) ·
`aria-label="Fechar modal"` (já pt).

**`src/components/atomic/Modals/SarakDrawer.tsx`** — `ariaLabel="Fechar painel"` (já pt).

**`src/components/atomic/Inputs/SarakDatePicker.tsx`** — `placeholder="Selecione..."` (default) ·
`aria-label` "Selecionar data"/"Calendário" (fallback, já pt) · separador " — " do intervalo.

**`src/components/atomic/Inputs/SarakUploader.tsx`** — "Solte os arquivos aqui..." / "Arraste arquivos ou
clique para selecionar" (já pt).

Todo item acima está **convertido**, exceto os marcados PENDÊNCIA/FORA DO ESCOPO nesta lista e na seção
"Achados fora do escopo" abaixo.

### O que foi feito

- **Novo catálogo** `src/core/i18n/` — `catalog.types.ts` (o tipo `SarakLibraryLanguage`, derivado de
  `LANGUAGES`), `catalogEntries.part{1,2,3}.ts` (76 chaves × 6 idiomas, partidas em três arquivos pelo teto
  de 250 linhas do Clean Code — R9 não isenta `core/i18n/`), `catalog.ts` (funde as três partes) e
  `useLibraryText.ts` (o hook: lê `design.language` via `useSarakUIOptional`, cai em `pt` sem Provider ou
  com idioma fora dos seis — R34/specs/10 §3.6 —, e interpola `{var}`).
- **Convertidos** todos os arquivos do inventário acima, chamando `t('chave', {vars})` no lugar do literal.
- **`src/core/Shell/Components/SidebarNav.tsx`** excedeu o teto de 250 linhas com a conversão (252); extraído
  o companion `SidebarNavModuleItem.tsx` (a linha de módulo da sidebar, com estado offline e marcador de
  ativo) — `SidebarNav.tsx` caiu para 223 linhas.
- **Removidos** `src/components/atomic/Inputs/Controls.tsx` e o teste dele (`git rm`) — o
  `LanguageSelector`/`ThemeToggle`/`UserMenu`/`ModuleSelector` duplicados, fora do barril, sem consumidor.
- **`src/core/Provider/constants.ts`** — comentário de `LANGUAGE_STORAGE_KEY` reescrito para "legado",
  explicando que a chave segue só na lista do reset (`utils/storage.ts`, não tocado — já cobria a chave).
- **Testes**: catálogo (paridade dos 6 idiomas + teste de mutação), o hook (sem Provider → pt; idioma fora
  dos seis → pt; `config.language` → idioma correto; interpolação), um teste ponta-a-ponta de repintura sem
  reload (`languageSwitchRepaints.test.tsx`), e — para cada componente convertido — pelo menos um teste
  cobrindo pt (default) e/ou en (`config.language: 'en'`); testes existentes que assumiam o literal antigo
  foram corrigidos para o novo texto pt (ver "Verificações executadas").

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/i18n/catalog.types.ts` | criado | tipo `SarakLibraryLanguage` |
| `src/core/i18n/catalogEntries.part1.ts` | criado | 25 chaves do catálogo |
| `src/core/i18n/catalogEntries.part2.ts` | criado | 25 chaves do catálogo |
| `src/core/i18n/catalogEntries.part3.ts` | criado | 26 chaves do catálogo |
| `src/core/i18n/catalog.ts` | criado | funde as 3 partes, exporta `LIBRARY_TEXT_CATALOG`/`LibraryTextKey` |
| `src/core/i18n/useLibraryText.ts` | criado | o hook de leitura, com fallback pt (R34) |
| `src/core/i18n/__tests__/catalog.test.ts` | criado | paridade dos 6 idiomas + mutação |
| `src/core/i18n/__tests__/useLibraryText.test.tsx` | criado | sem Provider, idioma inválido, `config.language`, interpolação |
| `src/core/i18n/__tests__/languageSwitchRepaints.test.tsx` | criado | troca de idioma repinta sem `location.reload` |
| `src/core/Shell/Components/SidebarNavModuleItem.tsx` | criado | companion extraído de `SidebarNav.tsx` (teto de 250 linhas) |
| `src/core/Shell/Components/__tests__/SidebarNavModuleItem.test.tsx` | criado | teste do companion |
| `src/components/atomic/Inputs/Controls.tsx` | removido | seletor duplicado, fora do barril |
| `src/components/atomic/Inputs/__tests__/Controls.test.tsx` | removido | teste do removido acima |
| `src/core/Shell/SarakShell.tsx` | alterado | textos convertidos; bloco "isReady" simplificado |
| `src/core/Shell/Components/SidebarNav.tsx` | alterado | textos convertidos; item de módulo extraído |
| `src/core/Shell/Components/TopbarNav.tsx` | alterado | texto convertido |
| `src/core/Shell/Components/ShellContent.tsx` | alterado | textos convertidos |
| `src/core/Shell/useSarakShell.ts` | alterado | fallback de categoria convertido (hoje inalcançável — ver achados) |
| `src/core/Provider/constants.ts` | alterado | comentário de `LANGUAGE_STORAGE_KEY` |
| `src/components/atomic/Inputs/SarakSearch.tsx` | alterado | textos convertidos |
| `src/components/atomic/Inputs/SarakDatePicker.tsx` | alterado | textos convertidos |
| `src/components/atomic/Inputs/SarakUploader.tsx` | alterado | textos convertidos |
| `src/components/atomic/Modals/SarakModal.tsx` | alterado | textos convertidos |
| `src/components/atomic/Modals/SarakDrawer.tsx` | alterado | texto convertido |
| `src/components/atomic/Feedback/SarakEmptyState.tsx` | alterado | textos convertidos |
| `src/components/atomic/Navigation/*.tsx` (15 arquivos: `SarakBreadcrumbs`, `SarakLink`, `SarakPagination`, `SarakShellNav`, `SarakSpotlight`, `SarakStepper`, `ShellFontSizeControl`, `ShellLanguageSelector`, `ShellNavigationStyleControl`, `ShellPreferencesMenu`, `ShellSearchWidget`, `ShellThemeToggle`, `ShellUserWidget`, `shellPreferenceRow`) | alterado | textos convertidos |
| `src/components/Layout/SarakAnalyticalPage.tsx` | alterado | textos convertidos |
| `src/components/Layout/SarakAppChromeMobile.tsx` | alterado | textos convertidos; `t` repassado a `renderShellPreferenceRow` |
| `src/components/Layout/chrome/ChromeCollapseToggle.tsx` | alterado | texto convertido |
| ~25 arquivos `__tests__/*.test.tsx` correspondentes aos acima | alterado | assertions ajustadas ao novo texto pt; casos pt/en e, em vários, sem-Provider acrescentados |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | snapshot regravado (texto mudou) |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PreviewSystemRenderer.test.tsx.snap` | alterado | snapshot regravado (texto mudou) |
| `dist/` · `sarak-ui/` · `sarak-dev/` · `docs/component-catalog.*` | alterado | só pelos geradores (`npm run catalog`/`guide`/`dev-kit`/`build`) |

### Verificações executadas

- `npx vitest run --maxWorkers=3` → **369 arquivos / 1931 testes, 100% verde** (rodada final, após todas as
  correções).
- `npm run barrel:check` → `82 componentes registrados; barril em dia (0 faltas)`.
- `npm run catalog:check` → `catálogo em dia`.
- `npm run build` → verde (encadeia `token-types:check`, `catalog:check`, `barrel:check`,
  `zero-brand:check` — `402 arquivo(s) varrido(s); zero marca da lib fora da allowlist` —, `guide:check`,
  `deep-import:check`, `build:js`, `public-types:check`, `build:css`, `build:css:scoped`).
- `npm run audit` → `AUDITORIA FALHOU: 2 regras estruturais` — **igual ao baseline**: `auditor_ghostvars`
  (1 fantasma/1 consumo, `--x` em comentário de `resolveToken.ts`/`validation.ts`/`types.ts` — não tocados
  por esta plan) e `auditor_composicaoatomica` (2 — `SarakMultiSelect.tsx` e `SarakUploader.tsx`, ambos já
  declarados no baseline; a linha acusada em `SarakUploader.tsx` é o `<input {...getInputProps()}/>` do
  `react-dropzone`, linha que esta plan não tocou). `auditor_cleancode` fechou em `[OK] Nenhum crime de
  Clean Code detectado!` (zerou os dois achados que esta execução introduziu e corrigiu — ver "Decisões").
- `npm run audit:baseline` → `igual ao baseline de 2026-08-11 — nenhuma regressão`.
- Geradores: `npm run catalog` → `82 componentes`; `npm run guide` → `88 componentes, 427 tokens, 100
  ícones`; `npm run dev-kit` → `82 componentes públicos, 427 tokens, 27 gates`.

### Critérios de aceite

- [x] O inventário do passo 1 está no resumo, e todo item dele está convertido ou declarado como
      pendência — ver seção "Inventário" acima.
- [x] `Controls.tsx` e o teste dele não existem mais; `barrel:check` e `catalog:check` verdes.
- [x] O catálogo tem os seis idiomas completos, e o teste de paridade cai quando uma tradução some —
      evidência: `src/core/i18n/__tests__/catalog.test.ts`, teste "cai quando uma tradução é apagada
      (mutação)", que apaga `en` de uma chave via `JSON.parse(JSON.stringify(...))` e afirma que a checagem
      de completude passa a `false`.
- [x] Os componentes convertidos têm teste nas duas direções — confirmado para todos. **Parcial** quanto ao
      caso "sem idioma, sem Provider": coberto explicitamente (teste dedicado) para o hook
      (`useLibraryText.test.tsx`), `SarakPagination`, `SarakBreadcrumbs`, `SarakStepper`, `SarakShellNav`,
      `ShellSearchWidget`, `ShellUserWidget` e (indiretamente, por não usar Provider algum) `SarakAnalyticalPage`
      (dispensa-a, no drawer mobile). Os demais componentes convertidos têm o caso pt-default coberto (que
      É o comportamento sem-idioma, já que nenhum teste seta `language`), mas não têm um teste que remova o
      `SarakUIProvider` explicitamente — **pendência declarada abaixo**.
- [x] Nenhum texto do inventário continua fixo em `src/core/Shell/**`, `src/components/Layout/**`,
      `src/components/atomic/Navigation/**` e `SarakSearch.tsx` — confirmado por duas varreduras dirigidas
      (research agents), a segunda já sobre o resultado final; o único achado da segunda varredura
      (`useSarakShell.ts:42`) foi convertido nesta mesma execução.
- [x] `zero-brand:check` verde; `audit` sem regressão; suíte inteira verde — evidências acima.

### Decisões e suposições

- **Base do catálogo é português**, como a instrução manda (specs/10 §3.6, "sem Provider... sai em
  português"); os seis idiomas oferecidos vêm de `LANGUAGES` (`Discovery/constants.ts`), fonte única — o
  catálogo não hardcoda a lista.
- **Jargão do bloco "isReady" de `SarakShell.tsx`** ("Estabilizando Ambiente Industrial...", "Monitorando
  Layout: WxH", "v10.1.10 Diagnostic Active") foi **simplificado para uma única mensagem** (`shellLoading`,
  reusada do Suspense), e o contador de dimensões + a etiqueta de versão foram **removidos** do que
  renderiza — a instrução (passo 3) manda "dizer em linguagem comum o que está acontecendo", e não há
  versão comum desse contador para um usuário final. Isto é mais que tradução: é remoção de conteúdo. Fica
  registrado aqui para o revisor julgar se está dentro do espírito do passo 3 ou se merece um achado à
  parte.
- **`ErrorBoundary` (classe, dentro de `SarakShell.tsx`) mantém o *default* de `fallback` em português
  literal**, não via `t()` — classe não tem hooks, e as duas chamadas reais do arquivo sempre passam
  `fallback` explícito (o `default` é hoje inalcançável). O literal usado é exatamente o valor `pt` do
  catálogo (`shellErrorHeading`/`shellErrorHint`), com comentário explicando o motivo. R34 (átomo sem
  Provider) não se aplica a uma classe sem hooks; a garantia "sem idioma, sai em pt" continua satisfeita
  porque é hardcoded exatamente nesse valor.
- **`shellPreferenceRow.tsx` recebe `t` por parâmetro**, em vez de chamar `useLibraryText()` internamente —
  a função é invocada dentro de um `.map()` de tamanho variável no chamador (`ShellPreferencesMenu.tsx`,
  `SarakAppChromeMobile.tsx`), e um hook ali violaria a ordem de chamada entre renders. `t` foi acrescentado
  a `ShellPreferenceRowContext`, resolvido uma vez no componente-pai.
- **"K"/"CTRL"/"ESC"/"↑↓" não entraram no catálogo** — são rótulos de tecla física (o "K" de Ctrl+K, o "ESC"
  do teclado), não palavras de um idioma natural; convenção comum em software internacional (mantidos como
  estão mesmo em interfaces traduzidas).
- **Fallbacks decorativos de `SarakEmptyState.tsx` foram simplificados**: `'System Core Engine'` (heading
  da variante *abstract*) virou o genérico `genericSystemLabel` ("Sistema"/"System") em vez de ganhar uma
  chave própria — é um nome decorativo inventado, sem função além de preencher o espaço do `systemName`
  ausente, e R12 (zero-marca) já trata esse tipo de fallback como "rótulo genérico de função".
- **`sarak-sovereign` / decisão de nomenclatura das chaves**: nomes descrevem o *uso* (`shellSearchWidgetTitle`),
  não o componente, para permitir reuso entre componentes que mostram o mesmo texto (ex.: `genericModuleLabel`
  usado em `ShellContent`, `ShellSearchWidget` e `SarakSearch`).

### Achados fora do escopo (não corrigidos)

- **`src/shared/hooks/useModuleDiscovery.ts:36`** — `category: mod.category || 'Sistema'`. Este é o
  fallback que **de fato** chega à tela (roda antes de `useSarakShell.ts`, que só recebe módulos já com
  `category` preenchida — por isso a conversão feita em `useSarakShell.ts:42` é hoje inalcançável, embora
  correta). `src/shared/` não está em nenhuma das quatro localizações do escopo (§3.1) nem é um dos cinco
  átomos nomeados — fica fora. Hoje o fallback já está em português (não é o jargão inglês que motivou esta
  plan), então não há vazamento de idioma errado — só não segue o idioma que vale.
- **`src/components/atomic/Inputs/SarakRangeSlider.tsx:106,117`** e **`SarakTimePicker.tsx:66`** — fallbacks
  de `aria-label`/texto em português fixo (`` `${label ?? 'range'} mínimo/máximo` ``, `label ?? 'Horário'`).
  Nenhum dos dois é um dos cinco átomos nomeados no escopo (paginação, estado vazio, fechar modal/drawer,
  seletor de data, upload) — fica fora.
- **`src/features/DesignEngine/Canvas/hooks/useMockModules.ts`** — `'System Modules'`/`'Experimental'` como
  categoria de módulo mock. Mock de preview do painel — excluído explicitamente pelo escopo (§3.2).

### Pendências / riscos

- **Cobertura "sem Provider" não é 1:1 com todo componente convertido** — ver critério de aceite acima. O
  mecanismo central (`useLibraryText`/`useSarakUIOptional`) está provado sem Provider de forma isolada e
  exaustiva; o que falta, em alguns componentes, é a prova de que ELES especificamente não quebram e caem
  em pt quando renderizados sem `SarakUIProvider` — vários deles já dependem de `useSarakUI()` (obrigatório)
  para outra coisa e lançariam de qualquer forma antes de chegar ao texto, então o teste seria sobre uma
  pré-condição alheia a este trabalho; outros (`ShellThemeToggle`, `ShellFontSizeControl`,
  `ShellNavigationStyleControl`) usam `useSarakUIOptional` e foram cobertos.
- **Achados fora do escopo acima seguem sem tarefa aberta** — cabe ao revisor decidir se descem para
  `00-backlog.md` ou viram demanda nova.

## Resumo da execução (correção 1) — 2026-09-17

**Resultado:** Concluído

Escopo: exclusivamente os dois achados do veredito de 2026-09-17.

**Achado 1 — "sem idioma, sem Provider" ficava parcial (`SarakEmptyState` lançava).**
- `SarakEmptyState.tsx` trocou `useSarakUI()` (lança sem Provider) por `useSarakUIOptional()` (nunca lança) —
  o mesmo padrão que `ShellFontSizeControl`/`ShellNavigationStyleControl`/`ShellThemeToggle` já usavam.
  Evidência: `src/components/atomic/Feedback/SarakEmptyState.tsx:4,12`.
- Medindo com o mesmo método do revisor, mais dois componentes do escopo **também lançavam** sem Provider
  pela mesma causa (`useSarakUI()` no lugar de `useSarakUIOptional()`, nada relacionado ao texto): `SarakModal`
  e `SarakDrawer` — nenhum dos dois estava na lista do achado, mas a exigência da correção ("cada componente
  convertido de `src/components/atomic/**`, exceto `Shell*`") os inclui. Corrigidos pelo mesmo padrão —
  `design` já era lido só com `?.` no restante dos dois arquivos, então a troca não muda nenhum comportamento
  além de não lançar. `SarakSearch.tsx` tinha a mesma causa e entrou na mesma correção, pelo mesmo motivo.
  Evidência: `src/components/atomic/Modals/SarakModal.tsx:4,47-49`,
  `src/components/atomic/Modals/SarakDrawer.tsx:4,30-31`,
  `src/components/atomic/Inputs/SarakSearch.tsx:4,37-38`.
- **Novo teste de tabela**, `src/components/atomic/__tests__/semProviderIdiomaPt.test.tsx` — renderiza, SEM
  `SarakUIProvider`, os 12 componentes convertidos de `src/components/atomic/**` (excluídos os `Shell*`, que
  montam sob Provider por contrato — specs/05 §2.2) e afirma o texto padrão em português. Cai se qualquer um
  voltar a exigir Provider para mostrar texto.
- Ao consertar `ShellPreferencesMenu`/`shellPreferenceRow` (que passam `t` por parâmetro, não por
  `useLibraryText()` interno — ver "Decisões" do resumo original) apareceu um segundo defeito, do mesmo
  achado: `ShellPreferencesMenuProps` **estendia** `ShellPreferenceRowContext` inteiro, então o tipo passou a
  exigir uma prop `t` que o componente nunca lê (ele gera o próprio `t` por dentro) — `npx tsc --noEmit`
  reprovava 5 chamadores (`SidebarNav.tsx`, `TopbarNav.tsx`, `ChromeSidebarBody.tsx`, `ChromeTopbarBody.tsx`
  e o teste do próprio componente) com "Property 't' is missing". Corrigido: a prop pública passou a estender
  `Omit<ShellPreferenceRowContext, 't'>`. Evidência: `src/components/atomic/Navigation/ShellPreferencesMenu.tsx:10`.
- **Outro defeito do mesmo `npx tsc --noEmit`** (não citado no veredito, mas bloqueante e desta plan — o
  comando não tinha sido rodado na entrega original, só `npm run build`/`npm run audit`, que não compilam
  com checagem de tipo completa): `SarakLibraryLanguage` era derivado de `(typeof LANGUAGES)[number]['id']`,
  e `LANGUAGES` (`Discovery/constants.ts`) não é `as const` — o tipo resolvia para `string`, não para a
  união dos seis literais, e todo `catalogo[chave][idioma]` perdia a checagem de índice (`TS7053`, em
  `useLibraryText.ts` e em dois testes). Corrigido **sem tocar `Discovery/constants.ts`** (fora do escopo
  desta plan): `SarakLibraryLanguage` passou a ser a união literal escrita diretamente em
  `catalog.types.ts`, com o motivo documentado ali — a validação em runtime continua vindo só de `LANGUAGES`
  (`useLibraryText.ts`, `SUPPORTED_LANGUAGES`), que não pode divergir. Mais um ajuste do mesmo `tsc`, em
  `SidebarNav.tsx:167` (`effectiveIsNavHidden` podia ser `boolean | undefined`, e a prop nova de
  `SidebarNavModuleItem` exige `boolean`) — `Boolean(effectiveIsNavHidden)` no ponto de chamada.
  **Um erro de `tsc` ficou de fora, de propósito:** `SarakMenuItem.test.tsx:230` — arquivo da `plan-80`
  (paralela neste worktree), não tocado.

**Achado 2 — o resumo divergia do código no tamanho do catálogo.**
- Medido agora, programaticamente: **80 chaves** (`catalogEntries.part1.ts`: 25 · `part2.ts`: 31 ·
  `part3.ts`: 24), não "76" / "25+25+26" como o resumo original afirmava. O bloco original (seção
  "O que foi feito" acima) **não foi editado** — é o registro append-only do que foi entregue naquele
  momento; esta correção é o número certo, aqui.

**Verificações executadas**
- `npx tsc --noEmit` → de 12 erros (2 pré-existentes da `plan-80`, não tocados; 10 desta plan) para **1
  erro** — o único que resta é `SarakMenuItem.test.tsx:230`, da `plan-80`.
- `npx vitest run --maxWorkers=3` → **370 arquivos / 1943 testes, 100% verde** (era 369/1931; +1 arquivo, +12
  testes — a nova tabela sem Provider).
- `npm run audit` / `npm run audit:baseline` → sem regressão (mesmos 2 auditores do baseline: `auditor_ghostvars`
  e `auditor_composicaoatomica`, nenhum tocado por esta correção).

**Critérios de aceite**
- [x] Achado 1 corrigido — `SarakEmptyState`/`SarakModal`/`SarakDrawer`/`SarakSearch` não lançam sem
      Provider; teste de tabela cobre os 12 componentes de `atomic/**` (exceto `Shell*`).
- [x] Achado 2 corrigido — número do catálogo medido e registrado (80), sem editar o bloco original.

**Decisões e suposições**
- `SarakModal`/`SarakDrawer`/`SarakSearch` entraram na correção mesmo sem estar nomeados no achado, porque a
  frase da correção ("cada componente convertido de `src/components/atomic/**`, exceto `Shell*`") não abre
  exceção para eles, e o teste de tabela exigido só fecha se os três também não lançarem. Interpretação
  assumida: a exceção é só o prefixo `Shell*`, não "qualquer componente que já precisasse de Provider por
  outro motivo".
- A correção do tipo `SarakLibraryLanguage` evita tocar `Discovery/constants.ts` (adicionar `as const` ali
  mudaria o tipo de um array consumido em mais lugares que este catálogo, fora do escopo desta plan) — o
  preço é uma pequena duplicação dos seis códigos como literais, documentada no próprio arquivo.

---

# 10. Veredito

## Veredito — 2026-09-17 — 🔴 Reprovado

**Verificado e correto:**
- **Escopo.** Todo arquivo desta entrega está na §3.1. A `plan-80` corre em paralelo no mesmo worktree, e os
  arquivos dela (`.gitignore`, `browser-tests/`, `SarakMenuItem.test.tsx`) foram separados antes da
  verificação.
- **Efeito, medido em HTML real** (`react-dom/server`, cromo + átomos convertidos): com `language` em `en`,
  `de` e `pt`, e sem `language`, o HTML traz os textos do idioma pedido e **nenhum** texto de outro idioma do
  catálogo.
- **O catálogo:** **80** chaves, os seis idiomas completos em todas, e nenhuma chave com o inglês copiado nos
  outros quatro. **Mutação:** apagada a tradução alemã de uma chave, o teste de paridade cai; restaurado com
  `cmp` idêntico.
- **Gates:** `barrel:check` (0 faltas), `catalog:check`, `guide:check`, `dev-kit:check`, `zero-brand:check`
  (407 arquivos, 0 violações), `trail-citation:check` e `audit:baseline` (sem regressão) verdes. Anel 0
  simulado sobre os arquivos alterados **e os não rastreados** (o catálogo novo inteiro): 103 arquivos,
  0 achados.
- **Suíte inteira:** 369 arquivos / **1931 testes**, 100% verde — igual ao resumo.
- `Controls.tsx` e o teste dele saíram; o seletor que fica é o `ShellLanguageSelector`.
- As decisões declaradas estão dentro do espírito da plan: o bloco de diagnóstico do `SarakShell` virou
  "Carregando…" (a §5 passo 3 pede linguagem comum), o default inalcançável do `ErrorBoundary` ficou em
  português literal, e as teclas físicas (`K`, `ESC`) não entraram no catálogo.

**Achados:**

1. **O critério *"sem idioma, sem Provider"* ficou parcial, e o que ele pega é real.** O resumo declara a
   pendência com honestidade; o critério da §6 não admite "parcial". Medido pelo revisor, renderizando cada
   átomo convertido **sem** `SarakUIProvider`: `SarakPagination`, `SarakBreadcrumbs`, `SarakStepper`,
   `SarakLink`, `SarakUploader` e `SarakDatePicker` renderizam em português; **`SarakEmptyState` lança**
   *"useSarakUI must be used within a SarakUIProvider"*. A causa é anterior a esta plan
   (`SarakEmptyState.tsx:12`, `useSarakUI()`, igual no `HEAD`), mas o arquivo está no escopo e a plan promete
   que, sem Provider, o texto dele sai em português (§5 passo 3; R34).
   **Correção:**
   - o `SarakEmptyState` passa a ler o design pela porta opcional, como os outros átomos, e renderiza sem
     Provider;
   - **um** teste de tabela renderiza, sem Provider, cada componente convertido de `src/components/atomic/**`
     e afirma o texto em português. Ficam de fora só os widgets `Shell*`, que por contrato montam sob o
     Provider ([[05-cromo-e-slots]] §2.2). Esse teste tem de cair se o `SarakEmptyState` voltar ao
     `useSarakUI()`.

2. **O resumo diverge do código no tamanho do catálogo.** Ele afirma *"76 chaves × 6 idiomas"* e
   *"25 + 25 + 26"*; o catálogo carregado tem **80** chaves. **Correção:** o bloco de correção registra o
   número medido; o bloco original fica intacto.

**Escopo da correção:** exclusivamente os dois achados acima. Ao fim: a suíte inteira verde e
`trail-citation:check` verde.

---

## Veredito — 2026-09-18 (correção 1) — 🔴 Reprovado

**Os dois achados do veredito anterior fecharam:**
- **Achado 1.** `SarakEmptyState`, `SarakModal`, `SarakDrawer` e `SarakSearch` leem o design pela porta
  opcional e renderizam sem Provider. O teste de tabela (`semProviderIdiomaPt.test.tsx`) cobre os 12
  componentes convertidos de `atomic/**`, fora os `Shell*`. **Mutação:** com o `SarakEmptyState` de volta ao
  `useSarakUI()`, cai exatamente o caso dele; restaurado com `cmp` idêntico. A inclusão de `SarakModal`,
  `SarakDrawer` e `SarakSearch` está dentro do escopo: os três estão na §3.1, e a correção pedia *cada*
  componente convertido.
- **Achado 2.** O número medido (80 chaves: 25 + 31 + 24) está no bloco de correção, e o bloco original
  ficou intacto.
- **E um defeito que o revisor não pegou:** a entrega original tinha **10 erros de `tsc`**, e a revisão
  anterior não rodou `tsc`. O executor os encontrou e corrigiu. Medido agora: `npx tsc --noEmit` dá **1**
  erro, e ele é da `plan-80` (`SarakMenuItem.test.tsx:230`), não desta plan. A troca do tipo
  `SarakLibraryLanguage` por união literal tem guarda: o teste de paridade lê `LANGUAGES`, e um idioma novo
  ali sem tradução no catálogo derruba o teste.
- **Gates:** `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check` verdes; Anel 0 simulado sobre
  106 arquivos (inclusive os não rastreados): 0 achados.
- **Suíte inteira:** 370 arquivos / **1943 testes**, 100% verde — igual ao resumo.

**Achado:**

1. **`src/components/atomic/__tests__/semProviderIdiomaPt.test.tsx:19` e `:21` citam o rastro de execução,
   e o `trail-citation:check` reprova — o que bloqueia o commit no Anel 1.** O cabeçalho do teste novo abre
   com *"Correção do veredito de 2026-09-17 (achado 1)"* e fala do *"catálogo de idioma (plan-79)"*. É a
   **R36**, e é a terceira entrega desta campanha que o gate segura pela mesma classe. O gate não aparece
   entre as verificações do resumo desta correção. **Correção:** o cabeçalho explica a regra por si
   (R34: o átomo renderiza sem Provider, e o texto padrão dele sai em português), sem citar plan, veredito
   nem achado. Rode `npm run trail-citation:check` antes de entregar.

**Escopo da correção:** exclusivamente esse cabeçalho. Ao fim: `trail-citation:check` verde.

## Resumo da execução (correção 2) — 2026-09-18

**Resultado:** Concluído

Escopo: exclusivamente o achado do veredito de correção 1 (2026-09-18).

**Achado — cabeçalho de `semProviderIdiomaPt.test.tsx` citava plan/veredito/achado (R36).** O bloco de
comentário no topo do arquivo abria com "Correção do veredito de 2026-09-17 (achado 1)" e mencionava
"catálogo de idioma (plan-79)". Reescrito para explicar a regra (R34 — o átomo renderiza sem Provider, e
o texto padrão sai em português) sem nenhuma das duas citações. Nenhuma outra linha do arquivo, ou de
qualquer outro tocado por esta plan, citava plan/veredito/achado — conferido por `trail-citation:check`
sobre o worktree inteiro (rastreado e não rastreado), não só o arquivo apontado.
Evidência: `src/components/atomic/__tests__/semProviderIdiomaPt.test.tsx:18-27`.

**Verificações executadas**
- `npm run trail-citation:check` → `[OK] Nenhuma linha adicionada cita plan, veredito ou achado de veredito.`
- `npx tsc --noEmit` → **0 erros** (o único erro restante, da `plan-80`, fechou entre uma correção e outra —
  não foi tocado por esta execução).
- `npx vitest run --maxWorkers=3` → **370 arquivos / 1943 testes, 100% verde** — inalterado desde a
  correção 1 (esta correção não mexeu em nenhum arquivo de produção nem de teste comportamental).
- `npm run audit` / `npm run audit:baseline` → sem regressão (mesmos 2 auditores do baseline).

**Critérios de aceite**
- [x] Achado corrigido — `trail-citation:check` verde.

**Decisões e suposições**
- Nenhuma. A correção foi textual, confinada ao comentário apontado.

## Veredito — 2026-09-18 (correção 2) — 🟢 Aprovado

**O achado fechou.** O cabeçalho de `semProviderIdiomaPt.test.tsx` explica a regra por si (R34: o átomo
renderiza sem Provider, e o texto padrão sai em português), sem citar plan, veredito nem achado. O
`trail-citation:check` está verde.

**Estado final, medido pelo revisor:**

| Verificação | Resultado |
| --- | --- |
| `npx vitest run --maxWorkers=3` | **370 arquivos / 1943 testes**, 100% verde |
| `npx tsc --noEmit` | **0 erros** — o erro que sobrava era da `plan-80` e foi corrigido lá (`isParseableColor` virou *type guard*, sem cast) |
| `check-audit-baseline.mjs --with-tsc` (o Anel 2 real) | igual ao baseline de 2026-08-11, sem regressão |
| `trail-citation:check` | `[OK]` |
| `barrel:check` · `catalog:check` · `guide:check` · `dev-kit:check` · `zero-brand:check` | verdes |
| Anel 0 simulado (105 arquivos, inclusive não rastreados) | 0 achados |

**As travas, com mutação do revisor** (restauradas com `cmp` idêntico):
- apagada a tradução alemã de uma chave → cai o teste de paridade do catálogo;
- `SarakEmptyState` de volta ao `useSarakUI()` → cai exatamente o caso dele no teste de tabela sem Provider.

**O efeito, medido em HTML real:** com `language` em `en`, `de` e `pt`, e sem `language`, o cromo e os átomos
mostram os textos do idioma pedido e **nenhum** texto de outro idioma do catálogo.

---

# 11. Síntese
