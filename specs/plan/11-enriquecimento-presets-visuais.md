---
tipo: "spec"
titulo: "Aplicação e Catálogo de Presets Modulares"
dominio: "Design Engine / Presets"
status: "🟡 Em Implementação"
prioridade: "Média"
tags: ["spec", "presets", "design-system", "hitl", "ui-criar-preset"]
relacionados: ["09-pipeline-criacao-aplicacao-tema"]
---

# 1. Visão Geral e Objetivo

Um **Preset** não é um conceito novo em relação a um **Tema** — é a mesma primitiva de payload da spec `09-pipeline-criacao-aplicacao-tema.md` (`{ chave: valor }`), só que aplicada a uma fatia menor: em vez de preencher os ~408 tokens de um Tema completo, um Preset preenche só os tokens de **1 domínio** (ex: só `cards.ts`, só `typography.ts`). Esta spec documenta esse mecanismo — o que compõe uma fatia, como ela é aplicada (preview vs real) e qual o catálogo fechado de categorias que recebe vitrine própria — para que a Design Engine demonstre visualmente a robustez do "Design as Data" sem depender de um verbo, endpoint ou formato de payload diferente do já descrito na spec 09.

**Fora de escopo aqui:** a criação de *conteúdo* estético novo (uma nova variante de card, uma nova fonte) continua exclusiva da skill `ui-criar-preset`, com o fluxo HITL da Seção 6. Esta spec não lista quais estéticas criar — ela define o contrato que qualquer preset (existente ou futuro) deve obedecer para aparecer corretamente no catálogo.

# 2. O Contrato do Preset (fatia = 1 domínio do Dicionário)

Um Preset é o tipo `ComponentPreset` (`src/core/Design/presets/components/cards.ts:3-8`):
```ts
interface ComponentPreset {
    id: string;
    name: string;
    description: string;
    design: Partial<SarakDesignState>;
}
```
`design` é a mesma fatia `{chave:valor}` da spec 09 §3, restrita por convenção às chaves de **1 Schema TS** (Merge Parcial — nenhuma chave global de tema, nenhuma cor primária, nenhum `mode`, salvo se pertencer ao escopo daquele componente). Essa restrição é validada por disciplina HITL da skill `ui-criar-preset`, não por tipo — `design` é tipado contra `Partial<SarakDesignState>` (o estado inteiro), então nada barra em tempo de compilação uma chave fora de escopo; o gate é o checklist humano da Seção 6.

# 3. Fatia Dinâmica vs Conteúdo Estático (o que atualiza sozinho, o que não)

Três coisas diferentes têm nomes parecidos e não podem ser confundidas:

- **O limite da fatia é vivo.** `getDomainMap().bySchema['cards'].tokenIds` (`src/core/Design/master-map.ts:105-117`) é recalculado a cada chamada a partir de `MASTER_DESIGN_MAP.components` — o conjunto de tokens que *pertencem* ao domínio Cards. Assim que um token novo entra no array `tokens` de `cards.ts`, ele já aparece nesse resultado e em `getScaffold('cards')`, sem tocar em nenhum outro arquivo. Nenhum preset consulta isso em runtime hoje (confirmado: zero uso de `getDomainMap()`/`getScaffold()` fora de `master-map.ts`) — é o limite teórico do que um preset daquele domínio *poderia* usar, não o que ele usa.
- **Conteúdo de 1 token (enum) pode ser 100% automático — e já é, em 4 pontos.** Quando um token `select` tem uma lista de opções fechada no Schema (`constraints.options`), um array de presets pode ser gerado com `OPTIONS.map(opt => ({ design: { [token]: opt.value } }))`: `TYPOGRAPHY_PRESETS` (`THEME_FONTS`), `TEXTURE_PRESETS` de Atmosphere (`TEXTURE_OPTIONS`), `CARD_TEXTURE_PRESETS` (mesma `TEXTURE_OPTIONS`, reaproveitada de `schema/atmosphere.ts` — `cardTextureType` deixou de duplicar a lista) e `BUTTON_STYLE_PRESETS` (`BUTTON_STYLE_OPTIONS`, extraída de `schema/buttons.ts`). Um valor novo na lista de opções do Schema vira preset sozinho, sem tocar no arquivo de presets. `inputBorderType` (Inputs) **não** ganhou essa camada: seus 4 valores já estavam 100% cobertos pelos `INPUT_PRESETS` curados — gerar aqui só duplicaria visualmente o que já existe, sem preencher lacuna.
- **Combinação de vários tokens (o "olhar" de um preset) é sempre manual.** `CARD_PRESETS`, `BUTTON_PRESETS`, `MEDIA_PRESETS` são arrays `ComponentPreset[]` escritos à mão — uma combinação curada (radius + shadow + glow + textura, por exemplo) é uma decisão de design, não uma lista enumerável, e sempre passa pelo HITL da Seção 7.
- **Um domínio/componente inteiramente novo** (novo Schema registrado em `MASTER_DESIGN_MAP.components`) aparece automaticamente em `bySchema`, mas não gera catálogo sozinho: precisa de um array de presets próprio e de uma entrada no catálogo (Seção 5) — isso é trabalho de implementação, não de dado.

Regra prática: **a fronteira de domínio é sempre automática; o conteúdo de 1 enum pode ser automático quando cobre uma lacuna real; uma combinação curada nunca é.**

# 4. As Duas Aplicações da Mesma Fatia

A mesma fatia `preset.design` é consumida de duas formas — nunca dois mecanismos, dois *destinos*:

| | Preview (vitrine) | Apply real |
|---|---|---|
| **O que faz** | Mostra como o preset ficaria, sem persistir nada | Grava o preset como o tema ativo do usuário |
| **Mecanismo** | `useDesignVariables({mode, ...preset.design})` gera um objeto `variables` local; o componente do card lê esse objeto e monta um `style` inline **só naquele card** | `onApplyPreset(preset.design, isPartial=true)` sobe até o mesmo `POST /design` da spec 09 §3-4 (merge granular, Regra 4) |
| **Alcance no DOM** | Nunca toca `:root` / `DesignInjector` — por isso vitrines com N presets diferentes lado a lado não brigam por CSS var global | Grava na tabela (`custom_themes`, spec 09 §5) e reflete no tema real do usuário |
| **Referência de código** | `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx` (uso de `useDesignVariables` escopado ao card) | Ver fluxo ponta-a-ponta completo em `09-pipeline-criacao-aplicacao-tema.md` §8 — não duplicado aqui |

Preset e Tema completo divergem só na amplitude (spec 09 §2.4: "Preset = fatia, Tema = tudo"), nunca no verbo.

# 5. Catálogo de Categorias (conjunto fechado desta rodada)

Categoria de Preset = granularidade de **Schema** (fina, ~28 possíveis), não de **Pilar** (ver distinção crítica na Seção 7). As 5 categorias com vitrine dedicada nesta rodada:

| Categoria | Schema id | Arquivo de presets | Camada automática (enum) | Componente de catálogo |
|---|---|---|---|---|
| Cards | `cards` | `presets/components/cards.ts` (`CARD_PRESETS` curado) | `CARD_TEXTURE_PRESETS` (de `cardTextureType`, sub-aba "Texturas") | `CardsCatalog.tsx` |
| Typography (Fontes) | `typography` | `presets/components/typography.ts` (`TYPOGRAPHY_PRESETS`) | 100% automática (de `THEME_FONTS`) | `TypographyCatalog.tsx` |
| Atmosphere (Texturas e Fundos) | `atmosphere` | `presets/components/atmosphere.ts` (`MEDIA_PRESETS` curado) | `TEXTURE_PRESETS` (de `TEXTURE_OPTIONS`, sub-aba "Texturas") | `AtmosphereCatalog.tsx` |
| Buttons | `buttons` | `presets/components/buttons.ts` (`BUTTON_PRESETS` curado) | `BUTTON_STYLE_PRESETS` (de `btnStyleType`, sub-aba "Por Estilo") | `ButtonsCatalog.tsx` |
| Inputs | `inputs` | `presets/components/inputs.ts` (`INPUT_PRESETS` curado) | Nenhuma — os 4 valores de `inputBorderType` já estavam 100% cobertos pelo curado (Seção 3) | `InputsCatalog.tsx` |

Todas as 5 são vitrines **grid-only** (sem cabeçalho de página próprio) montadas dentro do shell único `PresetsCatalog.tsx`, que também hospeda a aba "Globais" (`GLOBAL_THEMES`, temas completos via `PresetCard`). Cards/Atmosphere/Buttons têm sub-abas locais "Curados" / camada automática (default = Curados); Typography é só automática, Inputs é só curada. Unificar as 5 num componente genérico data-driven (1 registry declarativo de receita de preview por categoria) fica fora de escopo aqui — cada categoria continua sendo um componente próprio; a unificação é candidata a uma spec futura separada.

**Nota de renderização (Cards):** o preview de `cardTextureType` (`CardPresetPreview`, `CardsCatalog.tsx`) delega para o mesmo mecanismo CSS de produção — atributo `data-sx-card-texture-type` + classe `sarak-card`/`[class*="card"]`, com todas as regras já em `src/styles/_atmosphere.css` (idêntico ao que `SarakActionCard.tsx` faz) — em vez de reimplementar a textura em JS. Isso é o que torna os ~41 valores de `CARD_TEXTURE_PRESETS` visualmente corretos sem nenhum código de renderização novo.

# 6. Pilar ≠ Categoria de Preset (por que o roteamento não pode herdar `activePillarId`)

O painel humano de edição token-a-token navega por **Pilar** — 7 agrupamentos curados em `design-pillars.json`, cada um cobrindo 1 ou mais categorias humanas (ex: pilar `surfaces` cobre "Cards e Superfícies" + "Efeitos e Superfície" + "Geometria e Bordas" ao mesmo tempo). Um Pilar não corresponde 1:1 a 1 Schema — pode cobrir vários, ou nenhum dos 5 desta spec.

Por isso, o catálogo de presets (`PresetsCatalog.tsx`) **tem navegação própria** (abas Globais/Cards/Typography/Atmosphere/Buttons/Inputs, sempre visíveis, estado interno) e não decide o que exibir a partir de `activePillarId`. Herdar o Pilar ativo do painel humano para rotear o catálogo de presets é uma inconsistência de granularidade a evitar — não uma feature de "deep link" a preservar.

# 7. Regra de Negócio: Fluxo HITL Obrigatório (criação de conteúdo)

Como estipulado pela skill `ui-criar-preset`, a injeção em massa ou arbitrária de **conteúdo** de preset (uma nova estética, uma nova fonte) não é permitida. Aplica-se apenas à Seção 3 (conteúdo estático) — nunca ao mecanismo das Seções 2-6, que já está implementado:

1. **Definição de Escopo (Aprovação Humana):** o agente ou desenvolvedor propõe a lista de novos presets (tema e propósito) agrupados por categoria (Seção 5). O usuário aprova quais categorias recebem novos presets e a quantidade exata.
2. **Prototipação JSON:** os objetos `ComponentPreset` são gerados e apresentados para aprovação visual. Nenhuma regra global do tema vaza para dentro do preset modular (Merge Parcial, Seção 2).
3. **Validação de Schema:** nome e chaves de cada preset devem corresponder estritamente às propriedades existentes no Schema TS da categoria (`cards.ts`, `buttons.ts` etc.). Nenhuma propriedade CSS hardcoded.
4. **Implementação:** só após o "OK" expresso, os objetos são adicionados ao array da categoria correspondente.

# 8. Apêndice — Backlog de Conteúdo (fora de escopo do mecanismo; entra só via HITL da Seção 7)

Estéticas propostas como ponto de partida para uma futura rodada de triagem HITL — nenhuma foi criada por esta spec:

## 8.1. Cards
- **Claymorphism (Massinha):** bordas ultra-arredondadas, sem borda física, duas sombras espessas (interna clara para volume, externa sólida).
- **Retro OS (Anos 90):** cantos duros (radius 0), bordas cinzas sólidas chanfradas, sem desfoque.
- **Holographic HUD:** estilo sci-fi ultra transparente, muito blur, sombras claras ou neons espalhados, bordas translúcidas de 1px.

## 8.2. Buttons
- **3D Tactile / Arcade:** aparência física via `box-shadow` inset inferior (ilusão de profundidade ao pressionar).
- **Hollow Neon:** sem preenchimento, só borda/texto/glow externo forte — para temas escuros.
- **Brutalist / Terminal:** estilo 8-bit, quadrado, linhas espessas de altíssimo contraste.

## 8.3. Inputs
- **Terminal Dotted:** borda pontilhada/tracejada grossa, fundo puro negro.
- **Floating Pill:** radius máximo (pílula), sem bordas demarcadas, sombra projetada suave (efeito flutuante).
- **Industrial Inset:** sombra forte "para dentro", parecendo entalhado no fundo da página.

## 8.4. Atmosphere
- **Auroras Animadas:** vídeos curtos em loop suave ou gradientes CSS muito borrados.
- **Texturas Físicas:** grid, ruído estático, papel amassado, malha isométrica.

# 9. Critérios de Aceite
- [ ] As 5 categorias (Seção 5) são acessíveis via abas próprias de `PresetsCatalog.tsx`, sempre visíveis, independente de qual Pilar o painel humano estava ativo.
- [ ] Nenhuma branch de roteamento de categoria de preset lê `activeCategory`/`activePillarId`.
- [ ] `CardsCatalog`, `TypographyCatalog`, `AtmosphereCatalog`, `ButtonsCatalog`, `InputsCatalog` renderizam só a grade (sem cabeçalho de página duplicado) — `PresetsCatalog.tsx` é o único shell.
- [ ] Aplicar qualquer preset de qualquer categoria dispara `onApplyPreset(design, isPartial=true)` e reflete no tema real via o pipeline da spec 09 (§3-4), sem endpoint especial.
- [ ] Preview de qualquer preset (Seção 4) nunca escreve em `:root`/`DesignInjector`.
- [ ] Nenhum conteúdo novo de preset (Seção 8) foi injetado sem o fluxo HITL da Seção 7.
- [ ] Nenhuma lista de opções de enum usada por uma camada automática (Seção 3) está duplicada em mais de 1 arquivo de Schema — sempre importada da fonte canônica (`TEXTURE_OPTIONS`, `BUTTON_STYLE_OPTIONS` etc.).
