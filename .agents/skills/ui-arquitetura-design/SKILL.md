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
- **ABSTRAÇÃO DE VARIANTES OBRIGATÓRIA:** Todo o mapeamento de variáveis CSS para criar variantes complexas (ex: `neon`, `frosted`, lógicas matemáticas) DEVE morar em um Hook Controlador (ex: `useAtomicStyles`).
- **PROIBIDO LÓGICA NO JSX:** É estritamente proibido criar blocos condicionais grandes (if/switch) de roteamento de estilo ou injetar tags `<style>` cruas dentro do componente atômico. O Componente é "burro" (Dumb Component) e deve ter menos de 40 linhas.
- **FRONTEIRA LÓGICA (ATÔMICO VS FEATURE):** É **ESTRITAMENTE PROIBIDO** injetar lógica de negócio (ex: requests HTTP, `useEffect` complexo, chamadas à API ou estado global Context/Redux) dentro de `src/components/atomic/`. Toda inteligência e estado da aplicação DEVE ser alocada numa Feature (`src/features/`), enquanto os átomos permanecem passivos.
- **PROIBIÇÃO DE HARDCODE ESTRUTURAL (DESENGESSAMENTO):** É absolutamente proibido chumbar classes estruturais do Tailwind (ex: `flex-col`, `gap-4`, `p-4`, `w-full`, `items-center`) diretamente no `className` do JSX dos átomos. Toda e qualquer geometria, layout e espaçamento deve obrigatoriamente derivar de um Hook de Layout (ex: `className={layoutStyles.container}`). O átomo deve ser fluidamente controlado pelo BD.

## Checklist
- [ ] O componente obedece ao fluxo Schema -> CSS Variables?
- [ ] Todo o CSS está desacoplado de hardcoded values?

## Referências (Camada 3)
- `references/templates.md` — Template copiável para a criação correta de um componente base da UI-Core atrelado às CSS Variables.
- `references/examples.md` — Exemplos práticos do padrão (Exemplo Bom Data-Driven vs. Exemplo Ruim Hardcoded CSS).
