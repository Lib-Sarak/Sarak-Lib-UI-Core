---
tipo: "plan"
titulo: "Fazer todo ícone passar por uma porta só, aberta ao consumidor"
objetivo: "Fazer a familia e o peso de icone escolhidos no painel valerem para todo icone da lib, e permitir ao consumidor trazer os proprios icones por registro ou por elemento, sem lista fechada"
dominio: "Sarak-Lib-UI-Core / Átomos / Ícones"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "icones", "iconFamily", "lucide", "consumidor"]
relacionados: ["[[03-superficie-publica]]", "[[09-temas-e-presets]]", "[[01-gates-e-baseline]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md"
---

# 1. Objetivo

Trocar a família ou o peso de ícone no painel repinta **todos** os ícones da lib — como o catálogo já
promete — e um consumidor usa qualquer ícone que precise: registrando os seus por nome, ou passando o
elemento direto, sem bater numa lista fechada.

# 2. Contexto

**Decisão do dono (2026-10-02):** corrigir os ícones e tornar a escolha configurável no painel; os pacotes de
ícone por tema (troca do *desenho* do ícone de navegação, herdados do legado Oss) **saem** — abrir o ícone ao
consumidor cobre o caso.

**Medido em 2026-10-02:**

| Fato | Onde |
|---|---|
| Os tokens `iconFamily` (`lucide` / `phosphor` / `tabler`) e `iconWeight` existem, 14 temas os declaram, e o `SarakIcon` os consome | `src/core/Design/schema/system.ts:205-232` · `src/components/atomic/Icon/SarakIcon.tsx:40-41` |
| **34 arquivos** de `src/components` e `src/core` importam `lucide-react` direto e não seguem o token — entre eles `SarakModal`, `SarakStats`, `SarakTable`, `SarakSearch`, `SarakExpandableCard`, `SarakShellThemeToggle` *(eram 37 antes de o modo host sair)* | `git grep -l "from 'lucide-react'" -- src/components src/core` (35 arquivos, um é a própria família) |
| **Mais 30 arquivos de `src/features/DesignEngine/`** importam `lucide-react` direto. **Ficam fora da regra, de propósito:** são os ícones do **painel de autoria** — a ferramenta com que a lib faz o tema, não o produto do consumidor —, e o painel não deve repintar o próprio chrome com a família que está sendo editada. O gate declara esse limite (R18) | `git grep -l "from 'lucide-react'" -- src/features` |
| O catálogo de componentes afirma que trocar a família "repinta todos os ícones" | `docs/component-catalog.md:89` |
| A lista de nomes é fechada em 100; nome desconhecido vira `AlertCircle` com um aviso. Dos ícones que o Oss usa faltam 25 de 38; dos do Cripto, 39 de 98 (`Brain`, `Gauge`, `Key`, `Wallet`, `Wifi`, `Target`…) | `src/components/atomic/Icon/iconNames.ts:19-54` · `SarakIcon.tsx:28-47` |
| `iconStrokeWidth` só é lido pelo `SarakSpinner`; dois temas o declaram sem efeito | `src/components/atomic/Feedback/SarakSpinner.tsx:47` |
| Código morto dos pacotes de ícone: `src/constants/icon-packs.tsx` (8 pacotes), `emojiSet` no payload, `ThemeEditor.tsx`, `useThemePreview.ts`, `ShortcutsTab.tsx`, `LanguageTab.tsx` — nenhum tem importador | `git grep -l` por nome |
| A família lucide importa ícones de **marca** (`Chrome`, `Github`) que a linha 1.x do `lucide-react` removeu; o peer é aberto (`>=0.284.0`), e o `login-completo` precisou pinar `0.577.0` | `src/components/atomic/Icon/families/lucideIcons.ts:24,43` · `package.json` |
| `arquitetura/03` §6.2 cita `ICON_NAMES` (hoje `SARAK_ICON_NAMES`) e diz que nome desconhecido "não desenha ícone" — desenha `AlertCircle` | `specs/arquitetura/03-superficie-publica.md:248-250` |

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/atomic/Icon/**` — a porta: o registro extensível, o elemento como ícone, o consumo de
  `iconStrokeWidth`.
- Os 34 arquivos de `src/components` e `src/core` que importam `lucide-react` direto — passam a usar `SarakIcon` (ou a porta que ele expõe). **Não** os de `src/features/DesignEngine/` (§2).
- `src/core/Design/schema/system.ts` — só `description` dos três tokens, se precisar dizer o alcance.
- `src/constants/icon-packs.tsx`, `src/features/DesignEngine/Library/ThemeEditor.tsx`,
  `src/features/DesignEngine/Context/useThemePreview.ts`, `src/features/DesignEngine/Panels/ShortcutsTab.tsx`,
  `LanguageTab.tsx`, a chave `emojiSet` em `src/core/Provider/types.ts` e `payloadExtraKeys.ts`, e os testes
  deles — **removidos**.
- `gates/scripts/contrato/` — o gate que impede `lucide-react` (e as outras famílias) fora da porta, com teste. Escopo do gate: `src/` **menos** `src/features/DesignEngine/` e a pasta das famílias; o limite é declarado no cabeçalho (R18).
- `package.json` — a faixa do peer `lucide-react`, se a escolha for cortar os ícones de marca ou fixar o teto.
- `src/components/Layout/chrome/navItem.ts` e `src/components/atomic/Navigation/SarakMenuItem.tsx` — `icon`
  aceita nome **ou** elemento.
- `docs/migracoes.md`; `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`, `dist/`, `src/core/Provider/generated/`
  regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- Os nomes dos 100 ícones já publicados — ninguém some.
- Família nova de ícones (SVG próprio, emoji). O registro é a porta; quem quer outra família a registra.
- O painel além de garantir que `iconFamily`/`iconWeight`/`iconStrokeWidth` apareçam como os outros tokens.
- Os pacotes de ícone por tema do legado: não voltam.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §6.2 (contrato de nomes de ícone — a versão atual está defasada e é destino) e §4.3 (prefixo) |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | o que um tema declara; a paridade das chaves que saem (`emojiSet`) |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | a paridade das três fontes — remover chave é operação da skill |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R18 (todo gate declara o que não vê) e R35 (o molde de "porta única" com gate) |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | §2.2 — onde o gate novo entra no catálogo |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | §3 — remover chave de payload é MAJOR; §5 — a nota |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-refatorar-componente` | remover `emojiSet` sem quebrar a paridade |
| **Skill** | `test-unitario` | os testes |
| Código | `src/components/atomic/Icon/SarakIcon.tsx` · `IconMap.ts` · `iconNames.ts` · `families/*.ts` | a porta de hoje |
| Código | `gates/scripts/contrato/check-class-merge.mjs` | o idioma de um gate de "porta única" (R35) a reproduzir |

# 5. Instruções de execução

1. **Inventário**: liste os 34 arquivos e, em cada um, os ícones usados. Registre no resumo.
2. **A porta aceita elemento**: `SarakIcon` (e o `icon` do item de navegação) aceita nome registrado **ou**
   `ReactNode`. Elemento passa direto, com o tamanho e a cor do contexto.
3. **Registro extensível**: `sarakRegisterIcons({ nome: componente })` — o consumidor acrescenta nomes; os 100
   continuam. Nome desconhecido continua caindo em `AlertCircle` com aviso único.
4. **Família e peso valem para todos**: os 34 arquivos passam a usar a porta; nenhum `from 'lucide-react'`
   (nem phosphor/tabler) sobra fora de `src/components/atomic/Icon/families/` e de `src/features/DesignEngine/` (o painel de autoria). `iconStrokeWidth` chega ao
   ícone.
5. **O gate**: `icon-port:check`, no Anel 1 e na CI, acusa import direto de qualquer família fora da porta (e fora do painel de autoria, que o cabeçalho declara não ver).
   Caso que falha por fixture. Cabeçalho com os limites (R18).
6. **Ícones de marca**: tire `Chrome`/`Github` da família lucide (o `SarakSocialButton` passa a receber o
   ícone do consumidor por `icon`, elemento) e ajuste o peer para a faixa que a lib de fato suporta. Registre
   a escolha no resumo.
7. **Código morto** sai: pacotes de ícone, `emojiSet`, as abas e o editor sem importador, com seus testes. A
   paridade das três fontes fecha; `docs/migracoes.md` ganha a nota MAJOR (`emojiSet` deixa de ser chave
   aceita; `Chrome`/`Github` saem dos nomes).
8. Confirme que `iconFamily`, `iconWeight` e `iconStrokeWidth` aparecem no painel como qualquer token de
   `select`/`slider` — se não aparecerem, é achado: relate.
9. `npm run build` · `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` ·
   `npx vitest run` · `npm run audit` → verdes.

# 6. Critérios de aceite

- [ ] `git grep -l "from '\(lucide-react\|@phosphor-icons/react\|@tabler/icons-react\)'" -- src ':!src/features/DesignEngine'` devolve só
      arquivos de `src/components/atomic/Icon/families/`.
- [ ] Teste: trocar `iconFamily` no Provider muda a família de um ícone do `SarakModal` e de um do `SarakTable`
      (dois dos 34, escolhidos como amostra).
- [ ] Teste: `sarakRegisterIcons` torna um nome novo renderizável; `icon={<svg/>}` renderiza o elemento.
- [ ] Teste: `iconStrokeWidth` chega ao `stroke-width` do ícone.
- [ ] O gate acusa uma fixture com import direto e passa sobre a base.
- [ ] `git grep -n "emojiSet\|icon-packs\|ThemeEditor\|ShortcutsTab\|LanguageTab\|useThemePreview" -- src`
      → vazio; paridade das três fontes verde.
- [ ] `docs/migracoes.md` tem a nota; o catálogo não promete mais do que faz.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx vitest run` verdes; `npm run audit` sem regressão.

# 7. Como verificar (uso do revisor)

**Gate:** regra nova — *todo ícone da lib passa pela porta de ícones; nenhuma família é importada fora dela*
(`icon-port:check`). Vale para a relação entre todos os componentes; é a mesma forma da R35.

- `git status` + `git diff --stat` → só §3.1.
- O `grep` do critério 1 → só `families/`.
- Mutação por fixture do gate → acusa; sobre a base → verde.
- Rodar isolados os testes dos critérios 2 a 4.
- `node gates/scripts/contrato/check-minor-no-removal.mjs` → os nomes removidos batem com a nota.
- `npm run build` · `npx tsc --noEmit` · `npx vitest run` · `npm run audit`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md`

- **`03-superficie-publica`** §6.2 reescrita — o contrato de ícones: nome registrado ou elemento; registro
  extensível; família, peso e espessura do tema valem para todo ícone; nome desconhecido → `AlertCircle` + aviso.
- **`09-temas-e-presets`** — o que um tema declara de ícone (família, peso, espessura) e que `emojiSet` não é
  mais chave.
- **`00-regras-e-invariantes`** — a regra nova (próximo número livre), com gate; a contagem da §1.3.
- **`01-gates-e-baseline`** §2.2 e §2.2.1 — o gate no catálogo e onde roda.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

### Rodada de 2026-10-05

**Resultado:** Concluído e entregue para revisão.

**Fotografia inicial, antes da primeira edição:**

```text
 M src/features/DesignEngine/Main/MasterControlPanel.tsx
 M src/features/DesignEngine/Main/__tests__/MasterControlPanel.test.tsx
 M src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx
 M src/features/DesignEngine/Main/hooks/__tests__/useThemeCustomizationData.test.ts
 M src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts
 M src/features/DesignEngine/Panels/hooks/__tests__/useSovereignSearch.test.ts
 M src/features/DesignEngine/Panels/hooks/useSovereignSearch.ts
 ?? .claude/settings.local.json
 ?? src/features/DesignEngine/config/token-search-concepts.json
 ?? src/features/DesignEngine/utils/__tests__/token-search.test.ts
 ?? src/features/DesignEngine/utils/token-search.ts
```

Os arquivos da fotografia foram preservados. A regra de importação de ícones cobre `src/`, exceto `src/components/atomic/Icon/families/**` e `src/features/DesignEngine/**`; o segundo caminho permanece como ferramenta de autoria.

**O que foi feito:**

- `SarakIcon` aceita nome curado ou elemento React, aplica família/peso/espessura do tema e aceita registros do consumidor com `sarakRegisterIcons`; nome desconhecido usa `AlertCircle` com aviso deduplicado. Sem Provider, usa os defaults Lucide.
- Os 34 consumidores inventariados abaixo passaram pela porta. Um import adicional com aspas duplas em `SarakHelpButton.tsx` também foi migrado. Navegação aceita nome registrado ou elemento.
- `Chrome` e `Github` saíram das famílias e da lista pública. `SarakSocialButton` agora exige `icon: React.ReactNode`, fornecido pelo consumidor, e compõe `SarakButton`.
- `emojiSet` foi removido de `src/core/Provider/types.ts`, `payloadExtraKeys.ts` e da prévia. A chave já não existia nas três fontes de paridade (schema, partições JSON e `theme_table_mapping.json`), portanto elas permaneceram sem essa chave; a paridade final valida 430 tokens.
- Schema de `iconFamily`, `iconWeight` e `iconStrokeWidth` está em `src/core/Design/schema/icons.ts`. Os controles existentes tratam `select` e `slider`, incluindo o painel de personalização.
- Foram removidos `icon-packs`, `ThemeEditor`, `useThemePreview`, `ShortcutsTab` e `LanguageTab`, com testes/snapshots órfãos. A busca dos nomes removidos em `src/` ficou vazia.
- Foi criado somente um gate: `icon-port:check`. Ele entra em `npm run build` depois de `prefix:check`, no Anel 1 do `.githooks/pre-commit`; a CI o executa via `gates:full` → `npm run build`. O cabeçalho registra os quatro limites R18, evidenciados mais abaixo.
- `docs/migracoes.md` recebeu uma subseção MAJOR dentro da seção existente `## 8.0.0 — um cromo por aplicação`, com antes/depois de `emojiSet`, `Chrome` e `Github`; nenhuma versão nova foi criada. O peer de `lucide-react` ficou `>=0.284.0 <1.0.0` em `package.json` e `package-lock.json`, mantendo a API compatível da faixa 0.x e evitando atravessar a major 1.x.

**Arquivos alterados:**

| Área | Arquivos e efeito |
|---|---|
| Porta e superfície pública | `src/components/atomic/Icon/SarakIcon.tsx`, `iconNames.ts`, mapas de `families/`, `src/components/atomic/Navigation/SarakMenuItem.tsx`, `SarakShellNav.tsx`, `src/components/Layout/chrome/navItem.ts`, `src/index.ts`; props públicas e navegação aceitam a nova forma. |
| Consumidores | Os 34 arquivos da tabela de inventário e o extra `src/components/atomic/Templates/SarakHelpButton.tsx`; imports diretos de famílias foram substituídos por `SarakIcon`. |
| Marca social | `SarakSocialButton.tsx` e teste; `AuthSocialLogin.tsx` e teste; `SarakAuthScreen.tsx` e teste; `AuthMock.tsx`; configurações tipadas agora recebem o elemento de marca. |
| Tokens e prévia | `src/core/Design/schema/icons.ts` (novo), `schema/system.ts`, `catalog/partitions/data_and_charts.json`, `src/core/Provider/types.ts`, `payloadExtraKeys.ts`, `ThemeCustomizationTab.tsx`, `PreviewCanvas.tsx` e testes. `theme_table_mapping.json` já não continha `emojiSet`. |
| Gate e integração | `gates/scripts/contrato/check-icon-port.mjs` e `__tests__/check-icon-port.test.mjs` (novos); `check-minor-no-removal.mjs` e seu teste; `check-zero-brand.mjs`; `package.json`, `package-lock.json`, `.githooks/pre-commit`. |
| Migração e código morto | `docs/migracoes.md`; exclusões e testes correspondentes de `src/constants/icon-packs`, `DesignEngine/Library/ThemeEditor`, `DesignEngine/Context/useThemePreview` e `DesignEngine/Panels/{ShortcutsTab,LanguageTab}`. |
| Compatibilidade dos testes | `src/features/DesignEngine/Canvas/Mocks/__tests__/{ChartsMock,SettingsMock}.test.tsx` agora mockam também `useSarakUIOptional`. |
| Gerados por comando | `src/core/Provider/generated/`, `src/core/Provider/buildInfo.ts`, `dist/`, `sarak-ui/`, `sarak-dev/` e `docs/component-catalog.{json,md}` foram atualizados apenas pelos geradores/build. |

**Inventário dos 34 arquivos previstos:**

| Arquivo | Ícones usados |
|---|---|
| `src/components/atomic/Cards/SarakActionCard.tsx` | `ChevronDown`, `ExternalLink` |
| `src/components/atomic/Cards/SarakExpandableCard.tsx` | `Maximize2`, `X` |
| `src/components/atomic/Cards/SarakSearchCard.tsx` | `Eye`, `Globe`, `MessageSquare`, `Search` |
| `src/components/atomic/DataDisplay/SarakDataTable/SarakTableSortButton.tsx` | `ArrowDown`, `ArrowUp`, `ArrowUpDown` |
| `src/components/atomic/Feedback/SarakEmptyState.tsx` | `Box`, `Compass`, `Sparkles` |
| `src/components/atomic/Inputs/SarakRichText.tsx` | `Bold`, `Italic`, `Link2`, `List`, `ListOrdered` |
| `src/components/atomic/Inputs/SarakSearch.tsx` | `ArrowRight`, `Command`, `Search` |
| `src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx` | `ChevronLeft`, `ChevronRight`, `Download`, `ZoomIn`, `ZoomOut` |
| `src/components/atomic/Modals/SarakModal.tsx` | `X` |
| `src/components/atomic/Navigation/SarakLink.tsx` | `ExternalLink` |
| `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx` | `Check`, `ChevronDown`, `Globe` |
| `src/components/atomic/Navigation/SarakShellSearchWidget.tsx` | `ArrowRight`, `Command`, `Search` |
| `src/components/atomic/Navigation/SarakShellThemeToggle.tsx` | `Moon`, `Sun` |
| `src/components/atomic/Templates/Chat/ChatHeader.tsx` | `Bot`, `Settings2`, `Sparkles`, `Trash2` |
| `src/components/atomic/Templates/Chat/ChatInput.tsx` | `ChevronDown`, `Cpu`, `FileIcon` → `File`, `Paperclip`, `Send`, `X` |
| `src/components/atomic/Templates/Chat/MessageBubble.tsx` | `Bot`, `Cpu`, `Search` |
| `src/components/atomic/Templates/Chat/MessageList.tsx` | `Terminal` |
| `src/components/atomic/Templates/Chat/ModelPicker.tsx` | `Check`, `Search` |
| `src/components/atomic/Templates/SarakCardGrid.tsx` | `AlertCircle`, `Search`, `XCircle` |
| `src/components/atomic/Templates/SarakCatalogGrid.tsx` | `Binary`, `Database`, `LayoutGrid`, `Search`, `XCircle` |
| `src/components/atomic/Templates/SarakChart.tsx` | `Activity`, `TrendingUp` |
| `src/components/atomic/Templates/SarakExpandableMatrix.tsx` | `ChevronDown`, `Info`, `Search`, `Shield` |
| `src/components/atomic/Templates/SarakForm.tsx` | `AlertCircle`, `Save`, `Settings`, `ShieldCheck` |
| `src/components/atomic/Templates/SarakManagementGrid.tsx` | `Plus`, `X` |
| `src/components/atomic/Templates/SarakStats.tsx` | `Activity` |
| `src/components/atomic/Templates/SarakTable.tsx` | `AlertCircle`, `MoreHorizontal`, `RefreshCw`, `Search` |
| `src/components/atomic/Templates/components/AuthForm.tsx` | `Cpu` |
| `src/components/atomic/Templates/components/AuthFormFields.tsx` | `ChevronRight`, `Eye`, `EyeOff`, `Lock`, `ShieldCheck`, `User` |
| `src/components/atomic/Templates/components/AuthHero.tsx` | `Activity`, `Cpu`, `ShieldCheck` |
| `src/components/atomic/Templates/components/ManagementGroupCard.tsx` | `Cloud`, `Plus`, `Settings2`, `ToggleLeft`, `ToggleRight`, `Trash2` |
| `src/components/atomic/Templates/components/PremiumCheckbox.tsx` | `Check`, `X` |
| `src/components/atomic/Templates/components/RecursiveMatrixNode.tsx` | `ChevronDown` |
| `src/components/atomic/Templates/components/SarakCoreCard.tsx` | `ExternalLink` |
| `src/components/engines/chat/SarakChatEngine.tsx` | `Bot`, `Paperclip`, `Send`, `Sparkles`, `User` |

Extra migrado fora dos 34: `src/components/atomic/Templates/SarakHelpButton.tsx` (`HelpCircle`, `X`). Não houve import direto de família em `src/core/`.

**Evidência dos quatro limites R18 de `check-icon-port.mjs`:**

| Limite declarado | Entrada exata e resultado da fixture |
|---|---|
| Só `.ts`/`.tsx` dentro de `src/` | Passam `components/Legacy.js`, `components/Legacy.jsx` e `../outside/Legacy.tsx`, cada um com `import { Search } from 'lucide-react';`. A mesma linha em `components/Example.tsx` dentro da raiz analisada falha. |
| Só caminhos de pacote estáticos em import, reexport, `require()` e `import()` | Falham, nas linhas 1–4 de `components/Example.tsx`: `import { Search } from 'lucide-react';`; `export { Icon } from '@phosphor-icons/react';`; `const icons = require('@tabler/icons-react');`; `const lazy = import('lucide-react');` — quatro violações. Passa `const packageName = 'lucide-react'; import(packageName);`, pois o nome é calculado em runtime. |
| Exclui `components/atomic/Icon/families/**` e `features/DesignEngine/**` | Passam `components/atomic/Icon/families/lucideIcons.ts` e `features/DesignEngine/Panel.tsx`, ambos com `import { Search } from 'lucide-react';`. `core/Provider.ts` com `import { Search } from '@tabler/icons-react';` falha fora das exceções. |
| Reconhece somente os três nomes de pacote e seus subpaths | `import { Search } from 'lucide-react/dynamic';` falha. `import { Search } from 'vendor-lucide-react';` passa. |

**Verificações finais:**

- `npx tsc --noEmit`: código 0.
- `npx vitest run`: 389 arquivos e 2.168 testes passaram. Os três testes que falharam na execução anterior eram os mocks de `ChartsMock` e `SettingsMock`; após completar os mocks, os dois arquivos focados passaram (3/3) e a suíte completa passou.
- `npm run build`: passou; ESM, CJS, declarações, CSS, `public-types:check`, `prefix:check`, `icon-port:check` e demais etapas do encadeamento concluíram.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`: igual ao baseline de 2026-08-11, nenhuma regressão.
- Verdes: `kit-names:check`, `trail-citation:check`, `class-merge:check`, `section-pointers:check`, `barrel:check`, `prefix:check`, `public-types:check`, `catalog:check`, `guide:check`, `dev-kit:check`, `token-types:check`, `zero-brand:check`, `migration-anchor:check`, `gate-limits:check` (42 scripts) e `icon-port:check`.
- `git grep -l -E "from '(lucide-react|@phosphor-icons/react|@tabler/icons-react)'" -- src ':!src/features/DesignEngine'` devolveu exatamente os três mapas em `src/components/atomic/Icon/families/`. A busca por `emojiSet|icon-packs|ThemeEditor|ShortcutsTab|LanguageTab|useThemePreview` em `src/` devolveu vazio.
- `npm run audit` ainda sai com código 1 por itens do baseline: uma variável fantasma `--x` e `<input>` nativo em `SarakMultiSelect.tsx` e `SarakUploader.tsx`. O comparador obrigatório confirmou igualdade com o baseline.
- `migration-anchor:check` passou e ancora `7.0.0`. `minor-no-removal:check` fica vermelho enquanto a versão ainda é `7.0.0`: a comparação detecta 24 nomes removidos, incluindo `Chrome` e `Github`; os outros 22 pertencem a alterações simultâneas fora deste escopo (`SarakComponent`, `SarakComponentProps`, `SarakDiscoveredModule`, `SarakDynamicRenderer`, `SarakDynamicRendererProps`, `SarakFilterDescriptor`, `SarakModule`, `SarakModuleManifest`, `SarakRouterState`, `SarakShell`, `SarakShellProps`, `SarakVisualContract`, `SarakVisualContractType`, `getSarakModule`, `registerSarakModule`, `sarakGetLocalComponent`, `sarakGetLocalComponentIds`, `sarakGetRegisteredModules`, `sarakRegisterLocalComponent`, `sarakSubscribeToRegistry`, `useModuleDiscovery`, `useSarakRouter`).
- Todos os arquivos de código modificados nesta execução ficaram com até 250 linhas. Nenhum commit foi criado.

**Decisões e limites:**

- Os dois ícones de marca são elementos do consumidor em `SarakSocialButton`; a faixa peer escolhida é `lucide-react >=0.284.0 <1.0.0`.
- O painel de autoria continua fora do gate por declaração R18, e os arquivos já sujos na fotografia inicial foram preservados. Não foram editados à mão artefatos gerados.
- A regra de tamanho se aplica aos arquivos de código tocados; nenhum arquivo Markdown de documentação foi alterado fora desta síntese e da nota de migração solicitada.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-06 — 🟢 Aprovado

**Antes de gravar:** a §10 foi relida no disco e estava vazia.

**Critérios, com a evidência medida por mim:**
- **Critério 1** — `git grep -l -E "from ['\"](lucide-react|@phosphor-icons/react|@tabler/icons-react)['\"]" -- src ':!src/features/DesignEngine'`
  devolve só os três mapas de `src/components/atomic/Icon/families/`.
- **Critérios 2 a 4** — `iconPort.test.tsx`, com mutação numa cópia fora do repositório:
  - família fixada em `lucide` → falham os casos do `SarakModal` e do `SarakTable`;
  - escala do `iconStrokeWidth` anulada → falham o caso da espessura e o do elemento direto;
  - registro ignorado → falha o caso de `sarakRegisterIcons`;
  - elemento ignorado → falha o caso de `icon={<svg/>}`.
- **Critério 5** — o `icon-port:check` sobre a base real dá 0. Fixtures minhas: import de `lucide-react` em
  `components/atomic/Cards/` → acusado; reexport de `@phosphor-icons/react` em `core/` → acusado; o mesmo import em
  `features/DesignEngine/` → livre, como o limite 3 do cabeçalho declara.
- **Critério 6** — o grep de `emojiSet|icon-packs|ThemeEditor|ShortcutsTab|LanguageTab|useThemePreview` em `src/`
  está vazio; `token-types`, `catalog` e `barrel` verdes.
- **Critério 7** — `docs/migracoes.md` ganhou a subseção `###` dentro de `## 8.0.0`, com antes e depois de
  `emojiSet`, `Chrome` e `Github`, e o novo `icon` obrigatório do `SarakSocialButton`. `Chrome` e `Github` não
  aparecem mais em `dist/index.d.ts`; `sarakRegisterIcons` aparece.
- **Critério 8** — `npx tsc --noEmit` → 0. `check-audit-baseline --with-tsc` → igual ao baseline: a regressão
  `auditor_composicaoatomica` 2 → 3 em `SarakSocialButton.tsx`, vista por mim durante a execução, sumiu, porque o
  botão passou a compor `SarakButton`. `npx vitest run` → **389 arquivos, 2168 testes verdes**, com as plans 95 e 99
  juntas na árvore; os 389 são todos os que o `vitest list --filesOnly` descobre. Verdes também: `build-info`,
  `package` (95 arquivos), `dev-kit`, `guide`, `kit-names`, `zero-brand`, `gate-limits`, `class-merge`,
  `trail-citation`, `section-pointers`, `plan-index` e `migration-anchor`.

**Fora do §3.1, aceito com o motivo:**
- **`check-minor-no-removal.mjs`** passou a comparar o conteúdo da tupla `SARAK_ICON_NAMES`. Sem isso a verificação
  que a §7 manda fazer não acontece: `Chrome` e `Github` são strings da tupla, não identificadores exportados, e o
  gate não os veria. A mudança tem caso de fixture e o limite 1 do cabeçalho reescrito.
- **`check-zero-brand.mjs`** perdeu a exceção de `LanguageTab.tsx`, que deixou de existir.
- **`schema/icons.ts`** (novo) recebe os três tokens de ícone, com os mesmos valores e as descrições ajustadas.
  `system.ts` cai de 274 para 236 linhas (R9).
- **`catalog/partitions/data_and_charts.json`** perdeu o `digitalTwins` do `ShortcutsTab` removido.

**Para depois, com dono:** o Anel 1 do `.githooks/pre-commit` rotula o gate novo como `R18`, a regra dos
limites declarados, e não a regra que ele cobra. A regra ainda não tem número: ele nasce na síntese, em
`00-regras-e-invariantes`. A troca do rótulo vira tarefa direta logo depois da síntese.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
