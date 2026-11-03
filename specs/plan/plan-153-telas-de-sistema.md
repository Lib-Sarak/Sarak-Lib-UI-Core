---
tipo: "plan"
titulo: "Entregar as telas que todo sistema repete: configurações, auditoria, versões, aprovação, execução e acesso"
objetivo: "Fazer a lib oferecer prontas as peças que os sistemas reais reescrevem: página de configurações, visor de auditoria, comparação de versões, fila de aprovação, execução em curso, monitor ao vivo e matriz de permissões"
dominio: "Componentes / Telas de sistema"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.5", "templates"]
relacionados: ["[[anexos/rc5-contrato]]", "[[10-seguranca-e-acessibilidade]]", "[[08-identidade-do-host-e-zero-marca]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

O que todo sistema reescreve vira peça pronta, apresentacional e sem domínio.

# 2. Contexto

Varredura de 11 sistemas ativos em 2026-11-02. Sistemas onde a lacuna aparece:

| Peça | Sistemas | Evidência |
|---|---|---|
| Configurações com rascunho | 4 | `TranslatorSettings.tsx`, `SettingsView.jsx` (Oss), Cripto, Login |
| Auditoria | 3 a 4 | `AuditTrail.tsx` (Login), `AuditMonitor.tsx` (Auth), `AuditDashboard.jsx` (Oss) |
| Antes → depois | 3 a 4 | `VersoesAta.tsx`, `TcMudancas.tsx` (painel-web), `RoleImpactPreview.tsx`, ERP |
| Fila de aprovação | 3 | `CustomerPendingChanges.tsx` (ERP), Login, `FilaRevisao.tsx` |
| Execução em curso | 2 a 3 | `ProgressoExecucao.tsx`, Cripto |
| Monitor ao vivo | 2 a 3 | `ApiMonitor.jsx`, `ConnectionsStatus.jsx` (Cripto), `AuditMonitor.tsx` |
| Permissões | 2 | `RoleEditor.tsx`, `EffectiveAccessPanel.tsx`, `RbacGovernance.tsx` |
| Membros e convites | 2 | `Invitations.tsx`, `UserDirectory.tsx` |
| Conta e sessões | 3 | Login, Auth, Oss |

**Onde achar, a partir da pasta Code (fora deste repositório):** Login em Biblioteca/Sarak-Lib-Login/login-completo; Auth em Biblioteca/Sarak-Lib-Auth-Identity/src/components/rbac; Translator em Biblioteca/Sarak-Lib-Translator-Google; Oss em ZP/Oss/frontend/src; painel-web em ZP/Automacao-relatorios/Novo/modules/painel-web/web; Cripto em Code - Cripto/Setup IS - Cripto; ERP em Earendel/ERP/modules.

**Regras:** toda peça é apresentacional: dado por prop, evento por callback. **A lib não faz rede** nem conhece domínio. Nada de auth, papel ou empresa fixos; rótulos pelo catálogo.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Templates/` — as peças novas, com testes e exemplos no guia.
- `src/core/i18n/`, `src/index.ts`, `docs/migracoes.md`.

## 3.2 Fora
- Regra de permissão, sessão e conexão: são do consumidor. WebSocket: a lib só mostra o estado.
- Tela de login: já é `SarakAuthScreen`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | zero-marca |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, ARIA |
| Código | os arquivos do §2 | casos reais: leia ao menos dois por peça antes de desenhar a API |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | componente · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree. Cole a API de cada peça no resumo antes de implementar, com o caso real que ela cobre.
2. `SarakSettingsPage`: seções com índice, rascunho, barra salvar/descartar, `useSarakUnsavedChanges`.
3. `SarakAuditLog`: ator, ação, alvo, data; filtros e paginação por props; detalhe expansível. Compõe `SarakDataTable`.
4. `SarakDiffView`: antes → depois, por campo e por texto; destaque por token e por rótulo, nunca só cor. `SarakVersionList` compõe com ele.
5. `SarakApprovalQueue`: item, diferença, aprovar, rejeitar com motivo, em lote.
6. `SarakRunProgress`: fases, progresso, duração, cancelar, último erro.
7. `SarakLiveStatus`: conectado, reconectando, offline, último dado; e `SarakUsageMeter`, para limite de uso.
8. `SarakPermissionMatrix`: papéis × permissões, por grupo, herdado × direto, somente leitura, com teclado de grade.
9. `SarakMemberList`: membros, convites pendentes, ações. `SarakSessionList`: sessões, revogar.
10. Testes de teclado e leitor de tela por peça. Um spec de navegador por peça, nos dois modos e em contêiner estreito.
11. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] As nove peças apresentacionais, sem rede nem domínio — `zero-brand:check` e gate de rede.
- [ ] Cada API cobre ao menos dois casos reais do §2 — resumo.
- [ ] Sem informação só por cor — teste.
- [ ] Teclado e contêiner estreito — navegador.
- [ ] Prévia em HTML para o dono.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- Filtro de `Templates`, `npm run boot:measure` e `check-audit-baseline.mjs --with-tsc`. O boot tem 1,9 KB de folga: peça pesada fica atrás de `lazy`.
- A prévia aberta; o veredito fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `—`. A superfície fica no catálogo gerado.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências (prévia e medição em navegador entregues; `verify quick` não fecha por achados de outras plans, listados abaixo)

**Estado do worktree ao iniciar**
(limpo)

**API de cada peça e o caso real que cobre** (colada antes de implementar, conforme §5.1)
| Peça | API principal | Casos reais cobertos |
|---|---|---|
| `SarakSettingsPage` | `sections[{id,title,content,dirty}]`, `isDirty`, `saving`, `saveError`, `onSave`, `onDiscard`, `onUnsavedChangesControl` | `SettingsView.jsx` (Oss), `TranslatorSettings.tsx` |
| `SarakAuditLog` | `entries[{actor,action,target,at,detail}]`, `filters`+`onFiltersChange`, `actors`, `actions`, `page`/`pageSize`/`totalItems`/`onPageChange`, `loading`, `error` | `AuditTrail.tsx` (Login), `AuditMonitor.tsx` (Auth), `AuditDashboard.jsx` (Oss) |
| `SarakDiffView` | `fields[{label,before,after}]` ou `before`/`after` (texto), `showUnchanged` | `VersoesAta.tsx`, `TcMudancas.tsx`, `RoleImpactPreview.tsx` |
| `SarakVersionList` | `versions[{label,author,at,summary,current,diff}]`, `onRestore`, `openIds` | `VersoesAta.tsx`, `TcMudancas.tsx` |
| `SarakApprovalQueue` | `items[{title,requester,at,diff}]`, `onApprove(ids)`, `onReject(ids,reason)`, `selectedIds`, `busy` | `CustomerPendingChanges.tsx` (ERP), `FilaRevisao.tsx` |
| `SarakRunProgress` | `phases[{label,status,progress,detail}]`, `progress`, `elapsedMs`, `onCancel`, `cancelling`, `lastError` | `ProgressoExecucao.tsx`, Cripto |
| `SarakLiveStatus` / `SarakUsageMeter` | `status`, `lastDataAt`, `onRetry` / `label`,`used`,`limit`,`unit`,`warnAt`,`criticalAt` | `ApiMonitor.jsx`, `ConnectionsStatus.jsx` / limites de uso (Cripto) |
| `SarakPermissionMatrix` | `roles`, `groups`, `granted`, `inherited`, `onToggle`, `readOnly` | `RoleEditor.tsx`, `EffectiveAccessPanel.tsx`, `RbacGovernance.tsx` |
| `SarakMemberList` / `SarakSessionList` | `members`, `invitations`, `onRemoveMember`, `onResendInvitation`, `onRevokeInvitation` / `sessions`, `onRevoke`, `onRevokeOthers` | `Invitations.tsx`, `UserDirectory.tsx` / sessões de Login, Auth e Oss |

**O que foi feito**
- 11 componentes em `src/components/atomic/Templates/`, exportados por `export *` no barril de `Templates/index.ts`; helpers: `diffLines.ts`, `permissionGrid.ts`, `systemTone.ts`, `hooks/useSystemFormat.ts`.
- Textos em seis idiomas: `catalogEntries.system.ts` e `catalogEntries.access.ts`, ligados em `catalog.ts` (edição só do meu trecho; o arquivo já tinha a linha de outra plan).
- Nota na `## 8.0.0` de `docs/migracoes.md` (MINOR aditivo).
- Browser: `browser-tests/telas-de-sistema.spec.ts` + `fixtures/telas-de-sistema-entry.tsx`.
- O navegador achou um defeito real, corrigido: `SarakMemberList` passava 77 px da borda a 320 px com e-mail longo. A trilha da grade foi fixada em `minmax(0, 1fr)` em todas as peças que usam grade externa.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Templates/Sarak{SettingsPage,AuditLog,DiffView,VersionList,ApprovalQueue,RunProgress,LiveStatus,UsageMeter,PermissionMatrix,MemberList,SessionList}.tsx` | criado | as 11 peças |
| `Templates/{diffLines,permissionGrid,systemTone}.ts`, `Templates/hooks/useSystemFormat.ts` | criado | helpers puros |
| `Templates/__tests__/*` (13 arquivos), `Templates/hooks/__tests__/useSystemFormat.test.tsx` | criado | testes 1:1 |
| `Templates/index.ts` | alterado | `export *` das 11 peças e do tipo `SarakSystemTimestamp` |
| `src/core/i18n/catalogEntries.{system,access}.ts`, `catalog.ts` | criado/alterado | textos nos seis idiomas |
| `docs/migracoes.md` | alterado | nota da leva |
| `browser-tests/telas-de-sistema.spec.ts`, `fixtures/telas-de-sistema-entry.tsx` | criado | 17 testes de navegador |

**Verificações executadas**
- `npx vitest run src/components/atomic/Templates src/core/i18n` → 82 arquivos, 346 testes passaram (inclui paridade do catálogo nos seis idiomas).
- `tsc --noEmit`: zero erro em `Templates/`, `i18n/` e `browser-tests/` (há erros de outras plans em `SarakCopyButton`, `SarakDashboardGridImpl`, `SarakMapImpl`).
- `barrel:check` (138 componentes, 0 faltas), `catalog:check` (em dia), `public-types:check` (OK), `zero-brand:check` (OK), `network:check` (OK, 0 exceções).
- Playwright, config temporária sem `globalSetup` → 17/17: sem estouro de largura em 960 e 320 px nos dois modos; contraste ≥ 4,5:1 do texto de estado (conexão, fases); teclado de Configurações, matriz, aprovação e auditoria; ações com o id certo.
- `run_audit.mjs`: nenhuma linha minha restante (corrigi px/rem soltos, `else if` e variáveis inexistentes).
- `npm run verify -- --tier=quick` → falhou, mas pelos itens de outras plans (ver Pendências). Não rodei `npm run build` nem `boot:measure`.

**Critérios de aceite**
- [x] Nove peças apresentacionais, sem rede nem domínio — `zero-brand:check` e `network:check` OK.
- [x] Cada API cobre ao menos dois casos reais — tabela acima.
- [x] Sem informação só por cor — marcador e palavra em cada estado; testes de jsdom e de navegador.
- [x] Teclado e contêiner estreito — `telas-de-sistema.spec.ts`, 17/17.
- [x] Prévia em HTML — `C:\Users\Igor\AppData\Local\Temp\claude\c--Users-Igor-Desktop-Sarak-X---Trabalho-Code-Biblioteca-Sarak-Lib-UI-Core\f54c1f44-9751-4c93-b05b-b425ddff4c1d\scratchpad\previa-telas-de-sistema.html` (arquivo único, 12,7 MB sem minificar; links no topo alternam claro/escuro e 960/320 px). Aprovação do dono pendente.

**Decisões e suposições**
- Onze componentes, não nove: a plan lista `SarakLiveStatus`/`SarakUsageMeter` e `SarakMemberList`/`SarakSessionList` como itens únicos; entregues como peças separadas, e o contrato (§1.2) já as nomeia.
- Permissão herdada nunca alterna na matriz; só leitura navega mas não alterna.
- Matriz em `<table role="grid">` com `<td tabIndex>` (padrão ARIA grid), sem `<input>`, para a herdada ser focável.
- `SarakAuditLog` usa `SarakDataTable` com `density="report"` e cast tipado do `lazy`. Pede o peer opcional `@tanstack/react-virtual`, como a tabela de sempre.
- O spec de navegador importa as peças por caminho do `src/`, não pelo barril nem pelo `dist/`: o barril atual arrasta `qrcode`/`pngjs` (plan 154), que quebra o bundle do harness. Declarado no cabeçalho do spec (R18).
- Rascunho do `SarakSettingsPage`: o host guarda; a página só pede salvar/descartar e liga o aviso de saída.

**Achados fora do escopo (não corrigidos)**
- `browser-tests/global-setup.mjs` falha com `dist/index.js` atual: `qrcode`/`pngjs` pedem `zlib`, `util`, `stream`, `assert`, `buffer`, `fs` e o harness não os stuba. Todo `playwright test` com essa config quebra até isso ser tratado (plan 154: `SarakQRCodeImpl`).
- `variable-contract:check`: `--sarak-input-radius` (`SarakColorInput`), `--sarak-surface-sunken`, `--sarak-transition-duration`, `--sarak-type-scale-h4`, e reservas ≠ padrão em `SarakMapImpl`, `SarakSignaturePad`, `SarakCarousel`, `SarakTour`, `SarakDashboardGridImpl` (plans 154/155).
- `check-trail-citation`: `src/index.ts:196` cita `plan-154` (plan 154).
- `auditor_coverage`: faltam testes de `SarakDashboardGridImpl`, `SarakMapImpl`, `SarakQRCodeImpl`; `auditor_composicaoatomica`: `<button>`/`<input>` crus em `SarakCarousel`, `SarakMapImpl` (e dois já no baseline); `auditor_cleancode`, `auditor_hardcoded` em arquivos de 154/155.
- `dev-kit:check` defasado (`sarak-dev/*`): é regenerado ao fim, por `npm run dev-kit`, depois das três plans.
- Em `tsc`: três arquivos de 154/155 com erro de tipo (acima).

**Pendências / riscos**
- `boot:measure` e `npm run build` não rodados: o `tsc` global ainda não está verde por causa de 154/155, e a `dist/` ficou sendo reconstruída por outra execução durante o meu trabalho. As peças não entram no boot (nada eager além do barril), e a tabela da auditoria é lazy; o número fica para o revisor.
- A medição de navegador lê a folha `dist/sarak.css` anterior; as peças usam estilo em linha e classes que a lib já emite.
- Aprovação do dono sobre a prévia.

---

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

Rodado pelo revisor: filtro de `Templates` 319/319, `zero-brand:check` e `network:check` verdes, e `telas-de-sistema`, com `plan-155` e `erro-no-bloco`, 35/35. As peças são apresentacionais, sem rede nem domínio, e toda informação tem forma e palavra além da cor. As onze peças no lugar de nove estão aceitas.

1. **`SarakAuditLog` derruba a tabela com data inválida.** `SarakAuditLog.tsx:73`: `new Date(entry.at).toISOString()` lança `RangeError`, embora `format.dateTime` trate o mesmo valor. Um registro ruim da API tira o visor inteiro. Sem data válida, a célula fica sem `dateTime`, com teste.
2. **`sarakDiffLines` pode travar a aba.** `diffLines.ts`: a tabela cresce com `linhas × linhas`. Dois textos de 5 mil linhas pedem 25 milhões de células. Corte o início e o fim comuns antes de comparar e, acima de um limite em constante, mostre o bloco como removido e adicionado. Teste com um texto grande e tempo limitado.
3. **Botão dentro de formulário envia o formulário.** `SarakButton` não define `type`, e nenhuma peça desta plan o escreve. Com `SarakSettingsPage` dentro de um `<form>` do host, "Descartar" envia o rascunho. O mesmo vale para as demais peças. Use `type="button"` em todas, com teste em `SarakSettingsPage`.
4. **Rejeitar passa pelo `busy`.** `SarakApprovalQueue.tsx:139`: `RejectPanel` não recebe `busy`, e o painel aberto confirma de novo enquanto o host processa. Critério violado: "Trava as ações enquanto o host processa".
5. **`SarakUsageMeter` com limite zero diz que está tudo bem.** `:45`: com `limit={0}` e uso positivo, a razão vira 0 e o estado sai "dentro do limite". Esse caso é `exceeded`, com teste.

**Verificação objetiva:** filtro de `Templates` e `telas-de-sistema`, uma vez cada. Troque no spec a importação por caminho do `src/` pelo pacote, agora que o harness voltou. Copie a prévia para `C:\tmp\sarak-previa-153\index.html`. Sem suíte inteira e sem bateria.

## Resumo da execução (correção 1) — 2026-11-02

**Resultado:** Concluído

1. **Data inválida no `SarakAuditLog`** — `SarakAuditLog.tsx` (célula `at`): `dateTime` só é escrito quando `new Date(at)` é válida; sem ela, a célula mostra o texto de `format.dateTime`. Teste: `SarakAuditLog.test.tsx` "data inválida não derruba o visor" (linha com `at: 'ontem à noite'`, as outras seguem, o `<time>` ruim sai sem `datetime`).
2. **`sarakDiffLines` sem travar** — `diffLines.ts` reescrito: corta o início e o fim comuns, e se o miolo passar de `MAX_TABLE_CELLS` (1.000.000 células) sai todo removido e adicionado, sem montar a tabela. Testes em `diffLines.test.ts`: 20 mil linhas com uma mudada no meio, em < 2 s, marcando só `removed:linha 10000` e `added:mudou`; dois textos de 5 mil linhas todos diferentes, em < 2 s, com 10 mil linhas (5 mil removidas, 5 mil adicionadas).
3. **Botões dentro de `<form>`** — `type="button"` em todo `SarakButton` das peças desta plan (`SarakSettingsPage`, `SarakVersionList`, `SarakApprovalQueue`, `SarakRunProgress`, `SarakLiveStatus`, `SarakMemberList`, `SarakSessionList`; conferido por `grep`, nenhum `<SarakButton` sem o tipo nelas). Teste em `SarakSettingsPage.test.tsx`: página dentro de `<form onSubmit>`, "Descartar" e "Salvar" não disparam o envio, e todo botão da página tem `type="button"`.
4. **Rejeitar e `busy`** — `RejectPanel` recebe `busy` e trava "Confirmar rejeição". Teste em `SarakApprovalQueue.test.tsx`: painel aberto com motivo digitado, `busy` ligado, o botão fica desabilitado e o clique não chama `onReject`.
5. **`SarakUsageMeter` com limite zero** — `ratioOf` (novo, em `SarakUsageMeter.tsx`): limite 0 com uso positivo vira razão infinita, ou seja, `exceeded`, e a porcentagem só é escrita quando finita. Testes: `limit={0}` com `used={5}` diz "Limite excedido", mostra "5 de 0" e nenhum "Infinity"/"NaN"; sem uso segue "Dentro do limite".

**Verificação objetiva**
- `npx vitest run` nos 12 arquivos de `Templates/__tests__` que cobrem as peças e os helpers → 12 arquivos, 76 testes passaram. Uma rodada da pasta inteira estourou o `timeout` de 590 s da ferramenta (máquina ocupada) e não deu resumo; a pasta inteira passou antes da correção (82 arquivos, 346 testes, com `i18n`).
- `tsc --noEmit`: nenhuma linha em `Templates/` nem em `browser-tests/`.
- `browser-tests/telas-de-sistema.spec.ts`, pela config do repositório, importando do pacote (`fixtures/telas-de-sistema-entry.tsx` agora usa `@sarak/lib-ui-core` e o spec chama `buildHarness(ENTRY)`; cabeçalho de limites atualizado) → 17/17.
- Prévia copiada para `C:\tmp\sarak-previa-153\index.html` (gerada do código atual, com as correções; 27,5 MB sem minificar).

**Decisões e suposições**
- Limite de 1.000.000 células para o miolo do diff (≈ 1.000 × 1.000 linhas): constante nomeada no próprio arquivo.
- O `dist/` usado pelo spec de navegador é o já reconstruído por outra execução às 21:57; ele não contém estas cinco correções (nenhuma é de comportamento medido pelo spec). Não rodei `npm run build`.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- `dist/` sem as correções até o próximo build; as correções estão cobertas por `jsdom`, não pelo navegador.
- Aprovação do dono sobre a prévia.

## Veredito — 2026-11-02 — 🟢 Aprovado

Os cinco achados foram conferidos no código: data inválida sem `dateTime`, `MAX_TABLE_CELLS` com corte do início e do fim comuns, `type="button"` em todo `SarakButton` das peças, `busy` no `RejectPanel` e `ratioOf` com limite zero. Rodado pelo revisor: `Templates` 325/325, `tsc` 0 erros e `telas-de-sistema` 17/17 pelo pacote. A prévia (`C:\tmp\sarak-previa-153\index.html`) foi aprovada pelo dono em 2026-11-02, com prints. O spec rodou sobre um `dist/` anterior às correções, que estão cobertas em jsdom; a cópia limpa da release mede o build final.

O commit sai junto das plans 154 e 155. Destino da síntese: `—`.
