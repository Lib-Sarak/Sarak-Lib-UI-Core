# Exemplo Ruim — Violações comuns do pipeline Data-Driven

## Cenário

Um desenvolvedor precisa adicionar presets de card ao sistema. Ele cria os presets rapidamente sem seguir o pipeline.

---

## Estado Incorreto (Violações Marcadas)

### Violação 1: Preset em localização errada

```typescript
// ⚠️ ERRADO: src/constants/cards-presets.ts (fora do pipeline)
export const CARD_VARIANTS = [
    {
        id: 'glass',
        name: 'Glass',
        tokens: {                          // ⚠️ ERRADO: chave "tokens" ao invés de "design"
            surfaceMaterial: 'glass',      // ⚠️ ERRADO: chave não existe no CardSchema
            glassOpacity: 0.8,             // ⚠️ ERRADO: chave não existe no CardSchema
            borderRadius: 16              // ⚠️ ERRADO: deveria ser "cardBorderRadius"
        }
    }
];
```

**Por que é ruim:**
- O arquivo está em `constants/`, não em `core/Design/presets/surfaces/`.
- Usa `tokens` como chave do objeto ao invés de `design`.
- As chaves `surfaceMaterial`, `glassOpacity`, `borderRadius` **não existem** no `CardSchema`. O `useDesignVariables` as ignora silenciosamente — elas nunca chegam ao CSS.
- Resultado: a galeria parece funcionar (renderiza) mas ao aplicar, o sistema real não muda.

---

### Violação 2: Dupla injeção CSS no Specimen

```tsx
// ⚠️ ERRADO: PresetsGallery.tsx — dupla injeção
const CardSpecimen = ({ preset, tokens }) => {
    const { variables } = useDesignVariables(mergedTokens);
    
    return (
        <DesignScope design={mergedTokens}>              {/* Camada 1: DesignScope */}
            <div style={variables as any}>                {/* ⚠️ Camada 2: inline duplicado */}
                <div className="sarak-card">Conteúdo</div>
            </div>
        </DesignScope>
    );
};
```

**Por que é ruim:**
- O `DesignScope` já injeta as variáveis CSS no DOM via `useDesignVariables` internamente.
- Adicionar `style={variables}` inline cria uma segunda camada de variáveis que pode sobrescrever ou conflitar com a primeira.
- Resultado: a Preview mostra algo diferente do que será aplicado ao sistema real (uma camada vence na cascata CSS de forma imprevisível).

---

### Violação 3: Merge com defaults estáticos

```tsx
// ⚠️ ERRADO: CardsGallery.tsx — base estática
const mergedTokens = useMemo(() => {
    const base = getDefaultDesignState();    // ⚠️ ERRADO: defaults do schema, não do sistema real
    return { ...base, ...preset.design };
}, [preset]);
```

**Por que é ruim:**
- `getDefaultDesignState()` retorna os `defaultValue` de todos os schemas — que podem ser completamente diferentes do estado real do sistema do usuário.
- Resultado: o specimen mostra um card com tema default (ex: cor primária azul) enquanto o sistema real usa uma cor primária verde. O usuário pensa que vai ficar como na preview, mas ao aplicar, as cores divergem.

---

### Violação 4: Contaminação de namespace ao aplicar

```tsx
// ⚠️ ERRADO: PresetsGallery.tsx — contaminação
const handleSelect = (preset) => {
    Object.entries(preset.design).forEach(([key, val]) => {
        onUpdateDraft(key, val);
    });
    onUpdateDraft('layout', preset.id);    // ⚠️ ERRADO: sobrescreve "layout" global
};
```

**Por que é ruim:**
- A chave `layout` pertence ao namespace de navegação/estrutura, não de cards.
- Ao aplicar um preset de card, o layout do sistema é sobrescrito, causando efeitos colaterais em outra subcategoria.
- Deveria usar `onUpdateDraft('cardPresetId', preset.id)`.

---

### Violação 5: Filtro restritivo na aplicação

```tsx
// ⚠️ ERRADO: CardsGallery.tsx — filtro que perde tokens
Object.entries(preset.design).forEach(([key, val]) => {
    if (key.startsWith('card')) {     // ⚠️ ERRADO: ignora tokens sem prefixo "card"
        onUpdateDraft(key, val);
    }
});
```

**Por que é ruim:**
- Se o preset define tokens legítimos do schema que não começam com `card` (ex: `themePrimary` para sobrescrita local), eles são descartados.
- Se todos os tokens já estão corretamente prefixados (como devem estar), o filtro é redundante e adiciona complexidade desnecessária.
- A solução correta é garantir que o PRESET use apenas chaves válidas do schema, e aplicar TODAS sem filtro.

---

## Resumo das Violações

| # | Violação | Impacto |
|---|---------|---------|
| 1 | Preset em localização errada com chaves inválidas | Tokens nunca chegam ao CSS |
| 2 | Dupla injeção CSS (DesignScope + inline) | Conflitos de cascata imprevisíveis |
| 3 | Merge com defaults estáticos | Preview não reflete sistema real |
| 4 | Contaminação de namespace (`layout`) | Efeitos colaterais entre subcategorias |
| 5 | Filtro restritivo na aplicação | Perda silenciosa de tokens |
