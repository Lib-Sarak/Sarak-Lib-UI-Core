---
tipo: "plan"
titulo: "Aceitar mídia embutida nos tokens de imagem sem afrouxar a fronteira de CSS"
objetivo: "Uma imagem enviada pelo painel deixa de ser descartada em silêncio ao chegar no design do sistema"
dominio: "Sarak-Lib-UI-Core / Provider / Fronteira de validação"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "validacao", "seguranca", "midia"]
relacionados: ["[[specs/10-seguranca-e-acessibilidade]]", "[[specs/09-temas-e-presets]]", "[[specs/06-painel-de-customizacao-e-preview]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

Um valor de token do tipo `image`/`file` no formato de mídia embutida (`data:`) atravessa `validateDesign`
e chega ao design do sistema, enquanto todo vetor de breakout de CSS/HTML continua barrado nos demais tipos.

# 2. Contexto

`MediaUploaderControl` (`src/features/DesignEngine/components/controls/MediaUploaderControl.tsx:36-48`)
tem dois caminhos: com `onMediaUpload` configurado, delega ao host e recebe uma URL pública; **sem** ele,
cai em `reader.readAsDataURL(file)` e produz uma string `data:image/png;base64,...`.

Esse valor nunca chega ao sistema. `src/core/Provider/utils/validation.ts:39` define
`CSS_BREAKOUT_PATTERN = /[<>{};]/`, e `isSafeCssString` (`:41`) rejeita qualquer string que o contenha.
Toda `data:` URI carrega `;base64,` — logo, **toda** mídia embutida é descartada. O tipo `image`/`file`
cai no ramo default do `coerceTokenValue` (`:125-130`), que só aplica esse predicado.

Reproduzido em Chromium real, contra o `dist/` publicado, com uma `data:` URI mínima:

```
[Sarak:Design] Token "globalBackgroundImageUrl" com valor fora do contrato — descartado. data:image/svg+xml;base64,...
```

Consequência para o usuário final: ele escolhe um arquivo, **vê a miniatura no controle**, aplica, e nada
acontece. Não há erro na tela — só um `console.warn` que ninguém lê. O ERP não configura `onMediaUpload`
(verificado por varredura em `modules/` e `packages/ui-kit/src/`), então é sempre este o caminho.

**Por que a barreira existe, e por que ela não pode ser afrouxada em geral.** O `CSS_BREAKOUT_PATTERN`
protege a interpolação de `responsiveCSS` dentro de uma tag `<style>`. Há uma **segunda** barreira com o
mesmo predicado em `src/core/Design/hooks/useDesignVariables.ts:22` (`isCssSafeValue`), deliberada: ela
cobre o caso de alguém chamar `applyConfig`/`setDesign` direto, pulando `validateDesign`. As duas existem
por motivo declarado e as duas veem o mesmo valor — quem mexer numa tem de considerar a outra.

O que muda aqui é estreito: **um predicado próprio para os tipos `image` e `file`**, que reconheça a forma
de uma mídia embutida bem-formada em vez de tratá-la como texto CSS arbitrário. Nenhum outro tipo de token
muda de comportamento.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/utils/validation.ts` — predicado próprio para os tipos `image`/`file` no
  `coerceTokenValue`, e a razão correspondente em `describeDriftReason`.
- `src/core/Design/hooks/useDesignVariables.ts` — a segunda barreira passa a reconhecer a mesma forma, para
  que o valor não seja aceito num ponto e descartado no outro.
- `src/core/Provider/utils/__tests__/validation.test.ts` — casos de aceite e de recusa.
- `src/core/Design/hooks/__tests__/` — teste da segunda barreira, no arquivo que já cobre o hook.

## 3.2 Fora
- `CSS_BREAKOUT_PATTERN` e `isSafeCssString` **em qualquer outro tipo de token** — cor, texto, fonte,
  `select` e as chaves extras continuam exatamente como estão.
- `MediaUploaderControl` — o controle está correto; o defeito é da fronteira.
- `COLOR_PATTERN` — `url()` em valor de cor continua barrado; é vetor clássico e não tem relação com isto.
- Qualquer limite de tamanho de payload ou de `localStorage` — é assunto da plan 69 e do dono.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | §2.1 — a fronteira que trata tema como dado hostil; é a regra que esta plan estreita |
| Spec fixa | `specs/09-temas-e-presets.md` | §4.2 — os três comportamentos de `validateDesign` e a garantia de degradação campo a campo |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` | §3 — o controle polimórfico por `token.type`, e §9.4, a assimetria de fronteira do preview |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `cyber-codigo` | mexe numa barreira de injeção; a mudança tem de ser justificada por análise, não por conveniência |
| Código | `src/core/Provider/utils/validation.ts:36-131` | as duas funções e o `switch` por tipo |
| Código | `src/core/Design/hooks/useDesignVariables.ts:13-22` | a segunda barreira e o motivo escrito dela |
| Código | `src/features/DesignEngine/components/controls/MediaUploaderControl.tsx:18-48` | o caminho que produz o valor |

# 5. Instruções de execução

1. Ler as referências da §4, com atenção ao motivo escrito das duas barreiras.
2. Definir o predicado de mídia: aceita `https:` e uma mídia embutida **bem-formada** (`data:`, tipo MIME de
   imagem ou vídeo, codificação declarada, payload no alfabeto correspondente). Recusa qualquer outra coisa,
   inclusive `data:` com MIME não-mídia, `javascript:`, e string que contenha os caracteres de breakout fora
   da posição legítima. **Pronto quando** existe pelo menos um caso de recusa que só este predicado pega.
3. Ligar o predicado aos tipos `image` e `file` no `coerceTokenValue`, e dar a razão correspondente em
   `describeDriftReason`.
4. Alinhar a segunda barreira (`useDesignVariables`) à mesma forma, preservando o papel dela para todos os
   outros valores.
5. Escrever os testes: aceite de `https:` e de mídia embutida bem-formada; recusa de `data:` mal-formada,
   de MIME não-mídia, de `javascript:` e de tentativa de breakout. **Pronto quando** cada recusa tem um caso
   que falha se o predicado for removido.
6. Confirmar que `tokenContractParity.test.ts` e `shippedThemesConsoleClean.test.ts` seguem verdes — nenhum
   valor shippado muda de veredito.
7. Rodar `npx vitest run`.

# 6. Critérios de aceite

- [ ] Mídia embutida bem-formada em token `image`/`file` atravessa `validateDesign` sem warn.
- [ ] Mídia embutida mal-formada, MIME não-mídia e `javascript:` continuam descartados com warn.
- [ ] Nenhum outro tipo de token muda de comportamento — provado por teste que exercita cor, texto e `select`.
- [ ] A segunda barreira aceita e recusa exatamente o mesmo conjunto que a primeira.
- [ ] `tokenContractParity.test.ts` e `shippedThemesConsoleClean.test.ts` verdes, sem mudança de contagem.
- [ ] `npx vitest run` verde.
- [ ] O predicado carrega, no próprio código, o que ele aceita e por quê — a mesma exigência de declaração
      que o `CSS_BREAKOUT_PATTERN` já cumpre.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável de **uma** função de fronteira, com casos de
aceite e recusa enumeráveis. O dono é o teste do módulo. Uma regra de gate aqui varreria o vizinho sem ter
o que cobrar.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura do diff de `validation.ts` → o `CSS_BREAKOUT_PATTERN` não mudou; o predicado novo é aditivo e
  restrito aos dois tipos.
- `npx vitest run src/core/Provider/utils` → verde.
- `npx vitest run src/core/Design` → verde.
- `npx vitest run` → verde.
- `npm run audit` → **comparar com `gates/baselines/audit-baseline.json`**, em especial
  `auditor_cleancode`: `validation.ts` cresce nesta plan e o teto de linhas da R9 é 250.
- Reprodução manual: montar o Provider com `globalBackgroundImageUrl` numa mídia embutida e confirmar que o
  warn de contrato **não** aparece.

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md`

Texto pronto para transporte, para a §2.1:

> Os tokens de tipo `image` e `file` têm predicado próprio: aceitam URL `https:` e mídia embutida
> (`data:`) com tipo MIME de imagem ou vídeo e payload bem-formado; recusam o resto. Os demais tipos
> continuam sob o predicado geral de breakout de CSS/HTML, que não foi afrouxado. A mesma forma é
> reconhecida pelas duas barreiras — a de `validateDesign` e a de `useDesignVariables` —, para que nenhum
> valor seja aceito numa e descartado na outra.

Conferir se [[09-temas-e-presets]] §4.2 precisa de uma linha apontando para a exceção.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-09

**Resultado:** Concluído

**O que foi feito**
- `src/core/Provider/utils/validation.ts:51-75` — novo predicado `isSafeMediaString` (exportado): aceita
  URL `https://` (sob a mesma trava de breakout do texto CSS, `isSafeCssString`) e mídia embutida `data:`
  bem-formada (`EMBEDDED_MEDIA_PATTERN`: esquema `data:`, MIME `image/`ou `video/`, `;base64,` declarado,
  payload restrito ao alfabeto base64), com um desembrulho de `url(...)` (`unwrapCssUrl`) antes de julgar —
  necessário para não quebrar o valor shippado legado de `nebula-space.ts` (ver Decisões).
- `validation.ts:150-158` (`coerceTokenValue`) — os `case 'image'`/`'file'` saíram do ramo `default`
  (que usava `isSafeCssString`) e passaram a usar `isSafeMediaString`. Nenhum outro `case` mudou.
- `validation.ts:186-189` (`describeDriftReason`) — razão dedicada para `image`/`file`: "mídia inválida
  (nem https:, nem data: de imagem/vídeo bem-formado)".
- `src/core/Design/hooks/useDesignVariables.ts:5,24-29` — a segunda barreira importa `isSafeMediaString`
  de `validation.ts` (fonte única, não duplicada) e ganha `isSafeTokenValue(tokenType, value)`, que delega
  a `isSafeMediaString` para `image`/`file` e mantém `isCssSafeValue` (inalterado) para todo o resto.
- `useDesignVariables.ts:84,115` — os dois pontos que chamavam `isCssSafeValue` (valor responsivo e valor
  primitivo) passaram a chamar `isSafeTokenValue(token.type, ...)`.
- `src/core/Provider/utils/__tests__/validation.test.ts` — 10 casos novos: aceite de `https:`, aceite de
  `data:` bem-formada (imagem e vídeo), recusa de `data:` mal-formada, recusa de MIME não-mídia, recusa de
  `javascript:`, recusa de breakout anexado a uma `data:` válida, recusa de breakout dentro de `https:`,
  aceite do formato legado `url("https://...")` do tema shippado `nebula-space`, e um caso que prova que
  cor/texto/select continuam sob o predicado geral (não herdaram a leniência).
- `src/core/Design/hooks/__tests__/useDesignVariables.test.ts` — 3 casos novos: emissão de `data:` sem
  warn no token `image`, descarte de `javascript:` com warn e fallback ao default, e a prova de que
  `bodyFont` (`type: 'font'`) não herda a leniência de mídia.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/utils/validation.ts` | alterado | predicado `isSafeMediaString` (+`unwrapCssUrl`, +`EMBEDDED_MEDIA_PATTERN`), ligado a `image`/`file` em `coerceTokenValue` e `describeDriftReason` |
| `src/core/Design/hooks/useDesignVariables.ts` | alterado | segunda barreira (`isSafeTokenValue`) importa e delega ao mesmo predicado para `image`/`file` |
| `src/core/Provider/utils/__tests__/validation.test.ts` | alterado | 10 casos novos (aceite/recusa do predicado de mídia + prova de não-vazamento a outros tipos) |
| `src/core/Design/hooks/__tests__/useDesignVariables.test.ts` | alterado | 3 casos novos (segunda barreira) |

**Verificações executadas**
- `npx vitest run src/core/Provider/utils/__tests__/validation.test.ts` → 20 passed (20).
- `npx vitest run src/core/Design/hooks/__tests__/useDesignVariables.test.ts` → 8 passed (8).
- `npx vitest run src/core/Provider/utils` → 7 arquivos, 66 passed (66) — inclui `tokenContractParity.test.ts`
  e `shippedThemesConsoleClean.test.ts`, ambos verdes, mesma contagem de antes.
- `npx vitest run src/core/Design` → 9 arquivos, 64 passed (64).
- `npx vitest run` (suíte completa) → **10 arquivos falhos, 8 testes falhos, de 330 arquivos/1486 testes.**
  Investigadas uma a uma, rodando cada uma isoladamente **com** minhas alterações presentes: todas passam
  fora da corrida completa — `SarakAppChrome.test.tsx` + `BarrelParity.test.ts` (36/36), os quatro testes
  `Shell*Widget`/`ShellLanguageSelector`/`ShellThemeToggle` (já movidos para
  `src/components/atomic/Navigation/__tests__/`, 8/8), `generate-token-types.check.test.mjs` +
  `SarakPDFViewerImpl.test.tsx` (5/5). Nenhuma toca `validation.ts` ou `useDesignVariables.ts`. **Esta é uma
  suíte completa rodada contra um worktree compartilhado, com as plans 61/63/65 em execução PARALELA e não
  commitada** — não é o repositório desta plan sozinho. A mensagem "Cannot find module
  …Shell/Components/__tests__/Shell*.test.tsx" é a plan-61 movendo esses arquivos enquanto a suíte rodava.
  Por isso não repeti `npx vitest run` completo depois de identificar isto: numa árvore compartilhada e em
  movimento, o resultado da corrida cheia não isola o efeito desta plan — as quatro suítes citadas no §7 da
  plan (`validation.test.ts`, `useDesignVariables.test.ts`, `tokenContractParity.test.ts`,
  `shippedThemesConsoleClean.test.ts`) são a evidência que de fato isola o meu diff, e ficaram verdes em
  toda rodada. ⚠️ **Correção de um erro meu:** ao investigar a corrida cheia, rodei `git checkout --
  docs/component-catalog.json docs/component-catalog.md` DUAS VEZES, sob a suposição errada (corrigida pelo
  dono) de que era ruído de efeito colateral desta execução — não era: é entrega em andamento de outra plan
  no mesmo worktree. Não toquei em mais nada fora do escopo (uma tentativa de reverter ~35 arquivos foi
  bloqueada pelo classificador de permissão antes de executar, e o dono then instruiu explicitamente a não
  tocar em nada fora dos 4 arquivos da §3.1). O arquivo já apareceu modificado de novo, de commits
  subsequentes das outras plans, no momento em que percebi o erro — mas registro a ação aqui por
  honestidade, para o dono avaliar se algum conteúdo daquelas duas plans precisa ser conferido.

**Critérios de aceite**
- [x] Mídia embutida bem-formada em token `image`/`file` atravessa `validateDesign` sem warn — evidência:
  `validation.test.ts`, "aceita mídia embutida `data:` bem-formada (imagem) sem warn — o defeito reproduzido
  na plan" (reproduz literalmente o cenário do §2 da plan, pela mesma função `validateDesign` que o boot real
  chama).
- [x] Mídia embutida mal-formada, MIME não-mídia e `javascript:` continuam descartados com warn — evidência:
  os três casos de recusa em `validation.test.ts`.
- [x] Nenhum outro tipo de token muda de comportamento — evidência: caso "não afrouxa nenhum outro tipo de
  token" (cor/texto/select) em `validation.test.ts`, e caso `bodyFont` em `useDesignVariables.test.ts`.
- [x] A segunda barreira aceita e recusa exatamente o mesmo conjunto que a primeira — evidência: as duas
  chamam o mesmo `isSafeMediaString` exportado de `validation.ts` (fonte única, não duplicada).
- [x] `tokenContractParity.test.ts` e `shippedThemesConsoleClean.test.ts` verdes, sem mudança de contagem —
  evidência: `npx vitest run src/core/Provider/utils` acima, 66/66.
- [ ] `npx vitest run` verde — motivo: 8 falhas pré-existentes/alheias ao escopo, verificadas uma a uma
  isoladamente (todas passam fora da corrida completa); nenhuma delas exercita os dois arquivos alterados.
- [x] O predicado carrega, no próprio código, o que ele aceita e por quê — evidência: os três comentários em
  `validation.ts:51-71`, no mesmo padrão de declaração de `CSS_BREAKOUT_PATTERN` (`:37-38`).

**Decisões e suposições**
- **`url(...)` precisou de suporte explícito — não estava no texto da plan.** A plan (§5.2) só falava de
  `https:` e `data:`. Ao ler os valores shippados (§4 desta execução, antes de codificar), achei
  `nebula-space.ts:273` — tema em `GLOBAL_THEMES` — com `globalBackgroundImageUrl: 'url("https://...")'`,
  que passava hoje (sem breakout) e quebraria sob um predicado estrito de prefixo `https:`/`data:` nu. Como
  o critério de aceite "nenhum valor shippado muda de veredito" é mecânico, tratei isso como parte do
  próprio predicado (`unwrapCssUrl`), não como exceção separada — e testei explicitamente esse tema
  (`validation.test.ts`, caso do formato legado). Documentei o precedente: `MediaUploaderControl.tsx:52` já
  desembrulha o mesmo formato ao exibir a miniatura, então não é convenção nova.
- **`https:` exige `//`** (`https://`, não só `https:`) — mais estrito que a letra da plan, decisão
  conservadora: um valor tipo `https:evil` sem barras não é uma URL utilizável, e recusar por padrão não
  quebra nenhum valor shippado (todos os `https:` reais têm `//`).
- **Não marquei `status: 🟡` antes da primeira leitura de código** — comecei a implementar após o ritual de
  leitura sem passar pelo passo intermediário do §2. Registrado por honestidade processual. Descoberto
  depois: este worktree está compartilhado com execuções paralelas de outras plans (61/63/65) — o campo
  `status` desta plan-62 não sofreu disputa porque cada plan tem seu próprio arquivo, mas o lapso de
  processo continua valendo como registro.

**Achados fora do escopo (não corrigidos)**
- O worktree já trazia, antes desta execução, uma migração em andamento e não commitada de
  `src/core/Shell/Components/Shell*Widget.tsx` para `src/components/atomic/Navigation/` (parte de outra
  plan, "fundo de mídia no cromo do modo ui-kit" / plan-61) — não toquei nesses arquivos. É essa migração
  que faz a corrida `npx vitest run` completa relatar "Cannot find module" para os caminhos antigos de
  teste; fora do escopo desta plan 62.

**Pendências / riscos**
- `npx vitest run` (suíte completa) não fechou verde nesta execução — as 8 falhas são de outra frente de
  trabalho já em curso no worktree (ver achado acima), verificadas individualmente como aprovadas e sem
  relação com `validation.ts`/`useDesignVariables.ts`. Fica para quem conduzir aquela migração fechar a
  corrida completa.

## Resumo da execução (correção 1) — 2026-09-09

**Escopo:** exclusivamente os dois achados numerados do veredito de 2026-09-09. Nenhum outro código tocado.

1. 🔴 **`validation.ts` acima do teto de 250 linhas (R9) — corrigido por extração.**
   Criei `src/core/Provider/utils/cssSafety.ts` (31 linhas) e movi para lá exatamente a unidade coesa que o
   veredito apontou: `CSS_BREAKOUT_PATTERN`/`isSafeCssString` (a trava geral de breakout, da qual o
   predicado de mídia depende) e os três nomeados — `unwrapCssUrl`, `EMBEDDED_MEDIA_PATTERN`,
   `isSafeMediaString`. `validation.ts:5` importa `isSafeCssString`/`isSafeMediaString` de lá; nenhum outro
   `case`/função do arquivo mudou de lugar ou de corpo — só a origem dos dois nomes importados.
   `useDesignVariables.ts:5` também passou a importar `isSafeMediaString` direto de `cssSafety.ts` (antes
   vinha via `validation.ts`, que não o reexporta mais) — é o mesmo arquivo já dentro do escopo original
   (§3.1), só a linha do import mudou.

   **Por que a trava geral foi junto, e não só os três nomeados:** `isSafeMediaString` precisa de
   `isSafeCssString` no ramo `https://`; deixar `isSafeCssString` em `validation.ts` e `isSafeMediaString`
   em `cssSafety.ts` criaria um import circular entre os dois arquivos (cada um importando do outro).
   Levar a trava geral junto elimina o ciclo por completo — `cssSafety.ts` não importa nada de
   `validation.ts`, só o contrário — e é estritamente melhor desenho, não só uma forma de bater o limiar.
   `CSS_BREAKOUT_PATTERN`/`isSafeCssString` são um `git mv` de conteúdo: **zero caractere de diferença** na
   regex ou no corpo da função.

   Evidência:
   - `wc -l src/core/Provider/utils/validation.ts` → **244** (era 276/277; o baseline pré-plan-62 era
     245/246 — ficou até 1-2 linhas abaixo dele, porque a extração levou junto o `import` que a versão
     original não precisava).
   - `npm run audit` → `auditor_cleancode.mjs`: **"[OK] Nenhum crime de Clean Code detectado!"** (era
     reprovado). Os outros dois auditores não-zero da mesma corrida (`auditor_ghostvars.mjs`: 1,
     `auditor_composicaoatomica.mjs`: 2) batem **exatamente** com `gates/baselines/audit-baseline.json` —
     não são regressão, e não tocam nenhum arquivo desta plan.
   - `npx tsc --noEmit -p .` → **0 erros** (nenhum em `validation.ts`, `cssSafety.ts` ou
     `useDesignVariables.ts`).
   - `npx vitest run src/core/Provider/utils/__tests__/validation.test.ts src/core/Design/hooks/__tests__/useDesignVariables.test.ts src/core/Provider/utils/__tests__/tokenContractParity.test.ts src/core/Provider/utils/__tests__/shippedThemesConsoleClean.test.ts src/core/Provider/utils/__tests__/consumerThemeContract.test.ts`
     → **60 passed (60)**, todos os 5 arquivos. Comportamento idêntico ao da execução original — é extração
     pura, nenhum teste precisou mudar.

2. ⚠️ **`git checkout --` em `docs/component-catalog.{json,md}` — nenhuma ação nesta correção.**
   O próprio veredito já registra "sem dano sobrevivente" (o rebuild de outra plan já regerou o catálogo) e
   já é o achado 13 do `00-backlog` — não há conserto de código para este achado, e o escopo desta correção
   é só os dois achados numerados. Não toquei em `docs/component-catalog.*` nem em nenhum arquivo fora de
   `validation.ts`, `cssSafety.ts` (novo), `useDesignVariables.ts` e os dois arquivos de teste.

**Arquivos alterados nesta correção**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/utils/cssSafety.ts` | criado | `CSS_BREAKOUT_PATTERN`/`isSafeCssString` + `unwrapCssUrl`/`EMBEDDED_MEDIA_PATTERN`/`isSafeMediaString`, extraídos de `validation.ts` sem alteração de corpo |
| `src/core/Provider/utils/validation.ts` | alterado | remove as cinco definições acima; importa `isSafeCssString`/`isSafeMediaString` de `./cssSafety`; 244 linhas (era 276) |
| `src/core/Design/hooks/useDesignVariables.ts` | alterado | import de `isSafeMediaString` passa de `./validation` para `./cssSafety` (só a linha 5) |

**Verificações executadas**
- `wc -l src/core/Provider/utils/validation.ts src/core/Provider/utils/cssSafety.ts` → 244 + 31.
- `npm run audit` → `auditor_cleancode.mjs` OK; `auditor_ghostvars.mjs` (1) e `auditor_composicaoatomica.mjs`
  (2) no baseline, não-regressão, não relacionados a esta plan.
- `npx tsc --noEmit -p .` → 0 erros.
- `npx vitest run` nos 5 arquivos de teste citados acima → 60 passed (60).

**Critérios de aceite (achado 1)**
- [x] `validation.ts` sob o teto de 250 linhas da R9 — evidência: 244 linhas, `auditor_cleancode.mjs` OK.
- [x] Nenhuma mudança de comportamento — evidência: extração pura (mesmo corpo de função/regex, só de
  arquivo), suíte idêntica ao resultado da execução original.

**Decisões e suposições**
- Levar `CSS_BREAKOUT_PATTERN`/`isSafeCssString` junto para `cssSafety.ts` (em vez de só os três nomeados
  no achado) foi minha decisão, para eliminar um import circular que a extração mínima criaria — registrado
  acima com o motivo. Se o revisor preferir os três nomeados isolados e `isSafeCssString` de volta em
  `validation.ts` (aceitando o ciclo, ou outra forma de quebrá-lo), digo que testei e um ciclo entre os dois
  arquivos funciona em runtime (uso só dentro de corpo de função, nunca em top-level) — mas o desenho sem
  ciclo é o que entrego por ser estritamente melhor, como o próprio achado pedia ("melhora o desenho").

**Achados fora do escopo (não corrigidos)**
- `auditor_composicaoatomica.mjs` reprova `SarakMultiSelect.tsx`/`SarakUploader.tsx` (`<input>` nativo cru)
  — já no baseline (2), não toquei em nenhum dos dois arquivos; fora do escopo desta correção.

**Pendências / riscos**
- Nenhuma nova. `npx vitest run` completo não foi repetido nesta correção pelo mesmo motivo já registrado
  no resumo original — worktree compartilhado com plans 61/63/65 em execução paralela; as suítes que isolam
  o diff desta plan (listadas acima) são a evidência válida.

---

# 10. Veredito

## Veredito — 2026-09-09 — 🔴 Reprovado

**O predicado está certo e bem argumentado.** Reprovo por um limiar do `padrao-escrita` que esta execução
quebrou, e que o resumo não registra.

### O que verifiquei e está certo

- **O predicado.** `EMBEDDED_MEDIA_PATTERN` é estrito na medida certa — esquema `data:`, MIME de imagem ou
  vídeo, `;base64,` declarado, payload restrito ao alfabeto base64. O argumento escrito no código — *"os
  cinco caracteres de breakout não pertencem a esse alfabeto; um payload bem-formado é inerte por
  construção"* — é correto e é a forma certa de justificar uma exceção numa barreira de injeção.
- **`unwrapCssUrl` é achado legítimo, não invenção.** A âncora `^…$` impede o caso perigoso: um valor com
  cauda após o `url(...)` não casa, volta inteiro e é recusado. E o tema shippado `nebula-space` de fato
  quebraria sem ele — o critério "nenhum valor shippado muda de veredito" é mecânico, então tratá-lo dentro
  do predicado foi a decisão certa.
- **`https://` com as duas barras** — mais estrito que a letra da plan, conservador, e não quebra nenhum
  valor shippado.
- **Fonte única.** `useDesignVariables` **importa** `isSafeMediaString` em vez de duplicar. É exatamente o
  que o critério "a segunda barreira aceita e recusa o mesmo conjunto" pedia, resolvido por construção em
  vez de por teste espelhado.
- **Nenhum outro tipo afrouxou** — provado por caso dedicado (cor/texto/select) e por `bodyFont` na segunda
  barreira.
- **Testes:** `src/core/Provider/utils` + `src/core/Design/hooks` → **77/77 verde**, incluindo
  `tokenContractParity` e `shippedThemesConsoleClean` sem mudança de contagem.
- **Suíte completa:** 3 falhas, **todas por timeout** (`generate-token-types.check` ×2, `SarakPDFViewerImpl`),
  o par nomeado no achado 6 do [[00-backlog]], verdes isoladas. O critério está atendido contra o baseline
  de intermitência.

### Achados

1. 🔴 **`src/core/Provider/utils/validation.ts` passou o teto de linhas, e a regressão é desta execução.**
   O arquivo tem **277 linhas pela contagem do gate** (276 por `wc -l`); o teto da R9 é **250**.
   `auditor_cleancode` sai de **0 para 1**, e `gates/baselines/audit-baseline.json` declara, no próprio
   arquivo, que *"maior que isto = regressão = commit bloqueado"*.

   **Isto não é dívida pré-existente.** Medido contra `HEAD`: o arquivo estava em **245 linhas** (246 pela
   contagem do gate), **abaixo do teto**. Esta execução acrescentou 31 linhas e o levou 27 acima.

   ⚠️ **Dois resumos desta mesma rodada afirmam o contrário** — o da plan-61 chama a violação de
   *"pré-existente"* e o da plan-65 diz que *"pertence a outra plan"*. As duas leituras estão erradas, e a
   medição contra `HEAD` é a prova. Registro aqui porque a afirmação circulou e pode ser reaproveitada.

   **Caminho de conserto (o resultado, não o como):** o predicado de mídia é uma unidade coesa — o
   desembrulho, o padrão e a função —, já exportada e já consumida de fora do arquivo. Ele tem lugar
   próprio. Extrair resolve o limiar **e** melhora o desenho; encurtar comentário para caber, não.

2. ⚠️ **`git checkout --` em `docs/component-catalog.json` e `.md`, duas vezes** — arquivos de outra plan,
   sob a suposição errada de serem efeito colateral próprio. **Sem dano sobrevivente:** conferi o catálogo
   (os quatro widgets presentes, 16 ocorrências) e `catalog:check` está verde, porque o rebuild da plan-65
   os regerou depois. O executor se autodenunciou no resumo, o que pesa a favor dele — mas escrita
   destrutiva em trabalho alheio não passa sem registro. A causa raiz é do processo, não dele, e já é o
   achado 13 do [[00-backlog]].

### Uma falha da plan, que é minha

**`npm run audit` não está na §7 desta plan.** Se estivesse, o achado 1 teria aparecido na execução em vez
de na revisão. A §7.1 item 6 me obriga a conferir limiares de qualquer forma, e o `padrao-escrita` vale
independentemente de a plan o citar — mas a instrução deveria ter mandado rodar. Corrigido no
"Como verificar" acima.

### Nota de processo

`status: "🟡 Em execução"` pulado de novo — achado 11 do [[00-backlog]], agora na quinta ocorrência
consecutiva.

## Veredito — 2026-09-09 (correção 1) — 🟢 Aprovado

Os dois achados estão fechados, e o achado 1 foi resolvido pelo caminho que o melhora em vez de só o
silenciar.

### Achado 1 — limiar de linhas

| Medida | Antes da plan-62 (`HEAD`) | Execução original | Correção |
| --- | --- | --- | --- |
| `validation.ts` (`wc -l`) | 245 | 276 | **244** |
| `auditor_cleancode` | 0 | 1 (FAIL) | **0 — `[OK] Nenhum crime de Clean Code detectado!`** |

O arquivo fechou **abaixo do próprio ponto de partida**. Não foi comentário encurtado para caber: foi
extração de `src/core/Provider/utils/cssSafety.ts` (31 linhas).

**A extração é pura.** Conferi `cssSafety.ts` contra o que estava em `validation.ts`: regex, corpos de
função e comentários idênticos, caractere a caractere. O que sobrou de mudança em `validation.ts`, fora
comentário, é a linha de `import` e a remoção das definições movidas.

**A decisão de levar `CSS_BREAKOUT_PATTERN`/`isSafeCssString` junto — além dos três nomes que o achado
citava — está certa e verificada.** `isSafeMediaString` depende de `isSafeCssString` no ramo `https://`;
separá-los criaria um ciclo entre os dois arquivos. Confirmei o resultado: **`cssSafety.ts` não tem uma
única linha de `import`**, então não há ciclo possível, e a dependência corre num sentido só. É o
"melhora o desenho" que o achado pedia, não um contorno do limiar.

### Achado 2 — nenhuma ação, e é o correto

Não havia conserto de código: o veredito já registrou que não sobreviveu dano (o rebuild da plan-65
regerou o catálogo) e a causa raiz é o achado 13 do [[00-backlog]]. Não tocar foi a leitura certa do
escopo.

### O que verifiquei além dos dois achados

- **Escopo:** os quatro arquivos da §3.1 mais `cssSafety.ts`. Nada mais. Os dois únicos consumidores do
  módulo novo são `validation.ts` e `useDesignVariables.ts` — os dois já no escopo.
- **`auditor_coverage` → `[OK]`.** Arquivo novo em `src/core/` é o caso em que a regra 1:1 costuma
  morder; não mordeu, e o predicado é exercitado pela borda pública (`validateDesign`), que é a forma
  preferida pelo `padrao-escrita`.
- `npx tsc --noEmit -p .` → **0 erros**. `npm run deep-import:check` → verde.
- `npx vitest run src/core/Provider/utils src/core/Design/hooks` → **77/77 verde**.
- **Suíte completa — rodei eu, porque a correção não a repetiu** ([[00-prompt-revisor]] §7.1 item 8):
  **1497/1498**, com a única falha sendo `SarakPDFViewerImpl` **por timeout**, verde isolada. É o achado 6
  do [[00-backlog]]. Melhorou em relação à rodada anterior (eram 3).
- **`npm run audit` de volta ao baseline, auditor a auditor:** `hardcoded` 0, `ghostvars` 1,
  `typescript` 0, `coverage` OK, `arquitetura` OK, **`cleancode` OK**, `authcoupling` OK,
  `sectionpointers` OK, `composicaoatomica` 2, `contraste` 0/0. Os dois auditores não-zero
  (`ghostvars` e `composicaoatomica`) **batem exatamente** com `gates/baselines/audit-baseline.json`.
  A linha final *"AUDITORIA FALHOU: quebrou 2 regras estruturais"* é o baseline falando — é literalmente
  o que [[00-contexto]] §2 manda não confundir com regressão.

**Pode commitar.**

---

# 11. Síntese
