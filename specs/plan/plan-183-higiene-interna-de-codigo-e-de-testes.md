---
tipo: "plan"
titulo: "Higiene interna de código e de testes"
objetivo: "Fechar onze pendências internas que não mudam a tela: seletor por nome de classe, selo de dispositivo, disputa de textura, leituras e classes mortas, recorte de teste incompleto, nomes de teste com rastro de plan, teste que não protege o que diz, função com dez parâmetros e o config inteiro como host com a opção ligada"
dominio: "Manutenção"
status: "🟢 Aprovada"
prioridade: "Baixa"
tags: ["plan", "higiene", "testes", "refactor"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[11-testes-e-cobertura]]", "[[09-temas-e-presets]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

As onze pendências da tabela deixam de existir. A tela não muda, e cada item fica com um teste ou uma medida que o prova.

# 2. Contexto

Promovidos do backlog em 2026-11-25. Cada lote é independente e pequeno. Faça um por vez e registre cada um no resumo.

| Id | Pendência |
|---|---|
| H16 | `src/features/DesignEngine/Canvas/hooks/useInspector.ts:19` agrupa por `'.card, [class*="card"], [class*="panel"]'`. Uma utilitária com `card` ou `panel` no nome vira "componente" no inspetor. Trocar pelo marcador de componente (`data-*` ou a classe exata) |
| H19 | `DynamicTokenControl.tsx` (Command Center, usado por `Panels/HyperGranularityTab.tsx`) não recebe `previewDevice` e não mostra o selo de dispositivo. A spec 06 §3 diz que todo controle com `isResponsive` mostra; hoje só `TokenControl.tsx` cumpre |
| H41 | Em `src/styles/_atmosphere.css`, com mais de um `data-sx-card-texture-type` no caminho, vence a regra declarada por último, e não a do ancestral mais próximo. A prévia aninhada do painel expõe isso com o `micro-dots` do tema padrão |
| H49 | `src/styles/_base.css:67` lê `--sarak-global-bg-image`, que não chega ao `style` inline quando a imagem é `data:image/…;base64`. A arte só aparece pelo `SarakBackgroundRenderer`. Remover a leitura morta ou fazer a variável chegar, conforme a medida |
| H50 | `.texture-aurora-classic` e `aurora-classic-drift` (`src/styles/_atmosphere.css`, perto da linha 487) não são aplicados por nenhuma opção e têm o `rotate(360deg)` que estourava o `scrollWidth`. Apagar |
| H52 | O recorte `contraste-cyberpunk-claro` (`browser-tests/fixtures/harness-entry.tsx`, perto da linha 287) não declara `textColorMuted`. Herda o escuro do padrão, e o botão secundário (1,09:1) não pode ser medido. Declarar |
| H58 | 16 arquivos `browser-tests/plan-*.spec.ts` e configs, e a variável `SARAK_PLAN124_CHROMIUM_PATH` (`cromo-css-real.spec.ts`, `residuo-da-reauditoria.spec.ts`, `seletor-da-barra-legivel.spec.ts`, `plan-124-isolated.config.ts`). Renomear pelo que cada caso prova, unificar em `SARAK_CHROMIUM_EXECUTABLE_PATH` e apagar o config isolado se a bateria única o cobrir |
| H60 | `browser-tests/troca-de-tema.spec.ts` passa mesmo com `useEffect` de volta em `src/features/DesignEngine/hooks/useDesignDraftSync.ts`. Falta o caso que proteja a fusão dos commits da prévia e da raiz |
| H79 | `useDesignSync` (`src/core/Provider/hooks/useDesignSync.ts:28`) recebe 10 parâmetros posicionais, e o teto é 4. Trocar por um objeto de opções e tirar a entrada do baseline |
| H95 | Com `options.persistence.configIsSavedDesign` ligado, `useDesignSync` (`:79` e `:95`, com `activeThemeId` controlado) e `useThemeSeed` (`src/core/Provider/hooks/useThemeSeed.ts:151-156`) ainda compõem o `config` inteiro como host. Usar a mesma porta do `getHostConfig` do `SarakUIProvider`. Fazer junto com o H79, porque é o mesmo arquivo |
| H96 | `src/components/Layout/chrome/chromeToneContrast.ts` (`LANGUAGE_BUTTON_TINT_SHARE`, `:16`, `:85-87`, `:148`, `:188`) ainda calcula a tinta de 10% do botão de idioma, que o botão não desenha mais (ele tem fundo transparente e contorno). Tirar a tinta da conta, manter as specs `contraste-do-cromo-nas-barras` e `contraste-do-cromo-tom-padrao` verdes e corrigir a frase da [[09-temas-e-presets]] §4.3.4 que a descreve |

# 3. Escopo

## 3.1 Dentro
Os arquivos citados na tabela, os testes deles e, no H58, os arquivos renomeados e quem os referencia (`package.json`, configs do
Playwright).

## 3.2 Fora
- Qualquer mudança visível. Se um item mudar a tela, pare e relate.
- Nenhuma plan corre em paralelo com esta: as anteriores já estão commitadas.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §3 | o selo de dispositivo (H19) |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | nomes e bateria de navegador (H58, H60) |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o baseline do auditor (H79) |
| Doc | `docs/persistencia-de-tema.md` §6 | a opção `configIsSavedDesign` (H95) |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/core/Provider/SarakUIProvider.tsx` (`getHostConfig`) | a porta que o H95 reusa |

# 5. Instruções de execução

1. **Um lote por id, na ordem da tabela.** Em cada um: o teste ou a medida que falha antes, a correção e a passagem depois.
2. **H58:** confira com `grep` que nenhuma referência ao nome antigo sobra.
3. **H79 e H95 juntos:** objeto de opções, porta do host, e um teste com `activeThemeId` controlado e a opção ligada, em que a troca de
   tema pela prop não traz o resto do tema anterior.
4. **Verificação do executor (uma vez, no fim):**
   - `npx vitest run` com filtro nos testes tocados;
   - `npm run verify -- --tier=quick`;
   - **só no H52 e no H60:** `npm run build` e as specs de navegador tocadas, rodadas sozinhas.

# 6. Critérios de aceite

- [ ] Os 11 ids têm, no resumo, o antes e o depois.
- [ ] Nenhuma referência a `plan-NNN` sobra em nome de arquivo de `browser-tests/` nem em variável de ambiente.
- [ ] `useDesignSync` sai do baseline do auditor.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- **mutação, em cópia:**
  - devolva o `useEffect` em `useDesignDraftSync` → o caso novo do H60 reprova;
  - devolva a composição do `config` como host com a opção ligada → o teste do H95 reprova.

# 8. Destino da síntese

**Destino:** `—`. Higiene interna; nenhuma verdade documentada muda.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-26

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
 M dist/... (artefatos de build, ~97 entradas)
 M src/buildInfo.ts
 M src/core/Provider/buildInfo.ts
```
Durante a execução apareceram, sem terem sido tocados por mim: `specs/00-indice.md`, `specs/plan/plan-181/182/184` (removidas), `specs/specs/01`, `05`, `12` e o `status` desta plan (revisor). `specs/specs/09` e `10` já traziam edição de outra tarefa; recebi nelas só substituição exata (abaixo). O `npm run build` regravou `dist/` e os `buildInfo.ts`.

**O que foi feito (antes → depois)**
- **H16** — `useInspector.ts`: `'.card, [class*="card"], [class*="panel"]'` → `.sarak-card` (classe exata que todo cartão da lib leva), em `resolveSchemaId` exportada. Antes, `card-grid-gap`/`side-panel-wrap` viravam "cards"; depois, `shell` (`useInspector.test.ts`, 3 casos; o placeholder com TODO saiu).
- **H19** — `DynamicTokenControl` recebe `previewDevice` e mostra o `DeviceBadge` (agora exportado de `TokenControl.tsx`, com `deviceKeyOf`) em token `isResponsive`; `ThemeSidebarContent` → `HyperGranularityTab` → controle repassam o dispositivo. Teste novo `DynamicTokenControl.seloDeDispositivo.test.tsx` (3 dispositivos + token fixo sem selo).
- **H41** — `_atmosphere.css`: 108 seletores (54 texturas × `.sarak-card`/`.card`) trocaram a exclusão "algum escopo de design com outro tipo no caminho" por "outro tipo ENTRE o ancestral da textura e o cartão", mais o cartão com atributo próprio diferente. Medido no Chromium (`background-size` do `::after`): antes, 4 de 6 cenas erradas (ex.: escopo(pontos)>caixa(grade)>cartão dava pontos; escopo(pontos)>escopo(grade) e escopo(grade)>escopo(pontos) davam nenhuma); depois, 8/8 em `textura-do-cartao-mais-proxima.spec.ts`.
- **H49** — medido: com a variável como a lib a escreve (URL pura, e `data:…;base64` pura), `background-image: var(--sarak-global-bg-image)` computa `none`; só `url("…")` desenharia. Removido o bloco `body::before` de `_base.css` (único uso; nada mais o lia).
- **H50** — apagados `.texture-aurora-classic` e `@keyframes aurora-classic-drift`; o teste de `cartaoQueCedeAClasse.test.ts` passou a afirmar que ele não existe; comentário do limite 3 de `textura-de-pagina.spec.ts` retirado.
- **H52** — `contraste-cyberpunk-claro` declara `textColorMuted: '#475569'` (o do recorte `contraste-claro`); a cena `contraste-botoes` ganhou a sonda `secundario` e o caso entrou na lista de `contraste-do-que-faltava.spec.ts` (nos dois recortes cyberpunk).
- **H58** — 15 specs e 13 fixtures `plan-NNN-*` renomeados pelo que provam (`git mv`); referências atualizadas (specs de navegador, `specs/specs/06`, `09`, `10`); `SARAK_PLAN124_CHROMIUM_PATH` → `SARAK_CHROMIUM_EXECUTABLE_PATH` (nome que outros specs já usavam); `SARAK_PLAN141_MATRIX/PLAN160_MATRIZ/PLAN160_SO` → `SARAK_PRESETS_MATRIX/SARAK_PREVIA_MATRIZ/SARAK_PREVIA_SO`; `plan-124-isolated.config.ts` removido (a config única casa `**/*.spec.ts` e nada o referenciava).
- **H60** — caso novo no fim de `troca-de-tema.spec.ts` (só Modo App): a primeira escrita de `style` na raiz e a do escopo da prévia caem no mesmo quadro (`requestAnimationFrame`). Mutação em `useDesignDraftSync.ts` (`useLayoutEffect` → `useEffect`): o caso novo reprova (raiz no quadro 4, prévia no 3) e os 4 casos antigos seguem verdes; restaurado, passa.
- **H79** — `useDesignSync` recebe um objeto `DesignSyncOptions` (1 parâmetro, eram 10); chamador e `useDesignSync.test.ts` migrados. Não encontrei entrada dele em `gates/baselines/audit-baseline.json`; o auditor ficou igual ao baseline, depois de enxugar `useDesignManager.ts` de 255 para 246 linhas (teto 250).
- **H95** — nova porta `utils/hostConfig.ts` (`resolveHostConfig`/`NO_HOST_CONFIG`), usada pelo `getHostConfig` do `SarakUIProvider` e pelo `useDesignManager`; `useDesignSync` compõe com `getHostConfig?.()` nos dois pontos (tema ativo e tema removido). Testes: `hostConfig.test.ts`, caso novo em `useDesignSync.test.ts` e `configIsSavedDesign.trocaPelaProp.test.tsx` (Provider real, `activeThemeId` controlado, opção ligada). Mutação: com `getHostConfig` devolvendo `configRef.current` direto, o teste reprova (`'23'` em vez de `'16'`); restaurado, passa. `useThemeSeed` **não** mudou (ver decisões).
- **H96** — `chromeToneContrast.ts`: `LANGUAGE_BUTTON_TINT_SHARE` e as duas contas da tinta saíram (`idleExtraBackgrounds` devolve `[]` na topbar; `additionalSurfaces` só trata a lateral); `chromeToneStyle.test.ts` mede o inativo contra a própria barra e prova que a tinta de 10% não entra (3,87:1 com ela). `specs/specs/09` §4.3.4: tirada a menção ao botão de idioma na lista de fundos e reescrita a frase ("não leva tinta… contorno na cor do texto de item").

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Canvas/hooks/useInspector.ts` + teste | alterado | H16 |
| `DynamicTokenControl.tsx`, `TokenControl.tsx`, `HyperGranularityTab.tsx`, `ThemeSidebarContent.tsx` | alterado | H19 |
| `components/__tests__/DynamicTokenControl.seloDeDispositivo.test.tsx` | criado | H19 |
| `src/styles/_atmosphere.css`, `_base.css`, `__tests__/cartaoQueCedeAClasse.test.ts` | alterado | H41, H49, H50 |
| `browser-tests/textura-do-cartao-mais-proxima.spec.ts` | criado | H41 |
| `browser-tests/fixtures/harness-entry.tsx`, `contraste-do-que-faltava.spec.ts`, `textura-de-pagina.spec.ts` | alterado | H52, H50 |
| 15 specs + 13 fixtures `plan-*` de `browser-tests/` (e 8 specs que os referenciam) | renomeado/alterado | H58 |
| `browser-tests/plan-124-isolated.config.ts` | removido | H58 |
| `browser-tests/troca-de-tema.spec.ts` | alterado | H60 |
| `src/core/Provider/utils/hostConfig.ts` + teste | criado | H95 |
| `SarakUIProvider.tsx`, `useDesignManager.ts`, `useDesignSync.ts`, `useDesignSync.test.ts` | alterado | H79, H95 |
| `hooks/__tests__/configIsSavedDesign.trocaPelaProp.test.tsx` | criado | H95 |
| `chromeToneContrast.ts`, `chromeToneStyle.test.ts` | alterado | H96 |
| `specs/specs/06`, `09`, `10` | alterado | nomes de spec renomeada (06, 10) e a frase do H96 (09), por substituição exata |

**Verificações executadas**
- `npx vitest run` por caminho: `useInspector` 3/3; `src/styles` 130/130; `Provider/hooks` + `hostConfig` + `configIsSavedDesign*` 187/187; `Layout/chrome` + `Design/palette` 917/918 → o único vermelho (teste que afirmava a tinta de 10%) foi reescrito, depois 18/18; `DynamicTokenControl.seloDeDispositivo` 4/4.
- `npm run build` → EXIT 0.
- Playwright: `textura-do-cartao-mais-proxima` 8/8; `troca-de-tema` 5/5 (mutação reprova o novo); `contraste-do-que-faltava` + `contraste-do-cromo-nas-barras` + `contraste-do-cromo-tom-padrao` 29/29.
- `npm run audit:baseline` → igual ao baseline; `npm run verify -- --tier=quick` → verde (Anel 0: 0 achados).
- Não rodei a suíte completa, nem `textura-de-pagina.spec.ts` e `cartao-cede-a-classe.spec.ts` no navegador, nem os specs renomeados de `browser-tests/` (só o nome e as referências mudaram).

**Critérios de aceite**
- [x] Os 11 ids têm antes/depois — acima (H49, H50, H52 e H96 por medida ou prova de ausência, sem teste vermelho prévio).
- [x] Sem `plan-NNN` em nome de arquivo de `browser-tests/` nem em variável de ambiente.
- [~] `useDesignSync` sai do baseline — não havia entrada dele no baseline versionado; o auditor está igual ao baseline e o hook tem 1 parâmetro.
- [~] `git diff --stat` só em caminhos da §3.1 — mais `buildInfo`/`dist` do build e as specs 06/10 por referência a nome renomeado.

**Decisões e suposições**
- **H19:** todo token responsivo hoje é `slider`, e o `ResponsiveSliderControl` edita os três pontos de uma vez; o selo "Só no <dispositivo>" ali diz o dispositivo da prévia, não o que o controle grava. Segui a plan e a spec 06 §3 literalmente; o revisor pode preferir outro selo nesse controle.
- **H95 na semente:** `useThemeSeed` continua partindo do `config` (`...configRef.current` e a paleta). Com `configIsSavedDesign` ele é o estado inicial (`docs/persistencia-de-tema.md` §6, exemplo `config={gravado}`); tirá-lo apagaria o primeiro quadro. Só a troca de tema (`useDesignSync`) deixou de compô-lo como host.
- H41 não cobre o mesmo tipo repetido em volta de outro (X>Y>X): a regra de X o descarta (declarado no spec novo).
- H58: renomeei também as fixtures; os `plan-NNN` dentro de conteúdo (testids, chaves de storage, `window.planNNN`, comentários, `SARAK_PREVIA_NNN_DIR`) ficaram, fora do critério.
- Os renomes foram feitos com `git mv`/`git rm`, então estão **no índice (staged)**; nada commitado.

**Achados fora do escopo (não corrigidos)**
- `docs/migracoes.md:1389` ainda descreve `aurora-classic` (histórico, fora do §3.1).
- O H79 pedia "tirar a entrada do baseline", mas o baseline versionado não a tem — a plan pode ter citado outro gate.

**Pendências / riscos**
- Os renomes staged precisam entrar num commit separado das specs que outras tarefas modificaram (`specs/specs/01,05,12`, `00-indice`).
- `dist/` e `buildInfo.ts` foram regravados pelo build.

---

## Resumo da execução (correção 1) — 2026-11-27

**Estado do worktree ao iniciar:** os arquivos do resumo anterior (já listados) mais `specs/00-indice.md` e o `status` da plan (revisor); nenhum outro arquivo alheio.

- **A1 — feito.** `DynamicTokenControl.tsx` (`renderNumber`): o token `isResponsive` renderiza um único `SliderControl` com o ponto do dispositivo da prévia (`deviceKeyOf(previewDevice)`) e grava `{ ...pontos, [dispositivo]: valor }`; o `ResponsiveSliderControl` deixou de ser usado ali (continua exportado). Mesmo selo de antes. Teste novo em `DynamicTokenControl.seloDeDispositivo.test.tsx`: com a prévia no mobile e `{desk:30, tab:20, mob:10}`, há 1 slider, valor `10`, e mexer grava `{desk:30, tab:20, mob:55}`. Em `painelGravaOQueMostra.test.tsx` reescrevi o caso dos três sliders (agora: tablet mostra 10px, 1 slider, grava `{desk:12, tab:20, mob:8}`) e **removi** o caso "dois pontos dentro do debounce", que só existia por haver três sliders num controle (com um slider por vez não há segundo ponto para perder); o caso escalar seguiu verde sem mudança.
  - Mutação (controle volta a gravar os três pontos: `onChange({ desk: next, tab: next, mob: next })`): 3 testes reprovam (`desk: 55` em vez de `30`, `tab: 55` em vez de `20`, etc.). Restaurado: 5/5 no arquivo do selo.
- **A2 — feito.** 13 variáveis renomeadas pelo que fazem: `SARAK_PREVIA_159_DIR`→`SARAK_PREVIA_PAINEL_DIR`, `_161_DIR/_LABEL`→`SARAK_PREVIA_CATALOGO_DIR/_LABEL`, `SARAK_CUSTO_161_ANTES`→`SARAK_CATALOGO_ANTES`, `SARAK_PREVIA_166_DIR`→`SARAK_PREVIA_CUSTO_DIR`, `SARAK_CUSTO_166_RODADAS`→`SARAK_CUSTO_RODADAS`, `SARAK_RODADAS_TEMA_166`→`SARAK_CUSTO_RODADAS_TEMA`, `SARAK_GRUPO_166`→`SARAK_CUSTO_GRUPO`; além das citadas, havia mais cinco com número em `browser-tests` e renomeei também: `SARAK_PREVIA_140_DIR`→`SARAK_PREVIA_COLUNA_DIR`, `SARAK_PREVIA_135_DIR`→`SARAK_PREVIA_PALETAS_DIR`, `SARAK_PREVIA_141_DIR`→`SARAK_PREVIA_PRESETS_DIR`, `SARAK_PREVIA_141_ANTES`→`SARAK_PRESETS_ANTES`, `SARAK_147_VERBOSE`→`SARAK_GRAFICOS_VERBOSE`. Nos 10 arquivos que as citavam. `grep -rnoE "SARAK_[A-Z_]*[0-9]{3}" browser-tests` → vazio (exit 1).
- **A3 — sem conserto.** Não escrevi mais no índice nesta rodada.

**Verificações:** `npx vitest run` em `DesignEngine/components`, `Panels` e `Main`: 81 arquivos, 523 testes, verdes; `npm run verify -- --tier=quick` verde (Anel 0: 0 achados). Sem build nem navegador, como o veredito pediu (o A2 não foi executado em navegador; só nomes de variável).

**Arquivos alterados nesta rodada:** `DynamicTokenControl.tsx`, `DynamicTokenControl.seloDeDispositivo.test.tsx`, `painelGravaOQueMostra.test.tsx`, e os 10 specs de `browser-tests/` do A2.

**Pendências / riscos:** a spec 06 §3 (selo de dispositivo) segue válida; nenhuma frase dela fala do slider triplo do Command Center, mas não conferi o resto das specs por isso.

# 10. Veredito


## Veredito — 2026-11-26 — 🔵 Devolvida

**O que está certo:** H16, H41, H49, H50, H52, H60, H79, H95 e H96, com o antes e o depois no resumo.
- **H95:** a mutação foi feita numa cópia: `resolveHostConfig` devolvendo o `config` mesmo com a opção ligada. Ela reprova os três
  testes novos (`useDesignSync`, `hostConfig` e `configIsSavedDesign.trocaPelaProp`).
- **`useThemeSeed` sem mudança:** a decisão fica aceita. Com a opção ligada, o `config` é o estado inicial, e tirá-lo da semente apagaria
  o primeiro quadro.
- **H79:** a premissa estava errada. O baseline não tinha entrada do `useDesignSync`, e o critério se cumpre pelo hook com 1
  parâmetro.
- **H60:** a mutação ficou com a medida do executor (raiz no quadro 4, prévia no 3), porque roda no navegador.

**Conferência do revisor:**
- `tsc --noEmit`: 0 erros.
- `audit:baseline`: igual ao baseline.
- `trail-citation`, `variable-contract`, `css-important`, `section-pointers`, `guide` e `dev-kit`: em dia.
- vitest em `src/core/Provider`, `src/features/DesignEngine`, `src/components/Layout`, `src/components/atomic/Navigation` e `src/styles`:
  336 arquivos e 2809 testes, todos passam.

**Achados:**

| # | Achado | O que fazer |
|---|---|---|
| A1 | **H19:** o selo diz "Só no <dispositivo>", mas o `ResponsiveSliderControl` do Command Center edita os três pontos ao mesmo tempo. O selo afirma o contrário do que o controle faz, e o executor relatou isso | No token `isResponsive`, o `DynamicTokenControl` passa a editar só o ponto do dispositivo da prévia, como o `TokenControl` (`Main/components/TokenControl.tsx:104-127`), com o mesmo selo. O teste novo prova que, com a prévia no mobile, mexer no controle muda só `mob` |
| A2 | **H58:** sobram variáveis de ambiente com o número da plan: `SARAK_PREVIA_159_DIR`, `SARAK_PREVIA_161_DIR`, `SARAK_PREVIA_161_LABEL`, `SARAK_CUSTO_161_ANTES`, `SARAK_PREVIA_166_DIR`, `SARAK_CUSTO_166_RODADAS`, `SARAK_RODADAS_TEMA_166` e `SARAK_GRUPO_166`, em `barras-decisao`, `catalogo-proporcional` e `amostras-reais-custo`. O critério pede nenhuma | Renomeie pelo que cada uma faz e confira com `grep -rnoE "SARAK_[A-Z_]*[0-9]{3}" browser-tests` vazio |
| A3 | O executor rodou `git mv` e `git rm`: escrita no índice do Git, que não é do agente ([[17-contrato-de-operacao-git]] §2.0). As renomeações estão certas e ficam staged | Nenhum conserto. Não repita |

**Correção — o que rodar:**
- `npx vitest run` no teste do selo (A1), colando no resumo a mutação que o derruba: o controle volta a gravar os três pontos.
- O `grep` do A2.
- Sem build nem navegador: o A2 só troca nomes.


## Veredito (correção 1) — 2026-11-27 — 🟢 Aprovada

- **A1:** o token `isResponsive` do Command Center edita só o ponto do dispositivo da prévia, com o selo. A mutação foi feita numa
  cópia: o controle volta a gravar os três pontos, e 3 testes reprovam. O caso "dois pontos dentro do debounce" saiu porque só existia
  com três sliders no mesmo controle.
- **A2:** o `grep -rnoE "SARAK_[A-Z_]*[0-9]{3}" browser-tests` sai vazio. As cinco variáveis que o veredito não listava também foram
  renomeadas.
- **Ressalva:** o `ResponsiveSliderControl` (`controls/BasicControls.tsx:83`) ficou sem uso em produção. Foi para o backlog.

**Conferência do revisor:** `tsc --noEmit` com 0 erros; `audit:baseline` igual ao baseline; `trail-citation` em dia; vitest em
`src/features/DesignEngine`: 176 arquivos e 1131 testes, todos passam.
