# Exemplos de Arquitetura de Design

Casos mínimos do pipeline `Schema → Master Map → CSS Variables`. A regra completa está em
`specs/specs/00-regras-e-invariantes.md` (R2, R7, R10) e em
`specs/arquitetura/04-contrato-de-tokens-e-paridade.md`.

---

## Exemplo Bom — o valor atravessa o pipeline inteiro

### Estado ANTES — o estilo está chumbado e invisível ao Engine

```tsx
<aside style={{ width: '260px', background: '#0a0a0b', borderRadius: '0px' }}>
    {children}
</aside>
```

**Problemas:** a largura é fixa e o Design Engine não a enxerga; o usuário não pode personalizá-la
pelo painel; e — o pior — a peça **não responde à troca de tema**, ficando parada enquanto o resto
muda. É o defeito mais caro de diagnosticar num Design System, porque nada quebra.

### Estado DEPOIS

**1. Schema** — `src/core/Design/schema/[dominio].ts`

```typescript
{
    id: 'sidebarWidth',
    label: 'Largura da Sidebar',
    type: 'slider',
    description: 'Largura da barra lateral do cromo, em pixels.',
    axis: 'density',
    unit: 'px',
    constraints: { min: 180, max: 400, step: 10 },
    defaultValue: 260,
    cssVars: ['--sarak-sidebar-width']
}
```

**2. Master Map** — o schema entra no array `components` de `src/core/Design/master-map.ts`.

**3. Roteamento + partição** — o `id` entra na coluna correspondente de
`catalog/theme_table_mapping.json` **e** na partição `catalog/partitions/<coluna>.json`.
Sem as três, o token é **inexistente**: o autor do tema preenche e nada acontece.

**4. Consumo — CSS de base, sempre com fallback**

```css
.sarak-sidebar {
    width: var(--sarak-sidebar-width, 260px);
    background: var(--sarak-sidebar-bg, #0a0a0b);
}
```

**5. Resultado**

- O token aparece no painel e o slider atualiza a preview em tempo real.
- Trocar o tema move a sidebar junto — que é o teste real de que o pipeline foi respeitado.
- Zero valor chumbado no componente.

---

## Exemplo Ruim — as violações que mais aparecem

### Violação 1: chave que não existe no dicionário

```typescript
// ⚠️ ERRADO
design: {
    surfaceMaterial: 'glass',   // ⚠️ não existe em nenhum schema
    glassOpacity: 0.8,          // ⚠️ não existe em nenhum schema
    borderRadius: 16            // ⚠️ o id real é 'cardBorderRadius'
}
```

**Por que é ruim:** `validateDesign` **descarta a chave desconhecida com `console.warn`** e ela
nunca chega ao CSS. O tema *parece* completo e não é. Antes de inventar chave, procure no
catálogo — os ids são camelCase e específicos.

---

### Violação 2: namespace proibido e consumo sem fallback

```tsx
// ⚠️ ERRADO
style={{ color: 'var(--sx-color-primary-base)' }}   // ⚠️ --sx-* é PROIBIDO: nunca foi emitido
style={{ gap: 'var(--sarak-layout-gap-md)' }}       // ⚠️ sem fallback

// ✅ CERTO
style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}
```

**Por que é ruim:** variável sem emissor resolve para **vazio** — o espaçamento colapsa, a cor
some, e o console fica limpo. É a falha mais barata de introduzir e a mais cara de achar. O
`auditor_ghostvars` cobra o emissor; o fallback é **conduta**, sem gate.

---

### Violação 3: Tailwind estrutural chumbado no átomo

```tsx
// ⚠️ ERRADO — geometria fora do controle do Engine
<div className="flex flex-col gap-4 p-4 grid-cols-3" />

// ✅ CERTO — geometria vinda do Hook Controlador
const { getFlexStyles } = useStructuralStyles();
<div {...getFlexStyles({ direction: 'column', gap: 'spacing-md' })} />
```

**Por que é ruim:** espaçamento, direção de flex e grid chumbados no `className` de um átomo são
**geometria que o banco de dados não governa**. O `auditor_hardcoded` reprova (balde DURO).

⚠️ **Mover a classe para uma `const` interpolada, para um `.ts` puro ou trocar espaço por `_`
para escapar do detector é fraude, não arquitetura.** O critério é o propósito, não o número.

---

### Violação 4: HTML nativo cru dentro de template

```tsx
// ⚠️ ERRADO
<button className="rounded bg-[var(--sarak-color-primary)]">Salvar</button>

// ✅ CERTO
<SarakButton variant="primary">Salvar</SarakButton>
```

**Por que é ruim:** HTML nativo cru causa **vazamento de especificidade** — o elemento fica preso
na variável global do preflight, ignora a paridade atômica e deixa de responder ao token que
deveria governá-lo. **Nenhum gate pega isto** (R10 é conduta); depende de revisão.

---

### Violação 5: lógica de roteamento de estilo dentro do JSX

```tsx
// ⚠️ ERRADO — decisão de design no componente burro
const bg = variant === 'neon' ? '#0af' : variant === 'glass' ? 'rgba(0,0,0,.4)' : '#111';
return <div style={{ background: bg }} />;
```

**Por que é ruim:** o átomo é **burro** por contrato. Todo `if`/`switch` de variante e toda
matemática de cor moram no **Hook Controlador** (`useAtomicStyles`, `useStructuralStyles`) — que,
por viver em `.ts`, é também o único lugar legítimo para um preset nomeado de geometria.

---

## Resumo

| # | Violação | Impacto | Cobrada por |
| --- | --- | --- | --- |
| 1 | Chave fora do dicionário | Descartada com warn; nunca chega ao CSS | `auditor_paridade` / `validateDesign` |
| 2 | `--sx-*` ou consumo sem fallback | Resolve para vazio, em silêncio | `auditor_ghostvars` (emissor) · fallback = conduta |
| 3 | Tailwind estrutural no átomo | Geometria fora do controle do Engine | `auditor_hardcoded` |
| 4 | HTML nativo cru | Vazamento de especificidade | **nenhum gate — conduta** |
| 5 | Roteamento de estilo no JSX | Átomo deixa de ser burro | **nenhum gate — conduta** |
