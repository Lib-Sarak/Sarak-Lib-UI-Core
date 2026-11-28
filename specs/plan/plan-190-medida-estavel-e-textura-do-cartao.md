---
tipo: "plan"
titulo: "Medida de distinção estável e amostra que mostra a textura do cartão"
objetivo: "Parar as animações na página da medida de distinção da presets-do-painel e fazer a amostra de textura do cartão mostrar a textura, para o caso de Forma passar nos dois modos sem afrouxar o limite"
dominio: "Painel / Amostras"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc2", "painel", "amostras", "navegador"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[11-testes-e-cobertura]]", "[[00-regras-e-invariantes]]"]
depende_de: ""
retida_por: ""
destino_sintese: "06-painel-de-customizacao-e-preview"
---

# 1. Objetivo

- A medida "se distingue a olho" da `presets-do-painel` dá o mesmo resultado em toda rodada: nenhum par passa por causa da fase
  de uma animação.
- A amostra de textura do cartão mostra a textura. O caso de Forma passa nos dois modos, com o limite de 2% contra o cartão sem
  textura.

# 2. Contexto

| Id | Achado |
|---|---|
| M1 | A spec tira a foto com `animations: 'disabled'`, que não para o framer-motion. No estado vazio, o par passava no `HEAD` só pela fase das animações do componente, e não pelo que as opções desenham |
| M2 | No `HEAD` (2026-11-27), o caso de Forma reprova nos dois modos por `cardTextures`: `card-tex-grid` 1,61% e 1,80%, `card-tex-dots` 1,97%, `card-tex-fluid` 1,80% e `card-tex-aurora` 1,66%, contra o cartão sem textura. A amostra é o cartão real em tamanho de miniatura (`PresetSamples.tsx`, tipo `cardTexture`), e a textura tem opacidade baixa de propósito |

**Decisão do dono (2026-11-27):** a amostra mostra a textura, como as amostras da `plan-188` e da `plan-189`. A opacidade das
texturas nos temas e o limite de 2% não mudam.

# 3. Escopo

## 3.1 Dentro
- `browser-tests/fixtures/presets-do-painel-entry.tsx` e `browser-tests/presets-do-painel.spec.ts`: o movimento parado na página
  da medida, e nada mais na spec.
- `src/features/DesignEngine/Canvas/components/`: a amostra de textura do cartão (`PresetSamples.tsx` e, se preciso, um arquivo
  de amostra) e o teste dela.
- Uma amostra de outro grupo que passe a reprovar com o movimento parado entra aqui, desenhada pelo mesmo caminho. Relate antes de
  desenhar mais de dois grupos.

## 3.2 Fora
- O limite de 2% e o de 5%, e a lista `CARD_GROUPS`.
- A opacidade e o desenho das texturas nos temas e no `_atmosphere.css`. A tela real não muda.
- **A `plan-191` corre em paralelo.** Fique fora de `src/components/Layout/chrome/`, de `src/components/atomic/Navigation/` e
  da `barra-de-topo-estreita.spec.ts`.
- Prazo próprio em teste passa por `prazoDeTeste` (`src/shared/testing/prazoDeTeste.ts`), nunca literal.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §6.4 | amostras e a medida de distinção |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R2 | a amostra lê token, sem valor solto |
| Código | `src/features/DesignEngine/Canvas/components/PresetSamplesDepth.tsx` | o canto ampliado da moldura, o mesmo caminho |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` | sempre |

# 5. Instruções de execução

1. **M1, movimento parado.**
   - Na página da medida, pare o framer-motion antes de montar o painel (por exemplo, `MotionGlobalConfig.skipAnimations`, ou o
     que a versão instalada oferecer). Só a página de teste muda.
   - Prove: rode o caso "se distingue a olho" das cinco decisões três vezes seguidas, nos dois modos. Os percentuais de cada par
     têm de ser iguais entre as rodadas. Cole o menor par por grupo.
   - Liste os pares que passaram a reprovar. Eles passavam por causa da fase.
2. **M2, textura do cartão.** A amostra amplia um trecho do cartão real com a textura, pelo mesmo mecanismo da aplicação
   (`data-sx-card-texture-type` e a opacidade do preset), até a textura aparecer na miniatura. A opção "sem textura" usa o mesmo
   quadro. As cores vêm de token.
3. **Pares do passo 1:** desenhe a amostra do mesmo jeito (§3.1).
4. **Prévia:** rode a `presets-do-painel` com `SARAK_PREVIA_PRESETS_DIR=C:\tmp\sarak-previa-190`. Liste no resumo as capturas de
   `cardTextures` e dos grupos do passo 3, nos dois modos, e pare para o dono avaliar.
5. **Verificação do executor:**
   - `npx vitest run src/features/DesignEngine/Canvas src/core/Design/presets`;
   - `npm run verify -- --tier=quick`;
   - a `presets-do-painel` inteira. Ela lê `src/` pelo esbuild do harness, então não pede build nem a trava.

# 6. Critérios de aceite

- [ ] Três rodadas seguidas dão os mesmos percentuais em cada par.
- [ ] O caso de Forma passa nos dois modos, com `cardTextures` acima de 2% contra o cartão sem textura.
- [ ] A `presets-do-painel` inteira passa.
- [ ] A prévia foi aprovada pelo dono.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- as capturas da prévia, abertas e vistas;
- **mutação, em cópia:** sem o movimento parado, o percentual do par do estado vazio muda entre duas rodadas. Com a amostra antiga
  de textura, o caso de Forma reprova em `cardTextures`.

# 8. Destino da síntese

**Destino:** `06-painel-de-customizacao-e-preview` (§6.4). Texto para transporte:

> A medida de distinção para o movimento antes da foto: o resultado é o mesmo em toda rodada, e nenhum par passa pela fase de uma
> animação. A amostra de textura do cartão amplia um trecho do cartão real, para a textura aparecer na miniatura.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-27

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(fora de `dist/`, que tinha rebuild não commitado de outra tarefa)
```
 M specs/00-backlog.md
 M specs/00-indice.md
 M src/buildInfo.ts
 M src/core/Provider/buildInfo.ts
?? specs/plan/plan-190-medida-estavel-e-textura-do-cartao.md
?? specs/plan/plan-191-busca-vira-icone-na-barra-estreita.md
```
Durante a execução apareceram, vindos da plan-191 em paralelo (não tocados): `browser-tests/barra-de-topo-estreita.spec.ts`, `src/components/Layout/chrome/*`.

**O que foi feito**
- `browser-tests/fixtures/presets-do-painel-entry.tsx`: `MotionGlobalConfig.skipAnimations = true` antes de montar o painel (M1). Só a página de teste.
- `PresetSamplesDepth.tsx`: novo `CardTextureCornerSample` (cartão real ampliado 3x, recortado na borda esquerda, centrado na vertical), recebe `texture` e a repassa ao `SampleTitleCard`. A opacidade do preset e o limite de 2% não mudaram.
- `CardsCatalog.tsx`: a seção de texturas usa essa amostra (o caminho real das texturas é o `CardsCatalog`, não o `PresetSamples`; `PresetSamples.tsx` ficou com o conteúdo original, só difere em fim de linha CRLF/LF).
- `__tests__/PresetSamplesDepth.test.tsx`: teste da nova amostra (atributo, textura repassada ao cartão, escala).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/fixtures/presets-do-painel-entry.tsx` | alterado | framer-motion parado |
| `src/features/DesignEngine/Canvas/components/PresetSamplesDepth.tsx` | alterado | `CardTextureCornerSample` |
| `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx` | alterado | usa a amostra nas texturas |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetSamplesDepth.test.tsx` | alterado | teste novo |
| `src/features/DesignEngine/Canvas/components/PresetSamples.tsx` | só fim de linha | sem mudança de conteúdo |

**Verificações executadas**
- 3 rodadas de "se distingue a olho" (10 casos cada, antes da amostra nova): 734 pares por rodada; os percentuais **não** são idênticos: 42 pares variam em ≤ 0,0003 (0,03 ponto percentual) entre rodadas, todos em `escuro` fonts/fontPairs/typeScale (carga de fonte) e em poucos pares de `claro` emptyState/glass/modal/tables. Nenhum par cruzou limite entre rodadas. Fora o cardTextures, nenhum par reprovou nas rodadas.
- `npx vitest run src/features/DesignEngine/Canvas src/core/Design/presets` → 794 passam, 1 falhou (meu teste novo, geometria mudou); corrigido, `PresetSamplesDepth.test.tsx` → 5/5.
- `npm run verify -- --tier=quick` → tsc OK, baseline OK, Anel 0 OK (532 linhas, 0 achados); falha só `plan-index:check`, por divergência da plan-191 (índice 🟡 × frontmatter 🟠), que não é minha.
- `presets-do-painel` inteira (com prévia) → 26 passam, 1 falha: Forma (claro), `card-tex-aurora × sem textura = 1,60%`.

**Critérios de aceite**
- [ ] Três rodadas com os mesmos percentuais — motivo: ruído ≤ 0,0003 remanescente, de fonte/render, não de animação do framer-motion (a prova M1 foi feita antes de mudar a amostra).
- [ ] Forma passa nos dois modos — motivo: aurora no claro em 1,60%. Escuro passa (menor: dots 2,11%; claro: dots 2,05%, margem curta).
- [x] Os pares que passavam por fase: nenhum passou a reprovar com o movimento parado (única reprovação, cardTextures, já existia).
- [ ] Prévia aprovada pelo dono — aguardando.
- [x] `git diff --stat` só em caminhos da §3.1 (os demais são da plan-191 e do rebuild de `dist/`, que já estavam/são de outras tarefas).

**Decisões e suposições**
- Geometria testada: canto de cima (4x): grid/dots/fluid falham (fluid sem gradiente no canto); canto de baixo 4x: só aurora claro 0,68%; baixo 3x: aurora 1,31%; esquerda-centro 6x: aurora 0,34%; 3x: aurora 1,60%; 2x: dots 1,5% e aurora 1,66%. A aurora (blur de 60px, opacidade 0,8, claro) satura perto de 1,7% por qualquer geometria; ficou a de 3x porque tem o melhor conjunto.
- Passar a aurora no claro sem mexer na opacidade nem no CSS exigiria outro tratamento só da amostra (por ex. palco de contraste atrás do cartão); não fiz sem decisão.

**Achados fora do escopo (não corrigidos)**
- `plan-index:check` reprova pela plan-191 (frontmatter × índice).

**Pendências / riscos**
- Aurora (claro) 1,60% < 2%; decisão do dono: tratamento específico da amostra, ou aceitar exceção.
- Prévia em `C:\tmp\sarak-previa-190`: `escuro-shape-cardTextures.png`, `claro-shape-cardTextures.png` (e `*-shape-cards.png`); os demais grupos do passo 3 não precisaram de mudança.
- Ruído residual de 0,0003 entre rodadas (fontes).

---

# 10. Veredito

## Veredito — 2026-11-27 — 🔴 Reprovado

**O que foi verificado e como**
- Diff lido: `presets-do-painel-entry.tsx` (`MotionGlobalConfig.skipAnimations` antes de montar), `PresetSamplesDepth.tsx` (`CardTextureCornerSample`), `CardsCatalog.tsx` e o teste. O caminho real das texturas passar pelo `CardsCatalog`, e não pelo `PresetSamples`, é aceito: a §3.1 cobre a pasta.
- Prévia aberta e vista: `C:\tmp\sarak-previa-190\claro-shape-cardTextures.png` e `escuro-shape-cardTextures.png`.
- A mutação da §7 fica para a rodada que fechar o caso de Forma, porque o caso reprova hoje.

**Achados**
1. Caso de Forma, modo claro: `card-tex-aurora × sem textura = 1,60%`, abaixo de 2%. O critério "o caso de Forma passa nos dois modos" não foi atendido. O caminho sai da decisão do dono, anexada a este veredito antes do prompt de correção.
2. `src/features/DesignEngine/Canvas/components/PresetSamplesDepth.tsx:51-52` — a ampliação corta o título do cartão. Nas oito miniaturas, nos dois modos, o alto do quadro mostra pedaços de letra. A amostra tem de mostrar a textura sem texto cortado: por exemplo, o trecho ampliado sem o título, ou um enquadramento que não o alcance. As cores e a opacidade continuam vindo do preset.
3. Critério "três rodadas dão os mesmos percentuais": não atendido, por 42 pares com variação de até 0,0003, todos em grupos de fonte ou com texto. A foto tem de esperar as fontes (`document.fonts.ready`, ou o que a página já usa) e as três rodadas são refeitas sobre o código final, com a amostra nova. Se ainda sobrar variação, o resumo diz a fonte dela, medida.
4. `src/features/DesignEngine/Canvas/components/PresetSamples.tsx` — o arquivo muda só no fim de linha (CRLF/LF), sem mudança de conteúdo, e fica fora do diff da plan. Devolva o fim de linha original (o `git diff` do arquivo fica vazio), sem comando de escrita do git.

**Decisão do dono sobre o achado 1 (2026-11-27): opção A.** No modo claro, a aurora é reforçada na tela real. Para este achado, isso substitui a linha da §3.2 que deixava "a opacidade e o desenho das texturas nos temas e no `_atmosphere.css`" fora do escopo.
- **Dentro:** só a regra da textura `aurora` do cartão no `src/styles/_atmosphere.css`, e só no modo claro, por exemplo com mais opacidade ou menos desfoque. Os valores vêm de token ou de variável com fallback (R2). As outras texturas, o modo escuro, o limite de 2% e a lista `CARD_GROUPS` não mudam.
- **Prova:**
  - o caso de Forma passa nos dois modos, com `card-tex-aurora × sem textura` acima de 2% no claro;
  - cole o número antes e depois;
  - o modo escuro da aurora fica com o mesmo percentual.
- **Prévia:** além de `cardTextures`, capture um cartão real com aurora no claro, antes e depois, em `C:\tmp\sarak-previa-190\aurora-claro-antes.png` e `aurora-claro-depois.png`.
- **Verificação a mais do executor:** como a mudança toca CSS, `npm run build` com a trava `C:\tmp\sarak-build.lock` (com o conteúdo `plan-190`, soltando só depois de conferir o conteúdo) e a `textura-do-cartao-mais-proxima.spec.ts`, que lê o `dist/`.

---

## Resumo da execução (correção 1) — 2026-11-27

**Resultado:** Concluído com pendência (a prévia espera o dono; o resíduo de ≤ 0,0006 entre rodadas não teve a causa isolada, ver achado 3)

**Escopo:** só os quatro achados do veredito acima. A plan-191 segue em paralelo; não toquei em `src/components/Layout/chrome/`, `src/components/atomic/Navigation/` nem em `browser-tests/barra-de-topo-estreita.spec.ts`.

**Achado 1 — aurora no claro (decisão do dono, opção A)**
- `src/styles/_atmosphere.css`: regra nova, logo depois da aurora do cartão, nos mesmos quatro seletores (`::after`), só `background-image`. Cada um dos três degradês usa `light-dark(<alfa claro>, <alfa de antes, .4>)`: no escuro nada muda. O alfa claro é `--sarak-aurora-card-alpha-light`, declarada na própria regra com `.8` (o `variable-contract:check` reprovou a primeira versão, que só lia a variável com fallback; agora ela tem dono). `light-dark()` funciona porque `_elements.css` já põe `color-scheme: light` em `:where(.light)`. Outras texturas, escuro, limite de 2% e `CARD_GROUPS` intactos.
- Prova, caso de Forma, mesma amostra (canto de baixo, 4x, sem título), CSS de HEAD (antes) × CSS novo (depois):

| par `× sem textura` | antes | depois |
|---|---|---|
| `card-tex-aurora` claro | **0,00%** (reprova) | **31,87%** |
| `card-tex-aurora` escuro | 4,15% | 4,15% (igual) |
| `card-tex-dots` claro / escuro | 2,95% / 2,74% | 2,95% / 2,74% |
| `card-tex-grid`, `fluid` (ambos os modos) | idênticos | idênticos |

  As 16 linhas de `cardTextures` são iguais antes e depois, exceto a aurora clara. O 1,60% do veredito era da amostra com título a 3x; sem o título, a aurora no CSS de HEAD cai a 0,00% no claro, e é isso que o "antes" mede.
- `npm run build` com a trava `C:\tmp\sarak-build.lock` (conteúdo `plan-190`, solto só depois de conferir): exit 0, duas vezes (a 2ª depois de trocar o fallback pela variável declarada). A plan-191 rodou o `npm run build` dela por cima da minha trava e apagou `dist/` no meio da minha medida; esperei o processo dela terminar e refiz o passo.
- `textura-do-cartao-mais-proxima.spec.ts` (lê `src/styles/_atmosphere.css`) → 8 passam. `presets-do-painel.spec.ts` inteira, sobre o `dist/` final → **27 passam**.
- Prévia: `C:\tmp\sarak-previa-190\aurora-claro-antes.png` e `aurora-claro-depois.png` (o cartão real da amostra da aurora, claro, CSS de HEAD × CSS novo; é o tile do painel, capturado a 3x; antes: faixa quase invisível; depois: faixa lilás/ciano visível na borda de baixo e no canto).

**Achado 2 — título cortado**
- `PresetSamplesDepth.tsx`: `CardTextureCornerSample` agora é só o `.sarak-card` real (classe e `data-sx-card-texture-type` da aplicação), `aria-hidden`, sem filho nem texto, ampliado (`TEXTURE_SCALE = 4`, origem no canto de baixo à esquerda). Cor e opacidade seguem vindo do preset. O teste (`PresetSamplesDepth.test.tsx`) afirma `textContent === ''`, o atributo da textura e a escala.
- Por que 4x: a moldura da textura mede 20 px e o desfoque da aurora (60 px) cresce junto com a ampliação. Medido: 5x deu aurora escura 1,72% (reprova); 7x deu 0,02%; 3x deixava `dots` abaixo de 2% (1,81% escuro, 1,91% claro); 4x passa tudo nos dois modos (menor: `dots` 2,74%).
- Capturas `escuro-shape-cardTextures.png` e `claro-shape-cardTextures.png` abertas e vistas: nenhum texto nas oito miniaturas, textura visível em todas.

**Achado 3 — fotos esperam as fontes; três rodadas refeitas**
- `browser-tests/presets-do-painel.spec.ts`: `fontsReady` (`document.fonts.ready`) antes de cada foto de opção e antes da foto do cartão sem textura. Sem outra mudança no spec.
- Três rodadas de "se distingue a olho" (10 casos, nos dois modos, 734 pares), sobre o código com a regra da aurora ainda com fallback na variável: 10/10 passam nas três e as três matrizes são **idênticas byte a byte** (`cmp`). Menor margem fora do `cardTextures`: 2,17% (`escuro|topbar|topbar-glass|topbar-textured`); menor do `cardTextures`: 2,74%.
- Depois disso troquei o fallback pela variável declarada (achado 1, gate de contrato) e refiz o build. Uma 4ª rodada, e a rodada final do spec inteiro, passam, mas diferem das três primeiras em até **0,0006** (0,06 ponto percentual), só no modo claro: 26 pares na 4ª rodada (grupos `cards`, `corners`, `density`, `material`) e 12 na final (`sidebar`, `topbar`). Nenhum resultado virou e nenhum `cardTextures` variou. **A causa não foi isolada.** Descartei: fonte (a foto espera `fonts.ready` e os grupos que variam são outros), animação (`skipAnimations`), código-fonte (entre a rodada 3 e a final só mudaram `_atmosphere.css`, a regra da aurora, e o `buildInfo` do build) e CSS (o `dist/sarak.css` difere só na regra da aurora, que o `cardTextures` mede e os grupos que variam não usam). Suspeita não medida: rasterização de sombra/desfoque no claro. Por isso o critério das três rodadas idênticas fica marcado como parcial.

**Achado 4 — `PresetSamples.tsx`**
- Removi os `\r` que sobraram; `git status` e `git diff` do arquivo estão vazios (conteúdo e fim de linha iguais ao HEAD). Sem comando de escrita do git.

**Arquivos alterados nesta correção**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_atmosphere.css` | alterado | regra da aurora do cartão no claro, variável `--sarak-aurora-card-alpha-light` |
| `src/features/DesignEngine/Canvas/components/PresetSamplesDepth.tsx` | alterado | amostra sem título, 4x, canto de baixo |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetSamplesDepth.test.tsx` | alterado | teste da amostra sem texto |
| `browser-tests/presets-do-painel.spec.ts` | alterado | `fontsReady` antes das fotos |
| `src/features/DesignEngine/Canvas/components/PresetSamples.tsx` | restaurado | diff vazio |
| `dist/` | rebuild | `npm run build` (a árvore já tinha `dist/` modificado de antes) |

**Verificações executadas**
- `npx vitest run src/features/DesignEngine/Canvas src/core/Design/presets` → 73 arquivos, 795 testes passam.
- `npm run verify -- --tier=quick`: na 1ª passada falharam `variable-contract:check` (a variável sem dono) e `audit:baseline` (`ghostvars` 0 → 3), os dois por esta correção; depois de declarar a variável, os dois passam (`variable-contract` OK; `audit:baseline` igual ao baseline). `plan-index:check` estava OK na passada do quick.
- Navegador: `textura-do-cartao-mais-proxima` 8/8; `presets-do-painel` inteira 27/27; rodadas de "se distingue" 10/10 em quatro rodadas.

**Critérios de aceite**
- [x] Forma passa nos dois modos, com a aurora clara acima de 2% (31,87%) e a escura igual (4,15%).
- [x] A amostra mostra a textura sem texto cortado.
- [ ] Rodadas com os mesmos percentuais — parcial: três rodadas idênticas byte a byte; a 4ª e a final variam ≤ 0,0006 no claro, sem causa isolada, sem resultado virado.
- [x] `PresetSamples.tsx` sem diff.
- [ ] Prévia aprovada pelo dono — aguardando.

**Pendências / riscos**
- Prévia em `C:\tmp\sarak-previa-190`: `claro-shape-cardTextures.png`, `escuro-shape-cardTextures.png`, `aurora-claro-antes.png`, `aurora-claro-depois.png`.
- A aurora clara ficou bem mais presente no cartão real (alfa .8, antes .4) em toda tela com textura aurora no claro, não só na amostra: é o que a opção A pede; vale o dono olhar o "depois".
- `specs/00-indice.md` ainda mostra 🔵 para a plan-190; a sincronia do índice é do revisor.

## Veredito — 2026-11-28 — 🟢 Aprovado

**O que foi verificado e como**
- Diff da correção 1 lido:
  - `_atmosphere.css`: regra da aurora do cartão no claro, `light-dark()` com `--sarak-aurora-card-alpha-light: .8` declarada na própria regra; o escuro fica em .4;
  - `PresetSamplesDepth.tsx`: o canto do `.sarak-card` real, sem texto, a 4x;
  - `presets-do-painel.spec.ts`: `fontsReady` antes das fotos;
  - `PresetSamples.tsx`: sem diff.
- O `light-dark()` resolve na lib: o `DesignScope` sempre põe a classe `dark` ou `light` (`DesignScope.tsx:46`), e `_elements.css:79-80` dá o `color-scheme` de cada uma.
- Mutações em cópia fora do repositório:
  - sem a regra nova no `dist/sarak.css`, Forma (claro) reprova com `cardTextures: card-tex-aurora × card sem textura = 0.00%`;
  - sem o `MotionGlobalConfig.skipAnimations`, duas rodadas de Componentes (escuro) dão percentuais diferentes no estado vazio, por exemplo `empty-soft-orbs × empty-open` 0,1063 contra 0,1068.
- Resíduo entre rodadas: com o código final, duas rodadas de Forma (claro) dão 120 linhas idênticas. O resíduo de até 0,0006 que o executor viu não se reproduziu.
- `npx tsc --noEmit`: 0 erros. `check-audit-baseline`: igual ao baseline. `check-trail-citation`: verde.
- Prévia aprovada pelo dono em 2026-11-28: `cardTextures` nos dois modos e `aurora-claro-antes` × `aurora-claro-depois`.
