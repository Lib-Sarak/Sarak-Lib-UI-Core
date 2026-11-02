---
tipo: "plan"
titulo: "Entregar as telas que todo sistema repete: configurações, auditoria, versões, aprovação, execução e acesso"
objetivo: "Fazer a lib oferecer prontas as peças que os sistemas reais reescrevem: página de configurações, visor de auditoria, comparação de versões, fila de aprovação, execução em curso, monitor ao vivo e matriz de permissões"
dominio: "Componentes / Telas de sistema"
status: "🟡 Em execução"
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

---

# 10. Veredito
