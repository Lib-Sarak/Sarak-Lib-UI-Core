# Relatório final do importador ERP Earendel — migração à `@sarak/lib-ui-core` 8.0.0

Sessão de revisor do ERP, 2026-11-10, para o lote final da `plan-119`. Só leitura e relato: nada foi editado no ERP
nem na lib. Cada item foi conferido contra a **8.0.0 instalada**, não contra a memória da campanha. Os caminhos
`packages/…`, `modules/…` e `tools/…` são do ERP.

## Versão instalada

No ERP a lib está em `packages/ui-kit/node_modules/@sarak/lib-ui-core/package.json`. A raiz não tem
`node_modules/@sarak`, porque `@erp/ui-kit` é a porta única.

```
"name": "@sarak/lib-ui-core",
"version": "8.0.0",
```

- `dist/BUILD_INFO.json`: `libVersion 8.0.0`, `baseCommit 015a84b`.
- `pnpm-lock.yaml` resolve `tar.gz/dc1f8a48`, que é o commit da tag `v8.0.0`.
- A declaração é `"github:Lib-Sarak/Sarak-Lib-UI-Core#v8.0.0"` (`packages/ui-kit/package.json:32`).
- O store do pnpm ainda tem uma cópia `8.0.0-rc.5` sem link. Não é da lib.
- Gate completo hoje (`node tools/gate/validate.mjs --all`): 0 erros, 21 regras locais.

## A. Itens vivos

| # | categoria | o que aconteceu | causa | onde o kit deveria ter avisado | peso | no importador |
|---|---|---|---|---|---|---|
| A1 | kit | 5 variáveis `--sarak-*` que não estão no `catalog.json` da 8.0.0: `modules/proposals/web/src/pages/proposal-ui.css:129,154` (`border-radius-md`, `-lg`) e `modules/contracts/web/src/components/templateLayout.css:60,76,77` (`layout-gap-xs`, `card-padding-lg`, `card-border`) | um nome que não é público cai no valor de reserva do `var()` sem aviso, e a tela sai do tema. `card-padding-lg` existe no `dist/sarak.css` como interno: funciona hoje e pode quebrar sem nota. O ERP achou os cinco à mão, contra o catálogo | `sarak-ui check`: `var(--sarak-*)` do consumidor fora de `catalog.json › tokens.cssVars` (ver C4 e C7) | essencial | pendente |
| A2 | reescrito | `packages/ui-kit/src/errorMessage.ts:1-29` | escrito em 2026-10-30 (`23ab7e2f`). A 8.0.0 entrega `sarakErrorMessage`. Medido: mesma frase para falha de rede e lê `error.message` aninhado | o kit avisou (`docs/migracoes.md:134`, "a base que você reescrevia"), mas nada acusa por máquina. A regra do ERP protege a *peça do ERP*, não a da lib | melhoria | pendente |
| A3 | reescrito | `packages/ui-kit/src/LinkPagination.tsx` (74 linhas). A demanda 17 de `DEMANDAS.md` continua "aberta" no ERP | `SarakPagination.getPageHref` já entrega o link real por página | avisou em `docs/migracoes.md:133`. Mesma lacuna de máquina | melhoria | pendente |
| A4 | reescrito | `packages/ui-kit/src/DocumentFrame.tsx` (126 linhas: a4/telefone, escala pela largura, modo no `localStorage`) | `SarakDocumentFrame` (`format: 'a4' \| 'letter' \| 'phone'`, `zoom: 'fit'`, `actions`) e `sarakPrint` já cobrem isso. O seletor de modo cabe em `actions` | avisou em `docs/migracoes.md:170` | melhoria | pendente |
| A5 | reescrito | `packages/ui-kit/src/documentValidation.ts:24` (`isValidBrazilianCnpj`) | `sarakIsValidCnpj` existe. Medido: aceita alfanumérico (`12.ABC.345/01DE-35` → true) e recusa repetido | **não avisou**: 0 menções no GUIA e em `migracoes.md`, só no `catalog.json`. Deveria estar no mapa "o que a lib já faz" (GUIA, tabela da linha 975) | melhoria | pendente |
| A6 | reescrito | `packages/ui-kit/testing/index.tsx` (66 linhas): dublês de `SarakDataTable`, `SarakChartEngine` e `SarakPDFViewer`, usados por 74 arquivos de teste via `vi.mock('@erp/ui-kit', …)` | `createSarakKitMock` traz os mesmos três dublês. O exemplo do GUIA (`:227-238`) só faz mock de `@sarak/lib-ui-core` direto. Não diz como usar com a porta única que o próprio GUIA descreve (`:286`, `:921`) | GUIA, seção do subpath `testing`: o caso do pacote-porta | melhoria | pendente |
| A7 | reescrito | primeiro paint: o ERP injeta o JSON do tema (`injectedThemePayload.ts`, `injectThemePlugin.ts` e o gateway) e passa `config`. Não usa `sarakCreateThemeBootCss` nem `persistence.preferConfigOverCache` (0 ocorrências) | pelo contrato da `persistencia-de-tema.md` §6:307, o cache local vence o `config` injetado, e não há CSS antes do JS. Não medido no navegador | avisou (GUIA:726-744, `migracoes.md:1403`). O que falta é adoção do ERP | melhoria | pendente |
| A8 | porta | os temas de marca do ERP (`erp-corporativo` e `erp-noturno`, `themes.ts:30-52`) entram em `customThemes` junto com os do usuário (`themePersistence.ts:133`). O ERP recusa o id deles no `onSave` (`isReservedThemeId`, `:67-75`) | `SarakThemeEntry` tem só `id`, `name`, `design` e `contraparte`: não há como marcar um tema do importador como só leitura, e a imutabilidade vale só para o catálogo da lib. Efeito, pelo contrato (não medido): o painel oferece "Salvar" e "Apagar" sobre o tema de marca, e o usuário recebe erro em vez de "Duplicar" | `persistencia-de-tema.md` §3 | melhoria | contornado |
| A9 | kit | o ERP serve `dist/fonts/` por um middleware próprio no Vite de dev (`injectThemePlugin.ts:20-21,74-110`, `fontAssets.ts`, commit `65da25c4`) e passa `fonts.baseUrl` só em DEV (`themePersistence.ts:139-141`) | a causa não foi registrada no ERP. Nasceu na época do `file:`; a reconferir se ainda é preciso com `github:#tag` | o GUIA (`:882-883`) só prevê `baseUrl` para esbuild puro, CJS ou CDN, não para Vite dev em monorepo | melhoria | contornado |
| A10 | kit | demanda 3 do ERP: o kit não publica uma equivalência nativo → componente que se possa checar. O ERP mantém a dele (`tools-local/gate-rules/ui-equivalence.json`: 7 pares e 14 peças) | o catálogo descreve a API, mas não o par "este elemento nativo, aquele componente" | `catalog.json` e a lista do C4 | melhoria | contornado |

## B. Itens já registrados pela lib

| id | estado | evidência na 8.0.0 instalada |
|---|---|---|
| I1 | resolvido | `SarakThemeEntry.contraparte` (`index.d.ts`). O ERP grava `counterpart` (`themePersistence.ts:83`) e devolve (`:113-115`) |
| I2 | resolvido | `type SarakThemeSaveOperation = 'create' \| 'replace'` (`index.d.ts:730`). O ERP faz `PUT /temas/{id}` nos dois casos |
| I3 | resolvido para tema embarcado da lib | o resíduo, tema de marca do importador, é a A8 |
| I4–I8 | resolvidos (veredito do lote 1) | não remedidos no navegador nesta sessão. O `onDelete` do ERP rejeita em falha (`themePersistence.ts:89-93`) |
| I9 | resolvido | `SARAK_REFERENCE_THEMES`: 0 ocorrências em `dist/index.d.ts`. O ERP usa `sarakLoadReferenceThemes` (`themes.ts:30`) |
| I10 | resolvido | `role="alert"` presente na seção `## 7.0.0` de `migracoes.md` |
| I11 | resolvido | `SarakFlexProps.gap?: SarakLayoutGap` (`index.d.ts:1991`). O ERP usa `gap="spacing-md"` (`ErpModulePage.tsx:34`) |
| I12 | resolvido | 0 ocorrências de "23 temas" e de "modelo host" no GUIA e em `persistencia-de-tema.md` |
| I13 | resolvido | o exemplo da §5 de `persistencia-de-tema.md` rejeita. As três portas do ERP lançam em 4xx/5xx (`themePersistence.ts:53,86,92`) |
| C5 | resolvido | `SarakGridItem` no barril |
| I33 | resolvido | seção "valor por dispositivo" no GUIA |
| I34, I36, I38, I39 | resolvidos | nos 5 moldes: 0 `<main`, 0 `gap="md"`, 0 `h1` nativo. O `templates/README.md` cita os 5 |
| I40 | resolvido | `100dvh` no GUIA. Demanda 12 do ERP fechada (os `index.html` sem a cadeia de `height`) |
| I35 | não remedido | o `SarakResourceRow` não foi conferido nesta sessão |
| Anexo ERP T1 (`BUILD_INFO` antigo) | resolvido | `baseCommit 015a84b` é o pai do commit da tag (`dc1f8a48`), como diz a nota do arquivo |
| Anexo T2: `file:`, `pnpm` travando, `prepare-ui-library.mjs`, voltar à 7.0.0 sozinho | resolvido | `github:…#v8.0.0`. `tools/` não tem mais o `prepare-ui-library` |
| Anexo T2: `sarak-ui/VERSION` parado | resolvido | `local-ui-kit-sync` verde. Resincronizado em `2cad5d0b` |
| Anexo T2: worker do PDF | resolvido por contrato | `workerSrc` obrigatório, com a receita de Vite (`migracoes.md:1567`). Falta só a prova visual do lado do ERP (demanda 8) |
| Anexo T2: verificação por máquina para o consumidor | vivo | é a C4 |

## C. Linhas abertas da §5.1

| linha | ainda quer? | motivo |
|---|---|---|
| C1 | não | a 8.0.0 entregou `sarakCreateThemeBootCss` e `preferConfigOverCache`. Ler o tema no backend continua sendo do importador (ADR-003). O que falta é o ERP adotar (A7) |
| C3 | não | o ERP saiu do `file:` e instala pela tag. A `local-ui-kit-sync` cobre a cópia do kit |
| C4 | sim | lista abaixo |
| C6 | não | o ERP não tem login nem organização |
| I30 | indiferente | o ERP não lê o selo. A `local-ui-kit-sync` lê `sarak-ui/VERSION` pelo caminho de arquivo, sem passar pelo `exports` |
| C7 | sim, metade | os títulos de `migracoes.md` já levam a versão. Falta, no `catalog.json`, a lista de tokens removidos ou renomeados em forma de dado: a A1 teria sido pega por máquina |

### C4 — as regras de gate que o ERP mantém sobre o uso da lib

Fonte: `specs/arquitetura/05-regras-e-gate.md` §4.2 do ERP.

| regra | nível | o que barra | violações reais na campanha |
|---|---|---|---|
| `ui-kit` (da base) | erro | em `ui.mode: "kit"`, import direto de biblioteca de UI bruta, ou `web/` sem nenhum import do kit | sem contagem registrada |
| `local-single-ui-entrypoint` | erro | `package.json` fora de `packages/ui-kit` que declara `@sarak/lib-ui-core`, ou arquivo fora de `packages/ui-kit/src` que a importa | sem contagem registrada |
| `ui-token` (da base) | aviso | literal de cor ou fonte fora de `var(--token, …)` em `web/` | 50 avisos em 2026-10-25, todos falso positivo: o motor acusava `var(--token, #hex)`. 0 em 2026-11-02 |
| `local-ui-kit-sync` | aviso | `kitHash` da cópia `sarak-ui/VERSION` diferente do kit instalado | sem contagem. Nasceu do `VERSION` parado em 3.0.0 com a lib em 6.3/7.0 |
| `local-ui-equivalence` | erro | elemento nativo com par na lib, ou cópia de uma peça do kit, com `arquivo:linha` e o substituto | **171** na estreia (2026-11-02, contra a rc.4): `h2` 77 · `section` 59 · `h3` 14 · `h1` 6 · `fieldset` 5 · `header` 2 · `nav` 1 · peças 7. Hoje 0 |
| candidata (não existe) | — | `var(--sarak-*)` fora de `catalog.json › tokens.cssVars` | 5 reais hoje (A1) |

## Fechamento

Campanha de migração à 8.0.0 concluída: **não**. O ERP roda na 8.0.0 com gate verde. Faltam: os 5 nomes
`--sarak-*` não públicos (A1); as 5 peças reescritas que a 8.0.0 entrega (A2–A6); adotar o CSS de boot (A7); e
fechar as demandas 8 (prova visual do PDF) e 17 (já resolvida pela lib) no `DEMANDAS.md` do ERP.
