---
tipo: "plan"
titulo: "Medir em navegador e consertar o CSS que o jsdom não vê"
objetivo: "Fazer cinco defeitos de CSS da lib terem caso de navegador que falha hoje e passa depois do conserto, e medir um relato de perda de digitação no painel"
dominio: "Sarak-Lib-UI-Core / Design Engine / CSS publicado"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "css", "browser-tests", "camadas", "atomos"]
relacionados: ["[[02-design-engine]]", "[[11-testes-e-cobertura]]", "[[03-superficie-publica]]", "[[06-painel-de-customizacao-e-preview]]"]
depende_de: "plan-89-tokens-de-cromo-ligados-e-medidos"
retida_por: ""
destino_sintese: "arquitetura/02-design-engine.md + specs/11-testes-e-cobertura.md"
---

# 1. Objetivo

Cinco defeitos de CSS que a suíte `jsdom` não enxerga ganham caso de navegador **vermelho antes e verde
depois** do conserto, e o relato de que a busca do painel perde a primeira digitação é medido num navegador
real.

# 2. Contexto

`jsdom` não resolve cascata de stylesheet, não valida valor de CSS e não calcula layout. Os seis itens abaixo
vivem exatamente nesse ponto cego — por isso seguem no código com a suíte verde. A medição de navegador
(`browser-tests/`) existe, mas só cobre o cromo.

| # | Defeito | Onde | Efeito |
|---|---|---|---|
| 1 | **Seletor que casa pelo NOME da classe.** `[data-sx-texture] [class*="card"]` força `background` e `backdrop-filter` com `!important` | `src/styles/_atmosphere.css:618-623`; o mesmo mecanismo nas regras `[class*="card"]::after`, a partir de `:83` — 85 ocorrências no arquivo | qualquer utilitária com `card` no nome — da lib (`bg-theme-card`) ou do consumidor (`hover:bg-[var(--color-theme-card,…)]`) — perde o fundo quando há textura. É a classe de defeito que a camada de padrões de elemento já fechou para `[class*="border"]` |
| 2 | **Custom property cíclica.** `--theme-primary-hover: var(--theme-primary-hover, color-mix(…))` e as irmãs `-active`, `-focus`, `secondary-*`, `accent-*` referenciam a si mesmas no `body` | `src/styles/_base.css:26-34` | ciclo é inválido; a reserva `color-mix(...)` **nunca** é usada. Com o Design Engine montado o valor injetado vence; sem ele, não há hover de botão. O mesmo arquivo já resolveu isso para o raio (`:36-45`, com o motivo no comentário) |
| 3 | **O `body` não cede à classe utilitária.** Os padrões dele estão divididos entre dois arquivos, e o token de entrelinha só vence o literal por ordem de arquivo | `src/styles/_base.css:12-56` (`line-height: 1.5` literal em `:55`) · `src/styles/_typography.css:5-8` | é o item que [[02-design-engine]] §9.1 lista em *"o que ainda não cede à classe"* |
| 4 | **Valor de CSS malformado em estilo inline.** Parêntese sobrando, e `box-shadow` que é só uma cor | `src/components/atomic/hooks/useAtomicStyles.ts` — `:58` e `:61` (botão `frosted`), `:106` e `:110-112` (campo: foco e `neumorphism`), `:138`, `:147-148` (switch); e, pela mesma classe de defeito, `src/components/atomic/Inputs/SarakRangeSlider.tsx` (as constantes `ACTIVE` e `TRACK`) e `src/components/atomic/Layouts/SarakAccordion.tsx` (o `borderColor`) *(emendado em 2026-10-09: `SarakDataEmpty` e `SarakSocialButton` já estão válidos)* | o navegador descarta a declaração inteira, em silêncio |
| 5 | **A seta do `SarakSelect` flutua.** Sem `fullWidth`, o invólucro é bloco e ocupa a célula; o `<select>` fica com a largura do conteúdo; a seta é absoluta e ancorada na direita do invólucro | `src/components/atomic/Inputs/SarakSelect.tsx:50-67` | em grid que estica, a seta aparece sozinha no canto direito, longe do campo |
| 6 | **Relato não reproduzido:** a busca de token do painel descarta a primeira digitação logo depois de abrir a aba Design | campo em `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx:105`; o painel é `lazy` (`src/features/DesignEngine/Library/CustomizationPanel/index.tsx:16`) | relatado no ERP por automação; **não** reproduzido em `jsdom` por quatro métodos. Hipótese: o campo que recebe a primeira digitação é substituído por uma montagem nova. **As plans 99 e 100 rodam antes desta e mexem nesse cabeçalho: a linha `:105` vai se deslocar — localize o campo pelo `placeholder`, não pelo número** |

**O que já se sabe sobre o item 1.** As âncoras explícitas existem: `.sarak-card` e `.bg-theme-card`
(`src/styles/_cards.css:2`) e `.card`. O `[class*="card"]` alcança, além delas, tudo que tenha `card` no
nome. No `packages/ui-kit` do ERP Earendel não há nenhum `className` literal com `card` — medido em
2026-10-02, só nesse pacote.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — medir**
- `browser-tests/fixtures/harness-entry.tsx` — elementos de prova e recortes novos.
- `browser-tests/cromo-css-real.spec.ts`, ou um `.spec.ts` irmão em `browser-tests/` — os casos.

**Lote 2 — consertar**
- `src/styles/_atmosphere.css` — os seletores por nome de classe.
- `src/styles/_base.css` · `src/styles/_typography.css` · `src/styles/_elements.css` — o ciclo e o `body`.
- `src/components/atomic/hooks/useAtomicStyles.ts` — **só** os valores malformados.
- `src/components/atomic/Inputs/SarakRangeSlider.tsx` e `src/components/atomic/Layouts/SarakAccordion.tsx` — **só** os valores malformados *(emendado em 2026-10-09)*.
- `browser-tests/css-que-so-o-navegador-mede.spec.ts` e `browser-tests/fixtures/harness-entry.tsx` — **só** para acrescentar os casos dos dois arquivos acima, vermelhos antes do conserto *(emendado em 2026-10-09)*.
- `src/components/atomic/Inputs/SarakSelect.tsx` — **só** a relação entre invólucro, campo e seta.
- Componentes da lib que hoje só recebem a superfície de cartão por causa do casamento por nome — eles
  ganham a âncora explícita. A lista entra no resumo.
- Testes ao lado do que mudou (`__tests__/`).
- `docs/migracoes.md` — a nota do item 1.
- `dist/`, `sarak-ui/`, `sarak-dev/` — regenerados pelos geradores. Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **O `!important` de `background-color` do `body`** e o `transform !important` do botão pressionado — a
  [[02-design-engine]] §9.1 explica por que ficam na camada final.
- **A ordem das camadas** em `src/styles/sarak-base.css` — nenhuma camada de topo nova.
- A lógica de `useAtomicStyles.ts`: nenhum estilo novo, nenhuma variante nova. Só o valor que estava inválido
  passa a ser o valor que claramente se pretendia.
- A prop `error` e a renderização de erro do `SarakSelect` — é da `plan-91`.
- **O item 6 só é consertado se a causa for a remontagem do painel carregado sob demanda.** Outra causa:
  relate e pare.
- Os casos de navegador que já existem — continuam verdes **sem edição**.
- `src/features/DesignEngine/` além do necessário para o item 6.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/02-design-engine.md` | §9.1 — a ordem de camadas, as quatro regras que ela impõe e o que ainda não cede à classe |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §7.2 e §7.3 — o que a medição de navegador mede, como, e os limites |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R16 (zero-gambiarra no consumidor), R24 (o CSS não vaza em modo embarcado), R34 (o átomo renderiza sem Provider), R35 |
| Spec fixa | `specs/arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | o modo embarcado — o CSS escopado herda as mesmas regras |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | o painel do item 6 |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | como ler `auditor_hardcoded` e `auditor_ghostvars` — os dois varrem `src/styles/` |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | a regra de CSS do Design Engine |
| **Skill** | `test-unitario` | os testes em `jsdom` |
| Código | `src/styles/sarak-base.css` | a ordem de camadas |
| Código | `src/styles/_atmosphere.css` | os seletores do item 1 |
| Código | `src/styles/_base.css` · `src/styles/_typography.css` · `src/styles/_elements.css` | itens 2 e 3 |
| Código | `src/styles/_cards.css` | as âncoras explícitas de cartão |
| Código | `src/components/atomic/hooks/useAtomicStyles.ts` | item 4 |
| Código | `src/components/atomic/Inputs/SarakSelect.tsx` | item 5 |
| Código | `browser-tests/cromo-css-real.spec.ts` · `browser-tests/fixtures/harness-entry.tsx` | o idioma dos casos e dos elementos de prova |
| Código | `scripts/build-scoped-css.mjs` | o CSS escopado é derivado do mesmo fonte |

# 5. Instruções de execução

**Vale para os dois lotes:** a medição lê o `dist/` — `npm run build` antes de cada rodada. Asserção de
navegador é **relacional**: o elemento medido contra um irmão que carrega a expressão pretendida, nunca um
número escrito à mão. Classe usada num elemento de prova tem de ser uma que o `dist/sarak.css` já emite.

**Lote 1 — os casos vermelhos**

1. **Item 1.** Sob textura ativa, um elemento com utilitária cujo nome contém `card` mantém o fundo que a
   classe dele escreve. Contraprova **NÃO MUDA NADA**: um cartão de verdade da lib, sob a mesma textura,
   computa a superfície de cartão.
2. **Item 2.** Página do harness **sem** `SarakUIProvider`: sob hover, um botão computa um fundo de hover
   diferente do fundo em repouso. Contraprova: com Provider, o hover continua sendo o do tema.
3. **Item 3.** Um `body` com utilitária de entrelinha computa a entrelinha da classe. Contraprova: sem
   classe, computa a do token.
4. **Item 4.** Para cada valor malformado, um caso prova que a propriedade computada é a pretendida, e não o
   valor inicial do navegador — com o recorte de tema que ativa o ramo (`frosted`, `neumorphism`, `glass`).
5. **Item 5.** `SarakSelect` sem `fullWidth`, numa célula de grid que estica: a seta fica dentro da caixa do
   campo.
6. **Item 6.** Abra a aba Design do painel e digite imediatamente na busca de token, pelo teclado, 20 vezes.
   Registre no resumo em quantas a digitação chegou inteira ao campo.
7. Confirme que os casos dos itens 1 a 5 **falham** contra o `dist/` de hoje, e cole a saída. Caso que nasce
   verde não prova nada: reescreva-o ou relate que o defeito não se reproduz.
8. Entregue o lote 1 e **pare para o veredito**. Não commita-se caso vermelho: o lote 1 é aprovado como
   medição, e o commit sai junto com o lote 2.

**Lote 2 — os consertos**

9. **Item 1.** Nenhuma regra da lib alcança cartão por substring de nome de classe: superfície e textura
   chegam por âncora explícita. Antes de trocar, faça o inventário de quem dependia do casamento por nome, e
   dê a âncora a cada um.
10. **Item 2.** A reserva de hover, ativo e foco passa a valer quando o Design Engine não está montado — pelo
    mesmo caminho que o arquivo já usa para o raio.
11. **Item 3.** Os padrões do `body` ficam num lugar só e cedem à classe utilitária.
12. **Item 4.** Cada valor passa a ser CSS válido. Onde o valor pretendido não for evidente pelo vizinho
    (o `box-shadow` de foco que hoje é só uma cor), **registre a escolha no resumo como suposição**.
13. **Item 5.** A seta acompanha o campo, com e sem `fullWidth`.
14. **Item 6**, só se reproduziu **e** a causa é a remontagem: o campo preserva a digitação.
15. `docs/migracoes.md` ganha a nota do item 1: classe do consumidor com `card` no nome deixa de receber a
    superfície de cartão sob textura, e qual é a âncora explícita para quem quer o efeito.
16. `npm run build`, depois `npm run cromo-css-real:check` → todos os casos verdes, novos e antigos.
17. `npm run audit` contra o baseline → sem regressão. `npx tsc --noEmit` → zero erros. `npx vitest run` →
    verde. `npm run dev-kit`.

# 6. Critérios de aceite

- [ ] Cada um dos itens 1 a 5 tem caso de navegador que **falhou** contra o `dist/` anterior (saída no
      resumo) e **passa** depois.
- [ ] Cada item que tem contraprova **NÃO MUDA NADA** a traz, e ela passa antes e depois.
- [ ] `grep -c 'class\*="card"' src/styles/_atmosphere.css` → 0, e o resumo lista quem ganhou âncora
      explícita.
- [ ] Em `src/styles/_base.css`, nenhuma custom property referencia a si mesma.
- [ ] A lista *"o que ainda não cede à classe"* não tem mais motivo para citar o `body`: ele cede, e o caso
      de navegador prova.
- [ ] Nenhum valor de `useAtomicStyles.ts`, `SarakRangeSlider.tsx` ou `SarakAccordion.tsx` tem parêntese desbalanceado; o
      `box-shadow` de foco é uma sombra, não uma cor.
- [ ] A seta do `SarakSelect` fica dentro da caixa do campo, com e sem `fullWidth`.
- [ ] O item 6 tem a contagem das 20 tentativas no resumo, e uma das duas saídas: não reproduz (caso fica
      como regressão) ou reproduz (consertado, ou relatado com a causa).
- [ ] Os casos de navegador que já existiam passam **sem terem sido editados**.
- [ ] `docs/migracoes.md` tem a nota do item 1.
- [ ] `npm run audit` sem regressão; `npx tsc --noEmit` com zero erros; suíte verde.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — são defeitos de comportamento; a prova é caso de navegador, que roda no
`cromo-css-real:check` e no job de CI de mesmo nome.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- **Prova de que os casos mordem, sem tocar o worktree:** exportar o `HEAD` para um diretório temporário,
  buildar lá e rodar os casos novos contra aquele `dist/` → os dos itens 1 a 5 falham.
- `npm run build`, depois `npm run cromo-css-real:check` → verde, 3 vezes.
- `grep -c 'class\*="card"' src/styles/_atmosphere.css` → 0.
- `git diff -- src/styles/sarak-base.css` → vazio.
- `git diff -- src/components/atomic/hooks/useAtomicStyles.ts` → só os valores; nenhuma lógica.
- `git diff` dos casos antigos de `cromo-css-real.spec.ts` → nenhum alterado.
- `npm run audit` contra o baseline · `npx tsc --noEmit` · `npx vitest run` → sem regressão, 0 erros, verde.

# 8. Destino da síntese

**Destino:** `arquitetura/02-design-engine.md + specs/11-testes-e-cobertura.md`

- **`02-design-engine`** §9.1 — o `body` sai de *"o que ainda não cede à classe"*. Entra a regra: **a lib
  alcança cartão por âncora explícita, nunca por substring de nome de classe** — com as âncoras que valem.
- **`11-testes-e-cobertura`** §7.3 — as famílias que a medição passou a cobrir (átomos, cascata sob textura,
  render sem Provider), e a lista do que ela não vê atualizada.

Os cinco consertos não entram em spec: é defeito corrigido, e defeito corrigido não aparece em spec fixa. A
nota de migração do item 1 é escrita pela própria execução.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (Lote 1 — medir) — 2026-10-09

**Resultado:** Concluído com pendências — só o Lote 1, a pedido do usuário; o Lote 2 não foi tocado. Cinco dos seis itens têm caso vermelho (itens 1 a 5, e o item 4 com oito casos); o item 6 não reproduziu.

**Estado do worktree ao iniciar**
```
 M specs/00-contexto.md
 M specs/00-indice.md
 M specs/arquitetura/03-superficie-publica.md
 D specs/plan/plan-100-painel-de-temas-caminho-simples.md
 D specs/plan/plan-101-motor-de-graficos-completo.md
 D specs/plan/plan-98-dialogo-e-feedback.md
 M specs/specs/06-painel-de-customizacao-e-preview.md
 M specs/specs/09-temas-e-presets.md
```
A plan chegou em `🔴 A executar`, e não em `🟡`: executei porque o usuário mandou executar o Lote 1 e passar o status a `🟠`.

**O que foi feito**
- `browser-tests/fixtures/harness-entry.tsx` — import de `SarakCustomizationPanel`, `SarakInput`, `SarakSelect`, `SarakSwitch`, `SarakTitleCard`; três recortes novos em `TOKEN_VARIANTS` (`atomo-frosted`, `atomo-neumorphism`, `atomo-glass`); cinco cenas escolhidas por `?cena=` (`textura`, `sem-provider`, `atomos`, `select-grade`, `painel`). Sem `?cena=` vale o `App` de antes, intocado.
- `browser-tests/css-que-so-o-navegador-mede.spec.ts` (novo, irmão do spec do cromo) — 16 casos: item 1 (1 + contraprova), item 2 (1 + contraprova), item 3 (1 + contraprova), item 4 (8), item 5 (1 + contraprova com `fullWidth`), item 6 (1). Régua relacional: o elemento medido contra um `<i>` irmão com a expressão pretendida em estilo inline.
- Rodei `npm run build` antes das medições. O `tsx` estava presente, e a CLI do Tailwind baixou normalmente.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/fixtures/harness-entry.tsx` | alterado | cenas e recortes novos (+89/−2) |
| `browser-tests/css-que-so-o-navegador-mede.spec.ts` | criado | 16 casos do Lote 1 |
| `dist/` (37 entradas), `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | regenerados | efeito colateral do `npm run build` (geradores, nada à mão); não são mudança de lógica |

**Verificações executadas**
- Contagem de processos `vitest|tsup` antes do build, em chamada separada → 0. Nenhum vitest rodado neste lote.
- `npm run build` → concluído sem erro (todos os `*:check` de pré-build verdes).
- `npx playwright test … css-que-so-o-navegador-mede` → **11 falharam, 5 passaram**. Os 11 vermelhos, com a causa que o navegador mediu:
  - item 1 — `Expected "rgba(15, 23, 42, 0.6)"` (a classe `bg-[var(--sarak-card-bg)]`), `Received "color(srgb 0.0588235 0.0901961 0.164706 / 0.48)"` (a superfície de cartão forçada por `[class*="card"]`, 0,6 × 0,8).
  - item 2 — sem Provider, `Expected: not "rgba(0, 0, 0, 0)"`, `Received: "rgba(0, 0, 0, 0)"` (o hover não difere do repouso).
  - item 3 — `Expected "14px"` (`leading-none`), `Received "22.4px"` (o token, 14 × 1,6).
  - item 4, frosted/borda (`useAtomicStyles.ts:58`) — `Expected "rgba(255, 255, 255, 0.1)"`, `Received "rgba(255, 255, 255, 0.467)"` (a cor do texto).
  - item 4, frosted/sombra (`:61`) — `Expected "rgba(0, 0, 0, 0.4) 0px 2px 5px 0px, rgba(0, 0, 0, 0.2) 0px 40px 60px 0px"`, `Received "none"`.
  - item 4, campo em foco (`:105`) — `Expected substring "rgb(0, 242, 255)"`, `Received "none"`.
  - item 4, neumorphism em repouso (`:110`) — `Expected pattern /inset[\s\S]*inset/`, `Received "none"`.
  - item 4, neumorphism em foco (`:112`) — `Expected substring "rgb(0, 242, 255)"`, `Received "none"`.
  - item 4, trilho do switch (`:138`) — `Expected "rgba(15, 23, 42, 0.6)"`, `Received "rgba(0, 0, 0, 0)"`.
  - item 4, switch glass (`:148`) — `Expected "rgba(255, 255, 255, 0.1)"`, `Received "rgb(255, 255, 255)"`.
  - item 5 — `Expected: <= 102`, `Received: 592` (a seta termina 490 px à direita da caixa do select).
- Os 5 verdes são as quatro contraprovas "NÃO MUDA NADA" (itens 1, 2, 3 e 5) e o item 6.
- Item 6: `[item 6] digitação inteira em 20 de 20 tentativas`. Método: cena `painel`, clique em "Abrir painel", `waitFor` no campo de placeholder "Buscar token...", `focus()` e `keyboard.type('primario')`, releitura do campo por um localizador novo; 20 páginas novas.
- `npx playwright test … cromo-css-real.spec` (casos antigos, sem edição; `git diff` do arquivo vazio) → 1ª rodada 31 verdes e 1 falha (`isSplitViewEnabled`, `Expected: <= 2811.015625`, `Received: 2813.015625`); depois 6 rodadas sem falha (3 do caso isolado e 2 do arquivo inteiro, mais o controle abaixo) → 32 verdes nas duas rodadas do arquivo inteiro.
- Controle no `HEAD` fora do repositório, com o mesmo `dist/` (`git archive` + junção de `node_modules`; junção removida antes de apagar a cópia): o caso passou. `Test-Path node_modules` do repo → `True`; `git status --short` antes e depois → idêntico.

**Critérios de aceite** (do Lote 1)
- [x] Casos dos itens 1 a 5 falham contra o `dist/` de hoje — saída acima.
- [x] Contraprovas "NÃO MUDA NADA" dos itens 1, 2, 3 e 5 passam hoje.
- [x] Casos de navegador que já existiam continuam verdes sem edição — com a intermitência registrada em *Achados*.
- [x] Item 6 medido: 20 de 20, não reproduz.
- [ ] Itens 1 a 5 completos — o `SarakDataEmpty.tsx` e o `SarakSocialButton.tsx` da §2 não têm valor malformado hoje (ver *Decisões*), então não há caso para eles; falta decisão do revisor.

**Decisões e suposições**
- **Onde está este resumo:** na §9, que é o lugar do executor neste plano; a §10 é o veredito do revisor. O pedido dizia "§10, antes do título `# 11. Síntese`"; a §9 também fica antes dele.
- **`SarakDataEmpty.tsx` e `SarakSocialButton.tsx`:** a tabela da §2 cita `SarakDataEmpty.tsx:24` e `SarakSocialButton.tsx:76,85-86`, mas um varredor de parênteses sobre `src/components/atomic/` (strings com `var(`) não achou desbalanceamento nenhum nos dois; as linhas 26, 77 e 84-85 têm valores válidos. Não escrevi caso: nasceria verde e não provaria nada. A premissa da plan parece desatualizada.
- **Item 4, relação com o "pretendido":** onde o vizinho dá o valor (borda, fundo do trilho, sombra do frosted), a régua é a expressão do próprio vizinho. Para o `box-shadow` de foco (`:105`) e os de neumorphism (`:110`, `:112`) a plan pede registrar a escolha, e por isso os casos só exigem estrutura: contém a cor primária do tema, e (neumorphism) duas camadas `inset`. Qualquer conserto válido de Lote 2 que mantenha isso passa.
- **Item 1, régua:** o fundo de cartão é reescrito com `!important` também no `<i>` de referência quando ele tem a classe, então a régua dele é a expressão inline e não a classe; a superfície de cartão da contraprova repete a fórmula de `_atmosphere.css`. Usei `bg-[var(--sarak-card-bg)]` como a utilitária com `card` no nome (o `dist/sarak.css` já a emite).
- **Item 2:** o botão de prova é um `<button>` nativo sem Provider; o Lote 2 precisa cuidar de que `--primary-color` também não existe sem o Provider — só tirar o ciclo não basta, a reserva `color-mix(in srgb, var(--primary-color), …)` fica inválida do mesmo jeito. O caso acusa isso sem prender a forma do conserto.
- **Item 6, limite:** a fixture é empacotada em IIFE (`build-harness.mjs`), então o `import()` do painel resolve dentro do bundle, sem ida à rede. Mede remontagem, não latência de chunk. Está no cabeçalho do spec novo.
- O spec novo duplica três funções pequenas do spec do cromo (`readComputed`, a régua e o `launch`) porque importar o spec antigo executaria os casos dele e editá-lo é proibido.

**Achados fora do escopo (não corrigidos)**
- `browser-tests/cromo-css-real.spec.ts:547` — `isSplitViewEnabled responde à largura da região…` falhou **uma vez** em 6 execuções do worktree (`bottom` 2813,02 > `top` 2811,02, 2 px de sobreposição no empilhamento) e passou no controle do `HEAD` e nas demais. Intermitência no layout do cromo; não relacionada a esta execução, que não mexe em `src/`.
- `src/components/atomic/Inputs/SarakRangeSlider.tsx:25-26` — `ACTIVE` e `TRACK` com um parêntese a mais (mesma classe de defeito do item 4, fora da lista da §3.1).
- `src/components/atomic/Layouts/SarakAccordion.tsx:35` — `borderColor = 'var(--border-color,#334155))'`, idem.
- `src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx:50-51` — o varredor também apontou estas linhas; não conferi se é defeito ou ruído da expressão regular.

**Pendências / riscos**
- Casos vermelhos **não** devem ser commitados sozinhos (plan §5, passo 8): o commit sai com o Lote 2.
- `dist/`, `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` estão modificados pelo build; o revisor deve contá-los como saída do gerador, e não como edição.
- O item 6 não reproduziu em 20 de 20; pela §3.2 o Lote 2 não mexe no painel a menos que o revisor mande medir de outro modo.

## Resumo da execução (Lote 2 — consertar) — 2026-10-09

**Resultado:** Concluído. Itens 1 a 5 consertados, com os casos de navegador vermelhos antes e verdes depois; item 6 não tocado (20 de 20, o caso fica como regressão). Passos 16 e 17, a lista de gates do `.githooks/pre-commit` e `check-audit-baseline --with-tsc`, todos verdes.

**Estado do worktree ao iniciar**
```
(limpo)
```
O Lote 1 já estava commitado (`45707f68`). A plan-103 ainda não havia deixado edição na árvore; o `npm run build` completo passou sem parar em `catalog:check`, `barrel:check` nem `guide:check` por causa dela (o `guide:check` parou uma vez por **edição minha**, em `docs/migracoes.md`; ver *Decisões*).

**O que foi feito**
- **Itens 4 novos, vermelhos primeiro** (`browser-tests/fixtures/harness-entry.tsx`: `SarakRangeSlider` e `SarakAccordion` entram na cena `atomos`; `css-que-so-o-navegador-mede.spec.ts`: 3 casos). Saída contra o `dist/` de antes do conserto, 3 falharam:
  - trilho — `Expected: "rgba(255, 255, 255, 0.1)"`, `Received: "rgba(0, 0, 0, 0)"`
  - faixa ativa — `Expected: "rgb(0, 242, 255)"`, `Received: "rgba(0, 0, 0, 0)"`
  - acordeão — `Expected: "rgba(255, 255, 255, 0.1)"`, `Received: "rgb(255, 255, 255)"`
- **Item 1** — `src/styles/_atmosphere.css`: a regra de superfície troca `[data-sx-texture] [class*="card"]` por `[data-sx-texture] .bg-theme-card` (`.card` e `.sarak-card` já estavam na regra); as 84 ocorrências de `[class*="card"]` das texturas `::after` viram `:is(.card, .bg-theme-card)` (as de `.sarak-card` já existiam ao lado). `grep -c 'class\*="card"'` → **0**.
- **Item 2** — `src/styles/_base.css`: `--theme-{primary,secondary,accent}-{hover,active}` e `--theme-primary-focus` deixam de se referenciar; cada reserva usa uma cor que existe sem o engine (`#3b82f6`, `#64748b`, `#06b6d4`; `59, 130, 246` no foco). Com o engine montado, o valor que ele injeta no `body` vence a regra, como no raio.
- **Item 3** — o `body` ficou num lugar só: `src/styles/_elements.css` (camada `components.sarak-elements`) recebe cor, transição, margens, `overflow-x`, família, tamanho, peso e entrelinha; `_base.css` mantém só as variáveis e o `background-color` `!important`; o bloco de `_typography.css` saiu.
- **Item 4** — `useAtomicStyles.ts` (`:58`, `:61`, `:105`, `:110`, `:112`, `:138`, `:147`, `:148`), `SarakRangeSlider.tsx` (`ACTIVE`, `TRACK`), `SarakAccordion.tsx` (`borderColor`): só os valores. Nenhuma lógica nem variante mudou.
- **Item 5** — `SarakSelect.tsx`: sem `fullWidth`, o invólucro e o campo ganham `w-fit` (antes `''`); com `fullWidth` segue `w-full`.
- **Item 15** — `docs/migracoes.md`: nota nova no topo (PATCH visual) com as âncoras `card`, `sarak-card` e `bg-theme-card`.
- Snapshots: 3 atualizados porque o markup mudou exatamente pelo conserto (`SarakSearchCard` — parêntese do trilho; `SarakChart` — âncora `card`; `LayoutTab` — `w-fit` nos selects).

**Inventário do item 1 — quem dependia do casamento por nome**
Varredura das strings de classe de `src/` (fora de testes): nenhum componente usa uma classe de nome próprio com `card` fora das âncoras (`sarak-card`, `card`, `bg-theme-card`). O substring alcançava, **por acidente**, cerca de 60 arquivos com utilitárias como `bg-[var(--color-theme-card,…)]` (campos, botões, tooltips, menus): esses só ganham — passam a computar o fundo que a classe escreve. **Ganharam a âncora explícita `card`** os contêineres que são cartões de fato (fundo de cartão + raio de cartão + borda própria):
`SarakChart.tsx` (raiz) · `components/ManagementGroupCard.tsx` (raiz) · `SarakStats.tsx` (item e esqueleto) · `SarakTableView.tsx` (invólucro) · `SarakManagementGrid.tsx` (modal, cabeçalho e esqueleto) · `SarakCatalogGrid.tsx` (seção e item) · `SarakHelpButton.tsx` (diálogo). `card` dá superfície e textura sem o `padding` e a borda de `sarak-card`. Ficaram **sem** âncora, de propósito: controles (campos, botões, menus, paginação) e os que escrevem opacidade própria (`RecursiveMatrixNode`, `SarakExpandableMatrix`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_atmosphere.css` | alterado | seletores por substring → âncoras explícitas |
| `src/styles/_base.css`, `_elements.css`, `_typography.css` | alterado | itens 2 e 3 |
| `src/components/atomic/hooks/useAtomicStyles.ts` | alterado | 8 valores |
| `…/Inputs/SarakRangeSlider.tsx`, `…/Layouts/SarakAccordion.tsx` | alterado | 1 a 2 valores cada |
| `…/Inputs/SarakSelect.tsx` | alterado | `w-fit` sem `fullWidth` |
| `…/Templates/{SarakChart,SarakStats,SarakTableView,SarakManagementGrid,SarakCatalogGrid,SarakHelpButton,components/ManagementGroupCard}.tsx` | alterado | âncora `card` |
| `…/__tests__/__snapshots__/` (SarakSearchCard, SarakChart, LayoutTab) | alterado | markup novo |
| `browser-tests/css-que-so-o-navegador-mede.spec.ts`, `browser-tests/fixtures/harness-entry.tsx` | alterado | 3 casos e 2 elementos de prova; e a espera do `box-shadow` (ver *Decisões*) |
| `docs/migracoes.md` | alterado | nota do item 1 |
| `sarak-ui/docs/migracoes.md`, `dist/` (43 entradas), `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | regenerados | `npm run guide` e `npm run build`; nada à mão |

**Verificações executadas**
- `npm run build` (com os `*:check` de pré-build) → exit 0, na 2ª vez; a 1ª parou em `guide:check` ("kit do consumidor DEFASADO em 1 arquivo: sarak-ui/docs/migracoes.md") por causa da minha nota; `npm run guide` e repeti.
- `npm run cromo-css-real:check` → **51 passed** (32 antigos + 19 novos), exit 0; mais duas rodadas só do playwright → 51 e 51. Total: **3 rodadas verdes**. `[item 6] digitação inteira em 20 de 20 tentativas` em todas. O `isSplitViewEnabled` não falhou nenhuma vez.
- `npx tsc --noEmit` → exit 0, zero erros.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `igual ao baseline de 2026-08-11 — nenhuma regressão`.
- `npx vitest run` → 1ª vez: 3 falhas, só de snapshot, todas pelo que mudei (diferenças coladas acima nos itens). Depois da atualização: **422 arquivos, 2473 testes, todos passando** (824 s).
- `npm run dev-kit` → exit 0; `sarak-dev/` não ficou com diferença.
- Gates do `.githooks/pre-commit`, um a um, todos exit 0: `check-plan-index-sync`, `generate-dev-kit --check`, `check-barrel-parity --check`, `generate-component-catalog --check`, `check-zero-brand --check`, `generate-consumer-kit --check`, `check-no-deep-import`, `check-gate-limits`, `check-container-query-literal`, `check-container-query-boundary`, `check-persistence-doc-identifiers`, `check-class-merge`, `check-icon-port`, `check-chrome-token-parity`, `check-trail-citation`, `generate-token-types --check`, `verificar_commit.py` (nada staged). **Não rodei** `check-agent-git-write` (falha em sessão de agente por definição) nem `gerar_indice.py` (grava `.agents/index.md` e faz `git add`).
- `git diff` de `browser-tests/cromo-css-real.spec.ts` e de `src/styles/sarak-base.css` → vazio.

**Critérios de aceite**
- [x] Itens 1 a 5 com caso que falhou contra o `dist/` anterior (Lote 1 e acima) e passa agora — 3 rodadas, 51 verdes.
- [x] Contraprovas "NÃO MUDA NADA" passam antes e depois (itens 1, 2, 3 e 5).
- [x] `grep -c 'class\*="card"' src/styles/_atmosphere.css` → 0; lista dos ancorados acima.
- [x] `_base.css` sem custom property que referencie a si mesma.
- [x] O `body` cede à classe: caso do item 3 verde. *(A lista "o que ainda não cede à classe" é da spec 02 §9.1, do revisor.)*
- [x] Sem parêntese desbalanceado em `useAtomicStyles.ts`, `SarakRangeSlider.tsx`, `SarakAccordion.tsx` (varredor sem achados nesses três); `box-shadow` de foco é uma sombra.
- [x] Seta do `SarakSelect` dentro do campo, com e sem `fullWidth`.
- [x] Item 6: 20 de 20, caso fica como regressão.
- [x] Casos antigos do cromo passam sem edição.
- [x] `docs/migracoes.md` tem a nota do item 1.
- [x] `npm run audit` sem regressão, `tsc` zero, suíte verde.

**Decisões e suposições**
- **Item 2, reserva sem engine:** `#3b82f6` (a mesma que os átomos usam para `--sarak-primary-color`), `#64748b` (secundária) e `#06b6d4` (destaque). Para as duas últimas não havia convenção no código; as escolhi. `--theme-primary-focus` ganhou `59, 130, 246` como reserva de `--theme-primary-rgb`.
- **Item 4, `box-shadow` de foco (`:105`)** era só uma cor; supus um anel `0 0 0 2px <cor primária>`, o mesmo primeiro componente que o vizinho `neumorphism` em foco (`:112`) já usa. Em `:112` removi também a cor solta no fim da lista (inválida) além do parêntese. Os dois `border` que eram só uma cor (`:58`, `:148`) viraram `1px solid <cor>`, a forma que o ramo `neon` do mesmo arquivo usa; sem largura e estilo, o atalho de uma cor só apagaria a borda dos botões `secondary`/`outline` frosted.
- **Item 1, forma:** `:is(.card, .bg-theme-card)` mantém a especificidade do seletor de atributo que substitui. O CSS escopado (`dist/sarak-scoped.css`) gerou normalmente com ele.
- **Item 1, âncora `card`, e não `sarak-card`:** `sarak-card` traz `padding` de 24 px, borda e `clip-path` de `_cards.css`, que os contêineres acima nunca tiveram; `card` reproduz o que eles recebiam sob textura.
- **Item 3, lugar do bloco:** no fim de `_elements.css`, depois de `body, span, p, div { font-family }`, para a família manter a reserva `'Inter'`.
- **Item 5, `w-fit`:** a mensagem de `error` do `SarakSelect` fica dentro do invólucro e passa a ter a largura do campo quando não há `fullWidth`. A renderização do erro é da `plan-91`; não mexi.
- **Espera do `box-shadow` no spec novo:** o caso "campo em foco" falhou na 1ª rodada pós-conserto por defeito **meu**: a espera aceitava o primeiro quadro da transição (`rgba(0,0,0,0) 0 0 0 0`, `transition: all`). Passou a exigir valor estável em duas leituras (`waitForShadow`). Os casos continuam mordendo: no Lote 1 viam `none`.
- **`npm run guide`:** regenerou `sarak-ui/docs/migracoes.md`, cópia do kit do consumidor da minha nota — gerador, não edição à mão.
- **Um comando de vitest rodou a suíte inteira:** `npx vitest run -u <arquivo>` (para atualizar um snapshot) executou os 422 arquivos com `-u`. Terminou verde e só os 3 snapshots esperados mudaram (`git status`), mas o `-u` global poderia ter reescrito outro; conferi pela lista de arquivos modificados.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Canvas/hooks/useInspector.ts:19` — o inspetor do painel agrupa elementos por `'.card, [class*="card"], [class*="panel"]'`: o mesmo casamento por substring, agora só em JS. Fora do escopo (`src/features/DesignEngine/`, §3.2).
- `specs/arquitetura/02-design-engine.md` §9.1 ainda lista o `body` em "o que ainda não cede à classe", e o limite 9 do cabeçalho de `browser-tests/cromo-css-real.spec.ts` diz o mesmo — a primeira é do revisor (síntese, §8); o segundo é spec antigo que não posso editar.
- `src/components/atomic/Templates/SarakCatalogGrid.tsx:148` — `border-[var(--border-color,#334155)]-border`: classe com sufixo `-border` solto, anterior a esta execução.

**Pendências / riscos**
- Sob textura, os cartões ancorados e os que **nunca** tiveram âncora mudam de aparência de forma diferente: os primeiros ficam como estavam; os controles e `RecursiveMatrixNode`/`SarakExpandableMatrix` passam a mostrar o próprio fundo (era a intenção do código deles). O revisor pode querer olhar essa lista.
- Mudou o artefato publicado: `dist/` e `sarak-ui/` diferem da última tag; o `pre-push` da `main` vai exigir tag nova. Nível sugerido por superfície pública: nenhum nome saiu nem mudou de tipo (`patch`, pela §3.1 de `00-contexto`); não rodei `npm version`.
- Nada commitado.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-09 (lote 1) — 🟢 Aprovado (lote 1 — liberação parcial)

**Rodado pelo revisor**, com 0 processos de outras execuções, contra o `dist/` do executor (o worktree não mudou
desde o build dele): `browser-tests/css-que-so-o-navegador-mede.spec.ts` → **11 falham, 5 passam** — os mesmos 11
vermelhos (itens 1 a 5, o item 4 com oito casos) e os mesmos 5 verdes (as quatro contraprovas "NÃO MUDA NADA" e o
item 6, com `20 de 20`). `browser-tests/cromo-css-real.spec.ts`, sem edição (`git diff` vazio) → **32/32**.

**O que está certo:** régua relacional (o elemento contra um irmão com a expressão pretendida inline), cenas novas
por `?cena=` sem tocar o `App` de antes, casos que mordem o defeito e deixam livre a forma do conserto (foco e
`neumorphism` exigem estrutura — a cor primária, duas camadas `inset` — e não um valor fixo). O item 6 **não
reproduz**: o caso fica como regressão, e o lote 2 não mexe no painel (§3.2).

**Emenda da plan (2026-10-09), por premissa vencida:** `SarakDataEmpty.tsx` e `SarakSocialButton.tsx` já têm valores
válidos (conferido no código: commits posteriores à plan os corrigiram). Entram no lugar deles os dois que o
executor achou com a mesma classe de defeito, conferidos pelo revisor: `SarakRangeSlider.tsx` (`ACTIVE` e `TRACK`,
um parêntese a mais) e `SarakAccordion.tsx` (`borderColor`, idem). O `SarakMarkdownRendererImpl.tsx:50-51` é ruído
do varredor (os valores estão certos). §2, §3.1 e §6 foram emendadas: **no lote 2, os casos desses dois nascem
vermelhos antes do conserto**, como os do lote 1.

**Para o lote 2, além do §5:** o item 2 não fecha só tirando o ciclo — sem Provider, `--primary-color` também não
existe, e a reserva `color-mix(in srgb, var(--primary-color), …)` fica inválida do mesmo jeito (o executor mediu).
A reserva precisa de uma cor que exista sem o Design Engine.

**Para o backlog (item 15):** o caso `isSplitViewEnabled responde à largura da região…` do spec do cromo falhou uma
vez em seis execuções do executor (2 px de sobreposição no empilhamento) e passou no controle do `HEAD` e na
rodada do revisor. Intermitência anterior a esta plan.

**Liberação parcial.** Status volta a `🟡 Em execução`; o lote 2 (os consertos) pode ser despachado. Os casos
vermelhos não se commitam sozinhos: o commit sai com o lote 2 (§5 passo 8).

## Veredito — 2026-10-09 (lote 2) — 🟢 Aprovado

**Rodado pelo revisor**, com 0 processos deste repositório na máquina, contra o `dist/` do executor (o worktree não
mudou desde o build dele): `playwright test --config=browser-tests/playwright.config.ts` → **51/51** (32 antigos +
19 novos), com `[item 6] digitação inteira em 20 de 20`. `git diff` de `cromo-css-real.spec.ts` e de
`sarak-base.css` → vazio. Os três casos novos (trilho e faixa do `SarakRangeSlider`, borda do `SarakAccordion`)
nasceram vermelhos contra o `dist/` anterior, com a saída no resumo.

**Critérios:** `grep -c 'class\*="card"' _atmosphere.css` → 0, com a superfície e a textura por `.card`,
`.sarak-card` e `.bg-theme-card`, e o inventário de quem dependia do casamento — sete contêineres que são cartões
de fato ganharam a âncora `card`, e os controles deixaram de ser pintados por engano; nenhuma custom property de
`_base.css` referencia a si mesma, e a reserva usa cores que existem sem o engine (o problema do `--primary-color`
ausente, apontado no veredito do lote 1, foi tratado); o `body` mora num lugar só (`_elements.css`) e cede à
classe; os valores de `useAtomicStyles.ts`, `SarakRangeSlider.tsx` e `SarakAccordion.tsx` são CSS válido, com o
foco como anel `0 0 0 2px` e as bordas de uma cor só como `1px solid` (suposições registradas e coerentes com os
vizinhos do mesmo arquivo); a seta do `SarakSelect` acompanha o campo (`w-fit` sem `fullWidth`). Os três
snapshots atualizados mudam pelo próprio conserto. Suíte (`422/2473`), `tsc` 0 e baseline igual pelo executor.

**Aviso, sem achado — classificação da nota de migração.** A nota do item 1 diz "PATCH visual". Pela
[[03-versionamento-e-release]] §3, mudar o que o CSS publicado faz por padrão com o markup do consumidor (e pedir
ação de quem dependia do efeito) é **MAJOR**. Ela sai na 8.0.0, como as do quadro e dos gráficos; a correção do
texto vai no prompt de via direta que já ajusta as outras duas.

**Para o backlog:** itens 16 (`useInspector.ts:19`, substring em JS) e 17 (`SarakCatalogGrid.tsx:148`, classe com
sufixo solto).

**A plan está completa.** Status: `🟢 Aprovada`. A síntese (destino §8: `arquitetura/02-design-engine` §9.1 e
`specs/11-testes-e-cobertura` §7.3) espera o commit do lote 2 e o seu sinal.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
