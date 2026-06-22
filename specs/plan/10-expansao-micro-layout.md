---
tipo: "spec"
titulo: "Expansão de Micro-Layout"
dominio: "Sarak-Lib-UI-Core (Visual)"
status: "🟢 Implementado"
prioridade: "Alta"
tags: ["spec", "layout", "flex", "grid"]
relacionados: []
---

# 1. Visão Geral
Esta especificação define os requisitos arquiteturais para a criação de componentes de fundação estrutural na Sarak-Lib-UI-Core. O objetivo é remover as limitações impostas por layouts fixos baseados em Cards e fornecer "primitivas invisíveis" (Flex, Grid, Split Panes) que obedeçam puramente às regras do JSON do Design Engine, viabilizando o posicionamento cirúrgico de elementos na tela.

# 2. Regras de Negócio
- **Regra 1: Primitivas 100% Data-Driven:** Os novos componentes `<SarakFlex>` e `<SarakGrid>` não podem conter CSS *hardcoded*. Suas propriedades CSS (como `justify-content`, `gap`, `grid-template-areas`) devem ser mapeadas diretamente do JSON de configuração injetado.
- **Regra 2: Componentes Invisíveis:** Diferente do `SarakCard`, as primitivas de Micro-Layout não possuem background, bordas, sombras ou padding obrigatório por padrão. Elas são estritamente para gestão de espaço.
- **Regra 3: Split Panes Responsivos:** O componente de Painel Redimensionável (Split Pane) deve permitir arrasto pelo usuário e deve salvar o valor da largura localmente (através de interfaceamento com a futura spec de LocalStorage).
- **Regra 4: Drawers e Acordeões Controlados:** Os painéis laterais (Drawers) e blocos expansíveis (Acordeões) devem ter seu estado aberto/fechado mapeável no JSON, suportando fechamento via overlay ou tecla ESC.
- **Regra 5: Abas Avançadas (Tabs):** O sistema de Tabs deve suportar alinhamento flexível (horizontal e vertical) e deve permitir aninhamento profundo sem colapso de estilo.

# 3. Critérios de Aceite
- [ ] `<SarakFlex>` aceita e aplica propriedades CSS flexíveis (direction, justify, align, gap) recebidas via JSON.
- [ ] `<SarakGrid>` implementa com sucesso matrizes usando `gridTemplateColumns` e `gridTemplateAreas`.
- [ ] Split Panes permitem arraste fluido entre dois sub-painéis sem congelar a UI.
- [ ] Drawers (painéis laterais) deslizam a partir das 4 direções especificadas.
- [ ] Acordeões empurram o conteúdo abaixo fluidamente ao serem abertos, não utilizando alturas fixas absolutas.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** renderizar `SarakFlex` com a tag HTML correta (por padrão `div`, mas aceitando injeção semântica via JSON como `section`).
- [ ] **Deve** traduzir os tokens de espaçamento do JSON (ex: `spacing-md`) para os valores calculados corretos de `gap` ou `padding` do Design Engine.
- [ ] **Deve** garantir que o arraste do Split Pane não extrapola o `min-width` e `max-width` configurados.

## Testes de Contrato (API)
- [ ] N/A. (Primitivas visuais sem chamadas de rede embutidas).

## Testes E2E (Integração)
- [ ] Fluxo feliz: Abrir um Drawer a partir de um JSON manifest, clicar fora (no overlay) e verificar o fechamento natural.
- [ ] Acessibilidade: Navegar entre as Tabs Aninhadas utilizando a tecla `Tab` e ativar utilizando `Enter/Space`.
