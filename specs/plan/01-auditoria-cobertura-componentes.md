---
tipo: "spec"
titulo: "Auditoria de Cobertura de Componentes (Átomos, Funcionais e Layout)"
dominio: "Design Engine (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "ai-agent", "design-system", "auditoria", "cobertura", "paridade"]
relacionados: ["06-presets-engine", "03-padrao-e-taxonomia-biblioteca-atomica", "07-agente-llm-design-e-expansao-estrutural", "02-mapeamento-semantico-rag-catalogo"]
---

# 1. Visão Geral
O Design Agent só consegue personalizar granularmente um componente se existir um token no `MASTER_DESIGN_MAP` para cada propriedade visual configurável dele. Hoje isso não é uniforme: `specs/specs/06-presets-engine.md` já documenta que `inputs.ts`, `tables.ts` e `navigation.ts` são schemas "simplificados" comparados a `cards.ts` (faltam atributos como blur, níveis de sombra/neumorphism, texturas internas, cores de estado). Esta spec formaliza uma auditoria completa — não só das três famílias já apontadas, mas de **todo** o catálogo de componentes atômicos, funcionais e de layout — para produzir um backlog priorizado e confiável do que falta tokenizar. Sem isso, o agente (e qualquer humano usando o painel) está limitado a uma fração da capacidade de customização que o sistema deveria oferecer.

# 2. Regras de Negócio
- **Regra 1 (Esta spec é diagnóstica, não corretiva):** o resultado é um backlog de gaps, não a implementação dos tokens novos. Cada gap fechado é uma Expansão (Spec 09: `09-expansao-vs-configuracao.md`) e segue o pipeline de paridade 1:1:1:1:1 via skill `ui-novo-componente` — fora do escopo de execução desta spec.
- **Regra 2 (Fonte da verdade dupla, comparada):** a auditoria cruza duas fontes por família: (a) o schema real em `src/core/Design/schema/*.ts` (o que já é token); (b) o componente atômico real em `src/components/atomic/**/*.tsx` (o que é visualmente configurável, olhando `className`/`style` condicionais, variantes de prop, e o hook `useAtomicStyles`/`useStructuralStyles` correspondente). Gap = existe em (b) sem equivalente em (a).
- **Regra 3 (Cobertura além dos átomos):** a auditoria cobre 3 camadas, não só átomos: **atômicos** (`src/components/atomic/*`), **funcionais/templates** (`src/components/atomic/Templates`, `Layouts`, `Modals`, `Navigation`, `DataDisplay`), e **layout/shell** (`src/core/Shell/SarakShell`, `src/core/Design/components/DesignScope`). O agente precisa poder alterar as três camadas.
- **Regra 4 (Priorização por família rasa primeiro):** a spec 06 já indica as 3 famílias mais rasas (`inputs`, `tables`, `navigation`) — a auditoria confirma/expande essa lista e prioriza o backlog por elas antes de families já ricas (`cards`, `atmosphere`).

# 3. Critérios de Aceite
- [ ] Cada uma das 28 famílias de schema (`src/core/Design/schema/*.ts`) tem um relatório de gap (lista de propriedades visuais sem token, ou "nenhum gap encontrado").
- [ ] O backlog resultante está priorizado (ex.: rascunho de tabela como a da spec 06, com "Por que é complexo/prioritário").
- [ ] Componentes funcionais/layout (Templates, Modals, Navigation, Shell) também auditados, não só átomos puros.
- [ ] Backlog entregue em formato consumível pela skill `ui-novo-componente` (uma entrada por token candidato, com componente de origem e justificativa).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- *N/A* — esta spec produz um documento/backlog, não código executável.

## Testes de Contrato (API)
- *N/A* — sem I/O de rede.

## Testes E2E (Integração)
- *N/A* — rotina de auditoria estática, sem jornada de usuário na interface.

## Verificação do Próprio Backlog
- [ ] **Deve** cada item do backlog apontar um componente real (caminho de arquivo) e a propriedade visual observável que hoje não é configurável via token.
- [ ] **Deve** o backlog ser revisado manualmente (HITL) antes de virar tarefas de `ui-novo-componente` — evita token especulativo sem uso real comprovado no componente.

# 5. Metodologia (siga esta ordem exata, família por família)

Para cada um dos 28 arquivos em `src/core/Design/schema/*.ts`:

1. **Abra o schema** e liste todos os `id` de token já existentes (`Grep -n "id: '" src/core/Design/schema/<arquivo>.ts`).
2. **Identifique o(s) componente(s) atômico(s) que esse schema governa.** Nem sempre é 1:1 por nome — use o `id`/`label` do `ComponentSchema` como pista e confirme abrindo o componente em `src/components/atomic/**/*.tsx` (ex.: `InputsSchema` → `src/components/atomic/Inputs/SarakInput.tsx`, mas também `SarakSelect.tsx`, `SarakTextarea.tsx`, etc. — schemas às vezes cobrem uma família inteira de componentes).
3. **Leia o componente inteiro.** Para cada `className`/`style` que:
   - referencia uma CSS var real (`var(--sarak-...)`) → já é token, confirme que o `id` correspondente existe no schema (se não existir, isso já é uma variável-fantasma — reporte separado, é bug do `auditor_ghostvars`, não gap de cobertura);
   - tem um **valor fixo/hardcoded** que estruturalmente parece que deveria ser configurável (opacidade, cor, tamanho, easing de transição) → **candidato a gap**;
   - é um hook (`useAtomicStyles`, `useStructuralStyles`) → abra o hook e repita o passo 3 dentro dele.
4. **Compare com uma família já rica** (`cards.ts`/`buttons.ts` — ambas têm: cor base, cor em 4 estados [normal/hover/active/disabled], raio por canto, sombra/elevação, blur, variantes de "estilo" tipo matte/neon/frosted). Pergunte: "esta família tem o equivalente de cada uma dessas categorias?" Se não tem estado `disabled` tokenizado, por exemplo, isso é gap, mesmo que o componente hoje não pareça precisar (ele pode estar usando um hardcode que a auditoria de hardcode já tolera por estar "pequeno demais" pra disparar o `auditor_hardcoded.mjs`, mas ainda assim não é configurável).
5. **Registre cada gap** no formato da Seção 6 abaixo.

## Exemplo real, já feito (use como modelo — não repita esta família, já está pronta)

Comparei `InputsSchema` (`src/core/Design/schema/inputs.ts`, 16 tokens) contra `SarakInput.tsx` (`src/components/atomic/Inputs/SarakInput.tsx`) e `ButtonsSchema`/`SarakButton.tsx` (referência rica). Gaps confirmados:

1. **Sem tokens de estado `disabled`.** `SarakInput.tsx:47`: `` const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''; `` — `opacity-50` é hardcoded, não existe `inputDisabledOpacity`/`inputDisabledBg` no schema. `ButtonsSchema` também não tokeniza isso — é um gap sistêmico, não só de inputs.
2. **Placeholder usa opacidade fixa em vez de token.** `SarakInput.tsx:43`: `` placeholder:text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))]/30 `` — o `/30` é uma opacidade Tailwind fixa aplicada sobre a cor do texto; não existe `inputPlaceholderOpacity` ou `inputPlaceholderColor` próprio.
3. **Sem variantes de "estilo" (`inputStyleType`).** `ButtonsSchema` tem `btnStyleType` (matte/neon/frosted/borderline/cyberpunk/neumorphism) — `InputsSchema` não tem equivalente, mesmo `inputBackdropBlur`/`inputShadow` já existindo soltos (sugerindo que a intenção de suportar "frosted"/"neumorphism" em inputs já existe parcialmente, só não está organizada como variante selecionável).
4. **Padding só no eixo Y.** `inputPadding` é rotulado "Espaçamento Interno (Y)" — não há `inputPaddingX` separado (`ButtonsSchema` também não tem, então isso é candidato a gap sistêmico de baixa prioridade, não específico de inputs).

Isso é o nível de detalhe e evidência esperado — código real citado, não suposição.

# 6. Formato de Saída (uma entrada por gap, backlog final)

```markdown
### [família]: descrição curta do gap
- **Componente(s) afetado(s):** caminho(s) de arquivo real(is).
- **Evidência:** trecho de código (linha aproximada) mostrando o hardcode ou a ausência.
- **Token(s) candidato(s):** `nomeDoTokenSugerido` (siga a convenção de nomenclatura já usada na família — ex. `inputDisabledBg` segue o padrão de `inputBg`/`inputFocusBorderColor`).
- **Prioridade:** Alta (família já sinalizada na spec 06) / Média / Baixa (gap sistêmico cosmético).
```
