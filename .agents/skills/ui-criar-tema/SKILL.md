---
name: ui-criar-tema
description: Orienta a criação e revisão de temas completos (SarakThemePreset) para a Sarak UI Core. Use ao configurar esquemas globais de cores e atmosferas. NÃO acione proativamente.
---

# Skill: Criar Tema Master

Orquestra a autoria orientada a dados de temas completos (`SarakThemePreset`) para o ecossistema Sarak UI.

> **Esta skill ORQUESTRA; ela não define regra.** A spec dona é
> `specs/specs/09-temas-e-presets.md`; o fluxo passo a passo está em
> `sarak-dev/GUIA-MANUTENCAO.md` §4. Quando esta skill divergir de uma spec, **a spec vence**.

> ⚠️ **Criar tema é CONFIGURAÇÃO, não Expansão.** Um tema **só consome** chaves que já existem no
> dicionário; ele **nunca** inventa token. Se a chave que você quer não existe, isso é outra
> tarefa (`ui-novo-componente`) e outra decisão.

## Quando usar
- Quando o usuário desejar criar um esquema visual global (light/dark, brand colors, atmosfera).
- Use APENAS quando o usuário solicitar explicitamente. NÃO acione proativamente.

## Workflow

### 1. Coleta de Parâmetros (HITL)
Pergunte as definições base: nome/id do tema, identidade visual, modo nativo e atmosfera pretendida.
`navigationStyle` é funcional: deixe a decisão para a configuração do consumidor ou para a preferência do usuário.

### 2. Parta de uma referência completa, nunca do zero
Consulte `getScaffold()` em `src/core/Design/master-map.ts` para ver os valores padrão vivos e compare os eixos com um tema
embarcado completo. Copie a estrutura de uma referência, como `sarak-sovereign.ts`, e adapte a direção visual. Não copie
para o novo tema chaves funcionais: declare os eixos estéticos e autorize uma `contraparte` parcial para o modo oposto.
O tipo do tema é `SarakThemePreset`; a fronteira de temas carregados sob demanda continua em `index.ts`, `all.ts` e `loaders.ts`.

**A regra que mais economiza tempo:** parta de um **tema de referência completo** e customize
poucos valores. Um consumidor real montou um tema só com COR e concluiu que "fonte e cromo não
mudam" — os eixos de completude existem para pegar isso.

### 3. Preenchimento
Preencha o `design` **só com ids que existem no dicionário**. Chave inventada é descartada por
`validateDesign` com `console.warn` e nunca chega ao CSS: o tema *parece* completo e não é.

### 4. Registro
Copiar uma referência **não** registra o tema. Exporte e registre o tema em
`src/core/Design/presets/themes/` — o id em `index.ts` (`SARAK_THEME_PRESET_IDS`), a linha em `all.ts`
(a lista inteira, só para ferramenta) e o `import()` em `loaders.ts` (como o tema chega sob demanda), depois
`npm run themes:catalog` (o catálogo leve é gerado). **Nunca importe o tema no `index.ts`/barril:** ele
voltaria ao boot de todo consumidor — a trava `theme-boot:check` falha.

### 5. Verificação — completude E contraste

```bash
npm run audit           # inclui auditor_presets (CHAVE ÓRFÃ) e auditor_contraste (R31, WCAG AA)
npx vitest run          # a suíte INTEIRA (a varredura de hover do SarakMenuItem roda aqui)
npm run themes:diversity                  # o quadro de diversidade do catálogo
npm run build && npm run themes:showcase  # a vitrine — ver abaixo
```

**A vitrine** (`npm run themes:showcase`, precisa do `dist/` — rode o `build` antes) gera uma captura por
**tema × modo × orientação** em `browser-tests/showcase-output/` (fora do versionamento) e um
`index.html` que reúne todas lado a lado. Cada captura mostra o cromo com um item ativo e outro em hover,
mais card e tabela com dados, botões, campos, tipografia e o `SarakBadge` em todas as variantes. **Olhe o
badge `muted` de todo tema de borda forte** — a captura é o que pega texto ilegível que o gate de contraste
não mede. A vitrine mede o `dist/` direto, sem passar pelo consumidor (e pelas duas camadas de cache de
`specs/specs/13-instalacao-e-atualizacao.md` §9.1).

**A varredura de hover** (`SarakMenuItem.test.tsx`) mede, em todo tema shippado, o **fundo** de hover
(`sidebarHoverColor`/`topbarHoverColor`) contra o fundo da barra, nas duas orientações e nos dois modos
(o nativo e o oposto, com a contraparte aplicada), por distância perceptual. Ela mede **só o fundo**: o
texto do item troca de cor no hover em todo tema, então contá-lo deixaria passar um hover `transparent`.
Tema sem hover perceptível reprova nomeando o tema e a orientação.

Para medir **completude** (quais eixos o tema deixou vazios), use o utilitário público
`findMissingThemeAxes` / `warnOnIncompleteTheme` (`src/core/Design/utils/themeAxes.ts`). Ele
**avisa e devolve a lista; não lança** — a lib não força completude, ela só impede que a
incompletude seja silenciosa (R33).

Para medir **contraste** — o `npm run audit` acima já cobra, mas para saber **qual token corrigir**
antes de rodar a auditoria completa, use o solucionador:

```bash
npx tsx .agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts <id-do-tema> [--contraparte]
```

Ele mede os pares reais com o mesmo gate (`gates/scripts/audit/verify_contrast.ts`), e onde reprovar,
ajusta **só a luminosidade** do token de texto — matiz e saturação saem intactos. Devolve um relatório
(par, valor antes/depois, razão, delta): **cole esse relatório** ao registrar o tema — é o que transforma
a correção numa proposta revisável, não um fato consumado. Um par que o relatório marcar como "não
resolvido" exige uma decisão sua (ver `references/liberdade-e-restricao.md` §1).

**O que o solucionador resolve e o que não:** mede o design do tema sobre os padrões do dicionário (com `--contraparte`, o
modo oposto) e só desloca a luminosidade do texto que reprova; fundo, matiz e saturação ficam. **Não** atravessa cadeia
`var()` (par pulado) nem mede contraste não textual (borda, foco, interruptor), que se calcula à parte, com valor concreto.

Compare o `npm run audit` com o **baseline** de `specs/specs/01-gates-e-baseline.md`, nunca com zero.

### 5.5. Contraparte de modo (obrigatória para tema NOVO)
O modo é **preferência do usuário** (`specs/specs/09-temas-e-presets.md` §4.7): o tema é escrito para um modo,
e quem pede o oposto recebe a `contraparte`. Sem ela, recebe o fallback sintetizado — que satura e **não
volta ao original** numa ida e volta (`specs/specs/09-temas-e-presets.md` §2.1). Escreva
`contraparte: { ... }` no `SarakThemePreset` — bloco parcial com só os tokens de fundo/texto/borda que mudam para
o modo oposto (ver `references/liberdade-e-restricao.md` §5). `auditor_contraste` **exige** a contraparte de
**todo** tema shippado — a lista de isenção terminou vazia. **Sobreponha o fundo do modal
(`colorBgModal`) e o de toda superfície** que o modo oposto inverte: o que a contraparte não declara fica
com o valor do modo nativo, e texto claro sobre um modal que ficou claro é o defeito mais comum.

### 5.6. Eixos do tema que você precisa conferir

- **Realce do item de navegação.** O fundo do item ativo (`sidebarActiveColor`/`topbarActiveColor`) e o do
  item sob o ponteiro (`sidebarHoverColor`/`topbarHoverColor`) **nascem `transparent`**; o texto do item
  ativo é `navItemActiveColor`. Sem preencher os de hover, o tema fica sem fundo de hover na navegação — o
  realce passa a ser só de texto. Os papéis estão em `specs/specs/05-cromo-e-slots.md` §2.4.
- **Idiomas.** `enabledLanguages` com os seis idiomas que a lib oferece (`pt`, `en`, `es`, `fr`, `de`,
  `it`). É chave do payload, fora do gabarito visual — o `auditor_presets` a conhece pela lista de chaves
  extras do payload, então não a acusa como órfã.
- **Valor enumerado.** Token de `select` só aceita as opções do schema (`bodySize` é `12/14/16/18/20px`;
  `cardHoverStyle` tem três opções). Valor fora da lista é descartado em runtime com aviso — a suíte acusa
  (`tokenContractParity`).
- **Fonte por valor exato da lista.** `headingFont`, `bodyFont`, `monoFont` e `identityFontFamily` recebem o
  `value` de uma entrada de `THEME_FONTS` (`src/core/Design/schema/typography.ts`) **byte a byte** — `"'Lora', serif"`,
  não `'Lora'` nem `"Lora, serif"`. O carregador embarcado só reconhece o valor exato: outra grafia passa na validação
  (é pilha de fontes segura), mas nenhum arquivo é carregado e a tela mostra a genérica. A lista, com a `category` de
  cada família (`Sans-Serif`, `Display`, `Serif`, `Handwriting`, `Monospace`), é o próprio `THEME_FONTS` — não a
  copie para o tema nem para documento. Na 8.0.0 entraram 22 famílias, entre elas as que a direção de arte dos temas
  cyber e retrô pedia: Orbitron e VT323 (`Display`), Chakra Petch (`Sans-Serif`), Fira Code (`Monospace`).
- **Peso que a família tem.** Das variáveis entra só o eixo `wght`; das estáticas, só os pesos com arquivo, e o
  navegador sintetiza o resto. Escolha `h1Weight`, `bodyWeight` e afins entre os pesos da família — o manifesto
  (`src/core/Provider/generated/font-manifest.ts`) diz quais são (VT323, Patrick Hand e Bebas Neue têm só 400; Space
  Mono, 400 e 700).
- **Mídia de fundo.** Tema shippado **nunca** aponta `globalBackgroundImageUrl` para servidor de terceiro:
  use as atmosferas geradas pela lib ou deixe vazio (`specs/specs/09-temas-e-presets.md` §5.1).
- **Posição das preferências do usuário** (`preference*Position`). São funcionais e pertencem à configuração da
  instalação, não ao tema embarcado. Quem decide o que a barra oferece é o administrador de cada instalação.

### 5.7. Ordem de trabalho e lições medidas (temas refeitos, plan-110)

**Ordem:** (1) modo principal completo; (2) `contraparte` só com o que carrega modo (`kind: aesthetic` e `modeDependent`;
`mode` entra, geometria, tipografia e movimento não — a trava acusa `contraparte-declares-fixed-aesthetic`);
(3) `theme-completeness:check` e `auditor_contraste` nos dois modos; (4) captura da vitrine nos dois modos, desktop e
celular; (5) só então comentários e nota de conceito. Tirar o tema de `gates/allowlists/themeCompletenessPending.json` é o
último passo, e a trava reclama da exceção obsoleta se esquecer.

- **Valor concreto onde o contraste é medido.** O medidor não atravessa `var()`: `colorBgModal`, `colorBgLayer2` e
  afins vão como cor. Os derivados (`rangeActiveColor`, `tooltip*`, `inputIconColor`, `aiGlowColor`,
  `cardActionBtnPrimaryBg`, `cardSearchPlaceholderColor`) repetem a cadeia, para quem troca só a primária levar o derivado. A reserva de
  uma cadeia repetida (`var(--x, F)`) é o **padrão do token `x`** no schema, nunca o valor do tema: o `variable-contract:check`
  (Anel 1, fora do nível `themes` do `verify`) acusa a reserva que difere, e `fix-fallbacks.ts` a reescreve.
- **Token responsivo mantém `{ mob, tab, desk }`** (raios, espaços, tamanhos), mesmo quando os três valem o mesmo.
- **`identityFontFamily` é valor de `THEME_FONTS`**, como as outras fontes; escolha o peso entre os que a família tem.
- **A grade do `step` vale no tema:** `sidebarNoiseOpacity`, `topbarNoiseOpacity`, `cardSpotlightOpacity` andam de 0,05
  em 0,05; `tokenContractParity` reprova 0,04 e 0,14.
- **Leia contraste na tela só depois das transições de hidratação:** o corpo entra por `CSSTransition` e, no meio dela,
  `background-color` lê transparente.
- **Estilo de botão decide quais tokens desenham.** `cyberpunk` é wireframe (fundo transparente, texto na cor da
  variante): `btnNeonPulseSpeed` não desenha (só o `neon` pulsa) e `SarakIconButton` primário fica com `btnPrimaryText`
  escuro sobre o vazio, ou seja, ícone invisível; `SarakButton` já corrige isso, o botão de ícone não.
- **`cardGeometricCut` recorta a borda diagonal e a sombra** (clip-path): o cartão cortado perde o traço na quina; o
  brilho vem de `cardInnerGlow*` e do halo no hover, não da sombra.
- **`texture` e `cardTextureType` não carregam modo:** a contraparte não troca a textura, então escolha uma que pinte com
  `currentColor` ou `--theme-texture-color` (`circuit-pro`, `scanlines`, `micro-dots`). `cyber-binary` pinta com a
  primária, não em branco fixo, e a opacidade é fixa (0,05): não responde a `textureOpacity`.
- **O fundo do cromo e do `main` é opaco e cobre a textura da página:** textura de `texture` quase não aparece em tela
  cheia; o que carrega a identidade é a de cartão.
- **Opção que o token não tem:** `cardTitleFontWeight` não tem `800` (use `900`); `h1Weight` tem.
- **Cor de sucesso vizinha da primária** (tema verde): desloque o matiz (menta-azulado) para o selo não se confundir
  com a marca; o selo tem forma, mas a cor ainda comunica primeiro.
- **Contraste não textual** (apoio, 3:1): calcule borda de campo e de cartão **compostas sobre o corpo**; borda
  translúcida não passa por `resolveChain`.
- **Cor de marca também pode virar texto.** `primaryColor` e `navItemActiveColor` aparecem como tinta em partes do
  cromo; confirme legibilidade nos dois modos. O preenchimento do botão primário é `btnPrimaryBg`, não `primaryColor`.
- **Textura fixa exige uma escolha para os dois modos.** `texture` e `cardTextureType` não mudam com a contraparte;
  `carbon` é preto fixo, então use no escuro ou com `textureOpacity` baixa no claro. Texturas animadas podem aumentar
  a área rolável; mantenha animação em elementos locais, não no fundo da página.
- **Arte de fundo precisa sobreviver ao recorte.** `globalBackgroundImageUrl` cobre a camada e pode recortar a arte em
  proporções diferentes; desenhe SVG com composição central e valide a tela inteira, inclusive conteúdo que rola.
- **O gráfico deriva as séries.** `chartColorPalette` ancora a primeira cor e o motor deriva as seguintes das cores de
  marca; não espere uma cópia das cores de status. Confira o resultado renderizado e a legibilidade das séries.
- **O tipo do gráfico vem do tema quando a prop é omitida.** Na vitrine e em exemplos de catálogo, não fixe `type` em
  `SarakChartEngine`; deixe `chartType` demonstrar a escolha do tema.
- **Seleções e faixas vêm do schema vivo.** Leia `options`, limites e `step`; nomes plausíveis como `paper` ou `solid`
  podem não pertencer a um token. Para um tema de alto contraste, confira todos os pares do `PAIRS` atual no alvo 7:1.
- **Fonte de tema é valor exato e local.** Use o `value` de `THEME_FONTS` e os pesos existentes no manifesto; no
  padrão `bundled`, a lib carrega as famílias necessárias de `dist/fonts`. `'google'` é uma origem opcional, não uma
  exigência para a tipografia funcionar.

### 6. Confirmação
Comunique que o tema está registrado, quantos eixos ficaram vazios (se algum) e o resultado do
`auditor_presets`.

## Regras
- **NÃO** invente token: um tema só consome o que o dicionário já tem.
- **NÃO** misture a lógica de Tema Master com presets parciais de componente — o tema é a fundação.
- **Tipagem correta importa:** `borderRadius: '16px'` onde o token é `number` quebra a compilação
  e o valor é descartado em runtime.
- Tema **parcial é legítimo** — mas a lacuna tem de ser deliberada, não acidente. Meça com
  `findMissingThemeAxes` antes de declarar pronto.

## Checklist
- [ ] O tema partiu de uma referência completa, e os eixos vivos foram conferidos com `getScaffold()`?
- [ ] Todas as chaves do `design` existem no dicionário (zero chave inventada)?
- [ ] Os tipos batem com o `token.type` (number × string, enum válido)?
- [ ] Toda fonte é o `value` exato de `THEME_FONTS`, e os pesos escolhidos existem na família (manifesto)?
- [ ] O tema foi registrado em `presets/themes/` (`index.ts` ids, `all.ts`, `loaders.ts`) e o catálogo regenerado (`npm run themes:catalog`)?
- [ ] `auditor_presets` sem chave órfã e suíte inteira verde?
- [ ] A completude foi medida com `findMissingThemeAxes`, e as lacunas são deliberadas?
- [ ] O solucionador rodou e o relatório foi colado? Todo par "não resolvido" tem decisão registrada?
- [ ] `npm run audit` fecha sem regressão no auditor de contraste (R31)?
- [ ] Tema NOVO: `contraparte` foi autorada (bloco parcial) e o gate deixou de acusar isenção faltando?
- [ ] Hover do item de navegação preenchido nas duas orientações, e a varredura de hover verde nos dois
      modos? Nenhuma mídia de terceiro? Posições de preferência no padrão de fábrica? `enabledLanguages` com
      os seis idiomas?
- [ ] `npm run theme-completeness:check` verde e o tema fora da lista de exceção?
- [ ] A vitrine (`npm run build && npm run themes:showcase`) foi gerada e o tema foi olhado nos dois modos e
      nas duas orientações, badge `muted` inclusive?
- [ ] Tema NOVO: `npm run themes:diversity -- --new <id,...>` passa nos critérios estéticos contra o catálogo?

## Referências (Camada 3)

**Ferramenta — esta skill invoca:**
- `.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts` — o solucionador. Mede
  contraste com o gate da R31 e corrige **só a luminosidade** do texto que reprovar, preservando matiz e
  saturação. Devolve tema + relatório; **não escreve arquivo sozinho** — você aplica o valor corrigido.
- `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md` — o mapa de onde há restrição
  (os pares de contraste) e onde não há nenhuma (tudo o mais). Leia antes de preencher cor de texto.

**Validador — o GATE invoca, não você:**
- `gates/scripts/audit/verify_contrast.ts` (`auditor_contraste.mjs`) — **tem gate**, dentro de
  `npm run audit` (R31). Mede os pares reais texto/fundo a 4,5:1 em cada tema embarcado (nativo E o
  modo oposto, via `resolveThemeForMode`); é o que o solucionador (acima) consulta para saber o que
  corrigir. Também **exige `contraparte`** fora da lista de isenção (`CONTRAPARTE_EXEMPTION_LIST`).
- `src/core/Design/presets/themes/color-engine.ts` (`resolveThemeForMode`) — a função que decide o que
  aplicar ao trocar de tema/modo: nativo → `design`; oposto com `contraparte` → o bloco autorado; oposto
  sem `contraparte` → `syncThemeWithMode` (fallback dos legados). Todo caminho de aplicar tema passa por ela.
- `gates/scripts/audit/verify_theme_parity.ts` — valida UM tema. **Reprova**
  chave que não existe no dicionário; **avisa** (sem reprovar) quando o tema é parcial. A
  assimetria é deliberada: **tema novo nasce com os eixos estéticos completos**, mas tema que já
  existe é parcial de propósito e continua funcionando — as chaves ausentes caem no default do
  schema. Reprovar por ausência quebraria todo tema antigo a cada token novo.

> ⚠️ **Este validador ainda NÃO tem gate** — hoje nenhum pipeline o invoca. Ele está registrado
> para entrar no pipeline de CI/CD em `specs/specs/00-regras-e-invariantes.md` §3.1. Até lá, a
> cobertura de tema que **existe** é o `auditor_presets` dentro do `npm run audit`, que cobra
> chave órfã em todos os temas embarcados de uma vez.

- `.agents/skills/ui-criar-tema/references/examples.md` — estrutura de um `ThemePreset` (bom × ruim).
