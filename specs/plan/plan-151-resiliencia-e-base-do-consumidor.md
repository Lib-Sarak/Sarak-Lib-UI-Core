---
tipo: "plan"
titulo: "Proteger a tela contra erro, avisar alterações não salvas e entregar a base que os consumidores reescrevem"
objetivo: "Fazer um erro de render ficar contido no bloco que falhou, um formulário alterado avisar antes de sair, a paginação gerar link real e o consumidor receber prontas a mensagem de erro, a utilidade de teste e os gates que faltam"
dominio: "Componentes / Resiliência e kit"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "rc.5", "resiliencia", "kit"]
relacionados: ["[[anexos/rc5-contrato]]", "[[10-seguranca-e-acessibilidade]]", "[[12-kit-do-consumidor]]", "[[16-integracao-continua]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/12-kit-do-consumidor.md + specs/specs/10-seguranca-e-acessibilidade.md + specs/specs/16-integracao-continua.md"
---

# 1. Objetivo

Um defeito num componente não derruba a tela, nenhum formulário perde dado em silêncio, e os consumidores param de reescrever o básico.

# 2. Contexto

Análise do dono de 2026-11-02, que cruzou a superfície da lib, o que o ERP escreve à mão e 11 sistemas ativos.

- **Proteção de erro:** não há `getDerivedStateFromError` em `src/`, embora um histórico antigo cite error boundary. Confirme se existia e sumiu. Hoje um erro de render derruba a tela.
- **Alterações não salvas:** nada em `src/`, e nenhum sistema varrido trata. O `SarakForm` não avisa.
- **Paginação com link:** o ERP escreveu `LinkPagination` (`packages/ui-kit/src/LinkPagination.tsx`), e Login e Cripto têm a própria. `SarakPagination` não gera `href`.
- **Mensagem de erro:** cerca de 40 cópias de `errorMessage` no ERP.
- **Mock do kit:** 7 no ERP, um por módulo; `src/testing.ts` existe, mas não resolve isso.
- **Backlog #11:** nada garante que a lib não faz rede. **Backlog #59:** actions em Node 20 e `ubuntu-latest` mudam sem controle.

# 3. Escopo

## 3.1 Dentro
- Componente novo `SarakErrorBoundary`; `src/components/atomic/Navigation/SarakPagination.tsx`.
- `SarakForm`, `SarakFormSection` e um hook público de alterações não salvas.
- `src/testing.ts`, `src/shared/`, `gates/scripts/contrato/`, `.github/workflows/`.
- `src/index.ts`, `src/core/i18n/`, `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md`.

## 3.2 Fora
- Roteamento: a lib não navega ([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]). O bloqueio de saída recebe a integração do consumidor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | kit |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.2 | a lib não faz rede |
| Spec fixa | `specs/specs/16-integracao-continua.md` | CI |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` | componente · sempre |

Caso real, fora deste repositório: no ERP, LinkPagination.tsx e errorMessage.ts, em packages/ui-kit/src.

# 5. Instruções de execução

1. Fotografe o worktree.
2. **`SarakErrorBoundary`.** `fallback`, `onError`, `resetKeys`. O padrão mostra mensagem do catálogo e "Tentar de novo". `SarakSection` e `SarakAppChrome` o usam por padrão, para o erro ficar no bloco.
3. **`useSarakUnsavedChanges({ isDirty, onBlock? })`.** Liga `beforeunload` e devolve uma confirmação pelo overlay para o consumidor ligar no roteador dele. `SarakForm` aceita `warnOnUnsaved`, padrão `false`.
4. **`SarakPagination`:** `getPageHref?: (page: number) => string`. Com ele, cada página é link real, com Ctrl+clique.
5. **`sarakErrorMessage(error, fallback?)`:** texto seguro de `Error`, string e resposta comum.
6. **Testes:** um `renderWithSarak` e o mock que dispensa os 7 do ERP.
7. **Gate de rede (#11):** `fetch`, `XMLHttpRequest`, `WebSocket`, `axios` em `src/` reprovam, com allowlist comentada. Tem caso que falha.
8. **CI (#59):** fixe `ubuntu-24.04` e suba as actions.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Erro de render fica no bloco, e "Tentar de novo" remonta — navegador.
- [ ] Formulário alterado avisa; `warnOnUnsaved` omitido não muda nada — teste.
- [ ] Com `getPageHref`, a página é `<a href>` — teste.
- [ ] Gate de rede falha no caso plantado.
- [ ] Catálogo e nota de migração.

# 7. Como verificar (uso do revisor)

**Gate:** rede sem leitor autorizado em `src/` reprova.

- Filtro dos arquivos tocados e `check-audit-baseline.mjs --with-tsc`.
- Mutação no gate.

# 8. Destino da síntese

**Destino:** `specs/specs/12-kit-do-consumidor.md`, `specs/specs/10-seguranca-e-acessibilidade.md` §3.2 e `specs/specs/16-integracao-continua.md`.

---

# 9. Resumo da execução

---

# 10. Veredito
