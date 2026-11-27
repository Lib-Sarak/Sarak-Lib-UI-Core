---
tipo: "plan"
titulo: "Temas de marca só de leitura e o erro do cromo entregue ao importador"
objetivo: "Permitir ao importador marcar um tema dele como só leitura, para o painel oferecer Duplicar em vez de Salvar e Apagar, e entregar ao importador os erros que o cromo contém por uma prop onError"
dominio: "Temas / Cromo"
status: "🟠 Em revisão"
prioridade: "Média"
tags: ["plan", "contrato-aditivo", "temas", "cromo", "erro"]
relacionados: ["[[09-temas-e-presets]]", "[[05-cromo-e-slots]]", "[[010-temas-salvos-pelo-usuario]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[017-porta-de-apagar-tema-simetrica-a-de-escrever]]"]
depende_de: ""
retida_por: ""
destino_sintese: "09-temas-e-presets; 05-cromo-e-slots"
---

# 1. Objetivo

- Um tema que o importador declara só de leitura aparece no painel com "Duplicar", e nunca com "Salvar" ou "Apagar".
- O importador recebe os erros que o cromo contém, por uma prop `onError` do `SarakAppChrome`.

# 2. Contexto

**Quando despachar:** depois do `npm version` da `9.0.0-rc.2`. As duas mudanças acrescentam contrato público, e a campanha da rc.2 é
de correção.

| Id | Achado |
|---|---|
| B72 | **Tema de marca sem como ser só de leitura.** `SarakThemeEntry` (`src/core/Provider/themeTypes.ts:4-10`) traz só `id`, `name`, `design` e `contraparte`, e a imutabilidade vale só para o catálogo da lib. O ERP põe os temas dele (`erp-corporativo`, `erp-noturno`) em `customThemes` e recusa o id no `onSave`. Pelo contrato atual, o painel oferece "Salvar" e "Apagar" sobre eles e o usuário recebe erro, em vez de "Duplicar" |
| B63 | **O erro do cromo não chega ao importador.** O `SarakAppChrome` contém o erro de render do conteúdo (o `SarakErrorBoundary` com `resetKeys` de `src/components/Layout/chrome/useStableContent.tsx`, e o do `secondaryContent` em `ChromeContentRegion.tsx`) e não expõe `onError`. O mesmo vale para `SarakSection` (`src/components/atomic/Templates/SarakSection.tsx`). Hoje, quem registrava erro com um boundary em volta do cromo precisa pôr outro dentro do conteúdo (`docs/migracoes.md`, perto da linha 794) |

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/themeTypes.ts`: campo opcional `readOnly?: boolean` em `SarakThemeEntry`.
- O painel: onde decide "Salvar", "Apagar" e "Duplicar" para um tema, trata `readOnly` como trata os temas do catálogo da lib.
- `SarakAppChrome` e `SarakSection`: prop opcional `onError(error, info)`, repassada ao `SarakErrorBoundary` interno.
- Testes de unidade.
- Documentação:
  - `docs/persistencia-de-tema.md`: o `readOnly`;
  - `docs/migracoes.md`: uma nota aditiva para cada mudança, e a troca da orientação da linha 794 pela prop;
  - `sarak-ui/GUIA-FRONTEND.md`, pela fonte do `npm run guide`.

## 3.2 Fora
- Mudar a imutabilidade do catálogo da lib.
- Um boundary novo em volta do cromo inteiro.
- **A `plan-182` e a `plan-184` correm em paralelo, no mesmo worktree.**
  - Fique fora de `src/core/i18n/catalog.ts` e de `catalogEntries.access`, `advanced`, `entries` e `system`, que a 182 move.
  - Fique fora de `src/core/Provider/utils/overlayPreferences.ts`, que é da 184.
  - Se precisar de texto novo, acrescente a chave a outro catálogo, só por acréscimo, relendo o arquivo antes.
  - Siga a trava de build da §5, passo 4.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | temas salvos e catálogo imutável |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | props do cromo |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | o que é aditivo (minor) |
| ADR | `specs/adr/010-temas-salvos-pelo-usuario.md` · `specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md` · `specs/adr/017-porta-de-apagar-tema-simetrica-a-de-escrever.md` | as portas de escrever e apagar |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/components/atomic/Feedback/SarakErrorBoundary.tsx` | a prop `onError` que já existe |

# 5. Instruções de execução

1. **B72.**
   - Teste: um tema em `customThemes` com `readOnly: true` → o painel mostra "Duplicar", não mostra "Salvar" nem "Apagar", e o
     `onSave` não é chamado com aquele id.
   - Sem `readOnly`, tudo como hoje.
2. **B63.**
   - Teste: um filho do conteúdo que lança no render → o `onError` do `SarakAppChrome` é chamado uma vez com o erro, e o resto do
     cromo continua na tela.
   - O mesmo teste para `SarakSection`.
3. **Documentação:** as notas, e `npm run guide`.
4. **Verificação do executor:**
   - `npx vitest run` com filtro nos testes novos e nos de `src/components/Layout`, `src/components/atomic/Templates` e
     `src/features/DesignEngine`;
   - `npm run verify -- --tier=quick`;
   - `npm run build`, porque o tipo público muda e o `public-types:check` só roda no build.
   - **Trava de build:** o build roda com a trava `C:\tmp\sarak-build.lock`, a mesma das plans paralelas.
     - Pegue a trava com `node -e "require('fs').writeFileSync('C:/tmp/sarak-build.lock','plan-181',{flag:'wx'})"`. Se o comando
       falhar, outra plan está com ela: espere e tente de novo.
     - Solte com `node -e "require('fs').rmSync('C:/tmp/sarak-build.lock')"` assim que terminar, inclusive se o build falhar.
     - Nunca apague a trava de outra plan. Se ela ficar parada mais de 30 minutos sem build rodando, relate.

# 6. Critérios de aceite

- [ ] Os dois testes falhavam antes e passam depois.
- [ ] O build passa, com `public-types:check` em dia.
- [ ] As notas de migração estão escritas e o kit derivado está em dia.
- [ ] `git diff --stat` mostra só caminhos da §3.1, mais o kit derivado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff do tipo público;
- **mutação, em cópia:**
  - ignore o `readOnly` no painel → o teste do B72 reprova;
  - não repasse o `onError` → o teste do B63 reprova.

# 8. Destino da síntese

**Destino:** `09-temas-e-presets; 05-cromo-e-slots`. Texto para transporte:

- **Spec 09** (temas salvos):

  > Um tema do importador com `readOnly: true` é tratado como os do catálogo da lib: o painel oferece "Duplicar", e não "Salvar"
  > nem "Apagar".

- **Spec 05** (props do cromo):

  > `onError(error, info)`, em `SarakAppChrome` e `SarakSection`, recebe os erros que o boundary interno contém.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-26

**Resultado:** Concluído (com ressalvas de verificação, abaixo)

**Estado do worktree ao iniciar**
Já havia trabalho de outras plans (182 e 184): `src/core/Provider/utils/overlayPreferences.ts` (+ teste), `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts`, `specs/00-indice.md`, plans 177/180 removidas, plans 181/182/184 e `specs/specs/10-seguranca-e-acessibilidade.md` modificados, e `dist/` inteiro modificado/novo. Durante a execução surgiram, vindos das plans paralelas (não são meus): `src/core/i18n/catalog.ts`, `useLibraryText.ts`, `lazyCatalogs*`, `vitest.setup.ts`, `shellPreferenceRow.test.tsx`, `searchTokensTraduzidos.test.ts`, `decisionSummary.test.ts`, `scripts/measure-consumer-boot.mjs`.

**O que foi feito**
- B72: `themeTypes.ts` ganha `readOnly?: boolean` em `SarakThemeEntry`. `useThemeCustomizationActions.ts`: `isReadOnlyTheme`; `isImporterTheme` passa a ser falso para tema `readOnly` (some Apagar e a opção de substituir); novo `handleOpenDuplicate` (abre o modal com `duplicate`). `ThemeActionBar.tsx`: props `isReadOnlyTheme`/`onDuplicate`; com `readOnly` o menu mostra "Duplicar" no lugar de "Salvar tema". `ThemeCustomizationTab.tsx` liga as props.
- B63: `SarakErrorBoundary.tsx` exporta o tipo `SarakErrorHandler`. `onError` novo em `SarakAppChrome` (repassado a `useStableContent`, aos corpos sidebar/topbar/mobile e a `ChromeContentRegion` para o `secondaryContent`) e em `SarakSection` (que passa a omitir o `onError` DOM de `HTMLAttributes`).
- Docs: `docs/migracoes.md` (duas notas 9.0.0 aditivas + troca da orientação da 8.0.0), `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md`; derivados por `npm run catalog` e `npm run guide` (`docs/component-catalog.*`, `sarak-ui/*`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/themeTypes.ts` | alterado | `readOnly` |
| `src/features/DesignEngine/Main/hooks/useThemeCustomizationActions.ts`, `components/ThemeActionBar.tsx`, `ThemeCustomizationTab.tsx` | alterado | Duplicar no lugar de Salvar/Apagar |
| `src/components/Layout/SarakAppChrome.tsx`, `SarakAppChromeMobile.tsx`, `chrome/ChromeSidebarBody.tsx`, `ChromeTopbarBody.tsx`, `ChromeContentRegion.tsx`, `useStableContent.tsx` | alterado | `onError` |
| `src/components/atomic/Feedback/SarakErrorBoundary.tsx`, `Templates/SarakSection.tsx` | alterado | tipo `SarakErrorHandler`; `onError` |
| testes: `useThemeCustomizationActions.test.ts`, `ThemeActionBar.test.tsx`, `SarakSection.test.tsx`, `SarakAppChrome.onError.test.tsx` (novo) | alterado/criado | B72 e B63 |
| `docs/migracoes.md`, `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md` | alterado | notas |
| `docs/component-catalog.*`, `sarak-ui/*` | gerado | derivados |

**Verificações executadas**
- `npx vitest run` nos 5 arquivos de teste novos/tocados + ThemeCustomizationTab → 5 arquivos, 43 testes, verdes.
- `npx vitest run src/components/Layout src/components/atomic/Templates src/features/DesignEngine src/components/atomic/Feedback` → 300/301 arquivos verdes; 2 testes falharam em `configIsSavedDesign.persistenceIntegration.test.tsx` (sob carga, com outras plans rodando); o arquivo isolado passa (3/3).
- `npm run verify -- --tier=quick`: `tsc` OK; `catalog:check` falhou e foi corrigido por `npm run catalog`; `audit:baseline` acusou 1 violação de clean-code minha (`SarakAppChromeMobile.tsx` com 253 linhas), corrigida (249 linhas) — o `run_audit` ainda lista 2 `<input>` cru em `SarakMultiSelect`/`SarakUploader`, arquivos que não toquei; `plan-index:check` falha pela plan-184 (índice 🟡 × frontmatter 🟠), não minha. Não reexecutei o quick completo depois dessas correções.
- `npm run build` (com a trava `C:/tmp/sarak-build.lock`, solta ao fim) → exit 0; `public-types:check` e `catalog:check` passaram.
- Teste do B72/B63 "falhavam antes": não rodei contra o HEAD limpo; os testes exercitam props/campos que não existiam (falhariam por contrato).

**Critérios de aceite**
- [x] Os dois testes passam depois (ver acima); "falhavam antes" não conferido em cópia do HEAD.
- [x] Build passa, `public-types:check` em dia.
- [x] Notas de migração escritas e kit derivado atualizado (`guide`).
- [ ] `git diff --stat` só da §3.1 — parcial: há mudanças de plans paralelas no worktree (listadas acima), e `dist/` do build.

**Decisões e suposições**
- "Duplicar" no menu: o painel já tinha "Duplicar" só como rádio do modal; criei o item de menu `sarak-panel-duplicate-theme` para tema `readOnly`. Sem `readOnly`, nada muda.
- `readOnly` não muda o tratamento dos temas do catálogo (continuam com "Salvar tema" no menu, como hoje).
- `SarakSection` omite o `onError` DOM de `HTMLAttributes` (conflito de tipo); quem passava `onError` de imagem DOM à seção deixa de poder.
- `GUIA-FRONTEND.md` é prosa editada direto; `npm run guide` só injeta/espelha.

**Achados fora do escopo (não corrigidos)**
- `SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118`: `<input>` nativo cru (R10).
- `tsc` acusa `Object is possibly 'undefined'` em testes de plans paralelas (`shellPreferenceRow`, `searchTokensTraduzidos`, `decisionSummary`) — já fora do baseline 0 nos testes alheios.

**Pendências / riscos**
- Rodar de novo o `verify quick` depois que 182/184 assentarem.

---

# 10. Veredito
