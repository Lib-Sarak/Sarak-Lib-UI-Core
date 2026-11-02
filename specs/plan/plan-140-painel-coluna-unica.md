---
tipo: "plan"
titulo: "Unificar o painel numa coluna de seis decisões com a prévia sempre visível"
objetivo: "Fazer o painel ter uma coluna só com seis decisões, opções visuais e ajuste fino em níveis no lugar dos três modos e da galeria sobre a prévia, com um atalho que monta o tema a partir de nome, logo, cor e fonte, sem perder acesso a nenhum token"
dominio: "Painel de customização"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "painel", "ux", "navegacao"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[08-identidade-do-host-e-zero-marca]]", "[[plan-141-enriquecer-presets-do-painel]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "plan-139-painel-previas-reais"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md + specs/specs/08-identidade-do-host-e-zero-marca.md"
---

# 1. Objetivo

Personalizar vira um caminho só: seis decisões na coluna, opções visuais dentro de cada uma, ajuste fino recolhido, prévia sempre visível.
Todo token segue acessível.

# 2. Contexto

Terceira de quatro plans. **O alvo é `specs/plan/anexos/painel-design-prototipo.html`:** o dono o aprovou em 2026-10-31. A tela de amostra e
as cores dele são ilustrativas; a navegação, a hierarquia e o rodapé são o contrato.

Hoje, medido no catálogo: 435 tokens; Impacto mostra 24 (`visualImpact`), Essencial 162 (`importance >= 80`), Completo todos. Há 7 pilares na
lateral e 6 abas na galeria, e a galeria abre sobre a prévia. Os modos dividem por quantidade, não por intenção.

**Decisões do dono:** coluna única; fim do seletor Impacto, Essencial e Completo; atalho "Usar minha marca", com a cor informada pelo usuário
(sem extrair do logo); as seis decisões do protótipo.

**Os três modos viram profundidade, com os dados de hoje:**

| Nível | Conteúdo | Dado |
|---|---|---|
| 1. Decisões | 6 linhas com o valor atual | `design-pillars.json` |
| 2. Opções | grupos visuais da plan-139 + tokens com `visualImpact` | presets e `visualImpact` |
| 3. Ajuste fino | recolhido: primeiro `importance >= 80`, depois "Mostrar todos" | catálogo |

**Mapa das decisões:**

| Decisão | Pilares | Grupos de opção | Tela canônica (§6.6) |
|---|---|---|---|
| Tema | — | temas | `dashboard` |
| Cores | `brand` | paletas, criar de uma cor | `dashboard` |
| Fontes | `typography` | pares de fontes | `typography` |
| Forma | `surfaces` | cards, atmosfera | `dashboard` |
| Componentes | `interaction`, `systems` | botões, campos | `caixas-texto` |
| Layout | `navigation` | composição da barra, bloco global | `dashboard` |

O pilar `advanced` fica no menu **Avançado**, junto da tabela de tokens. A folksonomia continua: token novo entra sozinho no nível 3
([[06-painel-de-customizacao-e-preview]] §2).

**A marca já tem porta:** `SarakBrandingState` (`companyName`, `logoBase64`), escrita pelo `useDesignDraft`. Sem porta nova, e a lib continua
sem impor identidade ([[08-identidade-do-host-e-zero-marca]]).

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Main/` — `ThemeCustomizationTab`, `ThemeSidebarContent`, `ThemeSidebarHeader`, `ThemeImpactList`,
  `ThemePillarsList`, `ThemeGlobalSettings`, `ThemeAdvancedMenu`, `hooks/usePreviewUIState.ts`, `hooks/useThemeCustomizationData.ts`, e os
  componentes novos das decisões e do atalho de marca, com testes.
- `src/features/DesignEngine/Canvas/` — `PresetsCatalog`, `PreviewCanvasLayout` e `PreviewToolbar`: a galeria sai de cima da prévia; modo e
  dispositivo ficam na barra da prévia.
- `src/features/DesignEngine/config/` e `utils/dynamic-categories.ts` — o mapa de decisões.
- `src/core/i18n/` — textos novos, nos seis idiomas.
- `browser-tests/` que abrem a galeria ou escolhem modo.
- `docs/migracoes.md` — subseção na seção da próxima versão: o painel mudou de navegação.
- Snapshots.

## 3.2 Fora
- Tokens, schema e catálogo: nenhum token muda.
- `PaletteCreator` por dentro, os cartões da plan-139, o Command Center e a tabela de tokens: mudam de lugar, não de conteúdo.
- Extrair cor do logo. Presets novos (plan-141).
- `SarakCustomizationPanel` como peça pública: continua o mesmo nome e as mesmas props.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | a navegação inteira |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` inteira | o que muda (§2.1, §2.3, §6.4, §6.6) e o que fica |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` §6 | branding |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner, nunca janela |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, foco, textos |
| Código | `gates/scripts/contrato/check-panel-contract.ts` | o que o gate do painel exige |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Liste, no resumo, cada ação do painel de hoje e onde ela fica depois.
2. **Teste de cobertura primeiro:** todo token que o modo Completo mostra hoje é alcançável numa decisão ou no Avançado. Ele tem de seguir verde
   até o fim.
3. **Coluna.** Cabeçalho (título, Avançado, busca), lista de decisões, rodapé da coluna (`ThemeActionBar`). Ao abrir uma decisão, a tela troca na mesma coluna,
   com voltar; Esc volta; o foco vai ao título ao entrar e à linha ao voltar. Cada linha mostra o valor atual e uma marca de alterada.
4. **Níveis.** Nível 2 com os grupos da plan-139. Nível 3 recolhido, com a contagem real, primeiro `importance >= 80` e depois "Mostrar todos".
5. **Fim dos modos.** Remova o seletor e `editMode`. A busca segue atravessando tudo e leva ao token, abrindo a decisão e o ajuste fino.
6. **Prévia sempre visível.** A galeria deixa de abrir sobre a prévia. Claro/Escuro, dispositivo e tela ficam na barra da prévia. Abrir uma decisão
   leva à tela canônica (§6.6: um gesto, sem laço).
7. **Usar minha marca.** Primeira entrada da coluna: nome, logo, cor principal e par de fontes, com a prévia reagindo. "Gerar" aplica ao rascunho
   `colorPalette` com `custom:analogous:<cor>`, as fontes e o branding. Logo com a validação de arquivo que o painel já usa. Nada é gravado até
   "Aplicar".
8. **Espaço estreito.** Em contêiner estreito, a coluna e a prévia empilham, por container query, com a prévia alcançável. Meça também no modo
   embarcado.
9. **Prévia para o dono:** `C:\tmp\sarak-previa-140\index.html`, com capturas de cada decisão, do atalho e do estreito, nos dois modos.
10. `docs/migracoes.md`. Depois, `npm run build` e `npm run cromo-css-real:check` inteiro, uma vez, com a linha final no resumo. Depois:
    `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
11. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Teste de cobertura verde: nenhum token perdido.
- [ ] A prévia nunca fica coberta enquanto se escolhe uma opção — navegador.
- [ ] Nenhuma ação do painel de antes sumiu (lista do passo 1 conferida).
- [ ] Navegação só por teclado, do início ao "Aplicar", com foco correto ao entrar e voltar — teste.
- [ ] Busca abre a decisão certa com o token visível — teste.
- [ ] Marca: do formulário vazio à prévia com nome, logo, cor e fonte, nada gravado até "Aplicar" — teste.
- [ ] `panel-contract:check` verde, sem afrouxar.
- [ ] `npm run cromo-css-real:check` verde inteiro.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O teste de cobertura do passo 2 fica na suíte.

- `npx vitest run src/features/DesignEngine src/core/Provider src/core/i18n gates/scripts` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Mutação: esconder um token do mapa de decisões faz o teste de cobertura falhar.
- A prévia aberta e o painel real comparados ao protótipo; o veredito só fecha com a aprovação do dono.
- A bateria de navegador não se repete no revisor; o job `cromo-css-real` da CI a mede no push.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` + `specs/specs/08-identidade-do-host-e-zero-marca.md`.

- 06 §2.1 passa a descrever os três níveis no lugar dos modos, e §2.3 e §6.6, a coluna e as decisões.
- 08 §6: o atalho de marca usa a mesma porta de branding, e a identidade continua nascendo ausente.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
 M src/core/Design/palette/__tests__/role-map.test.ts
 M src/core/Design/palette/__tests__/scale.test.ts
 M src/core/Design/palette/contrast.ts
 M src/core/Design/palette/role-map.ts
 M src/core/Design/palette/scale.ts
?? src/core/Design/palette/__tests__/three-bands.test.ts
```
(trabalho da plan-143, não tocado. A plan chegou em `🔴`; executei a pedido do usuário e só movi o status para `🟠` agora.)

**O que foi feito**
- Mapa das decisões em `config/design-decisions.json` + `utils/decisions.ts` (nível 2 = opções e `visualImpact`; nível 3 = `importance >= 80` e depois "Mostrar todos"; índice token→decisão para a busca), `utils/decisionContext.ts` e `utils/decisionSummary.ts`.
- Coluna: `ThemeDecisionList`, `ThemeDecisionHeader`, `ThemeDecisionView`, `ThemeDecisionOptions`, `ThemeFineTuning`, `DecisionTokenList`, `ThemeSearchResults`, `BrandShortcut` (+ `useBrandForm`, `usePendingBranding`); `ThemeSidebarContent`, `ThemeSidebarHeader`, `ThemeGlobalSettings`, `ThemeAdvancedMenu` (entrada "Outros ajustes") e `ThemeCustomizationTab` reescritos. Saem `ThemeImpactList`, `ThemePillarsList`, `editMode`, `isGalleryOpen`, `isPreviewStacked`, `activePillarId`.
- Canvas: `PresetsCatalog` monta um grupo por vez, sem cromo; `PreviewToolbar` ganha Claro/Escuro e tela de amostra; `PreviewCanvasLayout` desenha só o quadro único (`LiveDraftPreviewFrame`, que mantém o inspetor); `panelResponsive.presets.ts` ganha os limiares do painel (640 px do contêiner).
- Textos novos nos seis idiomas em `catalogEntries.panelColumn.ts`; `src/styles/_utilities.css` declara a largura inicial da coluna; `docs/migracoes.md` ganhou a subseção; `sarak-ui/docs/migracoes.md` regenerado por `npm run guide`.
- `useDesignDraft` expõe `draftThemeId` (marca "alterada" do Tema).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/{Main,Canvas,utils,config}/**` | criado/alterado/removido | ver acima; arquivos novos, 2 removidos, testes correspondentes |
| `src/core/i18n/catalogEntries.panelColumn.ts`, `catalog.ts` | criado/alterado | textos novos |
| `src/styles/_utilities.css` | alterado | `.sarak-panel-column` |
| `browser-tests/*` (login, plan-122, plan-135, paletas-cabem, troca-de-tema; novo `plan-140-painel-coluna-unica.spec.ts` e fixture) | alterado/criado | caminho pela decisão no lugar da galeria; novo spec gera a prévia |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md` | alterado | nota de migração e kit gerado |
| snapshots do painel | alterado/removido | regenerados; 2 removidos (`ThemePillarsList`, `ThemeSidebarContent`) |

**Verificações executadas**
- `npx vitest run src/features/DesignEngine src/core/i18n src/core/Provider gates/scripts` → 1850 passam, 2 falham: `PreviewCanvas` (snapshot defasado; regenerado, 11/11 verdes) e `verify_diversity` (`neumorphic-mobile`; plan-143, ver achados).
- Snapshots: regenerados na árvore atual. Numa cópia `git archive HEAD` só com os arquivos da 140, `PreviewCanvas` sai **idêntico** e `PresetsCatalog` difere em 242 linhas, **todas** só de valor de cor (0 linha diferente depois de normalizar as cores): a diferença é da 143. Cópia e junção removidas; `node_modules` do repositório conferido.
- `npm run verify -- --tier=quick`: a 1ª execução acusou 5 falhas (`audit:baseline` hardcode/ghostvars/cleancode, `token-reader` `deviceDesktopMinWidth`, `variable-contract`, R36, `guide:check`); corrigidas. Depois reexecutei isoladamente `audit:baseline --with-tsc` (igual ao baseline), `token-reader:check`, `variable-contract:check`, `check-trail-citation` e `guide:check`: verdes. **Não reexecutei o `verify --tier=quick` inteiro depois dos consertos.**
- `npm run build` → exit 0. `npm run cromo-css-real:check` (inteiro, uma vez): **459 passam, 2 falham**, ambas em `plan-122-preview-mode`: cartão de tema escuro sob preferência clara (eu passava o modo do rascunho em vez do da prévia) e coluna medindo 320 px (medida antes de a largura animar). Corrigidas; reexecutei só `plan-122` e `plan-140` (9/9 verdes). **A bateria inteira não foi repetida após o conserto.**
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` feito.
- Prévia para o dono: `C:\tmp\sarak-previa-140\index.html` (decisões nos dois modos, ajuste fino, barra da prévia, marca, estreito e estreito embarcado).

**Critérios de aceite**
- [x] Teste de cobertura verde — `utils/__tests__/decisions.test.ts` (inclui a mutação: esconder o pilar de Fontes faz acusar perda).
- [x] Prévia nunca coberta — `plan-140-painel-coluna-unica.spec.ts` (geometria prévia × opção em cada decisão, nos 2 modos).
- [x] Nenhuma ação sumiu — lista abaixo.
- [x] Teclado até o "Aplicar", foco ao entrar e voltar — `ThemeColumn.integration.test.tsx`.
- [x] Busca abre a decisão com o token visível e em foco — integração e `ThemeSearchResults.test.tsx`.
- [x] Marca sem gravar até "Aplicar" — integração, `BrandShortcut.test.tsx`, spec de navegador.
- [x] `panel-contract:check` verde no `quick`, antes dos consertos; não reconferido depois.
- [ ] `cromo-css-real:check` verde inteiro — 2 falhas corrigidas, bateria não repetida inteira.
- [x] Prévia gerada; a aprovação do dono é do revisor.

**Ações do painel de antes → depois:** acordeão de pilares → lista de decisões; modos Impacto/Essencial/Completo → níveis 2 e 3; "Abrir/Fechar galeria" e abas → grupos dentro de cada decisão; "Empilhar previews" → removido (não há mais galeria); inspetor da prévia → mantido, agora abre a decisão; Claro/Escuro e dispositivo → barra da prévia; tela de amostra → barra (e menu do cromo); paletas e criar paleta → decisão Cores; bloco global, barra de preferências e identidade → decisão Layout; "Composição da Barra" → nível 2 do Layout; pilar Avançado → menu Avançado › Outros ajustes; Tabela de tokens, Busca por pilar, Temas e JSON → inalterados; busca → resultados abrem a decisão; Aplicar, Descartar, Exportar, Salvar/Novo/Apagar tema, Desfazer e lista de alterações → inalterados; "Descartar por pilar" → "Descartar alterações desta decisão" (a antiga chamava `resetComponent` com id de pilar e não restaurava nada).

**Decisões e suposições**
- Escolher a tela de amostra não leva mais a coluna ao pilar (um gesto, sem laço); a spec 06 §6.6 ainda descreve os dois gestos.
- A marca do atalho fica pendente no painel (`usePendingBranding`) e só vai ao Provider no "Aplicar", porque `updateBranding` grava na hora. Os campos da seção "Identidade da Empresa" (Layout) seguem gravando direto, como antes.
- A prévia passou a usar sempre o `LiveDraftPreviewFrame` (moldura de aparelho e inspetor, antes só no dual-view).
- O token aparece uma vez por decisão (nível 2 não repete no 3). `iconWeight` não pertence a pilar nenhum desde antes: só a busca o edita, no próprio resultado.
- O inspetor mapeia controles→Componentes, cards→Forma, texto→Fontes e o resto→Layout (o mapeamento anterior comparava id de token com id de componente e nunca casava).
- `docs/migracoes.md`: classifiquei como MINOR dentro da 8.0.0; o revisor confirma.

**Achados fora do escopo (não corrigidos)**
- `gates/scripts/audit/__tests__/verify_diversity.test.ts` falha em `neumorphic-mobile` ("neutro"): efeito das cores da plan-143 sem commit.
- `SarakMultiSelect.tsx` e `SarakUploader.tsx` aparecem como FAIL no `run_audit` (já no baseline).
- As amostras de "Estilo dos cards" saem em branco nas capturas iniciais (carregamento visível sob demanda, da plan-139).

**Pendências / riscos**
- Bateria de navegador inteira e `verify --tier=quick` inteiro não repetidos após os últimos consertos.
- Aprovação visual do dono contra o protótipo.
- Nenhum commit feito.


---

## Resumo da execução (correção 1) — 2026-11-02

**Resultado:** Concluído com pendências (fora do escopo, abaixo)

**Achados**
1. **Valores em jargão** — `utils/decisionSummary.ts` passa a mostrar o nome legível do valor, por catálogo de textos nos seis idiomas (`catalogEntries.panelSummary.ts`): Forma "Vidro fosco · Confortável" (`surfaceMaterial` · `layoutDensity`), Componentes "Botão de vidro · Campo contornado", Layout "Navegação: lateral". Valor que o catálogo não conhece **some da linha**: nunca vira id. Teste: `decisionSummary.test.ts` (inclui os seis idiomas sem sobrar id).
2. **"Design" invisível no claro** — o título e a busca usavam `--color-theme-title`; passam a `--theme-title`. A medição achou mais quatro causas, todas corrigidas: (a) `text-[var(--sarak-type-scale-…)]` o Tailwind lê como **cor**, e a cor inválida anulava a cor da classe — converti para `text-[length:var(…)]` nos arquivos da coluna e nos filtros/linhas de `PaletteGallery`; (b) o valor do slider vinha do átomo `SarakSlider` na cor de destaque (1,44:1 no claro): `SliderControl` mostra só o próprio valor, em `--theme-title`, e anuncia por `aria-valuetext`; (c) abas ativas de `CardsCatalog`/`AtmosphereCatalog`/`ButtonsCatalog` usavam `text-theme-text` sobre a cor primária: passam a `text-theme-on-primary`; (d) o atalho de marca e a linha selecionada da paleta usavam tinta primária sobre texto de título (4,4:1): fundo de superfície com borda. **Medida:** `plan-140-painel-coluna-unica.spec.ts` mede o contraste computado de todo texto da coluna (lista e as cinco decisões com controles) nos dois modos: ≥ 4,5:1, verde. `<option>` fica fora da medição (o navegador pinta a lista nativa).
3. **Linha Fontes sem amostra** — "Aa" na fonte de título do design e em `--theme-title`; Forma (caixa com o raio), Componentes (botão na cor primária) e Layout (barra lateral/topo) ganham amostra viva; Tema segue com ícone (não há amostra única).
4. **Amostras e escala** — o `IntersectionObserver` já observa a coluna (a interseção respeita o recorte do contêiner com rolagem); o branco era o momento da captura: o spec agora espera as amostras `data-sx-lazy="pending"` que estão à vista antes de fotografar, e as capturas novas as mostram desenhadas. Título da decisão e dos grupos: escala fixa do painel (`text-base`, `text-xs`, `text-sm`), sem as variáveis de escala do tema.
5. **`verify_diversity.test.ts`** — `neumorphic-mobile` passa a esperar `azul`; `hueFamily` não mudou. `npm run themes:diversity` sem falha; o arquivo todo, 32/32.

**Verificações executadas**
- `npx vitest run src/features/DesignEngine src/core/Design gates/scripts`: 1676 passam, 5 falham; corrigidos: 2 snapshots de classe (`CardsCatalog`, `AtmosphereCatalog`, regenerados; só classes de aba), 1 teste que estourava o prazo de 5 s sob carga (`ThemeDecisionView`, prazo 30 s). Reexecutei esses cinco arquivos: 1 falha restante, `check-variable-contract` (fora do escopo, abaixo). `check-public-types-parity` passou depois de `git restore -- dist` (o build interrompido tinha deixado `dist/` pela metade). Não reexecutei a pasta inteira.
- `npm run verify -- --tier=quick`: `tsc` verde; falham só `audit:baseline` (hardcoded 0→3, ghostvars 0→2) e `variable-contract:check`, todos em arquivos de outra tarefa (abaixo). Nenhum achado em `src/features/DesignEngine`, `src/core/i18n` ou `src/styles`.
- Navegador: `plan-140-painel-coluna-unica` e `plan-122-preview-mode`, 11/11 verdes (build de CSS feito com `npm run build:css`; o `npm run build` completo parou em `catalog:check`, ver abaixo).
- `npm run guide` rodado; `guide:check` em dia.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` feito; sobraram **19 arquivos não rastreados em `dist/`** (chunks com hash, de builds interrompidos): o hook do repositório bloqueia `git clean`; o usuário remove com `git clean -fd -- dist`.
- Prévia: `C:\tmp\sarak-previa-140\index.html` regenerada (lista e seis decisões nos dois modos, ajuste fino, barra da prévia, marca, estreito e estreito embarcado). Conferida à vista contra `painel-design-prototipo.html`: mesma ordem e hierarquia (atalho de marca, seis linhas com valor legível, "Aa", rodapé), título e legendas legíveis nos dois modos. Diferenças que ficam: a linha de Componentes trunca com reticências em coluna de 320 px (como no protótipo); as amostras de card seguem o desenho escuro do preset também no modo claro (plan-139).

**Achados fora do escopo (não corrigidos)**
- `SarakTabsMenu.tsx` (`--sarak-shadow-md`, `--sarak-z-dropdown` sem dono), `SarakResourceRow.tsx` e `insideAffix.tsx` (valores fixos): trabalho de outra tarefa no worktree; é o que reprova `variable-contract:check` e `audit:baseline`.
- `docs/component-catalog.{json,md}` defasados por essas mesmas mudanças de componente (`SarakInput`, gráficos, `SarakResourceRow`): `npm run build` completo para em `catalog:check`. Regenerei e **desfiz** para não misturar o catálogo de outra tarefa.
- `text-[var(--sarak-type-scale-…)]` (cor inválida) segue em ~25 arquivos de `src/features/DesignEngine` que a coluna não mostra no contraste medido.

**Pendências / riscos**
- Bateria de navegador inteira e suíte inteira: do push, pela CI (conforme o veredito).
- Nenhum commit feito.

---

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

A navegação, os níveis, a busca, o atalho de marca, o teste de cobertura e a prévia sempre visível estão certos. `verify --tier=quick` verde na árvore. A comparação com o protótipo aprovado acusa quatro desvios visuais.

1. **Valores em jargão nas linhas.** O rótulo mostra valor cru: "micro-dots · 14 px", "frosted · solid", "sidebar". O protótipo mostra "Contornado · Confortável" e "Navegação: lateral". Use o rótulo legível da opção no catálogo, nos seis idiomas, e, sem rótulo, o nome do preset; nunca o id.
2. **Título "Design" invisível no modo claro** (`claro-0-lista.png`): texto claro sobre fundo claro. Meça: ≥ 4,5:1 nos dois modos, inclusive nas demais legendas da coluna.
3. **Linha Fontes sem amostra** (`claro-0-lista.png`): falta o "Aa" do protótipo, na fonte de título do design. Tema, Forma, Componentes e Layout usam ícone; o protótipo usa amostra viva quando existe.
4. **Amostras em branco e escala grande na coluna** (`claro-4-forma.png`). "Estilo dos cards" abre com amostras vazias: confira se o `IntersectionObserver` observa a coluna, e não só a janela. Se for só o momento da captura, aguarde a amostra e diga isso no resumo. O título da decisão e o do grupo seguem a escala do tema e saem grandes demais: use uma escala fixa do painel, como no protótipo.
5. **Teste de diversidade vermelho, da 143, no commit conjunto:** `verify_diversity.test.ts` espera `neumorphic-mobile` como "neutro", e a variante escolhida pelo dono o leva a "azul". Atualize esse caso para o valor que o tema tem agora, com `hueFamily` sem mudar, e confira que `themes:diversity` continua sem falha.

**Verificação objetiva:** `npx vitest run src/features/DesignEngine src/core/Design gates/scripts`, `npm run verify -- --tier=quick` e, no navegador, `plan-140-painel-coluna-unica` e `plan-122-preview-mode`. A bateria inteira sai no push, pela CI: o commit é conjunto com a 143. Regenere `C:\tmp\sarak-previa-140\index.html` com a lista e as seis decisões, nos dois modos.

## Veredito — 2026-11-02 — correção 1 — técnica conferida, aguarda o dono

Os itens 1 a 5 estão resolvidos. Conferido: `src/features/DesignEngine` e `verify_diversity` com 671 de 671; nas capturas, valores legíveis, "Design" visível, "Aa" na linha Fontes, amostras desenhadas e títulos na escala do painel. As falhas do `quick` vêm de `SarakTabsMenu`, `SarakResourceRow` e `insideAffix`, da `plan-148` em andamento.

**Observação à parte:** com a prévia em Claro, as amostras de Forma saem escuras, porque seguem o modo do rascunho, não o da prévia. Decisão do dono.

Falta a aprovação do dono sobre `C:	mpsarak-previa-140index.html`.

## Veredito — 2026-11-02 — 🟢 Aprovado

O dono aprovou a prévia. As amostras seguirem o modo do rascunho, e não o da prévia, vai para a `plan-141`.
