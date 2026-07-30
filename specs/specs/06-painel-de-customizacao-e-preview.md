---
tipo: "spec"
titulo: "Painel de customização e ambiente de preview — a camada features/ do Design Engine"
dominio: "Sarak-Lib-UI-Core / Design Engine / Autoria"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "design-engine", "painel", "preview", "gemeo-digital", "folksonomia"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[02-design-engine]]", "[[09-temas-e-presets]]", "[[08-identidade-do-host-e-zero-marca]]", "[[10-seguranca-e-acessibilidade]]", "[[003-remocao-backend-proprio]]"]
---

# 1. O que é, e por que vive em `features/`

O **painel de customização** é a ferramenta de autoria de temas da própria biblioteca: a UI onde um humano
mexe em tokens e vê o resultado ao vivo. A peça pública é o **`CustomizationPanel`**
(`src/features/DesignEngine/Library/CustomizationPanel.tsx`, exportado no barril em `src/index.ts:50`); por
dentro, quem faz o trabalho é o `ThemeCustomizationTab` orquestrando `MasterControlPanel` +
`PreviewCanvas`.

**`features/DesignEngine/` é a ÚNICA feature de `src/features/`** — e o motivo é a regra de alocação de
[[00-mapa-do-modulo]]: ela tem **estado, lógica e orquestração**, logo não é átomo. Um átomo é visual e
burro; isto é uma aplicação pequena dentro da biblioteca.

A regra de dependência que decorre disso é cobrada por gate: **`src/components` não importa `features/`** e
**`src/core` não importa `features/`** (`auditor_arquitetura.mjs`, por AST). A feature consome as camadas
de baixo; nunca o contrário.

**O que este documento NÃO cobre:** o motor (como token vira CSS Variable) é [[02-design-engine]]; o
contrato do dado de tema é [[09-temas-e-presets]].

# 2. A folksonomia dinâmica — o ponto mais interessante da arquitetura

> **O painel não tem categoria hardcoded. Ninguém monta formulário à mão.**

Três fontes se cruzam e a UI só **itera** o resultado:

| Fonte | O que injeta | Onde |
| --- | --- | --- |
| **Pilares** | as 7 abas de nível 1 | `src/features/DesignEngine/config/design-pillars.json` |
| **Catálogo** | a **semântica** — as `categories` de cada token | partições de `src/core/Design/catalog/` |
| **Schema** | o **dado** — tokens, tipos, constraints, defaults | `MASTER_DESIGN_MAP` |

O algoritmo está em `src/features/DesignEngine/utils/dynamic-categories.ts`:

1. **`sanitizeCategory(raw)`** (`:3-19`) — dicionário de **redução**: dezenas de rótulos livres colapsam em
   ~11 categorias canônicas (`'cores'`, `'colors-and-atmosphere'`, `'identidade'`, `'branding'`, `'marca'`,
   `'tema'`… → **"Cores e Marca"**). É o que permite ao catálogo usar vocabulário natural sem fragmentar a
   UI.
2. **`PILLAR_TO_CATEGORIES` / `CATEGORY_TO_PILLAR`** (`:23-34`) — derivados do JSON de pilares em tempo de
   import; não há mapa escrito à mão.
3. **`buildDynamicGroups(masterTokens, catalogJSON)`** (`:41-`) — cruza as categorias sanitizadas de cada
   token com o `MASTER_DESIGN_MAP` e produz `{ Pilar: { Grupo: Token[] } }`, a estrutura que a UI percorre.

Os 7 pilares (do JSON, não desta prosa): `brand`, `typography`, `surfaces`, `interaction`, `navigation`, e
os dois restantes do arquivo — cada um com `title`, `icon` e `index`.

**A consequência que importa:** **um token novo aparece no painel sozinho.** Basta existir no schema com
`categories` no catálogo — nenhuma linha de UI é escrita. Inversamente: um token que não aparece no painel
está sem categoria no catálogo, não "faltando no painel".

**O contrapeso honesto:** o dicionário de redução (`:6-16`) é uma lista de sinônimos **hardcoded**. Ele é a
cola que faz a folksonomia funcionar e é o único ponto que precisa de manutenção manual quando alguém
inventa um rótulo novo de categoria. Categoria não reconhecida cai em `'Geral'` (`:18`) — degrada, não
quebra.

# 3. Controles polimórficos

`TokenControl` (`Main/components/TokenControl.tsx`) e `DynamicTokenControl`
(`components/DynamicTokenControl.tsx`) escolhem o input **pelo `token.type`** — não por `if` por nome de
token:

| `token.type` | Controle | Onde |
| --- | --- | --- |
| `color` | `ColorControl` | `components/controls/ColorControl.tsx` |
| `slider` / `number` | slider com `min`/`max`/`step` do próprio token | `components/controls/BasicControls.tsx` |
| `select` | select populado por `constraints.options` | idem |
| `boolean` | switch | idem |
| `image` / `file` | `MediaUploaderControl` | `components/controls/MediaUploaderControl.tsx` |
| estruturais de layout | `LayoutControls` | `components/controls/LayoutControls.tsx` |

Mais `HelpTooltip`, que exibe a `description` do token — a mesma string que documenta o token no catálogo.
**A descrição escrita no schema é a ajuda que o autor de tema lê.** Isso é o que torna as descrições dos
tokens uma obrigação de produto, não um comentário.

# 4. Draft × persistido

| Estado | Onde vive | Efeito |
| --- | --- | --- |
| **Rascunho** (`draft`) | `useDesignDraft` (`hooks/useDesignDraft.ts`) | reflete **instantaneamente** no preview escopado; não toca o sistema |
| **Sistema** | `design` do Provider | o que a aplicação inteira usa |
| **Persistido** | `localStorage` (via `persistDesign`) | sobrevive ao reload |

Duas decisões de projeto do rascunho, ambas com o motivo no código:

- **O rascunho começa `null`** (`useDesignDraft.ts:25-27`) — "para seguir o sistema sem criar uma cópia
  dessincronizada no mount". Sem rascunho, `draft` **resolve para o design do sistema** (`:31-35`). Não
  existe estado intermediário nascendo defasado.
- **Comparação profunda antes de marcar mudança** (`areValuesEqual`, `:11-17`) — evita marcar rascunho
  sujo por diferença de identidade de objeto em valor estruturalmente igual (o caso dos valores
  responsivos `{desk,tab,mob}`).

**A gravação é explícita.** Mas há uma exceção deliberada e documentada: aplicar um **tema completo** pelo
catálogo (`handleApplyFullTheme`, `Main/ThemeCustomizationTab.tsx:91-108`) **comita e persiste na hora** —
via `applyFullConfigRaw` + `persistDesign`. O comentário (`:99-105`) explica por quê: o `/design` roda sob
modo rascunho, então o `applyFullConfig` "smart" só atualizaria o draft; era essa a divergência de wiring
que produzia *"0 chaves no localStorage e sem repintar ao vivo"* ao escolher um tema no catálogo.

Ou seja: **mexer num token é rascunho; escolher um tema inteiro é aplicação.** A assimetria é intencional —
o usuário que clica num tema do catálogo espera que ele valha, não que fique pendente.

O mecanismo de drafting no motor está em [[02-design-engine]].

# 5. Exportar JSON — o substituto do "salvar no banco"

`Main/utils/exportTheme.ts`:

- `buildThemeExportPayload(design, name)` (`:40-46`) devolve `{ id, name, design }` — **o mesmo shape dos
  temas embutidos**.
- `resolveCompleteDesign` (`:18-21`) parte de `getDefaultDesignState()` e sobrepõe: **exporta o conjunto
  COMPLETO de tokens, nunca o subconjunto do rascunho.**
- `slugifyThemeId` (`:24-33`) → id kebab-case estável; `downloadThemeJson` (`:49-63`) → download no browser.

O caminho ponta a ponta, que é o critério de aceite desta spec:

```
painel  →  Exportar  →  <nome>.json  →  colar num arquivo .ts/.json do repo do consumidor
        →  passar em customThemes do SarakUIProvider  →  selecionar por activeThemeId/initialTheme
```

> ### ⚠️ Isto SUBSTITUIU o "salvar tema no banco" — [[003-remocao-backend-proprio]]
>
> Não existe endpoint de tema, não existe tabela `custom_themes`, não existe botão que faz POST. **"Salvar
> um tema" É exportar este JSON.** Qualquer menção a persistência server-side em documento antigo descreve
> código removido.
>
> O que sobrou como porta para o consumidor que **quer** um backend: `persistence.onSave`/`onLoad` e
> `branding.onChange` — callbacks **dele**, chamados pela lib, apontando para o servidor **dele**
> ([[10-seguranca-e-acessibilidade]] §3.5).

# 6. O Gêmeo Digital (preview)

`src/features/DesignEngine/Canvas/`.

## 6.1 `DesignScope` — a barreira de CSS

`PreviewCanvas` renderiza o rascunho dentro de `DesignScope`
(`src/core/Design/components/DesignScope.tsx`): ele gera uma **classe única** por instância
(`sarak-scope-<id>`, derivada de `useId()` com os dois-pontos removidos porque quebram seletor CSS,
`:30-32`), injeta as variáveis do rascunho **só naquela subárvore** (`:44-48`), e publica um
`DesignOverrideContext` para que componentes que chamam `useSarakUI()` dentro do escopo leiam **o rascunho**
e não o design do sistema (`:40`).

**Nada vaza para o host:** as variáveis vão no `style` do próprio nó, e o CSS responsivo gerado vai num
`<style>` **dentro** do escopo (`:52-55`) — mirando `.sarak-scope-<id>`.

## 6.2 Simulação de viewport

Duas metades, e as duas são necessárias:

| Metade | O que faz | Onde |
| --- | --- | --- |
| **Dispositivo lógico** | `DeviceProvider overrideDevice={previewDevice}` — faz `useSarakDevice()` dentro do preview devolver o dispositivo simulado, então o reflow real acontece (cromo colapsa, tabela vira cards) | `Canvas/components/PreviewSystemRenderer.tsx:69,198` |
| **Moldura física** | largura-alvo + moldura de aparelho: `desktop: 100%`, `tablet: 768px`, `smartphone: 375px`, com bordas/raio simulando o device | `Canvas/hooks/useDeviceStyles.ts:2-23` |

**Limite declarado:** isto **não** é container query real — é override lógico + constraint de largura. O
"Tier B" (container queries verdadeiras no Gêmeo Digital) nunca foi feito; está no backlog de
[[07-responsividade-e-multidispositivo]] §8. Consequência: o preview prova o **reflow**, não a **detecção**
(§7 daquela spec).

## 6.3 Mocks modulares

`Canvas/Mocks/` — telas falsas que exercitam os componentes reais: `DashboardMock`, `TableMock`,
`ChartsMock`, `ChatMock`, `MockForms`, `MockDocuments`, `AuthMock`, `LogsMock`, `MatrixMock`,
`SettingsMock`, `TextMock`, `TypographyMock`, `ComponentsMock`.

`DashboardMock` é montado de **sub-peças** (`Mocks/Dashboard/`: `DashboardHeader`,
`DashboardMetricsGrid`, `DashboardSidePanel`, `DashboardShared`) — e isso não é higiene de arquivo: é o que
faz o preview **simular a paridade atômica de verdade**, com composição em vários níveis, em vez de um
bloco monolítico que só testaria o token de superfície.

## 6.4 Catálogos visuais

`Canvas/components/`: `AtmosphereCatalog`, `CardsCatalog`, `PresetsCatalog`, `TypographyCatalog`,
`ButtonsCatalog`, `InputsCatalog`, mais `ButtonPresetPreview`, `InputPresetPreview` e `PresetCard`.

> **Correção de estado:** a spec antiga `06-presets-engine.md` declara
> `status: "🔴 A Implementar"` justamente estes componentes. **Eles existem** — os três nomeados naquela
> spec (`ButtonPresetPreview`, `InputPresetPreview`, `PresetsCatalog`) estão em
> `src/features/DesignEngine/Canvas/components/`. O que de fato ficou pendente daquela spec é só o
> enriquecimento de presets de tabela/navegação — registrado como backlog em [[09-temas-e-presets]] §8.

# 7. Dogfooding

O painel obedece à regra de composição atômica: usa `SarakButton`, `SarakInput` e os demais átomos, não
HTML cru. **O motivo não é estético — é de detecção:** se a ferramenta de autoria da lib usasse HTML cru,
ela deixaria de exercitar os próprios átomos, e regressão visual em átomo passaria despercebida por quem
mais usa a lib (nós). O painel é o consumidor mais intenso da biblioteca.

# 8. A allowlist do zero-marca — por que ela é legítima

`scripts/check-zero-brand.mjs` proíbe os literais de marca da lib como **texto renderizado** em `src/`, com
**allowlist comentada** de três arquivos (`:37-46`):

| Arquivo | Motivo escrito no gate |
| --- | --- |
| `features/DesignEngine/Canvas/KitchenSinkPreview.tsx` | vitrine interna de componentes/temas, usada só pelo painel |
| `features/DesignEngine/Panels/LanguageTab.tsx` | cita a marca como **texto de exemplo** dentro da ferramenta de autoria |
| `features/DesignEngine/Panels/LayoutTab.tsx` | idem |

**Por que é legítimo:** estes são **painéis internos** — a ferramenta com que a lib autora temas. O
consumidor **não embute** o Kitchen Sink no produto dele. A regra zero-marca existe para que a lib não
carimbe a própria marca **no produto do consumidor** ([[08-identidade-do-host-e-zero-marca]]); um painel de
autoria interno não é produto do consumidor.

**A barra para entrar na allowlist é alta, e por construção:** cada entrada carrega **motivo escrito ao
lado**, e o motivo tem de ser "isto não é consumidor-facing" — nunca "estava vermelho"
([[01-gates-e-baseline]] §6, regra 1). Adicionar arquivo aqui é assumir publicamente que ele nunca chega
ao produto do consumidor.

⚠️ **Mas há uma tensão real:** o `CustomizationPanel` **é exportado no barril público** (`src/index.ts:50`)
e **registrado no Discovery por efeito colateral de import** (`:119-125`, ver [[04-shell-e-discovery]] §7.1).
Ou seja, um consumidor **pode** exibi-lo — e nesse caso os painéis da allowlist chegam à tela dele. A
allowlist é justificada pela **intenção** de uso, não por uma barreira técnica. Registrado como nuance, não
como violação: os três arquivos são abas internas, e nenhum consumidor real exibe o Kitchen Sink hoje.

# 9. Dívidas conhecidas (documentadas, não corrigidas)

## 9.1 `tsc`: um dos 4 erros de produção mora aqui

`src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:86` — `TS2322`: união de tipo de toast
incompatível. O alvo (`useThemePersistenceHandlers`) aceita `'error' | 'success' | 'warning'`; a função
`showToast` fornecida trata só `'success' | 'warning'`. O que fecharia é alargar a união da função.

**`tsc` não é gate hoje** — 14 erros no baseline, dos quais 4 em produção
([[01-gates-e-baseline]] §4.4). **Não corrigido aqui** (esta spec não altera código).

## 9.2 O painel inteiro é EAGER no barril

`src/index.ts:50` exporta `CustomizationPanel` de forma eager, e `:119-125` o **importa com efeito
colateral** para registrá-lo no Discovery. Resultado: o painel de autoria — a peça mais pesada da
biblioteca — está no **caminho crítico de todo consumidor**, mesmo de quem nunca o exibe. E o efeito
colateral top-level é, por definição, **não-eliminável por tree-shaking**.

Corrigir é `React.lazy`, que muda o tipo público para `LazyExoticComponent` → **breaking change**. Está
agrupado no major único da Campanha 2 (decisão D12). Não existe gate de peso de bundle
([[01-gates-e-baseline]] §4.5 item 3).

## 9.3 ⚠️ `CustomizationPanel` importa 6 abas e renderiza UMA

Achado desta entrega, verificável na leitura do arquivo
(`Library/CustomizationPanel.tsx:1-46`): ele importa `LayoutTab`, `LanguageTab`, `ShortcutsTab`,
`AdvancedTab`, `EngineCustomizationTab` e `HyperGranularityTab`, declara
`type TabId = 'sovereignty' | 'engines' | 'language' | 'shortcuts' | 'advanced'` (`:11`) e importa
`useState` — e o corpo do componente renderiza **somente `<ThemeCustomizationTab />`** (`:41`). Não há
estado de aba, não há navegação entre abas, e **as outras cinco abas são inalcançáveis**.

Duas consequências:

1. **Cinco abas de funcionalidade estão mortas na peça pública** — quem só usa `CustomizationPanel` não
   alcança layout, idioma, atalhos, avançado nem hiper-granularidade.
2. **Agrava a §9.2 de forma direta:** os 6 imports arrastam as 6 árvores de componente para o bundle do
   consumidor, e nenhuma delas renderiza. É peso puro no caminho crítico.

**Pergunta aberta para o dono:** o painel deve **voltar a ter as abas** (havia navegação, e ela foi
perdida numa refatoração — o `TabId` órfão é o vestígio) ou **as abas devem sair** e o painel assumir que é
só o customizador de tema? São correções opostas, e a escolha é de produto. **Não decidida aqui.**

## 9.4 `PreviewCanvas` aplica design SEM `validateDesign`

O boot real valida antes de aplicar (`useDesignManager`); o **caminho de preview não**. Por isso valores
fora do contrato chegavam a virar CSS Variable literal no preview — foi assim que o drift de 21 tokens
ficou visível (`plan/40.4` §Nota). Registrado também em [[10-seguranca-e-acessibilidade]] §5.4.

**Risco real:** baixo hoje (o dado do preview é o rascunho do próprio painel). Mas é uma **assimetria de
fronteira**: dois caminhos que aplicam design, um valida e o outro não.

## 9.5 ⚠️ `AdvancedTab` apaga TODO o `localStorage` da origem

`src/features/DesignEngine/Panels/AdvancedTab.tsx:17-25`:

```ts
if (confirm("ATENÇÃO: Isso restaurará TODAS as configurações visuais para o padrão de fábrica. Continuar?")) {
    setIsResetting(true);
    setTimeout(() => { localStorage.clear(); window.location.reload(); }, 1000);
}
```

**O texto promete "configurações visuais"; a ação apaga a origem inteira.** `localStorage.clear()` não
distingue chave da lib de chave do host — token de sessão, carrinho, rascunho de formulário, preferência do
usuário: tudo vai. Em seguida, `window.location.reload()` recarrega a página **do host**.

**Onde isso é grave:** num consumidor que guarda estado em `localStorage` (a maioria), e especialmente no
**modo embarcado**, onde a ilha **não é dona da página** e não deveria recarregá-la.

**O conserto é pequeno e óbvio** — remover apenas as chaves com o prefixo da lib (a `storageKey` é
conhecida, `types.ts:155`) e trocar o reload por reaplicação dos defaults. Não é feito aqui porque esta
spec não altera código; é a lacuna que eu recomendaria priorizar de toda a Fase 4.

**Atenuante:** a aba está inalcançável pela §9.3 — hoje ninguém chega a esse botão pelo
`CustomizationPanel`. **Isso é sorte, não proteção**, e desaparece no dia em que as abas voltarem.

## 9.6 `plan/14` está APOSENTADA — decisão de não fazer

`plan/14-visibilidade-aba-design-engine.md` propunha um mecanismo de visibilidade da aba do Design Engine
baseado no **shell legado**. Aquele shell não existe mais no formato pressuposto, e a exibição do painel
hoje é decisão do consumidor (ele exporta o componente e monta onde quiser, ou registra o id legado).
**Registrado como não-fazer**, para não ser retomada por engano.

# 10. Critérios de aceite

- [x] **NENHUMA menção a "salvar tema no banco"** — o único caminho descrito é export → `customThemes`.
- [x] O caminho export → `customThemes` está descrito ponta a ponta (§5).
- [x] A folksonomia está explicada com as 3 fontes, o algoritmo e `arquivo:linha`.
- [x] Os controles polimórficos aparecem mapeados por `token.type`, não por nome de token.
- [x] Draft × persistido inclui a exceção deliberada (tema completo comita).
- [x] O preview está descrito com o **limite** declarado (override lógico, não container query).
- [x] A allowlist do zero-marca tem a justificativa **e** a tensão registrada.
- [x] O erro de `tsc` está documentado e **não corrigido**.
- [x] As dívidas 9.3 e 9.5, achadas nesta entrega, estão registradas com pergunta/recomendação e sem
      decisão unilateral.

# 11. Plano de testes (Quality Gate)

| Verificação | Onde | Situação |
| --- | --- | --- |
| Folksonomia: sanitização de categoria e montagem de grupos | `src/features/DesignEngine/utils/__tests__/dynamic-categories.test.ts` | ✅ suíte |
| Rascunho: inicialização nula, resolução para o sistema, comparação profunda | `src/features/DesignEngine/hooks/__tests__/useDesignDraft.test.tsx` | ✅ suíte |
| Export completo (não subconjunto) e slug estável | `Main/utils/__tests__/exportTheme.test.ts` | ✅ suíte |
| Escopo do preview não vaza variável para o host | `src/core/Design/components/__tests__/DesignScope.test.tsx` | ✅ suíte |
| Painel monta e renderiza a aba de tema | `Library/__tests__/CustomizationPanel.test.tsx` | ✅ suíte |
| Preview (canvas, mocks, kitchen sink) | `Canvas/__tests__/PreviewCanvas.test.tsx`, `MockApps.test.tsx`, `KitchenSinkPreview.test.tsx` | ✅ suíte |
| Boot e injeção ao vivo do painel | `src/features/DesignEngine/__e2e__/Boot.spec.tsx`, `RealtimeInjection.spec.tsx` | ❌ **Playwright, manual** |

**A implementar (backlog):** um teste que prove que as abas do `CustomizationPanel` são alcançáveis — hoje
**não existe**, e é justamente por isso que a §9.3 pôde acontecer sem nenhum gate reclamar. Um teste de
"renderiza a aba X ao clicar em X" teria falhado no dia da refatoração.
