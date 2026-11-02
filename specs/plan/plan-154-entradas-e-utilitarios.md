---
tipo: "plan"
titulo: "Completar entradas e utilitários que os sistemas montam à mão"
objetivo: "Fazer a lib oferecer seletor de cor, seletor de conjunto, tags, código de verificação, formulário gerado por campos, assistente, popover, copiar, QR, atalhos, permissão por condição, download com estados e gráfico avançado"
dominio: "Componentes / Entradas e utilitários"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "rc.5", "entradas"]
relacionados: ["[[anexos/rc5-contrato]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Peças menores, com evidência de uso, deixam de ser reescritas.

# 2. Contexto

Varredura de 2026-11-02 e inventário da lib:

| Peça | Evidência |
|---|---|
| Seletor de cor público | `ColorPicker.jsx` (Cripto, 429 linhas), `ThemeEditor.jsx` (Oss); a lib só tem controle interno |
| Seletor de conjunto com busca e filtros | `TranslatorSettings.tsx`, `ChatLab.tsx`, `ExcludedTokensCard` (Cripto) |
| Formulário por campos | `ContractMarkerFields` (ERP), `ContractForm.tsx` (orquestrador) |
| Download e visualização com estados | 5 `createObjectURL` no ERP, `ArvoreAtas.tsx` |
| Atalhos editáveis | `useShortcut.jsx` (Oss); a lib tem `useShortcutsManager` só interno |
| Assistente | `GovernanceWizard.jsx` (Cripto) |
| QR e copiar | `SecurityVault.tsx` (Auth) |
| Deduplicar toast | `notificationManager.js` (Cripto) |

Sem peça na lib, de uso previsível: tags, código de verificação, popover genérico, permissão por condição, gráfico avançado. **Excluídos por falta de evidência:** mapa, assinatura, painel arrastável, tabela de planos, tour.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/` — as peças, com testes. `src/index.ts`, `src/core/i18n/`, `docs/migracoes.md`.

## 3.2 Fora
- Dependência nova, salvo QR, que é opcional (peer), como PDF. A lib não faz rede: download recebe a função do consumidor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, foco |
| Código | os arquivos do §2 | casos reais |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | componente · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. `SarakColorInput`: público, com hex e campo, reaproveitando o controle do painel; alerta de contraste opcional.
3. `SarakSetPicker`: disponíveis × escolhidos, busca e filtros.
4. `SarakTagInput` e `SarakCodeInput` (OTP).
5. `SarakFieldRenderer`: gera campos de uma lista `{ name, type, label, required, options }`, com os átomos da lib, sem `eval` nem HTML.
6. `SarakWizard`: etapas com validação, compondo `SarakStepper`.
7. `SarakPopover`: com foco e camada da pilha.
8. `SarakCopyButton`, `SarakQRCode` (peer opcional).
9. `SarakFileAction`: baixar ou abrir com carregando, erro e nova tentativa; recebe `load(): Promise<Blob>`.
10. `useSarakShortcut` público; deduplicação de toast por `dedupeKey`.
11. `SarakGate`: `allowed`, `fallback`. A regra é do consumidor.
12. **Gráfico avançado:** `SarakChartEngine` ganha `extendOption?: (option) => option`, aplicada por último.
13. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Toda peça com teclado e rótulo acessível — teste.
- [ ] `SarakFieldRenderer` não executa conteúdo vindo de dado — teste.
- [ ] QR sem o peer mostra o fallback da lib — teste.
- [ ] Sem nova dependência obrigatória.
- [ ] Catálogo atualizado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- Filtro dos arquivos novos, `npm run boot:measure` e `check-audit-baseline.mjs --with-tsc`. O boot tem 1,9 KB de folga: peça pesada fica atrás de `lazy`.

# 8. Destino da síntese

**Destino:** `—`. A superfície fica no catálogo gerado.

---

# 9. Resumo da execução

---

# 10. Veredito
