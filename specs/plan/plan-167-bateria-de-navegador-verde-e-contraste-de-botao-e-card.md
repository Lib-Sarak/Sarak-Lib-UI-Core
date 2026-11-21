---
tipo: "plan"
titulo: "Deixar a bateria de navegador verde num build novo e corrigir o contraste do hover de botão e do SarakTitleCard"
objetivo: "Fazer o cromo-css-real:check passar inteiro num build novo do HEAD antes da tag 9.0.0, decidindo caso a caso se o teste ficou velho ou se o código perdeu algo, e levar a 4,5:1 o botão sob o ponteiro e o texto do SarakTitleCard"
dominio: "Qualidade / Bateria de navegador e contraste"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "navegador", "contraste", "acessibilidade", "release-9-0-0"]
relacionados: ["[[10-seguranca-e-acessibilidade]]", "[[05-cromo-e-slots]]", "[[06-painel-de-customizacao-e-preview]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md + specs/05-cromo-e-slots.md"
---

# 1. Objetivo

A tag 9.0.0 sai com a bateria de navegador (`npm run cromo-css-real:check`) inteira verde num build novo. Um botão sob o ponteiro e o
texto do `SarakTitleCard` ficam em ao menos 4,5:1 contra o próprio fundo, nos dois modos.

# 2. Contexto

Três itens do backlog, promovidos a esta plan pelo dono em 2026-11-21 para entrar antes da tag:

1. **#92 — 8 casos falham num build novo.** O controle do revisor de 2026-11-20 (cópia `git archive HEAD` com build completo) mostrou
   isso. Hoje os casos passam só porque o `dist/` rastreado é o da 8.0.0. O `npm version` reconstrói e commita o `dist/`, e o `gates:full`
   não roda navegador: a tag sairia com esses casos vermelhos sem ninguém ver.
   - `browser-tests/cartao-cede-a-classe.spec.ts` (material, modos app e embarcado, 2 casos): o gradiente da classe sai `none`. A fixture
     `browser-tests/fixtures/harness-entry.tsx` usa classes de gradiente com valor arbitrário que nenhum fonte de `src/` cita, e o
     Tailwind da lib não varre `browser-tests/`.
   - `browser-tests/seletor-da-barra-legivel.spec.ts` (6 casos): espera 2 botões com `aria-pressed` no menu de preferências e acha 0. A
     plan-159 trocou as escolhas do menu por linhas com seleção (`menuitemradio`) e criou o grupo compacto da barra
     (`ShellPreferenceChoiceGroup`), ver [[05-cromo-e-slots]] §2.2.2.
   - Na mesma bateria há dois vermelhos de fora do #92:
     - `browser-tests/plan-135-paletas-no-painel.spec.ts` já falha no `HEAD`: não acha o grupo "Paletas prontas", porque a galeria de
       paletas virou grupos na plan-164.
     - `browser-tests/fontes-no-painel.spec.ts` é intermitente, no caso "bundled".
2. **#90 — hover global de botão.** A regra `button:hover:not(.p-0)` (`src/styles/_elements.css`, linha 91) pinta o fundo de todo botão
   sem hover próprio com `--theme-primary-hover` e não muda o texto. Um botão de texto apagado ou neutro fica ilegível sob o ponteiro: o
   chip de filtro da galeria de paletas dava 1,87:1 no escuro e foi corrigido no próprio chip. A regra vale para o painel, o cromo e todo
   importador.
3. **#91 — contraste do `SarakTitleCard`.** As etiquetas de capacidade (`src/components/atomic/Cards/SarakTitleCard.tsx`, primária sobre
   a primária a 15%) ficam em 3,92:1 no escuro. Título e subtítulo ficam entre 3,3 e 3,4:1 no escuro.

**Regra para o #92:** cada caso tem um de dois destinos, decididos pelo que a spec fixa diz.
- **O teste ficou velho** (mede uma anatomia que a spec trocou): o teste passa a medir a anatomia atual, com a mesma exigência (o mesmo
  4,5:1, a mesma regra "a classe vence o material").
- **O código perdeu algo que a spec pede:** corrige-se o código.

Nunca se afrouxa a exigência para o teste passar e nunca se apaga um caso. Nenhuma classe que só um teste usa entra no CSS da lib.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `browser-tests/` — os quatro specs acima, a fixture `browser-tests/fixtures/harness-entry.tsx` e o que eles importam.
- `src/styles/_elements.css` — só a regra de hover global de botão (lote 2).
- `src/components/atomic/Cards/SarakTitleCard.tsx` — só a cor das etiquetas, do título e do subtítulo (lote 3).
- Componentes do cromo, do menu de preferências ou da galeria de paletas **só** se o lote 1 provar que o código perdeu algo que a spec
  pede. Pare e traga ao revisor antes de mexer.
- Testes de unidade dos arquivos acima e os snapshots que mudarem por esta plan.
- `docs/migracoes.md` e os gerados (`npm run guide`, `catalog`, `dev-kit`), se algo visível ao importador mudar.

## 3.2 Fora (o que NÃO pode ser tocado)

- A configuração do Tailwind da lib: varrer `browser-tests/` poria classe de teste no CSS publicado.
- Temas, paletas e o motor de composição (`src/core/Provider/utils/`, `src/core/Design/presets/themes/`). O contraste se resolve na regra
  ou no componente, sem trocar a cor dos temas.
- O limiar de qualquer teste (4,5:1, 3:1, diferença de pixel, orçamento de tempo).
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | contraste mínimo e o que a bateria guarda |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.2.2 | o menu de preferências e o grupo compacto da barra |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2.4 | a galeria de paletas em grupos |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | cor por token, nada fixo |
| **Skill** | `test-e2e` | os specs de navegador |
| Código | `src/styles/_elements.css` | a regra de hover global |
| Código | `src/components/atomic/Cards/SarakTitleCard.tsx` | as etiquetas, o título e o subtítulo |
| Código | `browser-tests/fixtures/harness-entry.tsx` | a fixture do `cartao-cede-a-classe` |
| Código | `browser-tests/seletor-da-barra-legivel.spec.ts`, `browser-tests/cartao-cede-a-classe.spec.ts`, `browser-tests/plan-135-paletas-no-painel.spec.ts`, `browser-tests/fontes-no-painel.spec.ts` | os casos vermelhos |

# 5. Instruções de execução

**Antes de medir qualquer coisa, rode `npm run build`.** Os specs leem o `dist/`, e o rastreado é o da 8.0.0.

**Lote 1 — #92 e os dois vermelhos vizinhos.**

1.1. Para cada caso vermelho, escreva uma linha no resumo com:
- o que o teste espera;
- o que a tela tem;
- o trecho da spec fixa que decide;
- o destino (teste velho ou código que perdeu algo), pela regra da §2.

1.2. Aplique o destino.
- Em `cartao-cede-a-classe`, a fixture põe o gradiente da classe por um jeito que o CSS da lib já emite, ou por um estilo inline
  equivalente, sem mudar o que o caso prova.
- Em `seletor-da-barra-legivel`, o caso mede o item selecionado da anatomia atual (no menu e no grupo da barra), com o mesmo 4,5:1.

1.3. `fontes-no-painel`: rode 5 vezes. Se falhar alguma, ache a espera que falta e conserte o teste. Se passar as 5, registre e siga.

1.4. Se algum caso cair em "código perdeu algo", pare e traga ao revisor antes de mexer fora de `browser-tests/`.

**Lote 2 — #90, hover de botão.**

2.1. Meça no navegador, nos dois modos, quantos botões do painel e do cromo ficam abaixo de 4,5:1 com o ponteiro em cima. Grave a lista.

2.2. Escolha uma de duas saídas:
- a regra global troca o texto junto com o fundo: `--theme-primary-hover` com o texto que a paleta calcula sobre a primária;
- a regra deixa de pintar o fundo.

Fique com a que zerar a lista com menos mudança visível, e registre o porquê.

2.3. Escreva um spec de navegador que mede o contraste sob o ponteiro de um botão neutro e de um botão de texto apagado, nos dois modos.

**Lote 3 — #91, `SarakTitleCard`.**

3.1. Etiquetas, título e subtítulo ficam em ao menos 4,5:1 nos dois modos, com cor por token. Meça em pelo menos três temas: o padrão, um
escuro e um claro.

3.2. Escreva um teste que mede o contraste das três partes.

**Verificação:**
- Em cada lote: `npm run build`, os specs tocados e `npm run verify -- --tier=quick`.
- No fim do lote 3: `npm run cromo-css-real:check` inteiro.

# 6. Critérios de aceite

- [ ] Cada caso do #92 com destino e trecho da spec no resumo; nenhum limiar afrouxado, nenhum caso apagado.
- [ ] `fontes-no-painel` verde nas 5 rodadas.
- [ ] Hover de botão em ao menos 4,5:1 nos dois modos, com spec de navegador.
- [ ] `SarakTitleCard`: etiquetas, título e subtítulo em ao menos 4,5:1 nos dois modos, com teste.
- [ ] `cromo-css-real:check` inteiro verde num build novo.
- [ ] `tsc` 0, baseline sem regressão, Anel 1 verde, e `docs/migracoes.md` atualizado se o importador vê diferença.
- [ ] Prévia (antes e depois) do hover e do `SarakTitleCard` em `C:/tmp/sarak-previa-167/`, com o ok do dono.

# 7. Como verificar (uso do revisor)

**Gate:** a bateria de navegador inteira.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura de cada spec mudado: a exigência é a mesma de antes.
- `npm run build` e `npm run cromo-css-real:check` → verde.
- Anel 1, `check-audit-baseline --with-tsc` e Anel 0 sobre as linhas adicionadas.

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md + specs/05-cromo-e-slots.md`

- **10:** o contraste sob o ponteiro de todo botão e o do `SarakTitleCard`, e os testes que os guardam.
- **05 §2.2.2:** o que o teste de legibilidade do seletor mede na anatomia atual, se a 05 ainda não disser.
- O que o lote 1 decidir sobre fixture (classe de teste não entra no CSS da lib), se virar regra.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
