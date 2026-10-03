---
tipo: "plan"
titulo: "Medir em navegador e consertar o CSS que o jsdom não vê"
objetivo: "Fazer cinco defeitos de CSS da lib terem caso de navegador que falha hoje e passa depois do conserto, e medir um relato de perda de digitação no painel"
dominio: "Sarak-Lib-UI-Core / Design Engine / CSS publicado"
status: "🔴 A executar"
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
| 4 | **Valor de CSS malformado em estilo inline.** Parêntese sobrando, e `box-shadow` que é só uma cor | `src/components/atomic/hooks/useAtomicStyles.ts` — `:58` e `:61` (botão `frosted`), `:106` e `:110-112` (campo: foco e `neumorphism`), `:138`, `:147-148` (switch); e, pela mesma classe de defeito, `src/components/atomic/Feedback/SarakDataEmpty.tsx:24` e `src/components/atomic/Buttons/SarakSocialButton.tsx:76,85-86` | o navegador descarta a declaração inteira, em silêncio |
| 5 | **A seta do `SarakSelect` flutua.** Sem `fullWidth`, o invólucro é bloco e ocupa a célula; o `<select>` fica com a largura do conteúdo; a seta é absoluta e ancorada na direita do invólucro | `src/components/atomic/Inputs/SarakSelect.tsx:50-67` | em grid que estica, a seta aparece sozinha no canto direito, longe do campo |
| 6 | **Relato não reproduzido:** a busca de token do painel descarta a primeira digitação logo depois de abrir a aba Design | campo em `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx:105`; o painel é `lazy` (`src/features/DesignEngine/Library/CustomizationPanel/index.tsx:16`) | relatado no ERP por automação; **não** reproduzido em `jsdom` por quatro métodos. Hipótese: o campo que recebe a primeira digitação é substituído por uma montagem nova |

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
- `src/components/atomic/Feedback/SarakDataEmpty.tsx` e `src/components/atomic/Buttons/SarakSocialButton.tsx` — **só** os valores malformados.
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
- [ ] Nenhum valor de `useAtomicStyles.ts`, `SarakDataEmpty.tsx` ou `SarakSocialButton.tsx` tem parêntese desbalanceado; o
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
