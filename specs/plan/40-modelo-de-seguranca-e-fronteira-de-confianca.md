---
tipo: "spec"
titulo: "Modelo de Segurança e Fronteira de Confiança"
dominio: "Sarak-Lib-UI-Core (Transversal)"
status: "🟢 Implementada"
prioridade: "Alta"
tags: ["spec", "security", "xss", "trust-boundary", "transversal"]
relacionados: ["24-motor-de-data-binding-pipes", "26-motor-avaliacao-condicional", "15-expansao-midia-renderizadores", "30-contrato-importador-renderer"]
---

# 1. Visão Geral
O Manifest Renderer **executa JSON autorado por usuário ou IA** — um vetor de ataque óbvio. Hoje as defesas estão espalhadas (anti-XSS na 24, safe-eval na 26, sanitização na 15). Esta spec **consolida o modelo de ameaça** e define a **fronteira de confiança**: o que é responsabilidade da Sarak vs. do importador, evitando lacunas de segurança por suposição.

# 2. Regras de Negócio
- **Regra 1 — Fronteira de Confiança Explícita:** A Sarak trata o `payload` (manifesto) e o `dataStore` como **não confiáveis** por padrão. Já os interceptadores (`networkInterceptor`/`routerInterceptor`) e a autenticação são **responsabilidade do importador** — a Sarak nunca embute segredos nem chama rede direta.
- **Regra 2 — Sanitização Centralizada:** Toda renderização de HTML/Markdown passa por um único sanitizador (reuso da Spec 15); proibido `dangerouslySetInnerHTML` fora desse canal.
- **Regra 3 — Avaliação Sem `eval`:** Reafirma o Safe Evaluator (Spec 26): nenhum acesso a `window`/`document`/globais; expressões fora da gramática falham fechado (retorno falso/seguro).
- **Regra 4 — Diretivas como Superfície de Ataque:** `source` (Spec 31) e `actions` (Spec 25) só interpolam dados em URLs/bodies via canal tipado e escapado; nunca concatenam strings cruas executáveis.
- **Regra 5 — Limites e DoS:** Profundidade máxima de aninhamento e teto de itens em `renderFor` (Spec 23) para impedir manifests maliciosos que travam o navegador.

# 3. Critérios de Aceite
- [x] Um manifesto com `javascript:`/`<script>` em texto e em Markdown é neutralizado em todos os canais. *(Texto auto-escapado pelo React; canal único `sanitizeHtml`/DOMPurify pronto para o `SarakMarkdownRenderer` da Spec 15.)*
- [x] Condicional com acesso a `window` falha fechado, sem execução.
- [x] A documentação deixa explícito o que o importador DEVE prover (auth, interceptors) — sem suposição implícita (Spec 08 §6).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** neutralizar payloads de XSS em texto, Markdown e atributos. *(`Security/__tests__/sanitizeHtml.test.ts`)*
- [x] **Deve** rejeitar expressões condicionais que tocam globais. *(`Security/__tests__/trustBoundary.test.tsx`)*

## Testes de Contrato (API)
- [x] **Deve** documentar e tipar a fronteira (quais callbacks são obrigatórios do importador). *(tipos em `SarakManifestRenderer` + doc na Spec 08 §6.)*

## Testes E2E (Integração)
- [x] Forjar um manifesto hostil e confirmar que nenhuma execução não autorizada ocorre, com a UI permanecendo estável. *(`trustBoundary.test.tsx`: condicional fail-closed + teto `renderFor` + corte de profundidade.)*

# 5. Status de Implementação (Onda 6)
- **Canal de sanitização:** `src/core/Manifest/Security/sanitizeHtml.ts` (DOMPurify v3; fallback fail-closed em SSR). Único canal autorizado a produzir HTML — exceção documentada: `<style>` de `responsiveCSS` do `DesignScope` (CSS da engine, não conteúdo externo).
- **Limites anti-DoS:** `MAX_NESTING_DEPTH=100` (`nodes/context.ts` + `ManifestNodeRenderer`) e `MAX_RENDERFOR_ITEMS=10000` (`RenderFor/expandRenderFor.ts`).
- **Safe-eval reafirmado:** `Conditional/` (Spec 26) já falha fechado; coberto por teste adversarial explícito.
- **Fronteira documentada:** `specs/specs/08-consumo-externo-e-integracao.md` §6 (o que a Sarak garante × o que o importador DEVE prover).
