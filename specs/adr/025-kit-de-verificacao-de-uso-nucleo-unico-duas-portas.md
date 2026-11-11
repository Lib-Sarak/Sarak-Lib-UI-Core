---
tipo: "adr"
titulo: "O kit de verificação de uso é um núcleo único com duas portas: plugin de ESLint para o código e comando da CLI para o que o ESLint não lê"
status: "🟢 Aceito"
tags: ["adr", "kit-do-consumidor", "verificacao", "importador", "eslint", "cli", "peer-opcional"]
relacionados: ["[[12-kit-do-consumidor]]", "[[03-superficie-publica]]", "[[13-instalacao-e-atualizacao]]", "[[019-arrastar-e-soltar-do-kanban]]", "[[006-zero-marca-soberania-host]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "(A) Só o plugin de ESLint, num subpath do pacote — a hipótese da decisão do dono de 2026-10-19"
    custo: "Não enxerga `.css`: o ESLint 9 só lê folha de estilo com `@eslint/css`, que nenhum dos três importadores tem instalado. Os 5 nomes `--sarak-*` não públicos do ERP (A1) estão todos em `.css` (`proposal-ui.css:129,154`, `templateLayout.css:60,76,77`), e é a lacuna mais cara medida. Fechá-la pelo plugin obrigaria o importador a instalar uma dependência nova só para isso"
  - opcao: "(B) Só um comando novo na CLI `sarak-ui`, com análise própria (regex sobre o texto)"
    custo: "Enxerga tudo, mas não entende árvore: as equivalências condicionais (`<section>` só pede `SarakSection` quando tem título dentro) viram regex sobre texto — o próprio ERP registra que a regra dele \"não entende JSX dinâmico\". Também perde o sublinhado no editor e o `eslint-disable-next-line` com motivo, que é como o importador hoje desliga uma regra de lint com rastro"
---

# 1. Contexto e Problema

**Data da decisão: 2026-11-11 (proposta em 2026-11-10, aceita pelo dono em 2026-11-11, com as mensagens das regras só em português: é ferramenta do desenvolvedor do importador e fica fora do catálogo de seis idiomas da [[10-seguranca-e-acessibilidade]] §3.6).** A decisão do dono de 2026-10-19 foi "plugin de ESLint no pacote, regras
ligadas uma a uma, numa plan própria". Este ADR a confirma no que ela mede e a contesta no que ela não alcança.

**A lacuna.** Nos relatos finais da migração à `8.0.0` (2026-11-10), o ERP mantinha à mão 5 peças que a lib entrega e usava 5 variáveis
`--sarak-*` que não são públicas. A lib avisou, mas só em `docs/migracoes.md`, lido uma vez; nada acusou por máquina. O que o importador
construiu por conta própria funcionou: a regra de equivalência do ERP pegou **171** violações na estreia (2026-11-02) e hoje está em 0.

**O que cada importador tem, medido em 2026-11-10:**

| | ERP | `login-completo` | `login-provedores` |
|---|---|---|---|
| ESLint | `^9.39.5`, config plana | `9.39.5`, config plana, `@typescript-eslint/parser 8.66.0` | idem |
| Arquivos `.css` próprios | 12 | 0 | 0 |
| `var(--sarak-*)` | 6 `.css` e 2 `.tsx` | 1 `.ts` e 1 `.tsx` | 1 `.ts` e 3 `.tsx` |
| `@eslint/css` instalado | não | não | não |
| Onde mora a verificação de uso da lib hoje | gate próprio (`tools/gate`), fora do ESLint | nenhuma | nenhuma |

Duas conclusões saem da tabela. **Primeira:** o ESLint está nos três, então o plugin não pede ferramenta nova a ninguém. **Segunda:** o
ESLint sozinho cega justamente o caso que mais custou — o ERP tem `.css` e as 5 variáveis estão lá. O ERP, aliás, roda a verificação
dele fora do ESLint, num gate em Node; ele precisa de uma saída que o gate consiga chamar.

**O custo de uma entrada a mais no pacote** tem precedente medido: `dist/testing.js` pesa 2.242 bytes (`.cjs`, 2.904), contra 223.303 do
`dist/index.js`. O subpath `testing` não entra no boot de quem não o importa, e o `boot:measure` confere isso a cada release.

**O dado que as regras leem já existe, em parte.** `sarak-ui/catalog.json` tem 447.957 bytes (313.586 compactado, 68.176 em gzip),
com `tokens.cssVars` (748 nomes, 21.462 bytes) e `barrelExports` (561 nomes, 11.547). Falta o que o catálogo não diz: **qual elemento
nativo tem par na lib, sob qual condição, e que nome local de peça reescrita aponta para qual nome público.** O ERP mantém isso à mão em
`tools-local/gate-rules/ui-equivalence.json` (7 pares, 14 peças): é a cópia que a [[12-kit-do-consumidor]] §2 e a R17 proíbem de nascer
na lib.

# 2. Decisão

**O kit de verificação é um núcleo de funções puras com duas portas finas por cima — e as duas leem o mesmo dado gerado.**

1. **Núcleo.** Funções puras, sem React e sem importar o barril da lib, em pasta própria fora de `src/components/` e de `src/features/`.
   Cada regra tem um detector único; a porta só traduz a saída dele.
2. **Porta 1 — plugin de ESLint**, subpath `@sarak/lib-ui-core/eslint`, para tudo que pede árvore: `.ts`, `.tsx`, `.js`. Regra
   **desligada por padrão**, ligada pelo importador pelo nome; um conjunto `recommended` só com as que a medição do lote 2 aprovar.
   `eslint` entra como **peer opcional** (`>=9.0.0`, config plana), no padrão da [[019-arrastar-e-soltar-do-kanban]]: quem não o instala
   não vê erro nem aviso. O plugin não importa tipo da lib — o build moveria tipos do barril para um `.d.ts` compartilhado e esvaziaria o
   `dist/index.d.ts`, como já aconteceu com o `testing`.
3. **Porta 2 — comando `sarak-ui verify`**, para o que o ESLint do importador não lê (`.css`) e para quem roda a verificação fora do
   ESLint (o gate do ERP): saída legível por padrão e `--format json`, código de saída diferente de zero quando há achado de severidade
   erro. Sem dependência nova: texto sobre texto, e o que pede árvore não é dela.
4. **Os dados saem do gerador do catálogo**, numa chave nova `verification` **dentro** do `sarak-ui/catalog.json` (não num arquivo irmão:
   a chave nova pesa menos de 1% do arquivo, o `kitHash` já a cobre e o `package:check` não ganha um 13º caminho). Ela traz as
   equivalências nativo → componente **com a condição** e os nomes locais que apontam para cada peça pública. A fonte é uma tag de JSDoc
   nos componentes e funções públicas (R17: o JSDoc já é superfície pública, [[12-kit-do-consumidor]] §10). O `guide:check` e o
   `catalog:check` travam o dado; o código do kit não tem lista de nome da lib.
5. **Cada achado traz `arquivo:linha`, o que está errado e o nome público que substitui.** Mensagem em português e sem marca: o nome
   público da lib aparece porque é o substituto, não como assinatura ([[006-zero-marca-soberania-host]]).

A decisão do dono de 2026-10-19 se confirma como **a porta principal** (o ESLint está nos três importadores e é onde a equivalência
condicional se escreve bem) e se **estende** com a segunda porta, pela medição acima.

# 3. Consequências

- **Positivas:**
  - Os 5 nomes `--sarak-*` do ERP seriam pegos por máquina — o que o plugin sozinho não fez.
  - O importador liga o kit com um `import` do subpath, ou com um comando, sem copiar nada da lib.
  - O dado de equivalência deixa de ter duas cópias (a do ERP e a da lib); quem mantém é quem tem o componente, na mesma edição que o cria.
  - Quem não usa o kit não paga: entrada de pacote separada, `eslint` como peer opcional, e o boot não cresce (conferido por `boot:measure`
    e pelo cenário novo do `test-optional-peer-consumer.mjs`, no lote 1).
- **Negativas (Trade-offs):**
  - **Duas portas são duas superfícies para manter.** O núcleo único contém o custo, mas o `.css` e o `.tsx` leem a mesma regra de `var()` por
    scanners diferentes (texto e AST); o teste de cada regra tem de cobrir as duas.
  - **A detecção de peça reescrita é heurística** e tem falso positivo esperado; só o lote 2 diz a taxa. Por nome (exato ou sem o prefixo
    `sarak`) ela pega 3 dos 5 casos conhecidos (A2, A4, A6); os outros dois (A3, A5) só por apelido registrado na lib — e o apelido só
    existe depois que alguém o viu num relato. O recall cresce com a evidência, não por si.
  - **Tag de JSDoc nova** nos componentes que substituem elemento nativo e nas peças que o importador costuma reescrever: tocar o
    comentário, nunca o comportamento. Mantê-la em dia é disciplina do mantenedor; o gate só cobra que o que está escrito vira dado.
  - A chave `verification` muda o `kitHash` a cada edição dela: é o comportamento certo, e o `dev-kit:check` passa a acusar mais cedo.
  - **Validação pendente:** nenhuma regra foi rodada contra código real ainda. A medição de acerto e de falso positivo é o lote 2; até
    lá, o `recommended` está vazio por princípio.
- **Gatilho de reavaliação:** (a) a medição do lote 2 mostrar que a taxa de falso positivo da detecção de peça reescrita não cai com
  correção de regra; (b) os três importadores adotarem `@eslint/css` — aí a porta 2 perde o motivo para o `.css` e pode encolher a um
  gerador de relatório; (c) um importador sem ESLint pedir o kit; (d) o ESLint mudar a API de plugin. Qualquer um reabre a decisão com um
  ADR novo, que a substitui.
