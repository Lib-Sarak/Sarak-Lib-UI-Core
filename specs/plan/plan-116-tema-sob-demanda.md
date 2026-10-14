---
tipo: "plan"
titulo: "Tema sob demanda: o boot carrega so o tema que vai ao ar, e o resto do catalogo chega quando e escolhido"
objetivo: "Tirar do boot de todo consumidor o peso dos temas que ele nao usa, mantendo a hidratacao sincrona sem trocar de tema na tela, o catalogo listavel para o painel, e corrigir o tema padrao que aponta para um id inexistente"
dominio: "Design Engine / Temas embarcados / Bundle / Superficie publica"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "temas", "bundle", "lazy", "provider", "superficie-publica"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[03-superficie-publica]]", "[[05-build-e-distribuicao]]", "[[00-regras-e-invariantes]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + arquitetura/03-superficie-publica.md + adr/"
---

# 1. Objetivo

O consumidor paga no boot só pelo tema que vai ao ar. Os demais temas embarcados chegam quando são escolhidos, sem
a tela mostrar um tema e trocar para outro, e o catálogo continua listável (nome, modo, amostra de cor) para o
painel e para o seletor de tema. Assim a `plan-110` pode fazer cada tema totalmente granular sem que o peso de 19
temas caia sobre todo consumidor.

# 2. Contexto

**Decisão do dono, 2026-10-13:** os temas embarcados passam a ser carregados sob demanda; a `plan-110` (19 temas,
todo token estético explícito nos dois papéis) depende disto.

**Medido em 2026-10-13:**

| Medida | Hoje |
|---|---|
| Como os temas chegam | `SARAK_GLOBAL_THEMES` (e `SARAK_THEME_PRESET_IDS`) exportados pelo barril (`src/index.ts:75`); `SARAK_REFERENCE_THEMES`, `sarakGetThemePreset`, `sarakDeriveThemeFromReference` (`:77`) — todos no boot |
| Peso dos 14 temas | ~2,5 KB gzip cada, ~35 KB somados; um tema com todos os 402 tokens num modo: ~3,6 KB gzip; um tema da `plan-110` (todos os estéticos nos dois papéis) deve ficar em ~4–6 KB |
| Quem lê o catálogo | `useDesignManager.ts` (semente do boot), `useThemeCollection.ts`, `PresetsCatalog.tsx` (painel), `reference.ts`; gates `verify_contrast.ts`, `verify_diversity.ts`, `verify_presets.ts`, `check-panel-contract.ts` (e o `check-channel-dispute.ts` da `plan-115`); 11 arquivos de teste |
| Troca de tema | `useDesignSync.ts` aplica `{ ...anterior, ...tema }` ao trocar por `activeThemeId`: o token que o tema novo não declara **herda o valor do tema anterior** (achado da `plan-115`, lote 1) — a tela depende da ordem em que os temas foram escolhidos |
| Tema padrão | `useDesignManager.ts:75`: `defaultTheme || 'classic'` — **o id `classic` não existe**; cai em `SARAK_GLOBAL_THEMES[0]` (`sarak-sovereign`) sem aviso. O dono confirmou o `sarak-sovereign` como tema padrão |

**Restrições que vêm das specs fixas:**
- **A hidratação é síncrona** ([[02-design-engine]] §3.2): o primeiro quadro já pinta o tema certo. Carregar sob
  demanda não pode trocar isso por "pinta o padrão e depois troca".
- Tema salvo (persistência) já guarda o `design` completo ([[09-temas-e-presets]] §4.4, §4.5): o boot com tema salvo
  não precisa do catálogo.
- `activeThemeId`/`initialTheme` são contrato público (R33, [[09-temas-e-presets]] §4.3).
- Zero deep import (R27): `package.json.exports` expõe só a raiz e os `.css`.
- Medir o efeito **no consumidor** (bundler do importador), não só no `dist/` — memória do projeto: harness que só
  espelha `--external` mente; o tsup pode juntar módulo em pedaço com nome de hash.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/` (registro, carregadores, metadados), `src/core/Provider/hooks/` (`useDesignManager`, `useThemeCollection`), `src/features/DesignEngine/` (o que lista e aplica tema), `src/index.ts` (barril).
- Gates e testes que iteram o catálogo — passam a usar um carregador que traz todos (ferramenta), sem depender do barril eager.
- `tsup`/build, se a fronteira pedir; `scripts/` de medição de bundle no consumidor.
- `docs/migracoes.md` (subseção MAJOR em `## 8.0.0`), artefatos regenerados, um ADR novo.

## 3.2 Fora
- Mudar o conteúdo de qualquer tema (é a `plan-110`).
- Mudar o formato do payload de tema (R33) ou da persistência.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/02-design-engine.md` (§3, §3.2) | Provider e hidratação síncrona |
| Spec fixa | `specs/09-temas-e-presets.md` (§4.3, §4.4, §4.5, §5) | aplicar, persistir, exportar, o catálogo embarcado |
| Spec fixa | `arquitetura/03-superficie-publica.md` (§2, §7, §7.1) | barril e fronteiras lazy existentes |
| Spec fixa | `arquitetura/05-build-e-distribuicao.md` | build, `dist/`, distribuição |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R15, R27, R33) | nada pesado eager; sem deep import; payload público |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/core/Design/presets/themes/index.ts`, `src/core/Design/presets/themes/reference.ts`, `src/core/Provider/hooks/useDesignManager.ts`, `src/core/Provider/hooks/useThemeCollection.ts`, `src/index.ts` | o catálogo e quem o consome |

# 5. Instruções de execução

1. **Lote 0 — desenho (não toca código).** Medir o peso do catálogo no boot **no consumidor** (um app mínimo que
   importa a lib, com o bundler de um consumidor real) e propor, num anexo `specs/plan/anexos/plan-116-desenho.md`:
   (a) o que fica no boot (o tema padrão, as referências do modo claro/escuro se a semente as exige, e os metadados
   de todos os temas — id, nome, modo nativo, amostra de cor — para listar); (b) como um tema pedido por
   `activeThemeId`/`initialTheme` pinta **no primeiro quadro** sem estar no boot (ex.: o consumidor passa o objeto do
   tema importado por nome, que o bundler dele separa; ou a semente espera o carregador antes do primeiro quadro;
   ou outra forma) — com o custo de cada alternativa; (c) a API pública nova e o que sai ou muda
   (`SARAK_GLOBAL_THEMES`, `sarakGetThemePreset`…), com a nota de migração; (d) como gates e testes carregam o
   catálogo inteiro; (e) o teto de boot proposto. **Parar e entregar**: o dono aprova o desenho.
2. **Lote 1 — implementação** do desenho aprovado: o tema padrão é uma constante explícita (`sarak-sovereign`), sem
   id inexistente; o boot leva só o que o desenho aprovou; o painel lista o catálogo e carrega o tema ao escolher;
   tema pedido por id pinta no primeiro quadro; trocar de tema aplica `{ padrões dos tokens, ...tema }`, nunca herda
   do tema anterior; gates e testes usam o carregador de catálogo inteiro.
3. **Trava:** o peso do boot do consumidor no teto aprovado (gate ou medição no `gates:full`), com caso que falha se
   um tema voltar ao boot.
4. Testes: semente com tema padrão, com tema pedido por id, com tema salvo e com id inexistente (aviso e referência
   do modo, como hoje); o painel aplica tema carregado sob demanda; nenhuma troca de tema visível no primeiro quadro
   (caso de `browser-tests/`).
5. ADR do desenho, nota MAJOR em `## 8.0.0`, gerados regenerados (`guide` por último), simulação do Anel 0.

# 6. Critérios de aceite

- [ ] Desenho aprovado pelo dono antes do lote 1.
- [ ] Boot do consumidor no teto aprovado; trava que falha se um tema voltar ao boot.
- [ ] Tema padrão explícito (`sarak-sovereign`); nenhum id inexistente.
- [ ] Trocar de tema nunca herda token do tema anterior — no Provider (`useDesignSync.ts`) e na prévia do painel, que o "Aplicar" grava (`useDesignDraft.ts`) (teste: A declara um token que B não declara; depois de B, o token é o padrão).
- [ ] Tema pedido por id, tema salvo e tema padrão pintam no primeiro quadro, sem troca visível.
- [ ] Painel lista o catálogo e aplica tema carregado sob demanda.
- [ ] Gates de tema (contraste, diversidade, presets, painel) e testes iteram o catálogo inteiro.
- [ ] ADR, nota MAJOR, barril e catálogo em dia.
- [ ] Suíte completa verde numa passada; `tsc` 0; `audit:baseline` sem regressão; Anel 1; casos de `browser-tests/` escritos (o revisor roda `npm run build` e `cromo-css-real:check`); Anel 0 simulado: 0.

# 7. Como verificar (uso do revisor)

- Lote 0: ler o anexo; conferir a medição no consumidor; levar ao dono.
- Medição do boot no consumidor antes e depois; trava com mutação (um tema importado no barril de novo faz falhar).
- `npm run build` + `npm run cromo-css-real:check` · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline -- --with-tsc` · Anel 1 · Anel 0.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + arquitetura/03-superficie-publica.md + adr/`

- **`09`:** como o catálogo é listado e carregado; o tema padrão; aplicar por id.
- **`02`:** a semente do Provider com o tema sob demanda e a hidratação síncrona.
- **`03`:** a fronteira nova na §7.1 e a API pública do catálogo.
- **ADR:** o desenho escolhido e as alternativas.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido nem reescrito. -->

## Resumo da execução (lote 0 — desenho) — 2026-10-13

**Resultado:** Concluído (lote 0). Nenhum código tocado; o lote 1 aguarda a aprovação do dono.

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-116-tema-sob-demanda.md
```
(Durante a sessão apareceram dezenas de `M` em `src/`, `gates/` e `src/styles/` — são da `plan-115` lote 4, não minhas; não toquei neles.)

**O que foi feito**
- Criado `specs/plan/anexos/plan-116-desenho.md` com os itens (a)–(e) do §5 passo 1, os dois critérios acrescentados (tema padrão explícito §4.5; troca sem herança §4.6), as alternativas A/B/C com custo e a nota de migração em rascunho (§9 do anexo).
- Medido o boot **no consumidor** (app mínimo + esbuild 0.27.7, fora do repositório, `node_modules` por junção removida antes de encerrar; `Test-Path node_modules` do repositório = True).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/anexos/plan-116-desenho.md` | criado | o desenho do lote 0 |
| `specs/plan/plan-116-tema-sob-demanda.md` | alterado | este resumo (§9) e `status: 🟠 Em revisão` |

**Verificações executadas**
- Boot do consumidor (fecho de `import` estático, gzip): `src` com 14 temas = 319,3 KB; 1 tema = 307,2 KB; 2 temas (par de referência) = 308,6 KB; `dist/` = 348,9 KB (build anterior, sem variante). 13 temas = 12,1 KB gzip / 92,0 KB raw (≈ 0,93 KB gzip por tema).
- Fonte dos 14 temas gzipada: 37,7 KB (origem do "~35 KB" da plan — não é o custo no consumidor).

**Critérios de aceite**
- [ ] Desenho aprovado pelo dono antes do lote 1 — pendente (é o objetivo desta entrega).
- Os demais critérios pertencem ao lote 1.

**Decisões e suposições**
- O número da plan (~35 KB) superestima o peso real no consumidor (~12 KB gzip hoje); o ganho grande depende da plan-110 (projeção 27–40 KB gzip, marcada como projeção no anexo).
- Recomendo a alternativa B (carregador assíncrono + cache síncrono + porta de espera no Provider); A colide com o §7.1 da spec 03 e quebra em silêncio `initialTheme="<id>"`.
- A miniatura do painel (`PresetCard`) lê o `design` inteiro; por isso a lista é metadado e a miniatura exige o tema carregado.
- Teto proposto como relativo + estrutural, não número congelado (a plan-115 move o `src/`).

**Achados fora do escopo (não corrigidos)**
- `useDesignManager.ts:75` usa `'classic'` inexistente — já é critério da própria plan (lote 1).
- Medição de `src` feita sobre worktree em movimento (plan-115): o delta entre variantes é válido; o absoluto de 319,3 KB não é baseline estável.

**Pendências / riscos**
- Delta de temas no `dist/`, alternativa A e SSR do B: não medidos (§10 do anexo).
- O dono decide os 6 pontos do §8 do anexo antes do lote 1.

---

## Resumo da execução (lote 1 — implementação) — 2026-10-14

**Resultado:** Concluído com pendências (o que exige `npm run build`/`dist/` ficou para o revisor, como o prompt mandou).

**Estado do worktree ao iniciar**
```
M  specs/00-indice.md
M  specs/arquitetura/02-design-engine.md
D  specs/plan/anexos/plan-115-residuo-da-reauditoria.md
D  specs/plan/plan-115-fechamento-do-arsenal.md
M  specs/plan/plan-116-tema-sob-demanda.md
M  specs/specs/00-regras-e-invariantes.md
M  specs/specs/01-gates-e-baseline.md
M  specs/specs/06-painel-de-customizacao-e-preview.md
M  specs/specs/09-temas-e-presets.md
```

**O que foi feito**
- `themes/index.ts`: sem import de tema; `SARAK_DEFAULT_THEME_ID = 'sarak-sovereign'`, tipos `SarakThemeCatalogEntry`/`SarakThemeSwatch`. Os 14 arquivos de tema passam a `import type` do `./index`.
- Novos em `themes/`: `boot.ts` (só o padrão), `loaders.ts` (um `import()` por tema), `registry.ts` (cache síncrono + `sarakLoadThemePreset`/`sarakPreloadThemes`/`sarakLoadAllThemePresets`, assinatura por versão), `all.ts` (catálogo inteiro, fora do barril), `catalog.ts` (`toThemeCatalogEntry`), `catalog.generated.ts` (gerado por `scripts/generate-theme-catalog.ts`; `themes:catalog` e `themes:catalog:check` no `build`), `compose.ts` (`composeThemeDesign`).
- `reference.ts`: `sarakGetThemePreset` sai; `SARAK_REFERENCE_THEMES` = só o padrão; `sarakLoadReferenceThemes()`; `sarakDeriveThemeFromReference` aceita `'sarak-sovereign'` ou preset carregado (outro id lança com mensagem de migração).
- Provider: `useThemeCollection` (cache por `useSyncExternalStore`, `themeCatalog`, `loadTheme`), `useThemeSeed.ts` (semente extraída de `useDesignManager`; padrão explícito; `defaultTheme` inexistente avisa; id inexistente em modo claro cai na contraparte do padrão), `useThemeReadiness.ts` (porta de espera: só tema embarcado forçado por código fora de memória e sem `design` salvo; fecha uma vez; falha de `import()` libera), `useDesignSync.ts` (compõe por `composeThemeDesign`; embarcado não carregado espera sem trocar a tela), `SarakUIProvider.tsx` (porta + prop `loadingFallback`), `types.ts`/`providerProps.ts`.
- Painel: `useDesignDraft.handleThemePreview` compõe por `composeThemeDesign` quando há `themeId`; `PresetsCatalog` lista o catálogo leve (`useCatalogThemes`), `PresetCardPending` para o não carregado (escolher carrega e só então aplica).
- Barril `src/index.ts`: sai `SARAK_GLOBAL_THEMES`/`sarakGetThemePreset`; entram `SARAK_DEFAULT_THEME_ID`, `SARAK_THEME_CATALOG`, loaders, `sarakLoadReferenceThemes`, tipos.
- Travas: `gates/scripts/contrato/check-theme-boot-closure.mjs` (estrutural, `src` e `dist`; `theme-boot:check` no `build`), `scripts/measure-consumer-boot.mjs` (relativo + estrutural no bundler do consumidor + 3 KB gzip por tema; `boot:measure` no `gates:full`). Ambas com limites no cabeçalho (R18).
- Gates/testes/skill que iteram o catálogo migrados para `themes/all`; `collectKitSources.mjs` lê os ids de referência da fonte.
- Docs: nota na subseção nova de `## 8.0.0` de `docs/migracoes.md`; `docs/` e `.agents/skills/ui-integra-consumidor|ui-criar-tema`; `sarak-ui/` por `npm run guide`; `sarak-dev/` por `npm run dev-kit`; ADR `specs/adr/022-tema-sob-demanda.md` + linha no `adr/README.md`.
- Browser: cena `?cena=tema-sob-demanda` em `harness-entry.tsx` e `browser-tests/tema-sob-demanda.spec.ts` (3 blocos, 4 casos).

**Arquivos alterados** — ver `git status`; os novos principais: os módulos de `themes/` acima, `useThemeSeed.ts`, `useThemeReadiness.ts`, `PresetCardPending.tsx`, `useCatalogThemes.ts`, `check-theme-boot-closure.mjs`, `measure-consumer-boot.mjs`, `generate-theme-catalog.ts`, o ADR 022 e os testes novos (registry, compose, catalog, themeCatalogParity, TemaSobDemanda, useThemeSeed, useThemeReadiness, PresetCardPending, useCatalogThemes, check-theme-boot-closure).

**Verificações executadas**
- `npx vitest run` completo (2ª passada): 3445 testes, 2 falhas — `useThemeCollection` (erro do meu teste, `[]` novo a cada render; corrigido, 11/11) e `check-kit-names` (cita `sarakLoadThemePreset` etc. contra o `dist/index.d.ts` antigo; some com o `npm run build`). Depois dos últimos consertos só foi repetido o recorte `src/features/DesignEngine src/core/Provider src/core/Design`: 163 arquivos / 1051 testes verdes. **A suíte completa não foi repetida depois disso.**
- `npx tsc --noEmit` → 0 erros.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline, sem regressão (antes do ajuste, `auditor_cleancode` 0→2 por Provider com 259 e `useDesignDraft` com 257 linhas; comprimi comentários).
- Anel 1 rodado na mão: `barrel`, `catalog`, `zero-brand`, `deep-import`, `gate-limits` (50 scripts declaram limite), `token-types`, `container-query*`, `persistence-doc`, `class-merge`, `icon-port`, `chrome-token-parity`, `token-reader`, `css-important`, `fixed-translucent`, `section-pointers`, `migration-anchor`, `plan-index`, `guide:check`, `dev-kit:check` verdes; `kit-names:check` falha contra o `dist/` antigo (idem acima); `guide` e `dev-kit` regenerados por último.
- Anel 0 simulado (padrões de `config.json` sobre `git diff HEAD` + não rastreados): 0 achados. R36 simulado nas linhas adicionadas: 2 citações `plan-NN` (comentário que movi) — removidas.
- `node scripts/measure-consumer-boot.mjs`: boot src 323,8 KB gzip; referência (só o padrão, sem catálogo) 321,7; catálogo 1,8; teto 326,5; maior tema `blueprint-protocol` 2,6 KB (teto 3,0).
- Mutação: `export { cyberpunkneonTheme }` no barril → `check-theme-boot-closure --src` e `measure-consumer-boot` falham citando o tema; `export { SARAK_ALL_THEMES }` → falham com os 13. Barril restaurado.
- Controle em cópia do `HEAD` fora do repositório (junção removida, `node_modules` intacto): o gate novo falha ali (o `index.ts` do HEAD não tem `SARAK_DEFAULT_THEME_ID`; "gate cego"). O worktree não foi tocado.

**Critérios de aceite**
- [x] Desenho aprovado — decisões do dono na §10.
- [x] Trava estrutural + medida, com mutação; boot no teto — saídas acima. `dist/`: **não verificado** (sem build).
- [x] Tema padrão explícito, sem id inexistente — `index.ts`, `useThemeSeed.ts`, `TemaSobDemanda.test.tsx`.
- [x] Troca sem herança no Provider e na prévia — `compose.test.ts` (A declara X, B não → padrão), `TemaSobDemanda.test.tsx`, `useDesignDraft.ts`. Falta teste dedicado do `handleThemePreview` (só `composeThemeDesign` + a suíte existente do rascunho).
- [x] Pinta no primeiro quadro sem troca visível — jsdom (`TemaSobDemanda.test.tsx`); casos de navegador escritos, não executados.
- [x] Painel lista o catálogo e aplica tema carregado sob demanda — `PresetsCatalog`, `useCatalogThemes.test.ts`.
- [x] Gates e testes iteram o catálogo inteiro por `themes/all`.
- [x] ADR 022, nota MAJOR, barril/catálogo/kit em dia.
- [ ] Bateria do navegador e `npm run build` **não rodados** — motivo: `dist/` e `buildInfo` são versionados e o prompt reserva o build ao revisor. Iniciei o build por engano e o interrompi antes do `build:js`; `git status` de `dist/`/`buildInfo` ficou limpo.

**Decisões e suposições**
- Identidade preservada na troca: `systemName`, `logoUrl`, `logoDarkUrl`, `language`, `availableLanguages`, `enabledLanguages`, `mode` (`THEME_PRESERVED_KEYS`); o resto vem do padrão do schema ou do tema. Customização solta fora disso volta ao padrão na troca (inclui o 1º apply de `activeThemeId` no mount: valores de `config` que o tema não declara voltam ao padrão).
- `SARAK_REFERENCE_THEMES` ficou só com o escuro (nome mantido); o par claro vem de `sarakLoadReferenceThemes()`.
- A porta também espera por `options.theme.defaultTheme` embarcado fora de memória.
- `solve_theme_contrast.ts` importava `GLOBAL_THEMES` (nome que já não existia); migrado junto.
- Teto relativo medido sobre `src/` (não `dist/`); no `dist` vale a trava estrutural por marcador `id:"…",name:"…",description:…,design:{`.
- O caso de SSR só prova o fallback (o servidor não renderiza o app com portais — pré-existente).

**Achados fora do escopo (não corrigidos)**
- `check-trail-citation.test.mjs` falhou na 1ª passada por `EPERM` ao remover pasta temporária e por timeouts sob carga; passou na 2ª.

**Pendências / riscos**
- Revisor: `npm run build` (inclui `theme-boot:check` no `dist`, `kit-names:check`, `public-types:check`), `npm run cromo-css-real:check` / bateria do navegador, `gates:full`, suíte completa depois do build.
- O teto relativo tem folga de 3 KB (decisão do dono): um tema isolado que volte ao boot não acende a medida — acende a estrutural.
- O ADR 022 e a linha no `adr/README.md` foram criados por estarem declarados na §3.1 da plan.

---

## Resumo da execução (correção 1) — 2026-10-14

**Resultado:** Concluído com pendência (bateria do navegador não reexecutada — ver abaixo).

**Estado do worktree ao iniciar**
Worktree com a entrega do lote 1 mais o que o revisor gerou no veredito (`dist/`, `buildInfo` etc.): 159 entradas em `git status --short` (saída guardada; as do lote 1 não foram revertidas nem reformatadas).

**Achado 1 — a troca de tema descartava o `config` do host**
- `src/core/Design/presets/themes/compose.ts`: `composeThemeDesign(resolvedTheme, previous, hostConfig?)` agora compõe **padrões → identidade preservada → `config` do host → tema resolvido**. O tema vence o que declara; o `config` vale no resto; o tema anterior nunca herda.
- `src/core/Provider/hooks/useDesignSync.ts`: recebe `configRef` (7º parâmetro) e o passa nas duas composições (tema encontrado e fallback do id inexistente). O `config` chega por **ref** — `useDesignManager.ts` já tinha `configRef`; ele nunca entra nas dependências do efeito, então não recria o gatilho a cada render (spec 02 §3.1).
- `src/core/Provider/SarakUIProvider.tsx` + `types.ts`: contexto ganha `getHostConfig?()` (estável por `useCallback` sobre uma ref da prop `config`) para a prévia do painel compor com o mesmo `config`.
- `src/features/DesignEngine/hooks/useDesignDraft.ts`: `handleThemePreview` passa `sarak.getHostConfig?.()` à mesma função.
- `docs/migracoes.md`: a nota descreve a ordem completa (ajustada).
- Testes: `ThemeSwitchComposition.test.tsx` — (a) `config` com token que o tema não declara sobrevive à montagem com `activeThemeId` e à troca A→B; o declarado pelo tema vence o `config`; (b) A/B: o que só o A declarava volta ao padrão, ou ao valor do `config` se o host o fixou; `config` inline por render não reaplica nem entra em loop; `compose.test.ts` ganhou o caso da ordem.

**Achado 2 — prévia sem teste dedicado**
- `ThemeSwitchComposition.test.tsx`, bloco "Prévia do painel", pelo Provider real e `useDesignDraft`: A declara o raio e B não → depois de prever B o raio do rascunho é o padrão, o `config` (`layoutMaxWidth`) fica, e o "Aplicar" grava no `systemDesign` o raio padrão.

**Verificações executadas**
- `npx tsc --noEmit` → 0 erros.
- `check-audit-baseline.mjs --with-tsc` → igual ao baseline (Provider 248 linhas, `useDesignDraft` 248 — dentro do teto).
- Anel 1 (na mão): barrel, catalog, zero-brand, deep-import, gate-limits, token-types, themes:catalog, class-merge, icon-port, section-pointers, migration-anchor, theme-boot, persistence-doc, kit-names verdes; `guide` e `dev-kit` regenerados por último e conferidos (sem diff de hash).
- Anel 0 simulado sobre as linhas adicionadas (+ arquivos novos): 0 segredos; R36 em `src/`: 0 citações.
- Recortes: `src/core/Provider` + `compose.test.ts` + `ThemeSwitchComposition.test.tsx` → 57 arquivos, 456 testes verdes (após ajustar a ordem de chaves de valor responsivo no meu teste).
- `npx vitest run` completo, depois do último conserto: 493 arquivos, 3451 testes, 0 falhas, numa passada.

**Critérios de aceite**
- [x] `config` sobrevive à montagem e à troca; tema vence o que declara — `ThemeSwitchComposition.test.tsx`.
- [x] A/B do critério verde — mesmo arquivo e `compose.test.ts`.
- [x] Prévia não herda de A ao mostrar B e o Aplicar grava — mesmo arquivo.
- [ ] Bateria do navegador **não reexecutada**: ela mede o `dist/`, e o `dist/` atual é anterior a esta correção; reconstruí-lo reescreveria artefatos versionados, que o prompt reserva ao revisor.

**Decisões e suposições**
- O `config` em `handleThemePreview` vem de `getHostConfig` no contexto (campo opcional, sem payload público novo); sem Provider (uso isolado) a prévia compõe sem `config`.
- O `config` entra DEPOIS da identidade preservada, como o prompt mandou: um `systemName` no `config` vence o do estado anterior.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Revisor: `npm run build` + `cromo-css-real:check` para a bateria do navegador sobre o `dist/` novo.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Conferência do lote 0 — 2026-10-14 — desenho entregue, à espera da decisão do dono

**Conferido:** o anexo `plan-116-desenho.md` cobre os itens (a) a (e) do §5 passo 1 e os dois critérios acrescentados (tema padrão explícito; troca de tema sem herança, no Provider e na prévia do painel, por uma função só). Nenhum arquivo de `src/`, `gates/` ou `scripts/` foi tocado pelo lote 0 (o diff dessas pastas é todo da `plan-115`, lote 4). Conferido no código o achado que muda o desenho: o `SarakUIProvider` arrasta o catálogo inteiro por `useThemeCollection.ts` e `useDesignManager.ts`, independente do barril — tirar só do barril não muda o boot. A medição (esbuild sobre `src/`, fora do repositório) não foi reproduzida pelo revisor nesta conferência; o lote 1 a transforma em script e o revisor a reproduz no veredito dele.

**Número que o dono precisa ter na mesa:** hoje os 14 temas custam ~12 KB gzip do boot de um consumidor (~3,8%), não ~35 KB; a projeção para os 19 temas da `plan-110`, com todo token estético, é ~27–40 KB gzip (8–12% do boot). O ganho é moderado hoje e relevante depois da 110.

**Decisões pedidas (§8 do anexo), com a recomendação do revisor:** (1) alternativa **B** — carregador assíncrono com cache síncrono e porta de espera no Provider; (2) no boot, **`sarak-sovereign` + `minimalist-airy`**; (3) amostra de cor gerada no catálogo: **sim** (duas chaves geradas, sem drift); (4) teto **relativo + estrutural**; (5) `sarakGetThemePreset` **sai**; (6) MAJOR em `## 8.0.0`.

**Próximo:** com a decisão do dono, o lote 1 é despachado **depois do fechamento da `plan-115`**.

## Decisões do dono sobre o desenho — 2026-10-14 (todas confirmadas)

1. **Alternativa B** (carregador assíncrono com cache síncrono; porta de espera só quando o consumidor força por código um tema que não está em memória), **sem mudar a UX**: no primeiro acesso o sistema abre no tema padrão, que está no boot; quando o usuário escolhe outro tema, **o tema atual continua na tela até o novo chegar** (nunca tela vazia, nunca fallback); o tema aplicado fica salvo e, nos acessos seguintes, pinta direto do `design` salvo, sem carregar nada e sem passar pelo padrão. O padrão vale só até a primeira escolha.
2. **No boot, só o `sarak-sovereign`.** Todo tema tem contraparte autorada: o tema inexistente pedido em modo claro cai na contraparte clara do `sarak-sovereign`; a referência clara (`minimalist-airy`) deixa de ser síncrona — derivar dela exige carregá-la antes (nota de migração); derivar do `sarak-sovereign` segue síncrono.
3. **Amostra de cor no catálogo leve: sim, gerada** — `swatch` e `swatchOpposite` (`primaryColor`, `colorBgBody`, `textColorMaster` de cada modo), pelo `npm run themes:catalog`, com `themes:catalog:check` no build.
4. **Teto:** trava estrutural (nenhum tema além do padrão no fecho estático do entry, em `src/` e no `dist/`), medida relativa no consumidor (boot com só o tema padrão, medido na mesma execução, + catálogo + 3 KB de folga) e **≤ 3 KB gzip por tema** (para a `plan-110`).
5. `sarakGetThemePreset` síncrono **sai**; entra `sarakLoadThemePreset`.
6. **MAJOR.** A mudança é registrada agora na subseção da `## 8.0.0` de `docs/migracoes.md`; a versão MAJOR é aplicada **ao final de todas as modificações, no merge para a `main`** (decisão do dono, 2026-10-14) — nenhuma plan desta fila mexe na versão nem cria tag.

O lote 1 implementa isto e é despachado **depois do fechamento da `plan-115`**.

## Veredito — 2026-10-14 — lote 1 — 🔴 Reprovado

**Conferido no worktree:** `npm run build` OK (inclui `themes:catalog:check`, `theme-boot:check` sobre o `dist/` e `kit-names:check`); `playwright test` sobre esse `dist/`: **324/324** (os casos de `tema-sob-demanda.spec.ts` inclusive); suíte completa **492/492 arquivos, 3445/3445 testes, numa passada limpa** depois do build; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK (com `theme-boot` e `kit-names`); `node scripts/measure-consumer-boot.mjs`: boot 323,8 KB gzip ≤ teto 326,5 (referência só com o padrão 321,7 + catálogo 1,8 + 3), maior tema 2,6 KB ≤ 3,0; varredura do padrão "Segredo atribuido": 0. As decisões do dono estão implementadas (só o padrão no boot; amostra de cor gerada; `sarakGetThemePreset` fora; nenhuma mudança de versão).

**Achados:**

1. **A troca de tema descarta o `config` do host** — `src/core/Design/presets/themes/compose.ts` (`composeThemeDesign` = `{ padrões, ...identidade, ...tema }`), chamada por `useDesignSync.ts:55,79`. Antes, aplicar `activeThemeId` mantinha o valor do `config` do consumidor que o tema não declara; agora ele volta ao padrão — inclusive na **montagem** (o resumo declara: "valores de `config` que o tema não declara voltam ao padrão"). Um sistema que passa por `config` um token que o tema não declara (os funcionais, no caminho da `plan-110`: largura da barra lateral, estilo de navegação, camadas…) junto com `activeThemeId` o perde. A semente já compõe `{ padrões, ...tema, ...config }`. O critério da plan era "nunca herda do **tema anterior**", não "descarta o host". Correção: compor `padrões → identidade → config do host → tema` (o tema vence o que declara; o `config` vale no resto; o tema anterior nunca herda), na mesma função para Provider e prévia; teste: `config` com um token que o tema não declara sobrevive à aplicação de `activeThemeId` na montagem e a uma troca; e o caso A/B do critério continua verde. Critério violado: R33 (comportamento público do Provider) e "a UX não muda".
2. **A prévia do painel sem teste dedicado** (o próprio resumo registra): `useDesignDraft.handleThemePreview` passa a compor por `composeThemeDesign`, mas só a função tem teste. Caso: na prévia, A declara um token que B não declara; depois de B, o token é o padrão — e o "Aplicar" grava esse estado.

O resto da entrega está aprovado como está.

## Veredito — 2026-10-14 — correção 1 — 🟢 Aprovado

**Conferido no worktree:** `npm run build` OK (`theme-boot:check` sobre o `dist/`, `kit-names:check`); `playwright test` sobre esse `dist/`: **324/324**; suíte completa **493/493 arquivos, 3451/3451 testes, numa passada limpa** depois do build; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK; `measure-consumer-boot`: dentro do teto (326,6 KB gzip), maior tema 2,6 KB ≤ 3,0; varredura do padrão "Segredo atribuido": 0. Conferido no código: `composeThemeDesign` compõe padrões → identidade → `config` do host → tema, nas duas portas (Provider por `configRef`, sem entrar em dependência de efeito; prévia por `getHostConfig`); o modo do usuário continua vencendo o `mode` do `config`, porque `resolveThemeForMode` devolve o tema já no modo pedido e entra por último.

**Achados 1 e 2 fechados** (`ThemeSwitchComposition.test.tsx`: `config` sobrevive à montagem e à troca; A/B volta ao padrão ou ao `config`; prévia não herda e o "Aplicar" grava).

**Status: 🟢 Aprovada.** Próximo: o dono commita; o revisor sintetiza (destino da §8: `09`, `02`, `03`, ADR — o ADR 022 já nasceu na execução) e despacha a `plan-110`.
