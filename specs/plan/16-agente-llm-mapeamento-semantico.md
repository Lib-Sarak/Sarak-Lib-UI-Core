---
tipo: "spec"
titulo: "Agente LLM: Mapeamento Semântico para o Catálogo (Dicionário de Intenção)"
dominio: "Design Engine (Sarak UI Core)"
status: "🟡 Em Planejamento"
prioridade: "Alta"
tags: ["spec", "ai-agent", "semantic", "data-driven"]
---

# 1. Visão Geral
Esta spec define a evolução do Catálogo de Design da Sarak-Lib-UI-Core para suportar o entendimento semântico por parte do Agente LLM (Design Operator). Atualmente, os JSONs do catálogo fornecem apenas as chaves (ex: `--sx-color-base`) e tipos permitidos, mas carecem do contexto de "Quando" ou "Por que" usar cada chave.

# 2. O Problema
O Agente LLM precisa traduzir sentimentos e requisitos humanos ("Quero uma interface arejada e noturna") para uma árvore de propriedades estruturais (`cardLayoutDirection`, variáveis de espaçamento, etc.). Sem uma documentação semântica acoplada, o LLM não saberá relacionar os adjetivos às propriedades corretas de maneira autônoma e precisa.

# 3. A Solução Proposta
Anotar as partições JSON do catálogo com metadados semânticos ou criar um dicionário semântico consolidado que seja exportado junto com o `master_design_map`. 
- Adição de uma chave conceitual (ex: `semanticUsage: string`) em tokens ou propriedades complexas.
- Agrupamento de tokens por "Tags de Atmosfera" (ex: `airy`, `compact`, `modern`, `corporate`).

# 4. Critérios de Aceite
- [ ] Definir arquiteturalmente se a semântica residirá diretamente nas partições JSON (`src/core/Design/catalog/partitions/`) ou em um arquivo derivado independente (`semantic_dictionary.json`).
- [ ] Mapear e documentar o contexto semântico das propriedades estruturais críticas (grids, paddings globais e direção de layout).
- [ ] O Agente de Design (em seu serviço TypeScript) deve ser capaz de consumir este dicionário dinamicamente em seu momento de Boot para compor seu RAG semântico.
