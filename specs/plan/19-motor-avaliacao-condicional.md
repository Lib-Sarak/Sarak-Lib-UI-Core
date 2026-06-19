---
tipo: "spec"
titulo: "Motor de Avaliação Condicional"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "logic", "conditions", "security"]
relacionados: []
---

# 1. Visão Geral
Este componente permite que a UI reaja e esconda pedaços inteiros de layout (condicionais IF/ELSE) dependendo de regras do negócio declaradas como strings lógicas dentro do JSON (propriedades `renderIf` e `disabledIf`).

# 2. Regras de Negócio
- **Regra 1: Safe Evaluation (Sem `eval()` nativo):** Sob NENHUMA hipótese a biblioteca Sarak usará a função nativa `eval()` do JavaScript para ler a condicional, pois isso seria uma falha gigantesca de segurança (XSS/RCE). O motor utilizará um Avaliador de Expressões Seguro (ex: biblioteca `jsep` ou avaliador customizado puro).
- **Regra 2: Supressão Absoluta no DOM:** Se `renderIf` retornar Falso, o componente React deve retornar `null`, garantindo que o nó HTML sequer seja montado na árvore. (Diferente do `disabledIf`, que apenas bloqueia ações e adiciona opacidade).
- **Regra 3: Operadores Suportados:** O Avaliador deve suportar lógicas básicas completas: E (`&&`), OU (`||`), igualdade (`===`), maior/menor (`>`), e o modificador de negação (`!`).
- **Regra 4: Fallback Fail-Safe:** Se a expressão condicional no JSON for escrita com erros de sintaxe (Ex: `renderIf: "{{user}} ==== 2"`), o motor falhará de forma passiva, logando no console e assumindo retorno *Falso* (Segurança por Default).

# 3. Critérios de Aceite
- [ ] A string `"{{role}} === 'ADMIN' && {{age}} > 18"` é interpretada corretamente sem usar `eval`.
- [ ] A negação `"!{{isLoggedIn}}"` esconde um painel se a variável for Verdadeira.
- [ ] Tentar usar injeção de código `renderIf: "window.location = 'malicious'"` não causa execução global, falhando a verificação.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** avaliar strings lógicas complexas com múltiplos operadores Booleanos e matemáticos e devolver `true` ou `false` com precisão.
- [ ] **Deve** interceptar qualquer função desconhecida ou objeto global (`window`, `document`) e devolver um erro restrito do Avaliador.

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Fluxo Visual: Inspecionar o DOM e garantir que um elemento com `renderIf: "false"` não existe na árvore HTML escondido como `display: none`, e sim verdadeiramente ausente.
