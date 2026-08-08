---
tipo: "plan"
titulo: "Calibrar os gates pelos falsos positivos medidos — o verificador para de acusar o que não é violação"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🔴 A executar"
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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
