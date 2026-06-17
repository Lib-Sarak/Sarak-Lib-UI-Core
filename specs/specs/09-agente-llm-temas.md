---
tipo: "spec"
titulo: "Agente LLM: Operador de Design e Temas no Banco de Dados"
dominio: "Design Engine (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "ai-agent", "design-system", "data-driven", "database-only"]
relacionados: ["03-padrao-biblioteca-atomica", "05-paridade-cinco-camadas", "08-taxonomia-componentes"]
---

# 1. Visão Geral
Esta spec define a arquitetura e os limites de atuação do Agente LLM focado em Design e Layout. O objetivo do agente é atuar puramente como um "Operador de Dados de Banco" que traduz requisições de linguagem natural do usuário ("quero um layout horizontal estilo site X", "crie um botão neon") em **Registros (Payloads JSON) na Tabela de Temas do Banco de Dados**. Este payload controla não apenas os tokens visuais (estética), mas também os **Tokens Estruturais** (variações de HTML e posicionamento suportadas pelos componentes). O Agente **NUNCA** interage com o código-fonte da aplicação.

# 2. Regras de Negócio
- **Regra 1: Isolamento do Código-Fonte (No Code/Filesystem Touch).** O agente é expressamente proibido de alterar, ler, criar ou modificar qualquer arquivo do repositório (seja `.ts`, `.tsx`, `.css` ou `.json`). Ele NÃO escreve presets no código.
- **Regra 2: Atuação 100% via Banco de Dados.** Tudo o que o agente cria (temas, novos estilos de componentes, presets dinâmicos) é salvo **exclusivamente na tabela de temas no banco de dados**. Quando o usuário aplica um tema gerado pela IA, a aplicação apenas puxa esse registro do banco.
- **Regra 3: Catálogo Estrito como Dicionário.** Para compreender o que pode ser customizado, o agente utilizará estritamente o catálogo compilado da biblioteca. O agente fará a leitura da pasta `src/core/Design/catalog/partitions/*.json` para mapear mentalmente os tokens, restrições e `defaultValues` disponíveis. Ele **só pode gerar payloads preenchendo valores de tokens que já existem** nestes arquivos.
- **Regra 4: Proibição de Invenção de Chaves.** O agente não pode criar novas variáveis (`--sx-nova-variavel-invisivel`), nem inventar chaves fora do catálogo. Sua inteligência reside apenas em combinar e preencher os valores das chaves existentes para formar resultados visuais complexos.
- **Regra 5: Manipulação Estrutural (Data-Driven Layout).** Além de regras estéticas, a capacidade do agente de alterar o arranjo dos itens na tela dependerá de **Tokens Estruturais** cadastrados no Catálogo (ex: `cardLayoutDirection`, `imagePosition`). Os componentes base do front-end são os responsáveis por ler essas props estruturais geradas pelo agente e rearranjar seu HTML interno dinamicamente.

# 3. Critérios de Aceite
- [ ] O Agente recebe uma requisição abstrata do usuário e retorna um JSON contendo estritamente chaves de tokens válidos e seus respectivos valores preenchidos.
- [ ] O sistema armazena a saída gerada pelo Agente direto no banco de dados na `tabela de temas` ou tabela específica do agente.
- [ ] O Agente não exige nem executa nenhum commit, PR, ou alteração de arquivo local no projeto.
- [ ] Tentativas do agente de fornecer chaves ou propriedades não cadastradas no sistema são interceptadas e descartadas pelo validador antes de ir ao banco.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** garantir que a camada de persistência da resposta do Agente valide todas as chaves do JSON contra a tabela de mapeamento permitida. Caso o agente invente propriedades, elas devem ser expurgadas antes do `INSERT`.

## Testes de Contrato (API)
- [ ] **Endpoint** de comunicação LLM <-> Sarak Backend: Deve receber o `ThemePayload` e persistir em banco com integridade relacional.

## Testes E2E (Integração)
- [ ] Fluxo feliz: O usuário digita "Mude a interface para parecer com o Github Dark" -> Agente deduz os valores dos tokens baseado na entrada -> Backend salva o JSON retornado na Tabela de Temas do usuário -> O frontend busca esse registro do DB via API e renderiza as mudanças instantaneamente.
