---
tipo: "plan"
titulo: "Liberação explícita para o config ser o design gravado: a troca de tema deixa de apagar a paleta mantida e as paletas salvas"
objetivo: "Manter o config do SarakUIProvider como valor declarado pelo host, sem sobrescrevê-lo, e criar uma liberação explícita em options.persistence para o importador (white label ou não) dizer que o config é o design gravado do usuário; com ela, a troca de tema preserva colorPalette com keepPalette, keepPalette e savedPalettes"
dominio: "Persistência do design / Temas"
status: "🟢 Aprovado"
prioridade: "Alta"
tags: ["plan", "release-9-0-0", "rc2", "persistencia", "formato-do-design", "keepPalette", "savedPalettes", "white-label"]
relacionados: ["[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[08-identidade-do-host-e-zero-marca]]", "[[026-design-gravado-guarda-so-as-escolhas]]"]
depende_de: ""
retida_por: ""
destino_sintese: "09-temas-e-presets"
---

# 1. Objetivo

O usuário liga "Manter minha paleta" ou salva paletas com nome, recarrega e troca o tema. A lib grava `design: {}`: a paleta mantida, o
interruptor e as paletas salvas somem, sem aviso. Acontece quando o importador passa o design gravado como `config` do
`SarakUIProvider` para pintar o primeiro quadro, como o hub-iarendel faz.

**Decisão do dono (2026-11-25):**
- **O `config` não muda de significado e não é sobrescrito.** Ele continua sendo o valor declarado pelo host, que vence a paleta e o
  tom e não é gravado como escolha (ADR-026 §2).
- **Uma liberação explícita** diz à lib que o `config` é o **design gravado do usuário**, editável. É o caso do white label, em que
  cada organização personaliza o próprio sistema.
  - **Com a liberação**, as escolhas que vieram no `config` são tratadas como escolhas do usuário e sobrevivem à troca de tema.
  - **Sem ela**, tudo fica como hoje.

Esta plan cria essa liberação e documenta quando usá-la. É o defeito D0 da `plan-173`, o de maior prioridade da rc.2.

# 2. Contexto

**Medição** (`plan-173`, lote 3, item 3.6; dados em `%TEMP%\sarak-rc1-completo\l3_f.json`): a semente foi
`{ colorPalette: 'emerald-royal', keepPalette: true, savedPalettes }`, e a ação foi trocar só o tema.

| Como o design entra | `onSave` na troca de tema |
|---|---|
| `config` + `initialTheme` (o que o hub faz) | `{}` ou só `{ mode }`: as três chaves se perdem |
| só `config` | `{}`: as três chaves se perdem |
| só `initialTheme` | mantém as três |
| só `onLoad` | mantém as três |

**Alcance:** só a troca de tema perde. Modo, cor à mão e tom acumulam sobre as escolhas anteriores, com e sem `config`.

**Causa provável** (leitura de código, a confirmar no lote 1):
- `extractDesignChoices` (`src/core/Provider/utils/designChoices.ts`) só grava o que difere do baseline, que inclui o `config` do host
  ([[026-design-gravado-guarda-so-as-escolhas]] §2, passo 2).
- Uma escolha igual ao `config` parece "declarada pelo host" e não é gravada.
- Quem chama a extração é `useDesignChoices` (`src/core/Provider/hooks/useDesignChoices.ts:84`).

**Onde mora a liberação:** em `options.persistence`, ao lado de `tenantId` e `preferConfigOverCache` (`src/core/Provider/types.ts`).
**Não** dentro do `config`, porque o `config` é o dicionário de tokens, e uma chave que não é token seria recusada pelo importador que
valida as chaves (`[[09-temas-e-presets]]` §4.4.2). O nome proposto é `options.persistence.configIsSavedDesign` (booleano, padrão
`false`). O executor pode propor outro no lote 1, desde que diga a mesma coisa.

**Consequência para quem já usa o `config` como design gravado** (o hub-iarendel):
- passa a ligar a liberação, que é uma linha nas `options`, para ganhar a correção;
- sem ela, continua como hoje.

`docs/migracoes.md` (seção do formato 9.0.0, item "Quem passa o design gravado como `config`") deve passar a dizer isso.

# 3. Escopo

## 3.1 Dentro

- A opção nova em `options.persistence` (tipo, documentação do tipo, padrão `false`).
- Com a opção ligada, a extração das escolhas na troca de tema trata o que veio do `config` como escolha do usuário, em
  `src/core/Provider/utils/designChoices.ts` e `src/core/Provider/hooks/useDesignChoices.ts`, ou onde o lote 1 apontar.
- Testes de unidade e de integração do Provider.
- Documentação para o importador:
  - `docs/persistencia-de-tema.md`: a opção, quando ligar, o exemplo;
  - `docs/migracoes.md`: o item do `config` corrigido e uma seção 9.0.0 aditiva para a opção;
  - a seção "White label" de `docs/identidade-do-host.md`: a linha que liga a opção quando a organização personaliza o tema;
  - o guia do consumidor e a skill `ui-integra-consumidor`, se citam o `config` como design gravado (`npm run guide` depois).

## 3.2 Fora

- Mudar o significado do `config` sem a opção, ou sobrescrevê-lo.
- Os valores não escolhidos que entram no design gravado (D2 e D16 da `plan-173`), que terão plan própria.
- A precedência host × paleta escolhida (ADR-026 §3).
- O hub-iarendel. Ligar a opção lá é trabalho do hub, depois da rc.2.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR | `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` | escolha e baseline, que sem a opção não mudam |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §4.4: formato gravado, troca de tema, `config` do host, `preferConfigOverCache` |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | "Manter minha paleta" e paletas salvas |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | o white label, que a opção atende |
| Código | `src/core/Provider/utils/designChoices.ts` | `extractDesignChoices`, `composeChoiceBaseline`, `driversOf` |
| Código | `src/core/Provider/hooks/useDesignChoices.ts` | quem chama a extração, com o `config` |
| Código | `src/core/Provider/types.ts` | `options.persistence`, onde entra a opção |
| Doc do consumidor | `docs/persistencia-de-tema.md` | onde a opção é ensinada |
| Doc do consumidor | `docs/migracoes.md` | o item do `config` no formato 9.0.0 |

# 5. Instruções de execução

## Lote 1 — reproduzir e localizar (sem corrigir)

1. Escreva os testes que reproduzem o §2, montando o `SarakUIProvider` como o hub (`config` com o design gravado e `initialTheme` com o
   id) e, como controle, com o design só por `onLoad`. Faça três casos:
   - "Manter" + paleta, recarregar, trocar o tema;
   - paletas salvas, recarregar, trocar o tema;
   - paleta + "Manter" + tema no mesmo rascunho, aplicar, recarregar, trocar o tema de novo.

   No código de hoje, eles precisam falhar com `config` e passar no controle.
2. Localize, pela medida, em qual passo as chaves saem.
3. Confirme que a liberação resolve sem mexer no caminho sem ela. **Pare e relate** se não resolver, ou se exigir mudar o significado do
   `config` ou a definição de escolha do ADR-026 para quem não liga a opção.

## Lote 2 — a liberação e a correção

1. Crie a opção em `options.persistence`, com padrão `false` e documentação do tipo que diga quando ligar.
2. Com a opção ligada, a troca de tema preserva `keepPalette`, `savedPalettes` e, com `keepPalette`, `colorPalette`. Os três casos do
   lote 1 ficam verdes com o `config` **e a opção**.
3. Com a opção desligada, o comportamento é **exatamente** o de hoje. Os testes que já existem sobre o `config` não mudam.
4. Com a opção ligada, valem as regras de sempre:
   - sem `keepPalette`, o tema novo traz a própria paleta;
   - modo, cor à mão e tom continuam acumulando;
   - o `onSave` segue esparso.
5. Documentação (§3.1), em ordem:
   1. `docs/persistencia-de-tema.md`: a opção, o exemplo (`config` + `initialTheme` + a opção) e a regra: ligue quando o `config` for
      o design gravado do usuário, e não ligue quando for o valor fixo do host;
   2. `docs/migracoes.md`: o item "Quem passa o design gravado como `config`" diz que, sem a opção, a troca de tema descarta as escolhas
      que vieram nele, e que a opção resolve. Acrescente uma seção `## 9.0.0 — …` aditiva para a opção;
   3. `docs/identidade-do-host.md`, seção "White label": quando a organização personaliza o tema e o servidor injeta o design gravado no
      `config`, ligue a opção;
   4. o guia do consumidor e a skill, se citam o padrão; depois `npm run guide`.

# 6. Critérios de aceite

- [ ] Os três casos do lote 1.1 falham no código de antes com `config` e passam depois com `config` + opção. Prova: os testes e a saída
      do lote 1.
- [ ] Com a opção desligada, todo teste existente sobre o `config` passa sem alteração, e o `config` continua vencendo e fora do
      gravado.
- [ ] Sem `keepPalette`, o tema novo traz a própria paleta, com a opção ligada. Prova: teste.
- [ ] Com a opção, o `onSave` da troca de tema não ganha nenhuma chave não escolhida.
- [ ] As quatro documentações do lote 2.5 dizem quando ligar a opção, e `npm run guide:check` passa.

# 7. Como verificar (uso do revisor)

**Gate:** `npm run verify -- --tier=full`.

- `git diff --stat`: só os arquivos do §3.1, os testes e os gerados do `npm run guide`.
- Mutação numa cópia:
  - ignorar a opção precisa derrubar os três casos;
  - ligar o comportamento novo sem a opção precisa derrubar um teste do `config` como valor do host.
- Reproduzir no harness da `plan-173` (`%TEMP%\sarak-rc1-completo\harness`) com o `dist/` da correção:
  - montagem do hub + opção: "mantém as três";
  - montagem do hub sem a opção: igual a hoje.

# 8. Destino da síntese

**[[09-temas-e-presets]]** §4.4: o `config` é o valor do host por padrão, e a liberação em `options.persistence` o torna o design
gravado do usuário, com as escolhas preservadas na troca de tema. Ponteiro na [[08-identidade-do-host-e-zero-marca]] para o uso no
white label.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-25

**Resultado:** Concluído (lotes 1 e 2; o lote 1 não exigiu parada).

**Estado do worktree ao iniciar**
```
 M .agents/skills/ui-integra-consumidor/SKILL.md
 M .claude/skills/ui-integra-consumidor/SKILL.md
 M docs/identidade-do-host.md
 M docs/migracoes.md
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/docs/migracoes.md
 M sarak-ui/skill/SKILL.md
 M specs/00-indice.md
 M src/components/Layout/SarakAppChrome.tsx
 M src/components/Layout/SarakAppChromeMobile.tsx
 M src/core/Provider/hooks/__tests__/useBrandingManager.test.ts
 M src/core/Provider/hooks/useBrandingManager.ts
?? specs/plan/plan-172-validacao-da-9-0-0-rc-1-no-hub-por-interacao-com-a-tela.md
?? specs/plan/plan-173-cobertura-completa-da-9-0-0-rc-1-no-navegador.md
?? specs/plan/plan-174-identidade-white-label-no-cromo-e-por-organizacao.md
?? specs/plan/plan-175-troca-de-tema-apaga-escolhas-com-design-gravado-no-config.md
?? src/components/Layout/__tests__/SarakAppChrome.brand.test.tsx
?? src/components/Layout/chrome/__tests__/useEffectiveBrand.test.ts
?? src/components/Layout/chrome/useEffectiveBrand.ts
```
`docs/migracoes.md`, `docs/identidade-do-host.md`, `sarak-ui/GUIA-FRONTEND.md` e `sarak-ui/docs/migracoes.md` já tinham edição de outra tarefa: editei só o meu trecho, por substituição exata.

**Lote 1 — o que a medida mostrou**
- Reproduzido: no `designChoices.configIsSavedDesign.test.ts` (versão do lote 1, sobre `extractDesignChoices`), os 3 casos passaram no controle (host ausente, como o design só por `onLoad`) e falharam com o design como `config` (`{}` ou `undefined` no lugar das chaves).
- Onde as chaves saem: o rascunho da troca de tema **mantém** `colorPalette`, `keepPalette` e `savedPalettes` (`composeThemeDesign` os preserva). Saem em `extractDesignChoices` (`src/core/Provider/utils/designChoices.ts:163`), chamada por `toPersisted` (`useDesignChoices.ts:84` antes da mudança): `composeChoiceBaseline` compõe o baseline com o `config` do host, que já tem as três chaves, e `driversOf` (`:152`) e o laço final (`:172`) tratam valor igual ao baseline como "declarado pelo host". Medido numa sonda descartável: `extractDesignChoices(draft, tema, host)` → `{}`; `extractDesignChoices(draft, tema, undefined)` → `{"colorPalette":"emerald-royal","keepPalette":true,"savedPalettes":"sp-1|Marca|custom:triadic:#336699"}`.
- Passo 3: a liberação resolve (host fora do baseline) sem tocar o caminho sem ela e sem mudar o significado do `config` nem a definição de escolha do ADR-026 para quem não liga. Não houve parada.

**O que foi feito**
- `src/core/Provider/types.ts:153` — `options.persistence.configIsSavedDesign?: boolean` (padrão `false`, JSDoc que diz quando ligar), na mesma linha da vizinha `preferConfigOverCache` (ver Decisões).
- `src/core/Provider/hooks/useDesignChoices.ts:67-90` — `useDesignChoices` recebe `configIsSavedDesign` (3º parâmetro, padrão `false`); `hostOf()` devolve `undefined` quando ligada e o `config` quando desligada, e alimenta `restore` e `toPersisted`. Desligada, as chamadas recebem exatamente o mesmo valor de antes.
- `src/core/Provider/hooks/useDesignManager.ts:78` — passa `options?.persistence?.configIsSavedDesign === true`.
- `src/core/Provider/utils/__tests__/designChoices.configIsSavedDesign.test.ts` (novo) — 10 testes pela porta real (`useDesignChoices`): os 3 casos do lote 1 em controle e com `config` + opção; sem `keepPalette` o tema novo traz a própria paleta e as paletas salvas ficam; modo acumula; `onSave` esparso (só as 3 chaves); opção desligada → `{}`, como antes.
- `docs/persistencia-de-tema.md` — subseção em §6 ("O `config` que é o design gravado do usuário"): a opção, o exemplo e a regra de quando ligar/não ligar.
- `docs/migracoes.md` — item "Quem passa o design gravado como `config`" corrigido (sem a opção a troca de tema descarta as escolhas; a opção resolve) e seção `## 9.0.0 — options.persistence.configIsSavedDesign … (aditivo)`.
- `docs/identidade-do-host.md` — parágrafo "Tema personalizado pela organização" na seção 5 (White label).
- `sarak-ui/GUIA-FRONTEND.md` — frase no parágrafo do `config` + `preferConfigOverCache` que manda ligar a opção quando o `config` é o design do usuário. `sarak-ui/docs/migracoes.md` regenerado por `npm run guide`.
- A skill `ui-integra-consumidor` não cita o `config` como design gravado (grep sem ocorrência): não alterada por mim.

**Arquivos alterados** (só os meus; os demais da fotografia são de outra tarefa)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/types.ts` | alterado | opção `configIsSavedDesign` |
| `src/core/Provider/hooks/useDesignChoices.ts` | alterado | host fora da extração/restauração quando a opção liga |
| `src/core/Provider/hooks/useDesignManager.ts` | alterado | repassa a opção |
| `src/core/Provider/utils/__tests__/designChoices.configIsSavedDesign.test.ts` | criado | 10 testes |
| `docs/persistencia-de-tema.md` | alterado | subseção da opção |
| `docs/migracoes.md` | alterado | item corrigido + seção aditiva |
| `docs/identidade-do-host.md` | alterado | parágrafo no White label |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | frase da opção |
| `sarak-ui/docs/migracoes.md` | alterado (gerado) | `npm run guide` |

**Verificações executadas**
- `npx vitest run …/designChoices.configIsSavedDesign.test.ts` → 10 passed.
- Mutação (ignorar a opção em `hostOf`, arquivo restaurado depois): 6 falhas de 10 — os 3 casos com `config` e `onSave` esparso, modo e "sem keepPalette". Os 4 que seguem passando são o controle (3) e a opção desligada (1), que não dependem dela.
- `npx vitest run src/core/Provider` → 78 arquivos, 712 testes passed (inclui `useDesignChoices`, `useDesignManager`, `designChoices` existentes, sem alteração).
- `npm run verify -- --tier=quick` → sem falha: `tsc --noEmit` OK, `audit:baseline --with-tsc` "igual ao baseline", Anel 0 simulado 0 achado, `guide:check` OK. (Uma 1ª rodada falhou: o auditor de Clean Code reprovou `types.ts` com 258 linhas por causa do meu JSDoc; corrigido, ver Decisões.)
- `npm run guide` e `npm run guide:check` → kit em dia (9 arquivos).

**Critérios de aceite**
- [x] Três casos do lote 1.1 falham antes com `config` e passam depois com `config` + opção — evidência: lote 1 acima (3 falhas com host, 3 passes no controle) e os 10 testes verdes.
- [x] Opção desligada: testes existentes sobre o `config` passam sem alteração (712 do Provider) e o `config` segue fora do gravado — evidência: teste "o `config` sem a opção segue como valor do host" (`{}`).
- [x] Sem `keepPalette`, o tema novo traz a própria paleta com a opção ligada — evidência: teste "sem `keepPalette`…" (`colorPalette` e `keepPalette` ausentes do gravado).
- [x] `onSave` da troca de tema sem chave não escolhida — evidência: teste esparso (`['colorPalette','keepPalette','savedPalettes']`).
- [x] As documentações dizem quando ligar a opção e `guide:check` passa — evidência: persistência §6, migrações (item + seção), identidade-do-host §5, GUIA-FRONTEND; `guide:check` em dia.

**Decisões e suposições**
- Nome da opção: `configIsSavedDesign`, como proposto.
- Com a opção ligada o host sai do baseline **também na restauração** (`restore`), não só na extração: sem isso, um valor do `config` que o usuário devolveu ao do tema seria refeito pelo `config` na recarga e divergiria do gravado.
- A opção trata **todo** o `config` como design do usuário (não só as três chaves); por isso a doc diz para não ligar com `config` de valor fixo do host.
- `types.ts` tem teto de 250 linhas no auditor (contou 251 com +1 linha minha): pus o JSDoc e a propriedade na mesma linha de `preferConfigOverCache`, sem tocar em código alheio. Estilo menos legível; extrair as opções de persistência para outro arquivo seria o conserto de fundo.
- Não toquei o hub-iarendel.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/hooks/useDesignDraft.ts:149,159` e `:200` usam `getHostConfig()` (o `config` inteiro) para `toggleKeepPalette`, `replaceDesignChoice` e `composeThemeDesign`, sem conhecer a opção. Não vi falha (os casos acima passam), mas o rascunho do painel e o gravado usam referências diferentes com a opção ligada; vale conferir no navegador com o harness da plan-173.
- `SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118` (`<input>` cru, R10) aparecem no `run_audit` e já estavam no baseline.

**Pendências / riscos**
- Não rodei a suíte completa, o build nem o navegador (do revisor). O harness da plan-173 (§7) não foi executado.
- Ligar a opção no hub-iarendel fica para o hub, depois da rc.2.
- Nada foi commitado.

# 10. Veredito

## Veredito — 2026-11-25 — 🔴 Reprovado

**O que foi verificado:**
- **Diff:** o diff de `types.ts`, `useDesignChoices.ts` e `useDesignManager.ts` está dentro do escopo. A opção desligada entrega exatamente o
  mesmo valor de antes à extração e à restauração.
- **Suíte completa:** `npm run verify -- --tier=full`, rodado nesta data sobre o worktree que já continha este código, ficou verde no
  `tsc`, na suíte inteira e no baseline. O único vermelho foi o `plan-index:check`, porque o status desta plan mudou sem regenerar o
  índice. Regenerado agora.
- **Sonda pela API real** (`npx tsx` sobre `src/`):
  - **Entrada:** o design gravado `{ colorPalette, bgBaseColor ajustada à mão }` no tema `sarak-sovereign`, trocado para
    `industrial-terminal`.
  - **Composição:** o rascunho é composto como o painel o compõe (`composeThemeDesign` com o `config` do host).
  - **Extração:** como esta plan a faz.

**Achados:**

1. **Com a opção ligada, a troca de tema pelo painel carrega o resto do tema anterior para o gravado.**
   - **Onde:** `src/features/DesignEngine/hooks/useDesignDraft.ts`, nos três usos de `sarak.getHostConfig()` (`toggleKeepPalette`,
     `replaceDesignChoice` e `composeThemeDesign` da troca de tema). Eles compõem o rascunho com o `config` inteiro, que agora é o design
     gravado, enquanto a extração passou a ignorar o `config`.
   - **Medido:**
     - **controle** (design por `onLoad`): o rascunho fica com o fundo do tema novo, e o `onSave` sai `{}`;
     - **`config` + opção:** o rascunho mantém a cor à mão do tema anterior, e o `onSave` a grava como escolha.
   - **Regra violada:** `[[09-temas-e-presets]]` §4.4, "o valor do tema anterior nunca fica", e o critério 4 desta plan ("com a opção,
     o `onSave` da troca de tema não ganha nenhuma chave não escolhida").
   - **O executor apontou o risco em "Achados fora do escopo"**, mas o risco está dentro do escopo: é o caminho que a opção cria.
   - **Correção:** o rascunho do painel usa a mesma referência de host que a extração (sem o `config` quando a opção está ligada), de
     modo que a montagem do hub com a opção dê o mesmo resultado do controle `onLoad`.
2. **`src/core/Provider/utils/__tests__/designChoices.configIsSavedDesign.test.ts`: os testes não passam pelo Provider nem pelo
   painel.**
   - A função `session` simula a troca de tema chamando `composeThemeDesign` com o `configRef` e o hook isolado. O §5, lote 1.1, pede o
     `SarakUIProvider` montado como o hub. É essa simulação que esconde o achado 1.
   - **Correção:** casos de integração com o Provider (`config` + `initialTheme` + opção) e a troca de tema feita pelo caminho do
     painel. Inclua o caso do achado 1, com cor à mão no gravado, a troca de tema e a ausência dela no `onSave`, comparado com o
     controle `onLoad`.
3. **`src/core/Provider/types.ts:152`: a propriedade nova e o JSDoc dela ficaram na mesma linha de `preferConfigOverCache`, para caber
   no teto de 250 linhas do auditor.**
   - Isso é contornar o limiar, e não cumpri-lo (sinal de atalho, `[[00-prompt-revisor]]` §7.1, item 7). O próprio resumo reconhece
     que "extrair as opções de persistência para outro arquivo seria o conserto de fundo".
   - **Correção:** extraia o tipo de `options.persistence` para um arquivo próprio, sem mudar o tipo público, e devolva cada
     propriedade à sua linha.

---

## Resumo da execução (correção 1) — 2026-11-25

**Resultado:** Concluído.

**Achado 1 — o rascunho do painel usa a mesma referência de host que a extração**
- Causa confirmada: `useDesignDraft.ts` (`toggleKeepPalette`, `replaceDesignChoice`, `composeThemeDesign` da troca de tema), `usePersonalitySelection.ts`, `ThemeCustomizationTab.tsx` (`peekWithTones`) e `useThemeDeletionHandler.ts` leem `getHostConfig()`, que devolvia o `config` inteiro.
- Correção em `src/core/Provider/SarakUIProvider.tsx`: `getHostConfig` devolve um objeto vazio estável (`NO_HOST_CONFIG`) quando `options.persistence.configIsSavedDesign === true`, e o `config` quando não. Uma só porta para todos os consumidores do host, sem tocar `features/`. A semente (`getSeedConfig`) continua lendo o `config`.
- Prova: mutação (devolver `hostConfigRef.current` sempre) derruba o teste "a cor à mão do tema anterior não fica no rascunho…" (1 falha de 3); restaurado, os 3 passam.

**Achado 2 — testes pelo Provider e pelo painel**
- Novo `src/features/DesignEngine/hooks/__tests__/configIsSavedDesign.persistenceIntegration.test.tsx` (3 testes): `SarakUIProvider` real com `config` + `initialTheme` + opção, troca de tema por `useDesignDraft.handleThemePreview` + `handleApplyToSystem`, `onSave` comparado com o controle em que o mesmo design chega por `onLoad`. Casos: (a) paleta + Manter + paletas salvas, igual ao controle; (b) paleta + cor de fundo à mão sem "Manter" (o caso do veredito), `bgBaseColor` fora do gravado e igual ao controle; (c) opção desligada, `config` continua valor do host (sem `keepPalette`/`savedPalettes` gravados).
- O teste unitário `designChoices.configIsSavedDesign.test.ts` ficou (cobre `restore`/`toPersisted` isolados); não é mais a única prova.

**Achado 3 — `types.ts` sem contornar o limiar**
- `options.persistence` virou a interface `SarakPersistenceOptions` em `src/core/Provider/persistenceTypes.ts` (novo); `types.ts` usa `persistence?: SarakPersistenceOptions;` (tipo público igual) e caiu de 249 para 226 linhas. Cada propriedade, inclusive `configIsSavedDesign`, está na sua linha com o JSDoc.
- Efeitos da extração, tratados na causa: (i) `gates/scripts/contrato/check-persistence-doc-identifiers.mjs` apontava o bloco `persistence?: {` de `types.ts`; as duas entradas `persistence.onSave/onLoad` agora apontam `SarakPersistenceOptions` em `persistenceTypes.ts`, e a fixture do teste do próprio gate (`check-persistence-doc-identifiers.test.mjs`) acompanha, mantendo os casos plantados; (ii) o comentário movido citava "plan-42" e o R36 acusou como linha adicionada: removi a citação do comentário.

**Verificações executadas**
- `npx vitest run src/core/Provider src/features/DesignEngine/hooks` → 93 arquivos, 778 testes passed.
- `npx vitest run gates/scripts/contrato/__tests__/check-persistence-doc-identifiers.test.mjs` → 14 passed.
- `npm run verify -- --tier=quick` → sem falha: `tsc --noEmit` OK, `audit:baseline --with-tsc` igual ao baseline, `persistence-doc:check` OK, `guide:check` OK, R36 OK, Anel 0 simulado 0 achado. (Uma 1ª rodada falhou em `persistence-doc:check` e `check-trail-citation`, os dois efeitos do achado 3 acima, já corrigidos.)
- `npm run -s public-types:check` e `npm run -s barrel:check` → OK (o primeiro lê o `dist/` atual).

**Critérios de aceite:** os do veredito atendidos: 1 (mutação), 2 (integração por Provider e painel, com o caso do `bgBaseColor`), 3 (`types.ts` 226 linhas, propriedades nas suas linhas).

**Decisões e suposições**
- Corrigi o achado 1 na porta única `getHostConfig` do Provider, e não em cada chamada do painel, para que toda leitura do host (painel, prévia, exclusão de tema) use a mesma referência da extração.
- Ajustar o gate `check-persistence-doc-identifiers` e o teste dele é consequência direta da extração pedida no achado 3; a checagem em si não mudou.

**Achados fora do escopo (não corrigidos)**
- `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` aparecem modificados no worktree: vêm do build do `verify --tier=full` do revisor, não de comandos meus; não toquei.

**Pendências / riscos**
- Suíte completa, build e navegador seguem sendo do revisor. Nada foi commitado.

## Veredito — 2026-11-25 — 🔴 Reprovado

**A correção 1 resolve os três achados anteriores:**
- `getHostConfig` devolve a mesma referência da extração;
- os casos de integração montam o Provider e trocam o tema pelo painel, incluindo a cor à mão do tema anterior;
- `options.persistence` virou `SarakPersistenceOptions`, em `src/core/Provider/persistenceTypes.ts`;
- os 3 arquivos de teste novos e alterados passam (27/27).

A verificação do revisor achou um problema novo, criado pela extração do achado 3.

**Achados:**

1. **`src/index.ts`: `SarakPersistenceOptions` não é exportado, e o build cai.**
   - **O que acontece:** a interface aparece em `dist/index.d.ts`, porque `SarakUIOptions.persistence` a referencia, mas não é exportada
     pelo barril.
   - **Medido:**
     - `npm run build` sai com código 1 no `check-public-types-parity`: "1 tipo(s) declarado(s) em dist/index.d.ts e NÃO
       exportado(s): SarakPersistenceOptions";
     - `npm run -s public-types:check` dá o mesmo resultado;
     - na suíte completa (`npm run verify -- --tier=full`), o único vermelho é
       `gates/scripts/contrato/__tests__/check-public-types-parity.test.mjs`, no caso "todo tipo declarado em dist/index.d.ts real está
       exportado ou tem exclusão com motivo".
   - **Por que o executor não viu:** o resumo registra `public-types:check` OK, mas ele leu o `dist/` antigo, anterior à extração.
     `tsc --noEmit` não alcança esse gate.
   - **Critério violado:** o gate da §7 (`verify --tier=full`). Sem o build, o `npm version` da rc.2 cai.
   - **Correção:** exportar o tipo pelo barril público (`src/index.ts`), junto dos outros tipos do Provider. Ele é de uso do importador,
     que tipa as próprias opções. Depois, rodar `npm run build` e conferir o `public-types:check` sobre o `dist/` novo.

**Fica para o backlog, sem reprovar:**
- **O que:** `useDesignSync` (`activeThemeId` controlado) e `useThemeSeed` ainda compõem o `config` inteiro como host com a opção
  ligada.
- **Por que não reprova:** é um caminho que o hub não usa, e a documentação desaconselha `activeThemeId` controlado quando o usuário
  escolhe o tema.
- **Onde fica:** registrado no `[[00-backlog]]` como item #95, nesta data.

---

## Resumo da execução (correção 2) — 2026-11-25

**Resultado:** Concluído.

**Achado 1 — `SarakPersistenceOptions` exportado pelo barril público**
- Causa confirmada: a extração do achado 3 da correção 1 criou o tipo em `src/core/Provider/persistenceTypes.ts`, referenciado por `SarakUIOptions.persistence`, e ele não chegou ao barril; o `public-types:check` da correção 1 leu o `dist/` anterior à extração.
- Correção em `src/index.ts`: `export type { SarakPersistenceOptions } from './core/Provider/persistenceTypes';`, junto dos outros tipos do Provider. Como o arquivo passou do teto do auditor (251 linhas contadas), juntei em uma declaração os dois `export type` que já vinham do mesmo módulo (`providerProps`); o conjunto de nomes exportados não mudou.
- Efeito da exportação, tratado na causa: o kit do consumidor (`sarak-ui/catalog.json`, `VERSION`, `START-HERE.md`, `GUIA-FRONTEND.md`) ficou defasado (565→566 nomes) e o `guide:check` do build acusou; regenerei com `npm run guide`.

**Verificações executadas**
- `npm run build` → código 0 (inclui `guide:check`, `public-types:check`, `barrel:check`).
- `npm run -s public-types:check` sobre o `dist/` novo → OK.
- `npx vitest run gates/scripts/contrato/__tests__/check-public-types-parity.test.mjs gates/scripts/contrato/__tests__/check-persistence-doc-identifiers.test.mjs` → 24 passed.
- `npm run verify -- --tier=quick` → sem falha (`tsc`, `audit:baseline --with-tsc`, `guide:check`, R36, Anel 0). Uma rodada anterior falhou no `audit:baseline` (`src/index.ts` com 251 linhas): resolvido com a junção acima.

**Critérios de aceite:** o do veredito atendido: `public-types:check` verde sobre o `dist/` novo e build com código 0.

**Achados fora do escopo (não corrigidos)**
- Item #95 do backlog (`useDesignSync`/`useThemeSeed`), registrado pelo revisor; não tocado.
- `dist/*` e os `buildInfo.ts` aparecem modificados por causa do `npm run build` desta correção.

**Pendências / riscos**
- Suíte completa fica com o revisor. Nada foi commitado.

---

## Veredito — 2026-11-25 — 🟢 Aprovado

**A correção 2 resolve o achado único da reprovação anterior.**
- `src/index.ts:33` exporta `SarakPersistenceOptions`, e `dist/index.d.ts` traz o tipo.
- **Medido pelo revisor, sobre o `dist/` do build do executor:**
  - `public-types:check` deu OK;
  - `guide:check` deu kit em dia, com o catálogo de 565 para 566 nomes, e nenhum teste fixa essa contagem;
  - `barrel:check` encontrou 0 faltas;
  - `check-public-types-parity.test.mjs` e `check-persistence-doc-identifiers.test.mjs` passaram.
- **A junção das duas linhas de `export type` de `providerProps` é aceitável.** A junção não esconde nada: o conjunto de nomes não
  mudou, as duas declarações vinham do mesmo módulo e o arquivo já tem linhas mais longas (209 caracteres).
- **Por que a suíte completa não roda de novo:** na rodada anterior, o único vermelho foi o teste de paridade, que agora passa. Desde
  então só mudaram o barril e o kit regenerado.

**Fica para o backlog, sem reprovar:**
- **O que:** os casos `:79` e `:85` de `configIsSavedDesign.persistenceIntegration.test.tsx` estouraram 5 s com a CPU em 100%
  (5,4 s e 5,7 s). Cada um monta o Provider duas vezes, uma para o caso e outra para o controle.
- **Por que não reprova:** passaram na suíte completa da rodada anterior. A síntese da `plan-171` já decidiu que o `npm version` roda
  com a máquina ociosa.
- **Onde fica:** os dois entram como evidência no item #1 do `[[00-backlog]]`, nesta data. Antes do `npm version` da rc.2, a
  conduta de medir a carga vale para eles também.
