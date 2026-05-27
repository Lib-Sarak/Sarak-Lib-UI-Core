# Regras e Limites — Design Engine Data-Driven

O que **NÃO** fazer ao trabalhar com o Design Engine:

---

### 1. NÃO crie propriedades visuais fora do Schema
Todo atributo visual configurável DEVE ter um token correspondente em `src/core/Design/schema/`. Se uma propriedade visual existe apenas como CSS hardcoded em um `.tsx` ou `.css`, ela não é governável pelo sistema e viola a arquitetura data-driven. A consequência é que essa propriedade será invisível no painel de personalização e imune a presets.

### 2. NÃO crie presets fora de `core/Design/presets/`
O diretório `src/constants/` NÃO é local para presets de design. O diretório `src/features/DesignEngine/Canvas/Galleries/presets/` NÃO é local para presets de design. A fonte única de verdade para presets é `src/core/Design/presets/{subcategoria}/`. Presets em outros locais criam fontes duplicadas e divergências de chaves.

### 3. NÃO use chaves no preset que não existam no Schema
Cada chave dentro do objeto `design` de um preset DEVE corresponder a um `token.id` existente no Schema da subcategoria. Chaves inventadas (ex: `glassOpacity`, `borderRadius` genérico, `surfaceMaterial`) são silenciosamente ignoradas pelo `useDesignVariables` e nunca chegam ao CSS. Use sempre o `token.id` com prefixo do componente (ex: `cardBorderRadius`, `cardSurfaceOpacity`).

### 4. NÃO aplique variáveis CSS diretamente ao sistema sem passar pelo Draft
O fluxo de aplicação é inegociável: Controle → `updateDraft()` → `draftState` → Preview → `handleApplyToSystem()` → Sistema. Nunca chame `applyFullConfigRaw()` diretamente de um controle ou galeria. O usuário DEVE ver o resultado na Preview antes de comprometê-lo ao sistema real.

### 5. NÃO duplique a injeção de variáveis CSS em Galerias/Specimens
O `DesignScope` é a ÚNICA camada de injeção de CSS Variables no DOM. Nunca combine `DesignScope` + `style={variables}` inline no mesmo elemento ou hierarquia. Essa duplicação causa conflitos de cascata CSS e discrepâncias entre preview e sistema real.

### 6. NÃO use `getDefaultDesignState()` como base para merge de Specimens
Ao renderizar specimens na Galeria, faça merge com o estado real do sistema (`globalTokens` / `tokens` passados como props), não com defaults estáticos. Defaults estáticos mostram um cenário impossível de replicar no sistema real, causando expectativas falsas no usuário.

### 7. NÃO contamine chaves de outras subcategorias ao aplicar um preset
Ao aplicar um preset de cards, persista o identificador com `cardPresetId` — nunca sobrescreva `layout`, `typographyPresetId` ou outras chaves de namespace diferente. Cada subcategoria DEVE ter sua chave de persistência isolada com prefixo do componente.

### 8. NÃO saia do escopo desta skill
Se ao trabalhar num componente do Design Engine você detectar problemas de performance, considere acionar a skill `otimizacao-nivel-1`. Se detectar código morto ou arquivos órfãos, considere acionar a skill `code-project-cleanup`. Esta skill trata exclusivamente da integridade data-driven do pipeline de design.

### 9. NÃO embarque conversores de mídia pesados
A lei do CSS Variables aplica-se perfeitamente às mídias (onde injetamos `var(--sarak-bg-image)` contendo a `url(...)`). Porém, não embarque lógicas pesadas de compressão de vídeo na UI. A Sarak UI mantém a agnostia de infraestrutura utilizando o Callback de Injeção de Dependência (`onMediaUpload`). Mídias sem o callback (Offline) são limitadas a 2MB convertidas em Base64 para proteger a integridade do banco.
