# Skill: Sarak Logic Decoupling — Definição

## O que é
A `sarak-logic-decoupling` é a ferramenta definitiva para dissolver o monolito oculto. No passado, o `Sarak-Lib-Shared` servia como uma "caixa de ferramentas" onde todos os módulos bebiam. Isso criava um acoplamento onde uma mudança no Shared podia quebrar todos os módulos simultaneamente.

A Independência Atômica v5.5 exige que nenhum módulo dependa do código de outro no momento do build. Se um módulo precisar de uma funcionalidade de outro, ele deve solicitá-la via rede (API) ou possuir sua própria implementação local se a lógica for de domínio exclusivo.

## Objetivo
- Eliminar o `@sarak/lib-shared` como dependência obrigatória.
- Transformar processos de "Importação de Função" em "Consumo de API".
- Garantir que cada módulo possa ser compilado e testado em isolamento total.

## Responsabilidades Exclusivas desta Skill
1. Identificar e remover pacotes legados do `package.json`.
2. Mapear funções utilitárias compartilhadas e decidir entre: **Duplicar localmente** (se for lógica simples) ou **Externalizar via API** (se for lógica de negócio).
3. Projetar Contratos de API que substituam as interfaces de código do Shared.

## Quando usar
- Sempre que encontrar a dependência `sarak-lib-shared` em um módulo.
- Quando um erro em um módulo impactar outro por causa de uma dependência de código comum.
- Na fase final de transição para microsserviços.
