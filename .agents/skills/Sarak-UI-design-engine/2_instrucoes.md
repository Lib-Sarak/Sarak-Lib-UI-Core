# Workflow de Execução: Design Engine Data-Driven

Esta skill trata **um componente por vez**. Se múltiplos componentes precisam ser adicionados, repita o workflow inteiro para cada um.

---

## Arquitetura do Pipeline (Referência Rápida)

```
Schema (core/Design/schema/*.ts)
    ↓ importado por
Master Map (core/Design/master-map.ts)
    ↓ lido por
useDesignVariables (core/Design/hooks/useDesignVariables.ts)
    ↓ gera
CSS Variables (--sarak-*) + Atributos (data-sx-*)
    ↓ consumidas por
Componentes Visuais (via classes CSS + variáveis)
    ↓ controladas por
Design Engine UI (features/DesignEngine/)
    ↓ alimenta
Draft State (useDesignDraft) → Preview (Gêmeo Digital) → [Aplicar ao Sistema]
```

### Arquivos-Chave (Caminhos Absolutos)

| Arquivo | Caminho Relativo | Função |
|---------|-----------------|--------|
| Tipos Base | `src/core/Design/types.ts` | Define `DesignToken`, `ComponentSchema`, `MasterDesignSchema` |
| Master Map | `src/core/Design/master-map.ts` | Agrega todos os schemas num único array |
| Hook de Tradução | `src/core/Design/hooks/useDesignVariables.ts` | Traduz tokens → CSS variables (`--sarak-*`) |
| Schemas | `src/core/Design/schema/*.ts` | Um arquivo por componente/subcategoria |
| Presets | `src/core/Design/presets/{subcategoria}/*.ts` | Fonte única de presets por subcategoria |
| DesignScope | `src/core/Design/components/DesignScope.tsx` | Componente wrapper que injeta variáveis CSS no DOM |
| Draft Hook | `src/features/DesignEngine/hooks/useDesignDraft.ts` | Gerencia o estado de rascunho (sandbox) |
| Preview | `src/features/DesignEngine/Canvas/PreviewCanvas.tsx` | Gêmeo Digital do sistema |
| Galerias | `src/features/DesignEngine/Canvas/Galleries/*.tsx` | Catálogos de specimens por subcategoria |
| Painel | `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` | Barra de personalização com controles |

---

## Passo 0: Implementação Física do Componente

**Ferramenta:** `write_to_file`  
**Diretório:** `src/components/atomic/{Atoms|Molecules|Templates}/` ou `src/components/engines/`

Antes de mapear o componente no Design Engine, ele deve existir fisicamente. Siga estas diretrizes:

1. **Localização:**
   - **Atoms:** Componentes base (Botões, Badges, Inputs).
   - **Templates:** Organismos de layout (Grids, Tabelas, Cards).
   - **Engines:** Componentes complexos com lógica de estado interna (Chat, Flow, Charts).

2. **Consumo de Estilos (Lei de Ouro):**
   O componente **NUNCA** deve ter valores de cores, espaçamentos ou bordas hardcoded ou via classes utilitárias de cores do Tailwind (ex: `bg-blue-500`). Ele deve consumir exclusivamente as variáveis CSS do Sarak.

   ```tsx
   // Exemplo: src/components/atomic/Atoms/MyNewComponent.tsx
   export const MyNewComponent: React.FC = () => {
     return (
       <div 
         className="transition-all"
         style={{
           backgroundColor: 'var(--sarak-my-component-bg)',
           borderRadius: 'var(--sarak-my-component-radius)',
           padding: 'var(--sarak-my-component-padding)'
         }}
       >
         Conteúdo
       </div>
     );
   };
   ```

3. **Responsividade Estrita (O Padrão Adapter):**
   Componentes complexos (Engines ou Templates) NUNCA devem tentar adivinhar se estão num celular ou tentar consertar "fontes colossais" ou esconder textos inteiros baseados no tamanho da janela internamente. O componente original é **intocável** e agnóstico de ambiente (mantendo-se o mais limpo possível).
   Qualquer intervenção brutal (como esconder descrições via `line-clamp`, reduzir fontes `text-5xl` para `text-xl` em Mobile, ou colocar max-heights para criar barras de rolagem) deve ser DELEGADA ao **Injetor CSS do sistema importador** (`Painel.tsx` usando seletores Tailwind V4).

4. **Exportação:** Garanta que o componente seja exportado no barrel `src/components/index.ts` ou `src/components/atomic/Templates/index.ts` para ser visível pelo `DynamicRenderer`.

---

## Passo 1: Verificar se o componente já está mapeado

**Ferramenta:** `write_to_file`  
**Arquivo:** `src/core/Design/schema/{nome-do-componente}.ts`

O schema define cada propriedade configurável do componente. Cada token deve seguir a interface `DesignToken`:

```typescript
import { ComponentSchema } from '../types';

export const ExemploSchema: ComponentSchema = {
    id: 'exemplo',                          // Identificador único (kebab-case)
    label: 'Nome Legível do Componente',     // Exibido no painel
    pilar: 'surfaces',                       // Um dos 6 pilares: brand | typography | surfaces | interaction | navigation | systems
    subcategory: 'Nome da Subcategoria',     // Agrupamento dentro do pilar
    tokens: [
        {
            id: 'exemploCorFundo',           // camelCase — prefixado pelo nome do componente
            label: 'Cor de Fundo',
            category: 'Superfície',
            type: 'color',                   // Tipos: slider | color | select | boolean | text | number | font
            defaultValue: '#1a1a1a',
            cssVars: ['--sarak-exemplo-cor-fundo'],  // CSS variables que este token controla
            generateVariants: true           // Se true, gera variantes RGB, hover, active
        },
        {
            id: 'exemploBorderRadius',
            label: 'Raio da Borda',
            category: 'Geometria',
            type: 'slider',
            unit: 'px',                      // Unidades: px | % | rem | ms | deg | s
            constraints: { min: 0, max: 60, step: 1 },
            defaultValue: 8,
            cssVars: ['--sarak-exemplo-border-radius']
        }
    ]
};
```

**Regras de nomenclatura:**
- O `id` do token DEVE ser prefixado pelo nome do componente em camelCase: `cardBorderRadius`, `sidebarWidth`, `chatBubblePadding`.
- O `cssVars` segue o padrão `--sarak-{kebab-case-do-id}`. O hook gera isso automaticamente, mas o array `cssVars` permite mapear aliases adicionais.
- O `defaultValue` é o valor aplicado quando nenhuma configuração customizada existe.

---

## Passo 3: Registrar o Schema no Master Map

**Ferramenta:** `replace_file_content` ou `multi_replace_file_content`  
**Arquivo:** `src/core/Design/master-map.ts`

Adicione o import e inclua o schema no array `components`:

```typescript
// 1. Adicionar import (junto aos demais)
import { ExemploSchema } from './schema/exemplo';

// 2. Adicionar ao array components (dentro de MASTER_DESIGN_MAP)
export const MASTER_DESIGN_MAP: MasterDesignSchema = {
    version: '13.0.0',
    components: [
        // ... schemas existentes ...
        ExemploSchema    // ← Adicionar aqui
    ]
};
```

**Após este passo, o hook `useDesignVariables` já traduzirá AUTOMATICAMENTE todos os tokens do novo schema para variáveis CSS.** Nenhuma modificação adicional no hook é necessária — ele itera sobre `getAllDesignTokens()` que reflete o Master Map.

---

## Passo 4: Adicionar controles no Design Engine (Painel de Personalização)

**Ferramenta:** `view_file` → `replace_file_content`

O arquivo `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` renderiza automaticamente os controles com base na estrutura do `MASTER_DESIGN_MAP`. Ele agrupa por `pilar` → `subcategory` → tokens individuais.

**Se o `pilar` do novo schema já existe** (ex: `surfaces`, `brand`), os controles aparecerão automaticamente na aba correspondente. Nenhuma ação manual necessária.

**Se o `pilar` NÃO existe** (novo pilar), adicione-o ao array `pillars` no `ThemeCustomizationTab.tsx`:

```typescript
const pillars = useMemo(() => [
    // ... pilares existentes ...
    { id: 'novo-pilar', title: 'N. Nome do Pilar', icon: IconComponent, index: N },
], []);
```

**Verificação:** Após este passo, abra o Design Engine e confirme que os controles (sliders, selects, inputs de cor) aparecem na seção correta do painel.

---

## Passo 5: Criar Presets (se aplicável)

**Ferramenta:** `write_to_file`  
**Arquivo:** `src/core/Design/presets/{subcategoria}/{nome-do-componente}.ts`

Um preset é um objeto puro de configuração — **sem lógica, sem componentes React, sem estilos inline**. Ele define valores para os tokens do schema correspondente.

```typescript
export interface ExemploPreset {
    id: string;
    name: string;
    description: string;
    design: {
        exemploCorFundo: string;
        exemploBorderRadius: number;
        // Todas as chaves DEVEM existir no Schema correspondente
        [key: string]: any;
    };
}

export const EXEMPLO_PRESETS: ExemploPreset[] = [
    {
        id: 'variante-alpha',
        name: 'Variante Alpha',
        description: 'Descrição concisa desta variante.',
        design: {
            exemploCorFundo: '#0a0a0a',
            exemploBorderRadius: 12,
        }
    }
];
```

**Regra CRÍTICA:** Cada chave dentro de `design` DEVE ser um `token.id` que existe no Schema correspondente. Chaves que não existem no schema serão ignoradas pelo `useDesignVariables` e nunca chegarão ao CSS.

**Exportar via barrel:** Adicione o export no `src/core/Design/presets/{subcategoria}/index.ts`:

```typescript
export * from './{nome-do-componente}';
```

---

## Passo 6: Apresentação e Confirmação do Usuário (HITL)

Antes de criar a Galeria (Passo 7), apresente ao usuário:

```
## ✅ Plano de Execução — Novo Componente [{nome}]

**Schema criado:** src/core/Design/schema/{nome}.ts ({N} tokens)
**Master Map atualizado:** {nome}Schema adicionado ao array components
**Presets criados:** {N} variantes em src/core/Design/presets/{subcategoria}/{nome}.ts
**Controles no painel:** Aparecerão automaticamente no pilar [{pilar}]

**Próximo passo:** Criar a Galeria de specimens para visualização dos presets.

⚠️ Confirma para prosseguir?
```

**Regra:** Não crie a galeria antes de receber confirmação explícita do usuário.

---

## Passo 7: Criar o Catálogo de Specimens (se aplicável)

**Ferramenta:** `write_to_file`  
**Arquivo:** `src/features/DesignEngine/Canvas/components/{Nome}Catalog.tsx`

O catálogo (Galeria) exibe specimens visuais de cada preset para que o usuário escolha. Regras obrigatórias:

1. **Usar `DesignScope` como ÚNICA camada de injeção CSS.** Nunca duplicar com `style={variables}` inline.

2. **Fazer merge com o estado real do sistema** (`globalTokens`/`tokens`), não com `getDefaultDesignState()`:

```tsx
const mergedTokens = useMemo(() => {
    const final = { ...globalTokens, ...preset.design };
    // Manter reatividade para tema e modo
    const reactiveTokens = ['themePrimary', 'mode'];
    reactiveTokens.forEach(token => {
        if (globalTokens[token] !== undefined) final[token] = globalTokens[token];
    });
    return final;
}, [preset, globalTokens]);
```

3. **Aplicar TODOS os tokens do preset sem filtro restritivo:**

```tsx
const handleSelect = (preset: ExemploPreset) => {
    Object.entries(preset.design).forEach(([key, val]) => {
        onUpdateDraft(key, val);
    });
    onUpdateDraft('exemploPresetId', preset.id);
};
```

4. **Persistir a identidade do preset ativo** com a chave `{componente}PresetId` (ex: `cardPresetId`), nunca sobrescrevendo `layout` ou chaves de outras subcategorias.

---

## Passo 8: Registrar o Catálogo no Router Central

**Ferramenta:** `replace_file_content`  
**Arquivo:** `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx`

Adicione a condição de roteamento para o novo catálogo baseado na `activeCategory`:

```tsx
if (activeCategory === '{subcategoria}') {
    return <ExemploCatalog onApplyPreset={onApplyPreset} currentMode={currentMode} />;
}
```

---

## Passo 9: Verificação Final

**Ferramenta:** `run_command`

1. Compile sem erros: `npx tsc --noEmit`
2. Confirme que os tokens aparecem no painel do Design Engine
3. Confirme que alterar um slider no painel atualiza a preview em tempo real
4. Confirme que clicar "Aplicar ao Sistema" persiste a alteração

---

## Passo 10: Registro

Documente o resultado da execução para rastreabilidade:

- Componente adicionado: `{nome}`
- Schema: `src/core/Design/schema/{nome}.ts` ({N} tokens)
- Master Map: atualizado (v{versão})
- Presets: `src/core/Design/presets/{subcategoria}/{nome}.ts` ({N} variantes)
- Catálogo: `src/features/DesignEngine/Canvas/components/{Nome}Catalog.tsx`
- Build: ✅ sem erros novos
