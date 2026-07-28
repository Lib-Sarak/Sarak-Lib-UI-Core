---
tipo: "adr"
titulo: "Remoção do Design Agent (agente LLM embarcado)"
status: "🟢 Aceito"
tags: ["adr", "remocao", "design-agent", "escopo", "breaking-change"]
relacionados: ["[[001-tres-arquiteturas]]", "[[003-remocao-backend-proprio]]"]
substitui: ""
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-07-19.**

O Design Agent era um agente LLM que gerava e ajustava temas por linguagem natural. Ele violava o princípio da lib — *declara contratos, não embarca infraestrutura* — em duas frentes distintas:

**Como módulo embarcado:** `agent-design-operator/` era um microsserviço Node completo vivendo **dentro** do repositório da biblioteca — cerca de 131 arquivos, com provider de LLM, banco de histórico de conversas e prompts. Nada disso tem a ver com renderizar interface, e tudo isso inflava o repositório e a manutenção.

**Como superfície de produto:** o painel do Design Engine montava um card de chat, e o Provider expunha `options.designAgent.sendPrompt` como **contrato público**, junto de quatro tipos exportados no barril. Autoria assistida por IA tinha virado parte da API da biblioteca de componentes.

Havia ainda persistência órfã carregada junto: tabelas de conversas e artefatos do agente nos schemas do backend, que existiam só para ele.

# 2. Decisão

**Remover o Design Agent da biblioteca — o módulo embarcado e toda a superfície pública.** A capacidade "gerar tema por IA" pode existir como produto **externo**, num repositório próprio, consumindo os mesmos artefatos públicos da lib. Deixa de ser responsabilidade deste módulo.

Duas decisões acompanharam a remoção, ambas tomadas com o dono no momento da execução:

- **Destino do código:** apagar, sem extrair para repositório próprio. O histórico permanece no git da lib.
- **Porta genérica "traga seu agente":** **não manter.** Remover 100% em vez de deixar uma porta especulativa. Se a demanda voltar, uma spec futura desenha a porta do zero — alinhada à linguagem de portas que o resto da lib usa. Porta sem consumidor é código morto com nome bonito.

## Prova do estado atual

```
$ git ls-files agent-design-operator | wc -l
0

$ grep -rEn "designAgent|DesignAgentChatCard|agent-design-operator" src/
src/core/Design/schema/engineering.ts:35:  ... (texto de JSDoc)
src/core/Design/schema/layers.ts:37:      ... (texto de JSDoc)
```

**Nenhum arquivo do agente é rastreado pelo git**, e não há uma linha de código que o referencie. As duas ocorrências restantes em `src/` são **texto de descrição** dentro de dois schemas de token: elas mencionam o `agent-design-operator` ao documentar qual de dois tokens homônimos é efetivamente preenchido. São comentários desatualizados, não acoplamento — mas continuam apontando para algo que não existe, e estão registrados como dívida.

> **Nota de ambiente, não de repositório:** o diretório `agent-design-operator/` ainda aparece no disco de trabalho local contendo **exclusivamente** um `node_modules/` residual da época em que o microsserviço existia. Nada disso é rastreado, empacotado ou referenciado. É lixo de working tree, não código sobrevivente.

# 3. Consequências

- **Positivas:**
  - A biblioteca volta a ter uma responsabilidade só. Provider de LLM, prompts e histórico de conversa deixam de ser problema de quem mantém componentes.
  - O repositório encolhe em ordem de grandeza — cerca de 131 arquivos mais um `node_modules` próprio.
  - A superfície pública fica menor e mais defensável: quatro tipos e um campo de `options` a menos para versionar e manter compatíveis.
  - Nenhuma tela quebrou. O painel simplesmente deixou de exibir o card de chat — sem *fetch* órfão, sem estado pendurado.

- **Negativas (Trade-offs):**
  - **BREAKING CHANGE:** o `Sarak-MyService` injetava `options.designAgent.sendPrompt`. A correção é no repositório dele.
  - **Capacidade perdida sem substituto.** Não há porta, não há adaptador, não há caminho de migração dentro da lib. Quem quiser a funcionalidade reconstrói fora.
  - **Trabalho de planejamento cancelado em bloco.** Um sub-plano inteiro de specs que evoluía o agente foi cancelado. Um detalhe registrado na execução: a maior parte desses arquivos **já havia sido apagada por acidente**, num commit anterior e não relacionado, antes mesmo desta decisão ser escrita — só um deles sobrou para ser formalmente marcado como cancelado.
  - **Dívida de texto sobreviveu à remoção.** As duas descrições de token citadas acima seguem mencionando o agente. É a mesma classe de defeito que apareceu depois em outros lugares: **remover código não remove a prosa que fala dele**, e prosa é superfície pública quando o catálogo é gerado por AST.
