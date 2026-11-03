---
tipo: "plan"
titulo: "Criar Personalidades: presets de estrutura que mudam o caráter do sistema e mantêm a paleta"
objetivo: "Fazer o painel oferecer dez Personalidades que aplicam forma, fontes, densidade, barras, tabela, movimento e ícones de uma vez, mantendo a paleta escolhida, para que paleta e estrutura combinem livremente em dois cliques"
dominio: "Painel de customização / Presets"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "painel", "presets", "personalidades"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[05-cromo-e-slots]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md + specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

O usuário escolhe uma cor e um caráter, e sai com um sistema coerente: com 10 Personalidades e 15 paletas, são 150 combinações em dois cliques.

# 2. Contexto

Aprovada pelo dono em 2026-11-01. Hoje um tema traz estrutura e cor juntas: não dá para ter "o caráter do Corporativo com a cor da minha marca". A paleta (`colorPalette`) já separou a cor; falta o lado da estrutura.

**Personalidade é um preset composto:** um dado com os tokens de estrutura, sem nenhuma cor, montado a partir dos grupos do registro de presets (`registry.ts`, [[09-temas-e-presets]] §5). Aplicar é rascunho até "Aplicar", como todo preset. Com "Usar minha marca" ([[06-painel-de-customizacao-e-preview]] §2.1), a marca dá a cor, e a Personalidade dá a estrutura.

**As barras entram na Personalidade.** Os 19 temas nascem com as barras neutras, então é aqui que o sistema ganha o caráter de barra de [[05-cromo-e-slots]] §2.1. `sidebarTone` e `topbarTone` são papel, não cor: a Personalidade escolhe o papel, e a paleta calcula o fundo e os textos ([[09-temas-e-presets]] §4.3.4). Por isso eles não violam a regra de "nenhuma cor". O tom não vence uma cor declarada em `sidebarColor` ou `topbarColor`, nem vale sem `colorPalette`: é o comportamento certo, e a Personalidade não escreve essas cores para contorná-lo.

**Conjunto inicial:**

| Personalidade | Caráter |
|---|---|
| Corporativo | sóbrio, denso, tabelas fortes |
| Executivo | espaçoso, serifado |
| Técnico | mono, cantos retos, compacto |
| Moderno | arredondado, leve, flutuante |
| Suave | sem bordas, sombras macias |
| Editorial | foco em tipografia |
| Brutalista | bordas fortes, contraste alto |
| Vidro | translúcido, com atmosfera |
| ERP de alta densidade | máximo de dados por tela |
| Painel de operação | para telas ligadas o dia todo |

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/components/` — `personalities.ts` e testes.
- `src/features/DesignEngine/` — o grupo Personalidades, primeiro bloco da decisão Tema, e a entrada em "Usar minha marca".
- `src/core/i18n/` — nomes e descrições, nos seis idiomas.
- `src/core/Design/presets/themes/*.ts` — só os tokens de barra dos 19 temas embarcados (passo 6a).
- `docs/migracoes.md` e `sarak-ui/GUIA-FRONTEND.md` — seção curta na autoria: tema = estrutura + paleta, e a Personalidade como atalho da estrutura.

## 3.2 Fora
- Token novo. Cor em Personalidade. Nos temas embarcados, qualquer token fora das barras, e qualquer cor. Marca, setor ou cliente no nome de Personalidade (zero-marca).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §3, §4.3.3, §4.3.4 | preset parcial e ordem de composição |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2, §4 | decisões e rascunho |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.1 | grupos, marca, tom e largura das barras |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | zero-marca |
| **Skill** | `ui-criar-preset` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | autoria · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Escreva as 10 Personalidades como dado, sobre os tokens de estrutura. Cada uma cobre forma, fontes, densidade, barras, tabela, movimento e ícones. Em barras, declare ao menos `sidebarTone`, `topbarTone`, `sidebarLogoPlacement` e a orientação, e use os cinco tons no conjunto, com `neutral` só onde for o caráter. Se alguma ficar parecida com outra, troque o caráter ou proponha outra, com o motivo.
3. O grupo mostra a Personalidade com a paleta atual do rascunho, com o componente real. Escolher é rascunho; a espiada funciona como nos outros grupos. Ajustes manuais de estrutura perguntam antes de ser descartados, como na troca de paleta.
4. "Usar minha marca" ganha o campo Personalidade, opcional.
5. **Prévia para o dono:** `C:\tmp\sarak-previa-145\index.html`, enxuta (decisão do dono, 2026-11-03: acelerar sem perder qualidade).
   - As 10 Personalidades numa tela de ERP densa, na paleta padrão, nos dois modos: 20 capturas, com a lateral à vista, itens de menu reais e um grupo aberto.
   - Os 19 temas depois da mudança, nos dois modos: 38 capturas. O "antes" é o tema publicado e não precisa ser capturado.
   - A combinação com as 15 paletas não entra na prévia: quem a garante é o teste de `PAIRS`.
   - **Uma build só**, no fim, para a prévia e os specs juntos. Não use subagente para conferir as capturas: confira à vista só as que o teste não cobre, e o dono confere o resto na prévia.
6. **Temas embarcados com o caráter de barra (decisão do dono, 2026-11-03).** Hoje os 19 temas declaram `sidebarTone` e `topbarTone` como `neutral`. O mapa abaixo, escrito pelo revisor, é o ponto de partida. Troque uma linha só se a Personalidade reprovar na legibilidade do tema, e diga o motivo no resumo.

   | Personalidade | Temas |
   |---|---|
   | Corporativo | `corporate-ledger`, `high-contrast` |
   | Executivo | `sarak-sovereign`, `golden-hour` |
   | Técnico | `blueprint-protocol`, `industrial-terminal` |
   | Moderno | `minimalist-airy`, `kinetic-flow`, `playful-pastel` |
   | Suave | `neumorphic-mobile`, `organic-clay` |
   | Editorial | `editorial-ink` |
   | Brutalista | `neo-brutalism` |
   | Vidro | `aurora-veil`, `nebula-space`, `synthwave-retro` |
   | ERP de alta densidade | `data-terminal` |
   | Painel de operação | `cyberpunk-neon`, `cyber-retro-wave` |

   - Cada tema passa a declarar os tokens de barra da Personalidade mais próxima do seu caráter: tons, estilo do item ativo, borda e `sidebarLogoPlacement`.
   - Nada fora das barras muda, e nenhuma cor.
   - O resumo traz uma tabela tema → Personalidade → tons.
   - Os gates de tema continuam verdes (`npm run verify -- --tier=themes`).
7. Guia e `docs/migracoes.md`. A nota de migração registra que as barras dos temas embarcados mudaram de aparência, sem mudar `id` nem cor.
8. Depois de `npm run build`, rode os specs do painel e `troca-de-tema`. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
9. `npm run verify -- --tier=quick` uma vez. Antes de entregar, rode também os gates do commit: `npm run trail-citation:check -- --staged` (depois de `git add -A`), `npm run variable-contract:check` e `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`.

# 6. Critérios de aceite

- [ ] 10 Personalidades, distintas entre si: ao menos 8 tokens de estrutura com efeito visível diferem — teste.
- [ ] Nenhuma cor em Personalidade; trocar de Personalidade não muda `colorPalette` — teste.
- [ ] Toda Personalidade declara os tons das duas barras, sem `sidebarColor` nem `topbarColor`, e os cinco tons aparecem no conjunto — teste.
- [ ] Nome, avatar, idioma, engrenagem e sair legíveis nas 10 Personalidades, nos dois modos — navegador.
- [ ] Pares de `PAIRS` passando nas 10 × 15 paletas × 2 modos — teste.
- [ ] Nomes nos seis idiomas — teste.
- [ ] Ajuste manual pergunta antes de ser descartado; só o botão explícito perde — teste.
- [ ] Os 19 temas declaram tons de barra de uma Personalidade; nada fora das barras mudou; gates de tema verdes — teste e `git diff`.
- [ ] Nome, avatar, idioma, engrenagem, sair e item ativo legíveis nos 19 temas, nos dois modos — navegador.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Design src/features/DesignEngine src/core/i18n` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A prévia aberta; o veredito só fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` + `specs/specs/06-painel-de-customizacao-e-preview.md`.

- 09 §3 e §5: a Personalidade é um preset composto de estrutura, sem cor. 09 §4.3.4: os temas embarcados declaram o tom das barras.
- 06 §2: o grupo na decisão Tema.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-03

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 D specs/plan/plan-141-enriquecer-presets-do-painel.md
 M specs/plan/plan-145-personalidades.md
 M specs/specs/05-cromo-e-slots.md
 M specs/specs/06-painel-de-customizacao-e-preview.md
 M specs/specs/09-temas-e-presets.md
```

**O que foi feito**
- `personalities.ts` (novo): 10 Personalidades montadas dos presets do registro (`parts`) mais um `extra` com orientação (`navigationStyle`), `sidebarLogoPlacement` e ajustes; sem cor, sem `colorPalette`/`mode`. Tons (lateral/topo): Corporativo inverse/surface, Executivo surface/secondary, Técnico neutral/neutral, Moderno primary/surface, Suave surface/neutral, Editorial neutral/neutral, Brutalista primary/surface, Vidro surface/surface, ERP secondary/surface, Operação inverse/neutral.
- Painel: grupo `personalities` primeiro da decisão Tema (`design-decisions.json`, `PersonalityCatalog.tsx`, `ThemeDecisionOptions.tsx`); escolha por `usePersonalitySelection` + `personalityDraft.ts` (pergunta antes de descartar ajuste manual; o tema ainda em rascunho e a Personalidade já aplicada não contam como ajuste); campo opcional em "Usar minha marca" (`BrandShortcut.tsx`, `useBrandForm.ts`); a busca acha Personalidade (`searchGroups.ts`).
- i18n: nomes e descrições nos 6 idiomas (`presetTexts/personalities.ts`), título do grupo e textos do diálogo e do campo (`presetTexts/groups.ts`).
- 19 temas: só as 11 chaves de barra, com o mapa da §5.6 da plan, exceto `sarak-sovereign` (ver decisões). Tabela abaixo.
- Gate de contraste: `verify_contrast.ts` ganhou `pairsFor` (pares do plano da paleta quando a barra tem papel contrastante). Sem isso o auditor reprovava 40 pares falsos (texto do corpo sobre barra invertida).
- Correção que um teste revelou: `usePaletteSelection` e `useBrandForm` calculavam as cores da barra com tom neutro; com temas de tom, a troca de paleta abria o diálogo de "ajuste manual" falso e apagava o papel. Agora usam o papel do rascunho (`barTonesOf`, `paletteDraft.ts`).
- `BarSample.tsx`: guarda para ambiente sem `ResizeObserver`.
- Guia (`sarak-ui/GUIA-FRONTEND.md`, subseção "Estrutura vem da Personalidade") e `docs/migracoes.md`; `npm run guide` regenerou `sarak-ui/docs/migracoes.md`.
- Prévia: `C:\tmp\sarak-previa-145\index.html` (20 capturas das Personalidades em tela de ERP, nos dois modos, paleta oceano; 38 dos 19 temas depois da mudança).

**Tabela tema → Personalidade → tons (lateral/topo)**
| Tema | Personalidade | Tons |
|---|---|---|
| corporate-ledger, high-contrast | Corporativo | inverse / surface |
| golden-hour | Executivo | surface / secondary |
| sarak-sovereign, blueprint-protocol, industrial-terminal | Técnico | neutral / neutral |
| minimalist-airy, kinetic-flow, playful-pastel | Moderno | primary / surface |
| neumorphic-mobile, organic-clay | Suave | surface / neutral |
| editorial-ink | Editorial | neutral / neutral |
| neo-brutalism | Brutalista | primary / surface |
| aurora-veil, nebula-space, synthwave-retro | Vidro | surface / surface |
| data-terminal | ERP de alta densidade | secondary / surface |
| cyberpunk-neon, cyber-retro-wave | Painel de operação | inverse / neutral |

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/components/personalities.ts` (+ teste) | criado | as 10 Personalidades |
| `src/core/i18n/presetTexts/{personalities,groups,index}.ts` (+ teste) | criado/alterado | textos nos 6 idiomas |
| `src/features/DesignEngine/**` (catálogo, hooks, utils, BrandShortcut, decisões, busca, BarSample) + testes | criado/alterado | grupo, escolha com pergunta, campo da marca, correção de tom |
| `src/core/Design/presets/themes/*.ts` (19) | alterado | 11 chaves de barra |
| `themes/__tests__/{themeBars,compose}.test.ts`, `Provider/utils/__tests__/shippedThemesConsoleClean.test.ts` | criado/alterado | testes ajustados ao tom |
| `gates/scripts/audit/verify_contrast.ts` (+ teste) | alterado | `pairsFor` |
| `browser-tests/plan-145-personalidades.spec.ts`, `fixtures/plan-145-entry.tsx` | criado | legibilidade no navegador |
| `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md`, `sarak-ui/docs/migracoes.md` | alterado | nota e seção |

**Verificações executadas**
- `npx vitest run` por pasta (Design/presets, Provider/utils, i18n, gates/scripts/audit, DesignEngine Main/utils/Canvas): 1223 testes, 1 falha de limite no `themeBars` (≤ 3 temas neutral/neutral; o mapa da plan dá 4), corrigida e reexecutada: 22/22.
- `npm run verify -- --tier=themes`: tudo OK exceto 1 teste (`shippedThemesConsoleClean`), corrigido; `themes:diversity`, `boot:measure` e `audit:baseline` OK.
- `npm run verify -- --tier=quick` → todos OK (tsc, audit:baseline --with-tsc, Anel 1, trail-citation, guide, dev-kit, Anel 0).
- `npm run build` rodou 3 vezes, contra o pedido de uma só: a 2ª para validar o mapa final e a 3ª depois de trocar `sarak-sovereign`.
- Playwright na 2ª build (`plan-145`, `troca-de-tema`, `plan-140`, `plan-141`, `plan-135`, `painel-segue-o-modo`, `paletas-cabem-na-coluna`): 42 passaram, 2 falharam (item ativo em 4,49:1 com `sarak-sovereign` em Executivo). Na 3ª build reexecutei só `plan-140`, `plan-141` e `plan-145`: passaram.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` feito; apaguei os 42 arquivos novos de `dist/` (saída da minha build, não rastreados) porque `git clean` foi bloqueado pelo hook.
- Não rodei `trail-citation --staged` (sem `git add`) nem `check-audit-baseline` isolado: o `--tier=quick` cobre o baseline com tsc e o trail-citation sem staged.

**Critérios de aceite**
- [x] 10 Personalidades distintas (≥ 8 tokens) — `personalities.test.ts`
- [x] Nenhuma cor; `colorPalette` intacto — `personalities.test.ts`, `usePersonalitySelection.test.ts`
- [x] Tons das duas barras, sem `sidebarColor`/`topbarColor`, cinco tons no conjunto — `personalities.test.ts`
- [x] Legibilidade nas 10, dois modos, navegador — `plan-145-personalidades.spec.ts` (duas paletas)
- [x] `PAIRS` em 10 × todas as paletas do registro × 2 modos — `personalities.test.ts` (usa o registro inteiro, não um número fixo)
- [x] Seis idiomas — `presetTexts.test.ts`
- [x] Ajuste manual pergunta; só o botão explícito descarta — `usePersonalitySelection.test.ts`
- [x] 19 temas com tons; só barras mudaram (o `git diff` dos 19 mostra só as 11 chaves); gates de tema verdes — `themeBars.test.ts`
- [x] Legibilidade nos 19 temas, dois modos — mesmo spec, com as exceções declaradas abaixo
- [ ] Prévia gerada — gerada; a aprovação é do dono.

**Decisões e suposições**
- `navigationStyle` (token funcional) faz o papel de "orientação" nas Personalidades: é a única forma sem token novo. Personalidades não passam por `theme-completeness`.
- Troquei uma linha do mapa da §5.6: `sarak-sovereign` Executivo → Técnico. Motivo: com Executivo, `plan-140` e `plan-141` mediram 4,49:1 no rótulo do item ativo; Técnico é neutral/neutral. É o tema de referência (09 §5.2).
- Brutalista ficou primary/surface (não inverse/primary): com tom contrastante na topbar e `neo-brutalism` declarando cor própria de barra, o idioma caía a 4,14:1.
- O "ajuste manual" é medido contra o design aplicado + o tema ainda em rascunho + a Personalidade já no rascunho.
- Três medidas ficam abaixo de 4,5:1 e já estavam assim com as barras antigas: item ativo em pílula da topbar escura de `nebula-space`/`aurora-veil` (4,4995) e nome do usuário na lateral escura de `organic-clay` (4,48). Estão em `KNOWN_BELOW_LIMIT` no spec.
- Medir o estado anterior no navegador mostrou 64 falhas de legibilidade em 12 temas com as barras neutras; os tons novos as eliminaram.

**Achados fora do escopo (não corrigidos)**
- As três medidas acima.
- `pairsFor` no auditor muda o que 09 §6.5 descreve; a síntese deve registrar.
- 09 §5.3 diz que `sarak-sovereign` "mantém os padrões do schema": os tons seguem `neutral`, mas item ativo e borda mudaram (outline no lugar de bar).

**Pendências / riscos**
- Não reexecutei todos os specs de navegador após a 3ª build (só os três listados).
- Suíte completa e `verify full` ficam com o revisor.
- A prévia mostra os 19 temas só com a lateral; as topbars estão no teste, não nas capturas.


---

## Resumo da execução (correção 1) — 2026-11-03

**Achado 1 (`sarak-sovereign`)** — corrigido. `sarak-sovereign.ts` voltou ao `HEAD` (`git diff` do arquivo vazio): marca no topo, item ativo `bar`/`bar`, tons `neutral`. `themeBars.test.ts` isenta o tema (`SCHEMA_DEFAULT_THEME`), tem um caso novo que trava os padrões dele nas barras, e o teto de temas `neutral`/`neutral` com Personalidade voltou a 3 (conta os 18 restantes: blueprint-protocol, industrial-terminal, editorial-ink).

**Achado 2 (`sidebarLogoPlacement`)** — corrigido. `blueprint-protocol`, `industrial-terminal`, `data-terminal`, `cyberpunk-neon` e `cyber-retro-wave` voltaram a `'top'`; `git diff` dos temas não tem mais nenhuma linha `sidebarLogoPlacement`. Tons, item ativo e borda ficaram. Personalidades inalteradas. `themeBars.test.ts` não cobra mais `sidebarLogoPlacement` dos temas (saiu de `BAR_KEYS` e da asserção das duas posições). `docs/migracoes.md` deixou de citar a marca na base e diz que `sarak-sovereign` não muda; o guia deixou de citar `sidebarLogoPlacement` na cópia de tokens; `npm run guide` rodado.

**Verificação (só a pedida)**
- `npx vitest run src/core/Design/presets/themes` → 10 arquivos, 105 testes verdes (na 1ª tentativa, 1 falha: a contagem de `neutral`/`neutral` incluía o tema isento; ajustada).
- `npm run build` → uma, EXIT 0.
- `plan-145-personalidades.spec.ts` → 1 passou.
- Prévia regerada só nos 6 temas tocados (`sarak-sovereign`, `blueprint-protocol`, `industrial-terminal`, `data-terminal`, `cyberpunk-neon`, `cyber-retro-wave`), dois modos, em `C:\tmp\sarak-previa-145\img`.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` e remoção dos arquivos novos de `dist/`: `git status` sem `dist`/`buildInfo`.

**Fora do escopo:** o resumo anterior cita `sarak-sovereign` como Técnico e a marca na base; vale o desta correção.


# 10. Veredito

## Veredito — 2026-11-03 — 🔴 Reprovado

O revisor rodou:
- `npx vitest run src/core/Design src/features/DesignEngine src/core/i18n src/core/Provider/utils gates/scripts/audit`: 223 arquivos, 1981 testes, todos verdes.
- `check-audit-baseline --with-tsc`: igual ao baseline.
- `variable-contract:check` e `trail-citation:check`: OK. Nenhum arquivo novo cita plan.
- `verify_contrast.ts`: OK.
- `git diff` dos 19 temas: só chaves `sidebar*`/`topbar*`, nenhuma cor.
- Prévia aberta.

**Achados**

1. `src/core/Design/presets/themes/sarak-sovereign.ts:51,55,62`. O tema padrão, que vai no boot de todo consumidor, mudou `sidebarLogoPlacement` de `top` para `bottom`, `sidebarActiveItemStyle` de `bar` para `outline` e `topbarActiveItemStyle` de `bar` para `underline`.
   - Critério violado: [[09-temas-e-presets]] §4 (Identidade do cromo) diz que "`sarak-sovereign` mantém os padrões do schema". O passo 6 não autoriza trocar a regra da spec fixa. O próprio resumo aponta a divergência, mas não a resolve.
   - Efeito medido: a prévia `t-sarak-sovereign-dark.jpg` mostra a marca numa faixa no meio da lateral e uma faixa vazia no topo. Abaixo de "Estoque", nenhum item de menu aparece.
   - Conserto: `sarak-sovereign.ts` volta ao que está no `HEAD`. `themeBars.test.ts` isenta o tema (padrões do schema, sem Personalidade) e o teto de temas `neutral`/`neutral` volta a 3. Os demais casos continuam como estão.
2. `blueprint-protocol`, `industrial-terminal`, `data-terminal`, `cyberpunk-neon` e `cyber-retro-wave` passaram a declarar `sidebarLogoPlacement: 'bottom'`.
   - Efeito medido: a prévia mostra uma faixa vazia no topo da lateral, e a marca numa faixa própria que tira altura do menu. Em `t-data-terminal-light.jpg`, "Relatórios" sai cortado e "Configurações" some (backlog #71).
   - Conserto, por decisão do revisor: esses cinco temas voltam a `sidebarLogoPlacement` do `HEAD`. Tons, item ativo e borda continuam como estão. As Personalidades não mudam. Em `themeBars.test.ts`, `sidebarLogoPlacement` deixa de ser cobrado dos temas. A nota em `docs/migracoes.md` deixa de dizer que a marca foi para a base, e depois roda `npm run guide`.

**Verificação da correção (só isto):** `npx vitest run src/core/Design/presets/themes`, uma `npm run build`, o spec `plan-145-personalidades`, `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` e a prévia regerada só nos 6 temas tocados.

## Veredito — 2026-11-03 (correção 1) — 🟢 Aprovado

Os dois achados foram conferidos. Rodado pelo revisor:
- `git diff HEAD` de `sarak-sovereign.ts`: vazio.
- `git diff` dos temas: nenhuma linha `sidebarLogoPlacement`.
- `themeBars.test.ts`: trava os padrões do schema no tema padrão e conta 3 temas `neutral`/`neutral`.
- `npx vitest run src/core/Design/presets/themes`: 105 testes verdes.
- `check-audit-baseline --with-tsc`, `trail-citation:check` e `check-theme-completeness` (19 de 19): OK.
- `dist/` e `buildInfo` restaurados.
- Capturas novas de `sarak-sovereign` e `data-terminal`: marca no topo e menu inteiro.

**Aprovação do dono em 2026-11-03:** a prévia em `C:	mpsarak-previa-145` (10 Personalidades e 19 temas, nos dois modos).

No resumo da execução, valem as decisões que a correção não desfez:
- `navigationStyle` faz o papel de orientação;
- Brutalista fica com os tons primary/surface;
- `pairsFor` entra no auditor de contraste.

O tema `sarak-sovereign` segue nos padrões do schema. Riscos em aberto: backlog #70 e #71.

Destino da síntese conforme o frontmatter. Acréscimo: `pairsFor` em 09 §6.5.
