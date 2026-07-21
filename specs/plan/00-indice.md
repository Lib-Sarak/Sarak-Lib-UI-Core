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

> **Prompts prontos:** `specs/plan/00-prompts-execucao.md` contém um prompt autocontido para executar cada item abaixo numa conversa nova (P1-P10, na mesma ordem deste roteiro).

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
8. [x] **[21 - Scaffolder Init](./21-scaffolder-init.md)** + **[22 - Skills de Consumo: Golden Path](./22-skills-de-consumo-golden-path.md)** — **executar em CONJUNTO, nesta ordem** (prompt único P8): o `npx @sarak/lib-ui-core init` gera o boilerplate completo (modo App/Embarcado, Vite+Express monolítico / Next / frontend-only, peerDeps gravadas, skills copiadas) e em seguida as 3 skills de consumo passam a orquestrá-lo (Golden Path, anti-workspace, `source` com states, regra dura de tokens, linguagem de portas). Dependem de 16/19/20/24. ✅ **Concluídas (2026-07-19).**

### Fase 4 — Selo da Onda (teste de aceitação em consumidor real)

9. [x] **[25 - Limpeza dos Testes Práticos](./25-limpeza-testes-praticos.md)** — remoção COMPLETA dos artefatos da Sarak-UI do consumidor de teste `Earendel/ERP` (frontend improvisado, adapter manual, skill copiada), preservando 100% do negócio do ERP; 3 decisões HITL (.env / schema remoto / commit). Prompt **P9**. ✅ **Concluída (2026-07-20).**
10. [x] **[26 - Instalação Teste (Selo da Onda)](./26-instalacao-teste.md)** — importar a Sarak-UI no ERP limpo com o objetivo de **TESTAR a instalação, não só instalar**: agente EXTERNO sem contexto, só caminho oficial (`init` + skills + catálogo), **contornos proibidos** (obstáculo se REGISTRA, não se contorna), matriz de medição **M1-M10** com evidências + `RELATORIO-INSTALACAO-UI.md` com veredito 0-10. Selo concedido se M1-M10 = PASS; senão, os achados viram a próxima rodada de correção e o teste se repete. Prompt **P10**. 🟡 **Executada (2026-07-20) — Selo NEGADO** (nota 6,5/10; 2 FAIL + 3 PARCIAL; triagem no `00-progresso.md`, rodada de correção → **Fase 5**).

### Fase 5 — Correção pós-Selo (fecha os achados do Selo negado e reabre o teste)

> Origem: `RELATORIO-SELO-ONDA-ACHADOS.md` + triagem da Spec 26 no `00-progresso.md`. Ordem: os dois FAIL/críticos primeiro (27, 28), depois a robustez de instalação (29), depois **desinstalar o ERP** (31) e só então o **re-Selo** (2ª execução da Spec 26). A Spec **40** (fechamento dos achados residuais das rodadas 1 e 2 — antiga Spec 30, renumerada e expandida) roda DEPOIS do re-Selo — não bloqueia o Selo. Por fim, a Spec **41 (Teste Real)** é a **2ª parte do teste**: implementar as funcionalidades REAIS do ERP 100% via manifesto, corrigindo qualquer lacuna NA FONTE. **A validação final de cada correção é o re-teste real, não a suíte unitária.**
>
> **Ciclo do re-Selo:** desinstalar (31) → reinstalar do zero e medir (26). O ERP hoje tem a instalação COMPLETA da rodada 1 na raiz — sem a limpeza, o teste mediria uma instalação por cima de outra. O relatório da rodada 1 está arquivado em `RELATORIO-INSTALACAO-UI-rodada1.md`.

11. [x] **[27 - Paridade de navigationStyle no Shell](./27-paridade-navigationstyle-shell.md)** — achado 0 (crítico): `navigationStyle: "topbar"` espreme a nav horizontal dentro do `<aside>` de 240px do `ShellRouterNode` (regressão vs. Shell legado; quebraria a migração do MyService). Realocação de região por `navigationStyle` + fonte única de leitura com o `SarakShellNav`. Reclassifica **M7 → FAIL**. Prompt **P11**. 🟡 **Executada (2026-07-20)** — unitário verde; validação definitiva é o re-Selo (item 15).
12. [x] **[28 - Gate de Submit à prova de erro de autoria](./28-gate-submit-validacao.md)** — achados 1 (M6 FAIL) + M9: o gate de validação EXISTE e funciona, mas é burlado em SILÊNCIO (`submit` no lugar errado / sem form-escopo → api_call envia dado vazio, toast de sucesso). Leniência de posicionamento + `console.warn` defensivo + shape de `validation` documentado (skill/catálogo). Prompt **P12**. 🟡 **Executada (2026-07-20)** — gates verdes; validação definitiva é o re-Selo (item 15).
13. [x] **[29 - Robustez da primeira instalação](./29-robustez-instalacao-pacote.md)** — achados 4/3/2/5: `files`/`.npmignore` no `package.json` (parar de publicar o fonte inteiro); `--help` real + guard de TTY no `bin/sarak-ui.mjs`; skill `ui-integra-consumidor` manda garantir `package.json` (npm init -y) antes do `npm install github:` + documenta "salvar novo tema". Prompt **P13**. 🟡 **Executada (2026-07-20)** — gates/smoke verdes; validação definitiva é o re-Selo (item 15).
14. [x] **[31 - Limpeza da Rodada 2 (desinstalar do ERP)](./31-limpeza-rodada2-erp.md)** — pré-requisito do re-Selo: remove a instalação COMPLETA da rodada 1 da **raiz** do ERP (`src/`, `node_modules/`, `dist/`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `database.sqlite`, `package.json`+lock, skills de UI em `.agents` **e** `.claude`). ⚠️ **Não reusou a Spec 25** — o inventário dela apontava para `frontend/`, pasta que não existia mais (a rodada 1 instalou na raiz). 5 decisões HITL resolvidas. ✅ **Concluída (2026-07-20).**
15. [ ] **Re-Selo da Onda (2ª execução da [Spec 26](./26-instalacao-teste.md))** — depois de 27+28+29 executadas E revisadas **e** da limpeza (31), reinstalar o ERP do zero e repetir o protocolo (agente externo, contornos proibidos, matriz M1-M10). Meta: M1-M10 = PASS. **Deve forçar ≥1 tela com grid/cards** (a rodada 1 só exercitou flex+form+lista — lacuna de cobertura registrada no relatório). Prompt **P15**.
16. [ ] **[40 - Fechamento de Achados pós-Selo](./40-fechamento-achados-pos-selo.md)** — *(era a Spec 30 "Polimento", renumerada para 40 e EXPANDIDA)* — fecha TODOS os achados residuais das rodadas 1 e 2 do Selo: chave natural do `renderFor` (`hash`), code-splitting do bundle (baseline 3,9 MB / 993 KB gzip + `manualChunks` no `init`), warning de `input[type=color]`, **zerar `src/` do pacote** (M9→PASS puro, mover `sarak-base.css` p/ `dist/`), **`SarakActionCard` genérico** (hoje é card de LLM com botão "Executar" fixo — lacuna de contrato, não polimento) + varredura de strings de UI hardcoded, e **doc do fluxo do Design Engine** ("Commit por categoria → Aplicar → Salvar Novo Tema"). Prompt **P16**.
17. [ ] **[41 - Teste Real](./41-teste-real.md)** — **2ª parte do teste em consumidor real:** implementar as funcionalidades REAIS do ERP (Propostas/Contratos/Projetos) com conexões REAIS (Supabase do ERP), **100% via manifesto**. Regra de ouro: no importador **só o `manifest.json` muda**; qualquer lacuna da lib é corrigida **NA FONTE**, nunca adaptada no ERP (fix-at-source iterativo, diferente da Spec 26 que só mede). Prova que a lib sustenta produção, não só demo. Prompt **P17**.

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
