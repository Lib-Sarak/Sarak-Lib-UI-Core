---
tipo: "spec"
titulo: "Expansão de Formulários"
dominio: "Sarak-Lib-UI-Core (Visual)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "forms", "inputs"]
relacionados: ["12-expansao-data-grids-vis"]
---

# 1. Visão Geral
Esta especificação descreve os componentes visuais avançados de entrada de dados essenciais para interfaces SaaS densas (Sistemas de RH, ERPs Financeiros). A Sarak-Lib-UI-Core deve expandir além do input de texto simples, fornecendo componentes como Pickers de datas/horas, Uploaders drag-and-drop e Selects assíncronos, todos guiados pelo Design Engine.

# 2. Regras de Negócio
- **Regra 1: Pickers Temporais Precisos:** O `SarakDatePicker` e `SarakTimePicker` devem suportar formatos de localização (i18n) configuráveis via JSON, além de possuírem suporte a range de seleção (ex: 01/01/2026 até 31/01/2026).
- **Regra 2: Combobox com Tags:** O `SarakMultiSelect` deve permitir pesquisa digitada (autocomplete), seleção de múltiplos itens e renderizá-los como chips/tags deletáveis dentro do campo.
- **Regra 3: File Uploader Acessível:** O componente de upload (`SarakUploader`) deve apresentar uma área de drag-and-drop visualmente distinta. O estado visual (arrastando, subindo, sucesso, erro de tamanho) deve espelhar estritamente os tokens de cor semânticos da Sarak.
- **Regra 4: Rich Text Editor (WYSIWYG) Blindado:** O editor de texto rico não pode injetar tags `<style>` locais para evitar o rompimento do escopo CSS, ele deve utilizar marcações semânticas restritas e seguras.
- **Regra 5: Range Sliders Duplos:** O `SarakSlider` deve suportar dois controles deslizantes (início e fim) para definição de intervalos contínuos, com suporte à visualização de tooltips mostrando o valor.

# 3. Critérios de Aceite
- [ ] `SarakDatePicker` permite seleção única e seleção de intervalo contínuo na mesma interface de calendário popover.
- [ ] `SarakMultiSelect` exibe corretamente *chips* das escolhas feitas e possui um botão "X" para remoção individual.
- [ ] `SarakUploader` captura eventos de arrastar arquivo para dentro da tela e altera sua borda para o estado de `--sx-color-primary`.
- [ ] `SarakRichText` gera outputs purificados de HTML, bloqueando scripts e estilos maliciosos.
- [ ] Todos os novos componentes de formulário disparam os visuais corretos de erro quando o JSON marcar a propriedade `hasError: true`.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** permitir a digitação de dados na barra de pesquisa do `SarakMultiSelect` sem perder o foco dos *chips* selecionados.
- [ ] **Deve** renderizar os valores mínimo, máximo e passo atual do `SarakSlider` exatamente conforme os dados passados no manifesto JSON.

## Testes de Contrato (API)
- [ ] N/A. (Estritamente visual).

## Testes E2E (Integração)
- [ ] Fluxo feliz: O usuário abre um MultiSelect, digita um termo de pesquisa e a lista suspensa é filtrada sem piscar a interface.
- [ ] Acessibilidade: Navegação com teclado no `SarakDatePicker` alterando o dia/mês puramente com setas.
