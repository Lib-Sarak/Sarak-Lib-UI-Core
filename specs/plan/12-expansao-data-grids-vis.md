---
tipo: "spec"
titulo: "Expansão de Data Grids e Visualização"
dominio: "Sarak-Lib-UI-Core (Visual)"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "datagrid", "charts", "kanban"]
relacionados: []
---

# 1. Visão Geral
Esta especificação rege a criação dos componentes pesados de apresentação e densidade de dados. Eles formam a fundação visual de CRMs, sistemas analíticos e gerenciadores de projetos. O foco é garantir renderização otimizada para massas de dados (virtualização) sob o controle do JSON.

# 2. Regras de Negócio
- **Regra 1: Datagrid Virtualizado:** O componente `SarakDataGrid` deve empregar *virtual scrolling*. Não importando se a lista contiver 1.000 ou 100.000 registros, apenas as linhas visíveis devem ser montadas no DOM.
- **Regra 2: Funcionalidades de Tabela Avançadas:** O Datagrid deve suportar colunas congeladas (pinned columns), redimensionamento arrastável nas divisórias do cabeçalho e reordenação das colunas guiada por dados.
- **Regra 3: Quadros Kanban (Board):** O `SarakKanban` deve abstrair as colunas e permitir a transferência fluida de cards arrastáveis, atualizando seu modelo de dados local visual imediatamente durante a operação de "drop".
- **Regra 4: Componentes de Visualização (Charts/Sparklines):** Wrappers de gráficos não devem injetar cores hardcoded na linha/barra. As cores primárias, secundárias e as fontes tipográficas do gráfico devem herdar dinamicamente dos tokens globais CSS (`var(--sx-...)`).
- **Regra 5: Tree Views Expansíveis:** A hierarquia em árvore deve suportar níveis infinitos em profundidade e um estado de `lazyLoadingIcon` ativável via JSON.

# 3. Critérios de Aceite
- [ ] O `SarakDataGrid` mantém fluidez nativa a 60 FPS com 10.000 objetos mockados carregados via JSON.
- [ ] Pinned columns no Datagrid não perdem o alinhamento com as linhas ao realizar scroll horizontal ou vertical.
- [ ] `SarakKanban` move os elementos corretamente com mouse drag-and-drop.
- [ ] Os gráficos mapeiam com sucesso as cores de marca da Sarak repassadas através das propriedades de tema.
- [ ] Componente Sparkline (gráfico minimalista sem eixos) é capaz de renderizar perfeitamente dentro do espaço confinado de um `<SarakCard>`.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** calcular corretamente as alturas de janela (*windowing*) no `SarakDataGrid` impedindo montagem de nós excessivos no DOM real.
- [ ] **Deve** engatilhar corretamente o evento de "drag_end" identificando o bloco de origem e o bloco de destino no Kanban.

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Fluxo feliz: Arrastar um card Kanban da coluna "To Do" para "Done" altera o estado visual imediatamente sem recarregamento da tela.
- [ ] Responsividade: Redimensionar o navegador força os gráficos a se redesenharem adaptando-se sem overflow lateral.
