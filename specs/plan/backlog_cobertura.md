# Backlog de Cobertura e Hardcodes (Auditoria Spec 01) — v2 (refeita)

> **Nota de proveniência:** esta versão substitui uma execução anterior que usou um script de comparação por convenção de nomes (camelCase → kebab-case) em vez de cruzar os arrays `cssVars: [...]` reais dos tokens. Isso produziu falsos-positivos em massa na seção de Ghost Vars e um backlog de gaps raso (6 das 28 famílias, com achados de `navigation`/`tables` perdidos). Esta versão foi feita família por família, seguindo a Metodologia da Seção 5 da spec `01-auditoria-cobertura-componentes.md`: schema aberto e lido, componente(s) real(is) identificado(s) e lido(s) por inteiro (incluindo hooks), comparado com a família de referência rica (`cards.ts`/`buttons.ts`). Todo item abaixo foi verificado com arquivo:linha real — inclusive re-checado manualmente por amostragem após a coleta (ver rodapé).
>
> **Cobertura:** as 28 famílias de `src/core/Design/schema/*.ts` têm entrada própria abaixo (nenhuma foi pulada); "nenhum gap encontrado" é reportado honestamente onde for o caso (não foi forçado gap artificial para preencher).
>
> **Regra 1 da spec (lembrete):** este documento é só o backlog diagnóstico. Nenhum token foi criado, nenhum schema/manifest/catálogo/`.tsx` foi editado como parte desta auditoria.

---

## Parte 1 — Variáveis Fantasma (Ghost Vars) — revalidadas

Cada uma das 19 variáveis da lista anterior foi checada, uma a uma, contra os arrays `cssVars` dos 28 schemas, contra `src/core/Provider/manifest.ts`, e contra as 13 partições JSON de `src/core/Design/catalog/partitions/*.json`.

### 1.1 — Ghost Vars reais confirmadas (entram no backlog)

| Variável | Uso real (arquivo:linha) | Por que é ghost var |
|---|---|---|
| `--sarak-shadow-glow` | `src/components/atomic/hooks/useAtomicStyles.ts:16`, `SarakCatalogGrid.tsx:132`, `SarakActionCard.tsx:125,132`, `SarakSearchCard.tsx:152`, `ChatHeader.tsx:15`, `ChatInput.tsx:115,142`, `SarakForm.tsx:121`, `SarakManagementGrid.tsx:137`, `ManagementGroupCard.tsx:50`, `SarakChart.tsx:78` (10+ consumidores) | Não existe em nenhum `cssVars`/`manifest.ts`/partição. Só existe como alias estático hardcoded em `src/styles/_theme.css:69`: `--sarak-shadow-glow: var(--sarak-card-glow-color, rgba(0, 242, 255, 0.1));` — funciona por cascata CSS, mas está fora do pipeline dinâmico de tokens (o Design Engine não consegue editá-la). |
| `--sarak-sidebar-active` | `src/core/Shell/Components/SidebarNav.tsx:142` | **Quebra de paridade de nome.** O schema declara `--sarak-sidebar-active-color` (`src/core/Design/schema/navigation.ts:78-82`, token `sidebarActiveColor`) e `src/core/Provider/manifest.ts:200` confirma o mesmo nome. O componente usa o nome errado (falta o sufixo `-color`) — na prática essa var nunca recebe valor do Design Engine, sempre cai no fallback estático embutido no `var(...)`. **Nome correto: `--sarak-sidebar-active-color`.** |
| `--sarak-topbar-active` | `src/core/Shell/Components/TopbarNav.tsx:123,124` | Mesmo bug replicado no componente irmão. Schema declara `--sarak-topbar-active-color` (`navigation.ts:131-135`, token `topbarActiveColor`), `manifest.ts:202` confirma. **Nome correto: `--sarak-topbar-active-color`.** |

### 1.2 — Falsos-positivos e entradas inválidas descartadas (checados e removidos da lista)

| Variável | Classificação | Onde de fato existe |
|---|---|---|
| `--sarak-card-bg` | Falso-positivo | `src/core/Design/schema/cards.ts:80`, `colors.ts:129`, `manifest.ts:78`, `cards_engine.json:320` |
| `--sarak-card-radius` | Falso-positivo | `cards.ts:21`, `manifest.ts:160`, `cards_engine.json:128` |
| `--sarak-primary-color-bg` | Falso-positivo (variante derivada) | Gerada em runtime por `useDesignVariables.ts:94-129` a partir de `--sarak-primary-color` (`colors.ts:25-30`, `generateVariants: true`) |
| `--sarak-status-error-color-bg` / `-border` | Falso-positivo (derivada) | Base `statusErrorColor` (`status.ts:20-25`, `generateVariants: true`) |
| `--sarak-status-success-color-bg` / `-border` | Falso-positivo (derivada) | Base `statusSuccessColor` (`status.ts:12-17`, `generateVariants: true`) |
| `--sarak-table-border` | Falso-positivo | `tables.ts:79-84` (token `tableBorderColor`), `components_base.json:391` |
| `--sarak-table-padding` | Falso-positivo | `tables.ts:76` (token `tableCellPadding`), `components_base.json:360` |
| `--sarak-text-main` | Falso-positivo | `typography.ts:81`, `typography.json:117` |
| `--sarak-chart-primary` | Falso-positivo | `data.ts:16`, `data_and_charts.json:25` |
| `--sarak-switch-active-bg` | Falso-positivo | `switches.ts:17`, `components_base.json:1047` |
| `--sarak-chat-anim-speed` | Falso-positivo | `chat.ts:47`, `manifest.ts:184`, `specialized_engines.json:122` |
| `--sarak-chat-radius` | Falso-positivo | `chat.ts:19`, `specialized_engines.json:25` |
| `--sarak-noise-opacity` | Falso-positivo | `atmosphere.ts:179,187`, `manifest.ts:212,231`, `colors_and_atmosphere.json:925` |
| `--sarak-table-` | **Entrada inválida** (bug do script anterior) | String truncada — origem provável: comentário JSDoc `--sarak-table-*` em `SarakDataTableImpl.tsx:11`, o regex quebrou no `*`. Não é uma variável CSS real. |
| `--sarak-status-` | **Entrada inválida** (bug do script anterior) | Mesmo problema — comentário `--sarak-status-*-color` em `SarakToast.tsx:5`. Não é uma variável CSS real. |

**Observação para futuras auditorias:** o mecanismo `generateVariants: true` em `useDesignVariables.ts:94-129` gera automaticamente sufixos (`-bg`, `-border`, `-rgb`, `-10..50`, `-hover`, `-active`, `-light`) para qualquer token de cor marcado assim — essas variantes nunca aparecem como string literal em `cssVars` e não devem ser tratadas como ghost var por um comparador ingênuo de nomes.

---

## Parte 2 — Gaps de Cobertura por Família (28/28)

Formato de cada entrada conforme Seção 6 da spec. Onde o token **já existe** no schema mas não está conectado ao componente, isso é indicado explicitamente — é um gap de *wiring*, não de token ausente (relevante para quem for tratar o item depois: pode não precisar do pipeline completo de Expansão via `ui-novo-componente`, só uma correção pontual, mas a decisão de qual skill usar é do executor daquela tarefa, não desta auditoria).

### advanced
- Arquivo schema: `src/core/Design/schema/advanced.ts` (6 tokens) · Componente(s): `SarakExpandableMatrix.tsx`, `RecursiveMatrixNode.tsx`

#### [advanced]: `matrixGap` declarado mas sobrescrito antes de ser usado
- **Componente(s) afetado(s):** `src/components/atomic/Templates/SarakExpandableMatrix.tsx`
- **Evidência:** linha 123 define `'--matrix-gap': 'var(--sarak-matrix-gap, 12px)'`, mas a linha 124 do mesmo objeto `style` sobrescreve com `gap: 'var(--sarak-layout-gap-md, 16px)'` — o token nunca é efetivamente consumido.
- **Token(s) candidato(s):** já existe (`matrixGap`) — corrigir para aplicar de fato, ou remover se redundante.
- **Prioridade:** Média.

#### [advanced]: `matrixSearchBg` nunca aplicado à barra de busca
- **Componente(s) afetado(s):** `src/components/atomic/Templates/SarakExpandableMatrix.tsx:127-135`
- **Evidência:** o `SarakInput` de busca não recebe `backgroundColor`/`className` ligados a `--sarak-matrix-search-bg`.
- **Token(s) candidato(s):** já existe (`matrixSearchBg`) — falta conectar.
- **Prioridade:** Baixa.

#### [advanced]: animação de expandir/colapsar hardcoded, sem token de duração/easing
- **Componente(s) afetado(s):** `src/components/atomic/Templates/SarakExpandableMatrix.tsx:185`
- **Evidência:** `transition={{ duration: 0.3, ease: 'circOut' }}` — literal fixo.
- **Token(s) candidato(s):** `matrixExpandDuration`, `matrixExpandEasing`.
- **Prioridade:** Baixa.

#### [advanced]: nós filhos sem raio/sombra tokenizados
- **Componente(s) afetado(s):** `src/components/atomic/Templates/components/RecursiveMatrixNode.tsx`
- **Evidência:** raio via classes fixas (`rounded-full` linha 85, `rounded-lg` linha 104, `rounded-xl` linha 128); sombras hardcoded nas linhas 87 e 130.
- **Token(s) candidato(s):** `matrixNodeRadius`, `matrixNodeActiveShadow`.
- **Prioridade:** Baixa.

#### [advanced]: ghost var correlata — `--sarak-matrix-node-min-width` sem `id` no schema
- **Componente(s) afetado(s):** `src/components/atomic/Templates/components/RecursiveMatrixNode.tsx:104`
- **Evidência:** `min-w-[var(--sarak-matrix-node-min-width,140px)]` referencia uma CSS var sem token correspondente em `advanced.ts`.
- **Token(s) candidato(s):** `matrixNodeMinWidth` (adicionar ao schema, ou remover a var se intencionalmente estática).
- **Prioridade:** Baixa.

### animations
- Arquivo schema: `src/core/Design/schema/animations.ts` (9 tokens) · Componente(s): transversal (`SarakPageTransition.tsx`, `_cards.css`, shell)

#### [animations]: 6 dos 9 tokens de timing/easing são efetivamente inertes
- **Componente(s) afetado(s):** `SarakPageTransition.tsx:61`, `ExpandableCard.tsx:76`, `TopbarNav.tsx:65`, `SidebarNav.tsx:72-73`, `SarakExpandableMatrix.tsx:185`
- **Evidência:** `SarakPageTransition.tsx:61` hardcoda `transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}` mesmo lendo `animEnabled`/`pageTransitionType` corretamente linhas acima; `TopbarNav.tsx:65` hardcoda `'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'`. Grep de `sarak-anim-`/`sarak-ease-` em todo `src/components`+`src/core/Shell`: zero ocorrências, exceto `src/styles/_cards.css:30` que usa só `--sarak-ease-main` parcialmente (duração ainda fixa em `0.4s`). `animInstant`, `animFast`, `animNormal`, `animSlow`, `easeOut` têm zero consumidores.
- **Token(s) candidato(s):** já existem — falta wiring nos pontos citados.
- **Prioridade:** Alta (6 de 9 tokens inertes).

### atmosphere
- Arquivo schema: `src/core/Design/schema/atmosphere.ts` (32 tokens) · Componente(s): `src/styles/_theme.css`, `_atmosphere.css`, `_surfaces.css`

#### [atmosphere]: `bgGradientMode`/`bgGradientAngle` configuráveis em 19 temas mas nunca renderizados
- **Componente(s) afetado(s):** `src/styles/_theme.css`, `_atmosphere.css`
- **Evidência:** schema declara `--sarak-bg-gradient-mode` (atmosphere.ts:95) e `--sarak-bg-gradient-angle` (atmosphere.ts:104); todos os 19 presets setam valores distintos (ex. `holographic-glass.ts:188`, `synthwave-retro.ts:189`). Grep confirma zero ocorrência dessas vars fora do schema/catálogo/presets — nenhuma regra CSS as lê.
- **Token(s) candidato(s):** já existem — falta a regra CSS de gradiente condicional em `_theme.css`/`_atmosphere.css`.
- **Prioridade:** Alta.

#### [atmosphere]: `vignetteSoftness` configurado mas ignorado pela implementação real do vignette
- **Componente(s) afetado(s):** `src/styles/_theme.css:81,94-97`, `_atmosphere.css:30,65`
- **Evidência:** stop do `radial-gradient` é fixo (`50%`/`20%`) em ambos os arquivos; só `vignetteOpacity` é lido, `vignetteSoftness` (atmosphere.ts:348) nunca aparece fora do schema.
- **Token(s) candidato(s):** já existe — usar `transparent var(--sarak-vignette-softness, 50%)` no stop do gradiente.
- **Prioridade:** Alta.

#### [atmosphere]: `securityShieldGlow`/`securityPulseSpeed` são tokens órfãos (sem componente "security shield")
- **Componente(s) afetado(s):** nenhum — só plumbados em `manifest.ts:229-230`
- **Evidência:** grep de `SecurityShield`/`security-shield`/`sarak-security` fora de `manifest.ts`: zero ocorrências.
- **Token(s) candidato(s):** já existem — implementar o consumidor, ou remover do schema.
- **Prioridade:** Média.

#### [atmosphere]: `glassRoughness`/`glassSpecularity` alimentam vars intermediárias mortas
- **Componente(s) afetado(s):** `src/styles/_theme.css:77-78`
- **Evidência:** `--sarak-surface-specular`/`--sarak-surface-roughness` são declaradas mas nunca lidas por nenhuma outra regra CSS/componente.
- **Token(s) candidato(s):** já existem — aplicar em algum `background`/`filter`/`box-shadow` de superfície.
- **Prioridade:** Baixa.

### branding
- Arquivo schema: `src/core/Design/schema/branding.ts` (7 tokens) · Componente(s): `SidebarNav.tsx`, `TopbarNav.tsx`, `AuthHero.tsx`, `AuthForm.tsx`

#### [branding]: os 7 tokens da família são 100% órfãos — nenhum componente que renderiza a marca os consome
- **Componente(s) afetado(s):** `SidebarNav.tsx:107`, `TopbarNav.tsx:104`, `AuthHero.tsx:52-59`, `AuthForm.tsx:83`
- **Evidência:** grep de `identityAlignment`/`identityFontFamily`/`identityFontWeight`/`identityTracking`/`identityRedirectUrl`/`identityHoverEffect`/`sarak-identity-` fora do schema: zero ocorrências. `TopbarNav.tsx:104` e `SidebarNav.tsx:107` hardcodam peso/tracking do nome da marca com valores Tailwind **diferentes** entre si (inconsistência); nenhum dos dois usa `identityRedirectUrl` como link nem `identityHoverEffect` no hover.
- **Token(s) candidato(s):** já existem — falta todo o wiring.
- **Prioridade:** Alta (schema inteiro sem efeito prático).

### buttons (família de referência)
- Arquivo schema: `src/core/Design/schema/buttons.ts` (24 tokens) · Componente(s): `SarakButton.tsx`, `SarakIconButton.tsx`, `useAtomicStyles.ts`

#### [buttons]: glow neon do `SarakButton` hardcoded, ao contrário do `SarakIconButton` (que já tem tokens dedicados)
- **Componente(s) afetado(s):** `src/components/atomic/hooks/useAtomicStyles.ts:21-47` (consumido por `SarakButton.tsx:71`)
- **Evidência:** `getButtonStyles` hardcoda blur do glow (`0 0 20px`, `0 0 10px`, `0 0 15px`, `0 0 5px`, `0 0 8px` — linhas 26,27,34-35,42,44), enquanto `SarakIconButton.tsx:73-74` já resolve o mesmo problema com `var(--sarak-icon-button-glow-blur-lg/md/sm)` (tokens já existentes, `buttons.ts:183-207`).
- **Token(s) candidato(s):** `btnNeonGlowBlurSm`/`Md`/`Lg` (paralelo ao padrão do icon button).
- **Prioridade:** Média.

#### [buttons]: sombra "frosted" do `SarakButton` reusa var genérica de card em vez de token dedicado
- **Componente(s) afetado(s):** `src/components/atomic/hooks/useAtomicStyles.ts:61`
- **Evidência:** usa `--sarak-dynamic-shadow` (var genérica de cards), enquanto `SarakIconButton.tsx:99` já usa `iconButtonFrostedShadowOffsetY`/`Blur` dedicados (`buttons.ts:210-226`).
- **Token(s) candidato(s):** `btnFrostedShadowOffsetY`, `btnFrostedShadowBlur`.
- **Prioridade:** Baixa.

### card-action
- Arquivo schema: `src/core/Design/schema/card-action.ts` (6 tokens) · Componente(s): `SarakActionCard.tsx`

#### [card-action]: 5 dos 6 tokens de botão especializado são órfãos — botão real usa `SarakButton` genérico
- **Componente(s) afetado(s):** `src/components/atomic/Cards/SarakActionCard.tsx:112-119,125-130`
- **Evidência:** o botão "Executar" é um `SarakButton` genérico que consome `btnPrimaryBg`/`btnPrimaryText` (schema `buttons.ts`), não `cardActionBtnPrimaryBg`/`cardActionBtnHoverBg`/`cardActionBtnText`. Grep confirma zero consumo real dos 5 tokens. Nos 19 presets, `cardActionBtnPrimaryBg` sempre espelha `btnPrimaryBg` (reforça que nunca é usado independentemente).
- **Token(s) candidato(s):** já existem — falta aplicar ao botão "Executar"/expander.
- **Prioridade:** Alta.

#### [card-action]: `cardActionClickScale` é lido mas nunca aplicado
- **Componente(s) afetado(s):** `src/components/atomic/Cards/SarakActionCard.tsx:44,122-123`
- **Evidência:** `clickScale` é computado (linha 44) mas nunca referenciado depois; o único `whileTap` do arquivo (linha 123, botão expander) é hardcoded `{ scale: 0.95 }`.
- **Token(s) candidato(s):** já existe — falta `whileTap={{ scale: clickScale }}`.
- **Prioridade:** Alta.

### card-search
- Arquivo schema: `src/core/Design/schema/card-search.ts` (4 tokens) · Componente(s): `SarakSearchCard.tsx`, `SarakInput.tsx`

#### [card-search]: 3 dos 4 tokens do schema nunca são consumidos
- **Componente(s) afetado(s):** `SarakSearchCard.tsx`, `SarakInput.tsx`
- **Evidência:** `cardSearchBgFocus` (card-search.ts:16), `cardSearchPlaceholderColor` (:30) e `cardSearchTextFocusColor` (:37) não aparecem em nenhum `.tsx`/`.css` de produção; o foco do input usa tokens genéricos (`SarakInput.tsx:43,59,69`).
- **Token(s) candidato(s):** já existem — falta ligar ao estado `focused` de `SarakSearchCard`.
- **Prioridade:** Média.

#### [card-search]: opacidade do Border Beam hardcoded
- **Componente(s) afetado(s):** `SarakSearchCard.tsx:79`
- **Evidência:** `style={{ opacity: focused ? 1 : 0.4 }}` — literais fixos, sem token de intensidade idle.
- **Token(s) candidato(s):** `cardSearchBorderBeamIdleOpacity`.
- **Prioridade:** Baixa.

### card-title
- Arquivo schema: `src/core/Design/schema/card-title.ts` (6 tokens) · Componente(s): `SarakTitleCard.tsx`

#### [card-title]: elevação/escala do hover hardcoded via Framer Motion, ignora o token mestre de cards
- **Componente(s) afetado(s):** `SarakTitleCard.tsx:48`
- **Evidência:** `whileHover={{ y: -4, scale: 1.01 }}` — não lê `cardHoverTranslate` (`--sarak-card-hover-y`, cards.ts:272-278), que varia por tema mas nunca é lido em nenhum CSS/componente. `scale: 1.01` não tem token equivalente em nenhum schema.
- **Token(s) candidato(s):** consumir `cardHoverTranslate` via CSS; criar `cardHoverScale` em `cards.ts`.
- **Prioridade:** Alta (afeta todos os cards, ver também achado equivalente na família `cards`).

### cards (família de referência)
- Arquivo schema: `src/core/Design/schema/cards.ts` (90 tokens) · Componente(s): `SarakCoreCard.tsx` e variantes, `_cards.css`, `manifest.ts`

#### [cards]: sistema inteiro de interação (hover/glow/spotlight/shadow) tem tokens declarados mas sem consumidor real
- **Componente(s) afetado(s):** `src/styles/_cards.css:67-69`
- **Evidência:** `--sarak-card-hover-y`, `--sarak-card-hover-glow`, `--spotlight-opacity`, `--sarak-card-shadow` — setados em 15 presets de tema, zero consumo em CSS/JS. O hover real vem 100% hardcoded: `.sarak-card:hover { border-color: rgba(var(--theme-primary-rgb), 0.4); box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6); }`.
- **Token(s) candidato(s):** conectar os tokens já existentes ao CSS real, ou remover se decisão de produto for usar `:hover` puro; criar `cardHoverBorderOpacity`/`cardHoverShadow` para os literais hardcoded.
- **Prioridade:** Alta.

#### [cards]: `cardHoverColor`/`cardActiveColor`/`cardNoiseOpacity` plumbados em `manifest.ts` mas ausentes do schema
- **Componente(s) afetado(s):** `src/core/Provider/manifest.ts:203-210`
- **Evidência:** o manifest já sabe gerar as CSS vars (`--sarak-card-hover-color` etc.), mas não há token em `cards.ts` para o usuário definir o valor — e as vars também não são lidas por nenhum CSS/componente.
- **Token(s) candidato(s):** `cardHoverColor`, `cardActiveColor`, `cardNoiseOpacity` — adicionar ao schema e depois ligar a `_cards.css:67-69`.
- **Prioridade:** Alta.

#### [cards]: nenhum estado `disabled` tokenizado (schema, manifest ou CSS)
- **Componente(s) afetado(s):** `src/styles/_cards.css`, `manifest.ts`
- **Evidência:** busca por `cardDisabled`/`card-disabled` em `src/`: zero ocorrências — diferente de `inputs`/`buttons`, que têm tratamento de disabled.
- **Token(s) candidato(s):** `cardDisabledOpacity`.
- **Prioridade:** Média.

#### [cards]: `id` de token duplicado entre `colors.ts` e `cards.ts` com `cssVars` divergentes
- **Componente(s) afetado(s):** `src/core/Design/schema/colors.ts:125-137`, `cards.ts:75-116`, `src/core/Design/master-map.ts:44,54`
- **Evidência:** `cardBackgroundColor`/`cardBorderColor` são declarados duas vezes com o mesmo `id` mas `cssVars` diferentes (`colors.ts` tem `--theme-card-bg`/`--theme-card-border` a mais). Em `master-map.ts`, a ordem de processamento (`cards.ts` antes de `colors.ts`) pode causar sobrescrita silenciosa dependente de ordem de import, não de intenção.
- **Token(s) candidato(s):** consolidar num único `id` ou renomear a versão de `colors.ts`.
- **Prioridade:** Média (risco estrutural).

#### [cards]: durações/easing de transição parcialmente hardcoded
- **Componente(s) afetado(s):** `src/styles/_cards.css:30`
- **Evidência:** só `transform` usa `var(--sarak-ease-main)`; `box-shadow`/`border-color`/`background-color` têm duração e easing 100% fixos.
- **Token(s) candidato(s):** `cardTransitionDuration`.
- **Prioridade:** Baixa.

### chat
- Arquivo schema: `src/core/Design/schema/chat.ts` (6 tokens) · Componente(s): `MessageBubble.tsx`, `MessageList.tsx`, `ChatInput.tsx`, `ChatHeader.tsx`, `ModelPicker.tsx`

#### [chat]: sombra da bolha de mensagem hardcoded, sem token equivalente a `cardShadow`
- **Componente(s) afetado(s):** `MessageBubble.tsx:72`
- **Evidência:** `shadow-xl` (Tailwind fixo) — `chat.ts` não tem token de sombra/elevação.
- **Token(s) candidato(s):** `chatBubbleShadow`.
- **Prioridade:** Baixa.

#### [chat]: indicador de "digitando" não usa o token de raio da bolha
- **Componente(s) afetado(s):** `MessageList.tsx:44`
- **Evidência:** `rounded-2xl rounded-tl-none` fixo em vez de `var(--sarak-chat-radius)` (que `MessageBubble.tsx:23,27` usa corretamente) — inconsistência visual entre bolha real e indicador de loading.
- **Token(s) candidato(s):** já existe (`chatBubbleRadius`) — só aplicar.
- **Prioridade:** Baixa.

#### [chat]: brilho do input de chat (idle/hover) hardcoded
- **Componente(s) afetado(s):** `ChatInput.tsx:115`
- **Evidência:** `opacity-10`/`opacity-25` literais — sem token de intensidade de glow (ao contrário de `cards.ts` que tem `cardGlowIntensity`/`cardHoverGlowIncrease`).
- **Token(s) candidato(s):** `chatInputGlowIdleOpacity`/`chatInputGlowHoverOpacity`.
- **Prioridade:** Baixa.

#### [chat]: dropdown do `ModelPicker` com sombra, blur e altura máxima hardcoded
- **Componente(s) afetado(s):** `ModelPicker.tsx:30,44`
- **Evidência:** `shadow-2xl backdrop-blur-2xl` fixos; `max-h-60` (240px) é magic number não tokenizado.
- **Token(s) candidato(s):** `chatModelPickerMaxHeight`; reaproveitar `cardBackdropBlur`.
- **Prioridade:** Baixa/Média.

### colors
- Arquivo schema: `src/core/Design/schema/colors.ts` (13 tokens) · Componente(s): transversal via CSS vars, `SarakModal.tsx`

#### [colors]: `colorBgModal` nunca chega ao componente Modal — overlay hardcoded
- **Componente(s) afetado(s):** `SarakModal.tsx:95,111`
- **Evidência:** overlay usa `bg-black/60 backdrop-blur-sm` (fixo); container usa `--theme-surface`, não `colorBgModal` (colors.ts:117-122). Zero ocorrências de `sarak-bg-modal`/`theme-modal-bg` em `src/components`.
- **Token(s) candidato(s):** já existe — só aplicar no overlay.
- **Prioridade:** Alta.

#### [colors]: `colorBgLayer1`/`colorBgLayer2` sem consumidor
- **Componente(s) afetado(s):** nenhum (órfãos)
- **Evidência:** zero arquivos em `src/components` referenciam essas 4 cssVars.
- **Token(s) candidato(s):** já existem — ligar a algum container de camada secundária, ou remover.
- **Prioridade:** Média.

#### [colors]: `id` de token `cardBackgroundColor`/`cardBorderColor` duplicado com `cards.ts` (mesmo achado da família cards, citado aqui pelo lado de `colors.ts`)
- **Componente(s) afetado(s):** `colors.ts:125-137`, `cards.ts:75-116`, `master-map.ts:44,54`
- **Evidência:** ver entrada equivalente na família `cards`.
- **Token(s) candidato(s):** consolidar.
- **Prioridade:** Média.

### data
- Arquivo schema: `src/core/Design/schema/data.ts` (7 tokens) · Componente(s): `src/components/engines/charts/**` (motor real de gráficos — `SarakSparkline.tsx` consome parcialmente; `SarakDataEmpty`/`SarakDataTableImpl` NÃO usam tokens desta família)

#### [data]: paleta de séries e cor do tooltip hardcoded no motor de gráficos, ignorando os tokens
- **Componente(s) afetado(s):** `src/components/engines/charts/SubEngines/useEChartsTheme.ts:22-36`
- **Evidência:** `color: [primaryColor, secondaryColor, '#10b981', '#f59e0b', '#ef4444']` (linha 24) nunca lê `chartColorPalette`; `backgroundColor`/`borderColor`/`shadowColor` do tooltip (linhas 26-34) recalculados do zero, ignorando `chartTooltipBg`.
- **Token(s) candidato(s):** já existem — trocar para ler `design.chartColorPalette`/`chartTooltipBg`.
- **Prioridade:** Alta.

#### [data]: opacidade da grade hardcoded e divergente do default do schema
- **Componente(s) afetado(s):** `src/components/engines/charts/SarakChartEngine.tsx:45,55,61`
- **Evidência:** `rgba(255,255,255,0.02)`/`rgba(0,0,0,0.03)` hardcoded, nem batem com o default de `chartGridOpacity` (0.05, data.ts:19-24), que nunca é lido.
- **Token(s) candidato(s):** já existe — aplicar em `splitLine.lineStyle.color`.
- **Prioridade:** Alta.

#### [data]: espessura de linha e suavização hardcoded no builder de séries
- **Componente(s) afetado(s):** `src/components/engines/charts/SubEngines/builders/basicCharts.ts:33,37`
- **Evidência:** `smooth: 0.4` sempre aplicado (ignora `chartSmoothing`); `width: 5` ignora `chartThickness` e até o parâmetro local `config?.thickness`.
- **Token(s) candidato(s):** já existem.
- **Prioridade:** Alta.

#### [data]: `chartType`/`chartShowGrid` não lidos do tema
- **Componente(s) afetado(s):** `src/components/engines/charts/SarakChartEngine.tsx:12,28`
- **Evidência:** `type` é prop obrigatória; componente nunca importa `useSarakUI`/lê `design.chartType`/`chartShowGrid`.
- **Token(s) candidato(s):** já existem — usar como fallback, ou remover do schema se `type` for de fato só por-instância (decisão de produto a esclarecer).
- **Prioridade:** Média.

### engineering
- Arquivo schema: `src/core/Design/schema/engineering.ts` (4 tokens) · Componente(s): `_utilities.css`, `SarakToast.tsx`

#### [engineering]: `reducedMotion` é órfão — não desliga nenhuma animação (gap de acessibilidade)
- **Componente(s) afetado(s):** todo o sistema (nenhum consumidor)
- **Evidência:** `engineering.ts:21-26`; 18 presets gravam valor; zero `@media (prefers-reduced-motion)` ou `if (design.reducedMotion)` em qualquer componente/hook.
- **Token(s) candidato(s):** já existe — falta bridge (`@media`/hook `useReducedMotion`).
- **Prioridade:** Alta (acessibilidade).

#### [engineering]: `focusRingWidth` não usado — anel de foco hardcoded em CSS puro
- **Componente(s) afetado(s):** `src/styles/_utilities.css:54-58`
- **Evidência:** `outline: 2px solid ...` — `2px` literal, nunca `var(--sarak-focus-width)`.
- **Token(s) candidato(s):** já existe — `outline-width: var(--sarak-focus-width, 2px)`.
- **Prioridade:** Média.

#### [engineering]: `zIndexToast` nunca consumido — `SarakToast` usa a camada de Tooltip
- **Componente(s) afetado(s):** `src/components/atomic/Feedback/SarakToast.tsx:162`
- **Evidência:** `zIndex: 'var(--z-index-tooltip, 9000)'` — usa a var errada; `--sarak-z-toast` (engineering.ts:39) nem tem bridge em `_theme.css`.
- **Token(s) candidato(s):** já existe — criar bridge e corrigir consumo.
- **Prioridade:** Alta.

#### [engineering]: `zIndexModal` duplicado entre `engineering.ts` e `layers.ts`
- **Componente(s) afetado(s):** `engineering.ts:27-33`, `layers.ts:29-36`
- **Evidência:** mesmo `id`/CSS var declarados em dois schemas com ranges/defaults distintos.
- **Token(s) candidato(s):** remover a duplicata (manter em `layers.ts`).
- **Prioridade:** Baixa (higiene de schema).

### global
- Arquivo schema: `src/core/Design/schema/global.ts` (3 tokens) · Componente(s): `SarakShell.tsx`, `TopbarNav.tsx`

#### [global]: `navigationStyle` tem um 4º valor (`glass`) usado no código mas ausente das opções do schema
- **Componente(s) afetado(s):** `SarakShell.tsx:78-83`
- **Evidência:** `isGlass = design?.navigationStyle === 'glass'` — mas `global.ts:23-29` só oferece `sidebar | topbar | dock`; branch sempre morto pois o usuário não consegue selecionar `glass` pela UI.
- **Token(s) candidato(s):** adicionar opção `glass` a `navigationStyle`, ou remover o branch morto.
- **Prioridade:** Baixa/Média.

Demais tokens (`mode`, `bodySize`) corretamente wireados — nenhum outro gap.

### inputs
- Arquivo schema: `src/core/Design/schema/inputs.ts` (16 tokens) · Componente(s): `SarakInput.tsx`, `SarakSelect.tsx`, `SarakTextarea.tsx`, `SarakMultiSelect.tsx`, `SarakTimePicker.tsx`, `SarakDatePicker.tsx`

> Revalidação da análise já publicada na Seção 5 da spec — linhas reconfirmadas hoje:

#### [inputs]: sem tokens de estado `disabled`
- **Componente(s) afetado(s):** `src/components/atomic/Inputs/SarakInput.tsx:47`, `SarakDatePicker.tsx:116`
- **Evidência:** `opacity-50 cursor-not-allowed pointer-events-none` hardcoded em ambos.
- **Token(s) candidato(s):** `inputDisabledOpacity`, `inputDisabledBg`.
- **Prioridade:** Média.

#### [inputs]: placeholder com opacidade fixa
- **Componente(s) afetado(s):** `SarakInput.tsx:43`
- **Evidência:** `placeholder:text-[var(--sarak-input-text-color,...)]/30` — `/30` é Tailwind fixo.
- **Token(s) candidato(s):** `inputPlaceholderOpacity`.
- **Prioridade:** Baixa.

#### [inputs]: sem variantes de estilo (`inputStyleType`)
- **Componente(s) afetado(s):** `SarakInput.tsx` (ausência)
- **Evidência:** zero ocorrências de `inputStyleType` no repo; `buttons.ts:146-153` tem `btnStyleType` (matte/neon/frosted/borderline/cyberpunk/neumorphism) sem equivalente em inputs.
- **Token(s) candidato(s):** `inputStyleType`.
- **Prioridade:** Média.

#### [inputs]: `inputPadding` é um token órfão — existe no schema e catálogo mas nenhum input o lê
- **Componente(s) afetado(s):** `SarakInput.tsx:44` (`py-4`), `SarakSelect.tsx:27` (`py-4 pl-4 pr-10`), `SarakTextarea.tsx:26` (`p-4`), `SarakMultiSelect.tsx:26` (`py-2 px-3`), `SarakTimePicker.tsx:23` (`py-2 px-2`)
- **Evidência:** `inputPadding` (`--sarak-input-padding`, inputs.ts:47-54) está catalogado (`components_base.json:1241`) mas 100% inerte — o padding real vem de classes Tailwind hardcoded e **diferentes** por componente (inconsistência entre os 5). Padding horizontal também nunca tokenizado (`inputPaddingX` não existe).
- **Token(s) candidato(s):** `inputPaddingX` (novo) + religar `inputPadding` via `style={{ paddingBlock: 'var(--sarak-input-padding)' }}`.
- **Prioridade:** Alta (token existe, catalogado, e é 100% inerte — nenhuma edição no Design Engine muda o padding de nenhum input).

### layers
- Arquivo schema: `src/core/Design/schema/layers.ts` (7 tokens) · Componente(s): `SarakShell.tsx`, `SarakModal.tsx`, `PreviewCanvas.tsx`

#### [layers]: `layerBackdropBlur`/`layerBackdropOpacity` nunca consumidos por nenhum overlay de modal
- **Componente(s) afetado(s):** `SarakModal.tsx:95`, `SarakShell.tsx:143`, `SarakSpotlight.tsx:118`
- **Evidência:** `_theme.css:35-36` cria as pontes (`--layer-backdrop-blur`, `--layer-backdrop-bg`) mas nenhum componente as usa — todos hardcodam `bg-black/60 backdrop-blur-sm` (ou `/50`) diretamente.
- **Token(s) candidato(s):** já existem — consumir `var(--layer-backdrop-bg)`/`var(--layer-backdrop-blur)`.
- **Prioridade:** Alta.

#### [layers]: `zIndexSidebar`/`zIndexTooltip` ignorados — dezenas de `z-[1000]`/`z-[9999]` hardcoded
- **Componente(s) afetado(s):** `SarakShell.tsx:94,100,142`, `TopbarNav.tsx:170`, `SidebarNav.tsx:191`, `ShellLanguageSelector.tsx:76`, `NoiseOverlay.tsx:12`, `SarakSpotlight.tsx:118`, `PreviewSystemRenderer.tsx:93,99,138`, `PreviewCanvas.tsx:177,180`, `HelpTooltip.tsx:24`
- **Evidência:** ex. `SarakShell.tsx:94`: `z-[1000]` literal. Só `SarakModal.tsx:88` usa corretamente `z-[var(--z-index-modal)]` — única exceção.
- **Token(s) candidato(s):** já existem — trocar literais pelas variáveis.
- **Prioridade:** Alta.

#### [layers]: `layerElevationFactor` nunca consumido
- **Componente(s) afetado(s):** nenhum (órfão)
- **Evidência:** só aparece em `layers.ts:66-73` e catálogo.
- **Token(s) candidato(s):** já existe — precisa de consumer.
- **Prioridade:** Baixa.

### media
- Arquivo schema: `src/core/Design/schema/media.ts` (5 tokens) · Componente(s): `SarakBackgroundRenderer.tsx`, `DesignScope.tsx`

#### [media]: `globalBackgroundBlendMode` sobrescrito no próprio código-fonte — token sem efeito
- **Componente(s) afetado(s):** `SarakBackgroundRenderer.tsx:19,40,59`
- **Evidência:** linha 40: `const safeBlendMode = 'normal';` (comentário no código explica que a base "DEVE" renderizar com blend-mode normal) — a prop `blendMode` recebida é descartada. As 5 opções do `select` ficam disponíveis na UI mas nenhuma muda o resultado.
- **Token(s) candidato(s):** já existe — se for decisão de produto intencional, remover as opções do `select` para não expor controle inerte; senão, aplicar de fato.
- **Prioridade:** Alta.

Demais tokens (`globalBackgroundImageUrl`, `globalBackgroundOpacity`, `globalBackgroundBlur`) corretamente wireados.

### motion
- Arquivo schema: `src/core/Design/schema/motion.ts` (8 tokens) · Componente(s): `_theme.css` (bridge parcial), ~12 componentes com `framer-motion`

#### [motion]: metade dos tokens sem ponte CSS nem consumidor
- **Componente(s) afetado(s):** nenhum (órfãos: `motionDurationInstant`, `motionEaseOut`, `motionEaseIn`, `motionStaggerDelay`)
- **Evidência:** `_theme.css:39-42` só cria bridge para `motionEaseMain`/`motionDurationFast/Normal/Slow`; mesmo `--duration-fast` (que tem bridge) nunca é referenciado em nenhum componente.
- **Token(s) candidato(s):** já existem — faltam bridges e consumo.
- **Prioridade:** Média.

#### [motion]: `motionStaggerDelay` deveria alimentar animações escalonadas, mas usam delays hardcoded
- **Componente(s) afetado(s):** `MessageList.tsx:46-48`
- **Evidência:** indicador de "digitando" com 3 pontos usa delays literais (0, 0.2, 0.4s) em vez de multiplicar por `motionStaggerDelay`.
- **Token(s) candidato(s):** já existe.
- **Prioridade:** Baixa.

#### [motion]: toda a camada `framer-motion` (spring/duration/ease) ignora o schema
- **Componente(s) afetado(s):** `ExpandableCard.tsx:76,84`, `SarakTooltip.tsx:145`, `SarakTabs.tsx:114,135`, `AuthHero.tsx:41,55`, `ImageCard.tsx:52`, `AuthForm.tsx:72`, `SarakPageTransition.tsx:61`, `PremiumSwitch.tsx:16`, `SarakExpandableMatrix.tsx:185`, `Controls.tsx:90`, `SarakModal.tsx:107`
- **Evidência:** ex. `SarakModal.tsx:107`: `transition={{ type: 'spring', damping: 25, stiffness: 300 }}` — literal. É estrutural do `framer-motion` (a prop exige valores JS, não CSS), então é gap arquitetural.
- **Token(s) candidato(s):** já existem — falta um hook `useSarakMotionTransition(design)` que traduza os tokens em objetos de transição.
- **Prioridade:** Média (impacto amplo, decisão de arquitetura).

### navigation — família prioritária (histórico raso, spec 06)
- Arquivo schema: `src/core/Design/schema/navigation.ts` (17 tokens) · Componente(s): `SidebarNav.tsx`, `TopbarNav.tsx`, `DockNav.tsx`, `SarakShell.tsx`

#### [navigation]: header da Sidebar sem token de altura nem de background dedicado
- **Componente(s) afetado(s):** `src/core/Shell/Components/SidebarNav.tsx:83`
- **Evidência:** `` <div className={`h-16 sarak-shell-header px-6 flex items-center border-b border-[var(--theme-border)] bg-[var(--theme-title)]/5 ...`}> `` — `h-16` é altura Tailwind fixa (64px); o fundo reaproveita `--theme-title` (cor de texto) com opacidade fixa `/5`, não uma cor de superfície dedicada. *(confirmado — linha exata verificada nesta execução)*
- **Token(s) candidato(s):** `sidebarHeaderHeight`, `sidebarHeaderBg`.
- **Prioridade:** Alta.

#### [navigation]: quebra de paridade — `--sarak-sidebar-active` não bate com o nome declarado no schema/manifest
- **Componente(s) afetado(s):** `src/core/Shell/Components/SidebarNav.tsx:142`
- **Evidência:** componente usa `bg-[var(--sarak-sidebar-active,var(--theme-primary-rgb,59,130,246)/10)]` (nome **errado**, sem sufixo `-color`). O schema declara `--sarak-sidebar-active-color` em `navigation.ts:78-82` (token `sidebarActiveColor`) e `manifest.ts:200` confirma o mesmo nome. *(3 linhas confirmadas nesta execução)*
- **Nome correto:** `--sarak-sidebar-active-color`. **Nome errado em uso:** `--sarak-sidebar-active`.
- **Token(s) candidato(s):** corrigir a referência no componente (token já existe — não é falta de token, é bug de nomenclatura).
- **Prioridade:** Alta.

#### [navigation]: mesma quebra de paridade replicada em `TopbarNav` (ghost var irmã)
- **Componente(s) afetado(s):** `src/core/Shell/Components/TopbarNav.tsx:123-124`
- **Evidência:** `bg-[var(--sarak-topbar-active,...)]` — schema declara `--sarak-topbar-active-color` (`navigation.ts:131-135`, token `topbarActiveColor`), `manifest.ts:202` confirma.
- **Nome correto:** `--sarak-topbar-active-color`. **Nome errado em uso:** `--sarak-topbar-active`.
- **Token(s) candidato(s):** corrigir referência (token já existe).
- **Prioridade:** Alta.

#### [navigation]: `sidebarShadow` declarado mas não aplicado ao componente que governa
- **Componente(s) afetado(s):** `SidebarNav.tsx:81`
- **Evidência:** usa a classe fixa `shadow-2xl`; `sidebarShadow` (`navigation.ts:218-223`, sem `cssVars` declarado) nunca é lido em `SidebarNav.tsx`. Único consumidor real é `SarakDrawer.tsx:76-77` (reaproveitado para o *drawer*, não a sidebar).
- **Token(s) candidato(s):** aplicar `sidebarShadow` via `style.boxShadow` em `SidebarNav.tsx`; adicionar `cssVars: ['--sarak-sidebar-shadow']` ao token.
- **Prioridade:** Alta.

#### [navigation]: `sidebarBlur` órfão — nunca consumido
- **Componente(s) afetado(s):** `SidebarNav.tsx` (ausência)
- **Evidência:** grep de `sarak-sidebar-blur` fora de schema/catálogo/testes: zero ocorrências; container `<aside>` (linhas 58-82) não aplica `backdrop-blur` algum.
- **Token(s) candidato(s):** já existe — aplicar como `backdropFilter`.
- **Prioridade:** Alta.

#### [navigation]: `DockNav` totalmente hardcoded — sem tokens dedicados ao modo `dock`
- **Componente(s) afetado(s):** `src/core/Shell/Components/DockNav.tsx:34-42`
- **Evidência:** tamanho de ícone (`w-12 h-12`), gap, padding, offset inferior (`bottom-6`) e opacidade de fundo (`/40`) todos hardcoded Tailwind; schema só tem seções Sidebar/Topbar/Tabs/Itens.
- **Token(s) candidato(s):** `dockIconSize`, `dockItemGap`, `dockPadding`, `dockBottomOffset`, `dockBg`.
- **Prioridade:** Alta.

#### [navigation]: estado offline/disabled de item de menu sem token
- **Componente(s) afetado(s):** `SidebarNav.tsx:144`
- **Evidência:** `opacity-30 grayscale cursor-not-allowed border border-dashed` fixo — sem equivalente ao padrão de estados ricos de `cards.ts`.
- **Token(s) candidato(s):** `navItemDisabledOpacity`, `navItemDisabledGrayscale`.
- **Prioridade:** Alta (família já sinalizada como rasa).

### overlays
- Arquivo schema: `src/core/Design/schema/overlays.ts` (10 tokens) · Componente(s): `SarakModal.tsx`, `SarakDrawer.tsx`, `SarakTooltip.tsx`, `SarakToast.tsx`

#### [overlays]: `SarakModal` ignora `modalOverlayColor`/`modalOverlayBlur`
- **Componente(s) afetado(s):** `SarakModal.tsx:95`
- **Evidência:** backdrop 100% hardcoded (`bg-black/60 backdrop-blur-sm`), enquanto o schema declara `modalOverlayColor`/`modalOverlayBlur` (`overlays.ts:41-55`) especificamente para isso — ambas injetadas em runtime mas nunca lidas.
- **Token(s) candidato(s):** já existem — só consumir.
- **Prioridade:** Alta.

#### [overlays]: `--sarak-modal-blur` nunca consumido em nenhum componente real
- **Componente(s) afetado(s):** `SarakModal.tsx`, `SarakDrawer.tsx`
- **Evidência:** zero ocorrências em `.tsx` de produção.
- **Token(s) candidato(s):** já existe — aplicar como `backdropFilter`.
- **Prioridade:** Média.

### scrollbars
- Arquivo schema: `src/core/Design/schema/scrollbars.ts` (6 tokens) · Componente(s): `_base.css` (regra global + variantes)

#### [scrollbars]: variantes `.custom-scrollbar-sidebar`/`.custom-scrollbar-horizontal` 100% hardcoded, ignoram os tokens
- **Componente(s) afetado(s):** `src/styles/_base.css:116-163`
- **Evidência:** nenhuma das duas classes referencia `--sarak-scroll-*`, ao contrário da regra genérica `::-webkit-scrollbar` (linhas 92-113) que usa os aliases corretamente.
- **Token(s) candidato(s):** já existem — reescrever as duas classes para usar `var(--sarak-scroll-*, ...)`.
- **Prioridade:** Média.

### specialized
- Arquivo schema: `src/core/Design/schema/specialized.ts` (30 tokens) · Componente(s): `SarakEmptyState.tsx`, `SarakSkeleton.tsx`, `MessageBubble.tsx`, `SarakChatEngine.tsx`

#### [specialized]: `aiPanelBg`/`aiGlowColor` órfãos — nenhum componente "Painel IA" os consome
- **Componente(s) afetado(s):** nenhum
- **Evidência:** zero ocorrências fora do schema (`specialized.ts:12-24`).
- **Token(s) candidato(s):** já existem — identificar/criar o consumidor, ou remover.
- **Prioridade:** Baixa.

#### [specialized]: `chatBubbleGlassBlur` inconsistente entre as 2 implementações de bolha de chat
- **Componente(s) afetado(s):** `MessageBubble.tsx:43` vs `SarakChatEngine.tsx:112`
- **Evidência:** `SarakChatEngine.tsx:112` usa `var(--sarak-chat-bubble-blur, 12px)` corretamente; `MessageBubble.tsx:43` usa o token genérico de cards (`--sarak-card-backdrop-blur, 10px)`) — resultado visual diferente entre os dois.
- **Token(s) candidato(s):** já existe — corrigir referência em `MessageBubble.tsx:43`.
- **Prioridade:** Média.

### status
- Arquivo schema: `src/core/Design/schema/status.ts` (6 tokens) · Componente(s): `SarakBadge.tsx`, `SarakToast.tsx`, `ManagementGroupCard.tsx`

#### [status]: `SarakBadge` — componente canônico da família — ignora as 4 cores semânticas e o raio
- **Componente(s) afetado(s):** `src/components/atomic/Feedback/SarakBadge.tsx:40,54-68`
- **Evidência:** cores fixas do Tailwind (`green-500`, `red-500`, `yellow-500`, `blue-500`), nenhuma referência a `statusSuccessColor`/`statusErrorColor`/`statusWarningColor`/`statusInfoColor` (status.ts:12-42) — `SarakToast.tsx:54-57` já demonstra o padrão correto no mesmo diretório. `badgeRadius` (status.ts:44-51) também órfão (`shapeClasses` usa `rounded-full`/`rounded-md` fixo).
- **Token(s) candidato(s):** já existem (5 tokens) — falta consumir em `SarakBadge.tsx`.
- **Prioridade:** Alta.

#### [status]: `statusGlowBlur` quase órfão — só um consumidor isolado fora do componente canônico
- **Componente(s) afetado(s):** `ManagementGroupCard.tsx:104` (único uso) vs `SarakBadge.tsx` (nenhum)
- **Evidência:** glow de status aplicado num card específico, não no badge que é o consumidor natural.
- **Token(s) candidato(s):** já existe — considerar prop `glow` em `SarakBadge.tsx`.
- **Prioridade:** Baixa.

### structural
- Arquivo schema: `src/core/Design/schema/structural.ts` (12 tokens) · Componente(s): `useStructuralStyles.ts`, `DesignScope.tsx`, `SarakSplitPane.tsx`

**Nenhum gap encontrado.** Os 12 tokens (`breakpointTablet`, `breakpointDesktop`, `layoutGridTemplate`, `globalSectionGap`, `globalFlowDirection`, `globalFlowAlign`, `headerAlignment`, `formLabelPosition`, `formFieldDensity`, `switchLabelPosition`, `splitPaneMinWidth`) foram verificados contra `useStructuralStyles.ts` (leitura completa) e `DesignScope.tsx` (leitura completa): todos lidos com fallback seguro e traduzidos em classes/estilos reais; `splitPaneMinWidth` confirmado em `SarakSplitPane.tsx:87`. Família mais bem coberta das 28 auditadas.

### switches
- Arquivo schema: `src/core/Design/schema/switches.ts` (6 tokens) · Componente(s): `SarakSwitch.tsx` (via `useAtomicStyles.getSwitchStyles`), `PremiumSwitch.tsx`, `PremiumCheckbox.tsx`

#### [switches]: `switchStyleType` declara 4 variantes mas só 1 (`glass`) tem implementação real
- **Componente(s) afetado(s):** `src/components/atomic/hooks/useAtomicStyles.ts:134-149`
- **Evidência:** só existe `if (styleType === 'glass')`; `asymmetric`/`pulsing` (switches.ts:39-44) caem no visual padrão de `tactile`.
- **Token(s) candidato(s):** implementar lógica para as 2 variantes restantes; usar `switchPulseColor` (hoje órfão) em `pulsing`.
- **Prioridade:** Média.

#### [switches]: `switchPulseColor` órfão
- **Componente(s) afetado(s):** `useAtomicStyles.ts` (função `getSwitchStyles`, onde deveria ser aplicado)
- **Evidência:** zero uso fora de schema/catálogo/snapshots.
- **Token(s) candidato(s):** conectar ao estilo `pulsing`.
- **Prioridade:** Média.

#### [switches]: `checkboxActiveColor` órfão — não existe `SarakCheckbox` atômico dedicado
- **Componente(s) afetado(s):** `PremiumCheckbox.tsx:10-12`
- **Evidência:** usa `--sarak-primary-color` hardcoded em vez de `--sarak-checkbox-active` (que não aparece em nenhum `.tsx`/`.css`).
- **Token(s) candidato(s):** conectar em `PremiumCheckbox.tsx`, ou criar `SarakCheckbox` atômico dedicado.
- **Prioridade:** Média.

### system
- Arquivo schema: `src/core/Design/schema/system.ts` (23 tokens) · Componente(s): `DesignScope.tsx`, `SarakIcon.tsx`, `_theme.css`/`_base.css`

#### [system]: `iconStrokeWidth` órfão — `SarakIcon` usa mapas de espessura hardcoded por peso
- **Componente(s) afetado(s):** `src/components/atomic/Icon/SarakIcon.tsx:26,35,39`
- **Evidência:** `lucideStrokeMap`/`strokeMap` fixos (`{ thin: 1, light: 1.5, regular: 2, bold: 2.5, ... }`); `iconStrokeWidth` (system.ts:205-211) nunca lido.
- **Token(s) candidato(s):** já existe — substituir/complementar os mapas fixos.
- **Prioridade:** Média.

#### [system]: `scrollbarWidth`/`scrollbarThumbColor` duplicados e órfãos — sombreados pelo schema `scrollbars.ts` (que é o que realmente funciona)
- **Componente(s) afetado(s):** cadeia de scrollbar (`_theme.css:60-65`, `_base.css:92-113`)
- **Evidência:** `system.ts:213-229` declara tokens paralelos aos de `scrollbars.ts` (`scrollWidth`/`scrollThumbColor`), mas só os de `scrollbars.ts` são realmente lidos em `_theme.css`. Os de `system.ts` não aparecem em nenhuma regra CSS.
- **Token(s) candidato(s):** remover/deprecar a duplicata em `system.ts`.
- **Prioridade:** Baixa (não é hardcode, é token morto/confuso).

### tables — família prioritária (histórico raso, spec 06)
- Arquivo schema: `src/core/Design/schema/tables.ts` (11 tokens) · Componente(s): `SarakTable.tsx` (alvo principal), contraste de referência: `SarakDataTableImpl.tsx` (faz certo)

#### [tables]: `tableRowHoverBg`/`tableBorderColor`/`tableHeaderBg` existem no schema mas estão desconectados de `SarakTable.tsx`
- **Componente(s) afetado(s):** `src/components/atomic/Templates/SarakTable.tsx`
- **Evidência:** os 3 tokens existem (`tableHeaderBg` tables.ts:39, `tableRowHoverBg` :46-51, `tableBorderColor` :79-84) e estão corretamente ligados em `SarakDataTableImpl.tsx:143,202` e `TableMock.tsx` — mas `SarakTable.tsx` não referencia nenhuma var `--sarak-table-*` (zero ocorrências). Linha 149: `` className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group" `` (deveria usar `tableRowHoverBg`); linha 113: `` <tr className="bg-white/5 border-b ...">`` (deveria usar `tableHeaderBg`). *(linhas 109, 113, 149 confirmadas nesta execução)*
- **Token(s) candidato(s):** `tableRowHoverBg`, `tableBorderColor`, `tableHeaderBg` — todos já existem, só falta conectar. **Isto é diferente dos demais gaps: não é "token não existe", é "token existe mas está desconectado do componente".**
- **Prioridade:** Alta.

#### [tables]: tipografia + opacidade de cor do cabeçalho 100% hardcoded
- **Componente(s) afetado(s):** `SarakTable.tsx:117`
- **Evidência:** `` className={`text-2xs font-black text-white/30 uppercase ${cellDensityClass}`} `` — `font-black` e `text-white/30` sem token por trás (`text-2xs` já é data-driven via `_theme.css:57`, esse caso é OK). *(linha 117 confirmada nesta execução)*
- **Token(s) candidato(s):** `tableHeaderTextColor`/`tableHeaderFontWeight` (novos).
- **Prioridade:** Alta.

#### [tables]: skeleton de loading com `bg-white/5` hardcoded
- **Componente(s) afetado(s):** `SarakTable.tsx:136`
- **Evidência:** `<div className="h-4 bg-white/5 rounded-md w-3/4"></div>`. *(linha 136 confirmada nesta execução)*
- **Token(s) candidato(s):** `tableSkeletonBg` (novo), ou reaproveitar `tableHeaderBg`.
- **Prioridade:** Alta.

#### [tables]: raio do container usa a variável de `cards` em vez da própria de `tables`
- **Componente(s) afetado(s):** `SarakTable.tsx:109`
- **Evidência:** `rounded-[var(--sarak-card-radius,12px)]` — ignora `tableBorderRadius` (tables.ts:60-67), que nunca é referenciado em nenhum componente Templates. *(linha 109 confirmada nesta execução)*
- **Token(s) candidato(s):** `tableBorderRadius` — já existe, só conectar.
- **Prioridade:** Alta.

#### [tables]: `tableZebraStriping` é um toggle morto (dead feature flag)
- **Componente(s) afetado(s):** `SarakTable.tsx` (ausência)
- **Evidência:** toggle existe no Design Engine (tables.ts:52-58) mas zero consumo em qualquer componente — ligar/desligar não produz efeito.
- **Token(s) candidato(s):** implementar consumo (`nth-child` condicional) + criar `tableZebraStripeColor` (inexistente).
- **Prioridade:** Alta.

#### [tables]: gap sistêmico vs. `cards.ts` — faltam tokens de sombra, blur e variante de estilo
- **Componente(s) afetado(s):** `src/core/Design/schema/tables.ts` (ausência estrutural)
- **Evidência:** `cards.ts` tem `cardShadow`, `cardBackdropBlur`, `cardVariant` (4 opções estéticas); `tables.ts` não tem nenhum equivalente.
- **Token(s) candidato(s):** `tableShadow`, `tableBackdropBlur`, `tableVariant`.
- **Prioridade:** Alta (família já sinalizada como rasa).

### typography
- Arquivo schema: `src/core/Design/schema/typography.ts` (33 tokens) · Componente(s): `_typography.css` (regras globais h1-h6)

#### [typography]: `h3` sem tokens próprios — CSS espera `--sarak-h3-size` que não existe em nenhum schema
- **Componente(s) afetado(s):** `src/styles/_typography.css:24-27`
- **Evidência:** `h3 { font-size: var(--sarak-h3-size, 24px); font-weight: var(--sarak-h2-weight, 600); }` — `--sarak-h3-size` não corresponde a nenhum token (`typography.ts` só tem `h1*`/`h2*`); confirmado contra `design-token-ids.ts` (lista agregada). H3 nunca é configurável; o peso fica amarrado ao controle "Peso (H2)" sem indicação na UI.
- **Token(s) candidato(s):** `h3Size`, `h3Weight` (análogos a `h2Size`/`h2Weight`), opcionalmente `h3LineHeight`.
- **Prioridade:** Alta (afeta hierarquia tipográfica renderizada, não só o Design Engine).

> Nota organizacional (fora do escopo estrito de gap): `bodySize` é referenciado por `_typography.css` mas está definido em `global.ts`, não em `typography.ts` — não é token ausente, é inconsistência de taxonomia entre schemas.

---

## Parte 3 — Resumo de Prioridade Alta (para sequenciar specs de Expansão futuras)

1. **`tables.ts`** — 3 tokens existentes desconectados (`tableRowHoverBg`, `tableBorderColor`, `tableHeaderBg`) + 3 hardcodes puros + zebra striping morto + gap sistêmico de sombra/blur/variante. Família prioritária (spec 06).
2. **`navigation.ts`** — header da sidebar sem token de altura/bg; **2 quebras de paridade de nome** (`--sarak-sidebar-active`/`--sarak-topbar-active`, faltando sufixo `-color`); `sidebarShadow`/`sidebarBlur` órfãos; `DockNav` sem tokens dedicados; estado offline sem token. Família prioritária (spec 06).
3. **`inputs.ts`** — `inputPadding` é token existente e catalogado mas 100% inerte; sem disabled; sem `inputStyleType`. Família prioritária (spec 06).
4. **`status.ts`** — `SarakBadge` (componente canônico) ignora as 4 cores semânticas e o raio, apesar de `SarakToast` já demonstrar o padrão correto no mesmo diretório.
5. **`layers.ts`** — overlays hardcodam blur/opacidade de backdrop; dezenas de `z-[1000]`/`z-[9999]` ignoram `zIndexSidebar`/`zIndexTooltip`.
6. **`data.ts`** — motor real de gráficos (`useEChartsTheme.ts`, `SarakChartEngine.tsx`, `basicCharts.ts`) ignora paleta, tooltip, grade e espessura configuráveis.
7. **`cards.ts`** (referência) — sistema de hover/glow/spotlight tem tokens declarados em 15 presets sem nenhum consumidor real; `cardHoverColor`/`cardActiveColor`/`cardNoiseOpacity` plumbados no manifest sem token no schema.
8. **`media.ts`** — `globalBackgroundBlendMode` explicitamente sobrescrito no código (`safeBlendMode = 'normal'`), tornando 5 opções da UI inertes.
9. **`overlays.ts`** — `SarakModal`, o overlay mais usado do sistema, ignora `modalOverlayColor`/`modalOverlayBlur`.
10. **`engineering.ts`** — `reducedMotion` órfão (gap de acessibilidade real).

**Famílias sem gap encontrado:** `structural.ts` (cobertura completa confirmada).

---

## Metodologia e verificação (rastreabilidade)

- Ghost Vars: revalidadas item a item contra os 28 `cssVars` de schema, `manifest.ts` e as 13 partições do catálogo (`src/core/Design/catalog/partitions/*.json`), incluindo o mecanismo de `generateVariants` (`useDesignVariables.ts:94-129`) que gera sufixos em runtime.
- Gaps: as 28 famílias foram auditadas por leitura direta de schema + componente(s) + hooks, comparando com `cards.ts`/`buttons.ts` como referência rica (Metodologia Seção 5 da spec).
- Amostragem de verificação manual pós-coleta (nesta execução, antes de publicar): `SidebarNav.tsx:83`, `SidebarNav.tsx:142`, `navigation.ts:78-82`, `manifest.ts:200,202`, `SarakTable.tsx:109,113,117,136,149`, `tables.ts:39-84` — todas conferem exatamente com o código real no momento da auditoria.
- Nenhum arquivo de código-fonte, schema, manifest ou catálogo foi alterado como parte desta auditoria (Regra 1 e 4 da spec — diagnóstico, não correção).
