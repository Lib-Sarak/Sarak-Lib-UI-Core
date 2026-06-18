---
tipo: "arquitetura"
titulo: "Arquitetura dos Motores Especiais (Super Componentes)"
dominio: "Core / Engines"
status: "🟢 Vigente"
tags: ["arquitetura", "engines", "charts", "chat", "flows"]
relacionados: ["01-arquitetura-motor-tema-design-engine"]
---

# 1. Propósito
Além dos componentes atômicos tradicionais (botões, inputs), a Sarak UI Core abriga "Super Componentes" que encapsulam alta complexidade lógica e visual. O objetivo arquitetural dos Motores Especiais (Engines) é agir como wrappers de abstração massiva sobre bibliotecas pesadas de terceiros (como ECharts, React Flow), garantindo que todo o consumo final pela aplicação cliente seja via uma única API React polida, declarativa e perfeitamente mesclada com as Variáveis CSS do Design System Sarak.

# 2. Stack e Ferramentas
- Wrapper Sarak (`ChartEngine`, `ChatEngine`, `FlowEngine`, `VisualEngine`)
- ECharts / Echarts-for-React (Mapeamento Analítico)
- React Flow (Mapeamento Nodal)
- Variáveis CSS nativas (Sincronização 100% de Temas)

# 3. Diagramas / Estruturas
A estrutura em `/src/components/engines` consolida essas instâncias robustas:

1. **ChartEngine:** Envelopamento do ECharts, mascarando as pesadas configurações de options em propriedades React limpas. Ele escuta as mudanças de tema (`var(--sx-...)`) e redesenha gráficos e tooltips com a coloração correta (Ex: `Line`, `Bar`, `Pie`, `Radar`).
2. **ChatEngine:** Motor de Conversação voltado para fluxos de NLP, integrando Layouts de chat base (Mensagem do Usuário, Balões do Agente, Inputs Ricos) acoplados na arquitetura de cores do UI Core.
3. **FlowEngine:** Motor de diagramação nodal em canvas (Nodes e Edges), conectando a lógica do React Flow aos tokens visuais, fornecendo componentes visuais pré-prontos de caixas e linhas conectáveis.
4. **Acoplamento Data-Driven:** Nenhum Engine possui hardcode de cores de framework de terceiros. Todos sobrescrevem a config da lib base forçando o uso do `var(--sx-color-...)` na customização (Ex: `color: 'var(--sx-color-primary-base)'` dentro das options do Echarts). Isso assegura que se o usuário mudar o tema no Painel de Customização, os gráficos e nós mudam instantaneamente.
