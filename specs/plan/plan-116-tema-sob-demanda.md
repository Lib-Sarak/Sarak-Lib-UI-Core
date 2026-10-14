---
tipo: "plan"
titulo: "Tema sob demanda: o boot carrega so o tema que vai ao ar, e o resto do catalogo chega quando e escolhido"
objetivo: "Tirar do boot de todo consumidor o peso dos temas que ele nao usa, mantendo a hidratacao sincrona sem trocar de tema na tela, o catalogo listavel para o painel, e corrigir o tema padrao que aponta para um id inexistente"
dominio: "Design Engine / Temas embarcados / Bundle / Superficie publica"
status: "🔴 A executar"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
