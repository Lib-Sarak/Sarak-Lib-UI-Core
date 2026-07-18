---
tipo: "spec"
titulo: "Resiliência Leniente por Diretiva e DX de Erros do Renderer"
dominio: "Manifest Engine / Error Boundary / DX"
status: "🟢 Concluída"
prioridade: "Máxima"
tags: ["spec", "manifest", "error-boundary", "dx", "resiliencia"]
relacionados: ["11-engine-declarativa-e-manifestos", "12-modelo-de-seguranca-e-acessibilidade"]
---

# 1. Visão Geral e Descrição do Problema

Dois comportamentos do motor punem erros de AUTORIA como se fossem falhas de runtime, produzindo o efeito "aba vazia" relatado em testes reais de consumidores:

1. **Diretiva malformada derruba o container inteiro.** Ex.: `"actions": { "onClick": [...] }` (objeto em vez de array). A validação da raiz (`validateManifestRoot`) só confere chaves desconhecidas — não o FORMATO das diretivas. O erro estoura em runtime (`deriveRate`/`runActions` iteram `actions` em `src/core/Manifest/nodes/LeafNode.tsx`), o Error Boundary do nó captura, e se o nó culpado é o container da rota, a tela inteira vira o cartão de erro. Autoria errada ≠ crash: deveria degradar.
2. **Erro de payload raiz é opaco e enganoso.** `payload` ausente/malformado renderiza `SarakFallback` com `type="ManifestoInvalido"` → a tela mostra "Componente desconhecido: ManifestoInvalido (id: Nó inválido em root: esperado objeto, recebido undefined)" (`src/core/Manifest/SarakManifestRenderer.tsx`, ~linha 96-105 + `src/core/Manifest/Registry/Fallback.tsx`). O desenvolvedor acha que falta um componente chamado "ManifestoInvalido".

# 2. Regras de Negócio (Solução)

## 2.1 Matriz de severidade (contrato novo do motor)
| Classe | Exemplos | Comportamento |
|---|---|---|
| **Erro de diretiva (autoria)** | `actions` não-array; `model` sem `path`; `validation` não-array; `payload.params` com tipo absurdo | **Degrada**: a diretiva é IGNORADA, o nó renderiza normalmente, `console.warn` estruturado: `[Sarak:Manifest] nó "<id|path>": diretiva "actions" inválida (esperado array, recebido object). Diretiva ignorada. Ex. correto: "actions": [{...}]` |
| **Erro estrutural do nó** | `type` ausente/desconhecido; `children` não-array | Fallback VISÍVEL do nó (comportamento atual — manter) |
| **Erro real de runtime** | exceção dentro de um átomo/handler | Error Boundary do nó (comportamento atual — manter) |

- Implementação sugerida: função pura `sanitizeDirectives(node): { node, warnings[] }` chamada no início do `LeafNode`/pipeline (`src/core/Manifest/nodes/renderNode.tsx`), normalizando cada diretiva reservada para o formato esperado ou removendo-a com warning. Fonte da verdade dos formatos: `src/core/Manifest/directives.ts` + tipos de `types.ts`.
- Os warnings devem ser deduplicados por nó (não spammar a cada re-render — cache por `path` em `Set` de módulo ou ref).

## 2.2 Telas DX do Renderer (raiz)
- `payload === undefined/null` → tela dedicada: título "Manifesto não fornecido", texto "Passe a prop `payload` ao `<SarakManifestRenderer>`. Comece pelo template: `templates/app-starter.manifest.json`.".
- Payload inválido → tela dedicada "Manifesto inválido" listando TODOS os `ManifestValidationError` (path + mensagem), não só o primeiro; visual legível (não o Fallback de type desconhecido).
- Criar componente próprio (ex.: `src/core/Manifest/Registry/InvalidManifestScreen.tsx`) — NÃO reutilizar `SarakFallback` (que é semanticamente "type desconhecido").
- Em produção (`process.env.NODE_ENV === 'production'`), a tela pode ser mais sóbria, mas nunca em branco.

## 2.3 Escopo negativo (não fazer)
- NÃO afrouxar a segurança (Safe Eval, sanitizeHtml, limites anti-DoS ficam intactos).
- NÃO silenciar erro de runtime real — só reclassificar erro de AUTORIA de diretiva.

# 3. Critérios de Aceite
- [x] `"actions"` como objeto: o botão renderiza (sem ação), warn claro no console com exemplo correto — a tela NÃO cai.
- [x] `model` sem `path` / `validation` não-array: idem (diretiva ignorada + warn).
- [x] `payload` ausente: tela "Manifesto não fornecido" com instrução do template.
- [x] Payload malformado: tela lista todos os erros com paths.
- [x] Nenhuma regressão nas suítes de `src/core/Manifest/` (233/233 verdes, incl. Resilience.integration, ErrorBoundary, validateNode, RegistryParity).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] `sanitizeDirectives`: cada diretiva malformada → removida + warning; diretivas válidas → intactas; nó sem diretivas → intacto. (`src/core/Manifest/nodes/__tests__/sanitizeDirectives.test.ts`)
- [x] Dedup de warnings por nó (2 renders → 1 warn). (`emitDirectiveWarnings` — mesmo arquivo)
## Integração
- [x] Manifesto com `actions` objeto num botão dentro de uma rota: a rota renderiza os irmãos e o botão; sem cartão de erro. (`Resilience.integration.test.tsx` — Spec 17)
- [x] Renderer sem payload / com payload string inválida → telas DX corretas (texto assertável). (`Resilience.integration.test.tsx` + `Registry/__tests__/InvalidManifestScreen.test.tsx`)
## E2E
- [x] Coberto pelo caso de integração: 1 nó de ação malformada → tela utilizável + warn; a diretiva volta a funcionar quando o JSON é corrigido (nó re-higienizado a cada render, sem estado especial).
