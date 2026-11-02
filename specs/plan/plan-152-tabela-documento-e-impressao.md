---
tipo: "plan"
titulo: "Completar a tabela para o trabalho diário e entregar documento e impressão"
objetivo: "Fazer a tabela ter ações em lote, colunas configuráveis pelo usuário e modo leve de relatório, e a lib oferecer moldura de documento e impressão limpa"
dominio: "Componentes / Tabela e documento"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "rc.5", "tabela", "documento"]
relacionados: ["[[anexos/rc5-contrato]]", "[[07-responsividade-e-multidispositivo]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Tabela pronta para o uso diário de sistema real, e documento visto e impresso sem cromo.

# 2. Contexto

Lacunas medidas em 2026-11-02:

- **Ações em lote:** há seleção de linhas (`dataTableCell.ts`), mas nada de barra de ações.
- **Colunas:** nada para esconder, reordenar ou redimensionar. O Oss escreveu `ColumnManager.jsx`, com configuração persistida.
- **Relatório:** source-verifier, painel-web e Login montam tabela leve com regra de cor por limiar, fora do `SarakDataTable`.
- **Documento:** o ERP tem `DocumentFrame` (A4 e celular), em duas cópias antes da reestruturação.
- **Impressão:** nenhuma regra `@media print` em `src/styles`.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/DataDisplay/SarakDataTable/` e `src/components/atomic/Tables/`, com testes.
- Componente novo `SarakDocumentFrame`.
- `src/styles/` — impressão.
- `src/index.ts`, `src/core/i18n/`, `browser-tests/`.

## 3.2 Fora
- Persistência da lib: ela entrega valor e `onChange`, e quem salva é o consumidor.
- Exportação Excel: `plan-155`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | componente · sempre · token |

Casos reais, fora deste repositório: ZP/Oss/frontend/src/modules/monitoring/components/ColumnManager.jsx e, no ERP, packages/ui-kit/src/DocumentFrame.tsx. Caminhos a partir da pasta Code.

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Ações em lote.** `bulkActions?: { label; icon?; tone?; onAction(ids) }[]`. Uma barra aparece com a seleção, com contagem e limpar; ação de perigo pede confirmação. Vale em tabela e cartões.
3. **Colunas.** `columnState`, `onColumnStateChange`, `defaultColumnState`: visibilidade, ordem e largura. Um botão "Colunas" abre o painel, com teclado. Alça de largura por mouse e teclado. Sem as props, nada muda.
4. **Edição inline.** `SarakColumn.editable` e `onCellEdit(row, column, value)`: clique ou Enter entra em edição, Esc cancela, Enter ou sair confirma, com validação por coluna, erro na célula e estado de salvando. Usa os átomos de entrada e a navegação de grade por teclado. Decisão do dono em 2026-11-02.
5. **Visões salvas.** `views`, `activeView`, `onViewChange`, `onViewSave`: uma visão guarda filtros, colunas e ordenação. Barra com a visão atual, salvar como e voltar ao padrão. Quem persiste é o consumidor.
6. **Relatório.** `density="report"` sem cromo de cartão, e `getCellTone?: (row, column) => tom | undefined`, com tom por token e nunca só cor: inclui ícone ou texto.
7. **`SarakDocumentFrame`.** `format: 'a4' | 'letter' | 'phone'`, zoom, ajuste à largura por contêiner e slot de ações.
8. **Impressão.** Camada `@media print` no CSS: esconde cromo e ações, tira sombra, usa tabela inteira, sem virtualização quebrada, e `SarakDocumentFrame` imprime só o documento. `sarakPrint(element?)` público.
9. Specs de navegador. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Barra de lote com contagem, confirmação em ação de perigo — navegador.
- [ ] Colunas: esconder, reordenar e redimensionar por teclado, com valor devolvido — navegador.
- [ ] Sem props novas, snapshot igual — teste.
- [ ] Edição por teclado, com Esc, validação e erro na célula — navegador.
- [ ] Visão aplica filtros, colunas e ordenação, com o valor devolvido — teste.
- [ ] Tom da célula não depende só de cor — teste.
- [ ] Impressão em `page.emulateMedia({ media: 'print' })` sem cromo — navegador.
- [ ] Moldura no contêiner estreito sem rolagem da página — navegador.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- Filtro de `DataDisplay` e `Tables`, e `check-audit-baseline.mjs --with-tsc`.
- A CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `—`. A superfície fica no catálogo gerado.

---

# 9. Resumo da execução

---

# 10. Veredito
