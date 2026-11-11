---
tipo: "plan"
titulo: "Verificar por máquina, no importador, o uso correto da lib"
objetivo: "Fazer o importador saber por máquina, no próprio repositório, onde usa a lib errado ou mantém à mão algo que ela já entrega, com um kit de verificação opcional distribuído no pacote, ligado regra a regra, cada achado com arquivo:linha e o nome público que substitui"
dominio: "Kit do consumidor / Verificação de uso"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "kit-do-consumidor", "verificacao", "importador", "eslint"]
relacionados: ["[[12-kit-do-consumidor]]", "[[03-superficie-publica]]", "[[13-instalacao-e-atualizacao]]", "[[00-regras-e-invariantes]]", "[[019-arrastar-e-soltar-do-kanban]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "adr/025 + specs/12-kit-do-consumidor.md + arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md"
---

# 1. Objetivo

O importador liga, no lint dele, as regras que quiser de um kit de verificação que vem dentro do pacote da lib, e cada violação diz
`arquivo:linha`, o que está errado e **qual nome público da lib substitui** — inclusive quando a peça foi escrita à mão e a lib já a
entrega.

# 2. Contexto

**A lacuna medida.** Nos relatos finais da migração à `v8.0.0` (2026-11-10, anexos da `plan-119`), o ERP mantinha à mão cinco peças
que a lib entrega (`sarakErrorMessage`, `SarakPagination.getPageHref`, `SarakDocumentFrame` + `sarakPrint`, `sarakIsValidCnpj`,
`createSarakKitMock`) e usava cinco variáveis `--sarak-*` que não são públicas e caem no valor de reserva sem aviso. A lib **tinha
avisado**, mas só em `docs/migracoes.md`, que se lê uma vez; nada acusava por máquina. Onde o ERP construiu verificação própria, ela
funcionou: a regra de equivalência nativo → componente pegou **171** violações na estreia e hoje está em 0. Os logins não têm regra e
pagaram rodadas por seletor de classe interna e prop inválida.

**Decisão do dono.** 2026-10-19: "fazer, opcional para o importador — plugin de ESLint no pacote, regras ligadas uma a uma, numa plan
própria (com ADR)". 2026-11-10: a plan é agora, e o artefato tem de bastar para o importador usar a lib corretamente, evidenciando o
que foi criado à mão e já existe na lib.

**O que existe hoje.** Os três importadores usam ESLint (`eslint.config.mjs` na raiz do ERP; `eslint` no `package.json` dos dois
logins). A lib não tem ESLint e não exporta nada para lint. O `sarak-ui/catalog.json` já publica `barrelExports`, `components` e
`tokens.cssVars` (a lista das variáveis que a engine emite), gerados pelo `npm run guide` e travados pelo `guide:check`. A lista da
"base que o consumidor não reescreve" está em prosa na [[12-kit-do-consumidor]] §2.3, não em forma de dado.

**O ponto mais difícil é a detecção de peça reescrita**, porque é heurística: um nome local parecido com um nome público não prova
reescrita. O lote 0 decide a forma; o lote 2 mede acerto e falso positivo nos importadores reais antes de qualquer regra entrar no
conjunto recomendado.

# 3. Escopo

## 3.1 Dentro
- **Lote 0:** `specs/adr/025-<slug>.md` (novo, molde `specs/_templates/template-adr.md`), `specs/adr/README.md` (a linha do índice
  dele) e o anexo `specs/plan/anexos/plan-157-catalogo-de-regras.md` (novo). Leitura, sem edição, dos importadores.
- **Lote 1:** o código do kit de verificação na pasta que o ADR decidir (fora de `src/components/` e de `src/features/`); a entrada
  dele no `exports` do `package.json` e no build (o script `build:js` do `package.json`, que lista as entradas do `tsup`); a peer opcional `eslint` (se o ADR a escolher) em `package.json`
  e `package-lock.json`; os dados de equivalência no gerador do catálogo (`scripts/consumer-kit/` e, se a fonte for o JSDoc dos
  componentes, a tag nos componentes que substituem elemento nativo — só a tag, nenhuma linha de comportamento); os testes; a seção
  nova no `sarak-ui/GUIA-FRONTEND.md` (autoria) e o passo na skill `ui-integra-consumidor`; a nota em `docs/migracoes.md` (próxima
  versão, aditiva); os gerados (`guide`, `dev-kit`, `catalog`).
- **Lote 2:** o anexo `plan-157-catalogo-de-regras.md` (a medição) e as correções de regra que a medição pedir, nos arquivos do lote 1.

## 3.2 Fora
- **Qualquer arquivo de importador.** A medição do lote 2 roda com configuração fora da árvore dele (em `C:\tmp\`), sem cache gravado
  na árvore dele e sem instalar nada nela. Se não houver como rodar sem tocar o importador, pare e relate.
- Regra de gate nova **neste** repositório: o kit verifica o importador, não a lib.
- Mudar comportamento de componente para caber numa regra. Achado de componente vai para o resumo.
- O mapa "o que a lib já faz" no guia e a consolidação do kit de importação: são do lote final da `plan-119`, que começa depois desta.
  Esta plan escreve **só** a seção que ensina a ligar e ler o kit de verificação.
- Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/12-kit-do-consumidor.md` (§2 inteira, §3, §8) | o que o kit é, nunca escrever à mão o que muda, a base que o consumidor não reescreve, genericidade |
| Spec fixa | `arquitetura/03-superficie-publica.md` (§2, §3, §7.1) | barril, subpaths, fronteira lazy: o kit de verificação não pode entrar no bundle de quem não o usa |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` §2 | peers obrigatórias × opcionais |
| Spec fixa | `specs/00-regras-e-invariantes.md` R17 | a lista de equivalências e de peças é **dado gerado**, nunca transcrita |
| Spec fixa | `specs/08-identidade-do-host-e-zero-marca.md` | o texto das mensagens das regras aparece no terminal do importador |
| Spec fixa | `specs/11-testes-e-cobertura.md` | onde e como os testes novos entram |
| ADR | `adr/README.md` · `adr/019-arrastar-e-soltar-do-kanban.md` | protocolo e o exemplo de peer opcional decidida com alternativas medidas |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-integra-consumidor` | escrita, testes, fonte do kit |
| Código | `scripts/consumer-kit/` · `scripts/catalogAst.mjs` · `scripts/componentCatalog.mjs` · `bin/sarak-ui.mjs` · `package.json` (`exports`) · `sarak-ui/catalog.json` | o gerador que dá os dados, a CLI que já existe, a superfície de pacote |
| Anexo | `specs/plan/anexos/plan-119-relatorio-final-erp.md` (A1, A2-A6, A10 e a tabela da C4) · `specs/plan/anexos/plan-119-perspectiva-final-login.md` (C4) | as regras que os importadores provaram e os casos reais que o kit tem de pegar |
| Importador (leitura) | ERP, raiz `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\`: `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\specs\arquitetura\05-regras-e-gate.md` §4.2, `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\tools-local\gate-rules\ui-equivalence.json`, `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\eslint.config.mjs`, `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP\packages\ui-kit\src\` · logins: `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-Lib-Login\login-completo\` e `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-Lib-Login\login-provedores\` (o `package.json` e a config de ESLint de cada um) | as regras que existem lá e onde elas falham |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 0 — desenho e ADR.** Só documento.
0.1. **Forma do artefato.** Compare, com custo medido, pelo menos: (A) plugin de ESLint num subpath do pacote; (B) comando novo na CLI
`sarak-ui` com análise própria; (C) A + B (o plugin para código, a CLI para o que o ESLint do importador não lê, como CSS). Para cada
uma: o que ela enxerga (`.tsx`, `.ts`, `.css`), dependência nova e peso para quem não usa, esforço do importador para ligar, como roda
na CI dele. O ADR registra a escolha, o custo e o gatilho de reavaliação; a decisão do dono de 2026-10-19 (plugin de ESLint) é a
hipótese a confirmar ou contestar com medida.
0.2. **Catálogo de regras** (o anexo). Uma linha por regra candidata: o que barra, de onde vem o dado (qual chave do `catalog.json`,
ou qual dado novo precisa ser gerado), o caso que **reprova** e o que **passa**, e quem pediu. Comece pelas que os importadores provaram:
- porta única (import da lib fora do caminho que o importador configurar);
- `var(--sarak-*)` fora de `catalog.json › tokens.cssVars` (A1 do ERP: os cinco nomes reais);
- elemento nativo com componente da lib (A10 do ERP: `h1`-`h3`, `section`, `fieldset`, `header`, `nav`…) — o par vem de dado gerado,
  nunca de lista no código do plugin (R17);
- **peça reescrita**: código local que reimplementa um nome público da lib (A2-A6 do ERP); diga qual sinal a regra usa e o falso
  positivo esperado;
- cor ou fonte literal fora de token, aceitando `var(--x, <reserva>)` (a regra do ERP acusava isso em falso);
- import direto de biblioteca que a lib encapsula (`ui-kit` do ERP);
- seletor por classe interna da lib (login).
Regra para a qual não se escreve um caso que reprova sai da lista. Para cada uma: severidade proposta e se entra no conjunto
recomendado.
0.3. **Para o dono aprovar antes do lote 1:** o ADR em `🟡 Proposto` e o anexo. O revisor leva ao dono; sem aprovação, o lote 1 não
começa.

**Lote 1 — o kit.**
1.0. **Antes de codificar, acrescente ao anexo as regras 10 a 14** (decisão do dono, 2026-11-11), cada uma no formato das outras: o que
barra, porta, dado, caso que reprova, caso que passa, falso positivo esperado e quem pediu. Regra para a qual não sair um caso que
reprova fica fora, com o motivo no anexo.
- **10 `single-entrypoint` no `package.json`** (C): a regra 1 estendida ao `package.json`. Barra o `package.json` fora dos caminhos
  `allow` que declara `@sarak/lib-ui-core`. É a outra metade da `local-single-ui-entrypoint` do ERP, que a regra 1 só cobre em import.
- **11 `kit-in-sync`** (C): a cópia do kit no importador (`sarak-ui/VERSION`, o `kitHash`) difere do kit do pacote instalado. É a
  `local-ui-kit-sync` do ERP, nascida do `VERSION` parado em 3.0.0 com a lib em 6.3/7.0.
- **12 `pinned-install`** (C): a dependência `@sarak/lib-ui-core` do `package.json` não está fixada numa tag exata (`#vX.Y.Z`), ou é
  `file:`, ramo ou faixa. Regra de instalação dos importadores conhecidos (`00-contexto` §8); o ERP sofreu com `file:` e com a volta
  sozinha para a 7.0.0.
- **13 `known-icon-name`** (P): nome de ícone literal passado à lib (prop de ícone dos componentes) que não está em
  `catalog.json › tokens.iconNames`. Nome desconhecido cai no ícone de reserva sem aviso.
- **14 `known-theme-id`** (P): id literal de tema (`activeThemeId`, `initialTheme`, `options.theme.defaultTheme`) que não está em
  `catalog.json › themes`, e id literal de paleta (`colorPalette`) fora das paletas publicadas. Pega o importador preso a um id que
  saiu (o `synthwave-retro`, pela `plan-162`) ou foi digitado errado. Se as paletas não estiverem no catálogo, a parte de paleta fica
  fora e vai no resumo.
1.1. Os dados que as regras leem saem do gerador do catálogo e entram no `sarak-ui/catalog.json` (ou num arquivo irmão gerado, se o ADR
decidir), cobertos pelo `guide:check`/`catalog:check` existentes. Nenhuma lista de nomes da lib escrita à mão no código do kit.
1.2. Cada regra do catálogo aprovado, **desligada por padrão**; um conjunto `recommended` só com as aprovadas para ele. Cada mensagem traz
o que está errado e o nome público que substitui; texto sem marca.
1.3. Testes por regra: pelo menos um caso que reprova e um que passa, com o dado real do catálogo gerado (não um dublê do catálogo).
1.4. O kit fica fora do bundle principal: `npm run build` e a medição de boot (`boot:measure`) sem crescimento no boot; cole os números.
Quem não instala a peer opcional não vê erro nem aviso novo no build dele (estenda `scripts/test-optional-peer-consumer.mjs` com o
cenário).
1.5. Guia: uma seção "Verificar o uso" — instalar, ligar regra a regra, ler o achado, desligar uma regra com motivo. Skill
`ui-integra-consumidor`: o passo, apontando para a seção. Nota aditiva em `docs/migracoes.md`.
1.6. `npm run guide`, `npm run dev-kit` por último.

**Lote 2 — medição nos importadores reais.** Só leitura dos importadores (§3.2).
2.1. Rode o kit, com todas as regras ligadas, contra o ERP (`packages/ui-kit`, `modules/*/web`) e os dois logins. Cole o comando e a
contagem por regra.
2.2. Por regra: verdadeiros positivos e falsos positivos, com `arquivo:linha` de cada falso. **O kit tem de pegar os casos conhecidos:**
os cinco `var(--sarak-*)` da A1 e as peças das A2-A6 do relato final do ERP que ainda estiverem no código dele (confira antes; o ERP
pode ter migrado alguma).
2.3. Regra com falso positivo que não se corrige sai do `recommended` e fica documentada com o limite. Corrija nos arquivos do lote 1
e registre tudo no anexo.

# 6. Critérios de aceite

- [ ] ADR-025 com as alternativas, o custo de cada uma e o gatilho de reavaliação, aprovado pelo dono antes do lote 1.
- [ ] Catálogo de regras no anexo, cada regra com o caso que reprova e o que passa.
- [ ] O importador liga o kit sem copiar nada da lib: um import do subpath (ou o comando) e as regras pelo nome.
- [ ] Cada achado com `arquivo:linha`, o problema e o nome público que substitui.
- [ ] Nenhuma lista de nomes da lib escrita à mão no código do kit; os dados vêm do gerador e o `guide:check`/`catalog:check` os trava.
- [ ] Boot sem crescimento; build do importador sem a peer, sem aviso novo.
- [ ] Medição nos três importadores: os casos conhecidos pegos, falsos positivos contados, `recommended` só com regras sem falso
  positivo conhecido.
- [ ] Seção do guia e passo da skill; nota em `docs/migracoes.md`.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1.

# 7. Como verificar (uso do revisor)

**Gate:** teste — cada regra com caso que reprova e caso que passa, sobre o catálogo gerado; os dados ficam sob o `guide:check` e o
`catalog:check` que já existem; nenhuma regra de gate nova neste repositório.

- Lote 0: as alternativas do ADR conferidas contra o que os importadores têm (ESLint presente, CSS que o ESLint deles lê ou não); duas
  regras do anexo, escolhidas por mim, com o caso que reprova escrito.
- Lote 1: `git diff --stat` → só a §3.1; um teste por regra lido e a mutação de um deles (tirar um nome de `tokens.cssVars` do
  dado e ver o teste reprovar, em cópia fora do repositório); `boot:measure` e o consumidor sem a peer; `npm run verify -- --tier=full`.
- Lote 2: rodo o kit eu mesmo contra o ERP com a configuração do anexo e confiro a contagem de uma regra e três achados por
  `arquivo:linha`.

# 8. Destino da síntese

**Destino:** `adr/025 + specs/12-kit-do-consumidor.md + arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md`

- **`adr/025`:** nasce no lote 0 e só ganha a referência à plan sintetizada se o ADR a citar.
- **`12`:** o kit de verificação como parte do kit: de onde vêm os dados, o conjunto recomendado, o que cada regra não vê.
- **`03`:** o subpath novo e a regra de que ele fica fora do bundle principal.
- **`13`:** a peer opcional nova, se houver, e o passo de instalação.
- O anexo sai com a plan; o que é regra vai para as specs.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (lote 0) — 2026-11-10

**Resultado:** Concluído. Só o lote 0; o lote 1 não foi iniciado e aguarda a aprovação do dono (passo 0.3).

**Estado do worktree ao iniciar**
(limpo)

Depois, e por outra sessão (a plan-119 lote 9, que o prompt avisou), apareceram `src/components/atomic/Inputs/SarakSwitch.tsx`, `src/components/atomic/Inputs/__tests__/SarakSwitch.test.tsx`, `src/features/DesignEngine/hooks/useDesignDraft.ts` e `src/features/DesignEngine/hooks/__tests__/useDesignDraft.toast.test.tsx` (novo). Não os li, não os toquei.

**O que foi feito**
- `specs/adr/025-kit-de-verificacao-de-uso-nucleo-unico-duas-portas.md` (novo, 🟡 Proposto): compara (A) só plugin, (B) só CLI e (C) núcleo único com as duas portas, e propõe a C. Contesta em parte a decisão do dono de 2026-10-19: o plugin fica como porta principal, mas sozinho não vê `.css`, e as 5 variáveis `--sarak-*` do ERP (A1) estão todas em `.css`.
- `specs/plan/anexos/plan-157-catalogo-de-regras.md` (novo): 9 regras, cada uma com porta, dado, severidade, caso que reprova, caso que passa, falso positivo esperado e quem pediu.
- `specs/adr/README.md:67`: linha do ADR-025 na tabela.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/adr/025-kit-de-verificacao-de-uso-nucleo-unico-duas-portas.md` | criado | ADR proposto |
| `specs/plan/anexos/plan-157-catalogo-de-regras.md` | criado | catálogo de regras |
| `specs/adr/README.md` | alterado | uma linha na tabela |
| `specs/plan/plan-157-…md` | alterado | este resumo e o `status` |

**Verificações executadas** (só leitura; nenhum teste, build ou gate, porque o lote não toca código)
- ESLint dos três importadores: ERP `^9.39.5`, os dois logins `9.39.5` com `@typescript-eslint/parser 8.66.0`, todos em config plana (`package.json` e `eslint.config.*` de cada um).
- `@eslint/css` ausente em `node_modules/@eslint` do ERP e do `login-completo` (só `js`, `config-array`, `config-helpers`, `core`, `eslintrc`, `object-schema`, `plugin-kit`). Não conferi o `login-provedores`.
- `.css` próprios: ERP 12, logins 0. `var(--sarak-` em `.css`: 6 arquivos no ERP.
- Os 5 `--sarak-*` da A1 continuam nos mesmos `arquivo:linha` do ERP e nenhum está nos 748 nomes de `tokens.cssVars` (`node -e` sobre `sarak-ui/catalog.json`).
- As 5 peças A2–A6 continuam no ERP; os `export` conferidos por `grep`. `sarakErrorMessage`, `SarakDocumentFrame`, `sarakPrint`, `sarakIsValidCnpj` estão em `barrelExports`; `createSarakKitMock` **não**, porque vive no subpath `testing`.
- Tamanhos: `catalog.json` 447.957 bytes (313.586 compactado, 68.176 gzip); `cssVars` 21.462; `barrelExports` 11.547; `dist/index.js` 223.303; `dist/testing.js` 2.242 e `.cjs` 2.904 (precedente de entrada extra).
- `<section>` sem título existe no ERP (`OrderConditionsSteps.tsx:44`), o que justifica a condição na regra 4.

**Critérios de aceite**
- [x] ADR-025 com alternativas, custo de cada uma e gatilho de reavaliação — evidência: o arquivo. **Falta a aprovação do dono** (passo 0.3).
- [x] Catálogo de regras no anexo, cada regra com o caso que reprova e o que passa.
- [ ] Os demais critérios (§6) são dos lotes 1 e 2 — fora deste lote.

**Decisões e suposições**
- Acrescentei duas regras que a plan não listava, marcadas no anexo para o dono vetar: `no-deep-import` (contrato da spec 03 §2, sem ocorrência real) e `valid-spacing-value` (de "prop inválida" do login e do `gap="md"` dos moldes).
- Dado novo no `catalog.json`, numa chave `verification`, e **não** num arquivo irmão (a chave pesa menos de 1% e o `package:check` não ganha caminho).
- Escrevi o ADR e o anexo em português, e a mensagem das regras também. Não li a spec 10 §3.6 (idioma), porque a §4 da plan não a lista; fica para conferir no lote 1.
- **Do `login-provedores` li só o `package.json` (ESLint `9.39.5`, parser `8.66.0`) e a busca por `var(--sarak-`**; o `eslint.config.js` dele não foi aberto — só o do `login-completo`. A coluna dele na tabela do ADR vem do `package.json`.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- Detecção de peça reescrita: o nome pega 3 dos 5 casos (A2, A4, A6); A3 e A5 só com apelido registrado na lib. É heurística, e a taxa de falso positivo só se mede no lote 2.
- Nada foi rodado contra código real nem commitado.

## Resumo da execução (lote 1) — 2026-11-11

**Resultado:** Concluído com pendências (gate `public-types:check` vermelho por causa alheia; ver Achados). Lote 2 não iniciado.

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-158-design-gravado-guarda-escolhas-e-aplica-sem-atraso.md
 M specs/plan/plan-162-resgatar-temas-antigos-como-temas-novos.md
```
(O prompt falava de `SarakSwitch`, `SarakStats`, `dist/` etc. não commitados; na fotografia eles já estavam commitados.) Durante a execução apareceram, por outra sessão e sem eu tocar: `specs/adr/README.md`, `specs/adr/026-…`, `specs/plan/plan-164-…`, `specs/plan/anexos/plan-162-mapa-de-tokens.md`. Não os li nem os alterei.

**O que foi feito**
- Anexo `plan-157-catalogo-de-regras.md`: regras 10 a 14 (passo 1.0), cada uma com o que barra, porta, dado, caso que reprova e que passa, falso positivo, limite e quem pediu; linhas na tabela. Todas ficaram (cada uma tem caso que reprova).
- Núcleo em `src/verify/` (tipos, `data.ts` que lê o `sarak-ui/catalog.json` do pacote, detectores puros em `detect/`, mensagens, glob, sugestão de nomes), 11 regras do plugin em `rules/` e a porta de comando em `scan.ts`/`cli.ts` (6 regras: `known-css-var`, `no-literal-color-font`, `no-internal-class-selector` em `.css`; `single-entrypoint`, `pinned-install` em `package.json`; `kit-in-sync`).
- Entradas de build `src/eslint.ts` (subpath `./eslint` no `exports`) e `src/verify.ts` (carregada só por `bin/sarak-ui.mjs verify`, via import dinâmico); `build:js` lista as duas. Peer opcional `eslint >=9.0.0` e `devDependency eslint ^9.39.5` (para os testes usarem o `Linter` real); `package-lock.json` regenerado.
- Dado novo no gerador: `scripts/consumer-kit/collectVerification.mjs` (tags de JSDoc `@replacesElement`, `@replacesPiece`, `@encapsulates`, `@iconNameProp`, e as chaves de `SARAK_PALETTE_PRESETS`) → chave `verification` do `catalog.json`. Gerador falha alto em tag malformada ou fora do barril/`testing`.
- Tags (só comentário) em 17 declarações: SarakTypography, SarakSection, SarakPageHeader, SarakTable, SarakDataTable, SarakFormSection, SarakDescriptionList, SarakTabs, SarakPagination, sarakIsValidCnpj, createSarakKitMock, SarakChartEngine, SarakPDFViewer, SarakMarkdownRenderer, SarakFlowEngine, SarakIcon, SarakAppChrome, SarakShellNav. No `SarakAppChrome.tsx` fundi duas linhas de comentário numa para não passar de 250 linhas.
- `gates/scripts/contrato/check-no-deep-import.mjs`: `./eslint` entra em `ALLOWED_EXACT` (mais um caso no teste dele). Sem isso o `deep-import:check` derrubava o build.
- `scripts/test-optional-peer-consumer.mjs`: `eslint` nas peers opcionais e o cenário `assertVerificationKitIsIsolated` (o `dist/index.js` não importa o kit nem o eslint; o plugin carrega no consumidor sem `eslint` e expõe 11 regras).
- Guia §3.15 "Verificar o uso", passo 6 da skill `ui-integra-consumidor`, entrada `8.1.0` (aditiva) em `docs/migracoes.md`; `npm run guide` e `npm run dev-kit` por último.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/verify/**` (16 arquivos + 2 testes), `src/eslint.ts`, `src/verify.ts` | criado | o kit |
| `scripts/consumer-kit/collectVerification.mjs` | criado | coletor do dado |
| `scripts/consumer-kit/buildKitCatalog.mjs` | alterado | chave `verification` |
| 18 componentes/funções em `src/` | alterado | só a tag de JSDoc |
| `package.json`, `package-lock.json`, `bin/sarak-ui.mjs` | alterado | entradas, peer, comando `verify` |
| `gates/scripts/contrato/check-no-deep-import.mjs` e teste | alterado | `./eslint` permitido |
| `scripts/test-optional-peer-consumer.mjs` | alterado | cenário do kit isolado |
| `sarak-ui/*`, `sarak-dev/*`, `docs/migracoes.md`, `.agents/skills/ui-integra-consumidor/SKILL.md` | alterado | guia, skill, nota; gerados |
| `specs/plan/anexos/plan-157-catalogo-de-regras.md` | alterado | regras 10 a 14 |
| `dist/**`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | alterado | efeito do `npm run build` que rodei (o `dist/` é rastreado) |

**Verificações executadas**
- `npx vitest run src/verify` → 38/38 (28 do plugin sobre o catálogo real via `Linter` do ESLint; 10 do comando e dos detectores). Cada regra tem caso que reprova e que passa; os cinco `--sarak-*` da A1 reprovam por teste, em `.ts` (plugin) e em `.css` com linhas 2 a 6 (comando).
- `npx tsc --noEmit` → 0 erros.
- `npm run build`: todos os gates até `deep-import:check` verdes (`guide:check`, `catalog:check`, `barrel:check` 139, `zero-brand:check`); `tsup` gerou `dist/eslint.{js,cjs,d.ts}` (8.898 B) e `dist/verify.js` (7.661 B) ao lado do `dist/index.js` (223.548 B). **Parou em `public-types:check`** (ver Achados); rodei à mão os passos seguintes (`prefix`, `icon-port`, `kit-names`, `build:css`, `build:css:scoped`, `copy-base-css`, `inject-css`, `generate-build-info`): verdes.
- `npm run test:optional-peers` → verde: build Vite 8 sem peers (44 avisos em 3 códigos, nenhum do kit); "kit isolado do boot e carregável sem o eslint (rules=11)"; mutação do import nomeado ainda reprova; build com todas as peers.
- `npm run boot:measure` → boot 395,0 KB gzip (referência 392,0 + catálogo 2,1; teto 397,1): dentro do teto. O fecho do `index.ts` não alcança `src/verify`. Não tenho número "antes" medido no HEAD limpo; a comparação é pelo teto do gate.
- `npm run guide:check`, `catalog:check`, `kit-names:check`, `package:check` (208 arquivos), `dev-kit:check` → verdes.
- `npm run verify -- --tier=quick` → só falha `section-pointers:check` (4 ponteiros em `adr/026`), `plan-index:check` (plan-158) e o `audit:baseline` por esses 4 ponteiros; os 13 avisos de cleancode que eu tinha trazido foram corrigidos e `variable-contract:check` está verde (tirei `var(--x…)` de textos).
- `node bin/sarak-ui.mjs verify --list` → lista as 13 regras.

**Critérios de aceite** (os do lote 1; ADR e catálogo já eram do lote 0)
- [x] O importador liga o kit sem copiar nada da lib — `import sarak from '@sarak/lib-ui-core/eslint'` e `npx sarak-ui verify --rule …` (guia §3.15; teste do consumidor carrega o subpath).
- [x] Cada achado com `arquivo:linha`, problema e nome público que substitui — `plugin.test.ts`, `cli.test.ts`.
- [x] Nenhuma lista de nomes da lib no código do kit — dados de `catalog.json`; ver suposição 3 sobre as chaves de API.
- [x] Boot sem crescimento; build do importador sem a peer, sem aviso novo — acima.
- [x] Seção do guia, passo da skill, nota em `docs/migracoes.md`.
- [ ] Suíte completa, `tsc`, baseline, Anel 1 — `tsc` 0; a suíte completa não é minha; `public-types:check` e o baseline estão vermelhos por causa alheia.
- [ ] Medição nos três importadores e `recommended` — é o lote 2.

**Decisões e suposições**
1. Tags em camelCase (`@replacesElement`…), não `@replaces`/`@icon-name-prop` como o anexo exemplificava: o TypeScript corta o nome da tag no hífen. Corrigi o anexo.
2. `recommended` existe e está vazio; não criei conjunto `all`. Mensagens só em português.
3. As regras 13 e 14 precisam saber quais chaves olhar. Derivei do catálogo o que dá (props de tipo `SarakLayoutGap`, props de tema do Provider); ficaram como constante no código `defaultTheme`, `theme` e `colorPalette`, e o teste `catálogo de regras` confere que existem no catálogo/no tipo do Provider.
4. Regra de peça reescrita: o alias vem de tag; o dublê em caminho de teste (`testing/`, `__mocks__`, `mock`) prefere o alias (`createSarakKitMock`), senão vale o nome do barril. Cobre A2, A3, A4, A5 e A6 por teste; o nome do arquivo acusa quando nenhum export acusou.
5. `known-theme-id` dá falso positivo para tema do próprio importador: a opção `allow` o libera, e por isso não entra no `recommended`.
6. A porta de comando só lê `.css`, `package.json` e o `VERSION`; as regras "ambas" não varrem `.ts` pelo comando (isso é do plugin).
7. Tocar `check-no-deep-import.mjs` e a regeneração de `dist/` foram necessárias para o build e saem do §3.1; registrei acima.

**Achados fora do escopo (não corrigidos)**
- `public-types:check` falha: `DraftToast` (`src/features/DesignEngine/hooks/useDraftToast.ts:5`, do commit do lote 9 da plan-119) aparece em `dist/index.d.ts` sem estar exportado nem na allowlist. O `dist/` do HEAD não o continha. Não é do kit; sem esse conserto o `npm run build` não fecha.
- `specs/adr/026-…` tem 4 ponteiros `§4.4` mortos (`section-pointers:check`) e a plan-158 está divergente do índice (`plan-index:check`): do revisor.
- `SarakIcon.tsx:4`: o identificador `SARAK_ICONE_DESCONHECIDO` tem termo em português (aviso do hook de escrita); `SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118` têm `<input>` nativo no audit de composição atômica. Pré-existentes.

**Pendências / riscos**
- Mutação pedida ao revisor (tirar nome de `tokens.cssVars` e ver o teste cair) não foi feita por mim.
- Falso positivo de `no-reimplemented-piece` por nome genérico (`formatDate` ↔ `sarakFormatDate`) é esperado; só o lote 2 mede.
- Não rodei a suíte completa nem `coverage:check`.
- Nada commitado.

## Resumo da execução (correção 1) — 2026-11-12

**Achado 1 — nota de versão na seção errada: corrigido.**
- `docs/migracoes.md:8`: o título passou de `## 8.1.0 — kit de verificação de uso (aditivo, sem quebra)` para `## 9.0.0 — kit de verificação de uso (aditivo: nada quebra por causa dele)`. O corpo não mudou. Não havia seção `9.0.0` no arquivo, então a entrada abre a seção; o resto da `9.0.0` (tema gravado, `synthwave-retro`) é de outras plans e não foi escrito aqui.
- `npm run guide` e `npm run dev-kit` refeitos: `sarak-ui/docs/migracoes.md:8` traz o mesmo título; `grep 8.1.0` nos dois `migracoes.md` → 0.
- `guide:check`, `dev-kit:check` e `kit-names:check` → verdes. Nada mais foi tocado; suíte completa e build completo ficam com o revisor, como o veredito diz.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-11-10 — lote 0 — 🟢 Aprovado; o lote 1 espera a aprovação do ADR-025 pelo dono

**Conferido por mim:** os arquivos do lote são só documento (`specs/adr/025-…`, `specs/adr/README.md`, o anexo e esta plan). As
alternativas do ADR batem com os importadores: ERP com `eslint ^9.39.5` (`package.json:61`) e sem `@eslint/css` (`node_modules/@eslint`
só com `js`); as duas regras que escolhi conferir têm o caso real escrito e existente — `known-css-var`:
`proposal-ui.css:129` (`var(--sarak-border-radius-md, 8px)`) e `templateLayout.css:60` (`var(--sarak-layout-gap-xs, 4px)`), os cinco
nomes ausentes dos 748 de `tokens.cssVars` e `--sarak-card-radius`/`--sarak-layout-gap-md` presentes (`node` sobre
`sarak-ui/catalog.json`); `no-reimplemented-piece`: `packages/ui-kit/src/errorMessage.ts:26` (`export function errorMessage`). O ADR
nomeia duas alternativas com custo e o gatilho de reavaliação; a régua da `00-prompt-revisor` §5.2 passa. `npm run verify -- --tier=docs`
verde.

**Para o dono decidir antes do lote 1 (passo 0.3):** o ADR-025 (opção C: núcleo único, plugin de ESLint + `sarak-ui verify` para `.css`);
as duas regras que o executor acrescentou (`no-deep-import` e `valid-spacing-value`); e a língua das mensagens (o ADR propõe português,
fora do catálogo de seis idiomas da 10 §3.6, por ser ferramenta do desenvolvedor do importador).

**Status da plan: 🟡 Em execução** (lote 1 aguardando a aprovação do dono).

## Nota do revisor — 2026-11-11 — decisões do dono sobre o lote 0

- **ADR-025 aceito** (opção C: núcleo único com plugin de ESLint e `sarak-ui verify`); `status` do ADR e linha do `adr/README.md`
  atualizados.
- **As nove regras do anexo ficam**, inclusive as duas acrescentadas pelo executor (`no-deep-import`, `valid-spacing-value`).
- **Cinco regras novas (10 a 14)**, levantadas pelo revisor contra os relatos finais do ERP e do login e aceitas pelo dono: passo 1.0 do
  lote 1.
- **Mensagens só em português**, fora do catálogo de seis idiomas (registrado no ADR).
- **Cobertura dos relatos finais.** Com as 14 regras, todo achado de *uso* dos dois importadores tem regra: ERP A1 (3), A2–A6 (5),
  A10 (4) e as cinco regras da C4 do ERP (1 e 10, 7, 6, 11, 4); login C4 (8 e 9) e o lock em `git+ssh` (12). Ficam fora, por não serem
  erro de uso que se lê no código do importador: ERP A7 (adotar o CSS de boot), A8 (tema de marca só leitura, `00-backlog` #72) e A9
  (`fonts.baseUrl` no Vite de dev), e login A1 (imagem `data:` no payload) — os quatro seguem no lote final da `plan-119` (I43, I46, I51)
  ou no backlog.

**Status da plan: 🟡 Em execução** (lote 1 liberado).

## Veredito — 2026-11-11 — lote 1 — 🔴 Reprovado (1 achado)

**Conferido por mim:**
- **Mutação** (a da §7), em cópia fora do repositório com junção para `node_modules`: com o `sarak-ui/catalog.json` real,
  `npx vitest run src/verify` → 38/38; tirando `--sarak-card-radius` de `tokens.cssVars` → 3 reprovam (`known-css-var` no comando e
  no plugin, e o teste que amarra o "passa" ao catálogo). Os dados vêm do catálogo gerado, não de lista no código do kit.
- **Componentes tocados:** `git diff -U0 -- src/components src/shared` sem nenhuma linha que não seja comentário — só as tags de JSDoc.
- `npx tsc --noEmit` → 0. Os testes dos 18 componentes tocados, mais os do kit e os vizinhos do cromo: `npx vitest run …` → 98
  arquivos, 765 testes verdes.
- `section-pointers:check` e o `audit:baseline` vermelhos são os 4 ponteiros do `specs/adr/026-…` (correção da `plan-158`), não deste lote.
- O `public-types:check` que derruba o `npm run build` é o `DraftToast` do lote 9 da `plan-119` (via direta despachada), não deste lote.
- **Suíte completa:** a rodada de 2026-11-11 caiu por desligamento da máquina (worker sem resposta, 10,7 h); está sendo refeita e é
  conferida na rodada de correção, junto com o build completo.

1. `docs/migracoes.md:8` (e a cópia em `sarak-ui/docs/migracoes.md`) — a entrada nova é `## 8.1.0 — kit de verificação de uso (aditivo,
   sem quebra)`, mas a próxima versão é **`9.0.0`**: o dono escolheu remover o `synthwave-retro` (D6 = A da `plan-162`, nota do
   revisor de 2026-11-11 no índice) e o ADR-026 declara a mudança do dado gravado MAJOR. Critério: a nota de versão ancorada na versão
   que sai ([[03-versionamento-e-release]]). Correção: a entrada passa para a seção `9.0.0` (mantendo "aditivo" para o que é do kit) e
   os gerados (`npm run guide`, `npm run dev-kit`) são refeitos.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-11 — correção 1 (lote 1) — 🟢 Aprovado; lote 1 fechado

**Conferido por mim:**
- Achado 1 resolvido: `docs/migracoes.md:8` e `sarak-ui/docs/migracoes.md:8` em `## 9.0.0 — kit de verificação de uso (aditivo: nada
  quebra por causa dele)`; 0 ocorrências de `8.1.0` nos dois.
- **Suíte completa** (`npx vitest run`, rodada que terminou): 727 de 728 arquivos, 5.742 de 5.743 testes verdes. A única falha é
  `gates/scripts/contrato/__tests__/check-public-types-parity.test.mjs` — o tipo `DraftToast` do lote 9 da `plan-119`, que a tarefa
  direta já despachada corrige; nada deste lote.
- `npm run boot:measure` → boot 395,0 KB gzip, teto 397,1 KB; nenhum tema fora do padrão no fecho estático.
- `npm run test:optional-peers` → "kit de verificação isolado do boot e carregável sem o eslint (rules=11)" e a mutação do import nomeado
  ainda reprova.
- A mutação do catálogo e o resto do veredito anterior continuam valendo (o código do kit não mudou na correção).

**Fica para o fechamento da tag:** o `npm run build` completo, que hoje para no `public-types:check` por causa do `DraftToast`.

**Status da plan: 🟡 Em execução** (lote 2: medição nos importadores).
