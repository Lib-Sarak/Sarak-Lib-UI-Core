---
tipo: "adr"
titulo: "Título Curto e Direto (Ex: Escolha do PostgreSQL)"
status: "Proposto" # Opções: Proposto, 🟢 Aceito, Rejeitado, 🔴 Substituído
tags: ["adr"]
relacionados: []
substitui: ""      # Ex: [[001-escolha-mysql]]
substituido_por: ""
alternativas_consideradas:
  - opcao: "Alternativa real preterida nº 1 (Ex: manter a arquitetura anterior)"
    custo: "O que essa opção custaria — o problema que ela deixaria sem resposta"
  - opcao: "Alternativa real preterida nº 2 (Ex: outra solução cogitada de fato)"
    custo: "O que essa opção custaria, e por que pesou mais que a escolhida"
---

> **Molde de ADR.** Critério de `00-prompt-revisor.md` §5.2: só é ADR quem tem **duas alternativas
> reais**, cada uma com um **custo nomeado**, e para quem voltar atrás seria caro. Sem preencher
> `alternativas_consideradas` com duas entradas e o custo de cada, não houve trade-off — não é ADR, é
> decisão óbvia (biblioteca evidente, convenção já existente, bug corrigido, refactor), e o destino dela
> é outro.

# 1. Contexto e Problema
Qual era a situação que nos forçou a tomar essa decisão?

# 2. Decisão
O que decidimos fazer de fato?

# 3. Consequências
- **Positivas:** ...
- **Negativas (Trade-offs):** ...
