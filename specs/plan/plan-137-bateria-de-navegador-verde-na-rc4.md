---
tipo: "plan"
titulo: "Deixar verde a bateria de navegador da rc.4"
objetivo: "Fazer o npm run cromo-css-real:check terminar sem falha antes da tag 8.0.0-rc.4, consertando na lib o contraste do texto sobre a barra que o host escurece e atualizando os testes de navegador que a campanha deixou para trás, sem afrouxar nenhuma afirmação"
dominio: "Testes de navegador / Paletas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "rc.4", "navegador", "paletas", "contraste"]
relacionados: ["[[plan-134-catalogo-de-paletas-e-temas]]", "[[plan-136-cor-ancora-fundo-tingido-e-harmonia-visivel]]", "[[09-temas-e-presets]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md + specs/specs/11-testes-e-cobertura.md"
---

# 1. Objetivo

`npm run cromo-css-real:check` (build + toda a suíte de navegador, `browser-tests/`) verde, local e no job `cromo-css-real` da CI,
antes da tag `8.0.0-rc.4`. Defeito da lib se conserta na lib. Teste desatualizado lê o valor do mesmo lugar que a tela, e nenhum
teste perde o que afirma.

# 2. Contexto

As plans da rc.4 rodaram só testes de componente, como manda o protocolo do contrato. A bateria de navegador ficou para o
fechamento, e no fechamento (2026-10-28, depois do conserto do `tema-sob-demanda.spec.ts`) deu **11 falhas e 434 passes**. Na
rc.3, o job `cromo-css-real` passava. Medição do revisor, sobre `test-results/*/error-context.md`:

**A. Defeito da lib (1 teste).** `plan-124-sidebar-contrast.spec.ts` — o host declara `{ mode: 'light', sidebarColor: '#111111' }`
(barra escura num tema claro). O item inativo sai com **texto `rgb(45, 49, 50)` sobre `rgb(17, 17, 17)`: contraste 1,44** (mínimo
4,5). O menu fica ilegível. Provável causa: a paleta (`plan-133`/`plan-134`) grava a cor do texto da barra como valor explícito
(`sidebarItemTextColor` = neutra 800 no claro). A correção de contraste da paleta só enxerga os fundos que ela mesma calcula e não
vê o `sidebarColor` do host. Antes, o texto era derivado do fundo efetivo da barra (`plan-124`). **É o cenário de um importador real**
(barra escura em sistema claro), e o ERP o usa.

**B. A diagnosticar (1 teste).** `painel-segue-o-modo.spec.ts` — sob um tema escuro, o painel desenha **0** elementos em branco
translúcido (esperado > 0). Pode ser o mesmo mecanismo do item A, porque a paleta troca uma cor derivada por uma explícita, ou o
teste estar medindo um valor que mudou de propósito. A execução decide com evidência.

**C. Valor esperado escrito à mão, que a paleta mudou (7 testes).** O teste fixa a cor antiga do tema:

| Teste | Esperado → recebido |
|---|---|
| `arsenal-restante-desenha.spec.ts` (2) | `25, 227, 240` (`#19e3f0`, primária do `sarak-sovereign` na rc.3) → `0, 88, 94` / `rgba(0, 88, 94, .4)` |
| `css-que-so-o-navegador-mede.spec.ts` (3) | `rgb(107, 216, 224)` → `rgb(0, 187, 198)` (foco, sombra de foco neumórfica, faixa do `SarakRangeSlider`) |
| `login-theme-application.spec.ts` | fundo `#06080d` (padrão do schema) → `#08090a` (paleta) |
| `plan-122-preview-mode.spec.ts` | `rgb(243, 246, 250)` → `rgb(247, 249, 249)` |

**D. Seletor que a campanha deixou para trás (2 testes).** `composition-scenes.spec.ts` (lista e detalhe) procura `main[aria-label]`.
No `96729ed2`, as cenas (`browser-tests/tela-lista.scene.tsx`, `browser-tests/tela-detalhe.scene.tsx`) deixaram de ser `<main>`: elas
são moldes que entram dentro do `<main>` do cromo, e um `<main>` dentro de outro é inválido. Foi correto. A spec não foi atualizada.

# 3. Escopo

## 3.1 Dentro
- **A (e B, se for o mesmo mecanismo):** o motor de paletas e a composição (`src/core/Design/palette/`,
  `src/core/Design/presets/themes/compose.ts`, `src/core/Provider/utils/overlayPreferences.ts` ou o ponto onde a cor do texto da barra
  era derivada na `plan-124`; localize e declare no resumo), com teste de componente que reproduz o cenário do host.
- **C e D:** os specs de `browser-tests/` citados e as fixtures deles.
- `docs/migracoes.md` — só se o item A mudar algo que o importador perceba (subseção na `## 8.0.0`).

## 3.2 Fora
- Afrouxar afirmação: trocar `toBe` por algo mais frouxo, baixar o mínimo de contraste, remover o teste ou marcá-lo como `skip`.
- A regra de cor da `plan-136` (âncora, fundo tingido, 60-30-10).
- `dist/` (gerado), a config do Playwright, os gates.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | a ordem de composição da paleta (defaults → preservado → paleta → host → tema) |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | o que o navegador mede e o `jsdom` não |
| Plan | `specs/plan/plan-134-catalogo-de-paletas-e-temas.md` §9 | os leitores do design composto e os testes que mudaram de valor |
| Teste | `browser-tests/tema-sob-demanda.spec.ts` + `browser-tests/fixtures/harness-entry.tsx` | o padrão já adotado: o valor esperado vem da página (`window.__sarakThemeProbe`), nunca escrito à mão nem importado do `src/` no Node |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · cor por token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Item A.** Reproduza o cenário num teste de componente (Provider com `{ mode: 'light', sidebarColor: '#111111' }`: o texto do
   item inativo passa de 4,5 sobre a barra). Ele tem de ficar vermelho antes do conserto. Corrija na lib: **quando o host (ou o tema)
   declara um fundo que a paleta calcula e não declara o texto que vai sobre ele, o texto se corrige contra o fundo efetivo** (os pares
   de `PAIRS`, a mesma régua do gate). Uma cor de texto que o host declarou explicitamente não é tocada.
3. **Item B.** Diagnostique com evidência (o que o painel desenhava na rc.3 e o que desenha agora, e por quê). Se for o mecanismo do
   item A, o conserto do A o cobre. Se for mudança de valor intencional da paleta, o teste passa a medir o efeito pelo valor que a
   página calcula. Se for outro defeito, **pare e reporte**: não conserte fora do escopo.
4. **Itens C.** Cada valor esperado passa a vir da página (estenda o `window.__sarakThemeProbe` ou o padrão equivalente da fixture
   daquele spec), nunca de um literal e nunca de import do `src/` no Node. A afirmação continua a mesma (`toBe` segue `toBe`).
5. **Item D.** O seletor dos dois testes de `composition-scenes.spec.ts` passa a localizar a raiz da cena sem exigir `<main>`: um
   atributo de dados nas cenas ou o filho do container da cena. As medidas que o teste faz continuam as mesmas.
6. `npm run cromo-css-real:check` **inteiro**, uma vez, até o fim (Playwright em segundo plano, se o terminal tiver limite de tempo).
   Cole a linha final (passados/falhos). Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
7. Os testes de componente do item A por filtro de arquivo e `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Item A reproduzido por teste de componente, vermelho antes e verde depois. No navegador, `plan-124-sidebar-contrast` verde.
- [ ] Item B com causa escrita no resumo e o teste verde pelo caminho do passo 3.
- [ ] Itens C: nenhum literal de cor de tema nos 7 testes, e as afirmações iguais (o diff mostra só a origem do valor esperado).
- [ ] Item D: os dois testes verdes, com as mesmas medidas.
- [ ] `npm run cromo-css-real:check` verde inteiro, com a linha final no resumo.
- [ ] `audit:baseline` sem regressão (no `quick`).

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — o job `cromo-css-real` da CI já cobre.

- Diff dos specs lido: a afirmação não muda, só a origem do valor esperado.
- O teste de componente do item A, por filtro de arquivo, e a mutação: sem o conserto, ele falha.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` uma vez.
- A bateria de navegador **não** se repete no revisor: vale a linha final colada pelo executor, e o job `cromo-css-real` da CI a mede
  de novo no push.

# 8. Destino da síntese

- `specs/specs/09-temas-e-presets.md` §4.3.4 — a paleta corrige o texto contra o fundo **efetivo**, inclusive o que o host declara.
- `specs/specs/11-testes-e-cobertura.md` — o teste de navegador tira o valor esperado de cor da página, nunca de literal (a campanha
  rc.4 quebrou 7 testes que escreviam a cor do tema à mão).

---

# 9. Resumo da execução

# 10. Veredito
