---
tipo: "spec"
titulo: "Dívida conhecida — o registro dos defeitos medidos e ainda não corrigidos"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida técnica"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "divida-tecnica", "achados", "auditoria", "roteamento"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[00-contexto]]"]
---

# 1. Propósito

O registro **único** dos defeitos que já foram **verificados no código** e ainda não corrigidos. Um agente que
leia esta spec para de "descobrir" o que já está catalogado — e para de propor conserto para o que já foi
decidido manter.

Quatro coisas que este documento **não** é:

- **Não é lista de desejos.** Todo item tem `arquivo:linha` e exposição medida. Suspeita sem medição não entra.
- **Não é backlog de prioridade.** A ordem de execução vive em [[00-indice]]; aqui a ordem é a de descoberta.
- **Não é histórico.** Item fechado **sai** da §3 (o histórico é o `git` e o veredito da plan que o fechou).
- **Não é a fila de gates a construir.** Verificação que nunca existiu **não é dívida** — é implementação
  posterior, e mora na §4. A §3 é só código que viola regra **já formada**.

**Como ler:** §3 é a dívida. §4 é o trabalho de gate que ainda não teve a sua vez. §5 e §6 guardam os números
que saíram, para que nenhum seja reaproveitado.

> **Regra de manutenção:** toda plan que fecha um achado **remove a linha dele aqui**, na mesma execução. Achado
> que sobrevive à sua própria correção vira ruído, e ruído faz a spec inteira perder credibilidade.

---

# 2. Origem e numeração

Os achados 1–31 vêm da campanha de reescrita da base de specs (2026-07-28 → 2026-08-01), em quatro rodadas de
auditoria. **A numeração é definitiva e nunca reaproveitada** — achado fechado não devolve o número.

Eles não são erros das specs antigas: são **defeitos e ambiguidades do módulo**, encontrados porque alguém foi
conferir no código em vez de copiar do material anterior.

**Estado em 2026-08-01, após a triagem (plan-03):** 31 numerados · **10 fechados** (§6) · **2 aceitos como
característica** (§5) · **5 movidos para implementação posterior** (§4) · **14 abertos** (§3). Soma: 31.

> ⚠️ **Correção de contagem.** Até esta triagem o cabeçalho declarava *"9 fechados · 22 abertos"*. Contado item
> a item: eram **8 fechados e 23 abertos** (8 + 23 = 31). Os dois números estavam errados; a numeração, não.

**Estado em 2026-08-07, após a síntese das plans 06/07/09/12 (`/spec-atualizar`):** as plans de conserto e de
construção de gate fecharam 12 achados de código e 2 gates de "implementação posterior" (§4.1), e mediram um
achado novo. **32 numerados** (o 32 é novo) · **24 fechados** (§6) · **2 aceitos como característica** (§5) ·
**3 em implementação posterior** (§4) · **3 abertos** (§3). Soma: 32.

---

# 3. Achados ABERTOS — a dívida de verdade

> **Reduzida de 14 para 3 em 2026-08-07** (síntese das plans 06/07/09/12): 12 achados fecharam por conserto de
> código, e 1 achado novo (32) entrou, medido de passagem pela `plan-12`. O detalhe de cada fechamento está em
> §6.
>
> **De 3 para 2 em 2026-08-08:** o achado **29** fechou a metade que faltava e saiu para a §6.
>
> **De 2 para 1 em 2026-08-09:** o achado **32** fechou e saiu para a §6 — a prosa deixou de citar um total.
>
> **De 1 para 4 em 2026-08-10:** o **17** fechou com a `plan-19` (o `playwright.config.ts` era órfão e foi
> deletado) e **quatro achados novos foram numerados** — **33** a **36**. Eles vinham sendo carregados só em
> relatório de plan desde a campanha de gates, o que contraria a §8: *"achado novo pega o próximo número
> livre"*. **Dois deles já tinham sido reportados por mais de um executor como "pré-existente, fora do
> escopo"** — que é exatamente o sintoma de achado sem número.
>
> **Mais dois em 2026-08-10, da revisão da `plan-24`:** **37** (parêntese a mais no `SarakToast`) e **38**
> (`--sarak-status-*-color-bg` consumida e nunca emitida). Ambos **medidos**, ambos com o gate calado.
> **Um terceiro NÃO entrou:** a suíte emite 19× `Could not parse CSS stylesheet` e eu **não atribuí causa** —
> pela §8, suspeita não vira linha aqui.

## 3.1 Segurança e medição

> O achado **17** fechou com a `plan-19` e saiu para a §6. A categoria voltou a encher no mesmo dia: **33** e
> **35** entraram com a campanha de gates, e **37** e **38** com a revisão da `plan-24`. É a categoria de
> *gate que mede errado ou não mede* — e as quatro linhas abaixo são todas disso.

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 33 | **Sem `.gitattributes` e com `core.autocrlf=true`**, qualquer `checkout`/`stash pop` reescreve `sarak-dev/` em CRLF; o gerador escreve LF e o `dev-kit:check` compara byte a byte ⇒ **falso "defasado"**. Foi reportado como "pré-existente, fora do escopo" por **dois** executores antes de a causa ser medida (`plan-18`) | raiz do repo · `scripts/generate-dev-kit.mjs` | **nenhuma** | **Corrigir** — `.gitattributes` com `eol=lf`, ou o checker normalizando antes de comparar |
| 35 | **O detector de órfãs da `plan-20` perde entradas por ordem de propriedade.** O executor da `plan-21` mediu **27** com varredura própria contra as **24** do detector; as 3 a mais são `buttonHoverEffect`, `inputStyle`, `useTabularNums` | `gates/scripts/audit/auditor_ghostvars.mjs` | **R7** | **Corrigir** — o detector, não o manifesto |
| 37 | **Parêntese a mais mata duas declarações do toast.** `var(--color-theme-card,#1e293b))` e `var(--sarak-text-main,#ffffff))` — CSS malformado é descartado pelo parser, então o toast fica **sem fundo e sem cor de texto próprios** e herda o que estiver atrás. Os dois nomes existem e **são emitidos**; o defeito é só a sintaxe. Nenhum gate olha a sintaxe de `var()` dentro de string | `src/components/atomic/Feedback/SarakToast.tsx:84-85` | **nenhuma** | **Corrigir** — 2 caracteres; e decidir se vale detector de `var()` desbalanceado |
| 38 | **`--sarak-status-*-color-bg` é consumida e nunca emitida.** 5+ componentes usam `var(--sarak-status-error-color-bg, rgba(239,68,68,0.1))` como fundo de texto de status, mas `generateVariants` só existe em `primaryColor`, `secondaryColor`, `tertiaryColor` e `cardBackgroundColor` ⇒ **o fallback duro sempre vence, e o tema não controla esse fundo**. Medido na revisão da `plan-24`: o par texto-de-status reprova em **7/18** (erro) e **5/18** (sucesso) temas. O `auditor_ghostvars` **não pegou** — possível mesma raiz do achado **35** | `src/components/atomic/Templates/SarakForm.tsx:105-107` · `SarakTable.tsx:72` · `gates/scripts/audit/auditor_ghostvars.mjs` | **R7** | **Corrigir** — decidir entre emitir a variante ou trocar o nome consumido; **e** o detector, que é a metade de gate |

## 3.2 Violação de regra **já formada** que o gate agora vê, mas não corrige sozinho

> ✅ **Categoria vazia desde 2026-08-08.** Seu único ocupante — o achado **29** — fechou as duas metades e saiu
> para a §6, como o contrato da §8 manda. **A categoria fica**: ela é o que a §8 chama de *"achado com duas
> metades"*, e é para cá que volta o próximo caso em que o gate passa a **ver** uma violação que ele não
> **conserta**.

## 3.3 Prosa manual desatualizada por um conserto de outra plan

> ✅ **Categoria vazia desde 2026-08-09.** O achado **32** saiu para a §6. **A categoria fica** — ela é a que
> mais reincide nesta base, e o padrão já apareceu três vezes: `arquitetura/04` com `416`, depois `410`,
> depois `409`. A lição que fechou o 32 vale como aviso permanente: **total absoluto em prosa envelhece a cada
> conserto.** Cifra fica em fonte gerada; prosa afirma a relação.

---

# 4. Implementação posterior — os gates que ainda NÃO existem

> 🔒 **Isto não é dívida.** Decisão do dono (plan-03, 2026-08-01): *"tudo que é relacionado ao gate de
> verificação ainda não foi implementado — não é dívida, é implementação posterior. Devemos ter todas as
> regras formadas, para então criar a verificação para o gate."*

A diferença é de sequência, não de rigor. Um gate que **nunca foi construído** não é um defeito do código: é
trabalho que ainda não chegou a sua vez. Construí-lo antes de o conjunto de regras estar fechado produz gate que
cobra a régua errada — e gate errado é mais caro que gate ausente, porque ninguém desconfia dele.

**A ordem é:** fechar o conjunto de regras ([[00-regras-e-invariantes]]) → mapear escopo de gate × escopo de
regra (plan-06) → **só então** construir/ampliar as verificações.

> ✅ **O primeiro degrau foi dado em 2026-08-02 (plan-13):** o conjunto fechou em **32 regras** — 29 verificáveis
> e 3 de conduta. Três achados desta seção **ganharam a regra que lhes faltava** e deixaram de ser "nenhuma":
> **14 → R32** (a lib é indiferente ao sistema de autenticação) · **15 → R8.1** (cobertura em %, piso móvel) ·
> **18 → R31** (contraste AA nos 18 temas shippados). O que falta neles agora é só o gate — plan-12.

## 4.1 Gates integralmente ausentes

> **14 e 15 fecharam em 2026-08-05 (`plan-12`, Lote A/B)** — os gates existem agora; o detalhe está em §6.
> Restam **18, 23, 26**.

| # | O que falta | Onde | Regra que ele cobraria |
|---|---|---|---|
| 18 | **Medição de contraste WCAG AA.** ✅ **Medida em 2026-08-05 (`plan-12`, Lote C — parada obrigatória)**: **12 de 18 temas shippados falham** em pelo menos 1 dos 4 pares canônicos (texto/fundo), a maioria em `textColorMuted`, mas **4 falhas são de texto primário/secundário** — inclusive `minimalist-airy`, um dos dois `SARAK_REFERENCE_THEMES` que o consumidor clona como ponto de partida. Script de medição preservado fora do repositório (anexo da `plan-12`, reproduzido pelo revisor). **A construção do gate está parada**, aguardando o dono decidir: (1) todos os pares que os componentes realmente produzem — não só os 4 canônicos; (2) se `textColorMuted` é cobrado a 4,5:1 ou 3:1 (simulado: só resgata 1 dos 12); (3) o que fazer com os 19 pares em `rgba()`, pulados na medição | — | **R31** — AA garantido nos 18 temas shippados. Regra escrita, gate pendente de decisão de fronteira |
| 23 | **Gate de conteúdo sobre `sarak-ui/templates/`.** Medido: `kitFiles.mjs:16-22` não lista `templates/`; `tsconfig.json:20` é `include: ["src"]`; `check-package-contents.mjs` cobra **só presença** de 3 dos 5 itens — `componente-proprio.tsx` e `templates/ui-kit/` existem e **nada os cobra**. Template citando componente removido sai verde em tudo | `sarak-ui/templates/` | **R17**, cuja metade de prosa manual não tem gate. O achado 24 (fechado, §6) foi a prova de que já aconteceu |
| 26 | **Automação que exercite um `install` de verdade.** Confirmado: **0 ocorrências** de `child_process`/`execSync` nos testes de `bin/scaffold/`. As provas de npm/pnpm/yarn foram feitas à mão, uma vez. Idem o `check --notify` do `predev` | — | Nenhuma regra escrita. Depende de CI (plan-05) e é o escopo da **plan-11** |

---

# 5. Aceitos como característica — migrados para `00-contexto` §8

Saíram da dívida por decisão do dono: o custo do conserto supera o dano, **e o motivo está escrito** no
destino. Registrados aqui só para a numeração não ser reaproveitada.

| # | O que era | Por que deixou de ser dívida |
|---|---|---|
| 16 | "5 sinks de `dangerouslySetInnerHTML` — auditar se algum é vetor real" | **A auditoria foi feita** (2026-08-01, um a um): os 5 são `<style>` com CSS. Dois são literais estáticos; três derivam de `design`, que já passou por `validateDesign` (R6 bloqueia `[<>{};]`). **Nenhum recebe HTML de origem não confiável.** O achado era uma pergunta, e ela foi respondida |
| 27 | "`chromeSlots` conta 9 para as 8 regiões" | `topbarActions` é alias legado de `topbarEnd`, e o **próprio `doc` do slot diz isso** ao consumidor no `catalog.json`. Imprecisão de derivação por tipo, autodeclarada no artefato |

---

# 6. Achados FECHADOS (2026-07-28 → 2026-08-05)

Registrados só para que a numeração não seja reaproveitada. O detalhe está no `git`.

| # | Fechado por |
|---|---|
| 4 | 3 das 4 categorias de `engines/` entraram no barril |
| 5 | `README.md` deixou de mandar instalar `pg` |
| 6 | Decisão do dono: `atomic/Tables/` **fica como está** — o hook é `structuralConsumer` de 2 tokens |
| 7 | Era imprecisão de relatório, não defeito |
| 19 | "A lib nunca controla a URL" era falso (`useSarakRouter.ts:49,51`); a spec nova registra o comportamento real |
| 20 | Status falso na spec antiga de presets |
| 21 | Duplicação entre specs antigas, resolvida pela consolidação |
| 28 | JSDoc citando arquivo de plano inexistente, removido |
| 34 | **Aceito em 2026-08-10 (decisão do dono).** O conjunto de chaves aceitas na validação de tema caiu de 122 para 95 quando a `plan-21` removeu 27 entradas órfãs do manifesto. **Aceito porque as 27 eram metadado morto** — preservá-las só para validação seria manter um dicionário de coisas que não existem. Exposição na base medida em **zero**. Se um consumidor com tema persistido reclamar, o `console.warn` de `validation.ts:213` **é** o diagnóstico: ele nomeia a chave que caiu |
| 36 | **Fechado em 2026-08-10 (decisão do dono).** A "Regra de Ouro (Time Tracking)" saiu do `CLAUDE.md`: exigia a skill/MCP `time-tracking`, que não existe. Ficou no lugar um comentário com o motivo e um critério para regra nova naquele arquivo — verificável e com ferramenta existente, ou o lugar dela é uma spec |
| 17 | **Fechado em 2026-08-10 (`plan-19`).** O conserto não foi ajustar o `testDir`: o `playwright.config.ts` era **arquivo órfão** — nenhum script o usava. O que roda é `playwright-ct.config.ts` (`testDir: './src'`), pelo `npm run test-ct`, e os 4 arquivos em `src/**/__e2e__/` são **component tests**, não E2E de navegador. O arquivo foi **deletado**; `npx playwright test` agora sai com **exit 1** e *"No tests found"* — falha alto em vez de passar em silêncio |
| 32 | **Fechado em 2026-08-09.** `arquitetura/04-contrato-de-tokens-e-paridade.md:52` dizia `410/410/410` como estado resolvido; era 409 quando foi escrito e **422** hoje (a `plan-15` criou 13 tokens). O conserto não foi trocar o número: a linha **deixou de citar total**, porque total em prosa envelhece a cada token. A cifra vive em `sarak-dev/state.json` → `design.tokens` e é cobrada por `auditor_paridade.mjs`; a prosa afirma a **convergência**, não o valor |
| 29 | **As duas metades fecharam.** Gate: `check-section-pointers.mjs` (`plan-12`, 2026-08-05). Código: verificado fechado pelo revisor em **2026-08-08** — `scripts/dev-kit/renderDevAppendix.mjs` **não emite mais** `§5.1`, e `sarak-dev/GUIA-MANUTENCAO.md:308` regenerado aponta `§2` (paridade), o alvo correto. Medido rodando `npm run dev-kit` e recontando: **0 ocorrências** de `§5.1` no guia e no `state.json` |
| 30 | **Não se reproduz** (verificado 2026-08-01). Dizia que `verify_presets.ts:16` apontava para um `arquitetura/04 §9` inexistente. O alvo existe e é o certo: `04-contrato-de-tokens-e-paridade.md:252` = `# 9. Anti-drift de tema e preset` — exatamente o assunto do script. A reescrita da base (plan-01) criou o §9 |
| 31 | **Não se reproduz** (verificado 2026-08-01). Dizia que a ponte para `specs/` era SOFT. `CLAUDE.md:3` hoje aponta **duro** para `specs/00-contexto.md`, os dois prompts e o `00-indice`. `.agents/index.md` segue com 0 referências a `specs/`, mas a ponte não passa mais por ele |
| 8 | **`plan-08` F1 (2026-08-04).** `clearSarakStorage()` remove só as chaves da lib; texto do `confirm()` alinhado. Teste prova que chave alheia sobrevive ao reset |
| 22 | **`plan-12` Lote A (2026-08-05).** `design-token-ids.ts` regenerado (304→409) **e** `generate-token-types.ts --check` registrado no `build` e no Anel 1 — as duas metades fecharam juntas |
| 1 | **`plan-07` (código, 2026-08-03) + `plan-12` vão 2 (gate, 2026-08-05).** `--sx-*` encadeado num token real (`--theme-primary`); `auditor_ghostvars` passou a tratar `src/styles/` como consumidora |
| 13 | **`plan-07` (código, 2026-08-03) + `plan-12` vão 6 (gate, 2026-08-05).** Testes escritos para `useSarakRouter`/`useModuleDiscovery`; `auditor_coverage` ampliado a `shared/`/`effects/`/`constants/` |
| 10 | **`plan-08` F4 (2026-08-04).** `_utilities.css:58` passou a ler `var(--sarak-focus-width, 2px)` |
| 11 | **`plan-08` F5 (2026-08-04).** `DeviceProvider` passou a receber os breakpoints do tema via contexto. A metade Tailwind (`@min-[768px]`, build-time, sem `var()`) já havia sido aceita como característica na triagem (`00-contexto` §8) |
| 12 | **`plan-08` F6 (2026-08-04).** `SarakTable` ganhou `responsive?: boolean`, espelhando `SarakDataTableImpl` |
| 9 | **`plan-08` F3 (2026-08-04).** Ramo `isGlass` removido; `isSidebar` passou a ser o fallback explícito de qualquer valor fora de topbar/dock |
| 2 | **`plan-09` operação 3 (2026-08-05).** `partialMode` removido de `upgradeThemePayload`; zero chamador afetado |
| 3 | **`plan-09` operação 1 (2026-08-05).** `CustomizationPanel` virou `React.lazy` com `Suspense` interno (padrão `SarakChartEngine`), preservando o tipo público `React.FC`. Boot: **−75,1%** |
| 24 | **`plan-07` item 8 (2026-08-03).** `main.tsx` do scaffold deixou de citar `Sarak-MyService` |
| 25 | **`plan-07` item 8 (2026-08-03).** `context.mjs` deixou de citar `templates/app-starter.manifest.json` |
| 14 | **`plan-12` Lote A (2026-08-05).** `auditor_authcoupling.mjs` construído (R32); nasce verde — o único violador (`SarakSecurityOrchestrator`) já havia saído na `plan-09` |
| 15 | **`plan-12` Lote B (2026-08-05).** `check-coverage-floor.mjs` construído (R8.1); piso móvel gravado em 70,66% |

---

# 7. Critérios de aceite desta spec

- [x] Todo achado aberto tem **arquivo:linha** ou a declaração explícita de que a localização é o próprio vão.
- [x] Nenhum achado aberto está sem categoria.
- [x] A numeração é **contínua a partir de 1 e sem reaproveitamento** — o último número emitido é o maior que
      aparece nas §3–§6.
- [x] Todo achado aberto tem **regra nomeada** — ou a declaração explícita de que **nenhuma regra o cobre**.
- [x] Todo achado aberto tem **destino decidido pelo dono** (plan-03, 2026-08-01).
- [x] **Soma fechada — pela relação, não pela cifra:** todo número emitido aparece em **exatamente uma** das
      §3 (aberto) · §4 (gate futuro) · §5 (aceito) · §6 (fechado). Sem número em duas seções, sem buraco.
      *(Esta linha carregava `3+3+2+24 = 32` e envelheceu na primeira leva de achados novos — os reais eram
      `2+3+2+29`. É o padrão que o achado **32** já tinha ensinado: **total absoluto em prosa envelhece a cada
      conserto.** A verificação agora afirma a relação, que não envelhece.)*
- [ ] Toda plan que fecha um achado **remove a linha** aqui e cita o número no veredito.
- [x] `00-contexto` §8 aponta para cá em vez de listar achado.

---

# 8. Contrato de manutenção

- **Só entra o que foi medido.** Suspeita vira plan de investigação, não linha nesta spec.
- **Item fechado sai** — na mesma execução que o fechou, não "depois".
- **Numeração definitiva.** Achado novo pega o próximo número livre (a partir de 33).
- Achado que o dono decidir **aceitar como dívida permanente** sai da §3 e vira linha em `00-contexto` §8, com
  o motivo — porque aí deixou de ser dívida e virou característica. O §5 desta spec guarda só o número.
- **Gate que nunca existiu não é dívida** — vai para a §4. Dívida é código que viola regra **já formada**;
  gate ausente é trabalho em fila, e a fila começa depois de as regras fecharem. Misturar os dois faz a lista
  de dívida crescer com trabalho que ninguém prometeu, e a métrica perde o sentido.
- **Achado com duas metades declara as duas** (§3.2). Fechar só a de código deixa o vão aberto para a próxima
  violação; apagar a de gate destrói trabalho que ninguém fez e ninguém vai lembrar de refazer.
- **`nenhuma` na coluna *Regra* é resultado, não lacuna de preenchimento.** É o sinal de que estamos cobrando
  algo que não está escrito — leia como candidato a regra nova, não como achado de segunda classe.
