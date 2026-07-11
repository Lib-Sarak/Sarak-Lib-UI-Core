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
