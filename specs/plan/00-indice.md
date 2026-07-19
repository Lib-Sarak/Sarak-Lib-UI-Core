# Índice de Implementação das Especificações

**É o arquivo de entrada obrigatório**: abra este arquivo sempre que for executar qualquer spec de `specs/plan/`, antes de editar qualquer coisa.

## Princípio vigente do planejamento

> **A Sarak-Lib-UI-Core é um renderizador genérico.** Ela declara CONTRATOS (tokens, gramática do manifesto, porta de persistência, fronteira de autenticação) e nunca escolhe a infraestrutura do consumidor (banco, provider, linguagem de backend, sistema de auth). Qualquer sistema que a importe deve montar 100% da sua interface via manifestos JSON — o piso de funcionalidade é o sistema `Sarak-MyService`. Origem deste princípio: dois testes reais de instalação plug-and-play (consumidores descartáveis `automacao` e `ERP`, 2026-07) + 2 relatórios de erro de agente, registrados em `00-progresso.md`.

## Antes de começar a editar (leitura obrigatória)

1. **Skill `ui-contexto-repositorio`** — acione primeiro, sempre. Carrega as regras estruturais/limites do módulo (3 camadas, Zero Hardcode, Zero Any, paridade 1:1:1:1:1:1, Configuração vs. Expansão) e as specs fundacionais de `specs/specs/`.
2. **`specs/plan/00-progresso.md`** — leia antes de tocar em qualquer spec. É o log de quem já executou o quê, como, e o que ficou pendente.
3. **A spec que você vai executar** (`specs/plan/NN-*.md`) — leia inteira, incluindo `relacionados:` no frontmatter.

## Skills de execução (acione conforme o tipo de tarefa que a spec pedir)

- **`ui-arquitetura-design`** — ao criar/revisar tokens e CSS Variables.
- **`ui-novo-componente`** — Expansão (token/componente novo, paridade 1:1:1:1:1:1 — a 6ª camada é o Registry do Manifesto).
- **`ui-refatorar-componente`** — deletar ou mudar assinatura de token/componente existente.
- **`ui-criar-preset` / `ui-criar-tema`** — presets/temas visuais (Configuração, não Expansão).
- **`ui-integra-consumidor`** — quando a spec muda algo que o sistema consumidor precisa acoplar.
- **`ui-auditoria-modulo`** — rode **sempre** antes de declarar uma spec concluída (`node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs`, meta: 0 falhas).
- Gates permanentes que nenhuma execução pode deixar vermelhos: `npx vitest run src/core/Manifest/__tests__/RegistryParity.test.tsx`, `npm run catalog:check`, `npm run build`. Suítes de teste: rode **por pasta** (`npx vitest run src/core/Manifest` etc.).

## Ao terminar de executar uma spec (obrigatório)

1. Atualize o `status:` no frontmatter da spec executada.
2. Marque o checkbox no Roteiro de Execução abaixo.
3. Adicione uma entrada em `specs/plan/00-progresso.md` (formato definido lá).

---

## Roteiro de Execução (ordem única — siga de cima para baixo, um item por vez)

> **Prompts prontos:** `specs/plan/00-prompts-execucao.md` contém um prompt autocontido para executar cada item abaixo numa conversa nova (P1-P8, na mesma ordem deste roteiro).

### Fase 1 — Renderização correta e modos de consumo (destrava o piso plug-and-play)

1. [x] **[16 - Tokens Semânticos e Validação de Valores](./16-tokens-semanticos-e-validacao-de-valores.md)** — BUG: `gap: "spacing-md"` vai cru pro CSS e é descartado em silêncio; catálogo não documenta VALORES permitidos. Resolutor oficial + warn em valor inválido + seção de tokens gerada no catálogo + gate. ✅ **Concluída (2026-07-17).**
2. [x] **[17 - Resiliência Leniente e DX de Erros](./17-resiliencia-leniente-e-dx-de-erros.md)** — erro de AUTORIA (ex.: `actions` como objeto) degrada por diretiva com warn, nunca derruba a tela; telas DX para payload ausente/inválido. ✅ **Concluída (2026-07-17).**
3. [x] **[18 - Shell Consome Design Engine](./18-shell-consome-design-engine.md)** — topbar/sidebar do shell do manifesto consomem os tokens que o Design Engine já emite (`--sarak-topbar-bg/height`, `--sarak-sidebar-bg`); `SarakShellNav.orientation` (`auto` segue `navigationStyle`). Paridade MyService. ✅ **Concluída (2026-07-17)** (E2E browser pendente no harness Puppeteer).
4. [x] **[24 - Modo Embarcado e Adoção Incremental](./24-modo-embarcado-adocao-incremental.md)** — a lib atende 2 modos: App (sistema nasce com a lib — validado) e Embarcado (renderizar via manifesto SOBRE frontend existente — hoje o Provider age como dono da página: preflight global, `document.title`, overlays fixos). `mode: 'app'|'embedded'`, CSS escopado (`.sarak-scope`), gate E2E de não-vazamento bidirecional, pergunta de modo na skill de importação (a pergunta JÁ existe na skill com aviso provisório — esta spec completa o fluxo). ✅ **Concluída (2026-07-18).**

### Fase 2 — Portas de infraestrutura (a lib declara contratos, não escolhe infra)

5. [x] **[19 - Porta de Persistência de UI](./19-porta-de-persistencia-ui.md)** — a lib declara só a estrutura das suas tabelas e operações; `schema`/`tablePrefix` configuráveis (fim do `ui_core` imposto); interface `UIStorageAdapter` (pg/sqlite = implementações de referência; Supabase/Firebase/etc. = exemplos documentados); contrato REST dos 5 endpoints documentado para backend em qualquer linguagem. ✅ **Concluída (2026-07-18).**
6. [x] **[20 - Fronteira de Autenticação](./20-fronteira-de-autenticacao.md)** — a lib só RENDERIZA a tela de login (`SarakAuthScreen` 100% manifestável); token/sessão/provider são do host via interceptors; receita canônica documentada; gate anti-acoplamento. ✅ **Concluída (2026-07-19).**

### Fase 3 — Redução de escopo e camada de instrução/instalação

7. [x] **[23 - Remoção do Design Agent](./23-remocao-design-agent.md)** — remove o agente LLM embarcado (`agent-design-operator/`, ~131 arquivos) e toda a superfície na lib (chat card, hooks, `options.designAgent`, tipos públicos, etapas de skill). **BREAKING CHANGE** (o MyService injeta `designAgent`) e **2 decisões HITL** (destino do código; manter ou não porta futura). Executar ANTES da 21/22 (a 23 e a 22 editam a skill `ui-integra-consumidor` — nesta ordem não há reconciliação). ✅ **Concluída (2026-07-19).**
8. [ ] **[21 - Scaffolder Init](./21-scaffolder-init.md)** + **[22 - Skills de Consumo: Golden Path](./22-skills-de-consumo-golden-path.md)** — **executar em CONJUNTO, nesta ordem** (prompt único P8): o `npx @sarak/lib-ui-core init` gera o boilerplate completo (modo App/Embarcado, Vite+Express monolítico / Next / frontend-only, peerDeps gravadas, skills copiadas) e em seguida as 3 skills de consumo passam a orquestrá-lo (Golden Path, anti-workspace, `source` com states, regra dura de tokens, linguagem de portas). Dependem de 16/19/20/24.

---

## Backlog arquivado (NÃO executar sem decisão explícita do mantenedor)

### Sub-plano "Design Agent" (specs 01-07) — CANCELADO pela spec 23 (executada)
As specs `01` a `07` evoluíam o agente LLM de temas, removido da biblioteca pela spec 23 (2026-07-19). **Estado real dos arquivos:** `02-mapeamento-semantico-rag-catalogo.md`, `03-separacao-estrutural-chat-acao.md`, `04-multi-preset-diversificado.md`, `05-ingestao-multimodal-html.md`, `06-pipeline-visao-dois-estagios.md` e `07-agente-llm-design-e-expansao-estrutural.md` **já não existem** neste repositório — foram apagados no commit `b8447cb` (bundle acidental numa spec não relacionada, Spec 17), antes mesmo da 23 ser escrita; não há o que marcar/cancelar neles. Só **`01-auditoria-cobertura-componentes.md`** sobreviveu e teve o frontmatter marcado `⚫ Cancelada (plan/23)` (o `git log` continua sendo a fonte do histórico integral). Nota de numeração: a spec 16 ORIGINAL desse sub-plano foi absorvida pela 02 e o arquivo removido — o número 16 foi reutilizado pela Fase 1 (arquivo novo e independente).

### Backlog secundário (specs 10-15) — despriorizado; reavaliar após as Fases 1-3
- **[10 - Responsividade no Gêmeo Digital](./10-responsividade-gemeo-digital.md)** — Tier A corrigido; falta só Tier B (Container Queries reais).
- **[13 - Revisão e Gestão de Brand](./13-revisao-e-upload-de-brand.md)**
- **[11 - Enriquecimento de Presets Visuais](./11-enriquecimento-presets-visuais.md)**
- **[12 - Expansão e Hospedagem de Mídias de Atmosfera](./12-expansao-midias-atmosfera.md)**
- **[14 - Visibilidade da Aba Design Engine](./14-visibilidade-aba-design-engine.md)** — ⚠️ reavaliar após a 23 e a 18: o mecanismo proposto é do shell LEGADO (Discovery); no motor atual a visibilidade é do manifesto do consumidor (basta não declarar a rota `/design`). Pode ter virado obsoleta.
- **[15 - Revisão e Limpeza de Marcadores TODO](./15-revisao-marcadores-todo.md)** — operacional; a 23 remove boa parte dos TODOs junto com o `agent-design-operator/`.
