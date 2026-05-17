# Skill: Design Engine Data-Driven — Definição

## O que é

O Design Engine do Sarak é um motor de personalização visual 100% data-driven. Isso significa que toda propriedade visual do sistema — desde o raio de borda de um card até a cor de fundo de um header — é controlada exclusivamente por valores numéricos ou textuais armazenados num mapa central. Nenhuma alteração visual exige modificar uma linha de código CSS, TSX ou qualquer arquivo de componente.

O pipeline é unidirecional e determinístico: o usuário interage com controles no painel de personalização (sliders, selects, inputs de cor). Esses controles alteram valores no estado de rascunho (`draftState`). O rascunho alimenta a Preview (Gêmeo Digital) em tempo real via um hook de tradução (`useDesignVariables`). Somente após o usuário clicar explicitamente em "Aplicar ao Sistema" é que o estado real do sistema é atualizado.

Esta skill documenta os 4 pilares inegociáveis desse pipeline e instrui qualquer agente sobre como adicionar novos componentes, criar presets, e manter a integridade do sistema sem jamais quebrar a cadeia data-driven.

## Objetivo

- Garantir que 100% dos componentes visuais do Sarak sejam controlados via Schema → Master Map → CSS Variables.
- Impedir a criação de propriedades visuais hardcoded ou fontes de preset duplicadas.
- Documentar o pipeline completo de aplicação de alterações: Draft → Preview → Apply.
- Servir de referência obrigatória para qualquer agente que trabalhe no módulo `Sarak-Lib-UI-Core`.

## Responsabilidades Exclusivas desta Skill

1. Definir o pipeline canônico de personalização visual do Design Engine.
2. Instruir o fluxo obrigatório para adição de novos componentes ao mapa de design.
3. Documentar a regra de fonte única de presets por subcategoria.
4. Especificar como o `useDesignVariables` traduz tokens para CSS sem intervenção manual.
5. Garantir que o fluxo Draft → Preview → Apply seja preservado sem exceções.

## Quando usar

- Ao adicionar qualquer novo componente visual ao sistema Sarak.
- Ao criar ou modificar presets de design de qualquer subcategoria.
- Ao modificar galerias, previews ou specimens do Design Engine.
- Ao debugar discrepâncias visuais entre a Preview (Gêmeo Digital) e o sistema real.
- Ao avaliar se uma propriedade visual está devidamente mapeada.
- Antes de criar qualquer CSS customizado para um componente que já deveria ser governado pelo mapa.
