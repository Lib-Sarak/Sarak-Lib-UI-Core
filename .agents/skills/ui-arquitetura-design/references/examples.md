# Exemplos de Arquitetura de Design

## Exemplo Bom
# Exemplo Bom â€” AdiÃ§Ã£o de um novo componente (Sidebar)

## CenÃ¡rio

O desenvolvedor precisa tornar a largura, cor de fundo e raio de borda da Sidebar configurÃ¡veis pelo Design Engine.

---

## Estado ANTES (sem o componente mapeado)

A Sidebar possui estilos hardcoded no componente:

```tsx
// src/core/Shell/Sidebar.tsx
<aside style={{ width: '260px', background: '#0a0a0b', borderRadius: '0px' }}>
    {children}
</aside>
```

**Problemas:**
- A largura Ã© fixa e invisÃ­vel ao Design Engine.
- O usuÃ¡rio nÃ£o pode personalizar a Sidebar pelo painel.
- NÃ£o existe preset de Sidebar.

---

## Estado DEPOIS (pipeline data-driven aplicado)

### 1. Schema criado

```typescript
// src/core/Design/schema/sidebar.ts
import { ComponentSchema } from '../types';

export const SidebarSchema: ComponentSchema = {
    id: 'sidebar',
    label: 'Sidebar',
    pilar: 'navigation',
    subcategory: 'Estrutura',
    tokens: [
        {
            id: 'sidebarWidth',
            label: 'Largura da Sidebar',
            category: 'Layout',
            type: 'slider',
            unit: 'px',
            constraints: { min: 180, max: 400, step: 10 },
            defaultValue: 260,
            cssVars: ['--sarak-sidebar-width']
        },
        {
            id: 'sidebarBackground',
            label: 'Cor de Fundo',
            category: 'SuperfÃ­cie',
            type: 'color',
            defaultValue: '#0a0a0b',
            cssVars: ['--sarak-sidebar-bg'],
            generateVariants: true
        },
        {
            id: 'sidebarBorderRadius',
            label: 'Raio da Borda',
            category: 'Geometria',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 0,
            cssVars: ['--sarak-sidebar-border-radius']
        }
    ]
};
```

### 2. Master Map atualizado

```typescript
// src/core/Design/master-map.ts
import { SidebarSchema } from './schema/sidebar';

export const MASTER_DESIGN_MAP: MasterDesignSchema = {
    version: '13.0.0',
    components: [
        // ... schemas existentes ...
        SidebarSchema
    ]
};
```

### 3. Preset criado

```typescript
// src/core/Design/presets/navigation/sidebar.ts
export interface SidebarPreset {
    id: string;
    name: string;
    description: string;
    design: {
        sidebarWidth: number;
        sidebarBackground: string;
        sidebarBorderRadius: number;
        [key: string]: any;
    };
}

export const SIDEBAR_PRESETS: SidebarPreset[] = [
    {
        id: 'compact-ops',
        name: 'Compact Operations',
        description: 'Sidebar estreita para mÃ¡xima densidade de informaÃ§Ã£o.',
        design: {
            sidebarWidth: 200,
            sidebarBackground: '#050508',
            sidebarBorderRadius: 0
        }
    },
    {
        id: 'wide-command',
        name: 'Wide Command',
        description: 'Sidebar ampla com respiro para navegaÃ§Ã£o confortÃ¡vel.',
        design: {
            sidebarWidth: 320,
            sidebarBackground: 'rgba(10, 10, 15, 0.95)',
            sidebarBorderRadius: 16
        }
    }
];
```

### 4. Componente agora consome variÃ¡veis CSS

```tsx
// src/core/Shell/Sidebar.tsx
<aside className="sarak-sidebar">
    {children}
</aside>
```

```css
/* src/styles/sarak-base.css */
.sarak-sidebar {
    width: var(--sarak-sidebar-width, 260px);
    background: var(--sarak-sidebar-bg, #0a0a0b);
    border-radius: var(--sarak-sidebar-border-radius, 0px);
}
```

### 5. Resultado

- âœ… A Sidebar aparece no painel sob "5. NavegaÃ§Ã£o e Estrutura" > "Estrutura"
- âœ… O slider de largura atualiza a Preview em tempo real
- âœ… Os presets "Compact Operations" e "Wide Command" estÃ£o disponÃ­veis na galeria
- âœ… Clicar "Aplicar ao Sistema" persiste a configuraÃ§Ã£o
- âœ… Zero CSS hardcoded no componente

---

## Categorias de CorreÃ§Ã£o Aplicadas

1. **Schema Registration** â€” Componente mapeado com tokens tipados
2. **Master Map Integration** â€” Schema agregado ao mapa central
3. **Preset Centralization** â€” Presets na fonte Ãºnica (`core/Design/presets/`)
4. **CSS Variable Consumption** â€” Componente consome variÃ¡veis ao invÃ©s de valores hardcoded
5. **Pipeline Compliance** â€” Draft â†’ Preview â†’ Apply respeitado


## Exemplo Ruim
# Exemplo Ruim â€” ViolaÃ§Ãµes comuns do pipeline Data-Driven

## CenÃ¡rio

Um desenvolvedor precisa adicionar presets de card ao sistema. Ele cria os presets rapidamente sem seguir o pipeline.

---

## Estado Incorreto (ViolaÃ§Ãµes Marcadas)

### ViolaÃ§Ã£o 1: Preset em localizaÃ§Ã£o errada

```typescript
// âš ï¸ ERRADO: src/constants/cards-presets.ts (fora do pipeline)
export const CARD_VARIANTS = [
    {
        id: 'glass',
        name: 'Glass',
        tokens: {                          // âš ï¸ ERRADO: chave "tokens" ao invÃ©s de "design"
            surfaceMaterial: 'glass',      // âš ï¸ ERRADO: chave nÃ£o existe no CardSchema
            glassOpacity: 0.8,             // âš ï¸ ERRADO: chave nÃ£o existe no CardSchema
            borderRadius: 16              // âš ï¸ ERRADO: deveria ser "cardBorderRadius"
        }
    }
];
```

**Por que Ã© ruim:**
- O arquivo estÃ¡ em `constants/`, nÃ£o em `core/Design/presets/surfaces/`.
- Usa `tokens` como chave do objeto ao invÃ©s de `design`.
- As chaves `surfaceMaterial`, `glassOpacity`, `borderRadius` **nÃ£o existem** no `CardSchema`. O `useDesignVariables` as ignora silenciosamente â€” elas nunca chegam ao CSS.
- Resultado: a galeria parece funcionar (renderiza) mas ao aplicar, o sistema real nÃ£o muda.

---

### ViolaÃ§Ã£o 2: Dupla injeÃ§Ã£o CSS no Specimen

```tsx
// âš ï¸ ERRADO: PresetsGallery.tsx â€” dupla injeÃ§Ã£o
const CardSpecimen = ({ preset, tokens }) => {
    const { variables } = useDesignVariables(mergedTokens);
    
    return (
        <DesignScope design={mergedTokens}>              {/* Camada 1: DesignScope */}
            <div style={variables as any}>                {/* âš ï¸ Camada 2: inline duplicado */}
                <div className="sarak-card">ConteÃºdo</div>
            </div>
        </DesignScope>
    );
};
```

**Por que Ã© ruim:**
- O `DesignScope` jÃ¡ injeta as variÃ¡veis CSS no DOM via `useDesignVariables` internamente.
- Adicionar `style={variables}` inline cria uma segunda camada de variÃ¡veis que pode sobrescrever ou conflitar com a primeira.
- Resultado: a Preview mostra algo diferente do que serÃ¡ aplicado ao sistema real (uma camada vence na cascata CSS de forma imprevisÃ­vel).

---

### ViolaÃ§Ã£o 3: Merge com defaults estÃ¡ticos

```tsx
// âš ï¸ ERRADO: CardsGallery.tsx â€” base estÃ¡tica
const mergedTokens = useMemo(() => {
    const base = getDefaultDesignState();    // âš ï¸ ERRADO: defaults do schema, nÃ£o do sistema real
    return { ...base, ...preset.design };
}, [preset]);
```

**Por que Ã© ruim:**
- `getDefaultDesignState()` retorna os `defaultValue` de todos os schemas â€” que podem ser completamente diferentes do estado real do sistema do usuÃ¡rio.
- Resultado: o specimen mostra um card com tema default (ex: cor primÃ¡ria azul) enquanto o sistema real usa uma cor primÃ¡ria verde. O usuÃ¡rio pensa que vai ficar como na preview, mas ao aplicar, as cores divergem.

---

### ViolaÃ§Ã£o 4: ContaminaÃ§Ã£o de namespace ao aplicar

```tsx
// âš ï¸ ERRADO: PresetsGallery.tsx â€” contaminaÃ§Ã£o
const handleSelect = (preset) => {
    Object.entries(preset.design).forEach(([key, val]) => {
        onUpdateDraft(key, val);
    });
    onUpdateDraft('layout', preset.id);    // âš ï¸ ERRADO: sobrescreve "layout" global
};
```

**Por que Ã© ruim:**
- A chave `layout` pertence ao namespace de navegaÃ§Ã£o/estrutura, nÃ£o de cards.
- Ao aplicar um preset de card, o layout do sistema Ã© sobrescrito, causando efeitos colaterais em outra subcategoria.
- Deveria usar `onUpdateDraft('cardPresetId', preset.id)`.

---

### ViolaÃ§Ã£o 5: Filtro restritivo na aplicaÃ§Ã£o

```tsx
// âš ï¸ ERRADO: CardsGallery.tsx â€” filtro que perde tokens
Object.entries(preset.design).forEach(([key, val]) => {
    if (key.startsWith('card')) {     // âš ï¸ ERRADO: ignora tokens sem prefixo "card"
        onUpdateDraft(key, val);
    }
});
```

**Por que Ã© ruim:**
- Se o preset define tokens legÃ­timos do schema que nÃ£o comeÃ§am com `card` (ex: `themePrimary` para sobrescrita local), eles sÃ£o descartados.
- Se todos os tokens jÃ¡ estÃ£o corretamente prefixados (como devem estar), o filtro Ã© redundante e adiciona complexidade desnecessÃ¡ria.
- A soluÃ§Ã£o correta Ã© garantir que o PRESET use apenas chaves vÃ¡lidas do schema, e aplicar TODAS sem filtro.

---

## Resumo das ViolaÃ§Ãµes

| # | ViolaÃ§Ã£o | Impacto |
|---|---------|---------|
| 1 | Preset em localizaÃ§Ã£o errada com chaves invÃ¡lidas | Tokens nunca chegam ao CSS |
| 2 | Dupla injeÃ§Ã£o CSS (DesignScope + inline) | Conflitos de cascata imprevisÃ­veis |
| 3 | Merge com defaults estÃ¡ticos | Preview nÃ£o reflete sistema real |
| 4 | ContaminaÃ§Ã£o de namespace (`layout`) | Efeitos colaterais entre subcategorias |
| 5 | Filtro restritivo na aplicaÃ§Ã£o | Perda silenciosa de tokens |

