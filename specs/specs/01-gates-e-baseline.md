---
tipo: "spec"
titulo: "Gates e baseline — o que cada verificação garante e onde ela está hoje"
dominio: "Sarak-Lib-UI-Core / Qualidade / Automação"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "gates", "baseline", "auditoria", "divida-tecnica", "qualidade"]
relacionados: ["[[00-regras-e-invariantes]]", "[[02-enforcement-por-commit]]", "[[03-superficie-publica]]", "[[04-contrato-de-tokens-e-paridade]]", "[[05-build-e-distribuicao]]", "[[16-integracao-continua]]"]
---

# 1. Propósito

Este documento existe para impedir uma coisa específica: **alguém acusar regressão onde há dívida conhecida.**

`run_audit.mjs` **não está em zero**. Quem roda a auditoria pela primeira vez vê "AUDITORIA FALHOU: 2 regras estruturais" e conclui que quebrou alguma coisa. Não quebrou. O baseline da §3 é a régua; **compare com ele, nunca com zero**.

Aqui está **como rodar** cada verificação e **onde ela está**. O que cada uma cobra está em [[00-regras-e-invariantes]]; **quando** ela roda está em [[02-enforcement-por-commit]]; e **o que cada gate NÃO enxerga** está na **§9**, a matriz de cobertura — leia-a antes de confiar num verde.

> **Todo gate deste documento cita o número da regra que cobra** *(fechado em 2026-08-02, `plan-13`)*. É o caminho de volta que faltava: quem é bloqueado por um gate chega ao contrato sem adivinhar. Antes disso o `check-release-tag` bloqueava um push imprimindo *"Regra violada"* citando uma regra que não existia em spec nenhuma.

> **Nenhum número deste documento é copiado de documento anterior — todos são medidos.** A §3 foi recontada
> por execução direta em **2026-08-11**; o resto do texto data cada afirmação onde ela pode ter envelhecido.
> **Cifra sem data é candidata a estar errada** — foi assim que esta spec passou seis dias descrevendo um
> repositório que não existia mais (achado **32**).

# 2. Catálogo de gates

## 2.1 `run_audit.mjs` — o agregador dos 12 auditores

```
node gates/scripts/audit/run_audit.mjs
```

**Custo:** ~7 s. **Saída:** exit 1 se **qualquer** auditor sair diferente de 0. Ele não soma violações — soma **auditores reprovados** (`run_audit.mjs:36-43`). "Quebrou 2 regras estruturais" significa *dois auditores vermelhos*, não duas violações.

> ✅ **Ampliado de 8 para 11 em 2026-08-05** (plans 12 e 16): entraram `auditor_authcoupling.mjs` (R32),
> `auditor_sectionpointers.mjs` (R23/R17) e `auditor_composicaoatomica.mjs` (R10).
>
> ✅ **De 11 para 12 em 2026-08-10** (`plan-24`): entrou `auditor_contraste.mjs` (R31) — **o último dos seis
> gates que não existiam em arquivo nenhum**. Com ele, a fila de regras ⏳ zerou.

Ele roda os 12 na ordem abaixo, cada um em processo próprio:

| # | Auditor | Cobra | Como ler a saída |
| --- | --- | --- | --- |
| 1 | `auditor_hardcoded.mjs` | R2 | Duas seções (VALOR e ESTRUTURAL) + a **reconciliação** dos baldes. FAIL = `Valor + Estrutural líquido > 0` |
| 2 | `auditor_ghostvars.mjs` | R7 | Tamanho do registro + lista de fantasmas por frequência + agrupamento por família |
| 3 | `auditor_typescript.mjs` | R3 | Um `[FAIL]` por arquivo com `any`, com a linha |
| 4 | `auditor_coverage.mjs` | R8 | Um `[FAIL]` por componente/hook sem teste, com o caminho **esperado** do teste |
| 5 | `auditor_arquitetura.mjs` | R1 | Arquivo + linha do import que cruza a fronteira |
| 6 | `auditor_cleancode.mjs` | R9 | Arquivo + linha + qual limiar estourou |
| 7 | `auditor_paridade.mjs` | R4 | Delega para `verify_parity.ts`: imprime a contagem das 3 fontes |
| 8 | `auditor_presets.mjs` | R5 | Delega para `verify_presets.ts`: gabarito vivo + itens auditados |
| 9 | `auditor_authcoupling.mjs` | R32 | AST: sinks de credencial + rota de auth embutida. Um `[FAIL]` por sink |
| 10 | `auditor_sectionpointers.mjs` | R23 · R17 | Ponteiro `§N.N` que não resolve contra o heading real do alvo citado (autorreferência) |
| 11 | `auditor_composicaoatomica.mjs` | R10 | AST: `<button>`/`<input>`/`<select>` cru fora da fronteira declarada de R10 |
| 12 | `auditor_contraste.mjs` → `verify_contrast.ts` | R31 | Um `[FAIL]` por tema, com **cada par abaixo de 4,5:1** e a razão medida; a última linha traz reprovados **e pulados**. **Pulado ≠ aprovado** — é fundo não determinístico, declarado em vez de chutado |

> ⚠️ **Relatório × FAIL.** O balde **deduzido** do `auditor_hardcoded` (ícones, `w-full`/`h-full`, alinhamento) é **relatório**: aparece na reconciliação, é contado, e **não reprova**. Só o líquido reprova. Já a linha final de `verify_parity` é relatório de contagem **bruta**; o número que importa para paridade é o das **três fontes**, que hoje batem em **423**. Ver [[04-contrato-de-tokens-e-paridade]] §2.

## 2.2 Os gates de contrato

| Gate | Comando | Garante | Cobra | Custo |
| --- | --- | --- | --- | --- |
| Barril | `npm run barrel:check` | Todo componente derivado por AST está no barril, com o `<Nome>Props` | R14 | ~1,3 s |
| Catálogo | `npm run catalog:check` | `docs/component-catalog.{json,md}` commitado == gerado agora | R17 | ~1,5 s |
| Zero-marca | `npm run zero-brand:check` | Nenhuma marca da lib como texto em componente consumidor-facing | R12 | ~1,3 s |
| Kit | `npm run guide:check` | `sarak-ui/` commitado == gerado agora (6 arquivos) | R17 | ~1,8 s |
| Kit do mantenedor | `npm run dev-kit:check` | `sarak-dev/` commitado == gerado agora (3 arquivos) **e zero ponteiro morto** na prosa | R17 · R23 · R29 | ~2,0 s |
| Pacote | `npm run package:check` | O tarball não leva proibido nem esquece obrigatório | **R19** | precisa de `dist/` |
| Deep import | `npm run deep-import:check` | `package.json.exports` só expõe raiz + subcaminhos `.css` | **R27** | ~0,3 s |
| Limites de gate | `npm run gate-limits:check` | Todo gate declara, no cabeçalho, o que não vê | **R18** | ~0,3 s |
| Tipos de token | `npm run token-types:check` | `design-token-ids.ts` commitado == gerado agora a partir do schema | **R4 · R29** | precisa do schema |
| Sincronia plan × índice | roda no Anel 1, condicional | `status` do frontmatter de cada plan bate com a coluna do [[00-indice]] | — *(vão 12, fechado)* |
| Container query literal | `npm run container-query:check` | Nenhum arquivo de produção monta classe `@min-[…]` por interpolação de template literal, **e** `sarak-base.css` restringe o scan do Tailwind (`source(none)` + `@source` explícito), **e** todo nome de classe de container query tem medida **válida** | — *(plan-39 · endurecido pela plan-44)* | ~0,3 s |
| Container garantido | `npm run container-query-boundary:check` | Arquivo de produção que **chama** `getGridStyles`/`getResponsiveStackStyles`/`getHeaderStyles`/`getResponsiveSpacingStyles` contém a classe `@container` em algum elemento — quem emite container query planta o container ([[07-responsividade-e-multidispositivo]] §6.1) | — *(plan-41)* | ~0,3 s |
| Tipos públicos | `npm run public-types:check` | Todo tipo citado em assinatura pública é **importável pelo nome** a partir do barril — o `barrel:check` cobre componente, não tipo | — *(plan-45)* | ~1 s |
| Paridade doc × persistência | `npm run persistence-doc:check` | A documentação de persistência bate com o código — mesma família do `catalog:check` | R17 *(plan-52)* | ~0,8 s |

> ⚠️ **`container-query:check` (plan-39) — o que ele NÃO vê, declarado no próprio cabeçalho (R18):** é
> **estático** — não constrói CSS. Prova só que o **nome** da classe está soletrado literal no arquivo; não
> prova que a regra correspondente foi de fato **gerada** no `dist/sarak.css` publicado (isso exige rodar
> `npm run build` e comparar, como fez a `plan-39` na entrega). Só detecta o padrão textual de abertura de
> interpolação de template literal logo após o colchete — concatenação de string escaparia (nenhum caso
> assim existe hoje, medido). É por **texto de linha, não por AST** — uma linha de comentário que reproduza o
> mesmo padrão também é acusada, de propósito: é a mesma armadilha que já quebrou o build uma vez (comentário
> textual também é varrido pelo scanner do Tailwind). Escopo: `src/**/*.{ts,tsx}`, exceto `__tests__/`, onde
> a forma interpolada é o idioma correto (o teste companheiro afirma a igualdade contra ela, para pegar
> deriva de constante). **Emenda §2.0, durante a execução:** o gate ganhou uma segunda checagem — confirma
> que `src/styles/sarak-base.css` declara `source(none)` no `@import "tailwindcss"` e mantém pelo menos um
> `@source` não vazio. Sem isso a detecção AUTOMÁTICA do Tailwind volta a varrer o repositório inteiro
> (`.md` incluído, respeitando só `.gitignore`) — foi o que derrubou `npm run build` durante esta própria
> plan: uma classe de container query inválida, citada em prosa em duas plans (`plan-35`, `plan-39`), virou
> uma media query inválida e quebrou `build:css:scoped`. Essa checagem também é textual — não valida se o
> glob do `@source` continua amplo o bastante para cobrir todo `.ts`/`.tsx` de produção.

> ⚠️ **`container-query-boundary:check` (plan-41) — o que ele NÃO vê:** é **textual e por arquivo** — prova
> que a string `@container` existe **em algum lugar** do mesmo arquivo que chama um dos quatro produtores de
> classe. **Não prova ancestralidade real em JSX**: um `@container` num elemento *irmão* passaria e
> continuaria quebrado em runtime. Não prova que a query **casa** (isso é browser real). É
> super-conservador em `getGridStyles` — marca até o caso `'auto-fit'`, que não usa container query, porque
> a estratégia é resolvida em runtime pelo tema. E não enxerga composição **entre** arquivos: hoje todo
> chamador se autossustenta, mas quem viesse a depender de um ancestral declarado em outro arquivo seria
> acusado sem motivo.

> ⚠️ **`public-types:check` (plan-45) — o que ele NÃO vê:** cobre tipo que aparece **diretamente** como tipo
> de prop, parâmetro ou retorno público. Tipo que só existe como **detalhe de composição interna** de outro
> tipo público (membro de interseção, alias local) fica fora de propósito — não é vocabulário do consumidor.
> As exclusões são **nomeadas uma a uma**, com motivo, em `gates/allowlists/publicTypeExclusions.mjs`; o
> gate não tem categoria genérica de dispensa.

**Os três gates que não estão nesta tabela porque não são de contrato**, e as regras que cobram:

| Gate | Comando | Garante | Cobra |
| --- | --- | --- | --- |
| Baseline de auditoria | `npm run audit:baseline` (Anel 2 do `pre-commit`) | A auditoria não piora — métrica a métrica contra `gates/baselines/audit-baseline.json` | **R20**, e a **contagem** de `tsc` (**R30**) quando o staged tem `.ts`/`.tsx` — `tsc` de **produção** agora é hard-block (§2.5) |
| Release | `npm run release:check` (anel de push) | Artefato publicado alterado sem tag nova não sobe para a `main` | **R21** |
| Segredos | `python gates/scripts/segredo/verificar_commit.py --raiz .` (Anel 0) | Nenhum segredo nem arquivo sensível no staged | **R22** |
| `BUILD_INFO.json` | `npm run build-info:check` (dentro de `gates:full`) | `dist/BUILD_INFO.json` commitado bate com o que o gerador produz agora | **R29** |
| Cobertura em % | `npm run coverage:check` (dentro de `gates:full`) | Piso móvel: mede, grava, e o piso só sobe — mesma mecânica do `audit:baseline` | **R8.1** — piso hoje: **71,47%** *(medido 2026-08-11; a fonte viva é `gates/baselines/coverage-floor.json`)* |
| Âncora de migração | `npm run migration-anchor:check` (gancho `version`) | Todo **MAJOR** emitido tem entrada em `docs/migracoes.md` com a versão no título | [[03-versionamento-e-release]] §5 *(plan-53)* |
| Minor sem remoção | `npm run minor-no-removal:check` (gancho `version`) | **Minor/patch nunca remove nome do barril público** (`dist/index.d.ts`) contra a última tag | [[03-versionamento-e-release]] §3 *(plan-53)* |

> ⚠️ **Os dois gates de release da `plan-53` (2026-08-19) — o que eles NÃO veem, declarado no cabeçalho de
> cada arquivo (R18):**
>
> - **`migration-anchor:check`** confere só a **presença** da âncora, nunca o conteúdo — uma nota vazia ou
>   tecnicamente errada passa igual. E só cobra **MAJOR**, nunca minor/patch.
> - **`minor-no-removal:check`** é **assimétrico de propósito**: cobra a direção que tem vítima (quem está
>   preso numa faixa `^N` recebe a quebra sem escolher) e **nunca** cobra major sem remoção. Um gate que
>   exigisse remoção para "justificar" um major teria **reprovado a `4.0.0`**, que foi 100% legítima com zero
>   export tocado.
>
> **Por que no gancho `version` e não no `pre-push`:** é o único instante em que o `package.json` já tem a
> versão nova **e a tag ainda não existe**. Barrar depois da tag seria tarde; barrar antes do bump seria
> perguntar sobre um número que ninguém decidiu.

> **Por que isto está escrito agora:** em 2026-08-02 o `check-release-tag` barrou um push imprimindo *"Regra violada"* — e a regra **não existia** em spec nenhuma. Um gate que reprova citando regra inexistente deixa o leitor sem caminho do bloqueio até o contrato. As três regras acima foram escritas em [[00-regras-e-invariantes]] (`plan-13`) a partir da leitura de cada script.

Os quatro primeiros são **rápidos e verdes**, e são os que rodam encadeados antes de compilar no `npm run build`. `package:check` é diferente: roda `npm pack --dry-run --json`, então **exige `dist/` buildado** — é por isso que ele mora no `prepublishOnly`, não no `build`.

Todos têm a mesma mecânica de leitura: **saída de uma linha quando passa**. Se a linha não apareceu, leia o erro acima dela.

⚠️ **`dev-kit:check` é o único gate com DUAS causas de reprovação** (Spec 14, criado em 2026-07-31): defasagem *e* **ponteiro morto** — caminho, `npm run <script>` ou comando `node` citado em crase na prosa do kit e que não existe. É o único gate que audita **documentação** por conteúdo, e não por hash. Ele **não** roda no `build` (o `build` produz o artefato publicado, e `sarak-dev/` não é publicado); roda no `gates:full` e, por ele, no `preversion`. Contrato completo em [[14-artefatos-do-mantenedor]].

## 2.2.1 Onde cada gate roda — a coluna que faltava

**Escrita em 2026-08-19 porque a ausência dela escondia órfãos:** quatro gates existiam, estavam verdes, e
eram rodados por **ninguém** — nem hook, nem `gates:full`, nem `run_audit`. Só se um humano digitasse o
comando. A `plan-52` fechou os quatro; esta tabela é o que impede que a situação volte sem ser notada.

| Gate | `pre-commit` | `gates:full` | `version` | `pre-push` | **CI** |
| --- | :---: | :---: | :---: | :---: | :---: |
| `barrel` · `catalog` · `zero-brand` · `guide` · `token-types` | Anel 1 | ✅ *(via `build`)* | ✅ | — | ✅ |
| `deep-import` · `public-types` | Anel 1 | — | — | — | ✅ |
| `dev-kit` | **união dos 2 gatilhos** (§2.2.1 da [[02-enforcement-por-commit]]) | ✅ 1º | ✅ | — | ✅ |
| `container-query` · `container-query-boundary` · `persistence-doc` | Anel 1 *(desde a `plan-52`)* | — | — | — | ✅ **explícito** |
| `gate-limits` | Anel 1 | — | — | — | ✅ **explícito** |
| `plan-index` | Anel 1, **condicional e pela METADE** | — | — | — | ✅ **a outra metade** |
| `audit:baseline` (+`tsc`) | Anel 2 | ✅ `--with-tsc` *(desde a `plan-52`)* | — | — | ✅ |
| `themes:diversity` | — | ✅ *(desde a `plan-52`)* | — | — | ✅ |
| `build-info` · `package` · `coverage` | — | ✅ | — | — | ✅ |
| `release:check` | — | — | — | ✅ (só `main`) | ✅ **job `release-tag`** |
| `migration-anchor` · `minor-no-removal` | — | — | ✅ *(desde a `plan-53`)* | — | — |
| Segredos (Anel 0) | ✅ **sempre** | — | — | — | ⛔ **impossível** |

⚠️ **Duas linhas desta tabela merecem leitura, não só consulta:**

- **`plan-index` roda pela metade no hook.** O `pre-commit` chama só `check-plan-index-sync.mjs`; o
  `npm run plan-index:check` é `check-plan-index-sync.mjs && generate-plan-index.mjs --check`. A segunda
  metade — comparar o índice **gerado agora** contra o commitado — só acontece na CI.
- **O Anel 0 nunca vai para a CI.** `verificar_commit.py` lê só `git diff --cached`, e no runner não há
  staging: um passo verde que não examinou nada é pior que passo ausente ([[16-integracao-continua]] §5).

**Onde a CI roda cada coisa** é [[16-integracao-continua]] §3 — esta coluna diz apenas *se* roda.

## 2.3 `npm run build` — os quatro gates encadeados + a compilação

```
npm run build
```

Encadeia `catalog:check → barrel:check → zero-brand:check → guide:check → build:js → build:css → build:css:scoped → copy-base-css → inject-css → generate-build-info`.

**Os gates vêm antes de compilar de propósito**: build vermelho por documentação defasada é comportamento desejado, não incômodo. Detalhe de cada etapa em [[05-build-e-distribuicao]].

## 2.4 `npx vitest run` — a suíte completa

```
npx vitest run
```

**Custo:** ~155 s. Não existe script `test` no `package.json` — o comando é este.

**Cobra R6 · R13 · R24 · R25 · R26 · R28.** A suíte **é** gate: ela roda no Anel 3 do `pre-push` e bloqueia ([[02-enforcement-por-commit]] §4). Seis regras dependem exclusivamente dela, e cada uma nomeia o arquivo do seu teste em [[00-regras-e-invariantes]] — `tokenContractParity`, `HostIdentity`/`EmbeddedMode`, `scopeCss`, `shippedThemesConsoleClean`, `iconCatalogParity`/`iconContract`, `checkUpdateCli.contract.test.mjs`. Todo gate novo das plans 12/16 também nasceu com **self-test** próprio (um caso pego, um liberado) — 51 casos, em 12 arquivos.

> **Regra dura: "suítes verdes" exige a suíte INTEIRA.** Rodar pasta a dedo esconde snapshot de terceiro que quebrou. Esta regra não é preferência de estilo; ela já custou uma spec aprovada com snapshot vermelho fora da pasta olhada.

Duas coisas do `vitest.config.ts` que importam para quem lê a saída:

- `pool: 'forks'` + `execArgv: ['--max-old-space-size=8192']`. O teto de heap é **explícito e comentado**: workers reutilizados acumulavam heap do jsdom e o run completo caía por OOM. Em Vitest 4 a opção é *top-level* — `poolOptions` foi removido e era **ignorado em silêncio**.
- `**/__e2e__/**` e `*.spec.ts(x)` estão **excluídos**. Os arquivos de `__e2e__` são Playwright, não Vitest.

**Ruído esperado na saída, que NÃO é falha:** `Could not parse CSS stylesheet` (jsdom não entende o CSS moderno da lib), `HTMLCanvasElement's getContext()` (a luminância híbrida usa canvas) e `Not implemented: navigation`. Todos vêm do jsdom.

## 2.5 `npx tsc --noEmit` — a verdade incômoda

```
npx tsc --noEmit
```

**Cobra R30.** Não é gate próprio e não roda no `build` nem no `gates:full`. O que o toca é o **Anel 2**
(`check-audit-baseline.mjs --with-tsc`), acionado quando o staged tem `.ts`/`.tsx`.

> ✅ **Ampliado em 2026-08-05 (`plan-12`):** a contagem agora **separa produção de teste**
> (`classifyTscOutput`, exportada e testada). **Erro de produção é hard-block sempre** — fora do mecanismo de
> baseline, exige **zero**. Erro de teste continua tolerado como piso, contra `tsc.teste` do baseline. **O
> valor corrente das duas classes é o da tabela da §3 — não repita aqui**; a composição histórica que chegou
> a existir está na §4.4.

Isso não contradiz o `auditor_typescript` (R3) estar verde: um procura o **token** `any` na AST, o outro **compila**. São checagens diferentes.

## 2.6 Playwright — REMOVIDO em 2026-08-18

**Não existe mais aparato de browser neste repositório.** Saíram o config, o script `test-ct`, as duas
dependências, o harness e os 5 arquivos de teste que dependiam deles.

O motivo é o que esta spec inteira defende: aquilo era **cobertura que existia e não era cobrada** — não
rodava no build, nem em hook, nem em CI. Verde que ninguém executa é indistinguível de sucesso, e vale menos
que vermelho declarado.

**Consequência que não some com a remoção:** a base ficou **sem nenhuma forma de medir CSS renderizado**, e
isso rebaixou a **R24** de ✅ para ⚠️. O adiamento está numerado (achado **45**, [[15-divida-conhecida]] §4) e
depende da CI para voltar a existir com onde rodar. Detalhe em [[11-testes-e-cobertura]] §7.

# 3. O BASELINE — recontado em 2026-08-05 (plans 12 e 16)

**Compare com esta tabela. Nunca espere zero.**

> ⚠️ **A fonte viva é `gates/baselines/audit-baseline.json`** (R20), regravada a cada plan. **Esta tabela é
> prosa e envelhece** — é o padrão do achado **32**, e já aconteceu aqui uma vez: entre 2026-08-05 e
> 2026-08-11 ela descreveu um repositório que não existia mais. **Diante de divergência, o JSON vence.**
> Recontada por medição direta em **2026-08-11**.

> ✅ **Recontagem completa em 2026-08-05.** As plans 12 e 16 ligaram 11 gates novos/ampliados de propósito
> (§2.1 dos §9), **sem exceção** — o vermelho novo é dívida medida e registrada, não escondida. O estado
> corrente de cada métrica, paga ou não, é a tabela abaixo. O baseline de 2026-07-27/2026-08-03 está
> superado; os números vigentes são estes.

| Gate | Comando | Baseline *(medido 2026-08-11)* |
| --- | --- | --- |
| `run_audit` | `node gates/scripts/audit/run_audit.mjs` | ❌ **exit 1 — 2 auditores vermelhos** de 12. Os outros 10 estão verdes |
| ↳ `auditor_hardcoded` (R2) | | ✅ **0** — era 35 quando o gate passou a ver `src/core`; pago |
| ↳ `auditor_ghostvars` (R7) | | ❌ **1 fantasma, 1 consumo** — era 27; o resíduo é o achado **38** ([[15-divida-conhecida]] §3.1). O sub-check de sintaxe de fallback (vão 1) está ✅ |
| ↳ `auditor_typescript` (R3) | | ✅ **0** `any` |
| ↳ `auditor_coverage` (R8) | | ✅ **0** componentes sem teste |
| ↳ `auditor_arquitetura` (R1) | | ✅ **0** quebras de hierarquia |
| ↳ `auditor_cleancode` (R9) | | ✅ **0** violações |
| ↳ `auditor_paridade` (R4) | | ✅ **423 / 423 / 423** — schema ↔ banco ↔ catálogo (13 arquivos). Era 409 |
| ↳ `auditor_presets` (R5) | | ✅ gabarito vivo de **423 chaves**; **125 itens** auditados (**23 temas** + 102 presets), **0 órfãs**. Era 120 itens com 18 temas |
| ↳ `auditor_authcoupling` (R32) | | ✅ **0** — nasceu verde e continua |
| ↳ `auditor_sectionpointers` (R23·R17) | | ✅ **0** ponteiros mortos — eram 27 |
| ↳ `auditor_composicaoatomica` (R10) | | ❌ **2** — `SarakMultiSelect` e `SarakUploader`, ambas declaradas. Eram 47, e a fronteira deixou de ser por pasta (ver **R10**) |
| ↳ `auditor_contraste` (R31) | | ✅ **0 no modo nativo · 0 no modo oposto**, 23 temas · **18 isentos** de contraparte (os legados) · **25 pares-tema pulados**, que não são aprovação. Nasceu em 188 |
| `barrel:check` **(R14)** | `npm run barrel:check` | ✅ **77 componentes, 0 faltas** |
| `catalog:check` **(R17·R29)** | `npm run catalog:check` | ✅ em dia |
| `zero-brand:check` **(R12)** | `npm run zero-brand:check` | ✅ **363 arquivos varridos, 0 violações** — o número que importa é o de violações |
| `guide:check` **(R17·R29)** | `npm run guide:check` | ✅ kit em dia (6 arquivos) |
| `dev-kit:check` **(R17·R23·R29)** | `npm run dev-kit:check` | ✅ kit em dia (3 arquivos, **0 ponteiros mortos**) — não valida ponteiro de **seção**, que é o `auditor_sectionpointers` |
| `deep-import:check` **(R27)** | `npm run deep-import:check` | ✅ **0** — `exports` só expõe a raiz e subcaminhos de CSS |
| `gate-limits:check` **(R18)** | `npm run gate-limits:check` | ✅ **todos** os scripts de `gates/scripts/` declaram o que não veem — a **relação**, não a cifra. *(A contagem é fonte viva: o próprio gate a imprime. Era 29 em 2026-08-11, 30 em 2026-08-12, **35** em 2026-08-19 com os dois gates da `plan-53`; publicar o número aqui foi o que o deixou errado três vezes — [[15-divida-conhecida]] §3.3.)* |
| `token-types:check` **(R4·R29)** | `npm run token-types:check` | ✅ **423 tokens**, em dia |
| `build-info:check` **(R29)** | `npm run build-info:check` | ✅ íntegro |
| `coverage:check` **(R8.1)** | `npm run coverage:check` | ✅ **72,43% contra piso de 71,47%** — piso móvel: melhora regrava (só com `--write`), piora bloqueia |
| suíte **(R6·R13·R24·R25·R26·R28·R33·R34)** | `npx vitest run` | ✅ **317 arquivos / 1376 testes**, 100% verde |
| `tsc` **(R30)** | `npx tsc --noEmit` | ✅ **0 erros**, produção e teste. Baseline em 0 ⇒ qualquer erro novo bloqueia |
| `build` | `npm run build` | 4 gates + as etapas de compilação |
| `package:check` **(R19)** | `npm run package:check` | exige `dist/` buildado |
| `audit:baseline` **(R20·R30)** | `npm run audit:baseline` | ✅ igual ao baseline de **2026-08-11** — nenhuma regressão |
| `release:check` **(R21)** | `npm run release:check` | depende do estado do git na hora; **não tem baseline** — ou o artefato mudou desde a tag, ou não |
| Anel 0 — segredos **(R22)** | `python gates/scripts/segredo/verificar_commit.py --raiz .` | ✅ verde é a **única** saída aceitável — não há baseline nem escopo: segredo é segredo |
| Sincronia plan × índice *(vão 12)* | `npm run plan-index:check` | ✅ `status` do frontmatter de cada plan bate com a coluna do [[00-indice]] |

## 3.1 ✅ RESOLVIDO em 2026-07-28 — o teste não-hermético que segurava a suíte

> **Estado atual: a suíte fecha 100% verde (280 arquivos / 891 testes).** A seção fica registrada porque a
> causa é instrutiva e porque duas decisões de arquitetura foram tomadas enquanto o defeito existia
> (o Anel 3 manual de [[02-enforcement-por-commit]]). O relato abaixo descreve o defeito **como ele era**;
> o fecho está no fim da seção.

### O defeito (medição de 2026-07-27)

Naquela medição, `280 arquivos / 890 testes` com **1 teste falhando**.

```
FAIL  bin/scaffold/__tests__/packageManager.test.mjs
      > detectPackageManager (Spec 51 — L2) > sem nenhum sinal, o default é npm
AssertionError: expected { name: 'npm', … } to match object { name: 'npm', source: 'default' }
-   "source": "default",
+   "source": "lockfile",
```

**Causa, reproduzida em isolamento — o teste é dependente do ambiente, não há regressão de código:**

O teste cria um diretório temporário e afirma que ali não há "sinal nenhum" de gerenciador. Mas `detectPackageManager` **sobe a árvore até a raiz do volume** (`packageManager.mjs:43-52`, `:64`) — comportamento correto e testado de propósito no caso "monorepo herda da raiz". O diretório temporário mora sob `C:\Users\Igor\AppData\Local\Temp\`, e a subida atravessa `C:\Users\Igor\`:

```
tmpDir:  C:\Users\Igor\AppData\Local\Temp\sarak-pm-pcqm72
detect:  { name: 'npm', source: 'lockfile', dir: 'C:\Users\Igor' }
```

Existe um `C:\Users\Igor\package-lock.json` (com `mammoth`, `playwright-core`, `puppeteer-core` — **nada a ver com este repositório**), criado por um `npm install` avulso no diretório do usuário. O teste passa a acusar `source: 'lockfile'` porque **encontrou um lockfile de verdade**, exatamente como deveria.

**O que isto é:** um teste que assume que não há lockfile em nenhum ancestral de `os.tmpdir()` — premissa que não é verdade em qualquer máquina. Ele passa ou falha conforme o estado do `$HOME` de quem roda.

**O que isto NÃO é:** regressão desta campanha (nenhum arquivo de `src/` ou `bin/` foi tocado) nem defeito do `detectPackageManager`.

### O fecho (2026-07-28 — P11-D)

Aplicada a primeira das duas correções previstas: `ancestorDirs` e `detectPackageManager` ganharam uma
**fronteira de parada opcional** (`stopAt`), e o caso passou a declarar o recorte em que afirma "não há
sinal nenhum" (`bin/scaffold/packageManager.mjs:42-66`, `:78`; `bin/scaffold/__tests__/packageManager.test.mjs:66-93`).

**O comportamento de produção não mudou.** Nenhum chamador real passa `stopAt`
(`bin/scaffold/runInit.mjs:40`, `bin/scaffold/checkUpdate/consumerContext.mjs:29,45,55,84`): sem
fronteira, a subida continua indo até a raiz do volume — que é a feature do caso monorepo. A
hermeticidade virou **propriedade do contrato da função**, não sorte do sistema de arquivos.

Um caso novo prova as duas direções sem depender do ambiente: com um lockfile plantado num ancestral
sintético, a detecção o acha **sem** `stopAt` (`source: 'lockfile'`) e não o vê **com** `stopAt`
(`source: 'default'`).

**Consequência para [[02-enforcement-por-commit]]:** cai a ressalva de que um anel rodando a suíte
completa bloquearia por estado do `$HOME`. A suíte é, a partir daqui, sinal confiável para automação —
é o que destrava o `preversion` do ciclo de release.

## 3.2 ✅ RESOLVIDO em 2026-07-29 — o subprojeto carona que fazia a suíte mentir num clone limpo

> **Estado atual: `Template-Ts/` não existe mais no repositório** (removido no P20-A, decisão D7).
> A seção fica registrada porque a lição é a mais transferível de toda a campanha: **o único gate que
> alcançava o problema era justamente o que ele enganava.**

### O defeito (achado do P12-C, 2026-07-28, medido num clone de verdade)

`Template-Ts/` era um projeto TypeScript **não relacionado à biblioteca** (`template-chat-ts`: um
template de backend de chat com express/supabase/pg), com **85 arquivos versionados** aqui — 48 em
`src/`, 27 em `dist/` compilado e commitado, 6 arquivos de teste. Os testes dele eram coletados pela
suíte (o `exclude` do `vitest.config.ts` não os filtrava) e passavam **naquela máquina** porque existia
um `Template-Ts/node_modules/` **local e não versionado** com `@supabase/supabase-js` dentro. Num clone
limpo:

```
FAIL  Template-Ts/tests/unit/toolbox/database/supabase_database.test.ts
Error: Failed to resolve import "@supabase/supabase-js" — Does the file exist?
Test Files  3 failed | 278 passed (281)
```

**Era o mesmo defeito da §3.1, um nível acima:** verde que depende de estado local que não viaja no
repositório. A diferença é que ali não era um teste da lib — era um subprojeto carona.

**A lição, que é o motivo desta seção sobreviver:** os outros gates não o viam por construção — `tsc`
não o compilava (`"include": ["src"]`), o tarball já o proibia
(`gates/scripts/contrato/check-package-contents.mjs:14`), e nenhum auditor de `run_audit.mjs` (§2.1) varre fora de `src/`. Só a suíte o
alcançava, e para a suíte ele era verde. **Um diretório inteiro atravessou 330 commits invisível porque
o único instrumento que o media era o que ele enganava.**

### O fecho (2026-07-29 — P20-A)

O diretório foi removido (85 arquivos versionados). Princípio do dono que decidiu: *"esta é uma
biblioteca genérica e não deve depender de nenhum módulo."* O histórico permanece no git — quem
precisar recuperar, o diretório entrou inteiro num commit só: **`c43293e chore: setup Template-Ts and
agents structure`**.

| Suíte | Arquivos | Testes | Veredito |
| --- | --- | --- | --- |
| **ANTES** (2026-07-29, com o diretório) | 281 | 901 | ✅ verde (166,3 s) — mas **só nesta máquina** |
| **DEPOIS** (2026-07-29, sem o diretório) | **275** | **879** | ✅ verde (167,0 s) — **e verde em qualquer clone** |

Saíram exatamente os **6 arquivos / 22 testes** do subprojeto. O número caiu e o **sinal** subiu: o
verde de hoje não depende de nenhuma pasta ausente do git. **Este é o novo baseline da suíte** — a
tabela da §3 acima já o reflete.

Duas coisas deliberadamente **não** feitas:

- **`vitest.config.ts` não ganhou exclusão nenhuma.** Excluir um caminho que não existe mais seria a
  regra 2 da §6 (*nunca excluir pasta do escopo de um auditor*) aplicada ao contrário — sumindo o
  diretório, o `include` default para de achá-lo, sem precisar de ajuda.
- **A entrada `'Template-Ts/'` FICA** na lista de proibidos de `check-package-contents.mjs:14`, agora
  com o motivo escrito ao lado. É a trava mais barata contra um carona reaparecer; uma linha de
  allowlist negativa custa menos que redescobrir o problema.

**Consequência para o enforcement:** cai o último impedimento técnico ao Anel 3 (`pre-push` rodando a
suíte) de [[02-enforcement-por-commit]]. Com a §3.1 e esta §3.2 fechadas, a suíte é sinal confiável
para automação em qualquer máquina — não só nesta.

# 4. Dívida técnica conhecida

Cada item traz `arquivo:linha`, por que ainda existe, o que fecharia — e **se algum gate o vê hoje**. Essa última coluna é a mais importante: é ela que revela o que o conjunto de gates **não** enxerga.

## 4.1 ✅ Hardcode — FECHADO em 2026-08-03

**Era:** `letterSpacing: 'var(--sarak-h1-ls, -1px)'` em `SarakTypography.tsx`, acusado como unidade solta.
Já estava classificado aqui como **"limitação do detector, não hardcode real"** — `sanitizeFallbacks()` removia
`var(--x, 12px)` mas a regex não aceitava **sinal**, então o `-1px` sobrevivia à limpeza.

Esta seção oferecia duas saídas: trocar o átomo por `calc(var(--sarak-h1-ls, 1px) * -1)`, *"a convenção
adotada"*, **ou** corrigir a regex. A `plan-07` mediu as duas e o dono escolheu a segunda.

### Por que a "convenção" NÃO servia aqui

`h1LetterSpacing` (`schema/typography.ts:154-163`) é `type: 'slider'`, `unit: 'px'`,
`constraints: { min: -5, max: 10 }`, `defaultValue: -1`: **o token carrega o próprio sinal**. A engine emite
`--sarak-h1-ls: -1px`, e `calc(-1px * -1)` resulta **`+1px`** — o espaçamento do H1 **inverteria** para todo
consumidor, e o erro cresceria conforme o usuário mexesse no slider.

Pior: **teria passado no gate.** O `sanitizeFallbacks` limparia o `var(--sarak-h1-ls, 1px)` e o `* -1`
sobreviveria sem unidade. Número em zero, tela errada — exatamente o que a §6 item 3 proíbe.

> `calc(var(--x, N) * -1)` só é convenção válida quando o token é **magnitude** e apenas o *fallback* precisa
> do sinal. Onde o token pode ser negativo, ela inverte. **A regra geral estava escrita larga demais.**

### A correção aplicada

`auditor_hardcoded.mjs:126` — `[0-9.]+` → `[-+]?[0-9.]+`, **uma linha**. `UNIT_RE` e `HEX_RE` ficaram
intactos, então **valor negativo escrito solto (fora de `var(...)`) continua sendo violação**: o que mudou foi
só o reconhecimento do fallback documentado. O limite corrigido está escrito no cabeçalho da função (R18).

**Prova de que nada mais deixou de ser acusado:** as duas versões da regex foram rodadas sobre **6.720 literais
de string** de `src/components/` e `src/features/` — o `VALUE_SCOPE` do auditor — comparando o veredito de cada
uma. **Exatamente 1 veredito mudou** (o alvo), e **0 passaram a ser acusados**: a mudança só relaxa, e relaxa
num único ponto.

**Estado:** `Valor (hex/px/rem/em) : 0`. Nenhum átomo foi tocado — o defeito estava no detector, e é onde foi
consertado.

## 4.2 ✅ FECHADO em 2026-08-05 — variáveis-fantasma (o histórico abaixo é anterior à `plan-07`)

> Os dois fantasmas descritos abaixo fecharam: `--token` continua falso positivo declarado (não é código, é
> JSDoc), e `--sarak-shell-brand-logo-size` foi criado nas 3 fontes pela `plan-07`. O baseline de
> `auditor_ghostvars` **atual não é mais este** — a `plan-12` ampliou `CONSUMER_DIRS` depois deste fecho e
> revelou 27 novos consumos em `src/styles/`+`src/core/`; o estado corrente é a tabela da §3 (hoje: **1**). O
> relato abaixo fica como histórico de como os dois primeiros fantasmas foram diagnosticados.

**Localizados nesta execução, um a um:**

| Variável | Consumo | Veredito |
| --- | --- | --- |
| `--token` | `src/components/atomic/Atoms/SarakTypography.tsx:32` | ❌ **FALSO POSITIVO.** Está dentro de um comentário JSDoc: `/** Estilo por variante — 100% via var(--token, fallback) … */`. O auditor varre **linha a linha por regex** (`auditor_ghostvars.mjs:66-75`), não por AST — comentário conta como consumo |
| `--sarak-button-radius` | `src/components/atomic/Navigation/SarakShellNav.tsx:70` | ❌ **FALSO POSITIVO** *(reclassificado em 2026-08-03 — ver abaixo)*. ~~REAL: o consumo escreveu `button` onde a engine emite `btn`~~ |
| `--sarak-shell-brand-logo-size` | `src/components/atomic/Navigation/SarakShellNav.tsx:134` | ✅ **REAL, e sem contrapartida.** Não existe token de tamanho de logo de marca em schema nenhum. Fechar não é renomear: é **Expansão** (R11) — criar o token nas 3 fontes. Fallback `28px` |

> 🔁 **Reclassificação de 2026-08-03 (`plan-06`): `--sarak-button-radius` NÃO é fantasma — é emitida.**
> `src/core/Provider/manifest.ts:198` declara `buttonRadius: { vars: ['--button-radius', '--sarak-button-radius'] }`.
> O veredito anterior olhou **só o schema** — que auto-deriva `--sarak-<kebab(id)>` e por isso só oferecia
> `--sarak-btn-border-radius` — e não olhou o **manifesto**, que é a outra fonte emissora. O erro não foi de
> desatenção: **o registro do próprio auditor tinha o mesmo buraco**, então a ferramenta confirmava a leitura
> errada. Ampliar o registro (§9.3) fez a acusação cair sozinha.

> **A contagem honesta do baseline passou a ser 1 fantasma real + 1 falso positivo.** O gate reporta **2**
> desde a ampliação do registro, e o `gates/baselines/audit-baseline.json` foi **regravado para 2 em
> 2026-08-03** (`npm run audit:baseline -- --write`).
>
> **Por que regravar, e não conviver com o aviso:** o baseline é **teto**. Mantê-lo em 3 quando o real é 2
> reservaria uma **vaga grátis** — o próximo fantasma real levaria a contagem de 2 para 3 e **não bloquearia
> nada**. Um teto folgado é um gate desligado pela metade.
>
> A desconfiança da §6.1 — *"baseline que melhora sem que ninguém tenha consertado nada é sinal de fraude"* —
> está satisfeita, e é assim que se satisfaz: **causa nomeada** (`manifest.ts:198`), **mecanismo nomeado** (o
> registro passou de 2 para 4 fontes emissoras) e **reconferência independente** no código. Não houve conserto
> de código; houve conserto do **verificador**, que é a única razão legítima para este número cair.

**Nota sobre a correção do falso positivo:** trocar `var(--token, fallback)` por outra grafia no comentário faria o gate ir a 2 sem consertar nada. Isso é maquiagem, não correção — ver §6.

## 4.3 As duas LACUNAS DE COBERTURA do `auditor_ghostvars` (o achado mais grave)

O auditor varre **apenas `src/components/` e `src/features/`** (`auditor_ghostvars.mjs:14`). Duas consequências, ambas medidas nesta execução com uma sonda read-only que reaplica a lógica do próprio auditor em escopo ampliado:

> 🔁 **Os números desta seção são de 2026-07-27 e foram SUPERADOS pela §9.2** *(reconciliado em 2026-08-03)*.
> Eles foram medidos com o **registro incompleto** — o auditor lia 2 das 4 fontes emissoras, então contava como
> fantasma o que o manifesto e o runtime emitiam. Depois que a `plan-06` ampliou o registro (14.179 → 15.394),
> a mesma sonda devolve **16 vars / 24 consumos** em `styles/` e **4 vars / 11 consumos** em `core/`, não os
> `29/43` e `7/20` de baixo.
>
> **A seção fica** porque a diferença entre os dois pares **é a medida do próprio vão nº 4** — é a prova
> quantitativa de que ampliar escopo sem ampliar registro produziria ~85 acusações falsas. **Para saber o que
> vale hoje, use a §9.2.** Estes números são histórico, e é assim que devem ser lidos.

### a) `src/styles/` é tratado como FONTE, nunca como consumidora

**29 variáveis distintas / 43 consumos** em `src/styles/*.css` não são cruzados contra o registro. Entre eles, **os 2 usos vivos do namespace PROIBIDO `--sx-*`**:

```css
/* src/styles/_utilities.css:80 e :89 */
background: var(--sarak-range-active-bg, var(--sx-color-primary-base));
```

Ninguém emite `--sx-color-primary-base` — o fallback de 2º nível **resolve para vazio**. Ou seja: a regra R7 declara `--sx-*` proibido, o gate está verde, e o namespace está vivo no CSS.

**O conserto tem DUAS metades** e as duas importam: (1) as 2 linhas de CSS; (2) ampliar o escopo do auditor para tratar `src/styles/` também como consumidor. **Não é feito aqui** porque mexer em gate durante esta campanha move o baseline que esta própria spec está fixando. Vira spec própria.

### b) `src/core/` está inteiramente fora do escopo

**7 variáveis distintas / 20 consumos.** Nem todos são fantasmas de verdade — a sonda herda o mesmo registro incompleto do auditor (ver §4.3.c). Os classificados:

| Variável | Consumo | Veredito |
| --- | --- | --- |
| `--sarak-sidebar-active` | `src/core/Shell/Components/SidebarNav.tsx:142` | ✅ **REAL — quebra de nome.** A engine emite `--sarak-sidebar-active-color` (`schema/navigation.ts:97`, `manifest.ts:205`) |
| `--sarak-topbar-active` | `src/core/Shell/Components/TopbarNav.tsx:123` e `:124` | ✅ **REAL — mesma quebra.** Emitido: `--sarak-topbar-active-color` (`schema/navigation.ts:162`, `manifest.ts:207`) |
| `--theme-on-primary` | 9 consumos em `core/Shell/**` e `core/Design/presets/components/buttons.ts:13` | ❌ **FALSO POSITIVO** — ver §4.3.c |
| `--x`, `--sarak-` | `resolveToken.ts:11`/`:102`, `validation.ts:43`, `types.ts:53` | ❌ Falso positivo: texto de comentário/documentação |
| `--glass-blur`, `--theme-background` | `DockNav.tsx:34`, `presets/components/inputs.ts:34`/`:69` | ⚠️ **Não apurado** — registrado para verificação |

Os dois primeiros confirmam um item antigo do `backlog_cobertura.md` que **ainda procede** — e que **nenhum gate vê**, porque mora em `core/`.

### c) O registro do auditor é mais estreito do que o próprio cabeçalho dele afirma

O comentário de `auditor_ghostvars.mjs:5-10` diz que o registro vem de "`useDesignVariables.ts`, schemas via `cssVars`, aliases de `src/styles/*.css`". **O código não lê `useDesignVariables.ts`** — a construção do registro (`:37-61`) abre só `src/core/Design/schema/*.ts` e `src/styles/*.css`.

**Prova:** `--theme-on-primary` é emitida em runtime por `src/core/Design/hooks/useDesignVariables.ts:183` (`variables['--theme-on-primary'] = …`) e **não** está no registro.

**Por que isso importa:** hoje nenhum consumo dentro do escopo varrido depende dessa família, então o gate segue verde. Mas a lacuna é de **falso positivo** — o dia em que um componente consumir uma variável emitida só em runtime, o auditor vai acusar fantasma numa variável que existe. Registrado para quem for ampliar o escopo: **ampliar o escopo sem ampliar o registro produz acusação falsa.**

## 4.4 ✅ Produção fechada em 2026-08-03 (`plan-07`) — a classe de teste também zerou

Os 4 erros de produção (histórico: `useStructuralStyles.ts:30,71,94` — `TS2345`, `ResponsiveValue<number>` não
aceito por helper `string | number`; `ThemeCustomizationTab.tsx:86` — `TS2322`, união de toast incompatível)
fecharam: a `plan-07` criou o tipo `GapValue` e alargou a assinatura, e estreitou a união do toast para os
valores reais. **Confirmado 0 erros de produção** desde então.

**A classe de teste, que chegou a ter erros próprios** (histórico: `BarrelParity.test.ts` (4) e
`ZeroBrand.test.ts` (2) importando `scripts/*.mjs` sem declaração de tipo — `TS7016`/`TS7006`;
`Templates/__tests__/Spec21.spec.tsx` (3) com props faltando em fixture; `shippedThemesConsoleClean.test.ts`
(1) com parâmetro implícito) **também zerou.** O valor corrente das duas classes é o da tabela da §3 — não
presuma o número aqui.

**Visível em gate:** ✅ **agora sim, para produção.** A `plan-12` (2026-08-05) separou a contagem por classe no Anel 2 (`classifyTscOutput`) e tornou produção **hard-block a zero**, fora do mecanismo de baseline. Teste continua tolerado como piso (§3).

## 4.5 Dívidas estruturais herdadas da Fase 2

| # | Dívida | Onde | Visível em gate? |
| --- | --- | --- | --- |
| 1 | **`atomic/Tables/` é categoria sem componente** — só `hooks/useTableLayoutStyles.ts`; `SarakTable.tsx`/`SarakTableCards.tsx` moram em `Templates/` e importam o hook cruzando a fronteira de categoria; `grep "atomic/Tables"` = **0** | `src/components/atomic/Tables/` | ❌ **Não.** `auditor_arquitetura` só cobra `components ⊅ features` e `core ⊅ features`; cruzar categoria dentro de `atomic/` não é violação para nenhum gate |
| 3 | ✅ **FECHADA em 2026-08-05 (`plan-09`)** — **`CustomizationPanel` eager no barril** | `src/index.ts:50` | ✅ **Sim, agora.** Virou `React.lazy` com `Suspense` interno (padrão `SarakChartEngine`), preservando o tipo público `React.FC`. Boot: **−75,1%** |
| 4 | ✅ **FECHADA em P26** (2026-07-29) — **3 das 4 categorias de `engines/` estavam fora do barril** (`flows`, `chat`, `visuals`) e o gate não via | `src/components/engines/` | ✅ **Sim, agora.** `engines/` entrou no escopo do `barrel:check` (78 → **81** componentes); Chat e Flow foram expostos atrás de fronteira lazy e o Visual foi removido. Ver [[03-superficie-publica]] §9 |
| 6 | ✅ **FECHADA em 2026-08-05 (`plan-09`)** — **`upgradeThemePayload` declarava `partialMode` e nunca usava** | `src/core/Design/master-map.ts:148` | ✅ **Sim, agora.** Parâmetro removido; confirmado zero chamador afetado |

**O que fecharia o item 1** (a taxonomia de `atomic/Tables/`): decisão de taxonomia — mover o componente para `Tables/`, mover o hook para `Templates/`, ou aceitar e documentar. Continua aberto; não foi tocado por nenhuma plan desta rodada.

> **A lição da nº 4 vale para a nº 2 (o `--sx-*` em `src/styles/`), que continua aberta:** as duas são a mesma classe de defeito — *gate com escopo menor que a regra*. A nº 4 foi fechada **ampliando o escopo do gate junto com o conserto**; a nº 2 espera a mesma dupla (§4.3). Consertar só o código deixaria o vão do gate de pé para a próxima violação.

**Nenhum destes é corrigido por esta spec.** Documentar com precisão é a entrega.

## 4.6 Um item do backlog histórico que NÃO procede mais

`plan/backlog_cobertura.md` registrava `--sarak-shadow-glow` como existindo "só como alias estático, fora do pipeline dinâmico". **Reverificado:** `src/styles/_theme.css:69` define

```css
--sarak-shadow-glow: var(--sarak-card-glow-color, rgba(0, 242, 255, 0.1));
```

e `--sarak-card-glow-color` é token real (`id: 'cardGlowColor'`, `src/core/Design/schema/cards.ts:307`). O alias **encaminha para um token dinâmico** — a troca de tema chega nele. O item está fechado; foi trazido de volta só para não ser "redescoberto" numa próxima auditoria.

# 5. A regra de ordem de correção — raiz primeiro

Ao corrigir um consumo fantasma **compartilhado por vários componentes**, corrija a **fonte comum** (o Hook Controlador, o alias em `src/styles/`, o schema) **antes** dos consumidores individuais.

Na ordem inversa, cada consumidor é migrado duas vezes: uma para o nome errado, outra quando a raiz finalmente muda. É o erro que a campanha de ghost vars cometeu uma vez e não repetiu.

# 6. A regra anti-afrouxamento

Três coisas são **proibidas**, sem exceção:

1. **Nunca relaxar a allowlist de um auditor para mascarar violação real.** Toda entrada de allowlist carrega motivo escrito, e o motivo tem que ser uma razão de negócio que a Configuração não resolve — não "estava vermelho".
2. **Nunca excluir pasta do escopo de um auditor para baixar a contagem.** As lacunas da §4.3 mostram exatamente o que acontece quando o escopo é menor que a regra: o gate fica verde e a regra fica violada. Estreitar de propósito é fabricar isso.
3. **Nunca "corrigir" o sintoma que o detector vê em vez do defeito.** Trocar a grafia do comentário para o `--token` sumir (§4.2), mover hardcode para `.ts` ou para uma `const` interpolada (R2.4), renomear para escapar de uma regex — tudo isso baixa o número sem consertar nada, e ainda destrói a única evidência do problema.

> Um baseline que melhora sem que ninguém tenha consertado nada é sinal de fraude no gate, não de progresso.

# 7. Critérios de aceite

- [x] Rodar os comandos deste documento reproduz exatamente a tabela da §3. As duas exceções que existiam foram fechadas: §3.1 (teste não-hermético, 2026-07-28) e §3.2 (subprojeto carona, 2026-07-29).
- [x] Todo item de dívida tem `arquivo:linha` e a coluna "visível em gate".
- [x] Todos os auditores (a lista viva está no array de `run_audit.mjs`, §2.1) e os 5 scripts de check foram lidos um por um antes de descritos.
- [x] Nenhum item do baseline foi corrigido nesta entrega.
- [x] **Todo gate cita o número da regra que cobra** — incluindo os três que não são de contrato (`audit:baseline` → R20/R30, `release:check` → R21, Anel 0 → R22) e o Playwright, que declara **não** cobrar regra nenhuma *(2026-08-02, `plan-13`)*.

# 8. Plano de testes (Quality Gate)

Esta spec é verificada **executando-a**:

- `node gates/scripts/audit/run_audit.mjs` → tem que bater com a §3, incluindo os vermelhos.
- `npm run barrel:check && npm run catalog:check && npm run zero-brand:check && npm run guide:check` → quatro verdes.
- `npx vitest run` → 100% verde, em qualquer máquina (§3.1 e §3.2 fechadas). A contagem corrente de arquivos/testes vive na tabela da §3.
- `npx tsc --noEmit` → produção em 0 (hard-block). A contagem corrente de teste vive na tabela da §3 e no baseline (`gates/baselines/audit-baseline.json`); a composição histórica está na §4.4.

# 9. A matriz de cobertura — escopo do gate × escopo da regra

> **Medida pela `plan-06` em 2026-08-03**, lendo o **código** de cada gate, nunca o comentário dele. Esta é a
> seção que responde à pergunta que a §4 não responde: não *"que dívida existe"*, mas **"o que o verificador
> não enxerga"**. As duas são diferentes — dívida é código que viola regra escrita; **vão é o gate verde por
> cima da violação**.

**Esta seção é a lista de compras da `plan-12`.** Cada linha tem destino, e nenhum item aqui foi construído
pela `plan-06`: investigar e construir são plans diferentes, de propósito.

## 9.1 O vocabulário

- **Δ declarado** — o limite está escrito no código do gate. É honesto: quem lê o gate sabe o que ele não vê.
- **Δ silencioso** — o gate omite o limite, e por isso é lido como cobertura total. **Só este é defeito.**
- **Exposição** — o que vive **hoje** dentro do vão, contado. Exposição zero não apaga o vão: significa que
  declarar o limite basta, e ampliar o escopo não se paga.

## 9.2 Os 14 vãos — estado em 2026-08-07

> ✅ **12 dos 14 fecharam** nas plans 12 e 16 (2026-08-05), a maioria como **gate construído** (a exposição que
> ele revelou virou dívida no baseline da §3, não sumiu). Restam **13** (medido, gate não construído) e **14**
> (narrowed, não zerado por definição de R30).

| # | Regra | Gate · `arquivo:linha` | Estado |
|---|---|---|---|
| 1 | R4 · R29 | `token-types:check` | ✅ **FECHADO** — `design-token-ids.ts` regenerado (304→409) e o gerador registrado (`plan-12` Lote A) |
| 2 | R7 | `auditor_ghostvars.mjs` | ✅ **FECHADO como gate** — `CONSUMER_DIRS` passou a tratar `src/styles/` como consumidora. Exposição revelada: parte dos 27 consumos, hoje reduzida (§3) |
| 3 | R7 | `auditor_ghostvars.mjs` | ✅ **FECHADO como gate** — `src/core/` entrou no escopo. Mesma observação do vão 2 |
| 4 | R7 | o registro do `auditor_ghostvars.mjs` | ✅ **FECHADO** pela `plan-06` (§9.3) |
| 5 | R2 | `auditor_hardcoded.mjs` | ✅ **FECHADO como gate** — `VALUE_SCOPE` ganhou `src/core`. Exposição revelada: **35 violações**, hoje paga (§3) |
| 6 | R8 | `auditor_coverage.mjs` | ✅ **FECHADO** — `shared/`/`effects/`/`constants/` no escopo; nasceu **verde** (os testes já existiam, escritos pela `plan-07`) |
| 7 | R23 · R17 | `auditor_sectionpointers.mjs` (novo) | ✅ **FECHADO como gate** — detector por autorreferência construído (`plan-12`). Exposição: **27 ponteiros mortos**, hoje **0** (§3), incluindo o achado 29 |
| 8 | R29 | `build-info:check` (novo) | ✅ **FECHADO** — `dist/BUILD_INFO.json` ganhou modo `--check` |
| 9 | R14 · R17 | `scripts/publicComponents.mjs:172-194` | ✅ **DECLARADO** pela `plan-06` — exposição zero |
| 10 | R12 | `check-zero-brand.mjs:19-40` | ✅ **DECLARADO** pela `plan-06` — exposição zero |
| 11 | R8 *(via suíte)* | `.githooks/pre-push` | ✅ **FECHADO** — `gates/` entrou no filtro de escopo do Anel 3 (`plan-12`) |
| 12 | — | `check-plan-index-sync.mjs` (novo) | ✅ **FECHADO** — sincronia plan × [[00-indice]] agora é gate (`plan-12`) |
| 13 | R17 | `catalog:check` · `guide:check` · `dev-kit:check` | ⏳ **ABERTO** — a metade **prosa manual** continua sem gate geral (falso-positivo alto). A `plan-12` mediu um caso novo em passagem: `arquitetura/04:52` desatualizado (achado 32 em [[15-divida-conhecida]]) |
| 14 | R30 | `check-audit-baseline.mjs` *(Anel 2)* | ⚠️ **NARROWED, não fechado** — produção agora é **hard-block a zero** (fechado pela `plan-07` + separado pela `plan-12`); teste continua tolerado como piso, valor corrente na tabela da §3 — por definição de R30, não por vão |

**Fora da matriz, e não esquecidas:** as três de **conduta** R11, R15 e R16 (🔴), que permanecem assim por
decisão do dono. **R31** tinha o mesmo estágio até 2026-08-10: hoje tem gate (`auditor_contraste.mjs`) e é
⚠️, não ⏳ — detalhe em §9.5.

## 9.3 O vão nº 4 — a prova de que registro vem antes de escopo

**Este é o único vão que a `plan-06` fechou, e ele foi fechado sozinho e primeiro, de propósito.** O registro
do `auditor_ghostvars` era construído de **2 de 4** fontes emissoras: lia `schema/*.ts` e `styles/*.css`, e
ignorava `src/core/Provider/manifest.ts` (o mapa token→var, **173 vars**) e
`src/core/Design/hooks/useDesignVariables.ts` (**37**).

A cadeia medida, aplicando a **mesma** varredura de escopo ampliado três vezes:

| Registro usado | Acusações em `src/styles/` |
| --- | --- |
| o do auditor (2 fontes) | **36 vars / 128 consumos** |
| mais `manifest.ts` e `useDesignVariables.ts` | **22 vars / 109 consumos** |
| mais a família de nome computado `-rgb` | **16 vars / 24 consumos** |

**~85 daquelas acusações eram falsas.** Ampliar o escopo (vãos 2, 3 e 5) com o registro antigo teria produzido
uma enxurrada de vermelho em variáveis que **existem** — e gate que acusa o que existe é abandonado em uma
semana. É a advertência da §4.3.c virando número.

> **A família `-rgb` não precisou de código novo:** `GENERATED_SUFFIXES[0]` já a cobria. O que faltava era
> **base** no registro — e é o manifesto que a fornece. Vale registrar porque é contraintuitivo: o sufixo
> resolve `--theme-primary-rgb` **apenas** se `--theme-primary` estiver no registro.

**Efeito colateral que corrige esta própria spec:** com o manifesto no registro, o consumo de
`--sarak-button-radius` (`SarakShellNav.tsx:70`) **resolve**. A §4.2 o classificava como fantasma REAL; a
classificação estava errada, e o motivo é instrutivo — ela olhou o schema (que auto-deriva
`--sarak-<kebab(id)>`) e não o manifesto, que declara `--sarak-button-radius` explicitamente em `:198`.
A contagem de fantasmas caiu de **3 para 2**, e o único fantasma real é `--sarak-shell-brand-logo-size`.

## 9.4 Por que o detector de `§N.N` ainda não sobe

O detector é barato — 40 linhas — e a `plan-06` o escreveu como sonda. Ele acusou **23** referências; **4 são
mortas de verdade**. As outras 19 são ruído de duas classes que precisam estar codificadas **antes** de o gate
existir, ou ele reprova o repositório inteiro:

1. **`§7.3` significa "item 3 da seção 7"**, não um heading `7.3`. É convenção viva em `00-prompt-executor` §7,
   `01-gates` §6 e `10-seguranca` §5.
2. **Alvo com `## 2.1` sem um `# 2` pai** — o heading existe, o pai não.

E há uma decisão de escopo, tomada em 2026-08-03: **o detector ignora `specs/plan/`**. Plan é rastro
append-only — ela descreve o que era verdade na execução dela, não instrução vigente. Cobrar ponteiro em plan
reprovaria o repositório para sempre. **Vale para spec fixa, skill, código e README.**

> **Os 4 ponteiros vivos têm a mesma causa, e ela é recente:** a `plan-13` reestruturou o
> `00-regras-e-invariantes` em duas categorias, e a tabela *validador × executor* saiu de **§3.1** para
> **§4.1**. Ninguém percebeu porque **nenhum gate olha ponteiro de seção**. É o achado 30 se repetindo: a
> entrega que catalogou a classe a reintroduziu.

> ✅ **Fechado em 2026-08-05 (`plan-12`).** `auditor_sectionpointers.mjs` (§2.1) construiu exatamente este
> detector, com as duas convenções acima codificadas. Escopo reduzido a **autorreferência** (cross-documento
> fica fora, declarado) depois que a primeira versão atribuiu um ponteiro ao arquivo errado. Mediu **27**
> mortos ao nascer, registrados no baseline (§3); o valor corrente é o da tabela — hoje **0**.

## 9.5 R10 e R31 — as duas paradas do Lote C (`plan-12`, 2026-08-05) já fecharam

**R10 foi decidida e construída.** O dono fixou a fronteira ("pré-montado" = `components/**` + `core/**`,
exclui `atomic/Buttons|Inputs` e `features/**`); a `plan-16` construiu `auditor_composicaoatomica.mjs` sobre
ela. Detalhe em [[00-regras-e-invariantes]] R10 e no baseline (§3).

**R31 também tem gate, desde a `plan-24` (2026-08-10).** Na parada do Lote C (2026-08-05), o dono ainda não
tinha decidido a fronteira de pares/limiar — o que segue registrado como medição histórica, **datada**: com
o script preservado fora do repositório (anexo da `plan-12`, reproduzido pelo revisor), **12 dos 18 temas
shippados falhavam** em pelo menos 1 dos 4 pares canônicos texto/fundo — 4 falhas de texto primário/secundário,
não só do `textColorMuted` mais apagado, e `minimalist-airy` (um dos dois `SARAK_REFERENCE_THEMES`) entre
eles. O dono decidiu a fronteira (36 pares reais, 4,5:1 sem relaxamento, alfa composto), o gate
`auditor_contraste.mjs` nasceu vermelho por desenho e fechou na `plan-24-1` (2026-08-11) — baseline
corrente **0 e 0** (§3). Detalhe em [[00-regras-e-invariantes]] R31.
