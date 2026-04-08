# Mapa de Configurações - Design Engine Sarak v6.0

Este documento serve como a referência técnica para a criação de temas (Presets) no ecossistema Sarak. Cada configuração aqui listada pode ser incluída num objeto de preset para aplicação 100% automatizada.

## 1. ARQUITETURA (Architecture)
- **navigationStyle**: `sidebar` | `topbar` | `dock`
- **sidebarWidth**: Valor numérico (px). Sugerido: `60` a `400`.
- **layoutDensity**: `compact` | `standard` | `comfortable`
- **isAutoHideEnabled**: `true` | `false` (Auto-ocultar nav)

## 2. ESTRUTURAS & BUSCA (Structures & Search)
- **isSplitViewEnabled**: `true` | `false` (Dois módulos em paralelo)
- **secondaryModuleId**: ID do módulo (Ex: `llm-catalog`, `users`)
- **searchStyle**: `minimal` | `command-palette`

## 3. TIPOGRAFIA (Typography)
- **headingFont**: Nome da fonte CSS (Ex: `'Satoshi', sans-serif`)
- **subtitleFont**: Nome da fonte CSS
- **tabFont**: Nome da fonte CSS
- **bodyFont**: Nome da fonte CSS (Ex: `'Inter', sans-serif`)
- **headingWeight**: `'300'` | `'400'` | `'600'` | `'800'` | `'900'`
- **headingLetterSpacing**: `tight` | `normal` | `wide` | `widest`
- **fontScale**: `p1` (XS) | `p` (S) | `m` (M) | `g` (L) | `g1` (XL)

## 4. GEOMETRIA & MATERIAIS (Geometry & Materials)
- **borderRadius**: Valor numérico (px).
- **borderWidth**: Valor numérico (px).
- **borderStyle**: `solid` | `dashed` | `dotted` | `double`
- **surfaceMaterial**: `glass` | `metallic` | `brushed` | `acrylic` | `matte`
- **borderType**: `default` | `inlet` | `neon` | `beveled`
- **layoutGap**: Valor numérico (px). Espaçamento entre cards.
- **glassOpacity**: Valor decimal (`0` a `1`).
- **glassBlur**: Valor numérico (px).
- **isGeometricCut**: `true` | `false` (Cortes angulares)
- **cursorPhysics**: `true` | `false`

## 5. ATMOSFERA (Atmosphere)
- **texture**: `none` | `grid` | `dots` | `noise` | `carbon` | `topo` | `hexagon` | `circuit` | `scanlines` | `silk` | `blueprint` | `aurora` | `bubbles`
- **textureOpacity**: Valor decimal (`0` a `0.3`).

## 6. CORES & IDENTIDADE (Colors & Identity)
- **primaryColor**: Código Hex (Ex: `#3b82f6`)
- **systemName**: String de texto.
- **logoUrl**: URL ou Base64 (Light Mode)
- **logoDarkUrl**: URL ou Base64 (Dark Mode)
- **logoScale**: Valor decimal (`0.5` a `2.5`).
- **logoPosition**: `left` | `center`
- **systemTone**: `formal` | `friendly` | `cyber`

## 7. DADOS & GRÁFICOS (Data Visualization)
- **chartStyle**: `line` | `bar` | `solid` | `glass`
- **chartPalette**: Array de strings CSS (Ex: `['#3b82f6', '#10b981']`)

## 8. SOMBRAS & PROFUNDIDADE (Depth)
- **shadowIntensity**: Valor decimal (`0` a `1`).
- **shadowOrientation**: `top-down` | `isometric` | `inner`
- **shadowColorMode**: `neutral` | `adaptive` | `match`

## 9. EFEITOS (Effects)
- **animationSpeed**: Valor decimal em segundos (Ex: `0.4`).
- **mode**: `light` | `dark` | `system`
