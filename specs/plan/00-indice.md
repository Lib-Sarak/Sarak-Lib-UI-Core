# Índice de Implementação das Especificações (Por Complexidade)

Este guia define a ordem recomendada para a implementação das especificações presentes na pasta `plan`, ordenadas da **maior complexidade estrutural para a menor**. **É o arquivo de entrada obrigatório**: abra este arquivo sempre que for executar qualquer spec de `specs/plan/`, antes de editar qualquer coisa.

## Antes de começar a editar (leitura obrigatória)

1. **Skill `ui-contexto-repositorio`** — acione primeiro, sempre. Ela lê as specs fundacionais da arquitetura (`specs/specs/00-manifesto-arquitetural-ui-core.md`, `03-padrao-e-taxonomia-biblioteca-atomica.md`, `08-consumo-externo-e-integracao.md`, `09-expansao-vs-configuracao.md`, `06-presets-engine.md`, `05-cobertura-de-testes.md`) e carrega as regras estruturais/limites do módulo (3 camadas, Zero Hardcode, Zero Any, paridade 1:1:1:1:1, Configuração vs. Expansão).
2. **`specs/plan/00-progresso.md`** — leia antes de tocar em qualquer spec. É o log de quem já executou o quê, como, e o que ficou pendente — evita retrabalho e contradição com decisões já tomadas por uma execução anterior.
3. **A spec que você vai executar** (`specs/plan/NN-*.md`) — leia inteira, incluindo `relacionados:` no frontmatter (specs referenciadas que dão contexto adicional).

## Skills de execução (acione conforme o tipo de tarefa que a spec pedir)

- **`ui-arquitetura-design`** — ao criar/revisar tokens e CSS Variables (pipeline Schema → Master Map → CSS Variables).
- **`ui-novo-componente`** — quando a spec exige **Expansão** (token/propriedade/componente novo, paridade 1:1:1:1:1 nas 5 camadas).
- **`ui-refatorar-componente`** — quando a spec exige deletar ou mudar a assinatura de um token existente.
- **`ui-criar-preset` / `ui-criar-tema`** — quando a spec é sobre presets/temas visuais (Configuração, não Expansão).
- **`ui-integra-consumidor`** — quando a spec muda algo que o sistema consumidor (`Sarak-MyService` ou outro) precisa acoplar (ex.: novo campo em `SarakUIOptions`).
- **`ui-auditoria-modulo`** — rode **sempre** antes de declarar uma spec concluída (`node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs`, meta: 0 falhas).

## Ao terminar de executar uma spec (obrigatório)

1. Atualize o `status:` no frontmatter da spec executada (`🔴 A Implementar` → `🟡 Em Progresso` ou `🟢 Implementado`, conforme o caso).
2. Marque o checkbox correspondente no **Roteiro de Execução** abaixo.
3. **Adicione uma entrada em `specs/plan/00-progresso.md`** (formato definido no próprio arquivo) — resumo do que foi feito, arquivos tocados, desvios da spec original, pendências. Isso é o que permite um agente sênior avaliar o trabalho sem reler todo o diff.

> **Nota:** a spec 16 foi absorvida pela 02 (redireciona, não editar mais o arquivo 16). A spec 07 teve sua Seção 7 reescrita para refletir a arquitetura real (Node/Express, `agent-design-operator/`) — o plano original de scaffold Python/Template-Py nunca foi implementado.

## Roteiro de Execução (ordem única, do início ao fim)

Esta é a ordem real recomendada — siga de cima pra baixo, um item por vez. As seções "Nível X" logo abaixo dão o *porquê* de cada um, mas a numeração aqui é a que vale.

1. [~] **[03 - Separação Estrutural: Chat Nunca Expõe Valores](./03-separacao-estrutural-chat-acao.md)** — pura correção de arquitetura, desbloqueia confiabilidade, independe de conteúdo novo. Falta só o Critério 5 (latência real medida contra provider LLM — sem credencial disponível no ambiente de execução).
2. [~] **[01 - Auditoria de Cobertura de Componentes](./01-auditoria-cobertura-componentes.md)** — fundação de conteúdo pra 02/04. Backlog refeito (28/28 famílias, ghost vars revalidadas); falta só a revisão HITL formal do documento antes de virar tarefas de `ui-novo-componente`.
3. [x] **[02 - Gabarito Semântico e Preenchimento Fatiado do Catálogo (ex-RAG)](./02-mapeamento-semantico-rag-catalogo.md)** — depende da 01. Implementado 2026-07-12, **revisado no mesmo dia**: a 1ª versão (retrieval semântico) quebrou o Design Agent em produção (provider `local` + threshold 0.7 devolvia 0 resultados — a Chamada B ficava sem nenhuma chave disponível). Reescrita: gabarito completo (`getDesignScaffold()`) + preenchimento fatiado por família (6 chamadas em paralelo, `theme_orchestrator.ts`) — ataca o truncamento na SAÍDA, que sempre foi a causa raiz real (Spec 03 §1). `description`/`axis` nos 416 tokens mantidos. Retrieval engavetado (`_shelved/`), não deletado.
4. [ ] **[04 - Multi-Preset Diversificado por Eixo](./04-multi-preset-diversificado.md)** — depende da 02.
5. [ ] **[05 - Ingestão Multimodal via Conversão Unificada para HTML](./05-ingestao-multimodal-html.md)** — maior esforço isolado; ferramenta de conversão (LibreOffice headless) já decidida na Seção 5 da spec, pode executar direto.
6. [ ] **[06 - Pipeline de Visão em 2 Estágios](./06-pipeline-visao-dois-estagios.md)** — depende da 05 (imagens extraídas de link/PDF/PPT) e da 02 (retrieval).
7. [ ] **[07 - Agente LLM: Operador de Design e Expansão Estrutural](./07-agente-llm-design-e-expansao-estrutural.md)** — fechamento/guarda-chuva: só marca 🟢 quando as pendências das specs 03/02 nela referenciadas estiverem cobertas pelos itens 1-6.
8. [ ] **[10 - Responsividade e Isolamento de Viewport no Gêmeo Digital](./10-responsividade-gemeo-digital.md)** — Tier A (3 bugs originais) já reverificado como corrigido nesta rodada; só falta o Tier B (Container Queries reais, Seção 8 da spec).
9. [ ] **[13 - Revisão e Gestão de Brand (Logo, Cores e Brandbook)](./13-revisao-e-upload-de-brand.md)**
10. [ ] **[11 - Enriquecimento de Presets Modulares e Diversidade Visual](./11-enriquecimento-presets-visuais.md)**
11. [ ] **[12 - Expansão e Hospedagem de Mídias de Atmosfera](./12-expansao-midias-atmosfera.md)**
12. [ ] **[14 - Controle de Visibilidade da Aba Design Engine](./14-visibilidade-aba-design-engine.md)**
13. [ ] **[15 - Revisão e Limpeza de Marcadores TODO](./15-revisao-marcadores-todo.md)**

## Nível 0: Sub-plano "Design Agent" (specs 01-06 + 07) — por quê desta ordem
Estas 7 specs formam um sub-plano coeso (evolução do Design Agent):
- **03 primeiro** — pura correção de arquitetura, desbloqueia confiabilidade, independe de conteúdo novo.
- **01 → 02** — fundação de conteúdo (sem elas, a spec 04 produziria diversificação artificial).
- **04** — depende da 02.
- **05 → 06** — maior esforço isolado do sub-plano (spec 05 toca segurança/SSRF e introduz dependência de infra nova — LibreOffice headless, já decidida), mais seguras por último.
- **07** — spec guarda-chuva/já parcialmente implementada (arquitetura base do agente, Camada 6 estrutural). As pendências que restam nela são cobertas pelas specs 01-06.

## Nível 1: Alta Complexidade (Arquitetura e Refatoração Estrutural)

**[10 - Responsividade e Isolamento de Viewport no Gêmeo Digital](./10-responsividade-gemeo-digital.md)**
- **Por que é o mais complexo:** Demanda uma quebra do padrão tradicional de Media Queries do CSS para garantir que o Gêmeo Digital responda ao seu próprio container simulado e não ao viewport do monitor. Envolve mudanças arquiteturais na forma como a responsividade é tratada no sistema inteiro.

## Nível 2: Média Complexidade (Integração e Dados)

**[13 - Revisão e Gestão de Brand (Logo, Cores e Brandbook)](./13-revisao-e-upload-de-brand.md)**
- **Por que é complexo:** Envolve integração com Object Storage para upload de arquivos, lógica de geração automática de escalas de cores e mapeamento reativo de tipografia direto no Payload JSON.

**[11 - Enriquecimento de Presets Modulares e Diversidade Visual](./11-enriquecimento-presets-visuais.md)**
- **Por que é complexo:** Depende de um fluxo obrigatório de Human-in-the-Loop (HITL) e a expansão considerável da base de dados e tipagens (TS) para suportar diversos presets estéticos complexos e radicais.

**[12 - Expansão e Hospedagem de Mídias de Atmosfera](./12-expansao-midias-atmosfera.md)**
- **Por que é complexo:** Requer setup de infraestrutura externa (Supabase Storage, já decidido na Seção 4 da spec), rotinas de otimização pesada de mídias (conversão para WebP/WebM, controle de tamanho e loop) e conexão dessas URLs geradas com o catálogo da biblioteca.

## Nível 3: Baixa Complexidade (Condicionais e Débito Técnico)

**[14 - Controle de Visibilidade da Aba Design Engine](./14-visibilidade-aba-design-engine.md)**
- **Por que é simples:** Trata-se de uma melhoria pontual de Inversão de Controle, passando a exigir uma prop (`showDesignEngineTab`) no `SarakUIProvider` para renderizar condicionalmente a aba de navegação.

**[15 - Revisão e Limpeza de Marcadores TODO](./15-revisao-marcadores-todo.md)**
- **Por que é simples:** É uma tarefa puramente operacional de varredura de débito técnico. A contagem original (233) está desatualizada — recontagem feita na Seção 1 da spec aponta 120 ocorrências reais hoje, quase todas (118) só 2 templates repetidos de scaffold de teste.
