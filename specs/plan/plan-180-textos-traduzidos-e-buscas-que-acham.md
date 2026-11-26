---
tipo: "plan"
titulo: "Textos da lib traduzidos, plural certo e buscas que acham o que o usuário procura"
objetivo: "Fazer todo texto visível da lib sair do catálogo nos seis idiomas com singular e plural, fazer a busca da barra achar sub-abas e a busca do painel abrir o token geral para frases vagas"
dominio: "Idiomas / Busca"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "i18n", "busca", "painel", "cromo"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[05-cromo-e-slots]]", "[[12-kit-do-consumidor]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

- Com o painel em inglês ou alemão, nenhum texto da lib aparece em português.
- "Aprovar 1 selecionado" sai no singular.
- A busca da barra acha sub-abas.
- Frases vagas na busca do painel abrem o ajuste geral, e não o de um componente específico.

# 2. Contexto

Quatro achados do backlog, promovidos em 2026-11-25:

| Id | Achado |
|---|---|
| B94 | **Textos em português fora do catálogo:** `ThemeAdvancedMenu.tsx` ("Avançado", "Telas avançadas", "Voltar ao modo normal"); o padrão `actionLabel = 'Executar'` do `SarakActionCard` público (`src/components/atomic/Cards/SarakActionCard.tsx:31`), que chega ao importador; o `title` de `LiveDraftPreviewFrame.tsx:69` ("Modo de Inspeção…"); as amostras da prévia ("Meu sistema", telas e cards); as descrições dos 25 temas na galeria; as abas "Curados" e "Por Estilo"; "Opacidade"; o título "Personalizar o tema" (`CustomizationPanelImpl.tsx:19`); o selo e o aviso de dispositivo de `TokenControl.tsx` |
| B67 | **Plural:** "Aprovar {count} selecionados" e "Rejeitar {count} selecionados" (`src/core/i18n/catalogEntries.system.ts:144,148`) não têm forma singular. O catálogo não tem plural |
| B80 | **Busca da barra:** `getSarakSearchItems` (`src/components/Layout/chrome/navItem.ts:78`) não desce em `children`, e sub-abas não são achadas |
| B62 | **Busca do painel:** frases vagas abrem o específico. `quero bordas mais grossas` → `chartThickness`; `cor do título da página` → `textColorMaster`; `velocidade das animações` → `chatAnimationSpeed`; `deixar os cantos mais retos` → `tableBorderRadius`; `como deixo o site escuro` → `shadowColorMode`. Falta dar peso ao token geral no casamento parcial (`src/features/DesignEngine/utils/token-search.ts`, `Panels/hooks/useSovereignSearch.ts`) |

# 3. Escopo

## 3.1 Dentro
- `src/core/i18n/`: as chaves novas nos seis idiomas e uma forma de plural no catálogo (singular e plural por chave, escolhida por
  `count`), usada pelos dois rótulos do B67 e por toda chave com `{count}` ou `{total}` que hoje erra o singular.
- Os arquivos do B94, trocando o literal pela chave.
- `src/components/Layout/chrome/navItem.ts`: `getSarakSearchItems` inclui os filhos, com a categoria do pai.
- `src/features/DesignEngine/utils/token-search.ts` e `useSovereignSearch.ts`: o peso do token geral.
- Testes de unidade.

## 3.2 Fora
- Os arquivos de componente que as plans 176, 177 e 178 tocam, salvo a troca de um literal por chave. Se a troca colidir com uma
  delas em andamento, deixe o arquivo para o fim e registre.
- Textos de exemplo do importador e o kit `sarak-ui/`, que é derivado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | textos e busca do painel |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | a busca da barra |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `test-unitario` | caso que falha antes |
| Código | `src/core/i18n/catalog.ts` · `catalog.types.ts` | a forma do catálogo |
| Código | `src/features/DesignEngine/Main/components/__tests__/decisionTextsEmIngles.test.tsx` | molde do teste "nada em português no inglês" |

# 5. Instruções de execução

1. **B94.** Estenda o teste molde a cada superfície da tabela: com o painel em `en` e `de`, nenhum dos literais aparece. O teste
   falha antes da correção. Depois troque os literais por chaves.
2. **B67.** Plural no catálogo e teste dos dois rótulos com `count` igual a 1 e a 2, em pt e en. Varra as chaves com `{count}` ou
   `{total}` e aplique o plural onde o singular erra.
3. **B80.** Teste: um item com `children` → a busca devolve o pai e os filhos, e cada filho leva a categoria do pai.
4. **B62.** Teste com as 5 frases da tabela, esperando o token geral de cada uma, decidido pelo grupo do painel a que a frase se
   refere. Ajuste o peso até as 5 passarem sem quebrar os testes de busca que já existem.
5. **Verificação do executor:**
   - `npx vitest run src/core/i18n src/features/DesignEngine src/components/Layout/chrome`;
   - `npm run verify -- --tier=quick`.

   Sem suíte completa e sem bateria de navegador.

# 6. Critérios de aceite

- [ ] Os quatro testes falhavam antes e passam depois; o resumo traz as duas saídas.
- [ ] Nenhum literal da tabela B94 sobra no código (`grep` no resumo).
- [ ] As chaves novas existem nos seis idiomas.
- [ ] Os testes de busca que já existiam continuam passando.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o `grep` dos literais;
- **mutação, em cópia:**
  - volte um literal do B94 → o teste de idioma reprova;
  - retire a descida em `children` → o teste do B80 reprova.

# 8. Destino da síntese

**Destino:** `—`. Corrige o código para cumprir o que o catálogo de idiomas e a busca já prometem.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-26

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
 M src/buildInfo.ts
 M src/core/Provider/buildInfo.ts
 (+ dist/ modificado/removido/não rastreado, e specs/00-indice.md, plans 176/177/178/180/183 alteradas pelo revisor)
```
Durante a execução a plan-177 (paralela) passou a alterar, entre outros, `src/core/i18n/catalog.ts` (acrescentou `CATALOG_KEYBOARD`), `OptionTile.tsx`, `CuratedGrid.tsx`, `CollapsibleSection.tsx`, `ChromeMobileDrawer.tsx`, `src/styles/_elements.css`. Não toquei nesses além de uma linha de import/spread em `catalog.ts`.

**O que foi feito**
- B67 — plural: `useLibraryText.ts` ganhou `pluralKey`: com `count` igual a 1 usa a chave `<nome>One` se existir. Formas singulares em `catalogEntries.visibleTexts.ts`: `approvalApproveSelectedOne`, `approvalRejectSelectedOne`, `fineTuningCountOne`, `tableRowsFoundOne` (seis idiomas). Varri as chaves com `{count}`/`{total}`: as demais ou já têm par próprio (palette, themePendingChange) ou não erram o singular (`{total}` sempre >1; "Resultados (1)").
- B94 — literais trocados por chaves (arquivo novo `catalogEntries.visibleTexts.ts`, registrado em `catalog.ts`): `ThemeAdvancedMenu.tsx` (trigger, menu, voltar, 3 itens), `SarakActionCard.tsx` (default `Executar` → catálogo), `LiveDraftPreviewFrame.tsx` (title), `PreviewSystemRenderer.tsx` (marca, cargo, 3 notificações, "Mais telas"), `previewScreens.ts` (`labelKey` por tela; `label` pt mantido) + `PreviewToolbar.tsx` + `MoreScreensMock.tsx`, `ButtonsCatalog.tsx` (Curados/Por Estilo), `AtmosphereCatalog.tsx` e `ColorControl.tsx` (Opacidade), `CustomizationPanelImpl.tsx` (título), `TokenControl.tsx` (selo e dica de dispositivo). Descrições dos 27 temas em 5 idiomas: `presetTexts/themeDescriptions.ts`, ligada em `presetTexts/index.ts`, lida por `PresetCard.tsx` e `PresetCardPending.tsx`.
- B80 — `navItem.ts`: `getSarakSearchItems` devolve o pai e os filhos ativos (um nível), cada filho com a categoria do pai.
- B62 — `token-index.ts` (`general` + `isGeneralSchema`: schemas global/system/colors/motion/typography), `token-search.ts` (critério `general` depois de `exact`; palavras de escopo `pagina/site` não filtram quando há outro termo, mas o nome inteiro ainda as pode conter), `token-search-concepts.json` (grupo `espessura`; `retos/quadrado…` em `arredondamento`; `site` em `pagina`), `como/deixo` em stop-words; a flag é preenchida em `searchableTokens.ts`, `useSovereignSearch.ts` e `MasterControlPanel.tsx`.
- Testes novos: `core/i18n/__tests__/plural.test.tsx`, `features/DesignEngine/__tests__/textosForaDoCatalogoEmIngles.test.tsx`, `utils/__tests__/token-search.geral.test.ts`, caso novo em `navItem.test.tsx`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/i18n/catalogEntries.visibleTexts.ts` | criado | chaves novas (6 idiomas) e formas `One` |
| `src/core/i18n/presetTexts/themeDescriptions.ts` | criado | descrição dos 27 temas em en/es/fr/de/it |
| `src/core/i18n/{catalog,useLibraryText}.ts`, `presetTexts/index.ts` | alterado | registro, `pluralKey`, `themeText` |
| `src/features/DesignEngine/**` (componentes listados acima, `previewScreens.ts`) | alterado | literal → chave |
| `src/components/atomic/Cards/SarakActionCard.tsx` | alterado | default do `actionLabel` vem do catálogo |
| `src/components/Layout/chrome/navItem.ts` | alterado | busca desce em `children` |
| `src/features/DesignEngine/utils/{token-index,token-search}.ts`, `config/token-search-concepts.json`, `Main/hooks/searchableTokens.ts`, `Panels/hooks/useSovereignSearch.ts`, `Main/MasterControlPanel.tsx` | alterado | peso do token geral e conceitos |
| 4 arquivos de teste (acima) | criado/alterado | casos novos |

**Verificações executadas**
- Falhavam antes, em cópia do `HEAD` fora do repo (`git archive`, junção, removida antes de apagar; `node_modules` íntegro; `git status` idêntico antes/depois): B94 10/10 vermelhos, B67 5 vermelhos (os `count`=1), B62 5/5 vermelhos; B80: `navItem.test.tsx` 1 falha/7 passam antes da correção. Depois: todos verdes (25 + 6 + 8 no `navItem`).
- `npx vitest run src/core/i18n src/features/DesignEngine src/components/Layout/chrome` → 1436 passaram, 11 falharam; após eu corrigir uma regressão minha (`searchTokensTraduzidos`, 4 falhas, causada pelo peso geral antes do `exact`; agora `Main/hooks`+`utils` 313/313). As 7 falhas restantes não são deste diff: snapshots de `AtmosphereCatalog`, `CardsCatalog`, `PresetsCatalog`, `PreviewCanvas`, `EngineCustomizationTab` (diferenças `inert`, `focus-visible`, `aria-label`/`aria-expanded`, `data-sarak-content-anchor`, plan-177) e 2 de `designGravadoEscolhas` (`sidebarColor` `#0d1819` → `#ddecee`, plan-176/178). Não rodei essa leva em `HEAD` limpo para provar uma a uma.
- `npm run verify -- --tier=quick` → 5 falhas: `tsc` (2 erros em `ChromeMobileDrawer.test.tsx`, prop `label`, da plan-177), `audit:baseline --with-tsc` (consequência do `tsc`), `variable-contract:check` (`--sarak-focus-*` em `_elements.css`, plan-177), `catalog:check` e `guide:check` (derivados defasados; o meu JSDoc do `actionLabel` entra nisso, junto com as mudanças de 177). `gate`s demais, Anel 0 (1071 linhas, 0 achados), `plan-index`, `kit-names` OK.
- `grep` dos literais da tabela B94 fora de testes: só restam as próprias entradas pt do catálogo e `label: 'Mais telas'` em `PreviewToolbar.tsx:18` (campo pt de `PreviewScreen`, nunca exibido).

**Critérios de aceite**
- [x] Quatro testes falhavam antes e passam depois — evidência acima.
- [x] Nenhum literal da B94 sobra no código (ressalva do `label` pt acima).
- [x] Chaves novas nos seis idiomas — `catalog.test.ts` (paridade) passou; temas em 5 + pt do próprio tema.
- [x] Testes de busca existentes passam — `utils` 216/216 e `Main/hooks` verdes.
- [ ] `git diff --stat` só com caminhos da §3.1 — dois pontos: `SarakActionCard.tsx` (componente do `atomic/`, necessário ao item "Executar" do B94, não listado na §3.1 por caminho) e `Main/MasterControlPanel.tsx`/`searchableTokens.ts`/`token-index.ts`/`config/*.json` (fiação do peso geral; a §3.1 cita só `token-search.ts` e `useSovereignSearch.ts`).

**Decisões e suposições**
- Plural por convenção `<chave>One` (escolhida pelo hook), em vez de mudar o formato do catálogo.
- "Token geral" = ajuste de schema `global/system/colors/motion/typography`. Alvos esperados que adotei: `borderWidth`, `titleColor`, `motionDurationNormal`, `borderRadius`, `mode`; a plan não os nomeia, `titleColor` é a escolha mais discutível (a frase só casa com ele por o nome "Cor do Título").
- Os nomes de dispositivo ("Mobile/Tablet/Desktop") do selo seguem o catálogo; "telas e cards" da amostra da prévia: traduzi telas, marca, cargo e notificações; não encontrei texto de card de amostra em português fora dos mocks.

**Achados fora do escopo (não corrigidos)**
- `ColorControl.tsx` ainda tem `aria-label` em português: "Cor de {label}" e "Seletor de {label}".
- `TemplatesTab.tsx:76` ("Tema customizado.", "Integração Host") e `CustomizationPanelImpl`'s corpo de mocks seguem em português.
- Cada `OptionTile`/catálogo com snapshots quebrados pela plan-177 precisa de `-u` do dono dessa plan.

**Pendências / riscos**
- `npm run catalog` e `npm run guide` (derivados) precisam ser regenerados no commit; não os rodei (geradores, fora do escopo).
- O peso do token geral muda a ordem real da busca do painel para consultas sem nome exato (efeito pretendido); só cobri as 5 frases e a suíte existente.

---

# 10. Veredito

## Veredito — 2026-11-26 — 🔴 Devolvida para completar

**O que foi verificado:**
- **Mutação, em cópia fora do repositório:**
  - sem a descida em `children` (`navItem.ts:100`), o `navItem.test.tsx` reprova 1 de 8;
  - com `actionLabel ?? 'Executar'` de volta no `SarakActionCard`, o `textosForaDoCatalogoEmIngles.test.tsx` reprova 2 de 10, em
    `en` e em `de`.
- **Escopo:** a extensão para `SarakActionCard.tsx` e para a fiação do peso geral (`token-index.ts`, `searchableTokens.ts`,
  `MasterControlPanel.tsx`, `token-search-concepts.json`) é consequência direta do B94 e do B62, e fica aceita.
- **Plural:** a convenção `<chave>One`, escolhida por `count` em `useLibraryText`, é suficiente e não muda o formato do catálogo.
- **Falhas que não são desta plan:**
  - os snapshots do painel (`inert`, `focus-visible`, `aria-*`, `data-sarak-content-anchor`) e o `tsc` de
    `ChromeMobileDrawer.test.tsx` são da `plan-177`, em andamento;
  - as 2 falhas de `designGravadoEscolhas.persistenceIntegration.test.tsx` vêm do commit `cd9d5c85` (`plan-176`). O teste passa 7 de 7
    em `9c9bd4dd`, `c9325cba` e `d417cd22`, e reprova 2 no `HEAD` limpo. A correção vai para a `plan-184`.

**Achados:**

1. **O objetivo da §1 ("nenhum texto da lib aparece em português com o painel em inglês ou alemão") não foi cumprido.**
   - Sobram os textos que o próprio resumo lista:
     - `src/features/DesignEngine/Main/TemplatesTab.tsx:62` ("Integração Host");
     - `TemplatesTab.tsx:76` ("Tema customizado.");
     - `src/features/DesignEngine/components/controls/ColorControl.tsx:61,84` (`aria-label` "Cor de {label}" e
       "Seletor de {label}"). O nome acessível também é texto da lib.
   - **Correção:** troque esses textos por chaves nos seis idiomas e estenda o teste de idioma a eles.
   - A `plan-177` pode estar mexendo em `ColorControl.tsx`. Releia o arquivo antes de editar e troque só o texto.
2. **Falta a nota de migração.**
   - O `SarakActionCard` é público, e o `actionLabel` padrão passa a sair no idioma da lib. Um importador com a lib em inglês vê "Run"
     no lugar de "Executar".
   - **Correção:** uma nota em `docs/migracoes.md` e `npm run guide`.
3. **Os derivados estão defasados.** O `catalog:check` acusa `docs/component-catalog.{json,md}`, que vem do JSDoc do `actionLabel`.
   - **Correção:** rode `npm run catalog` e `npm run guide` no fim.
   - O `src/core/i18n/catalog.ts` já traz linhas desta plan e da `plan-177`. Por isso, as duas saem **num commit só**, depois da
     aprovação da 177. Não tente separar.

**Verificação desta rodada:**
- vitest com filtro no teste de idioma e nos testes de `Main/` e `components/controls`;
- `npm run catalog:check` e `npm run guide:check`.

## Resumo da execução (correção 1) — 2026-11-26

**Resultado:** Concluído

**Estado do worktree ao iniciar:** 90 linhas fora de `dist/`, entre elas as desta plan (rodada 1), as da plan-177 em andamento e as plans/índice do revisor; nada revertido.

**Achados**
1. **Textos que sobravam** — `TemplatesTab.tsx`: "Integração Host", "Tema customizado.", e também "Selecionado", "Escolher tema" e "Carregando…" (mesmo arquivo, mesmo defeito), por chaves novas em `catalogEntries.visibleTexts.ts` (seis idiomas). O nome e a descrição dos temas ali vinham em português do catálogo leve; passam por `usePresetText().preset(entry)`. `ColorControl.tsx`: `aria-label` "Cor de {label}" e "Seletor de {label}" → `colorOf` e `colorPickerOf`, trocando só o texto (releitura antes de editar). O teste `textosForaDoCatalogoEmIngles.test.tsx` ganhou `TemplatesTab` e o nome acessível do seletor de cor, com os literais novos na lista. O teste existente `TemplatesTab.test.tsx` precisou de `useSarakUIOptional` no `vi.mock` do provider (o hook de texto o lê).
2. **Nota de migração** — `docs/migracoes.md`: entrada "9.0.0 — o `actionLabel` padrão do `SarakActionCard` sai no idioma da lib".
3. **Derivados** — `npm run catalog` e `npm run guide` rodados.

**Verificações executadas**
- `vitest` em `textosForaDoCatalogoEmIngles` + `Main/` + `components/controls`: 443 passaram e 7 falharam, as 7 por causa do mock acima (6 em `TemplatesTab.test.tsx`) e por um estouro de tempo no caso "abas dos catálogos" sob carga; após o ajuste, `TemplatesTab.test.tsx` + teste de idioma → 18/18; `src/core/i18n` → verde (97 passaram na leva anterior).
- `npm run catalog:check` → "catálogo em dia"; `npm run guide:check` → "kit em dia (9 arquivos)".
- `tsc --noEmit`: só os 2 erros de `ChromeMobileDrawer.test.tsx` (plan-177), nada deste diff.

**Arquivos alterados:** `TemplatesTab.tsx`, `ColorControl.tsx`, `catalogEntries.visibleTexts.ts`, `textosForaDoCatalogoEmIngles.test.tsx`, `TemplatesTab.test.tsx`, `docs/migracoes.md`; gerados: `docs/component-catalog.{json,md}`, `sarak-ui/{START-HERE.md,VERSION,catalog.json,docs/migracoes.md}`.

**Decisões e suposições:** os derivados contêm também o que a plan-177 mudou; seguem o aviso do veredito (um commit só com a 177, depois da aprovação dela).

**Achados fora do escopo (não corrigidos):** o caso "abas dos catálogos" do teste de idioma é lento (≈7 s em `en` sob carga) e pode estourar o tempo em máquina carregada.

**Pendências / riscos:** nenhuma desta plan; ficam as falhas da plan-177 e da plan-184 descritas no veredito.

## Veredito (correção 1) — 2026-11-26 — 🟢 Aprovada

**O que foi verificado:**
- **Os três achados foram fechados.** Nenhum dos quatro textos citados sobra no código, e o executor trocou junto "Selecionado",
  "Escolher tema" e "Carregando…" do mesmo arquivo. O nome e a descrição de cada tema na aba de templates passam pelo texto do preset.
  A nota de migração do `actionLabel` está em `docs/migracoes.md`, e os derivados foram regerados.
- **Mutação, em cópia fora do repositório:**
  - com "Integração Host" de volta em `TemplatesTab.tsx`, o `textosForaDoCatalogoEmIngles.test.tsx` reprova 2 de 2, em `en` e em `de`;
  - com o arquivo restaurado e só o `aria-label` "Seletor de {label}" de volta em `ColorControl.tsx`, o mesmo teste reprova 2 de 2.
- **Consumidores:** `npx vitest run src/features/DesignEngine/Main src/features/DesignEngine/components src/features/DesignEngine/__tests__ src/core/i18n`,
  com os importadores de `ColorControl` e `TemplatesTab`: 596 passaram e nenhum falhou.
- **Escopo:** o ajuste de `useSarakUIOptional` no mock de `TemplatesTab.test.tsx` é consequência do hook de texto e fica aceito. As
  outras mudanças de `ColorControl.tsx` no worktree, o contorno de foco e a remoção de `outline-none`, são da `plan-177`.

**Ressalva:** o resumo diz que o caso "abas dos catálogos" do teste de idioma leva cerca de 7 s em `en` com a máquina carregada. Ele não
estourou nesta leva. Se estourar no fechamento, entra no mesmo achado do backlog sobre os prazos da suíte.

**Commit:** sai num só, junto com a `plan-177`, depois da aprovação dela. O `src/core/i18n/catalog.ts` e os derivados têm linhas das duas.

## Veredito (correção 2) — 2026-11-26 — 🔴 Aprovação revogada antes do commit

**O que reprova:** `node gates/scripts/release/check-audit-baseline.mjs` acusa `auditor_hardcoded.mjs.valor: 0 -> 25`, e as 25 são
de `src/core/i18n/presetTexts/themeDescriptions.ts`. Nas linhas 10, 13, 17, 21 e 23, as descrições de 5 temas citam a cor da marca
em hex (`#00ff41`, `#d4af37`, `#ff9900`, `#2e7d32`, `#ff0000`) nos cinco idiomas. Em português, a mesma frase mora no arquivo do
tema, em `src/core/Design/presets/`, que o auditor isenta como dado de design. A tradução não está nessa pasta.

O hex ali é texto que o usuário lê, não estilo. Por isso a correção é a isenção pontual que o auditor já aceita, e não tirar a cor
da frase.

O 🟢 anterior saiu sem esta conferência, que a rodada de vereditos exige. A falha é do revisor.

**Correção:**
- acima de cada uma das 5 linhas, um comentário
  `// sarak-allow-hardcode: o hex é texto da descrição do tema, que nomeia a cor da marca; não é estilo.`
  O auditor lê o marcador na linha do literal ou na imediatamente acima;
- nada mais no arquivo.

**Também nesta rodada:** o caso "abas dos catálogos, opacidade da atmosfera e a barra do preview" de
`textosForaDoCatalogoEmIngles.test.tsx` estourou o prazo na leva do revisor, com a máquina carregada. É o risco que o resumo já
apontava. Divida o caso em um por superfície (`it.each`), sem tirar superfície nenhuma.

**Verificação desta rodada:**
- `node gates/scripts/release/check-audit-baseline.mjs` sem regressão;
- `npx vitest run src/features/DesignEngine/__tests__/textosForaDoCatalogoEmIngles.test.tsx`.

## Resumo da execução (correção 2) — 2026-11-26

**Resultado:** Concluído

**Estado do worktree ao iniciar:** muitas linhas fora de `dist/` (esta plan, a plan-177 em andamento, plans/índice do revisor); nada revertido.

**Achados**
1. **Baseline de hardcode (25 achados em `themeDescriptions.ts`)** — o comentário `// sarak-allow-hardcode: o hex é texto da descrição do tema, que nomeia a cor da marca; não é estilo.` entrou na linha imediatamente acima de cada uma das 5 entradas com hex (`cyberpunk-neon-classic`, `dot-matrix-elegant`, `industrial-terminal-classic`, `nature-breeze`, `neo-brutalism-classic`). Nada mais mudou no arquivo.
2. **Caso que estourou o prazo** — em `textosForaDoCatalogoEmIngles.test.tsx`, o caso "abas dos catálogos, opacidade da atmosfera e a barra do preview" virou um `it.each` de 4 superfícies (Botões, atmosfera, barra do preview, "mais telas"), sem tirar nenhuma.

**Verificações executadas**
- `node gates/scripts/release/check-audit-baseline.mjs` → "igual ao baseline de 2026-10-12 — nenhuma regressão" (antes: `valor: 0 -> 25`).
- `npx vitest run src/features/DesignEngine/__tests__/textosForaDoCatalogoEmIngles.test.tsx` → 18/18 passaram (tests 14,96 s).

**Arquivos alterados:** `src/core/i18n/presetTexts/themeDescriptions.ts` (5 comentários), `src/features/DesignEngine/__tests__/textosForaDoCatalogoEmIngles.test.tsx` (it.each).

**Decisões e suposições:** o hook de identificadores do ambiente reclamou do nome `novo` num script temporário fora do repositório; não afeta o diff.

**Achados fora do escopo:** nenhum.

**Pendências / riscos:** o commit segue único, junto com a plan-177.

## Veredito (correção 2) — 2026-11-26 — 🟢 Aprovada

**O que foi verificado:**
- `node gates/scripts/release/check-audit-baseline.mjs`, rodado pelo revisor antes do 🟢: igual ao baseline, sem regressão. Os 5
  marcadores ficam na linha logo acima de cada entrada com hex e trazem o motivo.
- `textosForaDoCatalogoEmIngles.test.tsx`: o caso dividido mantém as quatro superfícies (aba Botões, opacidade da atmosfera, barra
  do preview e "mais telas"), uma por caso.

**Commit:** sai num só, junto com a `plan-177`, depois da aprovação dela.
