---
tipo: "plan"
titulo: "Corrigir a prévia de fontes, compactar as paletas e enxugar a barra de ações do painel"
objetivo: "Fazer cada fonte da galeria aparecer com a própria fonte, escolher uma fonte sem efeito colateral, as paletas ocuparem uma linha fina por item e a barra de ações do painel mostrar só Aplicar, Descartar e as mudanças, com o resto num menu"
dominio: "Painel de customização"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "painel", "ux", "paletas", "fontes"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[plan-139-painel-previas-reais]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "plan-136-cor-ancora-fundo-tingido-e-harmonia-visivel"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Sem mudar a estrutura do painel: cada fonte aparece com a própria fonte, a paleta vira uma linha fina e a barra de ações fica com uma só
ação principal.

# 2. Contexto

Primeira de quatro plans do redesenho do painel, aprovado pelo dono em 2026-10-31 sobre o protótipo
`specs/plan/anexos/painel-design-prototipo.html` (abra no navegador: é a referência visual das quatro). Sequência: 138 ‖ 142 → 139 → 140 → 141.
Esta entrega o que dói hoje e não depende da coluna única.

**Fontes: dois defeitos medidos.**
1. `Canvas/components/TypographyCatalog.tsx:36` lê `preset.design.fontFamily`, mas `TYPOGRAPHY_PRESETS`
   (`src/core/Design/presets/components/typography.ts`) declara `headingFont` e `bodyFont`. O estilo sai vazio e todo cartão herda a
   fonte do tema.
2. Com `options.fonts: 'bundled'` (padrão), `useSarakFonts` carrega só as famílias que o design no ar usa. Mesmo com o campo certo, a
   fonte de um cartão não estaria carregada. A carga é `loadBundledFonts` (`src/core/Provider/fontLoader.ts`).

**Efeito colateral:** cada preset de fonte grava também `monoFont`, `h1Size`, `h1Weight`, `h1LineHeight`, `h1LetterSpacing`, `bodyWeight`
e `bodyLineHeight`. Escolher uma fonte troca a mono e muda o tamanho do H1.

**Paletas:** `Main/components/PaletteGallery.tsx` e `PaletteSwatch.tsx` repetem, em cada item, dois blocos com a palavra Claro/Escuro e
três pontos. O dono achou grande e grosseiro. O seletor de modo da prévia já responde por claro e escuro.

**Ações:** `Main/components/ThemeActionBar.tsx` empilha até sete ações, e isso toma cerca de um quarto da altura da barra.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Canvas/components/TypographyCatalog.tsx` e o teste — campo certo, carga das fontes, amostra em português.
- `src/core/Design/presets/components/typography.ts` — o preset grava só `headingFont` e `bodyFont`.
- `src/core/Provider/` — só o que for preciso para o painel pedir a carga de uma família pela origem configurada em `options.fonts`.
- `src/features/DesignEngine/Main/components/PaletteGallery.tsx`, `PaletteSwatch.tsx` (com `useMemo` chaveado pela paleta), `PaletteSection.tsx` e testes.
- `src/features/DesignEngine/Main/components/ThemeActionBar.tsx` e teste; um componente novo para o menu de mais ações, se necessário.
- `src/core/i18n/` — textos novos, por acréscimo, nos seis idiomas.
- Snapshots que estas mudanças alterarem, e `browser-tests/` que clicam nas ações movidas.

## 3.2 Fora
- A coluna única, os modos e a galeria (plans 139 e 140).
- O cálculo da paleta e os presets de paleta (plan-136).
- Presets novos (plan-141).
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` e `src/core/Provider/generated/` (gerados).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | a tela **Cores** (linha da paleta) e o rodapé da coluna são o alvo visual |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2.3, §2.4, §4 | barra de ações, paletas, rascunho |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | textos pelo catálogo, nos seis idiomas |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7.3 | cor esperada vem da página |
| Código | `src/core/Provider/hooks/useSarakFonts.ts` · `src/core/Provider/utils/fontSelection.ts` | as três origens de fonte |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Capture antes e depois das três telas para a prévia (passo 7).
2. **Preset de fonte.** Grava só `headingFont` e `bodyFont`. Escreva o teste: aplicar um preset não muda `monoFont` nem nenhum token de H1.
3. **Cartão de fonte.** Lê `headingFont` no título e `bodyFont` no corpo. Texto de amostra em português pelo catálogo, com título, frase e
   número (`R$ 12.480,00`). Sem texto em caixa-alta decorativo.
4. **Carga.** Só das famílias cujos cartões entram na área visível (`IntersectionObserver`), não das 42 de uma vez, respeitando a origem:
   `bundled` carrega pelo manifesto; `google` já tem tudo; `none` não carrega, e o cartão mostra a fonte que houver. Teste das três.
5. **Paleta em linha.** Cada item é uma linha: faixa contínua de cores e nome. Selecionado: um check discreto. Sem as palavras Claro e
   Escuro, sem borda por item. Os tipos viram filtros (Todas, Monocromática, Análoga, Complementar, Dividida, Triádica) em vez de seções.
   "Criar a partir de uma cor" fica numa linha acima da lista. Selecionar segue sendo rascunho, e o diálogo de troca não muda.
6. **Barra de ações.** Visíveis: `Aplicar` (única primária), `Descartar` e um menu de mais ações com Salvar tema, Novo tema, Exportar JSON,
   Apagar tema (por último, com tom de perigo) e Desfazer última aplicação, quando houver. O menu segue o padrão de teclado do
   `ThemeAdvancedMenu`. O texto "N alterações" abre uma lista: nome do token, valor aplicado e valor do rascunho. Sem alteração, ele some
   e os dois botões ficam desabilitados.
7. **Prévia para o dono:** `C:\tmp\sarak-previa-138\index.html`, com antes e depois da galeria de fontes, das paletas e da barra de ações,
   no painel real, nos modos claro e escuro.
8. Rode os specs de navegador que tocam o painel: `plan-135-paletas-no-painel`, `plan-122-preview-mode`, `login-theme-application` e
   `painel-segue-o-modo`. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Duas fontes diferentes geram `font-family` computada diferente nos cartões — no navegador, com `document.fonts.check` verdadeiro na origem `bundled`.
- [ ] Aplicar um preset de fonte altera só `headingFont` e `bodyFont` — teste.
- [ ] Nada carrega fora da área visível — teste.
- [ ] As 15 paletas cabem em até 15 linhas, sem as palavras Claro e Escuro; os filtros funcionam por teclado — teste.
- [ ] A barra mostra uma primária, `Descartar` e o menu; toda ação de antes continua alcançável — teste.
- [ ] Textos novos nos seis idiomas.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/features/DesignEngine src/core/Design src/core/Provider src/core/i18n` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A prévia aberta; o caminho vai ao dono; o veredito só fecha com a aprovação dele.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` — §2.3 (a barra de ações, com o menu) e §2.4 (a paleta em linha com
filtros); §6.4 (a amostra de fonte usa a fonte real, carregada sob demanda, e escolher fonte só muda título e corpo).

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-31

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `src/core/Design/presets/components/typography.ts` — o preset grava só `headingFont` e `bodyFont` (antes gravava também `monoFont`, `h1*`, `bodyWeight`, `bodyLineHeight`).
- `src/features/DesignEngine/Canvas/components/TypographyCatalog.tsx` — o cartão lê `headingFont`/`bodyFont` (o campo antigo `fontFamily` não existia); amostra com título, frase e número pelo catálogo; sem caixa-alta decorativa; pede a carga da família quando o cartão entra na área visível.
- `src/core/Provider/hooks/useRequestFont.ts` (novo) e `resolveFontFamily` em `fontSelection.ts` — carga de uma família pela origem de `options.fonts` (`bundled` injeta, `google` só a do host, `none` nada).
- `Canvas/hooks/useOnFirstVisible.ts` (novo) — `IntersectionObserver` de uma vez só; sem o observador, carrega na hora.
- `PaletteGallery.tsx`, `PaletteSwatch.tsx`, `PaletteSection.tsx` — uma linha por paleta (faixa contínua + nome + check), filtros por tipo (botões `aria-pressed`), "Criar a partir de uma cor" acima da lista; `PaletteSwatch` com `mode` vira faixa única (`useMemo` por paleta e modo), sem `mode` mantém os dois modos do criador.
- `ThemeActionBar.tsx` — `Aplicar` (primária), `Descartar` e o menu; `ThemeMoreActionsMenu.tsx` (novo, teclado do `ThemeAdvancedMenu`, abre para cima), `ThemePendingChanges.tsx` (novo, o contador abre a lista token / aplicado / rascunho).
- `useDesignDraft.ts` — expõe `dirtyTokens` (e `dirtyTokenCount` deriva dele); tipo `SarakDirtyToken` exportado em `src/index.ts`.
- `src/core/i18n/catalogEntries.panel.ts` (novo, 10 chaves, seis idiomas) registrado em `catalog.ts`.
- `npm run guide` regenerou `sarak-ui/` (o build exige).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/components/typography.ts` | alterado | só headingFont e bodyFont |
| `src/features/DesignEngine/Canvas/components/TypographyCatalog.tsx` | alterado | fonte real, amostra, carga sob demanda |
| `src/core/Provider/hooks/useRequestFont.ts`, `Canvas/hooks/useOnFirstVisible.ts` | criado | carga por origem; visibilidade |
| `src/core/Provider/utils/fontSelection.ts` | alterado | `resolveFontFamily` exportada |
| `Main/components/PaletteGallery.tsx`, `PaletteSwatch.tsx`, `PaletteSection.tsx` | alterado | linha fina, filtros |
| `Main/components/ThemeActionBar.tsx` | alterado | primária + Descartar + menu |
| `Main/components/ThemeMoreActionsMenu.tsx`, `ThemePendingChanges.tsx` | criado | menu e lista de alterações |
| `src/features/DesignEngine/hooks/useDesignDraft.ts`, `Main/ThemeCustomizationTab.tsx`, `src/index.ts` | alterado | `dirtyTokens` |
| `src/core/i18n/catalogEntries.panel.ts`, `catalog.ts` | criado/alterado | textos novos |
| testes: `typography.test.ts`, `TypographyCatalog`, `PresetsCatalog`, `PaletteGallery`, `PaletteSwatch`, `ThemeActionBar`, `ThemeCustomizationTab`, `useRequestFont`, `useOnFirstVisible`, `ThemeMoreActionsMenu`, `ThemePendingChanges` | criado/alterado | cobertura do acima |
| `browser-tests/fontes-no-painel.spec.ts` + fixture | criado | fonte real e carga, no navegador |
| `browser-tests/importador-temas.spec.ts` + fixture, `plan-135-…spec.ts` | alterado | ações movidas para o menu; legenda |
| `sarak-ui/*` | regenerado | `npm run guide` |

**Verificações executadas**
- vitest de `DesignEngine`, `Design/presets`, `Provider/hooks`, `i18n`: 805 passam, 3 falham (ver pendências).
- `npm run verify -- --tier=quick`: tsc OK; baseline falhou uma vez por `--color-theme-error` (meu), corrigido para `--theme-error`, `audit:baseline` seguinte = "igual ao baseline"; `variable-contract:check` OK após o conserto; `plan-index:check` falha por status da plan-143 (índice × frontmatter), que não é meu.
- `npm run build`: falhou 3 vezes em gates (tipo público sem exportar, sem prefixo `Sarak`, kit `sarak-ui` defasado), corrigidos; quarto build verde.
- Navegador: `fontes-no-painel`, `plan-135-paletas-no-painel`, `plan-122-preview-mode`, `login-theme-application`, `painel-segue-o-modo` passam; `importador-temas` 9/9 (depois de ajustar a fixture e o helper). Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
- Prévia: `C:\tmp\sarak-previa-138\index.html` (antes de uma cópia do `HEAD`, depois do worktree; claro e escuro).

**Critérios de aceite**
- [x] Duas fontes, `font-family` computada diferente; `document.fonts.check` verdadeiro em `bundled` — `fontes-no-painel.spec.ts` (Inter×Outfit, `check('700 32px "Outfit"')`).
- [x] Preset só altera `headingFont` e `bodyFont` — `typography.test.ts`.
- [x] Nada carrega fora da área visível — `TypographyCatalog.test.tsx` e o spec (injetadas < metade dos cartões).
- [x] Paletas em uma linha cada, sem Claro/Escuro, filtros por teclado — `PaletteGallery.test.tsx`. Contagem "até 15 linhas" conferida só com o registro mockado de 3; o registro real tem 15 e a captura `depois-paletas-*.png` mostra a lista.
- [x] Barra com primária, Descartar e menu; toda ação de antes alcançável — `ThemeActionBar.test.tsx`.
- [x] Textos novos nos seis idiomas — `catalogEntries.panel.ts` (teste de paridade do catálogo passa).
- [ ] Prévia gerada; aprovação do dono — gerada, aprovação é do revisor.

**Decisões e suposições**
- A plan chegou em `🔴 A executar`; executei por instrução do usuário e não movi o status para `🟡`.
- Texto de amostra traduzido nos seis idiomas (a plan diz "em português pelo catálogo"); o português é o da plan.
- `ThemeActionBar` ganhou `dirtyTokens` obrigatório; "Desfazer última aplicação" saiu de `ACTION_LABELS` e virou chave de catálogo.
- Fonte de origem `google` com família do host injeta só a do host.
- Os testes de navegador de `importador-temas` ativam o item do menu por teclado: na cena dele a barra fica no topo e o menu (que abre para cima) sai da tela.
- Novo catálogo `catalogEntries.panel.ts` em vez de acrescentar ao `palette.ts`, para não colidir com a plan-143.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` — snapshot falha; não toca no que mudei (efeito de `DesignScope`/`PresetCard`, alterados por outra plan).
- `specs/plan/plan-143-…md` — status do frontmatter diverge do índice (`plan-index:check`).

**Pendências / riscos**
- Snapshot de `ThemeSidebarContent` desatualizado (galeria nova) e **não** atualizado, porque a plan-143 também o altera; fica para quem entregar por último.
- `dist/` tem chunks não rastreados do build; `sarak-ui/` está modificado pelo `npm run guide`.
- Navegador só no Chromium headless, tema `sarak-sovereign`; o "antes" usou o `dist/` do momento, não um build do `HEAD`.
- `npm run verify` completo e a suíte inteira não rodei (são do revisor).


---

# 10. Veredito

## Veredito — 2026-10-31 — 🔴 Reprovado

O essencial está certo: a fonte aparece de verdade, o preset só grava `headingFont` e `bodyFont`, a carga respeita as três origens, as paletas viraram linha e a barra ficou com uma
primária. `audit:baseline --with-tsc` igual ao baseline; `Main`, `Canvas/components`, presets, `Provider/hooks` e `i18n` com 458 de 459 (o vermelho é o item 3). Conferido na prévia.

1. **Botão cortado.** Em `PaletteSection`, "Criar paleta a partir de uma cor" transborda da coluna, nos dois modos (`depois-paletas-*.png`, e o texto sai pela borda). Ele tem de caber na largura da coluna, em todos
   os seis idiomas, por quebra de linha ou texto mais curto, e sem caixa-alta decorativa.
2. **Duas camadas abertas ao mesmo tempo.** A lista de alterações e o menu de mais ações abrem juntos, e o menu cobre a lista (`depois-barra-aberta-*.png`). Abrir um fecha o outro — teste.
3. **Snapshot e árvore compartilhada.** O `ThemeSidebarContent` está vermelho. A regra "fica para quem entregar por último" não serve aqui: a `plan-143` para na escolha do dono, e o commit da 138 sairia
   com a CI vermelha. Numa cópia `git archive HEAD` só com os arquivos desta plan (junção de `node_modules`), regenere esse snapshot e confira ali também o do `PreviewCanvas`. Traga o `.snap` de volta. Isso
   separa o que é da 138 do que é da 142 e da 143, que estão na mesma árvore. Cole a linha final da suíte nessa cópia.
4. **Critério sem prova.** "Cabem em até 15 linhas" foi testado com registro de 3. Teste com o registro real.

**Prévia:** `C:\tmp\sarak-previa-138\index.html`, aguardando o dono.

## Resumo da execução (correção 1) — 2026-11-01

**Resultado:** Concluído

**1. Botão cortado.** `PaletteSection.tsx:40` — `fullWidth`, `min-w-0 whitespace-normal break-words text-center font-semibold normal-case tracking-normal`. Evidência: `browser-tests/paletas-cabem-na-coluna.spec.ts` (2 casos, escuro e claro): `text-transform: none` e, para os seis textos do catálogo, nenhum estoura o próprio botão nem sai da seção. Captura: `depois-paletas-*.png`.

**2. Duas camadas abertas.** `ThemeActionBar.tsx` guarda `openLayer` (`'changes' | 'menu' | null`); `ThemePendingChanges` e `ThemeMoreActionsMenu` viraram controlados (`isOpen`/`onToggle`, `isOpen`/`onOpenChange`). Evidência: teste `ThemeActionBar.test.tsx` "abrir o menu fecha a lista…" (os dois sentidos) e o caso de navegador da mesma spec. Capturas: `depois-barra-lista-*.png` e `depois-barra-menu-*.png` (substituem `depois-barra-aberta-*`). Observação: o menu aberto cobre o contador; Esc fecha e devolve o foco.

**3. Snapshot e árvore compartilhada.** Cópia `git archive HEAD` em `C:\tmp\sarak-head-138b` com só os 28 arquivos da 138 e junção de `node_modules`. Antes: 1 falha (`ThemeSidebarContent`), e `PreviewCanvas` **passa** na cópia — a falha dele na árvore compartilhada é da 142/143, não da 138. Regenerei o `ThemeSidebarContent.test.tsx.snap` na cópia e o trouxe de volta. Linha final da suíte inteira na cópia: `Test Files  596 passed (596)` / `Tests  4475 passed (4475)`. Cópia e junção removidas; `node_modules` do repositório conferido.

**4. Critério sem prova.** `PaletteGallery.registry.test.tsx` (novo, sem mock): o registro real tem 15 paletas, 15 linhas ≤ 15, uma faixa por linha, sem Claro/Escuro; as contagens por filtro somam o total.

**Verificações:** vitest de `Main` na árvore compartilhada: 207 passam, 1 falha — o snapshot do `ThemeSidebarContent`, cuja diferença restante é só de cor (`rgb`/`background`), vinda do `scale.ts` da plan-143 ainda não commitada; no clone limpo ele passa. `npm run guide` e `npm run build` verdes. Navegador: `paletas-cabem-na-coluna` 3/3.

**Decisões:** o spec novo é arquivo à parte (não alterei os da plan). O `.snap` trazido da cópia reflete o `HEAD` + 138; quando a 143 entrar, ela regenera as cores.

**Achados fora do escopo:** nenhum novo.

**Pendências:** com a 143 ainda no worktree, o snapshot do `ThemeSidebarContent` fica vermelho por cor até a 143 ser commitada ou regenerar o dela.

## Veredito — 2026-11-01 — correção 1 — técnica conferida, aguarda o dono

Os itens 1 a 4 do veredito anterior estão resolvidos. Medido numa cópia limpa, `HEAD` + 138 + 142, sem a 143: `npm run build` verde, suíte completa 600 arquivos e 4.497 testes, bateria de navegador 453 de 453. O `PreviewCanvas` passa nessa cópia. O `ThemeSidebarContent` fica vermelho só na árvore
compartilhada, por cor da 143 ainda não commitada, e a 143 o regenera. Falta a aprovação do dono sobre `C:\tmp\sarak-previa-138\index.html`.

## Veredito — 2026-11-01 — 🟢 Aprovado

O dono aprovou a prévia.
