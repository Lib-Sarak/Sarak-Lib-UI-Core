---
tipo: "adr"
titulo: "O design gravado guarda só o que foi escolhido — o que a paleta calcula é recalculado ao carregar"
status: "🟡 Proposto"
tags: ["adr", "persistencia", "paleta", "design-engine", "painel", "dado-gravado"]
relacionados: ["[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[02-design-engine]]", "[[024-paleta-calculada-separada-do-tema]]", "[[009-persistencia-tenant-aware]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[022-tema-sob-demanda]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "A — o gravado guarda só as escolhas (tema, paleta, tons, modo e os tokens que o administrador ajustou); tudo que a paleta calcula é refeito ao carregar (RECOMENDADA)"
    custo: "Muda o formato que o importador recebe em `onSave` e devolve em `onLoad` (objeto esparso, com o marcador de formato fora do dicionário — terceiro parâmetro de `onSave` e campo de `onLoad` —, e MAJOR pela 03); o `onLoad` passa a substituir, não fundir, o que vem do cache; o primeiro quadro precisa de um segundo registro local para não esperar o tema sob demanda; o dado antigo perde, uma vez, o ajuste manual de cor de papel que não se distingue de resto de tema (variante L1 abaixo)."
  - opcao: "B — grava tudo como hoje, e cada valor leva a origem (calculado × escolhido) ao lado; o calculado é refeito quando a escolha muda"
    custo: "O importador passa a guardar e devolver um segundo dado por chave; quem guardar só o design (o que todo importador faz hoje, e o que a documentação sempre mostrou) volta a transformar o calculado em escolhido sem aviso — o defeito reaparece pela omissão de quem integra. O payload cresce em ~400 chaves de origem. O dado antigo não tem origem e cai na mesma heurística da A."
  - opcao: "C — não muda o formato; ao trocar tema, paleta ou tom, a lib refaz toda chave de papel de cor cujo valor ainda é igual ao que a paleta ANTERIOR calcularia (a regra que `applyCalculatedPaletteMode` já tem para o modo)"
    custo: "Zero mudança para o importador, mas: o valor gravado continua sendo cópia do cálculo, então uma melhoria na régua de cor da lib nunca chega a quem já gravou; resto de outro tema (o preto do High Contrast sob outra paleta) não é igual a cálculo nenhum e fica para sempre; a identificação depende de recalcular a paleta anterior, que o design gravado já não diz qual foi quando o cache e o servidor divergem."
---

# 1. Contexto e Problema

**Decisão proposta em 2026-11-11, a partir da medição de 2026-11-10 no ERP** (lib `v8.0.0`, navegador headless a
1440×900, aplicando pelo painel). Três sintomas — "a paleta invertida não se aplica", "claro/escuro às vezes erra",
"o tom da barra não se aplica" — têm uma causa comum, em três partes, todas reproduzidas:

1. **A troca de tema herda.** Aplicar `High Contrast` e depois `Sarak Sovereign` deixou gravadas as oito cores de
   superfície do High Contrast (`#000000`); o design do ERP diferia do Sovereign recém-composto em 51 chaves, 15 delas
   iguais às do High Contrast, com `colorPalette: ciano-violeta`.
2. **O `Aplicar` grava o cálculo como se fosse escolha.** `useDesignDraft.ts:34-48` completa o rascunho com todos os
   tokens do schema e herda do sistema as cores que a paleta calculou; `:208-218` grava esse rascunho inteiro
   (`applyFullConfigRaw(draft)` e `persistDesign(draft)`). A partir daí `sidebarColor` e `topbarColor` são cor
   *declarada*, e declarada vence o tom ([[09-temas-e-presets]] §4.3.4): 8 de 8 presets de Topbar e todos os de Sidebar
   mudaram estrutura e nenhum mudou o fundo.
3. **O cache mantém o resto.** Os três pontos que leem o gravado fundem por cima do que já existe:
   `useDesignManager.ts:103` (`{ ...semente, ...cache }`), `useDesignSync.ts:101` (`{ ...prev, ...cache }`) e
   `useDesignRemoteLoader.ts:106` (`{ ...previous, ...remoto }`). Chave ausente no remoto não apaga a do cache
   ([[09-temas-e-presets]] §4.4.1); tirar as cores do servidor não mudou nada até apagar `sarak-ui-design-v9.0`.

**O que a leitura do código NÃO fecha sozinha:** a troca de tema em memória não herda — `compose.ts:52` parte do padrão
do schema e `useDesignDraft.ts:198` o usa quando há `themeId`. O resto do High Contrast entrou por outro caminho: um dos
três merges acima, ou o ramo parcial do mesmo `:198` (`{ ...base, ...presetDesign }`, sem `themeId`). Qual deles é o da
medição fica para o teste que reprova antes da correção; nenhuma das alternativas abaixo depende da resposta.

**Com o dado limpo o motor funciona:** `resolvePaletteForDesign` devolve `#061011` (neutro), `#1d1432` (superfície),
`#00383c` (primária) e `#ddeced` (invertida) para `ciano-violeta` escuro; o fundo seguiu a Invertida e o modo claro
trocou 3 de 3 vezes (~80 ms) e persistiu. O defeito está no que se grava, não no cálculo.

**Dado já gravado é problema da lib, não do importador** ([[00-contexto]] §8): os importadores têm designs gravados com
cores calculadas e restos de temas anteriores, e a correção não pode pedir a ninguém que limpe banco ou `localStorage`.

# 2. Decisão

**Adota-se a alternativa A.** O design que a lib entrega a `onSave` e grava no cache contém o que foi **escolhido**; o
que a paleta **calcula** nunca é gravado e é recalculado a cada carga.

## 2.1 O formato

O **dicionário** que `onSave` recebe é só as escolhas — nenhuma chave nova dentro dele: "o payload é o dicionário de
tokens e nada mais" ([[09-temas-e-presets]] §4.4.2), e importador com lista de chaves no servidor recusa chave que
desconhece. O **marcador de formato** (`2`) viaja fora do dicionário, pelo mesmo caminho do id do tema: terceiro
parâmetro de `onSave` (`onSave(design, activeThemeId, format)`) e campo do objeto que `onLoad` já pode devolver
(`{ design, activeThemeId, format }`). O cache local guarda o marcador ao lado do registro esparso (§2.3), nunca dentro
dele. "Escolha" é a chave cujo valor **difere do que o motor produziria sem ela**, em dois passos:

1. *Condutores:* `colorPalette`, `sidebarTone`, `topbarTone` e `mode` entram se diferem do tema resolvido. São eles que
   decidem o cálculo, então são fixados primeiro.
2. *Baseline:* `composeThemeDesign(resolveThemeForMode(tema do id, modo), preservadas, config do host)` com os
   condutores do passo 1. Toda chave do design que difere do baseline é escolha — inclusive a cor ajustada à mão.

Cor declarada pelo tema ou pelo host continua vencendo a calculada ([[09-temas-e-presets]] §4.3.4): ela está no
baseline, logo não se grava. O que deixa de vencer é a cor que a própria lib calculou.

**A paleta escolhida pelo usuário vence a cor que o tema declara, e sobrevive a recarregar.** Hoje, escolher uma paleta no
painel grava `colorPalette` e as cores calculadas por cima das que o tema declara (`src/features/DesignEngine/Main/hooks/usePaletteSelection.ts:38-39`, que aplica o patch de `buildPaletteDraftPatch`). Pela
regra acima essas cores, iguais ao cálculo, não seriam gravadas, e o baseline devolveria a cor do tema ao recarregar. Por
isso o passo 2 tem uma regra a mais: quando o condutor `colorPalette` **difere** do que o tema declara — ou seja, é uma
escolha —, o baseline usa as cores **calculadas pela paleta escolhida** para todo papel que ela calcula, no lugar das que o
tema **e o host** declaram; o que o tema declara de cor e a paleta **não** calcula, e todo o resto do tema, fica como está. O gravado é
só `colorPalette` (uma chave, no dicionário e sem as cores calculadas); a cor que o usuário ajustou depois, à mão, difere
desse baseline e é gravada como escolha. Quando o `colorPalette` é o do próprio tema, não há escolha e vale a regra de
[[09-temas-e-presets]] §4.3.4 (o tema vence). **O cálculo é o do painel, não o da composição:** o baseline calcula a paleta escolhida com a mesma
entrada que o painel usa — o valor, o modo e os tons da barra, como em `resolveDraftPalette`
(`src/features/DesignEngine/Main/utils/paletteDraft.ts:81-84`) —, e **não** com a correção contra o que o tema e o host
declaram (`src/core/Design/palette/resolve.ts:60-61`). Só assim as cores que o painel gravou no rascunho são iguais ao
baseline e deixam de ser gravadas; com o outro cálculo elas difeririam e voltariam a ser gravadas como escolha, que é o
que a decisão A existe para impedir. **O lote 1 traz um teste de ida e volta:** escolher a paleta → gravar → recarregar →
o mesmo design, e nada gravado além de `colorPalette`. O tom da barra não ganha regra nova: `sidebarColor` ou `topbarColor` declarados pelo tema seguem vencendo o tom ([[09-temas-e-presets]] §4.3.4). A
composição precisa aceitar a paleta escolhida como condutor que vence o tema nas cores que ela calcula; isso é detalhe do
lote que implementa. **O que este ADR não decide:** se a paleta escolhida também vence o tema nas trocas seguintes de tema
(o "manter minha paleta" do sistema) — é decisão do ADR-027. Aqui só se garante que a escolha, uma vez aplicada, é
gravada e volta igual depois de recarregar. Um ajuste manual idêntico ao
cálculo corrente não é gravado e passa a seguir a paleta — aceito, porque é o comportamento que o administrador espera
de "não mexi nisto".

**O design em memória não muda.** `useSarakUI().design`, o rascunho e o painel continuam lendo o design completo; só o
artefato de persistência (`onSave`, `onLoad`, cache) é esparso.

## 2.2 O que acontece ao carregar

- **Com `format: 2` (devolvido pelo `onLoad`, ou lido do registro local):** `design = baseline(id, condutores) + escolhas`. O `onLoad` **substitui** o que veio do cache
  em vez de fundir por cima — para este formato a regra de [[09-temas-e-presets]] §4.4.1 (`{ ...local, ...remoto }`) deixa de valer, porque é ela
  que impede um valor removido de sair de circulação. `local` e `remote` seguem como hoje.
- **Sem marcador (dado antigo, ou importador que guarda só o primeiro argumento de `onSave`):** a lib corrige ao carregar, sem pedir nada ao importador, e **não grava na hora** (a
  hidratação não chama `onSave`, [[09-temas-e-presets]] §4.4.2): o resultado vale para a tela e vira gravado no próximo `Aplicar`.
  Regra **L1** — do dado antigo saem todas as chaves que a paleta calcula (as de `PALETTE_ROLE_MAP` e as derivadas do
  tom) que o tema do id e o `config` do host não declaram; o resto do design é preservado. Isso remove, de uma vez, as
  cores calculadas gravadas e o resto de tema anterior (as 51 chaves do caso medido). **Custo assumido:** um ajuste
  manual de cor de papel no dado antigo é indistinguível de resto de tema (o preto do High Contrast sob outra paleta não
  difere, na forma, de um preto escolhido) e se perde uma vez. A variante que reconheceria o resto comparando com o que
  os 18 temas embarcados declaram (**L2**) exige carregar todos eles no boot do dado antigo e ainda erra o ajuste manual
  que coincide com um valor de tema; foi recusada.
- **Sem tema resolvível** (id ausente, ou tema do importador fora de `allThemes` no instante de gravar): grava o design
  completo, sem marcador — o formato de hoje. Nunca se descarta valor por não saber de onde ele veio.

## 2.3 Boot e o cache local

O cache local mantém, na chave de hoje, o design **completo** — é ele que pinta o primeiro quadro sem esperar o tema sob
demanda ([[022-tema-sob-demanda]], [[09-temas-e-presets]] §4.3.2). Ao lado, `<chave efetiva>::choices` guarda o
registro esparso, que é a fonte da verdade quando existe. Com o tema em memória, a lib recompõe pelo registro; só se o
resultado difere do completo já pintado, há um segundo commit; se não difere, nada muda na tela. Sincronização entre abas continua escutando a chave de hoje.

**Custo no boot:** a conta é a mesma que `useThemeSeed.ts:113` já faz (`resolvePaletteForDesign`); passa a rodar também
ao receber o `onLoad` e a cada `Aplicar` (para o diff). **Não foi medido** — o lote que implementa mede e registra.

# 3. Consequências

- **Positivas:**
  - A causa das três partes some por construção: o gravado não contém cálculo (parte 2), a troca de tema não deixa
    resto porque resto de outro tema difere do baseline e só sobrevive se for escolha (parte 1), e o remoto substitui em
    vez de fundir (parte 3).
  - Melhoria na régua de cor da lib chega a quem já gravou, o que a C nunca entrega e a regra "valor persistido vence
    default" ([[09-temas-e-presets]] §4.4.3) impedia para cor.
  - Trocar paleta, tom ou modo depois de qualquer número de aplicações muda a tela, porque a tela é sempre
    `baseline + escolhas`.
  - O ajuste granular continua vencendo a paleta ([[06-painel-de-customizacao-e-preview]] §2.4): é uma escolha gravada.
- **Negativas (Trade-offs):**
  - **Host que declara cor + usuário que escolhe paleta: a paleta vence, e volta igual ao recarregar.** É o que o painel faz
    hoje (o patch da paleta não consulta o `config` do host); o ADR o mantém e o torna durável. Quem declara `primaryColor`
    no host passa a ver, nos papéis que a paleta escolhida calcula, a cor dela e não a do host depois de `Aplicar`. Inverter
    (o host vencendo) mudaria o painel e é decisão do dono, não deste ADR.
  - **Formato novo no contrato com o importador, e é MAJOR** ([[03-versionamento-e-release]] §3: quebra de quem integra,
    inclusive por comportamento, sem que nenhum export mude). O dicionário de `onSave`/`onLoad` passa a ser esparso, e o
    marcador `format` é um parâmetro/campo novo. Quem quebra: o importador que valida o gravado exigindo todas as chaves;
    o que lê o design gravado fora da lib (o CSS de primeiro quadro de `sarakCreateThemeBootCss(design)`, [[09-temas-e-presets]] §4.4.2, ou um
    render no servidor), que passa a receber só escolhas; e o que guarda só o primeiro argumento de `onSave` — recebe o
    esparso de volta sem marcador, a lib o lê como dado antigo e a regra L1 descarta, a cada carga, o ajuste manual de cor
    de papel (degrada para "a paleta manda"; nenhum dado é corrompido). O importador que hoje guarda o design completo e o
    devolve continua funcionando, pelo caminho do dado antigo. Exige entrada ancorada `## X.0.0 — ` em `docs/migracoes.md`
    (`migration-anchor:check`), que `minor-no-removal:check` não substitui por não ver comportamento. O schema publicado
    do dado gravado, e se exige todas as chaves, é conferência do lote de implementação.
  - **Mudança de regra em [[09-temas-e-presets]] §4.4.1** para o formato 2 (substituir em vez de fundir) e **dois registros locais**.
  - **Perda única, no dado antigo, do ajuste manual de cor de papel** (L1). Quem a sente refaz o ajuste uma vez e ele
    passa a ser gravado como escolha.
  - **Recalcula-se mais:** o diff no `Aplicar` e a recomposição no `onLoad`; sem medida ainda.
  - Voltar atrás é caro: depois que importadores gravarem `format: 2`, o formato antigo vira o legado.
- **O que fica fora e continua valendo:** a prévia do rascunho na tela real sem gravar, `Aplicar` como única porta de
  gravação e o desfazer de um nível ([[06-painel-de-customizacao-e-preview]] §4) não mudam; só o que `Aplicar` grava.
- **Síntese:** quando aprovado e implementado, §4.3.3/§4.3.4 e §4.4 de [[09-temas-e-presets]] passam a descrever o que é
  escolhido × calculado e o formato gravado; este ADR fica como o porquê.
