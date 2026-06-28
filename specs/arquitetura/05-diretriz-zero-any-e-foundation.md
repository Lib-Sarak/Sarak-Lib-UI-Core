---
tipo: "arquitetura"
titulo: "Diretriz Arquitetural: Zero Any e Foundation Design State"
dominio: "Core / Typescript"
status: "🟢 Consolidado"
prioridade: "Máxima"
tags: ["arquitetura", "any", "type-safety", "foundation"]
relacionados: ["00-manifesto-arquitetural-ui-core"]
---

# 1. Visão Geral
Este documento atua como o registro definitivo das leis de tipagem do sistema, gerado a partir da bem-sucedida "Campanha de Erradicação do Any". O objetivo é garantir que o motor declarativo permaneça estritamente tipado (Zero `any`), oferecendo segurança máxima no runtime e no fluxo de design tokens.

# 2. Regras de Negócio (A Lei do Zero Any)
1. **Ausência Absoluta:** É terminantemente proibido introduzir `any`, `Record<string, unknown>` disfarçado ou mascarar tipos no ecossistema Sarak UI Core. O `SarakThemePayload` é um domínio fechado e sua interface dita a realidade do layout.
2. **Substituição de Tipos Dinâmicos:** Se houver necessidade de fronteira dinâmica, as abordagens permitidas (em ordem) são:
   - Tipo/Interface próprio (estrito).
   - Genéricos (`<T>`) limitados se a função for comprovadamente paramétrica.
   - `unknown` + narrowing (*Type Guards*).
3. **Sem Afrouxamento:** É proibido ignorar erros via `// @ts-ignore`. O uso de `@ts-expect-error` só é permitido com documentação para contratos externos inevitáveis.
4. **Comportamento Intacto:** Toda alteração de tipagem em componentes já estabelecidos deve manter o comportamento idêntico no runtime.

# 3. Foundation Design State
A arquitetura resolveu o problema de mapeamento universal através de um estado base conhecido como **Foundation Design State** (`SarakDesignState`). 
Ele elimina a necessidade de `design: any` cascateando pela árvore. 
- A fundação tipada irradia segurança desde a camada Provider (o núcleo `core/`) para todos os consumidores (`features/` e `components/`).
- Os pacotes injetados no DesignScope (variáveis atômicas) operam com `SarakTokenValue`, não com `unknown`.

# 4. Plano de Testes
## Testes Unitários
- [x] O `auditor_typescript.mjs` da skill de auditoria garante 0 quebras (0 `any` detectados).
## Contrato/API
- [x] A compilação `npx tsc --noEmit` falha o build do pipeline caso novas quebras sejam adicionadas.
## E2E
- *N/A* (Mudança puramente na árvore de compilação estática TypeScript).
