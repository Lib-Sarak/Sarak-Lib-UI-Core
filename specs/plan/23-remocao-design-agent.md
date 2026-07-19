---
tipo: "spec"
titulo: "Remoção do Design Agent (agente LLM embarcado)"
dominio: "Arquitetura / Distribuição / Design Engine"
status: "🟢 Concluída (2026-07-19)"
prioridade: "Alta"
tags: ["spec", "remocao", "design-agent", "escopo", "breaking-change"]
relacionados: ["00-manifesto-arquitetural-ui-core", "08-consumo-externo-e-integracao", "22-skills-de-consumo-golden-path"]
---

# 1. Visão Geral e Motivação

A onda "Renderizador Genérico" (specs plan/16-22) consolidou o princípio: **a Sarak-Lib-UI-Core é um renderizador — declara contratos, não embarca infraestrutura**. O Design Agent (o agente LLM que gera/ajusta temas por linguagem natural) viola esse princípio duas vezes:

1. **Módulo embarcado no repositório:** `agent-design-operator/` vive DENTRO do repo da lib (~131 arquivos + node_modules próprio) — um microsserviço Node com provider de LLM, banco de histórico e prompts, que nada tem a ver com renderização e infla o repositório e a manutenção.
2. **Superfície de produto acoplada:** o painel do Design Engine carrega um card de chat (`DesignAgentChatCard`) e o Provider expõe o contrato `options.designAgent.sendPrompt` — recursos de autoria assistida por IA, não de renderização.

Esta spec remove o agente da biblioteca. A capacidade "gerar tema por IA" pode continuar existindo como produto **externo** (repositório próprio), consumindo os mesmos endpoints/artefatos públicos da lib — mas deixa de ser responsabilidade deste módulo.

# 2. Inventário Exato do que Existe Hoje (levantado no código)

| Camada | Item | Path |
|---|---|---|
| Módulo embarcado | Microsserviço completo (src/dist/tests/node_modules) | `agent-design-operator/` |
| Frontend (features) | Card de chat do painel | `src/features/DesignEngine/Canvas/components/DesignAgentChatCard.tsx` (+ teste) |
| Frontend (features) | Hooks do chat/presets gerados | `src/features/DesignEngine/Canvas/hooks/useDesignAgentChat.ts` (+ teste), `useAgentGeneratedPresets.ts` |
| Frontend (features) | Montagem do card no canvas | `src/features/DesignEngine/Canvas/PreviewCanvas.tsx` |
| Contrato público | `SarakUIOptions.designAgent` + tipos | `src/core/Provider/types.ts`; exports `DesignAgentPromptInput/Result/ComponentPreset/SendPrompt` em `src/index.ts` (linhas ~12-17) |
| Backend bridge | Catálogo p/ o agente | `getDesignCatalog`/`getDesignScaffold` em `backend/node/catalog.ts` (exportados em `backend-node.ts`) |
| Skills | Entrevista (Etapa 1) + integração (Etapa 6) | `.agents/skills/ui-integra-consumidor/SKILL.md` (~6 menções) + espelho `.claude/` + `references/examples.md` |
| Specs | Contrato §6.2 | `specs/specs/08-consumo-externo-e-integracao.md` |
| Plano | Sub-plano inteiro do Design Agent | `specs/plan/01..07-*.md` (03/02 executadas; 04, 05, 06, 07 pendentes) + Nível 0 do `00-indice.md` |
| Consumidor real | MyService injeta `designAgent.sendPrompt` | `Sarak-MyService/src/main.tsx` + `src/sarak/design-agent.ts` (fora deste repo — impacto de breaking change) |

# 3. Regras de Negócio (Plano de Remoção)

## 3.1 Fase A — Extração/arquivamento do módulo embarcado (obrigatória)
- **Decisão HITL nº 1 (destino do código):** (a) extrair `agent-design-operator/` para repositório próprio (`Sarak-Agent-Design-Operator`), preservando histórico via `git subtree split`/cópia com commit de referência; ou (b) apenas deletar (o histórico permanece no git da lib). **Recomendação: (a)** — o produto pode ter vida própria.
- Remover a pasta do repo da lib; remover qualquer referência em scripts/build/CI (verificado: `package.json` da lib NÃO referencia o módulo — a remoção é limpa).

## 3.2 Fase B — Remoção da superfície na lib (obrigatória)
- Remover: `DesignAgentChatCard` + testes, `useDesignAgentChat` + testes, `useAgentGeneratedPresets`, a montagem no `PreviewCanvas`.
- Remover `designAgent` de `SarakUIOptions` e os 4 tipos exportados de `src/index.ts`. **Isto é BREAKING CHANGE** (ver 3.5).
- **Decisão HITL nº 2 (porta futura):** manter ou não uma porta genérica "traga seu agente"? **Recomendação: NÃO manter nesta spec** — remover 100% (menos código morto; se a demanda voltar, uma spec futura desenha a porta do zero, alinhada à linguagem de portas das specs 19/20). Registrar a decisão no `00-progresso.md`.
- `getDesignCatalog`/`getDesignScaffold` (backend): avaliar consumidores restantes — se só o agente os consumia, remover; se o CustomizationPanel/skills os usam, manter e documentar o uso remanescente. (Investigação obrigatória antes de deletar: `grep -r "getDesignCatalog\|getDesignScaffold"` em `src/`, skills e `agent-design-operator/`.)

## 3.3 Fase C — Skills e specs (obrigatória)
- `ui-integra-consumidor`: remover a pergunta da Etapa 1 e a Etapa 6 inteira (renumerar etapas); remover exemplos do `references/examples.md`; espelhar `.claude/`.
- Spec 08: remover §6.2 (`designAgent`) substituindo por 1 linha de histórico ("removido — ver plan/23"), sem deixar aviso obsoleto espalhado (regra da memória de specs).
- `specs/plan/01..07`: marcar o sub-plano como **CANCELADO/ARQUIVADO por esta spec** — atualizar frontmatter (`status: "⚫ Cancelada (plan/23)"`), NÃO deletar os arquivos (histórico); atualizar o Roteiro e o Nível 0 do `00-indice.md`.
- Template starter e catálogo: nenhum menciona o agente (verificar mesmo assim ao executar).

## 3.4 Gates (obrigatória)
- `RegistryParity.test.tsx` R1/R3: a remoção dos componentes não pode deixar entradas órfãs em `NATIVE_COMPONENTS`/`manifestExclusions.ts` (o card nunca foi manifestável — conferir exclusões).
- `npm run catalog` regenerado; `npm run build` completo (dts) verde; suítes de `src/features/DesignEngine/` verdes após remoção dos testes do chat.

## 3.5 Breaking change e migração (obrigatória)
- Versão: bump MINOR/MAJOR conforme política do pacote (remoção de tipos públicos exportados).
- Consumidor conhecido afetado: **Sarak-MyService** (`options.designAgent` + `src/sarak/design-agent.ts`). A execução desta spec DEVE incluir nota de migração (remover a opção do main.tsx; o arquivo local do MyService passa a apontar para o serviço externo, se a Fase A escolher extração) — a mudança no MyService em si é feita no repo dele, fora desta spec.
- Comportamento pós-remoção: o CustomizationPanel simplesmente não exibe mais o card de chat — nenhuma tela quebra, nenhum fetch órfão.

# 4. Critérios de Aceite
- [x] `agent-design-operator/` não existe mais no repo da lib (HITL nº 1 = apenas deletar; `git rm -r`, histórico continua no git da lib).
- [x] Nenhuma ocorrência de `designAgent`/`DesignAgent` em `src/` (grep zero, exceto changelog/specs históricas).
- [x] `SarakUIOptions` sem `designAgent`; `src/index.ts` sem os 4 tipos; build dts verde.
- [x] CustomizationPanel renderiza completo sem o card de chat (teste atualizado — snapshot de `PreviewCanvas.test.tsx` regenerado).
- [x] Skill `ui-integra-consumidor` sem a entrevista/etapa do agente (`.claude/skills` é symlink de `.agents/skills` — sincroniza sozinho, sem hash a conferir manualmente).
- [x] Specs plan/01-07 marcadas como canceladas/arquivadas — **achado da execução:** só `01` ainda existe como arquivo (marcado `⚫ Cancelada (plan/23)`); `02` a `07` já haviam sido apagadas num commit anterior não relacionado (`b8447cb`, Spec 17); `00-indice.md` e `00-progresso.md` atualizados refletindo o estado real.
- [x] Decisões HITL nº 1 e nº 2 registradas com quem decidiu (usuário, via `AskUserQuestion` nesta execução — ver `00-progresso.md`).

# 5. Plano de Testes (Quality Gate)
## Unitários
- [x] Suíte de `features/DesignEngine/Canvas` verde após remoção (PreviewCanvas sem o card — snapshot atualizado e justificado).
## Contrato/Estático
- [x] `grep -ri "designagent" src/ backend/ templates/ docs/` → 0 resultados (achado extra: tabelas `design_agent_conversations`/`artifacts` em `schema.ts`/`schema.sqlite.ts`/`models.py` também removidas — persistência órfã do agente).
- [x] `catalog:check` + `RegistryParity` + build completo verdes.
## E2E
- [~] Abrir `/design`: sem card de chat comprovado via snapshot de `PreviewCanvas.test.tsx` (jsdom) — harness Puppeteer de instalação real fica pendente (mesmo precedente das specs 18/20/24, nunca configurado neste ambiente de execução).
