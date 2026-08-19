# Guia de Manutenção — trabalhando DENTRO da `@sarak/lib-ui-core`

> Roteador de fluxos, não fonte de regra. Cada fluxo diz **em que ordem** agir e **para qual spec
> ir**. Quando este guia e uma spec divergirem, **a spec vence** e a divergência é um defeito
> deste kit.

> **Convenção deste arquivo:** todo caminho, gate e script citado **em crase** é verificado pelo
> `npm run dev-kit:check`. Se não existir, o gate reprova. Por isso caminhos **removidos** (o
> antigo motor de manifesto, o backend próprio) aparecem em **negrito**, nunca em crase — citar
> um cadáver em crase derrubaria o gate, que é exatamente o comportamento desejado.

---

# §0 — A árvore de decisão: Configuração × Expansão

Antes de qualquer coisa, responda **uma** pergunta:

> **A chave que você precisa já existe no dicionário de tokens?**

| Resposta | Caminho | O que se toca |
| --- | --- | --- |
| **Sim** | **Configuração** | Só **dado**: um valor num tema/preset JSON. **Nenhum arquivo de `src/` é tocado.** |
| **Não** | **Expansão** | **Código**: paridade nas três fontes + hook controlador + teste + catálogo. |

A regra completa, com a tabela de cenários, está em `specs/specs/00-regras-e-invariantes.md`
(regra de Configuração × Expansão). Confira o dicionário atual em `sarak-dev/state.json` →
`design.tokens`, ou na fonte viva: `src/core/Design/catalog/theme_table_mapping.json`.

**Erro clássico a não repetir:** partir para Expansão porque o token "não pareceu existir". Os
ids são camelCase e específicos (`btnBorderRadius`, não `buttonRadius`); procure no catálogo
antes. Um token duplicado é pior que um ausente — ele cria ambiguidade sobre qual definição
vence.

---

# §1 — Fluxos, e a spec dona de cada um

| Quero… | Fluxo | Spec dona |
| --- | --- | --- |
| Adicionar ou remover um **token** | §2 | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` |
| Criar um **componente atômico** | §3 | `specs/arquitetura/03-superficie-publica.md` |
| Criar um **tema** ou **preset** | §4 | `specs/specs/09-temas-e-presets.md` |
| Mexer no **cromo** (topbar/sidebar/slots) | §5 | `specs/specs/05-cromo-e-slots.md` |
| **Rodar e ler** os gates | §6 | `specs/specs/01-gates-e-baseline.md` |
| **Commitar** e **publicar** | §7 | `specs/specs/02-enforcement-por-commit.md` · `specs/specs/03-versionamento-e-release.md` |
| Mexer no **kit do consumidor** | §8 | `specs/specs/12-kit-do-consumidor.md` |
| Mexer neste kit | §9 | `specs/specs/14-artefatos-do-mantenedor.md` |

---

# §2 — Adicionar ou remover um token (a paridade)

**Um token só é REAL se existir nas três fontes.** Fora disso ele é inexistente — e o mais cruel:
a tela não quebra, o valor apenas não pinta nada.

## 2.1 As três fontes, na ordem em que se mexe

| # | Fonte | Arquivo |
| --- | --- | --- |
| 1 | **Schema** | `src/core/Design/schema/` — o arquivo do domínio; o schema entra no `src/core/Design/master-map.ts` |
| 2 | **Roteamento de persistência** | `src/core/Design/catalog/theme_table_mapping.json` |
| 3 | **Partição do catálogo** | `src/core/Design/catalog/partitions/` — o JSON da coluna correspondente |

## 2.2 As duas alavancas — decida ANTES de escrever

| Alavanca | Como o token chega à tela | O que mais é preciso |
| --- | --- | --- |
| **Valor** | vira `var(--sarak-<kebab-id>, fallback)` no DOM | nada além da paridade |
| **Estrutural** | é lido em JS pelo **Hook Controlador** | marcar `structuralConsumer` no schema e `consumerHook` na partição, e consumir no hook (ex.: `src/components/atomic/hooks/useStructuralStyles.ts`) |

A lista estrutural é **fechada**. Se o seu token novo é estrutural e você não o marcou, ele
existe na paridade e não move nada — a mesma classe de defeito de uma variável-fantasma.

## 2.3 A ordem de execução

1. Escreva nas **três** fontes.
2. Rode `npm run audit` — o `auditor_paridade` roda o
   `gates/scripts/audit/verify_parity.ts` e cruza as três.
3. Se o token for consumido em CSS, rode o audit de novo e confira o `auditor_ghostvars`: toda
   `var(--x)` consumida precisa de um emissor real, e **sempre com fallback**.
4. Rode `npm run catalog` e `npm run guide` — o token novo entra no catálogo público e no kit do
   consumidor.
5. Rode `npm run dev-kit` — a contagem deste kit muda.

## 2.4 ⚠️ Os dois defeitos ativos que você vai encontrar aqui

**(a) Sete ids duplicados.** O `theme_table_mapping.json` tem **416 entradas brutas para 409 ids
únicos**: sete ids aparecem em duas colunas. Quatro são ambiguidade real (colunas diferentes) e
três são redundância literal (mesma coluna). Consertar muda **qual definição vence** em
`getDefaultDesignState()`, então exige caracterização antes. Está roteado para a Campanha 2.

**(b) `src/core/Provider/generated/design-token-ids.ts` está DEFASADO.** Ele é gerado por
`scripts/generate-token-types.ts` a partir do `MASTER_DESIGN_MAP`, e o gerador **não está
registrado em nenhum script do `package.json` nem em nenhum hook** — regenera só quem lembrar.
Compare os números no Apêndice B: o tipo público tem **menos** ids que o catálogo. Enquanto isso
for verdade, a interface `SarakDesignTokens` não cobre todos os tokens válidos.

Nenhum dos dois se conserta de passagem. Se o seu token cair num deles, **registre e reporte**.

---

# §3 — Criar um componente atômico novo

## 3.1 Onde ele mora

Escolha a **categoria** dentro de `src/components/atomic/` — a lista atual está no Apêndice B.
A regra de alocação está em `specs/arquitetura/00-mapa-do-modulo.md`:

- é visual e burro → `src/components/atomic/<Categoria>`;
- tem estado ou negócio → `src/features/`;
- é infraestrutura agnóstica de UI → `src/core/`;
- é casca de app → `src/components/Layout/`.

⚠️ **Limitação conhecida do coletor** (`scripts/publicComponents.mjs`): categoria **sem** barril
`index.ts` só tem a **raiz** varrida. Componente em subpasta de uma categoria sem barril escapa do
`npm run barrel:check`. Se a sua categoria não tem barril e você precisa de subpasta, crie o
barril.

## 3.2 O que o componente precisa ter

1. **Nome** `PascalCase` com prefixo `Sarak` se for público.
2. **Props tipadas** numa interface `<Nome>Props` — o gate cobra o tipo **junto** com o valor.
3. **Zero hardcode** no `.tsx`: nada de hex/px/rem nem Tailwind estrutural (`p-4`, `gap-4`,
   `flex-col`, grid). O lugar legítimo do valor estrutural é o **Hook Controlador** da categoria
   (`hooks/` dentro dela).
4. **Composição atômica**: proibido `<button>`/`<input>`/`<select>` cru dentro de template ou
   componente pré-montado — use `SarakButton`/`SarakInput`.
5. **Teste 1:1** em `__tests__/<Nome>.test.tsx`, **ao lado**. Sem ele o `auditor_coverage`
   reprova. Ver `specs/specs/11-testes-e-cobertura.md`.
6. **≤ 250 linhas** por arquivo. Quando estourar, extraia — e cada peça extraída precisa do
   próprio teste.

## 3.3 A exposição

Exporte o componente **e** o `<Nome>Props` em `src/index.ts`. Se ele for interno de propósito,
a exclusão vai em `gates/allowlists/barrelExclusions.mjs` **com motivo escrito** — silêncio é proibido, e
o gate também derruba exclusão obsoleta (nome que já está exportado ou que não existe mais).

⚠️ **Nada pesado sai eager do barril.** Componente que arrasta biblioteca grande vive atrás de
fronteira `React.lazy`. O número que sustenta a regra está medido em
`specs/arquitetura/03-superficie-publica.md`: o boot do consumidor caiu **−52%** quando um único
engine deixou de sair eager.

## 3.4 A "6ª camada" NÃO existe mais

Se você leu, em qualquer skill ou documento antigo, que todo componente novo precisa ser
registrado numa "6ª camada" chamada **NATIVE_COMPONENTS**, em **src/core/Manifest/Registry/**, e
que é preciso rodar o **RegistryParity.test.tsx** — **nada disso existe**. O motor de manifesto
foi removido inteiro (ver `specs/adr/002-remocao-motor-manifesto.md`). O que substituiu essas
camadas de alcance são dois gates: `npm run barrel:check` (o barril) e `npm run catalog:check`
(o catálogo gerado).

## 3.5 A ordem de execução

```bash
npm run barrel:check     # o componente e o tipo estão expostos?
npm run catalog          # regenera docs/component-catalog.{json,md}
npm run guide            # o kit do consumidor passa a listá-lo
npm run dev-kit          # a contagem deste kit muda
npm run audit            # cobertura, clean code, arquitetura, hardcode
npx vitest run           # a suíte INTEIRA
```

---

# §4 — Criar um tema ou um preset

**Preset e tema são a MESMA primitiva**, diferindo só na amplitude: preset preenche a fatia de um
domínio, tema preenche tudo. Os dois vivem em `src/core/Design/presets/` — temas em
`src/core/Design/presets/themes/`, presets de componente em
`src/core/Design/presets/components/`.

**A regra que mais economiza tempo:** parta de um **tema de referência completo** e customize
poucos valores. Não monte um tema do zero — um consumidor real montou um só com COR e concluiu
que "fonte e cromo não mudam". Os eixos de completude existem para pegar isso.

Depois de criar, rode `npm run audit`: o `auditor_presets` compara todo tema e preset shippado
contra o gabarito vivo e reprova **chave órfã**. Detalhe do ciclo em
`specs/specs/09-temas-e-presets.md`.

---

# §5 — Mexer no cromo

O cromo apresentacional é `src/components/Layout/SarakAppChrome.tsx` — 100% apresentacional, sem
host e sem registro. Ele é diferente do `SarakShell`, que **é** host e renderiza o módulo ativo do
Discovery. Confundi-los é o erro mais comum nesta área.

- Slot novo é **prop opcional de `ReactNode`** — e entra sozinho no kit do consumidor, porque o
  coletor o deriva do tipo.
- Toda cor e medida vem de token **com fallback**.
- O reflow por dispositivo é contrato, não detalhe: ver
  `specs/specs/07-responsividade-e-multidispositivo.md`.

Contrato completo em `specs/specs/05-cromo-e-slots.md`.

---

# §6 — Rodar e LER os gates

## 6.1 A regra que evita a rodada perdida

> **O `npm run audit` NÃO está em zero. Compare com o BASELINE, nunca com zero.**

O baseline versionado é `gates/baselines/audit-baseline.json`, e ele está reproduzido no Apêndice B
deste guia. Cada número é o **máximo tolerado**: igual passa, maior é regressão, menor significa
que você pagou dívida e o baseline precisa ser regravado com `npm run audit:baseline` — **no mesmo
commit do conserto que o justificou**, nunca sozinho.

## 6.2 A regra anti-afrouxamento

**NUNCA** relaxe a allowlist de um auditor para mascarar violação real, e **NUNCA** exclua pasta
do escopo de um auditor para baixar a contagem. Gate com escopo menor que a regra deixa a regra
violada em silêncio — foi assim que três das quatro categorias de engine ficaram fora do barril
público sem que nada acendesse.

## 6.3 A suíte é INTEIRA

> `npx vitest run` — **a suíte completa**. Rodar pasta a dedo esconde snapshot de terceiro que
> quebrou. "Suítes verdes" só significa alguma coisa quando é o comando inteiro.

Não existe script `test` no `package.json`; o comando é esse.

## 6.4 O catálogo de gates

A tabela viva está no Apêndice B (`§B.3`), derivada do `package.json`. O que cada um garante, como
ler a saída e a dívida item a item estão em `specs/specs/01-gates-e-baseline.md`.

---

# §7 — Commitar e publicar

## 7.1 Por commit

Os hooks são versionados em `.githooks/` e o `core.hooksPath` aponta para lá. Instale com
`npm run hooks:install` (idempotente) ao clonar o repositório do zero.

- `.githooks/pre-commit` — segredos, os gates verdes (que **bloqueiam**) e o `run_audit` comparado
  ao baseline (que bloqueia **só em regressão**).
- `.githooks/pre-push` — a suíte completa e o anel de release (`gates/scripts/release/check-release-tag.mjs`).

Commit que só toca markdown não paga o preço dos gates de UI. `--no-verify` existe, não dá para
impedir, e o combinado é: quem usa, roda os gates depois. Detalhe em
`specs/specs/02-enforcement-por-commit.md`.

## 7.2 Por release

A versão sai do `package.json` e se propaga **por gerador** para todos os derivados — editar um
derivado à mão é bug, e `npm run guide:check` pega. O ritual usa os ganchos nativos do npm
(`preversion` → `version` → `postversion`), o formato de tag é `vX.Y.Z`, e toda quebra de contrato
público exige entrada em `docs/migracoes.md`. Ver `specs/specs/03-versionamento-e-release.md`.

---

# §8 — Mexer no kit do consumidor

`sarak-ui/` é **híbrido**: prosa à mão, listas geradas. Duas coisas a lembrar:

1. **A skill `ui-integra-consumidor` é ESPELHADA** de `.agents/skills/ui-integra-consumidor/`
   para dentro do kit. Edite a **fonte** e rode `npm run guide`; editar a cópia dentro de
   `sarak-ui/skill/` perde a edição na próxima geração.
2. **JSDoc de prop pública é superfície pública.** O catálogo publica o texto verbatim para o
   consumidor. Comentário defasado deixa de ser dívida interna e vira documentação errada na mão
   de quem importou.

Contrato completo em `specs/specs/12-kit-do-consumidor.md`; o caminho do importador, em
`specs/specs/13-instalacao-e-atualizacao.md`.

---

# §9 — Mexer neste kit

- A prosa (`sarak-dev/START-HERE.md` e este arquivo) é **sua**, editável à mão.
- Os blocos entre `<!-- SARAK-DEV:… -->` e o `sarak-dev/state.json` são **gerados** — depois de
  qualquer edição, rode `npm run dev-kit`.
- Acrescentar um dado ao estado é acrescentar um coletor em `scripts/dev-kit/buildDevState.mjs` —
  **derivado do repositório, nunca digitado**.
- A caça a ponteiro morto está em `scripts/dev-kit/deadPointers.mjs`. Ela verifica caminho, gate
  (`npm run …`) e comando `node`. Não verifica prosa livre nem nome de símbolo, de propósito:
  verificador que adivinha produz falso-positivo, e gate com falso-positivo é gate que se aprende
  a contornar.

**Se o fluxo de que você precisou não está neste guia, isso é lacuna dele.** Resolva a tarefa e
depois acrescente o fluxo — nunca deixe o próximo redescobrir.

---

<!-- SARAK-DEV:APENDICE-GERADO:INICIO -->

## Apêndice B — Estado deste repositório (GERADO)

> **Não edite esta seção à mão.** Ela é regenerada por `npm run dev-kit` a partir do próprio repositório (`@sarak/lib-ui-core` v6.1.0); o gate `npm run dev-kit:check` derruba se ficar defasada. A fonte de máquina equivalente é o `state.json` ao lado deste arquivo.

### B.1 Design — as fontes que a paridade cruza

`MASTER_DESIGN_MAP` v13.0.0 · **28 arquivos de schema** (lista completa em `state.json` → `design.schemaFiles.files`).

| Fonte | Medida | Valor |
| --- | --- | --- |
| `catalog/theme_table_mapping.json` | colunas | 13 |
| `catalog/theme_table_mapping.json` | entradas brutas | 423 |
| `catalog/theme_table_mapping.json` | **ids únicos** | **423** |
| `catalog/partitions/` | arquivos | 13 |
| `catalog/partitions/` | tokens | 423 |
| `SarakDesignTokens` (tipo público) | ids | 423 |
| `SarakDesignTokens` (tipo público) | responsivos | 40 |

> Os quatro números têm de convergir. `idsUnicos` é o total real; `entradasBrutas` maior que ele significa id roteado para mais de uma coluna. `tipoPublico` menor significa que `design-token-ids.ts` está DEFASADO (regenere com o script do §2 do guia).

### B.2 Componentes

**Categorias atômicas (14)** — `Atoms` · `Buttons` · `Cards` · `DataDisplay` · `Feedback` · `Icon` · `Inputs` · `Layouts` · `Media` · `Modals` · `Navigation` · `Tables` · `Templates` · `UX`

**Categorias de engine (3)** — `charts` · `chat` · `flows`

**Componentes públicos: 77** — é o número que o `barrel:check` cobra. A lista completa está em `state.json` → `componentes.publicos.nomes`.

### B.3 Gates registrados (23)

| Comando | O que roda |
| --- | --- |
| `npm run audit` | `node gates/scripts/audit/run_audit.mjs` |
| `npm run barrel:check` | `node gates/scripts/contrato/check-barrel-parity.mjs --check` |
| `npm run build-info:check` | `node scripts/generate-build-info.mjs --check` |
| `npm run catalog:check` | `node scripts/generate-component-catalog.mjs --check` |
| `npm run composicao-atomica:check` | `node gates/scripts/audit/auditor_composicaoatomica.mjs` |
| `npm run container-query-boundary:check` | `node gates/scripts/contrato/check-container-query-boundary.mjs` |
| `npm run container-query:check` | `node gates/scripts/contrato/check-container-query-literal.mjs` |
| `npm run coverage:check` | `vitest run --coverage && node gates/scripts/release/check-coverage-floor.mjs` |
| `npm run deep-import:check` | `node gates/scripts/contrato/check-no-deep-import.mjs` |
| `npm run dev-kit:check` | `node scripts/generate-dev-kit.mjs --check` |
| `npm run gate-limits:check` | `node gates/scripts/contrato/check-gate-limits.mjs` |
| `npm run gates:full` | `npm run dev-kit:check && npm run build && npm run build-info:check && npm run package:check && npm run coverage:check && node gates/scripts/release/check-audit-baseline.mjs --with-tsc && npm run themes:diversity` |
| `npm run guide:check` | `node scripts/generate-consumer-kit.mjs --check` |
| `npm run migration-anchor:check` | `node gates/scripts/contrato/check-migration-anchor.mjs` |
| `npm run minor-no-removal:check` | `node gates/scripts/contrato/check-minor-no-removal.mjs` |
| `npm run package:check` | `node gates/scripts/contrato/check-package-contents.mjs` |
| `npm run persistence-doc:check` | `node gates/scripts/contrato/check-persistence-doc-identifiers.mjs` |
| `npm run plan-index:check` | `node gates/scripts/contrato/check-plan-index-sync.mjs && node scripts/generate-plan-index.mjs --check` |
| `npm run public-types:check` | `node gates/scripts/contrato/check-public-types-parity.mjs --check` |
| `npm run release:check` | `node gates/scripts/release/check-release-tag.mjs` |
| `npm run section-pointers:check` | `node gates/scripts/contrato/check-section-pointers.mjs` |
| `npm run token-types:check` | `npx tsx scripts/generate-token-types.ts --check` |
| `npm run zero-brand:check` | `node gates/scripts/contrato/check-zero-brand.mjs --check` |

**Auditores agregados por `run_audit.mjs` (12):** `auditor_hardcoded.mjs` · `auditor_ghostvars.mjs` · `auditor_typescript.mjs` · `auditor_coverage.mjs` · `auditor_arquitetura.mjs` · `auditor_cleancode.mjs` · `auditor_paridade.mjs` · `auditor_presets.mjs` · `auditor_authcoupling.mjs` · `auditor_sectionpointers.mjs` · `auditor_composicaoatomica.mjs` · `auditor_contraste.mjs`

> A suíte (`npx vitest run`) **não é um script do `package.json`** e por isso não aparece na tabela acima — ela é invocada direto. Ver o guia, §6.

### B.4 Baseline dos auditores (medido em 2026-08-11)

> Cada número é o MÁXIMO tolerado. Maior que isto = regressão = commit bloqueado.

| Auditor | Métrica | Máximo tolerado |
| --- | --- | --- |
| `auditor_hardcoded.mjs` | valor | **0** |
| `auditor_hardcoded.mjs` | estruturalLiquido | **0** |
| `auditor_ghostvars.mjs` | consumos | **1** |
| `auditor_typescript.mjs` | violacoes | **0** |
| `auditor_coverage.mjs` | orfaos | **0** |
| `auditor_arquitetura.mjs` | violacoes | **0** |
| `auditor_cleancode.mjs` | violacoes | **0** |
| `auditor_paridade.mjs` | falhou | **0** |
| `auditor_presets.mjs` | falhou | **0** |
| `auditor_authcoupling.mjs` | violacoes | **0** |
| `auditor_sectionpointers.mjs` | mortos | **0** |
| `auditor_composicaoatomica.mjs` | violacoes | **2** |
| `auditor_contraste.mjs` | reprovados | **0** |
| `auditor_contraste.mjs` | reprovadosModoOposto | **0** |

`npx tsc --noEmit`: **0 erros** tolerados — não é gate hoje.

Fonte: `gates/baselines/audit-baseline.json`. **Não edite à mão** — o número muda com `npm run audit:baseline`, no mesmo commit do conserto que o justificou.

### B.5 A base de specs

**ADR (11)** — decisões imutáveis: `001-tres-arquiteturas.md` · `002-remocao-motor-manifesto.md` · `003-remocao-backend-proprio.md` · `004-remocao-design-agent.md` · `005-modelo-modulos-plugin-e-apps-separados.md` · `006-zero-marca-soberania-host.md` · `007-distribuicao-por-git.md` · `008-releases-com-tag-e-semver-em-git.md` · `009-persistencia-tenant-aware.md` · `010-temas-salvos-pelo-usuario.md` · `011-tema-salvo-por-uma-porta-de-escrita.md`

**Arquitetura (6)** — visão macro viva: `00-mapa-do-modulo.md` · `01-forma-do-produto-e-modos-de-consumo.md` · `02-design-engine.md` · `03-superficie-publica.md` · `04-contrato-de-tokens-e-paridade.md` · `05-build-e-distribuicao.md`

**Specs (16)** — feature e regra: `00-regras-e-invariantes.md` · `01-gates-e-baseline.md` · `02-enforcement-por-commit.md` · `03-versionamento-e-release.md` · `04-shell-e-discovery.md` · `05-cromo-e-slots.md` · `06-painel-de-customizacao-e-preview.md` · `07-responsividade-e-multidispositivo.md` · `08-identidade-do-host-e-zero-marca.md` · `09-temas-e-presets.md` · `10-seguranca-e-acessibilidade.md` · `11-testes-e-cobertura.md` · `12-kit-do-consumidor.md` · `13-instalacao-e-atualizacao.md` · `14-artefatos-do-mantenedor.md` · `15-divida-conhecida.md`

<!-- SARAK-DEV:APENDICE-GERADO:FIM -->
