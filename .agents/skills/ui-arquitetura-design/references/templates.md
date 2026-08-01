# Template: Novo Token Data-Driven

Use este template ao adicionar um token ao Design Engine. Preencha os `[PLACEHOLDER]` com os
valores reais.

> **A regra mora na spec, não aqui.** O contrato completo do dicionário está em
> `specs/arquitetura/04-contrato-de-tokens-e-paridade.md`; o fluxo passo a passo, em
> `sarak-dev/GUIA-MANUTENCAO.md` §2. Este arquivo é só o **molde copiável**.
>
> ⚠️ **A forma real das interfaces é `src/core/Design/types.ts`.** Se este molde divergir dela,
> **o código vence** — e o molde é que está errado.

---

## 1. Schema — `src/core/Design/schema/[NOME_COMPONENTE].ts`

`ComponentSchema` tem exatamente **três** campos: `id`, `label` e `tokens`.

```typescript
import { ComponentSchema } from '../types';

/**
 * Mapeamento Atômico: [NOME_LEGIVEL]
 * [DESCRICAO_DO_QUE_ESTE_SCHEMA_GOVERNA]
 */
export const [NOME]Schema: ComponentSchema = {
    id: '[nome-kebab]',                              // Ex: 'cards', 'sidebar', 'tables'
    label: '[Nome Legível]',                         // Ex: 'Card Geral'
    tokens: [
        {
            id: '[prefixo][NomeToken]',              // Ex: 'cardBorderRadius' — camelCase, único no estado
            label: '[Rótulo legível]',               // Ex: 'Raio da Borda (Master)'
            type: '[TIPO]',                          // slider | color | select | boolean | text | number | font | image | file
            description: '[O que este token faz]',   // É SUPERFÍCIE PÚBLICA: o catálogo o publica verbatim
            axis: '[EIXO]',                          // color | geometry | elevation | texture | density | motion (opcional)
            isResponsive: [true|false],              // true habilita a forma { desk, tab, mob }
            unit: '[UNIDADE]',                       // px | % | rem | em | ms | deg | s (omitir se não aplicável)
            constraints: {
                min: [MIN],
                max: [MAX],
                step: [STEP]
            },
            defaultValue: [VALOR_PADRAO],            // Ex: 12, '#0a0a0b', true, { mob: 8, tab: 12, desk: 12 }
            cssVars: ['--sarak-[kebab-case-id]'],    // As variáveis que ESTE token emite
            generateVariants: [true|false]           // true para cores (gera -rgb, -hover, -active…)
        }
    ]
};
```

**Se o token for ESTRUTURAL** (muda *qual classe* o componente usa, não o valor de uma
propriedade), ele **não** vira CSS Variable: acrescente `structuralConsumer` e deixe `cssVars`
vazio.

```typescript
{
    id: 'tableDensity',
    label: 'Densidade da Tabela',
    type: 'select',
    constraints: {
        options: [
            { id: 'comfortable', value: 'comfortable', label: 'Confortável' },
            { id: 'spacious',    value: 'spacious',    label: 'Espaçosa' }
        ]
    },
    defaultValue: 'comfortable',
    structuralConsumer: ['useTableLayoutStyles']     // o hook que LÊ este token em JS
}
```

---

## 2. Master Map — registrar em `src/core/Design/master-map.ts`

```typescript
import { [NOME]Schema } from './schema/[NOME_COMPONENTE]';

export const MASTER_DESIGN_MAP: MasterDesignSchema = {
    version: '[VERSAO]',
    components: [
        // ... schemas existentes ...
        [NOME]Schema
    ]
};
```

---

## 3. Roteamento de persistência — `src/core/Design/catalog/theme_table_mapping.json`

Acrescente o `id` do token no array da **coluna** correspondente. Um id em **duas** colunas é
ambiguidade de roteamento — o defeito que a §2.4 do `GUIA-MANUTENCAO.md` registra.

```json
{
  "[coluna_do_dominio]": [
    "...ids existentes...",
    "[prefixo][NomeToken]"
  ]
}
```

---

## 4. Partição do catálogo — `src/core/Design/catalog/partitions/[coluna].json`

```json
{
    "tokenId": "[prefixo][NomeToken]",
    "databaseColumn": "[coluna_do_dominio]",
    "schemaOrigin": "[NOME_COMPONENTE].ts",
    "digitalTwins": ["[SarakComponente]"],
    "cssVariables": ["--sarak-[kebab-case-id]"],
    "allowedValues": [],
    "relatedTokens": [],
    "consumerHook": []
}
```

⚠️ **Paridade da marca estrutural:** token com `structuralConsumer` no schema tem o
`consumerHook` espelhado aqui (ex.: `["useStructuralStyles.getInputIconStyles"]`), e `cssVariables`
vazio. Marcar num lado e esquecer o outro é drift.

---

## 5. O consumo — Hook Controlador, nunca JSX

Nenhuma decisão de estilo mora no `.tsx`. A **alavanca de Valor** chega sozinha, via CSS Variable;
a **alavanca Estrutural** é lida pelo Hook Controlador, que devolve `{ className, style }`.

```tsx
// CERTO — geometria vinda do Hook, valor vindo de token COM fallback
const { getFlexStyles } = useStructuralStyles();

<div
    {...getFlexStyles({ direction: 'column', gap: 'spacing-sm' })}
    style={{ borderRadius: 'var(--sarak-card-radius, 12px)' }}
/>
```

```tsx
// ERRADO — Tailwind estrutural chumbado + valor solto
<div className="flex flex-col gap-2 p-4" style={{ borderRadius: '12px' }} />
```

---

## 6. CSS de base — `src/styles/sarak-base.css` (só se necessário)

```css
.sarak-[nome-componente] {
    width: var(--sarak-[prefixo]-width, [DEFAULT]);
    background: var(--sarak-[prefixo]-bg, [DEFAULT]);
    border-radius: var(--sarak-[prefixo]-border-radius, [DEFAULT]);
}
```

**Sempre com fallback.** `var(--x)` sem fallback resolve para vazio: o espaçamento colapsa, a cor
some, e o console fica limpo.

---

## 7. Fechar

```bash
npm run audit           # auditor_paridade cruza as 3 fontes; auditor_ghostvars confere o emissor
npm run catalog         # regenera docs/component-catalog.{json,md}
npm run guide           # kit do consumidor
npm run dev-kit         # kit do mantenedor
npx vitest run          # a suíte INTEIRA
```

Compare o `npm run audit` com o **baseline** de `specs/specs/01-gates-e-baseline.md` — ele **não**
está em zero.
