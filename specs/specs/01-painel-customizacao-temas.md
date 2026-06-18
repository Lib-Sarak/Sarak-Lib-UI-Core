---
tipo: "spec"
titulo: "Painel de Customização de Temas"
dominio: "DesignEngine / Main"
status: "🟢 Implementado"
prioridade: "Alta"
tags: ["spec", "ui", "design-engine", "painel"]
relacionados: ["01-arquitetura-motor-tema-design-engine"]
---

# 1. Visão Geral
A aba de Configuração Global (`ThemeCustomizationTab.tsx`) atua como a interface gráfica principal do Design Engine. Seu objetivo é expor controles visuais intuitivos (Inputs, Sliders, Color Pickers) que manipulam, em tempo real, os "rascunhos" (drafts) do Motor de Temas Data-Driven, permitindo salvar ou engatilhar essas alterações no ambiente ativo de forma indolor para os mantenedores.

# 2. Regras de Negócio
- **Regra 1 (Separação de Preocupações):** A view visual (`ThemeCustomizationTab`) não pode conter regras lógicas densas de API, persistência ou parse de tokens. Tudo isso é encapsulado no hook dedicado `useThemeEngineState`.
- **Regra 2 (Controles Polimórficos):** O processamento de propriedades não é feito um a um de forma chumbada. As seções interagem com o `TokenControl`, que renderiza o formato correto do input (ex: `ColorControl` para cores, `SliderControl` para tamanhos) baseado na taxonomia de cada pilar lida pelo catálogo.
- **Regra 3 (Feedback Imediato):** Ao arrastar um slider ou mudar uma cor, o token em rascunho (`draft`) injeta a alteração instantaneamente no CSS Scoped do Canvas (Mock), mas a persistência no Database é atômica e precisa do Save Modal explícito (`setIsSaveModalOpen`).

# 3. Critérios de Aceite
- [x] O painel lateral renderiza as 6 sessões (Pilares de Design) baseadas dinamicamente no `buildDynamicGroups`.
- [x] Ao alterar o valor em um `TokenControl`, o componente Preview ao lado atualiza as cores/tamanhos em real-time (via css scoped variables).
- [x] Ao clicar em "Salvar", caso a flag `isDirty` acuse diferença do original, um modal de decisão é aberto e delega a gravação para as funções de API.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** encapsular e validar as operações atômicas do hook `useThemeEngineState`.
- [x] **Deve** lidar com falhas de requisição na listagem de dados simulados gracefully sem quebrar o Painel.

## Testes E2E (Integração Lógica)
- [x] Interagir com inputs simulando digitação/seleção de cor e validar se a chamada do método de rascunho (`updateDraft`) do Hook foi disparada com a chave apropriada.
