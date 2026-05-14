# Guia de Expansão e Modificação: Sarak Design Engine (v13.0)

Este documento descreve como inserir, modificar ou expandir a granularidade dos componentes no ecossistema **Sarak UI Core**. O sistema é 100% orientado a dados (**Data-Driven**), o que significa que mudanças visuais devem começar na definição dos schemas.

---

## 1. A Arquitetura "Fonte da Verdade"

O design não é definido no CSS, mas em objetos TypeScript chamados **Schemas**. O fluxo de modificação segue esta ordem obrigatória:

1.  **Schema (`src/core/Design/schema/*.ts`)**: Define o token, seu tipo e a variável CSS vinculada.
2.  **Master Map (`src/core/Design/master-map.ts`)**: Registra o schema no catálogo global.
3.  **CSS Core (`src/styles/*.css`)**: Consome a variável CSS definida no schema.

---

## 2. Como Adicionar um Novo Token

Para adicionar um novo controle (ex: "Opacidade do Ícone"), localize o schema correspondente ou crie um novo.

### Exemplo de Definição de Token:
```typescript
{
    id: 'iconOpacity',              // ID único para persistência
    label: 'Opacidade dos Ícones',   // Rótulo exibido na interface (UI)
    category: 'Ícones: Estética',    // Agrupamento dentro do pilar
    type: 'slider',                 // Tipo de controle (slider, color, select, text)
    constraints: { min: 0, max: 1, step: 0.1 }, // Limites para o slider
    defaultValue: 0.8,              // Valor inicial de fábrica
    cssVars: ['--sarak-icon-op']     // Variável(is) CSS que este token controla
}
```

### Tipos de Controles Suportados:
- `slider`: Para valores numéricos (opacidade, arredondamento, tamanhos).
- `color`: Para seletores de cores hex/rgba.
- `select`: Para opções pré-definidas (ex: estilos de borda).
- `text`: Para valores complexos como curvas bezier ou strings CSS.

---

## 3. Vinculando ao CSS (O Lado Consumidor)

Após definir o token e sua `cssVar`, você deve garantir que o CSS do componente utilize essa variável.

**Em `_theme.css` ou no arquivo específico do componente:**
```css
.sarak-icon {
    opacity: var(--sarak-icon-op, 0.8); /* O segundo valor é o fallback */
}
```

---

## 4. Criando um Novo Pilar (Novo Schema)

Se você estiver criando uma categoria inteiramente nova (ex: `forms.ts`):

1.  Crie o arquivo em `src/core/Design/schema/forms.ts`.
2.  Defina o objeto `export const FormsSchema: ComponentSchema = { ... }`.
3.  Importe e adicione ao array `components` em `src/core/Design/master-map.ts`.

---

## 5. Regras de Ouro para Granularidade Máxima

- **Evite herança implícita**: Se o H1 e o H2 podem ter pesos diferentes, crie tokens separados (`h1Weight` e `h2Weight`).
- **Nomenclatura Semântica**: Use prefixos `--sarak-` para variáveis que o Design Engine controla.
- **Fallbacks Seguros**: Sempre forneça um valor padrão no CSS `var(--variavel, fallback)` para evitar que a interface quebre caso o token não seja carregado.

---

> [!IMPORTANT]
> Nunca modifique o CSS diretamente com valores fixos (hardcoded). Se um valor precisa ser alterado, ele deve ser transformado em um Token no Schema primeiro.
