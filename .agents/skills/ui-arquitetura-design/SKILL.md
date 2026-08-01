---
name: ui-arquitetura-design
description: Define a regra arquitetural do módulo Design Engine do Sarak-Lib-UI-Core. Use ao desenvolver, revisar ou validar o CSS/Design de componentes. NÃO acione proativamente.
---

# Skill: Arquitetura de Design (UI Core)

> **Esta skill ORQUESTRA; ela não define regra.** O enunciado normativo mora nas specs, e quando
> as duas divergirem **a spec vence**:
> - R2 (zero hardcode), R7 (namespace e fallback), R9 (limiares), R10 (composição atômica) →
>   `specs/specs/00-regras-e-invariantes.md`
> - O dicionário e as duas alavancas (Valor × Estrutural) →
>   `specs/arquitetura/04-contrato-de-tokens-e-paridade.md`
> - Como o `design` vira tela → `specs/arquitetura/02-design-engine.md`
>
> **Dependência:** as normas gerais de código e tipagem estão em `padrao-escrita` e `padrao-typescript`.

Esta skill aplica a lei arquitetural do módulo Design Engine do Sarak-Lib-UI-Core: toda propriedade visual do sistema é controlada por valores num dicionário central — sem CSS hardcoded.

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
- **NAMESPACE E FALLBACK:** toda CSS Variable consumida é `--sarak-*` ou `--theme-*`, **SEMPRE com fallback** (`var(--sarak-card-radius, 12px)`). O namespace **`--sx-*` é PROIBIDO** — nunca foi emitido por nenhuma fonte, logo é variável-fantasma por definição.
- **NÃO** duplique definições de estilo que já existam no dicionário (schema/`master-map.ts`).
- **ABSTRAÇÃO DE VARIANTES OBRIGATÓRIA:** Todo o mapeamento de variáveis CSS para criar variantes complexas (ex: `neon`, `frosted`, lógicas matemáticas) DEVE morar em um Hook Controlador (`src/components/atomic/hooks/useAtomicStyles.ts`, `useStructuralStyles.ts`).
- **PROIBIDO LÓGICA NO JSX:** É estritamente proibido criar blocos condicionais grandes (if/switch) de roteamento de estilo ou injetar tags `<style>` cruas dentro do componente atômico. O Componente é "burro" (Dumb Component): **≤ 250 linhas** por arquivo é o limiar cobrado (R9, `auditor_cleancode`); um átomo que se aproxima disso quase sempre está carregando decisão que pertence ao Hook.
- **COMPOSIÇÃO ATÔMICA (R10):** proibido `<button>`, `<input>` ou `<select>` cru dentro de template ou componente pré-montado — use `SarakButton`, `SarakInput`, `SarakSelect`. HTML nativo cru causa vazamento de especificidade e deixa de responder ao token. **Nenhum gate pega isto** — depende desta revisão.
- **FRONTEIRA LÓGICA (ATÔMICO VS FEATURE):** É **ESTRITAMENTE PROIBIDO** injetar lógica de negócio (ex: requests HTTP, `useEffect` complexo, chamadas à API ou estado global Context/Redux) dentro de `src/components/atomic/`. Toda inteligência e estado da aplicação DEVE ser alocada numa Feature (`src/features/`), enquanto os átomos permanecem passivos.
- **PROIBIÇÃO DE HARDCODE ESTRUTURAL (DESENGESSAMENTO):** É absolutamente proibido chumbar classes estruturais do Tailwind (ex: `flex-col`, `gap-4`, `p-4`, `w-full`, `items-center`) diretamente no `className` do JSX dos átomos. Toda e qualquer geometria, layout e espaçamento deve obrigatoriamente derivar do Hook de Layout `useStructuralStyles()` (ex: `className={layout.className}` e `style={layout.style}`). O átomo deve ser fluidamente controlado pelo BD.

## Checklist
- [ ] O componente obedece ao fluxo Schema → Master Map → CSS Variables?
- [ ] Todo o CSS está desacoplado de valores chumbados?
- [ ] Toda `var()` consumida é `--sarak-*`/`--theme-*` e tem **fallback**?
- [ ] A geometria vem do Hook Controlador, e não de Tailwind estrutural no `className`?
- [ ] Rodou `npm run audit` e comparou `auditor_hardcoded` + `auditor_ghostvars` com o **baseline** (`specs/specs/01-gates-e-baseline.md`), nunca com zero?

## Referências (Camada 3)
- `references/templates.md` — Molde copiável do token nas três fontes do dicionário + o consumo pelo Hook Controlador.
- `references/examples.md` — As cinco violações mais comuns do pipeline, com o gate que pega cada uma (e as duas que **nenhum** gate pega).
