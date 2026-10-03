---
tipo: "plan"
titulo: "Fechar o ciclo salvar, carregar e aplicar do tema ativo"
objetivo: "Fazer o par design mais id do tema sobreviver ao ciclo inteiro de persistencia, por qualquer caminho de aplicacao, sem gravacao no boot e sem o consumidor precisar de guarda propria"
dominio: "Sarak-Lib-UI-Core / Provider / Persistência de tema"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "persistencia", "tema", "provider", "consumidor"]
relacionados: ["[[09-temas-e-presets]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[009-persistencia-tenant-aware]]", "[[06-painel-de-customizacao-e-preview]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + arquitetura/03-superficie-publica.md"
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

**Destino:** `specs/09-temas-e-presets.md + arquitetura/03-superficie-publica.md`

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

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
