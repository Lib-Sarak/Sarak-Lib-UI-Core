---
name: ui-arquitetura-design
description: Define a regra arquitetural do módulo Design Engine do Sarak-Lib-UI-Core. Use ao desenvolver, revisar ou validar o CSS/Design de componentes. NÃO acione proativamente.
---

# Skill: Arquitetura de Design (UI Core)

> **Dependência:** Esta skill aplica regras visuais específicas. As normas gerais de código e tipagem estão em `padrao-escrita` e `padrao-typescript`.

Esta skill define a lei arquitetural do módulo Design Engine do Sarak-Lib-UI-Core. Ela garante que toda propriedade visual do sistema seja controlada exclusivamente por valores num mapa central — sem CSS hardcoded.

## Quando usar
- Ao criar ou revisar estilos e tokens de design.
- Quando instruído a verificar a conformidade de propriedades visuais.
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

1. **Gate: Análise de Conformidade (HITL)**
   - **Ferramenta:** Diálogo
   - **Ação:** Peça ao usuário para fornecer o arquivo do componente ou o token a ser validado.
2. **Validação do Pipeline Data-Driven**
   - **Ferramenta:** `grep_search` ou `view_file`
   - **Ação:** Inspecione o código alvo garantindo a regra de Ouro: `Schema → Master Map → CSS Variables`.
   - **Critério:** Nenhuma propriedade (como `margin: 10px` ou `color: red`) deve estar hardcoded no CSS/JS. Tudo deve referenciar uma CSS Variable atrelada ao motor.
3. **Reporte e Correção**
   - **Ação:** Informe as infrações ao usuário e apresente o plano de execução para refatorar o código para CSS Variables.
4. **Execução**
   - Após aprovação, aplique as refatorações.

## Regras
- **NUNCA** escreva valores hexadecimais, `px`, `rem`, ou `em` diretamente nas estilizações de componentes.
- **NÃO** duplique definições de estilo que já existam no Master Map.

## Checklist
- [ ] O componente obedece ao fluxo Schema -> CSS Variables?
- [ ] Todo o CSS está desacoplado de hardcoded values?

## Referências (Camada 3)
- `references/templates.md` — Template copiável para a criação correta de um componente base da UI-Core atrelado às CSS Variables.
- `references/examples.md` — Exemplos práticos do padrão (Exemplo Bom Data-Driven vs. Exemplo Ruim Hardcoded CSS).
