---
tipo: "spec"
titulo: "Modelo de Segurança e Fronteira de Confiança"
dominio: "Sarak-Lib-UI-Core (Transversal)"
status: "🔴 A Implementar"
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
- [ ] Um manifesto com `javascript:`/`<script>` em texto e em Markdown é neutralizado em todos os canais.
- [ ] Condicional com acesso a `window` falha fechado, sem execução.
- [ ] A documentação deixa explícito o que o importador DEVE prover (auth, interceptors) — sem suposição implícita.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** neutralizar payloads de XSS em texto, Markdown e atributos.
- [ ] **Deve** rejeitar expressões condicionais que tocam globais.

## Testes de Contrato (API)
- [ ] **Deve** documentar e tipar a fronteira (quais callbacks são obrigatórios do importador).

## Testes E2E (Integração)
- [ ] Forjar um manifesto hostil e confirmar que nenhuma execução não autorizada ocorre, com a UI permanecendo estável.
