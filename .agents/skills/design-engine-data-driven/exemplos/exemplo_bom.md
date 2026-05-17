# Exemplo Bom — Adição de um novo componente (Sidebar)

## Cenário

O desenvolvedor precisa tornar a largura, cor de fundo e raio de borda da Sidebar configuráveis pelo Design Engine.

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
- A largura é fixa e invisível ao Design Engine.
- O usuário não pode personalizar a Sidebar pelo painel.
- Não existe preset de Sidebar.

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
            category: 'Superfície',
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
        description: 'Sidebar estreita para máxima densidade de informação.',
        design: {
            sidebarWidth: 200,
            sidebarBackground: '#050508',
            sidebarBorderRadius: 0
        }
    },
    {
        id: 'wide-command',
        name: 'Wide Command',
        description: 'Sidebar ampla com respiro para navegação confortável.',
        design: {
            sidebarWidth: 320,
            sidebarBackground: 'rgba(10, 10, 15, 0.95)',
            sidebarBorderRadius: 16
        }
    }
];
```

### 4. Componente agora consome variáveis CSS

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

- ✅ A Sidebar aparece no painel sob "5. Navegação e Estrutura" > "Estrutura"
- ✅ O slider de largura atualiza a Preview em tempo real
- ✅ Os presets "Compact Operations" e "Wide Command" estão disponíveis na galeria
- ✅ Clicar "Aplicar ao Sistema" persiste a configuração
- ✅ Zero CSS hardcoded no componente

---

## Categorias de Correção Aplicadas

1. **Schema Registration** — Componente mapeado com tokens tipados
2. **Master Map Integration** — Schema agregado ao mapa central
3. **Preset Centralization** — Presets na fonte única (`core/Design/presets/`)
4. **CSS Variable Consumption** — Componente consome variáveis ao invés de valores hardcoded
5. **Pipeline Compliance** — Draft → Preview → Apply respeitado
