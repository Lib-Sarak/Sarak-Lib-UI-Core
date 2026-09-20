---
tipo: "plan"
titulo: "Entregar caixa de seleção e botão de opção corretos nos dois modos de valor"
objetivo: "SarakCheckbox e SarakRadio funcionam controlados e não controlados, com a pele visual sempre igual ao valor efetivo, sem hardcode de cor e sem regressão na suíte"
dominio: "Sarak-Lib-UI-Core / Átomos de entrada"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "atomos", "formulario", "acessibilidade", "correcao"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[specs/00-regras-e-invariantes]]", "[[specs/11-testes-e-cobertura]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

`SarakCheckbox` e `SarakRadio` entregues e corretos: quem chama pode deixá-los governar o próprio valor ou
governá-lo de fora, e nos dois casos o desenho na tela é o valor efetivo; nenhuma cor nasce fora do
dicionário de tokens; e a suíte inteira volta ao verde.

# 2. Contexto

Os dois componentes **já existem no worktree, não commitados**, entregues por duas rodadas de via direta.
A segunda rodada foi reprovada e a regra manda virar plan ([[00-prompt-revisor]] §6). O que a verificação do
revisor mediu, para não ser reinvestigado:

- **O modo não controlado funciona.** Clicar marca, a marca aparece, e dois rádios de mesmo `name` se
  excluem. Medido por sonda em 2026-09-19.
- **O modo controlado está quebrado, em silêncio.** Com `checked` vindo de quem chama, o `<input>` fica
  marcado mas a pele visual **não**: a marca é decidida por um `useState` interno que só o `onChange`
  interno atualiza — e quem controla de fora passa o próprio `onChange`, que substitui o interno pelo
  espalhamento de props. Medido: `inputChecked: true, marcaVisivel: false`. O `aria-checked` erra junto.
  **Isto é bloqueante para a seleção de linhas da tabela, que é controlada.**
- **A extração de `useStructuralStyles` quebrou quatro chamadores.** `getResponsiveSpacingStyles` e
  `getResponsiveStackStyles` saíram para `useResponsiveStyles.ts` e ninguém atualizou quem as chama:
  `ExpandableCard.tsx:36-37`, `SarakCardGrid.tsx:89,92`, `SarakCatalogGrid.tsx:59,65` e o teste
  `hooks/__tests__/useStructuralStyles.test.ts:85`. Resultado: `TypeError: … is not a function` em
  renderização real. **A suíte inteira está em 6 arquivos e 7 testes vermelhos** (medido pelo revisor:
  379 arquivos, 1995 testes).
- **Os dois átomos violam R35** e não estão declarados: `check-class-merge` acusa
  `SarakCheckbox.tsx` e `SarakRadio.tsx` como não declarados na allowlist. Eles concatenam `className` por
  template literal em vez de usar `mergeSarakClasses`.
- **O que já está certo, e não se mexe:** o barril (84 componentes, 0 faltas), o catálogo, o kit do
  consumidor, o kit do mantenedor, `auditor_hardcoded` em 0/0, `auditor_ghostvars` no baseline e o
  `audit:baseline` sem regressão. O marcador `@sarak-encapsula input` tem precedente legítimo nos irmãos.
- **Os tokens que faltavam existem** — foi só não terem sido procurados: `--sarak-checkbox-active`
  (`schema/switches.ts:31`), `--sarak-switch-thumb` (`:22`) e `--sarak-focus-width`
  (`schema/engineering.ts:12`). **Nenhum token novo é necessário nesta plan.**

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/atomic/Inputs/SarakCheckbox.tsx` · `SarakRadio.tsx` e os testes 1:1 ao lado.
- `src/components/atomic/hooks/useAtomicStyles.ts` · `useStructuralStyles.ts` · `useResponsiveStyles.ts` e
  os testes desses hooks.
- Os chamadores quebrados pela extração: `src/components/atomic/Cards/ExpandableCard.tsx` ·
  `src/components/atomic/Templates/SarakCardGrid.tsx` · `SarakCatalogGrid.tsx` — **e só a linha da chamada**.
- `gates/allowlists/classMergeExclusions.mjs`, se a rota escolhida na §5 passo 4 for a declaração.
- `src/index.ts` · `src/components/atomic/Inputs/index.ts`.
- Artefatos **gerados**, por regeneração e nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Criar token de design novo.** Os três de que você precisa já existem (§2).
- `SarakSwitch` e qualquer outro átomo — inclusive para "alinhar o padrão".
- `specs/**`, que é do revisor.
- Qualquer outra mudança nos três chamadores além da linha que chama a função extraída.
- O consumidor (o ERP).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` | §6.1 composição atômica · **§6.1.1 e R35: o `className` de quem chama vence, por `mergeSarakClasses`** |
| Spec fixa | `specs/00-regras-e-invariantes.md` | R35 (merge de classe) e o teto de 250 linhas |
| Spec fixa | `specs/01-gates-e-baseline.md` | como ler cada gate, e o baseline do `audit`, que não é zero |
| Spec fixa | `specs/11-testes-e-cobertura.md` | o teste 1:1 obrigatório e o que "suíte verde" significa |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` · `ui-arquitetura-design` · `test-unitario` | sempre / estilo por hook / testes |
| Código | `src/components/atomic/hooks/mergeSarakClasses.ts` | a porta única do merge nesta base |
| Código | `src/components/atomic/Buttons/SarakButton.tsx` | o átomo já convertido para `mergeSarakClasses` — é o molde |
| Código | `src/core/Design/schema/switches.ts` · `schema/engineering.ts` | os tokens que você vai usar, com os nomes reais |

# 5. Instruções de execução

1. **Conserte os chamadores da extração primeiro**, e rode a suíte para vê-la verde antes de seguir: os
   quatro pontos citados na §2 passam a obter as duas funções de `useResponsiveStyles`. O teste que hoje as
   exercita por `useStructuralStyles` muda de arquivo junto com elas. A extração **fica** — o teto de 250
   linhas é real.

2. **Implemente o contrato de valor nos dois átomos**, que é o padrão do React e vale para os dois:
   - quem passa `checked` **governa**: a pele, o `aria-checked` e o `<input>` seguem esse valor, e o
     componente não guarda estado próprio;
   - quem não passa `checked` deixa o componente guardar o valor, semeado por `defaultChecked`;
   - o `onChange` de quem chama é **sempre** chamado, nos dois modos, e nunca substitui o comportamento
     interno por espalhamento de props;
   - nunca passe `checked` e `defaultChecked` ao mesmo `<input>`.

3. **Tire as três cores fixas**, usando os tokens que já existem:
   - marca do checkbox e ponto do rádio (`text-white`, `bg-white`): `var(--sarak-switch-thumb)`;
   - anel de foco: cor de `--sarak-input-focus-border-color` e largura de `--sarak-focus-width`;
   - com isso, **o marcador `sarak-allow-hardcode` sai dos dois arquivos** — ele passou a ser falso.

4. **Resolva o R35**: converta os dois átomos para `mergeSarakClasses`, como `SarakButton` fez. A allowlist
   existe para dívida herdada, e código que nasce hoje não nasce dentro dela. Se a conversão se mostrar
   impossível, **declare na allowlist com motivo escrito** e explique no resumo o que a impediu.

5. **Cubra com teste** o que a verificação pegou, um caso por defeito: pele e `aria-checked` corretos no
   modo controlado; pele e `aria-checked` corretos no modo não controlado depois do clique; `onChange` de
   quem chama recebido nos dois modos; dois rádios de mesmo `name` se excluindo; indeterminado sem aviso de
   React no console.

6. **Rode e leia, na ordem:** `npx vitest run` inteiro · `npm run audit:baseline` · `npm run barrel:check`,
   `catalog:check`, `guide:check`, `dev-kit:check`, regenerando o que estiver defasado.

# 6. Critérios de aceite

- [ ] Modo controlado: com `checked` de fora, a pele visual, o `aria-checked` e o `<input>` concordam —
      com teste, e sem aviso de React no console.
- [ ] Modo não controlado: clicar marca e desmarca, a pele acompanha, e dois rádios de mesmo `name` se
      excluem — com teste.
- [ ] O `onChange` de quem chama é chamado nos dois modos — com teste.
- [ ] Nenhuma cor fixa nos dois arquivos, e **nenhum** marcador `sarak-allow-hardcode` neles.
- [ ] `check-class-merge` verde: os dois convertidos para `mergeSarakClasses`, ou declarados com motivo.
- [ ] Os quatro chamadores da extração funcionam, e o teste das duas funções vive junto do hook que as
      abriga.
- [ ] `npx vitest run` inteiro **verde**. Falha em arquivo não tocado é rodada isolada antes de ser
      atribuída à intermitência ([[00-backlog]] #5 e #12), e o resumo mostra as duas saídas.
- [ ] `npm run audit:baseline` sem regressão; `barrel`, `catalog`, `guide` e `dev-kit` em dia.
- [ ] O resumo relata número real de arquivos e de testes, e não afirma verde onde há vermelho.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — R35 já tem gate (`check-class-merge`), e o contrato de valor é comportamento deste
módulo, então quem o guarda é o teste dos dois átomos.

- `git status` + `git diff --stat` → só os caminhos da §3.1.
- Sonda própria do revisor, refeita: controlado (`checked` de fora) e não controlado, medindo a presença da
  marca no DOM, não só o `input.checked`.
- **Mutação:** fazer a pele voltar a ler o estado interno no modo controlado → o teste novo cai.
- `grep -n "sarak-allow-hardcode\|text-white\|bg-white\|rgba(" ` nos dois arquivos → nada.
- `npx vitest run` inteiro, lido na saída completa, e comparado com a medição da §2 (379 arquivos,
  1995 testes, 7 vermelhos).
- `npm run audit:baseline` e os quatro `*:check`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

Uma linha no capítulo dos átomos: **o contrato de valor dos átomos de escolha** — `checked` de quem chama
governa, `defaultChecked` semeia o valor próprio, e a pele visual é sempre o valor efetivo. Vale registrar
porque o `SarakSwitch` **não** segue isso (é controlado sempre), e a diferença dentro da mesma família é
exatamente o tipo de coisa que o consumidor descobre do jeito difícil.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-09-19

**Resultado:** Concluído com pendências — a suíte cheia **não** fechou em zero: 2 testes de arquivos que não toquei estouraram o timeout sob a carga da própria suíte (ambos passam isolados; saídas abaixo). Todo o resto dos critérios está atendido.

**O que foi feito**
- Chamadores da extração consertados — `ExpandableCard.tsx:9,35` · `SarakCardGrid.tsx:22,90-91` · `SarakCatalogGrid.tsx:15,60-61`: passam a obter `getResponsiveSpacingStyles`/`getResponsiveStackStyles` de `useResponsiveStyles`. A extração ficou; `useStructuralStyles.ts` segue em 236 linhas.
- O teste de `getResponsiveStackStyles` (`md`/`lg` × `BREAKPOINT_*`) saiu de `useStructuralStyles.test.ts` e foi para `useResponsiveStyles.test.ts`, junto do hook que abriga a função.
- Contrato de valor nos dois átomos — `SarakCheckbox.tsx:56-57` e `SarakRadio.tsx:44-45`: `isControlled = checked !== undefined`; a pele, o `aria-checked` e o `<input>` seguem `checked` quando controlado (sem estado próprio), e `ownChecked` semeado por `defaultChecked` quando não. O `<input>` recebe `checked` **ou** `defaultChecked`, nunca os dois. O `onChange` de quem chama é repassado por `handleChange` em vez de vir do espalhamento de props.
- Rádio não controlado: `SarakRadio.tsx:50-61` escuta o `change` da raiz (`getRootNode()`) para reler o valor do `<input>` quando um irmão do mesmo `name` é marcado — o navegador desmarca os irmãos **sem** disparar `change` neles.
- Cores fixas removidas — marca do check/traço e ponto do rádio usam `getChoiceMarkColor()` (`var(--sarak-switch-thumb, #ffffff)`, `useAtomicStyles.ts`); o anel de foco vem de `getChoiceFocusRing` (`--sarak-focus-width` + `--sarak-input-focus-border-color`), aplicado dentro de `getCheckboxStyles(…, focused)` e `getRadioStyles(…, focused)`. Os dois marcadores `sarak-allow-hardcode` saíram dos arquivos.
- R35 resolvido pela conversão, sem tocar na allowlist: `mergeSarakClasses(<default do átomo>, className)` nos dois átomos, `className` por último.
- Testes novos: 20 casos em `SarakCheckbox.test.tsx`/`SarakRadio.test.tsx` (um por defeito da §2 — ver Critérios) e 3 em `useAtomicStyles.test.ts` (anel de foco, cor da marca, fundo ativo).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Inputs/SarakCheckbox.tsx` | criado (não rastreado; refeito sobre a rodada anterior) | contrato de valor, tokens, `mergeSarakClasses`, `onFocus`/`onBlur` repassados |
| `src/components/atomic/Inputs/SarakRadio.tsx` | criado (idem) | idem + sincronização de grupo pela raiz |
| `src/components/atomic/Inputs/__tests__/SarakCheckbox.test.tsx` | criado (idem) | testes anteriores mantidos + `contrato de valor` e `cor e classe` |
| `src/components/atomic/Inputs/__tests__/SarakRadio.test.tsx` | criado (idem) | idem |
| `src/components/atomic/hooks/useAtomicStyles.ts` | alterado | `getChoiceMarkColor`, `getChoiceFocusRing`, parâmetro `focused` em checkbox/radio |
| `src/components/atomic/hooks/__tests__/useAtomicStyles.test.ts` | alterado | +3 testes dos helpers de escolha |
| `src/components/atomic/hooks/__tests__/useStructuralStyles.test.ts` | alterado | −1 teste (movido para o hook novo) |
| `src/components/atomic/hooks/__tests__/useResponsiveStyles.test.ts` | criado (rodada anterior) | +1 teste (o movido) e import de `BREAKPOINT_*` |
| `src/components/atomic/Cards/ExpandableCard.tsx` · `Templates/SarakCardGrid.tsx` · `Templates/SarakCatalogGrid.tsx` | alterado | só import + linha da chamada |
| `specs/plan/plan-83-…md` | alterado | `status` e este resumo |

O restante do worktree (`docs/component-catalog.*`, `sarak-dev/`, `sarak-ui/`, `src/index.ts`, `Inputs/index.ts`, `useStructuralStyles.ts`, `specs/00-indice.md`, `useResponsiveStyles.ts`) já vinha das rodadas anteriores; não os toquei.

**Verificações executadas**
- `npx vitest run` após o passo 1 → 379 arquivos, 1995 testes: **4 arquivos / 6 testes falharam** (`check-class-merge` = R35, próprio; `generate-token-types.check`, `useDesignDraft.persistenceIntegration` ×3, `SarakPDFViewerImpl` = não tocados). Antes: 6 arquivos / 7 testes.
- Isoladas as 3 não tocadas → `3 passed (3) · 8 passed (8)`.
- `npx vitest run` final → **379 arquivos, 2018 testes: 2 falharam, 2016 passaram.** Falhas: `generate-token-types.check.test.mjs` "libera o artefato em dia com a fonte" (*timed out in 15000ms*) e `SarakPDFViewerImpl.test.tsx` (*timed out in 5000ms*). Isoladas → `2 passed (2) · 5 passed (5)`. Nota: na 1ª rodada falhou outro teste do mesmo `generate-token-types.check` e três de `useDesignDraft`, que agora passaram — o conjunto que estoura muda de rodada em rodada, assinatura de carga, não de defeito.
- `npx vitest run` nos 3 arquivos de hooks → 21 passed. Nos 2 átomos → 36 passed.
- Mutação 1 (`isChecked = ownChecked`, pele volta a ler o estado interno) → **7 falham** (controlado nos dois átomos, marca com token, e 3 do rádio). Mutação 2, isolada (rádio sem `addEventListener('change')`) → **3 falham** (clicar marca, exclusão input+pele, `name` diferente). Arquivos restaurados e conferidos com `diff` (idênticos).
- `npm run class-merge:check` → `[OK] … (28 declarados, com motivo)` — a allowlist não foi editada.
- `grep -n "sarak-allow-hardcode\|text-white\|bg-white\|rgba("` nos dois átomos → sem saída (exit 1).
- `npm run audit:baseline` → `igual ao baseline de 2026-08-11 — nenhuma regressão.`
- `barrel:check` → 84 componentes, 0 faltas · `catalog:check` → em dia · `guide:check` → em dia (6 arquivos) · `dev-kit:check` → em dia (3 arquivos, 0 ponteiros mortos). Nada precisou ser regenerado.

**Critérios de aceite**
- [x] Modo controlado: pele, `aria-checked` e `<input>` concordam, sem aviso de React — `SarakCheckbox.test.tsx` "controlado: pele, aria-checked e input seguem…" e "clicar sem quem chama atualizar… NÃO muda a pele"; `SarakRadio.test.tsx` idem; "controlado sem onChange não gera aviso" (`console.error` sem chamadas).
- [x] Modo não controlado: marca e desmarca, pele acompanha, dois rádios de mesmo `name` se excluem — testes "não controlado: …" nos dois arquivos; a exclusão é medida por presença de marca no DOM (filho da pele), não só por `input.checked`.
- [x] `onChange` de quem chama recebido nos dois modos — "o onChange de quem chama é recebido nos dois modos" nos dois arquivos.
- [x] Nenhuma cor fixa e nenhum `sarak-allow-hardcode` — grep vazio; testes "a marca/o ponto usa o token do thumb".
- [x] `check-class-merge` verde por conversão para `mergeSarakClasses` — saída acima; teste "a className de quem chama vence o default (R35)".
- [x] Quatro chamadores funcionam e o teste das funções vive junto do hook — `useResponsiveStyles.test.ts`; nenhum `TypeError` na suíte final.
- [ ] `npx vitest run` inteiro verde — **não atendido literalmente**: 2016/2018, com 2 timeouts sob carga em arquivos não tocados, verdes isolados (as duas saídas estão acima, como a plan pede).
- [x] `audit:baseline` sem regressão; `barrel`/`catalog`/`guide`/`dev-kit` em dia — saídas acima.
- [x] Números reais relatados (379 arquivos; 2018 testes; 2 vermelhos) — acima.

**Decisões e suposições**
- **Sincronização de grupo por listener na raiz.** A §2 registra que "dois rádios de mesmo `name` se excluem" no modo não controlado. Isso vale para o `<input>`; para a **pele**, o irmão desmarcado não recebe `change`, então um estado interno atualizado só pelo `onChange` deixaria o ponto visível. Não rodei o código anterior para observar o ponto preso — concluí por construção do DOM e a mutação 2 mostra que o teste exige o listener. Escolhi a raiz (`getRootNode()`) em vez de `document` para funcionar dentro de shadow root (modo embarcado); **não testei** dentro de um shadow root real.
- **`onFocus`/`onBlur` também repassados.** A plan só nomeia `onChange`, mas o espalhamento de props sobrescrevia igualmente os handlers internos de foco (anel de foco mudo quando quem chama passa `onFocus`). Mesmo defeito, mesmos arquivos: corrigi e cobri com teste.
- **`handleChange` sempre presente no rádio**, mesmo só repassando `onChange`, para `checked` sem `onChange` não disparar o aviso do React.
- **Import nos três chamadores.** A §3.1 diz "só a linha da chamada"; a chamada exige o import de `useResponsiveStyles`, então há uma linha de import a mais em cada um (em `ExpandableCard.tsx` o import trocou de lugar, pois `useStructuralStyles` não era mais usado ali).
- **Anel de foco dentro de `getCheckboxStyles`/`getRadioStyles`** (parâmetro novo, opcional) em vez de helper solto: mantém o `boxShadow` no mesmo lugar dos demais estilos do controle; sem foco emite `'none'`, igual ao comportamento anterior. Fallbacks: `2px` (default do token, igual a `SarakLink.tsx:74`) e a cor primária.
- **Resumo na §9**, onde o modelo da plan o reserva, sem remover nada (o comentário do modelo ficou).
- **Testes:** reescrevi por inteiro os dois arquivos de teste de átomos (não rastreados, da rodada anterior), preservando os casos existentes; só tirei um `rerender` não usado do teste "agrupa múltiplos radios". Um `console.warn` do próprio `useSarakUIOptional` ("sem SarakUIProvider") existe em todo render sem Provider, então o teste de aviso mede só `console.error`, por onde o React avisa.
- Usei `/tmp` para dois backups da mutação e os apaguei; `/tmp/index.ts.bak` já existia e não é meu.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Templates/SarakCatalogGrid.tsx:16` — importa `twMerge` de `tailwind-merge` direto, contra R35 ("porta única `mergeSarakClasses`"); o gate não vê (limite declarado dele).
- `src/components/atomic/hooks/useAtomicStyles.ts` (`getSwitchStyles`, linhas 138 e 147-148; `getInputStyles`, linha 58, e o trecho `neumorphism` em torno das linhas 106-113) — valores CSS com parêntese sobrando (`'var(--color-theme-card, rgba(255,255,255,0.1)))'`) e `boxShadow` que é só `var(...)`; parecem inválidos para o navegador. Pré-existente.
- `useStructuralStyles.test.ts:14-15` e o `useAtomicStyles.test.ts` original carregam `// TODO: Escrever testes comportamentais` de antes desta execução.
- Intermitência sob carga: `generate-token-types.check.test.mjs` (teto de 15 s), `SarakPDFViewerImpl.test.tsx` (5 s) e `useDesignDraft.persistenceIntegration.test.tsx` estouram na suíte cheia e passam isolados — é o padrão do [[00-backlog]] #5/#12.
- A §4 da plan cita `specs/00-regras-e-invariantes.md` e `arquitetura/03-…`; no worktree ficam em `specs/specs/…` e `specs/arquitetura/…`.

**Pendências / riscos**
- Suíte cheia com 2 timeouts (acima); o revisor deve reexecutá-la e, se estourar, isolar antes de atribuir.
- Nada foi medido em navegador real: anel de foco, marca e contraste foram conferidos por atributos `style`/DOM em jsdom, não por pixel renderizado. O tema pode dar contraste ruim entre `--sarak-switch-thumb` e `--sarak-checkbox-active` (dois tokens independentes) — não avaliei valores de tema.
- O modo controlado sem `onChange` vira um controle somente-leitura silencioso (o clique não muda nada). É o padrão do React, mas o átomo não avisa.
- Nenhum arquivo foi commitado.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-09-19 — 🟢 Aprovado

**Verificado pelo revisor, com medição própria — não pela leitura do resumo.**

- **Contrato de valor, por sonda independente** (criada, executada e apagada; `git status` conferido):
  - controlado: `input.checked true`, marca presente, `aria-checked="true"`;
  - controlado com `checked={false}`: o clique **não** muda a pele;
  - não controlado: o clique marca e o seguinte desmarca, com a pele acompanhando nos dois;
  - rádio, por seletor que isola o ponto como filho da pele: depois de clicar em `a`, `{a: ponto, b: sem
    ponto}`; depois de clicar em `b`, o inverso, e os `<input>` concordam. No modo controlado, o grupo
    segue quem chama;
  - `onChange` de quem chama recebido **uma vez em cada modo**, e `console.error` sem nenhuma chamada —
    nenhum aviso do React.
- **Mutação do revisor:** trocar `isChecked` para ler só o estado interno derruba **2 testes**
  ("controlado: pele, aria-checked e input seguem o `checked` de quem chama" e "a marca usa o token do
  thumb"). Arquivo restaurado e conferido por `md5sum -c`: idêntico.
- **Suíte inteira, execução do revisor:** `379 arquivos, 2018 testes, 0 falhas` (383,8 s). Os dois timeouts
  relatados no resumo **não se repetiram** — confirma a leitura do executor de que era carga, não defeito,
  e fecha a única pendência declarada. O critério de aceite da suíte está atendido.
- **Gates:** `class-merge:check` OK com a allowlist **não editada** (28 declarados, os mesmos de antes) ·
  `audit:baseline` igual ao baseline de 2026-08-11 · `barrel:check` 84/0 · `catalog:check`, `guide:check` e
  `dev-kit:check` em dia, sem precisar regenerar · `trail-citation:check` OK.
- **Escopo:** o diff dos três chamadores é de 4 linhas cada — import mais a linha da chamada, como a §3.1
  permitia. Nada fora da §3.1. Nenhuma cor fixa, nenhum `sarak-allow-hardcode` e nenhuma citação de plan nos
  arquivos da entrega.
- **Resumo × diff:** confere linha a linha nos pontos verificados, inclusive as decisões declaradas
  (`onFocus`/`onBlur` repassados, `handleChange` sempre presente no rádio, import a mais nos chamadores).

**Ressalvas que não reprovam, e o destino de cada uma:** os dois achados fora do escopo do executor
desceram para o [[00-backlog]] (#27 e #28). O `--text-muted` com reserva em hex nos rótulos é o idioma
herdado do `SarakSwitch` e o `auditor_hardcoded` o conta em 0 — fica como está. O rádio dentro de shadow
root não foi exercitado; o modo embarcado desta lib escopa CSS por classe, não por shadow root, então não
há caso real hoje.

**Pode commitar.**

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese, imediatamente antes da remoção da plan. -->
