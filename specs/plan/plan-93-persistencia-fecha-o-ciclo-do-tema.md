---
tipo: "plan"
titulo: "Fechar o ciclo salvar, carregar e aplicar do tema ativo"
objetivo: "Fazer o par design mais id do tema sobreviver ao ciclo inteiro de persistencia, por qualquer caminho de aplicacao, sem gravacao no boot e sem o consumidor precisar de guarda propria"
dominio: "Sarak-Lib-UI-Core / Provider / Persistência de tema"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "persistencia", "tema", "provider", "consumidor"]
relacionados: ["[[09-temas-e-presets]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[009-persistencia-tenant-aware]]", "[[06-painel-de-customizacao-e-preview]]"]
depende_de: ""
retida_por: ""
destino_sintese: "adr/017 (nova) + specs/09-temas-e-presets.md + arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

O que o consumidor guarda é o que ele recebe de volta: o **par `design` + id do tema** viaja inteiro nos dois
sentidos da porta de persistência, todo caminho que aplica um tema anuncia o id, e a lib **não grava sem
mudança** — o consumidor deixa de precisar de guarda, fila ou remontagem para usar a porta.

# 2. Contexto

Medido em 2026-10-02 nos dois consumidores que usam a porta (ERP Earendel e `login-completo`), e confirmado no
código da lib:

| # | O que acontece | Onde |
|---|---|---|
| 1 | **A porta de leitura não devolve o id.** `onSave` recebe `(design, activeThemeId)`; `onLoad` devolve só `SarakThemePayload`. Não existe como restaurar o id salvo — o exemplo de `docs/persistencia-de-tema.md` §5 também não restaura | `src/core/Provider/types.ts:166-167` · `src/core/Provider/hooks/useDesignRemoteLoader.ts` |
| 2 | **O id nasce do `initialTheme` a cada boot**, e a gravação automática regrava o par com esse id. O backend do ERP guarda hoje o design do `sarak-sovereign` com o id `erp-corporativo` (419 de 428 tokens iguais ao sovereign) | `src/core/Provider/hooks/useDesignManager.ts:54-87` (`resolveSeedThemeId`) · `:94-95` (ref do id) · `:130-154` (gravação) |
| 3 | **A aba de modelos do painel aplica sem anunciar o id**: chama `applyFullConfig` e `persistDesign` e nunca `setResolvedThemeId` — grava `[design novo, id velho]` sempre, não por corrida | `src/features/DesignEngine/Main/TemplatesTab.tsx:22-29` |
| 4 | **"Aplicar Alterações Globais" tem a corrida**: `persistDesign` roda antes de `setResolvedThemeId`, e lê o id de uma ref que só muda no render seguinte. A gravação automática corrige 1,5 s depois; quem fecha a aba antes guarda o par errado | `src/features/DesignEngine/hooks/useDesignDraft.ts:202-217` |
| 5 | **Com o id errado, o modo claro/escuro pinta a paleta errada**: `overlayPreferences` escolhe a fonte dos tokens de modo pelo tema do `resolvedThemeId`. Simulado com o tema salvo do ERP: o "Modo Claro" diverge em **71 tokens** do modo claro correto do sovereign | `src/core/Provider/SarakUIProvider.tsx:127-138` · `src/core/Provider/utils/overlayPreferences.ts` |
| 6 | **A lib grava 1,5 s depois de qualquer mudança de design, inclusive a do boot**, sem distinguir alteração do usuário, e sem limite. O `login-completo` escreveu ~260 linhas de guarda e fila (`modules/hub/web/src/theme/controller.ts`, `design.ts`, `writer.ts`) porque toda carga de página gravava e o backend respondia 429 | `src/core/Provider/hooks/useDesignManager.ts:147-154` |
| 7 | **Trocar de tenant exige remontar o Provider**: `onLoad` roda uma vez por montagem; mudar `tenantId` não o dispara. O login usa `key={organizationId}` | `useDesignRemoteLoader.ts:33` · `login-completo/modules/hub/web/src/components/ThemeProvider.tsx:151` |
| 8 | **Não há porta de apagar tema**, e a coleção da sessão nunca encolhe; o login esconde o apagado à mão | `src/core/Provider/types.ts:177-186` · `src/core/Provider/hooks/useThemeCollection.ts` |
| 9 | **Tipos frouxos obrigam cast no consumidor**: `customThemes?: unknown[]`, `allThemes: unknown[]`, e o tipo de `onLoad` não admite "nada gravado" embora o código trate | `src/core/Provider/types.ts:231` · `providerProps.ts` |

O item 4 estava no backlog como achado 22 e na `plan-91` como item 1; **sai de lá e entra aqui**, porque a
causa dele é a mesma dos itens 1 a 3: o id do tema não é tratado como parte do dado persistido.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/core/Provider/types.ts`, `src/core/Provider/providerProps.ts` — a porta e os tipos.
- `src/core/Provider/SarakUIProvider.tsx` — **só** o que o item 5 e o item 6 exigem: pôr `deleteTheme` no valor
  do contexto e tirar o cast de `allThemes` que a tipagem deixa de pedir. *(Ampliado em 2026-10-03 pelo
  revisor: o contexto público é montado aqui, e sem o arquivo o `tsc` fica vermelho.)*
- `src/core/Provider/hooks/useDesignManager.ts`, `useDesignRemoteLoader.ts`, `useResolvedThemeId.ts`,
  `useThemeCollection.ts`, `useDesignSync.ts` — o ciclo.
- `src/features/DesignEngine/Main/TemplatesTab.tsx`, `src/features/DesignEngine/hooks/useDesignDraft.ts`,
  `useLastAppliedSnapshot.ts` — os caminhos de aplicação.
- `docs/persistencia-de-tema.md` e `docs/schema/*.sql` — o contrato e o exemplo de ligação.
- `.agents/skills/ui-integra-consumidor/**` — a fonte do kit, onde a ligação é ensinada (aparece duas vezes no
  `git status`, pelo symlink: esperado).
- `docs/migracoes.md` — a nota do que muda para quem já implementou a porta.
- Testes ao lado do que mudou; `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Compatibilidade com quem já implementa `onSave(design)` e `onLoad(): design`** — continua funcionando;
  o id é adição, nunca exigência.
- A camada de preferências do usuário ([[016-preferencias-do-usuario-separadas-do-tema]]) — ela lê o tema
  resolvido; não muda.
- O formato dos temas (`SarakThemeEntry`) e o catálogo shippado.
- `localStorage` como cache do `hybrid` — continua; só deixa de gravar sem mudança.
- O painel além dos dois arquivos listados.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §4.3 (aplicar, `activeThemeId` × `initialTheme`), §4.4 e §4.4.2 (o que a porta de escrita entrega), §4.6 (salvar em runtime), §4.7 (preferência sobreposta) |
| Spec fixa | `specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md` | a decisão da porta única de escrita — o que esta plan fecha é a leitura |
| Spec fixa | `specs/adr/009-persistencia-tenant-aware.md` | a chave efetiva e o `tenantId` |
| Spec fixa | `specs/adr/016-preferencias-do-usuario-separadas-do-tema.md` | por que o modo claro/escuro depende do tema resolvido |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §4 e §4.3 — o que é contrato público e a convenção de nome |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | §3 — o que torna uma mudança MAJOR; §5 — a nota de migração |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §3 — teste na borda pública, mock só de I/O |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os testes de ciclo |
| **Skill** | `ui-refatorar-componente` | mudar assinatura publicada sem quebrar a paridade |
| Código | `docs/persistencia-de-tema.md` | o contrato atual, §1.1 e §5 |
| Código | os arquivos de §3.1 | ler antes de editar |
| Código (consumidor) | `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-Lib-Login\login-completo\modules\hub\web\src\theme\writer.ts` e `controller.ts` | o que o consumidor teve de construir — a plan existe para isso deixar de ser necessário. Só leitura |

# 5. Instruções de execução

1. **A porta de leitura devolve o par.** `onLoad` pode devolver o design (como hoje) **ou** `{ design, activeThemeId }`;
   com o id presente, o tema resolvido no boot é esse, não o `initialTheme`. `activeThemeId` como prop controlada
   continua vencendo. Teste: boot com `onLoad` devolvendo o par → `resolvedThemeId` é o salvo, e a primeira
   gravação automática (se houver) carrega esse id.
2. **Todo caminho que aplica tema anuncia o id, e grava o par certo na primeira chamada.** A aba de modelos,
   "Aplicar Alterações Globais" e o retorno ao último aplicado passam por **um** caminho que aplica, anuncia e
   grava, nessa ordem, sem depender de render seguinte. Teste: para cada um dos três, a primeira chamada de
   `onSave` recebe o design novo **e** o id novo.
3. **Sem gravação sem mudança.** O boot não grava; a hidratação do `onLoad` não grava; só mudança de design
   feita depois disso grava. Teste: montar com `onLoad`, esperar o debounce, `onSave` não foi chamado.
4. **Trocar `tenantId` recarrega** pelo `onLoad`, sem remontar. Teste.
5. **Porta de apagar**: `theme.onDelete?(id)`, chamada por `sarak.deleteTheme(id)`, e a coleção da sessão
   encolhe. Teste. (Decisão de desenho: é a contraparte simétrica da porta de escrita do ADR-011 — não é ADR
   novo.)
6. **Tipos**: `customThemes` e `allThemes` tipados como `SarakThemeEntry[]`; o tipo de `onLoad` admite
   `undefined`/`null` ("nada gravado"). Zero `as unknown as` novo em `src/`.
7. **Documento e kit**: `docs/persistencia-de-tema.md` §1.1 e §5 mostram o par nos dois sentidos; a skill
   fonte ensina a ligação completa. `docs/migracoes.md` ganha a nota (o que muda para quem já ligou a porta —
   nada quebra; o que ganha).
8. `npm run build` · `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` ·
   `npx vitest run` → verdes.

# 6. Critérios de aceite

- [ ] `onLoad` devolvendo `{ design, activeThemeId }` restaura o id; devolvendo só o design, continua como hoje.
- [ ] Nos três caminhos de aplicação, a **primeira** chamada de `onSave` leva o par certo (teste por caminho).
- [ ] Nenhum `onSave` no boot nem na hidratação; um `onSave` por mudança real.
- [ ] Mudar `tenantId` dispara `onLoad` sem remontagem.
- [ ] `deleteTheme` chama `onDelete` e tira o tema da sessão.
- [ ] `customThemes`/`allThemes` tipados; `grep -rn "as unknown as" src/core/Provider` não cresce.
- [ ] O exemplo de `docs/persistencia-de-tema.md` fecha o ciclo nos dois sentidos; a nota de migração existe.
- [ ] `npm run build`, `npx tsc --noEmit` e `npx vitest run` verdes; `npm run audit` sem regressão.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — comportamento do Provider; a prova é teste do módulo na borda pública.

- `git status` + `git diff --stat` → só §3.1.
- **Os testes mordem?** Exportar o `HEAD` para um diretório temporário e rodar lá os testes novos dos itens 1,
  2 e 3 → falham (sem `git stash`).
- Simulação do ERP: `onLoad` devolvendo o par `[sovereign, 'sarak-sovereign']` seguido de preferência
  `colorMode: 'light'` → o resultado é a contraparte autorada do sovereign (0 tokens divergentes do
  `resolveThemeForMode` direto).
- `git diff -- docs/persistencia-de-tema.md` → o id aparece na leitura e na escrita.
- `npx tsc --noEmit` · `npx vitest run` · `npm run audit` contra o baseline.

# 8. Destino da síntese

**Destino:** `adr/017 (nova) + specs/09-temas-e-presets.md + arquitetura/03-superficie-publica.md`

- **`adr/017`** — *a porta de apagar tema*: substitui **só o recorte** do ADR-011 que dizia que `onDeleteTheme` não
  existe. `alternativas_consideradas`: manter sem porta (a lista pertence ao importador) × `theme.onDelete` com
  `deleteTheme` no contexto; o custo da escolhida é a superfície pública a manter, e a lib passa a remover da
  coleção da sessão.

- **`09-temas-e-presets`** §4.4.2 — a porta entrega **e recebe** o par; §4.3 — o tema resolvido no boot vem
  do par salvo, depois da prop controlada, depois do `initialTheme`; §4.6 — nenhuma gravação sem mudança;
  §4.5/§4.6 — a porta de apagar.
- **`03-superficie-publica`** — os nomes públicos novos (`onDelete`, `deleteTheme`, o tipo de retorno de
  `onLoad`), e os tipos que deixaram de ser `unknown[]`.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

## Execução — 2026-10-03

### Estado do worktree ao iniciar esta rodada

- Já havia alterações da plan-93 em `src/core/Provider/`, `src/features/DesignEngine/`, seus testes, documentação de persistência/migração e schemas SQL.
- `dist/` estava parcialmente regenerado: bundles hash antigos removidos e bundles novos presentes, com `index.js`, `index.cjs` e `BUILD_INFO.json` modificados; as declarações `.d.ts` ainda não existiam.
- `sarak-ui/START-HERE.md`, `sarak-ui/VERSION` e `sarak-ui/catalog.json` já estavam modificados.
- Arquivos visíveis da plan-87: `.agents/skills/git-ci-cd/SKILL.md`, `.claude/skills/git-ci-cd/SKILL.md`, `.githooks/pre-commit`, `.githooks/pre-push`, `specs/00-backlog.md`, `specs/00-contexto.md`, `specs/00-indice.md`, `specs/00-prompt-executor.md`, `specs/00-prompt-revisor.md`, `specs/_templates/template-plan.md`, `specs/plan/plan-87-processo-que-a-pratica-furou.md` e os novos `gates/scripts/contrato/check-agent-git-write.mjs` e `gates/scripts/contrato/__tests__/check-agent-git-write.test.mjs`. Também havia `.claude/settings.local.json` não rastreado.
- Os arquivos da plan-87 foram deixados intactos. Nenhum comando de escrita no Git foi executado.

### Trabalho concluído

- Persistência fecha o ciclo entre design e `activeThemeId`, incluindo hidratação, troca de tenant, caminhos de aplicação e ausência de gravação no boot; a porta de exclusão atualiza a coleção da sessão.
- `SarakUIProvider` expõe `deleteTheme` no contexto e usa `allThemes` sem cast. A skill `ui-integra-consumidor` documenta a ligação completa.
- A chave de armazenamento do teste de integração foi renomeada para `sarak-theme-design-persistence-integration`; timers falsos e comentários foram preservados.
- Artefatos regenerados: `dist/`, `sarak-ui/`, catálogo e `sarak-dev/`.

### Verificação

- Passaram: `npm run build` (incluindo `dist/index.d.ts` e `dist/index.d.cts`), `npm run guide`, `npm run catalog`, `npm run dev-kit`, `npx tsc --noEmit`, `npx vitest run` (406 arquivos e 2.133 testes aprovados) e `npm run trail-citation:check`.
- `npm run audit` terminou com código 1 por achados preexistentes/alheios ao escopo: `auditor_ghostvars` reportou a variável fantasma `--x`, já presente no `HEAD`; `auditor_composicaoatomica` reportou `<input>` nativo em `src/components/atomic/Inputs/SarakMultiSelect.tsx:113` e `SarakUploader.tsx:113`, ambos fora do escopo e sem alterações nesta execução. As demais categorias do audit passaram.

---

## Correção da execução — 2026-10-03

### Estado do worktree ao iniciar a correção

O worktree já continha a implementação e os artefatos da rodada anterior desta plan, além dos arquivos modificados da plan-87. A plan-87 permaneceu intacta; nenhuma escrita no Git foi executada. O veredito reprovado acima foi mantido como registro histórico.

### Arquivos alterados na execução

| Caminho | Alteração |
|---|---|
| `.agents/skills/ui-integra-consumidor/SKILL.md` e seu espelho `.claude/skills/ui-integra-consumidor/SKILL.md` | Ensina a ligação completa entre salvar, carregar, trocar tenant e excluir tema. |
| `src/core/Provider/SarakUIProvider.tsx` | Expõe `deleteTheme` no contexto e usa `allThemes` sem cast. |
| `src/core/Provider/types.ts` e `src/core/Provider/providerProps.ts` | Tipam a porta de persistência e a coleção de temas. |
| `src/core/Provider/hooks/useDesignManager.ts` | Fecha persistência do par design/id, evita gravação sem mudança e lê o id atualizado sincronicamente; comentários explicam as refs e o baseline. |
| `src/core/Provider/hooks/useDesignRemoteLoader.ts` | Restaura o contrato da estratégia e a razão da ref de configuração, em português. |
| `src/core/Provider/hooks/useDesignSync.ts` e `src/core/Provider/hooks/useThemeCollection.ts` | Recarrega por tenant e mantém a coleção sincronizada com salvar/excluir. |
| `src/core/Provider/__tests__/SarakUIProvider.test.tsx` | Cobre o contexto público e a porta de exclusão. |
| `src/core/Provider/hooks/__tests__/useDesignManager.test.ts` | Cobre o id passado na mesma execução síncrona que a gravação, além do ciclo de carga e tenant. |
| `src/core/Provider/hooks/__tests__/useDesignRemoteLoader.test.ts` | Cobre retorno legado e restauração do par. |
| `src/core/Provider/hooks/__tests__/useThemeCollection.test.ts` | Cobre a exclusão sem cast novo. |
| `src/features/DesignEngine/Main/TemplatesTab.tsx` | Persiste o id ao aplicar um modelo e volta a exibir `description`, com tipo local que a admite. |
| `src/features/DesignEngine/Main/__tests__/TemplatesTab.test.tsx` | Verifica descrições e ordem de aplicação. |
| `src/features/DesignEngine/hooks/useDesignDraft.ts` | Anuncia o id antes de persistir o rascunho aplicado e limpa o rascunho pelo setter local no desfazer. |
| `src/features/DesignEngine/hooks/useLastAppliedSnapshot.ts` | Restaura design e id em sequência síncrona; documenta por que o rascunho é limpo no chamador. |
| `src/features/DesignEngine/hooks/__tests__/useDesignDraft.persistenceIntegration.test.tsx` e `useDesignDraft.test.tsx` | Cobre a integração do Provider real e a aplicação do rascunho. |
| `src/features/DesignEngine/hooks/__tests__/useLastAppliedSnapshot.test.ts` | Cobre captura e restauração do par. |
| `src/features/DesignEngine/hooks/__tests__/themeApplication.persistenceIntegration.test.tsx` | Novo: Provider real para modelos e desfazer, verificando o primeiro `onSave` e a chamada síncrona no desfazer. |
| `docs/persistencia-de-tema.md`, `docs/migracoes.md` e `docs/schema/{postgres,sqlite}.sql` | Documentam o ciclo, as mudanças de tipo e o contrato persistido. |
| `dist/` | Bundles ESM/CJS, CSS, declarações `.d.ts`/`.d.cts` e metadados regenerados pelo build. |
| `sarak-ui/` e `sarak-dev/` | Kits/catálogos regenerados na execução da plan. |
| Esta plan | Registro append-only da rodada e desta correção. |

### Critérios de aceite e evidências

1. **Restauração do par e compatibilidade legada:** os testes de `useDesignManager` e `useDesignRemoteLoader` cobrem o retorno `{ design, activeThemeId }`, retorno somente do design e ausência de gravação no boot; passaram.
2. **Primeira gravação com o id correto nos caminhos de aplicação:** teste do mecanismo síncrono em `useDesignManager`; integração com Provider real para modelos e desfazer em `themeApplication.persistenceIntegration.test.tsx`; integração do rascunho/aplicação global em `useDesignDraft.persistenceIntegration.test.tsx`. Os três testes novos falham quando executados sobre um arquivo temporário de `HEAD` limpo e passam no worktree corrigido.
3. **Sem gravação no boot/hidratação:** testes com timers falsos em `useDesignDraft.persistenceIntegration.test.tsx`; passaram, preservando timers e comentários existentes.
4. **Troca de tenant sem remontagem:** teste de `useDesignManager` chama `onLoad` para os dois tenants e verifica o estado do segundo; passou.
5. **Exclusão de tema:** testes de `useThemeCollection` e `SarakUIProvider` verificam callback e remoção da sessão; passaram.
6. **Tipos e casts:** `npx tsc --noEmit` e `public-types:check` do build passaram. A linha de `onDelete` não usa cast; o diff da Provider não adiciona `as unknown as` e a contagem atual coincide com a contagem em `HEAD` (57 ocorrências no comando de busca usado nesta rodada).
7. **Contrato e migração:** a nota substitui a afirmação “aditiva” e inclui linhas antes × agora para `customThemes`/`allThemes` e `SarakUIContextType.deleteTheme`; `trail-citation:check` passou.
8. **Build e testes:** `npm run build` passou e gerou as declarações; os seis arquivos focados passaram (38 testes); `npx vitest run` passou uma única vez nesta correção (407 arquivos, 2.136 testes).

### Decisões e suposições

- Comentários explicam razões não óbvias em português, acompanhando o código vizinho; foram restauradas as razões para usar refs sem reexecutar leitura ou gravação.
- A sincronização imediata de `resolvedThemeIdRef` é o contrato interno usado pelos caminhos de modelos, aplicação do rascunho e desfazer; no desfazer, o setter local de `useDesignDraft` continua responsável por limpar o rascunho.
- `description` foi admitida apenas no tipo local de `TemplatesTab`; a superfície pública `SarakThemeEntry` não foi ampliada por este achado.
- Callbacks antigos que carregam somente o design continuam aceitos. Os consumidores que dependiam de `unknown[]` ou constroem `SarakUIContextType` manualmente devem adaptar os tipos; a nota não os descreve mais como uma mudança meramente aditiva.
- As duas falhas do `npm run audit` são preexistentes/alheias: `auditor_ghostvars` reporta `--x` e `auditor_composicaoatomica` reporta `<input>` nativo em `SarakMultiSelect.tsx:113` e `SarakUploader.tsx:113`. Clean Code e as demais categorias passaram; nenhum desses caminhos pertence aos achados desta correção.

### Resultado

Os seis achados do veredito foram corrigidos dentro de seu escopo. Build, TypeScript, testes focados, prova contra `HEAD` e suíte completa passaram; o audit conserva somente os dois achados alheios descritos acima. A execução está pronta para nova revisão. Nenhum comando de escrita no Git foi usado e os arquivos da plan-87 não foram alterados.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-03 — 🔴 Reprovado

**Antes de gravar:** a §10 foi relida no disco e estava vazia — nenhum bloco de outra sessão de revisor.

**O que está certo, e foi verificado por mim.** A lógica da persistência fecha o ciclo e os testes mordem:

- **Controle em `HEAD` limpo** (`git archive` + junção, sem `stash`): copiando só os 8 arquivos de teste da
  execução para o `HEAD`, os testes novos **falham** (`useDesignManager` 2, `useDesignRemoteLoader` 9,
  `SarakUIProvider` 1, `useThemeCollection` 1, `TemplatesTab` 1, `useDesignDraft` 1 e os 4 de
  `persistenceIntegration`). O `node_modules` ficou intacto e a cópia foi apagada; o `git status` não mudou.
- `npx tsc --noEmit` → 0. `npx vitest run` → **406 arquivos, 2133 testes verdes** (480 s).
- `check-audit-baseline --with-tsc` → igual ao baseline. Verdes: `catalog`, `guide`, `dev-kit`, `public-types`,
  `prefix`, `barrel`, `token-types`, `build-info`, `trail-citation`, `gate-limits`, `section-pointers`,
  `persistence-doc` e `class-merge`. `dist/index.d.ts` traz `deleteTheme` e `onDelete`, e o `dist/` foi
  gerado do `src/` atual.
- Escopo: só os arquivos da §3.1 (com `SarakUIProvider.tsx`, ampliado) e os artefatos gerados. Os arquivos da
  `plan-87` não foram tocados.
- A simulação do ERP de §7 (71 tokens) **não foi reproduzida por mim**: ela exercita `overlayPreferences`, que
  a plan não alterou; o que prova é a entrada dele, `resolvedThemeId`, e essa chega pelo teste "restaura o par".

**Achados — a correção é exclusivamente estes:**

1. **Comentários com o porquê foram apagados, e os novos estão em inglês** — o código ao redor é em
   português. Critério violado: `padrao-escrita` (comentário explica o porquê não óbvio; escrever como o
   código vizinho).
   - `src/core/Provider/hooks/useDesignRemoteLoader.ts:34` — a JSDoc original (a `strategy` `'local'` ignora
     `onLoad` e `'remote'` substitui o design pela semente; ADR-009 §2.2) e a razão de `getSeedConfigRef`
     (`:48`) existir (a função não é estável e, sem a ref, o efeito rechamaria `onLoad` a cada render) sumiram.
     A linha nova está em inglês.
   - `src/core/Provider/hooks/useDesignManager.ts:94` — a razão de `resolvedThemeIdRef` existir
     (`persistDesign` lê o id no instante do save sem poder depender dele) sumiu. A lógica nova
     (`userChangedDesignRef` `:40`, `hasPersistenceBaselineRef` `:42`, `createPersistenceSignature` `:14`, a
     troca de `storageKey` no efeito `:147`) não tem comentário nenhum.
   - `src/features/DesignEngine/hooks/useLastAppliedSnapshot.ts:9` — a JSDoc foi trocada por uma linha em
     inglês e perdeu o que continua verdade: o desfazer **não limpa o rascunho** — quem chama o faz pelo
     `setDraftState` **local**, nunca por `sarak.setDraftDesign`, porque a ponte de `useDesignDraftSync.ts` só
     converge sem eco assim.
2. **`as unknown as` novo em `src/`** — `src/core/Provider/hooks/__tests__/useThemeCollection.test.ts:85`
   (`{ theme: { onDelete } } as unknown as SarakUIOptions`). O `grep -rn "as unknown as" src/core/Provider`
   foi de **56 para 57**. Critério violado: §6 (o `grep` não cresce) e §5 item 6 (zero novo). O objeto é
   atribuível a `SarakUIOptions` sem cast.
3. **Mudança de comportamento visível, fora do escopo** — `src/features/DesignEngine/Main/TemplatesTab.tsx:80`
   trocou `{template.description || 'Tema customizado.'}` por um texto fixo, e os temas embarcados declaram
   `description` (21 arquivos de preset). A §3.1 limita o painel ao anúncio do id; o texto não era dela.
   Restaure a exibição da descrição, com tipo que a admita.
4. **O item 2 não tem prova por caminho** (§6, segundo critério). Só o caminho do rascunho tem teste de
   integração com o Provider real e `onSave` (`useDesignDraft.persistenceIntegration.test.tsx`). Os caminhos
   **modelos** (`TemplatesTab`) e **desfazer** (`useLastAppliedSnapshot`) têm só teste de **ordem de chamada
   com mock**, que não pega o defeito original (a ref que só muda no render seguinte). O próprio mecanismo —
   chamar `setResolvedThemeId(id)` e `persistDesign(...)` na **mesma** execução síncrona e o `onSave` receber o
   id novo — **não tem teste** (`useDesignManager.test.ts` só chama `setResolvedThemeId(undefined)` e persiste em
   outro `act`). Escreva: (a) o teste do mecanismo no `useDesignManager`; (b) um teste por caminho (modelos e
   desfazer) com o Provider real, em que a **primeira** chamada de `onSave` leva o design novo e o id novo. Cada
   um tem de **falhar** num `HEAD` limpo (procedimento do `00-prompt-executor` §3, item 10).
5. **A nota de migração diz "aditiva" e omite duas mudanças de tipo** — `docs/migracoes.md:10`. `customThemes`
   e `allThemes` passaram de `unknown[]` para `SarakThemeEntry[]` (um consumidor que passa `unknown[]` ou
   objeto fora do formato deixa de compilar), e `SarakUIContextType` ganhou `deleteTheme` **obrigatório**
   (quem monta o contexto à mão, em teste, deixa de compilar). Critério violado: §6 (a nota existe **e** diz o
   que muda) e `03-versionamento-e-release` §3 (tipo de `Props` alterado é nível MAJOR). Escreva as duas
   linhas na tabela *antes × agora* e troque "aditiva" por uma frase verdadeira.
6. **O resumo da §9 está incompleto** — falta a tabela de arquivos alterados, os critérios de aceite um a um
   com a evidência, as decisões e suposições, e o resultado. O formato é o do `00-prompt-executor` §5. A
   correção entra como **bloco novo** (append-only), não substitui o anterior.

**Para o dono, sem reprovar:** os achados 5 e o `customThemes` estreitado fazem desta plan, no mínimo, candidata
a **MAJOR** quando for para a tag. A decisão do nível é de lá; a nota de migração tem de estar verdadeira antes.

## Veredito — 2026-10-04 — 🟢 Aprovado

**Antes de gravar:** a §10 foi relida no disco: só o bloco de reprovação de 2026-10-03, escrito nesta conversa.

**Os seis achados, um a um, com a evidência:**

| # | Achado | Evidência |
|---|---|---|
| 1 | Comentários | Restaurados **em português** e com o porquê: `useDesignRemoteLoader.ts:34-41` (a `strategy` — `'local'` ignora `onLoad`, `'remote'` substitui, `'hybrid'` mescla) e `:55-57` (a razão de `getSeedConfigRef`); `useDesignManager.ts` (a ref do id lida de forma síncrona, o baseline, a troca de `storageKey` e a regra de que só o setter público habilita a gravação); `useLastAppliedSnapshot.ts:9-19` (o desfazer não limpa o rascunho; o setter do id vem antes da gravação). |
| 2 | `as unknown as` | `grep` no mesmo método da revisão anterior: **56 no `HEAD`, 56 no worktree**; nenhuma linha adicionada em `src/` o contém. |
| 3 | Descrição dos modelos | `TemplatesTab.tsx:8` (tipo local admite `description`) e `:80` (`{template.description \|\| 'Tema customizado.'}`). A superfície pública `SarakThemeEntry` não foi ampliada. |
| 4 | Prova por caminho | Três testes novos: `useDesignManager.test.ts` ("`persistDesign` lê o id anunciado antes do render seguinte na mesma execução") e, com o **Provider real**, `themeApplication.persistenceIntegration.test.tsx` — *modelos* e *desfazer*, este com a asserção de que o `onSave` do desfazer é síncrono. **Controle em `HEAD` limpo, refeito por mim:** copiando só esses dois arquivos de teste para o `HEAD`, os três **falham** (5 falhas ao todo, com os 2 testes de ciclo que já falhavam); `node_modules` intacto, cópia apagada e `git status` inalterado. |
| 5 | Nota de migração | `docs/migracoes.md`: o "aditiva" saiu; a nota diz que há mudança de tipo, e a tabela ganhou as linhas de `customThemes`/`allThemes` (`unknown[]` → `SarakThemeEntry[]`) e de `SarakUIContextType` (`deleteTheme` obrigatório). |
| 6 | Resumo | Bloco *Correção da execução* na §9, append-only, com estado do worktree, tabela de arquivos, os oito critérios com evidência e as decisões. Uma imprecisão: o critério 6 cita "57 ocorrências em `HEAD`"; pelo método anterior são 56 nos dois lados. Não muda o resultado. |

**Regressão, rodada por mim sobre o worktree:** `npx tsc --noEmit` → 0 · `npx vitest run` → **407 arquivos, 2136
testes verdes** · `check-audit-baseline --with-tsc` → igual ao baseline · verdes: `catalog`, `guide`,
`dev-kit`, `public-types`, `prefix`, `barrel`, `token-types`, `build-info`, `trail-citation`, `gate-limits`,
`section-pointers`, `persistence-doc`, `class-merge`. `dist/index.d.ts` existe, e nenhum arquivo de produção do
`src/` é mais novo que o `dist/index.js` (a exceção é o gerado `design-token-ids.ts`). Os 3 achados do `npm run
audit` (`--x`, e os dois `<input>` de `SarakMultiSelect` e `SarakUploader`) estão no baseline e não são desta plan.
Escopo: só a §3.1 e os gerados; os arquivos da `plan-87` não foram tocados.

**Defeito da plan, achado na revisão — o destino da síntese estava errado.** O item 5 desta plan afirma que a
porta de apagar *"não é ADR novo"*. **É.** O ADR-011 decidiu, em tabela, que `onDeleteTheme` **não existe** e que
a lib *"nunca remove o que não guardou"*, e deixou como consequência escrita *"sem porta de apagar … a lib não
oferece o gesto"*. Havia duas opções reais, a escolhida tem um custo que a outra não tinha (superfície pública a
manter e a lib passando a remover da sessão) e voltar atrás é MAJOR. Passa a régua da §5.2. O `destino_sintese`
ganha `adr/017 (nova)`; a `plan-94`, que reservava o 017, passa a reservar o **018**.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
