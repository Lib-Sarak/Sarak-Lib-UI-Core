---
tipo: "plan"
titulo: "Tema sob demanda: o boot carrega so o tema que vai ao ar, e o resto do catalogo chega quando e escolhido"
objetivo: "Tirar do boot de todo consumidor o peso dos temas que ele nao usa, mantendo a hidratacao sincrona sem trocar de tema na tela, o catalogo listavel para o painel, e corrigir o tema padrao que aponta para um id inexistente"
dominio: "Design Engine / Temas embarcados / Bundle / Superficie publica"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "temas", "bundle", "lazy", "provider", "superficie-publica"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[03-superficie-publica]]", "[[05-build-e-distribuicao]]", "[[00-regras-e-invariantes]]"]
depende_de: "plan-115-fechamento-do-arsenal"
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
