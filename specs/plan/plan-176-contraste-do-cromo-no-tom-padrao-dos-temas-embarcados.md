---
tipo: "plan"
titulo: "Contraste do cromo no tom padrão dos 25 temas embarcados"
objetivo: "Fazer o cromo de todo tema embarcado, no tom padrão e nos dois modos, ter texto em ao menos 4,5:1 e ícone em ao menos 3:1 medidos no navegador com a opacidade aplicada, e alinhar os temas resgatados ao que a migração promete"
dominio: "Temas / Cromo / Acessibilidade"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "rc2", "contraste", "cromo", "temas", "acessibilidade"]
relacionados: ["[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[05-cromo-e-slots]]"]
depende_de: ""
retida_por: ""
destino_sintese: "10-seguranca-e-acessibilidade"
---

# 1. Objetivo

Nos 25 temas embarcados, no tom padrão das barras, nos modos claro e escuro e nas orientações lateral e topo, o cromo passa a ter:
- texto (marca, item, item ativo, nome e cargo do usuário, idioma) em ao menos 4,5:1;
- ícone em ao menos 3:1.

A medida é a cor que chega à tela, com a opacidade aplicada.

# 2. Contexto

Defeitos medidos pela validação da 9.0.0-rc.1 (plans 172 e 173). Os números abaixo são o que se mede hoje, na tag `v9.0.0-rc.1`.

**Caminho medido:** o do importador, com `SarakUIProvider` montado com `initialTheme=<id>`,
`options.preferences.defaultColorMode=<modo>` e `config={}`, e o `SarakAppChrome` em volta. 12 dos 15 pares do D1 são o tema no modo
**oposto** ao nativo, que passa pelo caminho de modo do Provider (`applyColorMode` e `applyCalculatedPaletteMode`, em
`src/core/Provider/utils/overlayPreferences.ts`). A fixture `browser-tests/fixtures/harness-entry.tsx` compõe o tema com
`composeThemeForMode` e não passa por esse caminho. Por isso, nela, o D1 não aparece.

| Id | Defeito |
|---|---|
| D1 | **15 de 50 pares tema × modo** reprovam no tom padrão. Os piores: blueprint-protocol claro (item 2,02:1, ícones 1,05:1); industrial-terminal-classic claro (marca 1,11, ícones 1,0); neumorphic-mobile escuro (1,26 a 1,49); organic-clay escuro (1,5). Também reprovam: cyber-retro-wave escuro (⚙ 1,89), nebula-space e corporate-ledger escuros (2,66), sarak-sovereign-classic e cyberpunk-neon-classic claros (2,98), neo-brutalism escuro (3,15) e mais 5 |
| D1b | A medida por cor calculada **subestima o ícone**. O ícone de item do blueprint-protocol claro dá 2,02 pela cor e **1,36 por pixel**, porque há opacidade no caminho |
| D7 | Nome e cargo do usuário abaixo de 4,5 em 32 de 50 pares. No tema padrão claro: 3,88 (lateral) e 4,10 (topo) |
| D8 | Nos tons contrastantes: texto do item ativo em degradê com 3,34 a 3,43 em 19 de 300 células. No topo, ícones de itens inativos com 1,0 a 1,8 em 18 pares |
| D13 | Temas resgatados fora do que a migração diz: `dot-matrix-elegant` com faixa `#d4af37` (a migração diz `#1b1b1b`), e véu do item ativo de 10% em dot-matrix-elegant, nature-breeze e cyber-retro-wave-classic (a migração diz 12%) |
| T | Candidato: títulos de card (`.sarak-card h2/h3`) a 4,35:1 no escuro, medido no hub. Ainda não confirmado como peça da lib |

**Por que escapou.** A spec 10 ("O que a lib calcula e o navegador mede") cobre o cromo só nos tons **contrastantes**. No tom padrão,
vale a cor do tema ([[09-temas-e-presets]] §4.3.4: "a cor do tema vence"). Ninguém mede o cromo no tom padrão, e o
`contraste-do-cromo-nas-barras.spec.ts` só percorre 4 temas. A correção do D1 e do D7 é **nos dados dos temas embarcados**, que a lib
entrega. O cálculo não deve recolorir o tema.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/*.ts`: as cores de cromo dos temas que reprovam, nos dois modos (`design` e `contraparte`). Mude o
  mínimo, só em luminosidade, sem trocar o matiz.
- `src/core/Design/presets/themes/dot-matrix-elegant.ts`, `nature-breeze.ts`, `cyber-retro-wave-classic.ts`: o D13.
- `src/components/Layout/chrome/chromeToneContrast.ts`: só se a causa do D8 estiver lá.
- `src/core/Provider/utils/overlayPreferences.ts` e o caminho de modo do Provider (`usePreferencesManager.ts`): o que faz o cromo, com
  o tema no modo oposto, diferir de `composeThemeForMode(tema, modo)`.
- `src/components/atomic/Navigation/SarakShellUserWidget.tsx:107`: a classe de tamanho do cargo vira `text-[length:…]`, para não
  disputar `color` com a da cor.
- `browser-tests/contraste-do-cromo-tom-padrao.spec.ts` (novo) e `browser-tests/contraste-do-cromo-nas-barras.spec.ts` (estender a
  lista de temas do degradê para os 25).
- Os snapshots que a mudança de cor mexer, atualizados **só por filtro de arquivo** (`npx vitest run <arquivo> -u`), nunca pela suíte
  inteira.
- `docs/migracoes.md`: uma linha na seção da 9.0.0, se alguma cor visível de tema mudar.

## 3.2 Fora
- O cálculo de cor dos tons contrastantes e a paleta calculada. Fora o D8, eles passam.
- Foco de teclado e nomes acessíveis: são da `plan-177`.
- Persistência, presets de estrutura, personalidades, schema de atmosfera e agrupamento do painel: são da `plan-178`, que corre em
  paralelo. Do Provider, esta plan toca só o caminho de modo da §3.1. Ela **não** toca `src/core/Provider/hooks/useDesign*`,
  `useResolvedThemeLoad.ts`, `chosenModeValues.ts`, `src/core/Design/presets/components/`, `src/core/Design/schema/` nem
  `src/styles/_base.css`.
- `src/core/Design/presets/themes/compose.ts` e `color-engine.ts`: se a causa estiver neles, pare e relate.
- O tema do consumidor. A spec 10 deixa fora da garantia.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` (seção "O que a lib calcula e o navegador mede") | a régua e as peças medidas |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | a cor do tema vence; por que a correção é no dado |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | as peças do cromo |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-criar-tema` | como alterar um tema sem quebrar a paridade |
| Código | `browser-tests/contraste-do-cromo-nas-barras.spec.ts` | molde de medição: harness, cadeia de fundos, réguas |
| Código | `src/components/Layout/chrome/chromeToneContrast.ts` | o cálculo dos tons contrastantes (D8) |
| Migração | `docs/migracoes.md`, seções dos temas resgatados | os valores prometidos do D13 |

# 5. Instruções de execução

1. **Medição primeiro.** Crie `browser-tests/contraste-do-cromo-tom-padrao.spec.ts`, no molde do `contraste-do-cromo-nas-barras`:
   - **cenários:** 25 temas × 2 modos × lateral e topo, no tom padrão, a 1440 px;
   - **peças:** marca, item, item ativo, nome e cargo do usuário, idioma e ícones;
   - **ícone:** a cor efetiva leva em conta a `opacity` dos ancestrais e o canal alfa (D1b);
   - **sem lista de exceções.**

   Rode e registre o número de reprovações. Deve reproduzir o D1 e o D7.
2. **Degradê.** Estenda o `GRADIENT_THEMES` do `contraste-do-cromo-nas-barras` aos 25 temas. Registre as reprovações; devem reproduzir
   o D8.
3. **Corrija os temas** até as duas specs passarem. Para cada tema mudado, registre no resumo a cor antiga e a nova.
4. **Corrija o D8** na causa medida: o tema ou `chromeToneContrast.ts`.
5. **D13.** Os temas passam a ter os valores que a migração promete: faixa do `dot-matrix-elegant` em `#1b1b1b` e véu de 12% nos três.
6. **Candidato T.** Meça o título do `SarakTitleCard` nos 25 temas, modo escuro.
   - Se passar de 4,5:1, registre "não é da lib" e pare aqui.
   - Se não passar, corrija pelo mesmo critério do passo 3.
7. **Verificação do executor**, nesta ordem e só isto:
   - `npx vitest run src/core/Design/presets/themes`, mais os testes dos snapshots tocados;
   - `npm run verify -- --tier=quick`;
   - `npm run build`, depois as duas specs sozinhas:
     `npx playwright test --config=browser-tests/playwright.config.ts contraste-do-cromo-tom-padrao contraste-do-cromo-nas-barras`.

   **Não** rode a suíte completa nem a bateria `cromo-css-real:check` inteira. As duas rodam uma vez, no fechamento da campanha da rc.2.

# 6. Critérios de aceite

- [ ] A spec nova cobre 100 cenários (25 × 2 × 2) e passa sem lista de exceções. O ícone é medido com a opacidade.
- [ ] O `contraste-do-cromo-nas-barras` cobre os 25 temas no degradê e passa.
- [ ] O resumo traz a tabela de cada tema mudado (cor antiga → nova), com variação só de luminosidade.
- [ ] O D13 está corrigido; o candidato T está corrigido ou descartado com a medida.
- [ ] Os comandos do passo 7 passam, e o resumo traz a saída final de cada um.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O invariante vira a spec de navegador `contraste-do-cromo-tom-padrao`, que entra na bateria do
`cromo-css-real:check`.

O revisor **não repete** os comandos do passo 7. Ele confere:
- `git diff --stat` contra a §3.1.
- **Mutação, em cópia fora do repositório:**
  - devolva uma cor corrigida ao valor antigo (por exemplo, o item do blueprint-protocol claro) → a spec nova tem de reprovar;
  - retire o tratamento de opacidade da medida → a spec nova tem de reprovar o ícone do blueprint-protocol claro.
- Uma captura por pixel de um tema corrigido, comparada com a tabela do resumo.

# 8. Destino da síntese

**Destino:** `10-seguranca-e-acessibilidade`. Texto para transporte, como item novo na lista "O que a lib calcula e o navegador mede":

> - **O cromo no tom padrão dos temas embarcados.** Nos 25 temas, nos dois modos, na lateral e no topo, o texto do cromo fica em ao
>   menos 4,5:1 e o ícone em ao menos 3:1, medidos com a opacidade aplicada. A correção é no dado do tema, nunca no cálculo
>   ([[09-temas-e-presets]] §4.3.4). Guarda `contraste-do-cromo-tom-padrao`.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-25

**Resultado:** Bloqueado (só o passo 1 foi executado; nenhum tema foi alterado)

**Estado do worktree ao iniciar**
Fora de `dist/`: ` M specs/00-indice.md`, ` M src/buildInfo.ts`, ` M src/core/Provider/buildInfo.ts`, `?? specs/plan/plan-176…`, `?? specs/plan/plan-177…`, `?? specs/plan/plan-178…`. Mais `dist/` modificado/removido/criado por builds anteriores (não é meu).

**O que foi feito**
- Criei `browser-tests/contraste-do-cromo-tom-padrao.spec.ts` (25 temas × 2 modos × lateral/topo, 1440 px, tom do próprio tema). Mede marca, item, item ativo, nome, cargo, idioma, avatar, engrenagem, sair e os ícones do item (inativo e ativo). A cor efetiva leva o canal alfa da cor e a `opacity` de cada ancestral; a cadeia de fundos inclui o fundo do próprio nó; barra em degradê é medida nas duas paradas, vale a pior. Sem lista de exceções. O cargo entra por uma cópia temporária da fixture (`user.role`), apagada ao fim do `beforeAll`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/contraste-do-cromo-tom-padrao.spec.ts` | criado | spec de medição do passo 1 |

**Verificações executadas**
- `npx playwright test --config=browser-tests/playwright.config.ts contraste-do-cromo-tom-padrao` (contra o `dist/` atual) → 100 cenários, **33 reprovam, em 28 pares tema×modo**; 1 teste falhou, como esperado antes da correção.
- Mesma medição pela via `SarakUIProvider activeThemeId` (sonda fora do repositório, blueprint-protocol claro) → mesmos valores da via `composeThemeForMode`.

**Critérios de aceite**
- [ ] spec cobre 100 cenários e passa — cobre 100, **não passa** (33 reprovações).
- [ ] degradê nos 25 temas — não feito.
- [ ] tabela cor antiga → nova — não feito (nenhum tema tocado).
- [ ] D13 / candidato T — não feito.
- [ ] comandos do passo 7 — não rodados.
- [x] `git diff --stat` só em caminhos da §3.1 — o único arquivo meu é o spec novo.

**Decisões e suposições**
- Parei no passo 1 porque a medição **não reproduz o D1 da §2** e o maior grupo de reprovações tem causa fora da §3.1 (abaixo). Corrigir 25 temas contra uma linha de base que diverge do que a plan descreve é adivinhar.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Navigation/SarakShellUserWidget.tsx:107` — o cargo do usuário na barra de **topo** usa `text-[var(--sarak-type-scale-micro,11px)]` junto com `text-[var(--sarak-subtitle-color,…)]`. O Tailwind gera as duas como `color:`; a da escala vence, vira cor inválida e o cargo herda a cor da `header` (`#f2f6fb`). Em modo claro dá 1,03 a 1,12:1 em **16 pares** (topo). Corrige-se com `text-[length:var(--sarak-type-scale-micro,11px)]`; não é dado de tema. Fora da §3.1.
- Cargo na **lateral**, modo claro, 4,26 a 4,49:1 (industrial-terminal, golden-hour, blueprint-protocol, editorial-ink, cyber-retro-wave-classic, nature-breeze): é dado (`subtitleColor` claro), cabe na §3.1.

**Pendências / riscos**
- **O D1 não reproduz.** Medido neste worktree (HEAD `d417cd22`, nada de cromo/tema mudou desde a tag `v9.0.0-rc.1`), blueprint-protocol claro tem item inativo ≈4,6:1 e ícone igual à cor do texto, `opacity` 1 em toda a cadeia; os 2,02 / 1,05 / 1,36 da §2 não aparecem. Industrial-terminal-classic claro, neumorphic-mobile escuro e organic-clay escuro também não reprovam em marca/item/ícone como a §2 diz. Preciso saber em que superfície o D1 foi medido (consumidor real? outro viewport? hover?).
- Reprovações reais fora o cargo do topo (todas na barra de topo): idioma (nebula-space e corporate-ledger escuros 3,99; neumorphic-mobile escuro 3,37; blueprint-protocol escuro 3,09; cyberpunk-neon-classic claro 3,51; industrial-terminal-classic claro 3,30; organic-clay claro 4,04; mais 5 entre 4,41 e 4,50), nome (neumorphic-mobile escuro 2,79; blueprint-protocol escuro 3,51; editorial-ink escuro 3,26; cyberpunk-neon escuro 3,24; cyber-retro-wave escuro 3,61), engrenagem (nebula-space e corporate-ledger escuros 2,66; neumorphic-mobile escuro 2,79) e item ativo (blueprint-protocol escuro 4,18; neumorphic-mobile escuro 4,46). Boa parte dos temas tira a cor da paleta calculada (`colorPalette`), que a §3.2 deixa fora: o ajuste "no dado do tema" exigiria sobrescrever `primaryColor`/`titleColor` por tema.
- O passo 2 (degradê nos 25 temas) esbarra em `measureInBrowser`, que lança "Barra sem degradê" para tema sem degradê; precisa de regra de quais temas têm degradê.

---

# 10. Veredito

## Veredito — 2026-11-25 — 🔴 Devolvida com correções (a parada do executor estava certa)

**O que foi verificado:**
- **A divergência do D1 tem causa:** a medida da `plan-173` não usa a mesma montagem que a spec nova.
  - **Na 173**, o harness (`C:\Users\Igor\AppData\Local\Temp\sarak-rc1-completo\harness\entry.tsx`, linhas 91-100) monta o
    `SarakUIProvider` com `initialTheme=<id>`, `config={}` e `options.preferences.defaultColorMode`.
  - **A spec nova** compõe com `composeThemeForMode`, como a fixture-base.
  - **Na `varredura.csv`** (tom base, 1440 px, sem contar o usuário), dos 15 pares que reprovam, 12 são o tema no modo **oposto** ao
    nativo. Entram aí todos os graves:
    - blueprint-protocol claro (item 2,02, ícone 1,05);
    - industrial-terminal-classic claro (marca 1,11, ícone 1,0);
    - neumorphic-mobile escuro (1,26 a 1,49);
    - organic-clay escuro.
  - **Os 3 pares no modo nativo** (blueprint-protocol, cyberpunk-neon e nebula-space escuros) são peças da barra de topo, as mesmas que
    a sua medida achou.
  - **Conclusão:** o D1 grave mora no caminho de modo do Provider, e não no dado do tema.
- **O cargo do topo** (`SarakShellUserWidget.tsx:107`): confirmado na leitura. As duas classes arbitrárias viram `color`.
- **A regra do degradê:** a 173 ligou o degradê pelo token, e não pelo tema. A cena leva
  `sidebarBackgroundStyle`/`topbarBackgroundStyle: 'gradient'` com o tom (`harness\sweep.cjs:96-99`). Isso vale para os 25 temas e dá as
  300 células do D8.

**Correções:**

1. **A spec nova mede pelo caminho do importador.**
   - Cada cena monta o `SarakUIProvider` com `initialTheme=<id>`, `options.preferences.defaultColorMode=<modo>` e `config={}`, e o
     `SarakAppChrome` em volta (molde nas linhas citadas).
   - Não use `composeThemeForMode` na cena.
   - O resto (peças, opacidade, paradas do degradê, sem exceções) fica como você fez.
   - Rode e registre: o D1 tem de reaparecer.
2. **Teste de unidade do invariante,** antes de corrigir: para os 25 temas, nos dois modos, o design que o Provider monta com
   `defaultColorMode` é igual a `composeThemeForMode(tema, modo)` nos tokens de cor do cromo e do texto.
   - O teste falha antes, nos pares do modo oposto.
   - Corrija a causa no caminho de modo (§3.1). O alvo é o resultado do `composeThemeForMode`. Não recolora o tema.
3. **Corrija o cargo do topo** em `SarakShellUserWidget.tsx:107`.
4. **O que sobrar com o modo nativo é dado do tema** e se corrige no arquivo do tema. Isso inclui o idioma, o nome e a engrenagem do
   topo, e o cargo da lateral clara.
   - Se o valor vem da paleta calculada, declarar no tema a cor que vence a paleta é dado do tema, e cabe na §3.1.
   - O que a §3.2 deixa fora é mudar o motor da paleta.
5. **Degradê (passo 2):** troque a lista `GRADIENT_THEMES` pelos 25 temas.
   - Em cada cena, o degradê se liga por `sidebarBackgroundStyle`/`topbarBackgroundStyle: 'gradient'` junto com o tom, nas duas
     barras.
   - O `measureInBrowser` só lança "Barra sem degradê" se o token estiver ligado e a barra não desenhar o degradê. Isso é defeito, e
     não exceção.
6. **Ordem:** comece depois do commit do lote da `plan-178`. Ela mexeu em `overlayPreferences.ts`, que agora entra na sua §3.1.
   - A `plan-178` continua em paralelo, em outros arquivos.
   - **Proibidos:** os arquivos da `plan-178` listados na §3.2.
7. **Verificação:** a do passo 7, mais o teste do invariante no filtro do vitest.
