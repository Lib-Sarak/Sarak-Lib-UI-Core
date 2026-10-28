---
tipo: "plan"
titulo: "Levar as paletas ao painel e ao kit: escolher, criar a partir de uma cor e ajustar por cima"
objetivo: "Fazer o usuário escolher uma paleta pronta ou criar uma a partir de uma cor e de um tipo, com prévia nos dois modos, aplicar e salvar pelo fluxo atual, e continuar ajustando qualquer cor individualmente; e fazer o kit ensinar o tema como estrutura mais paleta"
dominio: "Painel de customização / Kit do consumidor"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.4", "paletas", "painel", "kit"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-133-motor-de-paletas]]", "[[06-painel-de-customizacao-e-preview]]", "[[12-kit-do-consumidor]]"]
depende_de: "plan-133-motor-de-paletas"
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

No painel: galeria de paletas agrupada por tipo, criação a partir de cor-base + tipo (+ secundária e acento opcionais), prévia nos dois
modos, aplicar e salvar como hoje, ajuste granular por cima. No kit: o guia e a skill `ui-criar-tema` ensinam tema = estrutura + paleta.

# 2. Contexto

O motor, o token `colorPalette` e o formato do valor são da `plan-133` (leia o §2 dela); os presets vêm da `plan-134` (esta plan
trabalha com o registro, qualquer que seja o número de presets nele). Decisões do dono (2026-10-27): o usuário escolhe uma pronta **ou**
cria a partir de uma cor; ajustar um token num tema e salvar guarda o valor ajustado. **Não há porta nova:** a paleta vai no tema salvo
como o valor de `colorPalette`, pelo fluxo do "Aplicar" e das portas `onSave` que já existem ([[06-painel-de-customizacao-e-preview]],
[[09-temas-e-presets]] §4.6). Escolher paleta é **rascunho** até "Aplicar", como a galeria de temas.

Ajuste granular de uma cor, depois de escolher a paleta, vira valor explícito no `design` e vence a paleta (regra de composição da
`plan-133`). Trocar de paleta pergunta se os ajustes de cor feitos à mão continuam ou são descartados.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/` — a seção de paletas no lugar onde o painel edita cor (localize; declare no resumo), seus componentes,
  hooks e testes; a confirmação de troca com ajustes manuais pelo `confirm` do overlay.
- `src/core/i18n/catalogEntries.palette.ts` — rótulos novos do painel (por acréscimo ao arquivo da `plan-133`).
- `browser-tests/` — um caso: escolher preset → criar a partir de cor → ajustar um token → "Aplicar" → o `onSave` recebe `colorPalette` e
  o token ajustado. Roda no fechamento (contrato §9).
- Kit: `sarak-ui/GUIA-FRONTEND.md` (autoria; seção curta "Cor vem da paleta", com o formato de `colorPalette`) e
  `.agents/skills/ui-criar-tema/` (tema = estrutura + paleta; quando sobrescrever cor e como justificar).
- `docs/migracoes.md` — subseção na `## 8.0.0` (o que o usuário do painel vê de novo).

## 3.2 Fora
- O motor e os presets (`plan-133`, `plan-134`); porta de persistência nova; paleta salva como entidade própria (fica dentro do tema).
- Arquivos gerados do kit (regenerados no fechamento).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-133-motor-de-paletas.md` §2 | token, formato, composição |
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.9, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` · `specs/09-temas-e-presets.md` §4.6, §4.7 | rascunho × aplicado, portas de tema |
| Spec fixa | `specs/12-kit-do-consumidor.md` | o que o guia ensina e como |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Galeria de paletas agrupada por tipo, cada uma com amostra dos dois modos; selecionar aplica ao rascunho.
3. "Criar paleta": seletor de cor-base, de tipo, secundária e acento opcionais, prévia ao vivo dos dois modos; confirmar grava a entrada
   `custom:` no rascunho.
4. Ajuste granular continua pelos controles atuais; trocar de paleta com ajustes de cor manuais pergunta (manter ou descartar).
5. Acessibilidade: galeria como `radiogroup` com setas; o seletor de tipo com rótulo; a prévia com nome acessível.
6. Kit (guia e skill); subseção em `docs/migracoes.md`.
7. **Prévia para o dono:** capturas PNG do painel numa página `C:\tmp\sarak-rc4-previa\135\index.html` (imagens na mesma pasta,
   caminhos relativos, abre sem servidor), na ordem do fluxo: galeria por tipo (claro e escuro), "criar paleta" com a prévia ao vivo,
   um ajuste granular por cima, a pergunta ao trocar de paleta com ajustes e a tela de amostra depois do "Aplicar". Legenda em cada
   captura. Gerada pelo harness do caso de navegador; o comando que a regenera vai no resumo.
8. `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] Escolher preset e criar a partir de cor mudam o rascunho e só gravam no "Aplicar" — teste de componente.
- [ ] O valor de `colorPalette` gravado é o formato da `plan-133`, e um ajuste de token sobrevive ao salvar — teste.
- [ ] Trocar de paleta com ajustes manuais pergunta, e as duas respostas fazem o que dizem — teste.
- [ ] Galeria navegável por teclado, com papéis e nomes — teste por papel.
- [ ] Caso de navegador escrito (roda no fechamento).
- [ ] Prévia do painel gerada em `C:\tmp\sarak-rc4-previa\135\index.html`; a aprovação do dono é registrada pelo revisor no veredito.
- [ ] Guia e skill ensinam o formato e a regra da sobrescrita justificada.
- [ ] Resumo com a tabela item → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento do painel provado por teste de componente e por um caso de navegador no fechamento.

- `npx vitest run src/features/DesignEngine` — uma vez (nenhuma outra plan da `rc.4` toca o painel).
- Guia e skill lidos como quem cria o primeiro tema.
- O revisor passa o caminho da prévia ao dono; o veredito só fecha com a aprovação dele.
- Diff lido; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md` — novo §: "Paletas no painel": escolher, criar a partir de cor, rascunho até
"Aplicar", ajuste granular vence a paleta, troca com ajustes pergunta.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-28

**Resultado:** Concluído com pendências (a aprovação da prévia pelo dono e o caso de navegador no fechamento, ambos do revisor)

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `Main/components/PaletteSection.tsx` — seção "Paleta de cores" do painel, no modo de prévia, logo abaixo de "Começar de um tema" (`ThemeSidebarContent.tsx`); galeria + "Criar paleta a partir de uma cor".
- `Main/components/PaletteGallery.tsx` — `radiogroup` agrupado por tipo, foco itinerante e setas (circulam); cada opção tem nome acessível "<nome> — <tipo>". `PaletteSwatch.tsx` — amostra dos dois modos (decorativa).
- `Main/components/PaletteCreator.tsx` + `hooks/usePaletteCreatorState.ts` — cor-base, tipo, secundária e acento opcionais (caixa liga a semente), prévia ao vivo (`role="img"` com nome). Confirmar grava `custom:<tipo>:<#base>[,sec=…][,acc=…]`.
- `hooks/usePaletteSelection.ts` — escolher/criar grava no **rascunho** (`updateDraft`) `colorPalette` + as cores calculadas do modo do rascunho; nada vai ao `onSave` antes do "Aplicar". Com cor ajustada à mão, pergunta pelo `confirm` do overlay.
- `utils/paletteDraft.ts` — agrupamento por tipo, montagem do valor, detecção dos ajustes manuais, patch do rascunho.
- `catalogEntries.palette.ts` — 21 chaves novas nos seis idiomas. `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` ("Cor vem da paleta") e `.agents/skills/ui-criar-tema/SKILL.md` (§2.1 e item de checklist).
- `browser-tests/plan-135-paletas-no-painel.spec.ts` + `fixtures/plan-135-paletas-entry.tsx` — o caso do §3.1; com `SARAK_PREVIA_135_DIR` definida ele também grava a prévia.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Main/components/{PaletteSection,PaletteGallery,PaletteCreator,PaletteSwatch}.tsx` | criado | UI das paletas |
| `src/features/DesignEngine/Main/hooks/{usePaletteSelection,usePaletteCreatorState}.ts` | criado | seleção com pergunta; estado do criador |
| `src/features/DesignEngine/Main/utils/paletteDraft.ts` | criado | regras puras |
| `src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx` | alterado | monta `PaletteSection` |
| `…/__tests__/__snapshots__/ThemeSidebarContent.test.tsx.snap` | alterado | snapshot passa a conter a seção |
| `src/core/i18n/catalogEntries.palette.ts` | alterado | textos do painel |
| 8 arquivos de teste (`__tests__`) | criado | ver tabela abaixo |
| `browser-tests/plan-135-paletas-no-painel.spec.ts`, `browser-tests/fixtures/plan-135-paletas-entry.tsx` | criado | caso de navegador e prévia |
| `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md`, `.agents/skills/ui-criar-tema/SKILL.md` | alterado | documentação (o `.claude/skills/…` aparece em `git status` por ser link para o `.agents`) |
| `specs/plan/plan-135-…md` | alterado | este resumo e o `status` |

**Item → teste**
| Item | Teste (arquivo em `src/features/DesignEngine/Main/…`) |
|---|---|
| Escolher preset muda o rascunho, sem perguntar sem ajuste | `escolher uma paleta pronta muda o rascunho…` · `sem ajuste manual a troca não pergunta` → `components/__tests__/PaletteSection.test.tsx` |
| Criar a partir de cor grava `custom:` com vírgula, só no rascunho | `criar a partir de uma cor grava a entrada custom:…` → `PaletteSection.test.tsx`; `confirma o padrão…`, `secundária e acento só entram quando ligados…` → `PaletteCreator.test.tsx` |
| Formato de `colorPalette` = o da plan-133 | `monta o valor custom com vírgula…` (o `parsePaletteValue` o devolve igual) → `utils/__tests__/paletteDraft.test.ts` |
| Ajuste de token sobrevive (manter) / é substituído (descartar) | `um ajuste de token sobrevive quando o usuário escolhe manter…` · `descartar substitui também o token ajustado…` → `PaletteSection.test.tsx`; `com ajuste manual e resposta "manter"/"descartar"…` → `hooks/__tests__/usePaletteSelection.test.ts` |
| Galeria por teclado, papéis e nomes | `lista os presets num radiogroup nomeado…`, `o clique e as setas escolhem…` → `PaletteGallery.test.tsx`; `a galeria é um radiogroup agrupado por tipo…`, `as setas movem o foco e a seleção…` → `PaletteSection.test.tsx` |
| Prévia com nome acessível, dois modos | `a prévia do criador tem nome acessível…` → `PaletteSection.test.tsx`; `mostra os dois modos…` → `PaletteSwatch.test.tsx` |
| Enter no campo de cor não confirma a paleta | `o Enter no campo de cor confirma só a cor…` → `PaletteCreator.test.tsx` |
| Fluxo completo até o `onSave` | `escolher uma pronta, criar a partir de uma cor, ajustar um token e aplicar…` → `browser-tests/plan-135-paletas-no-painel.spec.ts` |

**Verificações executadas**
- `npx vitest run src/features/DesignEngine/Main/components/__tests__/Palette src/features/DesignEngine/Main/hooks/__tests__/usePalette src/features/DesignEngine/Main/utils` → 8 arquivos, 44 testes verdes. `ThemeSidebarContent.test.tsx` → 10 verdes, snapshot atualizado (só esse arquivo).
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-135-paletas-no-painel.spec.ts` → 1 verde (≈9 s); rodei fora do fechamento porque a prévia do passo 7 nasce dele.
- `npm run verify -- --tier=quick` → `tsc` OK, `audit:baseline --with-tsc` OK (sem regressão), Anel 0 OK (0 achados), `barrel`/`catalog`/`token-reader`/`variable-contract`/`plan-index` etc. OK. **Única falha: `guide:check`** (`sarak-ui/docs/migracoes.md` defasado) — falha por desenho, o kit é regenerado no fechamento (contrato §9).
- Antes do verde, o quick acusou e eu corrigi: `variable-contract` (reserva de `--sarak-card-radius` 8px → 10px), `auditor_hardcoded` (hex e `em` fixos), `auditor_coverage` (4 arquivos sem teste 1:1) e `auditor_cleancode` (`<input>` cru; 4 estados no mesmo hook).

**Critérios de aceite**
- [x] Escolher preset e criar a partir de cor mudam o rascunho e só gravam no "Aplicar" — `PaletteSection.test.tsx`; no navegador, `saved-payload` segue vazio até o "Aplicar".
- [x] `colorPalette` no formato da plan-133 e o ajuste sobrevive ao salvar — `paletteDraft.test.ts`; navegador: `onSave` recebe `colorPalette` sem `;` e `sidebarColor: #123456`.
- [x] Trocar de paleta com ajustes pergunta, e as duas respostas fazem o que dizem — `usePaletteSelection.test.ts`, `PaletteSection.test.tsx`.
- [x] Galeria por teclado, com papéis e nomes — `PaletteGallery.test.tsx`.
- [x] Caso de navegador escrito — roda no fechamento; rodei uma vez aqui (verde).
- [x] Prévia gerada em `C:\tmp\sarak-rc4-previa\135\index.html` (6 capturas com legenda). **Aprovação do dono: pendente (do revisor).** Regenera com `$env:SARAK_PREVIA_135_DIR='C:\tmp\sarak-rc4-previa\135'; npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-135-paletas-no-painel.spec.ts`.
- [x] Guia e skill ensinam o formato e a regra da sobrescrita justificada.
- [x] Resumo com a tabela item → teste.

**Decisões e suposições**
- **Onde o painel edita cor:** não há seção única de cor; coloquei a seção de paletas no topo do modo de prévia, junto de "Começar de um tema" (em `ThemeSidebarContent.tsx`). A busca de token a esconde, como esconde o resto.
- **Rascunho = tokens achatados.** O rascunho guarda cores explícitas; por isso escolher uma paleta grava `colorPalette` **e** as cores calculadas do modo do rascunho (`sarakResolvePalette`). A troca de modo já é tratada pelo `overlayPreferences` da plan-133.
- **"Ajuste manual" = token de cor do mapa de papéis cujo valor difere da paleta anterior no modo**; sem paleta anterior, difere do design aplicado (`sarak.systemDesign`).
- **Diálogo:** "Manter meus ajustes" = confirmar; "Descartar ajustes" = cancelar. O `confirm` do overlay resolve `false` também ao fechar, então **fechar o diálogo descarta** (documentado na nota de migração).
- **Rótulo do preset = id capitalizado** (`presetLabel`), porque o registro ainda não tem nome (a `plan-134` o introduz); a galeria lê o registro como ele estiver, qualquer que seja o número de presets.
- **Cor via `ColorControl` do próprio painel**, não `<input type=color>` cru: o hex digitado só vale com Enter/blur; formato fora de hex (alfa, `rgba()`) é ignorado, pois o motor só entende hex.
- **O criador não é `<form>`**: o Enter do campo de cor submetia o formulário e confirmava a paleta sem querer (achado no navegador).
- Sem `options.i18n` explícito, o idioma segue `useLibraryText` (português por padrão); a seção não depende do `Provider`.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` está desatualizado em relação ao `HEAD` (o `-u` que rodei por engano o reescreveu; **restaurei com `git checkout` desse único arquivo**, que não estava na fotografia). O teste do `PreviewCanvas` provavelmente falha no `HEAD` — não verifiquei.
- Avisos de identificador em português em `ThemeSidebarContent.tsx` (textos de UI pré-existentes, linhas 82–85).

**Pendências / riscos**
- Só há 1 preset no registro (`oceano`) até a `plan-134`; a galeria foi testada com 3 presets simulados e o navegador com o real. A prévia, portanto, mostra uma única paleta pronta.
- O estilo das classes Tailwind novas (ex.: `w-16`) só se confirma com o CSS gerado no build; o harness usa o CSS pré-gerado.
- `npm run guide`, `catalog`, `dev-kit` e `token-types` não foram rodados (arquivos gerados são do dono/fechamento, contrato §9).

---

# 10. Veredito

## Veredito — 2026-10-28 — 🔴 Reprovado

**O que o revisor mediu:** `npx vitest run src/features/DesignEngine` (junto com as áreas da `plan-134`) → 6 vermelhos no painel; diff
lido; prévia aberta. Os 5 primeiros vermelhos abaixo **não são desta execução**: passam em `c14282f2` (rc.3) e em `b5bf7667` e falham em
`96729ed2` (medido em cópias limpas de cada commit). Entram aqui porque esta plan é a dona do painel na rc.4 e o §7 dela é o filtro que
os pega.

1. `src/features/DesignEngine/Main/hooks/usePaletteSelection.ts:18-19,31-36` — fechar o diálogo (Esc, clique fora) **descarta** os
   ajustes de cor feitos à mão. Isso é ação destrutiva por omissão. O critério é "as duas respostas fazem o que dizem", e fechar não é
   resposta. Inverta: o botão de confirmação é "Descartar ajustes" (a ação destrutiva é explícita) e cancelar **ou fechar** mantém os
   ajustes. Atualize os testes (inclusive o caso "fechar mantém") e a nota de `docs/migracoes.md`, que hoje documenta o descarte.
2. `src/features/DesignEngine/Main/utils/paletteDraft.ts:35-38,48` — o rótulo do preset é o id capitalizado ("Ciano violeta"). A
   `plan-134` entregou o nome nos seis idiomas em `SARAK_PALETTE_PRESET_TEXT_KEYS` (`src/core/Design/palette/presets.ts`). A galeria lê o
   nome pelo `useLibraryText`. O id capitalizado fica só como recuo de id sem chave. Teste com um preset real.
3. `src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx` — o snapshot está vermelho: foi gravado com 1
   preset e o registro agora tem 15. Regrave depois do item 2 e confira que a diferença é só a galeria.
4. `src/features/DesignEngine/components/__tests__/DesignControls.test.tsx`, `components/controls/__tests__/BasicControls.test.tsx`,
   `Main/components/__tests__/ThemeGlobalSettings.test.tsx` — "Found multiple elements with the text". Desde a Q1 (`plan-132`), o
   `SelectControl` (`components/controls/BasicControls.tsx:152-162`) passa `label` + `hideLabel` ao `SarakSelect`, que desenha um
   `<label class="sr-only">`. O texto aparece duas vezes no DOM, uma só na tela. Troque a consulta por texto pela consulta por papel e
   nome (`getByRole('combobox', { name })`) ou ancore no rótulo visível. Mantenha o que cada teste afirma. Não mexa no componente.
5. `src/features/DesignEngine/Panels/__tests__/LayoutTab.test.tsx` e `Canvas/__tests__/PreviewCanvas.test.tsx` — os snapshots estão
   vermelhos. Regrave **um arquivo por vez** e confira que a diferença é só o `<label class="sr-only">` (ou outra mudança que você
   nomear e atribuir a um commit). Diferença que não se explica não se regrava: anote no resumo.
6. Prévia: depois da correção da `plan-134` (paralela), regenere `C:\tmp\sarak-rc4-previa\135\` com os 15 presets e os nomes do item 2.

**Pronto quando:** `npx vitest run src/features/DesignEngine` inteiro verde (é o filtro do §7, não um subconjunto); a prévia
regenerada; o `quick` uma vez.

## Correção do veredito de 2026-10-28 — 2026-10-28

- **1 — fechar o diálogo mantém.** `usePaletteSelection.ts`: o botão de confirmação virou **Descartar ajustes** (`tone: 'danger'`); cancelar **ou fechar** (Esc, clique fora) mantém os ajustes. Testes: `usePaletteSelection.test.ts` (inclui `fechar o diálogo (resolve false) mantém o ajuste…`) e `PaletteSection.test.tsx`. `docs/migracoes.md` agora documenta que fechar mantém. (`sarak-ui/docs/migracoes.md` é gerado: regenera no fechamento.)
- **2 — nome do preset pelo catálogo.** `paletteDraft.ts` ganhou `presetTextKey` (lê `SARAK_PALETTE_PRESET_TEXT_KEYS`, só se a chave existe no catálogo); a galeria usa `useLibraryText` e cai no id capitalizado só sem chave. Teste com o registro real: `todo preset real do registro tem chave de nome no catálogo` (`paletteDraft.test.ts`); os mocks de `PaletteSection`/`PaletteGallery` passam a declarar `SARAK_PALETTE_PRESET_TEXT_KEYS: {}` (recuo).
- **3 — snapshot do `ThemeSidebarContent`.** Regravado depois do item 2; a diferença é só inserção (1116 linhas): a galeria, com 15 `radio` e os nomes reais ("Oceano — Análoga", "Ciano e violeta — Análoga"…).
- **4 — consultas duplicadas.** `DesignControls.test.tsx` e `ThemeGlobalSettings.test.tsx` consultam por `getByRole('combobox', { name })`; `BasicControls.test.tsx` filtra o rótulo visível (o que não é `sr-only`). Nenhum componente alterado; as afirmações dos testes foram mantidas.
- **5 — snapshots.** `LayoutTab.test.tsx.snap` regravado sozinho: a diferença é o `SarakSelect` reescrito (`96729ed2`) mais o `<label class="sr-only">` que a `BasicControls` passou a mandar (`96729ed2`, `hideLabel`). **`PreviewCanvas.test.tsx.snap` NÃO foi regravado por mim:** o diff que ele mostra no worktree é de cores de cartão de preset (ligado ao `PresetCard.tsx` modificado pela plan-134 em paralelo), não do `sr-only`; fica para a plan-134.
- **6 — prévia:** aguarda a plan-134 (instrução do veredito).
- **6 — prévia regenerada (2026-10-28), depois da plan-134:** `$env:SARAK_PREVIA_135_DIR='C:\tmp\sarak-rc4-previa\135'; npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-135-paletas-no-painel.spec.ts` → 1 verde (≈27 s); `C:\tmp\sarak-rc4-previa\135\index.html` com 6 capturas. A galeria mostra os nomes do catálogo (15 presets, rolagem do painel) e a captura 5 mostra o diálogo com "Descartar ajustes" (botão de perigo) ao lado de "Manter meus ajustes".

## Veredito — 2026-10-28 — correção 1 — 🟢 Aprovado

**Verificado:** `npx vitest run src/features/DesignEngine` inteiro → 98 arquivos, 510 testes verdes; `check-audit-baseline --with-tsc` →
igual ao baseline. Diálogo lido: "Descartar ajustes" é a ação explícita (`tone: 'danger'`), e fechar mantém. Nome do preset vem do
catálogo. Diff dos snapshots classificado: `LayoutTab` e `PreviewCanvas` mudam pelo `SarakSelect`/`SarakInput` do `96729ed2` e pela
cor da paleta da `plan-134`, sem outra diferença de estrutura. Item 6: prévia regenerada às 12:35, depois da `plan-134`, com o comando
registrado. **O dono aprovou a prévia** `C:\tmp\sarak-rc4-previa\135\index.html` em 2026-10-28. O plural "cor(es)" do diálogo vai para a
`plan-136` (o texto do painel é tocado lá).
