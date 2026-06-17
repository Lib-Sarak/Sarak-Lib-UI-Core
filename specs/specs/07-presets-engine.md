---
tipo: "spec"
titulo: "Presets Engine & Miniaturas Preview 2"
dominio: "Design Engine / Preview"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "presets", "preview"]
relacionados: []
---

# 1. Visão Geral
Atualmente, o Design Engine renderiza um "Mini Dashboard" estático (`PresetsCatalog.tsx`) na Preview 2. O objetivo desta funcionalidade é preparar o ecossistema Sarak UI Core para suportar uma Geração Autônoma de Temas via IA. Para isso, criaremos renderizadores de miniaturas independentes (Cards) permitindo que o usuário ou agentes apliquem *Presets* individuais para qualquer componente (Botões, Inputs, Tabelas, etc.), baseando-se em Schemas de design robustos.

# 2. Regras de Negócio
- **Enriquecimento de Schemas (Paridade):** Schemas simplificados como `inputs.ts`, `tables.ts` e `navigation.ts` devem ser expandidos para atingirem a mesma granularidade do `cards.ts`. Adição de atributos como desfoque (blur), níveis de sombra (neumorphism), texturas internas e cores de estado (erro/sucesso).
- **Banco de Presets Atômicos:** Criação de um diretório central exportando arrays JSON de presets para cada Schema (ex: um botão tipo "Cyberpunk", "Frosted Glass", "Minimal").
- **Miniaturas de Componentes Isolados:** A "Preview 2" receberá módulos atômicos de demonstração, como `<ButtonPresetPreview />` e `<InputPresetPreview />`. Cada miniatura renderizará exclusivamente o token selecionado (sem dependências de telas fixas), permitindo uma escolha limpa no catálogo.
- **Desacoplamento de Interface e IA:** O Agente de Geração de Temas baseará sua inferência apenas nos Schemas (`MASTER_DESIGN_MAP`), devolvendo JSON. O motor do catálogo interpretará e listará essas configurações sem fricções de UI.

# 3. Critérios de Aceite
- [ ] O schema `inputs.ts` e afins possuem propriedades avançadas capazes de gerar estéticas como Glassmorphism e Neumorphism.
- [ ] A aba/catálogo da Preview 2 possui visualizadores dinâmicos que exibem cards atômicos de Botões, Inputs e Navegação com os valores correspondentes injetados no renderizador.
- [ ] Ao clicar em um Preset, apenas as chaves relativas ao seu Schema são atualizadas no Rascunho (Draft) do Design Engine, sem apagar as outras propriedades já configuradas.

# 4. Plano de Testes (Quality Gate)
Mapeamento obrigatório das validações antes da entrega.

## Testes Unitários
- [ ] **Deve** garantir que a função de mesclagem (merge) do Preset substitui apenas as variáveis específicas do componente dentro do Draft ativo, isolando o estado global.
- [ ] **Deve** passar limpo pelo validador `scripts/verify_parity.ts` após a adição maciça dos novos tokens de propriedades (Skill `ui-novo-componente`).

## Testes de Contrato (API)
- [ ] *N/A* (Não há I/O de rede para o comportamento do Preview isolado).

## Testes E2E (Integração)
- [ ] Fluxo Feliz: Selecionar o filtro "Inputs" no catálogo, clicar em um preset "Glass", confirmar que o Canvas injetou o CSS e que o painel da Sidebar Master listou as chaves com os novos valores.
