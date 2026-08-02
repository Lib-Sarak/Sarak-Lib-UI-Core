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
   - **Ferramenta:** leitura do arquivo + busca por conteúdo (a que o seu harness oferecer).
   - **Ação:** Inspecione o código alvo garantindo a regra de Ouro: `Schema → Master Map → CSS Variables`.
   - **Critério:** Nenhuma propriedade (como `margin: 10px` ou `color: red`) deve estar hardcoded no CSS/JS. Tudo deve referenciar uma CSS Variable atrelada ao motor.
   - **A verificação mecânica é do GATE**, não desta leitura: `npm run audit` roda os detectores de
     hardcode e de variável-fantasma. Esta etapa pega o que nenhum detector alcança — R10, e o
     hardcode em `.css`, que o `auditor_hardcoded` não varre (só coleta `.tsx`).
3. **Reporte e Correção**
   - **Ação:** Informe as infrações ao usuário e apresente o plano de execução para refatorar o código para CSS Variables.
4. **Execução**
   - Após aprovação, aplique as refatorações.

## Regras

**As normativas não são reescritas aqui** — enunciado, porquê, exemplo certo × errado e o gate de
cada uma estão em `specs/specs/00-regras-e-invariantes.md`: **R2** (zero hardcode, incluindo o
Tailwind estrutural em `atomic/`), **R7** (namespace `--sarak-*`/`--theme-*` com fallback
obrigatório; `--sx-*` PROIBIDO), **R9** (≤ 250 linhas) e **R10** (composição atômica). Quando esta
skill divergir da spec, a spec vence — e a divergência é defeito desta skill.

O que é **procedimento desta skill**, e por isso mora aqui:

- **ABSTRAÇÃO DE VARIANTES OBRIGATÓRIA:** todo mapeamento de variáveis CSS para variantes complexas
  (`neon`, `frosted`, lógica matemática) mora num **Hook Controlador**
  (`src/components/atomic/hooks/useAtomicStyles.ts`, `useStructuralStyles.ts`) — nunca no `.tsx`.
- **PROIBIDO LÓGICA NO JSX:** nada de `if`/`switch` grande de roteamento de estilo nem `<style>`
  cru dentro do átomo. O componente é burro. Um átomo que se aproxima do teto de 250 linhas quase
  sempre está carregando decisão que pertence ao Hook — o limiar é sintoma, não meta.
- **FRONTEIRA LÓGICA (ATÔMICO × FEATURE):** requests HTTP, `useEffect` complexo, chamada de API ou
  estado global não entram em `src/components/atomic/`. Estado e inteligência vivem em
  `src/features/`; os átomos permanecem passivos.
- **NÃO duplique** definição de estilo que o dicionário já tem (schema / `master-map.ts`) — é a
  fronteira Configuração × Expansão (R11) aplicada ao CSS.

> ⚠️ **R10 não tem gate** — o §3 de `specs/specs/00-regras-e-invariantes.md` a marca como CONDUTA.
> Ela depende desta revisão e de mais nenhuma coisa: é o item que esta skill existe para pegar.

## Checklist
- [ ] O componente obedece ao fluxo Schema → Master Map → CSS Variables?
- [ ] Todo o CSS está desacoplado de valores chumbados?
- [ ] Toda `var()` consumida é `--sarak-*`/`--theme-*` e tem **fallback**?
- [ ] A geometria vem do Hook Controlador, e não de Tailwind estrutural no `className`?
- [ ] Rodou `npm run audit` e comparou `auditor_hardcoded` + `auditor_ghostvars` com o **baseline** (`specs/specs/01-gates-e-baseline.md`), nunca com zero?

## Referências (Camada 3)
- `references/templates.md` — Molde copiável do token nas três fontes do dicionário + o consumo pelo Hook Controlador.
- `references/examples.md` — As cinco violações mais comuns do pipeline, com o gate que pega cada uma (e as duas que **nenhum** gate pega).
