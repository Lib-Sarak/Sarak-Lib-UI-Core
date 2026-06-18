# Especificação Arquitetural: Erradicação de 'any'

Este documento define o padrão obrigatório para a remoção das 545 violações da tipagem `any` no módulo Sarak UI Core, elevando a base ao Nível 2 de Clean Code (TypeScript Strict).

## Regras de Ouro para a Refatoração

### 1. Tipos Concretos (Domain Interfaces) devem ser a 1ª Opção
Sempre que possível, o `any` deve ser substituído pela interface de domínio correspondente que já existe na biblioteca (ex: dentro de `src/shared/types` ou nos arquivos de Schema do Design Engine).
- **Incorreto:** `(config: any) => void`
- **Correto:** `(config: ThemePresetConfig) => void`
- **Componentes:** Se for React, props genéricas recebem tipos exatos (ex: `HTMLAttributes<HTMLDivElement>`, `ReactNode`, `MouseEvent`).

### 2. O uso de `unknown` é para Boundaries de I/O Externo
Quando o dado vier de uma API externa (fetch) ou localStorage onde não temos garantia real em tempo de compilação, o tipo inicial deve ser `unknown`, seguido obrigatoriamente por um Type Guard em tempo de execução.
```typescript
// Correto:
const payload: unknown = await response.json();
if (isThemePayload(payload)) {
   return payload.data;
}
```

### 3. Generics (`<T>`) Apenas para Utilitários Polimórficos
O uso de Generics deve ser reservado para utilitários puros (como debounce, wrappers, clones profundos, etc) que efetivamente funcionam independentemente da estrutura de dados que passam por eles. 

### 4. NUNCA utilizar `as any` ou `@ts-ignore`
O uso de `as any` ou comentários de supressão para burlar o compilador TS é estritamente proibido. Se uma tipagem complexa do React ou do DOM for exigida, ela deve ser devidamente inferida a partir dos módulos oficiais (`React.FC`, `React.ChangeEvent`, etc).

## Estratégia de Execução
A eliminação deve ocorrer módulo a módulo (ex: `src/features/DesignEngine/Main` primeiro), para garantir que as interfaces concretas que alimentam o restante da árvore estejam solidificadas na base antes de subirem pela hierarquia de componentes.
