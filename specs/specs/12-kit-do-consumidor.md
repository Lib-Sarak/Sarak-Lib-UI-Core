---
tipo: "spec"
titulo: "Kit do consumidor — o artefato `sarak-ui/` que viaja no pacote"
dominio: "Sarak-Lib-UI-Core / Habilitação do consumidor / Documentação viva"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "consumidor", "kit", "documentacao-viva", "gate", "empacotamento", "skill"]
relacionados: ["[[13-instalacao-e-atualizacao]]", "[[14-artefatos-do-mantenedor]]", "[[01-gates-e-baseline]]", "[[00-regras-e-invariantes]]", "[[03-versionamento-e-release]]"]
---

# 1. O que é

O **kit do consumidor** é a pasta `sarak-ui/`, na **raiz do pacote**, que viaja dentro do tarball
publicado (`package.json:18`, campo `files`). O importador a encontra em
`node_modules/@sarak/lib-ui-core/sarak-ui/` no momento em que instala a biblioteca — sem baixar
nada, sem consultar site nenhum, sem depender de uma wiki que pode ter envelhecido.

Ele existe porque **instalar a lib não ensina a usá-la**. A biblioteca expõe componentes catalogados,
tokens de tema e nomes de ícone — nenhum deles é adivinhável, e a contagem corrente de cada lista vive em
`sarak-ui/VERSION`, não em prosa. O kit é a resposta a *"instalei — e agora?"*, entregue no único lugar que
não pode ficar dessincronizado da versão instalada: **dentro dela**.

## 1.1 O conteúdo

| Arquivo | Natureza | Quem escreve |
| --- | --- | --- |
| `START-HERE.md` | Prosa + **um bloco gerado** (o carimbo) | À mão, exceto o carimbo |
| `GUIA-FRONTEND.md` | Prosa + **um bloco gerado** (o Apêndice A) | À mão, exceto o apêndice |
| `skill/` | **Espelho** de `.agents/skills/ui-integra-consumidor/` | Gerado (espelhado) |
| `templates/` | Código copiável (7 arquivos) | À mão, estável |
| `catalog.json` | **100% gerado** | Gerador |
| `VERSION` | **100% gerado** | Gerador |

O gerador é `scripts/generate-consumer-kit.mjs` (`npm run guide`), e o plano de saída dele
(`scripts/consumer-kit/buildKitOutputs.mjs:47-76`) tem **6 arquivos**: `catalog.json`, `VERSION`,
`GUIA-FRONTEND.md`, `START-HERE.md` e os 2 arquivos da skill espelhada.

> ⚠️ **`templates/` NÃO está no plano de saída** — logo, não é conferido pelo `guide:check`. Ele é
> código estável, escrito à mão, e a única coisa que o cobra é o `package:check`, que exige os 7
> arquivos no tarball (`gates/scripts/contrato/check-package-contents.mjs:63-69`). É uma assimetria real e
> deliberada: template é exemplo, não lista; envelhece por semântica, não por contagem — e nenhum
> gate sabe medir isso. Está registrado aqui para ninguém supor cobertura que não existe.

# 2. O princípio central — nunca escrever à mão o que muda

> **A PROSA é estável e editada à mão. Toda LISTA é derivada do código por AST.**

Esta é a regra que define o artefato inteiro, e ela está escrita no cabeçalho do próprio gerador
(`scripts/generate-consumer-kit.mjs:9-12`).

**São prosa** (mudam quando a *forma de trabalhar* muda, não quando o código muda): a árvore de
decisão do guia (§0), a regra de fallback universal, as 4 topologias, os casos de autoria, os
templates.

**São derivadas** (mudam a cada alteração de superfície): componentes, props, tipos, tokens de
tema, CSS Variables, nomes de ícone, temas embutidos, contrato de responsividade, slots do cromo,
nomes exportados pelo barril, guias shippados em `docs/`.

## 2.1 Como as duas convivem no mesmo arquivo — os marcadores

O gerador **não reescreve o arquivo**: ele substitui apenas o miolo entre
`<!-- MARCA:INICIO -->` e `<!-- MARCA:FIM -->` (`scripts/consumer-kit/kitFiles.mjs:35-47`). Dois
marcadores estão em uso:

| Marcador | Arquivo | O que injeta |
| --- | --- | --- |
| `SARAK-KIT:APENDICE-GERADO` | `GUIA-FRONTEND.md` | O Apêndice A inteiro (`renderAppendix.mjs:121-137`) |
| `SARAK-KIT:CARIMBO` | `START-HERE.md` | O carimbo da versão (`kitFiles.mjs:72-80`) |

Marcador ausente ou invertido faz o gerador **falhar alto**, com mensagem própria
(`kitFiles.mjs:38-42`) — porque um guia sem marcador nunca poderia ser mantido em dia pelo gate,
e um kit que mente sobre estar em dia é pior que kit nenhum. Há teste para os quatro casos
(preserva prosa · idempotente · marcador ausente · marcadores invertidos —
`scripts/consumer-kit/__tests__/kitGenerator.test.mjs:10-43`).

## 2.2 Reuso, não reimplementação

O kit **não tem pipeline de AST próprio**. Ele importa o mesmo que o `npm run catalog` usa:
`scripts/catalogAst.mjs` (coletores) e `scripts/componentCatalog.mjs` (`buildCatalog()`), via
`scripts/consumer-kit/buildKitCatalog.mjs:11-12`. O monólito original
(`generate-component-catalog.mjs`, 341 linhas) foi **fatiado de propósito** para permitir esse
reuso, e a prova de que o fatiamento foi neutro é que o `catalog:check` ficou verde byte a byte
imediatamente depois.

`scripts/consumer-kit/collectKitSources.mjs` acrescenta **apenas o que o catálogo de componentes
não cobre** — e cada coletor tem uma fonte única e viva:

| Coletor | Fonte viva | `arquivo:linha` |
| --- | --- | --- |
| `collectDesignTokens` | interface `SarakDesignTokens` do arquivo GERADO do `MASTER_DESIGN_MAP` | `:26-45` |
| `collectThemePresetIds` | `THEME_PRESET_IDS` | `:48-49` |
| `collectReferenceThemeIds` | as chamadas `getThemePreset('id')` de `reference.ts` | `:52-68` |
| `collectBreakpoints` | as constantes `BREAKPOINT_*` | `:71-87` |
| `collectDeviceAwareComponents` | **uso real** de `useSarakDevice(` no código | `:134-146` |
| `collectResponsiveProps` | props cujo tipo contém `ResponsiveValue` | `:149-159` |
| `collectChromeSlots` | props opcionais de `ReactNode` do `SarakAppChrome` | `:165-171` |
| `collectBarrelExports` | `src/index.ts` | `:174-175` |
| `collectExtraPublicApi` | nomes do barril com `<Nome>Props` no código | `:184-199` |
| `collectShippedDocs` | os `.md` de `docs/`, com o **título lido do próprio arquivo** | `buildKitCatalog.mjs:26-37` |

O caso mais instrutivo é o `collectDeviceAwareComponents`: a primeira versão listava
`SarakDataTableImpl` — o arquivo que de fato chama `useSarakDevice` — e **não** `SarakDataTable`,
que é o nome que o consumidor escreve. A correção foi resolver por AST o padrão
`export const X = lazy(() => import('./Alvo'))` (`collectKitSources.mjs:107-126`). Sem ela o kit
estaria tecnicamente correto e praticamente inútil naquele item.

# 3. A regra nº 1 do consumidor — leia o catálogo, não assuma

Está no topo do `START-HERE.md` (`sarak-ui/START-HERE.md:14-28`), e o motivo é específico desta
biblioteca:

> **Nome inexistente não quebra a tela — ele silenciosamente não faz nada, que é pior.**

O sistema é resiliente por construção, e a resiliência tem um preço em observabilidade:

- **Token de tema inventado** → `validateDesign` descarta a chave com `console.warn` e o resto do
  tema é aplicado normalmente ([[00-regras-e-invariantes]] R6). A tela renderiza. Nada quebra.
- **CSS Variable inventada** → `var(--nome-que-ninguem-emite, fallback)` resolve para o fallback.
  A tela renderiza com o valor errado e **deixa de responder ao tema** — e é exatamente esse o
  sintoma da dívida `--sx-*` que a própria lib carrega ([[01-gates-e-baseline]]).
- **Nome de ícone fora do `IconMap`** → `console.warn` + ícone de alerta.
- **Componente inexistente** → aí sim quebra, em tempo de tipo. É o único dos quatro que grita.

Três dos quatro erros são **silenciosos**. Por isso a regra não é "leia a documentação": é
**leia o `catalog.json` da versão que você instalou**, que é a única fonte que não pode divergir
dela.

# 4. O gate `guide:check` — por que é impossível publicar um kit defasado

```
npm run guide         # gera (escreve os 6 arquivos)
npm run guide:check   # confere (exit 1 se qualquer um estiver defasado)
```

**Geração e conferência compartilham a mesma função.** `buildKitOutputs()` produz o
`Map<caminho, conteúdo>` e os dois modos consomem esse mesmo mapa
(`generate-consumer-kit.mjs:53-64`); o `--check` só compara o que a escrita gravaria
(`:26-40`). Não existe regra paralela de conferência — é isso que torna o gate honesto.

**Ele roda no `build`**, como 4º dos quatro gates que antecedem a compilação
(`package.json:24`). A consequência é estrutural, não conveniência:

> **É impossível publicar uma versão cujo kit não bata com a API.** O `prepublishOnly`
> (`package.json:40`) roda `build`, o `build` roda `guide:check`, e o `guide:check` derruba tudo
> se o kit estiver velho.

**Prova de que o gate morde** (registrada na execução da Spec 50): com um componente novo
temporário e o kit não regenerado, `guide:check` saiu **exit 1** apontando os 4 arquivos
defasados; o mesmo comportamento foi provado editando a skill-fonte (2 arquivos defasados).

**Baseline atual:** `[guide:check] kit em dia (6 arquivos).` — ver [[01-gates-e-baseline]].

## 4.1 A skill é espelhada, não copiada

`sarak-ui/skill/` é **espelho** de `.agents/skills/ui-integra-consumidor/`
(`buildKitOutputs.mjs:41-45`, com `SKILL_SOURCE` em `kitFiles.mjs:22`). Fonte única: a skill se
edita em `.agents/`, e o kit recebe a cópia pelo gerador.

**Corolário operacional:** editar a skill sem rodar `npm run guide` deixa o `guide:check`
vermelho. É por isso que [[14-artefatos-do-mantenedor]] e a reconciliação de skills tratam
`ui-integra-consumidor` como **arquivo gerado do lado do kit** — quem a edita à mão dentro de
`sarak-ui/skill/` perde a edição na próxima geração.

# 5. O carimbo — `VERSION` e o `kitHash`

`sarak-ui/VERSION` é gerado por `renderVersionFile` (`kitFiles.mjs:58-70`) e carrega seis campos:
`libVersion`, `kitSchemaVersion`, `kitHash`, `components`, `designTokens` e `iconNames`. Os valores mudam a
cada release — leia o arquivo gerado, não um carimbo transcrito aqui.

**`kitHash` é hash de CONTEÚDO, nunca de commit** — SHA-256 dos primeiros 12 hex do
`catalog.json` (`kitFiles.mjs:50-51`). A escolha é deliberada e o motivo é o que salva o gate de
virar ruído: um carimbo derivado do commit mudaria a **cada commit**, deixando o `guide:check`
vermelho o tempo todo, e um gate que está sempre vermelho é um gate que todo mundo aprende a
ignorar. Com hash de conteúdo, o carimbo muda **quando a superfície muda** — e só então. Há teste
para as duas metades da propriedade (`kitGenerator.test.mjs:45-51`).

**Para que o consumidor usa o carimbo.** O `START-HERE.md` manda mover duas cópias do kit para
lugares canônicos do projeto dele (§6). Essas cópias saem do alcance do gerador da lib e
envelhecem em silêncio. O `VERSION` é o que permite detectar isso: `runRefreshKit` compara o
`VERSION` do kit instalado com o da cópia local (`bin/scaffold/refreshKit/runRefreshKit.mjs:33-36`
e `:60`) e reescreve o que ficou para trás.

⚠️ **O carimbo NÃO responde "estou na versão mais nova da lib?"** — ele responde "minhas cópias
batem com o pacote que está instalado aqui?". A primeira pergunta é do `sarak-ui check`
([[13-instalacao-e-atualizacao]]).

# 6. Os 3 movimentos de instalação

Definidos em `sarak-ui/START-HERE.md:32-47` e implementados como contrato de código em
`bin/scaffold/kitTargets.mjs:10-21` — os dois **têm de concordar**, e o comentário do arquivo diz
isso por escrito (`:5-6`).

| # | O quê | De | Para |
| --- | --- | --- | --- |
| 1 | O guia de autoria | `sarak-ui/GUIA-FRONTEND.md` | `specs/sarak-ui-guia-frontend.md` do projeto |
| 2 | A skill de uso | `sarak-ui/skill/` | `.claude/skills/ui-integra-consumidor/` **e** `.agents/skills/ui-integra-consumidor/` |
| 3 | O kit inteiro | `sarak-ui/` (do `node_modules`) | `sarak-ui/` na raiz do projeto |

**São CÓPIAS, não recortes** — e a distinção é funcional, não estilística:

- a origem em `node_modules/` continua existindo e é **substituída a cada atualização da lib**;
- é ela que o `refreshKit` lê para re-sincronizar as cópias movidas
  (`runRefreshKit.mjs:38-48`);
- recortar quebraria o mecanismo inteiro: sem origem, não há com o que comparar nem de onde
  copiar.

**O refresh só toca no que JÁ existe** (`runRefreshKit.mjs:41` — `if (!fs.existsSync(target)) continue`).
Quem não moveu não recebe arquivo do nada; quem moveu não fica com um guia velho. A pasta
`sarak-ui/` da raiz é a exceção: é conteúdo 100% gerado e é **sempre** sobrescrita (`:63-64`).

## 6.1 O kit cobre ATUALIZAR, não só instalar

O quarto movimento — **atualizar uma lib já instalada** — é onde o kit mais paga por si. A instalação
falha ruidosamente quando dá errado; a atualização falha **em silêncio**: o pacote troca no disco, todo
comando responde sucesso e a tela continua com o build anterior.

Por isso o procedimento de atualização do kit cobre as **duas camadas de cache** entre o `dist/` e o
navegador — store do gerenciador e pré-bundle do bundler —, na ordem correta e com a **prova da deleção**
antes de subir o dev server. Detalhe completo em [[13-instalacao-e-atualizacao]] §9.1.

É conteúdo do kit, e não apenas desta spec, exatamente pelo princípio da §2: quem precisa da informação é o
consumidor, no momento em que ele atualiza — não alguém lendo a documentação do mantenedor depois.

# 7. Integração com o resto do ciclo

| Momento | Quem age | O que acontece com o kit |
| --- | --- | --- |
| `npx sarak-ui init` | `runInit` | Copia `sarak-ui/` para a raiz do projeto novo (movimento 3 já feito) |
| `npm run sarak:update` | `refreshKit.mjs` | Atualiza a lib e **re-sincroniza** o kit + as cópias movidas |
| `npm run build` da lib | `guide:check` | Derruba o build se o kit estiver defasado |
| publicação | `package:check` | **Exige** 12 caminhos do kit no tarball |

O `package:check` (`gates/scripts/contrato/check-package-contents.mjs:55-69`) trata a ausência do kit como falha
de publicação, com o motivo escrito no próprio código: *"o pacote sem `sarak-ui/` não ensina a
usar a lib"*. Publicar sem o kit é publicar sem instruções — e o gate cobra **ausência** com a
mesma severidade com que cobra **excesso** (ver [[03-versionamento-e-release]] e
`specs/arquitetura/05-build-e-distribuicao.md`).

# 8. Genericidade — o kit não conhece consumidor nenhum

O kit serve **qualquer** importador. As 4 topologias do guia (monolito · monorepo · monolito
modular · microsserviço) são descritas em abstrato, e nenhum consumidor real aparece por nome.

A propriedade é **travada por teste**, não por disciplina:
`kitGenerator.test.mjs:87-89` reprova se `/\bERP\b|earendel/i` casar em qualquer lugar do
catálogo gerado.

⚠️ **Nota de método herdada da execução:** a primeira tentativa de grep, sem fronteira de palavra
(`/erp/i`), deu falso-positivo em `SliderProps`, `cyberpunk` e `UserPlus`. Por isso o teste usa
`\b`. Vale para qualquer auditoria futura de vazamento de nome — sigla curta sem fronteira de
palavra não é auditoria, é ruído.

# 9. O loop de completude — o aceite ainda PENDENTE

O guia não é declarado completo por decreto. O critério de aceite do kit é **prático**:

> **O dono constrói um MÓDULO NOVO seguindo SÓ o `sarak-ui/`**, sem consultar nada fora dele.

E o mecanismo que sustenta a promessa de "qualquer necessidade" é o loop:

1. surgiu uma necessidade real durante a construção;
2. o guia não cobre e a **regra de fallback universal** (`GUIA-FRONTEND.md` §0.2) não resolve
   limpo;
3. isso é **lacuna do GUIA** → vira **seção nova no guia ou template novo**;
4. **nunca** vira gambiarra no importador (é a regra R16 de [[00-regras-e-invariantes]]).

⚠️ **ESTE ACEITE AINDA NÃO ACONTECEU.** A Spec 50 foi executada em 2026-07-26 e registrou a
validação do dono como pendente; nada desde então a executou. O kit está **entregue e cobrado por
gate**, mas **não validado por uso real**. Escrever o contrário aqui seria repetir exatamente o
defeito que motivou esta campanha.

**Um buraco já foi absorvido pelo loop**, e serve de exemplo do formato: a seção
*"2.6 Gerenciador de pacotes — a lib não escolhe o seu"* nasceu do achado de que o Golden Path da
skill dizia *"não use workspaces"* enquanto o guia documentava monorepo como topologia de
primeira classe. Duas fontes em contradição, resolvidas com uma seção nova — não com um contorno.

# 10. O achado que define o contrato — JSDoc é superfície pública

Quando o kit foi gerado pela primeira vez, ele publicou **5 JSDoc de props públicas que ainda
descreviam o motor de manifesto REMOVIDO** (ADR-002):

| Prop | Componente |
| --- | --- |
| `content` | `SarakTypography` |
| `value` | `SarakRichText` |
| `activeRoute`, `onNavigate`, `onChange` | `SarakShellNav` |

Mais o cabeçalho do próprio `SarakShellNav`, que ensinava o par `props`/`actions` do renderer
declarativo. Como o catálogo é derivado por AST e **publica o JSDoc verbatim**, o consumidor leria
instruções para usar um motor que não existe.

> **A lição, que vale como regra permanente: quando o catálogo é gerado por AST, JSDoc é
> superfície pública.** Comentário defasado deixa de ser dívida interna e vira documentação
> errada na mão do importador.

Corrigido na execução da Spec 50 — mudança **só de comentário**, 3 arquivos, 9 inserções e 16
remoções, zero linha de código. Os dois props legitimamente chamados `manifest`
(`SarakExpandableMatrix`, `SarakTreeView` — mapeamento de layout local, outro conceito) foram
deixados em paz.

# 11. Ruído conhecido do catálogo (registrado, não corrigido)

O `catalog.json` lista entradas em `components` (contagem corrente no próprio arquivo gerado), e nem todas são componentes:

| Entrada | O que é de verdade | Origem |
| --- | --- | --- |
| `DEFAULT_COLUMN_WIDTH`, `MIN_COLUMN_WIDTH` | constantes numéricas | ruído pré-existente de `collectPublicComponentNames` |
| `SarakDataTableImpl`, `SarakDataGridImpl` | implementação exportada **de propósito** para teste sem a fronteira de Suspense (`SarakDataTable/index.ts:6,13`) | exportação legítima |

`SarakDataTableImpl` aparece **também** na lista `responsive.autoAdapting`, ao lado de
`SarakDataTable` — o wrapper e o alvo. É correto (os dois nomes existem no barril) e é ruidoso
(o consumidor só precisa do primeiro).

Na mesma família: `chromeSlots` traz **9 entradas** para as **8 regiões** documentadas em
[[05-cromo-e-slots]], porque `topbarActions` — o alias legado de `topbarEnd` — também é uma prop
opcional de `ReactNode` e o coletor a captura por tipo, não por semântica. O número gerado está
certo para o critério dele; a **região** continua sendo uma só.

Nenhum dos três é corrigido aqui: são ruído de derivação, não erro de conteúdo, e mexer no
coletor durante uma campanha de documentação moveria números de gate. Rota registrada na
Campanha 2.

## 11.1 ✅ FECHADO — `designTokens.count` voltou a bater com a fonte

Chegou a publicar informação falsa ao importador: o coletor lê a interface `SarakDesignTokens`
(`collectKitSources.mjs:26-45`), gerada a partir de `src/core/Provider/generated/design-token-ids.ts`, e
esse arquivo esteve defasado porque o gerador dele não estava registrado em pipeline nenhum — o consumidor
lia no kit uma contagem de chaves válidas de `design` menor do que a real.

**Fechado pelo achado 22 em [[15-divida-conhecida]] §6 (`plan-12`):** o gerador ganhou modo `--check`
(`npm run token-types:check`), registrado no `build` e no Anel 1 do `pre-commit`, e `designTokens.count`
volta a ser conferido a cada geração do kit — o valor corrente está em `sarak-ui/VERSION`.

# 12. Fronteiras desta spec

- Ela define o **contrato do artefato**, não o conteúdo do `GUIA-FRONTEND.md` — o guia é o
  documento de autoria e vive por conta própria; duplicá-lo aqui criaria a segunda cópia que o
  kit inteiro existe para evitar.
- O fluxo de **instalação, scaffolder e atualização** é [[13-instalacao-e-atualizacao]].
- O **build e o empacotamento** são `specs/arquitetura/05-build-e-distribuicao.md`.
- O equivalente **do lado de quem EDITA a lib** é [[14-artefatos-do-mantenedor]].

# 13. Critérios de Aceite

- [x] `sarak-ui/` existe na raiz, entra no `files` e é exigido pelo `package:check` (12 caminhos).
- [x] O gerador tem os dois modos (`guide` / `guide:check`) sobre a **mesma** função de plano.
- [x] Toda lista do kit é derivada por AST, reusando `catalogAst.mjs`/`componentCatalog.mjs`.
- [x] `guide:check` roda no `build` e, por transitividade, no `prepublishOnly`.
- [x] O `kitHash` é hash de conteúdo e há teste para as duas metades da propriedade.
- [x] Os 3 movimentos do `START-HERE` e o `kitTargets.mjs` concordam entre si.
- [x] Genericidade travada por teste (`\bERP\b|earendel` = 0).
- [ ] **Aceite do dono (§9): construir um módulo novo usando SÓ o kit.** — **PENDENTE.**

# 14. Plano de Testes (Quality Gate)

## Testes Unitários (existentes — `scripts/consumer-kit/__tests__/kitGenerator.test.mjs`)
- [x] `injectBlock` preserva a prosa dos dois lados e é idempotente.
- [x] `injectBlock` falha alto com marcador ausente e com marcadores invertidos.
- [x] `kitHashOf` muda quando a superfície muda e **não** muda quando ela não muda.
- [x] O catálogo lista componentes de `components/` **e** a API de `core/`.
- [x] O contrato de responsividade sai do uso real de `useSarakDevice`.
- [x] Os slots do cromo saem das props `ReactNode` opcionais do `SarakAppChrome`.
- [x] O kit não vaza nome de importador nenhum.

## Gate de sistema
- [x] `npm run guide:check` verde no `build` — kit defasado derruba a compilação.
- [x] `npm run package:check` reprova tarball sem os arquivos do kit.

## Lacuna declarada
- [ ] **Nada testa o `templates/`.** Ele é exigido por presença (`package:check`) e por mais nada:
      nenhum gate compila os `.tsx` copiáveis nem confere se os nomes que eles usam continuam no
      barril. Um template que passe a citar componente removido sai verde em todos os gates.
      Registrado como lacuna, não como plano.
