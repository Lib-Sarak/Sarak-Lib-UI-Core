---
tipo: "plan"
titulo: "Calibrar os gates pelos falsos positivos medidos — o verificador para de acusar o que não é violação"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🟢 Aprovada"
prioridade: "Máxima"
tags: ["plan", "gates", "falso-positivo", "calibracao", "r18"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[plan-12-construcao-dos-gates]]", "[[plan-15-adequacao-total]]"]
depende_de: "plan-12 · plan-16"
destino_sintese: "specs/01-gates-e-baseline.md · specs/00-regras-e-invariantes.md"
---

> 🔒 **Esta plan conserta o VERIFICADOR, não o código verificado.** Nenhuma violação real é paga aqui — isso é
> a `plan-15`. Se um item que você tocar viola a regra **como ela está escrita**, ele não é desta plan.
>
> ⛔ **Afrouxar não é calibrar.** Toda mudança aqui tem de responder **não** a esta pergunta: *"o caso que o
> gate deixará de acusar viola a regra?"* Se a resposta for sim, é dívida — devolva para a `plan-15`.

# 1. Objetivo

Os quatro falsos positivos medidos deixam de existir, **sem que nenhum gate passe a deixar violação real
escapar** — e cada afrouxamento tem o que ele deixou de ver **declarado e contado**.

# 2. Contexto

A `plan-12` construiu 15 verificações e a `plan-16` mais uma, em duas tacadas. A `plan-15` começou a pagar a
dívida e, em **três rodadas seguidas, encontrou quatro falsos positivos** — todos pela mesma via: **uso real**.

| # | Gate | O que ele acusa e não devia | Medido |
|---|---|---|---|
| 1 | `check-section-pointers.mjs` | `§N.M` que é **rótulo de linha de tabela** (`\| **5.1** \|`), não heading nem item de lista | **4** ocorrências, todas em `10-seguranca-e-acessibilidade.md:306-309` |
| 2 | `check-section-pointers.mjs` | `§N.M` cujo **qualificador de documento** existe mas não é reconhecido: fora da janela de 40 chars, **depois** do `§`, na **linha seguinte**, ou em prosa (`§0 do guia`) | **~8** — `00-indice:63` · `adr/003:78` (×3) · `02-enforcement:160,304` · `12-kit:52` · `14-artefatos:241` · `15-divida:70` |
| 3 | `auditor_hardcoded.mjs` | literal que **é fallback de um token**, mas escrito por **interpolação de template literal** — `var(--token, ${const})`. O `sanitizeFallbacks()` não o alcança porque o valor mora numa `const` em outra linha | **2** — `SarakBackgroundRenderer.tsx:71` (`#ffffff`/`#000000`) |
| 4 | *(sem gate)* | 3 itens do "balde 4" do lote 5 da `plan-15` cuja classificação — legítimo × falso positivo — **ainda não foi apurada** | **a medir** |

**Os dois primeiros somam ~12 dos 18 ponteiros do baseline. O terceiro, 2 dos 33 hardcodes.**

## 2.1 Por que isto é plan própria, e não um item da `plan-15`

A `plan-15` §3.2 proíbe alterar gate — **é a linha vermelha dela**, e existe por um bom motivo: quem está
pagando dívida tem incentivo estrutural para "consertar o gate" quando o conserto do código dá trabalho.
Separar as duas responsabilidades é o que mantém a §3.3 honesta.

Consequência prática: **enquanto esta plan não fechar, a `plan-15` está tomando decisões sobre números
errados.** Ela já classificou 2 falsos positivos como *"aceitar como característica"* — o que os congelaria no
baseline para sempre. Por isso esta plan vem **antes** dos lotes restantes.

## 2.2 O padrão que estas quatro ocorrências nomeiam

Não é falha da `plan-12`. Dezesseis verificações nascidas em duas tacadas **têm as bordas descobertas pelo
uso**, e foi exatamente isso que aconteceu — em três rodadas, três executores diferentes acharam quatro.

O que muda é a leitura de "baseline zero": ele só é confiável **depois** desta calibração. Um número que
inclui falso positivo não mede dívida, mede ruído — e a diferença entre os dois é a única coisa que a
`plan-15` precisa saber para decidir.

# 3. Escopo

## 3.1 Dentro

| # | Alvo | Conserto |
|---|---|---|
| 1 | `gates/scripts/contrato/check-section-pointers.mjs` | **Terceira convenção**: `§N.M` resolve também contra **rótulo de linha de tabela** — `\| **N.M** \|` no início de linha, dentro da seção `N` |
| 2 | idem | **Reconhecimento de qualificador ampliado**: janela maior que 40 caracteres · qualificador **depois** do `§` · qualificador na **linha anterior/seguinte** · forma em prosa (`do guia`, `daquela spec`) quando houver um nome de documento na vizinhança |
| 3 | `gates/scripts/audit/auditor_hardcoded.mjs` | **Fallback interpolado**: literal que só existe para ser interpolado dentro de `var(--token, ${…})` deixa de ser acusado |
| 4 | os 3 itens não apurados do balde 4 | **Medir e classificar.** Falso positivo → conserta aqui. Legítimo mas real → volta para a `plan-15` |
| 5 | `gates/README.md` · os blocos `LIMITES DECLARADOS` | Atualizados **na mesma edição** de cada conserto (R18) |
| 6 | `gates/baselines/audit-baseline.json` | Regravado **junto**, com a contagem nova |

## 3.2 Fora

- ⛔ **Pagar qualquer violação real.** Se o gate acusa e o caso **viola a regra escrita**, é da `plan-15`.
- ⛔ **Afrouxar para reduzir número.** Ver §3.3 — o teste é a regra, não a contagem.
- ⛔ Construir gate novo, ampliar escopo, criar allowlist ou carve-out.
- ⛔ Editar `specs/specs/`, `specs/adr/`, `specs/00-indice.md` — do revisor. Escreva no resumo.
- ⛔ Consertar a prosa que sobrar acusada: os ~5 ponteiros **realmente mortos** vivem em specs fixas e são do
  revisor. Nomeie-os no resumo.

## 3.3 O teste que separa calibração de afrouxamento

Para **cada** caso que o gate deixará de acusar, responda no resumo:

> **"Este caso viola a regra como ela está escrita hoje?"**

| Resposta | O que é | Onde vai |
|---|---|---|
| **Não** | falso positivo — o gate estava errado | **aqui**, com contagem antes/depois |
| **Sim** | dívida real | **`plan-15`**, e o gate fica como está |
| **"A regra é que está larga demais"** | ⇒ **PARE. Decisão do dono** — vira edição em `00-regras-e-invariantes` | nem aqui nem lá |

**A terceira resposta é legítima e é a que costuma ser engolida.** Se um conserto de gate só se justifica
reescrevendo a regra, ele não é conserto de gate.

## 3.4 ⚠️ Todo afrouxamento abre uma porta — e ela vai declarada

Cada uma das três correções **cria um ponto cego novo**, e é obrigatório dizer qual:

| Conserto | O que o gate deixa de ver |
|---|---|
| Rótulo de tabela | um `§N.M` que aponte para uma linha de tabela **inexistente** passa a resolver se houver qualquer `\| **N.M** \|` na seção |
| Qualificador ampliado | quanto maior a janela, maior a chance de **atribuir o ponteiro ao documento errado** — foi exatamente o que fez a `plan-12` reduzir este detector a autorreferência |
| Fallback interpolado | um literal solto numa `const` com nome parecido com fallback pode deixar de ser acusado |

> **A `plan-12` já pagou esse preço uma vez:** a primeira versão do detector de seção resolvia cross-documento,
> atribuía ao arquivo errado e **produzia acusação falsa** — por isso foi reduzida. Ampliar o reconhecimento de
> qualificador **caminha de volta nessa direção**. Se a ampliação reintroduzir atribuição errada, **pare e
> relate**: metade do conserto é melhor que um detector que mente com mais alcance.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/00-regras-e-invariantes.md` | **R18** (o gate declara o que não vê) · **R2** e **R2.4** (as limitações já documentadas do `auditor_hardcoded`) · **R23** |
| Spec fixa | `specs/01-gates-e-baseline.md` §6 | a regra anti-afrouxamento — **é o critério desta plan** |
| Plan | `plan-12-construcao-dos-gates` §9.4 e o cabeçalho do `check-section-pointers.mjs` | **por que** o detector foi reduzido a autorreferência; não desfaça sem entender |
| Plan | `plan-15-adequacao-total` §11 | os vereditos que mediram os quatro falsos positivos |
| Código | `gates/scripts/audit/auditor_composicaoatomica.mjs` | o modelo de self-test e bloco de limites |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |

# 5. Instruções de execução

1. **Meça antes.** `node gates/scripts/audit/auditor_sectionpointers.mjs` e
   `node gates/scripts/audit/auditor_hardcoded.mjs`. Cole as contagens (18 e 33) e a lista.
2. **Um conserto por vez**, na ordem: (1) rótulo de tabela → (2) qualificador → (3) fallback interpolado.
   Depois de cada um: contagem nova, **e a lista do que deixou de ser acusado, item a item**, com a resposta
   do teste da §3.3.
3. **Self-test por conserto** — um caso que o gate **ainda pega** e um que ele **passou a liberar**. Sem isso
   não há como saber se a calibração acertou o alvo ou abriu um buraco.
4. **Bloco `LIMITES DECLARADOS` atualizado na MESMA edição** (R18), com o ponto cego novo da §3.4 escrito.
5. **Apure o item 4 do escopo** — os 3 do balde 4 do lote 5. Se forem falso positivo, conserte aqui; se forem
   reais, devolva nomeados para a `plan-15`.
6. **Baseline regravado junto**, no mesmo diff.
7. Ao final: `npm run audit`, `npx vitest run`, `npm run gate-limits:check` e
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-17-calibrar-gates-por-falso-positivo.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (R2, R2.4, R18, R23),
specs/specs/01-gates-e-baseline.md (§6 — a regra anti-afrouxamento é o critério desta plan),
o cabeçalho de gates/scripts/contrato/check-section-pointers.mjs (por que ele foi reduzido a
autorreferência) e a §11 da plan-15 (os vereditos que mediram os falsos positivos).
Skills: padrao-escrita, padrao-typescript, test-unitario.

Esta plan conserta o VERIFICADOR, não o código verificado. Para CADA caso que um gate deixar
de acusar, responda no resumo: "este caso viola a regra como ela está escrita hoje?".
  Não  -> é falso positivo, conserte aqui.
  Sim  -> é dívida, devolva para a plan-15 e NÃO mexa no gate.
  "a regra é que está larga demais" -> PARE. É decisão do dono.

TODO AFROUXAMENTO ABRE UM PONTO CEGO. Declare qual, no bloco LIMITES DECLARADOS, na mesma
edição (R18). A plan-12 já reduziu o detector de seção a autorreferência porque a versão
cross-documento atribuía o ponteiro ao arquivo ERRADO. Ampliar o qualificador caminha de volta
nessa direção — se reintroduzir atribuição errada, PARE e relate. Meio conserto é melhor que
um detector que mente com mais alcance.

Cada conserto: contagem ANTES e DEPOIS + a lista do que deixou de ser acusado + self-test
(um caso que ainda pega, um que passou a liberar) + baseline regravado no mesmo diff.

NÃO pague violação real, NÃO crie allowlist, NÃO amplie escopo, NÃO edite specs/specs/,
specs/adr/ nem specs/00-indice.md.

Não commite. Resumo na própria plan (append-only) e devolva para revisão.
```

# 7. Critérios de aceite

- [ ] Os **4 ponteiros de rótulo de tabela** deixam de ser acusados, e um `§N.M` apontando para linha de tabela
      **inexistente** continua sendo acusado — provado por self-test.
- [ ] Os **~8 de qualificador** deixam de ser acusados **sem** que nenhum ponteiro passe a ser atribuído ao
      documento errado. Se a ampliação não conseguir isso, o item fica **parcial e declarado**.
- [ ] Os **2 literais de fallback interpolado** deixam de ser acusados, e um literal solto de verdade continua
      sendo — provado por self-test.
- [ ] **Para cada caso liberado, a resposta do teste da §3.3 está escrita no resumo.** Sem isso, o item não
      está aceito.
- [ ] Os 3 itens não apurados do balde 4 estão classificados, com `arquivo:linha`.
- [ ] Bloco `LIMITES DECLARADOS` de cada gate tocado traz o **ponto cego novo**; `gate-limits:check` verde.
- [ ] Self-test por conserto: um caso pego, um liberado.
- [ ] Baseline regravado **junto**; `check-audit-baseline` volta a dizer *"igual ao baseline"*.
- [ ] ⛔ **Nenhuma violação real paga aqui** — `git diff` sem `src/` de produção, salvo o que for
      comprovadamente falso positivo do próprio gate.
- [ ] `npx vitest run` verde.
- [ ] Os ponteiros que **sobrarem** (realmente mortos, em specs fixas) estão **nomeados no resumo** para o revisor.

# 8. Como verificar

- `node gates/scripts/audit/auditor_sectionpointers.mjs` → contagem nova; a lista do que sobrou é a do revisor
- `node gates/scripts/audit/auditor_hardcoded.mjs` → **31**, com os 2 de `SarakBackgroundRenderer` fora
- Contraprova de cada conserto: o self-test do caso que **ainda pega**
- `npm run gate-limits:check` → verde, com os blocos atualizados
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → *"igual ao baseline"*
- `git diff --stat` → `gates/`, `specs/plan/plan-17-*` — **nenhum `src/` de produção**

# 9. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md` (o baseline recalibrado e os limites novos de cada gate) ·
`specs/00-regras-e-invariantes.md` (se algum conserto mudar o que a regra de fato cobra — **só nesse caso**)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-08

**Resultado:** Concluído com pendências declaradas (o item 4 do escopo não foi decidido — é decisão do dono,
conforme §3.3 linha 3; e sobraram 2 ponteiros de seção que vivem em `specs/specs/`, fora do alcance do
executor).

### Medição ANTES (passo 1)

- `node gates/scripts/audit/auditor_sectionpointers.mjs` → **18** mortos, **127** ignorados por qualificador.
- `node gates/scripts/audit/auditor_hardcoded.mjs` → **33** violações de VALOR.

Lista completa dos 18 ponteiros mortos medidos antes de qualquer conserto:

```
specs/00-indice.md:64 -> §9
specs/adr/003-remocao-backend-proprio.md:78 -> §4
specs/adr/003-remocao-backend-proprio.md:78 -> §5
specs/adr/003-remocao-backend-proprio.md:78 -> §6
specs/specs/01-gates-e-baseline.md:572 -> §7.3
specs/specs/02-enforcement-por-commit.md:160 -> §3.2
specs/specs/02-enforcement-por-commit.md:304 -> §3.1
specs/specs/10-seguranca-e-acessibilidade.md:175 -> §5.1
specs/specs/10-seguranca-e-acessibilidade.md:213 -> §5.2
specs/specs/10-seguranca-e-acessibilidade.md:251 -> §5.3
specs/specs/10-seguranca-e-acessibilidade.md:293 -> §5.4
specs/specs/11-testes-e-cobertura.md:113 -> §2.3
specs/specs/12-kit-do-consumidor.md:52 -> §0
specs/specs/14-artefatos-do-mantenedor.md:241 -> §0
specs/specs/15-divida-conhecida.md:70 -> §5.1
specs/specs/15-divida-conhecida.md:137 -> §9   (2 ocorrências na mesma linha)
specs/specs/15-divida-conhecida.md:179 -> §4.2
```

### Conserto 1 — rótulo de linha de tabela (`check-section-pointers.mjs`)

**O que era:** `10-seguranca-e-acessibilidade.md` tem, na `# 5. Lacunas conhecidas`, uma tabela cujas linhas
são rotuladas `| **5.1** |` … `| **5.7** |` (não headings, não itens de lista numerada). A prosa em `§2.4d`
(`:175`), `§3.1` (`:251`, cita `§5.3`), `§3.5`/`§4` (`:213`, `:293`) referencia essas linhas por `§5.1`–`§5.4`,
e nenhuma das duas convenções existentes (heading / item numerado) as resolvia.

**Conserto:** nova convenção 3c em `pointerResolves` (`check-section-pointers.mjs`, função `hasTableRowLabel`) —
testada **depois** de heading e item numerado, só quando as duas falham: `§N.M` resolve se existe, no corpo da
seção `# N`, uma linha `| **N.M** | ... |`.

**Contagem antes/depois desta fatia:** os 4 ponteiros abaixo deixaram de ser acusados:

| Ponteiro | Resposta do teste §3.3 |
|---|---|
| `10-seguranca-e-acessibilidade.md:175 -> §5.1` | **Não** — a linha `\| **5.1** \|` existe de verdade na seção 5; o gate estava cego para essa convenção, não a regra sendo violada |
| `10-seguranca-e-acessibilidade.md:213 -> §5.2` | **Não** — idem, linha `\| **5.2** \|` existe |
| `10-seguranca-e-acessibilidade.md:251 -> §5.3` | **Não** — idem, linha `\| **5.3** \|` existe |
| `10-seguranca-e-acessibilidade.md:293 -> §5.4` | **Não** — idem, linha `\| **5.4** \|` existe |

**Self-test** (`check-section-pointers.test.mjs`, describe "convenção 3c"): um caso que **passou a liberar**
(fixture com heading `# 5` + linha `| **5.1** |` + `Ver §5.1.` → `mortos: []`) e um caso que **ainda pega**
(mesma fixture, mas apontando para `§5.9`, rótulo de tabela **inexistente** → continua acusado). Os dois
passam (`npx vitest run gates/scripts/contrato/__tests__/check-section-pointers.test.mjs`).

### Conserto 2 — qualificador ampliado (`check-section-pointers.mjs`)

**O que era:** o reconhecimento de qualificador só olhava os 40 caracteres **antes** do `§`, procurando
`[[wikilink]]` ou um trecho `.md`. Três formas medidas escapavam disso: qualificador **depois** do `§`
(`§9 de [...](specs/01-gates-e-baseline.md)`), qualificador **na linha vizinha** (o nome do documento cai numa
frase anterior/seguinte), e qualificador em **prosa** (`"do guia"`, sem `.md` nem wikilink).

**Conserto:** `hasDocumentQualifier(line, linhaAnterior, linhaSeguinte)` — decide **ignorar** (nunca resolver)
quando a própria linha, a anterior OU a seguinte contém `[[wikilink]]`, um trecho `.md`, OU uma das formas de
prosa (`do guia`, `da spec`, `desta spec`, `deste guia/documento`), em qualquer posição da linha.

**Contagem antes/depois desta fatia:** 12 ponteiros deixaram de ser acusados (mais os 4 do conserto 1, total
18 → 2):

| Ponteiro | Como resolveu | Resposta do teste §3.3 |
|---|---|---|
| `00-indice.md:64 -> §9` | qualificador **depois** do §, mesma linha (`§9 de [...](specs/01-gates-e-baseline.md)`) | **Não** — é referência cruzada real a `01-gates-e-baseline.md` §9, não autorreferência morta |
| `adr/003-remocao-backend-proprio.md:78 -> §4` | idem, 3 §s antes de um qualificador único no fim da linha (`.../09-pipeline-criacao-aplicacao-tema.md`) | **Não** |
| `adr/003-remocao-backend-proprio.md:78 -> §5` | idem | **Não** |
| `adr/003-remocao-backend-proprio.md:78 -> §6` | idem | **Não** |
| `02-enforcement-por-commit.md:160 -> §3.2` | qualificador (`[[01-gates-e-baseline]]`) presente na MESMA linha, mas longe (antes só via janela de 40 chars) | **Não** |
| `02-enforcement-por-commit.md:304 -> §3.1` | idem — a linha tem `[[01-gates-e-baseline]] §3.1` mais adiante | **Não** |
| `11-testes-e-cobertura.md:113 -> §2.3` | qualificador **na linha seguinte** (`:114` tem `[[10-seguranca-e-acessibilidade]]`) | **Não** |
| `12-kit-do-consumidor.md:52 -> §0` | prosa `"do guia"` (o doc é sobre `sarak-ui/`, e `GUIA-FRONTEND.md` é "o guia" citado em `:28`) | **Não** |
| `14-artefatos-do-mantenedor.md:241 -> §0` | prosa `"do guia"` (o doc é sobre `sarak-dev/`, e `GUIA-MANUTENCAO.md` é "o guia" citado em `:38`) | **Não** |
| `15-divida-conhecida.md:70 -> §5.1` | prosa `"do guia"` (a linha cita literalmente o bug do achado 29: `"§5.1 do guia"`, uma referência ao `GUIA-MANUTENCAO.md`) | **Não** |
| `15-divida-conhecida.md:137 -> §9` (1ª) | qualificador `.md` na MESMA linha, mais adiante (`04-contrato-de-tokens-e-paridade.md:252`) | **Não** |
| `15-divida-conhecida.md:137 -> §9` (2ª) | idem | **Não** |

**Ponto cego declarado:** `ignoradosComQualificador` subiu de **127 para 184** (57 a mais) — parte desse
aumento é ponteiro que **antes resolvia sozinho** (autorreferência genuína) e agora só é **ignorado** por
compartilhar linha/linha-vizinha com uma menção a outro documento. É sub-cobertura, nunca acusação errada
(o gate nunca passou a **resolver** cross-documento — só a não acusar). Escrito no bloco `LIMITES DECLARADOS`
item 4 do próprio script.

**Self-test** (describe "qualificador ampliado"): três casos que **passaram a liberar** (qualificador depois
do §, na linha seguinte, e em prosa) e um caso que **ainda pega** (nenhum qualificador em nenhuma das 3
linhas → continua acusado). Os 4 passam.

### Item 4 do escopo — os 3 itens do balde 4 do lote 5, apurados

Os 3 itens ainda não classificados eram `SidebarNav.tsx:107` (`max-w-[120px]`), `TopbarNav.tsx:104`
(`max-w-[150px]`) e `ShellSearchWidget.tsx:78` (`w-[400px]`) — confirmados presentes exatamente nesses
`arquivo:linha` na medição desta execução (os outros 2 do balde 4, `SarakBackgroundRenderer.tsx:71`, são o
conserto 3 abaixo, e não fazem parte deste item).

**Resposta do teste §3.3 para os 3:** ao pé da letra, **Sim** — R2 proíbe "unidade (px/rem/em) escrita solta
em `.tsx`" sem ressalva para dimensão não-temática, e os 3 são literalmente `px` solto num `.tsx` dentro do
`VALUE_SCOPE`. Não são "fallback interpolado" (conserto 3): o literal está direto na classe Tailwind, sem
nenhuma `const` interpolada em `var()`. **Não é falso positivo de gate** — não há conserto de detector a
fazer aqui, e por isso **nenhum código de gate foi tocado por este item**.

Mas a própria classificação que a `plan-15` (lote 5) já registrou para esses 3 argumenta pela **terceira
saída da §3.3** ("a regra é que está larga demais"): nenhum deles é propriedade de identidade visual — são
largura de truncamento de rótulo (`max-w-[120px]`/`max-w-[150px]`) e largura de um dropdown flutuante
específico (`w-[400px]`), sem tema plausível que precise variá-los. Essa é uma leitura defensável, mas é
**decisão do dono** por definição da própria plan — o executor não decide. **Devolvido nomeado para a
`plan-15`/dono**, sem allowlist e sem carve-out, exatamente como a §3.2 desta plan exige.

### Conserto 3 — fallback interpolado (`auditor_hardcoded.mjs`)

**O que era:** `SarakBackgroundRenderer.tsx:71` declara `const fallbackColor = isLightMode ? '#ffffff' :
'#000000';`, usada só em `:72` como `` `color-mix(in srgb, var(--sarak-bg-base, ${fallbackColor}) 85%,
transparent)` ``. `sanitizeFallbacks()` só limpa hex/unidade escritos literalmente DENTRO de `var(...)`; como
o literal mora numa `const` interpolada por template literal, ele sobrevivia à limpeza — 2 violações
(`#ffffff`, `#000000`).

**Conserto:** `collectInterpolatedFallbackIdentifiers` varre cada `TemplateExpression` do arquivo e localiza
substituições `${ident}` cujo texto imediatamente anterior termina em `var(--token, ` e cujo texto
imediatamente seguinte começa em `)` — isto é, `ident` é usado exatamente como fallback interpolado de um
`var()`. `checkValueHardcoded` passa a pular o(s) literal(is) que declaram esse identificador (subindo por
ternário/parênteses até a `VariableDeclaration`).

**Contagem antes/depois:** `auditor_hardcoded.mjs` → **33 → 31**. Os 2 de `SarakBackgroundRenderer.tsx:71`
saíram; os outros 31 permanecem intactos (conferido item a item na saída do gate).

**Resposta do teste §3.3:** **Não** — o literal não é "hardcode solto" no sentido que R2 proíbe; ele é
exatamente o padrão que R2 endossa (`var(--token, fallback)`), só que o fallback chega por indireção de
`const` em vez de estar escrito inline. A construção matemática (branco/preto como polos de um cálculo de
contraste) é a mesma classe já registrada em `00-contexto` §8 para outros literais de fórmula.

**Ponto cego declarado:** a isenção casa por NOME de identificador, não por escopo resolvido — uma `const`
com nome IGUAL usada como fallback interpolado em outro lugar do MESMO arquivo esconderia um hardcode real
que só coincida de nome. Sub-cobertura, nunca acusação errada. Escrito no comentário acima de
`VAR_FALLBACK_HEAD_RE`.

**Self-test** (`auditor_hardcoded.fallback-interpolado.test.mjs`, arquivo novo): um caso que **passou a
liberar** (literal usado só como fallback interpolado → `status: 0`) e um caso que **ainda pega** (literal
hex idêntico, mas NÃO usado como fallback interpolado → `status: 1`, `#ffffff` presente na saída).

### Bloco `LIMITES DECLARADOS`

Os dois scripts tocados ganharam o bloco atualizado, na MESMA edição de cada conserto:

- `check-section-pointers.mjs` — cabeçalho reescrito: item 3 ganhou a convenção 3c (rótulo de tabela); item 4
  novo documenta o qualificador ampliado e o ponto cego (linha compartilhada esconde autorreferência morta).
- `auditor_hardcoded.mjs` — comentário novo acima de `VAR_FALLBACK_HEAD_RE` documenta o mecanismo e o ponto
  cego (casamento por nome, não por escopo). O arquivo já continha o marcador `"ponto cego conhecido"` antes
  desta edição (linhas 29 e 238 originais), então `check-gate-limits.mjs` já o reconhecia; a nova nota reforça
  o padrão no lugar certo.

`npm run gate-limits:check` → **26/26** scripts com bloco de limite.

### Baseline regravado

`node gates/scripts/release/check-audit-baseline.mjs --with-tsc --write`:

| Métrica | Antes | Depois |
|---|---|---|
| `auditor_hardcoded.mjs.valor` | 33 | **31** |
| `auditor_sectionpointers.mjs.mortos` | 18 | **2** |
| `auditor_ghostvars.mjs.consumos` | 26 | 26 (inalterado) |
| `auditor_composicaoatomica.mjs.violacoes` | 47 | 47 (inalterado — fora do escopo desta plan) |
| `tsc` | 0/0/0 | 0/0/0 (inalterado) |

`gates/baselines/audit-baseline.json` regravado no mesmo diff desta plan (não em commit separado).

### Verificações executadas

- `node gates/scripts/audit/auditor_sectionpointers.mjs` → **2** mortos (era 18), **184** ignorados por
  qualificador (era 127).
- `node gates/scripts/audit/auditor_hardcoded.mjs` → **31** violações de VALOR (era 33), 0 estrutural líquido.
- `npm run gate-limits:check` → **26/26**.
- `npm run audit` → `AUDITORIA FALHOU: 4 regras estruturais` — **igual ao baseline recalibrado**: hardcoded
  31, ghostvars 26, sectionpointers 2, composicaoatomica 47 (os outros 7 auditores, `[OK]`). Não é regressão:
  bate número a número com o baseline regravado.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → *"igual ao baseline de 2026-08-08 —
  nenhuma regressão."*
- `npx vitest run` → **290 arquivos / 1012 testes, 100% verde** (era 289/1004 — +1 arquivo novo de self-test,
  +8 casos no `check-section-pointers.test.mjs`, +2 no `auditor_hardcoded.fallback-interpolado.test.mjs`,
  bate exatamente com o que foi adicionado).
- `git diff --stat` → só `gates/baselines/audit-baseline.json`, `gates/scripts/audit/auditor_hardcoded.mjs`,
  `gates/scripts/contrato/check-section-pointers.mjs`,
  `gates/scripts/contrato/__tests__/check-section-pointers.test.mjs` e a própria plan — **nenhum `src/` de
  produção**. Arquivo novo (não rastreado): `gates/scripts/audit/__tests__/auditor_hardcoded.fallback-interpolado.test.mjs`.

**Não executado:** `npm run gates:full` — não está na lista de verificação da §8 desta plan (que pede
especificamente `audit`, `vitest run`, `gate-limits:check` e `check-audit-baseline --with-tsc`). Rodei por
curiosidade e `dev-kit:check` reprovou por defasagem de `sarak-dev/` — confirmado **pré-existente** via
`git status` (nenhum arquivo de `sarak-dev/` aparece como modificado nesta sessão) e fora do escopo desta
plan; registrado em "Achados fora do escopo".

### Critérios de aceite

- [x] Os 4 ponteiros de rótulo de tabela deixam de ser acusados — evidência: contagem 18→2 e a tabela do
      Conserto 1; self-test negativo (`§5.9` inexistente) continua acusado.
- [x] Os ~8 (na prática, **12**) de qualificador deixam de ser acusados, sem nenhuma tentativa de resolver
      contra o arquivo citado (o gate só decide IGNORAR, nunca RESOLVE cross-documento) — logo não há como
      atribuir a um documento errado. Ver Conserto 2.
- [x] Os 2 literais de fallback interpolado deixam de ser acusados; self-test negativo (literal hex idêntico,
      não interpolado) continua acusado.
- [x] Para cada caso liberado, a resposta do teste §3.3 está escrita acima (item a item, nas três tabelas).
- [x] Os 3 itens não apurados do balde 4 estão classificados, com `arquivo:linha`, e devolvidos nomeados
      (não pagos, não viraram allowlist).
- [x] Bloco `LIMITES DECLARADOS` de cada gate tocado traz o ponto cego novo; `gate-limits:check` verde.
- [x] Self-test por conserto: um caso pego, um liberado — nos 3 consertos.
- [x] Baseline regravado junto; `check-audit-baseline` diz "igual ao baseline".
- [x] Nenhuma violação real paga aqui — `git diff` sem `src/` de produção.
- [x] `npx vitest run` verde (290/1012).
- [x] Os ponteiros que sobraram estão nomeados no resumo para o revisor (ver abaixo).

### Decisões e suposições

- **Os 2 ponteiros que sobraram são do revisor**, confirmando o padrão que a `plan-15` (§11) já registrou: os
  18 originais viviam só em `specs/specs/`, `specs/adr/` e `specs/00-indice.md`. Depois dos dois consertos,
  restam:
  - `specs/specs/01-gates-e-baseline.md:572 -> §7.3` — não é sequer um ponteiro de verdade: é um EXEMPLO da
    convenção `§7.3 = item 3 da seção 7` dentro da prosa que EXPLICA a convenção (`## 9.4`), sem qualificador
    de documento nenhum por perto. Conserto de conteúdo (não de gate): reescrever para não parecer um ponteiro
    vivo, ex. escapar como `` "§7.3" `` já em prosa ou reformular a frase — decisão do revisor.
  - `specs/specs/15-divida-conhecida.md:179 -> §4.2` — a seção `# 4` existe, mas não há heading `4.2`, item
    numerado nem linha de tabela `**4.2**`; nenhum qualificador de outro documento nas 3 linhas. Não
    consegui determinar com confiança se `§4.2` pretendia autorreferência (e está morto de verdade) ou é
    forma abreviada para "achado 4, categoria 2" (não uma seção). Revisor decide.
- **Não toquei em `auditor_composicaoatomica.mjs` nem no número 47** — fora do escopo desta plan (R10, dívida
  da `plan-15`), confirmado inalterado no baseline regravado.
- **Não criei allowlist nem carve-out para os 3 itens do balde 4** — segui a proibição explícita da §3.2.

### Achados fora do escopo (não corrigidos)

- `npm run dev-kit:check` reprova por defasagem em `sarak-dev/state.json`, `GUIA-MANUTENCAO.md` e
  `START-HERE.md` — pré-existente (nenhum arquivo de `sarak-dev/` foi tocado nesta sessão), fora do escopo
  desta plan e não coberto pela lista de verificação da §8. Sugestão: `npm run dev-kit` numa plan própria.
- Os 2 ponteiros de seção remanescentes (ver "Decisões e suposições") vivem em `specs/specs/` — fora do
  alcance do executor ([[00-prompt-executor]] §7.3).

### Pendências / riscos

- **Os 3 itens do balde 4 (`SidebarNav.tsx:107`, `TopbarNav.tsx:104`, `ShellSearchWidget.tsx:78`) aguardam
  decisão do dono**: aceitar como característica (equivalente a "regra larga demais", precisando edição em
  `00-regras-e-invariantes` R2) ou tratar como dívida real da `plan-15` (tokenizar/Expansão R11). Nenhuma das
  duas foi decidida aqui, por mandato explícito da §3.3.
- **`time-tracking`:** confirmado de novo — não há skill nem servidor MCP `time-tracking` nesta sessão; o
  `CLAUDE.md` cobra uma capacidade que o ambiente não oferece.
- **`specs/00-indice.md` vai divergir** ao mudar o `status` desta plan para `🟠 Em revisão` — mesma mecânica
  já registrada pelas execuções anteriores da `plan-15`; o executor não corrige `00-indice.md` sozinho.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
