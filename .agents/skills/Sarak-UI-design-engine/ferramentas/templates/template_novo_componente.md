# Template: Novo Componente Data-Driven

Use este template ao adicionar um novo componente ao Design Engine. Preencha os campos `[PLACEHOLDER]` com os valores reais.

---

## 1. Schema — `src/core/Design/schema/[NOME_COMPONENTE].ts`

```typescript
import { ComponentSchema } from '../types';

/**
 * Schema: [NOME_LEGIVEL] (v1.0)
 * [DESCRICAO_DO_COMPONENTE]
 */
export const [NOME]Schema: ComponentSchema = {
    id: '[nome-kebab]',                              // Ex: 'sidebar', 'chat-bubble', 'table-header'
    label: '[Nome Legível]',                         // Ex: 'Sidebar', 'Chat Bubble', 'Cabeçalho de Tabela'
    pilar: '[PILAR]',                                // brand | typography | surfaces | interaction | navigation | systems
    subcategory: '[Subcategoria]',                   // Ex: 'Estrutura', 'Mensagens', 'Data Grid'
    tokens: [
        {
            id: '[prefixo][NomeToken]',              // Ex: 'sidebarWidth', 'chatBubblePadding'
            label: '[Rótulo legível]',               // Ex: 'Largura da Sidebar'
            category: '[Grupo]',                     // Ex: 'Layout', 'Geometria', 'Superfície'
            type: '[TIPO]',                          // slider | color | select | boolean | text | number | font
            unit: '[UNIDADE]',                       // px | % | rem | ms | deg | s (omitir se não aplicável)
            constraints: {
                min: [MIN],                          // Ex: 0
                max: [MAX],                          // Ex: 60
                step: [STEP]                         // Ex: 1
            },
            defaultValue: [VALOR_PADRAO],            // Ex: 260, '#0a0a0b', true
            cssVars: ['--sarak-[kebab-case-id]'],    // Ex: ['--sarak-sidebar-width']
            generateVariants: [true|false]           // true para cores (gera RGB, hover, active)
        }
        // Adicionar mais tokens conforme necessário
    ]
};
```

---

## 2. Master Map — Adicionar a `src/core/Design/master-map.ts`

```typescript
// Import
import { [NOME]Schema } from './schema/[NOME_COMPONENTE]';

// No array components
components: [
    // ... existentes ...
    [NOME]Schema
]
```

---

## 3. Preset — `src/core/Design/presets/[SUBCATEGORIA]/[NOME_COMPONENTE].ts`

```typescript
export interface [Nome]Preset {
    id: string;
    name: string;
    description: string;
    design: {
        [prefixo][NomeToken1]: [TIPO1];     // Ex: sidebarWidth: number
        [prefixo][NomeToken2]: [TIPO2];     // Ex: sidebarBackground: string
        [key: string]: any;
    };
}

export const [NOME]_PRESETS: [Nome]Preset[] = [
    {
        id: '[id-kebab]',                   // Ex: 'compact-ops'
        name: '[Nome Legível]',             // Ex: 'Compact Operations'
        description: '[Descrição]',
        design: {
            [prefixo][NomeToken1]: [VALOR], // Ex: sidebarWidth: 200
            [prefixo][NomeToken2]: [VALOR]  // Ex: sidebarBackground: '#050508'
        }
    }
];
```

---

## 4. Barrel Export — `src/core/Design/presets/[SUBCATEGORIA]/index.ts`

```typescript
export * from './[NOME_COMPONENTE]';
```

---

## 5. Galeria — `src/features/DesignEngine/Canvas/Galleries/[Nome]Gallery.tsx`

```tsx
import React, { useMemo } from 'react';
import { GalleryItem } from './GalleryItem';
import { [NOME]_PRESETS, [Nome]Preset } from '../../../../core/Design/presets/[SUBCATEGORIA]/[NOME_COMPONENTE]';
import { DesignScope } from '../../../../core/Design/components/DesignScope';

const Specimen: React.FC<{ preset: [Nome]Preset, globalTokens: any }> = ({ preset, globalTokens }) => {
    const mergedTokens = useMemo(() => {
        const final = { ...globalTokens, ...preset.design };
        ['themePrimary', 'mode'].forEach(t => {
            if (globalTokens[t] !== undefined) final[t] = globalTokens[t];
        });
        return final;
    }, [preset, globalTokens]);

    return (
        <DesignScope design={mergedTokens}>
            {/* Renderizar representação visual do componente */}
        </DesignScope>
    );
};

export const [Nome]Gallery: React.FC<{
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}> = ({ tokens, onUpdateDraft }) => {
    
    const handleSelect = (preset: [Nome]Preset) => {
        Object.entries(preset.design).forEach(([key, val]) => {
            onUpdateDraft(key, val);
        });
        onUpdateDraft('[prefixo]PresetId', preset.id);
    };

    return (
        <div>
            {[NOME]_PRESETS.map(preset => (
                <GalleryItem
                    key={preset.id}
                    title={preset.name}
                    description={preset.description}
                    isActive={tokens.[prefixo]PresetId === preset.id}
                    onClick={() => handleSelect(preset)}
                >
                    <Specimen preset={preset} globalTokens={tokens} />
                </GalleryItem>
            ))}
        </div>
    );
};
```

---

## 6. Router — Adicionar a `src/features/DesignEngine/Canvas/Galleries/GalleryRouter.tsx`

```tsx
case '[subcategoria]':
    return <[Nome]Gallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
```

---

## 7. CSS — Adicionar a `src/styles/sarak-base.css` (se necessário)

```css
.sarak-[nome-componente] {
    width: var(--sarak-[prefixo]-width, [DEFAULT]);
    background: var(--sarak-[prefixo]-background, [DEFAULT]);
    border-radius: var(--sarak-[prefixo]-border-radius, [DEFAULT]);
}
```
